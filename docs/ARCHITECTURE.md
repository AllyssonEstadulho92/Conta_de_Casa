# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Branch pública: `main`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

Conta de Casa é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 usa camadas de apresentação versionadas sobre o núcleo funcional, evitando reescrever lógica financeira por motivos visuais.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

## 3. Camadas de apresentação

### Base funcional

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional de Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- `mobile-menu-toggle.css/js`: drawer à direita e hambúrguer ↔ X;
- `v64-runtime.js`: comportamento funcional ainda necessário.

### Arquitetura v75

`v75-architecture.css/js` define a composição final de páginas, navegação, formulários mobile full-screen, scanner QR, Planeamento, Relatórios, Mais, Sincronização e cofre, sem escrever diretamente em estado financeiro.

### Refinamento de cabeçalho `75-header2`

`v75-header-refinement.css` é carregado depois de `v75-architecture.css` e tem responsabilidade exclusivamente visual sobre a topbar móvel.

Contrato:

- `#mobileMenuBtn` continua a ser o mesmo controlo funcional;
- `#notificationsBtn` continua a usar os mesmos handlers e `#alertBadge`;
- `#cdcMobileGreeting` fica oculto no topbar;
- hambúrguer e título ficam à esquerda;
- notificações ficam isoladas à direita;
- safe area, foco e `prefers-reduced-motion` são preservados;
- a camada não altera rotas, dados, IndexedDB, cofre, QR ou sincronização.

A geometria móvel usa 60 px de linha visual mais `env(safe-area-inset-top)`.

### Estabilidade transversal `75-stability1`

`v75-stability.css/js` é carregado por último. É uma camada de correção defensiva transversal e não uma segunda arquitetura.

Responsabilidades:

- uniformizar tipografia através da stack nativa do sistema;
- impedir overflow causado por filhos flex/grid sem `min-width: 0`;
- estabilizar safe areas horizontais e verticais;
- manter controlos mobile com dimensão e texto adequados ao Safari;
- consolidar métricas da navegação inferior e dos diálogos;
- garantir scroll local das tabelas no desktop e evitar duplicação tabela/cartão em mobile;
- sincronizar `theme-color` com o tema/cabeçalho visível;
- gerir visualmente `loading`, `loaded`, `error` e `empty` de imagens do Mercado;
- apresentar skeleton e fallback sem alterar o produto, preço ou estado financeiro;
- respeitar `prefers-reduced-motion` e `forced-colors`.

A camada não referencia `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB ou operações de persistência.

## 4. Navegação

Navegação primária móvel:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

O drawer mantém grupos Principal, Análise e Conta/sistema. `mobile-menu-toggle.js` continua responsável pelo mesmo `#mobileMenuBtn`, animação hambúrguer/X, Escape, foco e swipe da direita.

## 5. Despesas, faturas e QR

O formulário continua a ser criado por `forms.js`. Na criação de nova despesa, a camada v75 apresenta Manual, Ler fatura e QR Code. Fotografia e QR continuam a usar `invoice-capture.js`; o utilizador revê os dados antes de guardar.

## 6. Mercado

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- fotografia validada é apoio visual;
- lojas suportadas: Continente e Pingo Doce;
- outras cadeias não são apresentadas sem suporte real;
- falhas de imagem remota não alteram o artigo: a área passa a `Imagem indisponível` e mantém geometria estável.

## 7. Planeamento, Relatórios e Mais

Planeamento prioriza mês, orçamento, gasto, disponível e categorias. Relatórios reutiliza cálculos existentes. Mais concentra navegação secundária e evita duplicar os destinos principais.

## 8. Sincronização e segurança

O painel real permanece em `#syncPanel`; a v75 apenas acrescenta apresentação. A sincronização continua opcional e cifrada. PIN, palavra-passe, PBKDF2-SHA-256 e AES-GCM permanecem inalterados.

## 9. Responsividade e acessibilidade

- breakpoint principal: `820px`;
- safe areas iOS em topbar, drawer, scanner, formulários e navegação inferior;
- safe areas laterais também são aplicadas ao conteúdo e header;
- alvos principais de 44–48 px;
- inputs/selects/textarea usam 16 px no mobile para evitar zoom de foco no Safari;
- `prefers-reduced-motion` respeitado;
- `forced-colors` recebe foco/bordas compatíveis;
- foco e ARIA preservados;
- pinch zoom não é bloqueado;
- tabelas ficam confinadas ao próprio scroll no desktop.

## 10. Distribuição pública

- `BUILD = v75`;
- `UI_REV = 74-ui1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- `ARCHITECTURE_REV = 75-architecture2`;
- `HEADER_REV = 75-header2`;
- `STABILITY_REV = 75-stability1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1`.

`ui-consistency.css` e `v64-runtime.css` continuam fora de `dist`. `v75-header-refinement.css` e `v75-stability.css/js` integram o bundle Pages com query de revisão própria.

## 11. Atualização e cache

`sw.js` utiliza cache versionado e elimina caches antigos na ativação. O bundle público carrega `v75-stability.css/js?v=75-stability1` depois das camadas anteriores, garantindo que a revisão transversal não fica presa ao cache `header2`.

## 12. CI e deploy

A validação de CI e a verificação pré-Pages passam a cobrir o mesmo conjunto crítico de camadas v74/v75:

- sintaxe de `v74-experience.js`, `v75-architecture.js` e `v75-stability.js`;
- `tests/v75-architecture.test.cjs`;
- `tests/v75-stability.test.cjs`;
- regressões financeiras, segurança, sincronização, mobile e acessibilidade já existentes.

O deploy Pages continua condicionado a CI concluído com sucesso em `main`.

## 13. Validação manual ainda necessária

Confirmar em dispositivo real: safe area, títulos longos, badge de notificação, animação hambúrguer/X, orientação, tema escuro, formulários sem zoom, navegação inferior, ausência de overflow e fallback de imagens do Mercado.
