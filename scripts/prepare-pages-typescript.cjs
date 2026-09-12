'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const GENERATED=path.join(ROOT,'dist','v76-veggie-menu.js');
const TRANSIENT_ROOT=path.join(ROOT,'v76-veggie-menu.js');
const BUILD_RUNTIME=path.join(ROOT,'scripts','build-typescript-runtime.cjs');
const PREPARE=path.join(ROOT,'scripts','prepare-pages.cjs');

if(fs.existsSync(TRANSIENT_ROOT)){
  throw new Error('v76-veggie-menu.js must not exist as committed/manual source. The runtime is generated from TypeScript.');
}

execFileSync(process.execPath,[BUILD_RUNTIME],{cwd:ROOT,stdio:'inherit'});
if(!fs.existsSync(GENERATED))throw new Error('TypeScript runtime artifact was not generated.');

// Ponte transitória: o allowlist v75 ainda copia o nome público a partir da raiz.
// Criamos esse ficheiro apenas durante o build, nunca como fonte versionada.
fs.copyFileSync(GENERATED,TRANSIENT_ROOT);
try{
  execFileSync(process.execPath,[PREPARE],{cwd:ROOT,stdio:'inherit'});
}finally{
  fs.rmSync(TRANSIENT_ROOT,{force:true});
}

const published=path.join(ROOT,'dist','v76-veggie-menu.js');
if(!fs.existsSync(published))throw new Error('Pages bundle is missing generated v76-veggie-menu.js.');

console.log('Prepared Pages with TypeScript-generated Veggie Burger runtime and no committed JavaScript source.');
