# TODO — Conta de Casa

Atualizado: 12 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM e `PBKDF2_ITERATIONS = 250000`.
- [x] Preservar `estimatedCents` separado de `actualCents`.
- [x] Preservar `marketId|pid` no pipeline especializado.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sync por redesign.

## P0 — Base já integrada

- [x] Fundação TypeScript — PR #72.
- [x] `75-expenses1` — PR #73.
- [x] `76-veggie-menu2` + `76-modern-ui1` — PR #76.
- [x] `76-version-audit1` — PR #78.
- [x] `76-mobile-shell2` — PR #80.
- [x] Baseline arquitetural v76 — PR #82.
- [x] Consolidação UI/shell — PR #84.
- [x] `76-modern-ui2` / `ui-components1` — PR #85, merge `2a9cc3148e5750561b14f6a0505934d1a6d74d05`.
- [x] CI final do PR #85 verde.
- [x] TypeScript Foundation final do PR #85 verde.
- [ ] Revalidar deployment Pages do PR #85: workflow posterior terminou cancelado/skipped e não conta como confirmação positiva.

## P0 — `redesign/v76-product-hierarchy1`

### Infraestrutura de composição

- [x] Criar `v76-product-pages.css` revisão `76-product-pages1`.
- [x] Carregar depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`.
- [x] Incluir a camada no build Pages.
- [x] Incluir a camada no cache PWA `product-pages1`.
- [x] Criar `tests/v76-product-pages.test.cjs`.
- [x] Adicionar gate dedicado ao CI.
- [x] Documentar propriedade da nova camada.
- [ ] Confirmar CI verde no head documental final da branch.
- [ ] Abrir PR do primeiro bloco de redesign.
- [ ] Rever diff antes de merge.

### Dashboard

- [ ] Reorganizar header para título/contexto + mês + ações essenciais. Esta parte ainda não foi alterada.
- [x] Identificar o resumo financeiro real: `Saldo atual` / `n.current`.
- [x] Tornar o saldo atual o resumo visual dominante sem criar fórmula nova.
- [x] Hierarquizar os KPIs reais `Por pagar`, `Em atraso` e `Saldo projetado`.
- [x] Tornar `Pago no mês` e `Próximos 7 dias` métricas secundárias compactas.
- [x] Reorganizar próximos vencimentos, orçamento, categorias e atividade recente.
- [x] Criar composição adaptativa distinta para desktop/tablet/mobile.
- [x] Preservar `renderDashboard()` e `dashboardNumbers()` sem alteração de domínio.
- [x] Adicionar reduced-motion e forced-colors à nova composição.
- [ ] Validar visualmente no browser real e em iPhone/PWA antes de considerar o Dashboard concluído.

### Mercado

- [ ] Consolidar pesquisa, filtros e ação adicionar/ler fatura.
- [ ] Rever lista/catálogo/carrinho para evitar informação duplicada.
- [ ] Manter preço observado/estimado/confirmado explicitamente separados.
- [ ] Rever quantidade/unidade/peso e totais linha a linha.
- [ ] Auditar imagens, fallbacks, origem e logos.
- [ ] Não implementar comparação “mais barato” sem fonte e validade comprovadas.

### Planeamento

- [ ] Redesenhar apenas sobre saldo atual, saldo inicial, orçamento mensal e rendimentos já existentes.
- [ ] Não introduzir tarefas/simulações/despesas fixas sem suporte funcional real.
- [ ] Melhorar formulário, estados e leitura do resumo mensal.

### Calendário

- [ ] Melhorar mês/agenda/vencimentos existentes.
- [ ] Não transformar em agenda genérica sem decisão de produto.
- [ ] Garantir leitura mobile e navegação por teclado.

### Faturas

- [ ] Manter pesquisa, filtros, ordenação e estados.
- [ ] Reorganizar resumo por estado.
- [ ] Tabela legível no desktop; lista/cartões funcionais no mobile.
- [ ] “Nova fatura” como ação primária.
- [ ] Preservar `renderBills()`/`filterBills()` e regras financeiras.

### Restantes páginas

- [ ] Relatórios.
- [ ] Objetivos.
- [ ] Segurança.
- [ ] Diagnóstico.
- [ ] Definições.

## P0 — Design System final

- [ ] Uma família tipográfica principal.
- [ ] Escala tipográfica formal: Display/H1/H2/H3/Body/Small/Caption/Label.
- [ ] Tokens de spacing sem valores aleatórios.
- [ ] Tokens de raio, borda, elevação e foco.
- [ ] Paleta semântica: background/surface/text/border/accent/success/warning/error.
- [x] Hierarquia base Primary/Secondary/Danger/Link/Icon.
- [x] Baseline interna de 44 px para controlos principais.
- [ ] Reduzir cards onde espaço/separadores são suficientes.
- [ ] Form states: default/focus/filled/disabled/error/success.
- [ ] Loading/empty/offline/error/success states partilhados.
- [ ] Dark/Light/System com tokens próprios.
- [ ] Auditoria final de ícones e acessibilidade semântica.

## P0 — Migração para fonte 100% TypeScript

Meta: nenhum JavaScript manual como fonte funcional; JavaScript apenas gerado no build/deploy.

### Bloco 1 — pipeline de emissão

- [ ] Auditar `tsconfig`, Pages e CI para separar typecheck de emissão.
- [ ] Fazer o build TypeScript gerar pelo menos um módulo runtime existente antes de apagar a sua cópia JS fonte.
- [ ] Provar que o Pages usa o artefacto gerado e não um ficheiro JS manual.

### Bloco 2 — dinheiro, quantidades e datas

- [ ] Mapear funções puras atuais e testes.
- [ ] Criar vetores de paridade JS→TS.
- [ ] Migrar parsing/formatação monetária e datas civis.
- [ ] Migrar quantidades com representação controlada.
- [ ] Testar limites, inválidos e arredondamento.
- [ ] Só substituir runtime com paridade provada.

### Bloco 3 — domínio financeiro

- [ ] Migrar `finance.js` por subdomínios.
- [ ] Tipar faturas, pagamentos, rendimentos, orçamento, objetivos e relatórios.
- [ ] Testar pagamentos parciais, vencimentos, recorrência e arredondamentos.

### Blocos 4–6 — Mercado

- [ ] Migrar modelo de produto/preço/carrinho.
- [ ] Separar `ObservedPrice`, `ConfirmedPrice`, `estimatedCents`, `actualCents`.
- [ ] GTIN/EAN, unidade/embalagem/peso com tipos explícitos.
- [ ] Corrigir lacuna de persistência `pid` com teste específico.
- [ ] Reconciliar fatura/talão sem substituir valores silenciosamente.

### Bloco 7 — core/persistência/cifra

- [ ] Migrar `core.js` depois de domínio estável.
- [ ] Tipar schema v5, IndexedDB, envelope cifrado e erros.
- [ ] Não alterar algoritmo criptográfico por causa da linguagem.

### Bloco 8 — sync

- [ ] Migrar sync/conflitos com estados discriminados.
- [ ] Testar offline, timeout, concorrência e envelope inválido.

### Bloco 9 — UI

- [ ] Migrar `render.js`, `forms.js`, `events.js` e restantes controladores.
- [ ] Tipar DOM com guards; evitar casts que escondam `null`.

### Bloco 10 — PWA/build/limpeza

- [ ] Fazer Pages consumir apenas artefactos gerados para todos os módulos migrados.
- [ ] Migrar Service Worker.
- [ ] Migrar scripts/testes/tooling para TypeScript quando o runtime estiver estável.
- [ ] Remover ficheiros `.js` fonte legado apenas sem referências e com regressões verdes.
- [ ] Proibir `@ts-nocheck` e `any` em massa.

## P0 — Segurança/PWA

- [ ] Auditar ZXing remoto e avaliar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` após retirar estilos inline necessários.
- [ ] Rever CSP final do `dist/` e justificar cada origem externa.
- [ ] Classificar cache por tipo de recurso.
- [ ] Confirmar que ausência/falha do Service Worker não quebra o núcleo online.
- [ ] Gates de validação para fontes remotas, QR/código de barras e importação de faturas.

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

## P0 — Governação

- [ ] Ativar proteção equivalente da `main` quando a configuração permitir.
- [ ] Tornar CI + TypeScript Foundation gates obrigatórios antes de merge.
