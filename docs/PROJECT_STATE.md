# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — consolidação UI/UX + migração incremental TypeScript  
Baseline pública: `5b9689f04e844b9216626729b3b5aae5bf1acc09` — PR #100  
Branch de trabalho: `main` após `76-brand-icons1`  
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
- PR #100 (`76-brand-icons1`): marca e iconografia consolidadas.

Evidência PR #100:

- merge `5b9689f04e844b9216626729b3b5aae5bf1acc09`;
- TypeScript Foundation main `34783537256`: sucesso;
- CI main `34783537266`: sucesso integral;
- Pages `34783564467`: sucesso.

## `76-brand-icons1` — publicado

Problemas confirmados no código:

1. `icon.svg` usava casa + euro + folha + dois gradientes, demasiado complexo para tamanhos pequenos;
2. a PWA usava `icon.svg`, mas `.brand-mark` era hidratado como Lucide `home`, criando duas identidades visuais;
3. HTML ainda contém glifos Unicode de fallback (`⌂`, `◉`, `⌁`, `☼`, `⌄`) antes da hidratação;
4. Mercado acumulava pseudo-ícones decorativos além do sistema Lucide;
5. “Adicionar item” recebia `Plus` semântico, mas CSS escondia-o e mostrava scanner, contradizendo a ação.

Correções publicadas:

- `icon.svg` simplificado para casa + euro, teal sólido `#087B78`, branco, sem folha ou gradientes;
- `.brand-mark` reutiliza `icon.svg`; o Lucide `home` redundante é visualmente neutralizado;
- Lucide permanece a única família de ícones funcionais;
- pseudo-ícones decorativos/duplicados do Mercado neutralizados;
- “Adicionar item” volta a mostrar `Plus`;
- stroke funcional normalizado em 2 px;
- cache PWA invalidada com `brand-icons1`;
- teste de iconografia protege marca, semântica e ausência de duplicação.

Nenhuma alteração foi feita a `finance.js`, estado financeiro, IndexedDB, PIN, PBKDF2/AES-GCM, sync, QR, scanner, quantidades ou preços.

## Migração TypeScript

Fontes manuais JS já substituídas:

1. `v76-veggie-menu.js` → `src/ui/veggie-menu-toggle.ts` — PR #88;
2. `market-branding.js` → `src/ui/market-branding.ts` — PR #89;
3. `sync-conflict-policy.js` → `src/sync/sync-conflict-policy.ts` — PR #95.

Fluxo: `TypeScript strict → .generated/*.js → dist/*.js → browser`.

Ainda permanecem JS manuais críticos (`core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `sync.js`, Mercado e Service Worker). Nenhum será apagado antes de existir substituto TypeScript com paridade e regressões verdes.

## Riscos/lacunas abertas

- validar fisicamente a nova marca e iconografia no mesmo iPhone/Safari/PWA e Android/Chrome;
- o ícone do ecrã principal de uma PWA já instalada pode depender do refresh/reinstalação do sistema operativo;
- remover futuramente glifos Unicode do HTML apenas depois de provar que o fallback não é necessário;
- deixar de hidratar `.brand-mark` como Lucide `home` numa limpeza posterior;
- consolidar navegação móvel para uma única fonte;
- parar criação runtime dos blocos v74 já escondidos;
- rever páginas reais: Faturas → Mercado → Planeamento → Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
- criar teste ponta a ponta da persistência `marketId|pid`;
- reduzir CSS legado apenas depois de prova de não utilização;
- `main` continua sem required checks/branch protection obrigatório.

## Próximo passo

1. validar visualmente marca, navegação, ações, Mercado e PWA no dispositivo real;
2. corrigir qualquer problema físico observado antes de remover fallback histórico;
3. consolidar navegação móvel numa única autoridade;
4. continuar a revisão página a página e a limpeza controlada do CSS/runtime v74/v75.
