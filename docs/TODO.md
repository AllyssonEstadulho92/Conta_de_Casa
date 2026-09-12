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
- [x] Consolidação UI/shell — PR #84, merge `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`.

## P0 — `feat/v76-ui-components1`

- [x] Criar revisão `76-modern-ui2`.
- [x] Consolidar hierarquia `primary`, `secondary`, `danger`, `link`, `icon button`.
- [x] Baseline 44 px para controlos principais.
- [x] Estados disabled/`aria-disabled`, foco e hover coerentes.
- [x] Métricas de ícones dentro de botões.
- [x] `min-width:0` e gap comum para grids partilhados.
- [x] Apresentação de fotografias do Mercado com `contain`/centro/fallback.
- [x] Rever cache PWA para `modern-ui2` + `ui-components1`.
- [x] Atualizar testes `v76-modern-ui`, Veggie Burger, mobile shell e contrato de arquitetura.
- [x] Atualizar `PROJECT_STATE`, `ARCHITECTURE`, `DECISIONS`, `TODO` e `CHANGELOG`.
- [ ] Abrir PR.
- [ ] CI integral verde.
- [ ] TypeScript Foundation verde.
- [ ] Rever diff final.
- [ ] Integrar apenas após gates verdes.
- [ ] Confirmar Pages após merge.

## P0 — redesign real baseado nos protótipos

Princípio: usar os protótipos como referência visual/hierárquica e apenas funções/dados reais do projeto.

### Dashboard

- [ ] Reorganizar header para título/contexto + mês + ações essenciais.
- [ ] Identificar no código o resumo financeiro real que pode ocupar a posição principal.
- [ ] Limitar KPIs a métricas reais e úteis.
- [ ] Reorganizar próximos vencimentos, orçamento, categorias e atividade recente.
- [ ] Reduzir “card dentro de card”.
- [ ] Validar desktop e mobile sem alterar cálculos.

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
- [ ] Cards apenas quando ajudam a separar informação.
- [ ] Form states: default/focus/filled/disabled/error/success.
- [ ] Loading/empty/offline/error/success states partilhados.
- [ ] Dark/Light/System com tokens próprios.
- [ ] Auditoria final de ícones e acessibilidade semântica.

## P0 — Migração para fonte 100% TypeScript

Meta: nenhum JavaScript manual como fonte funcional; JavaScript apenas gerado no build/deploy.

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

- [ ] Criar build TypeScript que gere os ficheiros JS usados pelo browser.
- [ ] Fazer Pages consumir apenas artefactos gerados.
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
