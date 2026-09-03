const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');

const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const cap = JSON.parse(fs.readFileSync('capacitor.config.json','utf8'));
const index = fs.readFileSync('index.html','utf8');
const installJs = fs.readFileSync('mobile-install.js','utf8');
const sw = fs.readFileSync('sw.js','utf8');
const workflow = fs.readFileSync('.github/workflows/mobile-assets.yml','utf8');
const gitignore = fs.readFileSync('.gitignore','utf8');

assert.equal(pkg.private,true);
assert.equal(pkg.engines.node,'>=22');
for (const name of ['@capacitor/core','@capacitor/android','@capacitor/ios']) {
  assert.equal(pkg.dependencies[name],'8.5.1');
}
assert.equal(pkg.devDependencies['@capacitor/cli'],'8.5.1');
assert.equal(pkg.devDependencies['@capacitor/assets'],'3.0.5');

assert.equal(cap.appId,'io.github.allyssonestadulho92.contadecasa');
assert.equal(cap.appName,'Conta de Casa');
assert.equal(cap.webDir,'dist');
assert.equal(cap.loggingBehavior,'none');
assert.equal(cap.server.androidScheme,'https');
assert.equal(cap.android.allowMixedContent,false);

assert.match(index,/id="androidApkDownload"/);
assert.match(index,/id="iosIpaDownload"/);
assert.match(index,/id="installPwaBtn"/);
assert.ok(index.includes('APK/IPA usa um armazenamento local separado'));
assert.match(index,/mobile-install\.js\?v=47/);
assert.match(index,/name="app-build" content="v47"/);

assert.match(installJs,/beforeinstallprompt/);
assert.match(installJs,/releases\/latest/);
assert.match(installJs,/\.apk\$\/i/);
assert.match(installJs,/\.ipa\$\/i/);
assert.doesNotMatch(installJs,/appState|vaultKey|indexedDB|localStorage|sessionStorage/);

assert.match(sw,/conta-de-casa-public-v47/);
assert.match(sw,/'\.\/mobile-install\.js'/);

assert.match(workflow,/Conta-de-Casa-Android-verification\.apk/);
assert.match(workflow,/CODE_SIGNING_ALLOWED=NO build/);
assert.match(workflow,/ANDROID_KEYSTORE_BASE64/);
assert.match(workflow,/ANDROID_KEY_ALIAS/);
assert.match(workflow,/ANDROID_KEYSTORE_PASSWORD/);
assert.match(workflow,/ANDROID_KEY_PASSWORD/);
assert.match(workflow,/apksigner.*verify/);
assert.match(workflow,/gh release upload/);
assert.match(workflow,/if: \$\{\{ github\.event_name == 'workflow_dispatch' \|\| \(github\.event_name == 'workflow_run'/);
assert.doesNotMatch(workflow,/gh release upload[\s\S]*pull_request/);

for (const pattern of ['*.jks','*.keystore','*.p12','*.mobileprovision','android/','ios/','dist/']) {
  assert.ok(gitignore.includes(pattern),pattern);
}

execFileSync(process.execPath,['scripts/prepare-mobile.cjs'],{stdio:'pipe'});
const expected = [
  'index.html','styles.css','design-system.css','core.js','finance.js','render.js',
  'forms.js','sync.js','events.js','mobile-install.js','sw.js','manifest.webmanifest','icon.svg'
].sort();
assert.deepEqual(fs.readdirSync('dist').sort(),expected);
for (const forbidden of ['README.md','SECURITY.md','PRIVACY.md','.github','tests','node_modules']) {
  assert.equal(fs.existsSync('dist/'+forbidden),false,forbidden);
}
fs.rmSync('dist',{recursive:true,force:true});

console.log('Mobile packaging, download UI and signing safety tests: OK');
