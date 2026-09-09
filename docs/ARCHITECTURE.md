# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Revisões públicas base: `75-header2`, `75-stability1`, `75-layout1`, `75-drawer2`, `75-featured1`, `75-image-library1`
Revisão em validação/publicação: `75-catalog1`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

Conta de Casa é uma PWA estática distribuída por GitHub Pages. O modelo é local-first: regras de negócio, persistência financeira, formulários, cifragem e estado executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 usa camadas versionadas sobre o núcleo funcional. Alterações de apresentação, catálogo e imagens não justificam reescrever `core.js` ou `finance.js`.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB financeira, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

`75-image-library1` e `75-catalog1` são isoladas deste núcleo.

## 3. Camadas principais

### Apresentação

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional existente;
- `v75-architecture.css/js`: arquitetura v75;
- `v75-header-refinement.css`: topbar móvel;
- `v75-stability.css/js`: estabilidade transversal;
- `v75-layout-polish.css`: geometria das páginas;
- `v75-market-featured.css/js`: Produtos em destaque;
- `v75-drawer-theme.css`: drawer móvel final.

### Mercado e imagens

- `market-experience.js`: pesquisa atual através de `cesta.pt`;
- `market-retailer-image-policy.js`: política de fotografia oficial;
- `market-image-audit.js`: auditoria/zoom/fallback de imagens;
- `market-official-images.js`: resolução e validação oficial por retalhista + PID;
- `market-image-library.js`: persistência de metadados de imagens oficiais (`75-image-library1`);
- `market-catalog-image-resolver.js`: resolução direta pela URL oficial exata já conhecida (`75-catalog1`);
- `market-visual-catalog.js`: catálogo visual progressivo por categorias (`75-catalog1`);
- `market-visual-catalog.css`: apresentação responsiva do catálogo visual.

## 4. Persistência

Existem três responsabilidades distintas:

1. **IndexedDB financeira existente** — estado real da aplicação; não é alterada por `75-catalog1`.
2. **`conta-de-casa-market-image-library`** — metadados de imagens oficiais por `marketId|pid`, TTL positivo de 45 dias.
3. **`conta-de-casa-market-visual-catalog`** — índice local de SKUs encontrados pelo catálogo visual.

A base do catálogo visual contém:

- store `products`, chave `marketId|pid`;
- índices `categories` (multiEntry), `marketId` e `lastSeenAt`;
- store `meta` para cursor e orçamento diário de enriquecimento.

Registo de produto visual:

- `marketId`;
- `pid`;
- `name`;
- `pack`;
- `categories[]`;
- `sourceUrl` oficial validada;
- `firstSeenAt` / `lastSeenAt`.

**Não existe campo de preço no catálogo visual.** Assim, o índice não transforma um preço observado anteriormente num preço atual.

## 5. Catálogo visual `75-catalog1`

### Categorias iniciais

- Bebidas;
- Lacticínios e ovos;
- Frutas e legumes;
- Carne e peixe;
- Padaria e pastelaria;
- Mercearia / Despensa;
- Congelados;
- Snacks e doces;
- Higiene pessoal;
- Limpeza;
- Bebé;
- Animais.

Cada categoria possui termos-semente usados apenas para descoberta progressiva. A categoria é uma organização da aplicação; não é apresentada como taxonomia oficial do retalhista.

### Descoberta

`market-visual-catalog.js` chama `cesta.pt/mcp` → `search_products` com `stores: ['pingodoce','continente']` e `limit: 20`. Apenas resultados com:

- loja suportada;
- PID numérico válido;
- URL oficial da página;
- PID da URL igual ao PID do resultado

podem entrar no índice.

Deduplicação é sempre `marketId|pid`.

### Enriquecimento progressivo e limites

O mecanismo não é um crawler massivo. Limites atuais:

- `SESSION_QUERY_BUDGET = 18`;
- `DAILY_QUERY_BUDGET = 48`;
- `BACKGROUND_QUERY_INTERVAL_MS = 15000`;
- `SESSION_IMAGE_BUDGET = 20`;
- `BACKGROUND_IMAGE_INTERVAL_MS = 8000`;
- máximo de uma pesquisa Cesta em voo através de `queryInFlight`;
- resolução direta de imagens com concorrência máxima 2.

O enriquecimento automático é suspenso/adiante quando:

- `navigator.onLine === false`;
- `navigator.connection.saveData === true`;
- `document.visibilityState === 'hidden'`.

O cursor de termos é persistido em `meta`, permitindo continuar em sessões seguintes. A arquitetura suporta crescimento gradual para centenas/milhares de SKUs sem declarar cobertura integral imediata.

## 6. Preços: contrato obrigatório

O catálogo visual **não guarda nem mostra preço como atual**.

Quando o utilizador toca em **Ver preço atual**:

1. o produto é recuperado do índice local;
2. o nome preenche `#marketCatalogSearch`;
3. é emitido o mesmo evento `input` usado pela pesquisa existente;
4. `market-experience.js` consulta novamente a fonte viva;
5. só essa pesquisa atual fornece o preço mostrado no fluxo normal.

Mantêm-se as regras:

- preço pesquisado → estimativa;
- `estimatedCents` e `actualCents` continuam no modelo financeiro existente;
- GTIN/PID identifica artigo, não prova preço;
- fotografia nunca prova preço/transação.

## 7. Imagens do catálogo visual

`market-catalog-image-resolver.js` é carregado depois de `market-official-images.js`. Ele preserva a API existente e acrescenta um resolvedor direto quando o catálogo já conhece `sourceUrl`.

Fluxo:

1. validar `sourceUrl` com `CDCOfficialMarketImages.safeProductUrl`;
2. ler a página oficial através de `r.jina.ai` com GET simples, sem credenciais;
3. extrair URLs candidatas;
4. validar cada imagem com `safeOfficialImageUrl` e PID exato;
5. verificar carregamento da imagem;
6. entregar o resultado à `market-image-library.js`;
7. se o caminho direto falhar, voltar ao resolvedor oficial existente.

Hosts/paths aceites continuam restritos:

- Continente: `www.continente.pt` + `Sites-col-master-catalog` + PID correspondente;
- Pingo Doce: `static.pingodoce.pt` + `Sites-pingo-doce-master` + `images/large|medium|small` + PID correspondente.

Não são copiados binários para GitHub.

## 8. Interface do catálogo

A secção `#marketVisualCatalog` é montada dentro de `.market-browser`, antes dos resultados vivos. Inclui:

- título **Produtos por categoria**;
- faixa horizontal de categorias;
- filtro Todos / Continente / Pingo Doce;
- estatísticas de produtos indexados e imagens validadas;
- botão **Atualizar**;
- grelha de cartões;
- fallback local enquanto não existe fotografia oficial validada;
- ação **Ver preço atual**.

Responsividade:

- desktop: 3 colunas;
- até 680 px: 2 colunas;
- até 430 px: controlos compactos e filtros em largura total;
- até 350 px: 1 coluna/composição lateral;
- fotografias: `object-fit: contain`;
- foco visível e `prefers-reduced-motion` preservados.

## 9. Ordem dos assets públicos

### CSS relevante

1. `v74-experience.css`;
2. `v75-architecture.css`;
3. `v75-header-refinement.css`;
4. `v75-stability.css`;
5. `v75-layout-polish.css`;
6. `v75-market-featured.css`;
7. `market-visual-catalog.css?v=75-catalog1`;
8. `v75-drawer-theme.css`.

### Scripts da cadeia Mercado/imagens

1. `market-image-library.js?v=75-image-library1`;
2. `market-retailer-image-policy.js`;
3. `market-image-audit.js`;
4. `market-official-images.js`;
5. `market-catalog-image-resolver.js?v=75-catalog1`;
6. `market-visual-catalog.js?v=75-catalog1`;
7. restante runtime Mercado/v75.

Esta ordem garante que o catálogo visual reutiliza validadores e biblioteca já existentes.

## 10. Navegação e acessibilidade

Navegação móvel permanece **Início / Despesas / Mercado / Planeamento / Mais**. O drawer continua do lado direito e `mobile-menu-toggle.js` permanece responsável por hambúrguer/X, Escape, foco e swipe.

O catálogo não cria nova rota. É uma secção da página Mercado e preserva safe areas, zoom, teclado, foco e alvos tácteis.

## 11. Segurança e privacidade

Os módulos `75-catalog1` não referenciam:

- `appState`;
- `saveState()`;
- `commit()`;
- `estimatedCents` / `actualCents` / `amountCents`;
- PIN, palavra-passe, chaves ou tokens.

Requests externos usam `credentials: 'omit'` e `referrerPolicy: 'no-referrer'` onde aplicável. URLs de retalhista e imagem são validados antes de utilização.

## 12. Versionamento

- `BUILD = v75`;
- `IMAGE_LIBRARY_REV = 75-image-library1`;
- `CATALOG_REV = 75-catalog1`;
- cache esperado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1`.

## 13. QA

`tests/market-visual-catalog.test.cjs` cobre:

- categorias;
- identidade exata `marketId|pid`;
- rejeição de URL não oficial;
- ausência de estado financeiro;
- budgets e condições de rede;
- resolvedor direto de imagem;
- ordem de bundle;
- CSS/breakpoints;
- cache Service Worker.

O CI da branch terminou verde no SHA `8e5d61c3c68771cd3e1cd5990cbe201e30fb7baa`, junto com a suite financeira, segurança, Mercado, responsividade, acessibilidade, navegação e sincronização.

## 14. Validação física pendente

Confirmar em iPhone/Safari/PWA, Android e desktop:

- montagem única da secção sem duplicações;
- categorias e filtros;
- crescimento progressivo entre sessões;
- comportamento offline/Save-Data;
- imagens corretas por SKU;
- fallback sem layout quebrado;
- **Ver preço atual** a disparar a pesquisa viva;
- ausência de alterações a preços/quantidades/estado financeiro;
- ausência de overflow em 320/350/375/390/430 px e tablet/desktop.
