# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v69`
Release funcional: PR #56
Commit público: `a66df37b0fc345491dacf3cac91313d88d080a05`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. Integrações externas do Mercado servem apenas descoberta/identificação de catálogo e preço; não recebem o conteúdo financeiro do cofre.

## Persistência e segurança

- `core.js`: normalização, utilitários, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema base: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem cookies/telemetria financeira;
- segredos e PIN não são incluídos no código público.

A v69 não modifica esta camada.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem, `PAGE_META`, `NAV_GROUPS` e utilitários;
- `finance.js` — cálculos e invariantes financeiros;
- `render.js` — renderização, navegação, tema e hidratação dos mesmos grupos de navegação no sidebar e drawer;
- `forms.js` — formulários, validação e mutações;
- `events.js` — eventos globais, viewport, cofre, navegação adaptativa, abertura/fecho do drawer e Service Worker;
- `mobile-menu-toggle.js` — controlador visual/DOM do botão móvel hambúrguer ↔ `X`;
- `ui-icons.js` — sistema Lucide local e hidratador de ícones;
- `sync.js` / `sync-conflict-policy.js` — sincronização cifrada opcional e equivalência de negócio;
- módulos Mercado/QR/Atualização — preservados.

## Arquitetura da navegação

### Desktop e tablet largo

O sidebar é a navegação primária. Entre 821 e 1180 px pode ficar recolhido/compacto através do mecanismo adaptativo existente.

### Mobile até 820 px

A navegação rápida inferior continua a mostrar `MOBILE_NAV_ITEMS`. O menu completo é `#mobileDrawer`.

`render.js::renderNav()` usa a mesma fonte `NAV_GROUPS` para `#desktopNav` e `#drawerNav`. Não existem duas listas independentes de rotas.

## Camadas CSS e responsabilidade visual

A ordem pública mantém:

1. `styles.css`;
2. `design-system.css`;
3. `mobile-layout.css`;
4. camadas do Mercado;
5. `ui-icons.css`;
6. `ui-consistency.css`;
7. `v64-runtime.css` — shell v66;
8. `market-shopping-focus.css` — Compras v65;
9. `mobile-menu-toggle.css` — camada final do menu, revisão `69-menu3`.

O tamanho global da aplicação, gutters, topbar e breakpoint de 820 px não foram alterados.

## Menu móvel v69

### Contrato DOM preservado

O HTML continua a expor:

- `#mobileMenuBtn` com `aria-controls="mobileDrawer"` e `aria-expanded`;
- `#mobileDrawer` como `<dialog>` modal;
- `.nav-drawer-shell`, `.drawer-head`, `#drawerNav` e `.drawer-footer`;
- `#drawerCloseBtn` no DOM por compatibilidade histórica;
- `openMobileDrawer()` e `closeMobileDrawer()` em `events.js`.

Não existe uma segunda implementação do menu.

### Propriedade visual do botão

A validação física da v68 revelou um conflito de propriedade entre dois módulos:

- `mobile-menu-toggle.js` criava as três linhas animáveis;
- `ui-icons.js::hydrate()` voltava a executar `fillIcon(#mobileMenuBtn, 'menu', 22)` em mudanças de `aria-expanded`/`class`;
- `fillIcon()` usava `replaceChildren()`, removendo as linhas e colocando um SVG estático.

A v69 estabelece o seguinte contrato:

1. `mobile-menu-toggle.js` é o proprietário da apresentação visível de `#mobileMenuBtn` depois de instalado;
2. o botão mantém `data-ui-icon-slot="menu"` para compatibilidade com o hidratador Lucide;
3. um SVG Lucide direto é preservado como `.mobile-menu-icon-sentinel`, `hidden`, `aria-hidden` e `display:none`;
4. `ui-icons.js` encontra o mesmo slot e um SVG existente, pelo que `fillIcon()` retorna sem substituir o glifo visível;
5. o glifo visível é composto exclusivamente por três `<span>` animáveis.

A solução não altera o sistema global de ícones e mantém Lucide como sistema oficial para os restantes controlos.

### Estado e comportamento

Fluxo:

1. fechado: botão no topbar, três linhas proporcionais;
2. toque/clique/teclado: `openMobileDrawer()` abre o `<dialog>`;
3. o mesmo nó é movido para `.drawer-head`;
4. `aria-expanded="true"` e `data-menu-state="open"` colocam as linhas superior/inferior no centro;
5. linha superior roda `45deg`, linha inferior `-45deg` e a linha central colapsa;
6. novo toque no mesmo controlo fecha o drawer;
7. o botão regressa ao topbar e as linhas voltam ao hambúrguer.

`aria-label`, `title`, `aria-expanded`, `button.dataset.menuState` e `drawer.dataset.menuState` permanecem sincronizados.

### Geometria e animação

- alvo: `44 × 44 px`;
- glifo: `24 × 18 px`;
- linhas: `22 / 18 / 14 px`;
- espessura: aproximadamente `2.25 px`;
- duração: aproximadamente `190 ms`;
- curva: `cubic-bezier(.2,.8,.2,1)`;
- linha central: `opacity:0` + `scaleX(.18)`;
- sem borda, fundo verde ou sombra de seleção;
- `prefers-reduced-motion: reduce` elimina transições.

### Foco e Safari

O controlo continua a receber foco programático para manter previsibilidade após abrir/fechar o modal. A origem do acionamento é registada em `data-focus-origin`:

- toque/rato: o foco é preservado, mas a moldura programática é suprimida;
- teclado: `:focus-visible` permanece ativo.

Isto corrige a moldura observada no iPhone sem remover acessibilidade por teclado.

### Painel responsivo preservado da v68

Até 820 px:

- largura normal: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `calc(100vw - 20px)`;
- altura: `100dvh`;
- safe areas superior/inferior;
- scroll vertical próprio;
- `overflow-x:hidden`;
- itens e ações com `min-height:48px`;
- tema claro/escuro preservado.

## Compatibilidade do X legado

`#drawerCloseBtn` permanece oculto, fora da tabulação e `aria-hidden="true"`. Continua referido por wiring histórico; a remoção definitiva permanece um refactor separado.

## Sistema de ícones e tipografia

Lucide local continua oficial para a aplicação. A v69 apenas impede que a hidratação genérica substitua o componente animado que necessita de geometria própria. Tipografia Inter/SF/system permanece inalterada.

## Tema e PWA

- build público: `v69`;
- menu: `69-menu3`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v69-menu3`.

`scripts/prepare-pages.cjs` mantém `mobile-menu-toggle.css/.js` como camada final do menu e `sw.js` mantém allowlist same-origin explícita.

## Pipeline e regressões

A v69 foi integrada apenas depois de CI verde. A matriz cobre, além das regressões históricas:

- presença dos três `<span>` do glifo;
- sentinela Lucide oculta + `data-ui-icon-slot="menu"`;
- coexistência com a chamada histórica `fillIcon(#mobileMenuBtn, 'menu', 22)`;
- `aria-expanded` + `data-menu-state` produzirem o `X`;
- linha central colapsar;
- foco por pointer sem moldura visual;
- foco por teclado preservado;
- fecho pelo mesmo botão, Escape, backdrop e navegação;
- build/manifest/cache v69.

Publicação técnica confirmada:

- CI do PR #1250 (`34168089348`) — sucesso;
- merge `a66df37b0fc345491dacf3cac91313d88d080a05`;
- CI de `main` #1251 (`34168145569`) — sucesso;
- Pages #1244 (`34168165101`) — sucesso.

A CI não substitui a validação física final no mesmo iPhone que revelou o defeito.
