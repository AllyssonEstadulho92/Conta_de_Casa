'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('walli-share.js','utf8');
const core = fs.readFileSync('core.js','utf8');
const architecture = fs.readFileSync('v75-architecture.js','utf8');
const index = fs.readFileSync('index.html','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sync = fs.readFileSync('sync.js','utf8');

function cleanDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!match) return '';
  const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);
  const date=new Date(Date.UTC(y,m-1,d));
  return date.getUTCFullYear()===y&&date.getUTCMonth()===m-1&&date.getUTCDate()===d
    ? `${match[1]}-${match[2]}-${match[3]}`
    : '';
}
function civilDayDiff(a,b) {
  const pa=cleanDateKey(a),pb=cleanDateKey(b);
  if(!pa||!pb)return NaN;
  return Math.trunc((Date.parse(pb+'T00:00:00Z')-Date.parse(pa+'T00:00:00Z'))/86400000);
}
function addCivilDays(key,days) {
  const clean=cleanDateKey(key);
  if(!clean)return '';
  const date=new Date(Date.parse(clean+'T00:00:00Z')+days*86400000);
  return date.toISOString().slice(0,10);
}

const context = vm.createContext({
  window:{},
  appState:{
    petShare:{
      petName:'Walli',
      caregiverName:'Nuno',
      months:{'2026-10':{baseCents:12000,calculationMode:'proportional',dailyRateCents:0,walksPerDay:1,walkRateCents:800}},
      records:[
        {id:'r1',startDate:'2026-10-01',endDate:'2026-10-04',note:''},
        {id:'r2',startDate:'2026-10-05',endDate:'2026-10-08',note:''}
      ],
      payments:[]
    }
  },
  selectedMonth:'2026-10',
  MAX_MONEY_CENTS:1000000000000,
  cleanDateKey,
  civilDayDiff,
  addCivilDays,
  sumCents:values=>values.reduce((sum,value)=>sum+Number(value||0),0),
  Date,
  Intl,
  Math,
  Number,
  String,
  Boolean,
  BigInt,
  Set,
  Map,
  Array,
  Object,
  JSON
});
vm.runInContext(source,context);

assert.equal(context.window.walliShareTargetCents({baseCents:12000,calculationMode:'proportional',dailyRateCents:0},8,31),3097);
assert.equal(context.window.walliShareTargetCents({baseCents:12000,calculationMode:'proportional',dailyRateCents:0},8,30),3200);
assert.equal(context.window.walliShareTargetCents({baseCents:12000,calculationMode:'daily-fixed',dailyRateCents:400},8,31),3200);
assert.deepEqual(Array.from(context.window.walliShareRangeDays('2026-10-30','2026-11-02')),['2026-10-30','2026-10-31','2026-11-01','2026-11-02']);

const snapshot=context.window.walliShareSnapshot('2026-10');
assert.equal(snapshot.daysInMonth,31);
assert.equal(snapshot.careDays.length,8);
assert.equal(snapshot.shareCents,3097);
assert.equal(snapshot.ownerShareCents,8903);
assert.equal(snapshot.walkCount,8);
assert.equal(snapshot.walksCostCents,6400);
assert.equal(snapshot.totalPayableCents,9497);
assert.equal(snapshot.outstandingCents,9497);
assert.equal(context.window.walliShareWalkCostCents(800,8),6400);
assert.equal(context.window.walliShareWalkCostCents(800,16),12800);

context.appState.petShare.months['2026-10'].walksPerDay=2;
const twiceDaily=context.window.walliShareSnapshot('2026-10');
assert.equal(twiceDaily.walkCount,16);
assert.equal(twiceDaily.walksCostCents,12800);
assert.equal(twiceDaily.totalPayableCents,15897);

context.appState.petShare.payments.push({id:'legacy',monthKey:'2026-10',amountCents:1000,paidAt:'2026-10-10T12:00:00Z'});
const withLegacyReceived=context.window.walliShareSnapshot('2026-10');
assert.equal(withLegacyReceived.legacyReceivedCents,1000);
assert.equal(withLegacyReceived.paidCents,0);
assert.equal(withLegacyReceived.outstandingCents,15897);

context.appState.petShare.payments.push({id:'outbound',monthKey:'2026-10',direction:'outbound',amountCents:5000,paidAt:'2026-10-11T12:00:00Z'});
const partiallyPaid=context.window.walliShareSnapshot('2026-10');
assert.equal(partiallyPaid.paidCents,5000);
assert.equal(partiallyPaid.outstandingCents,10897);

assert.deepEqual(Array.from(context.window.walliShareSplitPaymentCents(9497,2)),[4749,4748]);
assert.deepEqual(Array.from(context.window.walliShareSplitPaymentCents(9497,3)),[3166,3166,3165]);
assert.deepEqual(Array.from(context.window.walliShareSplitPaymentCents(9497,4)),[2375,2374,2374,2374]);
assert.equal(Array.from(context.window.walliShareSplitPaymentCents(9497,3)).reduce((sum,value)=>sum+value,0),9497);

assert.match(core,/petshare: \{ label:'Partilha do Walli', context:'Animais', icon:'paw'/);
assert.match(core,/petShare: normalizePetShare\(s\?\.petShare\)/);
assert.match(architecture,/label:'Animais'[\s\S]*petshare','Partilha do Walli','paw'/);
assert.match(index,/id="page-petshare"/);
assert.match(index,/id="walliShareSettingsForm"/);
assert.match(index,/id="walliCareForm"/);
assert.match(source,/existing\.has\(day\)/,'overlapping care days must be rejected');
assert.match(source,/data-walli-edit/,'existing Walli care records must expose edit actions');
assert.match(source,/record\.id!==editingId/,'editing must exclude the current record from overlap detection');
assert.match(source,/totalPayableCents/,'the final payable amount must combine the base share and automatic walks');
assert.match(source,/Por pagar ao/,'the payment direction must be explicit');
assert.match(source,/data-walli-split-count/,'outstanding payments must expose automatic split options');
assert.match(source,/data-walli-partial/,'the user must be able to register only the current part');
assert.match(source,/function splitPaymentCents/,'partial payments must use one integer-cent split function');
assert.match(source,/Pagamento parcial da partilha e passeios do Walli/,'partial payments must remain auditable in payment history');
assert.match(source,/walli-total-card/,'the final payable amount must be the primary visual metric');
assert.match(source,/walli-record-meta/,'records must expose scannable day and walk metadata');
assert.match(source,/walli-auto-values/,'automatic walk preview must separate count and cost');
assert.doesNotMatch(index,/id="walliCareWalks"/,'care form must not require manual outing counts');
assert.match(index,/id="walliCareAutoWalks"/,'care form must show the automatic walk preview');
assert.match(index,/class="walli-share-hero"/,'Walli page must expose a dedicated visual hero');
assert.match(index,/class="walli-overview"/,'monthly summary must have an explicit overview hierarchy');
assert.match(index,/class="walli-lower-grid"/,'calendar and records must share an organized responsive region');
assert.match(index,/id="walliWalksPerDay"/,'settings must allow one or two walks per day');
assert.match(index,/id="walliWalkRate"/,'settings must expose an editable price per walk');
assert.match(index,/id="walliCareCancelEditBtn"/,'care form must allow cancelling edit mode');
assert.match(sync,/'pet-share-month':\['baseCents','calculationMode','dailyRateCents','walksPerDay','walkRateCents'\]/,'walk frequency and rate must participate in encrypted sync conflict review');
assert.match(source,/appState\.petShare\.payments\.push/,'reimbursements must be separate records');
assert.doesNotMatch(source,/localStorage|sessionStorage/,'Walli financial data must stay inside the encrypted application state');
assert.match(sw,/\.\/walli-share\.js/);
assert.match(prepare,/'walli-share\.js'/);
assert.match(prepare,/WALLI_SHARE_REV = '76-walli-partial-pay5'/);

console.log('Walli share drawer/domain tests: OK');
