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
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  navigator:{onLine:true}
});

vm.runInContext(fs.readFileSync('core.js','utf8'),context);
vm.runInContext(fs.readFileSync('finance.js','utf8'),context);
vm.runInContext(fs.readFileSync('sync.js','utf8'),context);

(async()=>{
  const result=await vm.runInContext(`(async()=>{
    renderSyncUi=async()=>{};
    renderCurrentPage=()=>{};
    saveSyncTokenStatus=async()=>({});
    saveSyncDeviceMeta=async patch=>patch;
    loadSyncToken=async()=> 'github-token-placeholder-long-enough';
    verifyPrivateSyncRepo=async()=>true;
    saveState=async()=>{appState=ensureStateShape(appState);};

    const remoteMeta={salt:'same-salt',checkIv:'same-iv',checkCipher:'same-check'};
    idbGet=async(store,key)=>store==='meta'&&key==='vault'?remoteMeta:null;
    vaultKey=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);

    const base={
      version:3,
      settings:{currency:'EUR',sync:{enabled:true,disabledByUser:false}},
      months:{},
      bills:[{id:'b1',title:'Luz',provider:'Energia',category:'Casa',totalCents:5000,dueDate:'2026-09-20',dueTime:'23:59',method:'Transferência',createdAt:'2026-09-01T10:00:00.000Z',updatedAt:'2026-09-01T10:00:00.000Z'}],
      payments:[],incomes:[],market:[],goals:[],activity:[],security:{},syncTombstones:[],syncConflicts:[]
    };

    const encryptedBase=await encryptBytes(vaultKey,enc.encode(JSON.stringify(base)));
    const compatibleRemote={sha:'sha-20',revision:20,normalized:{meta:remoteMeta,secure:{...encryptedBase}}};
    appState=ensureStateShape(base);
    fetchRemoteSyncFile=async()=>compatibleRemote;
    let pushes=0;
    pushLocalEncryptedVault=async()=>{pushes+=1;};
    const compatibleResult=await syncNow('runtime-compatible');

    const at='2026-09-02T10:00:00.000Z';
    const localState=ensureStateShape({...base,payments:[{id:'p1',billId:'b1',amountCents:1000,paidAt:at,method:'Cartão',createdAt:at,updatedAt:at}]});
    const remoteState=ensureStateShape({...base,payments:[{id:'p1',billId:'b1',amountCents:2500,paidAt:at,method:'Cartão',createdAt:at,updatedAt:at}]});
    const encryptedConflict=await encryptBytes(vaultKey,enc.encode(JSON.stringify(remoteState)));
    const conflictRemote={sha:'sha-21',revision:21,normalized:{meta:remoteMeta,secure:{...encryptedConflict}}};
    appState=localState;
    fetchRemoteSyncFile=async()=>conflictRemote;
    let pushedAmount=null;
    let pushedRevision=null;
    pushLocalEncryptedVault=async(_token,_cfg,_remote,revision)=>{
      pushes+=1;
      pushedAmount=appState.payments.find(item=>item.id==='p1')?.amountCents;
      pushedRevision=revision;
      return {sha:'sha-22',revision};
    };
    const conflictResult=await syncNow('runtime-conflict');
    const beforeDecisionPushes=pushes;
    const preservedLocal=appState.syncConflicts[0]?.local?.amountCents;
    const resolutionResult=await resolveSyncConflictFromUi(0,'remote');
    const statusAfterResolution=syncLastStatus.state;
    const resolvedState=syncClone(appState);
    const secondDeviceMerge=mergeAppStates(localState,resolvedState);
    const secondDeviceAmount=secondDeviceMerge.state.payments.find(item=>item.id==='p1')?.amountCents;
    const secondDeviceResolutionMarker=secondDeviceMerge.state.payments.find(item=>item.id==='p1')?.syncResolvedAt;

    syncRemoteCandidate=conflictRemote;
    fetchRemoteSyncFile=async()=>({...conflictRemote,sha:'sha-changed-by-other-device',revision:22});
    const pushesBeforeRace=pushes;
    const raceResult=await finishSyncConflictResolution();

    return {
      compatibleResult,
      conflictResult,
      resolutionResult,
      pushesBeforeConflict:beforeDecisionPushes,
      pushesAfterResolution:pushes,
      pushedAmount,
      pushedRevision,
      preservedLocal,
      statusAfterResolution,
      secondDeviceConflicts:secondDeviceMerge.conflicts.length,
      secondDeviceAmount,
      secondDeviceResolutionMarker,
      raceResult,
      raceWasBlocked:pushes===pushesBeforeRace,
      finalStatus:syncLastStatus.state
    };
  })()`,context);

  assert.equal(result.compatibleResult,'synced','a v33 state must migrate and sync without conflict');
  assert.equal(result.pushesBeforeConflict,0,'compatible migration must not write unnecessarily');
  assert.equal(result.conflictResult,'conflict','a true financial difference must pause for review');
  assert.equal(result.preservedLocal,1000,'the unselected local value must remain in encrypted conflict history');
  assert.equal(result.resolutionResult,'synced','an explicit choice must complete synchronization');
  assert.equal(result.pushesAfterResolution,1,'only the confirmed result may be uploaded');
  assert.equal(result.pushedAmount,2500,'the selected remote value must become authoritative');
  assert.equal(result.pushedRevision,22,'the confirmed upload must advance the remote revision');
  assert.equal(result.statusAfterResolution,'synced');
  assert.equal(result.secondDeviceConflicts,0,'the second device must accept an already confirmed resolution');
  assert.equal(result.secondDeviceAmount,2500,'the second device must converge to the confirmed financial value');
  assert.equal(typeof result.secondDeviceResolutionMarker,'string','the encrypted state must preserve the technical resolution marker');
  assert.equal(result.raceResult,'conflict','a stale review must be rejected after a concurrent remote write');
  assert.equal(result.raceWasBlocked,true,'a stale decision must never overwrite the newer remote vault');
  assert.equal(result.finalStatus,'conflict');

  console.log('End-to-end sync migration and conflict resolution tests: OK');
})().catch(err=>{
  console.error(err);
  process.exitCode=1;
});
