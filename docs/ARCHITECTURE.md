# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Revisão transversal publicada: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão visual do drawer: `75-drawer1`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

Conta de Casa é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 usa camadas de apresentação versionadas sobre o núcleo funcional, evitando reescrever lógica financeira por motivos visuais. `75-layout1` trata geometria das páginas e `75-drawer1` trata apenas o aspecto do menu lateral móvel.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

Nenhum destes componentes é alterado por `75-layout1` ou `75-drawer1`.

## 3. Camadas de apresentação

### Base funcional

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional de Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- `mobile-menu-toggle.css/js`: drawer funcional à direita e hambúrguer ↔ X;
- `v64-runtime.js`: comportamento funcional ainda necessário.

### Arquitetura v75

`v75-architecture.css/js` define a composição de páginas, navegação, formulários mobile full-screen, scanner QR, Planeamento, Relatórios, Mais, Sincronização e cofre, sem escrever diretamente em estado financeiro.

### Cabeçalho `75-header2`

`v75-header-refinement.css` é carregado depois de `v75-architecture.css` e tem responsabilidade exclusivamente visual sobre a topbar móvel.

Contrato:

- `#mobileMenuBtn` continua a ser o mesmo controlo funcional;
- `#notificationsBtn` continua a usar os mesmos handlers e `#alertBadge`;
- a saudação/avatar não pertencem ao topbar global;
- hambúrguer e título ficam à esquerda;
- notificações ficam à direita;
- safe area, foco e `prefers-reduced-motion` são preservados;
- a camada não altera rotas, dados, IndexedDB, cofre, QR ou sincronização.

### Estabilidade transversal `75-stability1`

`v75-stability.css/js` corrige defensivamente tipografia, overflow, safe areas, controlos mobile, navegação inferior, diálogos, tabelas, `theme-color` e estados de imagens do Mercado.

A camada de estabilidade não referencia `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB ou operações de persistência.

### Geometria e proporção `75-layout1`

`v75-layout-polish.css` é carregado depois de `v75-stability.css`. É CSS-only e tem responsabilidade exclusivamente espacial.

Responsabilidades:

- definir uma coluna de conteúdo comum (`max-width: 1280px`) no desktop;
- uniformizar ritmo vertical, padding e raio de painéis;
- dimensionar cabeçalhos de painel, toolbars, tabs, forms e button rows de forma consistente;
- redistribuir colunas antes de qualquer cartão ou campo ficar demasiado estreito;
- adaptar cada página ao seu tipo de informação em desktop, web compacto, tablet e smartphone;
- manter calendário com sete dias sem gerar scroll lateral desnecessário;
- alinhar grelhas de detalhes e segurança;
- tornar Metas `auto-fit` no desktop e coluna única em mobile;
- centrar Definições numa coluna de leitura adequada;
- reorganizar categorias de Planeamento em ecrãs estreitos;
- preservar layouts específicos de Mercado, QR, cofre, drawer e navegação.

### Drawer móvel `75-drawer1`

`v75-drawer-blue.css` é a última camada CSS do bundle e atua apenas em `max-width: 820px`.

Objectivo visual:

- manter a página principal clara/branca perceptível;
- apresentar a navegação num painel azul inspirado no protótipo fornecido;
- manter o drawer no **lado direito**, em coerência com a decisão v73;
- reduzir a sensação de painel branco pesado existente na revisão anterior.

Contrato espacial e visual:

- `.nav-drawer` continua com `inset: 0 0 0 auto`;
- largura canónica: `min(320px, calc(100vw - 72px))`;
- em ecrãs muito estreitos existe refinamento específico para manter uma margem visível da página;
- `.nav-drawer-shell` usa gradiente azul e `border-radius: 28px 0 0 28px`;
- o backdrop é leve, sem blur, para preservar a leitura da página clara ao fundo;
- ícones e labels usam branco com opacidades controladas;
- item ativo usa superfície translúcida, não cartão branco;
- o mesmo `#mobileMenuBtn` é movido para o drawer por `mobile-menu-toggle.js` e, visualmente, fica no canto superior direito;
- `icon.svg` continua a representar a identidade da aplicação no cabeçalho do drawer;
- rodapé `Ocultar valores` / `Bloquear` permanece no mesmo drawer e usa a mesma linguagem azul.

Contrato funcional:

- não cria outra navegação;
- não altera `mobile-menu-toggle.js`;
- não muda swipe, Escape, foco, `aria-expanded` ou `aria-current`;
- não lê/escreve `appState`;
- não altera `core.js`, `finance.js`, IndexedDB, cofre, QR, Mercado ou sincronização.

## 4. Ordem do CSS público

A ordem relevante é:

1. base histórica necessária (`styles.css`, `design-system.css`, `mobile-layout.css` e módulos específicos);
2. `v74-experience.css`;
3. `v75-architecture.css`;
4. `v75-header-refinement.css`;
5. `v75-stability.css`;
6. `v75-layout-polish.css`;
7. `v75-drawer-blue.css`.

`v75-drawer-blue.css` fica por último para garantir que apenas o drawer móvel substitui as superfícies brancas definidas pelas camadas anteriores.

## 5. Navegação

Navegação primária móvel:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

O drawer mantém a arquitetura real da navegação. `mobile-menu-toggle.js` continua responsável pelo mesmo `#mobileMenuBtn`, animação hambúrguer/X, Escape, foco e swipe da direita.

`75-drawer1` não cria rotas, não altera labels funcionais e não muda a direção canónica do drawer.

## 6. Geometria por página

### Início

- desktop largo: grelha principal proporcional, sem cartões espremidos;
- web compacto: duas colunas e painéis `span-2` ocupam largura total;
- KPIs: seis colunas em desktop largo e três no web compacto;
- mobile: mantém a composição compacta já gerada pela experiência v74/v75.

### Despesas

- pesquisa usa a largura flexível e o botão de ação mantém largura natural no desktop;
- filtros usam `auto-fit` com largura mínima;
- em mobile, filtros e comandos seguem os fluxos específicos já existentes, sem duplicar tabela e cartões.

### Calendário

- sete colunas permanecem canónicas;
- células crescem no desktop;
- no mobile reduzem padding/tipografia antes de provocar overflow;
- abaixo de 350 px, detalhe secundário dentro da célula é reduzido para preservar a grelha.

### Mercado

- pesquisa/ação/filtros refluem por largura;
- imagens e cartões continuam regidos por `75-stability1` e módulos do Mercado;
- `75-layout1` só ajusta encaixe espacial, não preços nem estados de compra.

### Planeamento

- desktop: duas colunas com proporção aproximada 56/44;
- mobile: uma coluna;
- categorias reestruturam nome, valor e barra em ecrãs estreitos para manter legibilidade.

### Relatórios

- KPIs: quatro colunas em desktop largo e duas em web compacto;
- painéis analíticos usam duas colunas no desktop e uma em mobile.

### Metas

- desktop: `auto-fit` com mínimo de 240 px por cartão;
- mobile: coluna única.

### Segurança e Sincronização

- desktop: dois painéis principais, com sincronização e painéis `span-2` a ocupar toda a linha;
- mobile: uma coluna;
- formulários de sincronização deixam de usar duas colunas quando não há espaço.

### Diagnóstico

- desktop: duas colunas equilibradas;
- mobile: uma coluna.

### Definições

- painel `narrow` centrado no desktop, com largura máxima de 720 px;
- mobile ocupa a coluna disponível.

## 7. Despesas, faturas e QR

O formulário continua a ser criado por `forms.js`. Na criação de nova despesa, a camada v75 apresenta Manual, Ler fatura e QR Code. Fotografia e QR continuam a usar `invoice-capture.js`; o utilizador revê os dados antes de guardar.

`75-layout1` e `75-drawer1` não modificam handlers, campos, validação ou conteúdo do QR.

## 8. Mercado

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- fotografia validada é apoio visual;
- lojas suportadas: Continente e Pingo Doce;
- falha de imagem remota não altera artigo ou preço;
- a grelha móvel de produtos continua a reduzir densidade em ecrãs compactos.

## 9. Sincronização e segurança

O painel real permanece em `#syncPanel`. A sincronização continua opcional e cifrada. PIN, palavra-passe, PBKDF2-SHA-256 e AES-GCM permanecem inalterados.

As camadas visuais apenas reorganizam ou estilizam os elementos existentes.

## 10. Responsividade e acessibilidade

- breakpoint principal funcional: `820px`;
- faixa adicional de web compacto: `821–1120px`;
- desktop largo: `>=1121px`;
- refinamentos compactos: `540px`, `430px`, `359px` e `350px`;
- safe areas iOS continuam em topbar, drawer, scanner, formulários e navegação inferior;
- alvos principais de 44–48 px;
- inputs/selects/textarea mantêm 16 px no mobile;
- `prefers-reduced-motion` respeitado;
- `forced-colors` continua tratado pela estabilidade;
- pinch zoom não é bloqueado;
- drawer mantém scroll interno e foco visível.

## 11. Distribuição pública

- `BUILD = v75`;
- `UI_REV = 74-ui1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- `ARCHITECTURE_REV = 75-architecture2`;
- `HEADER_REV = 75-header2`;
- `STABILITY_REV = 75-stability1`;
- `LAYOUT_REV = 75-layout1`;
- `DRAWER_REV = 75-drawer1`;
- cache preparado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer1`.

`v75-drawer-blue.css` integra a allowlist Pages e o Service Worker com revisão própria.

## 12. CI e deploy

A validação cobre:

- testes financeiros, segurança, isolamento, datas, faturas, QR e sincronização existentes;
- arquitetura v75;
- estabilidade v75;
- `tests/v75-layout-polish.test.cjs`;
- `tests/v75-drawer-blue.test.cjs`, que valida lado direito, proporção, gradiente, ordem do CSS, cache e proibição de acesso ao estado financeiro;
- responsividade, mobile, navegação e acessibilidade já existentes.

O workflow Pages repete o teste de `75-drawer1` antes de preparar o artefacto público.

## 13. Validação manual ainda necessária

Após publicação, confirmar em dispositivo real:

- drawer entra pela direita;
- página clara permanece visível à esquerda;
- largura do painel azul não comprime labels longos;
- contraste de todos os ícones e grupos;
- X no canto superior direito;
- gesto de abrir/fechar pela direita;
- safe areas;
- scroll interno do drawer;
- tema escuro;
- ausência de overflow horizontal.
