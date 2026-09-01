'use strict';

const DB_NAME = 'conta_de_casa_secure';
const DB_VERSION = 1;
const CHECK_TEXT = 'Conta_de_Casa::vault-check::v1';
const PBKDF2_ITERATIONS = 250000;
const DAY_MS = 86400000;

let db;
let vaultKey = null;
let appState = null;
let selectedMonth = new Date().toISOString().slice(0, 7);
let privacyHidden = false;
let lockTimer = null;

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

function icon(name, size = 19) {
  return `<svg class="svg-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.more}</svg>`;
}

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

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function esc(v = '') {
  return String(v).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
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
  const s = atob(value);
  const out = new Uint8Array(s.length);
  for (let i=0;i<s.length;i++) out[i] = s.charCodeAt(i);
  return out;
}

function defaultState() {
  return {
    version: 1,
    settings: { profileName: '', currency: 'EUR', theme: 'light', lockMinutes: 15 },
    months: {}, bills: [], payments: [], incomes: [], market: [], goals: [], activity: []
  };
}
function ensureStateShape(s) {
  const d = defaultState();
  return {
    ...d, ...s,
    settings: { ...d.settings, ...(s?.settings || {}) },
    months: s?.months || {}, bills: s?.bills || [], payments: s?.payments || [], incomes: s?.incomes || [], market: s?.market || [], goals: s?.goals || [], activity: s?.activity || []
  };
}
function monthProfile(month = selectedMonth) {
  appState.months[month] ||= { openingBalanceCents: 0, budgetCents: 0 };
  return appState.months[month];
}

async function openDb() {
  if (db) return db;
  db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains('meta')) d.createObjectStore('meta', { keyPath: 'key' });
      if (!d.objectStoreNames.contains('secure')) d.createObjectStore('secure', { keyPath: 'key' });
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
async function idbClearAll() {
  const d = await openDb();
  await Promise.all(['meta','secure'].map(store => new Promise((resolve, reject) => {
    const req = d.transaction(store, 'readwrite').objectStore(store).clear();
    req.onsuccess = () => resolve(); req.onerror = () => reject(req.error);
  })));
}
async function deriveVaultKey(passphrase, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(passphrase), { name:'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name:'PBKDF2', salt, iterations:PBKDF2_ITERATIONS, hash:'SHA-256' },
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
  const check = await encryptBytes(vaultKey, enc.encode(CHECK_TEXT));
  await idbPut('meta', { key:'vault', version:1, salt:b64(salt), checkIv:check.iv, checkCipher:check.cipher, iterations:PBKDF2_ITERATIONS, createdAt:new Date().toISOString() });
  appState = defaultState();
  monthProfile(selectedMonth);
  logActivity('Cofre local criado', 'security');
  await saveState();
}
async function unlockVault(passphrase) {
  const meta = await idbGet('meta','vault');
  if (!meta) throw new Error('Cofre não encontrado.');
  const key = await deriveVaultKey(passphrase, unb64(meta.salt));
  const check = dec.decode(await decryptBytes(key, meta.checkIv, meta.checkCipher));
  if (check !== CHECK_TEXT) throw new Error('Palavra-passe/PIN incorreto.');
  vaultKey = key;
  const secured = await idbGet('secure','state');
  if (!secured) appState = defaultState();
  else appState = ensureStateShape(JSON.parse(dec.decode(await decryptBytes(vaultKey, secured.iv, secured.cipher))));
  monthProfile(selectedMonth);
  await syncRecurringBills();
}
async function saveState() {
  if (!vaultKey || !appState) return;
  const payload = enc.encode(JSON.stringify(appState));
  const encrypted = await encryptBytes(vaultKey, payload);
  await idbPut('secure', { key:'state', ...encrypted, updatedAt:new Date().toISOString() });
}
function logActivity(text, type='general') {
  if (!appState) return;
  appState.activity.unshift({ id:uid(), text, type, at:new Date().toISOString() });
  if (appState.activity.length > 300) appState.activity.length = 300;
}
async function commit(message, type='general') {
  if (message) logActivity(message, type);
  await saveState();
  renderCurrentPage();
}
