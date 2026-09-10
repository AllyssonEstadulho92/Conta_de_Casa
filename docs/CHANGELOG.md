# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-10 — v76 `76-version-audit1` — auditoria de versão e atualizações

### Diagnóstico

A comparação com o Foco Jornada revelou um defeito confirmado no fluxo manual de atualização do Conta de Casa. Quando `release-manifest.latestVersion` era igual ao `app-build` instalado, `app-update.js` terminava a operação antes de `registration.update()`. Assim, uma compilação nova dentro da mesma release `v75` podia ser tratada como inexistente.

Também existia ambiguidade visual entre a versão semântica do programa, a release pública e o build efetivamente publicado.

### Alterações

- `package.json.version` passa a ser exposto como versão da aplicação: `0.76.0-dev.1`;
- release pública permanece `v75`;
- `scripts/prepare-pages.cjs` injeta `app-version`, `app-build-id` e `app-build-date` no HTML distribuído;
- Build ID usa SHA Git curto de 7 caracteres, com fallback CI/local controlado;
- `Versão e Atualizações` passa a mostrar versão instalada, release, Build ID, data, PWA/Web, estado do Service Worker e rede;
- criado `v76-version-about.css` para a apresentação desse bloco;
- botão principal passa a `Verificar e atualizar agora`;
- `registration.update()` é executado antes da conclusão de que não existe atualização;
- uma release igual já não impede deteção de build mais recente;
- instalação continua explícita por `APPLY_UPDATE`;
- cache PWA revisto para `version-audit1`;
- `tests/app-update.test.cjs` passou a validar ordem, metadados, distribuição e o caso de same-release build.

### QA

- commit funcional: `41cd36b662991fc2f29d5736c2b77621c4649e87`;
- a primeira execução CI `34539687982` encontrou uma falha no novo teste: a regex esperava acesso DOM literal, enquanto o código usava o helper genérico `metaValue()`; não foi falha de runtime;
- teste corrigido em `9d6a923c6f10bda2e7128f48053ad278063634ca`;
- CI `34539811658`: **sucesso**;
- passaram finanças, invariantes, faturas, Mercado, scanner, UI v76, Centro de Atualização, segurança, responsividade, acessibilidade, sincronização e manifest.

### Isolamento

Nenhuma alteração em `core.js`, `finance.js`, estado financeiro, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sincronização cifrada, QR, scanner, CSP ou regras financeiras.

---

## 2026-09-10 — v76 `76-veggie-menu2` + `76-modern-ui1` — publicado

### Origem

Validação física em iPhone/Safari revelou duas regressões: a transformação Veggie Burger → X não era percebida de forma fiável e a topbar sticky/fixa permanecia no viewport durante scroll. A revisão também confirmou necessidade de uma linguagem UI/UX transversal mais consistente entre páginas.

### Menu e cabeçalho

- `src/ui/veggie-menu-toggle.ts` revisto em TypeScript strict;
- animação explícita via Web Animations API;
- superior `0° → +45°` e inferior `0° → -45°`;
- ambas as barras permanecem visíveis;
- apenas um `#mobileMenuBtn`;
- botão fora da `.nav-drawer-shell` durante drawer/swipe;
- `.topbar` passa ao fluxo normal em mobile;
- `.main` deixa de reservar espaço para header fixo.

### UI/UX master

Criado `v76-modern-ui.css`, revisão `76-modern-ui1`, cobrindo Início, Despesas/Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições, além de dialogs, drawer, bottom navigation, tabs, formulários, botões, tabelas, estados vazios e superfícies.

### QA e publicação

PR #76 integrado em `main` no commit `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`; TypeScript main `34537430909`, CI main `34537430967` e GitHub Pages `34537469989`: sucesso.

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
