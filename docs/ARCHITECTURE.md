# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público atual: v63
Revisão visual pública: `63-ui2`

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. Integrações externas do Mercado servem descoberta/identificação de catálogo e preço; não recebem o conteúdo financeiro do cofre.

## Camadas de apresentação

A ordem das camadas é intencional:

1. `styles.css` — estilos históricos/base;
2. `design-system.css` — tokens, componentes e layouts principais;
3. `mobile-layout.css` — compatibilidade de viewport/Safari e safe areas;
4. `market-experience.css` — estrutura do Mercado;
5. `market-brand.css` — identidade text-first do módulo Compras;
6. `market-category-groups.css` — agrupamento/compactação por categoria;
7. `ui-icons.css` — sistema Lucide local e hidratação visual base;
8. `ui-consistency.css` — **camada final v63**, dedicada a resolver colisões entre camadas anteriores e impor invariantes visuais globais.

Outras folhas especializadas: `market-barcode.css`, `invoice-capture.css`, `app-update.css` e `market-image-audit.css`.

### Regra de precedência v63

`ui-consistency.css` é carregado depois das camadas do Mercado. Não contém regras de negócio. A sua responsabilidade é limitada a:

- métrica vetorial comum de ícones;
- um único indicador ativo na navegação mobile;
- separação entre ícone semântico e faixa cromática dos cartões-resumo;
- tamanhos contextuais previsíveis para ícones de navegação, ações e botões principais.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários;
- `finance.js` — cálculos financeiros;
- `render.js` — renderização das páginas/listas;
- `forms.js` — formulários e validação;
- `sync.js` — sincronização cifrada opcional via GitHub;
- `sync-conflict-policy.js` — equivalência complementar para metadados técnicos do Mercado;
- `events.js` — navegação, cofre, viewport e registo do Service Worker;
- `market-experience.js` — catálogo/preço Pingo Doce/Continente e criação confirmada de itens;
- `market-branding.js` — cópia/contexto text-first sem tocar no estado financeiro;
- `market-category-groups.js` — reorganiza os mesmos nós da Lista de compras pela categoria já existente;
- `market-barcode.js` — identificação GTIN/EAN/UPC;
- `ui-icons.js` — subset Lucide local, sem CDN de ícones;
- `invoice-capture.js` — leitura local de QR fiscal;
- `app-update.js` — Centro de Atualização e instalação confirmada;
- módulos `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` — compatibilidade histórica, sem prioridade visual na experiência text-first atual.

## Sistema de ícones

Lucide é o sistema vetorial oficial. `ui-icons.js` mantém a geometria SVG local e auditável. A v63 normaliza a apresentação final em `ui-consistency.css`:

- `stroke-width: 2`;
- `stroke-linecap: round`;
- `stroke-linejoin: round`;
- `vector-effect: non-scaling-stroke`;
- tamanhos contextuais base de 20/22/24 px;
- `currentColor` continua a controlar o estado cromático quando aplicável.

Não é criada uma segunda biblioteca de ícones.

## Navegação mobile — indicador ativo

O design system já define `.mobile-nav .nav-btn::before` como indicador do item ativo. Camadas posteriores tinham acrescentado `::after`, resultando em duas barras.

Na v63:

- `::before` é o único indicador oficial;
- `::after` é explicitamente desativado pela camada final;
- largura padrão: 42 px, reduzida para 38 px até 430 px;
- altura: 3 px;
- o Mercado usa o mesmo indicador, apenas herdando o azul da identidade do módulo.

A decisão evita depender da ordem acidental de pseudo-elementos entre ficheiros.

## Cartões-resumo do Mercado

Antes da v63, `market-summary-item::before` tinha duas responsabilidades incompatíveis: ícone semântico em `ui-icons.css` e faixa superior em `market-brand.css`.

A v63 separa as responsabilidades:

- o acento cromático superior é um `box-shadow: inset 0 3px 0 ...`, sólido e contínuo;
- `::before` fica exclusivamente dedicado ao ícone semântico;
- a cor do acento usa uma variável por estado (`primary`, `success`, `warning`, `normal`, `danger`).

## Lista de compras por categoria

O agrupamento continua sem alterar o schema:

- cada cartão/linha é associado ao item real por `data-market-toggle`;
- a categoria é lida do item correspondente em `appState.market` apenas para apresentação;
- os mesmos nós são movidos para grupos, preservando handlers delegados e atributos `data-*`;
- mobile usa `<details open>` + `<summary>`;
- desktop mantém tabela e recebe separadores de categoria;
- a categoria deixa de se repetir em cada item mobile;
- pendentes não repetem blocos financeiros equivalentes;
- itens comprados mantêm preço real/diferença;
- a v63 também uniformiza a margem esquerda de nome, quantidade, estado, valores e ações.

A ordem das categorias segue a taxonomia conhecida do Mercado; categorias adicionais ficam depois por ordem alfabética. A ordem interna já calculada pelos filtros é preservada.

## Modelo financeiro e segurança

O schema permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. `estimatedCents` continua separado de `actualCents`; quantidade permanece separada do preço unitário.

O cofre usa IndexedDB e envelope cifrado com PBKDF2-SHA-256 + AES-GCM. As revisões v63 de interface e atualização não alteram autenticação, derivação de chave, conteúdo cifrado ou backups.

Metadados históricos de imagem continuam tolerados para compatibilidade. `sync-conflict-policy.js` ignora apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` ao decidir equivalência de negócio do Mercado; preços, quantidade e estado de compra continuam protegidos.

## Centro de Atualização v63

### Fonte de versão

`release-manifest.json` é um recurso público same-origin com:

- `schemaVersion`;
- canal `stable`;
- `latestVersion`;
- histórico de releases e alterações.

`scripts/prepare-pages.cjs` falha se `latestVersion` não corresponder ao build a publicar.

### Fluxo

1. a aplicação regista o Service Worker;
2. o Centro de Atualização consulta `release-manifest.json` com `cache: no-store`;
3. se a versão pública for superior à instalada, a interface apresenta a atualização;
4. `registration.update()` prepara o novo worker;
5. o novo worker permanece `waiting` numa atualização normal;
6. apenas após **Atualizar agora** é enviada a mensagem `APPLY_UPDATE`;
7. `SKIP_WAITING` permanece como compatibilidade de transição com clientes v62;
8. o worker ativa, elimina caches antigos, reclama os clientes e reinicia/navega a janela controlada.

A instalação atua nos assets da aplicação e não executa migração/destruição do cofre.

### Transição v62 → v63

Como o manifesto e a instalação confirmada foram introduzidos na própria v63, uma sessão que ainda execute a v62 pode precisar de um fecho/reabertura ou refresh inicial para receber a v63. A partir da v63, versões posteriores seguem o fluxo explícito do Centro de Atualização.

### Cache e allowlist

Cache público: `conta-de-casa-public-v63-ui2`.

O Service Worker só trata recursos constantes em `PUBLIC_ASSET_SET`. Cache-busting aceita exatamente um parâmetro:

- `v` — revisão/versionamento de assets;
- `ts` — leitura fresca do manifesto de release.

Mesmo com esses parâmetros, o caminho precisa pertencer à allowlist; pedidos arbitrários não são cacheados.

## Responsividade e acessibilidade

Breakpoints principais permanecem:

- até 820 px: navegação móvel, grupos de categoria e diálogos adaptados;
- até 430 px: densidade menor e indicador ativo ligeiramente reduzido;
- abaixo de 360 px: reflow adicional para conteúdo estreito;
- desktop/tablet: filtros/tabela e navegação lateral.

Safe areas, `100dvh`/`100svh`, foco visível, alvos tácteis e `prefers-reduced-motion` permanecem cobertos. A normalização de SVG não altera nomes acessíveis dos controlos; ícones decorativos permanecem `aria-hidden` quando aplicável.

## Rede e privacidade

`ui-consistency.css`, `market-category-groups.js` e `release-manifest.json` não acrescentam endpoints externos. O Centro de Atualização consulta apenas o próprio origin. Não são introduzidos cookies, telemetria, segredos ou armazenamento financeiro adicional.

## Distribuição v63

A composição pública atual foi integrada pelo PR #42 e publicada pelo GitHub Pages a partir do merge `1a034c84976c042e0433d016a5628feaa339a7a6`.

`scripts/prepare-pages.cjs` prepara:

- build `v63`;
- branding/política complementar `63-ui1`;
- agrupamento por categoria `63-ui1`;
- normalização visual final `63-ui2`;
- `release-manifest.json`;
- `ui-consistency.css` como último estilo de consolidação.

A CI de `main` e o Deploy GitHub Pages desta revisão terminaram com sucesso. A validação física no Safari/iPhone continua necessária para confirmar o resultado renderizado no hardware real.
