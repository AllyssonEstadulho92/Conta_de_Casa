# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público confirmado: v59
Build em validação: v60
Distribuição: GitHub Pages
Branch de implementação: `fix/retailer-product-images-v60`
Estado da revisão: imagens oficiais por SKU e catálogo alargado implementados; CI funcional da branch `34001300466` concluído com `success`; integração em `main`, Deploy Pages v60 e validação física no iPhone ainda pendentes.

## Estado atual

A aplicação permanece uma PWA estática/local-first. O cofre continua cifrado no navegador, os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional. O schema financeiro mantém-se na versão 5. Não foram alterados PIN/palavra-passe, PBKDF2, AES-GCM, faturas, cálculos, quantidades, backups ou contratos de sincronização.

A v60 corrige a causa real das miniaturas vazias observadas no Mercado: a v59 conseguia ampliar imagens e procurar referências Open Facts, mas não recebia a fotografia do SKU oficial do Continente/Pingo Doce.

## Revisão v60 — imagens oficiais e catálogo alargado

### Origem do produto

`cesta.pt/mcp` continua responsável por nome, preço, promoção, embalagem, `pid` e ligação oficial do produto. A pesquisa v60 passa a solicitar até 20 resultados à fonte e admite até 40 resultados normalizados no conjunto apresentado, preservando apenas Pingo Doce e Continente.

### Resolução da fotografia oficial

A prioridade passa a ser:

1. ligação oficial do SKU devolvida pelo `cesta.pt`;
2. validação estrita do domínio e do `pid` da página;
3. leitura da página pública através de `r.jina.ai`, necessária porque as páginas dos retalhistas não expõem CORS ao GitHub Pages;
4. seleção exclusiva de imagens do catálogo/CDN oficial contendo o `pid` exato do SKU;
5. GTIN/EAN + Open Facts como primeiro fallback;
6. correspondência textual Open Facts com confiança mínima de 0,74 como último fallback;
7. placeholder se nenhuma origem segura corresponder.

Hosts oficiais aceites para imagem:

- Continente: `www.continente.pt`, apenas caminhos de `Sites-col-master-catalog` e ficheiros cujo caminho identifica o `pid` do produto;
- Pingo Doce: `static.pingodoce.pt`, apenas `Sites-pingo-doce-master/images/(large|medium|small)` e ficheiro iniciado pelo `pid` do produto.

A aplicação não aceita uma URL arbitrária devolvida pelo leitor. A entrada e a saída são validadas pelo SKU.

### Evidência técnica com os exemplos reais

O probe de CI confirmou os dois exemplos fornecidos durante a revisão:

- Continente `8167440` — a página pública contém a fotografia oficial `8167440-frente.jpg` no catálogo Continente;
- Pingo Doce `739490` — a página pública contém imagens oficiais `739490_...jpg` no CDN Pingo Doce;
- as páginas diretas não fornecem `Access-Control-Allow-Origin` ao browser;
- `r.jina.ai` devolveu as páginas com CORS compatível com `https://allyssonestadulho92.github.io` e expôs candidatos contendo os dois `pid` exatos.

O script `scripts/probe-market-sources.cjs` mantém uma verificação pequena e não bloqueante dessas dependências no CI.

### Desempenho e comportamento

A resolução de fotografias é progressiva. `IntersectionObserver` inicia a auditoria apenas para cartões visíveis ou próximos do viewport (`rootMargin: 800px`) e o máximo continua a três resoluções concorrentes. Isto permite um catálogo maior sem disparar dezenas de leituras de página simultaneamente.

Ao tocar no botão `+`, se o resultado ainda não tiver fotografia oficial resolvida, o fluxo aguarda a tentativa de resolução antes de chamar a função de adição existente. Se o serviço de imagem estiver indisponível, o produto continua a poder ser adicionado sem bloquear o Mercado.

Produtos antigos sem ligação oficial guardada são reavaliados pelo nome através do `cesta.pt`; só uma correspondência forte e não ambígua pode ser usada para recuperar uma fotografia oficial.

As miniaturas continuam tácteis/clicáveis e abrem o visualizador responsivo introduzido na v59.

## Segurança e privacidade v60

- nenhum dado financeiro, PIN, palavra-passe, token GitHub ou chave criptográfica é enviado ao leitor de páginas;
- o leitor recebe apenas uma URL pública de produto já validada como Continente/Pingo Doce;
- pedidos externos usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- não são usados Microlink, AllOrigins ou proxies CORS genéricos;
- a CSP pública autoriza `r.jina.ai` apenas em `connect-src` e apenas os dois hosts oficiais de imagem em `img-src`, além dos hosts Open Facts já previstos;
- apenas URL/origem/data/código opcional são persistidos; binários não entram no cofre;
- falha do leitor não altera preços nem impede a adição do produto.

## Build e cache v60

`scripts/prepare-pages.cjs` compõe `v60`. O Service Worker usa `conta-de-casa-public-v60-retailer-images`. `app-update.js` inclui a nova versão em **Definições → Atualização de Software → Mais detalhes**.

## Validação automatizada

CI da revisão funcional: workflow `34001300466` — `success`.

Passaram:

- probe real de `cesta.pt` e das duas imagens oficiais de exemplo;
- sintaxe de todos os módulos;
- finanças e auditoria financeira;
- isolamento do cofre;
- formulários e QR de faturas;
- pesquisa Mercado e preços;
- testes de imagens oficiais, fallback e zoom;
- scanner de código de barras;
- quantidades e contabilização;
- auditoria de ícones;
- Centro de Atualização;
- segurança/CSP;
- responsividade e viewport móvel;
- navegação e acessibilidade;
- sincronização e manifest.

## Estado das revisões anteriores

- v59: auditoria individual Open Facts e ampliação de miniaturas, publicada com sucesso.
- v58: Centro de Atualização de Software, publicado com sucesso.
- v57: primeiros metadados `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt`.
- v56/v55: cofre moderno, Lucide e hierarquia mobile de Compras.

## Limitações conhecidas

A v60 aumenta muito a cobertura, mas não pode prometer fotografia para um SKU cuja página oficial não contenha uma imagem identificável ou quando `cesta.pt`/Jina/retalhista estiver temporariamente indisponível. Nesses casos o fallback Open Facts é tentado e, por fim, permanece o placeholder. A aplicação prefere ausência de imagem a uma fotografia de variante errada.

A validação automatizada não substitui a confirmação física no Safari/iPhone para carregamento progressivo, toque/zoom, safe areas e comportamento com rede móvel.

## Próximo passo

1. integrar a branch apenas mantendo CI verde;
2. confirmar CI de `main` e Deploy Pages v60;
3. no iPhone, abrir **Atualização de Software** e confirmar v60;
4. pesquisar os SKUs `8167440` e `739490` e verificar miniatura + ampliação;
5. testar pesquisas amplas como café, arroz, leite e limpeza para confirmar a maior variedade;
6. validar 320, 375, 390 e 430 px e funcionamento com rede lenta/offline.
