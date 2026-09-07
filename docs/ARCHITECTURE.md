# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v67`
Build candidato: `v68` — PR #54

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

A v68 não modifica esta camada.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem, `PAGE_META`, `NAV_GROUPS` e utilitários;
- `finance.js` — cálculos e invariantes financeiros;
- `render.js` — renderização, navegação, tema e hidratação dos mesmos grupos de navegação no sidebar e drawer;
- `forms.js` — formulários, validação e mutações;
- `events.js` — eventos globais, viewport, cofre, navegação adaptativa, abertura/fecho do drawer e Service Worker;
- `mobile-menu-toggle.js` — camada v68 responsável pelo estado visual/DOM do mesmo botão hambúrguer ↔ `X`, reutilizando o fluxo de abertura/fecho existente;
- `sync.js` — sincronização cifrada opcional;
- `sync-conflict-policy.js` — equivalência de negócio do Mercado sem ruído de metadados técnicos;
- `market-experience.js` — catálogo/preço Pingo Doce e Continente através de `cesta.pt`;
- `market-barcode.js` — leitura GTIN/EAN/UPC e identificação de produto;
- `market-category-groups.js` — agrupamento visual base da lista de compras;
- `market-shopping-focus.js` — camada v65 de apresentação móvel;
- `ui-icons.js` — subset Lucide local;
- `invoice-capture.js` — leitura local de QR fiscal;
- `app-update.js` — Centro de Atualização;
- `v64-runtime.js` — correspondência conservadora do scanner e ciclo de faturas recorrentes **Por preencher**.

## Arquitetura da navegação

### Desktop e tablet largo

O sidebar é a navegação primária. Entre 821 e 1180 px pode ficar recolhido/compacto através do mecanismo adaptativo existente.

### Mobile até 820 px

A navegação rápida inferior continua a mostrar `MOBILE_NAV_ITEMS`. O menu completo é o `#mobileDrawer`.

`render.js::renderNav()` usa a mesma fonte `NAV_GROUPS` para:

- `#desktopNav`;
- `#drawerNav`.

Isto evita duas listas de rotas independentes e mantém opções, rótulos, ícones e `aria-current` coerentes entre computador e telemóvel.

## Camadas CSS e responsabilidade visual

A ordem pública candidata é:

1. `styles.css` — base histórica;
2. `design-system.css` — tokens/componentes/layout;
3. `mobile-layout.css` — compatibilidade móvel/Safari;
4. `market-experience.css` — estrutura do Mercado;
5. `market-brand.css` — identidade visual do Mercado;
6. `market-category-groups.css` — agrupamento por categoria;
7. `ui-icons.css` — sistema Lucide;
8. `ui-consistency.css` — consolidação visual global;
9. `v64-runtime.css` — cabeçalho/safe area e cor canónica do shell móvel v66;
10. `market-shopping-focus.css` — ajustes finais da Lista de compras no mobile;
11. `mobile-menu-toggle.css` — camada final v68 para glifo, drawer e estados de interação do menu.

A folha do menu continua por último para neutralizar apenas conflitos históricos do componente sem alterar o restante layout.

## Menu móvel v68

### Contrato preservado

O HTML continua a expor:

- `#mobileMenuBtn` com `aria-controls="mobileDrawer"` e `aria-expanded`;
- `#mobileDrawer` como `<dialog>` modal;
- `.nav-drawer-shell`, `.drawer-head`, `#drawerNav` e `.drawer-footer`;
- `#drawerCloseBtn` no DOM por compatibilidade com wiring histórico;
- `openMobileDrawer()` e `closeMobileDrawer()` em `events.js`.

Não foi criada uma segunda implementação do menu.

### Estado e comportamento

Quando `showModal()` abre um `<dialog>`, os elementos externos ficam inertes. Assim, o mesmo `#mobileMenuBtn` é movido para `.drawer-head` depois da abertura para continuar realmente tocável como `X`.

Fluxo:

1. fechado: botão no topbar, três linhas;
2. clique/toque: fluxo existente abre o drawer;
3. o mesmo nó é colocado dentro de `.drawer-head`;
4. `aria-expanded="true"` transforma as linhas em `X`;
5. clique no `X`, Escape, backdrop ou navegação fecham o drawer;
6. o botão regressa ao `Comment` anchor no topbar e `aria-expanded="false"` restaura o hambúrguer.

`aria-label`, `title`, `button.dataset.menuState` e `drawer.dataset.menuState` acompanham `open/closed`.

### Geometria do botão

- alvo: `44 × 44 px`;
- glifo: `24 × 18 px`;
- linhas: aproximadamente `22 / 18 / 14 px`;
- transformação para `X` pelas próprias linhas superior/inferior;
- duração aproximada: 200 ms;
- sem moldura, fundo verde ou sombra de estado selecionado;
- `:focus-visible` explícito;
- hover apenas em `hover:hover` + `pointer:fine`;
- `prefers-reduced-motion: reduce` remove as transições.

### Painel responsivo

Até 820 px:

- largura principal: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `min(300px, calc(100vw - 20px))`;
- altura: `100dvh`;
- shell interno respeita `safe-area-inset-top` e `safe-area-inset-bottom`;
- `overflow-x:hidden` impede scroll lateral;
- `#drawerNav` tem scroll vertical próprio e `overscroll-behavior: contain`;
- backdrop mantém parte do conteúdo visível e recebe blur discreto;
- sombra foi reduzida em relação à camada histórica para evitar peso excessivo.

O tamanho global da aplicação, largura da `.main`, gutters e topbar não são alterados.

### Hierarquia interna

- cabeçalho mínimo de 60 px;
- marca no drawer: 36 × 36 px;
- grupos com labels compactas em uppercase e espaçamento regular;
- cada `.nav-btn` tem `min-height:48px`;
- ícones Lucide: 20 px;
- `active`/`aria-current="page"`: fundo suave + indicador lateral de 3 px;
- footer de privacidade/bloqueio usa o mesmo ritmo e alvos de 48 px;
- texto longo usa ellipsis em vez de criar overflow.

### Compatibilidade do X legado

`#drawerCloseBtn` permanece oculto, `tabIndex=-1` e `aria-hidden="true"`. Ainda existe porque `events.js` e a camada de ícones o referenciam. Não é um controlo visível/ativo e removê-lo exigiria alterar wiring histórico fora do escopo desta release.

## Sistema de ícones e tipografia

A linguagem visual oficial continua Lucide local:

- viewBox 24×24;
- stroke 2;
- `currentColor`;
- sem icon fonts/CDN.

A tipografia mantém Inter/SF/system definida pelo design system. A v68 não introduz nova fonte.

## Shell móvel v66 preservado

Até 820 px:

- claro: `--mobile-shell-bg: #f5f7fa`;
- escuro: `--mobile-shell-bg: #0f1722`.

O topbar continua `fixed`, opaco e sem `backdrop-filter`. A v68 não altera safe area, altura, gutters, título, `+` ou Sync.

## Lista de compras v65 preservada

No mobile continuam válidos:

- resumo compacto;
- `+` contextual;
- filtros compactos;
- categorias pendentes abertas;
- grupo **Comprados** recolhido;
- detalhes progressivos por item.

Desktop continua com tabela, separadores de categoria, pesquisa/filtros e resumos completos.

## Mercado, scanner e preço preservados

Fontes atuais:

- Pingo Doce e Continente via `https://cesta.pt/mcp`;
- Open Food Facts para identificação auxiliar por GTIN;
- `@zxing/browser` carregado em runtime de `unpkg.com`.

A auto-adição mantém os mesmos limiares de confiança e só atualiza `estimatedCents`. `actualCents` continua reservado ao valor efetivamente confirmado.

A dependência ZXing externa permanece dívida técnica separada.

## Faturas recorrentes preservadas

Ocorrências futuras automáticas continuam a poder usar `draft: true`, com `totalCents = 0`, sem herdar referência, observações ou data de emissão. Drafts não entram nos totais pendentes/em atraso até preenchimento.

## Tema e PWA

`render.js::applyTheme()` continua a definir:

- claro: `meta[name="theme-color"] = #f5f7fa`;
- escuro: `meta[name="theme-color"] = #0f1722`.

A candidata v68 usa:

- build: `v68`;
- menu: `68-menu2`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v68-menu2`.

`scripts/prepare-pages.cjs` injeta `mobile-menu-toggle.css/.js` no fim das camadas e `sw.js` mantém allowlist same-origin explícita.

## Pipeline de qualidade

A v68 estende as regressões para cobrir:

- mesmo nó DOM e transformação hambúrguer/X;
- estado ARIA e `data-menu-state`;
- sizing responsivo do drawer;
- safe areas, scroll e ausência de overflow lateral;
- alvos de 48 px;
- hover/active/focus/current;
- movimento reduzido;
- Centro de Atualização, manifesto e cache v68;
- compatibilidade das camadas v65/v66 e módulos históricos.

A matriz geral continua a cobrir finanças, auditoria, invariantes, cofre, datas, formulários, QR, Mercado, scanner, contabilidade, ícones, segurança, responsividade, navegação, acessibilidade e sincronização.

## Regressões obrigatórias futuras

Devem permanecer cobertos:

- finanças e invariantes de contagem;
- isolamento/cifragem do cofre;
- datas civis, faturas, pagamentos e QR;
- Mercado, scanner, quantidade × preço;
- Lista de compras v65;
- shell móvel v66;
- **um único comando móvel hambúrguer/X com 44 px e ARIA sincronizado**;
- painel sem overflow lateral e com alvos ≥48 px;
- Escape/backdrop/navegação/fecho do drawer;
- desktop e drawer alimentados pela mesma fonte de navegação;
- manifesto, Centro de Atualização e Service Worker;
- segurança/CSP/allowlist;
- responsividade e acessibilidade.

A CI não substitui a validação física final em Safari/iPhone, Android/Chrome e tablet.
