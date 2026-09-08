# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v72`
Build candidato: `v73`
Branch candidata: `ui/v73-right-navigation`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura mantém-se local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

## Persistência e segurança

- `core.js`: estado, normalização, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem segredos, PIN ou credenciais embutidas no código público.

## Navegação

A navegação continua a ter uma única fonte funcional:

- `core.js` mantém `PAGE_META` e `NAV_GROUPS`;
- `render.js::renderNav()` preenche desktop, drawer e navegação móvel a partir dessa fonte;
- `events.js` mantém os fluxos históricos de abertura/fecho, backdrop, Escape e breakpoints;
- `mobile-menu-toggle.js` coordena animação, reparenting do mesmo botão e gesto horizontal;
- `mobile-menu-toggle.css` é a camada final de apresentação da navegação.

Não existe uma segunda implementação do menu.

## Direção visual v73

### Desktop / Web

Acima de `820px`:

- `.sidebar` fica fixa no lado direito;
- a borda estrutural passa de `border-right` para `border-left`;
- `.main` deixa de usar `margin-left` e reserva a sidebar com `margin-right: var(--sidebar-current)`;
- largura e `max-width` continuam a descontar `--sidebar-current`;
- o modo `sidebar-collapsed` continua a usar a mesma variável de largura;
- o indicador do item ativo passa para a margem direita do item e o gradiente é espelhado.

### Mobile / Tablet

Até `820px`:

- `#mobileDrawer` continua um `<dialog>` modal;
- a superfície fica ancorada com `inset: 0 0 0 auto`;
- estado fechado: `translate3d(calc(100% + 8px),0,0)`;
- estado aberto: `translate3d(0,0,0)`;
- abertura ~`300ms`, fecho ~`250ms`;
- apenas `transform`, opacidade e backdrop são animados;
- largura normal: `min(364px, calc(100vw - 24px))`;
- abaixo de `360px`: `calc(100vw - 20px)`;
- altura: `100dvh`;
- safe areas superior e inferior preservadas;
- `.drawer-nav` mantém scroll vertical próprio e `overflow-x:hidden`.

## Cabeçalho

O header móvel continua fixed através de `v64-runtime.css`:

- usa `--mobile-top-safe` com `env(safe-area-inset-top)`;
- largura é calculada entre os gutters existentes;
- `main` recebe `padding-top: var(--header-height)` para compensar o elemento fora do fluxo;
- títulos continuam truncados com ellipsis quando necessário;
- o botão hambúrguer mantém alvo tátil de `44x44px`.

## Hambúrguer / X

`#mobileMenuBtn` continua a ser um único nó DOM. Ao abrir:

1. é preparado dentro do cabeçalho do drawer;
2. o dialog é mostrado ainda no estado visual fechado;
3. no frame seguinte o drawer começa a entrar e as três linhas formam o X;
4. ao fechar, a animação é invertida e o botão regressa ao topbar apenas depois do `close` real.

O SVG sentinela oculto continua a impedir que `ui-icons.js` substitua destrutivamente o glifo animado.

## Gesto horizontal v73

A direção foi invertida para acompanhar o novo lado do drawer:

- fechado: o gesto candidato começa nos últimos `30px` da margem direita;
- abertura: movimento horizontal para a esquerda;
- fecho: movimento horizontal para a direita;
- threshold de intenção: `8px`;
- predominância horizontal continua obrigatória;
- snap por progresso: `34%` / `66%`;
- fling: `0.45px/ms`;
- durante o arrasto, `--drawer-drag-x`, `--drawer-drag-alpha` e `--drawer-drag-blur` seguem o dedo diretamente;
- `prefers-reduced-motion` mantém a remoção das transições adicionais.

## Temas, ícones e tipografia

- tipografia existente preservada;
- sistema Lucide existente preservado;
- tema claro/escuro preservado;
- não foram introduzidas novas bibliotecas de ícones ou fontes;
- alvos de navegação do drawer permanecem com `min-height:48px`.

## Distribuição v73

- build: `v73`;
- revisão do menu: `73-menu8`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v73-menu8`;
- `scripts/prepare-pages.cjs` continua a carregar `mobile-menu-toggle.css/.js` como camada final de navegação.
