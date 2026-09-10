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

## P0 — `76-veggie-menu2` + `76-modern-ui1`

### Evidência/diagnóstico

- [x] Rever captura física iPhone/Safari enviada em 10/09/2026.
- [x] Confirmar que o Veggie Burger fechado aparece, mas a animação ao abrir não é percebida de forma fiável.
- [x] Confirmar conflito visual entre topbar sticky/fixa e fluxo do conteúdo durante scroll.
- [x] Separar problema do menu de problema do cabeçalho.

### Menu

- [x] Manter exatamente duas linhas no Veggie Burger.
- [x] Criar animação TS explícita das duas linhas por Web Animations API.
- [x] Linha superior termina em `+45°`.
- [x] Linha inferior termina em `-45°`.
- [x] Ambas mantêm `opacity: 1` durante a transformação.
- [x] Manter um único `#mobileMenuBtn`.
- [x] Manter botão fora da shell transformada durante drawer aberto/swipe.
- [x] Manter `prefers-reduced-motion` e `forced-colors`.
- [x] Atualizar revisão para `76-veggie-menu2`.

### Header e fluxo

- [x] Revogar regra sticky anterior com base em evidência física.
- [x] Colocar `.topbar` em `position: relative` no mobile.
- [x] Remover padding estrutural reservado para header fixo.
- [x] Fazer conteúdo começar depois do header sem sobreposição.
- [x] Manter navegação inferior persistente.

### UI/UX master

- [x] Criar `v76-modern-ui.css`.
- [x] Definir tokens de superfície, cor, borda, sombra, raio e foco.
- [x] Modernizar Dashboard/Início.
- [x] Modernizar Despesas/Faturas.
- [x] Modernizar Mercado.
- [x] Modernizar Calendário.
- [x] Modernizar Planeamento.
- [x] Modernizar Relatórios.
- [x] Modernizar Objetivos.
- [x] Modernizar Segurança.
- [x] Modernizar Diagnóstico.
- [x] Modernizar Definições.
- [x] Modernizar dialogs, drawer, tabs, formulários, estados vazios e bottom nav.
- [x] Preservar tema escuro.
- [x] Preservar reduced-motion, forced-colors, foco e alvos tácteis.

### Build/QA

- [x] Publicar `v76-modern-ui.css` pela allowlist de Pages.
- [x] Carregar `v76-modern-ui.css` depois de `v75-usability.css`.
- [x] Atualizar Service Worker/cache para `veggie-menu2-modern-ui1`.
- [x] Atualizar `tests/v76-veggie-menu.test.cjs`.
- [x] Criar `tests/v76-modern-ui.test.cjs`.
- [x] Adicionar teste master UI ao CI.
- [x] Adicionar teste master UI ao gate de Pages.
- [x] CI push funcional `34537017339`: sucesso.
- [ ] Abrir PR para `main`.
- [ ] TypeScript strict do PR: sucesso.
- [ ] CI do PR: sucesso.
- [ ] Confirmar branch `behind 0` antes do merge.
- [ ] Integrar PR.
- [ ] CI de `main`: sucesso.
- [ ] TypeScript de `main`: sucesso.
- [ ] GitHub Pages: sucesso.

### Validação física após publicação

- [ ] iPhone/Safari/PWA: duas linhas visíveis no estado fechado.
- [ ] Toque: animação contínua duas linhas → X.
- [ ] Fecho: X → duas linhas sem desaparecimento.
- [ ] Swipe abertura/fecho sem perda do botão.
- [ ] Header rola com o conteúdo e não fica preso no viewport.
- [ ] Conteúdo nunca passa por baixo/por cima da topbar.
- [ ] Bottom nav não tapa ações finais.
- [ ] Validar Início, Despesas, Mercado, Planeamento e Mais em 320/375/390/430 px.
- [ ] Validar Calendário, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
- [ ] Validar tablet e desktop.
- [ ] Validar claro/escuro e orientação vertical/horizontal.

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
- [ ] Corrigir a lacuna `pid` com teste específico.
- [ ] Preferir GTIN/PID para imagens.
- [ ] Verificar licença/origem de logos SVG antes de incorporar assets locais.

## P0 — v76 Blocos 7–10

- [ ] Migrar cofre/IndexedDB sem alterar algoritmos ou schema sem decisão própria.
- [ ] Migrar sync/conflitos com testes de concorrência/offline.
- [ ] Migrar render/forms/events com tipos DOM e guards.
- [ ] Migrar Service Worker/build após pipeline TS estável.
- [ ] Remover JavaScript legado apenas com prova de ausência de referências.
- [ ] Eliminar `any` não justificado.

## P2 — Consolidação visual

- [ ] Só depois da validação física de `76-modern-ui1`, medir quais camadas v74/v75 podem ser fundidas.
- [ ] Remover CSS histórico apenas com comparação visual e regressões verdes.
- [ ] Manter uma única fonte visual final sem quebrar compatibilidade PWA/Safari.
