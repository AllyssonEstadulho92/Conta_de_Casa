# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-11 — v76 release `0.76.0` — em validação

### Objetivo

Promover o programa v76 de `0.76.0-dev.1`/release pública v75 para uma release estável verificável `0.76.0`/`v76`, sem alterar schema, cálculos, cifragem ou dados persistidos.

### Versionamento e PWA

- `package.json.version` passa para `0.76.0`;
- `release-manifest.json` passa a declarar `v76` como `latestVersion` e mantém o histórico v75-v64;
- `scripts/prepare-pages.cjs` passa a produzir `BUILD = 'v76'`;
- Service Worker recebe cache `conta-de-casa-public-v76-release1-...` para invalidar app shells anteriores sem apagar IndexedDB;
- metadados publicados continuam separados em Application Version, Public Release, Build ID e Build Date.

### CI unificado

- TypeScript strict passa a integrar o job principal `quality`;
- toda a suíte funcional/financeira/segurança/PWA/sync continua obrigatória;
- criado `tests/release-readiness.test.cjs` para validar versão, manifesto, `dist/`, referências locais, assets do Service Worker e exclusão de ficheiros internos;
- criado `playwright.config.cjs`;
- criado `tests/e2e/release-smoke.spec.cjs`;
- novo job `browser-smoke` depende de `quality` e executa Chromium desktop/mobile e WebKit mobile 320/430 px;
- traces do Playwright são preservadas temporariamente quando o job falha.

### GitHub Pages

- Pages deixa de manter uma segunda cópia manual da suíte funcional;
- deploy automático continua dependente de CI completo verde em `main`;
- Pages faz checkout do `workflow_run.head_sha` aprovado e confirma a identidade do SHA;
- repete TypeScript + release-readiness, gera `dist/` e valida `0.76.0`, `v76`, Build ID de 7 hex e manifesto v76 antes do upload.

### Isolamento

Não foram alterados por esta promoção:

- `STATE_VERSION = 5`;
- `core.js`/schema persistido;
- cálculos monetários em cêntimos;
- PBKDF2-SHA-256/AES-GCM ou `PBKDF2_ITERATIONS = 250000`;
- IndexedDB financeiro;
- pagamentos/faturas;
- `estimatedCents`/`actualCents`;
- sincronização cifrada;
- identidade `marketId|pid`;
- QR/scanner por efeito da promoção de release.

### Gate

A release permanece **em validação** até CI completo da branch/PR, TypeScript Foundation do PR, revisão do diff, merge em `main`, CI do merge e GitHub Pages concluírem com sucesso.

WebKit automatizado reduz o risco do motor Safari, mas não será registado como validação física de iPhone/Safari/PWA. Essa confirmação exige hardware real.

---

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
- cache PWA revisto para `architecture-baseline1`.

### QA e publicação

- PR #82 integrado em `main` no commit `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`;
- TypeScript Foundation `34577495832`: sucesso;
- CI `34577495803`: sucesso;
- GitHub Pages `34577588233`: sucesso;
- Build ID: `bb0cd65`.

### Isolamento

Não foram alterados `core.js`, `finance.js`, schema, IndexedDB, PBKDF2/AES-GCM, pagamentos, faturas, QR, scanner, sincronização cifrada ou regras financeiras/Mercado.

---

## 2026-09-11 — v76 `76-mobile-shell2` — publicado

Captura em iPhone/Safari tinha mostrado topbar na área do sistema e conteúdo inferior atrás do dock. A causa foi confirmada como arquitetura de viewport mista entre `mobile-layout.css` e a UI v76.

Alterações principais:

- criado `v76-mobile-shell.css` como autoridade final de geometria mobile;
- scroll principal transferido para o documento;
- `.app-shell`/`.main` deixam de impor clipping `100dvh`;
- topbar relativa com safe-area superior;
- dock fixo com safe-area inferior e reserva integral nas páginas;
- ajustes para ecrãs estreitos e landscape;
- foco, reduced-motion, forced-colors e pinch-to-zoom preservados;
- teste `tests/v76-mobile-shell.test.cjs` adicionado aos gates.

PR #80 integrado em `main` em `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`; CI/TypeScript/Pages verdes.

---

## 2026-09-10 — v76 `76-version-audit1` — publicado

- introduz separação entre Application Version, Public Release e Build ID;
- `registration.update()` ocorre antes de concluir que não existe atualização;
- builds novos dentro da mesma release deixam de ser ignorados;
- aplicação de Service Worker continua explícita;
- Centro de Versão mostra app/release/build/data/PWA/rede;
- cofre, PIN, IndexedDB e dados financeiros permanecem isolados.

PR #78 integrado em `main` em `a68de711df1c42ec33948d3fff2f4d5e337e2436`; CI/TypeScript/Pages verdes.

---

## 2026-09-10 — v76 `76-veggie-menu2` + `76-modern-ui1` — publicado

- `src/ui/veggie-menu-toggle.ts` em TypeScript strict;
- duas barras canónicas formam X por Web Animations API;
- um único `#mobileMenuBtn`;
- topbar móvel passa ao fluxo normal;
- `v76-modern-ui.css` cria linguagem visual transversal para todas as páginas e componentes partilhados;
- domínio financeiro/persistência não alterados.

PR #76 integrado em `main` em `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

---

## 2026-09-10 — v76 Bloco 1 — fundação TypeScript

- TypeScript como dependência de desenvolvimento;
- `tsconfig.json` strict/noEmit;
- contratos em `src/types/`;
- workflow dedicado;
- PR #72 integrado em `2c1d78508507ab77d6df95850568d9fd7f6b9577`.

---

## 2026-09-10 — v75 melhorias integradas

- `75-expenses1`: modernização de Despesas sem alterar domínio financeiro;
- `75-market1`: fluxo de Mercado, filtros e estados de compra preservando `marketId|pid`;
- `75-assets1`, `75-pages1`, `75-usability1`: biblioteca local-first de assets, reorganização visual e alvos tácteis/pinch-to-zoom.

## Histórico anterior

Revisões anteriores de faturas, pagamentos, navegação, segurança, sincronização, Mercado, catálogo e responsividade permanecem no histórico Git e em `release-manifest.json`. Não remover comportamento histórico sem prova de ausência de referências e regressões.
