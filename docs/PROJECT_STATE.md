# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico em preparação: `v76` — migração incremental TypeScript  
Branch pública: `main`  
Baseline funcional publicada: `c44348dbc5a942b601f360fa38793bd9d8b47a1a` (`75-market1`)  
HEAD documental posterior em `main`: `954c0df349d5d307cd2afd33bb07042e7f670315`  
Branch de trabalho: `feat/v76-typescript-foundation`  
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
- QR, scanner, backup/restauro, PWA, Service Worker e funcionamento offline não podem regredir por causa da migração TypeScript.

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

Implementado na branch `feat/v76-typescript-foundation`, ainda sem alteração de runtime:

- `package.json` com ferramenta TypeScript de desenvolvimento;
- `tsconfig.json` em modo `strict`, `noEmit`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`;
- `.gitignore` preparado para `node_modules` e artefactos TypeScript;
- `src/types/primitives.ts` com tipos nominais para cêntimos, IDs, datas/horas e códigos de produto;
- `src/types/persisted-state.ts` a representar o schema normalizado atual `STATE_VERSION = 5` observado em `core.js`;
- `src/types/market.ts` com contratos do browser de Mercado atual e separação estimado/confirmado;
- `src/type-tests/contracts.ts` com verificações positivas e `@ts-expect-error` para regressões estruturais;
- workflow `.github/workflows/typescript.yml` isolado do deploy, para `npm run typecheck`.

O bundle público continua a usar `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` e os restantes módulos JavaScript existentes. `index.html`, `scripts/prepare-pages.cjs`, `sw.js`, cálculos, armazenamento e segurança ainda não foram mudados para TypeScript.

## 5. Factos técnicos encontrados durante o mapeamento

1. `core.js` normaliza explicitamente faturas, pagamentos, rendimentos, artigos de Mercado, objetivos, atividade, auditoria, definições, conflitos e tombstones antes de produzir o estado v5.
2. O artigo de Mercado persistido atual contém `id`, `name`, `category`, `quantity`, `unit`, `estimatedCents`, `actualCents`, `purchased`, `productCode`, dados de imagem e timestamps.
3. O browser live atual pesquisa apenas Pingo Doce e Continente através de `cesta.pt` e pode enriquecer resultados com imagens Open Food Facts.
4. O parser live extrai um `pid` da resposta Cesta para compor o `id` do resultado, mas esse `pid` não é atualmente exposto como propriedade própria do objeto de resultado nem persistido pelo fluxo `addProduct()` de `market-experience.js`. Isto deve ser revisto antes de unificar a identidade do browser live com a biblioteca canónica `marketId|pid`; não será corrigido por inferência no Bloco 1.
5. A pesquisa de imagem do browser live é por termo e usa score de correspondência. É adequada como referência visual, mas não é prova forte de identidade do SKU. A futura biblioteca profissional deve preferir GTIN/PID e fontes verificadas.

## 6. Precisão do Mercado

O objetivo de cálculo será equivalente às operações observáveis numa compra: quantidade, peso, preço unitário, promoções conhecidas, descontos elegíveis, IVA quando determinado pelos dados, subtotal, total estimado, total confirmado e reconciliação com talão/fatura.

A aplicação só poderá chamar um total de **exato** quando SKU, quantidade/peso, preço válido, promoção/condição aplicável e restantes fatores que alteram o valor estiverem confirmados. Na ausência dessa evidência, continuará a mostrar `Estimativa`.

A Conta de Casa não será tratada como terminal POS proprietário e não processará pagamentos bancários apenas para imitar a caixa do supermercado.

## 7. Imagens e logos

A biblioteca de imagens continuará progressiva e associada à identidade do produto. Fotografias não alteram preço nem SKU.

Logos SVG de supermercados só devem ser incorporados como assets locais depois de verificação da origem e direito de utilização. Não serão copiados de sites aleatórios, CDNs ou agregadores sem validação de licença/termos, CSP e privacidade.

## 8. Próximo passo

1. abrir PR do Bloco 1;
2. executar CI legado e workflow TypeScript;
3. corrigir qualquer erro de compilação antes de integrar;
4. confirmar que o diff não altera o runtime publicado;
5. só depois iniciar o Bloco 2: dinheiro, quantidades e datas, com testes de paridade JavaScript → TypeScript antes da substituição do código em produção.
