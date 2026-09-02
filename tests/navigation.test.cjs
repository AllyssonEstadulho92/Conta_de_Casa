const assert = require('node:assert/strict');
const fs = require('node:fs');

const core = fs.readFileSync('core.js','utf8');
const render = fs.readFileSync('render.js','utf8');
const forms = fs.readFileSync('forms.js','utf8');
const events = fs.readFileSync('events.js','utf8');
const index = fs.readFileSync('index.html','utf8');

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
assert.match(index, /aria-label="Vistas de planeamento"/);
assert.match(index, /aria-label="Vistas de definições"/);
assert.match(index, /aria-label="Navegação completa"/);
assert.match(index, /aria-controls="mobileDrawer"/);

assert.doesNotMatch(forms, /function openMoreMenu\(/);
assert.doesNotMatch(events, /data-mobile==='more'/);
assert.doesNotMatch(events, /data-mobile==='add'/);

console.log('Information architecture and adaptive navigation tests: OK');
