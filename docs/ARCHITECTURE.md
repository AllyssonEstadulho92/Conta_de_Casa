# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão visual do drawer: `75-drawer2`
Revisão dos destaques do Mercado: `75-featured1`
Revisão da biblioteca de imagens: `75-image-library1`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

Conta de Casa é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 usa camadas de apresentação e apoio versionadas sobre o núcleo funcional para evitar reescrever lógica financeira por motivos visuais ou de catálogo.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

`75-image-library1` não altera nenhum destes componentes.

## 3. Camadas de apresentação e apoio

### Base funcional

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional de Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- `mobile-menu-toggle.css/js`: drawer funcional à direita e hambúrguer ↔ X;
- `v64-runtime.js`: comportamento funcional ainda necessário.

### Arquitetura v75

- `v75-architecture.css/js`: estrutura de páginas e fluxos v75;
- `v75-header-refinement.css`: topbar móvel;
- `v75-stability.css/js`: estabilidade visual, tipografia, overflow, safe areas e estados de imagem do catálogo;
- `v75-layout-polish.css`: geometria e proporção das páginas;
- `v75-market-featured.css/js`: bloco móvel **Produtos em destaque**;
- `v75-drawer-theme.css`: aparência final do drawer à direita.

### Biblioteca de imagens `75-image-library1`

`market-image-library.js` cria uma base IndexedDB separada, `conta-de-casa-market-image-library`, com store `images` e chave canónica `marketId|pid`.

Responsabilidades:

- guardar metadados de fotografias oficiais já validadas;
- reusar a imagem do mesmo SKU em futuras renderizações;
- observar cartões do catálogo para capturar imagens oficiais resolvidas pelos módulos existentes;
- restaurar a fotografia quando existe entrada válida na biblioteca;
- expirar entradas positivas após 45 dias;
- não armazenar binários, preços, transações ou dados do cofre.

A biblioteca é carregada antes de `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js`, para que possa cooperar com o pipeline atual sem criar uma segunda pesquisa de mercado.

## 4. Mercado

### Contrato funcional

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- PID do retalhista identifica o SKU na loja;
- fotografia é apoio visual, não prova preço ou transação;
- lojas suportadas: Continente e Pingo Doce;
- falha de imagem não remove artigo nem altera montante.

### Pesquisa e imagens

- `market-experience.js`: pesquisa atual através de `cesta.pt`;
- Open Food Facts pode fornecer fotografia de referência quando existe correspondência forte em fluxos compatíveis;
- `market-official-images.js` valida fotografias oficiais do Continente/Pingo Doce quando existe PID compatível;
- `market-retailer-image-policy.js` impede imagem aproximada em cartões de resultados vivos quando o SKU oficial não é comprovado;
- `market-image-library.js` guarda/reutiliza imagens oficiais validadas por `marketId|pid`;
- `v75-stability.js` trata estados de imagem do catálogo tradicional;
- `v75-market-featured.js` trata apenas os cartões de destaque móveis.

### Fontes oficiais observadas

Continente:

- página de produto: `https://www.continente.pt/produto/...-<pid>.html`;
- imagem oficial aceite apenas em `www.continente.pt` com path `Sites-col-master-catalog` e PID correspondente.

Pingo Doce:

- página de produto: `https://www.pingodoce.pt/home/produtos/...-<pid>.html`;
- imagem oficial aceite apenas em `static.pingodoce.pt`, path `Sites-pingo-doce-master`, tamanho `large|medium|small` e PID correspondente.

A biblioteca não presume que todos os produtos do retalhista estão permanentemente disponíveis. O catálogo é dinâmico; a biblioteca cresce com os SKUs efetivamente encontrados e validados.

### Destaques `75-featured1`

O bloco antigo vinha de `v74-experience.js` e usava três colunas mobile com área de imagem de 66 px. `75-featured1` não cria uma segunda página Mercado: atua sobre o DOM já gerado e mantém os mesmos `data-edit-market` e `data-v74-market-browser`.

Estrutura visual:

- cabeçalho com ícone, título, subtítulo e **Ver todos**;
- carrossel horizontal com `scroll-snap-type: x mandatory`;
- cartão com largura aproximada de 78–84% do viewport móvel;
- área de imagem estável de 140–154 px;
- categoria em pill;
- nome limitado a duas linhas;
- preço em linha própria;
- rodapé **Na sua lista**;
- controlos anterior/seguinte e indicadores de posição.

## 5. Ordem do CSS público

1. base histórica necessária;
2. `v74-experience.css`;
3. `v75-architecture.css`;
4. `v75-header-refinement.css`;
5. `v75-stability.css`;
6. `v75-layout-polish.css`;
7. `v75-market-featured.css`;
8. `v75-drawer-theme.css`.

## 6. Ordem dos scripts relevantes

A base funcional e Mercado carregam primeiro. Na cadeia de imagens:

1. `market-image-library.js`;
2. `market-retailer-image-policy.js`;
3. `market-image-audit.js`;
4. `market-official-images.js`;
5. restante runtime Mercado;
6. `v74-experience.js`;
7. `v75-architecture.js`;
8. `v75-stability.js`;
9. `v75-market-featured.js`.

`market-image-library.js` usa `MutationObserver` sobre os cartões do catálogo. Não reescreve handlers da pesquisa nem estado financeiro.

## 7. Navegação

Navegação primária móvel:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

O drawer permanece do lado direito e `mobile-menu-toggle.js` continua responsável por hambúrguer/X, Escape, foco e swipe.

## 8. Responsividade e acessibilidade

- breakpoint principal: `820px`;
- web compacto: `821–1120px`;
- desktop largo: `>=1121px`;
- refinamentos compactos: `540px`, `430px`, `359px` e `350px`;
- safe areas iOS preservadas;
- alvos principais de 44–48 px;
- `prefers-reduced-motion` respeitado;
- pinch zoom não bloqueado;
- carrossel usa scroll horizontal próprio e não deve causar overflow da página;
- fotografia usa `object-fit: contain` e fallback explícito quando indisponível.

## 9. Segurança e privacidade

`75-image-library1` é isolada do modelo financeiro. O módulo não referencia `appState`, `saveState()` ou `commit()`.

A store contém apenas:

- `marketId`;
- `pid`;
- nome/embalagem para diagnóstico visual;
- `imageUrl` oficial validado;
- `sourceUrl` oficial validado quando disponível;
- origem, timestamps e expiração.

Não contém montantes, PIN, palavra-passe, chaves, tokens, faturas ou dados pessoais. URLs não oficiais e imagens cujo PID não corresponda ao cartão são rejeitadas.

## 10. Versionamento público

- `BUILD = v75`;
- `UI_REV = 74-ui1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- `ARCHITECTURE_REV = 75-architecture2`;
- `HEADER_REV = 75-header2`;
- `STABILITY_REV = 75-stability1`;
- `LAYOUT_REV = 75-layout1`;
- `DRAWER_REV = 75-drawer2`;
- `FEATURED_REV = 75-featured1`;
- `IMAGE_LIBRARY_REV = 75-image-library1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1`.

## 11. QA e deploy

`tests/market-image-library.test.cjs` verifica:

- identidade `marketId|pid`;
- validação estrita de URLs de produto e imagem;
- memória/persistência isolada;
- expiração;
- ausência de escrita no estado financeiro;
- distribuição no bundle;
- ordem do script e cache.

CI valida também a sintaxe de `market-image-library.js`; GitHub Pages repete o teste antes do deploy.

## 12. Validação manual

Confirmar em iPhone/Safari/PWA:

- imagem oficial encontrada numa pesquisa é reutilizada quando o mesmo SKU volta a surgir;
- nenhum SKU recebe fotografia de outro PID;
- falha/expiração de URL regressa ao fallback sem deformar cartão;
- `75-featured1` mantém cartão largo, nome em duas linhas e preço isolado;
- ausência de overflow lateral da página;
- tema escuro e safe areas.