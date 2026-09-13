# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `56f909846c5f02c466f047792c99a61f7fbac1c7` — PR #98  
Distribuição: GitHub Pages / PWA  
Fallback técnico: `backup/js-runtime-baseline-20260912`

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional e cifrada;
- `estimatedCents` distinto de `actualCents`;
- `marketId|pid` é identidade canónica do pipeline de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- UI/UX e migração de linguagem não podem alterar silenciosamente cálculos, pagamentos, faturas, persistência ou segurança.

## 2. Incidente PIN — estado final após validação física

A primeira captura em Safari/iPhone mostrou o ecrã `Introduza o seu PIN` com o dock móvel autenticado por cima. O PR #96 (`76-auth-transition1`) corrigiu a corrida entre `enterApp()`, `syncStartupGate()` e `v75-startup-guard.js`, tornando a abertura local-first e impedindo o shell autenticado enquanto o cofre está visível.

Uma segunda captura física, já após essa publicação, revelou um defeito residual diferente: depois do PIN válido o conteúdo inferior do cofre (`Problemas com o PIN?`, importação, `A desbloquear...`) continuava fisicamente no fluxo da página, enquanto a página `Mais` e o dock autenticado apareciam por baixo.

Causa confirmada do defeito residual:

- `v76-auth1` declara `#vaultScreen.vault-screen { display:grid!important; }`;
- em Safari/WebKit essa declaração de autor podia prevalecer visualmente sobre o comportamento nativo do atributo HTML `hidden`;
- o runtime colocava `vaultScreen.hidden = true`, mas o cofre continuava renderizado;
- nesse estado, o seletor de `76-auth-transition1` deixava corretamente de bloquear `#app`, porque o cofre já tinha o atributo `hidden`, permitindo que ambos surgissem no documento.

Correção `76-auth-hidden1`, PR #98:

- `#vaultScreen[hidden]` passa a ser explicitamente `display:none!important` na última camada CSS;
- `#app[hidden]` recebe o mesmo contrato explícito;
- mantém-se a regra anterior `#vaultScreen:not([hidden]) + #app { display:none!important; }`;
- a cache PWA recebeu a revisão `auth-hidden1`;
- o teste `v76-mobile-shell.test.cjs` cobre o contrato `hidden` e confirma a regra também no bundle `dist/`.

O hotfix não altera PIN, PBKDF2, AES-GCM, IndexedDB, schema, finanças, faturas, Mercado, scanner, QR ou sincronização.

## 3. Evidência da publicação atual

PR #98 merge: `56f909846c5f02c466f047792c99a61f7fbac1c7`.

Gates no PR:

- TypeScript Foundation `34781082212`: sucesso;
- CI integral `34781082224`: sucesso, incluindo mobile shell, Safari/PWA startup, segurança, responsive, navegação, acessibilidade, sync, finanças e Mercado.

Gates pós-merge em `main`:

- TypeScript Foundation `34781128824`: sucesso;
- CI integral `34781128879`: sucesso;
- Deploy Pages `34781156741`: sucesso completo, incluindo build, allowlist, upload e deploy.

## 4. UI/UX publicada

- `76-modern-ui2`: tokens e componentes transversais;
- `76-dashboard-clean1`: Dashboard canónico sem os cinco blocos visuais v74 duplicados;
- `76-mobile-shell2`: autoridade da geometria mobile, safe areas, scroll e dock;
- `76-auth1`: redesign visual do acesso ao cofre;
- `76-auth-transition1`: separação lógica entre cofre e shell autenticado + entrada local-first;
- `76-auth-hidden1`: contrato visual explícito do atributo `hidden` para Safari/WebKit.

Ainda existe CSS/runtime histórico v74/v75 a consolidar. Não remover sem prova de ausência de dependências.

## 5. Migração TypeScript

Fontes manuais JavaScript já substituídas:

1. `v76-veggie-menu.js` → `src/ui/veggie-menu-toggle.ts` — PR #88;
2. `market-branding.js` → `src/ui/market-branding.ts` — PR #89;
3. `sync-conflict-policy.js` → `src/sync/sync-conflict-policy.ts` — PR #95.

Fluxo comprovado:

`TypeScript strict → .generated/*.js → dist/*.js → browser`.

Ainda permanecem fontes JS manuais, incluindo `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `sync.js`, módulos de Mercado, runtimes históricos e Service Worker. Nenhuma será apagada sem substituto TypeScript, paridade e CI verde.

## 6. Gates existentes

- integridade de rotas/páginas/bundle;
- finanças e invariantes de contagem;
- isolamento do cofre e segurança;
- datas civis;
- faturas/QR;
- Mercado, imagens, scanner, quantidade e accounting;
- Safari/PWA startup;
- contrato `hidden` cofre/shell;
- UI/responsive/mobile/acessibilidade;
- sync e conflitos;
- TypeScript strict;
- manifesto e bundle GitHub Pages.

## 7. Riscos/lacunas abertas

- repetir validação física pós-PR98 no mesmo iPhone/Safari/PWA onde os dois defeitos foram observados;
- navegação móvel ainda possui legado v74 e precisa de consolidação para uma única autoridade;
- `v74-experience.js` ainda cria componentes de Dashboard que v76 oculta; deve deixar de criá-los num bloco próprio;
- há conflito histórico de cascade entre cabeçalho v75 e superfícies claras v76 a consolidar;
- `market-experience.js` ainda precisa de teste dedicado da persistência de `pid` em todo o fluxo;
- `main` ainda não tem required checks/branch protection obrigatórios;
- fonte funcional ainda não é 100% TypeScript.

## 8. Próximo passo

1. validar fisicamente o PR #98 no iPhone/Safari e PWA instalada: PIN correto deve ocultar totalmente o cofre e mostrar apenas o Dashboard/shell;
2. consolidar a autoridade da navegação móvel e eliminar a injeção visual legada já substituída;
3. continuar redesign real por página: Faturas → Mercado → Planeamento → Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
4. continuar migração TypeScript em blocos de baixo risco, sem misturar alterações de domínio com redesign.