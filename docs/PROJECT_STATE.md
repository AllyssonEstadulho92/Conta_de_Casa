# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build em validação: v60
Último build público confirmado: v59
Distribuição: GitHub Pages
Branch: `feature/official-product-images-v60`
Estado: resolução por imagens oficiais implementada e CI da branch concluída com sucesso; integração em `main`, deploy e validação física no iPhone ainda pendentes.

## Estado atual

A aplicação permanece uma PWA estática/local-first. O cofre, IndexedDB, PBKDF2/AES-GCM, estado financeiro, sincronização, faturas, scanners e cálculos mantêm os contratos existentes. A v60 altera apenas a origem e a resolução das fotografias do Mercado, sem introduzir backend, credenciais ou alteração do schema financeiro.

## Problema confirmado na v59

A v59 conseguia ampliar fotografias e fazia fallback através das bases Open Facts, mas não recebia a fotografia publicada pelo próprio Continente/Pingo Doce. Por isso, muitos produtos com preço e página oficial continuavam com placeholder.

A causa foi confirmada tecnicamente:

- `cesta.pt` devolve nome, preço, URL e `pid` dos resultados, mas não fornece a fotografia no contrato `search_products`;
- as páginas HTML de Continente/Pingo Doce não expõem CORS para serem lidas de forma fiável pelo browser da PWA;
- ambos os retalhistas publicam, contudo, sitemaps XML com relação entre página/SKU e fotografia oficial.

## Revisão v60 — imagens oficiais por SKU

Foi implementado um fluxo em duas fases.

### Build/CI

`scripts/refresh-retailer-image-index.cjs` lê diretamente os sitemaps oficiais publicados pelos retalhistas:

- Continente: `sitemap_index.xml` → `sitemap-custom_sitemap_*-image.xml`;
- Pingo Doce: `home/sitemap_index.xml` → `home/sitemap_*-product.xml`.

A tarefa extrai apenas:

- `pid`/SKU da URL oficial do produto;
- primeira `image:loc` oficial;
- nome/título do produto quando publicado no sitemap.

O índice é validado antes de ser aceite. A execução CI `33996921108` concluiu com `success` e produziu:

- Continente: **100 474** produtos com fotografia oficial;
- Pingo Doce: **16 018** produtos com fotografia oficial;
- **101 558** nomes exatos únicos utilizáveis para reparar itens antigos sem PID.

Os dois SKUs fornecidos como exemplos são testes de controlo obrigatórios no build:

- Continente `8167440` — Compressas Gaze 20 × 20 cm;
- Pingo Doce `739490` — Arroz Carolino Cigala.

Se algum destes controlos ou o tamanho mínimo do catálogo falhar, CI/deploy falham em vez de publicar um índice incompleto silenciosamente.

### Runtime

`market-official-images.js` é carregado depois da camada v59 e passa a ter prioridade:

1. um resultado de pesquisa já possui `retalhista + pid` proveniente de `cesta.pt`;
2. a aplicação consulta apenas um pequeno shard JSON **same-origin** em `./retailer-images/...`;
3. o shard devolve a URL exata da fotografia daquele PID;
4. a imagem é carregada diretamente do host oficial do retalhista;
5. tocar na miniatura abre a imagem oficial ampliada;
6. se o SKU não existir no índice oficial, entra o fallback v59/Open Facts;
7. sem correspondência segura, mantém-se placeholder.

Para itens antigos, que foram criados antes de existir metadata do retalhista/PID, a v60 só usa resolução por nome quando o nome oficial normalizado é **exato, único e não ambíguo**. Não existe fuzzy matching para afirmar que uma fotografia é oficial.

Quando um novo resultado é adicionado, a camada v60 acompanha a criação e persiste a fotografia oficial no item, usando os campos já existentes `imageUrl`, `imageSource` e `imageMatchedAt`.

## Segurança e privacidade

- nenhum scraping de HTML dos supermercados ocorre no iPhone/browser;
- nenhum proxy genérico, Microlink, Jina, AllOrigins, Apify ou semelhante foi introduzido;
- nenhum token/API key/Authorization é usado para imagens;
- o browser consulta os índices por `same-origin` no próprio GitHub Pages;
- a CSP permite imagens apenas nos hosts oficiais `www.continente.pt` e `static.pingodoce.pt`, além das origens Open Facts já autorizadas;
- os hosts de Continente/Pingo Doce **não** são adicionados a `connect-src`, impedindo que o runtime evolua silenciosamente para scraping/API arbitrária;
- nenhum binário de imagem entra no cofre; apenas URL/origem/data são persistidos;
- PIN, chaves, faturas, valores financeiros e token GitHub nunca entram no processo de resolução.

## Distribuição v60

`scripts/prepare-pages.cjs` passa a:

1. exigir/gerar o índice oficial;
2. carimbar o build público como `v60`;
3. distribuir `market-official-images.js`;
4. copiar `retailer-images/` para `dist/`;
5. aplicar a CSP restrita aos dois hosts oficiais;
6. carimbar `events.js` para `./sw.js?v=60`.

O Service Worker usa `conta-de-casa-public-v60-official-retailer-images` e faz cache lazy apenas dos shards pedidos, não do catálogo completo.

`APP_RELEASE_NOTES` contém a entrada v60 em **Definições → Atualização de Software → Mais detalhes**.

## Validação automatizada

CI de referência da branch: `33996921108` — `success`.

Passaram:

- geração do índice oficial;
- validação dos SKUs 8167440 e 739490;
- teste dedicado `market-official-images.test.cjs`;
- Mercado e fallback de imagens v59;
- finanças e invariantes;
- isolamento/cofre e segurança;
- formulários, QR e código de barras;
- responsividade/mobile;
- acessibilidade e navegação;
- Lucide/UI;
- atualização da PWA;
- sincronização e manifest.

## Limitações conhecidas

A v60 cobre o catálogo que cada retalhista publica nos respetivos sitemaps. Não se pode prometer uma fotografia para um SKU que o próprio sitemap não publicar. Nessa situação, a aplicação utiliza o fallback visual existente ou mantém o placeholder para não mostrar outro produto.

A validação automatizada não substitui o teste físico do carregamento das imagens em Safari/iPhone. O browser deverá poder apresentar `<img>` cross-origin sem necessidade de CORS, mas é necessário confirmar em hardware que os dois hosts oficiais não aplicam proteção de hotlinking incompatível com o GitHub Pages.

## Próximo passo

1. integrar v60 em `main` apenas com CI verde;
2. confirmar CI principal e Deploy Pages v60;
3. no iPhone, abrir **Definições → Atualização de Software** e confirmar `v60`;
4. pesquisar os dois exemplos de controlo e outros produtos do Continente/Pingo Doce;
5. confirmar fotografia correta, toque → ampliação e persistência na Lista de compras;
6. testar itens antigos: correspondência exata deve reparar imagem; ambiguidades devem permanecer sem fotografia oficial.
