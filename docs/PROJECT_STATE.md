# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público atual: `v75`
Revisões publicadas: `75-header2`, `75-stability1`, `75-layout1`, `75-drawer2`, `75-featured1`, `75-image-library1`
Revisão em validação: `75-catalog1`
Branch pública: `main`
Branch de trabalho: `feat/v75-visual-market-catalog`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação continua como PWA estática/local-first. O estado financeiro permanece em IndexedDB, os valores monetários usam inteiros de cêntimos, o cofre usa PBKDF2-SHA-256 + AES-GCM, a sincronização GitHub é opcional e transfere apenas o envelope cifrado, e `STATE_VERSION = 5` permanece inalterado.

`75-image-library1` está publicada e guarda apenas referências oficiais validadas de fotografias por `marketId|pid`. A nova revisão `75-catalog1` acrescenta um catálogo visual progressivo sobre essa biblioteca, sem alterar preços, quantidades, faturas, pagamentos ou regras financeiras.

## `75-catalog1` — catálogo visual progressivo

Novos assets:

- `market-visual-catalog.js`;
- `market-visual-catalog.css`;
- `market-catalog-image-resolver.js`;
- `tests/market-visual-catalog.test.cjs`.

O catálogo cria a IndexedDB separada `conta-de-casa-market-visual-catalog` com stores `products` e `meta`. Cada produto é identificado por `marketId|pid`, guarda apenas nome, embalagem, categorias, URL oficial da página e timestamps. **Não guarda preço.**

Categorias iniciais:

- Bebidas;
- Lacticínios e ovos;
- Frutas e legumes;
- Carne e peixe;
- Padaria e pastelaria;
- Mercearia / Despensa;
- Congelados;
- Snacks e doces;
- Higiene pessoal;
- Limpeza;
- Bebé;
- Animais.

O catálogo usa pesquisas reais de Continente e Pingo Doce através do pipeline `cesta.pt` já existente. Os SKUs encontrados são acumulados gradualmente e deduplicados por loja + PID. Ao tocar num cartão, o nome é enviado para o campo de pesquisa existente e o preço atual é novamente consultado pelo fluxo normal do Mercado; o catálogo não apresenta preço armazenado.

## Acumulação automática controlada

Para evitar crawling agressivo e carga desnecessária, `75-catalog1` aplica limites explícitos:

- máximo de 18 pesquisas de enriquecimento por sessão;
- máximo de 48 pesquisas de enriquecimento por dia;
- intervalo mínimo de 15 segundos entre passos automáticos;
- máximo de 20 tentativas de enriquecimento de imagem por sessão;
- imagens são processadas de forma espaçada, com concorrência limitada;
- enriquecimento automático não corre offline, com a página oculta ou quando `Save-Data` está ativo.

O objetivo é permitir que a base local cresça para centenas ou milhares de SKUs ao longo de utilizações sucessivas, sem alegar cobertura integral instantânea dos catálogos dinâmicos dos retalhistas.

## Fotografias

`market-catalog-image-resolver.js` usa a URL oficial exata do produto já encontrada pelo catálogo para tentar localizar a fotografia oficial, evitando repetir desnecessariamente uma pesquisa por nome. Continua a validar a fotografia através das regras de `CDCOfficialMarketImages`:

- Continente: `www.continente.pt`, `Sites-col-master-catalog`, PID correspondente;
- Pingo Doce: `static.pingodoce.pt`, `Sites-pingo-doce-master`, PID correspondente.

A imagem validada é entregue a `market-image-library.js`, que mantém TTL de 45 dias. Nenhum binário é copiado para o repositório.

## Interface

No browser do Mercado surge uma secção **Catálogo visual / Produtos por categoria** com:

- categorias horizontais;
- filtro Todos / Continente / Pingo Doce;
- contador de produtos indexados e imagens validadas;
- grelha responsiva de produtos;
- fallback local quando a fotografia ainda não está validada;
- ação **Ver preço atual**, que reutiliza a pesquisa real existente.

A grelha usa 3 colunas em desktop, 2 em larguras até 680 px e 1 coluna em ecrãs muito estreitos até 350 px. Fotografias usam `object-fit: contain`.

## Integridade funcional preservada

`75-catalog1` não modifica:

- `core.js`;
- `finance.js`;
- `STATE_VERSION = 5`;
- IndexedDB financeira;
- `estimatedCents` / `actualCents`;
- pagamentos;
- faturas;
- PIN/palavra-passe;
- PBKDF2-SHA-256 + AES-GCM;
- QR fiscal e scanner;
- sincronização cifrada.

Os novos módulos não referenciam `appState`, `saveState()` ou `commit()`.

## Versionamento esperado para publicação

- build: `v75`;
- biblioteca de imagens: `75-image-library1`;
- catálogo visual: `75-catalog1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1`.

## QA

O primeiro CI de `75-catalog1` revelou apenas uma expressão regular incorreta no novo teste, não um erro funcional. A asserção foi corrigida. O CI seguinte da branch, no SHA `8e5d61c3c68771cd3e1cd5990cbe201e30fb7baa`, terminou integralmente com sucesso, incluindo:

- prova das fontes vivas Continente/Pingo Doce;
- sintaxe dos novos módulos;
- teste específico do catálogo progressivo;
- finanças e auditoria;
- isolamento e segurança;
- Mercado, imagens e código de barras;
- responsividade e mobile viewport;
- acessibilidade;
- navegação;
- sincronização.

## Estado de publicação

`75-catalog1` está tecnicamente validada na branch de trabalho, mas ainda não deve ser considerada publicada enquanto não for integrada em `main`, o CI de `main` terminar com sucesso e o GitHub Pages concluir o deploy do SHA integrado.

## Próximo passo

Atualizar documentação/release, executar o CI final da branch, integrar por fast-forward em `main`, validar CI + Pages e depois testar fisicamente no iPhone/Safari/PWA: crescimento progressivo, filtros, imagens, Save-Data, rede lenta/offline e ausência de alteração de valores financeiros.
