'use strict';
// Contrato visual transversal: protege a estrutura e os controlos existentes.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('index.html','utf8');
const shell=fs.readFileSync('v76-mobile-shell.css','utf8');
const build=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=[
  'dashboard','bills','calendar','planning','petshare',
  'goals','security','diagnostics','settings'
];
for(const name of pages){
  const tag='<section id="page-'+name+'" class="page';
  const first=html.indexOf(tag);
  assert.ok(first>=0,'missing '+name);
  const next=html.indexOf('<section id="page-',first+tag.length);
  const page=html.slice(first,next<0?undefined:next);
  assert.match(page,/class="cdc-page-overview"/,'guide missing in '+name);
  assert.match(page,/class="cdc-flow"/,'steps missing in '+name);
  const guide=page.slice(page.indexOf('class="cdc-page-overview"'),page.indexOf('</ol>')+5);
  assert.equal((guide.match(/<li>/g)||[]).length,3,'three steps expected in '+name);
}
const reports=html.slice(html.indexOf('<section id="page-reports"'));
assert.match(reports,/class="cdc-flow cdc-reports-flow"/);
assert.match(html,/class="cdc-danger-zone"/);
assert.equal((html.match(/id="resetDataBtn"/g)||[]).length,1,'keep one reset button');
assert.match(html,/backup cifrado/i);
for(const id of [
  'newBillBtn','billFiltersToggle','billClearFilters',
  'calendarMonthSummary','settingsForm','securityBackupInfo','syncStatusText','reportCards',
  'debtAccountsList','debtBalanceSummary','unlockVaultBtn','quickAddBtn'
]){
  assert.match(html,new RegExp('id="'+id+'"'),'keep existing control '+id);
}
assert.match(shell,/76-linear-page-flow1/);
assert.match(shell,/html\.cdc-v75 \.cdc-page-overview/);
assert.match(shell,/html\.cdc-v75 \.cdc-flow li/);
assert.match(shell,/@media\(max-width:620px\)/);
assert.match(shell,/@media\(forced-colors:active\)/);
assert.match(shell,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(build,/const MOBILE_SHELL_REV = '76-approved-vault-nav4'/);
assert.match(build,/v76-mobile-shell\.css\?v=\$\{MOBILE_SHELL_REV\}/);
assert.match(sw,/'\.\/v76-mobile-shell\.css'/);
assert.ok(shell.indexOf('76-linear-page-flow1')<shell.indexOf('76-market-filter-visual-qa1'),
  'market filter authority must remain last');
const eventCode=fs.readFileSync('events.js','utf8');
assert.match(eventCode,/\['#billStatusFilter','#billCategoryFilter','#billDateFrom','#billDateTo','#billSort'\]/);
assert.match(html,/id="page-market" class="retired-page" hidden/);

// O Plano Mensal usa os mesmos valores e identificadores canónicos do cofre.
const planning=html.slice(html.indexOf('<section id="page-planning"'),html.indexOf('<section id="page-market"'));
for(const id of ['planningKpis','planningProjection','planningUpcomingList','monthPlanForm','accountBalance','openingBalance','monthlyBudget','accountBalanceInfo','incomeList','newIncomeBtn']){
  assert.match(planning,new RegExp('id="'+id+'"'));
}
assert.equal((planning.match(/id="monthPlanForm"/g)||[]).length,1,'one canonical plan form');
assert.match(planning,/cdc-plan-summary/);
assert.match(planning,/cdc-plan-workspace/);
assert.match(planning,/cdc-plan-upcoming-panel/);
assert.match(planning,/data-go="bills"/);
const render=fs.readFileSync('render.js','utf8');
assert.match(render,/function renderPlanningOverview\(n\)/);
assert.match(render,/function renderPlanningUpcoming\(\)/);
assert.match(render,/renderPlanningOverview\(n\);/);
assert.match(render,/renderPlanningUpcoming\(\);/);
assert.match(render,/n\.current/);
assert.match(render,/n\.incomes/);
assert.match(render,/n\.cashSpent/);
assert.match(render,/n\.outstanding/);
assert.match(render,/n\.projected/);
assert.match(render,/activeUnpaidBills\(\)/);
assert.match(render,/\.slice\(0,5\)/);
assert.match(shell,/76-planning-redesign2/);
assert.match(shell,/cdc-plan-kpis/);
assert.match(shell,/cdc-plan-projection/);
assert.match(shell,/#monthPlanForm/);
assert.match(shell,/@media\(max-width:620px\)/);
assert.match(build,/const DASHBOARD_REV = '77-clock-calendar-menu2'/);
assert.match(build,/const SERVICE_WORKER_REV = '77-clock-calendar-menu2'/);

console.log('Linear visual system on all pages: OK');
