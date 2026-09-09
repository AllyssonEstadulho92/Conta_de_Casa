# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA

## 1. Princípios e invariantes

A aplicação é uma PWA estática/local-first. Apresentação, Mercado e catálogos são camadas separadas do núcleo financeiro. Alterações visuais, de catálogo ou de imagens não podem reescrever persistência, cálculos, cofre ou sincronização.

Invariantes:

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- sincronização opcional apenas do envelope cifrado;
- sem passwords, tokens ou chaves embutidos.

## 2. Camadas principais

### Núcleo financeiro

- `core.js`: estado, normalização, persistência, sanitização e cifragem;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada.

### Interface v75

- `design-system.css`;
- `v74-experience.css/js`;
- `v75-architecture.css/js`;
- `v75-header-refinement.css`;
- `v75-stability.css/js`;
- `v75-layout-polish.css`;
- `v75-market-featured.css/js`;
- `v75-drawer-theme.css`;
- `mobile-menu-toggle.css/js`.

### Mercado e imagens

- `market-experience.js`: pesquisa viva de produtos/preços;
- `market-category-groups.js`: categorias/lista;
- `market-barcode.js`: código de barras;
- `market-image-audit.js`: estados/validação de imagens;
- `market-retailer-image-policy.js`: política contra correspondência aproximada;
- `market-official-images.js`: bridge e validadores oficiais;
- `market-image-library.js`: cache persistente por `marketId|pid`;
- `market-catalog-image-resolver.js`: resolução direta da fotografia oficial (`75-catalog2`);
- `market-visual-catalog.js`: índice progressivo + renderer incremental (`75-catalog3`);
- `pingo-doce-photo-library.js`: expansão dedicada Pingo Doce (`75-pd-photo1`);
- `market-photo-loader.js`: prioridade e hidratação das fotografias visíveis (`75-photo-loader2`).

## 3. Identidade e persistência de imagens

### Biblioteca geral `75-image-library1`

Base: `conta-de-casa-market-image-library`.

Chave canónica: `marketId|pid`.

Guarda apenas mercado, PID, metadados de diagnóstico, URL oficial validado, URL oficial do produto e timestamps/expiração. Não guarda binários, preços, faturas, dados pessoais ou credenciais. TTL positivo: 45 dias.

### Catálogo visual

Base: `conta-de-casa-market-visual-catalog`.

Stores:

- `products`: `marketId|pid`, nome, embalagem, categorias, página oficial, timestamps;
- `meta`: cursor e orçamento de descoberta.

O catálogo usa `cesta.pt` para descobrir SKUs reais de Continente/Pingo Doce e não persiste preço. **Ver preço atual** continua a acionar a pesquisa viva existente.

## 4. Resolvedor oficial `75-catalog2`

Entrada mínima:

- `marketId = continente|pingo-doce`;
- PID numérico;
- `sourceUrl` da página oficial exata.

Fluxo:

1. `safeProductUrl()` valida HTTPS, retalhista, path e PID;
2. `r.jina.ai` lê a página oficial exata;
3. são extraídos candidatos de fotografia;
4. `safeOfficialImageUrl()` exige host/path/PID coerentes;
5. a referência válida é entregue à biblioteca;
6. a disponibilidade real é comprovada no `<img>`; se falhar, o loader expurga a referência.

Timeout do reader: 8 s. Concorrência direta: 2.

A remoção do preflight visual duplicado continua vigente. `75-catalog3` não altera este contrato de segurança.

## 5. Renderer incremental `75-catalog3`

### Problema que substitui o comportamento de `75-catalog1`

O renderer anterior executava `grid.replaceChildren()` sempre que `renderProducts()` corria. Como a fila de imagens chamava essa função depois de aquecer uma fotografia, os cartões e `<img>` existentes eram periodicamente removidos e recriados. No iPhone/Safari isto produzia flicker visível.

### Novo contrato de renderização

`renderProducts()` passa a reconciliar a grelha pela identidade canónica `marketId|pid`:

1. obtém a lista atual da categoria/loja;
2. cria mapa dos cartões DOM já existentes por `data-visual-catalog-product`;
3. remove apenas chaves que deixaram de pertencer ao resultado;
4. reutiliza o mesmo nó DOM para a mesma chave;
5. atualiza loja, nome, embalagem, `aria-label` e fallback sem substituir a área de fotografia;
6. cria um cartão novo apenas para uma chave nova;
7. reposiciona nós existentes apenas quando a ordem realmente mudou.

Consequência: uma atualização de catálogo não reinicia uma fotografia já carregada.

### Atualização de imagens em background

`scheduleImageWarm()` deixou de executar `renderProducts()` após cada resolução de fotografia. Quando `warmOneImage()` persiste uma imagem válida, emite `cdc:market-photo-ready` com `key`, `marketId` e `pid`.

O `75-photo-loader2` já escuta esse evento e hidrata o cartão montado. O fluxo passa portanto de “resolver → reconstruir grelha” para “resolver → persistir → sinalizar → hidratar nó existente”.

## 6. Biblioteca Pingo Doce `75-pd-photo1`

Base: `conta-de-casa-pingo-doce-photo-library`.

Stores:

- `products` com chave `pingo-doce|pid`;
- `meta` para cursor, orçamento diário e timestamps.

Estados: `pending | ready | missing`.

Descoberta: 15 grupos e mais de 200 termos. Limites mantidos: 24 pesquisas/sessão, 72/dia, 30 tentativas de imagem/sessão, 120/dia, suspensão offline/oculta/Save-Data.

## 7. Carregador prioritário `75-photo-loader2`

O loader trabalha apenas com `#page-market.page.active` e não faz `fetch()` próprio.

- consulta primeiro `75-image-library1`;
- prioriza até 6 cartões renderizados;
- obtém o registo exato por `CDCMarketVisualCatalog.listCategory()`;
- resolve um SKU visível sem cache por `CDCOfficialMarketImages.resolve()`;
- aplica imagem resolvida com `loading='eager'`;
- reavalia a cada 500 ms, máximo 24 ciclos;
- após 12 s troca spinner por **Fotografia a validar…**;
- cooldown de 30 s por SKU;
- erro de `<img>` chama `CDCMarketImageLibrary.forget()`;
- no primeiro carregamento do runtime2, liberta uma vez `imagesToday` herdado do runtime anterior.

## 8. Segurança

As camadas de imagem não podem aceder a `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, passwords ou tokens.

Pingo Doce: página HTTPS oficial com `/home/produtos/` e PID final correspondente; fotografia apenas no host/path oficial autorizado com PID coerente.

Continente: regras oficiais existentes permanecem inalteradas.

`75-catalog3` altera apenas a estratégia de atualização do DOM e a sinalização de fotografia pronta; não relaxa validação de origem nem identidade.

## 9. Responsividade e acessibilidade

- mobile principal <=820 px;
- refinamentos 540/430/350 px;
- safe areas iOS preservadas;
- loader não altera geometria estrutural do cartão;
- `prefers-reduced-motion` continua respeitado;
- foco e navegação não são bloqueados;
- a reconciliação DOM reduz alterações visuais desnecessárias e preserva contexto do utilizador.

## 10. Ordem relevante de assets

1. `market-image-library.js`;
2. política/auditoria;
3. `market-official-images.js`;
4. `market-catalog-image-resolver.js?v=75-catalog3` — o ficheiro mantém lógica interna `75-catalog2`, mas recebe a revisão de distribuição do conjunto;
5. `market-visual-catalog.js?v=75-catalog3`;
6. `pingo-doce-photo-library.js?v=75-pd-photo1`;
7. `market-photo-loader.js?v=75-photo-loader2`;
8. runtime/apresentação restantes.

## 11. Cache e distribuição candidatos

Cache da correção:

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog3-pd-photo1-photo-loader2`

O Service Worker continua network-first para assets públicos com fallback para cache e invalida caches antigos quando a nova revisão é ativada.

## 12. QA

A branch `fix/v75-market-photo-flicker` passou CI completo no SHA `501c21dca60cffc32489768238c5f308e1785e34`, incluindo fontes reais, finanças, segurança, imagens, catálogo, Pingo Doce, loader, responsividade, navegação, acessibilidade e sincronização.

A validação em hardware real continua obrigatória antes de encerrar o defeito porque o flicker foi observado no iPhone/Safari/PWA e depende do comportamento efetivo do DOM/browser.
