# Changelog Técnico — Conta de Casa

## 2026-09-09 — v75 `75-catalog2` + `75-photo-loader2`: correção do pipeline real de fotografias

### Evidência que originou a correção

Validação física no iPhone/Safari mostrou `Biblioteca Pingo Doce: 285 SKUs indexados · 0 fotografias oficiais` e vários cartões presos em **A carregar fotografia…**. O problema deixou de ser tratado como simples questão visual.

A sonda de CI conseguia, para um SKU conhecido, obter resposta do reader e localizar uma imagem Pingo Doce com PID exato. A investigação concentrou-se por isso no runtime entre a URL oficial encontrada e a persistência/apresentação no cartão.

### `75-catalog2`

- `market-catalog-image-resolver.js` passa para revisão `75-catalog2`;
- timeout do reader reduzido para 8 s;
- mantém validação estrita de página oficial, retalhista, path de imagem e PID;
- removido o segundo preflight visual bloqueante de até 10 s antes de devolver a referência;
- a referência validada pode ser persistida imediatamente;
- o carregamento real passa a ser comprovado no cartão que efetivamente apresenta a imagem;
- uma falha de transporte já não transforma automaticamente uma URL oficialmente identificada num falso negativo antes de a UI a tentar usar.

### `75-photo-loader2`

- `market-photo-loader.js` passa para revisão `75-photo-loader2`;
- loader só trabalha com `#page-market.page.active`;
- até 6 cartões visíveis recebem prioridade;
- `CDCMarketVisualCatalog.listCategory()` é reutilizado para obter o registo exato do SKU sem aceder diretamente à IndexedDB;
- consulta `CDCMarketImageLibrary` primeiro;
- SKU visível sem cache é resolvido imediatamente por `CDCOfficialMarketImages.resolve()`;
- resultado válido é persistido e aplicado com `loading='eager'`;
- evento `cdc:market-photo-ready` reduz espera entre resolução e atualização visual;
- ciclo visual passa de 850 ms/18 para 500 ms/24;
- após 12 s, o spinner deixa de rodar indefinidamente e o texto passa a **Fotografia a validar…**;
- retry por SKU limitado a 30 s;
- se o `<img>` falhar, a referência é removida de `75-image-library1` para permitir nova tentativa limpa;
- no primeiro carregamento desta revisão, `imagesToday` da biblioteca Pingo Doce é reposto uma única vez e marcado com `photoRuntimeRevision=75-photo-loader2`, evitando que falhas do runtime antigo bloqueiem a correção até ao dia seguinte;
- esta recuperação toca apenas na store `meta` de `conta-de-casa-pingo-doce-photo-library`.

### Segurança e dados

- `core.js` e `finance.js` não foram alterados;
- `STATE_VERSION = 5` permanece;
- nenhum preço, fatura, pagamento, PIN, token ou chave é lido/escrito pelo loader;
- identidade de fotografia continua `marketId|pid`;
- Pingo Doce continua restrito a URL oficial e imagem `static.pingodoce.pt/Sites-pingo-doce-master` com PID exato;
- o loader não faz `fetch()` próprio.

### Distribuição/QA

- `CATALOG_REV` passa a `75-catalog2`;
- `PHOTO_LOADER_REV` passa a `75-photo-loader2`;
- cache passa para `...-image-library1-catalog2-pd-photo1-photo-loader2`;
- `tests/market-visual-catalog.test.cjs`, `tests/market-photo-loader.test.cjs` e `tests/pingo-doce-photo-library.test.cjs` atualizados;
- CI final da branch `fix/v75-market-photo-runtime`: sucesso no SHA `f485fd4317ad0acbd2475f9ca86efed5b413bb76`;
- integração em `main`: fast-forward sem force no mesmo SHA;
- CI de `main`: sucesso no mesmo SHA;
- GitHub Pages: deploy concluído com sucesso no mesmo SHA;
- commits documentais posteriores não alteram o runtime publicado;
- eficácia no Safari/iPhone permanece dependente de nova validação física do cenário que mostrou `0 fotografias oficiais`.

---

## 2026-09-09 — v75 `75-pd-photo1` + `75-photo-loader1`: biblioteca Pingo Doce e primeiro carregador visual

- criada `pingo-doce-photo-library.js` com IndexedDB isolada e chave `pingo-doce|pid`;
- descoberta restrita a `search_products` com `stores:['pingodoce']`;
- 15 famílias e mais de 200 termos de descoberta;
- estados `pending|ready|missing`;
- limites de rede por sessão/dia;
- criado primeiro `market-photo-loader.js/css` com skeleton, spinner e **A carregar fotografia…**;
- fotografias em cache usam `loading='eager'`;
- revisão publicada e tecnicamente verde, mas a validação física posterior mostrou que a fila/resolução não produzia fotografias Pingo Doce `ready` de forma aceitável no iPhone, levando a `75-catalog2`/`75-photo-loader2`.

## 2026-09-09 — v75 `75-catalog1`: catálogo visual progressivo por categorias

- criado `market-visual-catalog.js/css`;
- criado `market-catalog-image-resolver.js`;
- catálogo local separado, indexado por `marketId|pid`;
- categorias de supermercado disponíveis antes de pesquisa manual;
- descoberta limitada de SKUs reais de Continente/Pingo Doce;
- preços não são persistidos no catálogo;
- **Ver preço atual** reutiliza a pesquisa viva existente;
- fotografias oficiais são resolvidas e entregues a `75-image-library1`;
- CI específico em `tests/market-visual-catalog.test.cjs`.

## 2026-09-09 — v75 `75-image-library1`: biblioteca persistente de fotografias oficiais

- criada `market-image-library.js`;
- IndexedDB própria `conta-de-casa-market-image-library`;
- identidade estrita `marketId|pid`;
- guarda apenas metadados e URL oficial validado;
- TTL de 45 dias;
- Continente e Pingo Doce validados por host/path/PID;
- nenhuma alteração ao estado financeiro.

## 2026-09-09 — v75 `75-featured1`: destaques do Mercado

- cartões mobile passam para carrossel horizontal largo;
- área de fotografia estável;
- nome em duas linhas;
- preço isolado;
- fallback vetorial quando imagem não existe;
- controlos anterior/seguinte e indicadores.

## 2026-09-09 — v75 `75-drawer2`: drawer alinhado com a identidade

- drawer mantém lado direito;
- gradiente petróleo/teal alinhado com o cabeçalho;
- menta usada apenas como acento;
- hambúrguer/X, swipe, Escape, foco e ARIA preservados.

## 2026-09-09 — v75 `75-layout1`: geometria transversal

- largura, margens, grelhas e ritmo vertical uniformizados;
- desktop compacto e largo tratados separadamente;
- formulários/cartões reduzem colunas antes de comprimir conteúdo;
- sem alteração ao núcleo financeiro.

## 2026-09-08 — v75 `75-stability1` e `75-header2`

- tipografia, safe areas, overflow, formulários, navegação, diálogos e estados de imagem estabilizados;
- cabeçalho móvel simplificado para hambúrguer+título e notificações;
- Mercado permanece terceiro destino da navegação inferior.

## Histórico anterior

As revisões anteriores permanecem preservadas no histórico Git e em `release-manifest.json`.
