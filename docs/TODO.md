# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM.
- [x] Manter `PBKDF2_ITERATIONS = 250000`.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sync por correções visuais.
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
- [x] `76-veggie-menu2` + `76-modern-ui1` — PR #76, merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

## P0 — `76-veggie-menu2` + `76-modern-ui1`

### Implementação

- [x] Rever captura física iPhone/Safari.
- [x] Separar regressão do menu de regressão da topbar.
- [x] Manter exatamente duas linhas no Veggie Burger.
- [x] Animar as duas linhas explicitamente em TypeScript/Web Animations API.
- [x] Superior `+45°`; inferior `-45°`; ambas visíveis.
- [x] Manter um único `#mobileMenuBtn`.
- [x] Manter botão fora da shell transformada durante drawer/swipe.
- [x] Revogar topbar sticky no mobile.
- [x] Colocar `.topbar` em fluxo normal e remover padding de header fixo.
- [x] Criar `v76-modern-ui.css` como camada visual final.
- [x] Modernizar Início, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
- [x] Modernizar dialogs, drawer, tabs, formulários, estados vazios e bottom nav.
- [x] Preservar tema escuro, reduced-motion, forced-colors, foco e alvos tácteis.

### Build/QA

- [x] Publicar `76-veggie-menu2` e `76-modern-ui1` pela allowlist de Pages.
- [x] Atualizar Service Worker/cache para `veggie-menu2-modern-ui1`.
- [x] Atualizar `tests/v76-veggie-menu.test.cjs`.
- [x] Criar `tests/v76-modern-ui.test.cjs`.
- [x] Adicionar testes ao CI e gate de Pages.
- [x] CI da branch `34537274602`: sucesso.
- [x] TypeScript PR `34537361127`: sucesso.
- [x] CI PR `34537361274`: sucesso.
- [x] Confirmar branch `behind 0` antes do merge.
- [x] Integrar PR #76.
- [x] TypeScript main `34537430909`: sucesso.
- [x] CI main `34537430967`: sucesso.
- [x] GitHub Pages `34537469989`: sucesso.

### Validação física pós-publicação

- [ ] iPhone/Safari/PWA: duas linhas visíveis no estado fechado.
- [ ] Toque: animação contínua duas linhas → X.
- [ ] Fecho: X → duas linhas sem desaparecimento.
- [ ] Swipe abertura/fecho sem perda do botão.
- [ ] Header rola com o conteúdo e não fica preso no viewport.
- [ ] Conteúdo nunca passa por baixo/por cima da topbar.
- [ ] Bottom nav não tapa ações finais.
- [ ] Validar Início, Despesas, Mercado, Planeamento e Mais em 320/375/390/430 px.
- [ ] Validar Calendário, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
- [ ] Validar tablet/desktop, claro/escuro e orientação vertical/horizontal.

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

- [ ] Após validação física de `76-modern-ui1`, medir quais camadas v74/v75 podem ser fundidas.
- [ ] Remover CSS histórico apenas com comparação visual e regressões verdes.
- [ ] Manter uma única fonte visual final sem quebrar compatibilidade PWA/Safari.
