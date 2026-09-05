# Arquitetura — Conta de Casa

## Visão geral

Aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A aplicação é local-first: regras de negócio, renderização, formulários, persistência cifrada e sincronização opcional executam no cliente.

## Camadas principais

### Interface

- `index.html`: estrutura semântica, CSP, navegação, páginas e diálogos.
- `styles.css`: estilos base/legados.
- `design-system.css`: tokens e componentes visuais principais.
- `mobile-layout.css`: compatibilidade e estabilidade do viewport móvel.
- `market-experience.css`: página Mercado e diálogo `market-browser`.
- `market-barcode.css`: scanner EAN/UPC/GTIN.
- `ui-icons.css`: última camada visual de ícones, normalização de controlos e hierarquia aprovada do protótipo mobile.
- `invoice-capture.css`: interface e overlay do leitor QR de faturas.

Ordem CSS pública:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`
4. `market-experience.css`
5. `market-barcode.css`
6. `ui-icons.css`
7. `invoice-capture.css`

### JavaScript

- `core.js`: estado, utilitários, cifragem, persistência e contrato histórico `ICONS`/`icon()`.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub.
- `ui-icons.js`: subset local Lucide, adaptação ao contrato existente e hidratação visual de controlos estáticos/dinâmicos.
- `events.js`: eventos, navegação, viewport e interação.
- `market-experience.js`: pesquisa de preços e criação de itens a partir de resultados confirmados.
- `market-barcode.js`: leitura GTIN, identificação de produto e handoff para a pesquisa do Mercado.
- `invoice-capture.js`: leitura local do QR de faturação e preenchimento assistido da nova fatura.

## Hierarquia visual aprovada — Lista de compras v55

A captura física em iPhone e o protótipo aprovado passam a definir a composição mobile da página **Lista de compras**. A revisão não altera o DOM estrutural principal nem `renderMarket()`; usa a camada final `ui-icons.css` para ajustar composição e linguagem visual.

Hierarquia:

1. **Cabeçalho** — menu, ícone de carrinho + título, ação principal `+`, mês e estado Sync.
2. **Pesquisa** — campo com lupa Lucide e ação secundária visual de scanner no lado direito.
3. **Filtros** — limpeza de filtros como ação neutra, mantendo os controlos existentes e a sua semântica.
4. **Resumo financeiro** — quatro cartões em grelha 2×2 no mobile, cada um com ícone semântico, rótulo, valor e explicação.
5. **Lista do mês** — contagem, estado, identidade do produto, quantidade e valores financeiros.
6. **Ações de item** — editar/eliminar continuam disponíveis, mas passam a formato iconográfico compacto em mobile.
7. **Navegação inferior** — quatro destinos principais com métrica Lucide uniforme e sublinhado no destino ativo.

O controlo secundário ao lado da pesquisa continua a ser `#newMarketBtn` e mantém o fluxo de adicionar/pesquisar produto existente. A alteração para aparência de scanner é de apresentação, evitando alterar eventos ou persistência.

### Fotografias de produtos

O schema `normalizeMarketItem()` não possui campo de imagem. Por isso, a interface não inventa fotografias nem persiste imagens obtidas de fontes externas. Os cartões usam um avatar vetorial neutro até existir uma decisão explícita de dados, privacidade, origem, cache e sincronização para imagens de produto.

### Preço real em itens pendentes

O campo `actualCents` continua existente no modelo, mas em mobile o controlo de introdução de preço real fica oculto enquanto o item ainda está por comprar. Quando o item é marcado como comprado, o controlo volta a ficar disponível. Isto reduz ruído visual sem alterar a regra financeira.

## Cofre de acesso — apresentação v56

O ecrã `#vaultScreen` continua a usar a estrutura existente em `index.html`, os eventos de `events.js` e o modelo criptográfico de `core.js`. A v56 é uma camada estritamente visual aplicada no final de `ui-icons.css`, para sobrepor as regras mobile v45 sem reestruturar autenticação.

Princípios:

- `100svh`/`100dvh` e `env(safe-area-inset-*)` para iPhone/Safari;
- cartão responsivo máximo de 500 px e teclado centrado;
- teclas circulares com 70 px no desktop e 58 px no mobile comum, preservando alvos tácteis adequados;
- campo `#unlockPassphrase` real permanece o único input de credencial;
- `wireVaultPinPad()` continua responsável por modo PIN versus palavra-passe;
- nenhum botão de passkey/biometria é apresentado enquanto não existir implementação WebAuthn/biométrica real;
- sem novas fontes, endpoints, armazenamento, scripts externos ou alterações à CSP;
- tema escuro e redução de movimento são tratados na mesma camada visual.

## Sistema visual de ícones — Lucide

### Biblioteca oficial

A linguagem visual oficial é **Lucide Icons**. O projeto não instala uma icon font e não carrega Lucide por CDN. É mantido apenas um subset de geometria SVG em `ui-icons.js`.

Snapshot auditável usado como referência:

`94e4cb9d9db5907053ebf3636a97c45529cf776b`

O aviso de licença é distribuído em `LUCIDE_LICENSE.txt`:

- ISC — Lucide Icons and Contributors;
- MIT — aviso aplicável aos glifos derivados de Feather.

### Contrato e compatibilidade

`core.js` continua a disponibilizar `ICONS` e `icon()`. `ui-icons.js` executa depois de `sync.js` e antes dos módulos de interação/contexto, faz `Object.assign(ICONS, LUCIDE_ICONS)` e substitui o renderer mantendo a mesma API. Assim, `PAGE_META`, navegação, Mercado, faturas e módulos já existentes não precisam de ser reestruturados.

Todos os SVG funcionais usam como referência visual:

- `viewBox="0 0 24 24"`;
- `currentColor`;
- traço de 2 px;
- `stroke-linecap="round"` e `stroke-linejoin="round"`;
- caixas CSS explícitas de 16/20/24/28 px;
- `vector-effect: non-scaling-stroke` nas superfícies de interface.

Ícones decorativos são `aria-hidden`. A designação acessível continua no texto ou `aria-label` do controlo.

### Auditoria global de origens de ícones

Foram identificadas quatro origens históricas:

1. `ICONS` / `icon()` em `core.js`;
2. subset Lucide e hidratação em `ui-icons.js`;
3. SVG locais em módulos contextuais como Mercado, scanner e captura de faturas;
4. glifos Unicode/fallbacks estáticos e decoração nativa do browser.

A fonte visual oficial continua a ser Lucide. Na v55, SVG contextuais antigos recebem por CSS a mesma métrica de traço, terminais e rendering. A migração física desses pequenos geradores para `CDCIcons.markup` fica separada da revisão visual para evitar uma refatoração estrutural simultânea.

### Hidratação de controlos

Um `MutationObserver` é utilizado apenas como camada de apresentação para elementos que a aplicação cria dinamicamente. Não altera dados nem eventos de negócio.

A hidratação normaliza:

- marca e navegação;
- menu, fechar, tema, privacidade e bloqueio;
- adicionar, editar, eliminar, duplicar, pagar e filtros;
- pesquisa e selects;
- notificações e sincronização;
- Mercado, câmara, QR e lanterna;
- botões dinâmicos dos detalhes de faturas/pagamentos.

### Pesquisa no Safari/iOS

A aplicação não depende da decoração nativa de `input[type="search"]`. `ui-icons.css` remove `::-webkit-search-decoration`, acrescenta uma lupa Lucide posicionada dentro do contentor e aplica padding reservado. O `market-browser` mantém também uma caixa fixa de 22 × 22 px.

### Selects

Os `select` são envolvidos por `.ui-select-control`. A seta nativa é desativada com `appearance:none` e é apresentado um único `ChevronDown` Lucide. O elemento `select` real permanece intacto, preservando foco, teclado, acessibilidade e comportamento nativo do menu de opções.

### Botões compactos de criação

O CSS legado desenhava `+` através de `::before`. A camada Lucide apresenta um `Plus` real e, quando o botão tem `data-ui-iconized="true"`, o pseudo-elemento antigo é desativado. No topo mobile o `+` principal continua a representar criação. No Mercado, o botão secundário junto da pesquisa usa uma máscara vetorial Lucide `Scan` para distinguir pesquisa/leitura da ação principal.

### Sincronização

O antigo ponto colorido de `#syncHeaderStatus` é reutilizado como slot de 18 px e mostra estado semântico:

- cloud/check: sincronizado;
- refresh: sincronização em curso;
- cloud-off: offline;
- warning: conflito/revisão/erro;
- cloud: ligação ainda sem estado final.

Na hierarquia v55 o chip recebe também um chevron discreto para comunicar que é interativo. A rotação do refresh é removida quando `prefers-reduced-motion: reduce` está ativo.

## Faturas — captura QR assistida

A captura QR continua como camada progressiva sobre **Nova fatura**. O schema e `handleBillSubmit()` não foram alterados.

Fluxo:

1. `invoice-capture.js` disponibiliza **Ler QR com câmara** ou **Ler imagem da fatura**.
2. `BrowserQRCodeReader` do `@zxing/browser@0.2.0` descodifica localmente.
3. O payload fiscal é validado e interpretado.
4. É apresentada uma pré-visualização.
5. Apenas **Preencher campos** transfere valores comprováveis para campos compatíveis.
6. O utilizador continua a confirmar fornecedor, categoria, vencimento e método antes de guardar.

Campos estruturados utilizados incluem NIF do emitente, tipo/estado, data e identificação do documento, ATCUD, impostos e total. A imagem não é persistida nem enviada. PDFs/OCR geral continuam fora deste fluxo.

## Mercado e scanner GTIN

O fluxo Mercado continua separado em três responsabilidades:

1. `market-barcode.js` lê EAN/UPC/GTIN localmente;
2. Open Food Facts identifica nome/marca quando disponíveis;
3. `market-experience.js` consulta preços de Pingo Doce e Continente através de `cesta.pt`.

O scanner não escreve diretamente em `appState.market` e um código não é tratado como prova de preço. A criação exige confirmação explícita de um resultado.

`estimatedCents` e `actualCents` continuam inteiros em cêntimos e representam preço por unidade. `marketLineCents()` calcula quantidade × preço unitário com arredondamento seguro.

## Segurança e privacidade

- dados financeiros permanecem cifrados/local-first;
- PBKDF2, AES-GCM, PIN, IndexedDB, backups e sincronização não são alterados pela revisão visual;
- Lucide não adiciona qualquer origem externa à CSP;
- a v55 não adiciona endpoints, fontes, imagens remotas nem novas dependências;
- `LUCIDE_LICENSE.txt` é um asset estático sem código executável;
- o scanner de produtos envia apenas GTIN ao Open Food Facts e termos de pesquisa ao `cesta.pt`;
- a captura de faturas não adiciona endpoint: vídeo, imagem e payload QR permanecem locais;
- conteúdo remoto continua normalizado/escapado antes de apresentação.

## Viewport e acessibilidade

O shell mobile usa `100dvh`/`100svh`; `VisualViewport` permanece limitado a teclado/diálogos. Safe areas são mantidas nos leitores de câmara.

Alvos tácteis não são reduzidos pela mudança de ícones. Ícones visualmente compactos continuam dentro de controlos com dimensão mínima adequada. `prefers-reduced-motion` desativa animações não essenciais.

## Distribuição

`scripts/prepare-pages.cjs` gera `dist/` por allowlist. O bundle público inclui `ui-icons.js`, `ui-icons.css`, `invoice-capture.*`, scanners existentes e `LUCIDE_LICENSE.txt`.

O Service Worker usa cache `conta-de-casa-public-v55-prototype` para invalidar as camadas visuais anteriores no Safari/iOS. Só recursos da allowlist e do mesmo origin são armazenados offline; Lucide não é solicitado externamente em runtime.

## Testes

- `tests/ui-icons.test.cjs`: snapshot Lucide, licença, conjunto semântico, ausência de CDN/runtime externo, pesquisa Safari, selects, prevenção de `+` duplicado, Sync, hierarquia do protótipo, cartões-resumo, lista mobile e redução de movimento;
- `tests/invoice-capture.test.cjs`: parser QR fiscal, privacidade, lifecycle e responsividade;
- `tests/market-barcode.test.cjs`: GTIN/checksum, câmara, privacidade e handoff para pesquisa;
- suites existentes continuam a validar finanças, segurança, responsividade, navegação, acessibilidade e sincronização.

## Regras de manutenção

- novos ícones funcionais devem vir do mesmo subset Lucide ou ser justificados por decisão arquitetural;
- não introduzir emojis, glifos Unicode ou icon fonts externas como solução visual principal;
- qualquer atualização de Lucide deve fixar novo commit de origem, rever licença e executar a suite completa;
- não adicionar fotografias de produtos ao schema sem decisão própria de origem, armazenamento, privacidade, cache e sincronização;
- alterações a scanners e controlos nativos devem continuar a ser validadas em iPhone/Safari e Android/Chrome físicos.
