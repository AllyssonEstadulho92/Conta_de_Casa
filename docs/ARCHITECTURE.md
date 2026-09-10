# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico: `v76` — TypeScript incremental  
Distribuição: GitHub Pages / PWA

## 1. Princípios e invariantes

A aplicação é estática/local-first. Estado financeiro, regras de negócio, UI, Mercado, assets e sincronização permanecem separados.

- `STATE_VERSION = 5`;
- dinheiro persistido em cêntimos inteiros;
- IndexedDB para estado financeiro;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- sem passwords, tokens ou chaves embutidas no código público;
- preço pesquisado do Mercado é estimativa; preço confirmado permanece separado;
- alterações de apresentação não podem modificar regras financeiras.

## 2. Componentes funcionais atuais

- `core.js`: estado, normalização, datas base, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros, estados de faturas e métricas;
- `render.js`: renderização das páginas e componentes;
- `forms.js`: formulários e validação de entrada;
- `events.js`: delegação de eventos e ações do utilizador;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e resolução de conflitos;
- `market-*.js/css`: pesquisa, catálogo, imagens, scanner e experiência do Mercado;
- `scripts/prepare-pages.cjs`: allowlist e composição do bundle público;
- `sw.js`: cache/offline e aplicação de atualização.

## 3. Rotas e navegação

A navegação utiliza fragmentos conhecidos, não rotas de servidor.

- `#dashboard` — Início;
- `#bills` — Despesas/Faturas;
- `#calendar` — Calendário financeiro;
- `#planning` — Planeamento;
- `#market` — Mercado;
- `#reports` — Relatórios;
- `#goals` — Objetivos;
- `#security` — Segurança e sincronização;
- `#diagnostics` — Integridade;
- `#settings` — Definições.

No mobile a navegação principal mantém Início, Despesas, Mercado, Planeamento e Mais. O drawer/desktop expõe as secções secundárias.

## 4. Dados financeiros

O estado persistido v5 contém, entre outros domínios:

- meses/perfis mensais;
- faturas;
- pagamentos;
- rendimentos;
- lista de Mercado;
- objetivos;
- atividade/auditoria;
- segurança;
- tombstones e conflitos de sincronização.

Valores monetários são inteiros em cêntimos. Datas civis de vencimento são tratadas separadamente de timestamps quando necessário para evitar deslocamentos por timezone.

## 5. Despesas/Faturas — arquitetura funcional

A página `#bills` usa a estrutura canónica existente:

`index.html` → controlos de pesquisa/filtro/resumo/lista  
`events.js` → alterações de filtros e ações  
`renderBills()` → recolhe critérios e renderiza  
`filterBills()` → filtra/ordena  
`finance.js` → calcula estados, pagos, pendentes e vencimentos  
`render.js` → tabela desktop + cartões mobile

IDs funcionais preservados:

- `billSearch`;
- `billStatusFilter`;
- `billCategoryFilter`;
- `billDateFrom`;
- `billDateTo`;
- `billSort`;
- `billClearFilters`;
- `billSummary`;
- `billsList`;
- `newBillBtn`.

A revisão visual não cria um segundo fluxo de dados nem duplica handlers.

## 6. Camada visual de Despesas — `75-expenses1`

`v75-expenses-modern.css` é uma camada apenas de apresentação e está integralmente limitada a:

`html.cdc-v75 #page-bills`

Responsabilidades:

- controlo segmentado Lista/Calendário;
- barra de pesquisa/criação;
- painel de filtros;
- cartões de resumo;
- tabela desktop;
- cartões mobile;
- estados hover/focus/active;
- adaptação responsiva;
- `prefers-reduced-motion` e `forced-colors`.

Não contém lógica JavaScript, persistência ou cálculo.

## 7. Ordem de CSS no bundle

Ordem relevante para Despesas:

1. `styles.css`;
2. `design-system.css`;
3. `mobile-layout.css`;
4. camadas de experiência/arquitetura v74/v75;
5. `v75-pages.css` — baseline funcional visual de Início/Despesas/Planeamento;
6. `v75-expenses-modern.css?v=75-expenses1` — refinamento exclusivo de Despesas;
7. outras camadas especializadas;
8. `v75-usability.css` — política transversal final de interação e acessibilidade.

A camada de Despesas deve ficar depois de `v75-pages.css` para poder refiná-la, mas antes de `v75-usability.css` para não ultrapassar as garantias finais de alvos tácteis/anti-zoom.

## 8. Responsividade de Despesas

Desktop amplo:

- pesquisa + ação numa linha;
- filtros em seis áreas operacionais;
- quatro cartões de resumo;
- tabela com cabeçalho fixo no contentor.

Desktop/tablet intermédio (`821–1100px`):

- filtros em três colunas;
- resumo em duas colunas.

Mobile (`≤820px`):

- tabs em duas colunas;
- pesquisa e ação compactas;
- filtros em duas colunas;
- resumo 2×2;
- cartões mobile com `Em falta` como informação principal;
- Total/Pago/Categoria e progresso abaixo.

Ecrãs estreitos (`≤430px`):

- pesquisa e Nova fatura empilhadas;
- filtros numa coluna;
- área financeira do cartão reduzida para duas colunas, com Categoria em largura total.

## 9. Segurança da revisão visual

`75-expenses1` não altera:

- dados persistidos;
- cálculo de `remainingForBill`, `paidForBill`, `billStatus` ou filtros;
- criação/edição/pagamento/eliminação de faturas;
- cofre, PIN, PBKDF2 ou AES-GCM;
- sincronização;
- QR/scanner;
- CSP ou endpoints.

A pesquisa visual usa pseudo-elementos CSS e não introduz ícones/CDNs externos.

## 10. Mercado

O Mercado mantém:

- `estimatedCents` separado de `actualCents`;
- `marketId|pid` como identidade canónica no pipeline especializado;
- `75-photo-loader3` para estados de fotografia;
- pesquisa live Pingo Doce/Continente via fontes configuradas;
- Open Food Facts apenas como enriquecimento visual quando aplicável;
- scanner e QR separados da camada visual de Despesas.

A futura v76 deve corrigir com teste específico a lacuna em que o `pid` extraído no browser live não é atualmente persistido como propriedade própria do item adicionado.

## 11. TypeScript v76

O Bloco 1 foi integrado no `main` pelo PR #72 e adiciona:

- `package.json` com TypeScript apenas como dependência de desenvolvimento;
- `tsconfig.json` estrito e `noEmit`;
- tipos nominais e contratos persistidos em `src/types/`;
- type-tests;
- workflow dedicado.

O browser continua a executar o runtime JavaScript v75. A branch separada `feat/v76-money-dates` destina-se ao Bloco 2 e não deve misturar a revisão visual de Despesas.

Arquitetura de destino:

- `src/core/`;
- `src/finance/`;
- `src/market/`;
- `src/security/`;
- `src/sync/`;
- `src/ui/`;
- `src/types/`.

Cada substituição de runtime exige paridade JS→TS antes de integração.

## 12. QA e distribuição

`tests/v75-expenses-modern.test.cjs` verifica:

- isolamento do CSS a `#page-bills`;
- presença dos componentes canónicos;
- ausência de lógica financeira/criptográfica no CSS;
- breakpoints, reduced motion e forced colors;
- inclusão na allowlist Pages;
- revisão `75-expenses1`;
- Service Worker/cache;
- ordem `v75-pages.css → v75-expenses-modern.css → v75-usability.css` no `dist/index.html`.

CI e Pages executam este teste antes de publicação. Validação física em Safari/PWA, mobile, tablet, desktop e tema escuro continua obrigatória.
