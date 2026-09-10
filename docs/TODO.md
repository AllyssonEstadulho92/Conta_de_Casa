# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

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

## P0 — `76-version-audit1`

### Auditoria e correção

- [x] Comparar o Centro de Atualização com o padrão implementado no Foco Jornada.
- [x] Confirmar erro: retorno por release igual ocorria antes de `registration.update()`.
- [x] Separar versão da aplicação, release pública e build exato.
- [x] Usar `package.json.version` como Application Version: `0.76.0-dev.1`.
- [x] Preservar release pública `v75` sem promoção artificial.
- [x] Injetar Build ID Git curto e Build Date no HTML distribuído.
- [x] Mostrar versão, release, build, data, PWA/Web, Service Worker e rede em `Versão e Atualizações`.
- [x] Garantir que `registration.update()` ocorre antes da conclusão “atualizado”.
- [x] Permitir deteção de Service Worker novo dentro da mesma release.
- [x] Manter instalação explícita por `APPLY_UPDATE`.
- [x] Adicionar `v76-version-about.css` à distribuição/cache.
- [x] Atualizar regressão em `tests/app-update.test.cjs`.
- [x] CI final da branch `34539811658`: sucesso.
- [x] PR #78: CI `34540211775` + TypeScript strict `34540211764` — sucesso.
- [x] Integrar em `main`: merge `a68de711df1c42ec33948d3fff2f4d5e337e2436`.
- [x] Confirmar `main`: CI `34540271547` + TypeScript `34540271567` — sucesso.
- [x] Confirmar GitHub Pages `34540307404` — sucesso.
- [ ] Validar fisicamente no iPhone/Safari/PWA o cartão de versão e a verificação manual.

### Riscos de governação

- [ ] Avaliar proteção da branch `main`; encontra-se atualmente sem branch protection.

## P0 — validação física `76-veggie-menu2` + `76-modern-ui1`

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
