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
      months:{'2026-10':{baseCents:12000,calculationMode:'proportional',dailyRateCents:0}},
      records:[
        {id:'r1',startDate:'2026-10-01',endDate:'2026-10-04',walksCount:6,note:''},
        {id:'r2',startDate:'2026-10-05',endDate:'2026-10-08',walksCount:4,note:''}
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
assert.equal(snapshot.outstandingCents,3097);

assert.match(core,/petshare: \{ label:'Partilha do Walli', context:'Animais', icon:'paw'/);
assert.match(core,/petShare: normalizePetShare\(s\?\.petShare\)/);
assert.match(architecture,/label:'Animais'[\s\S]*petshare','Partilha do Walli','paw'/);
assert.match(index,/id="page-petshare"/);
assert.match(index,/id="walliShareSettingsForm"/);
assert.match(index,/id="walliCareForm"/);
assert.match(source,/existing\.has\(day\)/,'overlapping care days must be rejected');
assert.match(source,/data-walli-edit/,'existing Walli care records must expose edit actions');
assert.match(source,/walksCount/,'care records must persist the manual outings count');
assert.match(source,/record\.id!==editingId/,'editing must exclude the current record from overlap detection');
assert.match(index,/id="walliCareWalks"/,'care form must expose manual outings input');
assert.match(index,/id="walliCareCancelEditBtn"/,'care form must allow cancelling edit mode');
assert.match(sync,/'pet-care':\['startDate','endDate','walksCount','note'\]/,'outings count must participate in encrypted sync conflict review');
assert.match(source,/appState\.petShare\.payments\.push/,'reimbursements must be separate records');
assert.doesNotMatch(source,/localStorage|sessionStorage/,'Walli financial data must stay inside the encrypted application state');
assert.match(sw,/\.\/walli-share\.js/);
assert.match(prepare,/'walli-share\.js'/);
assert.match(prepare,/WALLI_SHARE_REV = '76-walli-edit-walks2'/);

console.log('Walli share drawer/domain tests: OK');
