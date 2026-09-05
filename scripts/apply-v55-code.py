from pathlib import Path
import base64, gzip, subprocess, re

ROOT=Path('.')

def read(path):
    return (ROOT/path).read_text(encoding='utf-8')

def write(path,text):
    (ROOT/path).write_text(text,encoding='utf-8')

def replace(path,old,new,count=-1,required=True):
    text=read(path)
    if old not in text:
        if required:
            raise RuntimeError(f'marker not found in {path}: {old[:120]!r}')
        return False
    write(path,text.replace(old,new,count))
    return True

def replace_regex(path,pattern,repl,flags=0,required=True):
    text=read(path)
    new,n=re.subn(pattern,repl,text,flags=flags)
    if not n and required:
        raise RuntimeError(f'regex marker not found in {path}: {pattern}')
    if n: write(path,new)
    return n

def append_once(path,marker,block):
    text=read(path)
    if marker in text:
        return
    write(path,text.rstrip()+"\n\n"+block.strip()+"\n")

# 1. Apply the audited public-code patch produced from the exact deployed revision.
patch_b64=read('scripts/v55-public.patch.gz.b64').strip()
patch=gzip.decompress(base64.b64decode(patch_b64))
subprocess.run(['git','apply','--whitespace=nowarn','-'],input=patch,check=True)

# 2. Public bundle allowlist.
replace('scripts/prepare-pages.cjs',"  'ui-icons.css',\n  'invoice-capture.css',","  'ui-icons.css',\n  'app-experience.css',\n  'invoice-capture.css',")
replace('scripts/prepare-pages.cjs',"  'events.js',\n  'market-experience.js',","  'events.js',\n  'app-experience.js',\n  'market-experience.js',")

# 3. CI and Pages verification include the new presentation/gesture module and its tests.
for workflow in ['.github/workflows/ci.yml','.github/workflows/pages.yml']:
    replace(workflow,'          node --check events.js\n          node --check sync.js',
                     '          node --check events.js\n          node --check app-experience.js\n          node --check sync.js')
    replace(workflow,'          node tests/ui-icons.test.cjs\n',
                     '          node tests/ui-icons.test.cjs\n          node tests/app-experience.test.cjs\n')

# 4. Existing test suite expectations.
replace('tests/market-experience.test.cjs','assert.match(sw, /conta-de-casa-public-v54-lucide/);','assert.match(sw, /conta-de-casa-public-v55-prototype/);')
replace('tests/market-experience.test.cjs','assert.doesNotMatch(js,/Mercadona|openfoodfacts|Open Prices/i);',
'''assert.doesNotMatch(js,/Mercadona|Open Prices/i);
assert.match(js,/OFF_REFERENCE_SEARCH_URL='https:\\/\\/world\\.openfoodfacts\\.org\\/cgi\\/search\\.pl'/,'reference image lookup must use the explicit Open Food Facts search endpoint');
assert.match(js,/REFERENCE_SEARCH_MIN_INTERVAL_MS=6500/,'reference image search must be rate limited well below 10 requests/minute');
assert.match(js,/images\\.openfoodfacts\\.org/,'reference image URLs must be host-validated');
assert.match(js,/Imagem de referência/,'product images must be identified as reference images, not retailer-official images');''')
replace('tests/market-experience.test.cjs','assert.match(js, /actualCents:0,purchased:false/);',
'''assert.match(js, /actualCents:0,purchased:false/);
assert.match(js,/imageUrl:safeReferenceImageUrl/,'only validated image URLs may be persisted with a selected product');
assert.match(js,/credentials:'omit'/);
assert.match(js,/referrerPolicy:'no-referrer'/);''')

replace('tests/ui-icons.test.cjs','assert.match(sw,/conta-de-casa-public-v54-lucide/','assert.match(sw,/conta-de-casa-public-v55-prototype/')
replace('tests/ui-icons.test.cjs',"assert.match(js,/TEXT_BUTTON_RULES/,'common action buttons must be iconized centrally');",
'''assert.match(js,/TEXT_BUTTON_RULES/,'common action buttons must be iconized centrally');
assert.match(js,/\['#newMarketBtn','scan'\]/,'the contextual Market control beside search must be Scan, while the global top action remains Plus');
assert.match(js,/\[data-market-more\]/,'market overflow actions must use the same Lucide family');''')

replace('tests/responsive.test.cjs','assert.match(swSource, /conta-de-casa-public-v54-lucide/);','assert.match(swSource, /conta-de-casa-public-v55-prototype/);')
replace('tests/responsive.test.cjs','assert.match(index, /market-experience\\.css\\?v=53/);',
'''assert.match(index, /market-experience\\.css\\?v=53/);
assert.match(index, /app-experience\\.css\\?v=55/);''')
replace('tests/responsive.test.cjs','assert.match(index, /market-experience\\.js\\?v=53/);',
'''assert.match(index, /market-experience\\.js\\?v=53/);
assert.match(index, /app-experience\\.js\\?v=55/);''')

replace('tests/market-barcode.test.cjs','assert.match(js,/https:\\/\\/world\\.openfoodfacts\\.org\\/api\\/v2\\/product\\//);',
'''assert.match(js,/https:\\/\\/world\\.openfoodfacts\\.org\\/api\\/v2\\/product\\//);
assert.match(js,/image_front_small_url,image_front_url/,'barcode lookup must request the product front image when available');
assert.match(js,/images\\.openfoodfacts\\.org/,'barcode image host must be validated');
assert.match(js,/cdc:barcode-product/,'a barcode identity, including its reference image, must be handed to the market image resolver');''')

# Security allowlists: image bytes are loaded only from the dedicated OFF image host; search remains text/JSON from world.openfoodfacts.org.
replace('tests/security.test.cjs',"const appFiles = ['index.html','core.js','finance.js','render.js','forms.js','sync.js','events.js','market-experience.js','market-barcode.js','styles.css','sw.js','manifest.webmanifest'];",
"const appFiles = ['index.html','core.js','finance.js','render.js','forms.js','sync.js','events.js','app-experience.js','app-experience.css','market-experience.js','market-barcode.js','styles.css','sw.js','manifest.webmanifest'];")
replace('tests/security.test.cjs',"  'https://world.openfoodfacts.org',\n  'https://unpkg.com'",
"  'https://world.openfoodfacts.org',\n  'https://images.openfoodfacts.org',\n  'https://unpkg.com'")
replace('tests/security.test.cjs',"  ['https://world.openfoodfacts.org',new Set(['index.html','market-barcode.js'])],",
"  ['https://world.openfoodfacts.org',new Set(['index.html','market-experience.js','market-barcode.js'])],\n  ['https://images.openfoodfacts.org',new Set(['index.html','market-experience.js','market-barcode.js','app-experience.js'])],")
replace('tests/security.test.cjs',"assert.match(index, /https:\\/\\/world\\.openfoodfacts\\.org/);",
"assert.match(index, /https:\\/\\/world\\.openfoodfacts\\.org/);\nassert.match(index, /img-src 'self' data: blob: https:\\/\\/images\\.openfoodfacts\\.org/);")

# 5. Dedicated integration test: prototype hierarchy, image safety, swipe boundaries, icon audit.
app_test=r'''const assert=require('node:assert/strict');
const fs=require('node:fs');

const index=fs.readFileSync('index.html','utf8');
const js=fs.readFileSync('app-experience.js','utf8');
const css=fs.readFileSync('app-experience.css','utf8');
const market=fs.readFileSync('market-experience.js','utf8');
const barcode=fs.readFileSync('market-barcode.js','utf8');
const render=fs.readFileSync('render.js','utf8');
const core=fs.readFileSync('core.js','utf8');
const icons=fs.readFileSync('ui-icons.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pages=fs.readFileSync('scripts/prepare-pages.cjs','utf8');

assert.match(index,/app-experience\.css\?v=55/);
assert.match(index,/app-experience\.js\?v=55/);
assert.match(index,/img-src 'self' data: blob: https:\/\/images\.openfoodfacts\.org/);
for(const asset of ['app-experience.css','app-experience.js']){
  assert.ok(sw.includes(`'./${asset}'`),`${asset} must be cached for the PWA`);
  assert.ok(pages.includes(`'${asset}'`),`${asset} must be present in the Pages allowlist`);
}
assert.match(sw,/conta-de-casa-public-v55-prototype/);

assert.match(js,/MOBILE_PAGES=Object\.freeze\(\['dashboard','bills','market','reports'\]\)/,'swipe must follow exactly the four visible primary mobile destinations');
assert.match(js,/SWIPE_MIN_X=72/);
assert.match(js,/SWIPE_MAX_Y=58/);
assert.match(js,/SWIPE_MAX_MS=720/);
assert.match(js,/EDGE_GUARD=28/,'iOS browser edge gestures must retain a protected strip');
assert.match(js,/button,a,input,select,textarea,label/,'interactive controls must not trigger page navigation');
assert.match(js,/closest\?\.\('dialog\[open\]'/,'open dialogs must block global swipe navigation');
assert.match(js,/Math\.abs\(dx\)<Math\.abs\(dy\)\*1\.25/,'gesture must be clearly horizontal');
assert.match(css,/touch-action:pan-y/,'vertical scrolling must remain the primary touch gesture');
assert.match(css,/env\(safe-area-inset-left\)/);
assert.match(css,/env\(safe-area-inset-right\)/);
assert.match(css,/env\(safe-area-inset-bottom\)/);
assert.match(css,/prefers-reduced-motion:reduce/);

assert.match(icons,/\['#newMarketBtn','scan'\]/,'search-row action must be a contextual scanner, not a second plus');
assert.match(render,/market-summary-icon blue/);
assert.match(render,/market-summary-icon green/);
assert.match(render,/market-summary-icon amber/);
assert.match(render,/market-summary-icon violet/);
assert.match(render,/data-market-image-slot/,'market list cards must expose a safe lazy image slot');
assert.match(render,/data-market-more/,'mobile item actions must use an overflow menu');
assert.match(css,/market-product-thumb/);
assert.match(css,/market-card-thumb/);
assert.match(css,/market-mobile-overflow/);

assert.match(market,/OFF_REFERENCE_SEARCH_URL='https:\/\/world\.openfoodfacts\.org\/cgi\/search\.pl'/);
assert.match(market,/REFERENCE_SEARCH_MIN_INTERVAL_MS=6500/,'text image lookup must respect the Open Food Facts search rate limit');
assert.match(market,/safeReferenceImageUrl/);
assert.match(market,/hostname!=='images\.openfoodfacts\.org'/);
assert.match(market,/credentials:'omit'/);
assert.match(market,/referrerPolicy:'no-referrer'/);
assert.match(market,/Imagem de referência/,'image provenance must be explicit');
assert.match(market,/sourceLabel:'Produto oficial'/,'retailer official link remains the verification surface');
assert.match(market,/imageUrl:safeReferenceImageUrl/);
assert.match(barcode,/image_front_small_url,image_front_url/);
assert.match(barcode,/cdc:barcode-product/);
assert.match(core,/productCode: cleanString/);
assert.match(core,/imageUrl: cleanString/);
assert.match(core,/imageSource: cleanString/);

for(const file of ['index.html','render.js','forms.js','events.js','market-experience.js','market-barcode.js','invoice-capture.js']){
  const content=fs.readFileSync(file,'utf8');
  for(const glyph of ['⌂','◉','⌁','☼','☾','⌄','×']) assert.equal(content.includes(glyph),false,`${file} contains legacy visible icon glyph ${glyph}`);
}
assert.doesNotMatch(js,/localStorage|sessionStorage|IndexedDB|idbPut|commit\(|saveState\(/,'gesture/presentation layer must not persist or mutate financial storage directly');

console.log('Prototype hierarchy, product-image provenance, safe margins, swipe and runtime icon audit: OK');
'''
write('tests/app-experience.test.cjs',app_test)

print("v55 code/tests applied")
