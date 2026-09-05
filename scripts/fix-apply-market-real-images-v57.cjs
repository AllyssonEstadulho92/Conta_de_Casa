'use strict';
const fs=require('node:fs');
const path='scripts/apply-market-real-images-v57.cjs';
let source=fs.readFileSync(path,'utf8');
source=source.replaceAll('conta-de-casa-public-v55-prototype','conta-de-casa-public-v56-vault-modern');
// O destino final continua v57: apenas o padrão de origem foi atualizado acima.
source=source.replace("const CACHE = 'conta-de-casa-public-v56-vault-modern';\",\"const CACHE = 'conta-de-casa-public-v56-vault-modern';","const CACHE = 'conta-de-casa-public-v56-vault-modern';\",\"const CACHE = 'conta-de-casa-public-v57-real-images';");
source=source.replace("source.includes('conta-de-casa-public-v56-vault-modern'))write(path,source.replaceAll('conta-de-casa-public-v56-vault-modern','conta-de-casa-public-v56-vault-modern'))","source.includes('conta-de-casa-public-v56-vault-modern'))write(path,source.replaceAll('conta-de-casa-public-v56-vault-modern','conta-de-casa-public-v57-real-images'))");
fs.writeFileSync(path,source);
console.log('Patch v57 alinhado ao namespace de cache v56.');
