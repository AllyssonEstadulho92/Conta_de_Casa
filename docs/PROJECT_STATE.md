# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
Runtime publicado: `75-startup1` sobre SHA funcional `188c0820adff62540987fb6f8ef65c76ab9bf596`

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

## Defeito observado: ecrã branco no iPhone/Safari

A captura de 10 de setembro mostrou o Safari numa página totalmente branca enquanto a barra de progresso do próprio browser ainda indicava carregamento. A imagem, isoladamente, não permite provar qual etapa de runtime ficou bloqueada.

A auditoria confirmou dois caminhos independentes capazes de produzir um estado branco:

1. **Navegação do Service Worker sem limite temporal.** `sw.js` fazia `fetch(event.request)` e só recorria ao `index.html` em cache quando a promessa rejeitava. Uma ligação lenta ou pendurada podia manter a navegação sem resposta durante tempo indeterminado.
2. **Estado transitório após desbloqueio.** O fluxo existente pode manter simultaneamente `#vaultScreen` e `#app` ocultos enquanto a barreira inicial de sincronização aguarda. A confidencialidade deve ser preservada, mas não deve resultar numa superfície branca.

Não é possível confirmar apenas pela captura qual destes caminhos ocorreu naquele momento. Ambos foram tratados porque são riscos reais confirmados no código.

## Correção publicada `75-startup1`

### Navegação

- documentos de navegação passam por `navigationResponse()`;
- tentativa de rede usa `cache:'no-store'` e `AbortController`;
- limite de rede: 4 segundos;
- após timeout/erro, usa `./index.html` já instalado em cache;
- navegação de rede bem-sucedida atualiza a cópia de `index.html` no cache;
- se não existir rede nem cache, é devolvida resposta 503 legível;
- cache público termina em `photo-loader2-startup1`.

### Arranque seguro visível

`v75-startup-guard.js` (`75-startup1`) observa apenas a visibilidade do cofre e do shell. Se `html.app-active` estiver ativo e ambos estiverem ocultos, reapresenta temporariamente o ecrã do cofre com `aria-busy="true"` e a mensagem **A preparar a aplicação com segurança…**. Assim que o shell fica disponível, o cofre volta a ser ocultado.

A guarda não lê `appState`, não acede a IndexedDB, não chama sincronização e não expõe dados financeiros antes da barreira de segurança existente.

## QA e publicação

- commit funcional inicial: `cd229d83c3d47f54d7f8990a76f2f29acb372f47`;
- commit integrado com documentação: `188c0820adff62540987fb6f8ef65c76ab9bf596`;
- CI funcional da branch run `34440532734`: sucesso;
- CI da branch após documentação run `34440742219`: sucesso;
- comparação antes da integração: `ahead 2`, `behind 0`;
- integração em `main`: fast-forward sem force para `188c0820adff62540987fb6f8ef65c76ab9bf596`;
- CI de `main` run `34440788510`: sucesso completo;
- GitHub Pages run `34440824303`: sucesso, incluindo checkout da revisão testada, allowlist, upload e deploy.

Passaram, entre outros, sintaxe, finanças, isolamento/cofre, faturas/QR, Mercado/imagens, catálogo visual, Pingo Doce, loader, segurança, responsividade, viewport móvel, navegação, acessibilidade, sync e o novo teste **Safari/PWA startup blank-screen regression tests**.

## Estado atual

A correção está integrada e publicada. O defeito ainda não deve ser considerado encerrado apenas com CI/Pages, porque foi observado em hardware real e depende do comportamento efetivo do Safari/PWA.

## Próximo passo

Reabrir a aplicação no mesmo iPhone/Safari sem apagar dados do site nem IndexedDB. Confirmar que uma ligação lenta nunca mantém uma página branca indefinidamente e que, após PIN, existe sempre um estado visual seguro durante a preparação. Depois retomar a validação física do flicker do Mercado durante 30–60 segundos.
