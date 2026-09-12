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

Estado: integrado em `main` pelo PR #84, merge `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`.

- design system mantém aparência/composição interna;
- shell mantém `position`, offsets, safe areas, dimensões estruturais, overflow e reserva do dock;
- topbar e bottom navigation não podem recuperar geometria estrutural no design system;
- alvos tácteis continuam propriedade do componente/acessibilidade;
- `tests/ui-architecture-contract.test.cjs` impede regressão.

## D-075 — `76-modern-ui2` define hierarquia visual canónica de componentes

Data: 12 de setembro de 2026. Estado: implementação em `feat/v76-ui-components1`.

1. Ações usam hierarquia explícita: `primary`, `secondary`, `danger`, `link` e `icon button`.
2. Controlos principais mantêm mínimo de 44 px; disabled/`aria-disabled`, foco e hover têm estados coerentes.
3. Ícones dentro de botões usam métricas óticas consistentes; a família de ícones continua auditada separadamente.
4. Grids partilhados recebem `min-width:0` e gap comum para reduzir overflow sem assumir a topologia de cada feature.
5. Fotografias de Mercado usam `contain`/centro/fallback. Fonte, licença, identidade e semântica de preço não mudam.
6. A revisão `76-modern-ui2` invalida cache PWA com `ui-components1`.
7. Esta decisão não altera domínio financeiro, persistência, cifragem, sync, QR/scanner ou regras de Mercado.

## D-076 — “100% TypeScript” significa fonte TypeScript; JavaScript é apenas artefacto de build

Data: 12 de setembro de 2026. Estado: decisão para o programa de migração.

1. O objetivo final é que o código-fonte funcional mantido esteja em `.ts` com `strict`.
2. O browser continuará a executar JavaScript **gerado pelo build**; JavaScript compilado não será tratado como fonte manual.
3. Não apagar ficheiros JS runtime antes de o equivalente TypeScript estar compilado, testado e referenciado pelo Pages.
4. A migração segue blocos: funções puras → domínio financeiro → Mercado → core/persistência/cifra → sync → UI → PWA/build → testes/tooling.
5. Renomear `.js` para `.ts`, usar `@ts-nocheck` ou introduzir `any` em massa não satisfaz a meta.
6. Redesign visual e migração de linguagem podem coexistir no programa, mas não devem ser misturados no mesmo bloco quando isso impedir prova de regressão.

## D-077 — protótipos são referência de hierarquia, não fonte de dados inventados

Data: 12 de setembro de 2026.

1. Dashboard, Mercado, Planeamento, Calendário e Faturas seguem a direção visual dos protótipos: clean, premium, consistente e responsiva.
2. Valores, métricas, tarefas, comparações, receitas, simulações ou categorias que não existam no domínio real não entram automaticamente em produção.
3. Primeiro reutilizar dados e funções existentes; novas capacidades exigem decisão de produto e implementação própria.
4. A mesma linguagem visual deve ser partilhada por desktop e mobile, com composição adaptativa e não simples redução de escala.

## Evidência recente

- PR #76: `76-veggie-menu2` + `76-modern-ui1` integrado.
- PR #78: versão/auditoria integrado.
- PR #80: shell móvel integrado e Pages validado.
- PR #82: baseline arquitetural integrada.
- PR #84: consolidação UI/shell integrada em `main`, merge `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`.
- `feat/v76-ui-components1`: `76-modern-ui2` em preparação para PR e gates.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita desse `pid` em todo o fluxo ainda necessita teste específico de identidade antes de alteração.
