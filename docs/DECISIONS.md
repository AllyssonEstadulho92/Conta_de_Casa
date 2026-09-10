# Decisões Técnicas — Conta de Casa

Atualizado: 10 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## Decisões estruturais vigentes

- Estado financeiro local-first separado de apresentação e catálogos.
- Valores monetários em cêntimos e `STATE_VERSION = 5`.
- Cofre PBKDF2-SHA-256 + AES-GCM; `PBKDF2_ITERATIONS = 250000`.
- Fotografias não são prova de preço nem de transação.
- `marketId|pid` é a identidade canónica de fotografia/SKU.
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

Data: 10 de setembro de 2026. Estado: aceite na branch `fix/v75-market-part3` como `75-market1`.

### Factos

- o browser de produtos cria itens com `estimatedCents=product.priceCents`, `actualCents=0` e `purchased=false`;
- `render.js` já cria um input real com `data-market-actual` e `events.js` já possui o handler delegado que valida e guarda esse valor;
- `market-shopping-focus.js` movia `.market-mobile-real` para o disclosure `Detalhes`;
- ao marcar um item como comprado, o cartão também passa ao grupo recolhido `Comprados`;
- consequentemente, o estado `purchased=true` + `actualCents<=0` podia esconder a ação necessária para substituir a estimativa pelo preço pago.

### Decisão

1. Criar `v75-market-flow.js/css` revisão `75-market1` como camada exclusivamente de apresentação.
2. Não criar novo input nem novo handler financeiro. Reutilizar o `.market-mobile-real` e `data-market-actual` já existentes.
3. Quando um item estiver comprado e sem preço real, mover o bloco existente para fora de `Detalhes`, permanecendo dentro de `#marketList` para manter event delegation.
4. Abrir o grupo `Comprados` automaticamente enquanto existir pelo menos um item com preço por confirmar.
5. Expor estados visuais `Por comprar`, `Preço por confirmar` e `Comprado`.
6. Qualificar o valor compacto como `Estimativa total`, `Estimativa provisória` ou `Total contabilizado` para não confundir estimativa com valor pago.
7. Distinguir pesquisa live de produtos da pesquisa que apenas filtra a lista, usando `Pesquisar na minha lista…` para `#marketSearch`.
8. Tornar Estado/Categoria/Ordenar visíveis no mobile sem alterar valores nem handlers.
9. No browser live, corrigir o cartão para três colunas explícitas — fotografia, conteúdo, ação — e rotular o preço como `Preço pesquisado`.
10. A ação de adicionar mantém `data-market-add-product`; ganha apenas rótulo visível quando houver espaço.
11. `CDCAssetLoader` pode acompanhar imagens genéricas do browser live, mas não substitui a cadeia especializada `marketId|pid`/`75-photo-loader3` do catálogo.
12. No catálogo progressivo, apenas espelhar estado de carregamento para `aria-busy`; não alterar retry, cache, fontes oficiais ou resolução.
13. Scanner/código de barras permanece intocado salvo erro funcional comprovado.

### Fundamento

A próxima ação financeira necessária deve estar visível no momento em que se torna necessária. Promover o controlo já existente evita duplicar lógica ou criar um segundo caminho de persistência, ao mesmo tempo que mantém a distinção contabilística entre estimativa e preço real.

### Segurança

`75-market1` não chama `commit()`/`saveState()`, não atribui `estimatedCents`, `actualCents`, `quantity` ou `purchased`, não altera CSP e não adiciona endpoints. O núcleo financeiro, PIN, PBKDF2, AES-GCM, IndexedDB, QR, scanner e sincronização permanecem inalterados.

## Evidência técnica atual

A Parte 3 parte de `main` no SHA `4e130708de2b76eefe56d04e0e5a03d49d431446`. O CI da branch ficou verde no run `34481330929` antes da atualização documental final. Integração em `main` continua condicionada a CI final verde, `behind 0`, revisão do PR e confirmação posterior do GitHub Pages.
