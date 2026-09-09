# Changelog Técnico — Conta de Casa

## 2026-09-09 — v75 `75-catalog3`: renderer incremental para eliminar flicker de fotografias

### Evidência

Uma nova validação física no iPhone mostrou a área de fotografia do catálogo a piscar durante atualizações automáticas.

A análise confirmou uma causa estrutural no renderer, distinta do problema de transporte tratado por `75-catalog2`/`75-photo-loader2`: `scheduleImageWarm()` chamava `renderProducts()` depois de resolver uma fotografia e `renderProducts()` começava por `grid.replaceChildren()`. Isso destruía todos os cartões e `<img>` existentes antes de os reconstruir de forma assíncrona.

### Correção

- `market-visual-catalog.js` passa para revisão `75-catalog3`;
- o renderer deixa de limpar a grelha inteira quando existem produtos;
- cartões são reconciliados pela chave `marketId|pid`;
- o mesmo nó DOM é preservado enquanto o mesmo SKU continuar presente;
- apenas cartões obsoletos são removidos;
- novos nós são criados apenas para novos SKUs;
- loja, nome, embalagem e `aria-label` são atualizados sem substituir a área de fotografia;
- `scheduleImageWarm()` deixa de chamar `renderProducts()` após cada fotografia;
- quando uma fotografia de background é persistida, o catálogo emite `cdc:market-photo-ready`;
- `75-photo-loader2` hidrata o cartão já existente em vez de depender de uma reconstrução total.

### Distribuição

- `CATALOG_REV` passa para `75-catalog3`;
- cache passa para `...-image-library1-catalog3-pd-photo1-photo-loader2`;
- teste do catálogo impede regressão para `grid.replaceChildren()` vazio no caminho normal e impede `renderProducts()` dentro do aquecimento periódico;
- teste da biblioteca Pingo Doce foi alinhado ao identificador `catalog3`.

### Segurança e dados

- `market-catalog-image-resolver.js` mantém a lógica segura `75-catalog2`;
- host/path/PID continuam validados antes da persistência de imagem;
- `core.js`, `finance.js`, pagamentos, faturas, PIN, cifragem e sincronização não foram alterados;
- a mudança é limitada à estratégia de renderização e propagação de estado visual.

### QA e publicação

- primeiro CI da branch confirmou sintaxe, finanças e o novo teste `75-catalog3`, mas parou num teste de distribuição Pingo Doce que ainda esperava o nome de cache `catalog2`;
- a expectativa foi atualizada para `catalog3`;
- CI completo da branch: sucesso;
- integração em `main`: fast-forward sem force para `6dd4eafa947bf83e847f657ab9e155717d3971bc`;
- CI de `main` run `34414686159`: sucesso;
- GitHub Pages run `34414730220`: sucesso no runtime testado;
- permanecem pendentes apenas os testes físicos no mesmo iPhone/Safari/PWA para encerrar o defeito.

---

## 2026-09-09 — v75 `75-catalog2` + `75-photo-loader2`: correção do pipeline real de fotografias

### Evidência que originou a correção

Validação física no iPhone/Safari mostrou `Biblioteca Pingo Doce: 285 SKUs indexados · 0 fotografias oficiais` e vários cartões presos em **A carregar fotografia…**. O problema deixou de ser tratado como simples questão visual.

A sonda de CI conseguia, para um SKU conhecido, obter resposta do reader e localizar uma imagem Pingo Doce com PID exato. A investigação concentrou-se no runtime entre a URL oficial encontrada e a persistência/apresentação no cartão.

### `75-catalog2`

- timeout do reader reduzido para 8 s;
- validação estrita de página oficial, retalhista, path de imagem e PID preservada;
- removido o segundo preflight visual bloqueante de até 10 s antes de devolver a referência;
- a referência validada pode ser persistida imediatamente;
- disponibilidade real passa a ser comprovada pelo `<img>` que apresenta a imagem.

### `75-photo-loader2`

- loader trabalha apenas com `#page-market.page.active`;
- até 6 cartões renderizados recebem prioridade;
- `CDCMarketVisualCatalog.listCategory()` fornece o registo exato do SKU;
- cache geral é consultada primeiro;
- SKU sem cache pode ser resolvido imediatamente por `CDCOfficialMarketImages.resolve()`;
- resultado válido é persistido e aplicado com `loading='eager'`;
- evento `cdc:market-photo-ready` acelera a atualização;
- ciclo visual passa a 500 ms/24;
- após 12 s o texto passa para **Fotografia a validar…**;
- retry por SKU limitado a 30 s;
- imagem quebrada é expurgada da biblioteca;
- orçamento `imagesToday` antigo é libertado uma única vez para a revisão runtime2.

### Publicação original

- CI da branch: sucesso;
- integração em `main`: fast-forward sem force no SHA `f485fd4317ad0acbd2475f9ca86efed5b413bb76`;
- CI de `main`: sucesso;
- GitHub Pages: sucesso;
- eficácia no Safari permaneceu dependente de hardware real, onde depois foi identificado o flicker de renderer tratado por `75-catalog3`.

---

## 2026-09-09 — v75 `75-pd-photo1` + `75-photo-loader1`

- criada `pingo-doce-photo-library.js` com IndexedDB isolada e chave `pingo-doce|pid`;
- descoberta restrita ao Pingo Doce;
- 15 famílias e mais de 200 termos de descoberta;
- estados `pending|ready|missing`;
- limites de rede por sessão/dia;
- primeiro loader visual com skeleton/spinner;
- validação física posterior mostrou que a fila/resolução ainda não era suficiente, levando a `75-catalog2`/`75-photo-loader2`.

## 2026-09-09 — v75 `75-catalog1`: catálogo visual progressivo

- criado `market-visual-catalog.js/css`;
- criado `market-catalog-image-resolver.js`;
- índice separado por `marketId|pid`;
- categorias de supermercado antes da pesquisa manual;
- descoberta limitada de SKUs reais Continente/Pingo Doce;
- preços não persistidos;
- **Ver preço atual** reutiliza pesquisa viva existente.

## 2026-09-09 — v75 `75-image-library1`

- criada biblioteca persistente de fotografias oficiais;
- IndexedDB própria `conta-de-casa-market-image-library`;
- identidade estrita `marketId|pid`;
- apenas metadados e URL oficial validado;
- TTL de 45 dias;
- nenhuma alteração ao estado financeiro.

## 2026-09-09 — v75 `75-featured1`

- cartões mobile em carrossel horizontal largo;
- área de fotografia estável;
- nome em duas linhas;
- preço isolado;
- fallback vetorial quando não existe fotografia.

## 2026-09-09 — v75 `75-drawer2`

- drawer mantém lado direito;
- gradiente petróleo/teal alinhado com o cabeçalho;
- hambúrguer/X, swipe, Escape, foco e ARIA preservados.

## 2026-09-09 — v75 `75-layout1`

- largura, margens, grelhas e ritmo vertical uniformizados;
- desktop compacto/largo tratados separadamente;
- formulários/cartões reduzem colunas antes de comprimir conteúdo;
- sem alteração ao núcleo financeiro.

## 2026-09-08 — v75 `75-stability1` e `75-header2`

- tipografia, safe areas, overflow, formulários, navegação, diálogos e estados de imagem estabilizados;
- cabeçalho móvel simplificado para hambúrguer+título e notificações;
- Mercado permanece terceiro destino da navegação inferior.

## Histórico anterior

As revisões anteriores permanecem preservadas no histórico Git e em `release-manifest.json`.
