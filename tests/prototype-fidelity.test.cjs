'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const read=path=>fs.readFileSync(path,'utf8');
const html=read('index.html');
const render=read('render.js');
const architecture=read('v75-architecture.js');
const css=read('v76-finance-screens.css');
const icons=read('ui-icons.js');

const navSource=/const MOBILE_NAV=Object\.freeze\(\[([\s\S]*?)\n  \]\);/.exec(architecture)?.[1];
assert.ok(navSource,'o menu inferior deve ter uma configuração canónica');
const items=[...navSource.matchAll(/\['([^']+)','([^']+)','([^']+)'\]/g)]
  .map(match=>[match[1],match[2],match[3]]);
assert.deepEqual(items,[
  ['dashboard','Início','home'],
  ['planning','Plano','navPlan'],
  ['bills','Contas','navBills'],
  ['reports','Relatórios','navReports'],
  ['settings','Mais','more']
]);
assert.match(icons,/navPlan:/);
assert.match(icons,/navBills:/);
assert.match(icons,/navReports:/);

for(const label of ['Perfil e preferências','Cofre e segurança','Exportar / Backup','Sobre a aplicação']){
  assert.ok(architecture.includes(label),`Mais deve mostrar «${label}»`);
}
assert.match(architecture,/data-v75-backup/,'o botão de backup deve estar ligado à Segurança');
assert.match(architecture,/handleBackup\(\)/);
assert.match(architecture,/data-v75-about/,'Sobre a aplicação deve abrir informação real');

const planning=html.slice(html.indexOf('<section id="page-planning"'),html.indexOf('<section id="page-market"'));
assert.ok(planning.indexOf('cdc-plan-screen-heading')<planning.indexOf('cdc-month-switch'));
assert.ok(planning.indexOf('cdc-month-switch')<planning.indexOf('planningBudgetSnapshot'));
assert.ok(planning.indexOf('planningBudgetSnapshot')<planning.indexOf('cdc-plan-upcoming-panel'));
assert.ok(planning.indexOf('cdc-plan-upcoming-panel')<planning.indexOf('cdc-plan-summary'));
assert.match(planning,/Plano Mensal/);

assert.match(render,/const hasBudget=budget>0/);
assert.match(render,/const progressAttributes=hasBudget/);
assert.match(render,/Orçamento mensal por definir/);
assert.match(render,/cdc-v77-budget-ring/,'o anel deve existir mesmo sem orçamento');
assert.match(render,/Gasto \(efetivo\)/);
assert.match(render,/Por pagar \(compromissos\)/);
assert.match(render,/Disponível/);
assert.match(architecture,/const html=planningCategoriesHtml\(entries\)/,'o render ativo não deve duplicar o cartão de orçamento');
assert.match(css,/#planningBudgetSnapshot \.cdc-v77-budget-ring/);
assert.match(css,/\.cdc-more-primary/);

let snapshotHtml='';
const sandbox={
  setHTML:(_selector,html)=>{snapshotHtml=html;},
  icon:()=>'<svg aria-hidden="true"></svg>',
  money:cents=>`${(cents/100).toFixed(2)} EUR`,
  sumCents:values=>values.reduce((sum,value)=>sum+value,0),
  clamp:(value,minimum,maximum)=>Math.max(minimum,Math.min(maximum,value))
};
vm.createContext(sandbox);
vm.runInContext(render,sandbox);
const budgetSnapshot=(budgetCents,budgetUsed,outstanding)=>{
  sandbox.n={profile:{budgetCents},budgetUsed,outstanding,marketEstimatedCount:0};
  vm.runInContext('renderPlanningBudgetSnapshot(n)',sandbox);
  return snapshotHtml;
};

const unset=budgetSnapshot(0,1200,400);
assert.match(unset,/cdc-v77-budget-ring is-unset/);
assert.match(unset,/Orçamento por definir/);
assert.match(unset,/role="img"/);
assert.doesNotMatch(unset,/Dentro do orçamento|0% comprometido/);

const within=budgetSnapshot(150000,96000,0);
assert.match(within,/64% comprometido/);
assert.match(within,/540\.00 EUR/);
assert.match(within,/Dentro do orçamento/);

const exceeded=budgetSnapshot(10000,12000,1000);
assert.match(exceeded,/130% comprometido/);
assert.match(exceeded,/aria-valuenow="100"/);
assert.match(exceeded,/Orçamento ultrapassado/);

console.log('Fidelidade ao protótipo: cinco botões, menu Mais, cartão único e estado sem orçamento: OK');
