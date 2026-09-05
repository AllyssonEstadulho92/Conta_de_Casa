# Decisões Técnicas — Conta de Casa

## D-001 — Separar altura do shell e VisualViewport

Data: 4 de setembro de 2026
Estado: aceite

### Contexto

O shell mobile estava dimensionado diretamente com `--visual-vh`, valor calculado a partir de `window.visualViewport.height`. Em Safari/iPhone esta medida é transitória e pode mudar com teclado e barras do browser, provocando corte do contentor principal.

### Decisão

O shell permanente (`.app-shell` e `.main`) passa a usar `100dvh`, com `100svh` como mínimo. As métricas de `VisualViewport` permanecem no projeto apenas para comportamento transitório de teclado e diálogos.

### Motivo

O CSS dinâmico do viewport é a fonte adequada para a dimensão estrutural da aplicação. O Visual Viewport é útil para reposicionar interfaces durante o teclado, mas não deve definir a altura persistente de toda a aplicação.

### Risco controlado

Browsers sem suporte a `dvh` ignoram a nova declaração e mantêm as regras anteriores. Não foram alterados dados nem lógica de negócio.

## D-002 — Camada de compatibilidade móvel dedicada

Data: 4 de setembro de 2026
Estado: aceite

### Decisão

Criar `mobile-layout.css` e carregá-lo depois de `design-system.css`, em vez de reescrever imediatamente os dois ficheiros CSS existentes.

### Motivo

Existem várias gerações de regras responsivas em `styles.css` e `design-system.css`. Uma refatoração total durante a correção aumentaria o risco de regressão. A camada final torna o override explícito, pequeno, testável e reversível.

### Consequência

A consolidação dos estilos duplicados fica como trabalho posterior, depois de validação física em iPhone.

## D-003 — Reduzir densidade vertical dos cartões de Compras

Data: 4 de setembro de 2026
Estado: aceite

### Decisão

Entre 360 px e 560 px, o estado volta à linha do produto e os três indicadores financeiros são apresentados numa única grelha de três colunas. Dispositivos abaixo de 360 px mantêm o layout empilhado.

### Motivo

O layout anterior fazia cada item ocupar uma fração excessiva do ecrã em iPhones comuns. A alteração preserva legibilidade e os alvos tácteis de 44 px, mas melhora a quantidade de informação visível por ecrã.

## D-004 — Implementar o protótipo Mercado numa camada isolada

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O protótipo aprovado altera significativamente a apresentação da Lista de compras e introduz um ecrã de descoberta/comparação de produtos, mas o projeto já possui lógica madura de criação, edição, cálculo, cifragem e sincronização.

### Decisão

Criar `market-experience.css` e `market-experience.js` como camada final e contextual. A nova camada só modifica a apresentação de `page-market` e o modo `market-browser` do diálogo comum.

O botão de novo item e a ação rápida Mercado passam pelo novo comparador. A edição de registos existentes continua a usar o formulário anterior.

### Motivo

A abordagem reproduz o protótipo com risco reduzido, evita reescrever componentes financeiros e permite remoção/reversão direta se a validação física revelar regressões.

### Consequência

Os dois novos assets passam a integrar `index.html`, Service Worker, bundle de Pages e CI. A consolidação futura no design system principal só deve ocorrer depois da validação visual em dispositivos reais.

## D-005 — Não apresentar dados de demonstração como preços reais

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O protótipo visual contém comparações de Pingo Doce, Continente e Mercadona. O projeto atual é uma PWA estática sem backend e a CSP só permite ligações à própria origem e à API GitHub. Não foi confirmada uma fonte única, estável e verificável para preços em tempo real dos três mercados.

### Decisão

A build v51 mantém os preços do protótipo apenas como **dados de demonstração explicitamente identificados**. `market-experience.js` não faz pedidos externos e, ao adicionar um produto à lista, grava `estimatedCents: 0` em vez do valor de demonstração.

### Motivo

Gravar ou apresentar um valor fictício como preço real contaminaria cálculos financeiros e reduziria a fiabilidade da aplicação. Adicionar scraping direto a partir do browser também introduziria problemas de CORS, disponibilidade, segurança, termos de utilização e rastreabilidade da origem.

### Próxima decisão necessária

Antes de preços reais, definir um subsistema próprio de recolha/normalização com fontes verificadas por mercado, backend/proxy, EAN/GTIN, timestamp, região/loja, promoções, cache, caducidade e indicação de origem.


## D-006 — Preços reais pesquisados entram como estimativa auditável

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O utilizador pediu que a Lista de compras use preços reais pesquisados e que o valor selecionado seja contabilizado na lista, sem manter dados fictícios. A aplicação continua estática/local-first e não deve tratar uma consulta de preço como prova do montante efetivamente pago.

### Decisão

Continente e Pingo Doce são pesquisados através do endpoint público `cesta.pt/mcp`. Mercadona Portugal usa apenas observações do Open Prices localizadas em Portugal e com comprovativo. O preço escolhido é guardado em `estimatedCents`; `actualCents` permanece reservado ao valor efetivamente pago. Ao marcar o item como comprado, o cálculo contabilizado usa `actualCents` quando existe e, caso contrário, usa a estimativa pesquisada.

A CSP autoriza exclusivamente `cesta.pt` e `prices.openfoodfacts.org` para este fluxo, além da API GitHub já existente. A aplicação não envia dados financeiros do cofre a estas fontes.

### Motivo

Esta separação permite que o total da lista reflita imediatamente o preço real consultado sem afirmar que esse foi necessariamente o preço de compra. Também mantém rastreabilidade, evita preços inventados e preserva a lógica financeira existente.

### Limitação

A disponibilidade, cobertura e atualidade dependem das fontes externas. Em particular, Mercadona é uma observação comunitária com data, não uma API oficial em tempo real. Quando não existe evidência adequada, a aplicação deve mostrar ausência de preço em vez de fabricar um valor.
