# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v69`
Build candidato: `v70`
Branch candidata: `fix/v70-visible-menu-motion`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura continua local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. A v70 não modifica persistência, autenticação, APIs, cofre ou regras de negócio.

## Persistência e segurança

- `core.js`: normalização, utilitários, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema base: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem cookies/telemetria financeira;
- sem segredos ou PIN no código público.

## Navegação existente preservada

- `core.js` mantém `PAGE_META`, `NAV_GROUPS` e estado;
- `render.js::renderNav()` continua a usar a mesma fonte `NAV_GROUPS` para desktop e drawer;
- `events.js` continua responsável por `openMobileDrawer()` / `closeMobileDrawer()`, Escape, backdrop e adaptação de breakpoint;
- `#mobileDrawer` continua um `<dialog>` modal;
- `#mobileMenuBtn` continua um único controlo real;
- `#drawerCloseBtn` permanece oculto apenas por compatibilidade histórica.

Não existe uma segunda implementação do menu.

## Breakpoints e shell

- mobile: até `820 px`;
- desktop/sidebar: acima de `820 px`;
- tablet largo/desktop compacto: comportamento adaptativo histórico preservado;
- topbar, gutters, safe areas e tamanho global da aplicação não são alterados.

Camadas relevantes, por ordem:

1. `styles.css`;
2. `design-system.css`;
3. `mobile-layout.css`;
4. camadas do Mercado;
5. `ui-icons.css`;
6. `ui-consistency.css`;
7. `v64-runtime.css` — shell `66-shell1`;
8. `market-shopping-focus.css` — Compras `65-shopping1`;
9. `mobile-menu-toggle.css` — camada final do menu, candidata `70-menu4`.

## Menu móvel — contrato v69 preservado

A v69 resolveu o conflito com o hidratador Lucide. O contrato continua:

- `mobile-menu-toggle.js` é proprietário do glifo visível;
- o glifo é composto por três `<span>`;
- `data-ui-icon-slot="menu"` permanece;
- um SVG `.mobile-menu-icon-sentinel` fica oculto para impedir `ui-icons.js::fillIcon()` de substituir os spans;
- `aria-expanded`, `aria-label`, `title`, `button.dataset.menuState` e `drawer.dataset.menuState` mantêm o estado acessível e observável.

Geometria preservada:

- alvo do botão: `44 × 44 px`;
- glifo: `24 × 18 px`;
- linhas: `22 / 18 / 14 px`;
- espessura: ~`2.25 px`;
- X: `45deg / -45deg`;
- linha central: `opacity:0` + `scaleX(.18)`.

## Problema de movimento identificado na validação física

No iPhone, os estados finais da v69 aparecem corretos, mas a animação pode não ser perceptível. A razão arquitetural é o reparenting do mesmo nó:

1. fechado: `#mobileMenuBtn` vive no topbar;
2. `openMobileDrawer()` abre o `<dialog>`;
3. `mobile-menu-toggle.js` move o mesmo botão para `.drawer-head`;
4. o estado muda para aberto;
5. ao fechar, o mesmo nó regressa ao topbar.

Uma CSS transition depende de o browser apresentar os estilos inicial e final em frames distintos. Quando o elemento muda de ancestral/render tree durante o mesmo ciclo, Safari pode aplicar diretamente o estado final.

## v70 — camada de movimento explícito

A v70 acrescenta `animateMenuGlyph(open)` em `mobile-menu-toggle.js` sem alterar o drawer.

### Abertura

1. `openMobileDrawer()` mantém o fluxo existente;
2. `syncButton(true)` mantém ARIA/estado e posiciona o botão no drawer;
3. no `requestAnimationFrame` seguinte, `animateMenuGlyph(true)` executa keyframes explícitos;
4. linha superior: `1px → 8px` e `0deg → 45deg`;
5. linha central: `scaleX(1) → scaleX(.18)` e `opacity 1 → 0`;
6. linha inferior: `15px → 8px`, largura `14px → 22px` e `0deg → -45deg`;
7. o glifo recebe um micro movimento `scale(.92)` + inclinação curta e regressa a `scale(1) rotate(0)`.

### Fecho pelo X

1. o drawer fecha pelo fluxo existente;
2. `syncButton(false)` devolve o mesmo nó ao topbar;
3. no frame seguinte são executados os keyframes inversos `opened → closed`;
4. o estado CSS/ARIA fechado já fica como fallback definitivo.

### Fechos externos

Escape, backdrop ou mudança de breakpoint continuam a restaurar o estado. O listener `close` só cancela animação pendente quando o botão ainda não foi sincronizado como fechado, evitando cancelar a animação inversa iniciada pelo próprio X.

### API de animação e fallback

- API: Web Animations (`Element.animate`);
- duração: `240 ms`;
- easing: `cubic-bezier(.22,.8,.2,1)`;
- CSS transitions de `240 ms` permanecem como fallback visual;
- se `Element.animate` não existir, o menu continua funcional com o estado CSS;
- `prefers-reduced-motion: reduce` impede a execução dos keyframes adicionais.

## Responsividade do drawer preservada

Até 820 px:

- largura normal: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `calc(100vw - 20px)`;
- altura: `100dvh`;
- safe areas superior/inferior;
- scroll vertical próprio;
- `overflow-x:hidden`;
- itens e ações com `min-height:48px`;
- tema claro/escuro preservado.

## Acessibilidade

- `aria-controls="mobileDrawer"` preservado no HTML;
- `aria-expanded` sincronizado;
- `aria-label` alterna Abrir/Fechar menu;
- foco por pointer continua sem a moldura programática observada no Safari;
- teclado mantém `:focus-visible`;
- `prefers-reduced-motion` continua obrigatório.

## Tema e PWA

Candidata:

- build: `v70`;
- menu: `70-menu4`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v70-menu4`.

`scripts/prepare-pages.cjs` mantém `mobile-menu-toggle.css/.js` como camada final e `sw.js` mantém allowlist same-origin explícita.

## Regressões obrigatórias v70

- parser do runtime do menu;
- três spans e sentinela Lucide;
- mesma instância do botão no topbar/drawer;
- keyframes explícitos por linha;
- micro movimento do glifo;
- duração/easing definidos;
- abertura e fecho agendados após reparenting;
- `prefers-reduced-motion`;
- ARIA e foco;
- drawer responsivo e sem overflow lateral;
- build/manifest/cache `v70` / `70-menu4`;
- regressões históricas financeiras, segurança, Mercado, sync e acessibilidade.

A CI não substitui a validação física final no iPhone/Safari.
