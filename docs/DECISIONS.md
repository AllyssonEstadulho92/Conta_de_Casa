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

Estado: integrado pelo PR #76.

- `.topbar` usa `position:relative` em mobile;
- `.main` não reserva topo para header fixo;
- bottom navigation pode continuar persistente;
- safe areas e alvos tácteis permanecem obrigatórios.

## D-070 — sistema visual transversal é isolado do domínio

Estado inicial: `76-modern-ui1`, PR #76. `v76-modern-ui.css` define tokens e aparência de componentes sem alterar handlers, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.

## D-071 — versão, release e build são identidades separadas

Estado: integrado como `76-version-audit1`, PR #78.

- `package.json.version` = versão da aplicação;
- release pública continua `v75` até promoção formal;
- Build ID/data distinguem compilações;
- verificação de atualização consulta o Service Worker real.

## D-072 — shell móvel tem um único scroll e respeita safe areas

Estado: integrado como `76-mobile-shell2`, PR #80.

- scroll principal no documento;
- `.app-shell`/`.main` sem clipping estrutural;
- topbar no fluxo com `safe-area-inset-top`;
- dock persistente com `safe-area-inset-bottom` e reserva de página;
- sem bloquear pinch-to-zoom;
- foco e último conteúdo não ficam atrás do dock.

## D-073 — arquitetura UI tem propriedade única por preocupação

Estado: integrado pelo PR #82.

- shell, tokens, componentes, features, domínio, persistência, sync, PWA e segurança têm responsabilidades separadas;
- `v76-mobile-shell.css` é a autoridade da geometria global mobile ≤820 px;
- 44×44 px é baseline interna de controlos de toque;
- reflow a 320 CSS px e safe areas são requisitos;
- alterações transversais exigem gates financeiros, segurança, PWA, responsive e UI.

## D-074 — `v76-modern-ui.css` deixa de duplicar geometria mobile do shell

Estado: integrado em `main` pelo PR #84. O design system mantém aparência/composição interna; o shell mantém posição, offsets, safe areas, overflow e reserva do dock.

## D-075 — `76-modern-ui2` define hierarquia visual canónica

Estado: integrado em `main` pelo PR #85.

1. Ações: `primary`, `secondary`, `danger`, `link`, `icon button`.
2. Controlos principais mantêm 44 px; foco/disabled/hover coerentes.
3. Ícones têm métricas óticas consistentes.
4. Grids partilhados usam `min-width:0` e gap comum.
5. Fotografias de Mercado usam `contain`/centro/fallback sem mudar preço ou identidade.

## D-076 — “100% TypeScript” significa fonte TypeScript

1. O objetivo final é código-fonte funcional mantido em `.ts` com `strict`.
2. O browser continuará a executar JavaScript gerado pelo build.
3. Não apagar runtime JS antes de o equivalente TypeScript estar compilado, testado e usado pelo Pages.
4. Renomear `.js` para `.ts`, usar `@ts-nocheck` ou `any` em massa não satisfaz a meta.

## D-077 — protótipos são referência de hierarquia, não fonte de dados inventados

1. Dashboard, Mercado, Planeamento, Calendário e Faturas seguem a direção visual aprovada.
2. Métricas/tarefas/comparações/simulações inexistentes no domínio não entram automaticamente em produção.
3. Desktop e mobile partilham linguagem visual, com composição adaptativa.

## D-078 — `v76-product-pages.css` é autoridade de composição interna

Estado: integrado pelo PR #86, merge `42557d59f464a2fc7fc22a31eb24564e7dbabad9`; Pages `34695600399` com sucesso.

1. Carrega depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`.
2. Pode definir ordem visual, grids internos, proporções, densidade e ênfase.
3. Não pode definir viewport, safe areas, scroll global, topbar estrutural ou dock.
4. Dashboard usa `dashboardNumbers()` e valores reais, sem fórmula nova.
5. `tests/v76-product-pages.test.cjs` é gate dedicado.

## D-079 — exclusão de JavaScript exige substituição comprovada

Estado: vigente após incidente corrigido pelo PR #87.

1. Um `.js` fonte só pode ser eliminado quando existir `.ts` equivalente e funcional.
2. O módulo TS deve ser compilado e o artefacto gerado deve ser o publicado pelo Pages.
3. Referências em HTML, build, SW, CI, workflows e testes devem apontar para o artefacto/publicação correta, não para fonte manual removida.
4. CI integral + TypeScript Foundation devem ficar verdes depois da remoção.
5. Até existir paridade, o JS antigo pode permanecer como fallback controlado.
6. O commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` apagou `v75-architecture.js` cedo demais, quebrou CI e bloqueou Pages; PR #87 recuperou o runtime.
7. `main` é sempre tratada como publicável.

## D-080 — artefactos JavaScript gerados não contam como fonte manual

Data: 12 de setembro de 2026. Estado: implementação em `feat/v76-typescript-runtime2`.

1. A fonte canónica do primeiro runtime migrado é `src/ui/veggie-menu-toggle.ts`.
2. `v76-veggie-menu.js` deixa de existir como ficheiro versionado na raiz.
3. `scripts/build-typescript-runtime.cjs` gera `.generated/v76-veggie-menu.js` a partir do TS.
4. `.generated/` e `dist/` são ignorados pelo Git.
5. `scripts/prepare-pages.cjs` mapeia o artefacto gerado para `dist/v76-veggie-menu.js`, mantendo compatibilidade com o browser e Service Worker.
6. O build falha se reaparecer um `v76-veggie-menu.js` manual na raiz.
7. A branch `backup/js-runtime-baseline-20260912` guarda a baseline pública anterior para rollback; não é carregada em paralelo.
8. Esta estratégia será replicada módulo a módulo, não por exclusão massiva.

## Evidência recente

- PR #87: recuperação do pipeline após remoção prematura; CI/Pages verdes.
- PR #86: Dashboard real publicado; CI `34695579311`, TypeScript `34695579282`, Pages `34695600399` verdes.
- `feat/v76-typescript-runtime2`: primeiro JS fonte removido; TypeScript Foundation `34695947847` e CI `34695947843` verdes antes da atualização documental.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita desse `pid` em todo o fluxo ainda necessita teste específico de identidade antes de alteração.
