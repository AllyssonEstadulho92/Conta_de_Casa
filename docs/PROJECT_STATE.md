# Estado do Projeto — Conta de Casa

Atualizado: 14 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — consolidação UI/UX + migração incremental TypeScript  
Baseline pública: `36231cb518570a66a6974de90047517ee6109c27` — documentação após PR #100  
Branch de trabalho: `feat/v76-icon-semantics2`  
Distribuição: GitHub Pages / PWA  
Fallback técnico: `backup/js-runtime-baseline-20260912`

## Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro cifrado em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` distinto de `actualCents`;
- `marketId|pid` como identidade canónica;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- UI/UX e migração de linguagem não alteram silenciosamente domínio, persistência ou segurança.

## Estado funcional publicado

- PR #96 (`76-auth-transition1`): PIN local válido abre a aplicação sem depender do sync remoto;
- PR #98 (`76-auth-hidden1`): Safari/WebKit respeita explicitamente o estado `hidden` entre cofre e shell;
- PR #99 (`76-ui-audit1`): header, drawer, dock e auth visual consolidados;
- PR #100 (`76-brand-icons1`): marca e iconografia base consolidadas;
- PR #101: memória permanente atualizada depois da publicação de #100.

Evidência da baseline pública de runtime (#100):

- merge `5b9689f04e844b9216626729b3b5aae5bf1acc09`;
- TypeScript Foundation main `34783537256`: sucesso;
- CI main `34783537266`: sucesso integral;
- Pages `34783564467`: sucesso.

A atualização documental #101 também passou CI e Pages sem alterar runtime.

## Bloco atual — `76-icon-semantics2`

Feedback físico no iPhone mostrou que a limpeza anterior deixou o dock demasiado neutro: ícones inativos quase todos cinzentos e `Planeamento` truncado como `Planeame…`.

Problemas confirmados no código:

1. `plan` no subset Lucide local usava geometria semelhante a carteira/inbox, pouco clara para planeamento;
2. `settings` usava sliders em vez da engrenagem convencional;
3. o menu `Mais` do runtime v74 pedia nomes não canónicos (`income`, `security`, `sync`) e podia cair no fallback `more`/reticências;
4. a navegação móvel tinha cinco destinos com pouco contraste cromático e o label `Planeamento` não cabia no dock;
5. notificações e outros controlos globais ficaram visualmente demasiado neutros depois do bloco anterior.

Correções implementadas na branch:

- `plan` passa para a geometria oficial Lucide `clipboard-list` do snapshot já fixado no projeto;
- `settings` passa para engrenagem oficial Lucide;
- `activity` é adicionado para Diagnóstico;
- menu `Mais` usa nomes canónicos: `report`, `goal`, `shield`, `cloudCheck`, `activity`;
- label móvel `Planeamento` é reduzido para `Plano`, sem alterar rota ou título da página;
- criada paleta semântica controlada para ícones em light/dark: teal, índigo, verde, âmbar, roxo, azul e rosa apenas por função;
- estado ativo continua identificado por fundo/texto/`aria-current`, portanto cor não é o único sinal;
- ações destrutivas, sucesso, aviso, sync, edição e filtros recebem acentos semânticos;
- `forced-colors` mantém autoridade do sistema operativo;
- Service Worker recebe `icon-semantics2` para invalidar o cache da PWA;
- testes de iconografia e consistência foram atualizados para proteger geometria, nomes canónicos, paleta e label móvel.

Nenhuma alteração foi feita a `finance.js`, estado financeiro, IndexedDB, PIN, PBKDF2/AES-GCM, sync de dados, QR, scanner, quantidades ou preços.

## Migração TypeScript

Fontes manuais JS já substituídas:

1. `v76-veggie-menu.js` → `src/ui/veggie-menu-toggle.ts` — PR #88;
2. `market-branding.js` → `src/ui/market-branding.ts` — PR #89;
3. `sync-conflict-policy.js` → `src/sync/sync-conflict-policy.ts` — PR #95.

Fluxo: `TypeScript strict → .generated/*.js → dist/*.js → browser`.

Ainda permanecem JS manuais críticos (`core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `sync.js`, Mercado, iconografia e Service Worker). Nenhum será apagado antes de existir substituto TypeScript com paridade e regressões verdes.

## Riscos/lacunas abertas

- `76-icon-semantics2` ainda precisa de TypeScript Foundation + CI integral + Pages antes de ser considerado publicado;
- validar fisicamente a nova cor/semântica no mesmo iPhone/Safari/PWA e Android/Chrome;
- o ícone do ecrã principal de uma PWA já instalada pode depender do refresh/reinstalação do sistema operativo;
- consolidar navegação móvel para uma única fonte; `ensureMobileNav()` v74 continua autoridade concorrente;
- parar criação runtime dos blocos v74 já escondidos;
- remover glifos Unicode/fallbacks apenas depois de prova de não utilização;
- rever páginas reais: Faturas → Mercado → Planeamento → Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
- criar teste ponta a ponta da persistência `marketId|pid`;
- reduzir CSS legado apenas depois de prova de não utilização;
- `main` continua sem required checks/branch protection obrigatório.

## Próximo passo

1. executar TypeScript Foundation + CI integral do bloco `76-icon-semantics2`;
2. corrigir regressões sem voltar à iconografia cinzenta/genérica;
3. integrar e publicar apenas com gates verdes;
4. validar o resultado no iPhone/PWA real;
5. depois consolidar a autoridade da navegação móvel e continuar a revisão página a página.
