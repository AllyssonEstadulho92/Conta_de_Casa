# TODO — Conta de Casa

Atualizado: 11 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM.
- [x] Manter `PBKDF2_ITERATIONS = 250000`.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sync por correções visuais/versionamento.
- [x] Preservar `estimatedCents` separado de `actualCents`.
- [x] Preservar `marketId|pid` no pipeline especializado.

## P0 — Base integrada

- [x] `75-startup2`.
- [x] `75-photo-loader3`.
- [x] `75-catalog4`.
- [x] `75-usability1`.
- [x] `75-pages1`.
- [x] `75-assets1`.
- [x] `75-market1`.
- [x] `75-expenses1`.
- [x] Fundação TypeScript — PR #72.
- [x] `76-veggie-menu1` — PR #74.
- [x] `76-veggie-menu2` + `76-modern-ui1` — PR #76.
- [x] `76-version-audit1` — PR #78.
- [x] `76-mobile-shell2` — PR #80.
- [x] Baseline arquitetural transversal v76 — PR #82.
- [x] Sincronização documental da baseline — PR #83.

## P0 — release estável `0.76.0 / v76`

Branch: `release/v76-ready`.

### Versão e bundle

- [x] Promover `package.json.version` para `0.76.0`.
- [x] Promover `release-manifest.latestVersion` para `v76`.
- [x] Adicionar notas de release v76 preservando histórico v75-v64.
- [x] Alterar `scripts/prepare-pages.cjs` para `BUILD = 'v76'`.
- [x] Invalidar cache PWA com revisão `v76-release1`.
- [x] Preservar `STATE_VERSION=5` e formato de dados.
- [x] Preservar cifragem, cêntimos, sync, QR/scanner e regras financeiras.

### CI e QA automatizado

- [x] Integrar TypeScript strict no job principal `quality`.
- [x] Manter a suíte funcional/financeira/segurança/sync existente no mesmo gate.
- [x] Criar `tests/release-readiness.test.cjs`.
- [x] Validar referências locais do HTML e assets do Service Worker no `dist/`.
- [x] Validar exclusão de docs/tests/scripts do bundle público.
- [x] Adicionar Playwright como dependência de desenvolvimento fixada.
- [x] Criar `playwright.config.cjs`.
- [x] Criar smoke tests Chromium desktop/mobile.
- [x] Criar smoke tests WebKit 320/430 px.
- [x] Preservar traces em falhas de browser smoke.
- [x] Tornar `browser-smoke` dependente de `quality`.
- [ ] Confirmar CI completo da branch `release/v76-ready` verde.
- [ ] Confirmar TypeScript Foundation do PR verde.
- [ ] Rever diff final da release antes do merge.

### Publicação

- [x] Simplificar Pages para confiar no CI completo como gate funcional.
- [x] Fazer checkout do SHA exato aprovado pelo CI.
- [x] Confirmar identidade `git rev-parse HEAD == workflow_run.head_sha`.
- [x] Repetir TypeScript + release-readiness antes de gerar o bundle.
- [x] Validar no `dist/`: `0.76.0`, `v76`, Build ID de 7 hex e manifesto v76.
- [ ] Criar PR da release para `main`.
- [ ] Integrar apenas com CI/TypeScript verdes.
- [ ] Confirmar CI completo no SHA de merge em `main`.
- [ ] Confirmar GitHub Pages publicado a partir do SHA aprovado.
- [ ] Sincronizar PROJECT_STATE/DECISIONS/TODO/CHANGELOG com SHA, Build ID e run IDs publicados.

### Validação física pós-publicação

- [ ] Abrir build v76 publicado em iPhone/Safari.
- [ ] Atualizar/instalar PWA e confirmar que o Service Worker v76 assume controlo apenas após ação explícita.
- [ ] Confirmar Veggie Burger totalmente abaixo da status bar/Dynamic Island.
- [ ] Confirmar topbar no fluxo durante scroll.
- [ ] Confirmar último conteúdo integralmente acima do dock.
- [ ] Confirmar bottom nav sem corte de ícone/rótulo.
- [ ] Confirmar teclado virtual/foco em formulários.
- [ ] Confirmar portrait e landscape.
- [ ] Confirmar Início, Despesas, Mercado, Planeamento, Mais e páginas secundárias.

## P0 — baseline arquitetural transversal v76

Estado: publicado pelo PR #82.

- [x] Rever Apple HIG/Apple Developer, MDN, W3C/WCAG 2.2, web.dev e OWASP.
- [x] Formalizar propriedade única por preocupação.
- [x] Definir reflow 320 px e matriz responsive.
- [x] Retirar geometria global de `mobile-layout.css`.
- [x] Manter `v76-mobile-shell.css` como autoridade mobile.
- [x] Criar `tests/ui-architecture-contract.test.cjs`.
- [x] Adicionar gate à CI.
- [x] CI, TypeScript Foundation e Pages verdes após integração.

### Consolidação seguinte — sem big-bang

- [ ] Inventariar seletores duplicados entre `v74-*`, `v75-*`, `v76-modern-ui.css` e `v76-mobile-shell.css`.
- [ ] Classificar cada regra como tokens/shell/components/features/states/utilities.
- [ ] Remover da camada visual master geometria global já pertencente ao shell, preservando valor computado.
- [ ] Medir e reduzir `!important` por domínio.
- [ ] Só introduzir `@layer` quando o domínio concorrente completo puder ser migrado.
- [ ] Criar comparação visual para todas as páginas antes de apagar CSS histórico.

## P0 — Segurança/PWA a consolidar

- [ ] Auditar dependência runtime ZXing e avaliar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` apenas depois de eliminar estilos inline necessários.
- [ ] Rever CSP final do `dist/` e justificar cada origem externa.
- [ ] Classificar cache por tipo de recurso.
- [ ] Confirmar que ausência/falha de Service Worker não quebra o núcleo online.
- [ ] Criar gates adicionais de input validation para fontes remotas, QR/código de barras e importação de fatura.

## P0 — governação

- [ ] Ativar branch protection/ruleset equivalente para `main` quando a configuração administrativa permitir.
- [ ] Tornar CI obrigatório ao nível das regras do repositório, além do controlo operacional por PR.
- [ ] Avaliar lockfile para tornar a resolução transitiva da toolchain de CI totalmente reprodutível.

## P0 — v76 Bloco 2: dinheiro, quantidades e datas

Branch reservada: `feat/v76-money-dates`.

- [ ] Mapear testes atuais.
- [ ] Criar vetores de paridade JS→TS.
- [ ] Migrar funções puras sem mudar resultados.
- [ ] Criar tipos de `Cents`, datas civis e quantidades escaladas.
- [ ] Evitar floating point em operações contabilísticas.
- [ ] Testar limites, inválidos, arredondamento e quantidades fracionárias.
- [ ] Só substituir runtime com paridade comprovada.

## P0 — v76 Bloco 3: domínio financeiro

- [ ] Migrar `finance.js` por subdomínios.
- [ ] Tipar faturas, pagamentos, rendimentos, orçamento, objetivos e relatórios.
- [ ] Testar pagamentos parciais, vencimentos, recorrência e arredondamentos.
- [ ] Manter dinheiro persistido em cêntimos inteiros.

## P0 — v76 Blocos 4–6: Mercado exato, caixa e assets

- [ ] Separar identidade, observação de preço, estimativa, confirmação, quantidade/peso e total.
- [ ] Criar motor de carrinho com aritmética controlada.
- [ ] Suportar GTIN/EAN, unidades, embalagens e produtos a peso.
- [ ] Modelar promoções/descontos/cupões apenas com regras conhecidas e testadas.
- [ ] Reconciliar com talão/fatura sem substituir valores silenciosamente.
- [ ] Corrigir lacuna `pid` com teste específico.
- [ ] Preferir GTIN/PID para imagens.

## P0 — v76 Blocos 7–10

- [ ] Migrar cofre/IndexedDB sem alterar algoritmos/schema sem decisão própria.
- [ ] Migrar sync/conflitos com testes de concorrência/offline.
- [ ] Migrar render/forms/events com tipos DOM e guards.
- [ ] Migrar Service Worker/build após pipeline TS estável.
- [ ] Remover JavaScript legado apenas com prova de ausência de referências.
- [ ] Eliminar `any` não justificado.

## P2 — Consolidação visual

- [ ] Consolidar por propriedade/responsabilidade, não por ficheiro ou número de versão.
- [ ] Remover CSS histórico apenas com comparação visual e regressões verdes.
- [ ] Manter uma única fonte estrutural por preocupação sem quebrar PWA/Safari.
