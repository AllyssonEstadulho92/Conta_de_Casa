# Changelog Técnico — Conta de Casa

## 2026-09-05 — Mercado v52 com preços reais e contabilização da lista

### Alterações

- removidos preços e imagens de demonstração do fluxo **Adicionar produto**;
- pesquisa real de Continente e Pingo Doce através de `cesta.pt/mcp`;
- Mercadona Portugal limitada a observações Open Prices em lojas portuguesas com comprovativo e data;
- o preço selecionado é guardado em `estimatedCents` e atualiza imediatamente **Estimado total** e **Por comprar**;
- quando o item é marcado como comprado, **Gasto contabilizado** usa o preço real registado pelo utilizador ou, enquanto esse valor não existir, a estimativa pesquisada;
- `actualCents` continua separado para não confundir preço consultado com preço efetivamente pago;
- CSP alargada apenas a `cesta.pt` e `prices.openfoodfacts.org`;
- ligação para produto oficial é aberta apenas após validação do host e clique explícito do utilizador;
- Service Worker, cache busting e build pública atualizados para v52;
- acrescentado teste dinâmico de contabilização de preços e reforçadas as verificações de segurança/origens externas;
- removido o probe temporário do Super Save, que não faz parte do contrato de produção.

### Segurança e privacidade

Sem credenciais de supermercado, API keys ou tokens de terceiros. O conteúdo remoto é tratado como não confiável e escapado antes de apresentação. A pesquisa envia apenas o termo pesquisado às fontes selecionadas; o cofre financeiro permanece local/cifrado.


## 2026-09-05 — Mercado v51 alinhado com o protótipo aprovado

### Objetivo

Reproduzir na aplicação real a apresentação aprovada para **Lista de compras** e **Adicionar produto**, mantendo dados, cálculos, cifragem, sincronização, rotas e edição dos registos existentes.

### Alterações visuais

- criado `market-experience.css` como última camada visual e apenas para Mercado;
- refinados pesquisa, botão `+`, filtros, cartões de resumo, cabeçalho de resultados e estado vazio;
- novo ecrã responsivo `market-browser` para **Adicionar produto**;
- pesquisa inicial por “Leite meio gordo” para reproduzir o cenário do protótipo;
- tabs Mercados / Produtos / Categorias;
- seleção visual de Pingo Doce, Continente e Mercadona;
- cartões de produto com comparação dos três mercados e estado de promoção;
- alvos tácteis do novo fluxo entre 44 e 52 px;
- tipografia da nova camada nunca inferior a 12 px;
- breakpoints específicos para 320/359, 430, 820, 1180 px e desktop;
- safe areas superior e inferior aplicadas ao diálogo móvel.

### Alterações funcionais controladas

- `market-experience.js` interceta apenas a criação de um novo item e a ação rápida Mercado;
- editar um item já guardado continua a usar `openMarketForm()` sem alterações;
- um produto escolhido no comparador é criado no mesmo `appState.market` e com o mesmo schema existente;
- os preços apresentados no comparador são valores de demonstração, identificados na UI;
- os valores de demonstração **não são persistidos**: o novo item é criado com `estimatedCents: 0`;
- não foram adicionados `fetch`, APIs externas, scraping ou alterações à CSP.

### Distribuição e testes

- build pública atualizada de v50 para v51;
- `market-experience.css` e `market-experience.js` adicionados a `index.html`;
- Service Worker atualizado para cache `conta-de-casa-public-v51`;
- os novos assets foram adicionados à allowlist de `scripts/prepare-pages.cjs`;
- criado `tests/market-experience.test.cjs` para wiring, cache, segurança dos dados de demonstração, breakpoints, safe areas, tamanhos tipográficos e ausência de pedidos externos;
- CI passa a executar `node --check market-experience.js` e o novo teste.

### Segurança e dados

Sem alteração de schema, cálculos financeiros, IndexedDB, PBKDF2, AES-GCM, PIN/palavra-passe, backups, sincronização ou dados existentes.

A integração de preços reais fica deliberadamente separada até existir uma fonte verificada para os três mercados e uma arquitetura de backend/proxy adequada.

## 2026-09-04 — correção de corte do viewport mobile

### Problema

Em iPhone/Safari, páginas com conteúdo longo podiam apresentar um corte horizontal do conteúdo e uma grande área vazia antes da navegação inferior. A evidência foi observada na Lista de compras, onde o segundo item ficava parcialmente visível apesar de estar corretamente renderizado.

### Causa

O contentor permanente da aplicação estava limitado por uma variável CSS (`--visual-vh`) alimentada por `window.visualViewport.height`. Essa medida é adequada para acompanhar teclado e viewport visual transitório, mas é instável como dimensão estrutural de todo o shell da aplicação em Safari móvel.

### Alterações

- adicionado `mobile-layout.css` como última camada CSS;
- `.app-shell` e `.main` passam a seguir `100dvh`/`100svh` no mobile;
- mantida a utilização de VisualViewport para diálogos e deteção do teclado;
- reforçado cabeçalho sticky no contentor de scroll mobile;
- cartões de Compras compactados entre 360 px e 560 px;
- `mobile-layout.css` adicionado à allowlist de GitHub Pages e Service Worker;
- criado teste de regressão `tests/mobile-layout-regression.test.cjs`;
- CI e workflow de Pages passam a executar o novo teste.

### Segurança e dados

Sem alteração de schema, cálculos financeiros, IndexedDB, PBKDF2, AES-GCM, PIN/palavra-passe, backups ou sincronização.
