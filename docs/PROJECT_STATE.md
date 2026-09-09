# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch pública: `main`
Branch de correção atual: `fix/v75-market-photo-flicker`
Distribuição: GitHub Pages / PWA

## Baseline preservada

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
- resolvedor oficial de imagens: `75-catalog2`
- catálogo visual / renderer candidato: `75-catalog3`
- biblioteca Pingo Doce: `75-pd-photo1`
- carregador visual: `75-photo-loader2`

## Estado funcional e invariantes

A aplicação continua PWA estática/local-first. O estado financeiro permanece em IndexedDB, os montantes são inteiros em cêntimos, `STATE_VERSION = 5`, o cofre usa PBKDF2-SHA-256 + AES-GCM e a sincronização GitHub opcional continua limitada ao envelope cifrado.

A correção atual não altera `core.js`, `finance.js`, pagamentos, faturas, QR, scanner, PIN, cifragem, `estimatedCents`, `actualCents` ou sincronização.

## Problema anterior: fotografias Pingo Doce

A validação física no iPhone/Safari tinha mostrado:

- `566 produtos indexados · 57 imagens validadas` no catálogo geral;
- `Biblioteca Pingo Doce: 285 SKUs indexados · 0 fotografias oficiais`;
- cartões visíveis demasiado tempo em **A carregar fotografia…**.

Esse problema originou `75-catalog2` + `75-photo-loader2`: foi removido o segundo preflight visual bloqueante, os cartões visíveis passaram a ser priorizados, o retry ficou limitado e a UI deixou de manter spinner infinito.

## Novo bug confirmado: fotografias a piscar

A nova evidência visual mostrou fotografias/cartões do catálogo a piscar durante atualizações de fundo.

### Causa confirmada no código

`market-visual-catalog.js` reconstruía a grelha inteira em atualizações periódicas:

1. `scheduleImageWarm()` resolvia uma fotografia e chamava `renderProducts()`;
2. `renderProducts()` executava `grid.replaceChildren()`;
3. cada cartão era criado novamente e fazia nova consulta assíncrona à biblioteca de imagens;
4. os elementos `<img>` já carregados eram removidos do DOM e recriados.

O efeito era visualmente semelhante a uma fotografia que desaparece e reaparece. Não era apenas animação CSS nem falha da imagem remota.

## Correção `75-catalog3`

Na branch `fix/v75-market-photo-flicker` foi implementada uma renderização incremental por chave `marketId|pid`:

- cartões existentes são reutilizados em vez de destruídos;
- apenas cartões que deixaram de pertencer ao resultado atual são removidos;
- cartões novos são criados apenas quando realmente necessários;
- texto/metadados do cartão são sincronizados sem substituir a área de fotografia;
- a fila de aquecimento de fotografias deixou de chamar `renderProducts()` após cada imagem;
- uma fotografia resolvida em background emite `cdc:market-photo-ready`, permitindo ao `75-photo-loader2` hidratar o cartão já existente;
- o cache de distribuição candidato passa para `...-image-library1-catalog3-pd-photo1-photo-loader2`.

O resolvedor de origem continua `75-catalog2`; `75-catalog3` altera o catálogo/renderer, não relaxa a validação de host, path ou PID.

## QA da branch

CI da branch no SHA `501c21dca60cffc32489768238c5f308e1785e34`: **sucesso completo**.

Passaram, entre outros:

- probe real das fontes Continente/Pingo Doce;
- sintaxe;
- finanças e invariantes de contagem;
- isolamento/cofre;
- faturas e QR;
- Mercado e imagens oficiais;
- catálogo visual `75-catalog3`;
- biblioteca Pingo Doce;
- `75-photo-loader2`;
- segurança;
- responsividade e viewport móvel;
- navegação e acessibilidade;
- sincronização;
- validação do manifest.

Um primeiro CI falhou apenas porque `tests/pingo-doce-photo-library.test.cjs` ainda esperava o identificador de cache `catalog2`; o teste de distribuição foi atualizado para `catalog3` e o CI seguinte ficou totalmente verde.

## Estado de publicação

A correção `75-catalog3` está validada na branch, mas ainda não deve ser considerada produto final até concluir:

1. integração fast-forward em `main`, sem force;
2. CI completo de `main`;
3. GitHub Pages no SHA integrado;
4. revalidação física no mesmo iPhone/Safari/PWA que mostrou o flicker.

Até essa integração, a versão pública confirmada permanece a baseline anterior `75-catalog2` + `75-photo-loader2`.

## Próximo passo

Integrar a branch validada em `main`, confirmar CI/Pages e repetir no iPhone o cenário exato da captura. A validação física deve confirmar simultaneamente ausência de flicker, carregamento estável, ausência de troca de PID e preservação dos valores financeiros.
