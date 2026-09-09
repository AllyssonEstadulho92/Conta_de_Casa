# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão do drawer móvel: `75-drawer2`
Revisão dos destaques do Mercado: `75-featured1`
Revisão da biblioteca de imagens: `75-image-library1`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-featured1` mantém o bloco móvel **Produtos em destaque** em carrossel largo e alinhado com o protótipo. A revisão `75-image-library1` está integrada em `main` e publicada por GitHub Pages, acrescentando uma biblioteca persistente separada para fotografias oficiais do Mercado, sem alterar o estado financeiro.

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

## Fontes oficiais verificadas

A estrutura atual dos retalhistas continua compatível com o pipeline existente:

- Continente: páginas de produto `continente.pt/produto/...-<pid>.html` e imagens no catálogo oficial `Sites-col-master-catalog`;
- Pingo Doce: páginas `pingodoce.pt/home/produtos/...-<pid>.html` e imagens em `static.pingodoce.pt/Sites-pingo-doce-master`.

O sistema não considera uma fotografia como prova de preço ou transação.

## Cabeçalho, drawer e navegação

O cabeçalho móvel mantém hambúrguer + título à esquerda e notificações à direita. O drawer continua a abrir exclusivamente pela direita, com a paleta `#003f4c → #005965 → #087a78`, menta `#5be0c2` como acento e página clara visível à esquerda.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**.

## Integridade funcional preservada

`75-image-library1` não altera:

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

A nova base IndexedDB é exclusivamente para metadados de imagens oficiais do Mercado.

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
- biblioteca imagens: `75-image-library1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1`.

`market-image-library.js?v=75-image-library1` integra a allowlist Pages e o Service Worker.

## QA e publicação

Foi criado `tests/market-image-library.test.cjs`, cobrindo:

- validação de PID e retalhista;
- aceitação/rejeição dos hosts oficiais;
- persistência isolada;
- TTL de 45 dias;
- ausência de acesso a `appState`, `saveState()` ou `commit()`;
- distribuição e ordem do asset no bundle;
- cache versionado.

Validação confirmada:

- CI final da branch `feat/v75-market-image-library`: sucesso no SHA `5f7b051c2b767c71581b4dc86054f502629a54cd`;
- integração em `main`: fast-forward no mesmo SHA;
- CI de `main`: sucesso no mesmo SHA;
- GitHub Pages: deploy concluído com sucesso sobre o mesmo SHA.

Os testes incluíram finanças, auditoria, contagem, isolamento, datas, faturas, QR, Mercado, imagens, barcode, arquitetura v75, segurança, responsividade, navegação, acessibilidade e sincronização.

## Validação manual necessária

No iPhone/Safari/PWA, confirmar:

- uma fotografia oficial encontrada permanece disponível quando o mesmo SKU volta a aparecer;
- Continente e Pingo Doce não trocam imagens entre SKUs;
- cartão continua estável quando a URL expira ou falha;
- fallback `Imagem indisponível` permanece limpo;
- `75-featured1` continua com cartão largo e swipe natural;
- ausência de overflow, regressão de navegação ou alteração de valores.

## Próximo passo

Validar `75-image-library1` fisicamente no iPhone/Safari/PWA com pesquisas repetidas de SKUs reais do Continente e Pingo Doce. Depois, se for necessária cobertura antecipada de um catálogo muito maior, avaliar uma fonte oficial/autorizada exaustiva em vez de fazer crawling massivo dos sites dos retalhistas.