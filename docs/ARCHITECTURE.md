# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público base: v62
Revisão atual: hotfix de layout móvel e conflitos técnicos do Mercado

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. As integrações externas do Mercado servem descoberta de catálogo, preço e identificação de produto; não recebem conteúdo financeiro do cofre.

## Camadas principais

### Estrutura e apresentação

- `index.html` — template semântico, CSP base, páginas, navegação e diálogos.
- `styles.css` / `design-system.css` — estilos base e design system.
- `mobile-layout.css` — compatibilidade de viewport/Safari e safe areas.
- `market-experience.css` — estrutura visual do Mercado.
- `market-brand.css` — camada final de identidade visual do módulo Compras/Mercado; remove fotografias/placeholders da apresentação e fixa explicitamente a colocação dos conteúdos dos cartões no Grid móvel.
- `market-barcode.css` — scanner GTIN/EAN/UPC.
- `ui-icons.css` — linguagem visual Lucide e overrides finais.
- `invoice-capture.css` — captura QR de faturas.
- `app-update.css` — Centro de Atualização.
- `market-image-audit.css` — camada histórica de imagens, mantida temporariamente por compatibilidade.

### JavaScript

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários.
- `finance.js` — cálculos financeiros.
- `render.js` — renderização de páginas/listas.
- `forms.js` — formulários e validação.
- `sync.js` — motor de sincronização cifrada opcional via GitHub.
- `sync-conflict-policy.js` — política complementar, sem persistência própria, que classifica `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` como metadados técnicos do Mercado para impedir revisões com `0 diferenças`.
- `events.js` — navegação, eventos, cofre e Service Worker.
- `market-experience.js` — catálogo/preço Pingo Doce e Continente via `cesta.pt` e criação confirmada de itens.
- `market-branding.js` — camada sem estado que alinha o texto do browser de produtos com a experiência text-first.
- `market-barcode.js` — leitura GTIN e identificação assistida; a câmara não é um campo de fotografia.
- `invoice-capture.js` — leitura local de QR fiscal.
- `ui-icons.js` — subset Lucide local.
- `app-update.js` — versão, notas de release e atualização do Service Worker.
- `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` — mecanismos visuais históricos v59–v62, mantidos nesta revisão para compatibilidade e potencial remoção posterior controlada.

## Modelo financeiro e segurança

O schema financeiro permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. O Mercado mantém `estimatedCents` separado de `actualCents`; quantidade permanece separada do preço unitário.

O cofre usa IndexedDB e envelope cifrado. O modelo continua baseado em PBKDF2-SHA-256 + AES-GCM. A revisão visual e a política de conflitos não alteram autenticação, derivação de chave, backups ou conteúdo cifrado enviado ao GitHub.

Metadados antigos de imagem (`productCode`, `imageUrl`, `imageSource`, `imageMatchedAt`) continuam tolerados pelo normalizador para não destruir dados existentes. A interface do Mercado não lhes reserva espaço visual e a sincronização deixa de os tratar como divergências que exijam decisão manual.

## Mercado — responsabilidades atuais

1. **Catálogo, preço e página do produto:** `market-experience.js` + `cesta.pt/mcp`.
2. **Código de barras:** `market-barcode.js`; identifica o artigo, não define preço.
3. **Persistência financeira:** fluxo existente de `market-experience.js`, apenas após ação explícita do utilizador.
4. **Apresentação e identidade:** `market-experience.css` + `market-brand.css`.
5. **Cópia contextual text-first:** `market-branding.js`.
6. **Compatibilidade histórica de imagens:** módulos v59–v62, sem prioridade visual na interface.

A informação principal de um produto permanece: **nome → embalagem/quantidade → loja → preço/estado**. A fotografia não é requisito de identificação na interface.

## Browser do Mercado — regra de layout móvel

A validação física em iPhone/Safari mostrou que ocultar visualmente a fotografia não é suficiente quando o DOM histórico ainda contém o respetivo nó. O Grid passa por isso a usar posições explícitas:

- `.market-product-copy` ocupa sempre a primeira coluna útil;
- `.market-add-product` ocupa sempre a coluna da ação;
- dentro de `.market-product-copy`, nome/loja/estado ficam à esquerda e o preço à direita quando existe largura suficiente;
- abaixo de 360 px, o preço reflui para baixo do conteúdo em vez de comprimir palavras letra a letra;
- `.market-result-chip`, preço e ligação da loja evitam quebras internas destrutivas.

Esta regra elimina a “coluna fantasma” deixada pelo antigo slot de fotografia e aproxima a experiência do protótipo aprovado sem alterar o motor do Mercado.

## Sincronização — política de conflitos técnicos

`sync.js` continua responsável por merge, histórico, upload cifrado e decisão de conflitos. `sync-conflict-policy.js` atua apenas sobre a vista de negócio usada por esse motor:

- para entidades diferentes de `market`, delega integralmente no comportamento original;
- para `market`, retira apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` antes da comparação de equivalência;
- o registo mais recente/mais completo continua a ser escolhido pelo motor existente;
- nome, categoria, quantidade, unidade, `estimatedCents`, `actualCents`, `purchased` e `purchasedAt` continuam a ser campos reais e podem exigir revisão.

O objetivo é impedir o estado incoerente “Conflito / 0 diferenças” sem automatizar qualquer decisão financeira.

## Identidade visual

O módulo adota uma linguagem coerente e contida:

- azul principal `#0b63e5` para ação e navegação ativa;
- texto principal em azul-marinho/ink;
- verde para gasto contabilizado/sucesso;
- âmbar para pendentes/por comprar;
- violeta para diferença neutra;
- superfícies claras, bordas discretas, raios de 18–20 px e sombras de baixa intensidade;
- tipografia com hierarquia forte, números tabulares e espaçamento consistente;
- navegação inferior com fundo translúcido e marcador ativo azul em mobile.

A camada usa as variáveis existentes (`--bg`, `--surface`, `--border`, `--text`, `--muted`) para continuar compatível com tema claro/escuro.

## Responsividade e acessibilidade

A estrutura mantém os breakpoints auditados:

- até 820 px: navegação móvel, cards em duas colunas e diálogo full-screen;
- até 430 px: densidade reduzida e ações de 48 px;
- abaixo de 360 px: reflow adicional do preço/conteúdo para impedir compressão e corte horizontal;
- desktop/tablet mantêm filtros e tabelas existentes.

Safe areas, `100dvh`/`100svh`, `prefers-reduced-motion`, foco visível e alvos tácteis existentes continuam ativos.

## Rede e privacidade

`market-branding.js` não faz `fetch`, não lê `appState` e não adiciona qualquer origem de rede. `sync-conflict-policy.js` também não faz rede, não lê credenciais e não escreve estado; apenas adapta a comparação técnica em memória antes do merge.

Os mecanismos de rede existentes permanecem inalterados. A remoção futura do pipeline histórico de imagens continua a ser uma mudança arquitetural separada, com revisão de CSP, Service Worker, testes e documentação.

## Distribuição

`scripts/prepare-pages.cjs` inclui:

- `market-brand.css` e `market-branding.js` com revisão de recurso `62-ui2` para evitar reutilização de assets antigos no Safari;
- `sync-conflict-policy.js` logo após `sync.js` no HTML distribuído;
- os assets existentes da v62 para compatibilidade.

O Service Worker usa o cache `conta-de-casa-public-v62-market-ui2`, obrigando a renovação do cache público sem alterar o número formal do build, que continua v62.

## Testes e manutenção

A cobertura passa a verificar:

- posição explícita do conteúdo e do botão `+` nos cartões do browser;
- reflow abaixo de 360 px;
- nova cópia curta do aviso;
- publicação/cache dos assets de hotfix;
- diferenças apenas em metadados de imagem/código de barras não geram conflito manual;
- diferenças reais de preço continuam a gerar conflito;
- ausência de acesso do branding/política ao estado financeiro fora do motor existente.

Regras de manutenção:

- não voltar a introduzir espaço de fotografia sem uma decisão de produto explícita;
- não apagar metadados antigos apenas por razões visuais;
- código de barras continua separado de fotografia e de preço;
- uma alteração de branding não pode modificar cálculos, cifragem ou sincronização;
- campos financeiros nunca podem ser adicionados à lista de metadados técnicos de conflito;
- qualquer consolidação dos módulos antigos de imagem deve acontecer numa alteração separada.
