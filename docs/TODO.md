# TODO — Conta de Casa

Atualizado: 12 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM e `PBKDF2_ITERATIONS = 250000`.
- [x] Preservar `estimatedCents` separado de `actualCents`.
- [x] Preservar `marketId|pid` no pipeline especializado.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sync por redesign/migração.

## P0 — Publicação / incidente de 12-09-2026

- [x] Identificar por que o site não refletiu a alteração de `main`.
- [x] Confirmar CI `34693676180` falhado por `v75-architecture.js` ausente.
- [x] Confirmar Pages `34693693840` ignorado porque CI de `main` falhou.
- [x] Restaurar exatamente `v75-architecture.js` no PR #87.
- [x] CI e TypeScript Foundation do PR #87 verdes.
- [x] Integrar PR #87 — merge `6401f1c5156382e9fe364da31afa3fcec4aed9bc`.
- [x] CI do novo `main` verde — run `34695315162`.
- [x] GitHub Pages do novo `main` verde — run `34695336131`.
- [ ] Impedir futuras exclusões diretas de runtime sem substituto TS e gates.
- [ ] Ativar branch protection/required checks quando a configuração permitir.

## P0 — Base já integrada

- [x] Fundação TypeScript — PR #72.
- [x] `75-expenses1` — PR #73.
- [x] `76-veggie-menu2` + `76-modern-ui1` — PR #76.
- [x] `76-version-audit1` — PR #78.
- [x] `76-mobile-shell2` — PR #80.
- [x] Baseline arquitetural v76 — PR #82.
- [x] Consolidação UI/shell — PR #84.
- [x] `76-modern-ui2` / `ui-components1` — PR #85.
- [x] Recuperação do pipeline Pages — PR #87.

## P0 — PR #86 / `redesign/v76-product-hierarchy1`

### Infraestrutura de composição

- [x] Criar `v76-product-pages.css` revisão `76-product-pages1`.
- [x] Carregar depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`.
- [x] Incluir no build Pages e cache PWA.
- [x] Criar `tests/v76-product-pages.test.cjs` e gate no CI.
- [x] Documentar propriedade da camada.
- [x] Abrir PR #86.
- [x] Sincronizar branch com `main` restaurado.
- [x] CI integral verde no head sincronizado `5a75e26d72f73b3d4c96802ae4193e0a28b50835`.
- [x] TypeScript Foundation verde no mesmo head.
- [ ] Reconfirmar gates depois desta atualização documental.
- [ ] Rever diff final.
- [ ] Marcar PR #86 pronto para review.
- [ ] Integrar em `main`.
- [ ] Confirmar CI + Pages pós-merge.

### Dashboard

- [ ] Reorganizar header para título/contexto + mês + ações essenciais; ainda não concluído.
- [x] Usar `Saldo atual` / `n.current` como resumo principal real.
- [x] Hierarquizar `Por pagar`, `Em atraso` e `Saldo projetado`.
- [x] Tornar `Pago no mês` e `Próximos 7 dias` métricas secundárias compactas.
- [x] Reorganizar vencimentos, orçamento, categorias e atividade.
- [x] Criar composição distinta desktop/tablet/mobile.
- [x] Preservar `renderDashboard()` e `dashboardNumbers()`.
- [x] Cobrir reduced-motion e forced-colors.
- [ ] Validar visualmente desktop/mobile e iPhone/PWA depois do deploy.

### Próximas páginas

- [ ] Mercado: pesquisa/filtros/adicionar/ler fatura, lista/carrinho e preço observado/estimado/confirmado.
- [ ] Planeamento: trabalhar sobre saldo, orçamento e rendimentos reais.
- [ ] Calendário: melhorar vencimentos/pagamentos existentes.
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

Meta: nenhum JavaScript manual como fonte funcional; JavaScript apenas gerado no build/deploy. O JS atual permanece fallback temporário até paridade comprovada.

### Bloco 1 — pipeline TS

- [x] Confirmar que `tsconfig.json` está em strict/noEmit para a fundação.
- [x] Provar experimentalmente emissão do Veggie Burger TS numa branch de migração.
- [ ] Refazer/atualizar a branch de migração a partir do `main` mais recente após o PR #86.
- [ ] Separar oficialmente `typecheck` de `build:runtime`.
- [ ] Fazer o Pages gerar artefactos JS de TS antes de `prepare-pages`.
- [ ] Criar gate que falha se um JS fonte for removido mas ainda estiver referenciado em CI/build/SW/HTML/testes.

### Bloco 2 — funções puras

- [ ] Mapear parsing/formatação monetária, datas civis e quantidades.
- [ ] Criar vetores de paridade JS→TS.
- [ ] Migrar e testar limites, inválidos e arredondamento.

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

### Bloco 9 — UI

- [ ] Migrar `render.js`, `forms.js`, `events.js` e controladores restantes.
- [ ] Tipar DOM com guards, sem casts que escondam `null`.

### Bloco 10 — PWA/build/limpeza

- [ ] Fazer Pages consumir apenas artefactos gerados nos módulos migrados.
- [ ] Migrar Service Worker.
- [ ] Migrar scripts/testes/tooling para TypeScript quando o runtime estiver estável.
- [ ] Remover cada `.js` fonte apenas sem referências e com regressões verdes.
- [ ] Proibir `@ts-nocheck` e `any` em massa.

## P0 — Segurança/PWA

- [ ] Auditar ZXing remoto e avaliar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` quando os estilos inline forem removidos.
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
