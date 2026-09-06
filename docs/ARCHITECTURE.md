# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build em validação: v60

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. A v60 introduz apenas um leitor externo restrito para páginas públicas de produtos, porque Continente e Pingo Doce não expõem o HTML dessas páginas por CORS ao browser. O leitor nunca recebe dados do cofre.

## Camadas principais

### Estrutura e apresentação

- `index.html` — estrutura semântica, CSP base, páginas, navegação e diálogos.
- `styles.css` — estilos base/legados.
- `design-system.css` — tokens, componentes e responsividade principal.
- `mobile-layout.css` — estabilidade do viewport móvel/Safari.
- `market-experience.css` — descoberta/comparação de produtos.
- `market-barcode.css` — scanner EAN/UPC/GTIN.
- `ui-icons.css` — sistema visual Lucide e overrides finais.
- `invoice-capture.css` — leitor QR de faturas.
- `app-update.css` — Centro de Atualização de Software.
- `market-image-audit.css` — miniaturas tácteis e visualizador ampliado.

### JavaScript

- `core.js` — estado, normalização, cifragem, IndexedDB, segurança e utilitários.
- `finance.js` — cálculos financeiros.
- `render.js` — renderização das páginas/listas.
- `forms.js` — formulários e validação.
- `sync.js` — sincronização cifrada opcional via GitHub.
- `ui-icons.js` — subset Lucide local e hidratação de controlos.
- `events.js` — eventos, navegação, viewport, cofre e Service Worker.
- `market-experience.js` — contrato existente do Mercado, preços e criação confirmada de itens.
- `market-image-audit.js` — v60: expansão progressiva da pesquisa, resolução oficial de imagens por SKU, fallback Open Facts e zoom.
- `market-barcode.js` — leitura GTIN e identificação assistida.
- `invoice-capture.js` — leitura local do QR fiscal.
- `app-update.js` — notas de release e verificação de atualização.

## Modelo de dados

O schema financeiro permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. No Mercado:

- `estimatedCents` — preço unitário estimado/consultado;
- `actualCents` — preço efetivamente pago quando confirmado;
- `quantity` e `unit` — quantidade separada do preço;
- `productCode` — GTIN/EAN opcional;
- `imageUrl` — URL segura de fotografia;
- `imageSource` — origem textual da fotografia;
- `imageMatchedAt` — momento da correspondência.

A v60 não acrescenta binários nem altera o schema. Apenas reaproveita os metadados opcionais de imagem criados anteriormente.

## Mercado — responsabilidades separadas

### 1. Catálogo e preços

`cesta.pt/mcp` é a origem dos resultados de Pingo Doce/Continente. Continua responsável por:

- nome;
- embalagem;
- preço atual;
- preço anterior/promoção quando disponível;
- `pid`;
- URL oficial do produto.

A camada v60 substitui progressivamente a função de pesquisa em runtime sem alterar os eventos existentes. A chamada passa a usar `limit:20`; o parser admite até 40 resultados normalizados. Só são aceites resultados cuja URL seja uma página oficial válida de Continente/Pingo Doce.

### 2. Identificação por código de barras

`market-barcode.js` lê EAN/UPC/GTIN localmente. O código identifica o SKU, não o preço. A identificação pode usar Open Food Facts e entrega o nome ao fluxo de pesquisa de preços.

### 3. Fotografia oficial v60

`market-image-audit.js` dá prioridade à fotografia do próprio SKU da cadeia.

#### Entrada permitida

Uma URL só entra no leitor se `safeRetailerProductUrl()` a reconhecer:

- Continente: HTTPS, host `continente.pt`/`www.continente.pt`, caminho `/produto/...-<pid>.html`;
- Pingo Doce: HTTPS, host `pingodoce.pt`/`www.pingodoce.pt`, caminho `/home/produtos/...-<pid>.html`.

Qualquer outro host/caminho é rejeitado antes do pedido.

#### Porque existe o leitor

As páginas oficiais devolvem conteúdo sem `Access-Control-Allow-Origin` utilizável pelo GitHub Pages. Portanto, a PWA não consegue executar `fetch()` direto ao HTML do retalhista.

A v60 usa `https://r.jina.ai/<url-oficial-validada>` apenas como **reader** da página pública. Headers relevantes:

- `Accept: application/json`;
- `X-With-Images-Summary: true`;
- `X-Retain-Images: true`;
- `credentials:'omit'`;
- `referrerPolicy:'no-referrer'`.

Não é um proxy genérico exposto ao utilizador: a aplicação constrói o pedido exclusivamente a partir de uma URL oficial já validada.

#### Saída permitida

Mesmo que o reader devolva várias URLs, `safeRetailerImageUrl()` aceita apenas:

**Continente**

- host `www.continente.pt`;
- caminho de `Sites-col-master-catalog`;
- ficheiro JPG/PNG/WebP;
- sem `noimage`/fallback;
- caminho contendo exatamente o `pid` do SKU.

**Pingo Doce**

- host `static.pingodoce.pt`;
- caminho `Sites-pingo-doce-master`;
- diretório `images/large`, `medium` ou `small`;
- ficheiro JPG/PNG/WebP;
- nome do ficheiro iniciado pelo `pid` exato.

A seleção prefere imagem frontal/maior resolução quando existem várias candidatas válidas.

### 4. Fallback visual

Quando a imagem oficial não pode ser resolvida:

1. GTIN/EAN exato nas bases Open Facts;
2. pesquisa textual em Open Food Facts / Open Beauty Facts / Open Products Facts / Open Pet Food Facts;
3. score mínimo `0.74`;
4. placeholder se não houver correspondência segura.

A aplicação nunca utiliza uma imagem de variante apenas para evitar um espaço vazio.

## Produtos já guardados

Itens antigos podem não ter URL oficial. Para os que não possuem uma imagem oficial válida, a v60:

1. pesquisa o nome no `cesta.pt`;
2. calcula correspondência entre o nome guardado e o catálogo;
3. exige score >= `0.96`;
4. rejeita empates/variantes ambíguas;
5. só depois resolve a página oficial e persiste a fotografia.

Este processo é enriquecimento visual e não altera preço, quantidade ou estado comprado.

## Carregamento progressivo

Para não consultar dezenas de páginas simultaneamente:

- `IntersectionObserver` audita cartões visíveis ou próximos;
- `rootMargin: 800px 0px` antecipa o carregamento antes de o cartão entrar no ecrã;
- máximo de três resoluções concorrentes;
- cache de resolução em memória evita repetição na mesma sessão.

Ao carregar no `+`, se o produto tiver URL oficial mas a imagem ainda não tiver sido resolvida, um listener em capture phase aguarda a tentativa antes de chamar a função `addProduct()` existente. Se a resolução falhar, o produto é adicionado normalmente.

## Visualizador de imagem

Uma fotografia válida transforma `.market-product-photo` num botão acessível. O `#marketProductImageViewer`:

- usa `<dialog>`;
- `object-fit: contain`;
- fecha por botão, Esc ou backdrop;
- usa safe areas;
- suporta dark mode;
- respeita `prefers-reduced-motion`;
- mantém `referrerPolicy='no-referrer'`.

## Segurança do cofre

O modelo de acesso permanece:

- IndexedDB local;
- PBKDF2-SHA-256;
- AES-GCM;
- credencial não persistida em claro;
- envelope cifrado para backup/sync.

A v60 não altera PIN, palavra-passe, derivação de chave, sessão, permissões nem sincronização.

## Privacidade de rede

Dados permitidos fora da aplicação durante o Mercado:

- termo de pesquisa de produto → `cesta.pt`;
- URL pública oficial do produto → `r.jina.ai` apenas para leitura da página;
- GTIN/nome de produto → bases Open Facts quando necessário.

Nunca são enviados ao reader/Open Facts:

- PIN/palavra-passe;
- chave do cofre;
- token GitHub;
- faturas;
- saldo;
- montantes do cofre;
- perfil pessoal.

## CSP pública v60

O template `index.html` continua conservador. `scripts/prepare-pages.cjs` compõe a CSP pública.

`img-src` adicional:

- `https://www.continente.pt`
- `https://static.pingodoce.pt`
- hosts de imagem Open Facts já autorizados.

`connect-src` adicional:

- `https://r.jina.ai`
- `https://cesta.pt`
- endpoints Open Facts previstos.

Não existe `connect-src *`, `img-src https:` genérico, Microlink, AllOrigins ou CORS proxy arbitrário.

## Bundle e atualização v60

`scripts/prepare-pages.cjs`:

1. gera `dist/` por allowlist;
2. copia apenas assets públicos previstos;
3. carimba `app-build=v60`;
4. usa query strings `?v=60`;
5. injeta `app-update.*` e `market-image-audit.*`;
6. aplica CSP v60;
7. carimba `dist/events.js` para `./sw.js?v=60`.

Service Worker:

`conta-de-casa-public-v60-retailer-images`

O Centro de Atualização mostra v60 em `APP_RELEASE_NOTES`.

## CI e probes

`scripts/probe-market-sources.cjs` verifica de forma não bloqueante:

- inicialização/pesquisa do `cesta.pt`;
- presença de Continente e Pingo Doce no catálogo;
- leitura Jina das duas páginas reais usadas como amostra;
- existência de imagem oficial contendo o `pid` esperado;
- CORS disponibilizado ao domínio GitHub Pages.

`tests/market-image-audit.test.cjs` valida também hosts, paths, pids, rejeição de imagem errada, CSP, BUILD, zoom, concorrência e handoff do botão de adicionar.

CI funcional v60: `34001300466` — `success`.

## Faturas e QR

`invoice-capture.js` continua a fazer preenchimento assistido do QR fiscal. Vídeo/imagem são processados localmente e não persistidos. Campos financeiros só são guardados pelo fluxo normal após confirmação.

## Ícones e UI

Lucide permanece a linguagem visual oficial, vendorizada localmente em `ui-icons.js`. Não há icon font/CDN de ícones em runtime. Controlos mantêm semântica nativa e áreas tácteis adequadas.

## Viewport e acessibilidade

- shell estrutural: `100dvh` / `100svh`;
- `VisualViewport` apenas para estados transitórios;
- safe areas em navegação, scanners, cofre, update center e viewer;
- foco visível;
- `prefers-reduced-motion` remove movimento não essencial.

## Regras de manutenção

- preço, identidade e fotografia continuam responsabilidades distintas;
- nunca aceitar URL de página de retalhista fora da allowlist estrita;
- nunca aceitar imagem oficial sem validação do host/path/pid;
- se o reader falhar, usar fallback; não bloquear a compra;
- novas origens exigem decisão, CSP explícita e testes;
- manter concorrência limitada e carregamento lazy;
- cada release atualiza BUILD, SW cache, `APP_RELEASE_NOTES`, testes e documentação;
- alterações de UI/rede devem ser validadas em iPhone/Safari e Android/Chrome reais.
