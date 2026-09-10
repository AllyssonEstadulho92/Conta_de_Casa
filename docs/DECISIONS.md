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

## D-046 a D-055 — decisões preservadas

Mantêm-se aceites as decisões anteriores sobre carrossel de destaques, biblioteca geral por retalhista+PID, catálogo progressivo sem persistir preços, biblioteca Pingo Doce isolada, publicação condicionada a CI/Pages, separação entre validade oficial e transporte, prevalência de evidência em hardware, renderer incremental sem destruir cartões estáveis e propagação `cdc:market-photo-ready`.

## D-056 — PIN não deve esperar pela rede num dispositivo já emparelhado

Estado: integrado em `main`.

- manter PBKDF2 em 250000 iterações;
- dispositivo com cópia local cifrada confirmada pode abrir após PIN sem bloquear na verificação remota;
- `syncNow('startup-background')` continua a verificação;
- primeiro emparelhamento e estados não confirmados mantêm o gate original.

## D-057 — carregamento de fotografia deve terminar num estado estável

Estado: integrado em `main` como `75-photo-loader3`.

- 0–7 s: carregar;
- 7–12 s: validar;
- depois: `Sem fotografia`;
- cooldown de 5 min antes de retry automático;
- falha temporária nunca elimina SKU.

## D-058 — `sourceUrl` oficial exata não dispara resolução redundante

Estado: integrado em `main` como `75-catalog4`.

Uma tentativa direta sem resultado termina para cartões com `sourceUrl` exata; pesquisa livre pode continuar a usar o bridge legado. Host/path/PID permanecem estritos.

## D-059 — imagem Pingo Doce comprovada deve reconciliar a base dedicada

Estado: integrado em `main`.

Quando o loader encontra fotografia Pingo Doce válida, o mesmo `marketId|pid` é atualizado na biblioteca dedicada e a métrica é refrescada.

## D-060 — impedir zoom acidental sem bloquear acessibilidade

Estado: integrado em `main` como `75-usability1`.

- `touch-action: manipulation` em controlos;
- formulários mobile com pelo menos 16 px;
- alvos tácteis 44/48 px;
- cofre com `100dvh`/safe areas/scroll;
- sem `user-scalable=no` nem `maximum-scale=1`.

## D-061 — Despesas mobile usa a vista funcional canónica

Estado: integrado em `main` como `75-pages1` pelo PR #68, merge `c8ec45893c8936093ecd7c7da9ee08c9a268109c`.

`renderBills()`/`filterBills()` continuam responsáveis por pesquisa, estado, categoria, datas, ordenação, resumo e ações. A camada visual reexpõe esta UI no mobile em vez de substituir por um feed funcionalmente inferior.

## D-062 — catálogo de design local-first com gate de licença e loader opt-in

Estado: integrado em `main` como `75-assets1` pelo PR #69, merge `a8e04d6811bd6eb08487de139fb19fb2f12128ec`.

- `design-asset-library.js` regista fornecedores sem iniciar rede;
- Lucide local permanece sistema principal de ícones;
- preferir uma família tipográfica, máximo duas;
- não carregar Google Fonts, Adobe Fonts, Font Awesome kits, Lottie ou outros CDNs automaticamente;
- `asset-loader.js/css` é opt-in para imagens/media/Lottie local;
- o loader genérico não substitui `market-photo-loader.js` nem decide PID/fotografias do Mercado;
- CSP não foi expandida.

## D-063 — item comprado sem preço real deve tornar a confirmação imediatamente visível

Estado: integrado em `main` como `75-market1` pelo PR #71, commit funcional `c44348dbc5a942b601f360fa38793bd9d8b47a1a`.

### Decisão preservada

1. `v75-market-flow.js/css` permanece camada de apresentação.
2. O mesmo `.market-mobile-real`/`data-market-actual` continua a ser reutilizado; não existe segundo handler financeiro.
3. Item comprado sem preço real expõe a confirmação fora de `Detalhes`.
4. Grupo Comprados abre quando existe preço por confirmar.
5. Estados visuais: `Por comprar`, `Preço por confirmar`, `Comprado`.
6. Valores compactos distinguem estimativa de total contabilizado.
7. Pesquisa live e pesquisa da lista permanecem contextos distintos.
8. Scanner, PID e loader especializado não são alterados sem erro comprovado.

## D-064 — migração para TypeScript será incremental e sem mudança simultânea de runtime

Data: 10 de setembro de 2026. Estado: fundação integrada em `main` pelo PR #72, merge `2c1d78508507ab77d6df95850568d9fd7f6b9577`.

### Decisão

1. Destino: código-fonte funcional em TypeScript com `strict` ativo.
2. TypeScript é ferramenta de build/desenvolvimento; o browser continua a receber JavaScript.
3. Não introduzir React, Flutter, .NET MAUI ou outro framework durante a migração de linguagem.
4. Cada módulo JavaScript só é substituído depois de testes de paridade demonstrarem equivalência.
5. `STATE_VERSION`, schema persistido, algoritmos de cifragem e formato de sincronização não mudam apenas por causa da linguagem.
6. `any` não justificado não é aceite como estratégia de migração.
7. Cada nova camada TypeScript deve ficar testável e reversível até a substituição completa do runtime correspondente.

### Fundamento

A aplicação já possui grande superfície funcional e testes de regressão. Uma conversão massiva aumentaria o risco de quebrar cálculos, cofre, sincronização e PWA. A migração por blocos permite provar equivalência antes de cada substituição.

## D-065 — total de Mercado só pode ser rotulado exato com evidência completa

Data: 10 de setembro de 2026. Estado: aceite para v76.

Um total do Mercado só pode ser apresentado como **Exato** quando estiverem confirmados todos os fatores que alteram o valor final: SKU, quantidade/peso, preço aplicável, promoção e respetivas condições, cartão/cupão quando aplicável, regra fiscal/IVA necessária e ajustes identificados na fatura/talão.

Se algum fator determinante não estiver confirmado, o estado deve ser `Estimativa` ou `Preço por confirmar`.

## D-066 — imagens e logos não podem enfraquecer identidade, licença ou CSP

Data: 10 de setembro de 2026. Estado: aceite para v76.

- imagens de produto são enriquecimento visual e nunca prova de preço;
- preferência futura por correspondência GTIN/PID e fonte verificada;
- logos SVG de mercados só entram como assets locais com origem e direito de utilização verificados;
- não copiar SVGs de agregadores/sites aleatórios;
- não expandir CSP nem introduzir CDN apenas para branding;
- manter fallback textual/visual enquanto a origem do asset não estiver validada.

## D-067 — modernização de Despesas será uma camada visual isolada

Data: 10 de setembro de 2026. Estado: integrado em `main` como `75-expenses1` pelo PR #73, merge funcional `176450fcb236a2272afb9d6a6983b42681aa705d`.

### Decisão

1. `v75-expenses-modern.css` é exclusivamente visual e limitado a `html.cdc-v75 #page-bills`.
2. Não alterar `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` nem os IDs canónicos para este redesign.
3. Modernizar tabs, pesquisa/criação, filtros, resumo, tabela desktop e cartões mobile.
4. No mobile, manter `Em falta` como foco principal e preservar vencimento, estado, Total, Pago, Categoria, progresso e ações.
5. Respeitar `prefers-reduced-motion` e `forced-colors`.
6. Carregar depois de `v75-pages.css` e antes de `v75-usability.css`.
7. Proteger o bundle/cache e a integração com teste próprio.

### Evidência

Após integração: CI `34496500755`, TypeScript Foundation `34496500641` e Pages `34496540096` concluíram com sucesso.

## D-068 — Veggie Burger/X será um único controlo TypeScript sobre o drawer validado

Data: 10 de setembro de 2026. Estado: aceite e implementado na branch `feat/v76-typescript-veggie-menu` como `76-veggie-menu1`.

### Factos

- `mobile-menu-toggle.js` v73 já controla abertura, fecho, swipe, foco, `aria-expanded` e devolução do botão ao cabeçalho;
- o controlador v73 ocultava `#drawerCloseBtn`, evitando um segundo X;
- o mesmo controlador movia `#mobileMenuBtn` para `.drawer-head` quando o drawer abria;
- `.drawer-head` está dentro de `.nav-drawer-shell`, que é transformado durante o swipe;
- consequentemente o próprio botão podia deslocar-se para fora da área visível durante o gesto.

### Decisão

1. O ícone fechado passa a **Veggie Burger de exatamente duas linhas horizontais**.
2. As mesmas duas linhas formam o X: superior `+45°`, inferior `-45°`; não criar um segundo botão de fecho.
3. A fonte da nova camada é `src/ui/veggie-menu-toggle.ts`, verificada por TypeScript strict.
4. O runtime browser derivado é `v76-veggie-menu.js`, carregado depois de `mobile-menu-toggle.js`.
5. Enquanto o dialog estiver aberto, mover **o mesmo** `#mobileMenuBtn` para filho direto de `#mobileDrawer`, fora de `.nav-drawer-shell`, para que o swipe não o leve juntamente com o painel.
6. Quando o dialog fechar, deixar o controlador v73 devolver o mesmo botão ao cabeçalho original; não duplicar estado nem listeners de negócio.
7. Reforçar a `.topbar` como sticky no mobile.
8. Reservar espaço na `.drawer-head` para evitar colisão com a marca/título.
9. Respeitar `prefers-reduced-motion`, `forced-colors`, foco por teclado e alvo táctil de 44 px.
10. A camada não pode chamar `commit()`, `saveState()` nem aceder a dados financeiros.

### Fundamento

O problema era de composição visual durante uma transformação CSS, não de domínio ou de navegação. Manter o controlador v73 reduz a superfície de regressão, enquanto a camada TypeScript corrige a geometria e inicia a migração real da UI para TS.

### QA funcional

No head `95bdacab47b8b97d5f6cf61d52fc492b5a10ceca`:

- TypeScript Foundation `34516585121`: sucesso;
- CI `34516585241`: sucesso;
- o teste `v76 Veggie Burger TypeScript tests` passou juntamente com finanças, faturas, Mercado, scanner, segurança, responsividade, acessibilidade e sincronização.

Validação física em iPhone/Safari/PWA permanece obrigatória após publicação.

## Evidência técnica v76

A fundação TypeScript integrada mantém `package.json`, `tsconfig.json`, `src/types/` e `src/type-tests/`. O novo `src/ui/veggie-menu-toggle.ts` é o primeiro enhancement visual TypeScript publicado como runtime derivado, sem alterar o domínio financeiro.

Continua registada a lacuna do Mercado: `market-experience.js` extrai `pid` da resposta Cesta para compor o ID do resultado, mas o objeto resultante ainda não preserva `pid` como propriedade nem `addProduct()` o persiste. Não corrigir sem teste específico de identidade.
