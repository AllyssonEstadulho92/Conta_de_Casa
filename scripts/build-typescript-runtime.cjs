'use strict';

const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');

const ROOT=path.resolve(__dirname,'..');
const GENERATED=path.join(ROOT,'.generated');
const SOURCE=path.join(ROOT,'src','ui','veggie-menu-toggle.ts');
const MANUAL_SOURCE=path.join(ROOT,'v76-veggie-menu.js');
const RUNTIME=path.join(GENERATED,'v76-veggie-menu.js');

if(!fs.existsSync(SOURCE)){
  throw new Error('TypeScript runtime source missing: src/ui/veggie-menu-toggle.ts');
}
if(fs.existsSync(MANUAL_SOURCE)){
  throw new Error('Manual source v76-veggie-menu.js must not exist. Runtime is generated from TypeScript; use backup/js-runtime-baseline-20260912 only as rollback reference.');
}

const source=fs.readFileSync(SOURCE,'utf8');
const result=ts.transpileModule(source,{
  fileName:'src/ui/veggie-menu-toggle.ts',
  reportDiagnostics:true,
  compilerOptions:{
    target:ts.ScriptTarget.ES2022,
    module:ts.ModuleKind.CommonJS,
    strict:true,
    alwaysStrict:true,
    removeComments:false,
    sourceMap:false,
    inlineSourceMap:false,
    inlineSources:false
  }
});

const errors=(result.diagnostics||[]).filter(diagnostic=>diagnostic.category===ts.DiagnosticCategory.Error);
if(errors.length){
  const host={
    getCanonicalFileName:fileName=>fileName,
    getCurrentDirectory:()=>ROOT,
    getNewLine:()=>String.fromCharCode(10)
  };
  throw new Error(ts.formatDiagnostics(errors,host));
}

let runtime=result.outputText;
if(!runtime.includes('installVeggieMenuToggle')){
  throw new Error('Generated Veggie Burger runtime is missing its canonical installer.');
}
if(/\brequire\s*\(|module\.exports|exports\./.test(runtime)){
  throw new Error('Generated Veggie Burger runtime must remain a standalone browser script.');
}
if(!runtime.startsWith('"use strict";'))runtime=`"use strict";\n${runtime}`;
runtime=runtime.replace('"use strict";','"use strict";\n/* Runtime gerado por TypeScript a partir de src/ui/veggie-menu-toggle.ts. Não editar este artefacto. */');

fs.mkdirSync(GENERATED,{recursive:true});
fs.writeFileSync(RUNTIME,runtime);
console.log('Generated TypeScript runtime: .generated/v76-veggie-menu.js');
