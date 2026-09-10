# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-10 — v76 `76-veggie-menu2` + `76-modern-ui1`

### Origem

Validação física em iPhone/Safari revelou duas regressões do estado publicado:

- o Veggie Burger fechado estava presente, mas a transformação para X não era percebida de forma fiável;
- a topbar sticky/fixa permanecia no viewport durante scroll e quebrava a composição visual do conteúdo.

A mesma revisão visual indicou falta de consistência premium entre páginas, levando à criação de uma camada UI/UX transversal.

### Menu

- `src/ui/veggie-menu-toggle.ts` revisto;
- `v76-veggie-menu.js` atualizado a partir da fonte TypeScript;
- `v76-veggie-menu.css` revisto para `76-veggie-menu2`;
- animação explícita por Web Animations API nas duas barras;
- superior: `0° → +45°`;
- inferior: `0° → -45°`;
- as duas barras mantêm `opacity: 1`;
- continua a existir apenas um `#mobileMenuBtn`;
- botão continua fora da `.nav-drawer-shell` durante drawer aberto/swipe;
- reduced-motion e forced-colors preservados.

### Cabeçalho

- regra sticky anterior removida da camada Veggie;
- `v76-modern-ui.css` coloca `.topbar` no fluxo normal em mobile;
- `.main` deixa de reservar espaço para header fixo;
- conteúdo deixa de competir com a barra durante scroll.

### Sistema UI/UX master

Criado `v76-modern-ui.css`, revisão `76-modern-ui1`, carregada como última camada visual após `v75-usability.css`.

Abrange:

- Início;
- Despesas/Faturas;
- Mercado;
- Calendário;
- Planeamento;
- Relatórios;
- Objetivos;
- Segurança;
- Diagnóstico;
- Definições;
- dialogs;
- drawer;
- bottom navigation;
- tabs, formulários, botões, tabelas, estados vazios e superfícies.

Introduz tokens coerentes para cor, superfície, borda, raio, sombra, estados e foco, mantendo tema escuro e acessibilidade.

### Build/PWA

- `scripts/prepare-pages.cjs`: `VEGGIE_MENU_REV = 76-veggie-menu2`;
- nova `MODERN_UI_REV = 76-modern-ui1`;
- `v76-modern-ui.css` adicionado à allowlist pública;
- `sw.js` revisto para cache `veggie-menu2-modern-ui1`;
- novo asset incluído no Service Worker.

### QA

- `tests/v76-veggie-menu.test.cjs` atualizado;
- criado `tests/v76-modern-ui.test.cjs`;
- novo teste integrado no CI e no gate de Pages;
- CI push da branch `fix/v76-menu-flow-modern-ui`, run `34537017339`: **sucesso**;
- passaram igualmente finanças, faturas, Mercado, scanner, segurança, responsividade, acessibilidade, sincronização e manifest.

TypeScript strict e CI serão novamente exigidos no PR antes do merge. Validação física final continua obrigatória após publicação.

---

## 2026-09-10 — v76 `76-veggie-menu1`

- primeira versão TypeScript do Veggie Burger de duas linhas;
- PR #74 integrado como `f196545662b5d120a0dd21b2c498a209cfc144d3`;
- TypeScript `34517268279`, CI `34517268450` e Pages `34517324242`: sucesso;
- posteriormente revista pela evidência física que originou `76-veggie-menu2`.

---

## 2026-09-10 — v75 `75-expenses1`

- `v75-expenses-modern.css` modernizou Lista/Calendário, pesquisa, filtros, resumo, tabela e cartões mobile;
- domínio financeiro e persistência inalterados;
- PR #73 integrado como `176450fcb236a2272afb9d6a6983b42681aa705d`;
- CI, TypeScript e Pages: sucesso.

---

## 2026-09-10 — v76 Bloco 1 — fundação TypeScript

- TypeScript como `devDependency`;
- `tsconfig.json` strict/noEmit;
- contratos em `src/types/`;
- workflow dedicado;
- PR #72 integrado como `2c1d78508507ab77d6df95850568d9fd7f6b9577`.

---

## 2026-09-10 — v75 `75-market1`

- pesquisa live/lista separadas;
- filtros mobile visíveis;
- estados `Por comprar`, `Preço por confirmar`, `Comprado`;
- pipeline `marketId|pid` preservado.

---

## 2026-09-10 — v75 `75-assets1`

- biblioteca local-first para fontes, ícones e media;
- Lucide SVG local principal;
- loader opt-in;
- CSP não expandida.

---

## 2026-09-10 — v75 `75-pages1` / `75-usability1`

- Início, Despesas e Planeamento reorganizados sem alterar cálculos;
- `touch-action: manipulation`;
- inputs mobile com 16 px;
- alvos tácteis 44/48 px;
- pinch-to-zoom preservado.

## Histórico anterior

Revisões anteriores de faturas, pagamentos, navegação, segurança, sincronização, Mercado, catálogo e responsividade permanecem no histórico Git e em `release-manifest.json`. Não remover comportamento histórico sem prova de ausência de referências e regressões.
