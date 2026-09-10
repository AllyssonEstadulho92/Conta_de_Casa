# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
Runtime público anterior: `75-catalog3` sobre `90cbfea6e7d2851c42d6d1e6467d2fc52aeaae1f`
Candidato atual: `75-startup1` em `fix/v75-safari-blank-screen` sobre `cd229d83c3d47f54d7f8990a76f2f29acb372f47`

## Baseline preservada

- UI base: `74-ui1`
- Mercado: `74-shopping2`
- menu funcional: `73-menu8`
- experiência: `74-experience2`
- arquitetura: `75-architecture2`
- cabeçalho: `75-header2`
- estabilidade: `75-stability1`
- guarda de arranque: `75-startup1`
- geometria: `75-layout1`
- drawer: `75-drawer2`
- destaques Mercado: `75-featured1`
- biblioteca geral de imagens: `75-image-library1`
- resolvedor oficial de imagens: `75-catalog2`
- catálogo visual / renderer: `75-catalog3`
- biblioteca Pingo Doce: `75-pd-photo1`
- carregador visual: `75-photo-loader2`

## Invariantes

A aplicação continua PWA estática/local-first. O estado financeiro permanece em IndexedDB, os montantes são inteiros em cêntimos, `STATE_VERSION = 5`, o cofre usa PBKDF2-SHA-256 + AES-GCM e a sincronização GitHub opcional continua limitada ao envelope cifrado.

A correção `75-startup1` não altera `core.js`, `finance.js`, cálculos, pagamentos, faturas, QR, scanner, PIN, cifragem, `estimatedCents`, `actualCents` ou a lógica de sincronização. Atua apenas na disponibilidade do documento de navegação e na continuidade visual do arranque.

## Problema anterior: fotografias a piscar

`75-catalog3` substituiu a reconstrução destrutiva da grelha por reconciliação incremental por `marketId|pid`. Cartões existentes são reutilizados e uma fotografia pronta é propagada por `cdc:market-photo-ready`. O CI e o Pages dessa revisão ficaram verdes; a validação física final do flicker continua pendente.

## Novo defeito observado: ecrã branco no iPhone/Safari

A captura de 10 de setembro mostra o Safari numa página totalmente branca enquanto a barra de progresso do próprio browser ainda indica carregamento. A imagem, isoladamente, não permite provar qual etapa de runtime ficou bloqueada.

A auditoria confirmou, porém, dois caminhos independentes capazes de produzir um estado branco:

1. **Navegação do Service Worker sem limite temporal.** `sw.js` fazia `fetch(event.request)` e só recorria ao `index.html` em cache quando a promessa rejeitava. Uma ligação lenta ou pendurada podia manter a navegação sem resposta durante tempo indeterminado.
2. **Estado transitório após desbloqueio.** O fluxo existente pode manter simultaneamente `#vaultScreen` e `#app` ocultos enquanto a barreira inicial de sincronização aguarda. A política de segurança deve continuar a impedir a apresentação de dados financeiros antes de a barreira terminar, mas não deve resultar numa superfície branca.

Não é possível confirmar apenas pela captura qual destes dois caminhos ocorreu naquele momento. Ambos foram tratados porque são riscos reais confirmados no código.

## Correção candidata `75-startup1`

### Navegação

- documentos de navegação passam por `navigationResponse()`;
- tentativa de rede usa `cache:'no-store'` e `AbortController`;
- limite de rede: 4 segundos;
- após timeout/erro, usa `./index.html` já instalado em cache;
- uma navegação de rede bem-sucedida atualiza a cópia de `index.html` no cache;
- se não existir rede nem cache, é devolvida resposta 503 legível em vez de uma espera indefinida;
- cache público passa a terminar em `photo-loader2-startup1`.

### Arranque seguro visível

Foi criado `v75-startup-guard.js` (`75-startup1`). A camada observa apenas a visibilidade do cofre e do shell da aplicação. Se `html.app-active` estiver ativo e ambos estiverem ocultos, reapresenta temporariamente o ecrã do cofre com `aria-busy="true"` e a mensagem **A preparar a aplicação com segurança…**. Assim que o shell fica disponível, o cofre volta a ser ocultado.

A guarda não lê `appState`, não acede a IndexedDB, não chama sincronização e não expõe dados financeiros antes da barreira de segurança existente.

## QA atual

Commit funcional: `cd229d83c3d47f54d7f8990a76f2f29acb372f47`.

CI da branch `fix/v75-safari-blank-screen`, run `34440532734`: **sucesso completo**. Passaram sintaxe, finanças, isolamento/cofre, faturas/QR, Mercado/imagens, `75-catalog3`, Pingo Doce, loader, segurança, responsividade, viewport móvel, navegação, acessibilidade, sync e o novo teste **Safari/PWA startup blank-screen regression tests**.

## Estado atual

A correção está validada em CI na branch, mas ainda não foi integrada/publicada em `main`. O defeito não deve ser considerado encerrado até existir deploy Pages do SHA integrado e nova validação no mesmo iPhone/Safari.

## Próximo passo

1. Integrar a branch em `main` por fast-forward sem force depois desta atualização documental e de novo CI verde.
2. Confirmar CI de `main` e GitHub Pages.
3. Reabrir a aplicação no iPhone/Safari sem apagar dados do site nem IndexedDB.
4. Confirmar que uma ligação lenta nunca mantém uma página branca indefinidamente e que, após PIN, existe sempre um estado visual seguro durante a preparação.
5. Depois retomar a validação física do flicker do Mercado.
