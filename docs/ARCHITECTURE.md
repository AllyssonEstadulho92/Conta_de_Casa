# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA

## 1. Princípios

A aplicação é uma PWA estática/local-first. Apresentação, Mercado e catálogos são camadas separadas do núcleo financeiro. Alterações visuais ou de imagens não podem reescrever persistência, cálculos, cofre ou sincronização.

Invariantes:

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- sincronização opcional apenas do envelope cifrado;
- sem passwords, tokens ou chaves embutidos.

## 2. Camadas principais

### Núcleo

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

### Mercado

- `market-experience.js`: pesquisa viva;
- `market-category-groups.js`: categorias/lista;
- `market-barcode.js`: código de barras;
- `market-image-audit.js`: estados/validação de imagens;
- `market-retailer-image-policy.js`: política contra correspondência aproximada;
- `market-official-images.js`: resolução/validação de fotografias oficiais;
- `market-image-library.js`: cache persistente de imagens por SKU;
- `market-catalog-image-resolver.js`: resolução direta quando existe página oficial exata;
- `market-visual-catalog.js`: catálogo visual progressivo;
- `pingo-doce-photo-library.js`: expansão dedicada do inventário Pingo Doce;
- `market-photo-loader.js`: estado visual rápido durante carregamento.

## 3. Biblioteca geral de imagens `75-image-library1`

Base: `conta-de-casa-market-image-library`.

Chave canónica: `marketId|pid`.

A store guarda apenas:

- mercado;
- PID;
- nome/embalagem para diagnóstico;
- URL oficial validado da fotografia;
- URL oficial do produto quando disponível;
- timestamps/expiração.

Não guarda binários, preços, faturas, dados pessoais ou credenciais.

## 4. Catálogo visual `75-catalog1`

Base: `conta-de-casa-market-visual-catalog`.

Stores:

- `products`: `marketId|pid`, nome, embalagem, categorias, página oficial, timestamps;
- `meta`: cursor e orçamento de descoberta.

O catálogo usa `cesta.pt` para descobrir produtos reais de Continente/Pingo Doce e não persiste preço. O clique em **Ver preço atual** transfere o nome para `#marketCatalogSearch` e aciona a pesquisa viva existente.

## 5. Biblioteca dedicada Pingo Doce `75-pd-photo1`

Base: `conta-de-casa-pingo-doce-photo-library`.

Stores:

- `products` com chave `pingo-doce|pid`;
- `meta` para cursor, orçamento diário e timestamps.

Campos do produto:

- `marketId = pingo-doce`;
- `pid`;
- `name`;
- `pack`;
- `categoryId`;
- `sourceUrl` oficial;
- `imageState = pending | ready | missing`;
- `firstSeenAt`, `lastSeenAt`, `imageCheckedAt`.

Fluxo:

1. escolhe um termo do plano de descoberta;
2. chama `search_products` apenas com `stores:['pingodoce']`;
3. aceita apenas resultados com PID e URL oficial Pingo Doce coerentes;
4. guarda o SKU no inventário dedicado;
5. envia SKUs pendentes para a fila de fotografias;
6. consulta primeiro `CDCMarketImageLibrary`;
7. se não existir cache, usa `CDCOfficialMarketImages.resolve()` com a página oficial exata;
8. o resolvedor direto pode ler a página por `r.jina.ai`, mas a URL de imagem só é aceite pelo validador oficial existente;
9. fotografia validada é persistida na biblioteca geral `75-image-library1`;
10. o inventário dedicado marca o SKU como `ready` ou `missing`.

A biblioteca Pingo Doce não guarda a fotografia em duplicado nem altera o modelo financeiro.

## 6. Plano de cobertura Pingo Doce

A descoberta possui 15 grupos e mais de 200 termos. O objetivo é aumentar a cobertura de catálogo ao longo de sessões reais.

Limites:

- 24 pesquisas/sessão;
- 72 pesquisas/dia;
- 20 s entre passos automáticos;
- 30 tentativas de imagem/sessão;
- 120 tentativas de imagem/dia;
- fila pendente até 120 itens por ciclo;
- sem trabalho quando offline, página oculta ou `Save-Data` está ativo.

Não existe no projeto uma API oficial exaustiva que prove cobertura instantânea de 100% do catálogo Pingo Doce. A arquitetura deve representar isto como cobertura progressiva, não como cópia integral garantida.

## 7. Carregador de imagens `75-photo-loader1`

`market-photo-loader.js` é uma camada de apresentação sem chamadas externas próprias.

Responsabilidades:

- detetar cartões visuais ainda sem fotografia;
- substituir o fallback temporário por skeleton/shimmer e spinner;
- mostrar **A carregar fotografia…**;
- consultar a biblioteca persistente a cada janela curta de atualização;
- usar `loading='eager'` para imagens já resolvidas nos cartões visíveis;
- iniciar um aquecimento limitado da biblioteca Pingo Doce ao primeiro acesso ao Mercado;
- evitar polling permanente (`POLL_MS = 850`, `MAX_POLLS = 18`);
- respeitar `prefers-reduced-motion`.

## 8. Ordem de assets relevante

CSS:

1. base;
2. v74/v75;
3. `v75-market-featured.css`;
4. `market-visual-catalog.css`;
5. `pingo-doce-photo-library.css`;
6. `market-photo-loader.css`;
7. `v75-drawer-theme.css`.

Scripts de Mercado/imagens:

1. `market-image-library.js`;
2. política/auditoria;
3. `market-official-images.js`;
4. `market-catalog-image-resolver.js`;
5. `market-visual-catalog.js`;
6. `pingo-doce-photo-library.js`;
7. `market-photo-loader.js`;
8. runtime/apresentação restantes.

## 9. Segurança

As novas camadas não podem referenciar:

- `appState`;
- `saveState()`;
- `commit()`;
- `estimatedCents`;
- `actualCents`;
- `amountCents`;
- PIN/passwords/tokens.

A página Pingo Doce é aceite apenas em HTTPS, host `pingodoce.pt|www.pingodoce.pt`, path `/home/produtos/` e PID final correspondente. A fotografia final continua limitada ao host/path oficial já definido em `market-image-library.js`.

## 10. Responsividade/acessibilidade

- mobile principal <=820 px;
- refinamentos 540/430/350 px;
- safe areas iOS preservadas;
- loader não altera altura estrutural do cartão;
- spinner não é informação essencial; o texto de estado visual é complementar;
- `prefers-reduced-motion` remove animações;
- foco dos controlos da biblioteca permanece visível;
- tema escuro possui estado específico.

## 11. Versionamento

- `CATALOG_REV = 75-catalog1`;
- `PD_PHOTO_REV = 75-pd-photo1`;
- `PHOTO_LOADER_REV = 75-photo-loader1`;
- cache esperado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1-pd-photo1-photo-loader1`.

## 12. QA

CI e Pages devem executar:

- `tests/market-image-library.test.cjs`;
- `tests/market-visual-catalog.test.cjs`;
- `tests/pingo-doce-photo-library.test.cjs`;
- `tests/market-photo-loader.test.cjs`;
- regressões de finanças, segurança, responsividade, navegação, acessibilidade e sync.

Validação final em hardware continua obrigatória para comportamento de rede, cache e percepção de velocidade.