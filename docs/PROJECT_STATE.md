# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build: `v75`  
Branch pública: `main`  
HEAD público de partida da Parte 3: `4e130708de2b76eefe56d04e0e5a03d49d431446`  
Branch de trabalho: `fix/v75-market-part3`  
Distribuição: GitHub Pages / PWA

Revisões integradas antes da Parte 3: `75-usability1`, `75-pages1`, `75-assets1`, `75-startup2`, `75-catalog4`, `75-photo-loader3`.  
Revisão candidata atual: `75-market1`.

## 1. Invariantes obrigatórios

- `STATE_VERSION = 5`;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- preço pesquisado no Mercado permanece `estimatedCents`; preço efetivamente confirmado permanece `actualCents`;
- identidade de SKU/fotografia do catálogo permanece `marketId|pid`;
- nenhuma alteração visual pode modificar cálculos, PIN, cifragem, QR, scanner ou sincronização.

## 2. Baseline confirmada

A biblioteca transversal `75-assets1` foi integrada pelo PR #69 no SHA funcional `a8e04d6811bd6eb08487de139fb19fb2f12128ec`, com CI `34478047035` e GitHub Pages `34478091014`, ambos com sucesso. A atualização documental posterior foi integrada pelo PR #70; o HEAD usado para iniciar a Parte 3 é `4e130708de2b76eefe56d04e0e5a03d49d431446`, também com checks de qualidade e deploy Pages concluídos com sucesso.

## 3. Parte 3 — Mercado: diagnóstico

### Factos confirmados no código

1. O ecrã tem dois tipos de pesquisa diferentes: o browser de produtos consulta fontes de mercado; `#marketSearch` filtra apenas a lista já adicionada. A apresentação não distinguia suficientemente estes contextos.
2. `renderMarket()` já suporta pesquisa local, filtros por estado/categoria, ordenação, resumo, tabela desktop e cartões mobile. Não é necessário reimplementar lógica de filtros.
3. `market-experience.js` guarda um preço encontrado como `estimatedCents` e inicializa `actualCents: 0`; esta separação está coberta por testes financeiros.
4. No mobile, `market-shopping-focus.js` movia o campo **Preço real / unidade** para `Detalhes`. Depois de marcar um item como comprado, o cartão também passava para o grupo recolhido **Comprados**. Um item comprado sem preço real podia portanto esconder a próxima ação necessária.
5. Os rótulos visuais Estado/Categoria/Ordenar estavam escondidos no mobile, deixando selects compactos potencialmente ambíguos.
6. O cartão do browser de produtos contém três filhos diretos — fotografia, conteúdo e ação — mas a grelha declarava apenas duas colunas explícitas. A revisão corrige esta geometria sem alterar o renderer de dados.
7. O catálogo progressivo já usa geometria estável e `75-photo-loader3` já fornece carregar → validar → `Sem fotografia`, cooldown e regras de PID. Não foi encontrada razão para substituir esse loader.
8. O scanner/código de barras não apresenta nesta auditoria um erro funcional comprovado; não é alterado.

## 4. `75-market1` implementada na branch

Foram criados `v75-market-flow.js` e `v75-market-flow.css` como camada de apresentação isolada.

### Pesquisa e filtros

- `#marketSearch` passa a comunicar **Pesquisar na minha lista…**, distinguindo-o do browser de produtos/lojas;
- os rótulos Estado, Categoria e Ordenar voltam a ser visíveis no mobile;
- controlos são reorganizados responsivamente sem alterar IDs, valores ou handlers existentes.

### Fluxo de compra mobile

- cada cartão recebe um estado visual explícito: **Por comprar**, **Preço por confirmar** ou **Comprado**;
- o valor compacto passa a indicar o significado: **Estimativa total**, **Estimativa provisória** ou **Total contabilizado**;
- quando um item comprado ainda tem `actualCents <= 0`, o mesmo bloco `.market-mobile-real` já criado por `render.js` é promovido para fora de `Detalhes` e apresentado como **Confirmar preço pago / unidade**;
- se o grupo Comprados tiver itens sem preço real, é aberto automaticamente para não esconder a ação pendente;
- o input mantém `data-market-actual`, portanto continua a usar o handler delegado existente em `events.js`. Nenhuma escrita financeira foi adicionada à nova camada.

### Browser de produtos

- o cartão passa a reservar três colunas explícitas: fotografia, conteúdo e ação;
- o preço recebe a qualificação visível **Preço pesquisado**;
- é apresentada a nota: preço encontrado é estimativa e o preço pago deve ser confirmado depois da compra;
- a ação `+` mantém o mesmo `data-market-add-product`, mas ganha o rótulo visível **Adicionar** quando há espaço;
- fotografias do browser live podem reutilizar `CDCAssetLoader` apenas para estados genéricos de carregamento/falha. Isto não toca no loader de catálogo por PID.

### Catálogo e fotografias

- cartões de `market-visual-catalog.js` mantêm `marketId|pid`, URL oficial com PID exato e `75-photo-loader3`;
- `75-market1` apenas espelha `is-photo-loading` para `aria-busy`, melhorando semântica de acessibilidade;
- não há alteração de retry, cache, IndexedDB de fotografias, resolução de URL, orçamento de rede ou fonte oficial.

## 5. Distribuição e QA

- `scripts/prepare-pages.cjs` publica `v75-market-flow.css/js?v=75-market1`;
- CSS é carregado depois das camadas especializadas do Mercado e antes de `v75-usability.css`;
- JS é carregado depois de `v75-market-featured.js`;
- `sw.js` inclui ambos os ativos e acrescenta `market1` ao final da revisão de cache;
- criado `tests/v75-market-flow.test.cjs` para fluxo mobile, geometria do browser, isolamento financeiro, `marketId|pid`, PID exato, loader especializado e bundle Pages;
- CI e workflow Pages executam syntax check e o novo teste;
- CI da branch já ficou verde no run `34481330929` antes da atualização documental final desta branch. Uma nova execução após os documentos ainda deve ser confirmada antes do merge.

## 6. Segurança

`75-market1` não chama `commit()`, `saveState()`, não atribui `estimatedCents`, `actualCents` ou `quantity`, não altera CSP e não introduz endpoints. Também não altera `core.js`, `finance.js`, PBKDF2, AES-GCM, PIN, QR, scanner ou sincronização.

## 7. Próximo passo

Concluir QA/PR/publicação de `75-market1`, validar o comportamento fisicamente no iPhone/Safari/PWA e depois avançar para a Parte 4: **Mais + ícones + acessibilidade final**.
