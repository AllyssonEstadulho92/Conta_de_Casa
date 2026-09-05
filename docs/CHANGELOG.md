# Changelog Técnico — Conta de Casa

## 2026-09-05 — Fotografias oficiais Continente/Pingo Doce v60

### Problema

A v59 melhorou o fallback de fotografias e permitiu ampliação, mas vários resultados continuavam com placeholder porque o preço/página oficial vinham de `cesta.pt` e a fotografia vinha de bases Open Facts independentes.

Uma auditoria confirmou que ler as páginas HTML dos retalhistas diretamente no browser não é uma solução estável devido a CORS/redirecionamentos, mas **Continente e Pingo Doce publicam sitemaps XML com URL de produto e `image:loc` oficial**.

### Alterações

- criado `scripts/refresh-retailer-image-index.cjs`;
- o build passa a ler os sitemaps oficiais do Continente e Pingo Doce;
- PID/SKU é extraído da URL oficial do produto;
- URL da fotografia é extraída de `image:loc` e validada contra os hosts/catálogos oficiais;
- criados shards JSON por prefixo de PID para evitar descarregar o catálogo completo no telemóvel;
- criados shards de nome exato para reparar itens antigos sem PID, apenas quando o nome é único;
- criado `market-official-images.js`;
- resultados de `cesta.pt` passam a resolver fotografia por `retalhista + pid` antes do fallback Open Facts;
- imagens oficiais ficam identificadas como **Continente — imagem oficial** ou **Pingo Doce — imagem oficial**;
- ao adicionar um resultado, a fotografia oficial é associada ao novo item e persistida nos campos de imagem já existentes;
- itens antigos podem ser reparados por nome apenas com correspondência exata, única e não ambígua;
- miniaturas oficiais continuam ampliáveis por toque/clique;
- `market-image-audit.js` v59 permanece como fallback quando o sitemap oficial não contém uma imagem;
- build público passa para `v60`;
- Service Worker passa para `conta-de-casa-public-v60-official-retailer-images`;
- shards são cacheados apenas quando pedidos;
- `APP_RELEASE_NOTES` recebe a entrada v60.

### Segurança

- nenhum scraping das páginas dos supermercados ocorre no browser;
- nenhum proxy genérico ou serviço de scraping de terceiros foi introduzido;
- nenhum API key/token/Authorization é necessário;
- `connect-src` não é alargado para Continente/Pingo Doce;
- `img-src` é alargado apenas a `www.continente.pt` e `static.pingodoce.pt`;
- os índices são recursos same-origin do GitHub Pages;
- fotografias não são copiadas para o cofre; apenas URL/origem/data são persistidos;
- nenhuma alteração a PIN, cifragem, IndexedDB, preços, quantidade, faturas ou sincronização.

### Validação

A CI de referência `33996921108` terminou com `success`.

O gerador produziu:

- **100 474** produtos Continente com fotografia oficial;
- **16 018** produtos Pingo Doce com fotografia oficial;
- **101 558** nomes oficiais exatos únicos para reparação segura de itens antigos.

SKUs de controlo obrigatórios:

- Continente `8167440` — imagem oficial encontrada;
- Pingo Doce `739490` — imagem oficial encontrada.

Foi criado `tests/market-official-images.test.cjs` e passaram também as suites de finanças, segurança, Mercado, imagens v59, código de barras, QR, responsividade, acessibilidade, ícones, atualização, sincronização e manifest.

### Estado

Branch `feature/official-product-images-v60` pronta para integração após CI verde. A validação física em iPhone/Safari continua necessária depois do deploy para confirmar carregamento efetivo dos dois hosts oficiais e comportamento do visualizador.

## 2026-09-05 — Auditoria e ampliação de imagens de produto v59

- criado `market-image-audit.js/.css`;
- produtos sem fotografia passam a ser auditados individualmente;
- GTIN/EAN é privilegiado quando disponível;
- Open Food/Beauty/Products/Pet Facts são usados como fontes de referência;
- matching textual exige score mínimo `0.74`;
- miniaturas passam a abrir visualizador ampliado;
- imagens resolvidas podem ser persistidas como URL/origem/data;
- sem proxy genérico, credenciais ou binários no cofre;
- build/cache avançaram para v59;
- PR #31 integrado e GitHub Pages publicado com sucesso.

## 2026-09-05 — Centro de Atualização de Software v58

- criado `app-update.js/.css`;
- adicionada **Definições → Atualização de Software**;
- verificação manual usa `ServiceWorkerRegistration.update()` e `SKIP_WAITING`;
- canal estável reflete o Service Worker real;
- Beta mantido desativado sem pipeline própria;
- `APP_RELEASE_NOTES` centraliza novidades;
- Pages passou a carimbar a versão pública durante o build.

## 2026-09-05 — Fotografias reais de referência v57

- Mercado ganhou `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` opcionais;
- fotografia Open Food Facts passou a aparecer quando havia correspondência segura;
- imagem deixou de ser simulada por avatar vetorial;
- apenas URLs/metadados são guardados.

## 2026-09-05 — Cofre visual moderno v56

- ecrã de desbloqueio redesenhado com cartão moderno e teclado PIN circular;
- safe areas, dark mode e redução de movimento preservados;
- sem alteração do modelo criptográfico;
- não foi apresentada biometria/passkey inexistente.

## 2026-09-05 — Protótipo Compras e sistema de ícones v55/v54

- Lucide definido como conjunto funcional oficial e local;
- pesquisa/selects/botões compactos normalizados em iOS/Android/desktop;
- corrigidos ícones cortados e `+` duplicado;
- Lista de compras aproximada do protótipo aprovado;
- título, scanner, cartões-resumo, ações e navegação inferior normalizados.

## 2026-09-05 — Mercado real, scanner e faturas v53

- preços Continente/Pingo Doce integrados através de `cesta.pt/mcp`;
- preço pesquisado mantido separado do preço efetivamente pago;
- quantidade passou a participar corretamente no subtotal;
- leitor EAN/UPC/GTIN criado com câmara;
- QR fiscal de faturas criado como preenchimento assistido;
- Mercadona retirada da produção enquanto não existir fonte portuguesa verificável.
