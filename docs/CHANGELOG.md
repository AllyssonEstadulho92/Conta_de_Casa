# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-15 — PR #145 / `76-planning-ring-shape1` — normalização do anel de orçamento — publicado

### Problema confirmado no iPhone

Após a publicação do novo cartão de orçamento do PR #143, a validação física mostrou que o estado `Por definir` aparecia visualmente esticado na horizontal.

A causa foi localizada na cascade real:

- `v75-architecture.css` ainda impunha `width:118px!important;height:118px!important` em `.cdc-budget-ring`;
- `76-planning-budget-card2` aumentava a largura para 150/142 px e adicionava `aspect-ratio`, mas não neutralizava a altura histórica;
- com largura e altura explícitas em camadas diferentes, o browser mantinha uma elipse em vez de um círculo.

### Correção

- `v76-planning-more.css` declara `76-planning-ring-shape1`;
- `.cdc-budget-ring` passa a usar `height:auto!important` + `aspect-ratio:1/1!important` na camada canónica;
- diâmetro reduzido para 136 px no mobile geral, 128 px em `<=430px` e 116 px em `<=350px`;
- iconografia, padding e tipografia internos foram reduzidos proporcionalmente;
- estado `Por definir`, percentagem real, conic-gradient e acessibilidade foram preservados;
- regressões verificam a proporção 1:1 e impedem o retorno da altura fixa conflitante;
- Service Worker recebe apenas o token técnico `planning-ring-shape1`.

### Evidência

- PR #145 head `7b6760955b365076bc3fab08f96113adafa87505`;
- TypeScript Foundation PR `34948896081`: sucesso;
- CI PR `34948896074`: sucesso integral;
- CI push head `34948870264`: sucesso integral;
- merge PR #145: `471c689c1df47118bd3a345214acfd140bdc6e7d`;
- Pages `34949105955`: sucesso.

### Preservado

Sem alteração de `STATE_VERSION`, cálculos financeiros, percentagem de orçamento, `dashboardNumbers()`, `monthProfile()`, `#monthPlanForm`, IndexedDB, PIN/cofre, QR, scanner, Mercado, sync, release `v76` ou versão `0.76.0`.

### Pendente

- confirmar no mesmo iPhone/Safari/PWA que o anel atualizado está efetivamente circular após refresh do cache;
- validar também o estado com orçamento definido.

---

## 2026-09-15 — PR #143 / `76-planning-budget-card2` — orçamento móvel de Planeamento — publicado

### Problema confirmado

O resumo móvel de Planeamento estava funcional, mas ainda não tinha a hierarquia do protótipo aprovado:

- seletor mensal usava caracteres `‹/›` em vez da iconografia funcional local;
- orçamento, gasto e disponível tinham pouca hierarquia visual;
- em `<=430px`, as três métricas eram comprimidas em colunas iguais;
- não existia uma ação clara no resumo para chegar ao campo real de orçamento;
- qualquer melhoria tinha de evitar um segundo fluxo de gravação ou cálculo.

### Correção

- `v75-architecture.js` declara `76-planning-budget-card2`;
- o seletor mensal usa chevrons do sistema Lucide local e mostra o intervalo real do mês selecionado;
- o resumo passa a uma superfície única com título `Orçamento mensal`, estado circular, Gasto este mês, Orçamento e Disponível;
- orçamento ausente continua factual como `Por definir`, sem 0% artificial;
- orientação contextual e CTA `Definir/Editar orçamento` foram adicionados;
- todas as ações visuais usam `data-v75-budget-focus` e apenas deslocam/focam `#monthlyBudget`;
- `#monthPlanForm` + `events.js` continuam a única autoridade de validação/gravação;
- `v76-planning-more.css` mantém métricas numa coluna em iPhones estreitos e adapta cabeçalho/targets;
- `prefers-reduced-motion` e `forced-colors` continuam explícitos;
- Service Worker recebe apenas o token técnico `planning-budget-card2`.

### Evidência

- PR #143 head `b7a315e154f88cad09d73b9caed6744b0a48bb52`;
- TypeScript Foundation PR `34946433827`: sucesso;
- CI PR `34946433799`: sucesso integral;
- merge: `386d75b35060eb011c2a2d68ec6b965c87c5080c`;
- TypeScript Foundation main `34946493929`: sucesso;
- CI main `34946493911`: sucesso integral;
- Pages `34946542013`: sucesso.

### Preservado

Sem alteração de `STATE_VERSION`, fórmulas, `dashboardNumbers()`, `categoryTotals()`, `monthProfile()`, listener canónico de `#monthPlanForm`, IndexedDB, cifra/PIN, QR, scanner, Mercado, sync, `package.json`, `release-manifest.json`, `app-update.js`, release `v76` ou versão `0.76.0`.

### Pendente

- validar estado por definir e orçamento definido no mesmo iPhone/Safari web e PWA instalada;
- validar proporções em 320/360/375/390/430 px e comportamento do teclado ao focar `#monthlyBudget`.

---

## 2026-09-15 — PR #142 / `76-bills-mobile-spacing1` — espaçamento de Despesas — publicado

### Correção

- refinado o espaço entre pesquisa e filtros;
- aumentado o respiro interno do cartão de filtros;
- ritmo vertical explícito entre título, subtítulo, campos e Limpar filtros;
- removido offset negativo do subtítulo;
- reduzida duplicação de CSS para labels de período;
- preservados IDs, handlers, cálculos e arquitetura de viewport.

### Evidência

- merge PR #142: `cd45ec537989c51f125747958e198c8e0431a352`;
- TypeScript Foundation/CI em `main`: sucesso;
- Pages `34945033256`: sucesso.

### Preservado

Sem alteração de `renderBills()`, domínio financeiro, IndexedDB, PIN/cofre, QR, scanner, Mercado, sync ou release pública.

---

## 2026-09-15 — PR #140 / `76-bills-mobile-filters1` — pesquisa e filtros móveis de Despesas — integrado

### Problema confirmado

A página Despesas mantinha os controlos funcionais corretos, mas a apresentação móvel estava desalinhada com o protótipo aprovado:

- a pesquisa podia mostrar duas lupas sobrepostas porque `v75-expenses-modern.css` desenhava uma lupa por pseudo-elementos ao mesmo tempo que `ui-icons.js` injetava a lupa Lucide local;
- a faixa horizontal de filtros criava labels cortados e leitura pouco previsível no iPhone;
- pesquisa, ação principal e filtros tinham dimensões/ritmo visual inconsistentes;
- a solução tinha de preservar os IDs e listeners canónicos para não arriscar regressão funcional.

### Correção

- `mobile-layout.css` passa a declarar `76-bills-mobile-filters1` apenas como refinamento de feature móvel;
- `.bill-command-bar` organiza pesquisa + Nova fatura numa composição compacta;
- a lupa CSS histórica é neutralizada e a lupa Lucide local passa a ser a única representação visível da pesquisa;
- `#newBillBtn` mantém o mesmo controlo/handler e passa a uma superfície móvel quadrada com ícone e label acessível preservada;
- o bloco de filtros passa a cartão com hierarquia clara “Filtros” + texto auxiliar;
- Estado/Categoria ficam lado a lado em telefones com largura suficiente;
- De/Até continuam a ser inputs `date` reais; Ordenar e Limpar filtros permanecem funcionais;
- `<=360px` empilha a composição para evitar clipping;
- targets essenciais >=44 px, foco, reduced-motion e forced-colors foram preservados;
- `mobile-layout.css` não assume viewport/scroll global, mantendo `v76-mobile-shell.css` como autoridade geométrica.

### Regressão encontrada e resolvida durante o PR

O primeiro ciclo de CI bloqueou a alteração porque o CSS de feature continha `overflow:hidden`, violando o contrato que impede `mobile-layout.css` de recriar um viewport recortado. A regra foi removida antes do merge e o gate voltou a verde.

### Evidência

- PR #140 head final `f7744d48e1b9ce28942e9765b199dc8f209ab4df`;
- TypeScript Foundation PR `34942844618`: sucesso;
- CI PR `34942844692`: sucesso integral;
- CI push `34942841985`: sucesso integral;
- merge PR #140: `387a953e427331a5aa48d872cd7c54e1552d2c1c`.

### Preservado

Sem alteração de `renderBills()`, listeners, IDs canónicos, cálculos, `STATE_VERSION`, release `v76`, versão `0.76.0`, PIN/cofre, IndexedDB, Mercado, QR, scanner ou sync.

---

## 2026-09-15 — PR #138 / `76-icon-semantics1` — iconografia funcional semântica — publicado

### Problema confirmado

- `plan` reutilizava a geometria de `wallet`;
- `settings` usava sliders, aproximando Definições de filtros/ajustes rápidos.

### Correção

- Planeamento mantém `plan`, mas usa `CalendarCheck2` do snapshot Lucide fixado;
- Definições mantém `settings`, mas usa `Settings`/engrenagem;
- snapshot permanece `94e4cb9d9db5907053ebf3636a97c45529cf776b`;
- `LUCIDE_LICENSE.txt` permanece distribuída;
- regressões impedem retorno às geometrias anteriores.

### Evidência

- merge PR #138: `d2348c940ccdee2812805c82a6f2e62cccf24863`;
- TypeScript Foundation main `34938763131`, CI main `34938763232` e Pages `34938807431`: sucesso.

---

## 2026-09-15 — PR #136 / `76-drawer-hierarchy1` — drawer móvel harmonizado — publicado

### Correção

- drawer mantém abertura à direita;
- navegação passa para uma coluna;
- grupos: Principal, Análise e Sistema;
- destinos de primeiro nível: Início, Despesas, Planeamento, Mercado, Relatórios, Segurança e sincronização, Definições;
- Calendário, Metas e Diagnóstico permanecem nas páginas-pai;
- botão fechar 44 px e ações Ocultar valores/Bloquear empilhadas;
- foco, reduced-motion, forced-colors e safe areas preservados.

### Evidência

- merge PR #136: `6cc4707197a50c022179d0af66895079ef1583bc`;
- TypeScript Foundation main `34933261324`, CI main `34933261352` e Pages `34933296570`: sucesso.

---

## 2026-09-15 — PR #134 / `76-market-identity-stale1` — hardening da identidade temporária — publicado

- identidade `marketId|pid` pendente expira no microtask seguinte quando não consumida;
- fluxo live normal preserva identidade antes do primeiro `await`;
- cache técnico atualizado sem mudar release;
- merge `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`; TypeScript/CI/Pages verdes.

---

## 2026-09-15 — PR #133 / `76-market-identity1` — identidade canónica do Mercado — publicado

- resultados Cesta transportam `marketId|pid` até ao item persistido;
- normalização/reload/restauro/sync preservam identidade;
- itens manuais/legados continuam válidos;
- `STATE_VERSION`, preços, quantidade e contabilidade permanecem inalterados;
- merge `62359b4997075c4bd476f43f69ab18e41327f1bd`; TypeScript/CI/Pages verdes.

---

## 2026-09-14 — release v76 e estabilização estrutural

- runtime v74/Featured retirado do bundle/repositório;
- navegação/composição móvel consolidada;
- release oficializada como v76/`0.76.0`;
- Dashboard, Despesas, Mercado, Planeamento, Metas e Mais alinhados ao sistema v76;
- PR #131 profissionalizou Adicionar despesa;
- PR #132 corrigiu hit-testing/touch no Safari/iPhone.

---

## 2026-09-13 — estabilização auth/UI e início TypeScript

- PIN local passou a abrir sem depender do sync remoto;
- Safari/WebKit passou a respeitar `[hidden]` entre cofre e shell;
- header/dock/drawer auditados;
- marca `icon.svg` e Lucide consolidados;
- integridade rota ↔ secção ↔ renderer passou a gate;
- Sync conflict policy migrou para TypeScript.

---

## Decisões de continuidade

- regressão real em dispositivo tem prioridade sobre teste legado;
- `icon.svg` é marca; Lucide é iconografia funcional;
- protótipos definem hierarquia, não autorizam domínio inventado;
- resumo visual de Planeamento delega no `#monthPlanForm/#monthlyBudget` canónico;
- componentes circulares devem neutralizar dimensões legadas incompatíveis antes de depender de `aspect-ratio`;
- filtros de Despesas mantêm `renderBills()`/IDs/listeners como autoridade;
- CSS de feature não assume viewport global;
- rotas secundárias permanecem nas páginas-pai;
- `marketId|pid` acompanha SKU verificável;
- correção técnica não exige mudar release;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de CDN para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.
