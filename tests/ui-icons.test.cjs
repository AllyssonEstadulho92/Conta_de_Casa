const assert=require('node:assert/strict');
const fs=require('node:fs');

const js=fs.readFileSync('ui-icons.js','utf8');
const css=fs.readFileSync('ui-icons.css','utf8');

assert.match(js,/Object\.assign\(ICONS,STANDARD_ICONS\)/,'icon registry must extend the existing application registry');
assert.match(js,/globalThis\.CDCIcons/,'shared icon renderer must be exposed to contextual modules');
for(const name of ['home','bill','market','report','shield','settings','search','eye','eyeOff','sun','moon','camera','qr','receipt','close','plus']){
  assert.match(js,new RegExp(`${name}:`),`missing unified icon ${name}`);
}
assert.match(js,/\.brand-mark/);
assert.match(js,/\.dialog-close/);
assert.match(js,/#themeToggle/);
assert.match(js,/#privacyToggle/);
assert.match(js,/\.market-browser-search > \.svg-icon/);
assert.match(js,/MutationObserver/,'dynamic dialogs and market results must be hydrated');
assert.doesNotMatch(js,/https?:\/\//,'icon source must remain local and not add external font/icon dependencies');
assert.doesNotMatch(js,/innerHTML\s*=\s*[^;]*https?:/);

assert.match(css,/\.ui-icon-svg[\s\S]*height:20px!important/,'icon height must explicitly override legacy svg height:auto');
assert.match(css,/\.market-browser-search>\.ui-icon-svg[\s\S]*height:22px!important/,'market search icon must have a fixed Safari-safe box');
assert.match(css,/vector-effect:non-scaling-stroke/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/ui-sync-pulse/);
assert.match(css,/ui-alert-pulse/);

console.log('UI icon audit tests: OK');
