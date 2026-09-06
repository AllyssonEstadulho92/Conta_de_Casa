# Decisões Técnicas — Conta de Casa

Atualizado: 6 de setembro de 2026

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

**Decisão:** uma fotografia pode ser mostrada quando há correspondência suficientemente forte ou GTIN, mas não é tratada como origem do preço. A partir de D-015, uma imagem só pode ser designada oficial quando host, caminho e `pid` correspondem ao SKU oficial.

**Motivo:** imagem e preço têm proveniência independente; uma imagem errada é pior do que um placeholder.

## D-013 — Atualização usa Service Worker same-origin e canal estável

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** `app-update.js/.css` usa `ServiceWorkerRegistration.update()`, `SKIP_WAITING`, `controllerchange` e `APP_RELEASE_NOTES`. Beta permanece desativado sem pipeline própria.

**Motivo:** reutilizar o mecanismo nativo da PWA sem backend de versões ou novo endpoint externo.

## D-014 — Auditar imagens por SKU com Open Facts e ampliação

Data: 5 de setembro de 2026 · Estado: aceite; complementada por D-015

**Decisão:** criar `market-image-audit.js/.css`; auditar cada produto individualmente, preferir GTIN/EAN, usar Open Food/Beauty/Products/Pet Facts com score mínimo `0.74`, limitar concorrência a três, persistir apenas URL/metadados e manter placeholder quando não houver correspondência segura. Qualquer fotografia válida é ampliável em `<dialog>`.

**Motivo:** a pesquisa ampla inicial de Open Food Facts deixava muitos produtos sem imagem e as miniaturas existentes eram estáticas.

**Limitação v59:** a fotografia continuava a vir de Open Facts; portanto não resolvia necessariamente a imagem efetivamente usada pelo Continente/Pingo Doce para esse SKU.

## D-015 — Imagem oficial exige página oficial validada + PID exato

Data: 6 de setembro de 2026 · Estado: aceite

### Contexto

A validação física da v59 mostrou que vários produtos continuavam com placeholder apesar de terem fotografia nas páginas oficiais. A causa ficou confirmada: `cesta.pt` fornecia nome, preço, `pid` e URL oficial, mas a aplicação procurava a fotografia noutro catálogo. Além disso, o browser não consegue ler diretamente o HTML das páginas Continente/Pingo Doce porque os retalhistas não expõem CORS apropriado ao GitHub Pages.

Foram auditadas as duas páginas reais indicadas pelo utilizador:

- Continente — produto `8167440`;
- Pingo Doce — produto `739490`.

A auditoria confirmou que ambas possuem imagens oficiais identificáveis pelo próprio `pid`, e que um reader controlado consegue expor esses URLs com CORS utilizável pela PWA.

### Decisão

A v60 passa a usar a seguinte prioridade:

1. `cesta.pt/mcp` fornece o resultado e a URL oficial;
2. a URL é aceite apenas se pertencer ao domínio/caminho oficial e terminar num `pid` válido;
3. a página pública é lida através de `r.jina.ai` com `Accept: application/json`, `X-With-Images-Summary: true` e `X-Retain-Images: true`;
4. a aplicação extrai candidatos e volta a validá-los localmente;
5. uma imagem só é classificada como oficial se o host, diretório de catálogo e `pid` coincidirem exatamente com o produto;
6. sem imagem oficial, usar GTIN/EAN Open Facts; depois correspondência textual Open Facts; por fim placeholder.

### Allowlist de saída

**Continente:** `www.continente.pt`, `Sites-col-master-catalog`, JPG/PNG/WebP, caminho contendo o `pid`; imagens `noimage`/fallback são rejeitadas.

**Pingo Doce:** `static.pingodoce.pt`, `Sites-pingo-doce-master`, `images/large|medium|small`, JPG/PNG/WebP, nome do ficheiro iniciado pelo `pid`.

Não é aceite qualquer URL de imagem de host genérico apenas por ter sido devolvida pelo reader.

### Catálogo

A mesma camada substitui progressivamente a chamada de pesquisa, mantendo o contrato de eventos existente, para pedir `limit:20` ao `cesta.pt` e admitir até 40 resultados normalizados. Isto aumenta a variedade sem introduzir catálogo local fictício.

### Desempenho

As imagens oficiais são resolvidas apenas para cartões visíveis ou próximos através de `IntersectionObserver` (`rootMargin: 800px`) e continuam limitadas a três resoluções concorrentes. O botão `+` aguarda a tentativa de imagem oficial antes de persistir o produto, mas uma falha de imagem nunca bloqueia a adição.

### Produtos antigos

Itens já guardados sem URL oficial podem ser reencontrados pelo nome no `cesta.pt`. Só é aceite uma correspondência com score >= `0.96` e sem empate/variante ambígua. Caso contrário, não se força a imagem oficial.

### Segurança e privacidade

- `r.jina.ai` recebe apenas uma URL pública já validada de produto; não recebe PIN, chave do cofre, faturas, saldo, token GitHub ou outros dados pessoais/financeiros;
- `credentials:'omit'` e `referrerPolicy:'no-referrer'` permanecem obrigatórios;
- não usar Microlink, AllOrigins ou proxy CORS arbitrário;
- CSP permite `r.jina.ai` apenas em `connect-src` e os dois hosts oficiais apenas em `img-src`;
- URLs e `pid` são novamente validados depois da leitura;
- binários de imagem não são persistidos.

### Motivo

O requisito é apresentar a fotografia fiel do produto da própria cadeia. A associação por `pid` fornece evidência mais forte do que uma semelhança textual numa base externa. O reader é introduzido apenas para ultrapassar a barreira CORS de páginas públicas e fica cercado por validação de entrada e saída.

### Risco residual

O retalhista pode mudar o domínio/CDN, estrutura de página ou paths de catálogo; `cesta.pt` ou o reader podem ficar temporariamente indisponíveis. Nesses casos a aplicação recua para os fallbacks existentes e nunca inventa uma fotografia.

### Validação

O CI v60 testa os dois exemplos reais, rejeição de `pid` incorreto, hosts não autorizados, CSP, fallback, lazy loading, zoom e regressões completas. A validação física em Safari/iPhone continua necessária após publicação.
