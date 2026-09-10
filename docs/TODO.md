# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e dinheiro em cêntimos inteiros.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM e `PBKDF2_ITERATIONS = 250000`.
- [x] Preservar faturas, pagamentos, QR, scanner e sync em alterações apenas visuais.
- [x] Preservar `estimatedCents` separado de `actualCents` no Mercado.
- [x] Preservar `marketId|pid` no pipeline especializado.

## P0 — Baseline integrada

- [x] `75-startup2`.
- [x] `75-photo-loader3`.
- [x] `75-catalog4`.
- [x] `75-usability1`.
- [x] `75-pages1`.
- [x] `75-assets1`.
- [x] `75-market1` — PR #71.
- [x] v76 Bloco 1 TypeScript — PR #72 / `2c1d78508507ab77d6df95850568d9fd7f6b9577`.
- [x] CI main do Bloco 1: `34485922896`.
- [x] TypeScript main do Bloco 1: `34485922921`.
- [x] Pages main do Bloco 1: `34485986996`.

## P0 — `75-expenses1`: Despesas modernas

### Auditoria

- [x] Confirmar estrutura de `#page-bills` em `index.html`.
- [x] Confirmar `renderBills()`/`filterBills()` como fluxo canónico.
- [x] Confirmar tabela desktop e cartões mobile existentes.
- [x] Confirmar ações Abrir/Detalhes, Editar, Pagar e Excluir existentes.
- [x] Confirmar que não é necessária alteração financeira para o redesign.

### Implementação

- [x] Criar branch `feat/v75-expenses-modern-ui` a partir de `main`.
- [x] Criar `v75-expenses-modern.css` revisão `75-expenses1`.
- [x] Modernizar Lista/Calendário sem alterar navegação.
- [x] Modernizar pesquisa e `Nova fatura`.
- [x] Modernizar painel de filtros.
- [x] Modernizar cartões de resumo.
- [x] Modernizar tabela desktop.
- [x] Modernizar cartões mobile.
- [x] Manter `Em falta`, vencimento, Total, Pago, Categoria, progresso e ações.
- [x] Adicionar breakpoints `≤1100`, `≤820` e `≤430`.
- [x] Adicionar `prefers-reduced-motion` e `forced-colors`.
- [x] Não alterar `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` ou `index.html` fonte.

### Distribuição e QA

- [x] Adicionar `EXPENSES_REV = 75-expenses1` ao build.
- [x] Incluir CSS na allowlist de Pages.
- [x] Carregar depois de `v75-pages.css` e antes de `v75-usability.css`.
- [x] Adicionar asset e `expenses1` ao Service Worker/cache.
- [x] Criar `tests/v75-expenses-modern.test.cjs`.
- [x] Adicionar teste ao CI.
- [x] Adicionar teste ao workflow Pages.
- [x] CI do head funcional `80be8a2ff2a7099046a2e40da42b0ae1d5aa6d7d`: run `34495192199` — sucesso.
- [x] Comparação antes da documentação: `behind 0` relativamente a `main`.
- [ ] Confirmar CI verde no head documental final.
- [ ] Confirmar novamente `behind 0`.
- [ ] Abrir e rever PR.
- [ ] Integrar apenas com CI verde.
- [ ] Confirmar CI de `main` no SHA integrado.
- [ ] Confirmar GitHub Pages no SHA integrado.

### Validação física

- [ ] iPhone/Safari/PWA.
- [ ] 320 px.
- [ ] 375 px.
- [ ] 390 px.
- [ ] 430 px.
- [ ] tablet.
- [ ] desktop.
- [ ] tema claro.
- [ ] tema escuro.
- [ ] pesquisa.
- [ ] filtros + limpar filtros.
- [ ] Lista ↔ Calendário.
- [ ] Abrir/Detalhes.
- [ ] Editar.
- [ ] Pagar.
- [ ] Excluir quando permitido.
- [ ] muitas faturas e textos longos.

## P0 — v76 Bloco 2: dinheiro, quantidades e datas

Branch reservada: `feat/v76-money-dates`.

- [ ] Retomar apenas depois de fechar a revisão visual de Despesas.
- [ ] Mapear testes de `parseCents`, `money`, `validCents`, `marketQuantityMilli`, `marketLineCents` e datas civis.
- [ ] Criar vetores de paridade JS→TS.
- [ ] Migrar funções puras sem mudar resultados válidos.
- [ ] Criar constructors/guards de Cents, datas civis e quantidades escaladas.
- [ ] Evitar floating point em operações contabilísticas.
- [ ] Testar limites, inválidos, arredondamento, milhares, vírgula/ponto e quantidades fracionárias.
- [ ] Substituir runtime apenas quando a paridade estiver comprovada.

## P0 — v76 Bloco 3: domínio financeiro

- [ ] Migrar `finance.js` por subdomínios.
- [ ] Tipar faturas, pagamentos, rendimentos, orçamento, objetivos e relatórios.
- [ ] Cobrir pagamentos parciais, vencimentos, recorrência e arredondamento.
- [ ] Manter dinheiro persistido em cêntimos inteiros.

## P0 — v76 Blocos 4–6: Mercado, caixa e assets

- [ ] Separar identidade, preço observado, estimativa, confirmação, quantidade/peso e total.
- [ ] Criar motor de carrinho com aritmética inteira/razões controladas.
- [ ] Suportar GTIN/EAN e pesquisa manual sem misturar identidades.
- [ ] Suportar unidade, embalagem e produtos a peso.
- [ ] Modelar promoções/descontos apenas com regra conhecida e testada.
- [ ] Produzir subtotal, descontos, IVA quando determinado, estimativa, confirmado e diferença.
- [ ] Reconciliar com talão/fatura/QR sem substituição silenciosa.
- [ ] Corrigir com teste a lacuna `pid` do browser live.
- [ ] Preferir GTIN/PID a pesquisa por termo para imagens.
- [ ] Verificar origem/licença de logos antes de SVG local.

## P0 — v76 Blocos 7–10

- [ ] Migrar cofre/IndexedDB sem mudar criptografia por causa da linguagem.
- [ ] Migrar sync/conflitos com testes de concorrência/offline.
- [ ] Migrar render/forms/events com tipos DOM e guards de null.
- [ ] Migrar Service Worker/build depois de pipeline TS estável.
- [ ] Remover JavaScript legado apenas com prova de ausência de referências.
- [ ] Ativar `strict` em toda a árvore TypeScript e eliminar `any` não justificado.
- [ ] Revalidar segurança, finanças, sync, manifest, offline e responsividade.

## P1 — UI/UX restante

- [ ] Rever Mais e duplicações de navegação.
- [ ] Rever Segurança, Diagnóstico, Aparência e Preferências.
- [ ] Consolidar ícones Lucide visíveis.
- [ ] Auditoria final de foco, teclado, leitores de ecrã, contraste e alvos tácteis.

## P2 — Consolidação

- [ ] Medir e remover camadas visuais históricas apenas depois de validação física.
- [ ] Eliminar código morto somente com prova de ausência de referências.
- [ ] Manter documentação alinhada com o código real após cada bloco.
