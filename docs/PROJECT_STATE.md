# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `480dc501ff10bf29413b934e623d8641d5e95229` — PR #147  
Branch funcional: `main`

## Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro cifrado em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` é a identidade canónica de produto quando existe origem live verificável;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- UI/UX e migração de linguagem não alteram silenciosamente domínio, persistência ou segurança.

## Estado publicado

A `main` está oficialmente em v76/`0.76.0`.

Consolidações relevantes:

- PR #105–#116: retirada progressiva do runtime v74, autoridade única de navegação/composição e oficialização da v76;
- PR #117–#130: menu móvel, shell/safe areas, Planeamento/Mais, Dashboard, Mercado, drawer e pesquisa alinhados ao produto v76;
- PR #131: fluxo profissional de Adicionar despesa;
- PR #132: hotfix Safari/iPhone para touch/scroll do formulário de despesas;
- PR #133/#134: identidade `marketId|pid` do Mercado e expiração segura do estado transitório;
- PR #136: `76-drawer-hierarchy1`, drawer móvel em hierarquia vertical legível;
- PR #138: `76-icon-semantics1`, Planeamento/Definições com geometrias Lucide coerentes;
- PR #140: `76-bills-mobile-filters1`, pesquisa/filtros móveis de Despesas reorganizados;
- PR #142: `76-bills-mobile-spacing1`, ritmo e espaçamento do mesmo bloco;
- PR #143: `76-planning-budget-card2`, resumo móvel de Planeamento reorganizado;
- PR #145: `76-planning-ring-shape1`, anel de orçamento normalizado após validação física;
- PR #147: `76-bills-mobile-alignment2`, filtros móveis de Despesas convertidos de faixa horizontal para grelha contida e alinhada.

## Evidência mais recente — PR #147

- head final do PR: `c2435e8580982c8c8367b0e7458ead2009201a5d`;
- TypeScript Foundation PR `34951435419`: sucesso;
- CI PR `34951435285`: sucesso integral;
- merge PR #147: `480dc501ff10bf29413b934e623d8641d5e95229`;
- TypeScript Foundation `main` `34951525321`: sucesso;
- CI `main` `34951525416`: sucesso integral;
- Pages `34951589187`: sucesso.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados pelo PR #147.

## Despesas — pesquisa, filtros e alinhamento móvel

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` + `76-bills-mobile-alignment2` estão integrados:

- `#billSearch`, `#newBillBtn`, `#billStatusFilter`, `#billCategoryFilter`, `#billDateFrom`, `#billDateTo`, `#billSort` e `#billClearFilters` continuam canónicos;
- `renderBills()` e `events.js` continuam a autoridade funcional;
- lupa histórica duplicada permanece neutralizada; a lupa Lucide local é a única representação funcional;
- pesquisa e ação principal ocupam uma superfície compacta com espaçamento previsível;
- a antiga faixa horizontal de filtros deixou de ser a apresentação final no mobile;
- Estado/Categoria formam o primeiro par, De/Até o segundo, Ordenar ocupa uma linha completa e Limpar filtros permanece ação terciária;
- o cartão usa contenção de largura (`min-width:0`/`max-width:100%`) e não depende de scroll horizontal para revelar controlos;
- controlos móveis têm 50 px de altura e o botão Limpar mantém target de pelo menos 44 px;
- `<=360px` usa uma coluna para evitar clipping;
- foco, `forced-colors` e `prefers-reduced-motion` permanecem cobertos;
- `mobile-layout.css` continua CSS de feature e não assume viewport/safe areas/dock, cuja autoridade é `v76-mobile-shell.css`;
- cálculos, persistência, PIN/cofre, QR, scanner, Mercado e sync não foram alterados.

Durante o PR #147, o gate de arquitetura rejeitou `overflow:hidden` genérico em CSS de feature. A implementação final removeu esse ownership indevido e a CI voltou a verde.

## Planeamento — orçamento móvel

`76-planning-budget-card2` + `76-planning-ring-shape1` permanecem publicados:

- `#monthPicker` continua a autoridade do mês e `stepMonth()` apenas atualiza/dispara o fluxo existente;
- gasto, orçamento e disponível continuam derivados da lógica financeira existente;
- orçamento ausente continua factual: `Por definir`, sem percentagem falsa;
- Definir/Editar orçamento apenas desloca/foca `#monthlyBudget`;
- a gravação continua exclusivamente no `#monthPlanForm` através de `events.js`;
- o anel usa `height:auto!important` + `aspect-ratio:1/1!important`, com 136/128/116 px conforme breakpoint;
- iconografia Lucide local, `forced-colors`, `prefers-reduced-motion` e targets tácteis permanecem preservados.

A forma circular corrigida ainda precisa de confirmação visual no mesmo iPhone/PWA após atualização do cache.

## Iconografia funcional — estado atual

- `icon.svg` é a marca canónica;
- `ui-icons.js` + `ui-icons.css` são a autoridade da iconografia funcional Lucide;
- snapshot Lucide fixado em `94e4cb9d9db5907053ebf3636a97c45529cf776b`, com `LUCIDE_LICENSE.txt` preservada;
- Planeamento usa `CalendarCheck2`; Definições usa `Settings`/engrenagem;
- nenhuma CDN de iconografia foi introduzida.

## Navegação móvel — estado atual

`76-drawer-hierarchy1` permanece publicado:

- drawer à direita, uma coluna e destinos de primeiro nível;
- Principal: Início, Despesas, Planeamento e Mercado;
- Análise: Relatórios;
- Sistema: Segurança e sincronização, Definições;
- Calendário/Metas/Diagnóstico continuam nas respetivas páginas-pai;
- botão fechar e ações de sessão preservam targets e foco.

## Mercado — estado de identidade

`76-market-identity1` + `76-market-identity-stale1` permanecem publicados:

- pesquisa Cesta preserva `marketId` e `pid` ao adicionar produto;
- normalização/reload/restauro/sync retêm a identidade;
- identidade temporária expira quando não é consumida;
- preço, quantidade, `estimatedCents`, `actualCents`, scanner e persistência financeira permanecem inalterados.

## Auditoria atual — problemas abertos

### ALTO

- confirmar fisicamente `76-bills-mobile-alignment2` no mesmo iPhone/Safari e PWA instalada;
- confirmar fisicamente `76-planning-ring-shape1` no mesmo dispositivo;
- validar drawer e iconografia no mesmo dispositivo;
- acrescentar E2E real WebKit/Chromium para toque, teclado, scroll e PIN → aplicação;
- reduzir gradualmente a cascade CSS e dependência de `!important`;
- `main` continua sem branch protection/required checks obrigatórios.

### MÉDIO

- ZXing do scanner continua dependente de `unpkg.com`; a página Segurança não deve afirmar literalmente “Sem CDNs” enquanto isso existir;
- migrar ZXing para bundle local, preservando licença, antes de restringir `script-src` para `'self'`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- continuar migração TypeScript por risco, sem começar por `finance.js`/cifra.

## Higiene de repositório

- PR #45/v65 encerrado como obsoleto em 15/09/2026; não deve ser reaberto ou integrado na v76.

## Próximo passo

1. validar fisicamente `76-bills-mobile-alignment2` no iPhone/Safari web e PWA instalada, incluindo 360/390/430 px equivalentes;
2. confirmar `76-planning-ring-shape1` e drawer/iconografia no mesmo dispositivo;
3. corrigir a descrição da página Segurança para refletir a dependência ZXing real;
4. preparar ZXing local + licença e, só depois, remover `unpkg.com` de `script-src`;
5. criar primeiro fluxo E2E WebKit/Chromium;
6. consolidar CSS por propriedade/componente com prova de não utilização;
7. continuar TypeScript em módulos de baixo acoplamento.
