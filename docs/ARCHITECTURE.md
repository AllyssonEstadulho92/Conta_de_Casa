# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público base: v62
Revisão visual em validação: Mercado sem fotografias de produto

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. As integrações externas do Mercado servem descoberta de catálogo, preço e identificação de produto; não recebem conteúdo financeiro do cofre.

## Camadas principais

### Estrutura e apresentação

- `index.html` — template semântico, CSP base, páginas, navegação e diálogos.
- `styles.css` / `design-system.css` — estilos base e design system.
- `mobile-layout.css` — compatibilidade de viewport/Safari e safe areas.
- `market-experience.css` — estrutura visual do Mercado.
- `market-brand.css` — camada final de identidade visual do módulo Compras/Mercado; remove da apresentação as fotografias e placeholders sem tocar no estado.
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
- `sync.js` — sincronização cifrada opcional via GitHub.
- `events.js` — navegação, eventos, cofre e Service Worker.
- `market-experience.js` — catálogo/preço Pingo Doce e Continente via `cesta.pt` e criação confirmada de itens.
- `market-branding.js` — camada sem estado que alinha o texto do browser de produtos com a experiência sem fotografias.
- `market-barcode.js` — leitura GTIN e identificação assistida; a câmara não é um campo de fotografia.
- `invoice-capture.js` — leitura local de QR fiscal.
- `ui-icons.js` — subset Lucide local.
- `app-update.js` — versão, notas de release e atualização do Service Worker.
- `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` — mecanismos visuais históricos v59–v62, mantidos nesta revisão para compatibilidade e potencial remoção posterior controlada.

## Modelo financeiro e segurança

O schema financeiro permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. O Mercado mantém `estimatedCents` separado de `actualCents`; quantidade permanece separada do preço unitário.

O cofre usa IndexedDB e envelope cifrado. O modelo continua baseado em PBKDF2-SHA-256 + AES-GCM. A revisão visual não altera autenticação, derivação de chave, backups ou sincronização.

Metadados antigos de imagem (`productCode`, `imageUrl`, `imageSource`, `imageMatchedAt`) continuam tolerados pelo normalizador para não destruir dados existentes. A interface do Mercado deixa, no entanto, de lhes reservar espaço visual.

## Mercado — responsabilidades atuais

1. **Catálogo, preço e página do produto:** `market-experience.js` + `cesta.pt/mcp`.
2. **Código de barras:** `market-barcode.js`; identifica o artigo, não define preço.
3. **Persistência financeira:** fluxo existente de `market-experience.js`, apenas após ação explícita do utilizador.
4. **Apresentação e identidade:** `market-experience.css` + `market-brand.css`.
5. **Cópia contextual sem fotografias:** `market-branding.js`.
6. **Compatibilidade histórica de imagens:** módulos v59–v62, sem prioridade visual nesta revisão.

A informação principal de um produto passa a ser: **nome → embalagem/quantidade → loja → preço/estado**. A fotografia não é requisito de identificação na interface.

## Decisão de apresentação sem fotografias

A nova camada não reescreve o motor do Mercado. Em vez disso, atua como override final:

- `.market-product-photo`, botões de fotografia e triggers do visualizador ficam sem apresentação no contexto do Mercado;
- a identidade de itens guardados refluí para texto sem coluna reservada à imagem;
- o cabeçalho móvel do item usa `checkbox + conteúdo + estado`;
- o cartão de resultado usa `conteúdo + ação +`;
- o aviso do browser passa a declarar que o resultado é apresentado por nome, embalagem, loja e preço e não depende de fotografias;
- dados antigos não são apagados nem migrados.

Esta abordagem reduz risco de regressão: a mudança visual fica isolada e pode ser validada em hardware real antes de remover código histórico.

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

A estrutura mantém os breakpoints já auditados:

- até 820 px: navegação móvel, cards em duas colunas e diálogo full-screen;
- até 430 px: densidade reduzida e ações de 48 px;
- abaixo de 360 px: reflow adicional para impedir corte horizontal;
- desktop/tablet mantêm filtros e tabelas existentes.

Safe areas, `100dvh`/`100svh`, `prefers-reduced-motion`, foco visível e alvos tácteis existentes continuam ativos.

A ocultação de fotografia não remove informação funcional necessária: nome, categoria, quantidade, estado, preço e ações continuam presentes em texto/controles acessíveis.

## Rede e privacidade

A nova camada `market-branding.js` não faz `fetch`, não lê `appState` e não adiciona qualquer origem de rede. Apenas altera conteúdo estático do aviso do browser e define um marcador de apresentação no elemento raiz.

Os mecanismos de rede existentes permanecem inalterados nesta revisão. A remoção futura do pipeline histórico de imagens deve ser tratada como mudança arquitetural separada, com revisão de CSP, Service Worker, testes e documentação.

## Distribuição

`scripts/prepare-pages.cjs` passa a incluir:

- `market-brand.css` como camada CSS final do Mercado;
- `market-branding.js` como camada semântica final;
- os assets existentes da v62 para compatibilidade.

O Service Worker inclui os dois novos assets na allowlist de cache. O build público continua a usar a composição v62 até uma mudança de versão formal.

## Testes e manutenção

A cobertura do Mercado verifica agora, além das invariantes anteriores:

- presença dos novos assets em Pages e Service Worker;
- ausência visual da fotografia/placeholder;
- reflow correto dos cards sem imagem;
- identidade cromática principal;
- ausência de acesso do branding ao estado financeiro.

Regras de manutenção:

- não voltar a introduzir espaço de fotografia sem uma decisão de produto explícita;
- não apagar metadados antigos apenas por razões visuais;
- código de barras continua separado de fotografia e de preço;
- uma alteração de branding não pode modificar cálculos, cifragem ou sincronização;
- qualquer consolidação dos módulos antigos de imagem deve acontecer depois da validação física e numa alteração separada.
