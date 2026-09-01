'use strict';

const SYNC_API_ROOT = 'https://api.github.com';
const SYNC_DEFAULT_OWNER = 'AllyssonEstadulho92';
const SYNC_DEFAULT_REPO = 'conta-de-casa-';
const SYNC_DEFAULT_PATH = 'sync/vault.json';
const SYNC_FORMAT_VERSION = 1;
const SYNC_INTERVAL_MS = 60000;
const SYNC_PUSH_DELAY_MS = 1400;
const SYNC_RETRY_DELAYS_MS = [5000,15000,60000,180000,300000];

let syncBusy = false;
let syncSuppressAuto = false;
let syncPushTimer = null;
let syncIntervalTimer = null;
let syncLifecycleInstalled = false;
let syncControlsWired = false;
let syncLastStatus = { state:'not-configured', message:'Sincronização não configurada.', at:null };
let syncRemoteCandidate = null;
let syncPending = false;
let syncRetryTimer = null;
let syncRetryAttempt = 0;
let syncCredentialTimer = null;

function syncConfig() {
  if (!appState) return null;
  appState.settings ||= {};
  appState.settings.sync ||= {};
  const cfg = appState.settings.sync;
  cfg.disabledByUser = Boolean(cfg.disabledByUser);
  cfg.enabled = !cfg.disabledByUser;
  cfg.owner = SYNC_DEFAULT_OWNER;
  cfg.repo = SYNC_DEFAULT_REPO;
  cfg.path = SYNC_DEFAULT_PATH;
  return cfg;
}

function syncUserError(err, fallback='Não foi possível sincronizar. Os dados locais foram preservados.') {
  const message=String(err?.message||'');
  const allowed=[
    'Token GitHub inválido.',
    'Repositório privado não encontrado ou sem acesso.',
    'O token não tem permissão para este repositório.',
    'O token não tem permissão de leitura.',
    'O token precisa de Contents: Read and write.',
    'Não foi possível validar o repositório de sincronização.',
    'A sincronização é recusada: o repositório tem de ser privado.',
    'Repositório de sincronização inesperado.',
    'Falha ao obter o cofre sincronizado.',
    'Falha ao guardar o cofre cifrado no repositório privado.',
    'Ficheiro remoto inválido.',
    'Formato remoto incompatível.',
    'Cofre local incompleto.',
    'Confirmação remota falhou: cofre não encontrado.',
    'Confirmação remota falhou: revisão inesperada.',
    'Confirmação remota falhou: conteúdo inesperado.',
    'Confirmação remota falhou: identidade do cofre diferente.'
  ];
  return allowed.includes(message)?message:fallback;
}

function clearSyncRetry() {
  clearTimeout(syncRetryTimer);
  syncRetryTimer=null;
  syncRetryAttempt=0;
}

function permanentSyncError(err) {
  const message=String(err?.message||'');
  return [
    'Token GitHub inválido.',
    'Repositório privado não encontrado ou sem acesso.',
    'O token não tem permissão para este repositório.',
    'O token não tem permissão de leitura.',
    'O token precisa de Contents: Read and write.',
    'A sincronização é recusada: o repositório tem de ser privado.',
    'Repositório de sincronização inesperado.',
    'Ficheiro remoto inválido.',
    'Formato remoto incompatível.',
    'REMOTE_VAULT_MISMATCH',
    'SYNC_RACE'
  ].includes(message);
}

function scheduleSyncRetry(err) {
  if(permanentSyncError(err) || !navigator.onLine || !syncConfig()?.enabled) return 0;
  clearTimeout(syncRetryTimer);
  const index=Math.min(syncRetryAttempt,SYNC_RETRY_DELAYS_MS.length-1);
  const delay=SYNC_RETRY_DELAYS_MS[index];
  syncRetryAttempt=Math.min(syncRetryAttempt+1,SYNC_RETRY_DELAYS_MS.length);
  syncRetryTimer=setTimeout(()=>syncNow('retry'),delay);
  return delay;
}

function syncSetStatus(state, message, at = new Date().toISOString()) {
  syncLastStatus = { state, message, at };
  renderSyncUi();
}

function syncStatusLabel(state) {
  return ({
    'not-configured':'Não configurado',
    'needs-token':'Token necessário',
    'syncing':'A sincronizar',
    'synced':'Sincronizado',
    'offline':'Offline',
    'conflict':'Conflito',
    'vault-mismatch':'Cofre remoto diferente',
    'error':'Erro'
  })[state] || 'Estado desconhecido';
}

function syncStatusClass(state) {
  if (state === 'synced') return 'paid';
  if (state === 'syncing') return 'partial';
  if (state === 'offline') return 'attention';
  if (state === 'conflict' || state === 'vault-mismatch' || state === 'error') return 'overdue';
  return 'normal';
}

function safeRepoPart(value, fallback) {
  const v = cleanString(value || fallback, 100);
  if (!/^[A-Za-z0-9_.-]+$/.test(v)) throw new Error('Nome de proprietário/repositório inválido.');
  return v;
}

function safeSyncPath(value) {
  const v = cleanString(value || SYNC_DEFAULT_PATH, 180).replace(/^\/+/, '');
  if (!v || v.includes('..') || !/^[A-Za-z0-9_./-]+$/.test(v)) throw new Error('Caminho remoto inválido.');
  return v;
}

function githubHeaders(token) {
  return {
    'Accept':'application/vnd.github+json',
    'Authorization':`Bearer ${token}`,
    'X-GitHub-Api-Version':'2022-11-28'
  };
}

function githubPath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function getOrCreateSyncWrapKey() {
  const existing = await idbGet('device','sync-wrap-key');
  if (existing?.cryptoKey) return existing.cryptoKey;
  const cryptoKey = await crypto.subtle.generateKey({ name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
  await idbPut('device',{ key:'sync-wrap-key', cryptoKey });
  return cryptoKey;
}

async function storeSyncToken(token) {
  const value = String(token || '').trim();
  if (value.length < 20) throw new Error('Token GitHub inválido.');
  const key = await getOrCreateSyncWrapKey();
  const sealed = await encryptBytes(key, enc.encode(value));
  await idbPut('device',{ key:'sync-token', iv:sealed.iv, cipher:sealed.cipher, updatedAt:new Date().toISOString() });
}

async function loadSyncToken() {
  const row = await idbGet('device','sync-token');
  if (!row?.iv || !row?.cipher) return null;
  try {
    const key = await getOrCreateSyncWrapKey();
    return dec.decode(await decryptBytes(key,row.iv,row.cipher));
  } catch (_err) {
    return null;
  }
}

async function saveSyncTokenStatus(patch={}) {
  const current=await idbGet('device','sync-token-status').catch(()=>null);
  const next={
    key:'sync-token-status',
    valid:Boolean(patch.valid),
    lastError:cleanString(patch.lastError||'',220),
    validatedAt:patch.valid?new Date().toISOString():(current?.validatedAt||null),
    updatedAt:new Date().toISOString()
  };
  await idbPut('device',next);
  return next;
}

async function loadSyncTokenStatus() {
  return await idbGet('device','sync-token-status').catch(()=>null);
}

async function persistEnteredSyncToken() {
  const input=$('#syncToken');
  const entered=String(input?.value||'').trim();
  if(!entered) return await loadSyncToken();
  await storeSyncToken(entered);
  await saveSyncTokenStatus({valid:false,lastError:'Aguardando validação remota.'});
  if(input) input.value='';
  renderSyncUi();
  return entered;
}

async function deleteDeviceRecord(keyName) {
  const d = await openDb();
  await new Promise((resolve,reject)=>{
    const tx=d.transaction('device','readwrite');
    const req=tx.objectStore('device').delete(keyName);
    req.onsuccess=()=>resolve();
    req.onerror=()=>reject(req.error);
  });
}

async function syncDeviceMeta() {
  let row = await idbGet('device','sync-meta');
  if (!row) {
    row = { key:'sync-meta', deviceId:uid(), lastRemoteSha:null, lastRevision:0, lastSyncedAt:null };
    await idbPut('device',row);
  }
  return row;
}

async function verifyPrivateSyncRepo(token,cfg) {
  const owner=safeRepoPart(cfg.owner,SYNC_DEFAULT_OWNER);
  const repo=safeRepoPart(cfg.repo,SYNC_DEFAULT_REPO);
  const res=await fetch(`${SYNC_API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,{
    method:'GET',headers:githubHeaders(token),cache:'no-store',referrerPolicy:'no-referrer'
  });
  if (res.status===401) throw new Error('Token GitHub inválido.');
  if (res.status===404) throw new Error('Repositório privado não encontrado ou sem acesso.');
  if (res.status===403) throw new Error('O token não tem permissão para este repositório.');
  if (!res.ok) throw new Error('Não foi possível validar o repositório de sincronização.');
  const data=await res.json();
  if (data.private !== true) throw new Error('A sincronização é recusada: o repositório tem de ser privado.');
  if (String(data.full_name||'').toLowerCase() !== `${owner}/${repo}`.toLowerCase()) throw new Error('Repositório de sincronização inesperado.');
  return true;
}

async function fetchRemoteSyncFile(token,cfg) {
  const owner=safeRepoPart(cfg.owner,SYNC_DEFAULT_OWNER);
  const repo=safeRepoPart(cfg.repo,SYNC_DEFAULT_REPO);
  const path=safeSyncPath(cfg.path);
  const url=`${SYNC_API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${githubPath(path)}?ref=main`;
  const res=await fetch(url,{method:'GET',headers:githubHeaders(token),cache:'no-store',referrerPolicy:'no-referrer'});
  if (res.status===404) return null;
  if (res.status===401) throw new Error('Token GitHub inválido.');
  if (res.status===403) throw new Error('O token não tem permissão de leitura.');
  if (!res.ok) throw new Error('Falha ao obter o cofre sincronizado.');
  const payload=await res.json();
  if (payload.type!=='file' || typeof payload.content!=='string' || !payload.sha) throw new Error('Resposta remota inválida.');
  let wrapper;
  try {
    wrapper=JSON.parse(dec.decode(unb64(payload.content.replace(/\s/g,''))));
  } catch (_err) {
    throw new Error('Ficheiro remoto inválido.');
  }
  if (!isPlainObject(wrapper) || wrapper.app!=='Conta_de_Casa_Sync' || Number(wrapper.formatVersion)!==SYNC_FORMAT_VERSION) {
    throw new Error('Formato remoto incompatível.');
  }
  const normalized=await parseBackupText(JSON.stringify(wrapper.backup));
  return {
    sha:String(payload.sha),
    revision:Math.max(0,Number(wrapper.revision)||0),
    updatedAt:validIsoOrNow(wrapper.updatedAt),
    deviceId:cleanString(wrapper.deviceId||'',80),
    wrapper,
    normalized
  };
}

async function putRemoteSyncFile(token,cfg,wrapper,sha=null) {
  const owner=safeRepoPart(cfg.owner,SYNC_DEFAULT_OWNER);
  const repo=safeRepoPart(cfg.repo,SYNC_DEFAULT_REPO);
  const path=safeSyncPath(cfg.path);
  const url=`${SYNC_API_ROOT}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${githubPath(path)}`;
  const body={
    message:'sync: update encrypted Conta de Casa vault',
    content:b64(enc.encode(JSON.stringify(wrapper))),
    branch:'main'
  };
  if (sha) body.sha=sha;
  const res=await fetch(url,{
    method:'PUT',
    headers:{...githubHeaders(token),'Content-Type':'application/json'},
    body:JSON.stringify(body),
    cache:'no-store',
    referrerPolicy:'no-referrer'
  });
  if (res.status===409 || res.status===422) throw new Error('SYNC_RACE');
  if (res.status===401) throw new Error('Token GitHub inválido.');
  if (res.status===403) throw new Error('O token precisa de Contents: Read and write.');
  if (!res.ok) throw new Error('Falha ao guardar o cofre cifrado no repositório privado.');
  const data=await res.json();
  return String(data?.content?.sha || '');
}

async function buildSyncWrapper(revision,deviceId) {
  const meta=await idbGet('meta','vault');
  const secure=await idbGet('secure','state');
  if(!meta||!secure) throw new Error('Cofre local incompleto.');
  const backup=await buildBackupEnvelope(meta,secure);
  const serialized=JSON.stringify(backup);
  if(backupContainsPlaintextFinancialData(serialized)) throw new Error('Sincronização bloqueada por validação de confidencialidade.');
  return {
    app:'Conta_de_Casa_Sync',
    formatVersion:SYNC_FORMAT_VERSION,
    revision,
    updatedAt:new Date().toISOString(),
    deviceId,
    backup
  };
}

function vaultMetaMatches(localMeta,remoteMeta) {
  return !!localMeta && !!remoteMeta &&
    localMeta.salt===remoteMeta.salt &&
    localMeta.checkIv===remoteMeta.checkIv &&
    localMeta.checkCipher===remoteMeta.checkCipher;
}

async function decryptRemoteState(remote) {
  try {
    const json=dec.decode(await decryptBytes(vaultKey,remote.normalized.secure.iv,remote.normalized.secure.cipher));
    return ensureStateShape(JSON.parse(json));
  } catch (_err) {
    throw new Error('REMOTE_VAULT_MISMATCH');
  }
}

function syncItemTime(item) {
  const candidates=[item?.updatedAt,item?.deletedAt,item?.paidAt,item?.receivedAt,item?.purchasedAt,item?.createdAt];
  for(const value of candidates){
    const t=new Date(value||0).getTime();
    if(Number.isFinite(t)&&t>0) return t;
  }
  return 0;
}

function syncClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeTombstones(a=[],b=[]) {
  const map=new Map();
  for(const item of [...a,...b]){
    if(!item?.entity||!item?.id) continue;
    const key=`${item.entity}:${item.id}`;
    const current=map.get(key);
    if(!current || new Date(item.deletedAt||0)>new Date(current.deletedAt||0)) map.set(key,syncClone(item));
  }
  return [...map.values()].slice(-500);
}

function mergeById(entity,local=[],remote=[],conflicts=[]) {
  const map=new Map();
  for(const item of remote||[]) if(item?.id) map.set(item.id,syncClone(item));
  for(const item of local||[]){
    if(!item?.id) continue;
    const other=map.get(item.id);
    if(!other){ map.set(item.id,syncClone(item)); continue; }
    if(canonicalize(item)===canonicalize(other)) continue;
    const lt=syncItemTime(item), rt=syncItemTime(other);
    if(lt>rt){ map.set(item.id,syncClone(item)); continue; }
    if(rt>lt) continue;
    conflicts.push({entity,id:item.id,at:new Date().toISOString(),local:syncClone(item),remote:syncClone(other)});
    map.set(item.id,syncClone(item));
  }
  return [...map.values()];
}

function applyTombstones(state) {
  const tombstones=state.syncTombstones||[];
  const entityMap={income:'incomes',market:'market',bill:'bills',payment:'payments',goal:'goals'};
  for(const tomb of tombstones){
    const field=entityMap[tomb.entity];
    if(!field||!Array.isArray(state[field])) continue;
    const deletedAt=new Date(tomb.deletedAt||0).getTime();
    state[field]=state[field].filter(item=>item.id!==tomb.id || syncItemTime(item)>deletedAt);
  }
}

function mergeMonths(localMonths={},remoteMonths={},conflicts=[]) {
  const out={...syncClone(remoteMonths||{})};
  for(const [month,lp] of Object.entries(localMonths||{})){
    const rp=out[month];
    if(!rp){out[month]=syncClone(lp);continue;}
    if(canonicalize(lp)===canonicalize(rp)) continue;
    const lt=new Date(lp.updatedAt||0).getTime()||0;
    const rt=new Date(rp.updatedAt||0).getTime()||0;
    if(lt>rt){out[month]=syncClone(lp);continue;}
    if(rt>lt) continue;
    conflicts.push({entity:'month',id:month,at:new Date().toISOString(),local:syncClone(lp),remote:syncClone(rp)});
    out[month]=syncClone(lp);
  }
  return out;
}

function mergeAppStates(localState,remoteState) {
  const local=ensureStateShape(syncClone(localState));
  const remote=ensureStateShape(syncClone(remoteState));
  const conflicts=[];
  const merged={...remote,...local};
  merged.bills=mergeById('bill',local.bills,remote.bills,conflicts);
  merged.payments=mergeById('payment',local.payments,remote.payments,conflicts);
  merged.incomes=mergeById('income',local.incomes,remote.incomes,conflicts);
  merged.market=mergeById('market',local.market,remote.market,conflicts);
  merged.goals=mergeById('goal',local.goals,remote.goals,conflicts);
  merged.activity=mergeById('activity',local.activity,remote.activity,conflicts).sort((a,b)=>new Date(b.at)-new Date(a.at)).slice(0,300);
  merged.months=mergeMonths(local.months,remote.months,conflicts);
  merged.syncTombstones=mergeTombstones(local.syncTombstones,remote.syncTombstones);
  merged.settings={...(remote.settings||{}),...(local.settings||{})};
  merged.settings.sync={...(remote.settings?.sync||{}),...(local.settings?.sync||{})};
  merged.security={...(remote.security||{}),...(local.security||{})};
  const previous=[...(remote.syncConflicts||[]),...(local.syncConflicts||[])];
  merged.syncConflicts=[...previous,...conflicts].slice(-50);
  applyTombstones(merged);
  return {state:ensureStateShape(merged),conflicts};
}

async function mergeEncryptedBackupFile(file,passphrase) {
  if(!vaultKey||!appState) throw new Error('Cofre local bloqueado.');
  if(!file) throw new Error('Selecione o backup cifrado do outro dispositivo.');
  if(file.size>MAX_IMPORT_BYTES) throw new Error('Ficheiro de backup demasiado grande.');
  const text=await file.text();
  if(backupContainsPlaintextFinancialData(text)) throw new Error('Backup em claro bloqueado.');
  const normalized=await parseBackupText(text);
  const sourceState=await decryptBackupState(normalized,passphrase);

  const before={
    bills:appState.bills.length,
    payments:appState.payments.length,
    incomes:appState.incomes.length,
    market:appState.market.length,
    goals:appState.goals.length
  };
  const merged=mergeAppStates(appState,sourceState);
  appState=merged.state;
  logActivity('merged','backup');
  await saveState();
  renderCurrentPage();

  const after={
    bills:appState.bills.length,
    payments:appState.payments.length,
    incomes:appState.incomes.length,
    market:appState.market.length,
    goals:appState.goals.length
  };
  return {
    addedBills:Math.max(0,after.bills-before.bills),
    addedPayments:Math.max(0,after.payments-before.payments),
    addedIncomes:Math.max(0,after.incomes-before.incomes),
    addedMarket:Math.max(0,after.market-before.market),
    addedGoals:Math.max(0,after.goals-before.goals),
    conflicts:merged.conflicts.length
  };
}

async function decryptRemoteWithPassphrase(remote,passphrase) {
  const phrase=String(passphrase??'');
  if(!phrase) throw new Error('Introduza o PIN do cofre sincronizado.');
  try{
    const key=await deriveVaultKey(phrase,unb64(remote.normalized.meta.salt),Number(remote.normalized.meta.iterations));
    const check=dec.decode(await decryptBytes(key,remote.normalized.meta.checkIv,remote.normalized.meta.checkCipher));
    if(![CHECK_TEXT_CURRENT,CHECK_TEXT_LEGACY].includes(check)) throw new Error('check-failed');
    const json=dec.decode(await decryptBytes(key,remote.normalized.secure.iv,remote.normalized.secure.cipher));
    return {key,state:ensureStateShape(JSON.parse(json))};
  }catch(_err){
    throw new Error('PIN do cofre sincronizado incorreto.');
  }
}

async function buildSyncWrapperFromPair(meta,secure,revision,deviceId) {
  const backup=await buildBackupEnvelope(meta,secure);
  const serialized=JSON.stringify(backup);
  if(backupContainsPlaintextFinancialData(serialized)) throw new Error('Sincronização bloqueada por validação de confidencialidade.');
  return {
    app:'Conta_de_Casa_Sync',
    formatVersion:SYNC_FORMAT_VERSION,
    revision,
    updatedAt:new Date().toISOString(),
    deviceId,
    backup
  };
}

async function mergeAndAdoptRemoteVault(passphrase) {
  if(!vaultKey||!appState) throw new Error('Cofre local bloqueado.');
  const cfg=syncConfig();
  const token=await loadSyncToken();
  if(!token) throw new Error('Introduza o token GitHub deste dispositivo.');
  const remote=syncRemoteCandidate||await fetchRemoteSyncFile(token,cfg);
  if(!remote) throw new Error('Ainda não existe cofre remoto.');

  const remoteUnlocked=await decryptRemoteWithPassphrase(remote,passphrase);
  const merged=mergeAppStates(appState,remoteUnlocked.state);
  const now=new Date().toISOString();
  const encrypted=await encryptBytes(remoteUnlocked.key,enc.encode(JSON.stringify(merged.state)));
  const secure={key:'state',iv:encrypted.iv,cipher:encrypted.cipher,updatedAt:now};
  const device=await syncDeviceMeta();
  const wrapper=await buildSyncWrapperFromPair(remote.normalized.meta,secure,remote.revision+1,device.deviceId);

  let sha;
  try{
    sha=await putRemoteSyncFile(token,cfg,wrapper,remote.sha);
  }catch(err){
    if(err?.message==='SYNC_RACE') throw new Error('O outro dispositivo sincronizou ao mesmo tempo. Tente novamente.');
    throw err;
  }

  await idbPutVaultPair(remote.normalized.meta,secure);
  await saveSyncDeviceMeta({lastRemoteSha:sha,lastRevision:remote.revision+1,lastSyncedAt:now});
  syncRemoteCandidate=null;
  lockApp('sync-merge-adopt');
  const msg=$('#vaultMessage');
  if(msg){
    msg.textContent=merged.conflicts.length
      ? `Dados dos dois dispositivos unidos; ${merged.conflicts.length} conflito(s) foram preservados para revisão. Entre com o PIN do cofre sincronizado.`
      : 'Dados dos dois dispositivos unidos com segurança. Entre agora com o PIN do cofre sincronizado.';
    msg.className=merged.conflicts.length?'form-message error':'form-message success';
  }
}

async function syncDigest(value) {
  const bytes=enc.encode(canonicalize(value));
  return b64(await crypto.subtle.digest('SHA-256',bytes));
}

function recordSyncDeletion(entity,id) {
  if(!appState||!entity||!id) return;
  appState.syncTombstones ||= [];
  const key=`${entity}:${id}`;
  appState.syncTombstones=appState.syncTombstones.filter(x=>`${x.entity}:${x.id}`!==key);
  appState.syncTombstones.push({entity:cleanString(entity,30),id:cleanString(id,100),deletedAt:new Date().toISOString()});
}

async function saveSyncDeviceMeta(patch={}) {
  const current=await syncDeviceMeta();
  const next={...current,...patch,key:'sync-meta'};
  await idbPut('device',next);
  return next;
}

async function confirmRemoteWrite(token,cfg,expectedSha,expectedRevision) {
  const confirmed=await fetchRemoteSyncFile(token,cfg);
  if(!confirmed) throw new Error('Confirmação remota falhou: cofre não encontrado.');
  if(expectedSha && confirmed.sha!==expectedSha) throw new Error('Confirmação remota falhou: conteúdo inesperado.');
  if(Number(confirmed.revision)!==Number(expectedRevision)) throw new Error('Confirmação remota falhou: revisão inesperada.');
  const localMeta=await idbGet('meta','vault');
  if(!vaultMetaMatches(localMeta,confirmed.normalized.meta)) throw new Error('Confirmação remota falhou: identidade do cofre diferente.');
  return confirmed;
}

async function pushLocalEncryptedVault(token,cfg,remote=null,revision=null) {
  const device=await syncDeviceMeta();
  const nextRevision=revision ?? ((remote?.revision||0)+1);
  const wrapper=await buildSyncWrapper(nextRevision,device.deviceId);
  const sha=await putRemoteSyncFile(token,cfg,wrapper,remote?.sha||null);
  const confirmed=await confirmRemoteWrite(token,cfg,sha,nextRevision);
  await saveSyncDeviceMeta({lastRemoteSha:confirmed.sha,lastRevision:confirmed.revision,lastSyncedAt:new Date().toISOString()});
  return {sha:confirmed.sha,revision:confirmed.revision};
}

async function syncNow(reason='manual') {
  if(syncBusy){syncPending=true;return 'syncing';}
  syncPending=false;
  if(!vaultKey||!appState) return 'not-ready';
  const cfg=syncConfig();
  if(!cfg?.enabled){syncSetStatus('not-configured','Sincronização automática ainda não está ativa.');return 'not-configured';}
  if(!navigator.onLine){syncSetStatus('offline','Sem ligação. As alterações permanecem cifradas neste dispositivo.');return 'offline';}
  const token=await loadSyncToken();
  if(!token){syncSetStatus('needs-token','Introduza o token GitHub deste dispositivo.');return 'needs-token';}

  syncBusy=true;
  syncSetStatus('syncing',reason==='manual'?'Sincronização manual em curso...':'A sincronizar alterações cifradas...');
  try{
    await verifyPrivateSyncRepo(token,cfg);
    await saveSyncTokenStatus({valid:true,lastError:''});
    const remote=await fetchRemoteSyncFile(token,cfg);
    const localMeta=await idbGet('meta','vault');

    if(!remote){
      await pushLocalEncryptedVault(token,cfg,null,1);
      syncRemoteCandidate=null;
      clearSyncRetry();
      syncSetStatus('synced','Cofre cifrado exportado e confirmado no repositório privado.');
      return 'synced';
    }

    if(!vaultMetaMatches(localMeta,remote.normalized.meta)){
      syncRemoteCandidate=remote;
      clearSyncRetry();
      syncSetStatus('vault-mismatch','Este dispositivo tem um cofre diferente do remoto. Use a união segura para preservar os dados dos dois lados e passar ambos para o mesmo cofre.');
      return 'vault-mismatch';
    }

    const remoteState=await decryptRemoteState(remote);
    const localDigest=await syncDigest(appState);
    const remoteDigest=await syncDigest(remoteState);
    const merged=mergeAppStates(appState,remoteState);
    const mergedDigest=await syncDigest(merged.state);

    if(merged.conflicts.length){
      syncSuppressAuto=true;
      try{
        appState=merged.state;
        await saveState();
      } finally { syncSuppressAuto=false; }
      await saveSyncDeviceMeta({lastRemoteSha:remote.sha,lastRevision:remote.revision,lastSyncedAt:new Date().toISOString()});
      clearSyncRetry();
      syncSetStatus('conflict',`${merged.conflicts.length} conflito(s) preservado(s). Nenhuma versão foi apagada silenciosamente.`);
      return 'conflict';
    }

    if(localDigest!==mergedDigest){
      syncSuppressAuto=true;
      try{
        appState=merged.state;
        await saveState();
      } finally { syncSuppressAuto=false; }
      renderCurrentPage();
    }

    if(mergedDigest!==remoteDigest){
      try{
        await pushLocalEncryptedVault(token,cfg,remote,remote.revision+1);
      } catch(err){
        if(err?.message==='SYNC_RACE'){
          clearSyncRetry();
          syncSetStatus('conflict','O outro dispositivo alterou o cofre ao mesmo tempo. A aplicação não sobrescreveu os dados; volte a sincronizar.');
          return 'conflict';
        }
        throw err;
      }
    }else{
      await saveSyncDeviceMeta({lastRemoteSha:remote.sha,lastRevision:remote.revision,lastSyncedAt:new Date().toISOString()});
    }

    syncRemoteCandidate=null;
    clearSyncRetry();
    syncSetStatus('synced','Web e móvel estão alinhados com o cofre cifrado remoto.');
    return 'synced';
  }catch(err){
    if(err?.message==='REMOTE_VAULT_MISMATCH'){
      clearSyncRetry();
      syncSetStatus('vault-mismatch','O cofre remoto utiliza outra chave. Use a união segura para preservar os dados dos dois dispositivos.');
      return 'vault-mismatch';
    }else if(err?.message==='SYNC_RACE'){
      clearSyncRetry();
      syncSetStatus('conflict','Conflito de versão detetado; os dados locais foram preservados.');
      return 'conflict';
    }else{
      const message=syncUserError(err);
      if(permanentSyncError(err)) await saveSyncTokenStatus({valid:false,lastError:message}).catch(()=>{});
      const retryDelay=scheduleSyncRetry(err);
      const retryText=retryDelay?` Nova tentativa automática em ${Math.ceil(retryDelay/1000)} s.`:'';
      syncSetStatus('error',message+retryText);
      return 'error';
    }
  }finally{
    syncBusy=false;
    renderSyncUi();
    if(syncPending && appState?.settings?.sync?.enabled && navigator.onLine){
      clearTimeout(syncRetryTimer);
      syncRetryTimer=setTimeout(()=>syncNow('pending-change'),800);
    }
  }
}

function queueRemoteSync() {
  if(syncSuppressAuto||!appState||!vaultKey) return;
  const cfg=syncConfig();
  if(!cfg?.enabled) return;
  syncPending=true;
  clearTimeout(syncPushTimer);
  if(syncBusy) return;
  syncPushTimer=setTimeout(()=>syncNow('local-change'),SYNC_PUSH_DELAY_MS);
}

async function adoptRemoteSyncedVault() {
  if(!vaultKey||!appState) throw new Error('Cofre local bloqueado.');
  const cfg=syncConfig();
  const token=await loadSyncToken();
  if(!cfg?.enabled||!token) throw new Error('Configure primeiro a sincronização.');
  const remote=syncRemoteCandidate || await fetchRemoteSyncFile(token,cfg);
  if(!remote) throw new Error('Ainda não existe cofre remoto.');
  const ok=confirm('Substituir o cofre LOCAL deste dispositivo pelo cofre cifrado sincronizado? O cofre remoto e o computador não serão apagados.');
  if(!ok) return;
  await idbPutVaultPair(remote.normalized.meta,remote.normalized.secure);
  await saveSyncDeviceMeta({lastRemoteSha:remote.sha,lastRevision:remote.revision,lastSyncedAt:new Date().toISOString()});
  syncRemoteCandidate=null;
  lockApp('sync-adopt');
  const msg=$('#vaultMessage');
  if(msg){
    msg.textContent='Cofre sincronizado adotado. Entre agora com o PIN usado no computador.';
    msg.className='form-message success';
  }
}

async function configureSyncFromUi() {
  if(!appState||!vaultKey) return 'not-ready';
  const token=await persistEnteredSyncToken();
  if(!token) throw new Error('Introduza um token GitHub de acesso ao repositório privado.');
  const cfg=syncConfig();

  try{
    await verifyPrivateSyncRepo(token,cfg);
    await saveSyncTokenStatus({valid:true,lastError:''});
  }catch(err){
    await saveSyncTokenStatus({valid:false,lastError:syncUserError(err)});
    syncSetStatus('error',syncUserError(err));
    throw err;
  }

  cfg.disabledByUser=false;
  cfg.enabled=true;
  syncSuppressAuto=true;
  try{await saveState();}finally{syncSuppressAuto=false;}
  syncSetStatus('syncing','Credencial guardada e validada. A sincronização automática está a iniciar...');
  return await syncNow('setup');
}

async function disableSync() {
  if(!appState) return;
  const cfg=syncConfig();
  cfg.disabledByUser=true;
  cfg.enabled=false;
  syncSuppressAuto=true;
  try{await saveState();}finally{syncSuppressAuto=false;}
  await deleteDeviceRecord('sync-token').catch(()=>{});
  await deleteDeviceRecord('sync-token-status').catch(()=>{});
  syncRemoteCandidate=null;
  syncSetStatus('not-configured','Sincronização automática desativada neste dispositivo.');
}

async function renderSyncUi() {
  const root=$('#syncPanel');
  if(!root||!appState) return;
  const cfg=syncConfig();
  const meta=await syncDeviceMeta().catch(()=>null);
  const token=await loadSyncToken().catch(()=>null);
  const tokenStatus=await loadSyncTokenStatus().catch(()=>null);
  const badge=$('#syncStatusBadge');
  if(badge){
    badge.className=`status-chip ${syncStatusClass(syncLastStatus.state)}`;
    badge.textContent=syncStatusLabel(syncLastStatus.state);
  }
  const header=$('#syncHeaderStatus');
  if(header){
    const state=syncLastStatus.state;
    const localOnly=state==='not-configured'||state==='needs-token';
    const headerClass=localOnly?'attention':syncStatusClass(state);
    header.className=`sync-header-status ${headerClass}`;
    header.title=localOnly
      ? `Ainda sem sincronização remota — ${syncLastStatus.message}`
      : `${syncStatusLabel(state)} — ${syncLastStatus.message}`;
    header.setAttribute('aria-label',header.title);
    const text=header.querySelector('.sync-header-text');
    if(text) text.textContent=
      state==='synced'?'Sync':
      state==='syncing'?'...':
      state==='offline'?'Offline':
      state==='conflict'?'Conflito':
      state==='vault-mismatch'?'Rever':
      state==='error'?'Erro':'Sem sync';
  }
  if($('#syncStatusText')) $('#syncStatusText').textContent=syncLastStatus.message;
  if($('#syncLastAt')) $('#syncLastAt').textContent=meta?.lastSyncedAt?fmtDateTime(meta.lastSyncedAt):'Ainda não sincronizado';
  if($('#syncDestination')) $('#syncDestination').textContent=`${SYNC_DEFAULT_OWNER}/${SYNC_DEFAULT_REPO} · ${SYNC_DEFAULT_PATH}`;
  if($('#syncTokenState')) $('#syncTokenState').textContent=
    !token?'Token ainda não guardado':
    tokenStatus?.valid?'Token guardado e validado':
    tokenStatus?.lastError?'Token guardado — validação pendente/falhou':
    'Token cifrado guardado neste dispositivo';
  const mismatch=syncLastStatus.state==='vault-mismatch';
  if($('#syncResolveBox')) $('#syncResolveBox').hidden=!mismatch;
  if($('#syncAdoptBtn')) $('#syncAdoptBtn').hidden=true;
  if($('#syncNowBtn')) $('#syncNowBtn').disabled=!cfg.enabled||syncBusy;
  if($('#syncHealthLocal')) $('#syncHealthLocal').textContent='Protegido neste dispositivo';
  if($('#syncHealthRemote')) $('#syncHealthRemote').textContent=
    syncLastStatus.state==='synced'?'Cofre remoto alinhado':
    mismatch?'Cofre remoto encontrado — união necessária':
    token?'Credencial pronta; a verificar remoto':'Ainda não ligado ao remoto';
  if($('#syncHealthMode')) $('#syncHealthMode').textContent=
    syncLastStatus.state==='synced'?'Automático':
    localOnly?'Só local':
    syncStatusLabel(syncLastStatus.state);
}

function setSyncActionMessage(message,type='') {
  const msg=$('#syncMessage');
  if(!msg) return;
  msg.textContent=message||'';
  msg.className=`form-message${type?` ${type}`:''}`;
}

function showSyncSetupOutcome(state,msg) {
  if(!msg) return;
  if(state==='synced'){
    msg.textContent='Sincronização confirmada: o cofre remoto foi gravado e relido com sucesso. A partir de agora funciona automaticamente.';
    msg.className='form-message success';
  }else if(state==='vault-mismatch'){
    msg.textContent='Cofre remoto encontrado. Para não perder dados, use “Unir web e telemóvel sem perder dados”.';
    msg.className='form-message error';
  }else if(state==='conflict'){
    msg.textContent='Foi detetado um conflito. Os dados foram preservados; reveja a sincronização antes de continuar.';
    msg.className='form-message error';
  }else{
    msg.textContent=syncLastStatus.message||'A sincronização ainda não foi confirmada.';
    msg.className='form-message error';
  }
}

function scheduleCredentialAutoSetup() {
  clearTimeout(syncCredentialTimer);
  const input=$('#syncToken');
  const value=String(input?.value||'').trim();
  if(value.length<20) return;
  syncCredentialTimer=setTimeout(async()=>{
    if(syncBusy) return;
    const btn=$('#syncConfigureBtn');
    const msg=$('#syncMessage');
    try{
      if(btn){btn.disabled=true;btn.textContent='A guardar e validar…';}
      if(msg){msg.textContent='A guardar a credencial cifrada neste dispositivo e a validar o acesso ao cofre privado…';msg.className='form-message';}
      const state=await configureSyncFromUi();
      showSyncSetupOutcome(state,msg);
    }catch(err){
      if(msg){
        msg.textContent=`Token guardado neste dispositivo. Validação: ${syncUserError(err,'não concluída. Verifique as permissões do token e tente “Verificar agora”.')}`;
        msg.className='form-message error';
      }
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Ligar sincronização automática';}
      renderSyncUi();
    }
  },700);
}

async function manualSyncFromUi() {
  const btn=$('#syncNowBtn');
  const tokenInput=$('#syncToken');
  const entered=String(tokenInput?.value||'').trim();

  if(!navigator.onLine){
    syncSetStatus('offline','Sem ligação. As alterações permanecem cifradas neste dispositivo.');
    setSyncActionMessage('Sem Internet neste momento. Os dados locais estão preservados e serão sincronizados quando a ligação regressar.','error');
    return;
  }

  if(entered){
    try{await storeSyncToken(entered);await saveSyncTokenStatus({valid:false,lastError:'Aguardando validação remota.'});}
    catch(err){setSyncActionMessage(syncUserError(err,'Não foi possível guardar a credencial neste dispositivo.'),'error');return;}
  }
  const stored=entered||await loadSyncToken();
  if(!stored){
    syncSetStatus('needs-token','Introduza o token GitHub deste dispositivo.');
    setSyncActionMessage('Falta a credencial deste dispositivo. Introduza o token GitHub no campo acima; depois pode tocar diretamente em “Sincronizar agora”.','error');
    tokenInput?.focus({preventScroll:true});
    tokenInput?.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  try{
    if(btn){btn.disabled=true;btn.textContent='A sincronizar…';}
    setSyncActionMessage('A verificar o cofre privado e a sincronizar alterações…');

    if(entered){
      await configureSyncFromUi();
    }else{
      await syncNow('manual');
    }

    const state=syncLastStatus.state;
    if(state==='synced'){
      setSyncActionMessage('Sincronização concluída. Web e telemóvel estão alinhados com o cofre cifrado.','success');
    }else if(state==='vault-mismatch'){
      setSyncActionMessage('Foi encontrado um cofre diferente. Use “Adotar dados sincronizados neste dispositivo” apenas se pretende usar esse cofre aqui.','error');
    }else if(state==='conflict'){
      setSyncActionMessage('Foi detetado um conflito. Os dados foram preservados; nenhuma versão foi apagada silenciosamente.','error');
    }else if(state==='offline'){
      setSyncActionMessage('Sem Internet. As alterações ficam guardadas localmente até ser possível sincronizar.','error');
    }else if(state==='error'){
      setSyncActionMessage(syncLastStatus.message||'Não foi possível sincronizar.','error');
    }else{
      setSyncActionMessage(syncLastStatus.message||'Sincronização processada.');
    }
  }catch(err){
    const message=syncUserError(err);
    syncSetStatus('error',message);
    setSyncActionMessage(message,'error');
  }finally{
    if(btn){btn.disabled=false;btn.textContent='Sincronizar agora';}
    renderSyncUi();
  }
}

function wireSyncControls() {
  if(syncControlsWired) return;
  syncControlsWired=true;
  $('#syncHeaderStatus')?.addEventListener('click',()=>showPage('security'));
    $('#syncConfigureBtn')?.addEventListener('click',async()=>{
    const msg=$('#syncMessage');
    if(msg){msg.textContent='';msg.className='form-message';}
    try{
      $('#syncConfigureBtn').disabled=true;
      const state=await configureSyncFromUi();
      showSyncSetupOutcome(state,msg);
    }catch(err){
      if(msg){msg.textContent=syncUserError(err,'Não foi possível configurar a sincronização. Os dados locais foram preservados.');msg.className='form-message error';}
    }finally{$('#syncConfigureBtn').disabled=false;renderSyncUi();}
  });
  $('#syncToken')?.addEventListener('input',scheduleCredentialAutoSetup);
  $('#syncToken')?.addEventListener('change',scheduleCredentialAutoSetup);
  $('#syncToken')?.addEventListener('paste',()=>setTimeout(scheduleCredentialAutoSetup,0));
  $('#syncToken')?.addEventListener('blur',scheduleCredentialAutoSetup);
  $('#syncNowBtn')?.addEventListener('click',manualSyncFromUi);
  $('#syncResolveBtn')?.addEventListener('click',async()=>{
    const btn=$('#syncResolveBtn');
    const pin=$('#syncResolvePin');
    const msg=$('#syncResolveMessage');
    try{
      if(!pin?.value) throw new Error('Introduza o PIN do cofre sincronizado.');
      btn.disabled=true;
      btn.textContent='A unir e alinhar…';
      if(msg){msg.textContent='A unir os dados locais e remotos sem apagar registos…';msg.className='form-message';}
      await mergeAndAdoptRemoteVault(pin.value);
    }catch(err){
      if(msg){
        msg.textContent=syncUserError(err,err?.message||'Não foi possível unir os cofres. Os dados foram preservados.');
        msg.className='form-message error';
      }
    }finally{
      if(btn){btn.disabled=false;btn.textContent='Unir dados e alinhar este dispositivo';}
      if(pin) pin.value='';
    }
  });
  $('#syncDisableBtn')?.addEventListener('click',async()=>{
    if(confirm('Desativar a sincronização automática neste dispositivo? O ficheiro cifrado remoto não será apagado.')) await disableSync();
  });
  $('#syncMergeBackupBtn')?.addEventListener('click',async()=>{
    const btn=$('#syncMergeBackupBtn');
    const msg=$('#syncMergeMessage');
    const input=$('#syncMergeBackupInput');
    const pin=$('#syncMergeBackupPin');
    if(msg){msg.textContent='';msg.className='form-message';}
    try{
      if(!input?.files?.[0]) throw new Error('Selecione o backup cifrado do outro dispositivo.');
      if(!pin?.value) throw new Error('Introduza o PIN do backup.');
      btn.disabled=true;
      btn.textContent='A juntar dados…';
      const result=await mergeEncryptedBackupFile(input.files[0],pin.value);
      pin.value='';
      input.value='';
      const added=result.addedBills+result.addedPayments+result.addedIncomes+result.addedMarket+result.addedGoals;
      if(msg){
        msg.textContent=result.conflicts
          ? `Dados unidos: ${added} registo(s) acrescentado(s), com ${result.conflicts} conflito(s) preservado(s) para revisão.`
          : `Dados unidos com segurança: ${added} registo(s) acrescentado(s). Agora ative/exporte a sincronização neste dispositivo.`;
        msg.className=result.conflicts?'form-message error':'form-message success';
      }
      if((await loadSyncToken().catch(()=>null)) && syncConfig()?.enabled) await syncNow('backup-merge');
    }catch(err){
      if(msg){
        const known=['Selecione o backup cifrado do outro dispositivo.','Introduza o PIN do backup.','PIN do backup incorreto ou backup incompatível.','Ficheiro de backup demasiado grande.','Backup em claro bloqueado.'];
        msg.textContent=known.includes(err?.message)?err.message:'Não foi possível juntar o backup. Os dados locais foram preservados.';
        msg.className='form-message error';
      }
    }finally{
      btn.disabled=false;
      btn.textContent='Juntar dados sem apagar';
    }
  });
}

function startSyncLifecycle() {
  wireSyncControls();
  renderSyncUi();
  if(!syncLifecycleInstalled){
    syncLifecycleInstalled=true;
    window.addEventListener('online',()=>syncNow('online'));
    window.addEventListener('focus',()=>syncNow('focus'));
    window.addEventListener('pageshow',()=>syncNow('pageshow'));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') syncNow('visible');});
  }
  clearInterval(syncIntervalTimer);
  syncIntervalTimer=setInterval(()=>syncNow('interval'),SYNC_INTERVAL_MS);
  setTimeout(()=>syncNow('unlock'),700);
}
