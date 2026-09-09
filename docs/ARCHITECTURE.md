# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão visual do drawer: `75-drawer2`
Revisão dos destaques do Mercado: `75-featured1`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

Conta de Casa é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 usa camadas de apresentação versionadas sobre o núcleo funcional para evitar reescrever lógica financeira por motivos visuais.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

`75-featured1` não altera nenhum destes componentes.

## 3. Camadas de apresentação

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

## 4. Mercado

### Contrato funcional

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- fotografia é apoio visual, não prova preço ou transação;
- lojas suportadas: Continente e Pingo Doce;
- falha de imagem não remove artigo nem altera montante.

### Pesquisa e imagens

- `market-experience.js`: pesquisa atual através de `cesta.pt`;
- Open Food Facts pode fornecer fotografia de referência quando existe correspondência forte;
- `market-official-images.js` valida fotografias oficiais do Continente/Pingo Doce quando existe PID compatível;
- `v75-stability.js` trata estados de imagem do catálogo tradicional;
- `v75-market-featured.js` trata apenas os cartões de destaque móveis.

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

Política de imagem:

1. tenta usar a imagem já existente no item/DOM, apenas se o URL passar validação de host e caminho;
2. se não existir ou falhar e houver `productCode` GTIN válido, consulta apenas esse GTIN no Open Food Facts;
3. a imagem recuperada é usada só na apresentação e não é persistida por esta camada;
4. se continuar indisponível, mostra fallback local por categoria, sem broken-image icon e sem deformar o cartão.

Hosts aceites pela camada de destaque:

- `images.openfoodfacts.org`;
- `www.continente.pt` apenas em paths de catálogo oficial compatíveis;
- `static.pingodoce.pt` apenas em paths oficiais de imagens de produto.

A camada não envia nomes da lista para um serviço externo para obter imagem; a recuperação automática usa apenas GTIN já existente.

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

A base funcional e Mercado carregam primeiro. Depois:

1. `v74-experience.js`;
2. `v75-architecture.js`;
3. `v75-stability.js`;
4. `v75-market-featured.js`.

`v75-market-featured.js` usa `MutationObserver` para reaplicar a composição quando `v74-experience.js` recria `#cdcMarketHome`, sem escrever no estado.

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
- carrossel usa scroll horizontal próprio e não deve causar overflow da página.

## 9. Segurança

`75-featured1` é read-only relativamente ao estado. Não chama `commit()`, `saveState()`, não substitui `appState` e não altera `estimatedCents` ou `actualCents`.

A recuperação de imagem por GTIN usa `https://world.openfoodfacts.org/api/v2/product/<GTIN>.json` com `credentials: omit`, `referrerPolicy: no-referrer` e CSP já compatível com o domínio.

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
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1`.

## 11. QA e deploy

`tests/v75-market-featured.test.cjs` verifica estrutura do carrossel, fallback, segurança read-only, distribuição, ordem dos assets e cache. CI valida ainda a sintaxe de `v75-market-featured.js`; GitHub Pages repete o teste antes do deploy.

## 12. Validação manual

Confirmar em iPhone/Safari/PWA:

- cartão largo e swipe natural;
- fotografia quando disponível;
- fallback elegante quando não disponível;
- nome em duas linhas no máximo;
- preço isolado;
- controlos do carrossel;
- **Ver todos** e abertura dos detalhes sem regressão;
- ausência de overflow lateral da página;
- tema escuro e safe areas.