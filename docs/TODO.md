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
- [x] `75-market1` — pesquisa, filtros e fluxo de compra do Mercado; PR #71.
- [x] `75-expenses1` — Despesas/Faturas modernas; PR #73, merge `176450fcb236a2272afb9d6a6983b42681aa705d`.
- [x] Confirmar CI/TypeScript/Pages após `75-expenses1`: `34496500755`, `34496500641`, `34496540096` — sucesso.

## P0 — v76 Bloco 0 e Bloco 1

- [x] Criar `docs/TYPESCRIPT_MIGRATION.md`.
- [x] Definir estratégia incremental e critérios de aceitação por bloco.
- [x] Definir que `100% TypeScript` é meta de código-fonte, não promessa de zero defeitos.
- [x] Definir regra de exatidão do Mercado: sem evidência completa, resultado continua `Estimativa`.
- [x] Integrar fundação TypeScript pelo PR #72.
- [x] TypeScript como `devDependency`, sem dependências runtime.
- [x] `tsconfig.json` com `strict`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`.
- [x] Criar `src/types/primitives.ts`, `persisted-state.ts`, `market.ts` e `index.ts`.
- [x] Criar `src/type-tests/contracts.ts`.
- [x] Criar workflow `.github/workflows/typescript.yml`.
- [x] Confirmar TypeScript Foundation/CI/Pages de `main` após Bloco 1.

## P0 — `76-veggie-menu1`: Veggie Burger + X em TypeScript

### Auditoria

- [x] Confirmar que `#mobileMenuBtn` é o controlo canónico.
- [x] Confirmar que `#drawerCloseBtn` legado já fica oculto para não gerar dois X.
- [x] Confirmar que `mobile-menu-toggle.js` v73 controla abertura, fecho, swipe, foco e `aria-expanded`.
- [x] Identificar causa do desaparecimento no swipe: botão dentro da `.nav-drawer-shell` transformada.
- [x] Confirmar que `.topbar` já usa sticky na base e pode ser reforçada no mobile sem mudar navegação.

### Implementação

- [x] Criar branch `feat/v76-typescript-veggie-menu`.
- [x] Criar `src/ui/veggie-menu-toggle.ts` em TypeScript strict.
- [x] Implementar Veggie Burger fechado com exatamente duas linhas.
- [x] Transformar as mesmas duas linhas em X (`+45°/-45°`).
- [x] Manter um único `#mobileMenuBtn` para Abrir/Fechar.
- [x] Preservar `aria-expanded` e `aria-label` do controlador existente.
- [x] Quando o dialog abre, mover o mesmo botão para filho direto de `#mobileDrawer`, fora da shell transformada.
- [x] Manter o botão visível durante `data-dragging` e `data-closing`.
- [x] Reservar espaço na `.drawer-head` para evitar colisão com marca/título.
- [x] Reforçar topbar sticky no mobile.
- [x] Implementar `prefers-reduced-motion` e `forced-colors`.
- [x] Criar runtime browser `v76-veggie-menu.js` derivado da fonte TS.
- [x] Criar `v76-veggie-menu.css`.

### Distribuição e QA

- [x] Criar `tests/v76-veggie-menu.test.cjs`.
- [x] Adicionar syntax check e teste ao CI.
- [x] Adicionar verificação ao workflow Pages.
- [x] Publicar CSS/JS pela allowlist de `scripts/prepare-pages.cjs`.
- [x] Carregar `v76-veggie-menu.js` depois de `mobile-menu-toggle.js`.
- [x] Adicionar os dois assets ao Service Worker e versionar cache com `veggie-menu1`.
- [x] Confirmar TypeScript strict no head funcional `95bdacab47b8b97d5f6cf61d52fc492b5a10ceca`: run `34516585121` — sucesso.
- [x] Confirmar CI completo no mesmo head: run `34516585241` — sucesso.
- [ ] Confirmar TypeScript + CI novamente no head documental final.
- [ ] Confirmar branch `behind 0` relativamente a `main` antes do PR.
- [ ] Abrir PR e integrar apenas com checks verdes.
- [ ] Confirmar TypeScript + CI de `main` após merge.
- [ ] Confirmar GitHub Pages no SHA integrado.

### Validação física

- [ ] iPhone/Safari/PWA: fechado mostra apenas duas linhas.
- [ ] Toque: duas linhas convergem para X e regressam sem salto.
- [ ] Swipe de abertura: botão não desaparece.
- [ ] Swipe de fecho: botão não desaparece.
- [ ] X permanece no canto superior direito enquanto o drawer está aberto.
- [ ] Não aparece segundo X.
- [ ] Cabeçalho permanece fixo durante scroll normal.
- [ ] Sem colisão entre marca, título e botão.
- [ ] Validar 320/375/390/430 px e orientação vertical/horizontal.
- [ ] Validar tema claro/escuro e reduced-motion.

## P1 — Validação física acumulada v75

- [ ] Validar anti-zoom e alvos tácteis no iPhone/Safari/PWA.
- [ ] Validar `75-pages1` em 320/375/390/430 px, tablet e desktop.
- [ ] Validar fisicamente `75-expenses1` em mobile/tablet/desktop, tema claro/escuro, filtros e ações.
- [ ] Validar em hardware um componente `75-assets1` com imagem lazy/fallback.
- [ ] Validar marcar comprado → confirmar preço real no iPhone/Safari/PWA.
- [ ] Validar pesquisa/filtros/browser do Mercado em 320/375/390/430 px, tablet e desktop.

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
- [ ] Testar zero, limites, pagamentos parciais, vencimentos, recorrência e arredondamentos.
- [ ] Manter dinheiro persistido em cêntimos inteiros.

## P0 — v76 Blocos 4–6: Mercado exato, caixa e assets

- [ ] Separar identidade, observação de preço, estimativa, confirmação, quantidade/peso e total.
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
- [ ] Não introduzir CDN/hotlinking sem revisão de CSP/privacidade/licença.

## P0 — v76 Blocos 7–10: core, sync, UI e conclusão

- [ ] Migrar cofre/IndexedDB sem alterar PBKDF2/AES-GCM ou formato persistido sem decisão própria.
- [ ] Migrar sincronização/conflitos com estados discriminados e testes de concorrência/offline.
- [ ] Migrar render/forms/events com tipos DOM e guards de `null`.
- [ ] Migrar Service Worker/build apenas depois de pipeline TS estável.
- [ ] Remover JavaScript legado somente com prova de ausência de referências.
- [ ] Ativar `strict` para toda a árvore TypeScript.
- [ ] Eliminar `any` não justificado.
- [ ] Revalidar segurança, finanças, sincronização, manifest, offline e responsividade.

## P1 — Mais + ícones + acessibilidade final

- [ ] Rever grupos de Mais e reduzir duplicações de navegação.
- [ ] Rever Segurança, Diagnóstico, Aparência e Preferências como fluxos secundários.
- [ ] Consolidar ícones Lucide visíveis apenas com prova de ausência de regressão.
- [ ] Rever foco, teclado, leitores de ecrã e `prefers-reduced-motion`.
- [ ] Auditoria final de contraste e alvos tácteis.

## P2 — Consolidação técnica

- [ ] Depois da validação física, medir se camadas visuais antigas podem ser fundidas com segurança.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Alinhar nomenclatura base sem alterar rotas/IDs sem necessidade.
