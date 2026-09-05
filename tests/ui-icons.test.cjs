const assert=require('node:assert/strict');
const fs=require('node:fs');

const js=fs.readFileSync('ui-icons.js','utf8');
const css=fs.readFileSync('ui-icons.css','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const license=fs.readFileSync('LUCIDE_LICENSE.txt','utf8');

assert.match(js,/LUCIDE_SOURCE_COMMIT='94e4cb9d9db5907053ebf3636a97c45529cf776b'/,'Lucide source snapshot must be pinned and auditable');
assert.match(js,/Object\.assign\(ICONS,LUCIDE_ICONS\)/,'Lucide registry must extend the existing application registry without changing callers');
assert.match(js,/globalThis\.CDCIcons/,'shared icon renderer must remain available to contextual modules');
assert.match(js,/source:'Lucide'/);
assert.match(js,/stroke-width="2"/,'Lucide stroke weight must remain consistent');
for(const name of ['home','bill','calendar','plan','market','report','goal','shield','settings','search','eye','eyeOff','sun','moon','camera','qr','receipt','close','plus','edit','trash','filter','cloudCheck','cloudOff']){
  assert.match(js,new RegExp(`\\b${name}:`),`missing Lucide semantic icon ${name}`);
}

assert.match(js,/input\[type="search"\]/,'search controls must receive the shared Lucide search icon');
assert.match(js,/function decorateSelect/,'native select arrows must be normalized by the icon layer');
assert.match(js,/\.ui-select-control/);
assert.match(js,/TEXT_BUTTON_RULES/,'common action buttons must be iconized centrally');
assert.match(js,/\[data-delete-market\]/);
assert.match(js,/updateSyncIcon/,'sync status must use a contextual icon instead of only a generic dot');
assert.match(js,/MutationObserver/,'dynamic dialogs and rendered lists must be hydrated');
assert.doesNotMatch(js,/https?:\/\//,'runtime icon code must remain local and add no icon CDN/font dependency');
assert.doesNotMatch(js,/[⌂◉⌁☼☾×]/,'icon runtime must not depend on legacy Unicode glyphs');

assert.match(css,/\.ui-icon-svg[\s\S]*height:20px!important/,'icon height must explicitly override legacy svg height:auto');
assert.match(css,/\.market-browser-search>\.ui-icon-svg[\s\S]*height:22px!important/,'market search icon must keep a fixed Safari-safe box');
assert.match(css,/input\[type="search"\]::\-webkit-search-decoration/,'Safari native search glyph must be suppressed');
assert.match(css,/\.ui-select-control>select[\s\S]*appearance:none!important/,'platform-specific select arrows must be suppressed');
assert.match(css,/bill-new-btn\[data-ui-iconized="true"\]::before[\s\S]*content:none!important/,'legacy CSS plus must not duplicate the Lucide add icon');
assert.match(css,/\.sync-header-status \.sync-dot[\s\S]*width:18px!important/,'sync dot slot must become a proper icon slot');
assert.match(css,/\.btn\.primary\.topbar-create,[\s\S]*\.btn\.primary\.bill-new-btn\[data-ui-iconized="true"\],[\s\S]*\.btn\.primary\.market-new-btn\[data-ui-iconized="true"\][\s\S]*width:46px!important;[\s\S]*height:46px!important;[\s\S]*border-radius:14px!important;[\s\S]*linear-gradient/,'mobile add controls must share one compact rounded-square surface');
assert.match(css,/\.btn\.primary\.topbar-create>span:first-child[\s\S]*width:100%!important;[\s\S]*background:transparent!important/,'topbar add icon must use the same outer surface instead of a nested competing tile');
assert.match(css,/\.btn\.primary\.topbar-create \.ui-icon-svg,[\s\S]*\.bill-new-btn\[data-ui-iconized="true"\] \.ui-icon-svg,[\s\S]*width:20px!important;[\s\S]*color:#fff!important/,'the visible Plus must remain centered and visually restrained');
assert.match(css,/vector-effect:non-scaling-stroke/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/ui-icon-spin/);
assert.match(css,/ui-alert-pulse/);

assert.match(license,/ISC License/);
assert.match(license,/Lucide Icons and Contributors/);
assert.match(license,/The MIT License \(MIT\)/);
assert.match(license,/Cole Bemis/);
assert.match(pages,/LUCIDE_LICENSE\.txt/,'Pages distribution must include the Lucide notice');
assert.match(sw,/LUCIDE_LICENSE\.txt/,'offline/public asset allowlist must include the Lucide notice');
assert.match(sw,/conta-de-casa-public-v55-add-control/,'service worker cache must refresh after the add-control refinement');

console.log('Lucide UI icon and refined add-control tests: OK');
