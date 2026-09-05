# Arquitetura — Conta de Casa

Atualizado: 5 de setembro de 2026
Build em validação: v60

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. Estado financeiro, cifragem, persistência, formulários e regras de negócio permanecem local-first. Não existe backend próprio da aplicação.

A distribuição pública é composta por `scripts/prepare-pages.cjs`, validada em CI e publicada pelo workflow Pages. A v60 acrescenta um **pipeline de catálogo visual no build** para obter fotografias publicadas pelo Continente e Pingo Doce sem transformar o browser num scraper.

## Camadas principais

### Interface

- `index.html` — estrutura semântica, CSP base, páginas e diálogos.
- `styles.css` — estilos base/legados.
- `design-system.css` — tokens e componentes principais.
- `mobile-layout.css` — estabilidade do viewport/Safari.
- `market-experience.css` — descoberta/comparação de produtos.
- `market-barcode.css` — scanner EAN/UPC/GTIN.
- `ui-icons.css` — sistema Lucide e normalização visual.
- `invoice-capture.css` — captura QR de faturas.
- `app-update.css` — Centro de Atualização.
- `market-image-audit.css` — miniaturas tácteis e visualizador de imagens.

### Runtime JavaScript

- `core.js` — estado, normalização, cifragem, IndexedDB e utilitários.
- `finance.js` — regras financeiras.
- `render.js` — renderização.
- `forms.js` — formulários e validação.
- `sync.js` — sincronização cifrada opcional.
- `events.js` — eventos, navegação, cofre, viewport e Service Worker.
- `ui-icons.js` — subset Lucide local.
- `market-experience.js` — pesquisa de preços via `cesta.pt`, resultados e criação confirmada de itens.
- `market-barcode.js` — leitura GTIN e identificação assistida.
- `invoice-capture.js` — QR fiscal.
- `app-update.js` — notas da versão e atualização da PWA.
- `market-image-audit.js` — fallback v59 através das bases Open Facts e zoom genérico.
- `market-official-images.js` — prioridade v60 para fotografia oficial de Continente/Pingo Doce.

### Build/CI

- `scripts/refresh-retailer-image-index.cjs` — lê os sitemaps oficiais e gera índices JSON fragmentados.
- `scripts/prepare-pages.cjs` — constrói `dist/`, carimba versão, injeta CSP/assets e copia os índices oficiais.
- `.github/workflows/ci.yml` — regenera o catálogo visual e executa todas as suites.
- `.github/workflows/pages.yml` — regenera novamente o catálogo da revisão testada antes do deploy.

## Modelo de dados

O schema financeiro permanece `STATE_VERSION = 5`. Não existe migração v60.

Um item de Mercado continua a usar os metadados opcionais já introduzidos anteriormente:

- `productCode`;
- `imageUrl`;
- `imageSource`;
- `imageMatchedAt`.

A v60 não adiciona binários ao cofre. A fotografia continua fora do IndexedDB; apenas a URL e proveniência são guardadas.

## Mercado — fluxo de produto

As responsabilidades continuam separadas:

1. **Pesquisa/preço:** `market-experience.js` → `cesta.pt/mcp`.
2. **Identidade do resultado:** nome + retalhista + `pid` do SKU devolvido por `cesta.pt`.
3. **Imagem oficial:** `market-official-images.js` → shard same-origin `retailer-images/<retalhista>/<prefixo>.json` → URL oficial.
4. **Fallback:** `market-image-audit.js` → Open Facts apenas quando a imagem oficial não existe.
5. **Persistência:** só após ação explícita de adicionar; a v60 acompanha a criação para associar a imagem oficial ao item criado.
6. **Preço efetivo:** `actualCents` continua independente da fotografia e do preço pesquisado.

## Pipeline oficial de imagens v60

### Fonte Continente

Índice raiz:

`https://www.continente.pt/sitemap_index.xml`

O gerador seleciona exclusivamente children compatíveis com:

`sitemap-custom_sitemap_<n>-image.xml`

Em cada `<url>` são extraídos:

- `<loc>` — URL do produto, da qual é obtido o PID final `-<pid>.html`;
- `<image:loc>` — fotografia publicada no sitemap;
- `<image:title>`/caption — usado apenas para índice de recuperação exata de itens antigos.

A URL de imagem só é aceite se pertencer ao catálogo oficial `Sites-col-master-catalog` e ao caminho de imagens de produto. O host runtime é normalizado para `www.continente.pt`.

### Fonte Pingo Doce

Índice raiz:

`https://www.pingodoce.pt/home/sitemap_index.xml`

O gerador seleciona:

`/home/sitemap_<n>-product.xml`

A imagem só é aceite se vier de `static.pingodoce.pt` e do catálogo `Sites-pingo-doce-master`.

### Invariantes do gerador

- timeout de rede e uma repetição controlada;
- limite de tamanho por XML;
- mínimo de 5 000 produtos por retalhista;
- SKU Continente `8167440` obrigatório;
- SKU Pingo Doce `739490` obrigatório;
- falha fechada: se a fonte oficial deixar de cumprir o contrato, o build falha.

A CI de referência v60 gerou 100 474 mapeamentos Continente, 16 018 Pingo Doce e 101 558 nomes exatos únicos.

## Sharding e desempenho

O catálogo completo não é descarregado no iPhone.

O build gera:

- `retailer-images/continente/<2 dígitos>.json`;
- `retailer-images/pingo-doce/<2 dígitos>.json`;
- `retailer-images/names/continente/<2 chars>.json`;
- `retailer-images/names/pingo-doce/<2 chars>.json`;
- `retailer-images/index.json`.

Um resultado novo já possui PID, portanto o runtime calcula o prefixo e carrega apenas o shard correspondente. A cache em memória impede pedidos repetidos durante a sessão.

Os shards de nome destinam-se apenas a itens antigos sem PID. Só são incluídos nomes que são únicos dentro de cada retalhista. No runtime, se um mesmo nome exato produzir correspondência em mais de um retalhista, é rejeitado como ambíguo.

## Imagem oficial versus fallback

Ordem de confiança:

1. **PID exato + sitemap oficial** — `imageSource = Continente/Pingo Doce — imagem oficial`;
2. **nome oficial exato, único e não ambíguo** — apenas para reparar item antigo;
3. **Open Facts** — fotografia de referência, nunca rotulada como oficial;
4. **placeholder** — quando não existe correspondência segura.

Não existe matching aproximado para atribuir o rótulo “imagem oficial”.

## Visualizador

A fotografia oficial é transformada num controlo focável/táctil. O toque abre `<dialog>` com:

- imagem ampliada;
- nome do produto;
- indicação de origem oficial;
- botão Fechar;
- Esc e backdrop;
- safe areas;
- tema escuro e foco visível.

O visualizador reutiliza a linguagem de `market-image-audit.css`, sem duplicar uma segunda folha visual.

## CSP e fronteiras de rede

A CSP pública v60 diferencia leitura de dados e apresentação de imagens.

### `connect-src`

Mantém apenas as origens necessárias a APIs já aprovadas:

- `'self'`;
- `https://api.github.com`;
- `https://cesta.pt`;
- APIs Open Facts previstas.

**Continente e Pingo Doce não entram em `connect-src`.** Assim o runtime não pode começar a fazer scraping/fetch arbitrário dos sites dos retalhistas.

### `img-src`

Acrescenta exclusivamente:

- `https://www.continente.pt`;
- `https://static.pingodoce.pt`;

além das origens Open Facts já utilizadas.

O navegador pode apresentar `<img>` cross-origin sem o CORS necessário para ler o corpo do recurso. O conteúdo da imagem não é exposto ao JavaScript.

## Service Worker v60

Cache:

`conta-de-casa-public-v60-official-retailer-images`

Os assets estáticos essenciais são precached. Os shards oficiais são tratados por uma regex estrita e entram em cache apenas quando pedidos. Não se precacheiam mais de 100 mil registos no dispositivo.

A chave pública só aceita same-origin e query de versão `?v=`; caminhos fora da allowlist/regex não são tratados pelo worker.

## Segurança e privacidade

- sem backend adicional;
- sem proxy genérico de scraping;
- sem API keys, cookies de retalhistas ou Authorization;
- nenhum dado do cofre é enviado para os sitemaps no runtime — os sitemaps são processados no GitHub Actions;
- nenhum ficheiro de imagem é copiado para o repositório/cofre; apenas URLs oficiais entram no bundle JSON;
- o preço não é inferido da imagem;
- imagem não altera `estimatedCents`, `actualCents`, quantidade ou estado de compra;
- o fallback v59 continua com `credentials:'omit'`/`referrerPolicy:'no-referrer'`.

## Build público v60

`prepare-pages.cjs`:

1. exige o índice oficial ou chama o gerador;
2. copia a allowlist estática;
3. copia `retailer-images/` para `dist/`;
4. carimba `app-build=v60` e `?v=60`;
5. injeta `market-official-images.js?v=60`;
6. injeta CSP v60;
7. carimba o registo do SW para `./sw.js?v=60`.

## Testes

`tests/market-official-images.test.cjs` protege especificamente:

- origens dos sitemaps;
- dimensão mínima do catálogo;
- mapeamentos dos SKUs de controlo;
- ausência de proxy genérico;
- resolução por PID e nome exato;
- rejeição de ambiguidades;
- CSP mínima;
- ausência de hosts dos retalhistas em `connect-src`;
- presença de shards no `dist/`;
- Service Worker v60.

As suites anteriores continuam a validar finanças, isolamento, segurança, Mercado, fallback Open Facts, scanners, ícones, responsividade, navegação, acessibilidade, atualização e sincronização.
