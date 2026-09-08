# Changelog Técnico — Conta de Casa

## 2026-09-08 — v71 candidata: drawer off-canvas suave com swipe interativo

### Observação em hardware real

A validação da v70 no iPhone confirmou que o menu está funcional, o item ativo está correto e o hambúrguer se transforma em `X`. A melhoria seguinte é de interação: o drawer deve comportar-se como uma superfície física, acompanhando o dedo lateralmente em vez de apenas alternar entre fechado e aberto.

### Causa técnica

Uma transição automática entre dois estados CSS não acompanha o deslocamento real do toque. Para obter um comportamento semelhante ao drawer do ChatGPT, a posição do painel precisa de ser calculada a partir do delta horizontal do dedo, com a transição temporariamente desligada durante o arrasto e reativada apenas para completar o percurso restante.

### Correção aplicada na candidata v71

- preservado o mesmo `#mobileDrawer`, `#mobileMenuBtn`, `NAV_GROUPS` e fluxo de navegação;
- preservadas as Web Animations do hambúrguer/X da v70;
- superfície fechada em `translate3d(calc(-100% - 8px),0,0)` e aberta em `translate3d(0,0,0)`;
- abertura automática ~`280 ms` com `cubic-bezier(.32,.72,0,1)`;
- fecho automático ~`240 ms`;
- backdrop transparente → `rgba(10,18,30,.34)` com blur máximo de `1px`;
- swipe de abertura iniciado nos primeiros `30 px` da margem esquerda;
- swipe para a esquerda em qualquer ponto da superfície do drawer aberto;
- intenção horizontal só é assumida depois de `8 px` e depois de a componente horizontal superar a vertical, preservando o scroll normal;
- durante o arrasto, `--drawer-drag-x` controla diretamente o `translate3d` sem transição intermédia;
- `--drawer-drag-alpha` e `--drawer-drag-blur` fazem o backdrop acompanhar o mesmo progresso;
- ao soltar, o snap combina progresso (`34%` para abrir; `66%` para fechar quando aberto) e velocidade (`0.45 px/ms`);
- o transform atual é fixado durante um frame e o CSS anima apenas a distância restante;
- clique sintetizado pós-swipe é bloqueado durante `320 ms` para evitar abrir um item por acidente;
- `touchcancel` restaura o estado estável anterior, evitando drawer preso a meio;
- `touch-action:pan-y` e `overscroll-behavior-x:contain` preservam scroll vertical e evitam competição desnecessária com movimento lateral;
- `drawer.close()` continua coordenado por `transitionend` do `transform`, com fallback de `360 ms`;
- o botão permanece em `.drawer-head` durante a saída e regressa ao topbar somente no `close` real;
- X, backdrop, Escape, escolha de página e mudança de breakpoint continuam a usar os caminhos existentes;
- `prefers-reduced-motion` elimina transições adicionais e não captura o swipe interativo;
- ARIA, foco, safe areas, largura responsiva, scroll e temas permanecem preservados.

### Distribuição candidata

- build: `v71`;
- revisão do menu: `71-menu5`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v71-menu5`.

### Testes atualizados

- swipe de abertura pela margem esquerda;
- swipe de fecho acompanhando o dedo;
- intenção horizontal sem bloquear scroll vertical;
- snap por progresso e velocidade;
- backdrop sincronizado com o arrasto;
- prevenção de clique sintetizado pós-swipe;
- recuperação em `touchcancel`;
- entrada totalmente off-canvas;
- duração diferenciada de abertura/fecho;
- coordenação de `drawer.close()` com `transitionend` e timeout;
- posição do botão até ao `close` real;
- `prefers-reduced-motion`;
- Centro de Atualização e versão pública;
- consistência visual;
- compatibilidade das camadas históricas do Mercado e build ordering.

A CI do PR #60 passou no run #1325 (`34171997598`). Uma alteração documental posterior do TODO exige nova execução automática da CI antes do merge final.

### Segurança e dados

Nenhuma alteração de `STATE_VERSION`, `appState`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, cifragem, IndexedDB, autenticação, APIs ou sincronização.

A v71 só será considerada publicada depois de CI do PR, merge em `main`, CI de `main` e Deploy GitHub Pages concluídos com sucesso.

## 2026-09-08 — v70 publicada: movimento visível do hambúrguer ↔ X

### Observação em hardware real

A validação da v69 no iPhone confirmou que os estados finais do menu estavam corretos: fechado apresentava hambúrguer e aberto apresentava `X`. O problema remanescente era de movimento percebido: a transformação podia parecer instantânea quando o mesmo botão era movido entre o topbar e o `<dialog>`.

### Correção publicada

- preservado o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- preservados os três spans, a sentinela Lucide oculta e `data-ui-icon-slot="menu"`;
- criado `animateMenuGlyph(open)` com Web Animations;
- cada linha recebe keyframes explícitos de posição, largura, rotação, escala e opacidade;
- abertura e fecho do glifo são animados depois do reparenting;
- duração definida em cerca de `240 ms` com `cubic-bezier(.22,.8,.2,1)`;
- `prefers-reduced-motion` preservado.

### Distribuição publicada

- build: `v70`;
- revisão do menu: `70-menu4`;
- PR #58 integrado;
- merge: `f4144bff69a3b46e0f6ec78a00af50d29b704578`;
- CI final do PR #1279 (`34170191884`): **sucesso**;
- CI de `main` #1280 (`34170229908`): **sucesso**;
- Deploy GitHub Pages #1273 (`34170256426`): **sucesso**.

A validação física posterior confirmou o menu funcional e revelou a necessidade de tornar a própria superfície do drawer mais suave e interativa, tratada na candidata v71.

## 2026-09-07 — v69 publicada: estados hambúrguer/X corrigidos

- resolvido conflito entre `ui-icons.js`/Lucide e os três spans animáveis;
- sentinela SVG oculta e `data-ui-icon-slot="menu"` impedem substituição destrutiva;
- estado aberto apresenta X correto e regressa ao hambúrguer;
- foco programático de pointer deixa de mostrar moldura grande no Safari;
- teclado mantém `:focus-visible`;
- PR #56 / merge `a66df37b0fc345491dacf3cac91313d88d080a05`;
- CI e Pages verdes.

## 2026-09-07 — v68 publicada: painel do menu móvel refinado

- painel lateral mais compacto e responsivo;
- botão 44 × 44 px e linhas `22 / 18 / 14 px`;
- drawer responsivo, safe areas, scroll interno e alvos de 48 px;
- PR #54 / merge `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI e Pages verdes.

## 2026-09-07 — v67 publicada: menu móvel hambúrguer/X

- um único controlo móvel para abrir/fechar;
- botão acompanha o `<dialog>` modal;
- `#drawerCloseBtn` oculto e fora da tabulação;
- `aria-expanded`, `aria-label` e `title` sincronizados;
- alvo de 44 × 44 px;
- `prefers-reduced-motion` preservado;
- PR #52 / commit `a1d932e580abaa06e7026a515f797411ab205f6e`;
- CI e Pages verdes.

## 2026-09-07 — v66 publicada: fundo móvel uniforme no iPhone

- shell claro `#f5f7fa` e escuro `#0f1722`;
- documento, body, app shell, main e topbar usam o mesmo fundo no mobile;
- topbar opaco e sem blur;
- desktop mantém identidade do Mercado;
- PR #50 / commit `9657d558000018af1ea44e6040441f2b9d91648c`;
- CI/Pages verdes.

## 2026-09-07 — v65 publicada: Lista de compras focada no supermercado

- resumo inicial compacto;
- detalhe financeiro em disclosure;
- `+` do topbar reutiliza ação existente;
- filtros compactos;
- categorias pendentes abertas e Comprados recolhido;
- desktop e estado financeiro preservados;
- PR #48 / commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`;
- CI/Pages verdes.

## 2026-09-07 — v64 publicada

- safe area/cabeçalho móvel uniformizados;
- scanner exige correspondência conservadora e mantém preço em `estimatedCents`;
- GTIN repetido pendente incrementa quantidade;
- novas ocorrências recorrentes começam **Por preencher** sem herdar valores variáveis;
- cofre, PIN e dados financeiros cifrados preservados.

## 2026-09-06 — v63 publicada

- `ui-consistency.css` como camada final de apresentação;
- Lucide permanece sistema vetorial oficial;
- navegação inferior com um único indicador ativo;
- `release-manifest.json` e Centro de Atualização controlado por Service Worker.