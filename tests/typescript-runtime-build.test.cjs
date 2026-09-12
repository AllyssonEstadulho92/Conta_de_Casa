'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const generatedPath=path.join(ROOT,'.generated','v76-veggie-menu.js');
const publicPath=path.join(ROOT,'dist','v76-veggie-menu.js');
const manualPath=path.join(ROOT,'v76-veggie-menu.js');

assert.ok(fs.existsSync(path.join(ROOT,'src','ui','veggie-menu-toggle.ts')),'TypeScript source must exist');
assert.ok(!fs.existsSync(manualPath),'manual JavaScript source must be absent');

execFileSync(process.execPath,['scripts/build-typescript-runtime.cjs'],{cwd:ROOT,stdio:'pipe'});
assert.ok(fs.existsSync(generatedPath),'TypeScript build must emit .generated/v76-veggie-menu.js');
const generated=fs.readFileSync(generatedPath,'utf8');
assert.match(generated,/Runtime gerado por TypeScript/);
assert.match(generated,/installVeggieMenuToggle/);
assert.match(generated,/glyph\.append\(upperLine, lowerLine\)/);
assert.match(generated,/drawer\.insertBefore\(button, drawerShell\)/);
assert.match(generated,/upperLine\.animate/);
assert.match(generated,/lowerLine\.animate/);
assert.doesNotMatch(generated,/commit\(|saveState\(|appState|estimatedCents|actualCents/);
assert.doesNotThrow(()=>new vm.Script(generated),'generated runtime must parse as a classic browser script');

execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
assert.ok(fs.existsSync(publicPath),'Pages bundle must contain the generated public JavaScript artifact');
assert.ok(!fs.existsSync(manualPath),'Pages preparation must not recreate JavaScript source in repository root');
const published=fs.readFileSync(publicPath,'utf8');
assert.equal(published,generated,'published Veggie Burger artifact must be exactly the TypeScript-generated runtime');

fs.rmSync(path.join(ROOT,'dist'),{recursive:true,force:true});
console.log('TypeScript runtime build: source-only TS -> generated JS artifact -> Pages bundle, with no committed JS source.');
