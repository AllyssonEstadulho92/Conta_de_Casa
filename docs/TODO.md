# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM.
- [x] Manter `PBKDF2_ITERATIONS = 250000`.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sincronização cifrada por correções meramente visuais.
- [x] Preservar `estimatedCents` separado de `actualCents` no Mercado.
- [x] Preservar `marketId|pid` como identidade canónica de SKU/fotografia no pipeline especializado.

## P0 — Revisões v75 integradas

- [x] `75-startup2` — abertura pós-PIN sem bloqueio remoto em dispositivo emparelhado.
- [x] `75-photo-loader3` — estado terminal estável das fotografias.
- [x] `75-catalog4` — resolução exata sem tentativa redundante de `sourceUrl` oficial.
- [x] `75-usability1` — anti-zoom, alvos tácteis e cofre mobile.
- [x] `75-pages1` — Início, Despesas e Planeamento.
- [x] `75-assets1` — biblioteca/critério local-first e loader transversal opt-in.
- [x] `75-market1` — pesquisa, filtros e fluxo de compra do Mercado; PR #71 / `c44348dbc5a942b601f360fa38793bd9d8b47a1a`.
- [x] Confirmar GitHub Pages de `75-market1`: run `34482133540` — sucesso.

## P1 — Validação física acumulada v75

- [ ] Validar no iPhone/Safari/PWA o anti-zoom e os alvos tácteis.
- [ ] Validar `75-pages1` em 320/375/390/430 px, tablet e desktop.
- [ ] Validar em hardware um componente `75-assets1` com imagem lazy/fallback.
- [ ] Validar fisicamente o fluxo marcar comprado → confirmar preço real no iPhone/Safari/PWA.
- [ ] Validar visualmente pesquisa/filtros/browser do Mercado em 320/375/390/430 px, tablet e desktop.
- [ ] Quando existir runtime/animação Lottie local aprovada, validar reduced-motion/fallback.

## P0 — v76 Bloco 0: baseline e especificação

- [x] Confirmar baseline funcional `75-market1` integrada.
- [x] Confirmar deploy Pages do SHA funcional `c44348dbc5a942b601f360fa38793bd9d8b47a1a`.
- [x] Criar `docs/TYPESCRIPT_MIGRATION.md`.
- [x] Definir estratégia incremental e critérios de aceitação por bloco.
- [x] Definir que `100% TypeScript` é meta de código-fonte, não promessa de zero defeitos.
- [x] Definir regra de exatidão do Mercado: sem evidência completa, resultado continua `Estimativa`.

## P0 — v76 Bloco 1: fundação TypeScript

### Implementação

- [x] Criar branch `feat/v76-typescript-foundation`.
- [x] Adicionar `package.json` sem dependências runtime.
- [x] Fixar TypeScript como ferramenta de desenvolvimento.
- [x] Adicionar `tsconfig.json` com `strict`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`.
- [x] Atualizar `.gitignore` para `node_modules`/artefactos TypeScript.
- [x] Criar `src/types/primitives.ts`.
- [x] Criar `src/types/persisted-state.ts` com o schema normalizado v5 observado em `core.js`.
- [x] Criar `src/types/market.ts` com contratos do browser live e separação estimado/confirmado.
- [x] Criar `src/types/index.ts`.
- [x] Criar `src/type-tests/contracts.ts` com erros intencionais cobertos por `@ts-expect-error`.
- [x] Criar workflow `.github/workflows/typescript.yml` isolado do deploy.
- [x] Manter `index.html`, `scripts/prepare-pages.cjs`, `sw.js` e runtime v75 sem referência aos novos `.ts`.

### Auditoria/achados

- [x] Confirmar estrutura do estado v5 em `core.js` antes de tipar.
- [x] Confirmar estrutura atual de `MarketItem` antes de tipar.
- [x] Confirmar que pesquisa live atual usa Pingo Doce/Continente via Cesta e imagem opcional Open Food Facts.
- [x] Registar discrepância: `pid` é extraído no parser Cesta mas não exposto como propriedade do resultado nem persistido por `addProduct()`.
- [x] Registar que imagem por termo/score não equivale a identificação forte de SKU.

### QA antes de integrar Bloco 1

- [ ] Abrir PR do Bloco 1.
- [ ] Confirmar `npm run typecheck` verde no GitHub Actions.
- [ ] Confirmar CI legado verde no PR.
- [ ] Comparar branch com `main` e confirmar `behind 0`.
- [ ] Confirmar que `scripts/prepare-pages.cjs` continua a publicar o runtime JavaScript v75 sem novos `.ts`.
- [ ] Integrar apenas com checks verdes.
- [ ] Confirmar CI de `main` após integração.
- [ ] Confirmar que o deploy Pages não sofre alteração funcional no Bloco 1.

## P0 — v76 Bloco 2: dinheiro, quantidades e datas

- [ ] Mapear testes atuais de `parseCents`, `money`, `validCents`, `marketQuantityMilli`, `marketLineCents` e datas civis.
- [ ] Criar vetores de paridade JS→TS antes da substituição.
- [ ] Migrar funções puras para módulos TypeScript sem mudar resultados válidos.
- [ ] Criar tipos/constructors de `Cents`, datas civis e quantidades escaladas.
- [ ] Evitar floating point em operações contabilísticas.
- [ ] Testar limites, valores inválidos, arredondamento, milhares, vírgula/ponto e quantidades fracionárias.
- [ ] Só substituir o runtime quando a paridade estiver comprovada.

## P0 — v76 Bloco 3: domínio financeiro

- [ ] Migrar `finance.js` por subdomínios.
- [ ] Tipar faturas, pagamentos, rendimentos, orçamento, objetivos, relatórios e estados derivados.
- [ ] Testar fórmulas com zero, limites, pagamentos parciais, vencimentos, recorrência e arredondamentos.
- [ ] Manter dinheiro persistido em cêntimos inteiros.

## P0 — v76 Blocos 4–6: Mercado exato, caixa e assets

- [ ] Separar identidade do produto, observação de preço, estimativa, confirmação, quantidade/peso e total.
- [ ] Criar motor de carrinho com aritmética inteira/razões controladas.
- [ ] Suportar scanner GTIN/EAN e pesquisa manual sem misturar identidades.
- [ ] Suportar unidade, embalagem e produtos a peso.
- [ ] Modelar promoções apenas quando a regra estiver conhecida e testada.
- [ ] Modelar descontos/cupões/cartão apenas quando elegibilidade e ordem de aplicação estiverem confirmadas.
- [ ] Produzir subtotal, descontos, IVA quando determinado, total estimado, total confirmado e diferença.
- [ ] Reconciliar compra com talão/fatura/QR sem substituir valores silenciosamente.
- [ ] Guardar origem, instante de observação e validade de preço externo.
- [ ] Corrigir com teste a lacuna `pid` do browser live antes de o integrar em `marketId|pid`.
- [ ] Preferir GTIN/PID a pesquisa por termo para identidade de imagem.
- [ ] Construir biblioteca progressiva de fotografias sem associar imagem a preço.
- [ ] Verificar origem/licença de logos de mercados antes de incorporar SVG local.
- [ ] Não introduzir CDN/hotlinking de logos ou imagens sem revisão de CSP/privacidade/licença.

## P0 — v76 Blocos 7–10: core, sync, UI e conclusão

- [ ] Migrar cofre/IndexedDB sem alterar PBKDF2/AES-GCM ou formato persistido sem decisão própria.
- [ ] Migrar sincronização/conflitos com estados discriminados e testes de concorrência/offline.
- [ ] Migrar render/forms/events com tipos DOM e guards de `null`.
- [ ] Migrar Service Worker/build apenas depois de pipeline TS estável.
- [ ] Remover JavaScript legado somente com prova de ausência de referências.
- [ ] Ativar `strict` para toda a árvore TypeScript.
- [ ] Eliminar `any` não justificado.
- [ ] Revalidar segurança, finanças, sincronização, manifest, offline e responsividade.

## P1 — Parte 4 visual: Mais + ícones + acessibilidade final

- [ ] Rever grupos de Mais e reduzir duplicações de navegação.
- [ ] Rever Segurança, Diagnóstico, Aparência e Preferências como fluxos secundários.
- [ ] Consolidar ícones Lucide visíveis e eliminar fallback redundante apenas com prova de ausência de regressão.
- [ ] Rever foco, teclado, leitores de ecrã e `prefers-reduced-motion`.
- [ ] Auditoria final de contraste e alvos tácteis.

## P2 — Consolidação técnica

- [ ] Depois da validação física, medir se camadas visuais antigas podem ser fundidas com segurança.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Alinhar nomenclatura base (`PAGE_META`/template) com a arquitetura vigente sem alterar rotas nem IDs sem necessidade.
- [ ] Nas aplicações futuras, reutilizar o critério `75-assets1` e acrescentar apenas assets aprovados, nunca catálogos completos como dependência automática.
