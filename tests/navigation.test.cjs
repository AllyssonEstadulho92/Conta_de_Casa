'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const core = fs.readFileSync(path.join(ROOT, 'core.js'),'utf8');
const render = fs.readFileSync(path.join(ROOT, 'render.js'),'utf8');
const forms = fs.readFileSync(path.join(ROOT, 'forms.js'),'utf8');
const events = fs.readFileSync(path.join(ROOT, 'events.js'),'utf8');
const index = fs.readFileSync(path.join(ROOT, 'index.html'),'utf8');
const sw = fs.readFileSync(path.join(ROOT, 'sw.js'),'utf8');

for (const group of ['Principal','Finanças','Compras','Análise','Sistema']) {
  assert.match(core,new RegExp(`label:'${group}'`),`navigation group ${group} must exist`);
}

assert.match(core, /calendar: \{[^}]*navParent:'bills'/);
assert.match(core, /goals: \{[^}]*navParent:'planning'/);
assert.match(core, /diagnostics: \{[^}]*navParent:'settings'/);
assert.match(core, /MOBILE_NAV_ITEMS = Object\.freeze\(\['dashboard','bills','market','reports'\]\)/);

assert.match(render, /function navigationGroupsHtml\(\)/);
assert.match(render, /setHTML\('#drawerNav',groups\)/);
assert.match(render, /setAttribute\('aria-current','page'\)/);
assert.match(render, /document\.title=`\$\{meta\.label\} · Conta de Casa`/);

assert.match(index, /aria-label="Vistas de faturas"/);
assert.match(index,/id="calendarMonthSummary"/,'calendar must expose a monthly spending summary');
assert.match(index,/id="calendarHistory"/,'calendar must expose persisted month history navigation');
assert.match(render,/function renderCalendar\(\)[\s\S]*monthNumbers\(selectedMonth\)/,'calendar must derive the selected month financial totals');
assert.match(render,/spendingForDate\(dayKey\)/,'calendar day cells must show actual spend by payment date');
assert.match(render,/monthlySpendHistory\(selectedMonth,6\)/,'calendar must expose recent monthly spend history');
assert.match(events,/function syncMonthRollover\(\)/,'runtime must detect local month rollover');
assert.match(events,/selectedMonth=nowMonth[\s\S]*monthProfile\(nowMonth\)/,'month rollover must start a fresh month profile without deleting prior records');
assert.match(events,/data-calendar-month/,'calendar history must allow switching back to saved months');
assert.match(render,/openingBalanceCents===0\?'':/,'a fresh month must show an empty opening-balance field');
assert.match(render,/budgetCents===0\?'':/,'a fresh month must show an empty monthly-budget field');
assert.match(sw,/monthly-spend-calendar1/,'PWA cache must invalidate the previous calendar runtime');
assert.match(index, /aria-label="Vistas de planeamento"/);
assert.match(index, /aria-label="Vistas de definições"/);
assert.match(index, /aria-label="Navegação completa"/);
assert.match(index, /aria-controls="mobileDrawer"/);

assert.doesNotMatch(forms, /function openMoreMenu\(/);
assert.doesNotMatch(events, /data-mobile==='more'/);
assert.doesNotMatch(events, /data-mobile==='add'/);

/* Auditoria estrutural v76: nenhuma rota declarada pode ficar sem página ou renderer. */
const metaMatch = core.match(/const PAGE_META = Object\.freeze\(\{([\s\S]*?)\n\}\);/);
assert.ok(metaMatch, 'PAGE_META must be statically discoverable for integrity audit');
const metaRoutes = [...metaMatch[1].matchAll(/^\s{2}([a-z][a-z0-9-]*):\s*\{/gm)].map(match=>match[1]).sort();
const pageRoutes = [...index.matchAll(/id="page-([a-z][a-z0-9-]*)"\s+class="page(?:\s|\")/g)].map(match=>match[1]).sort();
const renderRoutes = [...render.matchAll(/if \(page==='([a-z][a-z0-9-]*)'\) render[A-Za-z0-9_]+\(\);/g)].map(match=>match[1]).sort();

assert.deepEqual(pageRoutes, metaRoutes, 'every PAGE_META route must have exactly one page section and no orphan pages may exist');
assert.deepEqual(renderRoutes, metaRoutes, 'every PAGE_META route must have a renderPage branch and no orphan renderer route may exist');
assert.equal(new Set(pageRoutes).size, pageRoutes.length, 'page routes must be unique');

for (const [,route] of index.matchAll(/data-page="([a-z][a-z0-9-]*)"/g)) {
  assert.ok(metaRoutes.includes(route), `static data-page target must exist: ${route}`);
}
for (const [,route] of index.matchAll(/data-go="([a-z][a-z0-9-]*)"/g)) {
  assert.ok(metaRoutes.includes(route), `static data-go target must exist: ${route}`);
}

/* IDs duplicados quebram querySelector, labels, dialogs e handlers sem erro de sintaxe. */
const ids = [...index.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
const duplicateIds = [...new Set(ids.filter((id,indexOfId)=>ids.indexOf(id)!==indexOfId))];
assert.deepEqual(duplicateIds, [], `duplicate DOM ids are forbidden: ${duplicateIds.join(', ')}`);

/* O bundle real do Pages também é parte do produto: auditar o resultado, não só a fonte. */
const dist = path.join(ROOT, 'dist');
try {
  execFileSync(process.execPath, ['scripts/prepare-pages.cjs'], { cwd: ROOT, stdio: 'pipe' });
  const builtIndex = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

  assert.match(builtIndex, /<meta name="app-build" content="v76"\s*\/>/);
  assert.match(builtIndex, /<meta name="app-version" content="0\.76\.0"\s*\/>/);
  assert.match(builtIndex, /<meta name="app-build-id" content="(?:[0-9a-f]{7}|local)"\s*\/>/);
  assert.match(builtIndex, /v76-modern-ui\.css\?v=76-modern-ui2/);
  assert.match(builtIndex, /v76-product-pages\.css\?v=76-dashboard-clean1/);
  assert.match(builtIndex, /v76-mobile-shell\.css\?v=76-mobile-shell2/);
  assert.match(builtIndex, /v75-usability\.css\?v=76-auth1/);

  const builtIds = [...builtIndex.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
  const builtDuplicateIds = [...new Set(builtIds.filter((id,indexOfId)=>builtIds.indexOf(id)!==indexOfId))];
  assert.deepEqual(builtDuplicateIds, [], `built Pages HTML has duplicate ids: ${builtDuplicateIds.join(', ')}`);

  const publicRefs = [...new Set([...builtIndex.matchAll(/(?:href|src)="(\.\/[^"?#]+)(?:\?[^"#]*)?"/g)].map(match=>match[1]))];
  assert.ok(publicRefs.length > 20, 'public bundle audit must discover the application assets');
  for (const ref of publicRefs) {
    const relative = ref.slice(2);
    assert.ok(fs.existsSync(path.join(dist, relative)), `built index references missing public asset: ${ref}`);
    assert.ok(sw.includes(`'./${relative}'`), `service worker allowlist is missing public asset referenced by index: ./${relative}`);
  }

  const scripts = [...builtIndex.matchAll(/<script\s+src="\.\/[^\"]+"([^>]*)><\/script>/g)];
  assert.ok(scripts.length > 10, 'public bundle must expose the expected runtime scripts');
  for (const script of scripts) assert.match(script[1], /\bdefer\b/, 'application runtime scripts must remain deferred');

  for (const forbidden of ['README.md','SECURITY.md','PRIVACY.md','SPEC.md','CHANGELOG.md','tests','scripts','.github']) {
    assert.ok(!fs.existsSync(path.join(dist, forbidden)), `internal repository content must not be published: ${forbidden}`);
  }
} finally {
  fs.rmSync(dist, { recursive: true, force: true });
}

assert.match(sw, /fetch\(event\.request,\{cache:'no-store'\}\)/, 'PWA public assets must prefer the network before cached fallback');
assert.match(sw, /NAVIGATION_TIMEOUT_MS = 4000/);

console.log(`Information architecture and public page integrity audit: OK (${metaRoutes.length} routes, ${ids.length} unique source ids).`);
