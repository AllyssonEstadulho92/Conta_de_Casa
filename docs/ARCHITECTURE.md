# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v66`
Build candidato: `v67` — PR #52

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

A v67 não modifica esta camada.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários;
- `finance.js` — cálculos e invariantes financeiros;
- `render.js` — renderização, navegação e aplicação de tema;
- `forms.js` — formulários, validação e mutações;
- `events.js` — eventos globais, viewport, cofre, navegação adaptativa e Service Worker;
- `mobile-menu-toggle.js` — camada v67 exclusivamente responsável pelo estado visual/DOM do botão hambúrguer ↔ `X` no mobile;
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

## Camadas CSS e responsabilidade visual

A ordem pública candidata passa a ser:

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
11. `mobile-menu-toggle.css` — geometria do glifo e animação hambúrguer/`X` v67.

A nova folha fica por último porque corrige apenas o comando global do menu e precisa de prevalecer sobre dimensões/estados legados sem alterar as restantes camadas.

## Menu móvel v67

### Contrato existente preservado

O HTML continua a expor:

- `#mobileMenuBtn` com `aria-controls="mobileDrawer"` e `aria-expanded`;
- `#mobileDrawer` como `<dialog>` modal;
- `#drawerCloseBtn` no DOM para preservar o wiring histórico de `events.js`;
- `openMobileDrawer()` e `closeMobileDrawer()` como funções de abertura/fecho existentes.

`events.js` continua responsável por Escape, backdrop, `close`, adaptação desktop/mobile e restante navegação. A v67 não reimplementa estes fluxos quando as funções existentes estão disponíveis.

### Por que o mesmo botão é movido para dentro do dialog

Quando `HTMLDialogElement.showModal()` abre o drawer, o conteúdo exterior ao `<dialog>` fica inerte. Portanto, deixar o `#mobileMenuBtn` fisicamente no topbar e apenas desenhá-lo como `X` produziria um controlo visualmente correto mas não clicável enquanto o modal estivesse aberto.

A v67 mantém **um único controlo real**:

1. antes de abrir, `#mobileMenuBtn` está no topbar;
2. `showModal()` abre o drawer;
3. o mesmo nó DOM é inserido no início de `.drawer-head`;
4. `aria-expanded="true"` transforma os três traços em `X`;
5. ao fechar, o nó regressa ao ponto original marcado por um `Comment` anchor;
6. `aria-expanded="false"` repõe o hambúrguer.

Esta solução preserva foco, semântica modal e identidade do botão. Não existem dois botões ativos para a mesma ação.

### X legado

`#drawerCloseBtn` é mantido no DOM para que a linha histórica de `events.js` que lhe associa `closeMobileDrawer` continue segura. A camada v67 aplica `hidden`, `tabIndex=-1` e `aria-hidden="true"`; o CSS reforça `display:none` dentro do drawer. Assim não existe segundo `X` visível nem duplicação na ordem de tabulação.

### Geometria e acessibilidade

- alvo do botão: `44 × 44 px`;
- glifo: `24 × 18 px`;
- traços: comprimentos aproximados `22 / 18 / 14 px`;
- sem border/background/box-shadow no estado aberto, pressionado ou hover;
- `aria-label`: **Abrir menu** / **Fechar menu**;
- `aria-expanded`: `false` / `true`;
- animação desativada em `prefers-reduced-motion: reduce`;
- o foco regressa ao mesmo controlo após fecho.

## Shell móvel v66 preservado

Até 820 px continua um único token de shell:

- claro: `--mobile-shell-bg: #f5f7fa`;
- escuro: `--mobile-shell-bg: #0f1722`.

O token permanece aplicado ao documento ativo, `body`, `.app-shell`, `.main`, Mercado e `.topbar`. O topbar continua `fixed`, opaco e sem `backdrop-filter`. A v67 não altera safe area, altura, gutters, título, `+` ou Sync.

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

A auto-adição continua conservadora: exatamente um supermercado, score `>= 0.84`, margem `>= 0.10`, loja/nome/marca/embalagem compatíveis. GTIN repetido num item pendente incrementa quantidade. O catálogo continua a atualizar apenas `estimatedCents`; `actualCents` permanece reservado ao valor efetivamente confirmado.

A dependência ZXing externa continua dívida técnica separada.

## Faturas recorrentes preservadas

As ocorrências futuras automáticas continuam a poder usar `draft: true`, com `totalCents = 0`, sem herdar referência, observações ou data de emissão. Drafts não entram nos totais pendentes/em atraso até preenchimento.

## Tema e PWA

`render.js::applyTheme()` continua a definir dinamicamente:

- claro: `meta[name="theme-color"] = #f5f7fa`;
- escuro: `meta[name="theme-color"] = #0f1722`.

`manifest.webmanifest` continua alinhado com `#f5f7fa` no arranque claro.

Na candidata v67, `scripts/prepare-pages.cjs` acrescenta os dois assets do menu à allowlist pública e injeta-os no fim das respetivas camadas. `sw.js` inclui ambos na allowlist explícita de cache.

## Versionamento e distribuição

- público atual: `v66`;
- candidato: `v67`;
- revisão visual histórica: `64-ui1`;
- runtime funcional: `64-runtime1`;
- Compras: `65-shopping1`;
- shell CSS: `66-shell1`;
- menu móvel: `67-menu1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v67-menu1`.

A versão candidata está no PR #52. Não é considerada publicada até CI, merge em `main` e GitHub Pages concluírem com sucesso.

## Pipeline de qualidade

A v67 acrescenta:

- sintaxe de `mobile-menu-toggle.js` na CI e no gate manual de Pages;
- `tests/mobile-menu-toggle.test.cjs` na CI e no gate de Pages;
- atualização de `tests/app-update.test.cjs` para a versão/caches/assets v67.

A matriz anterior continua a cobrir finanças, auditoria, invariantes, cofre, datas, formulários, QR, Mercado, scanner, contabilidade, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

## Regressões obrigatórias futuras

Devem permanecer cobertos:

- finanças e invariantes de contagem;
- isolamento/cifragem do cofre;
- datas civis, faturas, pagamentos e QR;
- Mercado, scanner, quantidade × preço;
- Lista de compras v65;
- um único fundo de shell no mobile claro/escuro;
- safe area/cabeçalho sem alteração de geometria;
- **um único comando móvel hambúrguer/`X`, sem X duplicado, com 44 px e ARIA sincronizado**;
- Escape/backdrop/fecho do drawer e foco de retorno;
- manifesto, Centro de Atualização e Service Worker;
- segurança/CSP/allowlist;
- responsividade, navegação, acessibilidade e sincronização.

A CI não substitui a validação física final no iPhone/Safari.
