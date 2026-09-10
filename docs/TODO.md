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
- [x] `75-expenses1` — layout moderno de Despesas; PR #73 / `176450fcb236a2272afb9d6a6983b42681aa705d`.
- [x] Confirmar GitHub Pages de `75-expenses1`: run `34496540096` — sucesso.

## P1 — Validação física acumulada v75

- [ ] Validar no iPhone/Safari/PWA o anti-zoom e os alvos tácteis.
- [ ] Validar `75-pages1` em 320/375/390/430 px, tablet e desktop.
- [ ] Validar em hardware um componente `75-assets1` com imagem lazy/fallback.
- [ ] Validar fisicamente o fluxo marcar comprado → confirmar preço real no iPhone/Safari/PWA.
- [ ] Validar visualmente pesquisa/filtros/browser do Mercado em 320/375/390/430 px, tablet e desktop.
- [ ] Validar `75-expenses1` em iPhone/Safari/PWA, 320/375/390/430 px, tablet e desktop.
- [ ] Validar `75-expenses1` em tema claro e escuro, com muitas faturas e textos longos.
- [ ] Validar pesquisa, filtros, Lista ↔ Calendário e ações de fatura após `75-expenses1`.
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

### QA e integração Bloco 1

- [x] Abrir PR #72 do Bloco 1.
- [x] Confirmar `npm run typecheck` verde no GitHub Actions.
- [x] Confirmar CI legado verde no PR.
- [x] Confirmar branch `behind 0` antes do merge.
- [x] Confirmar que o bundle público continuou JavaScript v75.
- [x] Integrar PR #72 como `2c1d78508507ab77d6df95850568d9fd7f6b9577`.
- [x] Confirmar TypeScript Foundation de `main`: run `34485922921` — sucesso.
- [x] Confirmar CI de `main`: run `34485922896` — sucesso.
- [x] Confirmar GitHub Pages de `main`: run `34485986996` — sucesso.

## P0 — `75-expenses1`: Despesas modernas

### Auditoria

- [x] Confirmar estrutura de `#page-bills` e respetivos IDs canónicos.
- [x] Confirmar `renderBills()`/`filterBills()` como fluxo funcional vigente.
- [x] Confirmar tabela desktop e cartões mobile existentes.
- [x] Confirmar ações Abrir/Detalhes, Editar, Pagar e Excluir existentes.
- [x] Confirmar que o redesign não exige mudança de regras financeiras.

### Implementação

- [x] Criar branch `feat/v75-expenses-modern-ui` a partir de `main`.
- [x] Criar `v75-expenses-modern.css` revisão `75-expenses1`.
- [x] Modernizar Lista/Calendário sem alterar navegação.
- [x] Modernizar pesquisa e `Nova fatura`.
- [x] Modernizar painel de filtros.
- [x] Modernizar cartões de resumo.
- [x] Modernizar tabela desktop.
- [x] Modernizar cartões mobile.
- [x] Manter `Em falta`, vencimento, Total, Pago, Categoria, progresso e ações.
- [x] Adicionar breakpoints para desktop intermédio, `≤820px` e `≤430px`.
- [x] Adicionar `prefers-reduced-motion` e `forced-colors`.
- [x] Não alterar `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` ou `index.html` fonte.

### Distribuição e QA

- [x] Adicionar `EXPENSES_REV = 75-expenses1` ao build.
- [x] Incluir CSS na allowlist Pages.
- [x] Carregar depois de `v75-pages.css` e antes de `v75-usability.css`.
- [x] Adicionar asset e `expenses1` ao Service Worker/cache.
- [x] Criar `tests/v75-expenses-modern.test.cjs`.
- [x] Adicionar teste ao CI e ao workflow Pages.
- [x] CI final do PR #73: run `34496437909` — sucesso.
- [x] TypeScript Foundation final do PR #73: run `34496437836` — sucesso.
- [x] Confirmar `behind 0` antes do merge.
- [x] Integrar PR #73 por squash como `176450fcb236a2272afb9d6a6983b42681aa705d`.
- [x] Confirmar CI de `main`: run `34496500755` — sucesso.
- [x] Confirmar TypeScript Foundation de `main`: run `34496500641` — sucesso.
- [x] Confirmar GitHub Pages: run `34496540096` — sucesso.

## P0 — v76 Bloco 2: dinheiro, quantidades e datas

Branch reservada: `feat/v76-money-dates`.

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
