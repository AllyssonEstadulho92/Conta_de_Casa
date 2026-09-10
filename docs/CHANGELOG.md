# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-10 — v75 `75-expenses1` — layout moderno de Despesas

### Objetivo

Modernizar a página de Despesas/Faturas sem alterar cálculos, filtros, dados, pagamentos, segurança ou sincronização.

### Diagnóstico

- a página canónica já possuía Lista/Calendário, pesquisa, filtros completos, resumo, tabela desktop e cartões mobile;
- `renderBills()`/`filterBills()` já forneciam o comportamento funcional vigente;
- a necessidade identificada era visual: hierarquia, densidade, alinhamento, legibilidade e adaptação entre desktop/mobile;
- reescrever lógica financeira para atingir o redesign aumentaria risco sem benefício funcional.

### Alterações

Criado `v75-expenses-modern.css`, revisão `75-expenses1`, integralmente limitado a `html.cdc-v75 #page-bills`:

- Lista/Calendário com controlo segmentado mais limpo;
- pesquisa e `Nova fatura` numa barra operacional moderna;
- pesquisa com indicador visual CSS, sem dependência externa;
- filtros agrupados num painel responsivo;
- cartões de resumo com hierarquia e alinhamento de valores reforçados;
- tabela desktop com contentor elevado, cabeçalho fixo, espaçamento e hover;
- cartões mobile com `Em falta` em destaque;
- vencimento, estado, Total, Pago, Categoria e progresso mantidos visíveis;
- ações Abrir/Detalhes, Editar, Pagar e Excluir preservadas;
- breakpoints para desktop intermédio, `≤820px` e `≤430px`;
- tratamento de `prefers-reduced-motion` e `forced-colors`.

### Isolamento

Não foram alterados `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` ou `index.html` fonte. Não existem mudanças em IndexedDB, PIN, PBKDF2, AES-GCM, regras de faturas/pagamentos, Mercado, QR, scanner ou sync.

### Distribuição e QA

- `scripts/prepare-pages.cjs` publica `v75-expenses-modern.css?v=75-expenses1`;
- ordem exigida: `v75-pages.css` → `v75-expenses-modern.css` → `v75-usability.css`;
- `sw.js` inclui o novo asset e invalida o cache com `expenses1`;
- criado `tests/v75-expenses-modern.test.cjs`;
- CI e Pages executam o novo teste;
- PR #73 aberto;
- CI do PR no head `4013d05af84c4af2367c823a597ee42f41b8cb5a`: run `34495879773` — sucesso;
- TypeScript Foundation no mesmo head: run `34495879840` — sucesso;
- a branch estava `behind 0` relativamente a `main` antes das atualizações documentais de preservação;
- validação física permanece pendente em Safari/PWA, mobile, tablet, desktop e tema escuro.

---

## 2026-09-10 — v76 Bloco 1 — fundação TypeScript

### Objetivo

Iniciar a migração integral da fonte funcional para TypeScript sem alterar ainda o runtime publicado, cálculos, armazenamento, segurança, Mercado, UI ou PWA.

### Alterações

- criado `docs/TYPESCRIPT_MIGRATION.md` com estratégia por blocos, critérios de aceitação e regra de precisão do Mercado;
- criado `package.json` apenas para ferramentas de desenvolvimento;
- TypeScript fixado como `devDependency`, sem dependências runtime;
- criado `tsconfig.json` com `strict`, `noEmit`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `isolatedModules` e outras verificações estritas;
- `.gitignore` passa a ignorar `node_modules` e `*.tsbuildinfo`;
- criado `src/types/primitives.ts` com tipos nominais para cêntimos, IDs, datas/horas e códigos de produto;
- criado `src/types/persisted-state.ts` com o contrato do estado normalizado `STATE_VERSION = 5` observado em `core.js`;
- criado `src/types/market.ts` com contratos do browser live, identidade de catálogo e separação entre preço estimado e confirmado;
- criado `src/types/index.ts` para exportação dos contratos;
- criado `src/type-tests/contracts.ts` com exemplos válidos e regressões protegidas por `@ts-expect-error`;
- criado workflow `.github/workflows/typescript.yml` para `npm run typecheck` em Node 24.

### Isolamento de runtime

Neste bloco não foram alterados:

- `index.html`;
- `scripts/prepare-pages.cjs`;
- `sw.js`;
- `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`;
- IndexedDB, schema persistido, PBKDF2, AES-GCM, PIN, backup, sync, QR ou scanner;
- CSS, navegação ou experiência visual.

Os ficheiros `.ts` do Bloco 1 não são publicados no bundle Pages.

### Achados da auditoria inicial

- `core.js` possui normalização explícita suficiente para derivar o primeiro contrato tipado do estado v5 sem inventar campos;
- `market-experience.js` pesquisa Pingo Doce/Continente via Cesta e usa Open Food Facts apenas como enriquecimento visual opcional;
- o parser Cesta extrai `pid` para compor o identificador do resultado, mas não preserva `pid` como propriedade própria nem o persiste no fluxo `addProduct()`; esta discrepância foi registada para correção testada num bloco posterior;
- imagem encontrada por termo/score não é identificação forte de SKU e não deve servir de base para afirmar correspondência exata.

### Precisão do Mercado definida para v76

O motor futuro deve distinguir identidade, preço observado, estimativa, preço confirmado, quantidade/peso, promoções/descontos conhecidos e reconciliação com talão/fatura. O rótulo **Exato** só pode ser usado quando todos os fatores que determinam o preço final estiverem confirmados. Caso contrário, mantém-se **Estimativa** ou **Preço por confirmar**.

### QA e integração

- PR #72 integrado em `main` como `2c1d78508507ab77d6df95850568d9fd7f6b9577`;
- TypeScript Foundation de `main` run `34485922921`: **sucesso**;
- CI de `main` run `34485922896`: **sucesso**;
- GitHub Pages run `34485986996`: **sucesso**;
- o bundle público continuou a executar o runtime JavaScript v75 neste bloco.

---

## 2026-09-10 — v75 `75-market1` — Parte 3: Mercado

### Diagnóstico

- havia dois significados diferentes de pesquisa no mesmo ecrã: pesquisa live de produtos/lojas e pesquisa que filtra apenas a lista já adicionada;
- os rótulos Estado/Categoria/Ordenar estavam visualmente escondidos no mobile;
- `market-shopping-focus.js` colocava o bloco `Preço real / unidade` dentro de `Detalhes`;
- depois de marcar um artigo como comprado, o cartão passava também para o grupo recolhido `Comprados`;
- um item comprado com `actualCents <= 0` podia assim esconder a ação necessária para confirmar o preço pago;
- o browser live renderizava fotografia + conteúdo + ação como três filhos diretos, mas a grelha tinha apenas duas colunas explícitas;
- o pipeline especializado de fotografias por `marketId|pid` já tinha geometria estável, estados terminais e validação estrita; não foi encontrada razão para o substituir;
- não foi confirmado qualquer erro funcional no scanner/código de barras nesta auditoria.

### Alterações

Criados `v75-market-flow.js` e `v75-market-flow.css`, revisão `75-market1`:

- `#marketSearch` comunica **Pesquisar na minha lista…**, distinguindo filtro local de pesquisa live;
- rótulos de Estado, Categoria e Ordenar voltam a estar visíveis no mobile;
- cartões mobile mostram estado explícito: **Por comprar**, **Preço por confirmar** ou **Comprado**;
- o valor compacto passa a indicar **Estimativa total**, **Estimativa provisória** ou **Total contabilizado**;
- quando um item comprado não tem preço real, o mesmo `.market-mobile-real` já produzido pelo renderer é movido para fora de `Detalhes` e apresentado como **Confirmar preço pago / unidade**;
- o input conserva `data-market-actual`, continuando a usar o handler delegado existente em `events.js`;
- o grupo Comprados abre enquanto contiver pelo menos uma pendência de preço real;
- browser live corrigido para três colunas explícitas: fotografia / conteúdo / ação;
- preço do browser rotulado como **Preço pesquisado** e acompanhado de aviso de que é estimativa;
- botão existente mantém `data-market-add-product` e ganha rótulo visível **Adicionar** quando há espaço;
- imagens genéricas do browser live podem usar `CDCAssetLoader` para estados loading/error;
- catálogo progressivo mantém `75-photo-loader3`; a nova camada apenas espelha carregamento para `aria-busy`.

### Isolamento financeiro e segurança

- `market-experience.js` continua a criar produtos pesquisados com `estimatedCents=product.priceCents`, `actualCents=0`, `purchased=false`;
- `75-market1` não chama `commit()` nem `saveState()` e não atribui `estimatedCents`, `actualCents`, `quantity` ou `purchased`;
- não foram alterados `core.js`, `finance.js`, PIN, PBKDF2, AES-GCM, IndexedDB financeiro, sincronização, QR ou scanner;
- CSP e endpoints permanecem inalterados;
- `marketId|pid`, host/path/PID exato, caches e regras oficiais de fotografias permanecem intactos.

### Distribuição e QA

- `scripts/prepare-pages.cjs` inclui `v75-market-flow.css/js?v=75-market1`;
- CSS é injetado depois dos componentes especializados do Mercado e antes de `v75-usability.css`;
- JS é injetado depois de `v75-market-featured.js`;
- Service Worker inclui os novos ativos e acrescenta `market1` ao fim da revisão de cache;
- criado `tests/v75-market-flow.test.cjs` cobrindo fluxo, geometria, estimate/actual split, PID, loader, scanner e bundle;
- workflows CI e Pages executam syntax check e o novo teste;
- PR #71 integrado como `c44348dbc5a942b601f360fa38793bd9d8b47a1a`;
- GitHub Pages do SHA funcional: run `34482133540` — sucesso.

---

## 2026-09-10 — v75 `75-assets1` — biblioteca de design e carregamento transversal

- criado `design-asset-library.js` com catálogo/critério de fontes, ícones, Lottie e ferramentas de pairing;
- Lucide SVG local permanece sistema principal de ícones;
- política tipográfica: uma família preferencial, máximo de duas, licença/origem obrigatórias;
- criado `asset-loader.js/css` opt-in para imagens, vídeo/áudio e Lottie local;
- lazy loading, async decode, prioridades, estados loading/ready/error, reduced-motion e forced-colors;
- CSP não expandida; nenhum provider é contactado apenas por estar catalogado;
- PR #69 integrado como `a8e04d6811bd6eb08487de139fb19fb2f12128ec`;
- CI main `34478047035` e Pages `34478091014`: sucesso;
- PR documental #70 finalizou o estado permanente; HEAD de partida da Parte 3: `4e130708de2b76eefe56d04e0e5a03d49d431446`.

---

## 2026-09-10 — v75 `75-pages1` — Parte 2: Início, Despesas e Planeamento

- Início: hierarquia e densidade revistas sem alterar métricas;
- Despesas mobile voltou a usar Lista/Calendário, filtros, resumo e cartões canónicos de `renderBills()`/`filterBills()`;
- Planeamento: painéis e resumo reorganizados responsivamente;
- PR #68 integrado como `c8ec45893c8936093ecd7c7da9ee08c9a268109c`;
- CI `34474037338` e Pages `34474069564`: sucesso.

---

## 2026-09-10 — v75 `75-usability1` — Parte 1: usabilidade transversal

- `touch-action: manipulation` em controlos;
- formulários mobile com 16 px para reduzir auto-zoom Safari;
- alvos tácteis 44/48 px;
- cofre mobile com `100dvh`, safe areas e scroll controlado;
- pinch-to-zoom preservado;
- PR #66 integrado como `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`;
- CI main `34471773663` e Pages `34471814790`: sucesso.

---

## 2026-09-10 — v75 `75-startup2` + `75-catalog4` + `75-photo-loader3`

- abertura pós-PIN em dispositivo já emparelhado deixa de esperar pela verificação remota, sem reduzir PBKDF2/AES-GCM;
- fotografias passam a terminar em estado estável carregar → validar → `Sem fotografia`, com cooldown de retry;
- imagens Pingo Doce válidas reconciliam a biblioteca dedicada;
- `sourceUrl` oficial exata não dispara resolução redundante;
- host/path/PID permanecem estritos;
- branch final e main convergiram no SHA `f85deed6d2fab5e1b0658ad74c25d323f621a19f` após CI verde.

## Histórico anterior

Revisões anteriores de faturas, pagamentos, navegação, segurança, sincronização, Mercado, catálogo e responsividade permanecem no histórico Git e em `release-manifest.json`. Não remover comportamento histórico sem prova de ausência de referências e regressões.
