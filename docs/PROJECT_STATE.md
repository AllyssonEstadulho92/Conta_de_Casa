# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch pública: `main`
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
- catálogo visual base: `75-catalog1`
- resolvedor oficial/distribuição catálogo: `75-catalog2`
- biblioteca Pingo Doce: `75-pd-photo1`
- carregador visual: `75-photo-loader2`

## Estado funcional

A aplicação continua PWA estática/local-first. O estado financeiro permanece em IndexedDB, os montantes são inteiros em cêntimos, `STATE_VERSION = 5`, o cofre usa PBKDF2-SHA-256 + AES-GCM e a sincronização GitHub opcional continua limitada ao envelope cifrado.

A correção de fotografias não alterou `core.js`, `finance.js`, pagamentos, faturas, QR, scanner, PIN, cifragem, `estimatedCents`, `actualCents` ou sincronização.

## Problema confirmado em hardware real

A validação física no iPhone/Safari mostrou:

- `566 produtos indexados · 57 imagens validadas` no catálogo geral;
- `Biblioteca Pingo Doce: 285 SKUs indexados · 0 fotografias oficiais`;
- cartões visíveis permaneceram durante demasiado tempo em **A carregar fotografia…**.

A captura provou que o inventário de SKUs estava a crescer, mas o pipeline Pingo Doce não estava a converter esses SKUs em entradas `ready` na biblioteca de fotografias.

A sonda CI confirmou na correção que `cesta.pt` respondia para Continente/Pingo Doce e que o reader encontrava imagem exata em ambos os retalhistas. A falha foi tratada no runtime de resolução/orquestração, não como ausência geral da fonte.

## Causa provável corrigida

Foram encontrados três pontos:

1. `market-catalog-image-resolver.js` fazia um segundo carregamento visual bloqueante, com timeout de até 10 s, depois de a URL já ter sido obtida da página oficial e validada por host/path/PID. No Safari isto podia produzir falso negativo antes da persistência.
2. `75-photo-loader1` apenas consultava cache; não priorizava os cartões que o utilizador estava a ver.
3. O orçamento diário persistido de tentativas (`imagesToday`) podia ficar esgotado por falhas antigas e bloquear o novo runtime até à mudança do dia.

## Correção publicada

### `75-catalog2`

`market-catalog-image-resolver.js` mantém validação estrita da página oficial e da imagem por retalhista/PID, mas elimina o segundo preflight visual bloqueante.

Fluxo:

1. validar `sourceUrl` oficial e PID;
2. ler a página oficial exata via reader;
3. extrair URL da fotografia;
4. validar host/path/PID com `safeOfficialImageUrl()`;
5. devolver imediatamente a referência validada à biblioteca;
6. o cartão testa o carregamento real; se falhar, a referência é expurgada e o fallback permanece.

Timeout do reader direto: 8 s.

### `75-photo-loader2`

O loader passa a priorizar até 6 cartões visíveis:

- consulta primeiro `75-image-library1`;
- obtém o registo exato através de `CDCMarketVisualCatalog.listCategory()`;
- chama o resolvedor oficial para os SKUs visíveis sem cache;
- persiste resultado validado e hidrata o cartão imediatamente;
- usa `loading='eager'` nas imagens visíveis;
- reavalia a cada 500 ms, no máximo 24 ciclos;
- após 12 s muda de **A carregar fotografia…** para **Fotografia a validar…**, evitando spinner infinito;
- imagem quebrada é removida com `CDCMarketImageLibrary.forget()`;
- retry do mesmo SKU usa cooldown de 30 s;
- no primeiro carregamento da revisão, `imagesToday` Pingo Doce é libertado uma única vez e marcado por `photoRuntimeRevision=75-photo-loader2`.

O loader continua sem `fetch()` próprio e sem acesso ao estado financeiro.

## Bibliotecas preservadas

### Geral `75-image-library1`

Base `conta-de-casa-market-image-library`, chave `marketId|pid`, metadados + URL oficial validado, TTL 45 dias.

### Catálogo visual `75-catalog1`

Base `conta-de-casa-market-visual-catalog`. Guarda SKUs/categorias/página oficial, não preços. **Ver preço atual** continua a usar pesquisa viva.

### Pingo Doce `75-pd-photo1`

Base `conta-de-casa-pingo-doce-photo-library`, mais de 200 termos em 15 famílias e estados `pending|ready|missing` por `pingo-doce|pid`.

## Segurança

Mantidos:

- HTTPS obrigatório;
- página oficial com PID coerente;
- imagem apenas em host/path oficial autorizado;
- identidade por `marketId|pid`, nunca apenas por nome;
- nenhuma credencial/token/chave no código;
- nenhum acesso a montantes ou estado financeiro.

Eliminar o preflight duplicado não elimina validação de origem/PID. Disponibilidade real da imagem é verificada no ponto de apresentação; URL que falhe é removido da cache.

## Cache publicado

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader2`

## QA e publicação

A correção foi validada na branch `fix/v75-market-photo-runtime`, integrada em `main` por fast-forward sem force e publicada no runtime SHA `f485fd4317ad0acbd2475f9ca86efed5b413bb76`.

CI de `main` nesse SHA: sucesso, incluindo probe de fontes, finanças, auditoria, QR, Mercado, imagens, `market-visual-catalog`, biblioteca Pingo Doce, `market-photo-loader`, segurança, responsividade, navegação, acessibilidade e sincronização.

GitHub Pages no mesmo SHA: sucesso.

## Validação física ainda necessária

No mesmo iPhone/Safari/PWA que expôs o erro, confirmar:

- o contador Pingo Doce começa a sair de `0 fotografias oficiais` quando existirem SKUs com imagem válida;
- os primeiros cartões visíveis recebem prioridade;
- imagem em cache aparece sem atraso perceptível;
- spinner não permanece indefinidamente;
- URL quebrado é removido e não prende o cartão;
- Continente/Pingo Doce nunca trocam imagens entre PIDs;
- rede lenta/offline mantém cartões utilizáveis;
- valores financeiros permanecem inalterados.

## Próximo passo

Reabrir/atualizar a PWA no iPhone, entrar no Mercado e repetir exatamente o cenário da captura. Se o contador Pingo Doce continuar em zero depois do novo cache estar ativo, recolher nova captura/estado e tratar como falha de transporte específica do dispositivo/host, não como problema de layout.