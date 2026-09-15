# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-15 — PR #147 / `76-bills-mobile-alignment2` — alinhamento e espaçamento móvel de Despesas — publicado

### Problema confirmado no iPhone

A validação física mostrou que o bloco de filtros ainda não estava visualmente estável apesar dos PR #140/#142:

- Estado e Categoria ficavam pressionados na horizontal;
- o campo seguinte (`De`) surgia parcialmente cortado/invadindo a área visível;
- a regra histórica de `v75-expenses-modern.css` ainda tratava os filtros como uma faixa horizontal com larguras fixas e scroll;
- o espaçamento entre pesquisa, cartão, labels e controlos não produzia uma composição única e previsível.

### Correção

- `mobile-layout.css` declara `76-bills-mobile-alignment2` como apresentação móvel final do bloco Pesquisa + Filtros;
- a faixa horizontal deixa de ser o comportamento final em `<=820px`;
- filtros passam a grelha contida em `repeat(2,minmax(0,1fr))`;
- Estado/Categoria formam o primeiro par e De/Até o segundo;
- Ordenar usa uma linha completa;
- Limpar filtros continua ação terciária numa linha própria;
- espaçamento entre superfícies passa a 20 px e o cartão recebe padding consistente;
- controlos usam 50 px de altura no mobile e targets essenciais continuam >=44 px;
- `min-width:0`/`max-width:100%` impedem pressão e clipping;
- `<=360px` usa uma coluna antes de cortar conteúdo;
- lupa Lucide local continua a única lupa funcional;
- `prefers-reduced-motion` e `forced-colors` permanecem explícitos;
- Service Worker recebe apenas o token técnico `expenses-mobile-alignment2` para invalidar a PWA instalada.

### Regressão detetada durante o PR

O primeiro ciclo de CI bloqueou a alteração porque `mobile-layout.css` continha `overflow:hidden` genérico. O contrato `ui-architecture-contract` proíbe CSS de feature de assumir recorte/viewport global. A implementação foi corrigida para usar contenção por largura e apenas `overflow-x:hidden` no cartão específico de filtros; o gate voltou a verde.

### Evidência

- head final do PR: `c2435e8580982c8c8367b0e7458ead2009201a5d`;
- TypeScript Foundation PR `34951435419`: sucesso;
- CI PR `34951435285`: sucesso integral;
- merge PR #147: `480dc501ff10bf29413b934e623d8641d5e95229`;
- TypeScript Foundation `main` `34951525321`: sucesso;
- CI `main` `34951525416`: sucesso integral;
- Pages `34951589187`: sucesso.

### Preservado

Sem alteração de `renderBills()`, listeners, IDs canónicos, cálculos, cêntimos, `STATE_VERSION`, IndexedDB, PIN/cofre, QR, scanner, Mercado, sync, `package.json`, `release-manifest.json`, release `v76` ou versão `0.76.0`.

### Pendente

- confirmar no mesmo iPhone/Safari/PWA que a grelha atualizada elimina o corte lateral após refresh do cache;
- validar também 360/390/430 px equivalentes e portrait/landscape.

---

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

---

## 2026-09-15 — PR #143 / `76-planning-budget-card2` — orçamento móvel de Planeamento — publicado

- seletor mensal passou a usar ícones Lucide locais e intervalo real do mês;
- cartão único de Orçamento mensal passou a apresentar gasto, orçamento, disponível, orientação e CTA;
- orçamento ausente permanece `Por definir`, sem 0% artificial;
- ações Definir/Editar apenas focam `#monthlyBudget`; `#monthPlanForm` + `events.js` continuam a única gravação;
- métricas deixam de ser comprimidas em três colunas em iPhones estreitos;
- TypeScript/CI/Pages verdes; merge `386d75b35060eb011c2a2d68ec6b965c87c5080c`.

---

## 2026-09-15 — PR #142 / `76-bills-mobile-spacing1` — espaçamento de Despesas — publicado

- refinado o espaço entre pesquisa e filtros;
- aumentado o respiro interno do cartão de filtros;
- ritmo vertical explícito entre título, subtítulo, campos e Limpar filtros;
- removido offset negativo do subtítulo;
- preservados IDs, handlers, cálculos e arquitetura de viewport;
- merge `cd45ec537989c51f125747958e198c8e0431a352`; Pages `34945033256` com sucesso.

---

## 2026-09-15 — PR #140 / `76-bills-mobile-filters1` — pesquisa e filtros móveis de Despesas — publicado

- pesquisa + Nova fatura passaram a composição compacta;
- lupa CSS histórica foi neutralizada em favor da lupa Lucide local;
- filtros ganharam hierarquia móvel e fallback de uma coluna em `<=360px`;
- IDs/listeners/domínio financeiro permaneceram canónicos;
- merge `387a953e427331a5aa48d872cd7c54e1552d2c1c`.

---

## 2026-09-15 — PR #138 / `76-icon-semantics1` — iconografia funcional semântica — publicado

- Planeamento mantém `plan`, mas usa `CalendarCheck2` do snapshot Lucide fixado;
- Definições mantém `settings`, mas usa `Settings`/engrenagem;
- snapshot permanece `94e4cb9d9db5907053ebf3636a97c45529cf776b` e `LUCIDE_LICENSE.txt` permanece distribuída;
- merge `d2348c940ccdee2812805c82a6f2e62cccf24863`.

---

## 2026-09-15 — PR #136 / `76-drawer-hierarchy1` — drawer móvel harmonizado — publicado

- drawer mantém abertura à direita e passa a uma coluna;
- grupos: Principal, Análise e Sistema;
- destinos de primeiro nível simplificados;
- targets, foco, reduced-motion, forced-colors e safe areas preservados;
- merge `6cc4707197a50c022179d0af66895079ef1583bc`.

---

## 2026-09-15 — PR #134 / `76-market-identity-stale1` — hardening da identidade temporária — publicado

- identidade `marketId|pid` pendente expira no microtask seguinte quando não consumida;
- fluxo live normal preserva identidade antes do primeiro `await`;
- merge `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`; TypeScript/CI/Pages verdes.

---

## 2026-09-15 — PR #133 / `76-market-identity1` — identidade canónica do Mercado — publicado

- resultados Cesta transportam `marketId|pid` até ao item persistido;
- normalização/reload/restauro/sync preservam identidade;
- itens manuais/legados continuam válidos;
- `STATE_VERSION`, preços, quantidade e contabilidade permanecem inalterados;
- merge `62359b4997075c4bd476f43f69ab18e41327f1bd`.

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
- filtros móveis de Despesas não dependem de faixa horizontal para revelar controlos essenciais;
- CSS de feature não assume viewport global; `v76-mobile-shell.css` continua a autoridade geométrica;
- resumo visual de Planeamento delega no `#monthPlanForm/#monthlyBudget` canónico;
- componentes circulares neutralizam dimensões legadas incompatíveis antes de depender de `aspect-ratio`;
- `marketId|pid` acompanha SKU verificável;
- correção técnica não exige mudar release;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de CDN para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.
