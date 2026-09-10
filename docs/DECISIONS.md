# Decisões Técnicas — Conta de Casa

Atualizado: 10 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

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
2. Browser continua a receber JavaScript durante a transição.
3. Não introduzir React, Flutter ou .NET MAUI durante a migração de linguagem.
4. Cada módulo só substitui runtime depois de paridade e regressão.
5. Schema, cifragem e sincronização não mudam apenas por causa da linguagem.
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

Estado vigente: `76-veggie-menu2`, integrado pelo PR #76.

1. Fechado: exatamente duas linhas horizontais.
2. Aberto: mesmas linhas formam X (`+45°/-45°`).
3. `#mobileMenuBtn` é o único controlo canónico.
4. Fonte em `src/ui/veggie-menu-toggle.ts` com TypeScript strict.
5. Animação explícita por Web Animations API; ambas as barras permanecem visíveis.
6. O botão fica fora da `.nav-drawer-shell` transformada enquanto o drawer está aberto.
7. `aria-expanded` e `aria-label` continuam associados ao mesmo botão.
8. Reduced-motion, foco e alvo táctil permanecem suportados.
9. A camada não acede ao estado financeiro.

A regra anterior de reforçar topbar sticky foi revogada após evidência física em iPhone/Safari.

## D-069 — topbar mobile permanece no fluxo normal

Estado: integrado pelo PR #76.

1. `.topbar` usa `position: relative` em mobile.
2. `.main` não reserva `padding-top` para header fixo.
3. Conteúdo começa depois do cabeçalho no fluxo normal.
4. Bottom navigation pode continuar persistente porque é navegação global.
5. Safe areas, acessibilidade e alvos tácteis permanecem obrigatórios.

Fundamento: a captura física demonstrou que o header preso ao viewport competia com o conteúdo e quebrava a composição.

## D-070 — UI/UX master é última camada visual transversal e isolada

Estado: integrado pelo PR #76 como `76-modern-ui1`.

1. `v76-modern-ui.css` carrega depois de `v75-usability.css` e tem autoridade final apenas sobre apresentação.
2. Cobre Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
3. Cobre botões, inputs, tabs, tabelas, dialogs, drawer, bottom navigation e estados vazios.
4. Usa tokens comuns de cor, superfície, borda, raio, sombra, estado e foco.
5. Não altera handlers, dados, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.
6. Tema escuro, reduced-motion, forced-colors, pinch-to-zoom e alvos tácteis permanecem requisitos.
7. Camadas antigas só podem ser consolidadas após validação física e prova de ausência de regressão.

## Evidência da integração

PR #76 integrado como `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

- TypeScript PR `34537361127`: sucesso;
- CI PR `34537361274`: sucesso;
- TypeScript main `34537430909`: sucesso;
- CI main `34537430967`: sucesso;
- Pages `34537469989`: sucesso.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita desse `pid` em todo o fluxo ainda necessita teste específico de identidade antes de alteração.
