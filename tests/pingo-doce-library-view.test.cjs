'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const source=read('pingo-doce-library-view.js');
const css=read('pingo-doce-library-view.css');
const prepare=read('scripts/prepare-pages.cjs');
const sw=read('sw.js');

assert.match(source,/75-pd-view1/);
assert.match(source,/conta-de-casa-pingo-doce-photo-library/);
assert.match(source,/PAGE_SIZE=12/);
assert.match(source,/Abrir biblioteca/);
assert.match(source,/A abrir biblioteca/);
assert.match(source,/Com fotografia/);
assert.match(source,/Pendentes/);
assert.match(source,/Sem fotografia/);
assert.match(source,/Mostrar mais/);
assert.match(source,/openCursor/);
assert.match(source,/CDCMarketImageLibrary/);
assert.match(source,/CDCPingoDocePhotoLibrary\?\.stats/);
assert.match(source,/loading='lazy'/);
assert.match(source,/role','dialog/);
assert.match(source,/aria-modal/);
assert.match(source,/Escape/);
assert.doesNotMatch(source,/\bfetch\s*\(/);
assert.doesNotMatch(source,/estimatedCents|actualCents|amountCents|appState|saveState|\bcommit\s*\(/);
assert.doesNotMatch(source,/Authorization|api[_-]?key|tokenGitHub/i);

assert.match(css,/\.pd-library-overlay/);
assert.match(css,/100dvh/);
assert.match(css,/grid-template-columns:1fr/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/pd-library-is-open/);

const sandbox={console,URL,Date,Map,Set,Promise,setTimeout,clearTimeout};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:'pingo-doce-library-view.js'});
assert.ok(sandbox.CDCPingoDoceLibraryView);
assert.equal(sandbox.CDCPingoDoceLibraryView.revision,'75-pd-view1');
assert.equal(typeof sandbox.CDCPingoDoceLibraryView.open,'function');
assert.equal(typeof sandbox.CDCPingoDoceLibraryView.close,'function');
assert.equal(typeof sandbox.CDCPingoDoceLibraryView.list,'function');

assert.match(prepare,/const PD_VIEW_REV = '75-pd-view1'/);
for(const asset of ['pingo-doce-library-view.css','pingo-doce-library-view.js'])assert.ok(prepare.includes(`'${asset}'`));
assert.match(sw,/pd-photo1-pd-view1-photo-loader3/);
for(const asset of ['./pingo-doce-library-view.css','./pingo-doce-library-view.js'])assert.ok(sw.includes(`'${asset}'`));

const dist=path.join(ROOT,'dist');
try{
  execFileSync(process.execPath,['scripts/prepare-pages.cjs'],{cwd:ROOT,stdio:'pipe'});
  const index=fs.readFileSync(path.join(dist,'index.html'),'utf8');
  assert.match(index,/pingo-doce-library-view\.css\?v=75-pd-view1/);
  assert.match(index,/pingo-doce-library-view\.js\?v=75-pd-view1/);
  assert.ok(index.indexOf('pingo-doce-photo-library.css')<index.indexOf('pingo-doce-library-view.css'));
  assert.ok(index.indexOf('pingo-doce-photo-library.js')<index.indexOf('pingo-doce-library-view.js'));
  assert.ok(index.indexOf('pingo-doce-library-view.js')<index.indexOf('market-photo-loader.js'));
  for(const asset of ['pingo-doce-library-view.css','pingo-doce-library-view.js'])assert.ok(fs.existsSync(path.join(dist,asset)));
}finally{
  fs.rmSync(dist,{recursive:true,force:true});
}

console.log('Pingo Doce library view opens from local IndexedDB, paginates and remains network/finance isolated: OK');
