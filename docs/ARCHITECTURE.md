# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA
Revisão de usabilidade integrada: `75-usability1`
Revisão de páginas candidata: `75-pages1`

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, Mercado e catálogos permanecem separados. São obrigatórios:

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhuma password, token ou chave embutida no código público.

## 2. Núcleo

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos.

Revisões visuais não podem alterar cálculos, pagamentos, faturas, QR, scanner, quantidades, preços confirmados, PIN ou derivação de chave.

## 3. Composição da interface

O `index.html` é o template funcional. A distribuição pública é preparada por `scripts/prepare-pages.cjs`, que copia apenas os ativos permitidos para `dist/`, ajusta o build e injeta as camadas publicadas.

Ordem conceptual das camadas atuais:

1. base: `styles.css`, `design-system.css`, `mobile-layout.css`;
2. experiência v74 e componentes específicos;
3. arquitetura v75: `v75-architecture.css/js`;
4. cabeçalho, estabilidade, geometria e drawer;
5. `v75-pages.css` — revisão de Início, Despesas e Planeamento;
6. `v75-usability.css` — última camada transversal de interação/anti-zoom;
7. componentes específicos do Mercado e runtimes que não substituem o núcleo financeiro.

A existência de nomenclaturas e estilos de fallback na base continua tolerada enquanto as camadas v75 estiverem ativas. Consolidação física só pode remover código depois de confirmar ausência de referências e regressões.

## 4. Arquitetura de informação v75

Navegação mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer/desktop acrescenta Relatórios, Metas, Segurança e Diagnóstico. `v75-architecture.js` mantém a correspondência entre páginas internas e pais de navegação, incluindo Calendário em Despesas, Metas em Planeamento e Segurança/Diagnóstico em Mais.

## 5. Início

A composição do Início é construída sobre métricas existentes de `dashboardNumbers()` e componentes v74/v75:

- mês em análise;
- resumo do total gasto;
- orçamento e percentagem utilizada;
- ações rápidas;
- despesas por categoria;
- alertas existentes do núcleo.

`75-pages1` altera apenas apresentação: hierarquia, densidade, estados de interação e legibilidade. As grelhas antigas do dashboard permanecem ocultas no móvel para não duplicar informação que já foi recomposta.

## 6. Despesas

O fluxo funcional continua em `renderBills()`/`filterBills()` de `render.js`. O template já contém:

- Lista / Calendário;
- pesquisa;
- filtro de estado;
- filtro de categoria;
- intervalo de datas;
- ordenação;
- resumo de resultados;
- cartões móveis e tabela desktop;
- ações Detalhes/Editar/Pagar/Excluir conforme estado.

A experiência v74 escondia no móvel a maior parte destes elementos e usava `cdcExpenseFeed` simplificado. `75-pages1` não reimplementa filtros nem cálculos: volta a apresentar no móvel a vista funcional canónica (`bill-filter-grid`, `billSummary`, `billsList`) e oculta apenas o feed simplificado nessa largura. Assim, os mesmos IDs e handlers são usados em desktop e mobile.

A tabela continua oculta em mobile pela camada de estabilidade, sendo apresentada a `bill-mobile-list` já produzida pelo renderer.

## 7. Planeamento

O Planeamento mantém duas fontes visuais complementares:

- `v75-architecture.js` gera o resumo do orçamento/categorias a partir de `CDCV74.dashboardMetrics()` e `categoryEntries()`;
- `renderPlanning()` mantém o formulário real de saldo atual, saldo inicial, orçamento, conciliação e rendimentos.

`75-pages1` apenas reorganiza densidade e empilhamento. Em mobile, o resumo vem primeiro e os dois painéis funcionais passam a uma coluna. Nenhum valor é recalculado em CSS.

## 8. Ícones

A linguagem oficial permanece Lucide local através de `ui-icons.js` e `ui-icons.css`.

- sem CDN ou icon font;
- `viewBox 24×24`, `currentColor`, dimensões explícitas;
- SVGs/glifos antigos funcionam apenas como fallback antes da hidratação;
- ações como nova despesa, novo rendimento, limpar filtros e navegação já são normalizadas pelo sistema Lucide.

## 9. Interação mobile e anti-zoom — `75-usability1`

A política distingue:

- auto-zoom de foco Safari/iOS: evitado com controlos de formulário a pelo menos `16px`;
- zoom acidental por duplo toque: reduzido com `touch-action: manipulation` em elementos interativos.

Não é usado `user-scalable=no` nem `maximum-scale=1`. Pinch-to-zoom permanece disponível. Alvos tácteis usam referência mínima de 44 px e 48 px onde aplicável.

`v75-pages.css` é carregado antes de `v75-usability.css`, portanto a revisão das páginas não pode sobrepor a camada final de anti-zoom/alvos tácteis.

## 10. Cofre e PIN

Fluxo funcional:

`PIN → unlockVault() → enterApp() → sincronização conforme estado → shell`

`75-startup2` permite que um dispositivo previamente emparelhado apresente a cópia local já decifrada sem aguardar a rede e inicia `syncNow('startup-background')` em segundo plano. Primeiro emparelhamento e estados não confirmados conservam o gate original.

`75-usability1` atua apenas em viewport, safe areas, scroll e alvos tácteis do cofre.

## 11. Mercado — identidade e imagens

Produtos continuam identificados por `marketId|pid`. Fotografias oficiais não representam preço nem transação.

- `market-image-library.js`: cache partilhado de URL oficial validado;
- `market-visual-catalog.js`: índice progressivo + renderer incremental;
- `pingo-doce-photo-library.js`: inventário dedicado Pingo Doce;
- `market-catalog-image-resolver.js`: resolvedor exato `75-catalog4`;
- `market-photo-loader.js`: hidratação prioritária `75-photo-loader3`.

## 12. Bases de imagens

### Partilhada

DB: `conta-de-casa-market-image-library`

Store: `images`

Chave: `marketId|pid`

### Pingo Doce

DB: `conta-de-casa-pingo-doce-photo-library`

Store principal: `products`

Estados: `pending | ready | missing`.

## 13. Segurança

`75-pages1` e `75-usability1` são CSS puros. Não podem manipular `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, passwords, tokens ou IndexedDB.

A reexposição da vista funcional de Despesas no móvel usa elementos e handlers já existentes; não acrescenta novas mutações de estado nem novas origens de rede.

## 14. Distribuição e cache

O gerador Pages inclui:

- `v75-pages.css?v=75-pages1`;
- `v75-usability.css?v=75-usability1` logo depois, mantendo a camada de interação por último.

O Service Worker inclui ambos os ativos e usa cache revisionado com `pages1`, garantindo invalidação do cache anterior após publicação.

## 15. QA

`tests/v75-stability.test.cjs` valida adicionalmente:

- presença das três páginas auditadas em `v75-pages.css`;
- navegação Lista/Calendário visível em Despesas no móvel;
- filtros, resumo e lista funcional de Despesas visíveis;
- feed simplificado v74 oculto na vista móvel principal;
- Planeamento empilhado numa coluna em mobile;
- inclusão no bundle Pages e no Service Worker;
- ordem `v75-pages.css` → `v75-usability.css`;
- isolamento relativamente a estado financeiro/criptografia.

Validação em hardware continua necessária para Safari/PWA e Android/Chrome.
