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
assert.match(css,/A geometria do shell móvel pertence a v76-mobile-shell\.css/);
assert.match(css,/Bottom navigation: apenas aparência; posição, dimensão e safe area pertencem ao shell/);
assert.doesNotMatch(css,/\.main>\.page\{[\s\S]*padding:14px 14px calc\(102px/,'master UI must not reserve mobile shell/dock geometry');
assert.doesNotMatch(css,/\.mobile-nav\{[\s\S]*position:fixed!important;[\s\S]*bottom:max\(8px,env\(safe-area-inset-bottom/,'master UI must not position the persistent mobile dock');
assert.doesNotMatch(css,/\.topbar,[\s\S]*min-height:76px!important;[\s\S]*padding:12px 14px!important/,'master UI must not own mobile topbar dimensions');
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.match(css,/@media\(forced-colors:active\)/);

assert.doesNotMatch(css,/commit\(|saveState\(|appState|IndexedDB|PBKDF2|AES-GCM|estimatedCents|actualCents/,'master UI CSS must not contain application mutations or financial logic');

assert.match(prepare,/const MODERN_UI_REV = '76-modern-ui1'/);
assert.ok(prepare.includes("'v76-modern-ui.css'"));
assert.match(prepare,/v75-usability\.css\?v=\$\{USABILITY_REV\}[\s\S]*v76-modern-ui\.css\?v=\$\{MODERN_UI_REV\}/);
assert.ok(sw.includes("'./v76-modern-ui.css'"));
assert.match(sw,/modern-ui1/);

console.log('v76 master UI covers every page, stays presentation-only and delegates mobile shell geometry to v76-mobile-shell.css.');
