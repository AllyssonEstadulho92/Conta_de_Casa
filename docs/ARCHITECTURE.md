# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v71`
Build candidato: `v72`
Branch candidata: `ui/v72-swipe-page-close`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura permanece local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v72 é uma alteração exclusivamente de interação móvel do drawer. Não modifica persistência, autenticação, APIs, cofre, schema financeiro ou regras de negócio.

## Persistência e segurança

- `core.js`: normalização, utilitários, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema base: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem segredos, tokens ou PIN no código público.

## Navegação preservada

- `core.js` mantém `PAGE_META`, `NAV_GROUPS` e estado;
- `render.js::renderNav()` usa a mesma fonte `NAV_GROUPS` para desktop e drawer;
- `events.js` mantém `openMobileDrawer()` / `closeMobileDrawer()`, Escape, backdrop e breakpoint;
- `render.js::showPage()` mantém navegação e fecho do drawer;
- `#mobileDrawer` continua um único `<dialog>` modal;
- `#mobileMenuBtn` continua um único controlo real;
- `#drawerCloseBtn` permanece oculto apenas por compatibilidade histórica.

Não existe uma segunda implementação do menu.

## Breakpoints e shell

- mobile: até `820 px`;
- desktop/sidebar: acima de `820 px`;
- drawer normal: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `calc(100vw - 20px)`;
- altura: `100dvh`;
- safe areas superior/inferior preservadas;
- topbar, gutters e tamanho global da aplicação não são alterados.

Camadas relevantes, por ordem:

1. `styles.css`;
2. `design-system.css`;
3. `mobile-layout.css`;
4. camadas do Mercado;
5. `ui-icons.css`;
6. `ui-consistency.css`;
7. `v64-runtime.css` — shell `66-shell1`;
8. `market-shopping-focus.css` — Compras `65-shopping1`;
9. `mobile-menu-toggle.css` — geometria/estados visuais do menu;
10. `mobile-menu-toggle.js` — controlador de estado, animação e gesto, revisão candidata `72-menu6`.

## Contrato do hambúrguer/X

Preservado desde v69/v70:

- glifo visível composto por três `<span>`;
- sentinela SVG `.mobile-menu-icon-sentinel` oculta para compatibilidade Lucide;
- `data-ui-icon-slot="menu"` estável;
- `aria-expanded`, `aria-label`, `title` e `data-menu-state` sincronizados;
- botão 44 × 44 px;
- glifo 24 × 18 px;
- linhas 22 / 18 / 14 px;
- X a `45deg / -45deg`;
- Web Animations explícitas de 240 ms para o movimento hambúrguer ↔ X;
- `prefers-reduced-motion` desativa movimento adicional.

## Drawer off-canvas publicado na v71

A superfície usa apenas composição visual, sem animar layout:

- fechado: `translate3d(calc(-100% - 8px),0,0)`;
- aberto: `translate3d(0,0,0)`;
- abertura automática: ~280 ms com `cubic-bezier(.32,.72,0,1)`;
- fecho: ~240 ms;
- backdrop: transparente → `rgba(10,18,30,.34)` com blur máximo de 1 px;
- `drawer.close()` é coordenado para o `<dialog>` só fechar depois do `transitionend` do transform, com fallback de 360 ms.

## Gesto horizontal publicado na v71

### Abrir

Com o drawer fechado, um toque iniciado nos primeiros 30 px da margem esquerda pode abrir o menu. O controlador só captura depois de 8 px e predominância horizontal. A posição segue `deltaX` através de `--drawer-drag-x`.

### Fechar sobre o drawer

Com o drawer aberto, um swipe para a esquerda sobre `.nav-drawer-shell` desloca o painel em tempo real. O backdrop acompanha o mesmo progresso. Ao soltar, distância e velocidade decidem entre fechar e regressar ao estado aberto.

## v72 — fechar também a partir da página exposta

### Problema

A v71 continha esta restrição em `onTouchStart()`: se o alvo do toque não pertencesse a `.nav-drawer-shell`, o gesto era abandonado. Por isso a zona visível da página/backdrop à direita não podia iniciar o retorno, apesar de o controlador já saber mover o painel corretamente.

### Solução

Quando `drawer.open === true`:

1. é obtida a única `.nav-drawer-shell` existente;
2. a origem do toque é classificada como `drawer` quando `shell.contains(event.target)` e como `page` nos restantes casos;
3. ambos criam o mesmo gesto `mode:'closing'`;
4. `beginTouchDrag()` usa o mesmo estado `data-dragging="true"` e regista apenas `data-drag-source` para diagnóstico;
5. `onTouchMove()` mantém a mesma regra: apenas movimento horizontal para a esquerda é capturado;
6. o offset continua `clamp(Math.min(0, dx), -width, 0)`;
7. `setDragVisual()` continua a atualizar painel e backdrop no mesmo frame;
8. `onTouchEnd()` usa os mesmos thresholds de progresso/velocidade;
9. `clearDragVisuals()` remove `data-drag-source` juntamente com os restantes estados transitórios.

Não existe handler paralelo para a página: o mesmo pipeline de gesto é reutilizado. Isso evita divergência entre fechar a partir do drawer e fechar a partir da área exposta.

## Scroll e conflitos de gesto

- o scroll vertical da lista continua permitido por `touch-action: pan-y`;
- o gesto só é capturado depois de a deslocação horizontal superar a vertical por `swipeHorizontalBias=1.08`;
- um swipe vertical ou diagonal dominado pelo eixo Y é abandonado sem `preventDefault()`;
- `preventDefault()` só é chamado depois de a intenção horizontal estar confirmada;
- clique sintetizado pós-swipe continua bloqueado por 320 ms para evitar seleção acidental.

## Fechos suportados

Todos continuam convergentes:

- toque no X;
- swipe para a esquerda iniciado no drawer;
- swipe para a esquerda iniciado na página/backdrop visível;
- toque no backdrop;
- Escape/cancel;
- seleção de item;
- mudança de breakpoint.

## Acessibilidade

- `aria-controls="mobileDrawer"` permanece no HTML;
- `aria-expanded` acompanha o estado real;
- `aria-label` alterna Abrir/Fechar menu;
- foco por pointer não desenha a moldura programática observada no Safari;
- teclado mantém `:focus-visible`;
- `prefers-reduced-motion` evita captura do gesto adicional e elimina transições.

## Tema e PWA

Candidata v72:

- build: `v72`;
- menu: `72-menu6`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v72-menu6`.

`scripts/prepare-pages.cjs` mantém a camada do menu depois das restantes camadas móveis. `sw.js` mantém allowlist same-origin explícita.

## Regressões obrigatórias v72

- parser do controlador;
- um único botão e drawer;
- sentinela Lucide e três spans;
- Web Animations hambúrguer/X;
- off-canvas e fecho coordenado da v71;
- swipe de abertura pela margem esquerda;
- swipe de fecho sobre o drawer;
- **swipe de fecho iniciado na página/backdrop**;
- rejeição de movimento vertical;
- snap por progresso/velocidade;
- prevenção de clique pós-gesto;
- ARIA, foco e reduced motion;
- build/manifest/cache `v72` / `72-menu6`;
- regressões financeiras, segurança, Mercado, sync, responsividade e acessibilidade.

A CI não substitui a validação física final no iPhone/Safari.
