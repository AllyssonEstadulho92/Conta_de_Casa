# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão do drawer móvel: `75-drawer2`
Revisão dos destaques do Mercado: `75-featured1`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-featured1` corrige o bloco móvel **Produtos em destaque**, que continuava visualmente comprimido e distante do protótipo apesar das revisões anteriores. O problema confirmado era de composição: a experiência v74 ainda usava três colunas estreitas no telemóvel e uma área de imagem de apenas 66 px, o que quebrava nomes longos e deixava cartões estranhos quando a fotografia não existia.

## Revisão `75-featured1`

Foram criadas duas camadas específicas:

- `v75-market-featured.css`: geometria, carrossel, cartão, imagem, fallback e controlos;
- `v75-market-featured.js`: recompõe apenas o bloco de destaques sobre os mesmos itens e handlers já existentes.

Comportamento esperado no telemóvel:

- cabeçalho com ícone, título **Produtos em destaque**, subtítulo e ação **Ver todos**;
- cartões largos em carrossel horizontal, com parte do cartão seguinte visível;
- scroll snap, botões anterior/seguinte e indicadores de posição;
- fotografia numa área estável de aproximadamente 150 px;
- nome limitado a duas linhas, evitando texto vertical ou colado ao preço;
- categoria em pill discreta;
- preço isolado e legível;
- rodapé **Na sua lista**, porque os destaques atuais já são itens pendentes da lista de compras;
- fallback visual local elegante quando a fotografia não existe ou falha;
- skeleton discreto durante o carregamento;
- tentativa de recuperar fotografia pelo GTIN já existente através do Open Food Facts quando há `productCode`, sem escrever essa fotografia no estado nem alterar preços.

A revisão não cria produtos fictícios, não inventa preços e não transforma uma fotografia em prova de preço ou transação.

## Cabeçalho, drawer e navegação

O cabeçalho móvel mantém hambúrguer + título à esquerda e notificações à direita. O drawer continua a abrir exclusivamente pela direita, com a paleta `#003f4c → #005965 → #087a78`, menta `#5be0c2` como acento e página clara visível à esquerda.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**.

## Integridade funcional preservada

`75-featured1` não altera:

- `core.js` / persistência;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- IndexedDB;
- pagamentos e histórico;
- PIN e palavra-passe;
- PBKDF2-SHA-256 + AES-GCM;
- QR fiscal e scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada;
- regras de cálculo ou confirmação de preços;
- handlers de edição dos itens do Mercado.

`v75-market-featured.js` lê os itens apenas para apresentação. Não chama `commit()`, `saveState()` nem substitui `appState`.

## Versionamento público

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu funcional: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura: `75-architecture2`;
- cabeçalho: `75-header2`;
- estabilidade: `75-stability1`;
- geometria: `75-layout1`;
- drawer visual: `75-drawer2`;
- destaques Mercado: `75-featured1`;
- cache esperado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1`.

`v75-market-featured.css?v=75-featured1` e `v75-market-featured.js?v=75-featured1` integram a allowlist Pages e o Service Worker.

## QA

A revisão possui `tests/v75-market-featured.test.cjs`, cobrindo:

- carrossel horizontal e scroll snap;
- largura proporcional dos cartões;
- área estável de fotografia;
- limite de duas linhas no nome;
- fallback `Imagem indisponível`;
- recuperação opcional por GTIN;
- ausência de escrita no estado;
- distribuição, ordem dos assets e cache.

CI e Pages passam a executar este teste e a validar a sintaxe de `v75-market-featured.js`.

## Validação manual necessária

No iPhone/Safari/PWA, confirmar:

- cartão largo em vez de três colunas espremidas;
- swipe horizontal natural entre destaques;
- fotografia carregada quando existe URL válida;
- fallback visual limpo quando não existe fotografia;
- nomes longos em no máximo duas linhas;
- preço separado do texto;
- **Ver todos** continua a abrir a pesquisa real do Mercado;
- tocar num destaque continua a abrir os detalhes do item real;
- ausência de overflow horizontal da página fora do próprio carrossel;
- tema escuro, safe areas e navegação inferior sem regressão.

## Próximo passo

Validar `75-featured1` no CI, integrar em `main`, confirmar GitHub Pages e depois comparar visualmente no iPhone com o protótipo aprovado.