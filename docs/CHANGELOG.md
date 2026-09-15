# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-15 — PR #152 / `76-auth-prototype-final1` — protótipo final do PIN — publicado

### Problema confirmado no dispositivo

Depois do PR #150, a validação física mostrou que a correção de altura era tecnicamente estável, mas a composição ainda não correspondia ao resultado visual pretendido:

- o keypad permanecia demasiado estreito na horizontal;
- vários breakpoints históricos produziam uma sensação de layout corrigido por camadas, em vez de uma composição única;
- ações secundárias e transferência de cofre tinham pouca separação visual;
- a zona inferior continuava a parecer misturada com o chrome do Safari.

### Correção

- `v75-usability.css` passa a declarar `76-auth-prototype-final1` como autoridade visual única do cofre;
- as secções históricas `76-vault-short-height1` e `76-auth-ios-spacing2` são removidas como blocos CSS concorrentes;
- `100svh`, safe areas, scroll do cofre, input >=16 px e pinch-to-zoom continuam preservados;
- keypad mobile padrão usa teclas 56 px, `column-gap:30px` e `row-gap:16px`;
- `<=359px` usa 52 px e gaps 24/13 px;
- altura `<=720px` usa 50 px e gaps 22/9 px;
- teclas ganham superfície, borda e sombra subtis; apagar mantém tratamento leve;
- Entrar permanece CTA principal, palavra-passe/recuperação ficam secundárias;
- `Usar dados de outro dispositivo` passa a cartão próprio, separado do rodapé;
- dark mode, `forced-colors`, `prefers-reduced-motion` e targets >=44 px são preservados;
- `tests/accessibility.test.cjs` e `tests/v75-stability.test.cjs` foram alinhados com a nova autoridade final;
- Service Worker recebe apenas o token técnico `auth-prototype-final1` para invalidar a composição anterior.

### Evidência

- head final PR #152: `1124fc2284ab15dfc7b8e384792196a8256f89c6`;
- TypeScript Foundation PR `34977687455`: sucesso;
- CI PR `34977687437`: sucesso integral;
- merge: `ceaa4fc8a79cbb2ad442854ffaacd501dac7313f`;
- TypeScript Foundation `main` `34977780423`: sucesso;
- CI `main` `34977780342`: sucesso integral;
- Deploy Pages `34977846729`: sucesso.

### Preservado

Sem alteração de PIN, palavra-passe, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync, `STATE_VERSION`, dados financeiros, QR, scanner, Mercado, release `v76` ou versão `0.76.0`.

### Pendente

- confirmar no mesmo iPhone/Safari web e PWA instalada que o resultado publicado corresponde ao protótipo aprovado;
- validar portrait/landscape, barras do Safari abertas/recolhidas e teclado virtual.

---

## 2026-09-15 — PR #150 / `76-auth-ios-spacing2` — espaçamento do cofre no iPhone/Safari — publicado e substituído visualmente pelo PR #152

### Problema confirmado no dispositivo

A captura física do ecrã de PIN mostrou uma composição funcional mas verticalmente demasiado espaçada:

- a marca, título, input, teclado, ações e transferência consumiam mais altura do que o necessário;
- em alturas comuns de Safari/iPhone, o breakpoint `<=780px` não era ativado, portanto o keypad permanecia maior;
- `.vault-card` ainda herdava margem automática, podendo contribuir para recentragem vertical;
- a zona `Usar dados de outro dispositivo` aproximava-se da barra inferior do Safari e perdia conforto visual.

### Correção histórica

- introduziu `100svh`, safe areas e topo seguro no auth móvel;
- `.vault-card` passou a `margin:0 auto`;
- densidade foi reduzida por altura para 58/54/48 px;
- preservou targets >=44 px e auth funcional;
- token técnico `auth-ios-spacing2` invalidou o layout anterior.

### Evidência

- head final PR #150: `5713cb7514344298aeda578e061281667c6aca48`;
- TypeScript Foundation PR `34961244599`: sucesso;
- CI PR `34961244608`: sucesso integral;
- merge: `a140211813f2194926b2cbd5bde7c53a8798b140`;
- TypeScript Foundation `main` `34961349276`: sucesso;
- CI `main` `34961349248`: sucesso integral;
- Deploy Pages `34961403315`: sucesso.

A base de viewport/safe areas permanece válida; os tamanhos e a composição visual foram substituídos por `76-auth-prototype-final1` no PR #152.

---

## 2026-09-15 — PR #149 / `76-date-calculator1` — calculadora exata de datas — publicada

### Funcionalidade

- entrada em **Mais → Ferramentas → Calculadora de datas**;
- diferença civil entre duas datas;
- escolha explícita para incluir/excluir data inicial e final;
- total decorrido, total inclusivo, semanas e período civil anos/meses/dias;
- adicionar/subtrair dias corridos;
- adicionar/subtrair dias úteis;
- contagem de dias úteis;
- dia do ano, dia da semana e estado bissexto/comum;
- copiar, partilhar e imprimir/PDF.

### Exatidão e arquitetura

- fonte funcional TypeScript strict em `src/ui/date-calculator.ts`;
- runtime JavaScript é gerado no build;
- reutiliza primitivas de data civil de `core.js` em vez de dividir milissegundos por 24 horas;
- regressões multitimezone cobrem UTC, Europe/Lisbon, America/Los_Angeles e Pacific/Kiritimati;
- “dias úteis” significa segunda a sexta; feriados não são presumidos sem jurisdição configurada;
- sem rede, IndexedDB, `appState`, `commit()` ou `saveState()`;
- CSS próprio, responsivo e compatível com dark mode, forced-colors e reduced-motion.

### Evidência

- merge em `main`: `8e58777f601d164bd4589f7d0e0e8f96e02686f0`;
- TypeScript Foundation e CI do PR: sucesso;
- TypeScript Foundation e CI em `main`: sucesso;
- a publicação atual de Pages contém também os assets da calculadora.

### Pendente

- validação física do dialog e ações de partilha/impressão em iPhone/PWA e desktop.

---

## 2026-09-15 — PR #147 / `76-bills-mobile-alignment2` — alinhamento móvel de Despesas — integrado

### Problema

A validação física mostrou que a faixa horizontal herdada de filtros produzia pressão lateral e campos parcialmente cortados.

### Correção

- `mobile-layout.css` passa a ser a apresentação final do bloco Pesquisa + Filtros em mobile;
- filtros usam grelha contida em duas colunas;
- Estado/Categoria e De/Até formam pares;
- Ordenar e Limpar filtros ocupam linhas completas;
- `<=360px` empilha numa coluna;
- scroll horizontal deixa de ser requisito para descobrir filtros essenciais;
- `v76-mobile-shell.css` continua a autoridade do viewport/safe areas/dock;
- cálculos, IDs, listeners e persistência financeira permanecem intactos.

### Evidência

- merge em `main`: `480dc501ff10bf29413b934e623d8641d5e95229`.

### Pendente

- confirmação física final em 360/390/430 px equivalentes, Safari web/PWA e portrait/landscape.

---

## 2026-09-15 — PR #145 / `76-planning-ring-shape1` — normalização do anel de orçamento — publicado

- validação física revelou anel oval por conflito entre `width` nova e `height:118px!important` histórica;
- camada canónica usa `height:auto!important` + `aspect-ratio:1/1!important`;
- diâmetros móveis 136/128/116 px;
- cálculo, orçamento, `dashboardNumbers()`, `monthProfile()`, IndexedDB e auth preservados;
- merge `471c689c1df47118bd3a345214acfd140bdc6e7d`;
- Pages `34949105955`: sucesso;
- falta confirmação física do formato final no mesmo iPhone/PWA.

---

## 2026-09-15 — PR #143 / `76-planning-budget-card2` — orçamento móvel de Planeamento — publicado

- seletor mensal passou a usar Lucide local e intervalo real do mês;
- cartão único de orçamento apresenta gasto, orçamento, disponível, orientação e CTA;
- orçamento ausente continua `Por definir`;
- Definir/Editar apenas foca `#monthlyBudget`; `#monthPlanForm` + `events.js` continuam a única gravação;
- métricas deixam de ser comprimidas em três colunas em iPhones estreitos;
- merge `386d75b35060eb011c2a2d68ec6b965c87c5080c`;
- Pages `34946542013`: sucesso.

---

## 2026-09-15 — PR #142 / `76-bills-mobile-spacing1` — espaçamento de Despesas — publicado

- refinado espaço entre pesquisa e filtros;
- aumentado respiro interno do cartão;
- removidos offsets visuais desnecessários;
- IDs, handlers, cálculos e arquitetura de viewport preservados;
- merge `cd45ec537989c51f125747958e198c8e0431a352`;
- Pages `34945033256`: sucesso.

---

## 2026-09-15 — PR #140 / `76-bills-mobile-filters1` — pesquisa e filtros móveis — integrado

- pesquisa + Nova fatura passam a composição compacta;
- lupa CSS duplicada é neutralizada em favor do Lucide local;
- filtros ganham hierarquia móvel e fallback de uma coluna;
- `mobile-layout.css` permanece CSS de feature e não assume o viewport global;
- merge `387a953e427331a5aa48d872cd7c54e1552d2c1c`.

---

## 2026-09-15 — PR #138 / `76-icon-semantics1` — iconografia funcional — publicado

- Planeamento usa `CalendarCheck2`;
- Definições usa `Settings`/engrenagem;
- snapshot Lucide permanece `94e4cb9d9db5907053ebf3636a97c45529cf776b` com licença local;
- merge `d2348c940ccdee2812805c82a6f2e62cccf24863`.

---

## 2026-09-15 — PR #136 / `76-drawer-hierarchy1` — drawer móvel — publicado

- drawer à direita em uma coluna;
- grupos Principal, Análise e Sistema;
- rotas secundárias permanecem nas páginas-pai;
- targets, foco, reduced-motion, forced-colors e safe areas preservados;
- merge `6cc4707197a50c022179d0af66895079ef1583bc`.

---

## 2026-09-15 — PR #134 / `76-market-identity-stale1`

- identidade `marketId|pid` temporária expira quando não é consumida;
- fluxo live normal preserva identidade antes do primeiro `await`;
- merge `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`.

## 2026-09-15 — PR #133 / `76-market-identity1`

- resultados live preservam `marketId|pid` ao entrar na lista;
- normalização/reload/restauro/sync retêm identidade;
- preços, quantidades e contabilidade não mudam;
- merge `62359b4997075c4bd476f43f69ab18e41327f1bd`.

---

## 2026-09-14 — release v76 e estabilização estrutural

- runtime v74/Featured retirado;
- navegação/composição móvel consolidada;
- release oficializada como v76/`0.76.0`;
- PR #131 profissionalizou Adicionar despesa;
- PR #132 corrigiu hit-testing/touch no Safari/iPhone.

## 2026-09-13 — auth/UI e início TypeScript

- PIN local passou a abrir sem depender de sync remoto;
- Safari/WebKit passou a respeitar `[hidden]` entre cofre e shell;
- marca `icon.svg` e Lucide consolidados;
- Sync conflict policy migrou para TypeScript.

---

## Decisões de continuidade

- regressão real em dispositivo tem prioridade sobre teste legado;
- `icon.svg` é marca; Lucide é iconografia funcional;
- protótipos definem hierarquia, não autorizam domínio inventado;
- auth móvel tem uma única autoridade visual, usa viewport útil/safe areas e mantém targets >=44 px;
- filtros de Despesas não dependem de faixa horizontal;
- resumo de Planeamento delega no formulário/orçamento canónico;
- calculadora usa aritmética civil e regras explícitas;
- `marketId|pid` acompanha SKU verificável;
- correção técnica não exige mudança de release;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de CDN para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.
