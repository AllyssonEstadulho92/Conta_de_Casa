# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
Estado: `75-catalog1`, `75-pd-photo1` e `75-photo-loader1` publicados

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

`pingo-doce-photo-library.js` usa IndexedDB própria `conta-de-casa-pingo-doce-photo-library`.

Contrato:

- descoberta apenas pela fonte de pesquisa já usada pelo Mercado, restringida a `stores:['pingodoce']`;
- PID e página oficial `pingodoce.pt/home/produtos/...-<pid>.html` obrigatoriamente coerentes;
- fotografia resolvida pela página oficial exata do SKU;
- fotografia aceite apenas depois da validação existente para `static.pingodoce.pt/Sites-pingo-doce-master` e PID correspondente;
- resultado persistido na `75-image-library1` através de `pingo-doce|pid`;
- estados do inventário: `pending`, `ready` e `missing`;
- nenhuma escrita no estado financeiro.

A biblioteca possui 15 famílias de descoberta e mais de 200 termos, cobrindo Bebidas, Lacticínios e ovos, Fruta e legumes, Carne e charcutaria, Peixe e marisco, Padaria e pastelaria, Mercearia, Congelados, Snacks e doces, Refeições, Higiene pessoal, Limpeza, Bebé, Animais e Casa/utilidades.

### Limites de rede

- 24 pesquisas por sessão;
- 72 pesquisas por dia;
- intervalo automático mínimo 20 s;
- 30 tentativas de fotografia por sessão;
- 120 tentativas de fotografia por dia;
- fila pendente limitada;
- trabalho suspenso offline, com página oculta ou `Save-Data` ativo;
- fotografias guardadas pela biblioteca geral, sem duplicação binária.

A cobertura é progressiva. Não se declara que 100% do catálogo dinâmico do Pingo Doce foi copiado, porque o projeto não possui uma API oficial exaustiva que permita provar isso.

## Carregador visual `75-photo-loader1`

`market-photo-loader.js/css` melhora a percepção de velocidade enquanto a fotografia ainda não está em cache.

Comportamento:

- skeleton/shimmer imediato;
- spinner e **A carregar fotografia…**;
- consulta da biblioteca persistente antes de qualquer novo trabalho;
- fotografia já guardada aplicada com `loading='eager'` nos cartões visíveis;
- aquecimento inicial limitado da biblioteca Pingo Doce;
- reavaliação curta dos cartões, sem polling infinito;
- tema escuro e `prefers-reduced-motion` suportados.

O loader não faz chamadas externas diretamente e não conhece montantes ou estado financeiro.

## Segurança

`pingo-doce-photo-library.js` e `market-photo-loader.js` não referenciam `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, passwords, tokens ou chaves.

## Cache público

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog1-pd-photo1-photo-loader1`

## QA e publicação

Novos testes:

- `tests/pingo-doce-photo-library.test.cjs`
- `tests/market-photo-loader.test.cjs`

Validação confirmada no SHA funcional/documental `7a59ae017a4640cfa3ad5ec357cd99425ca9ee71`:

- CI final da branch: sucesso;
- integração em `main`: fast-forward sem force;
- CI de `main`: sucesso;
- GitHub Pages: deploy concluído com sucesso;
- testes incluíram finanças, segurança, Mercado, imagens, responsividade, navegação, acessibilidade e sincronização.

## Validação física necessária

No iPhone/Safari/PWA confirmar:

- **A carregar fotografia…** aparece imediatamente quando necessário;
- fotografias já em cache surgem sem atraso perceptível;
- fotografia resolvida substitui o skeleton sem deformar o cartão;
- nenhum SKU recebe fotografia de outro PID;
- itens sem fotografia continuam utilizáveis;
- não existe overflow ou bloqueio de scroll;
- rede lenta/offline não bloqueia o Mercado;
- valores financeiros permanecem inalterados.

## Próximo passo

Validar fisicamente a revisão publicada no iPhone/Safari/PWA e medir o crescimento real da biblioteca Pingo Doce por categoria e por sessão.