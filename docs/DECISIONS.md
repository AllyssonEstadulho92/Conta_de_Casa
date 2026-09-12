# Decisões Técnicas — Conta de Casa

Atualizado: 12 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O detalhe histórico permanece no Git.

## Decisões estruturais vigentes

- Estado financeiro local-first separado de apresentação e catálogos.
- Valores monetários em cêntimos e `STATE_VERSION = 5`.
- Cofre PBKDF2-SHA-256 + AES-GCM; `PBKDF2_ITERATIONS = 250000`.
- Fotografias não são prova de preço nem de transação.
- `marketId|pid` é a identidade canónica de fotografia/SKU no pipeline especializado.
- Preço pesquisado é estimativa; preço efetivamente pago continua separado.
- Falha de fotografia nunca remove o artigo.
- Releases públicas relevantes usam revisão/cache invalidável.
- Correções de zoom não podem bloquear pinch-to-zoom.
- A UI móvel não deve esconder funcionalidades canónicas sem substituição equivalente.

## D-064 — migração TypeScript incremental

Estado: integrado em `main` pelo PR #72.

1. Destino: código-fonte funcional TypeScript com `strict`.
2. Browser continua a receber JavaScript compilado.
3. Não introduzir React, Flutter ou .NET MAUI apenas para migrar linguagem.
4. Cada módulo só substitui runtime depois de paridade e regressão.
5. Schema, cifragem e sincronização não mudam por causa da linguagem.
6. `any` não justificado não é estratégia aceite.

## D-065 — total de Mercado só é exato com evidência completa

Um total só pode ser apresentado como **Exato** quando estiverem confirmados SKU, quantidade/peso, preço aplicável, promoções/condições, cartão/cupão quando aplicável, regra fiscal necessária e ajustes identificados na fatura/talão. Sem isso, permanece `Estimativa` ou `Preço por confirmar`.

## D-066 — imagens e logos preservam identidade, licença e CSP

- imagens são enriquecimento visual, não prova de preço;
- preferir GTIN/PID e fonte verificada;
- logos SVG só entram como assets locais com origem/direito de utilização verificados;
- não expandir CSP apenas para branding.

## D-067 — modernização de Despesas é visual e isolada

Estado: integrado em `main` como `75-expenses1` pelo PR #73. `renderBills()`/`filterBills()` permanecem canónicos e o redesign não altera domínio financeiro ou persistência.

## D-068 — Veggie Burger/X usa um único controlo TypeScript

Estado visual: `76-veggie-menu2`, integrado pelo PR #76.

- duas linhas fechadas; mesmas linhas formam X abertas;
- `#mobileMenuBtn` é o controlo canónico;
- fonte TypeScript strict em `src/ui/veggie-menu-toggle.ts`;
- Web Animations API, reduced-motion, foco e `aria-*` preservados;
- a camada não acede ao estado financeiro.

## D-069 — topbar mobile permanece no fluxo normal

Estado: integrado pelo PR #76. `.topbar` usa `position:relative` em mobile; o shell detém safe areas e o bottom navigation pode permanecer persistente.

## D-070 — sistema visual transversal é isolado do domínio

Estado inicial: `76-modern-ui1`, PR #76. `v76-modern-ui.css` define tokens/aparência sem alterar handlers, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.

## D-071 — versão, release e build são identidades separadas

Estado: integrado como `76-version-audit1`, PR #78. `package.json.version`, release pública e Build ID/data têm papéis distintos.

## D-072 — shell móvel tem um único scroll e respeita safe areas

Estado: integrado como `76-mobile-shell2`, PR #80. Scroll principal no documento, topbar no fluxo, dock com safe area/reserva, pinch-to-zoom preservado.

## D-073 — arquitetura UI tem propriedade única por preocupação

Estado: integrado pelo PR #82. Shell, tokens, componentes, features, domínio, persistência, sync, PWA e segurança têm responsabilidades separadas; 44×44 px é baseline de toque e 320 CSS px é requisito de reflow.

## D-074 — `v76-modern-ui.css` deixa de duplicar geometria mobile do shell

Estado: integrado em `main` pelo PR #84. Design system mantém aparência/composição interna; shell mantém posição, offsets, safe areas, overflow e reserva do dock.

## D-075 — `76-modern-ui2` define hierarquia visual canónica

Estado: integrado em `main` pelo PR #85. Ações `primary`, `secondary`, `danger`, `link`, `icon button`; 44 px; foco/disabled/hover coerentes; imagens de Mercado com `contain`/centro/fallback.

## D-076 — “100% TypeScript” significa fonte TypeScript

1. O objetivo final é código-fonte funcional mantido em `.ts` com `strict`.
2. O browser continuará a executar JavaScript gerado pelo build.
3. Não apagar runtime JS antes de o equivalente TypeScript estar compilado, testado e usado pelo Pages.
4. Renomear `.js` para `.ts`, usar `@ts-nocheck` ou `any` em massa não satisfaz a meta.

## D-077 — protótipos são referência de hierarquia, não fonte de dados inventados

Dashboard, Mercado, Planeamento, Calendário e Faturas seguem a direção visual aprovada, mas métricas/tarefas/comparações/simulações inexistentes no domínio não entram automaticamente em produção.

## D-078 — `v76-product-pages.css` é autoridade de composição interna

Estado: integrado pelo PR #86, merge `42557d59f464a2fc7fc22a31eb24564e7dbabad9`; Pages `34695600399` com sucesso. A camada pode definir ordem/grids/densidade, mas não viewport, safe areas, scroll global, topbar estrutural, dock ou fórmulas.

## D-079 — exclusão de JavaScript exige substituição comprovada

Estado: vigente após incidente corrigido pelo PR #87.

1. Um `.js` fonte só pode ser eliminado quando existir `.ts` equivalente e funcional.
2. O TS deve ser compilado e o artefacto gerado deve ser o publicado pelo Pages.
3. CI/build/HTML/SW/testes devem usar o nome público/artefacto correto, não uma fonte manual removida.
4. CI integral + TypeScript Foundation devem ficar verdes depois da remoção.
5. `main` é sempre tratada como publicável.

## D-080 — artefactos JavaScript gerados não contam como fonte manual

Estado: integrado e publicado pelo PR #88, merge `5301bd0d66c5ec46ead7be079799ecb76c752237`.

1. `src/ui/veggie-menu-toggle.ts` é a fonte canónica do primeiro runtime migrado.
2. `v76-veggie-menu.js` deixou de ser ficheiro versionado de fonte.
3. O build gera `.generated/v76-veggie-menu.js` e o Pages publica `dist/v76-veggie-menu.js`.
4. `.generated/` e `dist/` são ignorados pelo Git.
5. O nome público `.js` é mantido para compatibilidade do browser/Service Worker.
6. O build falha se reaparecer um `v76-veggie-menu.js` manual.
7. Evidência pós-merge: TypeScript `34699066645`, CI `34699066749`, Pages `34699100855`, todos com sucesso.
8. `backup/js-runtime-baseline-20260912` permanece referência de rollback, não runtime paralelo.

## D-081 — migração avança por blocos auditáveis de baixo risco

Estado: integrado e publicado pelo PR #89, merge `c59e0a45500fd7965039de27615f574129482b13`.

1. Cada bloco migra um conjunto pequeno e coerente; não há exclusão massiva de `.js`.
2. O segundo bloco escolheu `market-branding.js`, módulo folha de apresentação que não altera cofre, finanças, preço, SKU ou persistência.
3. A fonte canónica é `src/ui/market-branding.ts`; a fonte manual `market-branding.js` foi removida.
4. O nome público `market-branding.js` mantém-se para browser/Service Worker, mas é gerado em `.generated/` e publicado por `dist/`.
5. `scripts/build-typescript-runtime.cjs` mantém um registo explícito de múltiplos runtimes TypeScript para evitar regras ad hoc.
6. CI, TypeScript Foundation, Pages e `tests/typescript-runtime-build.test.cjs` validam cada artefacto migrado.
7. `sw.js` foi invalidado apenas pela chave de cache; a lógica de fetch permaneceu canónica e o gate Safari/PWA confirmou a regressão antes do merge.
8. Controladores complexos (`mobile-menu-toggle.js`), domínio (`finance.js`) e infraestrutura (`core.js`, sync, Service Worker) ficam para blocos posteriores com testes de paridade próprios.
9. Evidência pós-merge: TypeScript `34700016617`, CI `34700016615`, Pages `34700037019`, todos com sucesso.

## Evidência recente

- PR #87: recuperação do pipeline após remoção prematura; CI/Pages verdes.
- PR #86: Dashboard real publicado; CI `34695579311`, TypeScript `34695579282`, Pages `34695600399` verdes.
- PR #88: primeiro JS fonte removido; merge `5301bd0d66c5ec46ead7be079799ecb76c752237`; TypeScript `34699066645`, CI `34699066749`, Pages `34699100855` verdes.
- PR #89: `market-branding` migrado; merge `c59e0a45500fd7965039de27615f574129482b13`; TypeScript `34700016617`, CI `34700016615`, Pages `34700037019` verdes.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita desse `pid` em todo o fluxo ainda necessita teste específico de identidade antes de alteração.
