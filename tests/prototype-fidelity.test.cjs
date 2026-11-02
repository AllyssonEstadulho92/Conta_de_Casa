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
const events=read('events.js');

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
assert.match(css,/data-v75-page="dashboard"[\s\S]*?#notificationsBtn[\s\S]*?display:none!important/,'o sino do cabeçalho deve desaparecer apenas no Início');
assert.match(css,/@media\(max-width:820px\)[\s\S]*?#mobileMenuBtn\{display:none!important\}/,'o botão de três linhas deve desaparecer no telemóvel');
assert.match(html,/id="dashboardAlertBadge"/,'o sino junto à saudação deve ter contador próprio');
assert.match(icons,/preserveBadgeIcon\(button,'alert',22\)/,'o desenho do sino não pode eliminar o contador');
assert.match(render,/#alertBadge'\),\$\('#dashboardAlertBadge'/,'os dois contadores devem receber o número de alertas');
assert.match(events,/60 \* 1000/,'a saudação deve atualizar automaticamente a cada minuto');
assert.match(events,/window\.addEventListener\('focus',syncMonthRollover\)/);
assert.match(events,/visibilitychange/);

for(const destination of ['dashboard','planning','bills','reports','calendar','petshare','security','goals','diagnostics']){
  assert.ok(architecture.includes(`['${destination}',`),`o Mais deve permitir aceder a ${destination}`);
}
assert.match(architecture,/data-v75-privacy/,'ocultar valores deve existir no Mais');
assert.match(architecture,/data-v75-lock/,'bloquear o cofre deve existir no Mais');
assert.match(architecture,/setPrivacy\(!privacyHidden\)/);
assert.match(architecture,/lockApp\('manual'\)/);

const calendar=html.slice(html.indexOf('<section id="page-calendar"'),html.indexOf('<section id="page-planning"'));
assert.match(calendar,/cdc-calendar-screen-heading/);
assert.match(calendar,/id="calendarMonthLabel"/);
assert.match(calendar,/cdc-calendar-month-switch/);
assert.match(calendar,/data-month-step="-1"/);
assert.match(calendar,/data-month-step="1"/);
assert.match(calendar,/id="calendarGrid"/);
assert.match(html,/id="calendarDayDialog"/,'o calendário deve abrir detalhes do dia');
assert.match(events,/openCalendarDay\(day\.dataset\.calendarDay\)/);
assert.match(events,/openBillDetail\(bill\.dataset\.calendarBillId\)/);
assert.match(events,/dialog\.classList\.toggle\('money-hidden',privacyHidden\)/,'o diálogo não pode expor valores ocultados');
assert.match(render,/#calendarDayDialog'\)\?\.classList\.toggle\('money-hidden',hidden\)/);
assert.match(css,/77-calendar-unified2/);

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
const greetingCases=[[0,'Boa noite'],[5,'Boa noite'],[6,'Bom dia'],[11,'Bom dia'],[12,'Boa tarde'],[19,'Boa tarde'],[20,'Boa noite'],[23,'Boa noite']];
for(const [hour,expected] of greetingCases){
  assert.equal(vm.runInContext(`greetingForHour(${hour})`,sandbox),expected,`saudação incorreta às ${hour}h`);
}
const welcome={textContent:''};
sandbox.appState={settings:{profileName:'Allysson'} ,bills:[]};
sandbox.$=selector=>selector==='#dashboardWelcomeText'?welcome:null;
vm.runInContext('updateDashboardGreeting({getHours:()=>14})',sandbox);
assert.equal(welcome.textContent,'Boa tarde, Allysson');

const calendarSlots=new Map();
const label={textContent:''};
sandbox.$=selector=>selector==='#calendarMonthLabel'?label:null;
sandbox.selectedMonth='2026-11';
sandbox.monthNumbers=()=>({cashSpent:1200,paymentTotal:1200,marketSpent:0,marketEstimatedCount:0,outstanding:800});
sandbox.monthlySpendHistory=()=>[];
sandbox.spendingForDate=()=>({paymentTotal:0,marketSpent:0,total:0});
sandbox.pad2=value=>String(value).padStart(2,'0');
sandbox.compareBillsByDue=()=>0;
sandbox.esc=value=>String(value);
sandbox.attr=value=>String(value);
sandbox.empty=()=>'<p>Vazio</p>';
sandbox.setHTML=(selector,content)=>calendarSlots.set(selector,content);
vm.runInContext('renderCalendar()',sandbox);
assert.equal(label.textContent,'Novembro de 2026');
assert.match(calendarSlots.get('#calendarGrid'),/Seg<\/div>.*Ter<\/div>.*Qua<\/div>.*Qui<\/div>/);
assert.match(calendarSlots.get('#calendarGrid'),/data-calendar-day="1"/);
assert.match(calendarSlots.get('#calendarGrid'),/aria-label="1 de novembro de 2026: sem movimentos registados"/);
assert.match(calendarSlots.get('#calendarMonthSummary'),/12\.00 EUR/,'o calendário deve usar valores financeiros reais');
sandbox.setHTML=(_selector,content)=>{snapshotHtml=content;};
const ringProperties=[];
sandbox.$=selector=>selector==='#planningBudgetSnapshot .cdc-v77-budget-ring'
  ? {style:{setProperty:(name,value)=>ringProperties.push([name,value])}}
  : null;
const allowedTags=new Set([...read('core.js').match(/const ALLOWED_TAGS = new Set\(\[([^\]]+)\]\)/)?.[1].matchAll(/'([^']+)'/g)].map(match=>match[1]));

const budgetSnapshot=(budgetCents,budgetUsed,outstanding)=>{
  sandbox.n={profile:{budgetCents},budgetUsed,outstanding,marketEstimatedCount:0};
  vm.runInContext('renderPlanningBudgetSnapshot(n)',sandbox);
  for(const match of snapshotHtml.matchAll(/<\/?([a-z][a-z0-9]*)\b/g)){
    assert.ok(allowedTags.has(match[1]),`<${match[1]}> não é aceite pelo filtro HTML do cartão Plano`);
  }
  assert.doesNotMatch(snapshotHtml,/\sstyle=/,'o filtro rejeita estilos inline no cartão do orçamento');
  assert.equal((snapshotHtml.match(/role="listitem"/g)||[]).length,3,'os três valores devem ocupar linhas próprias');
  return snapshotHtml;
};

const unset=budgetSnapshot(0,1200,400);
assert.match(unset,/cdc-v77-budget-ring is-unset/);
assert.match(unset,/Orçamento por definir/);
assert.match(unset,/role="img"/);
assert.doesNotMatch(unset,/Dentro do orçamento|0% comprometido/);
assert.deepEqual(ringProperties.at(-1),['--cdc-budget-progress','0%']);

const within=budgetSnapshot(150000,96000,0);
assert.match(within,/64% comprometido/);
assert.match(within,/540\.00 EUR/);
assert.match(within,/Dentro do orçamento/);
assert.match(within,/cdc-budget-dot spent/);
assert.match(within,/cdc-budget-dot pending/);
assert.match(within,/cdc-budget-dot remaining/);
assert.match(within,/class="cdc-budget-breakdown-value" data-money/);
assert.deepEqual(ringProperties.at(-1),['--cdc-budget-progress','64%']);

const exceeded=budgetSnapshot(10000,12000,1000);
assert.match(exceeded,/130% comprometido/);
assert.match(exceeded,/aria-valuenow="100"/);
assert.match(exceeded,/Orçamento ultrapassado/);
assert.deepEqual(ringProperties.at(-1),['--cdc-budget-progress','100%']);

console.log('Fidelidade e auditoria: cinco botões, Mais completo, notificações, saudação horária e calendário: OK');
