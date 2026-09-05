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
- `market-barcode.css`: camada isolada do botão de leitura, estado e overlay de câmara do scanner de produtos.
- `ui-icons.css`: normalização de geometria, dimensões e movimento dos ícones de interface.
- `invoice-capture.css`: interface responsiva e overlay do leitor QR de faturas.

Ordem CSS pública:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`
4. `market-experience.css`
5. `market-barcode.css`
6. `ui-icons.css`
7. `invoice-capture.css`

### JavaScript

- `core.js`: estado, utilitários, cifragem e persistência.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub.
- `ui-icons.js`: registo vetorial comum e normalização de ícones estáticos/dinâmicos.
- `events.js`: eventos, navegação, viewport e interação.
- `market-experience.js`: pesquisa de preços externos e criação de itens a partir dos resultados.
- `market-barcode.js`: leitura da câmara, validação GTIN, identificação de produto e passagem controlada para a pesquisa existente.
- `invoice-capture.js`: leitura local do Código QR de faturação pela câmara/imagem e preenchimento assistido da nova fatura.

## Sistema de ícones

`core.js` continua a fornecer o contrato histórico `ICONS`/`icon()`. `ui-icons.js` estende esse registo e substitui o renderer por uma implementação única, mantendo a API usada pela navegação e pelos componentes existentes.

Princípios:

- SVG local, sem fonte remota de ícones e sem dependência de emoji/glifos do sistema operativo;
- `viewBox 0 0 24 24`, `currentColor`, `stroke-width 1.8`, `stroke-linecap` e `stroke-linejoin` arredondados;
- dimensões explícitas de 16/20/24/28 px através de `ui-icons.css`;
- ícones decorativos permanecem `aria-hidden`; o nome acessível continua no botão/controlo;
- um `MutationObserver` limitado a hidratação visual normaliza componentes criados dinamicamente sem alterar o seu comportamento;
- a regra específica de `.market-browser-search > .ui-icon-svg` sobrepõe o `svg { height:auto }` legado, eliminando a dimensão automática que podia cortar/deformar a lupa em Safari/iOS;
- animação só comunica estado. `prefers-reduced-motion` remove animações não essenciais.

A auditoria detalhada está em `docs/UI_ICON_AUDIT.md`.

## Faturas — captura QR assistida

A captura foi adicionada como camada progressiva sobre o formulário existente; `forms.js` e `normalizeBill()` não foram reestruturados.

Fluxo:

1. Ao abrir **Nova fatura**, `invoice-capture.js` injeta um bloco **Ler dados da fatura** antes dos campos existentes.
2. O utilizador escolhe **Ler QR com câmara** ou **Ler imagem da fatura**.
3. A leitura usa `BrowserQRCodeReader` do mesmo `@zxing/browser@0.2.0` já autorizado para o scanner do Mercado.
4. O payload é interpretado de acordo com o formato QR de faturação da Autoridade Tributária.
5. É exigida uma combinação mínima coerente: NIF do emitente, data do documento, identificação única e total.
6. A aplicação apresenta os dados numa pré-visualização; não escreve imediatamente no formulário.
7. Apenas **Preencher campos** transfere valores compatíveis para campos que ainda estejam vazios.
8. O utilizador continua a confirmar fornecedor, categoria, vencimento e método antes de guardar a fatura com o fluxo normal de `handleBillSubmit()`.

### Campos QR utilizados

- `A`: NIF do emitente;
- `B`: NIF do adquirente, quando existe;
- `D`: tipo de documento;
- `E`: estado do documento;
- `F`: data do documento no formato `YYYYMMDD`;
- `G`: identificação única do documento;
- `H`: ATCUD;
- `N`: total de impostos;
- `O`: total do documento com impostos;
- `Q`: fragmento do hash;
- `R`: número do certificado.

O QR fiscal não é usado para inferir dados que ele não prova. Em particular, a implementação não assume que contém o nome comercial do fornecedor nem o vencimento do pagamento. Quando o nome não existe, o campo de fornecedor recebe apenas `NIF <emitente>` para revisão humana.

### Privacidade da fatura

- a câmara não grava vídeo/fotogramas;
- uma imagem selecionada é limitada a 15 MB e processada através de um `blob:` local temporário;
- o `ObjectURL` é sempre revogado;
- `invoice-capture.js` não chama `fetch`, `XMLHttpRequest`, armazenamento local, IndexedDB, `commit()` ou `saveState()`;
- ficheiros e imagens não entram em `appState.attachments` e não são sincronizados;
- PDFs/OCR geral não fazem parte deste fluxo porque a leitura probabilística de texto financeiro exigiria uma camada adicional de validação e segurança.

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

Dependência runtime: `@zxing/browser@0.2.0/umd/zxing-browser.min.js`, carregada de `https://unpkg.com` apenas quando um leitor precisa da câmara/imagem.

A origem e versão ficam centralmente declaradas em `index.html` para o leitor de faturas e continuam fixas no scanner do Mercado. Se a dependência mudar de versão, a alteração deve passar por revisão de compatibilidade, segurança, tamanho e comportamento de câmara.

## Política de veracidade dos preços e documentos

- nunca usar dados de demonstração como se fossem reais;
- não apresentar um preço observado antigo como “atual”;
- ausência de fonte verificável resulta em estado “sem preço verificado”, não em fallback fictício;
- identificação por código de barras nunca é tratada como confirmação de preço;
- preço externo é sempre uma estimativa até o utilizador confirmar o valor efetivamente pago;
- leitura de QR de fatura preenche apenas campos explicitamente representados no payload fiscal e exige confirmação antes de guardar.

## Segurança de conteúdo remoto

- nenhuma API key ou segredo é necessário para as integrações atuais;
- CSP `script-src` restringe scripts a `self` e `https://unpkg.com`;
- CSP `connect-src` restringe chamadas a `self`, GitHub API, `cesta.pt` e `world.openfoodfacts.org`;
- `media-src` permite apenas `self` e `blob:`;
- strings remotas são normalizadas e limitadas antes de serem reutilizadas; resultados de preço continuam escapados antes de entrar no DOM;
- URLs remotas do cesta.pt passam por allowlist de domínio e protocolo;
- pedidos do scanner ao Open Food Facts usam `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, timeout e abort;
- pedidos de preço têm timeout e podem ser abortados quando a pesquisa muda;
- a captura de faturas não adiciona qualquer endpoint de dados: câmara e imagem são processadas localmente;
- falha de uma fonte não deve criar produto/preço/documento fictício nem destruir resultados válidos de outra fonte.

## Privacidade

Os dados financeiros e o cofre continuam locais/cifrados. Existem duas exceções explícitas e minimizadas no Mercado:

- pesquisa manual: o termo pesquisado é enviado a `cesta.pt` para obter preços;
- leitura por câmara: o vídeo fica local; o GTIN lido é enviado ao Open Food Facts para identificação e o termo derivado do produto é depois enviado a `cesta.pt` para pesquisa de preços.

A leitura QR de faturas é ainda mais restritiva: imagem e payload ficam no cliente e só os campos confirmados pelo utilizador entram no formulário normal. Não são enviados PIN, palavra-passe, conteúdo do cofre, faturas, saldo, orçamento ou outros dados financeiros.

## Viewport e navegação mobile

O shell permanente usa `100dvh`/`100svh`. `VisualViewport` permanece limitado a comportamento transitório de teclado/diálogos. O diálogo do Mercado ocupa o viewport móvel, respeita `safe-area-inset-top` e `safe-area-inset-bottom` e usa scroll interno.

Os dois scanners usam overlays próprios com safe areas em mobile. As linhas de leitura são desativadas quando `prefers-reduced-motion: reduce` está ativo.

## Distribuição

`scripts/prepare-pages.cjs` gera `dist/` através de allowlist de assets públicos. `market-barcode.*`, `ui-icons.*` e `invoice-capture.*` fazem parte dessa allowlist e do conjunto de assets do Service Worker.

O Service Worker só interceta recursos do mesmo origin incluídos na allowlist. A biblioteca ZXing e as consultas Open Food Facts/cesta.pt continuam externas e não são adicionadas ao cache offline da aplicação.

## Testes

- `tests/market-barcode.test.cjs`: wiring, CSP, GTIN/checksum, lifecycle da câmara, privacidade e passagem para pesquisa real;
- `tests/ui-icons.test.cjs`: registo comum, ausência de dependência externa, sizing explícito da lupa/Safari e política de movimento reduzido;
- `tests/invoice-capture.test.cjs`: parser do QR fiscal, exemplo técnico, validação de datas/valores, privacidade, lifecycle e responsividade.

CI executa `node --check` nos módulos e os testes dedicados. O workflow de Pages repete essas verificações antes da preparação de `dist/`.

## Regra de manutenção

Qualquer alteração futura às fontes de preços ou identificação deve ser auditada quanto a: origem, território, CORS, termos de utilização, privacidade, atualização, evidência/prova, erros parciais e possibilidade de alteração silenciosa do formato de resposta.

Qualquer alteração aos scanners deve ser validada em dispositivos físicos porque permissões, autofocus, lente traseira e lanterna dependem do hardware/browser e não podem ser considerados confirmados apenas por testes unitários.

Novas fontes de ícones devem ser integradas no registo local; não devem ser introduzidos glifos Unicode, emojis ou CDNs de icon fonts sem decisão arquitetural explícita.

## Quantidades e preços unitários

`estimatedCents` e `actualCents` continuam campos inteiros em cêntimos e são tratados como preços por unidade. `quantity` permanece compatível com o schema existente e aceita até três casas decimais; `marketLineCents()` calcula o subtotal monetário com arredondamento seguro. Resumos, relatórios e orçamento utilizam o subtotal, não apenas o preço unitário.
