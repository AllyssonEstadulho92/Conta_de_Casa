# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch pública: `main`
Branch em validação: `feat/v75-pingo-doce-photo-library`
Distribuição: GitHub Pages / PWA

## Revisões vigentes

- UI base: `74-ui1`
- Mercado: `74-shopping2`
- menu funcional: `73-menu8`
- experiência: `74-experience2`
- arquitetura: `75-architecture2`
- cabeçalho: `75-header2`
- estabilidade: `75-stability1`
- geometria: `75-layout1`
- drawer: `75-drawer2`
- destaques Mercado: `75-featured1`
- biblioteca geral de imagens: `75-image-library1`
- catálogo visual: `75-catalog1`
- biblioteca Pingo Doce: `75-pd-photo1`
- carregador visual de fotografias: `75-photo-loader1`

## Estado funcional

A aplicação continua PWA estática/local-first. O estado financeiro permanece em IndexedDB, os montantes são inteiros em cêntimos, `STATE_VERSION = 5`, o cofre usa PBKDF2-SHA-256 + AES-GCM e a sincronização GitHub opcional continua limitada ao envelope cifrado.

`core.js`, `finance.js`, pagamentos, faturas, QR, scanner, PIN, cifragem, `estimatedCents`, `actualCents` e sincronização não foram reescritos por esta alteração.

## Mercado e fotografias

`75-image-library1` mantém uma biblioteca geral separada em `conta-de-casa-market-image-library`, indexada por `marketId|pid`. Guarda metadados e URL oficial validado; não copia binários dos retalhistas para o repositório.

`75-catalog1` acrescenta o catálogo visual progressivo por categorias e acumula SKUs reais de Continente/Pingo Doce. O catálogo não guarda preços: **Ver preço atual** reutiliza a pesquisa viva do Mercado.

### Biblioteca Pingo Doce `75-pd-photo1`

Foi criada `pingo-doce-photo-library.js` com IndexedDB própria `conta-de-casa-pingo-doce-photo-library`.

Objetivo:

- aumentar especificamente a cobertura de SKUs Pingo Doce;
- descobrir produtos apenas através da fonte de pesquisa já usada pelo Mercado, restringida a `stores:['pingodoce']`;
- validar PID e página oficial `pingodoce.pt/home/produtos/...-<pid>.html`;
- resolver fotografia pela página oficial exata do SKU;
- aceitar fotografia apenas depois da validação existente para `static.pingodoce.pt/Sites-pingo-doce-master` e PID correspondente;
- alimentar `75-image-library1` através da chave `pingo-doce|pid`;
- manter estados `pending`, `ready` e `missing` sem tocar no estado financeiro.

A biblioteca possui 15 grupos de descoberta e mais de 200 termos de pesquisa, cobrindo Bebidas, Lacticínios e ovos, Fruta e legumes, Carne e charcutaria, Peixe e marisco, Padaria e pastelaria, Mercearia, Congelados, Snacks e doces, Refeições, Higiene pessoal, Limpeza, Bebé, Animais e Casa/utilidades.

### Limites de rede

Para não transformar a aplicação num crawler agressivo:

- máximo 24 pesquisas por sessão;
- máximo 72 pesquisas por dia;
- intervalo automático mínimo 20 s;
- máximo 30 tentativas de fotografia por sessão;
- máximo 120 tentativas de fotografia por dia;
- fila pendente limitada;
- trabalho suspenso quando offline, página oculta ou `Save-Data` ativo;
- fotografias são guardadas pela biblioteca geral, não duplicadas em binário.

Isto permite crescimento progressivo para centenas/milhares de SKUs, mas não autoriza afirmar que o catálogo dinâmico do Pingo Doce foi copiado integralmente num instante. “Todas as fotografias” é tratado como objetivo de cobertura progressiva de todos os SKUs reais que as fontes disponíveis conseguirem descobrir e validar.

## Carregador visual `75-photo-loader1`

Foi criado `market-photo-loader.js/css` para melhorar a experiência quando a fotografia ainda não está em cache.

Ao aparecer um cartão sem fotografia:

- surge imediatamente skeleton/shimmer;
- aparece spinner e texto **A carregar fotografia…**;
- a biblioteca existente é consultada primeiro;
- fotografias já guardadas são apresentadas imediatamente com `loading='eager'` nos cartões visíveis;
- ao entrar no Mercado é efetuado um aquecimento inicial limitado da biblioteca Pingo Doce;
- os cartões visíveis são reavaliados em intervalos curtos durante a janela inicial, sem polling infinito;
- `prefers-reduced-motion` e tema escuro são respeitados.

O carregador não contacta fontes externas diretamente e não conhece montantes ou estado financeiro.

## Segurança

Os módulos `pingo-doce-photo-library.js` e `market-photo-loader.js` não referenciam `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, palavras-passe, tokens ou chaves.

URLs de produto Pingo Doce só são aceites em HTTPS e com PID coerente. A fotografia final continua a passar pelo validador estrito já existente antes de ser persistida.

## Cache esperado após publicação

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1-pd-photo1-photo-loader1`

## QA

Novos testes:

- `tests/pingo-doce-photo-library.test.cjs`
- `tests/market-photo-loader.test.cjs`

Cobrem identidade exata `pingo-doce|pid`, rejeição de URLs não oficiais, limites de rede, isolamento financeiro, distribuição Pages, Service Worker, loading state, skeleton, `prefers-reduced-motion` e ordem dos assets.

CI da branch passou com sucesso no SHA `3cd7a98acaa7979ea87bd0f3b090992afe79404c` antes da atualização final desta documentação. Um novo CI deve validar o SHA documental final antes da integração.

## Validação física necessária

No iPhone/Safari/PWA confirmar:

- o texto **A carregar fotografia…** aparece imediatamente quando necessário;
- fotografias já em cache surgem sem atraso perceptível;
- uma fotografia resolvida substitui o skeleton sem deslocar o cartão;
- nenhum SKU recebe fotografia de outro PID;
- itens sem fotografia continuam utilizáveis;
- não existe overflow ou bloqueio de scroll;
- rede lenta/offline não bloqueiam o Mercado;
- valores financeiros permanecem inalterados.

## Próximo passo

Executar CI final da branch, integrar por fast-forward em `main`, confirmar CI de `main` e GitHub Pages no mesmo SHA e depois validar em hardware real.