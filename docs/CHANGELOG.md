# Changelog Técnico — Conta de Casa

## 2026-09-06 — Imagens oficiais e catálogo alargado v60

### Problema confirmado

A v59 conseguia ampliar fotografias e fazer fallback através das bases Open Facts, mas não obtinha diretamente a fotografia do SKU da página oficial do Continente/Pingo Doce. Por isso, vários produtos com imagem no site da cadeia continuavam com placeholder na aplicação.

A auditoria confirmou ainda que as páginas oficiais não fornecem CORS diretamente ao GitHub Pages, impedindo `fetch()` do HTML pelo Safari/Chrome da PWA.

### Evidência dos exemplos reais

Foram usados os dois SKUs fornecidos pelo utilizador:

- Continente `8167440` — Compressas Gaze 20 × 20 cm;
- Pingo Doce `739490` — Arroz Carolino Cigala.

O probe v60 confirmou:

- `cesta.pt` devolve resultados das duas cadeias e as respetivas páginas oficiais;
- o Continente possui imagem de catálogo cujo path contém `8167440`, incluindo a frente do produto;
- o Pingo Doce possui imagem no CDN oficial cujo ficheiro começa por `739490`;
- as páginas diretas não são legíveis pela PWA por CORS;
- `r.jina.ai`, usado como reader da URL oficial já validada, devolve as páginas com CORS compatível e expõe os URLs oficiais das imagens dos dois exemplos.

### Alterações

- `market-image-audit.js` passa a priorizar imagem oficial do SKU antes dos fallbacks Open Facts;
- criada validação estrita de URL oficial de produto através de `safeRetailerProductUrl()`;
- criada validação estrita da imagem através de `safeRetailerImageUrl()`;
- Continente aceita apenas `www.continente.pt`, `Sites-col-master-catalog`, formato de imagem previsto e `pid` exato no path;
- Pingo Doce aceita apenas `static.pingodoce.pt`, `Sites-pingo-doce-master`, `images/large|medium|small` e ficheiro iniciado pelo `pid` exato;
- conteúdo genérico, host diferente, `pid` diferente, `noimage` e fallback são rejeitados;
- leitura da página usa apenas `https://r.jina.ai/<URL-oficial-validada>` com `Accept: application/json`, `X-With-Images-Summary: true` e `X-Retain-Images: true`;
- Open Facts permanece como fallback por GTIN/EAN e depois correspondência textual >= `0.74`;
- produtos guardados sem URL oficial podem ser reencontrados no `cesta.pt` apenas com correspondência de nome >= `0.96` e sem ambiguidade;
- a pesquisa passa a pedir `limit:20` ao `cesta.pt` e admite até 40 resultados normalizados, aumentando a variedade disponível;
- imagens são auditadas progressivamente com `IntersectionObserver` e `rootMargin: 800px`;
- continuam no máximo três resoluções concorrentes;
- o botão `+` aguarda a tentativa de fotografia oficial antes de persistir o produto, mas falha de imagem nunca bloqueia a adição;
- miniaturas continuam ampliáveis no visualizador `<dialog>` da v59.

### Segurança e privacidade

- o reader recebe apenas uma URL pública previamente validada do Continente/Pingo Doce;
- nenhuma credencial, PIN, chave do cofre, token GitHub, fatura, saldo ou valor financeiro é enviado para resolver a fotografia;
- pedidos usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- Microlink foi auditado e não foi adotado; AllOrigins/proxies CORS arbitrários também não são usados;
- a resposta do reader não é confiada diretamente: cada imagem é novamente validada por host, catálogo e `pid`;
- CSP pública v60 acrescenta `r.jina.ai` apenas a `connect-src` e `www.continente.pt` / `static.pingodoce.pt` apenas a `img-src`;
- não foi aberto `connect-src *` nem `img-src https:` genérico;
- binários de imagem continuam fora do cofre.

### Build e atualização

- build público preparado como `v60`;
- cache do Service Worker passa a `conta-de-casa-public-v60-retailer-images`;
- Centro de Atualização recebe **v60 — Imagens oficiais e catálogo alargado**;
- bundle Pages carimba assets com `?v=60` e aplica a CSP v60.

### Testes

- `scripts/probe-market-sources.cjs` verifica cesta + imagens oficiais dos dois exemplos de forma não bloqueante;
- `tests/market-image-audit.test.cjs` valida URLs oficiais, hosts, paths, `pid`, rejeição de SKU errado, reader, fallback Open Facts, lazy loading, zoom, handoff do `+`, CSP e build;
- testes de Mercado, imagens, update center, responsividade e Lucide foram alinhados para v60;
- workflow funcional da branch `34001300466` terminou com `success`, incluindo todas as regressões financeiras, segurança, QR, scanner, UI, acessibilidade e sincronização.

### Limitação residual

Não se promete imagem para um SKU cuja página oficial não tenha fotografia identificável ou quando a cadeia/`cesta.pt`/reader estiver temporariamente indisponível. Nesses casos é usado o fallback seguro e, se necessário, placeholder. A prioridade continua a ser não apresentar uma variante errada.

## 2026-09-05 — Auditoria e ampliação de imagens de produto v59

### Problema observado

Na pesquisa **Adicionar produto** em iPhone, vários resultados de Pingo Doce/Continente apareciam com o placeholder diagonal apesar de existirem fotografias públicas do artigo. As miniaturas que existiam também eram estáticas: tocar nelas não abria uma imagem maior.

A causa principal era a estratégia v57: uma única pesquisa ampla no Open Food Facts para todo o termo, com poucos candidatos, seguida de matching para vários resultados. Em pesquisas genéricas como “café”, isso não cobria todos os SKUs devolvidos pelo retalhista.

### Alterações

- criado `market-image-audit.js` para auditar cada resultado sem imagem individualmente;
- criado `market-image-audit.css` para miniaturas tácteis e visualizador fullscreen/responsivo;
- resultados existentes com fotografia passam a poder ser tocados/clicados para ampliar;
- novo `<dialog id="marketProductImageViewer">` mostra imagem ampliada, nome e origem;
- fecho por botão, Esc e backdrop;
- safe areas, dark mode, foco visível e `prefers-reduced-motion` suportados;
- resolução de imagem passa a preferir GTIN/EAN exato quando disponível;
- para resultados Continente, o `pid` já devolvido pelo fluxo `cesta.pt` é usado para tentar obter EAN via `get_product`;
- sem código exato, cada artigo é pesquisado por nome + embalagem;
- matching textual considera cobertura de tokens, precisão, nome, marca e quantidade;
- resultados abaixo de `0.74` são rejeitados;
- auditoria limitada a três produtos simultâneos para evitar rajadas de rede;
- itens já guardados sem imagem também são auditados progressivamente;
- imagens resolvidas persistem URL/origem/data e código comprovável, sem binários.

### Fontes de imagem v59

- Open Food Facts;
- Open Beauty Facts;
- Open Products Facts;
- Open Pet Food Facts.

O preço e a ligação oficial continuaram no `cesta.pt`; a v60 passa a usar a própria página oficial como primeira fonte visual.

### Segurança v59

- sem API key/Authorization;
- pedidos com `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- CSP limitada às famílias Open Facts necessárias;
- nenhum conteúdo financeiro/cofre enviado para resolver imagens.

### Build v59

- build `v59`;
- cache `conta-de-casa-public-v59-product-images`;
- novos assets de auditoria/zoom adicionados ao bundle e SW;
- CI e Deploy Pages concluídos com sucesso.

## 2026-09-05 — Centro de Atualização de Software v58

- criado `app-update.js`/`.css`;
- adicionada **Definições → Atualização de Software**;
- estado de atualizações automáticas ligado ao Service Worker real;
- Beta mantido desativado sem pipeline própria;
- verificação manual usa `ServiceWorkerRegistration.update()` e `SKIP_WAITING`;
- `APP_RELEASE_NOTES` passa a concentrar novidades de cada versão;
- bundle Pages carimbado como v58;
- cache `conta-de-casa-public-v58-software-update`;
- PR #29, CI de `main` e Deploy Pages concluídos com sucesso.

## 2026-09-05 — Fotografias reais v57

- removido o avatar que simulava fotografia;
- introduzidos `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt`;
- primeira pesquisa de fotografia real via Open Food Facts;
- apenas correspondências fortes eram apresentadas;
- imagem permanecia separada do preço e da ligação oficial;
- apenas URL/metadados eram persistidos, sem binários.

## 2026-09-05 — Cofre moderno v56

- ecrã de PIN redesenhado com cartão moderno, teclado circular e safe areas;
- PIN/palavra-passe, PBKDF2, AES-GCM e IndexedDB preservados;
- não foi apresentada biometria/passkey inexistente;
- dark mode e redução de movimento mantidos.

## 2026-09-05 — Hierarquia mobile e Lucide v55/v54

- Lucide adotado como sistema visual oficial local;
- pesquisa Safari e setas de `select` normalizadas;
- removido `+` visual duplicado em botões compactos;
- página Lista de compras aproximada do protótipo aprovado;
- título com carrinho, scanner como ação secundária, cartões-resumo e navegação inferior normalizados;
- sem alterações aos cálculos financeiros.

## 2026-09-05 — QR de faturas e scanner de produtos

- leitura QR de faturação portuguesa por câmara/imagem, com pré-visualização antes de preencher;
- imagens de faturas não persistidas;
- scanner EAN/UPC/GTIN com ZXing fixo;
- GTIN identifica o artigo e não é tratado como preço;
- câmara processada localmente e encerrada em todos os fluxos relevantes.

## 2026-09-05 — Mercado v53/v52

- Pingo Doce e Continente passam a fornecer preços atuais através de `cesta.pt/mcp`;
- Mercadona removida por ausência de fonte portuguesa suficientemente verificável;
- `estimatedCents` representa preço pesquisado por unidade;
- `actualCents` continua separado para preço efetivamente pago;
- quantidade multiplica automaticamente o preço por unidade nos totais;
- criação, edição, filtros e cálculos financeiros mantêm invariantes testadas.

## Histórico anterior

As revisões anteriores a v52 permanecem preservadas no histórico Git do repositório. Este changelog consolidado mantém as alterações materialmente relevantes para a arquitetura atual.
