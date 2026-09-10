# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build: `v75`  
Distribuição: GitHub Pages / PWA

Revisões integradas: `75-usability1`, `75-pages1`, `75-assets1`, `75-startup2`, `75-catalog4`, `75-photo-loader3`.  
Revisão candidata da Parte 3: `75-market1`.

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, recursos visuais, Mercado e catálogos permanecem separados.

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sync opcional apenas do envelope cifrado;
- nenhuma password, token, chave ou kit ID no código público;
- preço pesquisado do Mercado é estimativa; preço efetivamente pago é valor confirmado separado.

## 2. Núcleo funcional

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos.

Camadas v75 de apresentação não podem alterar cálculos, pagamentos, faturas, QR, scanner, quantidades, preços, PIN ou derivação de chave.

## 3. Composição e distribuição

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` a partir de allowlist explícita e injeta as revisões publicadas.

Ordem conceptual relevante:

1. base: `styles.css`, `design-system.css`, `mobile-layout.css`;
2. experiência e componentes v74;
3. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
4. `v75-pages.css` — Início, Despesas e Planeamento;
5. `asset-loader.css` — estados genéricos de assets;
6. componentes especializados do Mercado, incluindo catálogo e `market-photo-loader.css/js`;
7. `v75-market-flow.css` — refinamento de pesquisa, filtros e fluxo de compra;
8. `v75-usability.css` — política final de interação/anti-zoom;
9. runtimes de apresentação, com `v75-market-flow.js` depois de `v75-market-featured.js`.

## 4. Navegação v75

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

Drawer/desktop acrescenta Relatórios, Metas, Segurança e Diagnóstico. `v75-architecture.js` mantém os pais de navegação.

## 5. Início, Despesas e Planeamento

`75-pages1` é apenas apresentação. Despesas usa a vista canónica de `renderBills()`/`filterBills()` também no mobile, com Lista/Calendário, filtros, resumo e cartões. Planeamento continua a usar `renderPlanning()` para saldo, orçamento, conciliação e rendimentos. Início continua a derivar métricas do núcleo existente.

## 6. Tipografia e ícones

Stack atual:

`Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif`

Política `75-assets1`:

- preferir uma família tipográfica, máximo de duas;
- licença/origem/formato verificados antes de incorporar;
- self-host e WOFF2 quando permitido;
- CSP não é expandida apenas para experimentar fontes.

Ícones principais: **Lucide SVG local** via `ui-icons.js`/`ui-icons.css`. Bibliotecas externas permanecem fontes secundárias condicionais. Botões só com ícone precisam de nome acessível; decorativos usam `aria-hidden`.

## 7. Biblioteca e loader transversal — `75-assets1`

`design-asset-library.js` expõe `CDCDesignAssetLibrary`; `asset-loader.js` expõe `CDCAssetLoader`.

O loader é opt-in:

- imagens: lazy, async decode, prioridade, `IntersectionObserver`, estados loading/ready/error e `no-referrer`;
- vídeo/áudio: `preload="metadata"` por defeito e sem autoplay imposto;
- Lottie: JSON local, runtime local previamente aprovado, `prefers-reduced-motion` e fallback;
- same-origin por defeito e sem injeção automática de scripts/CDNs.

O loader genérico não escolhe fotografias do catálogo de supermercado e não substitui `75-photo-loader3`.

## 8. Mercado — modelo de dados e contabilidade

`renderMarket()` apresenta a lista mensal. `marketMetrics()` e `finance.js` preservam o cálculo por quantidade.

Cada item mantém campos distintos:

- `estimatedCents`: preço pesquisado/estimado por unidade;
- `actualCents`: preço real confirmado por unidade;
- `quantity`: quantidade;
- `purchased`: estado de compra.

Regra vigente: um produto vindo do browser é criado com `estimatedCents = product.priceCents`, `actualCents = 0` e `purchased = false`. A revisão `75-market1` não escreve nenhum destes campos.

Quando um item comprado ainda não tem preço real, o cálculo existente pode contabilizar provisoriamente a estimativa e `marketMetrics()` sinaliza `missingReal`. A UI deve tornar essa pendência visível e pedir confirmação do preço pago.

## 9. Mercado — pesquisa

Existem dois contextos distintos:

### Browser de produtos

`market-experience.js` consulta as fontes configuradas para encontrar produtos/preços. O resultado é apenas uma **estimativa de compra** até existir preço real confirmado.

`75-market1` mantém os handlers existentes e acrescenta apenas qualificação visual:

- `Preço pesquisado`;
- nota explícita sobre estimativa;
- ação `Adicionar` visível;
- grelha do cartão com três colunas explícitas: fotografia, conteúdo e ação.

### Pesquisa da lista

`#marketSearch` não consulta lojas: filtra `appState.market` já renderizado. `75-market1` altera apenas a comunicação para **Pesquisar na minha lista…**, preservando o evento existente que chama `renderMarket()`.

## 10. Mercado — filtros e fluxo mobile

Filtros canónicos existentes:

- Estado: todos / por comprar / comprados / comprados sem preço real;
- Categoria;
- Ordenação: pendentes primeiro, A–Z, maior estimativa, maior gasto, atualização recente.

`75-market1` não cria filtros novos. Torna os rótulos visíveis no mobile e reorganiza a grelha responsivamente.

No fluxo mobile, `market-shopping-focus.js` continua responsável pela compactação e pelos grupos. `v75-market-flow.js` atua depois:

- estado visual: `Por comprar`, `Preço por confirmar`, `Comprado`;
- significado do valor compacto: `Estimativa total`, `Estimativa provisória`, `Total contabilizado`;
- item comprado com `actualCents <= 0`: o bloco `.market-mobile-real` existente é movido para fora de `Detalhes`, permanecendo dentro de `#marketList`;
- o input conserva `data-market-actual`, portanto o handler delegado de `events.js` continua a guardar o preço real;
- o grupo Comprados abre automaticamente quando contém uma pendência de preço real.

Não existe nova mutação financeira nessa camada.

## 11. Mercado — catálogo e fotografias

Identidade canónica:

`marketId|pid`

Componentes:

- `market-image-library.js`: biblioteca partilhada de URL validada;
- `market-visual-catalog.js`: índice progressivo e renderer incremental;
- `pingo-doce-photo-library.js`: inventário dedicado;
- `market-catalog-image-resolver.js`: resolução exata `75-catalog4`;
- `market-photo-loader.js`: loader especializado `75-photo-loader3`.

Regras:

- URL oficial deve corresponder ao retalhista e PID esperado;
- falha de fotografia nunca remove o SKU;
- `75-photo-loader3` mantém estados carregar → validar → `Sem fotografia`, com cooldown antes de retry automático;
- `75-market1` não altera rede/cache/resolução. Apenas espelha `is-photo-loading` para `aria-busy` nos cartões do catálogo;
- imagens do browser live, que não fazem parte do pipeline especializado por PID, podem usar `CDCAssetLoader` para estados genéricos de loading/error.

## 12. Scanner e QR

`75-market1` não contém lógica de ZXing, BarcodeDetector, scanner, QR ou captura de fatura. Na Parte 3 não foi encontrado erro funcional comprovado que justificasse alterar esse subsistema.

## 13. Mobile, acessibilidade e anti-zoom

`75-usability1` continua depois de `v75-market-flow.css`:

- inputs/selects/textareas com pelo menos 16 px no mobile;
- `touch-action: manipulation` em controlos;
- alvos tácteis 44/48 px;
- sem `user-scalable=no` ou `maximum-scale=1`;
- pinch-to-zoom preservado.

`75-market1` acrescenta `aria-busy` no catálogo visual e suporta `forced-colors`/`prefers-reduced-motion` no CSS.

## 14. Segurança e CSP

`75-market1`:

- não chama `commit()` nem `saveState()`;
- não atribui `estimatedCents`, `actualCents`, `quantity` ou `purchased`;
- não introduz endpoints, origem CSP, token, telemetria ou segredo;
- não toca em `core.js`, `finance.js`, IndexedDB financeiro, PIN, PBKDF2, AES-GCM ou sync.

## 15. Distribuição e QA

`v75-market-flow.css/js` são publicados como `75-market1`, incluídos no Service Worker e no cache com sufixo final `market1`. O CSS especializado fica antes de `v75-usability.css`; o JS é executado depois de `v75-market-featured.js`.

`tests/v75-market-flow.test.cjs` verifica:

- isolamento financeiro;
- distinção entre pesquisa live e pesquisa da lista;
- promoção do campo de preço real pendente;
- qualificação de estimativa/valor contabilizado;
- geometria de três colunas do browser;
- `marketId|pid` e verificação de PID;
- preservação de `75-photo-loader3`;
- ausência de alterações de scanner;
- inclusão e ordem no bundle Pages/Service Worker.

Validação física permanece necessária em Safari/PWA, Android/Chrome, tablet e desktop.
