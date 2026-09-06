# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público base: v62
Revisão atual em validação: lista de compras agrupada por categoria (`62-ui3`)

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. As integrações externas do Mercado servem descoberta de catálogo, preço e identificação de produto; não recebem conteúdo financeiro do cofre.

## Camadas principais

### Estrutura e apresentação

- `index.html` — template semântico, CSP base, páginas, navegação e diálogos.
- `styles.css` / `design-system.css` — estilos base e design system.
- `mobile-layout.css` — compatibilidade de viewport/Safari e safe areas.
- `market-experience.css` — estrutura visual do Mercado.
- `market-brand.css` — identidade visual text-first do módulo Compras/Mercado e correções do browser móvel.
- `market-category-groups.css` — apresentação compacta da Lista de compras por categoria em mobile e separadores de categoria na tabela desktop.
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
- `sync-conflict-policy.js` — política complementar que ignora apenas metadados técnicos de imagem/código de barras na equivalência do Mercado.
- `events.js` — navegação, eventos, cofre e Service Worker.
- `market-experience.js` — catálogo/preço Pingo Doce e Continente via `cesta.pt` e criação confirmada de itens.
- `market-branding.js` — camada sem estado que alinha o texto do browser de produtos com a experiência text-first.
- `market-category-groups.js` — camada de apresentação que agrupa os nós já renderizados da Lista de compras pela categoria existente, sem persistência própria.
- `market-barcode.js` — leitura GTIN e identificação assistida; a câmara não é um campo de fotografia.
- `invoice-capture.js` — leitura local de QR fiscal.
- `ui-icons.js` — subset Lucide local.
- `app-update.js` — versão, notas de release e atualização do Service Worker.
- `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` — mecanismos visuais históricos v59–v62, mantidos nesta revisão para compatibilidade e potencial remoção posterior controlada.

## Modelo financeiro e segurança

O schema financeiro permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. O Mercado mantém `estimatedCents` separado de `actualCents`; quantidade permanece separada do preço unitário.

O cofre usa IndexedDB e envelope cifrado. O modelo continua baseado em PBKDF2-SHA-256 + AES-GCM. As revisões visuais não alteram autenticação, derivação de chave, backups ou conteúdo cifrado enviado ao GitHub.

Metadados antigos de imagem (`productCode`, `imageUrl`, `imageSource`, `imageMatchedAt`) continuam tolerados pelo normalizador para não destruir dados existentes. A interface não lhes reserva espaço visual e a sincronização deixa de os tratar como divergências que exijam decisão manual.

## Mercado — responsabilidades atuais

1. **Catálogo, preço e página do produto:** `market-experience.js` + `cesta.pt/mcp`.
2. **Código de barras:** `market-barcode.js`; identifica o artigo, não define preço.
3. **Persistência financeira:** fluxo existente de `market-experience.js`, apenas após ação explícita do utilizador.
4. **Apresentação e identidade:** `market-experience.css` + `market-brand.css`.
5. **Agrupamento da Lista de compras:** `market-category-groups.js` + `market-category-groups.css`.
6. **Cópia contextual text-first:** `market-branding.js`.
7. **Compatibilidade histórica de imagens:** módulos v59–v62, sem prioridade visual na interface.

A informação principal de um produto permanece: **nome → embalagem/quantidade → loja → preço/estado**. Na Lista de compras, a categoria passa a funcionar também como estrutura de navegação visual.

## Lista de compras — agrupamento por categoria

A revisão `62-ui3` não altera `render.js` nem o schema. O agrupamento atua sobre o DOM já produzido por `renderMarket()`:

- cada cartão/linha é associado ao item real pelo `data-market-toggle` já existente;
- a categoria é lida do item correspondente em `appState.market` apenas para apresentação;
- os nós existentes são movidos para grupos, preservando handlers delegados e atributos `data-*`;
- cada grupo mobile usa `<details open>` + `<summary>`, fornecendo expandir/recolher nativo e acessível sem estado adicional;
- o cabeçalho mostra categoria e contagem; a categoria deixa de se repetir em cada linha mobile;
- itens pendentes ocultam na apresentação blocos financeiros duplicados que exibiam o mesmo valor, mantendo o estimado visível;
- itens comprados continuam a mostrar informação financeira e preço real existentes;
- a tabela desktop recebe linhas separadoras de categoria, mantendo colunas e ações.

### Ordem das categorias

A ordem base acompanha a taxonomia existente do Mercado: frutas/legumes, padaria, lacticínios/ovos, carne/peixe, mercearia/despensa, congelados, bebidas, snacks/doces, higiene, limpeza, bebé, animais e outros. Categorias não previstas ficam depois destas por ordem alfabética. Dentro de cada grupo, a ordem calculada por `marketFilteredItems()` é preservada.

## Browser do Mercado — regra de layout móvel

O browser de produtos continua a usar posições explícitas para impedir a “coluna fantasma” deixada pelo antigo slot de fotografia:

- `.market-product-copy` ocupa sempre a primeira coluna útil;
- `.market-add-product` ocupa sempre a coluna da ação;
- dentro de `.market-product-copy`, nome/loja/estado ficam à esquerda e o preço à direita quando existe largura suficiente;
- abaixo de 360 px, o preço reflui para baixo do conteúdo em vez de comprimir palavras letra a letra.

## Sincronização — política de conflitos técnicos

`sync.js` continua responsável por merge, histórico, upload cifrado e decisão de conflitos. `sync-conflict-policy.js` atua apenas sobre a vista de negócio usada por esse motor:

- para entidades diferentes de `market`, delega integralmente no comportamento original;
- para `market`, retira apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` antes da comparação de equivalência;
- nome, categoria, quantidade, unidade, `estimatedCents`, `actualCents`, `purchased` e `purchasedAt` continuam a ser campos reais.

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

Os grupos de categoria usam a mesma linguagem, com cabeçalho suave, ícone local Lucide e linhas compactas sem criar um segundo design system.

## Responsividade e acessibilidade

A estrutura mantém os breakpoints auditados:

- até 820 px: navegação móvel, lista de compras agrupada e diálogo full-screen;
- até 430 px: densidade reduzida e ações tácteis compactas;
- abaixo de 360 px: reflow adicional para estados e cabeçalhos de categoria;
- desktop/tablet mantêm filtros e tabela, agora com separadores de categoria.

Safe areas, `100dvh`/`100svh`, `prefers-reduced-motion`, foco visível e alvos tácteis existentes continuam ativos. O uso de `<details>/<summary>` evita criar um controlo customizado desnecessário para expandir/recolher categorias.

## Rede e privacidade

`market-category-groups.js` não faz `fetch`, não grava `appState`, não usa armazenamento adicional e não adiciona origens de rede. Apenas lê a categoria/quantidade do item correspondente e reorganiza os mesmos nós do DOM.

Os mecanismos de rede existentes permanecem inalterados. A remoção futura do pipeline histórico de imagens continua a ser uma mudança arquitetural separada.

## Distribuição

`scripts/prepare-pages.cjs` inclui:

- branding/sincronização anterior em `62-ui2`;
- `market-category-groups.css` e `market-category-groups.js` em `62-ui3`;
- os assets existentes da v62 para compatibilidade.

O Service Worker usa `conta-de-casa-public-v62-market-ui2-category-ui3`, forçando a atualização do cache sem alterar o número formal do build.

## Testes e manutenção

A cobertura inclui:

- sintaxe do novo módulo;
- presença dos grupos e uso de `data-market-toggle`;
- ausência de escrita em estado financeiro na camada de agrupamento;
- responsividade e `prefers-reduced-motion`;
- inclusão dos assets no Service Worker e Pages;
- ordem de carregamento depois do branding;
- regressões financeiras, segurança, sincronização e viewport já cobertas pela CI existente.

Regras de manutenção:

- categoria visual nunca deve criar/migrar dados por conta própria;
- filtros e ordenação continuam responsabilidade de `render.js`;
- não duplicar handlers de editar, eliminar ou checkbox no módulo de agrupamento;
- não voltar a introduzir espaço de fotografia sem decisão explícita;
- qualquer consolidação dos módulos antigos de imagem deve acontecer numa alteração separada.
