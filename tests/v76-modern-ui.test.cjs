const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('v76-modern-ui.css','utf8');
const prepare = fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const sw = fs.readFileSync('sw.js','utf8');

assert.match(css,/76-modern-ui1/);
assert.match(css,/--v76-bg:/);
assert.match(css,/--v76-surface:/);
assert.match(css,/--v76-primary:/);
assert.match(css,/--v76-radius-lg:/);
assert.match(css,/--v76-shadow-md:/);

for (const page of [
  'page-dashboard','page-bills','page-market','page-calendar','page-planning',
  'page-reports','page-goals','page-security','page-diagnostics','page-settings'
]) {
  assert.ok(css.includes(`#${page}`), `master UI must explicitly cover ${page}`);
}

assert.match(css,/\.section-tabs\{/);
assert.match(css,/\.dialog-shell\{/);
assert.match(css,/\.mobile-nav\{/);
assert.match(css,/\.nav-drawer-shell\{/);
assert.match(css,/A topbar deixa de ser fixa\/sticky/);
assert.match(css,/position:relative!important/);
assert.match(css,/\.main>\.page\{[\s\S]*padding:14px 14px calc\(102px/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/@media\(forced-colors:active\)/);

assert.doesNotMatch(css,/commit\(|saveState\(|appState|IndexedDB|PBKDF2|AES-GCM|estimatedCents|actualCents/,'master UI CSS must not contain application mutations or financial logic');

assert.match(prepare,/const MODERN_UI_REV = '76-modern-ui1'/);
assert.ok(prepare.includes("'v76-modern-ui.css'"));
assert.match(prepare,/v75-usability\.css\?v=\$\{USABILITY_REV\}[\s\S]*v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}/);
assert.ok(sw.includes("'./v76-modern-ui.css'"));
assert.match(sw,/modern-ui1/);

console.log('v76 master UI covers every application page, remains presentation-only and is included in Pages/PWA distribution.');
