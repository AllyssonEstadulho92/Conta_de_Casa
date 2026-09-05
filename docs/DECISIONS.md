# Decisões Técnicas — Conta de Casa

Atualizado: 5 de setembro de 2026

Este ficheiro mantém as decisões arquiteturais vigentes e o respetivo fundamento. O histórico detalhado permanece no Git; aqui fica a versão consolidada necessária para continuidade do projeto.

## D-001 — Separar altura estrutural do VisualViewport

Data: 4 de setembro de 2026 · Estado: aceite

**Decisão:** `.app-shell`/`.main` usam `100dvh` com `100svh` como mínimo. `VisualViewport` fica reservado a teclado e diálogos.

**Motivo:** Safari/iPhone altera a altura visual com barras/teclado; usar essa medida como altura permanente causava cortes.

## D-002 — Camada de compatibilidade móvel dedicada

Data: 4 de setembro de 2026 · Estado: aceite

**Decisão:** manter `mobile-layout.css` como camada final de compatibilidade em vez de reescrever de imediato CSS legado.

**Motivo:** reduz risco de regressão enquanto o layout é validado em hardware real.

## D-003 — Reduzir densidade vertical dos cartões de Compras

Data: 4 de setembro de 2026 · Estado: aceite

**Decisão:** entre 360 e 560 px, estado e métricas dos itens são compactados; abaixo de 360 px o layout volta a empilhar.

**Motivo:** aumentar informação útil por ecrã sem reduzir legibilidade/alvos tácteis.

## D-004 — Mercado implementado como camada isolada

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** `market-experience.js/.css` alteram apenas descoberta/apresentação do Mercado; edição e regras financeiras existentes permanecem nos módulos anteriores.

**Motivo:** reproduzir o protótipo sem reescrever lógica madura de estado, cifragem e cálculos.

## D-005 — Não apresentar demonstração como preço real

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** nenhum valor fictício pode alimentar cálculos como preço real.

**Motivo:** impedir contaminação dos totais e falsas garantias de atualidade.

## D-006 — Preço pesquisado é estimativa; preço pago permanece separado

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** Continente/Pingo Doce são consultados através de `cesta.pt/mcp`; o valor selecionado entra em `estimatedCents`; `actualCents` fica reservado ao valor efetivamente pago.

**Motivo:** uma consulta de catálogo não prova o montante final de compra.

## D-007 — Código de barras identifica produto; preço continua separado

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** ZXing lê o GTIN localmente; uma base de produto identifica nome/marca; `cesta.pt` continua responsável pelo preço. O utilizador confirma o resultado antes de adicionar.

**Motivo:** EAN/UPC/GTIN não contém o preço atual do retalhista.

## D-008 / D-010 — Lucide como sistema vetorial oficial

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** Lucide é a linguagem de ícones funcional, vendorizada localmente em `ui-icons.js`, sem icon font/CDN. Snapshot: `94e4cb9d9db5907053ebf3636a97c45529cf776b`.

**Motivo:** consistência iOS/Android/desktop, funcionamento offline, CSP mínima e dimensões controladas.

## D-009 — QR fiscal como preenchimento assistido, não OCR automático

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** `invoice-capture.js/.css` lê QR fiscal localmente, mostra pré-visualização e só transfere campos após ação explícita. Imagens/PDFs não são persistidos.

**Motivo:** os campos QR são estruturados; OCR geral introduziria incerteza em valores e datas sem política de confiança adequada.

## D-011 — Protótipo aprovado define a hierarquia da Lista de compras

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** título com carrinho, `+` principal preservado, ação secundária visual de scanner, cartões-resumo com ícones, ações compactas e navegação inferior uniforme.

**Motivo:** alinhar o produto real ao protótipo sem mexer em schema/cálculos.

## D-011B — Modernizar o cofre sem simular biometria/passkey

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** adotar linguagem visual moderna de PIN/teclado circular sem mostrar passkey/biometria enquanto não existir implementação WebAuthn/recuperação real.

**Motivo:** qualidade visual não deve criar uma capacidade de segurança inexistente.

## D-012 — Fotografia é referência visual, não prova de preço/origem comercial

Data: 5 de setembro de 2026 · Estado: aceite; expandida por D-014 e D-015

**Decisão:** uma fotografia pode ser mostrada quando há correspondência suficientemente forte ou GTIN, mas não é tratada como origem do preço. Apenas a proveniência oficial introduzida por D-015 pode usar o rótulo “imagem oficial”.

**Motivo:** imagem e preço têm proveniência independente; uma imagem errada é pior do que um placeholder.

## D-013 — Atualização usa Service Worker same-origin e canal estável

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** `app-update.js/.css` usa `ServiceWorkerRegistration.update()`, `SKIP_WAITING`, `controllerchange` e `APP_RELEASE_NOTES`. Beta permanece desativado sem pipeline própria.

**Motivo:** reutilizar o mecanismo nativo da PWA sem backend de versões ou novo endpoint externo.

## D-014 — Auditar imagens por SKU sem introduzir proxy de scraping

Data: 5 de setembro de 2026 · Estado: aceite; fallback após D-015

**Decisão:** `market-image-audit.js/.css` audita cada produto sem imagem, privilegia GTIN/EAN e usa Open Food Facts, Open Beauty Facts, Open Products Facts e Open Pet Food Facts com score mínimo `0.74`. Miniaturas reais abrem visualizador. Não há proxy genérico.

**Motivo:** aumentar cobertura de fotografias de referência sem apresentar variantes erradas nem introduzir um serviço de scraping externo.

**Consequência v60:** depois de D-015, esta camada deixa de ser a primeira escolha para resultados de Continente/Pingo Doce. É fallback quando o catálogo oficial não publica uma imagem para o SKU.

## D-015 — Gerar índice de fotografias oficiais no build; não fazer scraping no browser

Data: 5 de setembro de 2026 · Estado: aceite

### Contexto

A v59 ainda deixava muitos produtos com placeholder. O problema não era CSS ou Safari: preço e página oficial vinham de `cesta.pt`, mas a fotografia continuava dependente das bases Open Facts. Ler o HTML de cada página do Continente/Pingo Doce no iPhone não é fiável porque as páginas não expõem um contrato CORS apropriado, podem redirecionar e podem mudar mecanismos de sessão/front-end.

Durante a auditoria foi confirmado que os dois retalhistas publicam sitemaps XML próprios com associação direta entre URL do produto e `image:loc`:

- Continente: `sitemap_index.xml` → sitemaps `*-image.xml`;
- Pingo Doce: `home/sitemap_index.xml` → sitemaps `*-product.xml`.

Estes documentos são adequados a processamento no CI/build, onde CORS do browser não se aplica.

### Decisão

Criar `scripts/refresh-retailer-image-index.cjs` e `market-official-images.js`.

O build deve:

1. descarregar apenas os sitemaps oficiais dos dois retalhistas;
2. extrair PID/SKU da URL do produto;
3. validar e extrair a primeira URL oficial `image:loc`;
4. gerar pequenos shards JSON por prefixo de PID;
5. gerar shards de nome apenas para nomes oficiais exatos e únicos, destinados a reparar itens antigos sem PID;
6. falhar se o catálogo ficar anormalmente pequeno ou perder SKUs de controlo conhecidos;
7. copiar os shards para `dist/` sem guardar os binários das fotografias.

O runtime deve:

1. usar `retalhista + pid` do resultado `cesta.pt`;
2. consultar apenas o shard **same-origin** no GitHub Pages;
3. usar a URL oficial desse PID;
4. rotular a origem como `Continente — imagem oficial` ou `Pingo Doce — imagem oficial`;
5. usar Open Facts apenas quando a imagem oficial não existe;
6. manter placeholder quando nenhuma fonte é segura.

### Itens antigos

Itens criados antes da v60 podem não ter `retailerMarketId`/`retailerProductId`. Para esses itens, a aplicação pode usar o índice de nome somente se:

- o nome normalizado corresponder exatamente ao nome do sitemap;
- o nome for único dentro do retalhista;
- existir apenas uma correspondência oficial entre os retalhistas consultados.

Se houver ambiguidade, não atribuir fotografia oficial.

### Segurança

- Continente/Pingo Doce não entram em `connect-src`;
- o browser não lê HTML/API dos retalhistas;
- `img-src` é alargado apenas a `www.continente.pt` e `static.pingodoce.pt`;
- os shards são same-origin e passam por regex estrita no Service Worker;
- sem cookies, Authorization, API keys ou proxy genérico;
- o cofre guarda apenas URL/origem/data, nunca o ficheiro de imagem;
- imagens não alteram preços, quantidades ou estado financeiro.

### Motivo

Esta separação usa uma fonte oficial publicada pelos próprios retalhistas, mantém a PWA estática e evita dependência de scraping em runtime. O PID fornece uma correspondência determinística muito mais forte do que pesquisar uma fotografia por texto.

### Validação

A CI v60 `33996921108` gerou e validou:

- 100 474 produtos Continente;
- 16 018 produtos Pingo Doce;
- 101 558 nomes oficiais exatos únicos;
- Continente SKU `8167440` presente com URL oficial;
- Pingo Doce SKU `739490` presente com URL oficial;
- suite completa de finanças, segurança, Mercado, imagens, UI, responsividade, acessibilidade e sincronização em `success`.

### Limitação aceite

Cobertura oficial significa “o que o retalhista publica no sitemap”, não garantia matemática de 100% dos SKUs existentes. Se o sitemap não publicar uma fotografia, a aplicação mantém o fallback ou placeholder em vez de inventar uma imagem.
