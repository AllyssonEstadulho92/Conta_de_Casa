# Changelog Técnico — Conta de Casa

O detalhe anterior permanece no histórico Git e em `release-manifest.json`. Este ficheiro mantém as alterações recentes relevantes para continuidade técnica.

## 2026-09-09 — v75 `75-catalog1`: catálogo visual progressivo por categorias

### Objetivo

Criar uma experiência de Mercado previamente organizada por categorias e permitir que a aplicação acumule gradualmente SKUs reais do Continente e Pingo Doce, alimentando a biblioteca de fotografias sem guardar preços antigos nem fazer crawling massivo dos retalhistas.

### Alterações

- criado `market-visual-catalog.js` com revisão `75-catalog1`;
- criado `market-visual-catalog.css` para grelha responsiva e acessível;
- criado `market-catalog-image-resolver.js` para usar diretamente a URL oficial exata de um SKU já descoberto;
- criada IndexedDB separada `conta-de-casa-market-visual-catalog`;
- store `products` usa chave `marketId|pid` e índices de categoria, mercado e última observação;
- store `meta` mantém cursor de descoberta e orçamento diário;
- adicionadas 12 categorias iniciais: Bebidas, Lacticínios e ovos, Frutas e legumes, Carne e peixe, Padaria e pastelaria, Mercearia/Despensa, Congelados, Snacks e doces, Higiene pessoal, Limpeza, Bebé e Animais;
- descoberta usa `cesta.pt` apenas para `pingodoce` e `continente`, com até 20 resultados por seed;
- só entram no índice produtos com PID e página oficial coerentes;
- o índice guarda nome, embalagem, categorias, URL oficial e timestamps; **não guarda preço**;
- cartões têm ação **Ver preço atual**, que reutiliza `#marketCatalogSearch` e o fluxo de pesquisa viva existente;
- filtros Todos / Continente / Pingo Doce foram adicionados ao catálogo visual;
- a interface mostra quantidade de produtos indexados e imagens validadas;
- sem imagem validada, o cartão mostra fallback local em vez de imagem fictícia;
- desktop usa três colunas, mobile/tablet compacto reduz para duas e ecrãs até 350 px passam para uma coluna/composição lateral.

### Acumulação controlada

- máximo de 18 pesquisas de enriquecimento por sessão;
- máximo de 48 pesquisas por dia;
- intervalo mínimo de 15 segundos entre passos automáticos;
- apenas uma pesquisa Cesta em voo;
- máximo de 20 tentativas de enriquecimento de imagem por sessão;
- intervalo de 8 segundos entre passos de imagem;
- resolvedor direto limitado a duas operações concorrentes;
- enriquecimento suspenso quando offline, com `Save-Data` ativo ou página oculta;
- cursor persistente permite continuar por outros termos/categorias em sessões futuras.

O objetivo é crescimento progressivo para centenas/milhares de SKUs ao longo do uso. A revisão não declara cobertura integral instantânea dos catálogos dinâmicos.

### Fotografias

- `market-catalog-image-resolver.js` valida a URL exata da página através de `CDCOfficialMarketImages.safeProductUrl`;
- a página é lida por GET simples através de `r.jina.ai`, sem credenciais e com `no-referrer`;
- candidatos são aceites apenas quando `safeOfficialImageUrl` confirma retalhista, catálogo e PID;
- a imagem válida é entregue à `75-image-library1` e mantém o TTL de 45 dias;
- quando a resolução direta falha, o resolvedor oficial anterior continua disponível como fallback;
- nenhum ficheiro binário de imagem é copiado para GitHub.

### Segurança e integridade

- novos módulos não referenciam `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents` ou `amountCents`;
- `core.js`, `finance.js`, `STATE_VERSION = 5`, estado financeiro, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM, QR e sincronização cifrada permanecem inalterados;
- o catálogo visual não persiste preços e não pode transformar preço antigo em preço atual;
- a chave `marketId|pid` impede colisão entre SKUs com nomes semelhantes.

### QA

- criado `tests/market-visual-catalog.test.cjs`;
- CI e Pages passam a validar sintaxe, isolamento, categorias, PID/URLs, limites de rede, resolvedor de imagem, CSS, ordem do bundle e cache;
- o primeiro CI detetou apenas uma regex incorreta no próprio teste; a asserção foi corrigida;
- CI completo da branch terminou verde no SHA técnico `8e5d61c3c68771cd3e1cd5990cbe201e30fb7baa`.

### Distribuição prevista

- `CATALOG_REV = 75-catalog1`;
- assets: `market-visual-catalog.css?v=75-catalog1`, `market-catalog-image-resolver.js?v=75-catalog1`, `market-visual-catalog.js?v=75-catalog1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1`;
- estado neste registo: validado na branch, publicação em `main` ainda pendente.

## 2026-09-09 — v75 `75-image-library1`: biblioteca persistente de fotografias oficiais

- criada `market-image-library.js` e a base `conta-de-casa-market-image-library`;
- fotografias indexadas por `marketId|pid`;
- apenas URLs oficiais validadas são persistidas; binários não são copiados;
- Continente e Pingo Doce usam validação estrita de host/path/PID;
- TTL positivo de 45 dias;
- reutilização automática quando o mesmo SKU reaparece;
- fallback `Imagem indisponível` preservado;
- estado financeiro e cálculos não foram alterados;
- revisão publicada em `main` e GitHub Pages.

## 2026-09-09 — v75 `75-featured1`: Produtos em destaque

- grelha móvel histórica substituída por carrossel horizontal com `scroll-snap`;
- cartões largos com área de imagem estável, nome em duas linhas, preço isolado e categoria;
- fallback local e skeleton;
- mesmos itens/handlers financeiros existentes;
- sem criação de preços ou produtos fictícios.

## 2026-09-09 — v75 `75-drawer2`

- drawer continua à direita;
- paleta alinhada com cabeçalho petróleo/teal;
- hambúrguer/X, swipe, Escape, foco, ARIA e scroll preservados;
- alteração exclusivamente visual.

## 2026-09-09 — v75 `75-layout1`

- largura útil, margens, ritmo vertical, grelhas, cartões, filtros e formulários uniformizados;
- breakpoints desktop/web compacto/mobile refinados;
- núcleo financeiro e persistência inalterados.

## 2026-09-08 — v75 `75-stability1` / `75-header2`

- estabilização de tipografia, overflow, safe areas, formulários, navegação, diálogos e imagens;
- cabeçalho móvel simplificado para hambúrguer+título à esquerda e notificações à direita;
- sem alteração ao estado financeiro.

## Histórico anterior

As revisões v74 e anteriores, bem como detalhes completos das alterações anteriores, permanecem no histórico Git e em `release-manifest.json`.
