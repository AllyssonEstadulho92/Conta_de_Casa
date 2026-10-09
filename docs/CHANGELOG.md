# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-10-09: build determinístico da PWA

- `package-lock.json` gerado a partir da instalação Node 24 em GitHub Actions, sem alterar versões diretas declaradas em `package.json`;
- `ci.yml`, `pages.yml` e `typescript.yml` usam `npm ci` com cache npm e lockfile;
- a etapa temporária de recolha foi retirada, sem resíduos;
- README e os cinco documentos de continuidade atualizados;
- aplicação móvel Expo, base de dados, cálculos, PIN e sincronização inalterados.

## 2026-10-09: transparência das estimativas contabilizadas

- `finance.js` disponibiliza duas métricas derivadas dos artigos comprados sem preço real: quantidade e parcela monetária baseada em estimativa;
- `render.js` informa no Início, Calendário e cartão do Mercado quando há estimativas incluídas;
- `tests/finance.test.cjs` protege a contabilização anterior e a nova indicação;
- `DASHBOARD_REV` e `FINANCE_REV` são atualizados em `build:pages` para impedir que a PWA mantenha os ficheiros financeiros e visuais anteriores;
- valores, fórmulas, `STATE_VERSION`, persistência, cifra e sincronização permanecem iguais.

## 2026-10-09: integração controlada das melhorias do Mercado

- PR #213 integrada em `main` para estabilizar o formulário Adicionar produto no Safari;
- a PR #212 estava em conflito com alterações recentes; os seus 16 ficheiros foram reaplicados sobre a `main` atual, preservando explicitamente `76-auth-viewport-fit1` e o histórico do changelog;
- a nova integração aguarda CI e testes antes de publicação; dados financeiros e cifra não foram alterados.

## 2026-10-09: compactação responsiva do ecrã PIN (proposta)

- `v75-usability.css`: revisão `76-auth-viewport-fit1` apenas para a vista de desbloqueio, com layout mobile compacto, tamanhos 52/48 px, safe areas e scroll de recurso;
- `scripts/prepare-pages.cjs`: invalidação da URL da folha de autenticação para evitar retenção do CSS anterior em Safari/PWA;
- `tests/accessibility.test.cjs` e `tests/v75-stability.test.cjs`: contratos para os tamanhos finais, integridade dos controlos e novo token do CSS;
- sem alterações a dados, cálculos, PIN, derivações de chave ou sincronização;
- CI (quality e TypeScript Foundation) concluídos com sucesso na PR #214; inspeção no dispositivo real continua pendente.

## 2026-10-05: fotografias Pingo Doce e bibliotecas de imagem

### Correção

- o resolvedor oficial passa a aceitar o CDN atual do Pingo Doce em `www.pingodoce.pt/dw/image/v2/BLJJ_PRD/...`, mantendo compatibilidade com `static.pingodoce.pt`;
- as fotografias oficiais Pingo Doce continuam restritas a `Sites-pingo-doce-master` e ao PID exato do produto;
- a biblioteca persistente de imagens passa para `76-pingo-images2` e pode guardar o formato atual do Pingo Doce;
- a CSP de produção passa a permitir `pingodoce.pt`, `www.pingodoce.pt` e `static.pingodoce.pt` apenas como origens de imagem;
- o normalizador de imagens passa a reconhecer as famílias Open Food Facts, Open Beauty Facts, Open Products Facts e Open Pet Food Facts, além dos catálogos oficiais Pingo Doce e Continente;
- domínios arbitrários, banners genéricos e fotografias oficiais com PID divergente continuam rejeitados.

### Preservado

Sem alterações a preços, quantidades, cálculos financeiros, cofre/PIN, cifragem, sincronização ou `STATE_VERSION`.

## 2026-10-05: protótipo aprovado de Adicionar produto

### Implementação

- o fluxo **Mercado → Adicionar produto** passa a reproduzir as seis vistas do protótipo aprovado, sem manter a antiga composição simultânea;
- a vista inicial contém pesquisa, scanner, filtros compactos de mercado, categoria opcional, estado vazio, **Explorar catálogo** e **Biblioteca de fotografias**;
- durante a pesquisa, os resultados usam cartões horizontais com fotografia, nome, embalagem, preço, mercado e ação circular de adicionar;
- a seleção de categoria abre a lista pesquisável prevista no protótipo;
- tocar num produto abre o detalhe com fotografia, preço, quantidade, **Adicionar à lista** e informação de mercado, categoria, origem da imagem e PID;
- **Explorar catálogo** passa a ser uma vista própria com filtros de mercado, categorias visuais, contagem e grelha de produtos;
- **Biblioteca de fotografias** passa a ser uma vista própria com total guardado, última validação, métricas de válidas/problemas/expiradas, **Validar todas**, filtros e lista por produto;
- a biblioteca local expõe os registos e estados por fotografia para suportar a vista de validação;
- safe areas do iPhone permanecem sob autoridade de `v76-mobile-shell.css`.

### Preservado

Sem alterações a cálculos financeiros, preços contabilizados, IndexedDB financeiro, cofre/PIN, cifragem, sincronização ou `STATE_VERSION`.

## 2026-10-05: Mercado reorganizado e biblioteca de fotografias auditável

### Interface

- a área Mercado recebe uma autoridade visual final dedicada em `v76-product-pages.css`;
- pesquisa, adicionar item, filtros, resumo, lista e grupos por categoria passam a usar espaçamento, raios e profundidade consistentes;
- o modal **Adicionar produto** é reorganizado para separar pesquisa, origem, catálogo visual, resultados e informação auxiliar;
- a explicação técnica da pesquisa passa a divulgação progressiva para não ocupar espaço permanentemente;
- cartões de resultados mantêm fotografia, texto, preço e ação em posições previsíveis;
- o catálogo visual passa para uma coluna horizontal legível em iPhones estreitos, evitando duas colunas comprimidas;
- fotografia, loader, validação e estado **Sem fotografia** mantêm uma caixa estável para reduzir layout shift.

### Biblioteca de fotografias

- `market-image-library.js` passa para `76-image-library-audit1`;
- todos os registos locais podem ser enumerados e auditados;
- ao abrir o catálogo, a biblioteca faz validação estrutural integral e limpa entradas expiradas ou inválidas;
- o painel **Biblioteca de fotografias** permite validar online todas as fotografias oficiais guardadas, com concorrência limitada e progresso visível;
- o relatório distingue registos válidos, disponíveis, indisponíveis, não verificados, expirados, rejeitados e removidos;
- fotografias indisponíveis não são eliminadas automaticamente por uma única falha de rede;
- o estado específico da biblioteca Pingo Doce passa para o mesmo painel, reduzindo ruído visual.

### Preservado

Sem alterações a cálculos financeiros, valores estimados/reais, quantidade de itens, IndexedDB financeiro, PIN/cofre, cifragem, sincronização ou `STATE_VERSION`.

## 2026-10-05: auditoria visual transversal `76-visual-audit1`

### Problemas confirmados

- múltiplas camadas CSS ainda estilizam os mesmos componentes com elevada especificidade;
- topbar e drawer móveis tinham linguagens visuais contraditórias entre `v76-modern-ui.css` e `v76-mobile-shell.css`;
- cartões, controlos, inputs e diálogos usavam níveis de sombra e raio pouco consistentes;
- o Centro de Alertas, apesar de funcional, ainda não partilhava integralmente a mesma profundidade visual do restante produto.

### Correção

- `v76-modern-ui.css` passa a concentrar a autoridade visual final dos componentes;
- `v76-mobile-shell.css` preserva a autoridade geométrica e alinha apenas o enquadramento móvel com o mesmo sistema visual;
- superfícies, cartões, KPIs, tabelas, command bars, formulários, tabs, botões, sidebar, dialogs e Centro de Alertas passam a usar tokens comuns;
- inputs recebem tratamento inset suave e ações secundárias recebem relevo discreto;
- teal continua reservado a hierarquia, estados ativos e ação primária;
- topbar, drawer e dock móvel passam a uma linguagem neutra e coerente em vez de gradientes concorrentes;
- dark mode, forced-colors e reduced-motion permanecem cobertos;
- revisões públicas `MODERN_UI_REV` e `MOBILE_SHELL_REV` passam para `76-visual-audit1`.

### Preservado

Sem alteração de fórmulas financeiras, IndexedDB, cofre/PIN, cifragem, sincronização, scanner, Mercado, rotas ou `STATE_VERSION`.

## 2026-10-05: Centro de Alertas operacional

- o sino do cabeçalho deixa de ser um simples atalho para o Início e passa a abrir um modal dedicado;
- o painel reutiliza `dashboardNumbers()` e uma única função `dashboardAlertItems()`, evitando uma segunda regra financeira;
- são apresentados saldo por confirmar, diferença de conciliação, faturas em atraso, vencimentos críticos nas próximas 24 horas e saldo projetado negativo;
- cada alerta tem ação direta para **Faturas** ou **Planeamento**;
- o badge passa de ponto decorativo para contador numérico de grupos de alertas ativos;
- quando não existem alertas, o centro mostra um estado vazio explícito;
- o modal suporta Escape, toque no backdrop, safe areas do iPhone, dark mode, forced-colors e valores ocultos por privacidade;
- bloquear o cofre fecha também o Centro de Alertas;
- não existe histórico ou estado lido/não lido: o centro representa apenas condições financeiras atualmente ativas.

Sem alteração de fórmulas financeiras, IndexedDB, cifragem, sincronização ou `STATE_VERSION`.

## 2026-10-05: identidade dedicada Conta de Casa

### Alteração

- `icon.svg` passa a usar a nova marca dedicada da aplicação: casa em teal/verde, telhado mint e moeda central;
- a marca adota profundidade neomórfica suave, mantendo a paleta já usada pelo produto;
- cofre e sidebar reutilizam o mesmo `icon.svg`, preservando a regra de uma única identidade;
- o glyph legado `⌂` deixa de existir no markup da marca;
- o texto de apoio passa para **Suas finanças em casa**, alinhado com a identidade aprovada;
- o manifesto PWA continua a usar o mesmo asset local e a cache determinística por build garante a entrega da nova marca.

### Preservado

Sem alteração de cálculos financeiros, `STATE_VERSION`, IndexedDB, PIN/cofre, cifragem, sincronização, scanner, Mercado ou lógica de navegação.

## 2026-10-05: `76-deterministic-cache1`: cache PWA identificada pelo build

### Problema confirmado

A chave de cache do Service Worker acumulava manualmente tokens históricos de alterações. Este modelo era difícil de manter e permitia que uma futura alteração esquecesse de atualizar a linhagem, deixando uma PWA instalada com assets antigos.

### Correção

- `sw.js` mantém apenas um placeholder curto no código fonte;
- o build Pages substitui esse placeholder por `conta-de-casa-public-v76-<build-id>`;
- o identificador usa o commit curto do build, com fallback local explícito;
- o build falha se a injeção da chave deixar de corresponder ao Service Worker;
- testes verificam a chave do source e a chave efetivamente publicada em `dist/sw.js`;
- testes da Calculadora e captura de faturas deixam de depender de tokens históricos de features e passam a verificar os assets offline relevantes.

### Preservado

Sem alteração de UI/UX, `STATE_VERSION`, IndexedDB, cofre/PIN, cifragem, sincronização, pagamentos ou cálculos financeiros.

## 2026-09-30: `76-dialog-controls1`: Voltar e Fechar separados no detalhe da fatura

### Problema confirmado

No cabeçalho móvel de **Detalhes da fatura**, a seta de voltar e o X eram desenhados sobre o mesmo `.dialog-close`. A camada Lucide fornecia o X e CSS legado acrescentava a seta através de `::before`, reproduzindo a sobreposição observada na captura física.

### Correção

- foi criado um controlo próprio `data-dialog-back` para Voltar;
- o X permanece exclusivamente em `data-close-dialog`;
- no detalhe, Voltar fica à esquerda, o título permanece centrado e Fechar fica à direita;
- `closeDialog()` continua o caminho canónico e restaura o foco na origem;
- o CSS de despesas deixa de mascarar o X como seta;
- iconografia continua Lucide local, sem nova dependência;
- Service Worker e chave de cache recebem `76-dialog-controls1`, preservando os restantes contratos de revisão de assets;
- contratos automatizados cobrem navegação, acessibilidade, iconografia, CSS móvel e build Pages.

### Preservado

Sem alteração de `STATE_VERSION`, IndexedDB, PIN/cofre, cifragem, pagamentos, cálculos financeiros, Mercado, sync ou scanner.

## 2026-09-27: `76-local-zxing1`: scanner local, offline e CSP mais restritiva

### Segurança e distribuição

- ZXing Browser 0.2.0 deixa de ser carregado de `unpkg.com` em execução;
- a dependência passa a ser instalada no build, validada por versão e copiada para o bundle público;
- a licença da biblioteca é preservada e publicada com o Pages;
- `script-src` passa a aceitar apenas `self`;
- os dois consumidores do scanner rejeitam origens externas e reutilizam o mesmo script local;
- Service Worker passa a precachear o runtime ZXing, permitindo o fallback também offline depois da instalação.

### Regressão

Foram reforçados testes de segurança, build, Pages, PWA, captura de fatura e scanner do Mercado. A alteração não toca no schema financeiro, IndexedDB, cofre/PIN, pagamentos, sync ou release pública.


## 2026-09-27: `76-budget-cash-separation3`: caixa e orçamento deixam de se cruzar na apresentação

### Problema confirmado

`76-budget-bill-month2` corrigiu a alocação do orçamento ao mês da fatura, mas o Calendário ainda apresentava `budgetUsed` como **Gasto no mês**, enquanto os dias e o histórico usavam `paidAt`. Nos Relatórios, o total era de caixa, mas as categorias vinham da base orçamental. Uma fatura paga antecipadamente podia, por isso, produzir totais visualmente incompatíveis.

### Correção

- `monthNumbers()` expõe `cashSpent = paymentTotal + marketSpent`;
- Calendário usa `cashSpent` no resumo mensal;
- Relatórios usam `cashSpent` nos cartões e `cashCategoryTotals()` nas categorias;
- `categoryTotals()` mantém a semântica de orçamento;
- Planeamento mantém `budgetUsed`, mas a métrica passa a chamar-se **Orçamento utilizado**;
- diagnósticos validam separadamente caixa, orçamento e respetivas distribuições por categoria;
- `render.js`, `finance.js`, arquitetura e Service Worker recebem a revisão `76-budget-cash-separation3`.

### Preservado

Sem alteração de `STATE_VERSION`, IndexedDB, PBKDF2/AES-GCM, PIN/cofre, pagamentos persistidos, sync ou release pública `v76` / `0.76.0`.



## 2026-09-26: `76-budget-bill-month2`: orçamento reage ao pagamento da fatura

Uma fatura de um mês futuro podia ser paga antecipadamente e ficar **Paga**, enquanto o orçamento desse mês permanecia em 0,00 €. Foi separado o fluxo de caixa (`paymentTotal`, por `paidAt`) da utilização do orçamento (`budgetPaymentTotal`, pelo mês da fatura).

`budgetUsed`, Planeamento e categorias usam agora a mesma base mensal. Calendário e relatórios de caixa continuam a respeitar a data real do pagamento. A correção inclui testes de regressão e invalidação do runtime PWA.


## 2026-09-25: `76-full-audit-fixes1`: auditoria transversal e correções

### Pagamentos

A fila do Início deixa de excluir faturas vencidas do mês. Valores pendentes com data válida são ordenados pelo vencimento e recebem indicação coerente com o estado real: **Pagar agora**, **Vence hoje**, **Prioridade**, **A seguir**, **Depois** ou **Mais tarde**.

### Datas locais

- o orçamento diário de consultas do catálogo do Mercado deixa de usar a data UTC e passa a seguir o dia local do dispositivo;
- a biblioteca Pingo Doce aplica a mesma correção às quotas diárias;
- a preferência de supermercado deixa de ser gravada numa chave bloqueada pela política de Web Storage e passa para `cdc_public_store_choice_v1`, mantendo leitura da chave antiga;
- o nome do backup cifrado passa a usar a data civil local.

### Regressão e distribuição

Foram acrescentados contratos para estes três casos. `render.js` e o Service Worker recebem a revisão `76-full-audit-fixes1` para distribuição em Safari/PWA.

### Preservado

Sem alteração de `STATE_VERSION`, IndexedDB, PBKDF2/AES-GCM, PIN/cofre, pagamentos, sync, cálculos monetários ou identidade do Mercado.


## 2026-09-25: `76-security-network-copy1`: descrição de rede corrigida

A página Segurança deixou de afirmar **Sem CDNs**. O texto passa a declarar que o leitor QR pode carregar ZXing Browser 0.2.0 de `unpkg.com`, sem credenciais e sob a CSP existente. A sincronização e o cofre permanecem inalterados.

O build passa a versionar `render.js` com `76-security-network-copy1` e invalida o Service Worker para distribuição imediata em Safari/PWA.


## 2026-09-25: `76-month-context-sync1`: sincronização entre Planeamento e Calendário

### Correção

O mês ativo passa a ter um único fluxo de atualização. Antes, o Calendário era renderizado diretamente a partir de `selectedMonth`, enquanto a camada visual adicional do Planeamento podia depender de uma atualização indireta e ficar desfasada depois de certas mudanças de mês.

Agora:

- `selectMonthContext()` centraliza a mudança mensal;
- `#monthPicker`, histórico do Calendário, setas do Planeamento e rollover automático convergem no mesmo contexto;
- o evento `cdc:month-change` força a recomposição do Planeamento;
- o Calendário filtra explicitamente vencimentos pelo mês selecionado;
- a revisão de `v75-architecture.js` e do Service Worker passa para `76-month-context-sync1` para entrega imediata em Safari/PWA.

### Preservado

Sem alteração de fórmulas financeiras, perfis mensais, IndexedDB, PIN/cofre, faturas, pagamentos, Mercado ou sync.


## 2026-09-25: `76-dashboard-priority-delivery1`: correção de atualização do Início no Safari/PWA

### Problema confirmado

O artefacto de GitHub Pages do commit anterior continha a nova interface de prioridades, incluindo **Ordenado por prioridade de pagamento**, o novo `render.js` e o CSS correspondente. No iPhone continuava visível a interface anterior. O build do Dashboard tinha mudado, mas `sw.js` e o `SERVICE_WORKER_REV` não tinham sido invalidados.

### Correção

- chave de cache do Service Worker passa a incluir `dashboard-priority-delivery1`;
- `SERVICE_WORKER_REV` passa para `76-dashboard-priority-delivery1`;
- clientes antigos podem descobrir a revisão através do `registration.update()` já existente e entrar no fluxo automático de ativação/reload seguro;
- testes passam a impedir uma futura alteração deste Dashboard sem a revisão correspondente do Service Worker.

### Preservado

Sem alteração de `STATE_VERSION`, IndexedDB, cofre/PIN, cálculos, faturas, pagamentos, Mercado, scanner, sync ou release pública `v76` / `0.76.0`.


## 2026-09-25: `76-dashboard-priority1`: fila visual de pagamentos no Início

### Alteração

O cartão **Próximos vencimentos** foi alinhado com o protótipo aprovado para permitir uma leitura imediata da sequência de pagamento:

- cabeçalho com ícone, texto **Ordenado por prioridade de pagamento** e ação **Ver faturas**;
- cada uma das seis posições pode mostrar ordinal, rótulo Pagar / A seguir / Depois / Mais tarde, identidade local, descrição, data/categoria, valor em falta e prazo até ao vencimento;
- a faixa lateral e a tonalidade mudam por posição, sem alterar o estado financeiro da fatura;
- a linha inteira continua a abrir a fatura real;
- não são carregados logos remotos; o espaço visual de marca usa uma inicial derivada localmente.

O cartão **Orçamento** do Início passa a apresentar uma composição compacta com valor orçado, percentagem utilizada, valor consumido e barra de progresso acessível, preservando os cálculos existentes.

### Regra funcional preservada

A prioridade visual é atribuída apenas depois da lista ser filtrada e ordenada por `compareBillsByDue()`. Não foram alterados `billStatus()`, `billUrgency()`, `remainingForBill()`, pagamentos, faturas, Mercado, IndexedDB, PIN/cofre, cifra ou sync.

### Distribuição

- `v76-product-pages.css` e `render.js` usam a revisão `76-dashboard-priority1` no HTML gerado;
- o Service Worker continua com a estratégia pública network-first/no-store, portanto não é necessária uma nova política de cache;
- a release permanece `v76` / `0.76.0`.

### Validação pendente

- iPhone/Safari/PWA em 390 px e 430 px;
- seis faturas simultâneas;
- nomes e categorias longos;
- dark mode e forced-colors;
- confirmação visual do cartão de orçamento e dos estados de foco.


## 2026-09-25: `76-planning-commitment1`: hierarquia de gasto, compromisso e disponível real

### Alteração

O resumo de Planeamento passa a distinguir quatro valores:

- **Gasto este mês**: pagamentos registados e compras de Mercado concluídas;
- **Comprometido**: valor ainda por pagar das faturas ativas do mês;
- **Orçamento**: limite mensal configurado;
- **Disponível real**: orçamento menos gasto efetivo menos comprometido.

A fonte do compromisso é `monthNumbers().outstanding`, já existente no domínio financeiro. Pagamentos parciais continuam sem duplicação: a parte paga entra em gasto e apenas o remanescente fica comprometido.

### Hierarquia e atualização

- o anel continua a representar apenas a percentagem de gasto efetivo sobre o orçamento;
- `Disponível real` pode ficar negativo para indicar sobrecompromisso;
- o texto de orientação explica que o disponível real desconta as faturas ainda por pagar;
- a chave de recomposição inclui `committed` e `availableReal`, evitando valores visuais desatualizados após mudanças nas faturas;
- `v75-architecture.js` recebe a revisão `76-planning-commitment1`;
- `scripts/prepare-pages.cjs` atualiza o token do asset da arquitetura;
- o Service Worker mantém a política atual, porque os assets públicos são pedidos network-first com `cache:'no-store'` e a alteração não exige nova política de cache.

### Preservado

Sem alteração de `STATE_VERSION`, estrutura de IndexedDB, pagamentos, regras de faturas, Mercado, PIN/cofre, cifragem, sync, scanner, QR, orçamento canónico, `v76` ou `0.76.0`.

### Validação necessária

- testes automatizados do contrato de arquitetura;
- cenário com orçamento e sem faturas;
- fatura pendente;
- pagamento parcial;
- fatura vencida;
- fatura totalmente paga;
- disponível real negativo;
- validação física em iPhone/Safari/PWA e desktop.

## 2026-09-15 — PR #165 / `76-date-calculator-prototype-inputs5` — correção WebKit/iOS dos campos de data — publicado

### Problema confirmado

A captura física após o PR #163 mostrou a secção **Datas de entrada** deslocada e cortada lateralmente no Safari/iOS. O valor da data, o botão **Hoje**, o eixo Trocar e a Regra de contagem ultrapassavam a área visual esperada. A matemática estava correta; a regressão era de composição do `input[type="date"]` no WebKit.

A técnica anterior reposicionava `::-webkit-calendar-picker-indicator` com coordenadas e combinava esse deslocamento com padding reservado. No WebKit móvel, isso podia aumentar a largura intrínseca do controlo e empurrar o conteúdo para fora do cartão.

### Correção

- `date-calculator.css` continua a única autoridade visual;
- `.cdc-datecalc-input-action` passa a ser a moldura contida do campo, em grelha `48px minmax(0,1fr) auto`;
- calendário visual/divisor ficam na primeira coluna sem criar rede, biblioteca ou segundo date picker;
- o `input[type="date"]` nativo ocupa a coluna central com `min-width:0`, sem borda e sem padding lateral artificial;
- o indicador WebKit deixa de usar `left`/posicionamento absoluto e fica visualmente colapsado;
- **Hoje** passa para a terceira coluna em fluxo normal e mantém target >=44 px;
- foco visível é aplicado ao conjunto por `:focus-within`;
- Data inicial → Trocar → Data final continuam com gap móvel de 8 px;
- Trocar mantém o eixo horizontal e a superfície central 44×44 px;
- Regra de contagem mantém duas colunas em telemóveis comuns e só empilha em `<=340px`;
- `forced-colors`, `prefers-reduced-motion`, `100svh`, safe areas e impressão/PDF permanecem suportados;
- `tests/date-calculator.test.cjs` impede o retorno do reposicionamento horizontal do indicador e protege a contenção do campo.

### Atualização sem ecrã intermédio

O Service Worker não recebeu um novo token neste hotfix. `date-calculator.css` já pertence à allowlist pública e é servido com estratégia network-first/no-store, com cache apenas como fallback. Assim, após o deploy, um reload/reabertura normal pode obter o CSS novo sem obrigar o utilizador a entrar na página de atualização da aplicação.

### Preservado

Sem alteração de `src/ui/date-calculator.ts`, matemática civil, regras de inclusão/exclusão, soma/subtração, dias úteis, IDs, handlers, IndexedDB, finanças, auth, sync, QR, scanner, Mercado, `STATE_VERSION`, `v76` ou `0.76.0`.

### Evidência

- head PR #165: `045d72e5af30b8a4f22ee6d3630ecb898e1f8a3e`;
- TypeScript Foundation PR `35025919784`: sucesso;
- CI PR `35025919606`: sucesso integral;
- merge `a80c0f9bfdbd9135dea69368ca2bde56196fab5d`;
- TypeScript Foundation `main` `35025991379`: sucesso;
- CI `main` `35025991388`: sucesso integral;
- Deploy Pages `35026044123`: sucesso.

### Pendente

- confirmação física no mesmo iPhone/Safari web e PWA instalada;
- confirmar que os dois campos permanecem totalmente contidos e sem scroll/clipping horizontal;
- validação tablet/desktop e portrait/landscape;
- E2E WebKit/Chromium para top-layer, scroll, partilha e impressão.

---

## 2026-09-15 — PR #163 / `76-date-calculator-prototype-inputs4` — campos de datas alinhados ao protótipo — publicado

### Problema confirmado

Depois do ajuste de espaçamento do PR #161, a secção já estava funcional e compacta, mas a hierarquia visual ainda não correspondia ao protótipo aprovado: o campo de data não explicitava suficientemente a affordance do calendário, o controlo **Trocar** não criava um eixo visual entre as datas e a Regra de contagem precisava de uma composição mais organizada.

### Correção

- `date-calculator.css` permanece a única autoridade visual da ferramenta;
- `input[type="date"]` continua nativo e não foi substituído por widget JavaScript;
- em WebKit, o indicador nativo do calendário foi reposicionado à esquerda nesta versão; essa técnica foi posteriormente substituída pelo PR #165 após regressão física no iPhone;
- o campo reservava 54 px à esquerda e 76 px à direita para calendário/divisor e ação **Hoje**;
- um divisor vertical interno separava a affordance do calendário do valor;
- **Hoje** permanecia ação real à direita com target >=44 px;
- em `<=560px`, Trocar ocupa o eixo horizontal disponível, mantendo uma superfície central 44×44 px;
- Regra de contagem usava duas colunas onde existia largura e passava a uma coluna em `<=430px`;
- checkboxes móveis usam 22×22 px sem reduzir a área clicável da label;
- `forced-colors`, `prefers-reduced-motion`, `100svh`, safe areas e impressão/PDF permanecem suportados;
- `tests/date-calculator.test.cjs` protegia o contrato visual e todos os vetores matemáticos civis anteriores;
- Service Worker recebeu `date-calculator-prototype-inputs4` para invalidar a apresentação anterior.

### Preservado

Sem alteração de `src/ui/date-calculator.ts`, matemática civil, regras de inclusão/exclusão, soma/subtração, dias úteis, IDs, handlers, IndexedDB, finanças, auth, sync, QR, scanner, Mercado, `STATE_VERSION`, `v76` ou `0.76.0`.

### Evidência

- head funcional `c2bbcf7d98bcd7511dbde748e049f3e15258bd3b`;
- TypeScript Foundation PR `35023063165`: sucesso;
- CI PR `35023063147`: sucesso integral;
- merge `1bf42cfc2ed7c2b67413db49c7828416dcae4d4c`;
- TypeScript Foundation `main` `35023156381`: sucesso;
- CI `main` `35023156390`: sucesso integral;
- Deploy Pages `35023224573`: sucesso.

### Estado posterior

A captura física no Safari/iOS mostrou overflow/clipping; a técnica do indicador nativo reposicionado foi substituída no PR #165 / `76-date-calculator-prototype-inputs5`.

---

## 2026-09-15 — PR #161 / `76-date-calculator-mobile-spacing3` — grupo móvel de datas — publicado

### Problema confirmado

A captura física da Calculadora de datas em mobile mostrou espaço vertical excessivo entre **Data inicial**, o botão **Trocar** e **Data final**. A matemática e os controlos estavam corretos; o problema era exclusivamente de composição móvel.

### Correção

- `date-calculator.css` permanece a única autoridade visual da ferramenta;
- em `<=560px`, `.cdc-datecalc-date-grid` passa a flex vertical;
- ordem funcional permanece Data inicial → Trocar → Data final;
- gap do grupo passa a 8 px;
- labels anulam margem e altura herdadas que poderiam reservar vazio artificial;
- a área do input mantém pelo menos 52 px;
- botão Trocar mantém 44×44 px, centrado e sem margem vertical adicional;
- desktop preserva a grelha original com as duas datas lado a lado;
- `forced-colors`, `prefers-reduced-motion`, `100svh`, safe areas e impressão/PDF permanecem suportados;
- `tests/date-calculator.test.cjs` protege o novo contrato e todos os vetores matemáticos civis anteriores;
- Service Worker recebe `date-calculator-mobile-spacing3` para invalidar a apresentação móvel anterior.

### Preservado

Sem alteração de `src/ui/date-calculator.ts`, matemática civil, regras de inclusão/exclusão, dias úteis, IDs, handlers, IndexedDB, finanças, auth, sync, QR, scanner, Mercado, `STATE_VERSION`, `v76` ou `0.76.0`.

### Evidência

- head funcional `44322ce724e1ec7795b2f76f73bfd7535dc7427d`;
- TypeScript Foundation PR `35021139249`: sucesso;
- CI PR `35021139256`: sucesso integral;
- merge `a1cbdce6661bbde015699fca39d5aa7ac284ec90`;
- TypeScript Foundation `main` `35021210449`: sucesso;
- CI `main` `35021210442`: sucesso integral;
- Deploy Pages `35021281637`: sucesso.

### Pendente

- confirmação física no mesmo iPhone/Safari web e PWA instalada;
- validação tablet/desktop e portrait/landscape;
- E2E WebKit/Chromium para top-layer, scroll, partilha e impressão.

---

## 2026-09-15 — PR #158 / `76-auth-spacing3` — ritmo vertical do PIN em Safari/iOS — publicado

### Problema confirmado

A validação física no iPhone/Safari mostrou que a geometria do keypad estava correta, mas o somatório dos espaços entre marca, introdução, campo PIN, keypad, CTA, ações secundárias, transferência e nota inferior empurrava conteúdo para a zona do chrome inferior do browser.

### Correção

- `v75-usability.css` permanece a única autoridade visual do auth;
- keypad móvel mantém 56 px, `column-gap:30px` e `row-gap:16px`;
- separação da marca reduzida para 16 px;
- campo PIN e keypad usam 18 px de separação dos blocos anteriores;
- CTA **Entrar** mantém 52 px e usa 20 px após o keypad;
- ações secundárias são aproximadas sem reduzir targets >=44 px;
- transferência usa 14 px de margem superior e 12 px de separador interno;
- `#vaultMessage:empty` deixa de reservar altura quando não existe mensagem;
- `100svh`, safe areas, input >=16 px, pinch-to-zoom, dark mode, `forced-colors` e `prefers-reduced-motion` permanecem ativos;
- Service Worker recebe o token técnico `auth-spacing3`.

### Preservado

Sem alteração de PIN, palavra-passe, `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync, dados financeiros, QR, scanner, Mercado, `STATE_VERSION`, `v76` ou `0.76.0`.

### Evidência

- head funcional `4632fa25a608524a5e0ce2e313378a21f1458e9f`;
- TypeScript Foundation PR `35019148671`: sucesso;
- CI PR `35019148364`: sucesso integral;
- merge funcional original PR #158: `79cd9e52feb0ac87678c253e0392ba402ae6f718`;
- TypeScript Foundation `main` `35019232012`: sucesso;
- CI `main` `35019231922`: sucesso integral;
- Deploy Pages `35019295696`: sucesso;
- PR #159 reaplicou o mesmo conteúdo funcional sem novo contrato visual; `main` passou a `36f04023a967539e2827c357c58c835ef9a721e9`;
- em `main` após PR #159: TypeScript `35019873098`, CI `35019873034` e Deploy Pages `35019940717`: sucesso.

### Pendente

- confirmação física no mesmo iPhone/Safari web e PWA instalada;
- validação portrait/landscape e teclado virtual;
- E2E WebKit/Chromium para o fluxo de autenticação.

---

## 2026-09-15 — PR #156 / `76-date-calculator-layout2` — autoridade visual da Calculadora de datas — publicado

### Objetivo

Eliminar a necessidade de novos ajustes sucessivos de alinhamento/espaçamento e transformar `date-calculator.css` numa única autoridade visual coerente com o Design System da aplicação.

### Reconfiguração

- `date-calculator.css` foi consolidado em vez de receber outro bloco corretivo no fim da cascade;
- introduzida escala local 4/8/12/16/20/24/32 px;
- desktop usa grelha com área principal flexível e coluna lateral de 280 px;
- mobile `<=820px` usa a ordem **Calculadora → Informação rápida → Resultado → Ações**;
- `cdc-datecalc-workspace` usa `display:contents` apenas para composição visual, preservando markup funcional, IDs e handlers;
- `<=560px` empilha datas, resultado e ações antes de ocorrer compressão;
- `<=430px` empilha campos secundários e reduz padding de forma controlada;
- `<=360px` usa dialog em ecrã completo com `100svh`;
- `100dvh` deixou de fazer parte da autoridade móvel final;
- inputs/selects principais usam 52 px e texto de 16 px;
- ação **Hoje**, opções de contagem e botão de troca mantêm targets >=44 px;
- tabs mantêm três destinos numa única grelha, sem scroll horizontal;
- `forced-colors`, `prefers-reduced-motion` e impressão/PDF permanecem suportados;
- `tests/date-calculator.test.cjs` protege a nova arquitetura visual e mantém todos os vetores matemáticos multitimezone;
- Service Worker recebeu o token técnico `date-calculator-layout2` para invalidar o CSS anterior.

### Preservado

Sem alteração de:

- `src/ui/date-calculator.ts` e `76-date-calculator1` como autoridade funcional;
- matemática civil;
- regras de inclusão/exclusão;
- soma/subtração de dias;
- definição atual de dias úteis;
- estado financeiro, persistência, auth, sync, QR, scanner ou Mercado;
- release `v76` / versão `0.76.0`.

### Evidência

- head final PR #156: `e82bcf394be18fb3f102164242704040289ccab8`;
- TypeScript Foundation PR `35016302805`: sucesso;
- CI PR `35016302738`: sucesso integral;
- merge: `00ec8351cfedb8eba657fe4f19a4f2614c86347f`;
- TypeScript Foundation `main` `35016376375`: sucesso;
- CI `main` `35016376360`: sucesso integral;
- Deploy Pages `35016440963`: sucesso.

### Pendente

- validação física do `<dialog>` em iPhone/Safari web e PWA instalada;
- validação em tablet/desktop;
- copiar/partilhar/imprimir-PDF em dispositivo real;
- E2E WebKit/Chromium para top-layer, scroll e responsividade real.

---

## 2026-09-15 — PR #154 / `76-auth-exclusive-state1` — estados exclusivos do cofre — publicado

- captura real mostrou criação e desbloqueio renderizados simultaneamente;
- a causa foi uma regra `display:grid!important` que conseguia contrariar o estado `hidden`;
- `hidden` passou a autoridade explícita também entre estados internos do cofre;
- criação e desbloqueio deixam de poder aparecer ao mesmo tempo;
- auth funcional, armazenamento, cifra e sync foram preservados;
- merge `2594ba1c1a3f4f2cabbcf5c92e2cdd5a8f28734c`;
- TypeScript, CI e Pages em `main` concluíram com sucesso.

---

## 2026-09-15 — PR #152 / `76-auth-prototype-final1` — composição final do PIN — publicado

- consolidou a apresentação móvel do cofre numa única autoridade visual;
- retirou blocos corretivos concorrentes anteriores;
- keypad móvel padrão 56 px, `column-gap:30px`, `row-gap:16px`;
- `100svh`, safe areas, input >=16 px e targets >=44 px preservados;
- merge `ceaa4fc8a79cbb2ad442854ffaacd501dac7313f`;
- Pages `34977846729`: sucesso.

---

## 2026-09-15 — PR #150 / `76-auth-ios-spacing2` — base de viewport iOS — substituído visualmente pelo PR #152

- introduziu `100svh`, safe areas e topo seguro no auth móvel;
- a base de viewport permaneceu válida, mas a composição visual foi consolidada posteriormente.

---

## 2026-09-15 — PR #149 / `76-date-calculator1` — calculadora exata de datas — publicada

### Funcionalidade

- entrada em **Mais → Ferramentas → Calculadora de datas**;
- diferença civil entre duas datas;
- inclusão/exclusão explícita das datas-limite;
- total decorrido, total inclusivo, semanas e período civil anos/meses/dias;
- adicionar/subtrair dias corridos e úteis;
- contagem de dias úteis;
- dia do ano, dia da semana e estado bissexto/comum;
- copiar, partilhar e imprimir/PDF.

### Exatidão

- fonte funcional TypeScript strict em `src/ui/date-calculator.ts`;
- reutiliza primitivas de data civil de `core.js`;
- regressões multitimezone cobrem UTC, Europe/Lisbon, America/Los_Angeles e Pacific/Kiritimati;
- “dias úteis” significa segunda a sexta; feriados não são presumidos sem jurisdição configurada;
- sem rede nem persistência no estado financeiro;
- merge `8e58777f601d164bd4589f7d0e0e8f96e02686f0`.

A apresentação inicial deste PR foi substituída visualmente por `76-date-calculator-layout2` no PR #156; a lógica funcional permanece a mesma.

---

## 2026-09-15 — PR #147 / `76-bills-mobile-alignment2` — Despesas mobile — integrado

- filtros passam a grelha contida;
- Estado/Categoria e De/Até formam pares;
- Ordenar/Limpar ocupam linhas completas;
- `<=360px` empilha numa coluna;
- scroll horizontal deixa de ser necessário para descobrir controlos essenciais;
- merge `480dc501ff10bf29413b934e623d8641d5e95229`.

---

## 2026-09-15 — PR #145 / `76-planning-ring-shape1` — anel de orçamento — publicado

- corrige geometria oval causada por altura legada fixa;
- usa `height:auto!important` + `aspect-ratio:1/1!important`;
- merge `471c689c1df47118bd3a345214acfd140bdc6e7d`.

## 2026-09-15 — PR #143 / `76-planning-budget-card2` — Planeamento móvel — publicado

- seletor mensal, resumo de orçamento e CTA reorganizados;
- gravação continua no formulário canónico;
- merge `386d75b35060eb011c2a2d68ec6b965c87c5080c`.

## 2026-09-15 — PR #142 / `76-bills-mobile-spacing1`

- normaliza o ritmo do cartão de filtros de Despesas;
- merge `cd45ec537989c51f125747958e198c8e0431a352`.

## 2026-09-15 — PR #140 / `76-bills-mobile-filters1`

- pesquisa + ação + filtros ganham composição móvel;
- lupa duplicada é neutralizada em favor do Lucide local;
- merge `387a953e427331a5aa48d872cd7c54e1552d2c1c`.

## 2026-09-15 — PR #138 / `76-icon-semantics1`

- Planeamento usa `CalendarCheck2`;
- Definições usa `Settings`;
- iconografia funcional permanece no snapshot Lucide local/licenciado.

## 2026-09-15 — PR #136 / `76-drawer-hierarchy1`

- drawer móvel numa coluna, com hierarquia simples e targets adequados.

## 2026-09-15 — PR #133/#134 — identidade de Mercado

- resultados live preservam `marketId|pid`;
- identidade transitória não contamina criações posteriores;
- preços e contabilidade não mudam.

---

## 2026-09-14 — release v76 e estabilização estrutural

- runtime v74/Featured retirado;
- navegação/composição móvel consolidada;
- release oficializada como v76/`0.76.0`;
- PR #131 profissionalizou Adicionar despesa;
- PR #132 corrigiu hit-testing/touch no Safari/iPhone.

## 2026-09-13 — auth/UI e início TypeScript

- abertura local deixou de depender de sync remoto;
- Safari/WebKit passou a respeitar `hidden` entre cofre/shell;
- marca `icon.svg` e Lucide consolidados;
- Sync conflict policy migrou para TypeScript.

---

## Decisões de continuidade

- regressão real em dispositivo tem prioridade sobre teste legado;
- cada componente deve convergir para uma única autoridade visual, não para sucessivos blocos `fix`;
- `hidden` é autoridade de estado e não pode ser revertido por decoração CSS;
- `icon.svg` é marca; Lucide é iconografia funcional;
- protótipos definem hierarquia, não autorizam domínio inventado;
- auth e Calculadora de datas usam `100svh` quando controlam altura móvel própria;
- filtros de Despesas não dependem de faixa horizontal;
- resumo de Planeamento delega no formulário canónico;
- calculadora usa aritmética civil e regras explícitas;
- correção técnica não exige mudança de release;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de origem remota para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.

### 24 de setembro de 2026 — modos de registo de fatura

- corrigidos os tabs **Manual**, **Ler fatura** e **QR Code**, que anteriormente podiam aparentar não executar nenhuma ação;
- **Ler fatura** passa a abrir o seletor de imagem no próprio toque;
- **QR Code** passa a iniciar diretamente o leitor de câmara;
- **Manual** devolve o foco ao fluxo de introdução manual;
- mantida a separação de responsabilidades entre arquitetura visual e `invoice-capture.js`;
- acrescentados testes de regressão e token `invoice-mode-action1` no cache PWA;
- sem alterações a cálculos financeiros, IndexedDB, cifra, pagamentos, Mercado ou sincronização.


### 24 de setembro de 2026 — desempenho do leitor de faturas

- o ZXing passa a ser preparado em background quando abre uma nova fatura;
- reduzida a espera no primeiro uso de **Ler fatura** e **QR Code**;
- o pré-aquecimento não solicita a câmara nem bloqueia a interface;
- mantido fallback normal se a preparação antecipada falhar;
- cache PWA invalidada com `invoice-capture-warmup1`;
- sem alterações ao domínio financeiro, armazenamento ou segurança do cofre.


### 24 de setembro de 2026 — correção física dos tabs de fatura

- validação real no iPhone confirmou que **Ler fatura** e **QR Code** continuavam sem reação ao toque apesar do deploy concluído;
- adicionada ativação explícita por `touchend` para Safari/iOS;
- mantidos `click` e teclado para desktop;
- adicionada deduplicação do click sintetizado para impedir dupla execução;
- alterados tokens de cache da arquitetura, captura de fatura e Service Worker;
- sem alterações a cálculos, persistência, cifra ou regras financeiras.


### 24 de setembro de 2026 — tabs diretos e atualização automática

- nova captura física mostrou os modos de fatura ainda sem reação observável no iPhone;
- os tabs passam a receber listeners diretamente nos próprios botões;
- removida a dependência de `touchend` delegado no `document` para este fluxo;
- o gesto de toque deixa de ser cancelado antes de abrir ficheiro/câmara;
- novo Service Worker promove automaticamente a compilação depois de concluir o precache;
- a página recarrega automaticamente quando o novo worker assume o controlo;
- aplicação passa a verificar novas compilações periodicamente enquanto está aberta e online;
- preservados cálculos, IndexedDB, cofre, PIN, Mercado e sincronização.


### 24 de setembro de 2026 — captura nativa de faturas e refresh seguro

- **Ler fatura** passa a abrir o seletor através de input nativo integrado no tab;
- **QR Code** móvel passa a abrir a câmara nativa com `capture=environment`;
- eliminado o `input.click()` programático do caminho móvel principal;
- leitura de imagem usa `BarcodeDetector` quando disponível e ZXing como fallback;
- CSS exclui os inputs nativos das regras genéricas dos campos do formulário;
- atualizações continuam automáticas, mas reload é adiado enquanto existir registo/modal ativo;
- novas revisões de cache: arquitetura `76-architecture-native4`, captura `76-invoice-native4` e Service Worker `76-safe-refresh3`;
- sem alterações a cálculos, cofre/PIN, IndexedDB, Mercado ou sincronização.


### 24 de setembro de 2026 — identificação explícita dos modos de despesa

- Manual, Ler fatura e QR Code passam a ter IDs e ações estáveis no DOM;
- criado `BILL_MODE_ACTIONS` como mapa único entre menu e função;
- diálogo passa a registar `data-v75-bill-action` para diagnóstico;
- mantida captura nativa de imagem/câmara no iPhone e scanner compatível em desktop;
- cache da arquitetura invalidada com `76-architecture-actions5`;
- sem alterações a cálculos, cofre, PIN, IndexedDB, Mercado ou sincronização.


### 24 de setembro de 2026 — desbloqueio do picker nativo iOS

- removida lógica JavaScript do gesto inicial de **Ler fatura** e **QR Code** em mobile;
- modo nativo passa a ser confirmado apenas após o evento `change`;
- removidos atributos `for` redundantes dos labels de captura;
- inputs invisíveis deixam de acionar a gestão de foco/visual viewport;
- ZXing deixa de ser pré-carregado em iOS/touch antes de existir uma imagem;
- desktop mantém scanner QR ao vivo;
- novas revisões públicas: `76-architecture-unblock6`, `76-invoice-unblock6`, `76-safe-refresh4`;
- preservados cálculos, cofre/PIN, IndexedDB, Mercado e sincronização.


### 24 de setembro de 2026 — preenchimento automático da fatura

- QR AT válido passa a preencher automaticamente os campos compatíveis, sem segundo toque;
- Descrição, Valor total, NIF do emitente e Referência são preenchidos apenas quando vazios;
- Categoria e Vencimento continuam obrigatórios, mas não são inferidos do QR além dos valores já existentes no formulário;
- Método e nome comercial do fornecedor permanecem para confirmação;
- eventos de input/change são emitidos para manter a UI e validação sincronizadas;
- runtime de captura revisto para `76-invoice-autofill7`;
- preservadas regras financeiras, IndexedDB, cofre/PIN, Mercado e sincronização.


### 24 de setembro de 2026 — calendário mensal de gastos

- calendário passa a mostrar gastos efetivos por dia, além dos vencimentos;
- adicionado resumo do mês: gasto total, faturas pagas, Mercado e por pagar;
- adicionado histórico navegável dos últimos seis meses;
- meses anteriores continuam derivados dos movimentos guardados e não são apagados na mudança de mês;
- aplicação acompanha automaticamente o novo mês quando estava no mês corrente;
- Saldo inicial e Orçamento do mês aparecem vazios num novo período enquanto não forem definidos;
- cache PWA invalidada com `monthly-spend-calendar1`;
- preservadas regras de pagamentos, cofre, IndexedDB, sincronização e auditoria financeira.


### 25 de setembro de 2026 — filtros de Despesas recolhidos no mobile

- cartão de filtros deixa de ocupar espaço permanente no telemóvel;
- adicionado botão compacto **Filtros** junto da barra de pesquisa;
- Estado, Categoria, datas, Ordenar e Limpar filtros continuam disponíveis sob demanda;
- contador indica critérios alterados;
- limpar filtros volta a recolher o painel em mobile;
- desktop mantém a grelha aberta;
- revisão do shell atualizada para `76-mobile-shell3` e cache invalidada com `bills-filters-collapse1`.


### 25 de setembro de 2026 — estabilidade e eficiência de runtime

- abertura após PIN passa a ser local-first diretamente no runtime canónico;
- `v75-startup-guard.js` deixa de substituir funções e mantém apenas exclusividade visual cofre/shell;
- sync passivo deixa de consultar a rede a cada minuto e passa a eventos + fallback de 5 min, com deduplicação;
- alterações locais continuam a sincronizar imediatamente pelo fluxo existente;
- atualização da PWA deixa o polling de 30 s e passa a checks em foreground/online + fallback de 15 min;
- checks de versão não correm com a aplicação oculta ou offline;
- camada de arquitetura deixa de recompor depois de clicks sem relevância;
- revisões públicas: `76-architecture-efficiency7`, `76-startup-canonical3`, `76-background-efficiency5`, cache `runtime-efficiency1`;
- sem alteração de `STATE_VERSION`, cálculos em cêntimos, IndexedDB, PBKDF2/AES-GCM, QR, Mercado ou regras de conflito.

## 2026-10-04: fundação da aplicação móvel nativa e partilha do Walli

Foi adicionada uma nova aplicação em `apps/mobile-native/`, separada da PWA existente.

### Incluído

- React Native + Expo SDK 57 + TypeScript strict;
- ecrãs móveis do protótipo de Animais/Walli;
- registo de dias com o Nuno, calendário, histórico e edição;
- cálculo proporcional pelos dias reais do mês ou valor diário fixo;
- contabilidade em cêntimos inteiros;
- reembolsos recebidos mantidos separados da base mensal;
- SQLite + SQLCipher;
- chave local aleatória protegida pelo SecureStore;
- transações e prevenção de dias duplicados;
- testes do domínio financeiro;
- workflow próprio para validar o subprojeto móvel.

A PWA v76 não foi alterada funcionalmente por esta entrega.


## 2026-10-04: development build nativa preparada

- adicionado `expo-dev-client` à aplicação móvel nativa;
- adicionados perfis EAS para desenvolvimento em iOS físico, Android, simulador iOS, preview e produção;
- mantidos bundle identifiers existentes;
- nenhuma credencial, certificado, token, chave de assinatura ou `projectId` fictício foi incluído no repositório;
- a PWA existente permanece funcionalmente inalterada.

Próximo passo: ligar o subprojeto a uma conta/projeto Expo autorizado e gerar as primeiras builds de dispositivo real.


## 2026-10-04: secção dedicada da partilha do Walli

- adicionada a secção móvel de topo `Partilha`;
- criada `WalliShareScreen` como área própria para a partilha com o Nuno;
- Animais passa a apresentar um resumo e um CTA para abrir a partilha;
- calendário, registos, configuração, entrega e reembolso ficam agrupados na nova secção;
- registos novos regressam à Partilha depois de guardados;
- adicionados testes de contrato da navegação;
- sem alterações às fórmulas financeiras nem ao modelo de persistência.


## 2026-10-04: Partilha do Walli no menu da PWA

- novo grupo `Animais` no drawer móvel da Conta de Casa;
- novo item `Partilha do Walli` com ícone de pata local;
- nova página PWA para configurar a base mensal, registar dias com o Nuno, consultar calendário e histórico e registar reembolsos;
- cálculo financeiro em cêntimos inteiros, com dias reais do mês;
- prevenção de dias sobrepostos;
- estado guardado no cofre cifrado existente, sem Web Storage em claro;
- backup e sincronização passam a incluir o domínio `petShare`;
- conflitos de configuração, registos e reembolsos podem ser revistos no fluxo de sincronização;
- `walli-share.js` passa a integrar o bundle público e precache;
- nova revisão de arquitetura/cache `76-walli-share-drawer1`;
- sem alteração de `STATE_VERSION` ou das fórmulas existentes de faturas, orçamento, Mercado e relatórios.


## 2026-10-04: edição e idas à rua na Partilha do Walli

- adicionada ação **Editar** em cada registo;
- formulário reutilizado para alterar datas, observação e idas à rua;
- novo botão **Cancelar edição**;
- novo campo manual **Idas à rua** com limite 0 a 200;
- registos antigos permanecem compatíveis com valor 0;
- sobreposição continua bloqueada, excluindo apenas o registo que está a ser editado;
- idas à rua passam a integrar o estado cifrado e a política de conflitos da sincronização;
- revisão pública atualizada para `76-walli-edit-walks2`;
- cálculo financeiro da partilha não foi alterado.


## 2026-10-04: passeios automáticos e total a pagar ao Nuno

- removida a introdução manual da quantidade de idas à rua;
- adicionada configuração de 1 ou 2 passeios por dia;
- adicionado preço por passeio, com referência inicial de 8,00 €;
- datas do período passam a determinar automaticamente a quantidade de passeios;
- resumo mostra custo dos passeios e total final a pagar ao Nuno;
- pagamentos novos são registados como `outbound`;
- movimentos antigos sem direção são preservados como `inbound`;
- recebimentos legados deixam de reduzir incorretamente o novo total a pagar;
- configuração de frequência e preço entra na sincronização cifrada;
- revisão de Walli/Service Worker atualizada para `76-walli-auto-walk-cost3`;
- fórmulas gerais de Faturas, Mercado, Planeamento e Relatórios permanecem inalteradas.


## 2026-10-04: refinamento UI/UX da Partilha do Walli

- nova hierarquia visual da página;
- hero dedicado com contexto e segurança;
- Total a pagar e Estado ganham maior peso visual;
- métricas secundárias passam a cartões compactos;
- configuração e registo tornam-se passos 1 e 2;
- prévia automática de passeios mostra quantidade e custo em blocos separados;
- calendário e histórico passam a composição responsiva;
- registos recebem ícone, chips de dias/passeios e ações mais claras;
- melhorias mobile para 900, 620 e 380 px;
- acessibilidade forced-colors e reduced-motion preservada;
- revisão de CSS, módulo Walli e Service Worker atualizada para `76-walli-ux-polish4`;
- sem alterações às fórmulas financeiras, persistência ou sincronização.


## 2026-10-04: pagamentos parciais na Partilha do Walli

- adicionado pagamento faseado do valor em aberto;
- opções automáticas de 2, 3 e 4 partes;
- prévia mostra o valor a pagar agora e o restante;
- divisão feita em cêntimos inteiros com reconciliação exata;
- botão de pagamento total mantido;
- pagamentos parciais usam os mesmos registos outbound já cifrados e sincronizados;
- não foi criado sistema de crédito, juros ou calendário de prestações;
- revisão pública atualizada para `76-walli-partial-pay5`;
- cálculos de dias, passeios, base e total não foram alterados.


## 2026-10-04: plano datado, Despesas e correções da Partilha do Walli

- planos de pagamento passam a aceitar datas por parcela;
- criado painel Plano e movimentos;
- parcelas podem ser pagas individualmente;
- planos divergentes do total atual são bloqueados até recriação;
- cada pagamento ao Nuno cria automaticamente uma Despesa paga na categoria Animais;
- ligações determinísticas evitam criar o mesmo movimento duas vezes;
- pagamentos incorretos passam a ser anulados por reversão auditável;
- anulação remove a Despesa ligada e reabre a parcela correspondente;
- botão Usar mês anterior copia apenas regras de cálculo;
- estrutura de sync inclui planos, ligações e reversões;
- comparação de configuração sincronizada passa a considerar também frequência e preço dos passeios;
- hero Walli deixa de conter SVG próprio e usa o sistema de ícones do projeto;
- revisão PWA atualizada para `76-walli-enhancements6`.


## 2026-10-04: iconografia funcional unificada

- `ui-icons.js` passa à revisão `76-icons-unified7`;
- adicionado ícone canónico de relógio;
- Dashboard passa a normalizar calendário, relatório, chevron e prazo pelo mesmo sistema Lucide;
- `render.js` deixa de emitir geometria própria para o ícone de prazo;
- ações de navegação eliminam SVG direto legado antes de inserir o ícone canónico;
- sistema mantém funcionamento offline e licença local;
- sem alterações a domínio financeiro, persistência ou segurança.


## 2026-10-05: redesign moderno do ecrã de PIN

- ecrã de desbloqueio redesenhado segundo o protótipo aprovado;
- novo fundo verde-petróleo com composição ambiental;
- cartão de autenticação frosted;
- teclado numérico e campo PIN ampliados;
- ação Entrar recebe gradiente e ícone ArrowRight;
- alternância Palavra-passe/PIN recebe ícone Key;
- controlos Mostrar PIN e Alterar PIN recebem ícones canónicos;
- SVGs locais de cadeado/backspace removidos do HTML;
- classe `vault-unlock-active` isola o novo visual do fluxo Criar cofre;
- cache/asset revision atualizada para `76-pin-prototype1`;
- nenhuma alteração à cifra, PBKDF2, IndexedDB ou dados financeiros.
