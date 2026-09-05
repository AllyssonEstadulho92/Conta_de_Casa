from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, text):
    (ROOT / path).write_text(text, encoding='utf-8')


def replace_once(text, old, new, path):
    if old not in text:
        raise SystemExit(f'Expected block not found in {path}: {old[:100]!r}')
    return text.replace(old, new, 1)


def regex_once(text, pattern, repl, path, flags=0):
    updated, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'Expected regex once in {path}: {pattern[:100]!r}; got {count}')
    return updated

# --- core.js: quantidade numérica + total de linha monetário ---
path='core.js'
text=read(path)
anchor="""function validCents(value, min = 0, max = MAX_MONEY_CENTS) {\n  return Number.isSafeInteger(value) && value >= min && value <= max;\n}\n"""
addition=anchor+"""function marketQuantityMilli(value = '1') {\n  const raw=String(value ?? '').trim().replace(',', '.');\n  if(!/^\\d{1,5}(?:\\.\\d{1,3})?$/.test(raw)) return 1000;\n  const [whole,fraction='']=raw.split('.');\n  const milli=Number(whole)*1000+Number((fraction+'000').slice(0,3));\n  return Number.isSafeInteger(milli)&&milli>0&&milli<=100000000?milli:1000;\n}\nfunction marketLineCents(unitCents = 0, quantity = '1') {\n  if(!Number.isSafeInteger(unitCents)||unitCents<0) return NaN;\n  const milli=marketQuantityMilli(quantity);\n  const total=(BigInt(unitCents)*BigInt(milli)+500n)/1000n;\n  return total<=BigInt(Number.MAX_SAFE_INTEGER)?Number(total):NaN;\n}\nfunction canonicalMarketQuantity(value = '1') {\n  const milli=marketQuantityMilli(value);\n  const whole=Math.floor(milli/1000);\n  const fraction=String(milli%1000).padStart(3,'0').replace(/0+$/,'');\n  return fraction?`${whole},${fraction}`:String(whole);\n}\n"""
text=replace_once(text,anchor,addition,path)
write(path,text)

# --- finance.js: contabilizar quantidade x preço unitário ---
path='finance.js'
text=read(path)
text=replace_once(text,
"const marketSpent = sumCents(appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month)).map(i=>i.actualCents || i.estimatedCents || 0));",
"const marketSpent = sumCents(appState.market.filter(i=>i.purchased && inSelectedMonth(i.purchasedAt || i.updatedAt, month)).map(i=>marketLineCents(i.actualCents || i.estimatedCents || 0,i.quantity)));",path)
text=replace_once(text,
"map.set(cat,sumCents([map.get(cat)||0,item.actualCents||item.estimatedCents||0]));",
"map.set(cat,sumCents([map.get(cat)||0,marketLineCents(item.actualCents||item.estimatedCents||0,item.quantity)]));",path)
write(path,text)

# --- render.js: totais de linha, diferença e apresentação ---
path='render.js'
text=read(path)
text=replace_once(text,
"""function marketItemEffectiveCents(item) {\n  if(!item?.purchased) return 0;\n  return item.actualCents || item.estimatedCents || 0;\n}\nfunction marketMetrics(items) {\n  const purchased=items.filter(i=>i.purchased);\n  const pending=items.filter(i=>!i.purchased);\n  const estimatedTotal=sumCents(items.map(i=>i.estimatedCents||0));\n  const accounted=sumCents(purchased.map(marketItemEffectiveCents));\n  const pendingEstimated=sumCents(pending.map(i=>i.estimatedCents||0));\n  const purchasedEstimated=sumCents(purchased.map(i=>i.estimatedCents||0));\n""",
"""function marketItemEstimatedCents(item) {\n  return marketLineCents(item?.estimatedCents||0,item?.quantity||'1');\n}\nfunction marketItemActualCents(item) {\n  return marketLineCents(item?.actualCents||0,item?.quantity||'1');\n}\nfunction marketItemEffectiveCents(item) {\n  if(!item?.purchased) return 0;\n  return item.actualCents>0?marketItemActualCents(item):marketItemEstimatedCents(item);\n}\nfunction marketMetrics(items) {\n  const purchased=items.filter(i=>i.purchased);\n  const pending=items.filter(i=>!i.purchased);\n  const estimatedTotal=sumCents(items.map(marketItemEstimatedCents));\n  const accounted=sumCents(purchased.map(marketItemEffectiveCents));\n  const pendingEstimated=sumCents(pending.map(marketItemEstimatedCents));\n  const purchasedEstimated=sumCents(purchased.map(marketItemEstimatedCents));\n""",path)
text=replace_once(text,
"const diff=sumCents([item.actualCents,-(item.estimatedCents||0)]);",
"const diff=sumCents([marketItemActualCents(item),-marketItemEstimatedCents(item)]);",path)
text=text.replace("money(item.estimatedCents||0)","money(marketItemEstimatedCents(item))")
text=text.replace("(item.estimatedCents||0))","marketItemEstimatedCents(item)))")
text=text.replace("'estimated-desc':(a,b)=>(b.estimatedCents||0)-(a.estimatedCents||0)","'estimated-desc':(a,b)=>marketItemEstimatedCents(b)-marketItemEstimatedCents(a)")
text=text.replace("<span>Preço real</span>","<span>Preço real / unidade</span>")
write(path,text)

# --- forms.js: stepper +/- e subtotal automático ---
path='forms.js'
text=read(path)
pattern=r"function openMarketForm\(item=null\)\{[\s\S]*?\n\}\nfunction openGoalForm\(\)\{"
replacement=r'''function openMarketForm(item=null){
  const existing=item?.id?appState.market.find(x=>x.id===item.id):null;
  const estimatedValue=existing?.estimatedCents>0?(existing.estimatedCents/100).toFixed(2).replace('.',','):'';
  const units=['un','kg','g','L','ml'];
  const quantityValue=canonicalMarketQuantity(existing?.quantity||'1');
  openDialog(existing?'Editar item do mercado':'Adicionar ao mercado',`<form id="marketForm" class="form-grid two"><input type="hidden" name="marketId" value="${attr(existing?.id||'')}"><label>Produto<input name="name" required value="${attr(existing?.name||'')}" autocomplete="off" spellcheck="false"></label><label>Categoria<select name="category" required>${marketCategoryOptions(existing?.category||'')}</select><small>Escolha uma categoria para organizar a lista e os relatórios.</small></label><label>Quantidade<div class="market-quantity-stepper"><button type="button" class="market-qty-btn" data-market-qty-step="-1" aria-label="Diminuir quantidade">−</button><input name="quantity" inputmode="decimal" value="${attr(quantityValue)}" autocomplete="off" aria-label="Quantidade"><button type="button" class="market-qty-btn" data-market-qty-step="1" aria-label="Aumentar quantidade">+</button></div><small>Use + ou − para ajustar. O total é recalculado automaticamente.</small></label><label>Unidade<select name="unit">${units.map(unit=>`<option value="${attr(unit)}" ${unit===(existing?.unit||'un')?'selected':''}>${esc(unit)}</option>`).join('')}</select></label><label class="full-row">Preço estimado por unidade<input name="estimated" inputmode="decimal" value="${attr(estimatedValue)}" placeholder="0,00" autocomplete="off"><small id="marketEstimatedTotalPreview" class="market-total-preview" aria-live="polite"></small></label><div class="button-row full-row"><button type="button" class="btn secondary" data-close-dialog>Cancelar</button><button class="btn primary" type="submit">${existing?'Guardar alterações':'Adicionar'}</button></div></form>`);
  const form=$('#marketForm');
  const quantityInput=form.elements.quantity;
  const estimatedInput=form.elements.estimated;
  const preview=$('#marketEstimatedTotalPreview');
  const refreshPreview=()=>{
    const cents=parseCents(estimatedInput.value);
    if(!validCents(cents,0)){preview.textContent='Subtotal inválido';return;}
    const total=marketLineCents(cents,quantityInput.value);
    preview.textContent=`Subtotal automático: ${money(total)}`;
  };
  form.addEventListener('click',event=>{
    const button=event.target.closest('[data-market-qty-step]');
    if(!button)return;
    const step=Number(button.dataset.marketQtyStep)||0;
    const current=marketQuantityMilli(quantityInput.value);
    const next=Math.max(1000,current+step*1000);
    quantityInput.value=canonicalMarketQuantity(String(next/1000).replace('.',','));
    quantityInput.dispatchEvent(new Event('input',{bubbles:true}));
  });
  form.addEventListener('input',event=>{if(event.target===quantityInput||event.target===estimatedInput)refreshPreview();});
  refreshPreview();
  form.addEventListener('submit',e=>withFormSubmissionLock(e,async form=>{
    const fd=new FormData(form);
    const marketId=cleanString(fd.get('marketId'),80);
    const current=marketId?appState.market.find(x=>x.id===marketId):null;
    if(marketId&&!current){toast('O item já não existe. Atualize a lista.');return false;}
    const name=cleanString(fd.get('name'),100),est=parseCents(fd.get('estimated'));
    if(!name){toast('Indique o produto.');return false;}
    if(!validCents(est,0)){toast('Preço estimado inválido. Use zero ou um valor positivo.');return false;}
    const rawQuantity=String(fd.get('quantity')||'').trim();
    if(!/^\d{1,5}(?:[.,]\d{1,3})?$/.test(rawQuantity)||marketQuantityMilli(rawQuantity)<=0){toast('Quantidade inválida. Use um número superior a zero.');return false;}
    const quantity=canonicalMarketQuantity(rawQuantity);
    const category=cleanString(fd.get('category'),80);
    if(!category){toast('Selecione uma categoria.');return false;}
    const now=new Date().toISOString();
    const patch={name,category,quantity,unit:cleanString(fd.get('unit'),20)||'un',estimatedCents:est,updatedAt:now};
    if(current){
      Object.assign(current,patch);
    }else{
      appState.market.push({id:uid(),...patch,actualCents:0,purchased:false,createdAt:now,purchasedAt:null});
    }
    await commit(current?'updated':'created','market');closeDialog();toast(current?'Item atualizado.':'Item adicionado.');return true;
  }));
}
function openGoalForm(){'''
text=regex_once(text,pattern,replacement,path,flags=re.M)
write(path,text)

# --- market-experience.js: apenas Pingo Doce e Continente, com identificação visual ---
path='market-experience.js'
text=read(path)
text=text.replace('pesquisa de preços reais (v52)','pesquisa de preços reais (v53)')
text=text.replace("  const OPEN_PRICES_API='https://prices.openfoodfacts.org/api/v1';\n",'')
text=text.replace("  const MARKET_IDS=['pingo-doce','continente','mercadona'];","  const MARKET_IDS=['pingo-doce','continente'];")
text=regex_once(text,r"  const MARKET_DEFINITIONS=Object\.freeze\(\[[\s\S]*?\n  \]\);",
"""  const MARKET_DEFINITIONS=Object.freeze([\n    {id:'pingo-doce',name:'Pingo Doce',short:'PD',tone:'green',provider:'cesta',providerId:'pingodoce'},\n    {id:'continente',name:'Continente',short:'C',tone:'red',provider:'cesta',providerId:'continente'}\n  ]);""",path)
text=text.replace("  let mercadonaLocationIds=null;\n",'')
text=regex_once(text,r"  function marketMark\(market,size='large'\)\{[\s\S]*?\n  \}",
"""  function marketMark(market,size='large'){\n    const m=typeof market==='string'?marketById(market):market;\n    const logo=m.id==='pingo-doce'\n      ? '<span class=\"market-logo-pingo\"><b>Pingo</b><b>Doce</b></span>'\n      : '<span class=\"market-logo-continente\"><i aria-hidden=\"true\">C</i><b>CONTINENTE</b></span>';\n    return `<span class=\"market-brand-mark ${attr(m.tone)} ${attr(size)} market-brand-logo\" aria-hidden=\"true\">${logo}</span>`;\n  }""",path)
text=text.replace("  function observationAgeDays(value){\n    const date=Date.parse(`${value}T00:00:00Z`);\n    if(!Number.isFinite(date))return Infinity;\n    return Math.max(0,Math.floor((Date.now()-date)/86400000));\n  }\n\n",'')
text=regex_once(text,r"\n  async function fetchOpenPricesJson[\s\S]*?\n  function resultStatusHtml\(product\)\{",
"\n  function resultStatusHtml(product){",path)
text=regex_once(text,r"  function resultStatusHtml\(product\)\{[\s\S]*?\n  \}\n\n  function productCardHtml",
"""  function resultStatusHtml(product){\n    if(product.discount||product.promotionUntil){\n      const detail=[product.discount,product.promotionUntil?`até ${formatObservedDate(product.promotionUntil)}`:''].filter(Boolean).join(' · ');\n      return `<span class=\"market-result-chip promo\">Promoção${detail?` · ${esc(detail)}`:''}</span>`;\n    }\n    return '<span class=\"market-result-chip current\">Consultado agora</span>';\n  }\n\n  function productCardHtml""",path)
text=text.replace("const subtitle=[product.pack,market.name,product.city,product.provider==='open-prices'&&product.observedDate?`observado ${formatObservedDate(product.observedDate)}`:''].filter(Boolean).join(' · ');","const subtitle=[product.pack,market.name].filter(Boolean).join(' · ');")
text=regex_once(text,r"<div class=\"market-source-notice\" role=\"note\">\$\{svgIcon\('info',21\)\}<p>[\s\S]*?</p></div>",
"<div class=\"market-source-notice\" role=\"note\">${svgIcon('info',21)}<p><strong>Pesquisa em dois mercados.</strong> Pingo Doce e Continente são consultados no momento através de cesta.pt. Os resultados incluem preço e, quando disponível, ligação para o produto oficial. Não são usados preços fictícios e a pesquisa é enviada apenas à fonte necessária.</p></div>",path)
text=replace_once(text,
"""    const cestaMarkets=['pingo-doce','continente'].filter(id=>selectedMarkets.has(id));\n    const tasks=[];\n    if(cestaMarkets.length)tasks.push({label:'Continente/Pingo Doce',promise:searchCestaProducts(term,cestaMarkets,controller.signal)});\n    if(selectedMarkets.has('mercadona'))tasks.push({label:'Mercadona',promise:searchMercadonaProducts(term,controller.signal)});\n""",
"""    const cestaMarkets=['pingo-doce','continente'].filter(id=>selectedMarkets.has(id));\n    const tasks=[];\n    if(cestaMarkets.length)tasks.push({label:'Pingo Doce/Continente',promise:searchCestaProducts(term,cestaMarkets,controller.signal)});\n""",path)
text=text.replace("clientInfo:{name:'Conta de Casa',version:'52'}","clientInfo:{name:'Conta de Casa',version:'53'}")
text=text.replace("    const sourceText=product.provider==='open-prices'&&product.observedDate?` observado em ${formatObservedDate(product.observedDate)}`:' consultado agora';\n    toast(`${product.name} adicionado com ${money(product.priceCents)} como preço estimado (${marketById(product.marketId).name},${sourceText}).`);",
"    toast(`${product.name} adicionado com ${money(product.priceCents)} por unidade (${marketById(product.marketId).name}). O subtotal será atualizado automaticamente pela quantidade.`);")
text=text.replace("grid-template-columns:repeat(3,minmax(0,1fr))","grid-template-columns:repeat(2,minmax(0,1fr))") if False else text
write(path,text)

# --- market-experience.css: 2 mercados + logótipos textuais de marca ---
path='market-experience.css'
text=read(path)
text=text.replace('/* Conta de Casa v52 — Mercado: pesquisa real e responsiva. */','/* Conta de Casa v53 — Mercado: Pingo Doce + Continente e quantidade automática. */')
text=text.replace('  --market-prototype-orange:#f28a16;\n','')
text=text.replace('.market-source-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}', '.market-source-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}')
text=regex_once(text,r"\.market-brand-mark\{[\s\S]*?\.market-brand-mark\.orange\{[^\n]*\}\n",
""".market-brand-mark{display:grid;place-items:center;min-width:0;color:var(--text);font-weight:700;box-shadow:none}\n.market-brand-mark.large{width:min(132px,100%);height:54px;font-size:.8rem}\n.market-brand-mark.small{width:78px;height:30px;font-size:.65rem}\n.market-brand-mark.green,.market-brand-mark.red{background:transparent}\n.market-brand-logo>span{max-width:100%}\n.market-logo-pingo{width:100%;height:100%;display:grid;place-items:center;align-content:center;gap:0;border-radius:13px;background:#087638;color:#fff;border:3px solid #fff;box-shadow:0 0 0 1px #087638;font-size:.92rem;line-height:.95;letter-spacing:-.03em}\n.market-logo-pingo b:last-child{color:#fff6d7}\n.market-logo-continente{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:7px;border-radius:13px;background:#fff;border:1px solid color-mix(in srgb,#e30613 35%,var(--border));color:#d90b1c;font-size:.72rem;letter-spacing:.035em}\n.market-logo-continente i{width:31px;height:31px;display:grid;place-items:center;border-radius:999px;background:#e30613;color:#fff;font-style:normal;font-size:1.05rem;letter-spacing:-.08em}\n""",path)
text += """\n/* Mercado v53 — editor de quantidade */\n#formDialog .market-quantity-stepper{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;gap:8px;align-items:center}\n#formDialog .market-quantity-stepper input{min-width:0;text-align:center;font-variant-numeric:tabular-nums}\n#formDialog .market-qty-btn{width:48px;height:48px;display:grid;place-items:center;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--primary);font-size:1.35rem;font-weight:600;touch-action:manipulation}\n#formDialog .market-qty-btn:active{background:var(--primary-2)}\n#formDialog .market-total-preview{display:block;margin-top:7px;color:var(--primary);font-weight:600}\n"""
write(path,text)

# --- index/events/sw: build v53 e remoção de Open Prices da CSP ---
path='index.html'
text=read(path)
text=text.replace(' https://prices.openfoodfacts.org','')
text=text.replace('v52','v53')
write(path,text)

path='events.js'
text=read(path).replace("./sw.js?v=52","./sw.js?v=53")
write(path,text)

path='sw.js'
text=read(path).replace('conta-de-casa-public-v52','conta-de-casa-public-v53')
write(path,text)

# --- testes ---
path='tests/market-experience.test.cjs'
text=read(path)
text=text.replace('v52','v53')
text=text.replace("assert.match(index, /connect-src 'self' https:\\/\\/api\\.github\\.com https:\\/\\/cesta\\.pt https:\\/\\/prices\\.openfoodfacts\\.org;/);","assert.match(index, /connect-src 'self' https:\\/\\/api\\.github\\.com https:\\/\\/cesta\\.pt;/);")
text=text.replace("for (const market of ['Pingo Doce','Continente','Mercadona']) assert.ok(js.includes(market));","for (const market of ['Pingo Doce','Continente']) assert.ok(js.includes(market));\nassert.doesNotMatch(js,/Mercadona|openfoodfacts|Open Prices/i);")
for line in [
"assert.ok(js.includes(\"https://prices.openfoodfacts.org/api/v1\"), 'Mercadona verified-observation provider must be explicit');\n",
"assert.ok(js.includes(\"osm_name__like:'Mercadona'\"), 'Mercadona location filtering must be explicit');\n",
"assert.ok(js.includes(\"osm_address_country__like:'Portugal'\"), 'Mercadona observations must be restricted to Portugal');\n",
"assert.ok(js.includes(\"item?.proof_id||item?.proof?.id\"), 'Mercadona results must require proof evidence');\n",
"assert.ok(js.includes(\"observedDate\"), 'Mercadona observation date must be carried to the UI');\n",
"assert.ok(js.includes(\"pode já ter mudado\"), 'old observations must not be presented as current');\n"]:
    text=text.replace(line,'')
text=text.replace("assert.ok(js.includes(\"A pesquisa é enviada apenas às fontes necessárias\"), 'remote-search privacy disclosure must be visible');","assert.ok(js.includes(\"a pesquisa é enviada apenas à fonte necessária\"), 'remote-search privacy disclosure must be visible');")
text += "\nassert.match(css,/market-logo-pingo/);\nassert.match(css,/market-logo-continente/);\nassert.match(css,/market-quantity-stepper/);\n"
write(path,text)

path='tests/security.test.cjs'
text=read(path)
text=text.replace("new Set(['https://api.github.com','https://cesta.pt','https://prices.openfoodfacts.org'])","new Set(['https://api.github.com','https://cesta.pt'])")
text=text.replace("assert.match(index, /https:\\/\\/prices\\.openfoodfacts\\.org/);\n",'')
write(path,text)

path='tests/market-live-accounting.test.cjs'
text=read(path)
text="""const assert = require('node:assert/strict');\nconst fs = require('node:fs');\nconst vm = require('node:vm');\n\nfunction quantityMilli(value='1'){\n  const raw=String(value??'').trim().replace(',','.');\n  if(!/^\\d{1,5}(?:\\.\\d{1,3})?$/.test(raw))return 1000;\n  const [whole,fraction='']=raw.split('.');\n  return Number(whole)*1000+Number((fraction+'000').slice(0,3));\n}\nfunction lineCents(unitCents,quantity='1'){return Math.round(unitCents*quantityMilli(quantity)/1000);}\nconst context = vm.createContext({\n  marketLineCents:lineCents,\n  sumCents(values){\n    let total=0;\n    for(const value of values){\n      assert.equal(Number.isSafeInteger(value),true,'money values must remain safe integers');\n      total+=value;\n      assert.equal(Number.isSafeInteger(total),true,'money total must remain a safe integer');\n    }\n    return total;\n  }\n});\nvm.runInContext(fs.readFileSync('render.js','utf8'), context);\n\nconst pending = vm.runInContext(`marketMetrics([{estimatedCents:115,actualCents:0,quantity:'4',purchased:false}])`, context);\nassert.equal(pending.estimatedTotal,460);\nassert.equal(pending.pendingEstimated,460);\nassert.equal(pending.accounted,0);\n\nconst fractional = vm.runInContext(`marketMetrics([{estimatedCents:250,actualCents:0,quantity:'1,5',purchased:false}])`, context);\nassert.equal(fractional.estimatedTotal,375);\n\nconst purchasedFromSource = vm.runInContext(`marketMetrics([{estimatedCents:115,actualCents:0,quantity:'4',purchased:true}])`, context);\nassert.equal(purchasedFromSource.estimatedTotal,460);\nassert.equal(purchasedFromSource.accounted,460);\nassert.equal(purchasedFromSource.missingReal,1);\nassert.equal(purchasedFromSource.variance,0);\n\nconst purchasedWithReceipt = vm.runInContext(`marketMetrics([{estimatedCents:115,actualCents:110,quantity:'4',purchased:true}])`, context);\nassert.equal(purchasedWithReceipt.accounted,440);\nassert.equal(purchasedWithReceipt.missingReal,0);\nassert.equal(purchasedWithReceipt.variance,-20);\n\nconst marketJs=fs.readFileSync('market-experience.js','utf8');\nconst forms=fs.readFileSync('forms.js','utf8');\nconst finance=fs.readFileSync('finance.js','utf8');\nassert.match(marketJs,/estimatedCents:product\\.priceCents,actualCents:0,purchased:false/);\nassert.doesNotMatch(marketJs,/Mercadona|openfoodfacts|Open Prices/i);\nassert.match(forms,/market-quantity-stepper/);\nassert.match(forms,/Subtotal automático/);\nassert.match(forms,/marketLineCents\\(cents,quantityInput\\.value\\)/);\nassert.match(finance,/marketLineCents\\(i\\.actualCents \\|\\| i\\.estimatedCents \\|\\| 0,i\\.quantity\\)/);\n\nconsole.log('Market quantity x unit-price accounting invariants: OK');\n"""
write(path,text)

for path in ['tests/responsive.test.cjs','tests/mobile-layout-regression.test.cjs']:
    text=read(path).replace('v52','v53')
    write(path,text)

# --- documentação permanente ---
path='docs/PROJECT_STATE.md'
text=read(path)
text=text.replace('Build funcional: v52','Build funcional: v53')
text=regex_once(text,r"### Mercadona Portugal[\s\S]*?(?=\n## Interface)","",path)
text=text.replace('Pingo Doce / Continente / Mercadona','Pingo Doce / Continente')
text=text.replace('A CSP permite apenas as duas novas origens necessárias para pesquisa de preços: `https://cesta.pt` e `https://prices.openfoodfacts.org`, além da API GitHub já existente.','A CSP permite apenas `https://cesta.pt` para a pesquisa de preços, além da API GitHub já existente.')
text=text.replace('Foi confirmada pesquisa real de Continente/Pingo Doce através de `search_products` do cesta.pt e leitura CORS de observações Mercadona Portugal no Open Prices com loja, data, preço e comprovativo.','Foi confirmada pesquisa real de Continente/Pingo Doce através de `search_products` do cesta.pt.')
text=text.replace('Substituir a fonte comunitária da Mercadona se a Mercadona Portugal vier a disponibilizar uma API/catálogo oficial de preços.','Reavaliar a Mercadona apenas se vier a existir uma fonte oficial portuguesa com catálogo e preços verificáveis.')
text += "\n## Quantidade automática v53\n\nO preço estimado e o preço real do Mercado passam a representar valor por unidade. O subtotal de cada linha é calculado automaticamente por quantidade × preço unitário. O editor inclui controlos −/+ e pré-visualização do subtotal; os totais e relatórios usam o subtotal calculado.\n\nA Mercadona foi retirada do seletor e da rede de produção por não existir uma fonte oficial portuguesa de catálogo/preços suficientemente completa para este fluxo. Permanecem apenas Pingo Doce e Continente.\n"
write(path,text)

path='docs/ARCHITECTURE.md'
text=read(path)
text=text.replace('Mercado v52','Mercado v53')
text=regex_once(text,r"### Mercadona Portugal — Open Prices[\s\S]*?(?=\n## Política de veracidade dos preços)","",path)
text=text.replace("- nunca substituir Mercadona Portugal por preços da Mercadona Espanha;\n",'')
text=text.replace("- CSP `connect-src` restringe chamadas a `self`, GitHub API, `cesta.pt` e `prices.openfoodfacts.org`;","- CSP `connect-src` restringe chamadas a `self`, GitHub API e `cesta.pt`;")
text += "\n## Quantidades e preços unitários\n\n`estimatedCents` e `actualCents` continuam campos inteiros em cêntimos e são tratados como preços por unidade. `quantity` permanece compatível com o schema existente e aceita até três casas decimais; `marketLineCents()` calcula o subtotal monetário com arredondamento seguro. Resumos, relatórios e orçamento utilizam o subtotal, não apenas o preço unitário.\n"
write(path,text)

path='docs/DECISIONS.md'
text=read(path)
text += "\n\n## 2026-09-05 — Mercado v53: dois retalhistas e quantidade automática\n\n### Decisão\n\nRetirar Mercadona da pesquisa de produção enquanto não existir uma fonte oficial portuguesa suficientemente completa e verificável. Manter Pingo Doce e Continente através de `cesta.pt`. Interpretar `estimatedCents` e `actualCents` como preço por unidade e calcular automaticamente o subtotal pela quantidade.\n\n### Motivo\n\nEvita uma falsa sensação de cobertura na Mercadona e corrige a inconsistência em que alterar a quantidade não alterava os totais da lista.\n"
write(path,text)

path='docs/CHANGELOG.md'
text=read(path)
entry="""# Changelog Técnico — Conta de Casa\n\n## 2026-09-05 — Mercado v53: quantidade automática e dois mercados\n\n- Mercadona removida da UI, runtime, CSP e pipeline de validação por ausência de uma fonte oficial portuguesa de catálogo/preços adequada;\n- permanecem Pingo Doce e Continente;\n- seletor dos mercados passa a mostrar identificação visual própria de cada marca;\n- quantidade passa a multiplicar automaticamente o preço por unidade nos totais da lista;\n- editor recebe controlos −/+ e subtotal automático;\n- preços estimado e real são tratados como valores por unidade;\n- resumos, orçamento e relatórios contabilizam quantidade × preço unitário;\n- build/cache atualizados para v53.\n\n"""
text=entry+text.split('# Changelog Técnico — Conta de Casa\n',1)[1]
write(path,text)

path='docs/TODO.md'
text=read(path)
text=text.replace('## P0 — validação v52','## P0 — validação v53')
text=text.replace('- [ ] Testar pesquisas reais no Continente, Pingo Doce e Mercadona, incluindo resultados inexistentes.','- [ ] Testar pesquisas reais no Continente e Pingo Doce, incluindo resultados inexistentes.')
text=text.replace('- [ ] Monitorizar cobertura e idade das observações Mercadona Portugal no Open Prices.\n','')
text=text.replace('- [ ] Investigar uma fonte oficial Mercadona Portugal se vier a existir; preferi-la à fonte comunitária depois de auditoria.','- [ ] Reavaliar Mercadona apenas se surgir uma fonte oficial portuguesa de catálogo/preços.')
text += "\n- [ ] Validar em dispositivo real o stepper −/+ e o subtotal automático para quantidades inteiras e decimais.\n"
write(path,text)

print('Market v53 patch applied successfully')
