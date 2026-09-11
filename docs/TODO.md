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

## P0 — baseline arquitetural transversal v76

Branch: `refactor/v76-architecture-baseline`.

### Pesquisa e critérios

- [x] Rever Apple HIG/Apple Developer para safe areas, toolbar e navegação de topo.
- [x] Rever MDN para `env(safe-area-inset-*)`, `viewport-fit=cover`, specificity, `@layer` e container queries.
- [x] Rever W3C/WCAG 2.2 para Reflow 320 px, Target Size e Focus Not Obscured.
- [x] Rever web.dev para PWA/cache/IndexedDB/Cache Storage.
- [x] Rever OWASP para CSP e validação de inputs.
- [x] Formalizar propriedade única por preocupação em `ARCHITECTURE.md` e D-073.
- [x] Definir 44×44 CSS px como baseline tátil interno para controlos primários, preservando WCAG 2.2 AA como mínimo normativo.
- [x] Definir matriz responsive 320/360/375/390/430/768/820/1024+.
- [x] Proibir novos “patch files” para a mesma geometria global.

### Implementação inicial

- [x] Retirar de `mobile-layout.css` a propriedade antiga de `.app-shell`, `.main`, `.topbar` e viewport interno.
- [x] Manter em `mobile-layout.css` apenas refinamentos de feature do Mercado.
- [x] Atualizar `tests/mobile-layout-regression.test.cjs` para a arquitetura atual.
- [x] Criar `tests/ui-architecture-contract.test.cjs`.
- [x] Adicionar o novo gate à CI.
- [ ] CI integral da branch verde.
- [ ] TypeScript Foundation verde.
- [ ] Rever diff antes de integração.
- [ ] Integrar em `main` apenas após gates verdes.
- [ ] Publicar Pages e confirmar build.

### Consolidação seguinte — sem big-bang

- [ ] Inventariar seletores duplicados entre `v74-*`, `v75-*`, `v76-modern-ui.css` e `v76-mobile-shell.css`.
- [ ] Classificar cada regra como tokens/shell/components/features/states/utilities.
- [ ] Remover da camada visual master a geometria global já coberta pelo shell, preservando exatamente o valor computado final.
- [ ] Medir e reduzir `!important` por domínio, sem remoção cega.
- [ ] Só introduzir `@layer` quando o domínio concorrente completo puder ser migrado em conjunto.
- [ ] Usar container queries apenas em componentes cujo comportamento depende do contentor.
- [ ] Consolidar assets CSS/JS de build sem perder modularidade de source ou capacidade de auditoria.
- [ ] Criar comparação visual para todas as páginas antes de apagar CSS histórico.

### Segurança/PWA a consolidar

- [ ] Auditar dependência runtime do ZXing remoto e avaliar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` apenas depois de eliminar estilos inline necessários.
- [ ] Rever CSP final do `dist/` e justificar cada origem externa.
- [ ] Classificar cache por tipo de recurso; evitar cache indevido de manifestos/metadata de atualização.
- [ ] Confirmar que falha/ausência de Service Worker não quebra o núcleo online.
- [ ] Criar gates de input validation para fontes remotas, QR/código de barras e importação de fatura.

## P0 — `76-mobile-shell2`

### Diagnóstico, implementação e publicação

- [x] Confirmar pela captura física que a topbar entra na status bar do iPhone.
- [x] Confirmar pela captura física que o dock inferior cobre/corta conteúdo final.
- [x] Identificar conflito entre `mobile-layout.css` (`100dvh` + scroll interno) e `76-modern-ui1` (topbar no fluxo).
- [x] Criar `v76-mobile-shell.css` como autoridade final da geometria ≤820 px.
- [x] Mover o scroll principal para o documento e remover clipping final de `.app-shell`/`.main`.
- [x] Aplicar `safe-area-inset-top` ao cabeçalho.
- [x] Aplicar `safe-area-inset-bottom` e altura explícita ao dock.
- [x] Reservar `padding-bottom` de página superior à altura total do dock.
- [x] Cobrir ≤390 px, ≤359 px e landscape de baixa altura.
- [x] Preservar pinch-to-zoom; não usar `zoom` CSS.
- [x] Adicionar `v76-mobile-shell.css` à allowlist Pages e cache PWA.
- [x] Adicionar `tests/v76-mobile-shell.test.cjs` à CI e ao gate do Pages.
- [x] CI funcional da branch `34541849503`: sucesso.
- [x] PR #80: CI + TypeScript strict verdes.
- [x] Integrar em `main`: `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`.
- [x] TypeScript Foundation de `main` `34542259212`: sucesso.
- [x] CI de `main` `34542259148`: sucesso.
- [x] GitHub Pages `34542303536`: sucesso.
- [ ] Validar fisicamente a compilação publicada no iPhone/Safari/PWA.

### Validação física obrigatória

- [ ] Veggie Burger totalmente abaixo da hora/status bar.
- [ ] Topbar rola com o conteúdo e nunca fica presa no viewport.
- [ ] Scroll chega ao último cartão/ação sem corte.
- [ ] Último conteúdo fica integralmente acima do dock.
- [ ] Bottom nav não corta ícone nem rótulo.
- [ ] 320/375/390/430 px.
- [ ] vertical e horizontal.
- [ ] Safari web e PWA instalada.
- [ ] Início, Despesas, Mercado, Planeamento e Mais.
- [ ] Calendário, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.

## P0 — `76-version-audit1`

- [x] Corrigir falso “atualizado” antes de `registration.update()`.
- [x] Separar versão da aplicação, release pública e build exato.
- [x] Application Version `0.76.0-dev.1`; release pública `v75`.
- [x] PR #78 integrado; CI/TypeScript/Pages verdes.
- [ ] Validar fisicamente no iPhone/Safari/PWA o cartão de versão e a verificação manual.

## P0 — Riscos de governação

- [ ] Ativar ou definir proteção equivalente da branch `main`; encontra-se atualmente sem branch protection.
- [ ] Tornar CI + TypeScript Foundation gates obrigatórios antes de integração quando a configuração do repositório permitir.

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
- [ ] Verificar licença/origem de logos SVG antes de incorporar assets locais.

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
- [ ] Manter uma única fonte estrutural por preocupação sem quebrar compatibilidade PWA/Safari.
