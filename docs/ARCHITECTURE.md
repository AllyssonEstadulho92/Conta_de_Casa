# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v70`
Build candidato: `v71`
Branch candidata: `ui/v71-smooth-drawer`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura continua local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v71 é uma alteração de interface móvel. Não modifica persistência, autenticação, APIs, cofre, schema financeiro ou regras de negócio.

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
- `render.js::renderNav()` usa a mesma fonte `NAV_GROUPS` para desktop e drawer;
- `events.js` continua responsável por `openMobileDrawer()` / `closeMobileDrawer()`, Escape, backdrop e adaptação de breakpoint;
- `render.js::showPage()` mantém a navegação e fecha o drawer através do método real `drawer.close()`;
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
9. `mobile-menu-toggle.css` — camada final do menu, candidata `71-menu5`.

## Contrato do botão hambúrguer/X preservado

A v69 resolveu o conflito com o hidratador Lucide e a v70 tornou o movimento das linhas visível através de Web Animations. A v71 mantém integralmente esse contrato:

- `mobile-menu-toggle.js` é proprietário do glifo visível;
- o glifo é composto por três `<span>`;
- `data-ui-icon-slot="menu"` permanece;
- um SVG `.mobile-menu-icon-sentinel` fica oculto para impedir `ui-icons.js::fillIcon()` de substituir os spans;
- `aria-expanded`, `aria-label`, `title`, `button.dataset.menuState` e `drawer.dataset.menuState` mantêm o estado acessível e observável;
- Web Animations continuam a animar as linhas após o reparenting do botão.

Geometria preservada:

- alvo do botão: `44 × 44 px`;
- glifo: `24 × 18 px`;
- linhas: `22 / 18 / 14 px`;
- espessura: ~`2.25 px`;
- X: `45deg / -45deg`;
- linha central: `opacity:0` + `scaleX(.18)`;
- animação do glifo: `240 ms`, `cubic-bezier(.32,.72,0,1)`.

## Problema do drawer observado em hardware real

A captura do iPhone confirma um drawer estruturalmente correto, mas o comportamento pretendido exige mais do que dois estados finais. Um drawer semelhante ao do ChatGPT deve reagir ao gesto continuamente: se o dedo deslocar 80 px, o painel também deve deslocar aproximadamente esses 80 px, em vez de esperar pelo fim do toque para executar uma animação inteira.

## v71 — drawer off-canvas completo

### Entrada automática

A superfície `.nav-drawer-shell` começa totalmente fora do viewport lateral:

- fechado: `translate3d(calc(-100% - 8px),0,0)`;
- aberto: `translate3d(0,0,0)`;
- duração: `280 ms`;
- easing: `cubic-bezier(.32,.72,0,1)`;
- opacidade varia apenas de `.995` para `1`;
- `will-change: transform, opacity` é limitado ao drawer.

Não são animados `width`, `left`, `margin`, `padding` ou outros valores que provoquem reflow da aplicação.

### Backdrop

O backdrop acompanha a entrada:

- inicial: transparente, sem blur;
- aberto: `rgba(10,18,30,.34)`;
- blur máximo: `1px`;
- duração aproximada: `220 ms`.

O efeito é deliberadamente discreto para manter contraste e reduzir peso visual.

## Gesto horizontal interativo

A v71 acrescenta uma camada de interação direta por toque sem alterar a navegação de negócio.

### Abrir por swipe

Quando o drawer está fechado:

1. `touchstart` só cria um candidato se o toque começar nos primeiros `30 px` da margem esquerda;
2. até existir pelo menos `8 px` de movimento, nada é capturado;
3. se o movimento vertical dominar, o candidato é abandonado e o scroll continua normal;
4. se a intenção horizontal for confirmada para a direita, o `<dialog>` é aberto e entra em `data-dragging="true"`;
5. a posição passa a ser `-drawerWidth + deltaX`, limitada entre totalmente fechado e totalmente aberto;
6. o valor é enviado para `--drawer-drag-x`, que controla diretamente o `translate3d`.

### Fechar por swipe

Quando o drawer está aberto:

1. um toque dentro de `.nav-drawer-shell` pode iniciar um candidato;
2. só um movimento predominantemente horizontal para a esquerda ativa o arrasto;
3. o deslocamento do dedo é limitado entre `0` e `-drawerWidth`;
4. a lista mantém `touch-action: pan-y`, pelo que movimentos verticais continuam destinados ao scroll.

### Backdrop durante o gesto

Durante `data-dragging="true"`:

- `transition:none` é aplicado apenas ao shell e backdrop;
- `--drawer-drag-alpha` varia proporcionalmente de `0` a `.34`;
- `--drawer-drag-blur` varia proporcionalmente de `0px` a `1px`;
- a superfície e o fundo respondem no mesmo frame do `touchmove`.

### Decisão ao soltar

O destino não depende apenas da posição. A v71 combina progresso e velocidade:

- abertura: confirma se o progresso chegar a `34%` ou se a velocidade para a direita atingir `0.45 px/ms`;
- fecho de um drawer já aberto: fecha se o progresso cair para `66%` ou menos, ou se a velocidade para a esquerda atingir `-0.45 px/ms`;
- caso contrário, o painel regressa ao estado anterior.

Antes de reativar as transições CSS, o transform atual é fixado inline durante um frame. No frame seguinte o inline é removido e o CSS anima apenas a distância restante. Isto evita saltos ao libertar o dedo.

Um guarda de `320 ms` bloqueia o clique sintetizado que alguns browsers emitem depois de `touchend`, evitando abrir acidentalmente um item do menu depois de um swipe.

### Touch cancel

Se o sistema cancelar o toque, o drawer regressa ao estado estável anterior: um gesto de abertura cancelado fecha; um gesto de fecho cancelado reabre.

## Saída e ciclo do `<dialog>`

O código histórico fecha o drawer através de `drawer.close()` em vários caminhos (`events.js`, `render.js`, breakpoint). Alterar todos esses módulos criaria duplicação desnecessária. A v71 concentra a coordenação no controlador existente:

1. `mobile-menu-toggle.js` preserva uma referência ao método nativo através de `drawer.close.bind(drawer)`;
2. a instância `#mobileDrawer` recebe um wrapper `animatedDrawerClose`;
3. qualquer caminho existente que invoque `drawer.close()` passa pelo mesmo wrapper, sem alteração às chamadas históricas;
4. se existir arrasto ativo, o transform atual é primeiro fixado para manter exatamente a posição atingida pelo dedo;
5. o wrapper define `data-closing="true"`, atualiza o estado acessível e remove `.open`;
6. a superfície desliza novamente para a esquerda durante ~`240 ms`;
7. o método nativo é chamado no `transitionend` de `transform`;
8. existe fallback de `360 ms` para não deixar o dialog preso caso o evento não seja emitido;
9. em `prefers-reduced-motion` ou fora do breakpoint móvel, o fecho nativo é imediato.

## Posição do botão durante o fecho

O mesmo `#mobileMenuBtn` permanece dentro de `.drawer-head` enquanto o painel sai. O estado visual já regressa a hambúrguer durante a animação; o nó só é devolvido ao topbar no evento `close` real. Isto evita salto de layout no início da saída.

## Fechos suportados

A mesma coordenação cobre:

- toque no X;
- swipe para a esquerda;
- toque no backdrop;
- Escape/cancel;
- escolha de item de navegação (`showPage()`);
- mudança de breakpoint através do fluxo existente.

## Responsividade preservada

Até 820 px:

- largura normal: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `calc(100vw - 20px)`;
- altura: `100dvh`;
- safe areas superior/inferior;
- scroll vertical próprio;
- `overflow-x:hidden`;
- `touch-action:pan-y` na superfície do drawer;
- itens e ações com `min-height:48px`;
- tema claro/escuro preservado.

## Acessibilidade

- `aria-controls="mobileDrawer"` permanece no HTML;
- `aria-expanded` é atualizado no início da intenção de fecho e sincronizado novamente no evento `close`;
- `aria-label` alterna Abrir/Fechar menu;
- foco por pointer continua sem a moldura programática observada no Safari;
- teclado mantém `:focus-visible`;
- a origem do foco é acompanhada também dentro do drawer para Escape, backdrop e navegação;
- `prefers-reduced-motion` elimina transições do painel/backdrop, keyframes adicionais e a captura do swipe.

## Tema e PWA

Candidata v71:

- build: `v71`;
- menu: `71-menu5`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v71-menu5`.

`scripts/prepare-pages.cjs` mantém `mobile-menu-toggle.css/.js` como camada final e `sw.js` mantém allowlist same-origin explícita.

## Regressões obrigatórias v71

- parser do runtime do menu;
- três spans e sentinela Lucide;
- mesma instância do botão no topbar/drawer;
- Web Animations do hambúrguer/X preservadas;
- shell fechado completamente off-canvas;
- backdrop transparente → escurecido;
- abertura `280 ms` e fecho `240 ms`;
- edge swipe de `30 px`;
- limiar de intenção de `8 px` e predominância horizontal;
- `touchmove` não-passivo apenas durante o controlador e `preventDefault()` depois da captura;
- transform do drawer derivado do delta real do dedo;
- snap por progresso e velocidade;
- backdrop derivado do progresso do gesto;
- click guard após swipe;
- `drawer.close` coordenado com `transitionend` + timeout;
- botão só regressa ao topbar após `close` real;
- `prefers-reduced-motion` sem gesto adicional nem espera de animação;
- ARIA e foco;
- drawer responsivo e sem overflow lateral;
- build/manifest/cache `v71` / `71-menu5`;
- regressões históricas financeiras, segurança, Mercado, sync e acessibilidade.

A CI não substitui a validação física final no iPhone/Safari.
