# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v75`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A **v75 está integrada em `main` e publicada no GitHub Pages**. A causa de a aplicação continuar visualmente igual era objetiva: o redesign final estava apenas na branch `redesign/v75-prototipo-fiel`; `main` continuava na v74. Além disso, alguns testes de regressão ainda esperavam literalmente `75-architecture1`, enquanto a implementação final já utilizava `75-architecture2`.

A arquitetura mantém-se PWA estática/local-first: estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

## Reestruturação v75 publicada

A camada final `v75-architecture.css/js` aplica uma linguagem única em mobile e desktop:

- cabeçalho verde-petróleo/teal e superfícies claras compactas;
- navegação móvel com **Início / Despesas / Mercado / Planeamento / Mais**;
- correção explícita da regra histórica que ocultava o terceiro destino móvel;
- Início com saudação integrada, mês, resumo, orçamento, ações rápidas e categorias;
- Despesas com Todas/Entradas/Saídas, pesquisa, movimentos e FAB;
- Adicionar despesa em ecrã completo no móvel com **Manual / Ler fatura / QR Code**;
- scanner QR em ecrã completo, reutilizando `invoice-capture.js`;
- Mercado com pesquisa, cartões compactos e apenas lojas realmente suportadas: Continente e Pingo Doce;
- Planeamento com mês, orçamento, gasto, disponível e distribuição real por categoria;
- Relatórios, Mais, Sincronização, drawer e cofre alinhados com a mesma identidade;
- `icon.svg` local reutilizado no onboarding/cofre;
- teclado PIN móvel em três colunas, sem alterar autenticação.

## Integridade funcional

A v75 não migra nem reescreve:

- `core.js` / persistência;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- pagamentos;
- formato do cofre;
- QR fiscal;
- scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada.

O protótipo continua a ser referência visual, não fonte de dados. Não são adicionados preços fictícios, lojas sem suporte nem linhas de artigos não comprovadas pelo QR.

## Versionamento público

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura final: `75-architecture2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

O Service Worker remove caches com nome diferente do cache atual durante `activate`; o build público regista `sw.js?v=75` com atualização sem reutilizar a cache HTTP do próprio worker.

## Publicação confirmada

- CI final da branch: `34226581162` / `#1488` — sucesso;
- PR: `#65` — **v75: publicar redesign final alinhado com o protótipo**;
- merge em `main`: `40fe62f8140f1f58af9e9ab8d8c8b642695b7cf3`;
- CI de `main`: `34226711267` / `#1490` — sucesso;
- GitHub Pages: `34226749117` / `#1483` — sucesso;
- artefacto Pages preparado com 43 ficheiros públicos e `v75-architecture.css/js` incluídos.

## Próximo passo

Fazer validação física pós-publicação em iPhone/Safari/PWA, Android/tablet e desktop: cache já atualizado, safe areas, barra inferior, Mercado visível, hambúrguer/X, swipe, formulários, QR/câmara, teclado, tema escuro e ausência de overflow. Se o iPhone mantiver uma instância antiga da PWA aberta, fechar/reabrir a aplicação ou usar o centro de atualização para permitir que o novo Service Worker assuma o controlo.
