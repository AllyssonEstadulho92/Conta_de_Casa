const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const context = vm.createContext({
  console,
  crypto:webcrypto,
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
  BigInt,
  atob,
  btoa,
  navigator:{onLine:true},
  document:{activeElement:null}
});

vm.runInContext(fs.readFileSync('core.js','utf8'),context);
vm.runInContext(fs.readFileSync('sync.js','utf8'),context);

const empty = vm.runInContext('defaultState()',context);
assert.equal(empty.version,5);
assert.equal(empty.settings.profileName,'');
assert.equal(empty.settings.sync.enabled,false);
assert.equal(empty.settings.sync.disabledByUser,false);
assert.equal(empty.settings.sync.owner,'');
assert.equal(empty.settings.sync.repo,'');
assert.equal(empty.settings.sync.path,'sync/vault.json');
for(const field of ['bills','payments','incomes','market','goals','activity','auditTrail','syncTombstones','syncConflicts']){
  assert.deepEqual(JSON.parse(JSON.stringify(empty[field])),[],field);
}
assert.deepEqual(JSON.parse(JSON.stringify(empty.months)),{});

const explicit = vm.runInContext(`ensureStateShape({
  settings:{sync:{enabled:true,disabledByUser:false,owner:'example-user',repo:'private-vault',path:'sync/vault.json'}},
  bills:[],payments:[],incomes:[],market:[],goals:[],activity:[]
})`,context);
context.appState = explicit;
const explicitCfg = vm.runInContext(`(()=>{appState=ensureStateShape({
  settings:{sync:{enabled:true,disabledByUser:false,owner:'example-user',repo:'private-vault',path:'sync/vault.json'}},
  bills:[],payments:[],incomes:[],market:[],goals:[],activity:[]
}); return syncConfig();})()`,context);
assert.equal(explicitCfg.enabled,true);
assert.equal(explicitCfg.owner,'example-user');
assert.equal(explicitCfg.repo,'private-vault');

const runtimeFiles=['index.html','core.js','sync.js','events.js','render.js','forms.js','finance.js','styles.css','design-system.css','sw.js','manifest.webmanifest'];
for(const file of runtimeFiles){
  const source=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(source,/AllyssonEstadulho92|conta-de-casa-/i,`${file} must not ship an owner-specific sync destination`);
}

assert.equal(fs.existsSync('downloads'),false,'downloads folder must not be present in the clean Pages repository');


(async()=>{
  const saltA=webcrypto.getRandomValues(new Uint8Array(16));
  const saltB=webcrypto.getRandomValues(new Uint8Array(16));
  assert.notDeepEqual([...saltA],[...saltB],'each vault must use a fresh random salt');

  const keyA=await vm.runInContext('deriveVaultKey("PIN-seguro-1234", new Uint8Array('+JSON.stringify([...saltA])+'))',context);
  const keyB=await vm.runInContext('deriveVaultKey("PIN-seguro-1234", new Uint8Array('+JSON.stringify([...saltB])+'))',context);
  context.keyA=keyA;
  context.keyB=keyB;
  const encrypted=await vm.runInContext('encryptBytes(keyA, enc.encode("dados privados"))',context);
  context.encrypted=encrypted;
  const ok=await vm.runInContext('(async()=>dec.decode(await decryptBytes(keyA,encrypted.iv,encrypted.cipher)))()',context);
  assert.equal(ok,'dados privados');
  const wrongSaltRejected=await vm.runInContext('(async()=>{try{await decryptBytes(keyB,encrypted.iv,encrypted.cipher);return false;}catch(_err){return true;}})()',context);
  assert.equal(wrongSaltRejected,true,'same password with another vault salt must not decrypt the ciphertext');

  const core=fs.readFileSync('core.js','utf8');
  assert.match(core,/const PBKDF2_ITERATIONS = 250000/);
  assert.match(core,/hash:'SHA-256'/);
  assert.match(core,/name:'AES-GCM', length:256/);
  assert.match(core,/crypto\.getRandomValues\(new Uint8Array\(16\)\)/);
  assert.match(core,/crypto\.getRandomValues\(new Uint8Array\(12\)\)/);
  assert.doesNotMatch(core,/localStorage\.setItem\([^\n]*(passphrase|password|pin)/i);
  console.log('Per-user clean vault and cryptographic isolation tests: OK');
})().catch(err=>{
  console.error(err);
  process.exitCode=1;
});
