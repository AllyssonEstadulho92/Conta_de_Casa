# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão visual do drawer: `75-drawer2`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

Conta de Casa é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 usa camadas de apresentação versionadas sobre o núcleo funcional, evitando reescrever lógica financeira por motivos visuais. `75-layout1` trata geometria das páginas e `75-drawer2` trata apenas o aspecto do menu lateral móvel.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

Nenhum destes componentes é alterado por `75-layout1` ou `75-drawer2`.

## 3. Camadas de apresentação

### Base funcional

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional de Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- `mobile-menu-toggle.css/js`: drawer funcional à direita e hambúrguer ↔ X;
- `v64-runtime.js`: comportamento funcional ainda necessário.

### Arquitetura v75

`v75-architecture.css/js` define composição de páginas, navegação, formulários mobile full-screen, scanner QR, Planeamento, Relatórios, Mais, Sincronização e cofre sem escrever diretamente em estado financeiro.

### Cabeçalho `75-header2`

`v75-header-refinement.css` define a topbar móvel. O contrato cromático oficial usa:

- `#003f4c` como verde-petróleo base;
- `#005965` como tom intermédio;
- `#087a78` como teal;
- `#5be0c2` como acento menta.

O cabeçalho mantém hambúrguer + título à esquerda, notificações à direita, safe area, foco e `prefers-reduced-motion`.

### Estabilidade `75-stability1`

`v75-stability.css/js` corrige tipografia, overflow, safe areas, controlos mobile, navegação inferior, diálogos, tabelas, `theme-color` e estados visuais do Mercado, sem aceder a estado financeiro.

### Geometria `75-layout1`

`v75-layout-polish.css` é CSS-only e define largura útil, ritmo vertical, proporções de painéis, formulários, grelhas e breakpoints entre desktop, web compacto, tablet e smartphone.

### Drawer móvel `75-drawer2`

`v75-drawer-theme.css` é a última camada CSS do bundle e atua apenas em `max-width: 820px`.

Objectivo visual:

- manter a página principal clara/branca perceptível;
- apresentar a navegação pelo lado direito;
- usar a **mesma família cromática do cabeçalho**, em vez do azul saturado da revisão anterior;
- manter o protótipo como referência de composição, sem copiar a direção esquerda.

Contrato espacial e visual:

- `.nav-drawer` mantém `inset: 0 0 0 auto`;
- largura canónica: `min(320px, calc(100vw - 72px))`;
- `.nav-drawer-shell` usa `#003f4c → #005965 → #087a78` com radial teal subtil;
- canto interno: `border-radius: 28px 0 0 28px`;
- backdrop leve e sem blur;
- ícones e labels em branco/opacidades controladas;
- item ativo usa menta translúcida e não cartão branco;
- `#mobileMenuBtn` continua a ser o mesmo nó e, no estado aberto, aparece como X no canto superior direito;
- `icon.svg`, **Conta de Casa**, `Ocultar valores` e `Bloquear` permanecem integrados.

Contrato funcional:

- não cria outra navegação;
- não altera `mobile-menu-toggle.js`;
- não muda swipe, Escape, foco, `aria-expanded` ou `aria-current`;
- não lê/escreve `appState`;
- não altera `core.js`, `finance.js`, IndexedDB, cofre, QR, Mercado ou sincronização.

## 4. Ordem do CSS público

1. base histórica necessária (`styles.css`, `design-system.css`, `mobile-layout.css` e módulos específicos);
2. `v74-experience.css`;
3. `v75-architecture.css`;
4. `v75-header-refinement.css`;
5. `v75-stability.css`;
6. `v75-layout-polish.css`;
7. `v75-drawer-theme.css`.

`v75-drawer-blue.css` deixa de integrar o bundle público.

## 5. Navegação

Navegação primária móvel:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

O drawer mantém a arquitetura real da navegação. `mobile-menu-toggle.js` continua responsável pelo mesmo `#mobileMenuBtn`, animação hambúrguer/X, Escape, foco e swipe da direita.

## 6. Geometria por página

- **Início:** grelhas proporcionais e redução de colunas em web compacto;
- **Despesas:** pesquisa, filtros e ações refluem pela largura disponível;
- **Calendário:** sete colunas preservadas, com densidade progressiva em mobile;
- **Mercado:** pesquisa/ação/filtros refluem sem alterar preços ou estado de compra;
- **Planeamento:** duas colunas no desktop e uma no mobile;
- **Relatórios:** KPIs e painéis adaptativos;
- **Metas:** `auto-fit` no desktop e uma coluna no telemóvel;
- **Segurança/Sincronização:** duas colunas apenas quando há largura suficiente;
- **Diagnóstico:** duas colunas no desktop e uma no mobile;
- **Definições:** coluna centrada no desktop e largura total disponível no mobile.

## 7. Despesas, faturas e QR

O formulário continua a ser criado por `forms.js`. Manual, Ler fatura e QR Code reutilizam `invoice-capture.js`; o utilizador revê os dados antes de guardar. `75-drawer2` não modifica handlers, campos, validação ou conteúdo do QR.

## 8. Mercado

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- fotografia validada é apoio visual;
- lojas suportadas: Continente e Pingo Doce;
- falha de imagem remota não altera artigo ou preço.

## 9. Sincronização e segurança

O painel real permanece em `#syncPanel`. A sincronização continua opcional e cifrada. PIN, palavra-passe, PBKDF2-SHA-256 e AES-GCM permanecem inalterados.

## 10. Responsividade e acessibilidade

- breakpoint principal: `820px`;
- web compacto: `821–1120px`;
- desktop largo: `>=1121px`;
- refinamentos compactos: `540px`, `430px`, `359px` e `350px`;
- safe areas iOS preservadas;
- alvos principais de 44–48 px;
- inputs/selects/textarea a 16 px no mobile;
- `prefers-reduced-motion` respeitado;
- pinch zoom não bloqueado;
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
- `DRAWER_REV = 75-drawer2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2`.

`v75-drawer-theme.css` integra a allowlist Pages e o Service Worker com revisão própria.

## 12. CI e deploy

A validação cobre testes financeiros, segurança, isolamento, datas, faturas, QR, Mercado, arquitetura v75, estabilidade, geometria, menu animado, responsividade, navegação, acessibilidade e sincronização.

`tests/v75-drawer-theme.test.cjs` valida:

- lado direito;
- proporção do drawer;
- correspondência cromática com `75-header2`;
- ordem do CSS;
- cache e distribuição;
- ausência de acesso ao estado financeiro.

## 13. Validação manual ainda necessária

Confirmar em dispositivo real:

- drawer entra pela direita;
- página clara permanece visível à esquerda;
- gradiente petróleo/teal corresponde ao cabeçalho;
- contraste de ícones e labels;
- X no canto superior direito;
- swipe, safe areas e scroll interno;
- tema escuro;
- ausência de overflow horizontal.
