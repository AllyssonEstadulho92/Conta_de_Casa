'use strict';

const APP_ID = 'Conta_de_Casa';
const DB_NAME = 'conta_de_casa_secure';
const DB_VERSION = 2;
const STATE_VERSION = 2;
const BACKUP_FORMAT_VERSION = 2;
const CHECK_TEXT_CURRENT = 'Conta_de_Casa::vault-check::v2';
const CHECK_TEXT_LEGACY = 'Conta_de_Casa::vault-check::v1';
const PBKDF2_ITERATIONS = 250000;
const MIN_BACKUP_ITERATIONS = 250000;
const DAY_MS = 86400000;
const AUTO_LOCK_MINUTES = 5;
const HIDDEN_LOCK_GRACE_MS = 60000;
const ABSOLUTE_IDLE_MAX_MS = 30 * 60000;
const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const ATTACHMENTS_REAL_FILES_ENABLED = false;

let db;
let vaultKey = null;
let appState = null;
let selectedMonth = new Date().toISOString().slice(0, 7);
let privacyHidden = false;
let lockTimer = null;
let hiddenLockTimer = null;
let lastActivityAt = Date.now();
let sessionLockGuardsInstalled = false;

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const enc = new TextEncoder();
const dec = new TextDecoder();

const ICONS = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/>',
  bill: '<path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4"/><path d="M9 11h6M9 15h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/>',
  plan: '<path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/>',
  market: '<path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.6H18a2 2 0 0 0 2-1.6L21 8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/>',
  report: '<path d="M4 20V10m5 10V4m6 16v-7m5 7V7"/>',
  goal: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3h4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10v4a1.7 1.7 0 0 0-1.6 1z"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  alert: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'
};

const NAV_ITEMS = [
  ['dashboard', 'Início', 'home'],
  ['bills', 'Faturas', 'bill'],
  ['calendar', 'Calendário', 'calendar'],
  ['planning', 'Planeamento', 'plan'],
  ['market', 'Mercado', 'market'],
  ['reports', 'Relatórios', 'report'],
  ['goals', 'Objetivos', 'goal'],
  ['security', 'Segurança', 'shield'],
  ['settings', 'Configurações', 'settings']
];

function icon(name, size = 19) {
  const safeSize = clamp(Number(size) || 19, 12, 28);
  return `<svg class="svg-icon" width="${safeSize}" height="${safeSize}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.more}</svg>`;
}

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function esc(v = '') {
  return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function attr(v = '') { return esc(v); }
function parseCents(value) {
  if (typeof value === 'number') return Math.round(value * 100);
  let s = String(value ?? '').trim().replace(/\s|€/g, '');
  if (!s) return 0;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}
function money(cents = 0) {
  const currency = appState?.settings?.currency || 'EUR';
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency }).format((cents || 0) / 100);
}
function fmtDate(value, opts = {}) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: opts.year === false ? undefined : 'numeric' }).format(d);
}
function fmtDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'short', timeStyle: 'short' }).format(d);
}
function monthOf(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function localDateTimeInput(date = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function selectedMonthBounds(month = selectedMonth) {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const end = new Date(y, m, 1, 0, 0, 0, 0);
  return { start, end };
}
function inSelectedMonth(value, month = selectedMonth) {
  return monthOf(value) === month;
}
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function b64(bytes) {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return btoa(s);
}
function unb64(value) {
  const s = atob(String(value));
  const out = new Uint8Array(s.length);
  for (let i=0;i<s.length;i++) out[i] = s.charCodeAt(i);
  return out;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function cleanString(value, max = 160) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
function cleanMultiline(value, max = 1200) {
  return String(value ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, ' ').trim().slice(0, max);
}
function cleanCents(value, fallback = 0, min = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return clamp(Math.round(n), min, 1000000000000);
}
function cleanIso(value, fallback = new Date().toISOString()) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d.toISOString();
}
function optionalIso(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
function cleanRecurrence(value) {
  return ['none','weekly','monthly','quarterly','semiannual','annual'].includes(value) ? value : 'none';
}
function cleanActivityType(type = 'general') {
  return ['security','backup','bill','payment','planning','income','market','goal','settings','general'].includes(type) ? type : 'general';
}
function safeActivityText(_text, type = 'general') {
  return ({
    security: 'Evento de segurança registado',
    backup: 'Backup cifrado atualizado',
    bill: 'Fatura atualizada',
    payment: 'Pagamento registado',
    planning: 'Planeamento atualizado',
    income: 'Rendimento atualizado',
    market: 'Mercado atualizado',
    goal: 'Objetivo atualizado',
    settings: 'Preferências atualizadas',
    general: 'Atividade local registada'
  })[cleanActivityType(type)];
}
function normalizeActivityEntry(entry = {}) {
  const type = cleanActivityType(entry.type);
  return { id: cleanString(entry.id || uid(), 80), text: safeActivityText(entry.text, type), type, at: cleanIso(entry.at) };
}
function normalizeMonths(months = {}) {
  const out = {};
  if (!isPlainObject(months)) return out;
  for (const [month, value] of Object.entries(months)) {
    if (!/^\d{4}-\d{2}$/.test(month) || !isPlainObject(value)) continue;
    out[month] = {
      openingBalanceCents: cleanCents(value.openingBalanceCents, 0, -1000000000000),
      budgetCents: cleanCents(value.budgetCents, 0, 0),
      updatedAt: optionalIso(value.updatedAt)
    };
  }
  return out;
}
function normalizeBill(b = {}) {
  const now = new Date().toISOString();
  return {
    id: cleanString(b.id || uid(), 80),
    title: cleanString(b.title, 80),
    provider: cleanString(b.provider, 80),
    category: cleanString(b.category || 'Outros', 80),
    totalCents: cleanCents(b.totalCents),
    dueAt: cleanIso(b.dueAt, now),
    issueAt: optionalIso(b.issueAt),
    method: cleanString(b.method || 'Outro', 60),
    recurrence: cleanRecurrence(b.recurrence),
    reference: cleanString(b.reference, 160),
    notes: cleanMultiline(b.notes, 1200),
    createdAt: cleanIso(b.createdAt, now),
    updatedAt: cleanIso(b.updatedAt, now),
    recurrenceParentId: b.recurrenceParentId ? cleanString(b.recurrenceParentId, 80) : undefined,
    cancelled: Boolean(b.cancelled),
    archived: Boolean(b.archived)
  };
}
function normalizePayment(p = {}) {
  const now = new Date().toISOString();
  return {
    id: cleanString(p.id || uid(), 80),
    billId: cleanString(p.billId, 80),
    amountCents: cleanCents(p.amountCents),
    paidAt: cleanIso(p.paidAt, now),
    method: cleanString(p.method || 'Outro', 60),
    notes: cleanMultiline(p.notes, 600),
    createdAt: cleanIso(p.createdAt, now)
  };
}
function normalizeIncome(i = {}) {
  const now = new Date().toISOString();
  return {
    id: cleanString(i.id || uid(), 80),
    description: cleanString(i.description, 100),
    amountCents: cleanCents(i.amountCents),
    receivedAt: cleanIso(i.receivedAt, now),
    createdAt: cleanIso(i.createdAt, now)
  };
}
function normalizeMarketItem(i = {}) {
  const now = new Date().toISOString();
  return {
    id: cleanString(i.id || uid(), 80),
    name: cleanString(i.name, 100),
    category: cleanString(i.category || 'Outros', 80),
    quantity: cleanString(i.quantity || '1', 40),
    unit: cleanString(i.unit || 'un', 20),
    estimatedCents: cleanCents(i.estimatedCents),
    actualCents: cleanCents(i.actualCents),
    purchased: Boolean(i.purchased),
    createdAt: cleanIso(i.createdAt, now),
    updatedAt: cleanIso(i.updatedAt, now),
    purchasedAt: optionalIso(i.purchasedAt)
  };
}
function normalizeGoal(g = {}) {
  const now = new Date().toISOString();
  return {
    id: cleanString(g.id || uid(), 80),
    name: cleanString(g.name, 100),
    targetCents: cleanCents(g.targetCents),
    savedCents: cleanCents(g.savedCents),
    deadline: optionalIso(g.deadline),
    createdAt: cleanIso(g.createdAt, now),
    updatedAt: cleanIso(g.updatedAt || g.createdAt, now),
    archived: Boolean(g.archived)
  };
}

function defaultState() {
  return {
    version: STATE_VERSION,
    settings: {
      profileName: '',
      currency: 'EUR',
      theme: 'light',
      lockMinutes: AUTO_LOCK_MINUTES,
      lockOnHidden: true,
      sync: { enabled:true, disabledByUser:false, owner:'AllyssonEstadulho92', repo:'conta-de-casa-', path:'sync/vault.json' }
    },
    months: {},
    bills: [],
    payments: [],
    incomes: [],
    market: [],
    goals: [],
    activity: [],
    security: { lastBackupAt: null, lastRestoreAt: null },
    syncTombstones: [],
    syncConflicts: [],
    attachments: { enabled: false, items: [] }
  };
}
function ensureStateShape(s) {
  const d = defaultState();
  const settings = isPlainObject(s?.settings) ? s.settings : {};
  return {
    ...d,
    version: STATE_VERSION,
    settings: {
      profileName: cleanString(settings.profileName, 80),
      currency: settings.currency === 'EUR' ? 'EUR' : 'EUR',
      theme: ['light','dark','system'].includes(settings.theme) ? settings.theme : 'light',
      lockMinutes: clamp(Number(settings.lockMinutes) || AUTO_LOCK_MINUTES, 1, 30),
      lockOnHidden: settings.lockOnHidden !== false,
      sync: {
        enabled: settings.sync?.disabledByUser ? false : true,
        disabledByUser: Boolean(settings.sync?.disabledByUser),
        owner: cleanString(settings.sync?.owner || 'AllyssonEstadulho92', 80),
        repo: cleanString(settings.sync?.repo || 'conta-de-casa-', 100),
        path: cleanString(settings.sync?.path || 'sync/vault.json', 180)
      }
    },
    months: normalizeMonths(s?.months),
    bills: Array.isArray(s?.bills) ? s.bills.slice(0, 5000).map(normalizeBill) : [],
    payments: Array.isArray(s?.payments) ? s.payments.slice(0, 10000).map(normalizePayment) : [],
    incomes: Array.isArray(s?.incomes) ? s.incomes.slice(0, 5000).map(normalizeIncome) : [],
    market: Array.isArray(s?.market) ? s.market.slice(0, 5000).map(normalizeMarketItem) : [],
    goals: Array.isArray(s?.goals) ? s.goals.slice(0, 1000).map(normalizeGoal) : [],
    activity: Array.isArray(s?.activity) ? s.activity.slice(0, 300).map(normalizeActivityEntry) : [],
    security: {
      lastBackupAt: optionalIso(s?.security?.lastBackupAt),
      lastRestoreAt: optionalIso(s?.security?.lastRestoreAt)
    },
    syncTombstones: Array.isArray(s?.syncTombstones) ? s.syncTombstones.slice(-500).map(t => ({
      entity: cleanString(t?.entity, 30),
      id: cleanString(t?.id, 100),
      deletedAt: cleanIso(t?.deletedAt, new Date().toISOString())
    })).filter(t => t.entity && t.id) : [],
    syncConflicts: Array.isArray(s?.syncConflicts) ? s.syncConflicts.slice(-50).map(x => ({
      entity: cleanString(x?.entity, 30),
      id: cleanString(x?.id, 100),
      at: cleanIso(x?.at, new Date().toISOString()),
      local: isPlainObject(x?.local) ? x.local : {},
      remote: isPlainObject(x?.remote) ? x.remote : {}
    })).filter(x => x.entity && x.id) : [],
    attachments: { enabled: ATTACHMENTS_REAL_FILES_ENABLED, items: [] }
  };
}
function monthProfile(month = selectedMonth) {
  appState.months[month] ||= { openingBalanceCents: 0, budgetCents: 0, updatedAt: new Date().toISOString() };
  return appState.months[month];
}

const ALLOWED_TAGS = new Set(['article','br','button','circle','datalist','div','em','form','h2','h3','input','label','option','p','path','rect','select','small','span','strong','svg','textarea']);
const ALLOWED_ATTRS = new Set(['accept','aria-hidden','aria-label','checked','class','d','disabled','fill','height','hidden','id','inputmode','list','max','maxlength','method','min','minlength','name','placeholder','r','required','role','rx','selected','stroke','stroke-linecap','stroke-linejoin','stroke-width','type','value','viewbox','width','x','y']);
function sanitizeHtmlFragment(html) {
  if (typeof document === 'undefined') return String(html ?? '');
  const template = document.createElement('template');
  template.innerHTML = String(html ?? '');
  const walk = node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) {
        node.replaceWith(document.createTextNode(node.textContent || ''));
        return;
      }
      for (const a of [...node.attributes]) {
        const name = a.name.toLowerCase();
        const value = a.value || '';
        const allowed = ALLOWED_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('aria-');
        if (!allowed || name.startsWith('on') || /javascript:/i.test(value)) node.removeAttribute(a.name);
      }
    }
    for (const child of [...node.childNodes]) walk(child);
  };
  for (const child of [...template.content.childNodes]) walk(child);
  return template.innerHTML;
}
function applyDynamicStyles(root) {
  if (!root?.querySelectorAll) return;
  root.querySelectorAll('[data-width]').forEach(el => {
    const pct = clamp(Number(el.dataset.width) || 0, 0, 100);
    el.style.width = `${pct}%`;
  });
  root.querySelectorAll('[data-height]').forEach(el => {
    const px = clamp(Number(el.dataset.height) || 0, 0, 180);
    el.style.height = `${px}px`;
  });
}
function setHTML(target, html) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;
  el.innerHTML = sanitizeHtmlFragment(html);
  applyDynamicStyles(el);
}

async function openDb() {
  if (db) return db;
  db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      if (!d.objectStoreNames.contains('secure')) d.createObjectStore('secure', { keyPath: 'key' });
      if (!d.objectStoreNames.contains('device')) d.createObjectStore('device', { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return db;
}
async function idbGet(store, key) {
  const d = await openDb();
  return await new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result || null); req.onerror = () => reject(req.error);
  });
}
async function idbPut(store, value) {
  const d = await openDb();
  return await new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readwrite').objectStore(store).put(value);
    req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
  });
}
async function idbPutVaultPair(meta, secure) {
  const d = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = d.transaction(['meta','secure'], 'readwrite');
    tx.objectStore('meta').put(meta);
    tx.objectStore('secure').put(secure);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Falha ao atualizar o cofre.'));
    tx.onabort = () => reject(tx.error || new Error('Atualização do cofre cancelada.'));
  });
}
async function idbClearAll() {
  const d = await openDb();
  await Promise.all(['meta','secure','device'].map(store => new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readwrite').objectStore(store).clear();
    req.onsuccess = () => resolve(); req.onerror = () => reject(req.error);
  })));
}
async function deriveVaultKey(passphrase, salt, iterations = PBKDF2_ITERATIONS) {
  const safeIterations = Number.isInteger(iterations) && iterations >= MIN_BACKUP_ITERATIONS ? iterations : PBKDF2_ITERATIONS;
  const base = await crypto.subtle.importKey('raw', enc.encode(String(passphrase)), { name:'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:safeIterations, hash:'SHA-256' },
    base, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']
  );
}
async function encryptBytes(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, key, bytes);
  return { iv: b64(iv), cipher: b64(cipher) };
}
async function decryptBytes(key, iv64, cipher64) {
  return new Uint8Array(await crypto.subtle.decrypt({ name:'AES-GCM', iv:unb64(iv64) }, key, unb64(cipher64)));
}
async function createVault(passphrase) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  vaultKey = await deriveVaultKey(passphrase, salt);
  const check = await encryptBytes(vaultKey, enc.encode(CHECK_TEXT_CURRENT));
  await idbPut('meta', { key:'vault', version:2, salt:b64(salt), checkIv:check.iv, checkCipher:check.cipher, iterations:PBKDF2_ITERATIONS, createdAt:new Date().toISOString() });
  appState = defaultState();
  monthProfile(selectedMonth);
  logActivity('created', 'security');
  await saveState();
}
async function unlockVault(passphrase) {
  const meta = await idbGet('meta','vault');
  if (!meta) throw new Error('Cofre não encontrado.');
  let key;
  try {
    key = await deriveVaultKey(passphrase, unb64(meta.salt), Number(meta.iterations));
    const check = dec.decode(await decryptBytes(key, meta.checkIv, meta.checkCipher));
    if (![CHECK_TEXT_CURRENT, CHECK_TEXT_LEGACY].includes(check)) throw new Error('check-failed');
  } catch (_err) {
    vaultKey = null;
    throw new Error('Palavra-passe/PIN incorreto.');
  }
  vaultKey = key;
  const secured = await idbGet('secure','state');
  try {
    if (!secured) appState = defaultState();
    else appState = ensureStateShape(JSON.parse(dec.decode(await decryptBytes(vaultKey, secured.iv, secured.cipher))));
  } catch (_err) {
    vaultKey = null;
    appState = null;
    throw new Error('O cofre local não passou na validação de integridade.');
  }
  monthProfile(selectedMonth);
  await syncRecurringBills();
}
async function verifyVaultPassphrase(passphrase) {
  const meta = await idbGet('meta','vault');
  if (!meta) throw new Error('Cofre não encontrado.');
  try {
    const key = await deriveVaultKey(passphrase, unb64(meta.salt), Number(meta.iterations));
    const check = dec.decode(await decryptBytes(key, meta.checkIv, meta.checkCipher));
    if (![CHECK_TEXT_CURRENT, CHECK_TEXT_LEGACY].includes(check)) throw new Error('check-failed');
    return key;
  } catch (_err) {
    throw new Error('Palavra-passe/PIN incorreto.');
  }
}
async function changeVaultPassphrase(currentPassphrase, newPassphrase) {
  const current = String(currentPassphrase ?? '');
  const next = String(newPassphrase ?? '');
  if (next.length < 8) throw new Error('O novo PIN deve ter pelo menos 8 caracteres.');
  if (current === next) throw new Error('O novo PIN deve ser diferente do atual.');

  const oldKey = await verifyVaultPassphrase(current);
  const secure = await idbGet('secure','state');
  let state = appState;
  if (!state && secure) {
    try {
      state = ensureStateShape(JSON.parse(dec.decode(await decryptBytes(oldKey, secure.iv, secure.cipher))));
    } catch (_err) {
      throw new Error('O cofre local não passou na validação de integridade.');
    }
  }
  state = ensureStateShape(state || defaultState());

  const oldMeta = await idbGet('meta','vault');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const newKey = await deriveVaultKey(next, salt);
  const check = await encryptBytes(newKey, enc.encode(CHECK_TEXT_CURRENT));
  const encryptedState = await encryptBytes(newKey, enc.encode(JSON.stringify(state)));
  const now = new Date().toISOString();
  const newMeta = {
    key:'vault',
    version:2,
    salt:b64(salt),
    checkIv:check.iv,
    checkCipher:check.cipher,
    iterations:PBKDF2_ITERATIONS,
    createdAt:oldMeta?.createdAt || now,
    rotatedAt:now
  };
  const newSecure = { key:'state', ...encryptedState, updatedAt:now };
  await idbPutVaultPair(newMeta, newSecure);
  vaultKey = newKey;
  appState = state;
  logActivity('rotated', 'security');
  await saveState();
  return true;
}
async function resetLocalVaultForRecovery() {
  destroyVaultSession();
  await idbClearAll();
  return true;
}

async function saveState() {
  if (!vaultKey || !appState) return;
  appState = ensureStateShape(appState);
  const payload = enc.encode(JSON.stringify(appState));
  const encrypted = await encryptBytes(vaultKey, payload);
  await idbPut('secure', { key:'state', ...encrypted, updatedAt:new Date().toISOString() });
  if (typeof queueRemoteSync === 'function') queueRemoteSync();
}
function logActivity(text, type='general') {
  if (!appState) return;
  const safeType = cleanActivityType(type);
  appState.activity.unshift({ id:uid(), text:safeActivityText(text, safeType), type:safeType, at:new Date().toISOString() });
  if (appState.activity.length > 300) appState.activity.length = 300;
}
async function commit(message, type='general') {
  if (message) logActivity(message, type);
  await saveState();
  renderCurrentPage();
}

function requireBase64Bytes(value, min, max, label) {
  if (typeof value !== 'string' || !value) throw new Error(`Campo ${label} inválido.`);
  let bytes;
  try { bytes = unb64(value); } catch (_err) { throw new Error(`Campo ${label} inválido.`); }
  if (bytes.length < min || bytes.length > max) throw new Error(`Campo ${label} inválido.`);
  return value;
}
function validIsoOrNow(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
function normalizeVaultMetaForBackup(meta) {
  if (!isPlainObject(meta)) throw new Error('Ficheiro de backup inválido.');
  const iterations = Number(meta.iterations);
  if (!Number.isInteger(iterations) || iterations < MIN_BACKUP_ITERATIONS) throw new Error('Parâmetros criptográficos inválidos.');
  return {
    key:'vault',
    version: Number(meta.version) >= 1 ? Number(meta.version) : 1,
    salt: requireBase64Bytes(meta.salt, 16, 64, 'salt'),
    checkIv: requireBase64Bytes(meta.checkIv, 12, 12, 'checkIv'),
    checkCipher: requireBase64Bytes(meta.checkCipher, 16, 4096, 'checkCipher'),
    iterations,
    createdAt: validIsoOrNow(meta.createdAt)
  };
}
function normalizeSecureRecordForBackup(secure) {
  if (!isPlainObject(secure)) throw new Error('Ficheiro de backup inválido.');
  return {
    key:'state',
    iv: requireBase64Bytes(secure.iv, 12, 12, 'iv'),
    cipher: requireBase64Bytes(secure.cipher, 16, MAX_IMPORT_BYTES, 'cipher'),
    updatedAt: validIsoOrNow(secure.updatedAt)
  };
}
function canonicalize(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).filter(k => value[k] !== undefined).sort().map(k => `${JSON.stringify(k)}:${canonicalize(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
async function sha256Text(text) {
  return b64(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text))));
}
async function buildBackupEnvelope(meta, secure) {
  const envelope = {
    app: APP_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    crypto: { cipher:'AES-GCM', kdf:'PBKDF2-SHA-256', stateVersion:STATE_VERSION },
    meta: normalizeVaultMetaForBackup(meta),
    secure: normalizeSecureRecordForBackup(secure)
  };
  envelope.integrity = { alg:'SHA-256', digest: await sha256Text(canonicalize(envelope)) };
  return envelope;
}
async function verifyBackupIntegrity(obj) {
  if (!isPlainObject(obj?.integrity) || obj.integrity.alg !== 'SHA-256' || typeof obj.integrity.digest !== 'string') {
    throw new Error('Backup sem validação de integridade.');
  }
  const clone = { ...obj };
  delete clone.integrity;
  const digest = await sha256Text(canonicalize(clone));
  if (digest !== obj.integrity.digest) throw new Error('Backup corrompido ou adulterado.');
  return true;
}
function validateBackupEnvelope(obj) {
  if (!isPlainObject(obj) || obj.app !== APP_ID || obj.formatVersion !== BACKUP_FORMAT_VERSION) {
    throw new Error('Ficheiro de backup inválido ou desatualizado.');
  }
  if (!isPlainObject(obj.crypto) || obj.crypto.cipher !== 'AES-GCM' || obj.crypto.kdf !== 'PBKDF2-SHA-256') {
    throw new Error('Parâmetros criptográficos inválidos.');
  }
  return { meta: normalizeVaultMetaForBackup(obj.meta), secure: normalizeSecureRecordForBackup(obj.secure) };
}
async function parseBackupText(text) {
  if (String(text).length > MAX_IMPORT_BYTES) throw new Error('Ficheiro de backup demasiado grande.');
  let obj;
  try { obj = JSON.parse(text); } catch (_err) { throw new Error('Ficheiro de backup inválido.'); }
  const normalized = validateBackupEnvelope(obj);
  await verifyBackupIntegrity(obj);
  return normalized;
}
function backupContainsPlaintextFinancialData(text) {
  const body = String(text);
  return ['"bills"','"payments"','"incomes"','"market"','"goals"','"provider"','"reference"','"notes"','"totalCents"','"amountCents"','"savedCents"','"targetCents"'].some(token => body.includes(token));
}

async function decryptBackupState(normalized, passphrase) {
  const phrase=String(passphrase??'');
  if(!phrase) throw new Error('Introduza o PIN do backup.');
  try{
    const key=await deriveVaultKey(phrase,unb64(normalized.meta.salt),Number(normalized.meta.iterations));
    const check=dec.decode(await decryptBytes(key,normalized.meta.checkIv,normalized.meta.checkCipher));
    if(![CHECK_TEXT_CURRENT,CHECK_TEXT_LEGACY].includes(check)) throw new Error('check-failed');
    const plain=dec.decode(await decryptBytes(key,normalized.secure.iv,normalized.secure.cipher));
    return ensureStateShape(JSON.parse(plain));
  }catch(_err){
    throw new Error('PIN do backup incorreto ou backup incompatível.');
  }
}

const SENSITIVE_STORAGE_PATTERN = /(bill|fatura|invoice|payment|pagamento|income|rendimento|amount|valor|provider|fornecedor|reference|referencia|notes|observa|market|mercado|goal|objetivo|finance|vault|cofre|cipher|backup|pass|senha|pin|key|chave)/i;
function installStorageGuards() {
  if (typeof Storage === 'undefined' || Storage.prototype.__contaDeCasaGuarded) return;
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function guardedSetItem(key, value) {
    const k = String(key ?? '');
    const v = String(value ?? '');
    if (!k.startsWith('cdc_public_') || SENSITIVE_STORAGE_PATTERN.test(`${k} ${v}`) || v.length > 256) {
      throw new Error('Armazenamento em claro bloqueado pela política de segurança.');
    }
    return originalSetItem.call(this, k, v);
  };
  Object.defineProperty(Storage.prototype, '__contaDeCasaGuarded', { value:true });
}
function installRuntimeErrorGuards() {
  if (typeof window === 'undefined' || window.__contaDeCasaRuntimeGuarded) return;
  const showSafeMessage = () => {
    const msg = 'Ocorreu um erro interno. A aplicação bloqueou detalhes sensíveis.';
    if (appState && !$('#app')?.hidden) toast(msg);
    else {
      const el = $('#vaultMessage');
      if (el) { el.textContent = msg; el.className = 'form-message error'; }
    }
  };
  window.addEventListener('error', event => { event.preventDefault(); showSafeMessage(); });
  window.addEventListener('unhandledrejection', event => { event.preventDefault(); showSafeMessage(); });
  window.__contaDeCasaRuntimeGuarded = true;
}
function safeUserError(err, fallback = 'Operação não concluída por validação de segurança.') {
  const msg = cleanString(err?.message, 140);
  const allowed = [
    'Ficheiro de backup inválido.',
    'Ficheiro de backup inválido ou desatualizado.',
    'Backup sem validação de integridade.',
    'Backup corrompido ou adulterado.',
    'Ficheiro de backup demasiado grande.',
    'Parâmetros criptográficos inválidos.'
  ];
  return allowed.includes(msg) || msg.startsWith('Campo ') ? msg : fallback;
}

function recordUserActivity() {
  lastActivityAt = Date.now();
  resetLockTimer();
}
function resetLockTimer() {
  clearTimeout(lockTimer);
  if (!vaultKey || !appState) return;
  const mins = clamp(Number(appState.settings?.lockMinutes) || AUTO_LOCK_MINUTES, 1, 30);
  const timeoutMs = Math.min(mins * 60000, ABSOLUTE_IDLE_MAX_MS);
  lockTimer = setTimeout(() => { if (vaultKey) lockApp('idle'); }, timeoutMs);
}
function scheduleHiddenLock() {
  clearTimeout(hiddenLockTimer);
  if (!vaultKey || !appState || appState.settings?.lockOnHidden === false) return;
  hiddenLockTimer = setTimeout(() => { if (vaultKey) lockApp('hidden'); }, HIDDEN_LOCK_GRACE_MS);
}
function handleVisibilityReturn() {
  clearTimeout(hiddenLockTimer);
  if (!vaultKey || !appState) return;
  if (Date.now() - lastActivityAt > HIDDEN_LOCK_GRACE_MS) lockApp('hidden-return');
  else resetLockTimer();
}
function installSessionLockGuards() {
  if (typeof window === 'undefined' || typeof document === 'undefined' || sessionLockGuardsInstalled) return;
  sessionLockGuardsInstalled = true;
  ['pointerdown','keydown','touchstart','input','scroll'].forEach(ev => document.addEventListener(ev, recordUserActivity, { passive:true }));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) scheduleHiddenLock();
    else handleVisibilityReturn();
  });
  window.addEventListener('blur', scheduleHiddenLock);
  window.addEventListener('focus', handleVisibilityReturn);
  window.addEventListener('pagehide', () => { if (vaultKey) lockApp('pagehide'); });
}
function clearPassphraseInputs() {
  if (typeof document === 'undefined') return;
  ['#newPassphrase','#confirmPassphrase','#unlockPassphrase'].forEach(sel => { const el = $(sel); if (el) el.value = ''; });
}
function wipeSensitiveUi() {
  if (typeof document === 'undefined') return;
  ['#alertsPanel','#kpiGrid','#upcomingBills','#categoryBars','#budgetPanel','#activityList','#billSummary','#billsList','#calendarGrid','#calendarAgenda','#incomeList','#marketSummary','#marketList','#reportCards','#reportCategoryBars','#monthlyTrend','#goalList','#securityStatusGrid','#securityBackupInfo','#dialogBody'].forEach(sel => {
    const el = $(sel);
    if (el) el.textContent = '';
  });
  const app = $('#app');
  if (app) $$('input, textarea', app).forEach(el => { if (el.type !== 'file') el.value = ''; });
  clearPassphraseInputs();
}
function destroyVaultSession() {
  clearTimeout(lockTimer);
  clearTimeout(hiddenLockTimer);
  vaultKey = null;
  appState = null;
}
function lockApp(_reason = 'manual') {
  destroyVaultSession();
  wipeSensitiveUi();
  if (typeof document === 'undefined') return;
  const formDialog = $('#formDialog');
  const quickDialog = $('#quickDialog');
  if (formDialog?.open) formDialog.close();
  if (quickDialog?.open) quickDialog.close();
  document.documentElement.classList.remove('app-active');
  $('#app').hidden = true;
  $('#vaultScreen').hidden = false;
  $('#vaultCreate').hidden = true;
  $('#vaultUnlock').hidden = false;
  const unlock = $('#unlockPassphrase');
  if (unlock) unlock.focus();
}
function securitySnapshot() {
  const lockMinutes = clamp(Number(appState?.settings?.lockMinutes) || AUTO_LOCK_MINUTES, 1, 30);
  return {
    encryption: vaultKey ? 'Ativa' : 'Bloqueada',
    storage: 'IndexedDB cifrado',
    localStorage: 'Bloqueado para dados sensíveis',
    cloud: appState?.settings?.sync?.enabled ? 'Sincronização cifrada opcional via GitHub privado' : 'Desativada',
    telemetry: 'Desativada',
    csp: 'Ativa por meta tag compatível com GitHub Pages',
    serviceWorker: 'Cache limitado a assets públicos',
    attachments: ATTACHMENTS_REAL_FILES_ENABLED ? 'Cifragem de ficheiros ativa' : 'Anexos reais bloqueados',
    lock: `${lockMinutes} min de inatividade e bloqueio ao perder foco`,
    lastBackupAt: appState?.security?.lastBackupAt || null
  };
}
function ensureAttachmentsFeatureBlocked() {
  throw new Error('Anexos reais estão bloqueados até a cifragem de ficheiros estar concluída.');
}
