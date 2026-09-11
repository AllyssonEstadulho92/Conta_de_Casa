# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-11 — v76 baseline arquitetural transversal — publicado

### Pesquisa

Foi feita revisão de fontes primárias/de elevada confiança para substituir correções por sobreposição por um critério estrutural comum à aplicação:

- Apple Human Interface Guidelines / Apple Developer: safe areas, layout, toolbars e navegação;
- MDN Web Docs: `env(safe-area-inset-*)`, `viewport-fit=cover`, specificity, cascade layers e container queries;
- W3C/WAI WCAG 2.2: Reflow a 320 CSS px, Target Size e Focus Not Obscured;
- web.dev: PWA, Cache Storage, IndexedDB e estratégias de cache;
- OWASP Cheat Sheet Series: Content Security Policy e Input Validation.

### Diagnóstico

A aplicação ainda mantinha responsabilidades estruturais duplicadas entre CSS histórico e camadas v75/v76. O caso comprovado era `mobile-layout.css`: voltava a definir `.app-shell`, `.main` e `.topbar` apesar de `v76-mobile-shell.css` ser a autoridade final. O resultado podia estar correto apenas porque a última camada ganhava a cascata com especificidade/`!important`.

### Alterações da baseline

- definida propriedade única por preocupação: tokens, shell, components, features, states, utilities, domínio, persistência, sync, PWA e segurança;
- `mobile-layout.css` deixa de possuir viewport, scroll principal, topbar e bottom navigation;
- `mobile-layout.css` fica restrito a refinamentos móveis de feature do Mercado;
- `v76-mobile-shell.css` é a única autoridade declarada para geometria global em ≤820 px;
- `tests/mobile-layout-regression.test.cjs` deixa de exigir a arquitetura antiga;
- criado `tests/ui-architecture-contract.test.cjs` para impedir regressão da propriedade do shell, safe areas, zoom, baseline táctil, ordem de build e invalidação PWA;
- CI passa a executar o novo contrato;
- cache PWA revisto para `architecture-baseline1`;
- `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md`, `PROJECT_STATE.md` e `CHANGELOG.md` atualizados.

### Critério novo

- reflow obrigatório a 320 CSS px sem perda de conteúdo/funcionalidade;
- baseline tátil interna de 44×44 CSS px para controlos primários no iPhone;
- safe areas por `env()` e não por modelo de aparelho;
- bottom navigation apenas para destinos de topo;
- sem novos ficheiros “patch” para a mesma geometria;
- `@layer` só entra quando o domínio concorrente puder ser migrado em conjunto;
- redução de `!important` será progressiva e baseada em propriedade consolidada;
- PWA/cache e segurança passam a ter critérios de aceitação explícitos.

### QA e publicação

- PR #82 integrado em `main` no commit `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`;
- TypeScript Foundation de `main` `34577495832`: sucesso;
- CI de `main` `34577495803`: sucesso;
- GitHub Pages `34577588233`: sucesso;
- Build ID publicado: `bb0cd65`.

### Isolamento

Esta primeira etapa não altera `core.js`, `finance.js`, schema, IndexedDB, PBKDF2/AES-GCM, pagamentos, faturas, QR, scanner, sincronização cifrada ou regras financeiras/Mercado.

### Pendente

Validação física do build publicado no iPhone/Safari/PWA e consolidação progressiva da geometria ainda duplicada em `v76-modern-ui.css`/camadas v74-v75. Esta consolidação será feita por domínio e com regressão, não por big-bang.

---

## 2026-09-11 — v76 `76-mobile-shell2` — publicado

### Evidência física

Captura em iPhone/Safari mostrou dois defeitos concretos:

- topbar/ícone do menu dentro da área ocupada pela hora e indicadores do iOS;
- conteúdo inferior visualmente cortado/encoberto pelo dock persistente.

### Causa confirmada no código

A aplicação tinha uma arquitetura de viewport mista. `mobile-layout.css` ainda prendia `.app-shell` e `.main` a `100dvh`, com `overflow:hidden` no shell e scroll interno em `.main`. Entretanto, `76-modern-ui1` já tinha colocado a `.topbar` em fluxo normal e removido o padding de header fixo. A cascata mantinha, portanto, restrições antigas de viewport sem a respetiva geometria de cabeçalho.

### Alterações

- criado `v76-mobile-shell.css`, revisão `76-mobile-shell2`, carregado depois de `v76-modern-ui.css`;
- scroll vertical principal passa a pertencer ao documento em mobile;
- `.app-shell` e `.main` deixam de impor `max-height:100dvh`/clipping na camada final;
- topbar mantém-se relativa e recebe compensação por `safe-area-inset-top`;
- dock mantém-se fixo com altura explícita e `safe-area-inset-bottom`;
- páginas reservam `padding-bottom` calculado para manter o último conteúdo acima do dock;
- adicionados ajustes para ≤390 px, ≤359 px e landscape de baixa altura;
- elementos focáveis usam `scroll-margin-bottom` para permanecer visíveis;
- sem `zoom` CSS e sem bloqueio de pinch-to-zoom;
- novo asset incluído em `scripts/prepare-pages.cjs` e no cache PWA;
- novo teste `tests/v76-mobile-shell.test.cjs` integrado na CI e no gate do GitHub Pages.

### Versionamento

A versão de programa permanece `0.76.0-dev.1` e a release pública permanece `v75`. Esta correção é distinguida pelo Build ID, conforme o modelo de versionamento já adotado.

### QA e publicação

- `tests/v76-mobile-shell.test.cjs`: sucesso;
- CI funcional da branch `34541849503`: sucesso integral;
- PR #80 integrado em `main` no commit `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`;
- TypeScript Foundation de `main` `34542259212`: sucesso;
- CI de `main` `34542259148`: sucesso;
- GitHub Pages `34542303536`: sucesso.

### Isolamento

Não foram alterados `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sincronização cifrada, QR, scanner, CSP ou regras financeiras/Mercado.

### Pendente

Validação física da compilação publicada no iPhone/Safari/PWA, incluindo 320/375/390/430 px e scroll até ao último item.

---

## 2026-09-10 — v76 `76-version-audit1` — auditoria de versão e atualizações — publicado

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

### QA e publicação

- commit funcional: `41cd36b662991fc2f29d5736c2b77621c4649e87`;
- teste corrigido em `9d6a923c6f10bda2e7128f48053ad278063634ca`;
- CI funcional `34539811658`: sucesso;
- PR #78 integrado em `main` no commit `a68de711df1c42ec33948d3fff2f4d5e337e2436`;
- TypeScript Foundation de `main` `34540271567`: sucesso;
- CI de `main` `34540271547`: sucesso;
- GitHub Pages `34540307404`: sucesso.

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
