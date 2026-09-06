'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const syncSource = fs.readFileSync('sync.js','utf8');
const policySource = fs.readFileSync('sync-conflict-policy.js','utf8');
new Function(policySource);

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
      version:s?.version||5,
      settings:s?.settings||{},
      months:s?.months||{},
      bills:s?.bills||[],
      payments:s?.payments||[],
      incomes:s?.incomes||[],
      market:s?.market||[],
      goals:s?.goals||[],
      activity:s?.activity||[],
      auditTrail:s?.auditTrail||[],
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

vm.runInContext(syncSource, context);
vm.runInContext(policySource, context);

const technicalOnly = vm.runInContext(`mergeAppStates(
  {
    settings:{},months:{},bills:[],payments:[],incomes:[],goals:[],activity:[],auditTrail:[],
    market:[{id:'m1',name:'Feijão Manteiga Continente',category:'Mercearia / Despensa',quantity:'1',unit:'un',estimatedCents:179,actualCents:0,purchased:false,purchasedAt:null,productCode:'5601111111111',imageUrl:'https://example.invalid/local.jpg',imageSource:'Imagem antiga',imageMatchedAt:'2026-09-06T20:00:00.000Z',createdAt:'2026-09-06T19:00:00.000Z',updatedAt:'2026-09-06T21:00:00.000Z'}]
  },
  {
    settings:{},months:{},bills:[],payments:[],incomes:[],goals:[],activity:[],auditTrail:[],
    market:[{id:'m1',name:'Feijão Manteiga Continente',category:'Mercearia / Despensa',quantity:'1',unit:'un',estimatedCents:179,actualCents:0,purchased:false,purchasedAt:null,productCode:'',imageUrl:'',imageSource:'',imageMatchedAt:null,createdAt:'2026-09-06T19:00:00.000Z',updatedAt:'2026-09-06T21:00:00.000Z'}]
  }
)`, context);

const technicalPlain = JSON.parse(JSON.stringify(technicalOnly));
assert.equal(technicalPlain.conflicts.length, 0, 'image/barcode metadata must not create a manual conflict');
assert.equal(technicalPlain.state.market.length, 1);
assert.equal(technicalPlain.state.market[0].estimatedCents, 179);

const financialDifference = vm.runInContext(`mergeAppStates(
  {settings:{},months:{},bills:[],payments:[],incomes:[],goals:[],activity:[],auditTrail:[],market:[{id:'m2',name:'Ovos',category:'Lacticínios e ovos',quantity:'1',unit:'un',estimatedCents:179,actualCents:0,purchased:false,purchasedAt:null,updatedAt:'2026-09-06T21:00:00.000Z'}]},
  {settings:{},months:{},bills:[],payments:[],incomes:[],goals:[],activity:[],auditTrail:[],market:[{id:'m2',name:'Ovos',category:'Lacticínios e ovos',quantity:'1',unit:'un',estimatedCents:229,actualCents:0,purchased:false,purchasedAt:null,updatedAt:'2026-09-06T21:00:00.000Z'}]}
)`, context);

const financialPlain = JSON.parse(JSON.stringify(financialDifference));
assert.equal(financialPlain.conflicts.length, 1, 'a real price difference must still require review');
assert.equal(financialPlain.conflicts[0].entity, 'market');

assert.ok(policySource.includes("'imageUrl'"));
assert.ok(policySource.includes("'imageSource'"));
assert.ok(policySource.includes("'imageMatchedAt'"));
assert.ok(policySource.includes("'productCode'"));
assert.doesNotMatch(policySource, /estimatedCents|actualCents|purchasedAt|quantity/);

console.log('Sync technical-conflict policy tests: OK');
