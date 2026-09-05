# Arquitetura — Conta de Casa

Atualizado: 5 de setembro de 2026
Build em validação: v59

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A distribuição pública é composta por `scripts/prepare-pages.cjs`, validada em CI e publicada pelo workflow Pages. O Service Worker gere cache, funcionamento offline e atualização da própria aplicação.

## Camadas principais

### Estrutura e apresentação

- `index.html` — estrutura semântica, CSP base, páginas, navegação e diálogos.
- `styles.css` — estilos base/legados.
- `design-system.css` — tokens, componentes e responsividade principal.
- `mobile-layout.css` — estabilidade do viewport móvel/Safari.
- `market-experience.css` — descoberta e comparação de produtos.
- `market-barcode.css` — scanner EAN/UPC/GTIN.
- `ui-icons.css` — sistema visual Lucide e overrides finais de interface.
- `invoice-capture.css` — leitor QR de faturas.
- `app-update.css` — Centro de Atualização de Software.
- `market-image-audit.css` — miniaturas tácteis e visualizador ampliado v59.

### JavaScript

- `core.js` — estado, normalização, cifragem, IndexedDB, segurança e utilitários.
- `finance.js` — cálculos financeiros.
- `render.js` — renderização de páginas/listas.
- `forms.js` — formulários e validação.
- `sync.js` — sincronização cifrada opcional via GitHub.
- `ui-icons.js` — subset Lucide local e hidratação de controlos.
- `events.js` — eventos, navegação, viewport, cofre e Service Worker.
- `market-experience.js` — preços Pingo Doce/Continente via `cesta.pt` e criação confirmada de itens.
- `market-barcode.js` — leitura GTIN e identificação assistida.
- `invoice-capture.js` — leitura local do QR fiscal.
- `app-update.js` — Atualização de Software, notas de release e `registration.update()`.
- `market-image-audit.js` — resolução individual de imagens, enriquecimento de itens e lightbox v59.

## Modelo de dados e segurança

O schema financeiro permanece em `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. O Mercado mantém `estimatedCents` separado de `actualCents` e quantidade separada do preço unitário.

O cofre usa IndexedDB com envelope cifrado. A credencial não é persistida em claro. O modelo de acesso continua baseado em PBKDF2-SHA-256 + AES-GCM; a v59 não altera autenticação, chaves, backups ou sincronização.

Metadados opcionais de fotografia no item de Mercado:

- `productCode`;
- `imageUrl`;
- `imageSource`;
- `imageMatchedAt`.

Apenas URL/metadados são guardados. Não são persistidos binários de imagem.

## Mercado — separação de responsabilidades

O fluxo de produto mantém responsabilidades distintas:

1. **Preço e ligação oficial:** `market-experience.js` consulta `cesta.pt/mcp` para Pingo Doce e Continente.
2. **Código de barras:** `market-barcode.js` lê GTIN localmente e pode identificar o produto.
3. **Fotografia:** `market-image-audit.js` resolve uma referência visual sem alterar a origem do preço.
4. **Persistência:** apenas depois de ação explícita do utilizador o produto entra em `appState.market`.

Um GTIN identifica o SKU, mas não prova o preço. Uma fotografia identifica visualmente um produto, mas não é tratada como prova do preço nem como imagem oficial do retalhista.

## Auditoria de imagens — v59

### Problema corrigido

A v57 fazia uma pesquisa ampla no Open Food Facts para o termo inteiro. Como o número de candidatos era limitado, muitos resultados específicos de uma pesquisa ampla como “café” ficavam com placeholder mesmo quando existia uma fotografia pública noutro registo.

A v59 audita **cada produto individualmente** e transforma qualquer fotografia disponível numa ação de ampliação.

### Fluxo de resolução

Para cada cartão de pesquisa ou item guardado sem fotografia:

1. determinar nome, embalagem/categoria e códigos disponíveis;
2. se existir GTIN, tentar correspondência exata;
3. para resultados Continente, usar o `pid` já devolvido pelo fluxo cesta.pt para consultar `get_product` e extrair EAN quando disponível;
4. consultar a base Open Facts mais adequada ao tipo de produto;
5. sem código, pesquisar nome + embalagem;
6. pontuar candidatos por cobertura de palavras, precisão, nome, marca e quantidade;
7. aceitar apenas pontuação >= `0.74`;
8. manter placeholder se não existir correspondência segura.

A resolução limita-se a três produtos em simultâneo (`MAX_CONCURRENT_RESOLUTIONS=3`) para evitar sobrecarga de rede.

### Fontes de imagem autorizadas

- `world.openfoodfacts.org` / hosts de imagens Open Food Facts;
- `world.openbeautyfacts.org` / hosts de imagens Open Beauty Facts;
- `world.openproductsfacts.org` / hosts de imagens Open Products Facts;
- `world.openpetfoodfacts.org` / hosts de imagens Open Pet Food Facts.

Seleção aproximada:

- alimentação/bebidas → Food;
- higiene/cosmética → Beauty;
- limpeza/casa/parafarmácia/produtos gerais → Products;
- alimentação animal → Pet Food.

Existe fallback entre bases quando necessário.

### Porque não fazer scraping direto das páginas Continente/Pingo Doce

A aplicação é uma PWA estática no browser. As páginas dos retalhistas não constituem uma API CORS estável para a PWA extrair HTML/imagens diretamente. Forçar essa recolha exigiria um backend/proxy externo, introduzindo disponibilidade, quotas, privacidade, termos de utilização e uma nova superfície de segurança.

Decisão v59: **não introduzir proxy genérico**. Quando `cesta.pt` fornece um identificador Continente capaz de resolver EAN, esse identificador é usado para aumentar a precisão; a imagem continua a vir de uma base de produto permitida. Sem correspondência pública suficientemente segura, o placeholder é o comportamento correto.

### Persistência de enriquecimento

Se a auditoria encontrar uma imagem para um item guardado, atualiza os metadados do item e chama `saveState()` de forma debounced. Isto não cria uma transação financeira nem altera `updatedAt` do item apenas para efeitos de preço; é enriquecimento visual do registo existente.

### Ampliação

`market-image-audit.js` converte a superfície `.market-product-photo` com imagem real num botão acessível e abre `#marketProductImageViewer`.

O visualizador:

- usa `<dialog>`;
- apresenta imagem em `object-fit: contain`;
- suporta toque/clique, Esc, backdrop e botão Fechar;
- respeita `100dvh`, `100svh` e `env(safe-area-inset-*)`;
- suporta dark mode e `prefers-reduced-motion`;
- mantém `referrerPolicy='no-referrer'`.

## CSP v59

O template fonte continua conservador. Na composição pública, `prepare-pages.cjs` expande apenas as origens necessárias à v59:

`img-src`:

- `https://*.openfoodfacts.org`
- `https://*.openbeautyfacts.org`
- `https://*.openproductsfacts.org`
- `https://*.openpetfoodfacts.org`

`connect-src` mantém as origens já usadas e acrescenta apenas:

- `https://world.openbeautyfacts.org`
- `https://world.openproductsfacts.org`
- `https://world.openpetfoodfacts.org`

`cesta.pt` já era permitido pelo Mercado. Não existe `connect-src *`, proxy genérico ou endpoint próprio novo.

## Privacidade de rede

Pedidos de imagem/detalhe usam:

- `credentials:'omit'`;
- `referrerPolicy:'no-referrer'`;
- timeout/AbortController;
- sem Authorization/API key.

A resolução envia apenas identificadores/nomes necessários do produto. Não envia faturas, montantes financeiros, PIN, chave do cofre, token GitHub ou perfil pessoal.

## Centro de Atualização — v58/v59

`app-update.js` acrescenta **Definições → Atualização de Software**. A verificação é same-origin e usa o Service Worker:

1. obter o registo;
2. `registration.update()`;
3. observar `installing/waiting`;
4. enviar `SKIP_WAITING` quando necessário;
5. `controllerchange` provoca reload através do listener existente.

`APP_RELEASE_NOTES` é a fonte visível de “Mais detalhes”. A v59 acrescenta as alterações de imagem e ampliação.

## Bundle público v59

`scripts/prepare-pages.cjs`:

1. gera `dist/` por allowlist;
2. copia apenas assets permitidos;
3. carimba `app-build=v59` e query strings `?v=59`;
4. injeta `app-update.*` e `market-image-audit.*`;
5. aplica a CSP pública v59;
6. carimba `dist/events.js` para `./sw.js?v=59`.

O Service Worker usa:

`conta-de-casa-public-v59-product-images`

Novos assets offline:

- `./market-image-audit.css`
- `./market-image-audit.js`

## Faturas e QR

`invoice-capture.js` continua a atuar apenas como preenchimento assistido. Vídeo/imagem são processados localmente e não persistidos. O QR fiscal preenche apenas campos comprováveis e mantém revisão explícita antes de guardar.

## Ícones e UI

Lucide permanece a linguagem visual oficial, vendorizada localmente em `ui-icons.js`. Snapshot de origem:

`94e4cb9d9db5907053ebf3636a97c45529cf776b`

Não há icon font/CDN em runtime. Controlos mantêm semântica nativa; ícones decorativos são `aria-hidden`; botões icon-only têm nomes acessíveis.

## Viewport e acessibilidade

- shell estrutural: `100dvh` / `100svh`;
- `VisualViewport`: apenas comportamento transitório de teclado/diálogos;
- safe areas mantidas em navegação, scanners, cofre, update center e visualizador de imagem;
- foco visível e alvos tácteis >= 44/48 px conforme componente;
- `prefers-reduced-motion` remove movimento não essencial.

## CI e deploy

`.github/workflows/ci.yml` valida sintaxe e suites de regressão. A v59 acrescenta `tests/market-image-audit.test.cjs`.

`.github/workflows/pages.yml` repete a validação antes de executar `prepare-pages.cjs` e publicar apenas `dist/`.

A branch v59 obteve CI `33995086764` com conclusão `success` antes da atualização documental.

## Regras de manutenção

- não apresentar uma imagem aproximada quando o score ficar abaixo do limiar;
- preferir GTIN/EAN exato sempre que disponível;
- preço e fotografia devem permanecer fontes independentes;
- não introduzir proxy de scraping sem decisão arquitetural própria e análise de privacidade/segurança/termos;
- novas origens de imagem/API exigem allowlist CSP explícita, teste e documentação;
- novos assets públicos exigem entrada explícita em `prepare-pages.cjs` e `sw.js`;
- cada release deve atualizar `APP_RELEASE_NOTES`, BUILD, cache e testes de freshness;
- validar em iPhone/Safari e Android/Chrome qualquer alteração que envolva `<dialog>`, câmara, safe areas ou interação tátil.
