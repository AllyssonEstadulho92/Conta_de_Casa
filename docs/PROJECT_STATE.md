# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch pública: `main`
Branch em validação: `fix/v75-market-photo-runtime`
Distribuição: GitHub Pages / PWA

## Revisões vigentes / em validação

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
- catálogo visual base: `75-catalog1`
- resolvedor oficial em validação: `75-catalog2`
- biblioteca Pingo Doce: `75-pd-photo1`
- carregador visual em validação: `75-photo-loader2`

## Estado funcional

A aplicação continua PWA estática/local-first. O estado financeiro permanece em IndexedDB, os montantes são inteiros em cêntimos, `STATE_VERSION = 5`, o cofre usa PBKDF2-SHA-256 + AES-GCM e a sincronização GitHub opcional continua limitada ao envelope cifrado.

A correção atual não altera `core.js`, `finance.js`, pagamentos, faturas, QR, scanner, PIN, cifragem, `estimatedCents`, `actualCents` ou sincronização.

## Problema confirmado em hardware real

A validação física no iPhone/Safari mostrou:

- `566 produtos indexados · 57 imagens validadas` no catálogo geral;
- `Biblioteca Pingo Doce: 285 SKUs indexados · 0 fotografias oficiais`;
- cartões visíveis permaneceram durante demasiado tempo em **A carregar fotografia…**.

A captura prova que o inventário de SKUs estava a crescer, mas o pipeline Pingo Doce não estava a converter esses SKUs em entradas `ready` na biblioteca de fotografias.

A sonda de CI da revisão anterior confirmou, no mesmo período, que `cesta.pt` devolvia resultados Continente/Pingo Doce e que o reader conseguia encontrar uma URL de imagem Pingo Doce com PID exato. Portanto, a causa provável foi localizada no runtime de resolução/orquestração, não na inexistência geral da fonte.

## Causa provável e impacto

Foram encontrados três pontos de atraso/false-negative:

1. `market-catalog-image-resolver.js` fazia um segundo `new Image()` bloqueante, com timeout de até 10 s, depois de a URL já ter sido obtida da página oficial exata e validada por host/path/PID. No Safari isto podia transformar uma URL válida num falso negativo antes de a biblioteca a persistir.
2. `market-photo-loader1` apenas consultava a cache; não dava prioridade real aos cartões que o utilizador estava a ver. A fila Pingo Doce continuava a processar outros SKUs em série e com intervalos longos.
3. O orçamento diário de tentativas falhadas (`imagesToday`) é persistente. Depois de várias falhas do resolvedor antigo, uma sessão já corrigida poderia continuar bloqueada até ao dia seguinte.

Impacto: spinner prolongado, contador Pingo Doce em zero e pouca ou nenhuma melhoria visual apesar de já existirem centenas de SKUs indexados.

## Correção em validação

### `75-catalog2`

`market-catalog-image-resolver.js` mantém validação estrita da página oficial e da imagem por retalhista/PID, mas deixa de executar o segundo `new Image()` bloqueante antes de persistir a referência.

Fluxo novo:

1. validar `sourceUrl` oficial e PID;
2. ler a página oficial exata via reader;
3. extrair URL da fotografia;
4. validar host/path/PID com `safeOfficialImageUrl()`;
5. devolver imediatamente a referência validada à biblioteca;
6. o cartão testa o carregamento real; se falhar, `75-photo-loader2` elimina a entrada e mantém fallback.

Timeout do reader direto reduzido para 8 s.

### `75-photo-loader2`

O loader passa a priorizar até 6 cartões visíveis do catálogo:

- consulta primeiro `75-image-library1`;
- obtém o registo exato através de `CDCMarketVisualCatalog.listCategory()`;
- chama o resolvedor oficial para esses SKUs em primeiro lugar;
- persiste a fotografia validada e hidrata o cartão imediatamente;
- usa `loading='eager'` nas fotografias visíveis;
- reavalia a cada 500 ms, no máximo 24 ciclos;
- após 12 s deixa de manter um spinner infinito e muda para **Fotografia a validar…**;
- referência de imagem que falhar no browser é removida da biblioteca para permitir retry limpo;
- retry do mesmo SKU é limitado por cooldown de 30 s;
- ao primeiro carregamento desta revisão, o contador diário de tentativas de imagem Pingo Doce é libertado uma única vez (`photoRuntimeRevision=75-photo-loader2`) para não herdar um orçamento esgotado pelo runtime antigo.

O loader continua sem `fetch()` próprio e sem acesso ao estado financeiro.

## Bibliotecas existentes preservadas

### Biblioteca geral `75-image-library1`

Base: `conta-de-casa-market-image-library`.
Chave: `marketId|pid`.
Guarda somente metadados e URL oficial validado, com TTL de 45 dias.

### Catálogo visual `75-catalog1`

Base: `conta-de-casa-market-visual-catalog`.
Guarda SKUs/categorias/página oficial, mas não guarda preço. **Ver preço atual** continua a usar a pesquisa viva.

### Biblioteca Pingo Doce `75-pd-photo1`

Base: `conta-de-casa-pingo-doce-photo-library`.
Mantém mais de 200 termos em 15 famílias e estados `pending|ready|missing` por `pingo-doce|pid`.

## Segurança

A correção mantém:

- HTTPS obrigatório;
- página oficial com PID coerente;
- imagem final apenas em host/path oficial já autorizado;
- identidade por `marketId|pid`, nunca só pelo nome;
- nenhuma credencial, token ou chave embutida;
- nenhum acesso a montantes ou estado financeiro.

Remover o `new Image()` de pré-validação não remove a validação de origem/PID. Apenas elimina uma segunda prova de transporte antes da persistência; o browser continua a validar o carregamento no ponto de apresentação e a entrada é removida se falhar.

## Cache esperado após publicação

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader2`

## QA

Testes atualizados:

- `tests/market-visual-catalog.test.cjs`: exige `75-catalog2`, ausência do preflight `new Image()` e preservação da validação por URL oficial/PID;
- `tests/market-photo-loader.test.cjs`: exige prioridade de cartões visíveis, 500 ms/24 ciclos, retry controlado, evicção de referência quebrada e recuperação única do orçamento persistido;
- `tests/pingo-doce-photo-library.test.cjs`: alinhado com cache `catalog2`.

A publicação só pode ser declarada após CI verde da branch, fast-forward sem force para `main`, CI verde de `main` e GitHub Pages concluído no mesmo SHA.

## Validação física necessária após deploy

No iPhone/Safari/PWA confirmar:

- o contador Pingo Doce começa a sair de `0 fotografias oficiais` quando existirem SKUs com imagem oficial válida;
- os primeiros cartões visíveis recebem prioridade;
- fotografia em cache aparece praticamente de imediato;
- o spinner não permanece indefinidamente;
- URL quebrada é removida e não deixa cartão preso;
- Continente e Pingo Doce nunca trocam imagens entre PIDs;
- rede lenta/offline mantém cartões utilizáveis;
- valores financeiros permanecem inalterados.

## Próximo passo

Concluir CI da branch `fix/v75-market-photo-runtime`, integrar em `main` apenas se verde, confirmar CI/Pages e repetir a validação física no mesmo iPhone que expôs o problema.