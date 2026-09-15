# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `471c689c1df47118bd3a345214acfd140bdc6e7d` — PR #145  
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
- PR #133: persistência retrocompatível de `marketId|pid` no Mercado;
- PR #134: expiração segura da identidade temporária se um clique live não chegar ao commit;
- PR #136: `76-drawer-hierarchy1`, drawer móvel em hierarquia vertical legível;
- PR #138: `76-icon-semantics1`, Planeamento/Definições com geometrias Lucide coerentes;
- PR #140: `76-bills-mobile-filters1`, pesquisa/filtros móveis de Despesas reorganizados;
- PR #142: `76-bills-mobile-spacing1`, ritmo, espaçamento e limpeza visual do mesmo bloco de Despesas;
- PR #143: `76-planning-budget-card2`, resumo móvel de Planeamento reorganizado segundo o protótipo aprovado sem duplicar o fluxo funcional de orçamento;
- PR #145: `76-planning-ring-shape1`, normalização do anel de orçamento após validação física no iPhone revelar deformação oval.

## Evidência mais recente — PR #145

- head final do PR: `7b6760955b365076bc3fab08f96113adafa87505`;
- TypeScript Foundation PR `34948896081`: sucesso;
- CI PR `34948896074`: sucesso integral;
- CI push do head `34948870264`: sucesso integral;
- merge PR #145: `471c689c1df47118bd3a345214acfd140bdc6e7d`;
- Pages `34949105955`: sucesso, incluindo preparação do bundle, upload e deploy.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados pelos PR #142/#143/#145.

## Despesas — pesquisa, filtros e espaçamento móvel

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` estão integrados:

- `#billSearch`, `#newBillBtn`, `#billStatusFilter`, `#billCategoryFilter`, `#billDateFrom`, `#billDateTo`, `#billSort` e `#billClearFilters` continuam canónicos;
- `renderBills()` e `events.js` continuam a autoridade funcional;
- lupa histórica duplicada foi neutralizada, ficando o Lucide local como representação funcional;
- pesquisa, ação principal e cartão de filtros usam espaçamento móvel consistente;
- Estado/Categoria permanecem organizados, datas/ordenação/limpeza continuam funcionais;
- `<=360px` mantém fallback de uma coluna;
- foco, `forced-colors`, `prefers-reduced-motion` e targets tácteis permanecem cobertos;
- cálculos, persistência, PIN/cofre, QR, scanner e sync não foram alterados.

PR #142 foi publicado com TypeScript/CI/Pages verdes; Pages `34945033256` terminou com sucesso.

## Planeamento — orçamento móvel

`76-planning-budget-card2` + `76-planning-ring-shape1` estão publicados:

- o seletor de mês mantém `#monthPicker` como autoridade e continua a usar `stepMonth()`/evento `change` existente;
- o cartão apresenta mês e intervalo real, título Orçamento mensal, gasto do mês, orçamento, disponível e estado definido/por definir;
- os valores continuam derivados de `dashboardNumbers()`/`categoryTotals()` e da lógica financeira existente;
- orçamento ausente continua factual: `Por definir`, sem percentagem falsa;
- Definir/Editar orçamento não cria segundo formulário nem grava dados: todas as ações apenas deslocam/focam `#monthlyBudget`;
- a gravação continua exclusivamente no `#monthPlanForm` através do listener de `events.js`, `monthProfile()` e `commit('updated','planning')`;
- ícones vêm do subset Lucide local; navegação mensal deixa de depender de caracteres `‹/›`;
- em iPhones estreitos as três métricas deixam de ser comprimidas em colunas iguais e passam a linhas legíveis;
- a validação física revelou que uma altura histórica fixa (`118px!important`) em `v75-architecture.css` competia com a largura nova do anel, produzindo uma elipse;
- `76-planning-ring-shape1` neutraliza essa altura com `height:auto!important`, força `aspect-ratio:1/1!important` e usa 136 px no mobile geral, 128 px em `<=430px` e 116 px em `<=350px`;
- a iconografia e tipografia internas foram reduzidas proporcionalmente, sem alterar percentagem, estado ou cálculos;
- `forced-colors`, `prefers-reduced-motion` e targets tácteis são preservados;
- Service Worker recebeu apenas tokens técnicos de cache para distribuição das correções.

A forma circular corrigida precisa ainda de confirmação visual no mesmo iPhone/PWA após atualização do cache; CI/Pages já estão verdes.

## Iconografia funcional — estado atual

`76-icon-semantics1` permanece publicado:

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

- confirmar fisicamente `76-planning-ring-shape1` no mesmo iPhone/Safari e PWA instalada;
- validar `76-bills-mobile-spacing1`, drawer e iconografia no mesmo dispositivo;
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

1. confirmar visualmente `76-planning-ring-shape1` no iPhone/Safari web e PWA instalada;
2. validar `76-bills-mobile-spacing1` e drawer/iconografia no mesmo dispositivo;
3. corrigir a descrição da página Segurança para refletir a dependência ZXing real;
4. preparar ZXing local + licença e, só depois, remover `unpkg.com` de `script-src`;
5. criar primeiro fluxo E2E WebKit/Chromium;
6. consolidar CSS por propriedade/componente com prova de não utilização;
7. continuar TypeScript em módulos de baixo acoplamento.
