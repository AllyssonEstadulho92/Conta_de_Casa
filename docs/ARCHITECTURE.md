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
- `ui-icons.css`: última camada visual de ícones e normalização de pesquisas/selects.
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

## Sistema visual de ícones — Lucide

### Biblioteca oficial

A linguagem visual oficial passa a ser **Lucide Icons**. O projeto não instala uma icon font e não carrega Lucide por CDN. É mantido apenas um subset de geometria SVG em `ui-icons.js`.

Snapshot auditável usado como referência:

`94e4cb9d9db5907053ebf3636a97c45529cf776b`

O aviso de licença é distribuído em `LUCIDE_LICENSE.txt`:

- ISC — Lucide Icons and Contributors;
- MIT — aviso aplicável aos glifos derivados de Feather.

### Contrato e compatibilidade

`core.js` continua a disponibilizar `ICONS` e `icon()`. `ui-icons.js` executa depois de `sync.js` e antes dos módulos de interação/contexto, faz `Object.assign(ICONS, LUCIDE_ICONS)` e substitui o renderer mantendo a mesma API. Assim, `PAGE_META`, navegação, Mercado, faturas e módulos já existentes não precisam de ser reestruturados.

Todos os SVG funcionais usam:

- `viewBox="0 0 24 24"`;
- `currentColor`;
- traço de 2 px;
- `stroke-linecap="round"` e `stroke-linejoin="round"`;
- caixas CSS explícitas de 16/20/24/28 px;
- `vector-effect: non-scaling-stroke` nas superfícies de interface.

Ícones decorativos são `aria-hidden`. A designação acessível continua no texto ou `aria-label` do controlo.

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

Isto resolve a inconsistência observada na captura de iPhone e evita que `svg { height:auto }` ou a decoração nativa determinem a geometria do símbolo.

### Selects

Os `select` são envolvidos por `.ui-select-control`. A seta nativa é desativada com `appearance:none` e é apresentado um único `ChevronDown` Lucide. O elemento `select` real permanece intacto, preservando foco, teclado, acessibilidade e comportamento nativo do menu de opções.

### Botões compactos de criação

O CSS legado desenhava `+` através de `::before`. A camada Lucide apresenta um `Plus` real e, quando o botão tem `data-ui-iconized="true"`, o pseudo-elemento antigo é desativado. Em mobile, o rótulo visual pode ficar oculto, mas o texto/`aria-label` original continua a identificar a ação.

### Sincronização

O antigo ponto colorido de `#syncHeaderStatus` é reutilizado como slot de 18 px e passa a mostrar um estado semântico:

- cloud/check: sincronizado;
- refresh: sincronização em curso;
- cloud-off: offline;
- warning: conflito/revisão/erro;
- cloud: ligação ainda sem estado final.

A rotação do refresh é removida quando `prefers-reduced-motion: reduce` está ativo.

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
- `LUCIDE_LICENSE.txt` é um asset estático sem código executável;
- o scanner de produtos envia apenas GTIN ao Open Food Facts e termos de pesquisa ao `cesta.pt`;
- a captura de faturas não adiciona endpoint: vídeo, imagem e payload QR permanecem locais;
- conteúdo remoto continua normalizado/escapado antes de apresentação.

## Viewport e acessibilidade

O shell mobile usa `100dvh`/`100svh`; `VisualViewport` permanece limitado a teclado/diálogos. Safe areas são mantidas nos leitores de câmara.

Alvos tácteis não são reduzidos pela mudança de ícones. Ícones visualmente compactos continuam dentro de controlos com dimensão mínima adequada. `prefers-reduced-motion` desativa animações não essenciais.

## Distribuição

`scripts/prepare-pages.cjs` gera `dist/` por allowlist. O bundle público inclui `ui-icons.js`, `ui-icons.css`, `invoice-capture.*`, scanners existentes e `LUCIDE_LICENSE.txt`.

O Service Worker usa cache `conta-de-casa-public-v54-lucide` para invalidar a revisão visual anterior. Só recursos da allowlist e do mesmo origin são armazenados offline; Lucide não é solicitado externamente em runtime.

## Testes

- `tests/ui-icons.test.cjs`: snapshot Lucide, licença, conjunto semântico, ausência de CDN/runtime externo, pesquisa Safari, selects, `+` duplicado, sync e redução de movimento;
- `tests/invoice-capture.test.cjs`: parser QR fiscal, privacidade, lifecycle e responsividade;
- `tests/market-barcode.test.cjs`: GTIN/checksum, câmara, privacidade e handoff para pesquisa;
- suites existentes continuam a validar finanças, segurança, responsividade, navegação, acessibilidade e sincronização.

## Regras de manutenção

- novos ícones funcionais devem vir do mesmo subset Lucide ou ser justificados por decisão arquitetural;
- não introduzir emojis, glifos Unicode ou icon fonts externas como solução visual principal;
- qualquer atualização de Lucide deve fixar novo commit de origem, rever licença e executar a suite completa;
- alterações a scanners e controlos nativos devem continuar a ser validadas em iPhone/Safari e Android/Chrome físicos.
