from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def require(text: str, needle: str, path: str) -> None:
    if needle not in text:
        raise SystemExit(f"Expected text not found in {path}: {needle[:120]!r}")


# 1) Public build + CSP.
index = read("index.html")
old_csp = "connect-src 'self' https://api.github.com;"
new_csp = "connect-src 'self' https://api.github.com https://cesta.pt https://prices.openfoodfacts.org;"
require(index, old_csp, "index.html")
index = index.replace(old_csp, new_csp, 1).replace("v51", "v52")
write("index.html", index)

# 2) Service worker freshness.
events = read("events.js")
old_sw = "register('./sw.js?v=50',{updateViaCache:'none'})"
require(events, old_sw, "events.js")
write("events.js", events.replace(old_sw, "register('./sw.js?v=52',{updateViaCache:'none'})", 1))

sw = read("sw.js")
require(sw, "conta-de-casa-public-v51", "sw.js")
write("sw.js", sw.replace("conta-de-casa-public-v51", "conta-de-casa-public-v52", 1))

# 3) Market result source control: keep remote URL out of sanitized HTML.
js = read("market-experience.js")
old_source = "const sourceLink=product.sourceUrl?`<a class=\"market-result-source\" href=\"${attr(product.sourceUrl)}\" target=\"_blank\" rel=\"noopener noreferrer\">${svgIcon('external',15)}<span>${esc(product.sourceLabel)}</span></a>`:`<span class=\"market-result-source text-only\">${esc(product.sourceLabel)}</span>`;"
new_source = "const sourceLink=product.sourceUrl?`<button class=\"market-result-source\" type=\"button\" data-market-source-url=\"${attr(product.id)}\" aria-label=\"Abrir produto oficial\">${svgIcon('external',15)}<span>${esc(product.sourceLabel)}</span></button>`:`<span class=\"market-result-source text-only\">${esc(product.sourceLabel)}</span>`;"
require(js, old_source, "market-experience.js")
js = js.replace(old_source, new_source, 1)
require(js, "<h4>${esc(product.name)}</h4>", "market-experience.js")
js = js.replace("<h4>${esc(product.name)}</h4>", "<h3>${esc(product.name)}</h3>", 1)
click_marker = "    const add=event.target.closest('[data-market-add-product]');\n"
require(js, click_marker, "market-experience.js")
source_handler = (
    "    const sourceButton=event.target.closest('[data-market-source-url]');\n"
    "    if(sourceButton){\n"
    "      const product=resultById.get(sourceButton.dataset.marketSourceUrl);\n"
    "      const url=product?.sourceUrl?safeRetailerUrl(product.sourceUrl,product.marketId):'';\n"
    "      if(url)window.open(url,'_blank','noopener,noreferrer');\n"
    "      return;\n"
    "    }\n"
)
js = js.replace(click_marker, source_handler + click_marker, 1)
write("market-experience.js", js)

# 4) CSS semantics/focus for source button and h3 title.
css = read("market-experience.css")
require(css, ".market-product-copy h4{", "market-experience.css")
css = css.replace(".market-product-copy h4{", ".market-product-copy h3{", 1)
focus_old = ".market-add-product:focus-visible,.market-source-card:focus-visible,.market-browser-chip:focus-visible,.market-browser-tab:focus-visible,.market-search-clear:focus-visible{"
focus_new = ".market-add-product:focus-visible,.market-source-card:focus-visible,.market-browser-chip:focus-visible,.market-browser-tab:focus-visible,.market-search-clear:focus-visible,.market-result-source:focus-visible{"
require(css, focus_old, "market-experience.css")
css = css.replace(focus_old, focus_new, 1)
source_rule = ".market-result-source{display:inline-flex;align-items:center;gap:4px;min-height:30px;color:var(--primary);font-size:.75rem;font-weight:550;text-decoration:none}"
source_rule_new = ".market-result-source{display:inline-flex;align-items:center;gap:4px;min-height:30px;padding:0;border:0;background:transparent;color:var(--primary);font-size:.75rem;font-weight:550;text-decoration:none;text-align:left}"
require(css, source_rule, "market-experience.css")
css = css.replace(source_rule, source_rule_new, 1)
write("market-experience.css", css)

# 5) Security UI accurately describes restricted market network calls.
render = read("render.js")
old_network = "Sem CDNs, trackers, anúncios ou telemetria. Quando a sincronização está ativa, apenas api.github.com é autorizado e recebe somente o envelope cifrado."
new_network = "Sem CDNs, trackers, anúncios ou telemetria. A sincronização usa apenas api.github.com e recebe somente o envelope cifrado. As pesquisas iniciadas pelo utilizador em Mercado podem consultar cesta.pt e prices.openfoodfacts.org; nenhum dado financeiro do cofre é enviado."
require(render, old_network, "render.js")
write("render.js", render.replace(old_network, new_network, 1))

# 6) Security suite: explicitly allow only the audited market origins in market runtime.
security = read("tests/security.test.cjs")
old_files = "const appFiles = ['index.html','core.js','finance.js','render.js','forms.js','sync.js','events.js','styles.css','sw.js','manifest.webmanifest'];"
new_files = "const appFiles = ['index.html','core.js','finance.js','render.js','forms.js','sync.js','events.js','market-experience.js','styles.css','sw.js','manifest.webmanifest'];"
require(security, old_files, "tests/security.test.cjs")
security = security.replace(old_files, new_files, 1)
loop_marker = "for (const file of appFiles) {\n"
require(security, loop_marker, "tests/security.test.cjs")
security = security.replace(loop_marker, "const approvedExternalOrigins = new Set(['https://api.github.com','https://cesta.pt','https://prices.openfoodfacts.org']);\nfor (const file of appFiles) {\n", 1)
old_approval = "    const approvedApi = parsed.origin === 'https://api.github.com';\n    assert.equal(approvedApi, true, `${file} may only reference the approved GitHub API`);"
new_approval = "    assert.equal(approvedExternalOrigins.has(parsed.origin), true, `${file} references unapproved external origin ${parsed.origin}`);\n    if (parsed.origin !== 'https://api.github.com') assert.equal(file, 'market-experience.js', `${parsed.origin} is only approved for market-experience.js`);"
require(security, old_approval, "tests/security.test.cjs")
security = security.replace(old_approval, new_approval, 1)
csp_marker = "assert.match(index, /connect-src 'self' https:\\/\\/api\\.github\\.com/);"
require(security, csp_marker, "tests/security.test.cjs")
security = security.replace(csp_marker, csp_marker + "\nassert.match(index, /https:\\/\\/cesta\\.pt/);\nassert.match(index, /https:\\/\\/prices\\.openfoodfacts\\.org/);", 1)
write("tests/security.test.cjs", security)

# 7) Market suite follows safe source button and accounting semantics.
market_test = read("tests/market-experience.test.cjs")
old_rel = 'assert.match(js, /rel=\\"noopener noreferrer\\"/);'
require(market_test, old_rel, "tests/market-experience.test.cjs")
market_test = market_test.replace(
    old_rel,
    "assert.match(js, /data-market-source-url=/);\n"
    "assert.match(js, /window\\.open\\(url,'_blank','noopener,noreferrer'\\)/);\n"
    "assert.match(js, /actualCents:0,purchased:false/);",
    1,
)
write("tests/market-experience.test.cjs", market_test)

# 8) Existing freshness/layout suites follow v52.
write("tests/responsive.test.cjs", read("tests/responsive.test.cjs").replace("v51", "v52"))
write("tests/mobile-layout-regression.test.cjs", read("tests/mobile-layout-regression.test.cjs").replace("v51", "v52"))

# 9) Dynamic accounting regression.
accounting_test = r'''const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const context = vm.createContext({
  sumCents(values){
    let total=0;
    for(const value of values){
      assert.equal(Number.isSafeInteger(value),true,'money values must remain safe integers');
      total+=value;
      assert.equal(Number.isSafeInteger(total),true,'money total must remain a safe integer');
    }
    return total;
  }
});
vm.runInContext(fs.readFileSync('render.js','utf8'), context);

const pending = vm.runInContext(`marketMetrics([{estimatedCents:510,actualCents:0,purchased:false}])`, context);
assert.equal(pending.estimatedTotal,510);
assert.equal(pending.pendingEstimated,510);
assert.equal(pending.accounted,0);

const purchasedFromSource = vm.runInContext(`marketMetrics([{estimatedCents:510,actualCents:0,purchased:true}])`, context);
assert.equal(purchasedFromSource.estimatedTotal,510);
assert.equal(purchasedFromSource.accounted,510);
assert.equal(purchasedFromSource.missingReal,1);
assert.equal(purchasedFromSource.variance,0);

const purchasedWithReceipt = vm.runInContext(`marketMetrics([{estimatedCents:510,actualCents:495,purchased:true}])`, context);
assert.equal(purchasedWithReceipt.accounted,495);
assert.equal(purchasedWithReceipt.missingReal,0);
assert.equal(purchasedWithReceipt.variance,-15);

const marketJs=fs.readFileSync('market-experience.js','utf8');
assert.match(marketJs,/estimatedCents:product\.priceCents,actualCents:0,purchased:false/);
assert.doesNotMatch(marketJs,/preços de demonstração|valores de demonstração|DEMO_PRODUCTS/i);

console.log('Live market price accounting invariants: OK');
'''
write("tests/market-live-accounting.test.cjs", accounting_test)

# 10) CI: retain only providers used in production and add accounting test.
ci = read(".github/workflows/ci.yml")
super_block = "\n      - name: Probe Super Save web\n        run: node scripts/probe-supersave.cjs\n"
require(ci, super_block, ".github/workflows/ci.yml")
ci = ci.replace(super_block, "", 1)
old_market_step = "      - name: Market prototype tests\n        run: node tests/market-experience.test.cjs\n"
require(ci, old_market_step, ".github/workflows/ci.yml")
ci = ci.replace(
    old_market_step,
    "      - name: Market live-source tests\n"
    "        run: node tests/market-experience.test.cjs\n\n"
    "      - name: Market live-price accounting tests\n"
    "        run: node tests/market-live-accounting.test.cjs\n",
    1,
)
write(".github/workflows/ci.yml", ci)

# 11) Deployment revalidates the same market code/tests before publishing.
pages = read(".github/workflows/pages.yml")
if "node --check market-experience.js" not in pages:
    require(pages, "          node --check sync.js\n", ".github/workflows/pages.yml")
    pages = pages.replace("          node --check sync.js\n", "          node --check sync.js\n          node --check market-experience.js\n", 1)
if "node tests/market-experience.test.cjs" not in pages:
    require(pages, "          node tests/market-categories.test.cjs\n", ".github/workflows/pages.yml")
    pages = pages.replace(
        "          node tests/market-categories.test.cjs\n",
        "          node tests/market-categories.test.cjs\n"
        "          node tests/market-experience.test.cjs\n"
        "          node tests/market-live-accounting.test.cjs\n",
        1,
    )
write(".github/workflows/pages.yml", pages)

# 12) Temporary discovery probe is not part of the production contract.
(ROOT / "scripts/probe-supersave.cjs").unlink(missing_ok=True)

# 13) Decision record.
decisions = read("docs/DECISIONS.md")
if "## D-006 — Preços reais pesquisados entram como estimativa auditável" not in decisions:
    decisions += '''

## D-006 — Preços reais pesquisados entram como estimativa auditável

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O utilizador pediu que a Lista de compras use preços reais pesquisados e que o valor selecionado seja contabilizado na lista, sem manter dados fictícios. A aplicação continua estática/local-first e não deve tratar uma consulta de preço como prova do montante efetivamente pago.

### Decisão

Continente e Pingo Doce são pesquisados através do endpoint público `cesta.pt/mcp`. Mercadona Portugal usa apenas observações do Open Prices localizadas em Portugal e com comprovativo. O preço escolhido é guardado em `estimatedCents`; `actualCents` permanece reservado ao valor efetivamente pago. Ao marcar o item como comprado, o cálculo contabilizado usa `actualCents` quando existe e, caso contrário, usa a estimativa pesquisada.

A CSP autoriza exclusivamente `cesta.pt` e `prices.openfoodfacts.org` para este fluxo, além da API GitHub já existente. A aplicação não envia dados financeiros do cofre a estas fontes.

### Motivo

Esta separação permite que o total da lista reflita imediatamente o preço real consultado sem afirmar que esse foi necessariamente o preço de compra. Também mantém rastreabilidade, evita preços inventados e preserva a lógica financeira existente.

### Limitação

A disponibilidade, cobertura e atualidade dependem das fontes externas. Em particular, Mercadona é uma observação comunitária com data, não uma API oficial em tempo real. Quando não existe evidência adequada, a aplicação deve mostrar ausência de preço em vez de fabricar um valor.
'''
    write("docs/DECISIONS.md", decisions)

# 14) Changelog.
changelog = read("docs/CHANGELOG.md")
heading = "# Changelog Técnico — Conta de Casa\n"
section = '''
## 2026-09-05 — Mercado v52 com preços reais e contabilização da lista

### Alterações

- removidos preços e imagens de demonstração do fluxo **Adicionar produto**;
- pesquisa real de Continente e Pingo Doce através de `cesta.pt/mcp`;
- Mercadona Portugal limitada a observações Open Prices em lojas portuguesas com comprovativo e data;
- o preço selecionado é guardado em `estimatedCents` e atualiza imediatamente **Estimado total** e **Por comprar**;
- quando o item é marcado como comprado, **Gasto contabilizado** usa o preço real registado pelo utilizador ou, enquanto esse valor não existir, a estimativa pesquisada;
- `actualCents` continua separado para não confundir preço consultado com preço efetivamente pago;
- CSP alargada apenas a `cesta.pt` e `prices.openfoodfacts.org`;
- ligação para produto oficial é aberta apenas após validação do host e clique explícito do utilizador;
- Service Worker, cache busting e build pública atualizados para v52;
- acrescentado teste dinâmico de contabilização de preços e reforçadas as verificações de segurança/origens externas;
- removido o probe temporário do Super Save, que não faz parte do contrato de produção.

### Segurança e privacidade

Sem credenciais de supermercado, API keys ou tokens de terceiros. O conteúdo remoto é tratado como não confiável e escapado antes de apresentação. A pesquisa envia apenas o termo pesquisado às fontes selecionadas; o cofre financeiro permanece local/cifrado.

'''
if "## 2026-09-05 — Mercado v52 com preços reais e contabilização da lista" not in changelog:
    if not changelog.startswith(heading):
        raise SystemExit("Unexpected CHANGELOG heading")
    changelog = heading + section + changelog[len(heading):]
    write("docs/CHANGELOG.md", changelog)

print("v52 finalization patch applied")
