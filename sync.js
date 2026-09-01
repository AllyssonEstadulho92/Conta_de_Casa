'use strict';

const SYNC_API_ROOT = 'https://api.github.com';
const SYNC_DEFAULT_OWNER = 'AllyssonEstadulho92';
const SYNC_DEFAULT_REPO = 'conta-de-casa-';
const SYNC_DEFAULT_PATH = 'sync/vault.json';
const SYNC_FORMAT_VERSION = 1;
const SYNC_INTERVAL_MS = 60000;
const SYNC_PUSH_DELAY_MS = 1400;

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

function syncConfig() {
  if (!appState) return null;
  appState.settings ||= {};
  appState.settings.sync ||= {
    enabled:true,
    disabledByUser:false,
    owner:SYNC_DEFAULT_OWNER,
    repo:SYNC_DEFAULT_REPO,
    path:SYNC_DEFAULT_PATH
  };
  const cfg = appState.settings.sync;
  cfg.disabledByUser = Boolean(cfg.disabledByUser);
  cfg.enabled = !cfg.disabledByUser;
  cfg.owner = cleanString(cfg.owner || SYNC_DEFAULT_OWNER, 80);
  cfg.repo = cleanString(cfg.repo || SYNC_DEFAULT_REPO, 100);
  cfg.path = cleanString(cfg.path || SYNC_DEFAULT_PATH, 180);
  return cfg;
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

async function pushLocalEncryptedVault(token,cfg,remote=null,revision=null) {
  const device=await syncDeviceMeta();
  const nextRevision=revision ?? ((remote?.revision||0)+1);
  const wrapper=await buildSyncWrapper(nextRevision,device.deviceId);
  const sha=await putRemoteSyncFile(token,cfg,wrapper,remote?.sha||null);
  await saveSyncDeviceMeta({lastRemoteSha:sha,lastRevision:nextRevision,lastSyncedAt:new Date().toISOString()});
  return {sha,revision:nextRevision};
}

async function syncNow(reason='manual') {
  if(syncBusy){syncPending=true;return;}
  syncPending=false;
  if(!vaultKey||!appState) return;
  const cfg=syncConfig();
  if(!cfg?.enabled){syncSetStatus('not-configured','Sincronização automática ainda não está ativa.');return;}
  if(!navigator.onLine){syncSetStatus('offline','Sem ligação. As alterações permanecem cifradas neste dispositivo.');return;}
  const token=await loadSyncToken();
  if(!token){syncSetStatus('needs-token','Introduza o token GitHub deste dispositivo.');return;}

  syncBusy=true;
  syncSetStatus('syncing',reason==='manual'?'Sincronização manual em curso...':'A sincronizar alterações cifradas...');
  try{
    await verifyPrivateSyncRepo(token,cfg);
    const remote=await fetchRemoteSyncFile(token,cfg);
    const localMeta=await idbGet('meta','vault');

    if(!remote){
      await pushLocalEncryptedVault(token,cfg,null,1);
      syncRemoteCandidate=null;
      syncSetStatus('synced','Cofre cifrado exportado para o repositório privado.');
      return;
    }

    if(!vaultMetaMatches(localMeta,remote.normalized.meta)){
      syncRemoteCandidate=remote;
      syncSetStatus('vault-mismatch','Existe um cofre sincronizado diferente. Pode adotá-lo neste dispositivo sem o apagar no computador.');
      return;
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
      syncSetStatus('conflict',`${merged.conflicts.length} conflito(s) preservado(s). Nenhuma versão foi apagada silenciosamente.`);
      return;
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
          syncSetStatus('conflict','O outro dispositivo alterou o cofre ao mesmo tempo. A aplicação não sobrescreveu os dados; volte a sincronizar.');
          return;
        }
        throw err;
      }
    }else{
      await saveSyncDeviceMeta({lastRemoteSha:remote.sha,lastRevision:remote.revision,lastSyncedAt:new Date().toISOString()});
    }

    syncRemoteCandidate=null;
    syncSetStatus('synced','Web e móvel estão alinhados com o cofre cifrado remoto.');
  }catch(err){
    if(err?.message==='REMOTE_VAULT_MISMATCH'){
      syncSetStatus('vault-mismatch','O cofre remoto utiliza outra chave. Adote o cofre remoto ou reveja o PIN.');
    }else if(err?.message==='SYNC_RACE'){
      syncSetStatus('conflict','Conflito de versão detetado; os dados locais foram preservados.');
    }else{
      syncSetStatus('error',safeUserError(err,'Falha de sincronização. Os dados locais foram preservados.'));
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
  if(!appState||!vaultKey) return;
  const owner=safeRepoPart($('#syncOwner')?.value,SYNC_DEFAULT_OWNER);
  const repo=safeRepoPart($('#syncRepo')?.value,SYNC_DEFAULT_REPO);
  const path=safeSyncPath($('#syncPath')?.value||SYNC_DEFAULT_PATH);
  const entered=String($('#syncToken')?.value||'').trim();
  let token=entered||await loadSyncToken();
  if(!token) throw new Error('Introduza um token GitHub de acesso ao repositório privado.');
  await verifyPrivateSyncRepo(token,{owner,repo,path});
  if(entered) await storeSyncToken(entered);
  const cfg=syncConfig();
  cfg.disabledByUser=false; cfg.enabled=true; cfg.owner=owner; cfg.repo=repo; cfg.path=path;
  syncSuppressAuto=true;
  try{await saveState();}finally{syncSuppressAuto=false;}
  if($('#syncToken')) $('#syncToken').value='';
  syncSetStatus('syncing','Configuração validada. A exportar/sincronizar o cofre cifrado...');
  await syncNow('setup');
}

async function disableSync() {
  if(!appState) return;
  const cfg=syncConfig();
  cfg.disabledByUser=true;
  cfg.enabled=false;
  syncSuppressAuto=true;
  try{await saveState();}finally{syncSuppressAuto=false;}
  await deleteDeviceRecord('sync-token').catch(()=>{});
  syncRemoteCandidate=null;
  syncSetStatus('not-configured','Sincronização automática desativada neste dispositivo.');
}

async function renderSyncUi() {
  const root=$('#syncPanel');
  if(!root||!appState) return;
  const cfg=syncConfig();
  const meta=await syncDeviceMeta().catch(()=>null);
  const token=await loadSyncToken().catch(()=>null);
  const badge=$('#syncStatusBadge');
  if(badge){
    badge.className=`status-chip ${syncStatusClass(syncLastStatus.state)}`;
    badge.textContent=syncStatusLabel(syncLastStatus.state);
  }
  const header=$('#syncHeaderStatus');
  if(header){
    const state=syncLastStatus.state;
    const localOnly=state==='not-configured'||state==='needs-token';
    const headerClass=localOnly?'paid':syncStatusClass(state);
    header.className=`sync-header-status ${headerClass}`;
    header.title=localOnly
      ? `Cofre local ativo — ${syncLastStatus.message}`
      : `${syncStatusLabel(state)} — ${syncLastStatus.message}`;
    header.setAttribute('aria-label',header.title);
    const text=header.querySelector('.sync-header-text');
    if(text) text.textContent=
      state==='synced'?'Sync':
      state==='syncing'?'...':
      state==='offline'?'Offline':
      state==='conflict'?'Conflito':
      state==='vault-mismatch'?'Rever':
      state==='error'?'Erro':'Local';
  }
  if($('#syncStatusText')) $('#syncStatusText').textContent=syncLastStatus.message;
  if($('#syncLastAt')) $('#syncLastAt').textContent=meta?.lastSyncedAt?fmtDateTime(meta.lastSyncedAt):'Ainda não sincronizado';
  if($('#syncOwner')&&!$('#syncOwner').matches(':focus')) $('#syncOwner').value=cfg.owner||SYNC_DEFAULT_OWNER;
  if($('#syncRepo')&&!$('#syncRepo').matches(':focus')) $('#syncRepo').value=cfg.repo||SYNC_DEFAULT_REPO;
  if($('#syncPath')&&!$('#syncPath').matches(':focus')) $('#syncPath').value=cfg.path||SYNC_DEFAULT_PATH;
  if($('#syncTokenState')) $('#syncTokenState').textContent=token?'Token cifrado neste dispositivo':'Token ainda não guardado';
  if($('#syncAdoptBtn')) $('#syncAdoptBtn').hidden=syncLastStatus.state!=='vault-mismatch';
  if($('#syncNowBtn')) $('#syncNowBtn').disabled=!cfg.enabled||syncBusy;
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
      await configureSyncFromUi();
      if(msg){msg.textContent='Sincronização configurada neste dispositivo.';msg.className='form-message success';}
    }catch(err){
      if(msg){msg.textContent=safeUserError(err,'Não foi possível configurar a sincronização.');msg.className='form-message error';}
    }finally{$('#syncConfigureBtn').disabled=false;renderSyncUi();}
  });
  $('#syncNowBtn')?.addEventListener('click',()=>syncNow('manual'));
  $('#syncAdoptBtn')?.addEventListener('click',async()=>{
    try{await adoptRemoteSyncedVault();}catch(err){
      const msg=$('#syncMessage');if(msg){msg.textContent=safeUserError(err,'Não foi possível adotar o cofre remoto.');msg.className='form-message error';}
    }
  });
  $('#syncDisableBtn')?.addEventListener('click',async()=>{
    if(confirm('Desativar a sincronização automática neste dispositivo? O ficheiro cifrado remoto não será apagado.')) await disableSync();
  });
}

function startSyncLifecycle() {
  wireSyncControls();
  renderSyncUi();
  if(!syncLifecycleInstalled){
    syncLifecycleInstalled=true;
    window.addEventListener('online',()=>syncNow('online'));
    window.addEventListener('focus',()=>syncNow('focus'));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') syncNow('visible');});
  }
  clearInterval(syncIntervalTimer);
  syncIntervalTimer=setInterval(()=>syncNow('interval'),SYNC_INTERVAL_MS);
  setTimeout(()=>syncNow('unlock'),700);
}
