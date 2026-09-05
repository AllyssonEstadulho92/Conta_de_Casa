'use strict';
const fs=require('node:fs');

function update(path,fn){
  const before=fs.readFileSync(path,'utf8');
  const after=fn(before);
  if(after===before) throw new Error(`Nenhuma alteração aplicada em ${path}`);
  fs.writeFileSync(path,after);
}

update('tests/market-experience.test.cjs',source=>source
  .replace("assert.doesNotMatch(js,/Mercadona|openfoodfacts|Open Prices/i);","assert.doesNotMatch(js,/Mercadona|Open Prices/i);\nassert.match(js,/https:\\/\\/world\\.openfoodfacts\\.org\\/cgi\\/search\\.pl/,'Open Food Facts is allowed only as the product-image reference lookup');")
  .replace("assert.ok(js.includes(\"a pesquisa é enviada apenas à fonte necessária\"), 'remote-search privacy disclosure must be visible');","assert.ok(js.includes(\"fotografia real de referência\") && js.includes(\"Open Food Facts\"), 'remote image-source privacy disclosure must be visible');")
);

update('tests/security.test.cjs',source=>source
  .replace("  'https://world.openfoodfacts.org',\n  'https://unpkg.com'","  'https://world.openfoodfacts.org',\n  'https://images.openfoodfacts.org',\n  'https://unpkg.com'")
  .replace("['https://world.openfoodfacts.org',new Set(['index.html','market-barcode.js'])]","['https://world.openfoodfacts.org',new Set(['index.html','market-experience.js','market-barcode.js'])]")
  .replace("  ['https://unpkg.com',new Set(['index.html','market-barcode.js'])]","  ['https://images.openfoodfacts.org',new Set(['index.html'])],\n  ['https://unpkg.com',new Set(['index.html','market-barcode.js'])]")
  .replace("assert.match(index, /https:\\/\\/world\\.openfoodfacts\\.org/);","assert.match(index, /https:\\/\\/world\\.openfoodfacts\\.org/);\nassert.match(index, /img-src 'self' data: blob: https:\\/\\/images\\.openfoodfacts\\.org;/);")
);

update('market-experience.js',source=>source.replace(' * Nenhum preço fictício ou imagem de produto é usado nesta camada.',' * Nenhum preço fictício é usado; fotografias reais de referência são opcionais e validadas separadamente.'));

console.log('Testes e política de origens v57 alinhados.');
