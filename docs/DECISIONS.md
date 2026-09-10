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

Data: 10 de setembro de 2026. Estado: aceite para o programa `v76`; fundação em `feat/v76-typescript-foundation`.

### Decisão

1. Destino: código-fonte funcional em TypeScript com `strict` ativo.
2. TypeScript é ferramenta de build/desenvolvimento; o browser continua a receber JavaScript.
3. Não introduzir React, Flutter, .NET MAUI ou outro framework durante a migração de linguagem.
4. Cada módulo JavaScript só é substituído depois de testes de paridade demonstrarem equivalência.
5. `STATE_VERSION`, schema persistido, algoritmos de cifragem e formato de sincronização não mudam apenas por causa da linguagem.
6. `any` não justificado não é aceite como estratégia de migração.
7. O Bloco 1 contém apenas configuração, contratos/tipos e typecheck; não entra no bundle Pages.

### Fundamento

A aplicação já possui grande superfície funcional e testes de regressão. Uma conversão massiva aumentaria o risco de quebrar cálculos, cofre, sincronização e PWA. A migração por blocos permite provar equivalência antes de cada substituição.

## D-065 — total de Mercado só pode ser rotulado exato com evidência completa

Data: 10 de setembro de 2026. Estado: aceite como regra de produto/contabilidade para v76.

### Decisão

Um total do Mercado só pode ser apresentado como **Exato** quando estiverem confirmados todos os fatores que alteram o valor final, incluindo:

- SKU/produto correto;
- quantidade ou peso real;
- preço válido para o retalhista/local/momento aplicável;
- promoção e respetivas condições;
- cartão/cupão/elegibilidade quando aplicável;
- regra fiscal/IVA quando necessária ao cálculo apresentado;
- ajustes posteriores identificados na fatura/talão.

Se algum destes fatores não estiver confirmado, o estado deve ser `Estimativa` ou `Preço por confirmar`.

### Consequência

A aplicação poderá reproduzir operações observáveis de uma passagem em caixa para planeamento e conferência, mas não se apresenta como POS proprietário e não processa pagamentos bancários apenas para imitar o supermercado.

## D-066 — imagens e logos não podem enfraquecer identidade, licença ou CSP

Data: 10 de setembro de 2026. Estado: aceite para v76.

### Decisão

- imagens de produto são enriquecimento visual e nunca prova de preço;
- preferência futura por correspondência GTIN/PID e fonte verificada;
- logos SVG de mercados só entram como assets locais com origem e direito de utilização verificados;
- não copiar SVGs de agregadores/sites aleatórios;
- não expandir CSP nem introduzir CDN apenas para branding;
- manter fallback textual/visual enquanto a origem do asset não estiver validada.

## Evidência técnica v76 — Bloco 1

Foram adicionados na branch de fundação:

- `package.json` com TypeScript apenas como `devDependency`;
- `tsconfig.json` estrito e `noEmit`;
- tipos nominais e schema persistido v5 em `src/types/`;
- contratos de Mercado que distinguem pesquisa/preço estimado/confirmado;
- testes de compilação em `src/type-tests/contracts.ts`;
- workflow `.github/workflows/typescript.yml`.

Durante o mapeamento foi identificada uma lacuna a rever no Bloco de Mercado: `market-experience.js` extrai o `pid` da resposta Cesta para compor o ID do resultado, mas o objeto resultante não preserva `pid` como propriedade nem `addProduct()` o persiste. Não corrigir esta discrepância sem teste específico de identidade.
