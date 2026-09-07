# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v64`
Candidato em validação: `v65`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. Integrações externas do Mercado servem apenas descoberta/identificação de catálogo e preço; não recebem o conteúdo financeiro do cofre.

## Persistência e segurança

- `core.js`: normalização, utilitários, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema base: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem cookies/telemetria financeira;
- segredos e PIN não são incluídos no código público.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários;
- `finance.js` — cálculos e invariantes financeiros;
- `render.js` — renderização e navegação de páginas;
- `forms.js` — formulários, validação e mutações;
- `events.js` — eventos globais, viewport, cofre e Service Worker;
- `sync.js` — sincronização cifrada opcional;
- `sync-conflict-policy.js` — equivalência de negócio do Mercado sem ruído de metadados técnicos;
- `market-experience.js` — catálogo/preço Pingo Doce e Continente através de `cesta.pt`;
- `market-barcode.js` — leitura GTIN/EAN/UPC e identificação de produto;
- `market-category-groups.js` — agrupamento visual base da lista de compras;
- `market-shopping-focus.js` — camada v65 de apresentação móvel: resumo compacto, `+` contextual, filtros compactos, pendentes prioritários, Comprados recolhidos e detalhes progressivos;
- `ui-icons.js` — subset Lucide local;
- `invoice-capture.js` — leitura local de QR fiscal;
- `app-update.js` — Centro de Atualização;
- `v64-runtime.js` — correspondência conservadora do scanner e ciclo de faturas recorrentes **Por preencher**.

`market-shopping-focus.js` lê o estado apenas para apresentar métricas já definidas por `marketMetrics()`. Não escreve `estimatedCents`, `actualCents`, quantidade, estado de compra, persistência ou sincronização. Para adicionar produto, o `+` contextual dispara o botão `#newMarketBtn` já existente, preservando o fluxo/handler oficial.

Os módulos históricos `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` continuam distribuídos por compatibilidade, embora a UI principal seja `text-first`.

## Ordem das camadas CSS

A ordem pública da candidata v65 é intencional:

1. `styles.css` — base histórica;
2. `design-system.css` — tokens/componentes/layout;
3. `mobile-layout.css` — compatibilidade móvel/Safari;
4. `market-experience.css` — estrutura do Mercado;
5. `market-brand.css` — identidade text-first;
6. `market-category-groups.css` — agrupamento por categoria;
7. `ui-icons.css` — sistema Lucide e componentes visuais;
8. `ui-consistency.css` — consolidação visual global;
9. `v64-runtime.css` — cabeçalho móvel/safe area e estado visual das faturas por preencher;
10. `market-shopping-focus.css` — ajustes finais exclusivamente dentro de `#page-market` no mobile.

A camada v65 não redefine a geometria global do topbar nem altera cifragem/persistência. Ela fica depois de `v64-runtime.css` para resolver apenas densidade e prioridade do conteúdo de Compras.

## Lista de compras v65

### Desktop

Permanece inalterado: tabela, separadores de categoria, pesquisa/filtros e quatro resumos financeiros completos.

### Mobile até 820 px

1. `market-shopping-focus.js` insere `#marketMobileOverview` antes da barra de pesquisa;
2. o resumo compacto apresenta contagens por comprar/compradas e total previsto;
3. **Resumo financeiro** expande estimado, contabilizado, pendente e diferença;
4. `#marketSummary` original é ocultado apenas no mobile;
5. o botão de página `#newMarketBtn` fica visualmente oculto, mas continua a ser o handler oficial acionado pelo `+` do topbar;
6. filtros usam os selects existentes; labels continuam disponíveis para acessibilidade e o botão de limpar depende de estado ativo;
7. após `market-category-groups.js`, a camada v65 mantém grupos com pendentes abertos e move cartões comprados para um grupo fechado **Comprados**;
8. em cada cartão, o preço de leitura rápida é copiado da informação já renderizada e os blocos secundários são movidos para `<details>` sem recriar handlers.

A sequência dos MutationObservers é protegida por `data-marketShoppingFocused` para evitar reprocessamento do mesmo DOM. `renderMarket()` continua a ser a fonte do HTML e cada render novo remove naturalmente as marcações antigas antes de nova aplicação.

## Navegação e viewport móvel

Em mobile, `.main` continua a ser o scroller interno e a navegação inferior permanece fixa. Na v64, `.topbar` usa `position:fixed` até 820 px; `--mobile-top-safe` respeita `env(safe-area-inset-top)`; `.main` recebe `padding-top: var(--header-height)` e `scroll-padding-top` acompanha a altura do topo.

A v65 não altera estas métricas. Apenas torna a ação `+` contextual quando `#page-market` está ativo, mantendo o mesmo componente estrutural do cabeçalho.

## Sistema de ícones

Lucide permanece o sistema vetorial oficial. O grupo **Comprados** usa `CDCIcons.markup('circleCheck')` e o chevron já existente; não são introduzidos novos icon fonts/CDNs.

## Mercado e código de barras

### Fontes

- Pingo Doce e Continente: pesquisa de produto/preço via `https://cesta.pt/mcp`;
- Open Food Facts: identificação auxiliar por código de barras;
- `@zxing/browser`: biblioteca de leitura carregada em runtime a partir de `unpkg.com`.

A última dependência é funcional mas constitui superfície externa adicional. A estratégia de auto-hospedagem/integridade deve ser revista numa release de segurança dedicada.

### Fluxo v64 preservado na v65

1. o utilizador escolhe exatamente um supermercado;
2. o scanner valida checksum GTIN/EAN/UPC e identifica o produto;
3. o Mercado consulta resultados dessa loja;
4. `v64-runtime.js` compara loja, nome/marca e embalagem;
5. auto-adição só ocorre com score `>= 0.84` e diferença `>= 0.10` face ao segundo candidato;
6. ambiguidade exige confirmação manual;
7. GTIN repetido num item pendente incrementa a quantidade.

O preço encontrado atualiza `estimatedCents`; o scanner não escreve `actualCents`.

## Faturas recorrentes v64 preservadas

As ocorrências futuras automáticas podem ter `draft: true`: descrição/fornecedor/categoria/método/recorrência/vencimento são preservados; valor/referência/observações/data de emissão são limpos; `totalCents = 0` enquanto **Por preencher**; drafts não entram nos totais pendentes/em atraso.

## Centro de Atualização

`release-manifest.json` é a fonte pública de versões e notas. A candidata v65 define `latestVersion = v65`; `scripts/prepare-pages.cjs` exige correspondência entre manifesto e build. A atualização pública substitui assets da aplicação; não recria nem apaga o cofre.

## Pipeline de qualidade e distribuição

### CI

Além da cobertura existente, a v65 acrescenta:

- sintaxe de `market-shopping-focus.js`;
- `tests/market-shopping-focus.test.cjs`.

A regressão garante apresentação-only, ação `+` contextual, filtros, grupo Comprados, detalhes, assets, ordem de carregamento e versionamento.

### GitHub Pages

O gate de `workflow_dispatch` repete também a sintaxe e o teste da camada v65 antes de preparar `dist`, mantendo o redeploy manual com a mesma cobertura específica necessária para a release.

## Distribuição

Estado antes da integração da v65:

- público: `v64`;
- candidata: `v65`;
- revisão v65: `65-shopping1`;
- revisões preservadas: `64-ui1` / `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1`;
- CI/PR/Pages da v65: pendentes de confirmação.

## Regressões obrigatórias

Antes de publicar v65 devem permanecer cobertos:

- finanças e invariantes de contagem;
- isolamento/cifragem do cofre;
- datas civis, faturas, pagamentos e QR;
- Mercado, scanner, quantidade × preço;
- agrupamento por categoria e nova prioridade pendentes/comprados;
- botão `+` contextual sem duplicar handlers;
- filtros e resumo compacto no mobile;
- ícones e consistência visual;
- safe area/cabeçalho móvel entre páginas principais;
- atualização, manifesto e Service Worker;
- segurança/CSP/allowlist;
- responsividade, navegação e acessibilidade;
- sincronização e conflitos técnicos.

A CI automatizada não substitui a validação física final em Safari/iPhone e Android.
