# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico em preparação: `v76` — migração incremental TypeScript  
Branch pública: `main`  
Baseline funcional publicada: `c44348dbc5a942b601f360fa38793bd9d8b47a1a` (`75-market1`)  
HEAD público atual: `2c1d78508507ab77d6df95850568d9fd7f6b9577` (fundação TypeScript integrada)  
Branch visual em revisão: `feat/v75-expenses-modern-ui`  
PR visual: `#73` — `75-expenses1`  
Branch técnica reservada para o próximo bloco: `feat/v76-money-dates`  
Distribuição atual: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- preço pesquisado no Mercado permanece `estimatedCents` e preço efetivamente confirmado permanece `actualCents`;
- identidade canónica de catálogo/fotografia permanece `marketId|pid` onde esse pipeline é utilizado;
- QR, scanner, backup/restauro, PWA, Service Worker e funcionamento offline não podem regredir por causa da migração TypeScript;
- alterações exclusivamente visuais não podem modificar cálculos, pagamentos, faturas ou persistência.

## 2. Baseline v75 confirmada

`75-market1` foi integrado pelo PR #71 no commit funcional `c44348dbc5a942b601f360fa38793bd9d8b47a1a`. O deploy GitHub Pages desse SHA concluiu com sucesso no run `34482133540`.

A revisão preserva:

- `core.js` e `finance.js`;
- PIN, PBKDF2 e AES-GCM;
- IndexedDB financeiro;
- scanner e QR;
- `estimatedCents` separado de `actualCents`;
- loader de fotografias `75-photo-loader3` e pipeline especializado por PID.

Validação física em iPhone/Safari/PWA e breakpoints continua necessária para as revisões visuais v75.

## 3. Objetivo v76

Migrar o código funcional JavaScript para TypeScript por blocos pequenos, auditáveis e reversíveis, sem conversão massiva e sem trocar simultaneamente framework, UI e regras de negócio.

A meta final é:

- fonte funcional mantida em TypeScript;
- `strict` ativo;
- nenhum `any` não justificado;
- JavaScript gerado apenas no build para execução no browser;
- paridade de resultados com a baseline antes de cada substituição de runtime;
- testes automáticos preservados e ampliados.

O plano completo está em `docs/TYPESCRIPT_MIGRATION.md`.

## 4. Bloco 1 — fundação TypeScript

Integrado em `main` pelo PR #72 no commit `2c1d78508507ab77d6df95850568d9fd7f6b9577`, sem alteração de runtime funcional.

Inclui:

- `package.json` com ferramenta TypeScript de desenvolvimento;
- `tsconfig.json` em modo `strict`, `noEmit`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`;
- `.gitignore` preparado para `node_modules` e artefactos TypeScript;
- `src/types/primitives.ts` com tipos nominais para cêntimos, IDs, datas/horas e códigos de produto;
- `src/types/persisted-state.ts` a representar o schema normalizado atual `STATE_VERSION = 5` observado em `core.js`;
- `src/types/market.ts` com contratos do browser de Mercado atual e separação estimado/confirmado;
- `src/type-tests/contracts.ts` com verificações positivas e `@ts-expect-error` para regressões estruturais;
- workflow `.github/workflows/typescript.yml` para `npm run typecheck`.

O bundle público continua a usar `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` e os restantes módulos JavaScript existentes. Os `.ts` do Bloco 1 não entram no bundle Pages.

QA após integração:

- TypeScript Foundation `34485922921`: sucesso;
- CI `34485922896`: sucesso;
- GitHub Pages `34485986996`: sucesso.

## 5. Factos técnicos encontrados durante o mapeamento

1. `core.js` normaliza explicitamente faturas, pagamentos, rendimentos, artigos de Mercado, objetivos, atividade, auditoria, definições, conflitos e tombstones antes de produzir o estado v5.
2. O artigo de Mercado persistido atual contém `id`, `name`, `category`, `quantity`, `unit`, `estimatedCents`, `actualCents`, `purchased`, `productCode`, dados de imagem e timestamps.
3. O browser live atual pesquisa apenas Pingo Doce e Continente através de `cesta.pt` e pode enriquecer resultados com imagens Open Food Facts.
4. O parser live extrai um `pid` da resposta Cesta para compor o `id` do resultado, mas esse `pid` não é atualmente exposto como propriedade própria do objeto de resultado nem persistido pelo fluxo `addProduct()` de `market-experience.js`. Isto deve ser revisto antes de unificar a identidade do browser live com a biblioteca canónica `marketId|pid`.
5. A pesquisa de imagem do browser live é por termo e usa score de correspondência. É adequada como referência visual, mas não é prova forte de identidade do SKU. A futura biblioteca profissional deve preferir GTIN/PID e fontes verificadas.

## 6. Precisão do Mercado

O objetivo de cálculo será equivalente às operações observáveis numa compra: quantidade, peso, preço unitário, promoções conhecidas, descontos elegíveis, IVA quando determinado pelos dados, subtotal, total estimado, total confirmado e reconciliação com talão/fatura.

A aplicação só poderá chamar um total de **exato** quando SKU, quantidade/peso, preço válido, promoção/condição aplicável e restantes fatores que alteram o valor estiverem confirmados. Na ausência dessa evidência, continuará a mostrar `Estimativa`.

A Conta de Casa não será tratada como terminal POS proprietário e não processará pagamentos bancários apenas para imitar a caixa do supermercado.

## 7. Imagens e logos

A biblioteca de imagens continuará progressiva e associada à identidade do produto. Fotografias não alteram preço nem SKU.

Logos SVG de supermercados só devem ser incorporados como assets locais depois de verificação da origem e direito de utilização. Não serão copiados de sites aleatórios, CDNs ou agregadores sem validação de licença/termos, CSP e privacidade.

## 8. Revisão visual atual — `75-expenses1`

Objetivo: modernizar a página de Despesas/Faturas sem alterar o domínio financeiro.

Factos confirmados antes da alteração:

- `#page-bills` já contém Lista/Calendário, pesquisa, Estado, Categoria, intervalo de datas, ordenação, resumo, tabela desktop e cartões mobile;
- `renderBills()`/`filterBills()` já fornecem o comportamento funcional canónico;
- as ações Abrir/Detalhes, Editar, Pagar e Excluir já são condicionadas ao estado da fatura;
- não foi encontrado motivo funcional para alterar `finance.js`, `render.js`, `forms.js` ou `events.js` apenas para modernizar a apresentação.

Implementação na branch `feat/v75-expenses-modern-ui`:

- `v75-expenses-modern.css`, revisão `75-expenses1`, limitado a `html.cdc-v75 #page-bills`;
- Lista/Calendário refinados como controlo segmentado;
- pesquisa + `Nova fatura` numa barra operacional moderna;
- painel de filtros responsivo;
- cartões de resumo com hierarquia reforçada;
- tabela desktop com contentor, cabeçalho fixo e hover discreto;
- cartões mobile com `Em falta` como foco e Total/Pago/Categoria, vencimento, estado, progresso e ações preservados;
- breakpoints para desktop intermédio, `≤820px` e `≤430px`;
- `prefers-reduced-motion` e `forced-colors` tratados;
- `scripts/prepare-pages.cjs` e `sw.js` versionam/publicam `75-expenses1`;
- `tests/v75-expenses-modern.test.cjs` adicionado ao CI e ao workflow Pages.

## 9. QA de `75-expenses1`

PR #73 aberto sobre `main`.

No head anterior à preservação documental (`4013d05af84c4af2367c823a597ee42f41b8cb5a`):

- CI push `34495698852`: sucesso;
- CI do PR `34495879773`: sucesso, incluindo `v75 modern expenses UI tests` e todas as regressões financeiras, Mercado, segurança, sincronização, responsividade, acessibilidade e manifest;
- TypeScript Foundation do PR `34495879840`: sucesso;
- comparação com `main`: `behind 0` antes da atualização documental seguinte.

Como a preservação documental gera novo head, os checks devem voltar a concluir com sucesso antes do merge.

## 10. Validação física pendente

- iPhone/Safari/PWA;
- 320/375/390/430 px;
- tablet;
- desktop;
- tema claro e escuro;
- pesquisa, filtros, limpar filtros e Lista ↔ Calendário;
- Abrir/Detalhes, Editar, Pagar e Excluir quando permitido;
- muitas faturas e textos longos.

## 11. Próximo passo

1. confirmar CI + TypeScript no head documental final do PR #73;
2. confirmar `behind 0`;
3. integrar `75-expenses1` apenas com checks verdes;
4. confirmar CI e GitHub Pages no SHA integrado;
5. validar fisicamente Despesas;
6. retomar `feat/v76-money-dates` para o Bloco 2 com testes de paridade JS→TS antes de substituir runtime.
