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

- [ ] Avaliar proteção da branch `main`; encontra-se atualmente sem branch protection.

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

- [ ] Após validação física de `76-mobile-shell2`, medir quais camadas v74/v75 podem ser fundidas.
- [ ] Remover CSS histórico apenas com comparação visual e regressões verdes.
- [ ] Manter uma única fonte visual final sem quebrar compatibilidade PWA/Safari.
