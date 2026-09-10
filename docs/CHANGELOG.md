# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-10 — v76 `76-veggie-menu2` + `76-modern-ui1` — publicado

### Origem

Validação física em iPhone/Safari revelou duas regressões:

- o Veggie Burger fechado estava presente, mas a transformação para X não era percebida de forma fiável;
- a topbar sticky/fixa permanecia no viewport durante scroll e quebrava a composição visual do conteúdo.

A revisão também confirmou necessidade de uma linguagem UI/UX transversal mais consistente entre páginas.

### Menu

- `src/ui/veggie-menu-toggle.ts` revisto em TypeScript strict;
- `v76-veggie-menu.js` atualizado a partir da fonte TS;
- `v76-veggie-menu.css` revisto para `76-veggie-menu2`;
- animação explícita via Web Animations API;
- superior `0° → +45°` e inferior `0° → -45°`;
- ambas as barras permanecem visíveis;
- apenas um `#mobileMenuBtn`;
- botão fora da `.nav-drawer-shell` durante drawer/swipe;
- reduced-motion e forced-colors preservados.

### Cabeçalho

- regra sticky anterior removida;
- `.topbar` passa ao fluxo normal em mobile;
- `.main` deixa de reservar espaço para header fixo;
- conteúdo deixa de competir com a barra durante scroll.

### UI/UX master

Criado `v76-modern-ui.css`, revisão `76-modern-ui1`, carregado como última camada visual após `v75-usability.css`.

Abrange Início, Despesas/Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições, além de dialogs, drawer, bottom navigation, tabs, formulários, botões, tabelas, estados vazios e superfícies.

Introduz tokens coerentes para cor, superfície, borda, raio, sombra, estados e foco, mantendo tema escuro e acessibilidade.

### Build/PWA

- `VEGGIE_MENU_REV = 76-veggie-menu2`;
- `MODERN_UI_REV = 76-modern-ui1`;
- `v76-modern-ui.css` incluído na allowlist pública;
- `sw.js` revisto para cache `veggie-menu2-modern-ui1`;
- novo asset incluído no Service Worker.

### QA e publicação

- `tests/v76-veggie-menu.test.cjs` atualizado;
- criado `tests/v76-modern-ui.test.cjs`;
- testes integrados em CI e gate de Pages;
- PR #76 integrado em `main` no commit `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`;
- TypeScript PR `34537361127`: **sucesso**;
- CI PR `34537361274`: **sucesso**;
- TypeScript main `34537430909`: **sucesso**;
- CI main `34537430967`: **sucesso**;
- GitHub Pages `34537469989`: **sucesso**.

A validação física pós-publicação continua necessária para animação, swipe, scroll e geometrias em hardware real.

---

## 2026-09-10 — v76 `76-veggie-menu1`

Primeira versão TypeScript do Veggie Burger. Foi integrada pelo PR #74 e posteriormente revista pela evidência física que originou `76-veggie-menu2`.

---

## 2026-09-10 — v75 `75-expenses1`

- modernização de Lista/Calendário, pesquisa, filtros, resumo, tabela e cartões mobile;
- domínio financeiro e persistência inalterados;
- PR #73 integrado como `176450fcb236a2272afb9d6a6983b42681aa705d`.

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

## 2026-09-10 — v75 `75-assets1`, `75-pages1`, `75-usability1`

- biblioteca local-first para fontes, ícones e media;
- reorganização visual de Início, Despesas e Planeamento sem alterar cálculos;
- alvos tácteis 44/48 px, inputs mobile e pinch-to-zoom preservado.

## Histórico anterior

Revisões anteriores de faturas, pagamentos, navegação, segurança, sincronização, Mercado, catálogo e responsividade permanecem no histórico Git e em `release-manifest.json`. Não remover comportamento histórico sem prova de ausência de referências e regressões.
