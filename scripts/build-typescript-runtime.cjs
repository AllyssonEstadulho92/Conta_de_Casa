'use strict';

const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');

const ROOT=path.resolve(__dirname,'..');
const DIST=path.join(ROOT,'dist');
const TSC=path.join(ROOT,'node_modules','typescript','bin','tsc');
const RUNTIME=path.join(DIST,'v76-veggie-menu.js');

if(!fs.existsSync(TSC)){
  throw new Error('TypeScript toolchain missing. Run npm install before building runtime artifacts.');
}

fs.mkdirSync(DIST,{recursive:true});
execFileSync(process.execPath,[TSC,'-p',path.join(ROOT,'tsconfig.runtime.json')],{
  cwd:ROOT,
  stdio:'inherit'
});

if(!fs.existsSync(RUNTIME)||!fs.statSync(RUNTIME).isFile()){
  throw new Error('TypeScript runtime build did not emit dist/v76-veggie-menu.js');
}

let runtime=fs.readFileSync(RUNTIME,'utf8');
if(!runtime.includes('installVeggieMenuToggle')){
  throw new Error('Generated Veggie Burger runtime is missing its canonical installer.');
}
if(!runtime.startsWith('"use strict";')){
  runtime=`"use strict";\n/* Runtime gerado por TypeScript a partir de src/ui/veggie-menu-toggle.ts. Não editar este artefacto. */\n${runtime}`;
  fs.writeFileSync(RUNTIME,runtime);
}

console.log('Generated TypeScript runtime: dist/v76-veggie-menu.js');
