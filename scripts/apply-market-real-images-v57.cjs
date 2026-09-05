'use strict';

const fs=require('node:fs');

function read(path){return fs.readFileSync(path,'utf8');}
function write(path,text){fs.writeFileSync(path,text);}
function replaceOnce(path,from,to,label){
  const source=read(path);
  if(!source.includes(from)) throw new Error(`${label}: padrão não encontrado em ${path}`);
  write(path,source.replace(from,to));
}
function append(path,text){
  const source=read(path);
  if(source.includes(text.trim().split('\n')[0])) return;
  write(path,`${source.trimEnd()}\n\n${text.trim()}\n`);
}

// CSP: apenas a CDN de imagens do Open Food Facts é autorizada para imagens reais.
replaceOnce(
  'index.html',
  "img-src 'self' data: blob:; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  "img-src 'self' data: blob: https://images.openfoodfacts.org; connect-src 'self' https://api.github.com https://cesta.pt https://world.openfoodfacts.org;",
  'CSP de imagens'
);

// Estado: metadados opcionais e validados da fotografia real do produto.
replaceOnce(
  'core.js',
  "function cleanMultiline(value, max = 1200) {\n  return String(value ?? '').replace(/[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]/g, ' ').trim().slice(0, max);\n}",
  "function cleanMultiline(value, max = 1200) {\n  return String(value ?? '').replace(/[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]/g, ' ').trim().slice(0, max);\n}\nfunction safeProductImageUrl(value) {\n  if (!value) return '';\n  try {\n    const url = new URL(String(value));\n    if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'images.openfoodfacts.org') return '';\n    return url.href.slice(0, 700);\n  } catch (_error) { return ''; }\n}",
  'validador de imagem'
);

replaceOnce(
  'core.js',
  "    purchased: Boolean(i.purchased),\n    createdAt: cleanIso(i.createdAt, now),",
  "    purchased: Boolean(i.purchased),\n    productCode: cleanString(i.productCode, 32),\n    imageUrl: safeProductImageUrl(i.imageUrl),\n    imageSource: cleanString(i.imageSource, 60),\n    imageMatchedAt: optionalIso(i.imageMatchedAt),\n    createdAt: cleanIso(i.createdAt, now),",
  'normalização de imagem no Mercado'
);

replaceOnce(
  'core.js',
  "const ALLOWED_TAGS = new Set(['article','br','button','circle','datalist','div','em','form','h2','h3','input','label','option','p','path','rect','select','small','span','strong','svg','textarea']);\nconst ALLOWED_ATTRS = new Set(['accept','aria-hidden','aria-label','checked','class','d','disabled','fill','height','hidden','id','inputmode','list','max','maxlength','method','min','minlength','name','placeholder','r','required','role','rx','selected','stroke','stroke-linecap','stroke-linejoin','stroke-width','title','type','value','viewbox','width','x','y']);",
  "const ALLOWED_TAGS = new Set(['article','br','button','circle','datalist','div','em','form','h2','h3','img','input','label','option','p','path','rect','select','small','span','strong','svg','textarea']);\nconst ALLOWED_ATTRS = new Set(['accept','alt','aria-hidden','aria-label','checked','class','d','decoding','disabled','fill','height','hidden','id','inputmode','list','loading','max','maxlength','method','min','minlength','name','placeholder','r','referrerpolicy','required','role','rx','selected','src','stroke','stroke-linecap','stroke-linejoin','stroke-width','title','type','value','viewbox','width','x','y']);",
  'sanitizador de img'
);

replaceOnce(
  'core.js',
  "      for (const a of [...node.attributes]) {\n        const name = a.name.toLowerCase();\n        const value = a.value || '';\n        const allowed = ALLOWED_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('aria-');\n        if (!allowed || name.startsWith('on') || /javascript:/i.test(value)) node.removeAttribute(a.name);\n      }",
  "      for (const a of [...node.attributes]) {\n        const name = a.name.toLowerCase();\n        const value = a.value || '';\n        const allowed = ALLOWED_ATTRS.has(name) || name.startsWith('data-') || name.startsWith('aria-');\n        if (!allowed || name.startsWith('on') || /javascript:/i.test(value)) node.removeAttribute(a.name);\n      }\n      if (tag === 'img' && !safeProductImageUrl(node.getAttribute('src'))) node.removeAttribute('src');",
  'validação src de img'
);

// Pesquisa: imagem real de referência do Open Food Facts, sem inventar fotografia.
replaceOnce(
  'market-experience.js',
  "  const CESTA_MCP_URL='https://cesta.pt/mcp';\n  const SEARCH_DEBOUNCE_MS=450;",
  "  const CESTA_MCP_URL='https://cesta.pt/mcp';\n  const OFF_IMAGE_SEARCH_URL='https://world.openfoodfacts.org/cgi/search.pl';\n  const SEARCH_DEBOUNCE_MS=450;",
  'endpoint de imagens'
);

replaceOnce(
  'market-experience.js',
  "  function resultStatusHtml(product){",
  `  function tokenSet(value){
    return new Set(normalized(value).split(/[^a-z0-9]+/).filter(token=>token.length>1));
  }

  function imageCandidateScore(product,candidate){
    const wanted=tokenSet(\`${'${product.name} ${product.pack||\'\'}'}\`);
    const offered=tokenSet(\`${'${candidate.name} ${candidate.brands||\'\'} ${candidate.quantity||\'\'}'}\`);
    if(!wanted.size||!offered.size)return 0;
    let common=0;
    wanted.forEach(token=>{if(offered.has(token))common+=1;});
    let score=common/Math.max(1,Math.min(wanted.size,offered.size));
    const a=normalized(product.name),b=normalized(candidate.name);
    if(a&&b&&(a===b||a.includes(b)||b.includes(a)))score=Math.max(score,.82);
    if(product.pack&&candidate.quantity&&normalized(product.pack)===normalized(candidate.quantity))score=Math.min(1,score+.12);
    return score;
  }

  async function searchProductImages(term,signal){
    const url=new URL(OFF_IMAGE_SEARCH_URL);
    url.searchParams.set('search_terms',term);
    url.searchParams.set('search_simple','1');
    url.searchParams.set('action','process');
    url.searchParams.set('json','1');
    url.searchParams.set('page_size','12');
    url.searchParams.set('fields','code,product_name,product_name_pt,brands,quantity,image_front_small_url,image_front_url');
    const response=await fetchWithTimeout(url.href,{method:'GET',headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'no-referrer'},signal);
    if(!response.ok)throw new Error(\`off-image-http-\${response.status}\`);
    const payload=await response.json();
    const products=Array.isArray(payload?.products)?payload.products:[];
    return products.map(item=>({
      code:cleanRemoteText(item?.code||'',32),
      name:cleanRemoteText(item?.product_name_pt||item?.product_name||'',120),
      brands:cleanRemoteText(item?.brands||'',90),
      quantity:cleanRemoteText(item?.quantity||'',50),
      imageUrl:safeProductImageUrl(item?.image_front_small_url||item?.image_front_url||'')
    })).filter(item=>item.name&&item.imageUrl);
  }

  function enrichResultsWithImages(results,candidates){
    return results.map(product=>{
      let best=null,bestScore=0;
      for(const candidate of candidates){
        const score=imageCandidateScore(product,candidate);
        if(score>bestScore){best=candidate;bestScore=score;}
      }
      if(!best||bestScore<.72)return product;
      return {...product,productCode:best.code,imageUrl:best.imageUrl,imageSource:'Open Food Facts',imageMatchedAt:new Date().toISOString()};
    });
  }

  function productImageHtml(product){
    const image=safeProductImageUrl(product?.imageUrl);
    if(!image)return '<span class="market-product-photo is-empty" aria-hidden="true"></span>';
    return \`<span class="market-product-photo"><img src="\${attr(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>\`;
  }

  function resultStatusHtml(product){`,
  'resolução de imagens'
);

replaceOnce(
  'market-experience.js',
  "    return `<article class=\"market-catalog-card\" data-market-product-card=\"${attr(product.id)}\">\n      <div class=\"market-catalog-main\">\n        <div class=\"market-product-copy\">",
  "    return `<article class=\"market-catalog-card\" data-market-product-card=\"${attr(product.id)}\">\n      <div class=\"market-catalog-main\">\n        ${productImageHtml(product)}\n        <div class=\"market-product-copy\">",
  'imagem no resultado de pesquisa'
);

replaceOnce(
  'market-experience.js',
  "    const settled=await Promise.allSettled(tasks.map(task=>task.promise));\n    if(controller.signal.aborted||generation!==searchGeneration)return;\n    const results=[];",
  "    const imagePromise=searchProductImages(term,controller.signal);\n    const settled=await Promise.allSettled(tasks.map(task=>task.promise));\n    const imageSettled=await Promise.allSettled([imagePromise]);\n    if(controller.signal.aborted||generation!==searchGeneration)return;\n    const results=[];",
  'pesquisa paralela de imagens'
);

replaceOnce(
  'market-experience.js',
  "    const order=new Map(MARKET_IDS.map((id,index)=>[id,index]));\n    results.sort((a,b)=>(order.get(a.marketId)??9)-(order.get(b.marketId)??9)||(a.provider==='open-prices'?String(b.observedDate).localeCompare(String(a.observedDate)):a.priceCents-b.priceCents));\n    renderRemoteResults(results.slice(0,MAX_REMOTE_RESULTS),warnings);",
  "    const imageCandidates=imageSettled[0]?.status==='fulfilled'?imageSettled[0].value:[];\n    const enriched=enrichResultsWithImages(results,imageCandidates);\n    const order=new Map(MARKET_IDS.map((id,index)=>[id,index]));\n    enriched.sort((a,b)=>(order.get(a.marketId)??9)-(order.get(b.marketId)??9)||(a.provider==='open-prices'?String(b.observedDate).localeCompare(String(a.observedDate)):a.priceCents-b.priceCents));\n    renderRemoteResults(enriched.slice(0,MAX_REMOTE_RESULTS),warnings);",
  'enriquecimento de resultados'
);

replaceOnce(
  'market-experience.js',
  "      estimatedCents:product.priceCents,actualCents:0,purchased:false,\n      createdAt:now,updatedAt:now,purchasedAt:null",
  "      estimatedCents:product.priceCents,actualCents:0,purchased:false,\n      productCode:cleanRemoteText(product.productCode||'',32),imageUrl:safeProductImageUrl(product.imageUrl),\n      imageSource:product.imageUrl?'Open Food Facts':'',imageMatchedAt:product.imageUrl?(product.imageMatchedAt||now):null,\n      createdAt:now,updatedAt:now,purchasedAt:null",
  'persistência da imagem'
);

replaceOnce(
  'market-experience.js',
  "Pingo Doce e Continente são consultados no momento através de cesta.pt. Os resultados incluem preço e, quando disponível, ligação para o produto oficial. Não são usados preços fictícios e a pesquisa é enviada apenas à fonte necessária.",
  "Pingo Doce e Continente são consultados no momento através de cesta.pt. Para mostrar uma fotografia real de referência, o termo pesquisado pode também ser consultado no Open Food Facts. A fotografia só é usada quando existe correspondência forte; não são inventadas imagens nem preços.",
  'nota de privacidade da pesquisa'
);

// Lista: fotografia real no cartão e tabela, sem avatar vetorial falso.
replaceOnce(
  'render.js',
  "function marketTableHtml(list) {",
  `function marketProductImageHtml(item,size='mobile') {
  const image=safeProductImageUrl(item?.imageUrl);
  if(!image)return '<span class="market-product-photo is-empty" aria-hidden="true"></span>';
  return \`<span class="market-product-photo \${attr(size)}"><img src="\${attr(image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"></span>\`;
}
function marketTableHtml(list) {`,
  'helper de fotografia na lista'
);

replaceOnce(
  'render.js',
  "    <td><div class=\"market-identity\"><strong>${esc(item.name)}</strong><small>${esc(item.category||'Outros')}</small></div></td>",
  "    <td><div class=\"market-identity market-identity-with-photo\">${marketProductImageHtml(item,'table')}<span><strong>${esc(item.name)}</strong><small>${esc(item.category||'Outros')}</small></span></div></td>",
  'imagem na tabela'
);

replaceOnce(
  'render.js',
  "    <div class=\"market-mobile-head\"><label class=\"market-check\"><input type=\"checkbox\" data-market-toggle=\"${attr(item.id)}\" ${item.purchased?'checked':''}><span class=\"sr-only\">Marcar ${esc(item.name)} como comprado</span></label><div><h3>${esc(item.name)}</h3><small>${esc(item.category||'Outros')} · ${esc(item.quantity||'1')} ${esc(item.unit||'un')}</small></div>${marketStatusHtml(item)}</div>",
  "    <div class=\"market-mobile-head\"><label class=\"market-check\"><input type=\"checkbox\" data-market-toggle=\"${attr(item.id)}\" ${item.purchased?'checked':''}><span class=\"sr-only\">Marcar ${esc(item.name)} como comprado</span></label>${marketProductImageHtml(item)}<div><h3>${esc(item.name)}</h3><small>${esc(item.category||'Outros')} · ${esc(item.quantity||'1')} ${esc(item.unit||'un')}</small></div>${marketStatusHtml(item)}</div>",
  'imagem no cartão mobile'
);

// CSS: elimina o avatar desenhado e usa a fotografia real do produto.
replaceOnce(
  'ui-icons.css',
  "/* Cartões mobile: hierarquia igual ao protótipo sem inventar fotografias de produtos.\n   O avatar usa um ícone vetorial neutro porque o schema atual não guarda imagem. */",
  "/* Cartões mobile: hierarquia do protótipo com fotografia real de referência quando verificada. */",
  'comentário visual'
);

replaceOnce(
  'ui-icons.css',
  "#page-market .market-mobile-head::before{\n  content:\"\";\n  grid-column:2;\n  width:48px;\n  height:48px;\n  border-radius:14px;\n  background-color:color-mix(in srgb,var(--primary) 8%,var(--surface));\n  background-image:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%230b63e5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0'/%3E%3C/svg%3E\");\n  background-repeat:no-repeat;\n  background-position:center;\n  background-size:24px 24px;\n}",
  "#page-market .market-mobile-head::before{content:none!important;display:none!important}",
  'remoção do avatar falso'
);

append('ui-icons.css', String.raw`
/* v57 — fotografias reais de referência no Mercado. */
.market-product-photo{
  width:58px;
  height:58px;
  flex:0 0 58px;
  display:grid;
  place-items:center;
  overflow:hidden;
  border:1px solid color-mix(in srgb,var(--border) 86%,transparent);
  border-radius:16px;
  background:linear-gradient(145deg,color-mix(in srgb,var(--surface-2) 78%,var(--surface)),var(--surface));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55);
}
.market-product-photo img{
  display:block;
  width:100%;
  height:100%;
  object-fit:contain;
  object-position:center;
  background:#fff;
}
.market-product-photo.is-empty{
  background:
    linear-gradient(135deg,transparent 46%,color-mix(in srgb,var(--border) 58%,transparent) 47% 53%,transparent 54%),
    color-mix(in srgb,var(--surface-2) 82%,var(--surface));
}
.market-product-photo.table{width:42px;height:42px;flex-basis:42px;border-radius:12px}
.market-identity-with-photo{display:flex;align-items:center;gap:10px;min-width:0}
.market-identity-with-photo>span:last-child{display:grid;min-width:0}
.market-catalog-main{grid-template-columns:64px minmax(0,1fr) auto!important;align-items:center!important}
.market-catalog-main>.market-product-photo{grid-column:1;width:58px;height:58px}
.market-catalog-main>.market-product-copy{grid-column:2;min-width:0}
.market-catalog-main>.market-add-product{grid-column:3}
#page-market .market-mobile-head>.market-product-photo{grid-column:2;grid-row:1;width:48px;height:48px;flex-basis:48px;border-radius:14px}
@media(max-width:430px){
  #page-market .market-mobile-head{grid-template-columns:42px 52px minmax(0,1fr) auto!important;gap:9px!important}
  #page-market .market-mobile-head>.market-product-photo{width:52px;height:52px;flex-basis:52px}
}
`);

// Scanner: quando existe GTIN, guardar também a imagem exata devolvida pelo Open Food Facts.
replaceOnce(
  'market-barcode.js',
  "url.searchParams.set('fields','code,product_name,product_name_pt,brands,quantity');",
  "url.searchParams.set('fields','code,product_name,product_name_pt,brands,quantity,image_front_small_url,image_front_url');",
  'campos OFF do scanner'
);
replaceOnce(
  'market-barcode.js',
  "      const quantity=cleanText(product.quantity,40);\n      if(!name&&!brand)return null;\n      return {code,name,brand,quantity};",
  "      const quantity=cleanText(product.quantity,40);\n      const imageUrl=typeof safeProductImageUrl==='function'?safeProductImageUrl(product.image_front_small_url||product.image_front_url||''):'';\n      if(!name&&!brand)return null;\n      return {code,name,brand,quantity,imageUrl};",
  'imagem do GTIN'
);

// Cache para invalidar a versão visual anterior no Safari/PWA.
replaceOnce('sw.js',"const CACHE = 'conta-de-casa-public-v55-prototype';","const CACHE = 'conta-de-casa-public-v57-real-images';",'cache v57');

// Testes existentes que fixam o namespace anterior.
for(const path of ['tests/responsive.test.cjs','tests/market-experience.test.cjs','tests/ui-icons.test.cjs']){
  const source=read(path);
  if(source.includes('conta-de-casa-public-v55-prototype'))write(path,source.replaceAll('conta-de-casa-public-v55-prototype','conta-de-casa-public-v57-real-images'));
}

// Documentação de continuidade.
append('docs/PROJECT_STATE.md', String.raw`
## 2026-09-05 — Mercado v57: fotografias reais de referência

A Lista de compras passa a apresentar fotografia real quando existe correspondência suficientemente forte no Open Food Facts. A imagem deixa de ser simulada por um avatar vetorial. O nome, preço e ligação oficial do retalhista continuam separados da fotografia: preço e página oficial permanecem provenientes do fluxo cesta.pt; a fotografia é apenas referência visual e a origem fica registada no item.

Apenas URLs HTTPS de images.openfoodfacts.org são aceites. Itens sem correspondência forte mantêm um placeholder neutro; a aplicação não inventa nem força uma fotografia aproximada. Os metadados opcionais productCode, imageUrl, imageSource e imageMatchedAt são normalizados dentro do schema existente, sem migração do IndexedDB.
`);
append('docs/ARCHITECTURE.md', String.raw`
## Mercado — camada de fotografia real (v57)

A pesquisa continua a usar cesta.pt para preço e ligação oficial. Em paralelo, uma única consulta textual ao Open Food Facts procura candidatos de fotografia. O emparelhamento usa nome, embalagem e quantidade e só aceita resultados acima do limiar de confiança. A imagem é carregada diretamente de images.openfoodfacts.org, domínio explicitamente limitado pela CSP. O scanner por GTIN pede também a fotografia frontal exata quando disponível.
`);
append('docs/DECISIONS.md', String.raw`
## D-012 — Fotografia real é referência visual, não prova de identidade comercial

Data: 5 de setembro de 2026
Estado: aceite

A aplicação pode apresentar uma fotografia real do Open Food Facts quando o emparelhamento textual é forte ou quando existe GTIN. A fotografia não é tratada como imagem oficial do Pingo Doce/Continente e não altera o preço. Se a correspondência não atingir o limiar definido, mantém-se placeholder neutro em vez de mostrar uma imagem possivelmente errada.
`);
append('docs/TODO.md', String.raw`
## P0 — validação v57 imagens reais

- [x] Remover o avatar vetorial que simulava fotografia na Lista de compras.
- [x] Mostrar fotografia real nos resultados e nos itens guardados quando há correspondência forte.
- [x] Restringir imagens a images.openfoodfacts.org e manter credentials omit/referrer no-referrer.
- [x] Persistir apenas URL/metadados; não guardar binários da fotografia no cofre.
- [ ] Validar em iPhone/Safari uma amostra de produtos embalados com fotografia e produtos sem correspondência.
- [ ] Confirmar visualmente 320, 375, 390 e 430 px sem deformação/corte da fotografia.
`);
append('docs/CHANGELOG.md', String.raw`
## 2026-09-05 — Mercado v57 com fotografias reais

- substituído o avatar vetorial dos cartões por fotografia real quando existe correspondência verificada;
- pesquisa de preços continua em cesta.pt e a imagem de referência é resolvida separadamente no Open Food Facts;
- resultados do comparador também passam a mostrar fotografia real quando disponível;
- GTIN passa a pedir a fotografia frontal exata no mesmo lookup do produto;
- metadados de imagem são opcionais e normalizados sem alterar a versão do schema financeiro;
- CSP permite imagens apenas de images.openfoodfacts.org;
- cache PWA atualizado para conta-de-casa-public-v57-real-images.
`);

console.log('Aplicação v57 de fotografias reais concluída.');
