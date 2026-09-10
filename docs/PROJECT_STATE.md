# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Branch pública: `main`
SHA público antes da Parte 2: `e16c35c3a4e52dead57deccdde9630a89a4af998`
Branch de trabalho atual: `fix/v75-pages-part2`
Distribuição: GitHub Pages / PWA
Revisão de usabilidade integrada: `75-usability1`
Revisão de páginas candidata: `75-pages1`

## Baseline preservada

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- UI `74-ui1`, Mercado `74-shopping2`, menu `73-menu8`, experiência `74-experience2`;
- arquitetura `75-architecture2`, cabeçalho `75-header2`, estabilidade `75-stability1`, geometria `75-layout1`, drawer `75-drawer2`;
- startup `75-startup2`, catálogo `75-catalog4`, loader `75-photo-loader3`;
- usabilidade transversal `75-usability1`.

## Estado confirmado antes da Parte 2

A Parte 1 foi integrada e publicada. O commit funcional `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf` passou no CI `34471773663` e no GitHub Pages `34471814790`. A documentação final dessa fase foi integrada posteriormente em `main`, cujo SHA de partida para a Parte 2 é `e16c35c3a4e52dead57deccdde9630a89a4af998`.

## Parte 2 — auditoria e melhoria de Início, Despesas e Planeamento

### Factos encontrados

1. **Início** já usa composição v74/v75 com resumo do mês, orçamento, ações rápidas e categorias; no móvel as grelhas antigas são ocultadas para evitar duplicação.
2. **Despesas** tinha uma divergência de usabilidade importante no móvel: a composição v74 escondia a navegação Lista/Calendário, `bill-filter-grid`, `billSummary` e `billsList`, substituindo a vista funcional por `cdcExpenseFeed` simplificado.
3. O feed simplificado de Despesas suporta pesquisa e separação Todas/Entradas/Saídas, mas não expõe no móvel os filtros funcionais já existentes de estado, categoria, intervalo de datas e ordenação, nem a mesma riqueza de vencimento, progresso e ações dos cartões de fatura reais.
4. **Planeamento** já apresenta resumo de orçamento e categorias, seguido do formulário de saldo/orçamento e da lista de rendimentos; precisava sobretudo de melhorar hierarquia, densidade e empilhamento em mobile.
5. O sistema de ícones Lucide local já cobre as ações principais destas páginas; não é necessário introduzir nova dependência de ícones nesta fase.

## `75-pages1` implementada na branch

Foi criada `v75-pages.css`, uma camada exclusivamente visual, carregada depois de arquitetura/drawer e antes de `v75-usability.css`.

### Início

- reforça a hierarquia mês → resumo → ações rápidas → categorias;
- melhora contraste estrutural do resumo sem alterar valores;
- uniformiza feedback de toque/hover;
- torna alertas móveis mais compactos e legíveis;
- mantém as grelhas legadas ocultas no móvel para evitar informação duplicada.

### Despesas

- restaura no móvel a navegação funcional **Lista / Calendário**;
- deixa de usar o `cdcExpenseFeed` simplificado como vista principal;
- volta a apresentar `bill-filter-grid`, `billSummary` e `billsList` no móvel;
- torna acessíveis filtros de estado, categoria, datas e ordenação já suportados por `renderBills()`/`filterBills()`;
- mantém pesquisa funcional e FAB de nova despesa;
- melhora cartões móveis: hierarquia de valor em falta, vencimento, total/pago/categoria, progresso e ações;
- não altera `render.js`, filtros, cálculos ou handlers.

### Planeamento

- melhora o resumo de orçamento e métricas;
- empilha formulário e rendimentos em mobile;
- reforça leitura de saldo atual, saldo calculado e diferença de conciliação;
- melhora densidade de categorias e lista de rendimentos;
- não altera fórmulas, saldos, orçamento ou rendimentos.

## Distribuição e QA

- `scripts/prepare-pages.cjs` inclui `v75-pages.css?v=75-pages1`;
- `sw.js` inclui o ativo e invalida o cache com sufixo `pages1`;
- `tests/v75-stability.test.cjs` verifica visibilidade funcional de Despesas no móvel, empilhamento de Planeamento, distribuição e isolamento da camada;
- `v75-usability.css` continua a ser a camada final de interação, preservando anti-zoom e alvos tácteis.

## Segurança

`75-pages1` é CSS puro. Não acede a `appState`, IndexedDB, PIN, PBKDF2, AES-GCM, sincronização, tokens, QR, scanner, pagamentos, preços ou funções de persistência. A mudança de Despesas apenas volta a tornar visível a UI funcional já existente.

## Estado da integração

A implementação está na branch `fix/v75-pages-part2`. Só deve ser integrada em `main` depois de CI completo verde, comparação `behind 0`, revisão do PR e confirmação posterior de CI/Pages no SHA publicado.

## Próximo passo após publicação

Parte 3: auditoria de **Mercado**, com foco em pesquisa, filtros, catálogo, cartões, imagens, estados de carregamento e fluxo de compra, preservando a separação entre estimativa e valor confirmado.
