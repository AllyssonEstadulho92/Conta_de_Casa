'use strict';

const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');

const ROOT=path.resolve(__dirname,'..');
const GENERATED=path.join(ROOT,'.generated');

const RUNTIMES=Object.freeze([
  {
    source:'src/ui/veggie-menu-toggle.ts',
    manual:'v76-veggie-menu.js',
    output:'v76-veggie-menu.js',
    marker:'installVeggieMenuToggle',
    label:'Veggie Burger'
  },
  {
    source:'src/ui/market-branding.ts',
    manual:'market-branding.js',
    output:'market-branding.js',
    marker:'installMarketBranding',
    label:'Market branding'
  }
]);

function formatDiagnostics(diagnostics){
  const host={
    getCanonicalFileName:fileName=>fileName,
    getCurrentDirectory:()=>ROOT,
    getNewLine:()=>String.fromCharCode(10)
  };
  return ts.formatDiagnostics(diagnostics,host);
}

function buildRuntime(entry){
  const sourcePath=path.join(ROOT,entry.source);
  const manualPath=path.join(ROOT,entry.manual);
  const outputPath=path.join(GENERATED,entry.output);

  if(!fs.existsSync(sourcePath)){
    throw new Error(`TypeScript runtime source missing: ${entry.source}`);
  }
  if(fs.existsSync(manualPath)){
    throw new Error(`Manual source ${entry.manual} must not exist. Runtime is generated from TypeScript; use backup/js-runtime-baseline-20260912 only as rollback reference.`);
  }

  const source=fs.readFileSync(sourcePath,'utf8');
  const result=ts.transpileModule(source,{
    fileName:entry.source,
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
  if(errors.length)throw new Error(formatDiagnostics(errors));

  let runtime=result.outputText;
  if(!runtime.includes(entry.marker)){
    throw new Error(`Generated ${entry.label} runtime is missing canonical marker ${entry.marker}.`);
  }
  if(/\brequire\s*\(|module\.exports|exports\./.test(runtime)){
    throw new Error(`Generated ${entry.label} runtime must remain a standalone browser script.`);
  }
  if(!runtime.startsWith('"use strict";'))runtime=`"use strict";\n${runtime}`;
  runtime=runtime.replace(
    '"use strict";',
    `"use strict";\n/* Runtime gerado por TypeScript a partir de ${entry.source}. Não editar este artefacto. */`
  );

  fs.writeFileSync(outputPath,runtime);
  console.log(`Generated TypeScript runtime: .generated/${entry.output}`);
}

fs.rmSync(GENERATED,{recursive:true,force:true});
fs.mkdirSync(GENERATED,{recursive:true});
RUNTIMES.forEach(buildRuntime);
