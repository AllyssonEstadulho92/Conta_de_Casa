const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');

const read=path=>fs.readFileSync(path,'utf8');
const html=read('index.html');
const render=read('render.js');
const events=read('events.js');
const css=read('v76-finance-screens.css');
const build=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');
const manifest=JSON.parse(read('manifest.webmanifest'));
const appUpdate=read('app-update.js');
const icons=read('ui-icons.js');

for(const id of ['dashboardHero','dashboardQuickNav','billQuickFilters','billMonthHeading','planningMonthLabel','planningBudgetSnapshot','alertFilterTabs']){
  if(id==='dashboardQuickNav')continue;
  assert.ok(html.includes(`id="${id}"`),`${id} must exist in canonical markup`);
}
assert.match(html,/class="cdc-dashboard-shortcuts"/);
assert.match(render,/function renderPlanningBudgetSnapshot/);
assert.match(render,/function planningMonthlyResult/);
assert.match(render,/dashboardHero[\s\S]*data-money/);
assert.match(render,/const progressAttributes=hasBudget[\s\S]*aria-valuetext/);
assert.match(render,/cdc-v77-budget-ring/,'o gráfico circular mantém-se visível quando o orçamento está por definir');
assert.match(render,/visible=items\.filter/,'alert categories must filter the real calculated alerts');
assert.match(events,/\['all','unpaid','paid','overdue'\]/,'quick bill filters must validate selected values');
assert.match(events,/\['all','important','info'\]/,'notification filters must validate selected values');
assert.match(css,/@media\(max-width:380px\)/);
assert.match(css,/@media\(forced-colors:active\)/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(build,/v76-finance-screens\.css\?v=\$\{FINANCE_SCREENS_REV\}/);
assert.ok(sw.includes("'./v76-finance-screens.css'"),'offline cache must include the new screens');
assert.ok(manifest.shortcuts.every(shortcut=>!shortcut.url.includes('#market')),'retired Mercado must not remain in PWA shortcuts');
assert.match(appUpdate,/dangerZone\?\.parentElement===panel/,'settings update launcher must insert before a direct child');
assert.match(icons,/\.cdc-shortcut-icon\[data-cdc-icon\]/,'new navigation icons must use the shared Lucide hydrator');
assert.match(build,/ui-icons\.js\?v=\$\{DASHBOARD_REV\}/,'new icon hydration must invalidate old cached runtime');

const context=vm.createContext({
  console,crypto:webcrypto,TextEncoder,TextDecoder,Intl,Date,Math,Number,String,
  Map,Set,Uint8Array,Array,Object,JSON,RegExp,Error,Promise,BigInt,atob,btoa
});
vm.runInContext(read('core.js'),context);
vm.runInContext(read('finance.js'),context);
vm.runInContext(`
selectedMonth='2026-11';
appState={settings:{currency:'EUR'},months:{'2026-11':{openingBalanceCents:0,budgetCents:150000}},
 bills:[
   {id:'a',title:'Água',totalCents:3240,dueDate:'2026-11-06',recurrence:'none',cancelled:false,archived:false},
   {id:'b',title:'Renda',totalCents:65000,dueDate:'2026-11-01',recurrence:'none',cancelled:false,archived:false},
   {id:'c',title:'Telemóvel',totalCents:2499,dueDate:'2026-11-10',recurrence:'none',cancelled:false,archived:false},
   {id:'d',title:'Cancelada',totalCents:900,dueDate:'2026-11-10',recurrence:'none',cancelled:true,archived:false}
 ],
 payments:[{id:'p1',billId:'b',amountCents:65000,paidAt:'2026-11-01T12:00:00.000Z',method:'Transferência'},
           {id:'p2',billId:'c',amountCents:1000,paidAt:'2026-11-01T12:00:00.000Z',method:'Transferência'}],
 incomes:[],market:[],goals:[],activity:[]};
`,context);
const unpaid=vm.runInContext("filterBills(appState.bills,{status:'unpaid'}).map(b=>b.id)",context);
assert.deepEqual(Array.from(unpaid),['a','c'],'A pagar must include partially paid bills but exclude paid and cancelled');
const paid=vm.runInContext("filterBills(appState.bills,{status:'paid'}).map(b=>b.id)",context);
assert.deepEqual(Array.from(paid),['b']);

// 79-notifications-approved1: o filtro HTML local não admite <section>.
// Os antigos grupos com essa tag eram convertidos num único nó de texto.
vm.runInContext(read('render.js'),context);
const output={html:''};
const summary={textContent:''};
const chips=['all','important','info'].map(alertFilter=>({dataset:{alertFilter},setAttribute(name,value){this[name]=value;}}));
const tabs={dataset:{filter:'all'},querySelectorAll:()=>chips};
context.document={querySelector:selector=>({'#alertCenterList':output,'#alertCenterSummary':summary,'#alertFilterTabs':tabs})[selector]||null};
context.setHTML=(target,markup)=>{target.html=markup};
context.sampleActivity=[
  {id:'a1',text:'Atividade local registada',type:'general',at:new Date().toISOString()},
  {id:'a2',text:'Pagamento registado',type:'payment',at:'2026-10-31T20:24:00'},
  {id:'a3',text:'Fatura atualizada',type:'bill',at:'2026-10-31T20:23:00'}
];
vm.runInContext('appState.activity=sampleActivity',context);
const sample=[{id:'balance-unconfirmed',tone:'warning',title:'Saldo bancário por confirmar',description:'O saldo apresentado é uma estimativa baseada nos registos internos.',actionLabel:'Atualizar saldo',page:'planning'}];
context.alertItems=sample;
vm.runInContext('renderAlertCenter(alertItems)',context);
assert.match(summary.textContent,/1 alerta ativo · 3 atividades recentes/);
assert.doesNotMatch(output.html,/<section\b/,'no unsupported section elements may flatten the notifications into plain text');
assert.match(output.html,/class="cdc-alert-group cdc-alert-group-verificar"/);
assert.match(output.html,/class="alert-center-item warning"/);
assert.match(output.html,/Saldo bancário por confirmar/);
assert.match(output.html,/data-go="planning"/,'the verified-balance action must remain operational');
assert.match(output.html,/class="cdc-alert-recent"|class="cdc-alert-group cdc-alert-recent"/);
assert.match(output.html,/class="cdc-alert-date-group"/);
assert.match(output.html,/31 de outubro/);
assert.match(output.html,/cdc-alert-activity-time/);
assert.match(output.html,/cdc-alert-activity-payment/);
assert.match(output.html,/cdc-alert-activity-bill/);
tabs.dataset.filter='important';
vm.runInContext('renderAlertCenter(alertItems)',context);
assert.doesNotMatch(output.html,/cdc-alert-activity-payment/,'Important filter must still exclude activity');
assert.match(css,/79-notifications-approved1/);
assert.match(css,/#alertCenterDialog \.cdc-alert-activity-copy/);
assert.match(css,/#alertCenterDialog \.alert-center-item/);
assert.equal(vm.runInContext("notificationDateLabel('2026-11-02T08:24:00',new Date('2026-11-02T12:00:00'))",context),'Hoje · 02 nov.');

console.log('Ecrãs financeiros e filtros rápidos: OK');
