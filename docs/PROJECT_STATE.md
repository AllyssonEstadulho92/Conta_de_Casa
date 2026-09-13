# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — consolidação UI/UX + migração incremental TypeScript  
Baseline pública: `add93b922fd8c91d6ec8ad7fffcc8bf5984d673c` — PR #99  
Branch de trabalho: `feat/v76-brand-icons1`  
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

PR #98 (`76-auth-hidden1`) corrigiu a regressão física observada em Safari/WebKit em que o cofre continuava renderizado apesar de `hidden=true`.

PR #99 (`76-ui-audit1`) foi integrado e publicado. Consolidou header móvel, drawer, dock, auth visual e regressões transversais sem alterar domínio financeiro, cofre ou persistência.

Evidência PR #99:

- merge `add93b922fd8c91d6ec8ad7fffcc8bf5984d673c`;
- CI pós-merge `34782068003`: sucesso integral;
- Pages `34782098996`: sucesso.

## Bloco atual — `76-brand-icons1`

Problemas confirmados no código:

1. `icon.svg` usava casa + euro + folha + dois gradientes, demasiado complexo para tamanhos pequenos;
2. a aplicação instalada usava `icon.svg`, mas `.brand-mark` era hidratado como ícone Lucide `home`, criando duas identidades visuais;
3. HTML ainda contém glifos Unicode de fallback (`⌂`, `◉`, `⌁`, `☼`, `⌄`) antes da hidratação;
4. Mercado acumulava pseudo-ícones decorativos próprios além do sistema Lucide: carrinho no título, chevron extra de sync, scanner no botão “Adicionar item” e ícones coloridos nos cartões de resumo;
5. o botão “Adicionar item” recebia `Plus` semântico por JavaScript, mas CSS escondia-o e mostrava um scanner, criando discrepância entre ação e símbolo.

Correções aplicadas na branch:

- `icon.svg` simplificado para marca única casa + euro, teal sólido `#087B78`, branco e sem folha/gradientes;
- `.brand-mark` passa a reutilizar `icon.svg`; o Lucide `home` que ainda é hidratado internamente fica visualmente neutralizado;
- Lucide permanece a única família de ícones funcionais;
- pseudo-ícones decorativos/duplicados do Mercado são neutralizados pela autoridade CSS final;
- “Adicionar item” volta a mostrar o ícone semântico `Plus`;
- stroke funcional normalizado em 2 px;
- cache PWA invalidada com `brand-icons1`;
- teste de iconografia atualizado para proteger marca, semântica e ausência de decoração duplicada.

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
- o ícone do ecrã principal de uma PWA já instalada pode depender do refresh/reinstalação do sistema operativo; não assumir atualização instantânea;
- remover futuramente os glifos Unicode do HTML apenas depois de provar que o fallback não é necessário;
- deixar de hidratar `.brand-mark` como Lucide `home` numa limpeza posterior, quando os consumidores estiverem comprovados;
- consolidar navegação móvel para uma única fonte;
- parar criação runtime dos blocos v74 já escondidos;
- rever todas as páginas reais: Faturas → Mercado → Planeamento → Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
- criar teste ponta a ponta da persistência `marketId|pid`;
- reduzir CSS legado apenas depois de prova de não utilização;
- `main` continua sem required checks/branch protection obrigatório.

## Próximo passo

1. concluir documentação do bloco `76-brand-icons1`;
2. abrir PR e executar TypeScript Foundation + CI integral;
3. corrigir qualquer regressão sem restaurar iconografia contraditória;
4. integrar/publicar apenas com CI verde;
5. validar visualmente marca, navegação, ações, Mercado e PWA em dispositivo real;
6. depois retomar consolidação estrutural de navegação e revisão página a página.
