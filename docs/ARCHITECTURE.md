# Arquitetura — Conta de Casa

## Visão geral

Aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A aplicação é local-first e executa no cliente as regras de negócio, renderização, formulários, persistência cifrada e sincronização opcional.

## Camadas principais

### Interface

- `index.html`: estrutura semântica, CSP, navegação, páginas e diálogos.
- `styles.css`: estilos base/legados.
- `design-system.css`: tokens e componentes visuais principais.
- `mobile-layout.css`: compatibilidade e estabilidade do viewport móvel.
- `market-experience.css`: camada contextual da página Mercado e do diálogo `market-browser`.
- `market-barcode.css`: camada isolada do botão de leitura, estado e overlay de câmara do scanner.

Ordem CSS pública:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`
4. `market-experience.css`
5. `market-barcode.css`

### JavaScript

- `core.js`: estado, utilitários, cifragem e persistência.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub.
- `events.js`: eventos, navegação, viewport e interação.
- `market-experience.js`: pesquisa de preços externos e criação de itens a partir dos resultados.
- `market-barcode.js`: leitura da câmara, validação GTIN, identificação de produto e passagem controlada para a pesquisa existente.

## Mercado v53 — fluxo de pesquisa

1. O utilizador abre **Adicionar produto**.
2. O campo inicia vazio; não existem resultados ou preços pré-carregados.
3. A partir de 2 caracteres, a pesquisa é debounced e cancela a pesquisa anterior quando o texto muda.
4. Só são consultadas as fontes correspondentes aos mercados selecionados.
5. Resultados remotos são normalizados para um modelo transitório de UI e não são armazenados automaticamente.
6. Ao pressionar `+`, é criado um item através do mesmo array `appState.market` já existente.
7. O preço consultado entra como `estimatedCents`; `actualCents` permanece `0` até confirmação do utilizador.
8. A edição posterior continua no formulário `openMarketForm()` existente.

O schema de `normalizeMarketItem()` não foi alterado.

## Scanner de código de barras

O scanner é deliberadamente separado do motor de preços. Um código de barras identifica um produto; não contém nem determina o preço praticado por uma cadeia.

Fluxo:

1. `market-barcode.js` deteta a abertura de `market-browser` e injeta um botão de câmara na caixa de pesquisa sem modificar `market-experience.js`.
2. O clique abre uma camada visual dentro do diálogo e solicita vídeo com `facingMode: environment`.
3. O leitor é `@zxing/browser` `0.2.0`, carregado sob pedido a partir de uma URL com versão fixa; a app não carrega a biblioteca antes de o utilizador pedir a leitura.
4. O resultado é reduzido a dígitos e só são aceites GTIN-8, UPC/GTIN-12, EAN/GTIN-13 e GTIN-14 com checksum válido.
5. O GTIN é consultado no Open Food Facts v2 para obter apenas identificação básica: código, nome, nome PT, marca e quantidade.
6. A resposta é normalizada/limitada. Marca + nome formam um termo de pesquisa com máximo de 80 caracteres.
7. Esse termo é colocado em `#marketCatalogSearch` e é emitido um evento `input` normal. A partir daí, todo o comportamento volta a ser responsabilidade do fluxo de `market-experience.js`.
8. A criação do item continua dependente do clique explícito no botão `+` de um resultado real do Mercado.

O scanner não acede a `appState`, IndexedDB, PIN, cofre, backups ou sincronização. A única superfície partilhada com o Mercado é o campo de pesquisa já existente.

### Ciclo de vida da câmara

- a câmara só inicia após gesto explícito do utilizador;
- áudio é sempre desativado;
- a app tenta preferir a câmara traseira;
- `scannerControls.stop()` e todas as `MediaStreamTrack.stop()` são executadas ao concluir, cancelar, fechar o diálogo, ocultar a página ou abandonar a página;
- a lanterna só aparece quando o controlo ZXing a disponibiliza;
- nenhum frame, vídeo ou imagem é persistido ou enviado.

## Fontes externas

### Continente / Pingo Doce — cesta.pt

Endpoint utilizado: `https://cesta.pt/mcp`.

A integração usa MCP sobre HTTP/SSE:

- `initialize`;
- `notifications/initialized`;
- `tools/call` com a ferramenta `search_products`.

A resposta é textual e é convertida para campos internos: cadeia, nome, embalagem, preço, promoção, preço por unidade, pid e URL oficial. A URL só é exposta se o host pertencer à allowlist `continente.pt` ou `pingodoce.pt` e usar HTTPS.

A integração não utiliza criação de carrinhos, autenticação nem credenciais de retalhistas.

### Identificação GTIN — Open Food Facts

Endpoint utilizado pelo scanner: `https://world.openfoodfacts.org/api/v2/product/{gtin}.json` com seleção explícita de campos.

Esta fonte não é usada como fonte de preço. Serve apenas para traduzir um GTIN lido pela câmara em informação textual útil para a pesquisa do Mercado. O conteúdo é comunitário e pode estar incompleto; ausência de produto resulta em mensagem de identificação indisponível e manutenção da pesquisa manual.

### Leitor — ZXing Browser

Dependência runtime: `@zxing/browser@0.2.0/umd/zxing-browser.min.js`, carregada de `https://unpkg.com` apenas ao abrir o scanner.

A versão é fixa para evitar alteração silenciosa por uma tag `latest`. Se a dependência mudar de versão, a alteração deve passar por revisão de compatibilidade, segurança, tamanho e comportamento de câmara.

## Política de veracidade dos preços

- nunca usar dados de demonstração como se fossem reais;
- não apresentar um preço observado antigo como “atual”;
- ausência de fonte verificável resulta em estado “sem preço verificado”, não em fallback fictício;
- identificação por código de barras nunca é tratada como confirmação de preço;
- preço externo é sempre uma estimativa até o utilizador confirmar o valor efetivamente pago.

## Segurança de conteúdo remoto

- nenhuma API key ou segredo é necessário para as integrações atuais;
- CSP `script-src` restringe scripts a `self` e `https://unpkg.com`;
- CSP `connect-src` restringe chamadas a `self`, GitHub API, `cesta.pt` e `world.openfoodfacts.org`;
- `media-src` permite apenas `self` e `blob:`;
- strings remotas são normalizadas e limitadas antes de serem reutilizadas; resultados de preço continuam escapados antes de entrar no DOM;
- URLs remotas do cesta.pt passam por allowlist de domínio e protocolo;
- pedidos do scanner ao Open Food Facts usam `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, timeout e abort;
- pedidos de preço têm timeout e podem ser abortados quando a pesquisa muda;
- falha de uma fonte não deve criar produto/preço fictício nem destruir resultados válidos de outra fonte.

## Privacidade

Os dados financeiros e o cofre continuam locais/cifrados. Existem duas exceções explícitas e minimizadas no Mercado:

- pesquisa manual: o termo pesquisado é enviado a `cesta.pt` para obter preços;
- leitura por câmara: o vídeo fica local; o GTIN lido é enviado ao Open Food Facts para identificação e o termo derivado do produto é depois enviado a `cesta.pt` para pesquisa de preços.

Não são enviados PIN, palavra-passe, conteúdo do cofre, faturas, saldo, orçamento ou outros dados financeiros.

## Viewport e navegação mobile

O shell permanente usa `100dvh`/`100svh`. `VisualViewport` permanece limitado a comportamento transitório de teclado/diálogos. O diálogo do Mercado ocupa o viewport móvel, respeita `safe-area-inset-top` e `safe-area-inset-bottom` e usa scroll interno.

O scanner usa overlay próprio com safe areas em mobile. A animação da linha de leitura é desativada quando `prefers-reduced-motion: reduce` está ativo.

## Distribuição

`scripts/prepare-pages.cjs` gera `dist/` através de allowlist de assets públicos. `market-barcode.css` e `market-barcode.js` fazem parte dessa allowlist e do conjunto de assets do Service Worker.

O Service Worker só interceta recursos do mesmo origin incluídos na allowlist. A biblioteca ZXing e as consultas Open Food Facts/cesta.pt continuam externas e não são adicionadas ao cache offline da aplicação.

## Testes

`tests/market-barcode.test.cjs` valida wiring, CSP, allowlists de distribuição, câmara traseira, origem/versão das dependências, GTIN/checksum, encerramento de tracks, ausência de persistência direta, handoff para a pesquisa e requisitos responsivos/acessíveis básicos.

CI executa `node --check market-barcode.js` e o teste específico. O workflow de Pages repete essas verificações antes da preparação de `dist/`.

## Regra de manutenção

Qualquer alteração futura às fontes de preços ou identificação deve ser auditada quanto a: origem, território, CORS, termos de utilização, privacidade, atualização, evidência/prova, erros parciais e possibilidade de alteração silenciosa do formato de resposta.

Qualquer alteração ao scanner deve ser validada em dispositivos físicos porque permissões, autofocus, lente traseira e lanterna dependem do hardware/browser e não podem ser considerados confirmados apenas por testes unitários.

## Quantidades e preços unitários

`estimatedCents` e `actualCents` continuam campos inteiros em cêntimos e são tratados como preços por unidade. `quantity` permanece compatível com o schema existente e aceita até três casas decimais; `marketLineCents()` calcula o subtotal monetário com arredondamento seguro. Resumos, relatórios e orçamento utilizam o subtotal, não apenas o preço unitário.
