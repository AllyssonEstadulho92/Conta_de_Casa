'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');

const html=read('index.html');
const legacyMobile=read('mobile-layout.css');
const shell=read('v76-mobile-shell.css');
const modern=read('v76-modern-ui.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

// Architecture contract: feature CSS must not own the application viewport.
assert.doesNotMatch(legacyMobile,/\.app-shell\s*\{/,'mobile-layout.css must not own .app-shell geometry');
assert.doesNotMatch(legacyMobile,/\.main\s*\{/,'mobile-layout.css must not own .main geometry');
assert.doesNotMatch(legacyMobile,/\.topbar\s*\{/,'mobile-layout.css must not own .topbar geometry');
assert.doesNotMatch(legacyMobile,/\.mobile-nav\s*\{/,'mobile-layout.css must not own persistent navigation geometry');
assert.doesNotMatch(legacyMobile,/height\s*:\s*100dvh|overflow\s*:\s*hidden/i,'feature CSS must not recreate a clipped viewport');

// The visual design system may style shell elements, but must not duplicate mobile viewport geometry.
assert.match(modern,/A geometria do shell móvel pertence a v76-mobile-shell\.css/);
assert.doesNotMatch(modern,/\.main>\.page\{[\s\S]*padding:14px 14px calc\(102px/,'v76-modern-ui.css must not reserve mobile page/dock geometry');
assert.doesNotMatch(modern,/\.mobile-nav\{[\s\S]*position:fixed!important;[\s\S]*safe-area-inset-bottom/,'v76-modern-ui.css must not position the persistent mobile dock');
assert.doesNotMatch(modern,/\.topbar,[\s\S]*min-height:76px!important;[\s\S]*padding:12px 14px!important/,'v76-modern-ui.css must not own mobile topbar dimensions');
assert.doesNotMatch(modern,/@media\(max-width:390px\)\{[\s\S]*\.main>\.page\{padding-inline:11px!important\}/,'narrow viewport page gutters belong to the mobile shell');
assert.doesNotMatch(modern,/@media\(max-width:390px\)\{[\s\S]*\.mobile-nav\{left:7px!important;right:7px!important\}/,'narrow viewport dock offsets belong to the mobile shell');

// The shell is the single mobile geometry authority and accounts for device safe areas.
assert.match(shell,/--v76-shell-safe-top:[^;]*env\(safe-area-inset-top/);
assert.match(shell,/--v76-shell-safe-bottom:[^;]*env\(safe-area-inset-bottom/);
assert.match(shell,/safe-area-inset-left/);
assert.match(shell,/safe-area-inset-right/);
assert.match(shell,/\.app-shell\{[\s\S]*min-height:100dvh!important;[\s\S]*overflow:visible!important/);
assert.match(shell,/body \.main\{[\s\S]*overflow:visible!important/);
assert.match(shell,/body \.mobile-nav\{[\s\S]*position:fixed!important/);
assert.match(shell,/--v76-shell-nav-reserve:/);
assert.match(shell,/@media \(max-width:359px\)/,'320px-class viewports must have an explicit narrow-screen contract');
assert.doesNotMatch(shell,/\bzoom\s*:/i);

// The HTML must expose the full viewport while keeping user zoom available.
assert.match(html,/name="viewport" content="[^"]*width=device-width[^"]*viewport-fit=cover[^"]*"/);
assert.doesNotMatch(html,/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\.0+)?/i);

// Touch controls use a 44px mobile baseline, stricter than the WCAG 2.2 AA minimum.
assert.match(modern,/\.mobile-menu-btn,[\s\S]*#notificationsBtn\{[\s\S]*width:44px!important;[\s\S]*height:44px!important/);
assert.match(modern,/\.btn\{[\s\S]*min-height:44px!important/);

// Build order is explicit: visual system first, geometry authority last.
const modernInjection=prepare.indexOf('v76-modern-ui.css?v=${MODERN_UI_REV}');
const shellInjection=prepare.indexOf('v76-mobile-shell.css?v=${MOBILE_SHELL_REV}');
assert.ok(modernInjection>=0 && shellInjection>modernInjection,'mobile shell must load after the visual design system');

// A shell-architecture change must invalidate the installed PWA cache.
assert.match(sw,/architecture-baseline1/);
assert.ok(sw.includes("'./mobile-layout.css'"));
assert.ok(sw.includes("'./v76-mobile-shell.css'"));

console.log('UI architecture contract: single mobile shell, safe areas, reflow baseline, touch targets and PWA invalidation: OK');
