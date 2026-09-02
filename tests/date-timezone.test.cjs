const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const probe = `
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const context=vm.createContext({console,crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Math,Number,String,Map,Set,Uint8Array,Array,Object,JSON,RegExp,Error,Promise,BigInt,atob,btoa});
vm.runInContext(fs.readFileSync('core.js','utf8'),context);
vm.runInContext(fs.readFileSync('finance.js','utf8'),context);
vm.runInContext("appState={settings:{currency:'EUR'},payments:[]}",context);
const out=vm.runInContext("(()=>{const now=new Date(2026,8,2,12,0,0,0);const bill={id:'b',totalCents:100,dueDate:'2026-09-27',dueTime:'23:59',dueAt:composeLocalDateTimeIso('2026-09-27','23:59'),cancelled:false,archived:false};return {today:currentLocalDateKey(now),days:billDaysUntil(bill,now),text:dueText(bill,now),month:billDueDateKey(bill).slice(0,7)}})()",context);
process.stdout.write(JSON.stringify(out));
`;

for (const tz of ['UTC','Europe/Lisbon','America/Los_Angeles','Pacific/Kiritimati']) {
  const raw=execFileSync(process.execPath,['-e',probe],{cwd:process.cwd(),env:{...process.env,TZ:tz},encoding:'utf8'});
  const result=JSON.parse(raw);
  assert.equal(result.today,'2026-09-02',tz);
  assert.equal(result.days,25,tz);
  assert.equal(result.text,'25 dias para vencer',tz);
  assert.equal(result.month,'2026-09',tz);
}
console.log('Timezone-independent civil due-date tests: OK');
