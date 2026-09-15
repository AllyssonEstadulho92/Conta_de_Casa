# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `8e58777f601d164bd4589f7d0e0e8f96e02686f0` — PR #149  
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

## Estado publicado em `main`

A `main` continua em v76/`0.76.0`. As alterações abaixo são incrementais e não mudam a release pública.

Consolidações relevantes mais recentes:

- PR #131: fluxo profissional de Adicionar despesa;
- PR #132: hotfix Safari/iPhone para touch/scroll do formulário de despesas;
- PR #133/#134: identidade `marketId|pid` do Mercado e expiração segura do estado transitório;
- PR #136: `76-drawer-hierarchy1`;
- PR #138: `76-icon-semantics1`;
- PR #140: `76-bills-mobile-filters1`;
- PR #142: `76-bills-mobile-spacing1`;
- PR #143: `76-planning-budget-card2`;
- PR #145: `76-planning-ring-shape1`;
- PR #147: `76-bills-mobile-alignment2`, grelha móvel de filtros de Despesas sem faixa horizontal;
- PR #149: `76-date-calculator1`, calculadora local de datas em TypeScript strict.

## Evidência mais recente — PR #149

- head final do PR: `fd6a628f1d88ca605d6765cca16f2b70881145ca`;
- TypeScript Foundation PR `34954233639`: sucesso;
- CI PR `34954233763`: sucesso integral, incluindo o novo teste `Exact date calculator tests`;
- merge PR #149: `8e58777f601d164bd4589f7d0e0e8f96e02686f0`;
- TypeScript Foundation `main` `34954321242`: sucesso;
- CI `main` `34954321191`: sucesso integral;
- a primeira execução de Pages observada para este head (`34954431084`) terminou `skipped`; por isso a publicação física da nova ferramenta deve ser confirmada numa execução de Pages bem-sucedida antes de considerar o rollout encerrado.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados pelo PR #149.

## Calculadora de datas — `76-date-calculator1`

A nova ferramenta está integrada como utilitário em **Mais → Ferramentas → Calculadora de datas**. Não foi criada uma nova rota principal.

### Modos

- **Diferença:** calcula a diferença matemática entre duas datas civis, total contando ambas as datas, contagem selecionada conforme inclusão/exclusão das extremidades, semanas completas + dias restantes e decomposição civil em anos/meses/dias;
- **Adicionar dias:** adiciona ou subtrai dias corridos ou dias úteis;
- **Dias úteis:** conta segunda a sexta-feira entre duas datas, respeitando as opções de inclusão das extremidades.

### Exatidão e regras

- reutiliza `parseCivilDateKey()`, `cleanDateKey()`, `civilDayNumber()`, `civilDayDiff()`, `addCivilDays()` e `addCivilMonthsClamped()` já existentes em `core.js`;
- a aritmética é feita sobre datas civis, não milissegundos de hora local;
- fuso horário e horário de verão não alteram o total;
- intervalo suportado: `1900-01-01` a `9999-12-31`;
- “dias úteis” significa explicitamente segunda a sexta-feira;
- feriados nacionais, regionais ou municipais **não** são presumidos nem descontados sem uma jurisdição configurada;
- a interface mostra regras de inclusão para evitar um único número ambíguo.

### Arquitetura

- fonte funcional: `src/ui/date-calculator.ts`;
- runtime público: `.generated/date-calculator.js` → `dist/date-calculator.js`, gerado pelo pipeline TypeScript;
- apresentação: `date-calculator.css`;
- não existe `date-calculator.js` manual no repositório;
- `scripts/build-typescript-runtime.cjs` e `scripts/prepare-pages.cjs` tratam a ferramenta como runtime TypeScript gerado;
- `sw.js` inclui CSS/JS na allowlist offline e usa token técnico `date-calculator1`.

### Segurança/privacidade

- nenhuma data é enviada para a Internet;
- a ferramenta não usa `fetch`, XHR, `localStorage`, IndexedDB, `appState`, `commit()` ou `saveState()`;
- valores apresentados dinamicamente são escapados antes de entrar em HTML;
- o diálogo fecha quando `#app` é ocultado/bloqueado, evitando manter top-layer sobre o cofre;
- copiar, partilhar e imprimir/PDF atuam apenas sobre o texto do resultado e não persistem dados.

### QA específico

Os resultados foram testados de forma determinística em `UTC`, `Europe/Lisbon`, `America/Los_Angeles` e `Pacific/Kiritimati` com paridade obrigatória. Casos cobertos incluem:

- `03/09/2026 → 15/09/2026`: 12 dias decorridos e 13 contando ambas as datas;
- datas invertidas;
- mesma data;
- inclusão explícita das duas extremidades;
- fim de mês e ano bissexto;
- sexta-feira + 1 dia útil → segunda-feira;
- segunda-feira − 1 dia útil → sexta-feira;
- intervalo só de fim de semana;
- data inválida.

## Despesas — pesquisa, filtros e alinhamento móvel

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` + `76-bills-mobile-alignment2` estão integrados:

- `#billSearch`, `#newBillBtn`, `#billStatusFilter`, `#billCategoryFilter`, `#billDateFrom`, `#billDateTo`, `#billSort` e `#billClearFilters` continuam canónicos;
- `renderBills()` e `events.js` continuam a autoridade funcional;
- a antiga faixa horizontal deixou de ser a apresentação final no mobile;
- Estado/Categoria formam o primeiro par, De/Até o segundo, Ordenar ocupa uma linha completa e Limpar filtros permanece ação terciária;
- o cartão usa contenção de largura e não depende de scroll horizontal para revelar controlos;
- `<=360px` usa uma coluna;
- cálculos, persistência, PIN/cofre, QR, scanner, Mercado e sync não foram alterados.

Evidência do PR #147: merge `480dc501ff10bf29413b934e623d8641d5e95229`; TypeScript Foundation/CI em PR e `main` verdes; Pages `34951589187` com sucesso.

## Planeamento — orçamento móvel

`76-planning-budget-card2` + `76-planning-ring-shape1` permanecem publicados:

- `#monthPicker` continua a autoridade do mês;
- gasto, orçamento e disponível continuam derivados da lógica financeira existente;
- orçamento ausente permanece `Por definir`;
- Definir/Editar orçamento apenas desloca/foca `#monthlyBudget`;
- `#monthPlanForm` + `events.js` continuam a única gravação;
- o anel usa `height:auto!important` + `aspect-ratio:1/1!important`, com 136/128/116 px conforme breakpoint;
- a forma circular ainda precisa de confirmação física no mesmo iPhone/PWA.

## Segurança — problema ainda aberto

- ZXing do scanner continua dependente de `unpkg.com`;
- a página Segurança não pode afirmar literalmente “Sem CDNs” enquanto essa dependência existir;
- o próximo bloco de segurança continua: corrigir primeiro a descrição factual, depois empacotar ZXing localmente com licença, depois remover `unpkg.com` de `script-src` e endurecer CSP;
- `style-src 'unsafe-inline'` permanece dívida posterior.

## Auditoria atual — problemas abertos

### ALTO

- confirmar a calculadora em desktop, iPhone/Safari web e PWA instalada, incluindo foco, teclado, scroll, partilha e impressão/PDF;
- confirmar `76-bills-mobile-alignment2` e `76-planning-ring-shape1` no mesmo dispositivo;
- criar E2E WebKit/Chromium para fluxos móveis críticos;
- reduzir gradualmente cascade CSS/`!important` por componente;
- `main` continua sem required checks obrigatórios por branch protection.

### MÉDIO

- corrigir texto factual de Segurança;
- migrar ZXing para bundle local antes de CSP `'self'`;
- continuar TypeScript por risco, sem começar por `finance.js`/cifra.

## Higiene de repositório

- PR #45/v65 permanece encerrado como obsoleto;
- PR #148 contém documentação do PR #147, mas ficou ultrapassado pela evolução de `main`; a documentação combinada #147 + #149 deve substituí-lo.

## Próximo passo

1. confirmar um deploy Pages bem-sucedido contendo `76-date-calculator1`;
2. validar fisicamente Calculadora de datas, Despesas e Planeamento no iPhone/Safari web e PWA;
3. corrigir a descrição factual da página Segurança;
4. preparar ZXing local + licença e, só depois, remover `unpkg.com` de `script-src`;
5. criar o primeiro fluxo E2E WebKit/Chromium;
6. continuar consolidação CSS e TypeScript em módulos de baixo acoplamento.
