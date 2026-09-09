# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch pública: `main`
Branch de correção atual: `fix/v75-market-safari-crash`
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
- carregador público atual em `main`: `75-photo-loader2`
- carregador em validação: `75-photo-loader3`

## Invariantes preservados

A aplicação continua PWA estática/local-first. `STATE_VERSION = 5`, montantes em cêntimos, IndexedDB financeiro, PBKDF2-SHA-256 + AES-GCM, pagamentos, faturas, QR, PIN e sincronização cifrada não foram alterados nesta correção.

## Incidente confirmado em hardware real

Depois da publicação de `75-photo-loader2`, o iPhone/Safari apresentou a mensagem nativa **“Um problema ocorreu repetidamente”** ao abrir `#market`. Isto é evidência de falha do processo/página no browser, não um erro apresentado pela aplicação.

Não existe ainda crash log de WebKit do dispositivo, por isso não é possível afirmar a exceção interna exata. A causa técnica é tratada como **provável**, não como facto absoluto.

## Causa provável encontrada no código

A inspeção de `market-photo-loader.js` em `75-photo-loader2` encontrou uma combinação de pressão desnecessária no runtime móvel:

1. `MutationObserver` instalado sobre `document.body` com `subtree:true`;
2. qualquer adição de nós podia agendar novo `requestAnimationFrame(scan)` sem coalescência;
3. cada `scan()` podia iniciar em paralelo hidratação de até 18 cartões, resolução dos visíveis e trabalho de entrada no Mercado;
4. `refreshVisibleCards()` e `warmVisibleCards()` não tinham mutex/promessa única, permitindo operações sobrepostas;
5. a entrada no Mercado executava atualização Pingo Doce e resolução de cartões em paralelo;
6. o polling era de 500 ms por até 24 ciclos.

Este padrão é compatível com pressão de CPU/memória e excesso de tarefas no Safari/iOS, embora o crash log físico continue necessário para prova definitiva.

## Correção `75-photo-loader3`

A branch `fix/v75-market-safari-crash` aplica uma estratégia conservadora:

- observer limitado a `#page-market`, não ao `document.body` inteiro;
- mutações feitas pelo próprio loader dentro da media dos cartões são ignoradas;
- `scheduleScan()` passa a coalescer frames com `scanQueued`, `scanRunning` e `scanPending`;
- apenas uma hidratação global e um aquecimento de fotografias podem decorrer de cada vez (`refreshPromise`/`warmPromise`);
- hidratação limitada a 8 cartões por passagem;
- resolução prioritária limitada a 4 cartões;
- resolução prioritária é sequencial, reduzindo picos simultâneos;
- polling reduzido para 1 s e 12 ciclos;
- atualização Pingo Doce deixa de arrancar em paralelo na entrada: é adiada 5 s/idle e usa apenas 1 seed;
- `warmPending()` deixa de ser chamado pelo loader na entrada;
- cooldown de 30 s por SKU permanece;
- após 12 s o estado visual continua a mudar para **Fotografia a validar…**;
- falha real de `<img>` continua a expurgar a referência da biblioteca;
- loader continua sem `fetch()` próprio e sem acesso ao estado financeiro.

## Distribuição em validação

Revisão esperada: `75-photo-loader3`.

Cache esperado:

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader3`

## Segurança

Mantidos:

- HTTPS obrigatório;
- página oficial/PID coerentes;
- host/path de imagem autorizado;
- identidade por `marketId|pid`;
- nenhuma password, token ou chave embutida;
- nenhuma alteração a `core.js`, `finance.js`, `estimatedCents`, `actualCents` ou `amountCents`.

## Estado de QA

A correção de código e os testes específicos foram preparados na branch `fix/v75-market-safari-crash`. A publicação só pode ser considerada concluída depois de:

1. CI verde da branch;
2. comparação `behind 0` relativamente a `main`;
3. fast-forward sem force;
4. CI verde de `main` no SHA integrado;
5. GitHub Pages no SHA integrado;
6. nova validação física no mesmo iPhone/Safari.

## Próximo passo

Validar a branch no CI. Se ficar verde, integrar e publicar `75-photo-loader3`. Depois, no iPhone, confirmar primeiro que `#market` abre e permanece estável; só depois medir a evolução das fotografias oficiais Pingo Doce. Estabilidade do browser tem prioridade sobre velocidade de preenchimento da biblioteca.
