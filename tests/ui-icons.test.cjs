const assert=require('node:assert/strict');
const fs=require('node:fs');

const js=fs.readFileSync('ui-icons.js','utf8');
const css=fs.readFileSync('ui-icons.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=fs.readFileSync('scripts/prepare-pages.cjs','utf8');
const license=fs.readFileSync('LUCIDE_LICENSE.txt','utf8');

assert.match(js,/LUCIDE_SOURCE_COMMIT='94e4cb9d9db5907053ebf3636a97c45529cf776b'/,'Lucide source snapshot must be pinned and auditable');
assert.match(js,/Object\.assign\(ICONS,LUCIDE_ICONS\)/,'Lucide registry must extend the existing application registry without changing callers');
assert.match(js,/globalThis\.CDCIcons/,'shared icon renderer must remain available to contextual modules');
assert.match(js,/source:'Lucide'/);
assert.match(js,/stroke-width="2"/,'Lucide stroke weight must remain consistent');
for(const name of ['home','bill','calendar','plan','market','report','goal','shield','settings','search','eye','eyeOff','sun','moon','camera','qr','receipt','close','plus','edit','trash','filter','scan','cloudCheck','cloudOff']){
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

assert.match(css,/Conta de Casa v56/,'visual layer must be versioned after the secure-vault redesign');
assert.match(css,/\.ui-icon-svg[\s\S]*height:20px!important/,'icon height must explicitly override legacy svg height:auto');
assert.match(css,/\.market-browser-search>\.ui-icon-svg[\s\S]*height:22px!important/,'market search icon must keep a fixed Safari-safe box');
assert.match(css,/input\[type="search"\]::\-webkit-search-decoration/,'Safari native search glyph must be suppressed');
assert.match(css,/\.ui-select-control>select[\s\S]*appearance:none!important/,'platform-specific select arrows must be suppressed');
assert.match(css,/bill-new-btn\[data-ui-iconized="true"\]::before[\s\S]*content:none!important/,'legacy CSS plus must not duplicate the Lucide add icon');
assert.match(css,/\.sync-header-status \.sync-dot[\s\S]*width:18px!important/,'sync dot slot must become a proper icon slot');
assert.match(css,/html\.market-prototype-active \.page-heading h1::before/,'market heading must carry the shopping icon hierarchy from the approved prototype');
assert.match(css,/#page-market #newMarketBtn\[data-ui-iconized="true"\]::after/,'secondary market action must be represented as a scan control');
assert.match(css,/#page-market \.market-summary-item::before/,'market summary cards must receive semantic icon anchors');
assert.match(css,/#page-market \.market-mobile-head::before/,'market mobile cards must receive a neutral vector product avatar without inventing product imagery');
assert.match(css,/market-mobile-card:not\(\.purchased\) \.market-mobile-real\{display:none!important\}/,'pending items must not expose unnecessary real-price controls');
assert.match(css,/\.mobile-nav \.nav-btn\.active::after/,'bottom navigation must keep a consistent active underline');
assert.match(css,/market-browser \.svg-icon[\s\S]*stroke-width:2/,'legacy contextual SVGs must visually align to the Lucide metric');
assert.match(css,/vector-effect:non-scaling-stroke/);
assert.match(css,/prefers-reduced-motion:reduce/);
assert.match(css,/ui-icon-spin/);
assert.match(css,/ui-alert-pulse/);

assert.match(css,/v56 — modern secure vault/,'modern secure vault layer must be present');
assert.match(css,/\.vault-screen\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/,'vault must respect iPhone safe areas');
assert.match(css,/\.vault-card\{[\s\S]*border-radius:32px/,'vault card must use the new rounded visual hierarchy');
assert.match(css,/\.vault-key,.vault-key-spacer\{[\s\S]*width:70px/,'desktop keypad must use balanced circular controls');
assert.match(css,/\.vault-key\{[\s\S]*border-radius:50%/,'PIN keys must be circular');
assert.match(css,/@media\(max-width:820px\)[\s\S]*\.vault-key,.vault-key-spacer\{[\s\S]*width:58px/,'mobile keypad must remain compact enough for iPhone Safari');
assert.match(css,/\.vault-enter-btn\{[\s\S]*linear-gradient/,'primary unlock action must have a clear visual anchor');
assert.match(index,/class="brand brand-large vault-brand"/);
assert.match(index,/id="vaultUnlockHint"/);
assert.match(index,/aria-describedby="vaultUnlockHint"/);
assert.doesNotMatch(index,/passkey|biometria/i,'modern secure vault must retain the real PIN/password model instead of presenting unsupported biometric controls');

assert.match(license,/ISC License/);
assert.match(license,/Lucide Icons and Contributors/);
assert.match(license,/The MIT License \(MIT\)/);
assert.match(license,/Cole Bemis/);
assert.match(pages,/LUCIDE_LICENSE\.txt/,'Pages distribution must include the Lucide notice');
assert.match(sw,/LUCIDE_LICENSE\.txt/,'offline/public asset allowlist must include the Lucide notice');
assert.match(sw,/conta-de-casa-public-v58-software-update/,'service worker cache must refresh for the software update center');

console.log('Lucide UI icon and approved prototype hierarchy tests: OK');
