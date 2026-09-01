const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('sync.js','utf8');
new Function(source);

assert.match(source, /SYNC_DEFAULT_REPO = 'conta-de-casa-'/);
assert.match(source, /data\.private !== true/);
assert.match(source, /Contents: Read and write/);
assert.doesNotMatch(source, /github_pat_[A-Za-z0-9_]+/);
assert.doesNotMatch(source, /ghp_[A-Za-z0-9]+/);
assert.match(source, /encryptBytes\(key, enc\.encode\(value\)\)/);
assert.match(source, /backupContainsPlaintextFinancialData/);
assert.match(source, /recordSyncDeletion/);
assert.match(source, /SYNC_RACE/);

const context = vm.createContext({
  console,
  Date,
  JSON,
  Map,
  Set,
  Array,
  Object,
  String,
  Number,
  Math,
  RegExp,
  Error,
  Promise,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval
});

vm.runInContext(`
  var appState = null;
  function cleanString(v,max=160){return String(v??'').slice(0,max);}
  function ensureStateShape(s){
    return {
      version:s?.version||2,
      settings:s?.settings||{},
      months:s?.months||{},
      bills:s?.bills||[],
      payments:s?.payments||[],
      incomes:s?.incomes||[],
      market:s?.market||[],
      goals:s?.goals||[],
      activity:s?.activity||[],
      security:s?.security||{},
      syncTombstones:s?.syncTombstones||[],
      syncConflicts:s?.syncConflicts||[]
    };
  }
  function canonicalize(value){
    if(Array.isArray(value)) return '['+value.map(canonicalize).join(',')+']';
    if(value && typeof value==='object'){
      return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonicalize(value[k])).join(',')+'}';
    }
    return JSON.stringify(value);
  }
`, context);

vm.runInContext(source, context);

const merged = vm.runInContext(`mergeAppStates(
  {
    version:2,settings:{theme:'light'},months:{'2026-09':{openingBalanceCents:10000,updatedAt:'2026-09-02T10:00:00.000Z'}},
    bills:[{id:'b1',title:'Local novo',updatedAt:'2026-09-02T12:00:00.000Z'}],
    payments:[],incomes:[{id:'i1',description:'Salário',amountCents:100000,createdAt:'2026-09-01T08:00:00.000Z'}],
    market:[{id:'m1',name:'Leite',updatedAt:'2026-09-01T09:00:00.000Z'}],goals:[],activity:[],
    syncTombstones:[{entity:'market',id:'m1',deletedAt:'2026-09-03T09:00:00.000Z'}]
  },
  {
    version:2,settings:{theme:'dark'},months:{'2026-09':{openingBalanceCents:9000,updatedAt:'2026-09-01T10:00:00.000Z'}},
    bills:[{id:'b1',title:'Remoto antigo',updatedAt:'2026-09-01T12:00:00.000Z'},{id:'b2',title:'Internet',updatedAt:'2026-09-02T11:00:00.000Z'}],
    payments:[],incomes:[],market:[{id:'m1',name:'Leite remoto',updatedAt:'2026-09-02T09:00:00.000Z'}],goals:[],activity:[],
    syncTombstones:[]
  }
)`, context);

const plain = JSON.parse(JSON.stringify(merged));
assert.equal(plain.state.bills.length, 2);
assert.equal(plain.state.bills.find(x=>x.id==='b1').title, 'Local novo');
assert.equal(plain.state.months['2026-09'].openingBalanceCents, 10000);
assert.equal(plain.state.incomes.length, 1);
assert.equal(plain.state.market.length, 0);
assert.equal(plain.conflicts.length, 0);

console.log('Encrypted sync tests: OK');


assert.match(source, /let syncPending = false/);
assert.match(source, /if\(syncBusy\)\{syncPending=true;return 'syncing';\}/);
assert.match(source, /syncPending=true;[\s\S]*if\(syncBusy\) return/);
assert.match(source, /syncNow\('pending-change'\)/);
assert.match(source, /window\.addEventListener\('focus'/);
assert.match(source, /syncHeaderStatus/);

console.log('Automatic bidirectional sync queue tests: OK');


assert.match(source, /cfg\.enabled = !cfg\.disabledByUser/);
assert.match(source, /cfg\.owner = SYNC_DEFAULT_OWNER/);
assert.match(source, /cfg\.repo = SYNC_DEFAULT_REPO/);
assert.match(source, /cfg\.path = SYNC_DEFAULT_PATH/);
assert.match(source, /cfg\.disabledByUser=false/);
assert.match(source, /cfg\.disabledByUser=true;[\s\S]*cfg\.enabled=false/);

console.log('Sync auto-enable migration tests: OK');


assert.match(source, /const localOnly=state==='not-configured'\|\|state==='needs-token'/);
assert.match(source, /const headerClass=localOnly\?'attention':syncStatusClass\(state\)/);
assert.match(source, /Ainda sem sincronização remota/);
assert.match(source, /'Sem sync'/);

console.log('Local-only status clarity tests: OK');


assert.match(source, /async function manualSyncFromUi\(\)/);
assert.match(source, /Falta a credencial deste dispositivo/);
assert.match(source, /tokenInput\?\.scrollIntoView/);
assert.match(source, /await configureSyncFromUi\(\)/);
assert.match(source, /await syncNow\('manual'\)/);
assert.match(source, /btn\.textContent='A sincronizar…'/);
assert.match(source, /addEventListener\('click',manualSyncFromUi\)/);

console.log('Manual sync button UX tests: OK');


assert.match(source, /async function mergeEncryptedBackupFile\(file,passphrase\)/);
assert.match(source, /mergeAppStates\(appState,sourceState\)/);
assert.match(source, /await saveState\(\)/);
assert.match(source, /syncMergeBackupBtn/);

const coreSource=fs.readFileSync('core.js','utf8');
assert.match(coreSource, /async function decryptBackupState\(normalized, passphrase\)/);
assert.match(coreSource, /PIN do backup incorreto ou backup incompatível/);

const indexSource=fs.readFileSync('index.html','utf8');
assert.match(indexSource, /id="syncMergeBackupInput"/);
assert.match(indexSource, /id="syncMergeBackupPin"/);
assert.match(indexSource, /Juntar dados sem apagar/);

console.log('Encrypted cross-device merge tests: OK');


assert.match(source, /cfg\.owner = SYNC_DEFAULT_OWNER/);
assert.match(source, /cfg\.repo = SYNC_DEFAULT_REPO/);
assert.match(source, /cfg\.path = SYNC_DEFAULT_PATH/);
assert.doesNotMatch(source, /\$\('#syncOwner'\)/);
assert.doesNotMatch(source, /\$\('#syncRepo'\)/);
assert.doesNotMatch(source, /\$\('#syncPath'\)/);
assert.match(source, /function syncUserError\(/);

const syncIndex=fs.readFileSync('index.html','utf8');
assert.match(syncIndex, /id="syncDestination"/);
assert.doesNotMatch(syncIndex, /id="syncOwner"/);
assert.doesNotMatch(syncIndex, /id="syncRepo"/);
assert.doesNotMatch(syncIndex, /id="syncPath"/);
assert.match(syncIndex, /Ligar sincronização automática/);

console.log('Automatic fixed sync destination tests: OK');


assert.match(source, /async function decryptRemoteWithPassphrase\(remote,passphrase\)/);
assert.match(source, /async function mergeAndAdoptRemoteVault\(passphrase\)/);
assert.match(source, /mergeAppStates\(appState,remoteUnlocked\.state\)/);
assert.match(source, /buildSyncWrapperFromPair/);
assert.match(source, /await idbPutVaultPair\(remote\.normalized\.meta,secure\)/);
assert.match(source, /syncResolveBtn/);
assert.doesNotMatch(source, /addEventListener\('click',async\(\)=>\{\s*try\{await adoptRemoteSyncedVault/);

const healthIndex=fs.readFileSync('index.html','utf8');
assert.match(healthIndex, /id="syncHealthRemote"/);
assert.match(healthIndex, /id="syncResolveBox"/);
assert.match(healthIndex, /Unir dados e alinhar este dispositivo/);

console.log('Safe remote union and adoption tests: OK');


assert.match(source, /const SYNC_RETRY_DELAYS_MS = \[5000,15000,60000,180000,300000\]/);
assert.match(source, /function confirmRemoteWrite\(token,cfg,expectedSha,expectedRevision\)/);
assert.match(source, /await confirmRemoteWrite\(token,cfg,sha,nextRevision\)/);
assert.match(source, /Cofre cifrado exportado e confirmado no repositório privado/);
assert.match(source, /const message=syncUserError\(err\)/);
assert.doesNotMatch(source, /syncSetStatus\('error',safeUserError\(err,'Falha de sincronização/);
assert.match(source, /return await syncNow\('setup'\)/);
assert.match(source, /function showSyncSetupOutcome\(state,msg\)/);
assert.match(source, /function scheduleCredentialAutoSetup\(\)/);
assert.match(source, /addEventListener\('input',scheduleCredentialAutoSetup\)/);
assert.match(source, /window\.addEventListener\('pageshow'/);
assert.match(source, /function scheduleSyncRetry\(err\)/);

console.log('Confirmed automatic synchronization tests: OK');


assert.match(source, /async function persistEnteredSyncToken\(\)/);
assert.match(source, /await storeSyncToken\(entered\)/);
assert.match(source, /await saveSyncTokenStatus\(\{valid:false,lastError:'Aguardando validação remota\.'/);
assert.match(source, /const token=await persistEnteredSyncToken\(\)/);
assert.match(source, /await verifyPrivateSyncRepo\(token,cfg\)/);
assert.match(source, /Token guardado e validado/);
assert.match(source, /Token guardado — validação pendente\/falhou/);
assert.match(source, /addEventListener\('paste'/);
assert.match(source, /addEventListener\('blur',scheduleCredentialAutoSetup\)/);

console.log('Token persistence before validation tests: OK');


assert.match(source, /Token guardado, mas sem acesso a/);
assert.match(source, /Resource owner/);
assert.match(source, /acesso apenas ao repositório/);
assert.match(source, /Contents: Read and write/);
assert.match(source, /Token guardado, mas sem permissão suficiente em/);

console.log('Fine-grained token scope diagnostic tests: OK');
