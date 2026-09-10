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
- Correções de zoom acidental não podem bloquear pinch-to-zoom.
- A UI móvel não deve esconder funcionalidades canónicas sem substituição funcional equivalente.
- Catálogos de fontes/ícones/animações não equivalem a dependências autorizadas; cada asset exige origem/licença/integração aprovadas.

## D-056 a D-063 — decisões preservadas

Mantêm-se vigentes as decisões sobre abertura pós-PIN sem espera remota em dispositivo emparelhado, estados terminais de fotografia, resolução oficial sem tentativas redundantes, anti-zoom acessível, Despesas mobile canónicas, biblioteca de design local-first e confirmação explícita de preço real no Mercado.

## D-064 — migração para TypeScript será incremental

Estado: integrado em `main` pelo PR #72.

1. Destino: código-fonte funcional em TypeScript com `strict`.
2. Browser continua a receber JavaScript durante a transição.
3. Não introduzir React, Flutter ou .NET MAUI durante a migração de linguagem.
4. Cada módulo só substitui runtime depois de paridade e regressão.
5. Schema, cifragem e sincronização não mudam apenas por causa da linguagem.
6. `any` não justificado não é estratégia aceite.

## D-065 — total de Mercado só pode ser rotulado exato com evidência completa

Um total só pode ser apresentado como **Exato** quando estiverem confirmados todos os fatores que alteram o valor: SKU, quantidade/peso, preço aplicável, promoção/condições, cartão/cupão quando aplicável, regra fiscal necessária e ajustes identificados na fatura/talão.

Sem isso, o estado deve permanecer `Estimativa` ou `Preço por confirmar`.

## D-066 — imagens e logos não podem enfraquecer identidade, licença ou CSP

- imagens são enriquecimento visual, não prova de preço;
- preferir GTIN/PID e fonte verificada;
- logos SVG só entram como assets locais com origem/direito de utilização verificados;
- não copiar SVGs de agregadores aleatórios;
- não expandir CSP apenas para branding.

## D-067 — modernização de Despesas é camada visual isolada

Estado: integrado em `main` como `75-expenses1` pelo PR #73.

`renderBills()`/`filterBills()` permanecem canónicos. A modernização não altera `core.js`, `finance.js`, persistência, segurança ou IDs funcionais.

## D-068 — Veggie Burger/X usa um único controlo TypeScript

Estado original: `76-veggie-menu1` integrado pelo PR #74.  
Revisão corretiva: `76-veggie-menu2` em `fix/v76-menu-flow-modern-ui`.

### Decisão vigente

1. Fechado: exatamente duas linhas horizontais.
2. Aberto: as mesmas linhas formam X (`+45°/-45°`).
3. `#mobileMenuBtn` é o único controlo canónico.
4. Fonte em `src/ui/veggie-menu-toggle.ts` com TypeScript strict.
5. A animação das duas barras é explícita via Web Animations API; ambas mantêm `opacity: 1`.
6. O botão fica fora da `.nav-drawer-shell` transformada enquanto o drawer está aberto.
7. `aria-expanded` e `aria-label` continuam associados ao mesmo botão.
8. `prefers-reduced-motion`, foco e alvo táctil permanecem suportados.
9. A camada não pode aceder ao estado financeiro.

### Correção de decisão anterior

A regra anterior de reforçar a topbar sticky foi **revogada** após evidência física em iPhone/Safari mostrar conflito com o fluxo visual durante scroll. O menu e o comportamento do header são decisões separadas.

## D-069 — topbar mobile deve permanecer no fluxo normal

Data: 10 de setembro de 2026. Estado: aceite para `76-modern-ui1`.

### Facto observado

Captura física em iPhone/Safari mostrou conteúdo e topbar em composição incoerente durante scroll, causada pela sobreposição de camadas que combinavam header fixo/sticky e padding estrutural reservado.

### Decisão

1. Em mobile, `.topbar` usa `position: relative` e não acompanha o scroll.
2. `.main` não reserva `padding-top` para header fixo.
3. O conteúdo começa depois do cabeçalho no fluxo normal.
4. A navegação inferior pode continuar persistente por ser navegação global, não conteúdo editorial.
5. Safe areas, acessibilidade e alvos tácteis permanecem obrigatórios.

### Fundamento

Um cabeçalho fixo só é útil se não competir com o conteúdo. Na Conta de Casa, a captura real demonstrou perda de coerência visual; a solução é reduzir complexidade e restaurar fluxo natural.

## D-070 — UI/UX master é uma última camada visual transversal e isolada

Data: 10 de setembro de 2026. Estado: aceite para `76-modern-ui1`.

1. `v76-modern-ui.css` é carregado depois de `v75-usability.css` e tem autoridade final apenas sobre apresentação.
2. O sistema cobre explicitamente Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
3. Também cobre botões, inputs, tabs, tabelas, dialogs, drawer, navegação inferior e estados vazios.
4. Usa tokens comuns de cor, superfície, borda, raio, sombra, estado e foco para evitar páginas visualmente desconectadas.
5. Não altera handlers, dados, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.
6. Tema escuro, `prefers-reduced-motion`, `forced-colors`, pinch-to-zoom e alvos tácteis permanecem requisitos.
7. Camadas antigas só podem ser consolidadas/removidas depois de validação física e prova de ausência de regressão.

## Evidência atual

Branch `fix/v76-menu-flow-modern-ui`: CI push `34537017339` concluído com sucesso, incluindo os novos testes `v76 Veggie Burger TypeScript tests` e `v76 master UI tests`, além das regressões financeiras, Mercado, segurança, responsividade, acessibilidade e sincronização.

TypeScript strict será confirmado pelo workflow do PR antes do merge.

## Lacuna técnica preservada

`market-experience.js` extrai `pid` da resposta Cesta, mas o objeto persistido ainda não preserva `pid` como propriedade própria em todo o fluxo. Não corrigir sem teste específico de identidade.
