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
- A UI móvel não deve esconder funcionalidades canónicas sem substituição funcional equivalente.

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

Estado: `76-veggie-menu2`, integrado pelo PR #76.

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

Estado inicial: `76-modern-ui1`, PR #76.

`v76-modern-ui.css` define tokens e aparência de componentes partilhados sem alterar handlers, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.

## D-071 — versão, release e build são identidades separadas

Estado: integrado como `76-version-audit1`, PR #78.

- `package.json.version` = versão da aplicação;
- release pública continua `v75` até promoção formal;
- Build ID/data distinguem compilações;
- verificação de atualização consulta o Service Worker real;
- mecanismo não lê estado financeiro, PIN ou cofre.

## D-072 — shell móvel tem um único scroll e respeita safe areas

Estado: integrado como `76-mobile-shell2`, PR #80.

- scroll principal no documento;
- `.app-shell`/`.main` sem clipping estrutural;
- topbar no fluxo com `safe-area-inset-top`;
- dock persistente com `safe-area-inset-bottom` e reserva de página;
- sem `zoom`, sem bloquear pinch-to-zoom;
- foco e último conteúdo não ficam atrás do dock.

## D-073 — arquitetura UI tem propriedade única por preocupação

Estado: integrado pelo PR #82.

- shell, tokens, componentes, features, estados, domínio, persistência, sync, PWA e segurança têm responsabilidades separadas;
- `v76-mobile-shell.css` é a autoridade da geometria global mobile ≤820 px;
- não criar novos ficheiros “patch” para a mesma propriedade;
- `@layer` só será adotado por domínio completo;
- 44×44 px é a baseline interna de controlos de toque;
- reflow a 320 CSS px e safe areas são requisitos;
- Service Worker/Cache Storage não substituem IndexedDB;
- alterações transversais exigem gates financeiros, segurança, PWA, responsive e UI.

## D-074 — `v76-modern-ui.css` deixa de duplicar geometria mobile do shell

Estado: integrado em `main` pelo PR #84.

- design system mantém aparência/composição interna;
- shell mantém `position`, offsets, safe areas, dimensões estruturais, overflow e reserva do dock;
- topbar e bottom navigation não podem recuperar geometria estrutural no design system;
- alvos tácteis continuam propriedade do componente/acessibilidade;
- `tests/ui-architecture-contract.test.cjs` impede regressão.

## D-075 — `76-modern-ui2` define hierarquia visual canónica de componentes

Estado: integrado em `main` pelo PR #85.

1. Ações usam hierarquia `primary`, `secondary`, `danger`, `link` e `icon button`.
2. Controlos principais mantêm mínimo de 44 px; disabled/`aria-disabled`, foco e hover têm estados coerentes.
3. Ícones dentro de botões usam métricas óticas consistentes.
4. Grids partilhados recebem `min-width:0` e gap comum.
5. Fotografias de Mercado usam `contain`/centro/fallback sem alterar fonte, identidade ou preço.
6. Cache PWA é invalidado com `ui-components1`.
7. A decisão não altera domínio financeiro, persistência, cifragem, sync, QR/scanner ou Mercado.

## D-076 — “100% TypeScript” significa fonte TypeScript; JavaScript é artefacto de build

1. O objetivo final é código-fonte funcional mantido em `.ts` com `strict`.
2. O browser continuará a executar JavaScript gerado pelo build.
3. Não apagar JS runtime antes de o equivalente TypeScript estar compilado, testado e referenciado pelo Pages.
4. A migração segue blocos: pipeline → funções puras → domínio financeiro → Mercado → core/persistência/cifra → sync → UI → PWA/build → testes/tooling.
5. Renomear `.js` para `.ts`, usar `@ts-nocheck` ou `any` em massa não satisfaz a meta.
6. Redesign e migração podem coexistir, mas os riscos devem permanecer separáveis.

## D-077 — protótipos são referência de hierarquia, não fonte de dados inventados

1. Dashboard, Mercado, Planeamento, Calendário e Faturas seguem a direção visual aprovada.
2. Valores, métricas, tarefas, comparações, receitas ou simulações inexistentes no domínio não entram automaticamente em produção.
3. Primeiro reutilizar dados e funções existentes; novas capacidades exigem decisão própria.
4. Desktop e mobile partilham linguagem visual, com composição adaptativa.

## D-078 — `v76-product-pages.css` é a autoridade de composição interna das páginas

Estado: PR #86.

1. Carrega depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`.
2. Pode definir ordem visual, grids internos, proporções, densidade e ênfase de secções.
3. Não pode definir viewport, safe areas, scroll global, topbar estrutural ou dock.
4. O Dashboard usa `dashboardNumbers()` e os valores existentes, sem fórmula nova.
5. Desktop e mobile podem ordenar as mesmas secções de forma diferente sem duplicar estado.
6. `76-product-pages1` tem gate dedicado em `tests/v76-product-pages.test.cjs`.

## D-079 — exclusão de JavaScript exige substituição de runtime comprovada

Data: 12 de setembro de 2026. Estado: vigente após incidente de publicação corrigido pelo PR #87.

1. Um ficheiro `.js` fonte só pode ser eliminado quando existir fonte `.ts` equivalente e funcional.
2. O módulo TS deve ser compilado pelo pipeline para um artefacto JavaScript em `dist/` e esse artefacto deve ser o que o Pages publica.
3. Antes da exclusão, devem ser eliminadas ou migradas todas as referências ao JS fonte em HTML, `scripts/prepare-pages.cjs`, Service Worker, CI, workflows e testes.
4. CI integral + TypeScript Foundation devem ficar verdes depois da remoção.
5. Até a substituição estar provada, o JS existente pode permanecer como fallback controlado. A presença temporária do fallback não muda a meta de fonte 100% TypeScript.
6. O commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` violou esta sequência ao apagar `v75-architecture.js`: o CI falhou com `MODULE_NOT_FOUND` e o Pages não publicou. O PR #87 restaurou exatamente o runtime e o deploy voltou a sucesso.
7. `main` deve ser tratado como publicável: exclusões diretas de runtime sem gates não são aceites.

## Evidência recente

- PR #84: consolidação UI/shell integrada.
- PR #85: `76-modern-ui2`/`ui-components1` integrado.
- PR #87: restauração de `v75-architecture.js`; CI e Pages verdes no merge `6401f1c5156382e9fe364da31afa3fcec4aed9bc`.
- PR #86: Dashboard `76-product-pages1`, sincronizado com o `main` restaurado; CI e TypeScript Foundation verdes no head anterior à atualização documental.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita desse `pid` em todo o fluxo ainda necessita teste específico de identidade antes de alteração.
