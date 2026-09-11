# Decisões Técnicas — Conta de Casa

Atualizado: 11 de setembro de 2026

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

## D-070 — UI/UX master é camada visual transversal e isolada

Estado: integrado pelo PR #76 como `76-modern-ui1`.

1. `v76-modern-ui.css` define o design system transversal.
2. Cobre Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
3. Cobre botões, inputs, tabs, tabelas, dialogs, drawer, bottom navigation e estados vazios.
4. Não altera handlers, dados, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.
5. Tema escuro, reduced-motion, forced-colors, pinch-to-zoom e alvos tácteis permanecem requisitos.
6. Geometria de viewport móvel pode ser delegada a uma camada posterior específica sem alterar o design system.

## D-071 — versão, release e build são identidades separadas; atualização verifica o build real

Data: 10 de setembro de 2026. Estado: integrado em `main` como `76-version-audit1` pelo PR #78, merge `a68de711df1c42ec33948d3fff2f4d5e337e2436`.

1. `package.json.version` é a fonte da versão da aplicação, atualmente `0.76.0-dev.1`.
2. `app-build`/`release-manifest.json` representam a release pública, atualmente `v75`.
3. Cada compilação pública recebe Build ID de 7 caracteres e Build Date ISO.
4. `scripts/prepare-pages.cjs` injeta aplicação, release, build e data.
5. `registration.update()` ocorre antes de concluir que não há atualização.
6. Release igual não prova build igual.
7. Aplicação de Service Worker em espera continua dependente de ação explícita.
8. O mecanismo não lê nem transmite estado financeiro, PIN ou cofre.
9. Não promover `v75` para `v76` sem release formal.

## D-072 — shell móvel tem um único scroll e respeita safe areas

Data: 11 de setembro de 2026. Estado: integrado em `main` como `76-mobile-shell2` pelo PR #80, merge `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`; GitHub Pages publicado com sucesso.

### Factos que originaram a decisão

A validação física em iPhone mostrou a topbar a invadir a status bar e o dock inferior a cobrir o final do conteúdo. A revisão do código confirmou uma arquitetura mista: `mobile-layout.css` ainda impunha um viewport interno `100dvh`/`overflow:hidden`, enquanto `76-modern-ui1` já tinha colocado a topbar no fluxo normal.

### Decisão

1. Em ≤820 px, a aplicação desbloqueada usa **um único scroll vertical no documento**.
2. `.app-shell` e `.main` deixam de impor `max-height:100dvh` ou clipping na camada final.
3. A topbar continua `position:relative` e recebe compensação explícita de `safe-area-inset-top`.
4. A bottom navigation pode continuar fixa, mas a altura do dock e `safe-area-inset-bottom` entram obrigatoriamente na reserva inferior das páginas.
5. `v76-mobile-shell.css` carrega depois de `v76-modern-ui.css` e só tem autoridade sobre geometria de viewport, não sobre domínio ou regras financeiras.
6. Existem ajustes para 320/375/390/430 px e landscape de baixa altura.
7. Nenhuma solução pode usar `zoom`, bloquear pinch-to-zoom ou esconder conteúdo para fazê-lo caber.
8. Foco de teclado/touch deve poder ser deslocado acima do dock persistente.
9. Drawer e dialogs mantêm geometrias próprias e não transferem o scroll principal de volta para `.main`.

### Fundamento

Uma única origem de scroll elimina a competição entre header relativo, viewport interno e dock fixo. Safe areas passam a ser parte explícita da geometria, em vez de depender de regras históricas da cascata CSS.

## D-073 — arquitetura UI v76 passa a ter propriedade única por preocupação e gates de aceitação

Data: 11 de setembro de 2026. Estado: em implementação na branch `refactor/v76-architecture-baseline`.

### Factos que originaram a decisão

A auditoria transversal mostrou que a aplicação acumulou várias folhas de estilo versionadas com responsabilidade sobre os mesmos elementos estruturais. O caso mais objetivo era `mobile-layout.css`: ainda definia `.app-shell`, `.main` e `.topbar`, apesar de `v76-mobile-shell.css` ser a autoridade final. A correção por uma camada posterior funcionava por precedência e `!important`, mas mantinha duas fontes de verdade e aumentava o risco de novas regressões.

### Referencial externo usado

- Apple Human Interface Guidelines: safe areas/layout, toolbars e separação entre ações e navegação;
- MDN: `env(safe-area-inset-*)`, `viewport-fit=cover`, cascade layers, especificidade e container queries;
- W3C/WCAG 2.2: Reflow a 320 CSS px, Target Size (Minimum) e Focus Not Obscured;
- web.dev: arquitetura PWA, Cache Storage, IndexedDB e estratégias de cache;
- OWASP Cheat Sheet Series: Content Security Policy e validação de inputs.

Estas referências são critérios técnicos; a Apple HIG é orientação de plataforma para iOS e não substitui requisitos web/WCAG.

### Decisão

1. Cada preocupação transversal tem **uma única autoridade**: shell/viewport, tokens visuais, componentes, features, estados, domínio financeiro, persistência, sincronização, PWA e segurança.
2. `v76-mobile-shell.css` é a única autoridade para `html/body`, `.app-shell`, `.main`, `.topbar`, `.page` e `.mobile-nav` quando a propriedade altera geometria global em ≤820 px.
3. `mobile-layout.css` deixa de controlar viewport, scroll, topbar ou navegação persistente e fica restrito a refinamentos de features móveis.
4. `v76-modern-ui.css` mantém aparência e tokens. A geometria global duplicada será removida gradualmente apenas quando o valor computado final puder ser preservado por teste.
5. Não são aceites novos ficheiros “patch” para corrigir a mesma geometria. A correção deve ocorrer na camada que já é proprietária dessa preocupação.
6. A migração para `@layer` será feita por domínio completo, não parcialmente: estilos antigos sem layer têm precedência sobre regras normais em layers e uma adoção parcial criaria uma nova cascata ambígua.
7. `!important` não é proibido retroativamente, mas novas ocorrências em shell/components exigem justificação. O objetivo é reduzi-lo à medida que a propriedade única elimina guerras de especificidade.
8. O contrato responsive é mobile-first e deve passar a 320 CSS px sem perda de informação/funcionalidade nem scroll bidimensional global; tabelas/diagramas podem ter scroll local quando a própria semântica o exigir.
9. Alvos tácteis primários adotam 44×44 CSS px como baseline interno para iPhone. WCAG 2.2 AA permanece o mínimo normativo de 24×24 CSS px ou espaçamento equivalente.
10. Safe areas são parte da geometria e usam `env(safe-area-inset-*)` com `viewport-fit=cover`; não usar offsets por modelo de iPhone.
11. Navegação inferior contém apenas destinos de topo. Ações da vista ficam na toolbar/corpo/drawer contextual, não no tab bar.
12. Conteúdo e foco não podem ficar atrás de headers/docks persistentes; a reserva do shell e `scroll-padding`/`scroll-margin` fazem parte do contrato.
13. Container queries podem ser usados em componentes reutilizáveis quando a adaptação depende do contentor; não substituem breakpoints globais do shell nem safe areas.
14. Service Worker não pode ser requisito para o núcleo funcionar online. Cache de app shell, dados locais e recursos HTTP permanecem responsabilidades separadas: Cache Storage para recursos de rede; IndexedDB para estado estruturado.
15. CSP permanece defesa em profundidade. A dependência externa de runtime e `unsafe-inline` devem ser reduzidas em fases, sem alargar origens por conveniência.
16. Inputs externos são validados semanticamente e sintaticamente no limite de entrada. Dados financeiros nunca são “corrigidos” silenciosamente por dados remotos.
17. Qualquer refatoração transversal deve passar os testes financeiros, isolamento/cofre, sync, QR/scanner, responsive, acessibilidade, PWA e um gate específico de arquitetura UI.

### Implementação inicial

- removida de `mobile-layout.css` a propriedade histórica do viewport interno e da topbar sticky;
- criado `tests/ui-architecture-contract.test.cjs` para impedir regressão da propriedade do shell, validar safe areas, zoom, baseline de toque e ordem de build;
- `tests/mobile-layout-regression.test.cjs` passa a testar a arquitetura atual, em vez de exigir a arquitetura antiga;
- CI passa a executar o novo contrato.

## Evidência recente

- UI/UX PR #76: merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.
- `76-version-audit1`: PR #78, merge `a68de711df1c42ec33948d3fff2f4d5e337e2436`; CI/TypeScript/Pages verdes.
- `76-mobile-shell2`: PR #80, merge `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`; TypeScript `34542259212`, CI `34542259148` e Pages `34542303536` com sucesso.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita desse `pid` em todo o fluxo ainda necessita teste específico de identidade antes de alteração.
