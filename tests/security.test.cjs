const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

class StorageMock {
  constructor() { this.data = new Map(); }
  setItem(key, value) { this.data.set(String(key), String(value)); }
  getItem(key) { return this.data.has(String(key)) ? this.data.get(String(key)) : null; }
  removeItem(key) { this.data.delete(String(key)); }
  clear() { this.data.clear(); }
}

const appFiles = ['index.html','core.js','finance.js','render.js','forms.js','sync.js','events.js','market-experience.js','styles.css','sw.js','manifest.webmanifest'];
const executableFiles = ['core.js','finance.js','render.js','forms.js','sync.js','events.js','sw.js'];
const context = vm.createContext({
  crypto: webcrypto,
  TextEncoder,
  TextDecoder,
  Intl,
  Date,
  Math,
  Number,
  String,
  Boolean,
  Map,
  Set,
  Uint8Array,
  Array,
  Object,
  JSON,
  RegExp,
  Error,
  Promise,
  atob,
  btoa,
  Storage: StorageMock,
  localStorage: new StorageMock(),
  sessionStorage: new StorageMock()
});

const core = fs.readFileSync('core.js','utf8');
vm.runInContext(core, context);

assert.doesNotMatch(core, /Math\.random/, 'IDs must not fall back to Math.random');
assert.match(vm.runInContext('uid()', context), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);

const escaped = vm.runInContext('esc(`<img src=x onerror=alert(1)>`)', context);
assert.doesNotMatch(escaped, /<img/i);
assert.match(escaped, /&lt;img/);
assert.doesNotMatch(vm.runInContext('attr(`" autofocus onfocus=alert(1)`)', context), /"/);

vm.runInContext('installStorageGuards(); localStorage.setItem("cdc_public_theme", "light")', context);
assert.throws(() => vm.runInContext('localStorage.setItem("bill", "Fornecedor privado")', context), /Armazenamento em claro bloqueado/);
assert.throws(() => vm.runInContext('sessionStorage.setItem("cdc_public_note", "amountCents=123")', context), /Armazenamento em claro bloqueado/);
assert.throws(() => vm.runInContext('localStorage.setItem("cdc_public_auditTrail", "alteração")', context), /Armazenamento em claro bloqueado/);

const syncState = vm.runInContext(`ensureStateShape({
  settings:{sync:{enabled:true,owner:'example-user',repo:'private-vault',path:'sync/vault.json'}},
  months:{'2026-09':{openingBalanceCents:12345,budgetCents:9999,updatedAt:'2026-09-01T12:00:00.000Z'}},
  syncTombstones:[{entity:'market',id:'m1',deletedAt:'2026-09-01T13:00:00.000Z'}],
  syncConflicts:[{entity:'bill',id:'b1',at:'2026-09-01T14:00:00.000Z',local:{id:'b1'},remote:{id:'b1'}}]
})`, context);
assert.equal(syncState.settings.sync.enabled, true);
assert.equal(syncState.settings.sync.repo, 'private-vault');
assert.equal(syncState.months['2026-09'].updatedAt, '2026-09-01T12:00:00.000Z');
assert.equal(syncState.syncTombstones.length, 1);
assert.equal(syncState.syncConflicts.length, 1);

const approvedExternalOrigins = new Set(['https://api.github.com','https://cesta.pt','https://prices.openfoodfacts.org']);
for (const file of appFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const externalUrls = content.match(/https?:\/\/[^\s"'\`<>)]+/gi) || [];
  for (const url of externalUrls) {
    const normalizedUrl = url.replace(/[;,]+$/g, '');
    const parsed = new URL(normalizedUrl);
    assert.equal(approvedExternalOrigins.has(parsed.origin), true, `${file} references unapproved external origin ${parsed.origin}`);
    if (parsed.origin !== 'https://api.github.com') assert.equal(['index.html','market-experience.js'].includes(file), true, `${parsed.origin} is only approved for index CSP and market runtime`);
  }
  assert.doesNotMatch(content, /\b(sendBeacon|XMLHttpRequest|gtag|analytics)\b|cdn\.jsdelivr|cdnjs|unpkg/i, `${file} must not include telemetry or CDN hooks`);
}
for (const file of executableFiles) {
  assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /console\./, `${file} must not write app data to console`);
}

const index = fs.readFileSync('index.html','utf8');
assert.match(index, /Content-Security-Policy/);
assert.match(index, /script-src 'self'/);
assert.match(index, /connect-src 'self' https:\/\/api\.github\.com/);
assert.match(index, /https:\/\/cesta\.pt/);
assert.match(index, /https:\/\/prices\.openfoodfacts\.org/);
assert.doesNotMatch(index, /\son[a-z]+=/i, 'static HTML must not use inline event handlers');
assert.doesNotMatch(index, /target_name=|Destino automático/);

const sw = fs.readFileSync('sw.js','utf8');
assert.match(sw, /PUBLIC_ASSET_SET/);
assert.match(sw, /if \(url\.hash\) return null/);
assert.match(sw, /url\.searchParams\.size===1 && url\.searchParams\.has\('v'\)/, 'service worker may only accept the controlled cache-busting v query');
assert.doesNotMatch(sw, /cache\.put\(event\.request|cache\.put\(request/i, 'service worker must not cache arbitrary request URLs');

(async () => {
  const wrongPasswordRejected = await vm.runInContext(`(async()=>{
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const key=await deriveVaultKey('palavra-passe-correta',salt);
    const payload=await encryptBytes(key,enc.encode('conteudo privado'));
    const wrong=await deriveVaultKey('palavra-passe-errada',salt);
    try{await decryptBytes(wrong,payload.iv,payload.cipher);return false;}catch(_err){return true;}
  })()`, context);
  assert.equal(wrongPasswordRejected, true);

  const tamperedPayloadRejected = await vm.runInContext(`(async()=>{
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const key=await deriveVaultKey('palavra-passe-correta',salt);
    const payload=await encryptBytes(key,enc.encode('conteudo privado'));
    const bad={...payload,cipher:payload.cipher.slice(0,-4)+'AAAA'};
    try{await decryptBytes(key,bad.iv,bad.cipher);return false;}catch(_err){return true;}
  })()`, context);
  assert.equal(tamperedPayloadRejected, true);

  const pinRotation = await vm.runInContext(`(async()=>{
    const oldPass='PIN-antigo-seguro';
    const newPass='PIN-novo-seguro-2026';
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const oldKey=await deriveVaultKey(oldPass,salt);
    const check=await encryptBytes(oldKey,enc.encode(CHECK_TEXT_CURRENT));
    const state=ensureStateShape({
      bills:[{id:'b1',title:'Conta Teste',category:'Casa',totalCents:3210,dueAt:'2026-09-30T12:00:00.000Z'}],
      payments:[],incomes:[],market:[],goals:[],activity:[]
    });
    const securePayload=await encryptBytes(oldKey,enc.encode(JSON.stringify(state)));
    let storedMeta={key:'vault',version:2,salt:b64(salt),checkIv:check.iv,checkCipher:check.cipher,iterations:PBKDF2_ITERATIONS,createdAt:'2026-09-01T12:00:00.000Z'};
    let storedSecure={key:'state',iv:securePayload.iv,cipher:securePayload.cipher,updatedAt:'2026-09-01T12:00:00.000Z'};
    idbGet=async(store,key)=>store==='meta'&&key==='vault'?storedMeta:store==='secure'&&key==='state'?storedSecure:null;
    idbPutVaultPair=async(meta,secure)=>{storedMeta=meta;storedSecure=secure;return true;};
    saveState=async()=>{};
    appState=state;
    vaultKey=oldKey;
    await changeVaultPassphrase(oldPass,newPass);
    const newKey=await verifyVaultPassphrase(newPass);
    const restored=JSON.parse(dec.decode(await decryptBytes(newKey,storedSecure.iv,storedSecure.cipher)));
    let oldRejected=false;
    try{
      const oldDerived=await deriveVaultKey(oldPass,unb64(storedMeta.salt),storedMeta.iterations);
      await decryptBytes(oldDerived,storedMeta.checkIv,storedMeta.checkCipher);
    }catch(_err){oldRejected=true;}
    let wrongRejected=false;
    try{await verifyVaultPassphrase('PIN-errado-qualquer');}catch(_err){wrongRejected=true;}
    return {title:restored.bills[0].title,amount:restored.bills[0].totalCents,oldRejected,wrongRejected};
  })()`, context);
  assert.equal(pinRotation.title, 'Conta Teste');
  assert.equal(pinRotation.amount, 3210);
  assert.equal(pinRotation.oldRejected, true);
  assert.equal(pinRotation.wrongRejected, true);

  const backupChecks = await vm.runInContext(`(async()=>{
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const key=await deriveVaultKey('frase longa local',salt);
    const check=await encryptBytes(key,enc.encode(CHECK_TEXT_CURRENT));
    const state=ensureStateShape({
      bills:[{id:'b1',title:'Fornecedor <script>',provider:'Privado',category:'Casa',totalCents:1234,dueAt:'2026-09-20T12:00:00.000Z'}],
      payments:[],
      incomes:[],
      market:[],
      goals:[],
      activity:[{id:'a1',type:'bill',text:'Fatura "Fornecedor" criada',at:'2026-09-01T12:00:00.000Z'}]
    });
    const securePayload=await encryptBytes(key,enc.encode(JSON.stringify(state)));
    const meta={key:'vault',version:2,salt:b64(salt),checkIv:check.iv,checkCipher:check.cipher,iterations:PBKDF2_ITERATIONS,createdAt:'2026-09-01T12:00:00.000Z'};
    const secure={key:'state',iv:securePayload.iv,cipher:securePayload.cipher,updatedAt:'2026-09-01T12:00:00.000Z'};
    const backup=await buildBackupEnvelope(meta,secure);
    const text=JSON.stringify(backup);
    const parsed=await parseBackupText(text);
    const corrupted={...backup,secure:{...backup.secure,updatedAt:'2026-09-02T12:00:00.000Z'}};
    let corruptRejected=false;
    try{await parseBackupText(JSON.stringify(corrupted));}catch(_err){corruptRejected=true;}
    appState=null;
    const restored=ensureStateShape(JSON.parse(dec.decode(await decryptBytes(key,securePayload.iv,securePayload.cipher))));
    return {
      parsed:parsed.meta.key==='vault'&&parsed.secure.key==='state',
      hasPlain:backupContainsPlaintextFinancialData(text),
      corruptRejected,
      restoredTitle:restored.bills[0].title,
      restoredAmount:restored.bills[0].totalCents,
      activityText:restored.activity[0].text,
      backupText:text
    };
  })()`, context);
  assert.equal(backupChecks.parsed, true);
  assert.equal(backupChecks.hasPlain, false);
  assert.equal(backupChecks.corruptRejected, true);
  assert.equal(backupChecks.restoredTitle, 'Fornecedor <script>');
  assert.equal(backupChecks.restoredAmount, 1234);
  assert.equal(backupChecks.activityText, 'Fatura atualizada');
  assert.doesNotMatch(backupChecks.backupText, /Fornecedor|Privado|amountCents|totalCents|bills/);

  await assert.rejects(
    () => vm.runInContext('parseBackupText(JSON.stringify({app:APP_ID,formatVersion:1}))', context),
    /desatualizado/
  );

  console.log('Security tests: OK');
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});


assert.match(core, /event instanceof ErrorEvent/);
assert.match(core, /ResizeObserver loop/);
assert.match(core, /new URL\(filename,location\.href\)\.origin===location\.origin/);
assert.match(core, /\['AbortError','NotAllowedError'\]\.includes\(name\)/);
assert.doesNotMatch(core, /window\.addEventListener\('error', event => \{ event\.preventDefault\(\); showSafeMessage\(\); \}\)/);

console.log('Runtime error guard false-positive tests: OK');
