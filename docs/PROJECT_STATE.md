# Estado do Projeto — Conta de Casa

Atualizado: 14 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — consolidação UI/UX + migração incremental TypeScript  
Baseline `main`: `351180c240a7237da4551947f79d9a351903176e` — PR #104  
Branch de trabalho: `feat/v76-icon-semantics3`  
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

## Estado funcional recente

- PR #96 (`76-auth-transition1`): PIN local válido abre a aplicação sem depender do sync remoto;
- PR #98 (`76-auth-hidden1`): Safari/WebKit respeita explicitamente o estado `hidden` entre cofre e shell;
- PR #99 (`76-ui-audit1`): header, drawer, dock e auth visual consolidados;
- PR #100 (`76-brand-icons1`): marca simplificada e Lucide estabelecido como família funcional;
- PR #102 (`76-full-page-audit1`): auditoria transversal de contraste, overflow, diálogos, tabs, tabelas e responsive;
- PR #103 (`76-page-polish1`): revisão visual página a página das 10 rotas;
- PR #104 (`76-runtime-consolidation1`): `v75-stability.js` passa a ser a autoridade final do dock móvel de cinco destinos e remove DOM v74 do Dashboard já substituído.

## Bloco atual — `76-icon-semantics3`

Problemas confirmados a partir da validação física no iPhone:

1. iconografia demasiado neutra/cinzenta, com pouca hierarquia funcional;
2. `Planeamento` truncava para `Planeame…` no dock móvel;
3. o ícone `plan` parecia uma carteira/caixa e não planeamento;
4. o ícone `settings` era um conjunto de sliders, pouco reconhecível como Definições;
5. Diagnóstico não tinha um símbolo funcional próprio;
6. o menu `Mais` podia cair em ícones genéricos para relatórios, objetivos, segurança, sync e diagnóstico.

Correções implementadas na branch e ainda em validação:

- `plan` substituído por clipboard/checklist;
- `settings` substituído por engrenagem;
- `activity` adicionado para Diagnóstico;
- dock móvel usa label curto `Plano` sem alterar a rota/página `Planeamento`;
- paleta semântica controlada: teal, índigo, verde, âmbar, roxo, azul e rosa apenas por função;
- equivalentes dark mode explícitos;
- `forced-colors` continua a sobrepor a paleta personalizada;
- seleção do dock continua indicada por `aria-current`, fundo e texto, não apenas por cor;
- menu `Mais` recebe ícones semânticos via `v75-stability.js` sem alterar rotas/handlers;
- Service Worker recebe revisão `icon-semantics3` para distribuir a alteração.

Nenhuma alteração deste bloco toca `finance.js`, `core.js`, IndexedDB, PIN, PBKDF2/AES-GCM, dados, preços, quantidades, QR, scanner ou sync financeiro.

## Migração TypeScript

Fontes manuais JS já substituídas por fonte TypeScript canónica:

1. `v76-veggie-menu.js` → `src/ui/veggie-menu-toggle.ts` — PR #88;
2. `market-branding.js` → `src/ui/market-branding.ts` — PR #89;
3. `sync-conflict-policy.js` → `src/sync/sync-conflict-policy.ts` — PR #95.

Fluxo: `TypeScript strict → .generated/*.js → dist/*.js → browser`.

Ainda permanecem JS manuais críticos (`core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `sync.js`, módulos do Mercado e Service Worker). Nenhum será apagado antes de existir substituto TypeScript com paridade e regressões verdes.

## Riscos/lacunas abertas

- validar fisicamente `76-icon-semantics3` no mesmo iPhone/Safari/PWA;
- terminar CI + TypeScript Foundation + Pages deste bloco antes de o considerar publicado;
- continuar redução controlada de CSS v74/v75 apenas com prova de não utilização;
- revisar Faturas e Mercado nos estados reais de erro/empty/loading/success;
- criar teste ponta a ponta da persistência `marketId|pid`;
- continuar migração TypeScript por baixo acoplamento antes de `finance/core/cifra`;
- `main` continua sem required checks/branch protection obrigatório.

## Próximo passo

1. abrir PR do `76-icon-semantics3`;
2. executar CI e TypeScript Foundation completos;
3. corrigir qualquer regressão real encontrada pelos gates;
4. integrar apenas com gates verdes;
5. confirmar GitHub Pages e repetir validação física no iPhone;
6. continuar revisão página a página e migração TypeScript por blocos.
