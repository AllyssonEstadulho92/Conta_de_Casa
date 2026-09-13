# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — consolidação UI/UX + migração incremental TypeScript  
Baseline pública antes do bloco atual: `56f909846c5f02c466f047792c99a61f7fbac1c7` — PR #98  
Branch de trabalho: `feat/v76-ui-audit-system1`  
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

PR #96 (`76-auth-transition1`) tornou a entrada local-first: PIN local válido abre a aplicação sem depender do sync remoto.

PR #98 (`76-auth-hidden1`) corrigiu a regressão física observada em Safari/WebKit em que o cofre continuava renderizado apesar de `hidden=true`. A camada final passou a tornar `#vaultScreen[hidden]` e `#app[hidden]` explicitamente `display:none!important`.

Evidência PR #98:

- merge `56f909846c5f02c466f047792c99a61f7fbac1c7`;
- TypeScript Foundation `34781128824`: sucesso;
- CI `34781128879`: sucesso;
- Pages `34781156741`: sucesso.

## Auditoria UI/UX atual — `76-ui-audit1`

A auditoria passou a seguir formalmente Apple HIG, Material 3, WCAG 2.2 e web.dev como referências adaptadas ao contexto da PWA.

Problemas altos confirmados:

1. header v75 escuro/gradiente em conflito com superfície clara v76;
2. onboarding v74 ainda capaz de mascarar o fluxo visual `76-auth1`;
3. navegação móvel com duas autoridades (`core/render` e `v74-experience`);
4. runtime v74 ainda cria blocos de Dashboard já substituídos;
5. cascade histórica v74/v75/v76 excessivamente dependente de `!important`.

Correções já aplicadas na branch atual:

- header móvel neutro, sem gradiente decorativo e sem branco forçado;
- menu/notificações com 44 px, foco visível e forced-colors;
- dock móvel com selected state discreto, foco e tipografia consistentes;
- onboarding v74 ocultado pela autoridade CSS final, mantendo o formulário real do cofre;
- cache PWA preparada para invalidação `ui-audit1`;
- testes de consistência/header/mobile shell atualizados;
- auditoria detalhada registada em `docs/UI_UX_AUDIT.md`.

## Migração TypeScript

Fontes manuais JS já substituídas:

1. `v76-veggie-menu.js` → `src/ui/veggie-menu-toggle.ts` — PR #88;
2. `market-branding.js` → `src/ui/market-branding.ts` — PR #89;
3. `sync-conflict-policy.js` → `src/sync/sync-conflict-policy.ts` — PR #95.

Fluxo: `TypeScript strict → .generated/*.js → dist/*.js → browser`.

Ainda permanecem JS manuais críticos (`core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `sync.js`, Mercado e Service Worker). Nenhum será apagado antes de existir substituto TypeScript com paridade e regressões verdes.

## Riscos/lacunas abertas

- validar fisicamente a baseline PR #98 e o próximo bloco no mesmo iPhone/Safari/PWA;
- consolidar navegação móvel para uma única fonte;
- parar a criação runtime dos blocos v74 já escondidos;
- rever todas as páginas reais: Faturas → Mercado → Planeamento → Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
- consolidar escalas tipográficas e iconografia após estabilização de página;
- criar teste ponta a ponta da persistência `marketId|pid`;
- reduzir CSS legado apenas depois de prova de não utilização;
- `main` ainda sem required checks/branch protection obrigatório.

## Próximo passo

1. executar CI integral da branch `feat/v76-ui-audit-system1`;
2. corrigir qualquer regressão encontrada;
3. integrar/publicar apenas com TypeScript + CI + Pages verdes;
4. iniciar bloco dedicado de navegação móvel e remoção da criação visual v74 substituída;
5. continuar revisão página a página conforme `docs/UI_UX_AUDIT.md`.