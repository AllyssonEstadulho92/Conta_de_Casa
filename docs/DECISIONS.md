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

Data: 5 de setembro de 2026 · Estado: aceite; expandida por D-014

**Decisão:** uma fotografia pode ser mostrada quando há correspondência suficientemente forte ou GTIN, mas não é tratada como origem do preço nem automaticamente como imagem oficial do retalhista.

**Motivo:** imagem e preço têm proveniência independente; uma imagem errada é pior do que um placeholder.

## D-013 — Atualização usa Service Worker same-origin e canal estável

Data: 5 de setembro de 2026 · Estado: aceite

**Decisão:** `app-update.js/.css` usa `ServiceWorkerRegistration.update()`, `SKIP_WAITING`, `controllerchange` e `APP_RELEASE_NOTES`. Beta permanece desativado sem pipeline própria.

**Motivo:** reutilizar o mecanismo nativo da PWA sem backend de versões ou novo endpoint externo.

## D-014 — Auditar imagens por SKU sem introduzir proxy de scraping

Data: 5 de setembro de 2026 · Estado: aceite

### Contexto

A captura real de **Adicionar produto** mostrou vários resultados de Pingo Doce/Continente com placeholder, mesmo para artigos que possuem fotografias nas páginas das lojas. A v57 usava uma única pesquisa textual ampla no Open Food Facts e um conjunto pequeno de candidatos; isto era insuficiente em termos genéricos como “café”. As miniaturas existentes também eram estáticas.

A aplicação é uma PWA estática. Ler diretamente o HTML das páginas de Continente/Pingo Doce no browser não é uma API estável: depende de CORS, estrutura do retalhista, cookies/anti-bot e alterações de front-end. A alternativa de um proxy genérico acrescentaria uma entidade externa com quotas, privacidade e disponibilidade próprias.

### Decisão

Criar `market-image-audit.js` e `market-image-audit.css` como camada progressiva v59.

Para cada produto sem imagem:

1. auditar individualmente, em vez de depender apenas da pesquisa ampla inicial;
2. usar `productCode`/GTIN quando já existe;
3. para resultados Continente com `pid`, consultar `cesta.pt/get_product` para tentar obter EAN exato;
4. pesquisar por código nas bases Open Facts quando disponível;
5. sem código, pesquisar nome + embalagem e calcular score por nome, marca, tokens e quantidade;
6. aceitar apenas `score >= 0.74`;
7. limitar a três resoluções concorrentes;
8. manter placeholder se não existir correspondência segura.

Bases autorizadas:

- Open Food Facts;
- Open Beauty Facts;
- Open Products Facts;
- Open Pet Food Facts.

A seleção é orientada pelo tipo/categoria do produto, com fallback entre bases.

### Ampliação

Qualquer fotografia real torna-se um botão acessível. O toque/clique abre um `<dialog>` fullscreen/responsivo com imagem ampliada, nome, origem, fecho por botão/Esc/backdrop, safe areas, dark mode e redução de movimento.

### Persistência

Quando uma imagem é resolvida para um item já guardado, persistir apenas:

- `productCode` comprovável, se em falta;
- `imageUrl`;
- `imageSource`;
- `imageMatchedAt`.

Não guardar binários.

### Segurança e privacidade

- sem proxy genérico (Microlink/Jina/AllOrigins/CORS proxy ou equivalente);
- sem API key/Authorization;
- `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- CSP limitada às quatro famílias Open Facts e ao `cesta.pt` já existente;
- nenhum valor financeiro, PIN, token GitHub ou conteúdo do cofre é enviado para resolver imagens.

### Motivo

Esta abordagem aumenta a cobertura e a precisão sem transformar a PWA num scraper de páginas de lojas nem acrescentar um backend apenas para imagens. EAN/GTIN exato é preferido sempre que possível. Quando isso não existe, o score textual reduz a probabilidade de variante errada.

### Limitação aceite

Não se promete 100% de cobertura. Alguns SKUs não têm fotografia pública ou não têm identificador suficiente para uma correspondência segura. Nesses casos o placeholder é o resultado correto.

### Consequência

A v59 acrescenta duas novas camadas públicas, novas origens CSP explicitamente permitidas, um teste dedicado (`tests/market-image-audit.test.cjs`) e cache `conta-de-casa-public-v59-product-images`. A validação final exige iPhone/Safari com amostras reais, incluindo produtos com e sem correspondência.
