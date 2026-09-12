# TODO — Conta de Casa

Atualizado: 12 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM e `PBKDF2_ITERATIONS = 250000`.
- [x] Preservar `estimatedCents` separado de `actualCents`.
- [x] Preservar `marketId|pid` no pipeline especializado.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sync por redesign/migração.

## P0 — Publicação / incidente de 12-09-2026

- [x] Identificar a causa de o site não refletir a alteração.
- [x] Confirmar CI `34693676180` falhado por `v75-architecture.js` ausente.
- [x] Confirmar Pages `34693693840` ignorado após falha do CI.
- [x] Restaurar exatamente `v75-architecture.js` no PR #87.
- [x] Integrar PR #87 — merge `6401f1c5156382e9fe364da31afa3fcec4aed9bc`.
- [x] Confirmar CI e Pages verdes após recuperação.
- [x] Integrar PR #86 — Dashboard `76-product-pages1`, merge `42557d59f464a2fc7fc22a31eb24564e7dbabad9`.
- [x] CI pós-PR86 `34695579311` verde.
- [x] TypeScript Foundation `34695579282` verde.
- [x] Pages pós-PR86 `34695600399` verde.
- [ ] Ativar branch protection/required checks quando a configuração permitir.

## P0 — UI/UX

### Dashboard

- [x] `Saldo atual` / `n.current` como resumo principal real.
- [x] `Por pagar`, `Em atraso` e `Saldo projetado` em segundo nível.
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

Meta: nenhum JavaScript manual como fonte funcional. O browser recebe JavaScript gerado pelo build. A baseline JavaScript de rollback está em `backup/js-runtime-baseline-20260912`.

### Bloco 1 — pipeline e primeiro runtime

- [x] `tsconfig.json` strict/noEmit para typecheck.
- [x] Criar `feat/v76-typescript-runtime2` a partir do `main` publicado mais recente.
- [x] Separar `typecheck`, `build:runtime` e `build:pages` em `package.json`.
- [x] Ignorar `.generated/` e `dist/` no Git.
- [x] Criar `scripts/build-typescript-runtime.cjs`.
- [x] Gerar `.generated/v76-veggie-menu.js` de `src/ui/veggie-menu-toggle.ts`.
- [x] Remover o ficheiro manual/versionado `v76-veggie-menu.js` da branch.
- [x] Fazer `scripts/prepare-pages.cjs` gerar e publicar `dist/v76-veggie-menu.js` automaticamente.
- [x] Criar `tests/typescript-runtime-build.test.cjs`.
- [x] Atualizar `tests/v76-veggie-menu.test.cjs` para validar o artefacto gerado.
- [x] Atualizar CI para instalar TypeScript, gerar runtime e executar regressão completa.
- [x] Atualizar TypeScript Foundation para exigir fonte TS e ausência do JS manual.
- [x] Atualizar Pages para gerar o runtime TS antes de validar/publicar.
- [x] TypeScript Foundation funcional verde — `34695947847`.
- [x] CI integral funcional verde — `34695947843`.
- [ ] Reconfirmar ambos os gates depois da documentação final.
- [ ] Rever diff final contra `main`.
- [ ] Abrir PR da primeira remoção segura de JavaScript fonte.
- [ ] Integrar apenas com gates verdes.
- [ ] Confirmar CI + Pages pós-merge.

### Bloco 2 — funções puras

- [ ] Mapear parsing/formatação monetária, datas civis e quantidades.
- [ ] Criar vetores de paridade JS→TS.
- [ ] Migrar e testar limites, inválidos e arredondamento.
- [ ] Remover JS fonte apenas depois de o build usar o artefacto TS.

### Bloco 3 — domínio financeiro

- [ ] Migrar `finance.js` por subdomínios.
- [ ] Tipar faturas, pagamentos, rendimentos, orçamento, objetivos e relatórios.
- [ ] Testar pagamentos parciais, vencimentos, recorrência e arredondamentos.

### Blocos 4–6 — Mercado

- [ ] Migrar modelo de produto/preço/carrinho.
- [ ] Tipar `ObservedPrice`, `ConfirmedPrice`, `estimatedCents`, `actualCents`.
- [ ] Tipar GTIN/EAN, unidade/embalagem/peso.
- [ ] Corrigir/testar persistência de `pid`.
- [ ] Reconciliar fatura/talão sem substituição silenciosa de valores.

### Bloco 7 — core/persistência/cifra

- [ ] Migrar `core.js` depois do domínio estável.
- [ ] Tipar schema v5, IndexedDB, envelope cifrado e erros.
- [ ] Não alterar PBKDF2/AES-GCM por causa da linguagem.

### Bloco 8 — sync

- [ ] Migrar sync/conflitos com estados discriminados.
- [ ] Testar offline, timeout, concorrência e envelope inválido.

### Bloco 9 — UI restante

- [ ] Migrar `render.js`, `forms.js`, `events.js` e restantes controladores.
- [ ] Tipar DOM com guards, sem casts que escondam `null`.

### Bloco 10 — PWA/build/limpeza

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
