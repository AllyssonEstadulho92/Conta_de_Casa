# Changelog Técnico — Conta de Casa

## 2026-09-05 — Auditoria global de ícones e leitura QR de faturas

### Ícones e consistência visual

- criada a camada `ui-icons.js` com um registo SVG local e único para os ícones funcionais da aplicação;
- criada `ui-icons.css` para normalizar largura, altura, alinhamento, espessura e comportamento dos SVGs em iOS, Android e desktop;
- corrigida especificamente a superfície que permitia o ícone de pesquisa aparecer cortado em Safari/iPhone, sobrepondo a regra global legada `svg { height:auto }` com dimensões explícitas para ícones de interface;
- elementos legados baseados em glifos Unicode passam a ser substituídos em runtime por ícones vetoriais consistentes, incluindo casa, privacidade, bloqueio, tema, fecho, expansão, atalhos e ações principais;
- navegação, Mercado, leitor de código de barras, diálogos e ações rápidas passam a partilhar a mesma linguagem visual;
- estatísticas, gráficos e barras de progresso foram preservados como componentes de dados;
- animação adicionada apenas a estados úteis: sincronização ativa, badge de alerta, expansão e linhas de leitura; `prefers-reduced-motion` desativa movimento não essencial;
- não foi adicionada fonte/CDN externa de ícones: a solução continua local, offline e sem nova superfície de tracking.

### Faturas

- criado `invoice-capture.js` para leitura do Código QR português de faturação diretamente pela câmara ou por uma imagem selecionada pelo utilizador;
- parser baseado nos campos técnicos definidos pela Autoridade Tributária: NIF do emitente, tipo/estado do documento, data, identificação do documento, ATCUD, impostos e total;
- leitura da imagem acontece localmente; a imagem não é persistida, não entra no cofre e não é enviada para serviços externos;
- o ficheiro selecionado é limitado a imagem e a 15 MB e o `ObjectURL` temporário é revogado após a leitura;
- a câmara usa a lente traseira preferencialmente, sem áudio, com encerramento das tracks ao concluir, cancelar, ocultar ou abandonar a página;
- após leitura válida é apresentada uma pré-visualização e só um clique explícito em **Preencher campos** transfere dados compatíveis para a nova fatura;
- são preenchidos apenas campos comprováveis pelo QR: total, identificação/referência do documento, ATCUD e NIF do emitente; fornecedor comercial, categoria, vencimento e método continuam a exigir confirmação do utilizador;
- PDFs e OCR geral de faturas não foram introduzidos nesta revisão para evitar leitura probabilística de valores financeiros sem validação adequada;
- `invoice-capture.css` adiciona overlay responsivo, safe areas e estados de leitura sem alterar a estrutura dos formulários existentes.

### Segurança, testes e distribuição

- nenhuma alteração ao schema financeiro, IndexedDB, PBKDF2, AES-GCM, PIN/palavra-passe, backups ou sincronização;
- criados `tests/ui-icons.test.cjs` e `tests/invoice-capture.test.cjs`;
- CI passa a verificar sintaxe dos novos módulos e a executar os dois testes dedicados;
- workflow de Pages repete as verificações antes do deploy;
- os quatro novos assets foram adicionados à allowlist pública e ao Service Worker;
- auditoria detalhada registada em `docs/UI_ICON_AUDIT.md`.

## 2026-09-05 — Leitura de código de barras no Mercado

### Alterações

- adicionado botão de câmara ao campo **Pesquisar produto real** no fluxo **Adicionar produto**;
- criado `market-barcode.js` para leitura de EAN/UPC/GTIN, validação de checksum e ciclo de vida da câmara;
- criado `market-barcode.css` para overlay responsivo, moldura de leitura, estados, lanterna opcional, safe areas e redução de movimento;
- leitor baseado em `@zxing/browser@0.2.0`, carregado apenas quando o utilizador abre a câmara;
- identificação do código através de `world.openfoodfacts.org`, limitada a nome, marca e quantidade;
- produto identificado é transferido para o campo de pesquisa já existente, que continua a obter preços reais através de `cesta.pt` para Pingo Doce e Continente;
- o scanner não adiciona automaticamente o item e não altera `estimatedCents`, `actualCents`, quantidade ou schema diretamente;
- códigos GTIN-8, GTIN-12/UPC, GTIN-13/EAN e GTIN-14 só avançam quando o checksum é válido;
- câmara traseira é preferida; áudio desativado; tracks são terminadas ao concluir, cancelar, fechar, ocultar ou abandonar a página;
- CSP ampliada apenas para `unpkg.com` (script do leitor) e `world.openfoodfacts.org` (identificação), mantendo a allowlist existente de `cesta.pt` e GitHub;
- novos assets adicionados ao Service Worker e à allowlist de GitHub Pages;
- CI e verificação pré-deploy passam a executar `node --check market-barcode.js` e `tests/market-barcode.test.cjs`.

### Privacidade e veracidade

O vídeo da câmara é processado localmente e não é guardado nem enviado. Apenas o número do código de barras é enviado ao Open Food Facts para identificação. O preço continua separado da identificação e vem da pesquisa do Mercado; um código lido não é tratado como prova de preço.

### Compatibilidade preservada

Sem alteração do schema financeiro, IndexedDB, PBKDF2, AES-GCM, PIN/palavra-passe, backups, sincronização, edição dos itens existentes ou cálculo de quantidade × preço unitário.

## 2026-09-05 — Mercado v53: quantidade automática e dois mercados

- Mercadona removida da UI, runtime, CSP e pipeline de validação por ausência de uma fonte oficial portuguesa de catálogo/preços adequada;
- permanecem Pingo Doce e Continente;
- seletor dos mercados passa a mostrar identificação visual própria de cada marca;
- quantidade passa a multiplicar automaticamente o preço por unidade nos totais da lista;
- editor recebe controlos −/+ e subtotal automático;
- preços estimado e real são tratados como valores por unidade;
- resumos, orçamento e relatórios contabilizam quantidade × preço unitário;
- build/cache atualizados para v53.

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
