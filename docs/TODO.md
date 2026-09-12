# TODO — Conta de Casa

Atualizado: 12 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM e `PBKDF2_ITERATIONS = 250000`.
- [x] Preservar `estimatedCents` separado de `actualCents`.
- [x] Preservar `marketId|pid` no pipeline especializado.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sync por redesign/migração.

## P0 — Publicação

- [x] Identificar porque o site não refletiu a alteração.
- [x] Recuperar remoção prematura de `v75-architecture.js` no PR #87.
- [x] Publicar Dashboard `76-product-pages1` no PR #86.
- [x] Confirmar CI/TypeScript/Pages do PR #86.
- [x] Integrar PR #88 — primeira remoção segura de JS fonte.
- [x] TypeScript Foundation pós-PR88 `34699066645` verde.
- [x] CI pós-PR88 `34699066749` verde.
- [x] Pages pós-PR88 `34699100855` verde.
- [ ] Ativar branch protection/required checks quando a configuração permitir.

## P0 — UI/UX

### Dashboard

- [x] `Saldo atual` como resumo principal real.
- [x] `Por pagar`, `Em atraso`, `Saldo projetado` em segundo nível.
- [x] `Pago no mês` e `Próximos 7 dias` compactos.
- [x] Reorganizar vencimentos, orçamento, categorias e atividade.
- [x] Composição distinta desktop/tablet/mobile.
- [x] Preservar `renderDashboard()` e `dashboardNumbers()`.
- [x] Cobrir reduced-motion e forced-colors.
- [ ] Refinar header/contexto/mês/ações essenciais.
- [ ] Validar fisicamente desktop/mobile e iPhone/PWA.

### Próximas páginas

- [ ] Mercado: pesquisa/filtros/adicionar/ler fatura, lista/carrinho e preço observado/estimado/confirmado.
- [ ] Planeamento: saldo, orçamento e rendimentos reais.
- [ ] Calendário: vencimentos/pagamentos existentes.
- [ ] Faturas: pesquisa/filtros/resumo/tabela desktop/lista mobile; preservar `renderBills()`/`filterBills()`.
- [ ] Relatórios.
- [ ] Objetivos.
- [ ] Segurança.
- [ ] Diagnóstico.
- [ ] Definições.

## P0 — Design System final

- [ ] Uma família tipográfica principal.
- [ ] Escala tipográfica formal.
- [ ] Consolidar tokens de spacing, raio, borda, elevação e foco.
- [ ] Consolidar paleta semântica.
- [x] Hierarquia Primary/Secondary/Danger/Link/Icon.
- [x] Baseline interna de 44 px.
- [ ] Reduzir cards redundantes.
- [ ] Estados de formulário default/focus/filled/disabled/error/success.
- [ ] Estados loading/empty/offline/error/success partilhados.
- [ ] Dark/Light/System com tokens próprios.
- [ ] Auditoria final de ícones e acessibilidade.

## P0 — Migração para fonte 100% TypeScript

Meta: nenhum JavaScript manual como fonte funcional. O browser recebe JavaScript gerado pelo build. A baseline de rollback está em `backup/js-runtime-baseline-20260912`.

### Bloco 1 — pipeline e primeiro runtime — concluído/publicado

- [x] `tsconfig.json` strict/noEmit.
- [x] Separar `typecheck`, `build:runtime` e `build:pages`.
- [x] Ignorar `.generated/` e `dist/`.
- [x] Criar `scripts/build-typescript-runtime.cjs`.
- [x] `src/ui/veggie-menu-toggle.ts` como fonte canónica.
- [x] Remover `v76-veggie-menu.js` manual.
- [x] Gerar `.generated/v76-veggie-menu.js`.
- [x] Publicar `dist/v76-veggie-menu.js` via `prepare-pages`.
- [x] Criar gate `tests/typescript-runtime-build.test.cjs`.
- [x] Integrar PR #88 — merge `5301bd0d66c5ec46ead7be079799ecb76c752237`.
- [x] Confirmar TypeScript, CI e Pages verdes pós-merge.

### Bloco 2 — `market-branding` / módulo folha — pronto para PR

- [x] Auditar `market-branding.js`: apresentação DOM, sem escrita em domínio/cofre.
- [x] Criar `src/ui/market-branding.ts` com DOM tipado.
- [x] Generalizar `scripts/build-typescript-runtime.cjs` para múltiplos runtimes.
- [x] Mapear `market-branding.js` público para `.generated/market-branding.js`.
- [x] Remover `market-branding.js` manual da branch.
- [x] Atualizar teste de build para validar os dois artefactos.
- [x] Atualizar CI, TypeScript Foundation e Pages para o artefacto gerado.
- [x] Invalidar cache PWA sem alterar a lógica do Service Worker.
- [x] Confirmar TypeScript Foundation da branch — `34699847604`.
- [x] Confirmar CI integral da branch — `34699847600`.
- [x] Confirmar Safari/PWA startup verde após restaurar o comportamento canónico do SW.
- [x] Rever diff final contra `main`: nenhum ficheiro de domínio alterado; `sw.js` muda apenas a chave de cache.
- [ ] Abrir PR e exigir novamente CI + TypeScript Foundation verdes.
- [ ] Integrar apenas com gates verdes.
- [ ] Confirmar CI + Pages pós-merge.
- [ ] Escolher o próximo módulo folha após observar dependências reais.

### Bloco 3 — funções puras

- [ ] Mapear parsing/formatação monetária, datas civis e quantidades.
- [ ] Criar vetores de paridade JS→TS.
- [ ] Migrar e testar limites, inválidos e arredondamento.
- [ ] Remover JS fonte apenas depois de o build usar artefactos TS.

### Bloco 4 — domínio financeiro

- [ ] Migrar `finance.js` por subdomínios.
- [ ] Tipar faturas, pagamentos, rendimentos, orçamento, objetivos e relatórios.
- [ ] Testar pagamentos parciais, vencimentos, recorrência e arredondamentos.

### Bloco 5 — Mercado/modelo/carrinho

- [ ] Migrar modelo de produto/preço/carrinho.
- [ ] Tipar `ObservedPrice`, `ConfirmedPrice`, `estimatedCents`, `actualCents`.
- [ ] Tipar GTIN/EAN, unidade/embalagem/peso.
- [ ] Corrigir/testar persistência de `pid`.
- [ ] Reconciliar fatura/talão sem substituição silenciosa de valores.

### Bloco 6 — core/persistência/cifra

- [ ] Migrar `core.js` depois do domínio estável.
- [ ] Tipar schema v5, IndexedDB, envelope cifrado e erros.
- [ ] Não alterar PBKDF2/AES-GCM por causa da linguagem.

### Bloco 7 — sync

- [ ] Migrar sync/conflitos com estados discriminados.
- [ ] Testar offline, timeout, concorrência e envelope inválido.

### Bloco 8 — UI/controladores complexos

- [ ] Migrar `render.js`, `forms.js`, `events.js` e controladores restantes.
- [ ] Migrar `mobile-menu-toggle.js` com tipos explícitos para gestos/touches/dialog.
- [ ] Tipar DOM com guards, sem casts que escondam `null`.

### Bloco 9 — PWA/build/limpeza

- [ ] Migrar Service Worker.
- [ ] Migrar scripts/testes/tooling para TypeScript quando o runtime estiver estável.
- [ ] Garantir que todos os módulos migrados são publicados apenas como artefactos gerados.
- [ ] Remover os últimos `.js` fonte sem referências manuais.
- [ ] Proibir `@ts-nocheck` e `any` em massa.

## P0 — Segurança/PWA

- [ ] Auditar ZXing remoto e avaliar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` quando possível.
- [ ] Rever CSP final do `dist/` e justificar origens externas.
- [ ] Classificar cache por tipo de recurso.
- [ ] Confirmar que falha/ausência do Service Worker não quebra o núcleo online.
- [ ] Gates para fontes remotas, QR/código de barras e importação de faturas.

## P0 — QA

- [ ] 320/360/375/390/430/768/820/1024+ px.
- [ ] Safari/iPhone web + PWA instalada.
- [ ] Android/Chrome.
- [ ] tablet e desktop.
- [ ] portrait/landscape.
- [ ] teclado virtual e foco.
- [ ] Light/Dark/System.
- [ ] reduced-motion/forced-colors.
- [ ] comparação visual antes de apagar CSS histórico.
