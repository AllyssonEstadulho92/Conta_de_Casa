# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão do drawer móvel: `75-drawer2`
Revisão dos destaques do Mercado: `75-featured1`
Revisão da biblioteca de imagens: `75-image-library1`
Revisão do catálogo visual em validação: `75-catalog1`
Branch pública: `main`
Branch de trabalho: `feat/v75-visual-market-catalog`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-featured1` mantém o bloco móvel **Produtos em destaque** em carrossel largo e alinhado com o protótipo. A revisão `75-image-library1` está integrada em `main` e publicada por GitHub Pages, acrescentando uma biblioteca persistente separada para fotografias oficiais do Mercado, sem alterar o estado financeiro.

`75-catalog1` está implementada e validada na branch de trabalho. Acrescenta um catálogo visual progressivo por categorias, com SKUs reais do Continente/Pingo Doce e enriquecimento limitado, mas ainda não deve ser considerada publicada enquanto não for integrada em `main` e distribuída por Pages.

## Biblioteca de imagens `75-image-library1`

Foi criado `market-image-library.js` com uma base IndexedDB própria: `conta-de-casa-market-image-library`.

Objetivo:

- guardar e reutilizar fotografias oficiais já validadas de produtos Continente e Pingo Doce;
- indexar por `marketId|pid`, evitando correspondências apenas por nome;
- restaurar a fotografia de um SKU quando o mesmo produto volta a aparecer no catálogo;
- capturar automaticamente fotografias oficiais que os módulos atuais consigam resolver;
- reduzir cartões vazios e consultas repetidas às páginas dos retalhistas;
- manter os dados financeiros completamente isolados.

Contrato de segurança:

- aceita Continente apenas em `www.continente.pt` e paths `/Sites-col-master-catalog/` com o PID exato;
- aceita Pingo Doce apenas em `static.pingodoce.pt`, `/Sites-pingo-doce-master/` e `images/large|medium|small` com o PID exato;
- URLs de página também são validados pelo retalhista e PID;
- não guarda passwords, PIN, tokens, faturas, preços ou dados do cofre;
- não copia ficheiros binários das lojas para o repositório: guarda apenas a referência oficial validada;
- entradas positivas expiram ao fim de 45 dias e são reavaliadas quando necessário.

A biblioteca observa os cartões reais do catálogo. Quando encontra uma imagem oficial válida, guarda os metadados; quando volta a encontrar o mesmo SKU, pode repor a imagem a partir da biblioteca. O fallback `Imagem indisponível` continua ativo quando não existe fotografia oficial válida.

## Catálogo visual `75-catalog1`

Novos assets:

- `market-visual-catalog.js`;
- `market-visual-catalog.css`;
- `market-catalog-image-resolver.js`;
- `tests/market-visual-catalog.test.cjs`.

Foi criada uma segunda base IndexedDB exclusivamente para o índice visual: `conta-de-casa-market-visual-catalog`, com stores `products` e `meta`. Cada SKU usa a chave `marketId|pid` e guarda apenas nome, embalagem, categorias, URL oficial e timestamps. O catálogo **não guarda preços**.

Categorias iniciais: Bebidas, Lacticínios e ovos, Frutas e legumes, Carne e peixe, Padaria e pastelaria, Mercearia/Despensa, Congelados, Snacks e doces, Higiene pessoal, Limpeza, Bebé e Animais.

A descoberta usa `cesta.pt` apenas para Continente e Pingo Doce. Só entram no índice resultados com PID e página oficial coerentes. Ao tocar em **Ver preço atual**, o cartão reutiliza `#marketCatalogSearch` e o fluxo vivo já existente; o preço é consultado novamente em vez de ser lido do catálogo local.

### Acumulação automática limitada

- máximo de 18 pesquisas por sessão;
- máximo de 48 pesquisas por dia;
- intervalo mínimo de 15 segundos entre passos automáticos;
- apenas uma pesquisa Cesta em voo;
- máximo de 20 tentativas de enriquecimento de imagem por sessão;
- intervalo de 8 segundos entre passos de imagem;
- resolução direta de imagem com concorrência máxima 2;
- enriquecimento suspenso quando offline, página oculta ou `Save-Data` ativo;
- cursor persistente permite continuar por outros termos em sessões seguintes.

A arquitetura permite crescimento gradual para centenas/milhares de SKUs ao longo do uso, sem declarar cobertura integral instantânea dos catálogos dinâmicos.

## Fontes oficiais verificadas

A estrutura atual dos retalhistas continua compatível com o pipeline existente:

- Continente: páginas de produto `continente.pt/produto/...-<pid>.html` e imagens no catálogo oficial `Sites-col-master-catalog`;
- Pingo Doce: páginas `pingodoce.pt/home/produtos/...-<pid>.html` e imagens em `static.pingodoce.pt/Sites-pingo-doce-master`.

O sistema não considera uma fotografia como prova de preço ou transação.

`market-catalog-image-resolver.js` aproveita a URL oficial exata de um SKU já descoberto para tentar localizar a fotografia sem repetir uma pesquisa por nome. A imagem continua a passar pelos validadores estritos de retalhista/PID e, quando válida, é persistida pela `75-image-library1`.

## Cabeçalho, drawer e navegação

O cabeçalho móvel mantém hambúrguer + título à esquerda e notificações à direita. O drawer continua a abrir exclusivamente pela direita, com a paleta `#003f4c → #005965 → #087a78`, menta `#5be0c2` como acento e página clara visível à esquerda.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**.

## Integridade funcional preservada

`75-image-library1` e `75-catalog1` não alteram:

- `core.js` / persistência financeira;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- IndexedDB financeiro existente;
- pagamentos e histórico;
- PIN e palavra-passe;
- PBKDF2-SHA-256 + AES-GCM;
- QR fiscal e scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada;
- regras de cálculo ou confirmação de preços.

Os novos módulos `75-catalog1` não referenciam `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents` ou `amountCents`.

## Versionamento público / esperado

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
- biblioteca imagens: `75-image-library1`;
- catálogo visual em validação: `75-catalog1`;
- cache esperado depois da publicação: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1`.

`market-image-library.js?v=75-image-library1` integra a allowlist Pages e o Service Worker. `market-visual-catalog.css`, `market-catalog-image-resolver.js` e `market-visual-catalog.js` entram no bundle com `?v=75-catalog1` na revisão em validação.

## QA e publicação

`tests/market-image-library.test.cjs` continua a cobrir validação de PID/retalhista, persistência isolada, TTL, ausência de acesso ao estado financeiro, distribuição e cache.

`tests/market-visual-catalog.test.cjs` cobre categorias, identidade `marketId|pid`, rejeição de URL não oficial, limites de rede, ausência de estado financeiro, resolvedor direto de imagem, breakpoints, ordem do bundle e cache.

Validação confirmada da biblioteca publicada:

- CI final da branch `feat/v75-market-image-library`: sucesso no SHA `5f7b051c2b767c71581b4dc86054f502629a54cd`;
- integração em `main`: fast-forward no mesmo SHA;
- CI de `main`: sucesso no mesmo SHA;
- GitHub Pages: deploy concluído com sucesso sobre o mesmo SHA.

Validação confirmada do catálogo em branch:

- primeiro CI encontrou apenas uma regex incorreta no novo teste; a asserção foi corrigida;
- CI técnico verde no SHA `8e5d61c3c68771cd3e1cd5990cbe201e30fb7baa`;
- CI final depois de documentação e `release-manifest.json`: sucesso no SHA `c45b7be38748c22f21c8168fd0edced8c8cc0987`.

Os testes incluem finanças, auditoria, contagem, isolamento, datas, faturas, QR, Mercado, imagens, barcode, arquitetura v75, segurança, responsividade, navegação, acessibilidade e sincronização.

## Validação manual necessária

No iPhone/Safari/PWA, confirmar:

- uma fotografia oficial encontrada permanece disponível quando o mesmo SKU volta a aparecer;
- Continente e Pingo Doce não trocam imagens entre SKUs;
- cartão continua estável quando a URL expira ou falha;
- fallback `Imagem indisponível` permanece limpo;
- catálogo visual aparece uma única vez;
- categorias/filtros funcionam sem overflow;
- produtos vão surgindo progressivamente entre sessões;
- **Ver preço atual** dispara a pesquisa viva existente;
- offline/Save-Data/página oculta não fazem enriquecimento automático;
- `75-featured1` continua com cartão largo e swipe natural;
- ausência de regressão de navegação ou alteração de valores.

## Próximo passo

Comparar a branch `feat/v75-visual-market-catalog` com `main`, integrar `75-catalog1` por fast-forward sem force, confirmar CI de `main` e GitHub Pages no SHA integrado e só depois fechar a revisão como publicada. Depois, validar fisicamente no iPhone/Safari/PWA e medir o crescimento real da base por categoria.
