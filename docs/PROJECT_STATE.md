# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `d18d274141b1032ab0e909729739b3f86cabfb9e` — PR #96  
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

## 2. Incidente corrigido — PIN não abria a página principal

Evidência física recebida em Safari/iPhone: o ecrã `Introduza o seu PIN` permanecia visível enquanto a barra móvel autenticada (`Início`, `Despesas`, `Mercado`, `Planeamento`, `Mais`) aparecia por cima e chegava a cobrir a zona do botão `Entrar`.

Causa confirmada:

1. `enterApp()` ativava `app-active` e aguardava `syncStartupGate()` antes de mostrar `#app`;
2. `v75-startup-guard.js` interpretava `app-active + vault hidden + app hidden` como estado transitório e voltava a mostrar o cofre;
3. o dock móvel é `position:fixed` e depende de `app-active`, podendo aparecer sobre o cofre;
4. estados de sync como `not-configured`, `needs-token` ou `error` enviavam o utilizador para Segurança em vez do Dashboard, apesar de o cofre local já estar corretamente desbloqueado.

Correção `76-auth-transition1`, PR #96:

- PIN local válido abre imediatamente a aplicação/Dashboard;
- sincronização GitHub continua em background e deixa de bloquear a abertura;
- cofre e shell autenticado passam a ser estados mutuamente exclusivos;
- `v76-mobile-shell.css` impede `#app` de renderizar enquanto `#vaultScreen` estiver visível;
- em falha de transição, `app-active` é removido, a app é escondida e o cofre reaparece;
- cache PWA recebeu revisão `auth-transition1`.

Não foram alterados `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, schema, finanças ou dados.

## 3. Evidência de publicação do PR #96

Merge: `d18d274141b1032ab0e909729739b3f86cabfb9e`.

- TypeScript Foundation `34780407487`: sucesso;
- CI integral `34780407473`: sucesso;
- Safari/PWA startup regression: sucesso;
- mobile shell regression: sucesso;
- finanças, cofre, Mercado, segurança, responsive, acessibilidade e sync: sucesso;
- Deploy Pages `34780437328`: sucesso completo, incluindo build, allowlist, upload e deploy.

## 4. UI/UX publicada

- `76-modern-ui2`: tokens e componentes transversais;
- `76-dashboard-clean1`: Dashboard canónico sem os cinco blocos visuais v74 duplicados;
- `76-mobile-shell2`: autoridade da geometria mobile, safe areas, scroll e dock;
- `76-auth1`: redesign visual do acesso ao cofre;
- `76-auth-transition1`: separação correta entre cofre e shell autenticado + entrada local-first.

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

- integridade de rotas/páginas/bundle pelo PR #93;
- finanças e invariantes de contagem;
- isolamento do cofre e segurança;
- datas civis;
- faturas/QR;
- Mercado, imagens, scanner, quantidade e accounting;
- Safari/PWA startup;
- UI/responsive/mobile/acessibilidade;
- sync e conflitos;
- TypeScript strict;
- manifesto e bundle GitHub Pages.

## 7. Riscos/lacunas abertas

- validação física pós-PR96 ainda deve ser repetida no mesmo iPhone/Safari/PWA onde o defeito foi observado;
- navegação móvel ainda possui legado v74 e precisa de consolidação para uma única autoridade;
- `v74-experience.js` ainda cria componentes de Dashboard que v76 oculta; deve deixar de criá-los num bloco próprio;
- há conflito histórico de cascade entre cabeçalho v75 e superfícies claras v76 a consolidar;
- `market-experience.js` ainda precisa de teste dedicado da persistência de `pid` em todo o fluxo;
- `main` ainda não tem required checks/branch protection obrigatórios;
- fonte funcional ainda não é 100% TypeScript.

## 8. Próximo passo

1. validar fisicamente o PR #96 no iPhone/Safari e PWA instalada;
2. consolidar a autoridade da navegação móvel e eliminar a injeção visual legada já substituída;
3. continuar redesign real por página: Faturas → Mercado → Planeamento → Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
4. continuar migração TypeScript em blocos de baixo risco, sem misturar alterações de domínio com redesign.