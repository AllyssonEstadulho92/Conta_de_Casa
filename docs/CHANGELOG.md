# Changelog Técnico — Conta de Casa

## 2026-09-09 — v75 `75-photo-loader3`: hotfix de estabilidade Safari no Mercado

### Evidência

Depois da publicação de `75-photo-loader2`, a validação física no iPhone mostrou a mensagem nativa do Safari **“Um problema ocorreu repetidamente”** ao abrir `#market`.

Sem crash log WebKit do dispositivo, a exceção interna exata não é declarada como confirmada. A inspeção encontrou, contudo, pressão desnecessária no runtime do loader: observer global, scans não coalescidos, operações assíncronas sobrepostas, polling agressivo e sincronização Pingo Doce em paralelo na entrada.

### Alterações em `market-photo-loader.js`

- revisão passa para `75-photo-loader3`;
- `MutationObserver` deixa de observar `document.body` inteiro e passa a observar apenas `#page-market`;
- mutações geradas pelo próprio loader na media/status são ignoradas;
- scans passam a ser coalescidos com `scanQueued`, `scanRunning` e `scanPending`;
- hidratação global passa a ter exclusão mútua via `refreshPromise`;
- resolução prioritária passa a ter exclusão mútua via `warmPromise`;
- hidratação reduzida de até 18 para 8 cartões por passagem;
- prioridade reduzida de 6 para 4 cartões;
- os cartões prioritários são resolvidos sequencialmente para reduzir picos de CPU/rede;
- polling reduzido de 500 ms/24 para 1000 ms/12;
- sincronização Pingo Doce deixa de arrancar em paralelo: é adiada 5 s/idle e limitada a 1 seed;
- `warmPending()` deixa de ser chamado pelo loader na entrada;
- cooldown de 30 s, `loading='eager'`, `forget()` em erro e **Fotografia a validar…** aos 12 s permanecem;
- loader continua sem `fetch()` próprio e sem acesso ao estado financeiro.

### Distribuição

- `PHOTO_LOADER_REV=75-photo-loader3`;
- Service Worker usa cache `...-catalog2-pd-photo1-photo-loader3`;
- `tests/market-photo-loader.test.cjs` passa a verificar limites, coalescência e ausência do observer global;
- `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` atualizados;
- integração/publicação permanece condicionada a CI verde da branch, fast-forward, CI de `main`, Pages e nova validação física no iPhone.

### Critério de aceitação físico

Primeiro: `#market` deve abrir e permanecer estável no Safari. Só depois se mede throughput/contador de fotografias Pingo Doce. Estabilidade passa a ter prioridade sobre velocidade de enriquecimento visual.

---

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
- no primeiro carregamento desta revisão, `imagesToday` da biblioteca Pingo Doce é reposto uma única vez e marcado com `photoRuntimeRevision=75-photo-loader2`;
- esta recuperação toca apenas na store `meta` de `conta-de-casa-pingo-doce-photo-library`.

### Segurança e dados

- `core.js` e `finance.js` não foram alterados;
- `STATE_VERSION = 5` permanece;
- nenhum preço, fatura, pagamento, PIN, token ou chave é lido/escrito pelo loader;
- identidade de fotografia continua `marketId|pid`;
- Pingo Doce continua restrito a URL oficial e imagem oficial com PID exato;
- o loader não faz `fetch()` próprio.

### Distribuição/QA

- `CATALOG_REV` passa a `75-catalog2`;
- `PHOTO_LOADER_REV` passa a `75-photo-loader2`;
- cache passa para `...-image-library1-catalog2-pd-photo1-photo-loader2`;
- CI da branch, integração fast-forward, CI de `main` e GitHub Pages concluíram com sucesso no runtime SHA `f485fd4317ad0acbd2475f9ca86efed5b413bb76`;
- a validação física posterior revelou o crash do Safari, originando `75-photo-loader3`.

---

## 2026-09-09 — v75 `75-pd-photo1` + `75-photo-loader1`: biblioteca Pingo Doce e primeiro carregador visual

- criada `pingo-doce-photo-library.js` com IndexedDB isolada e chave `pingo-doce|pid`;
- descoberta restrita a `search_products` com `stores:['pingodoce']`;
- 15 famílias e mais de 200 termos de descoberta;
- estados `pending|ready|missing`;
- limites de rede por sessão/dia;
- criado primeiro `market-photo-loader.js/css` com skeleton, spinner e **A carregar fotografia…**;
- fotografias em cache usam `loading='eager'`.

## 2026-09-09 — v75 `75-catalog1`: catálogo visual progressivo por categorias

- criado `market-visual-catalog.js/css`;
- criado `market-catalog-image-resolver.js`;
- catálogo local separado, indexado por `marketId|pid`;
- categorias de supermercado disponíveis antes de pesquisa manual;
- descoberta limitada de SKUs reais de Continente/Pingo Doce;
- preços não são persistidos no catálogo;
- **Ver preço atual** reutiliza a pesquisa viva existente.

## 2026-09-09 — v75 `75-image-library1`: biblioteca persistente de fotografias oficiais

- criada `market-image-library.js`;
- IndexedDB própria `conta-de-casa-market-image-library`;
- identidade estrita `marketId|pid`;
- guarda apenas metadados e URL oficial validado;
- TTL de 45 dias;
- nenhuma alteração ao estado financeiro.

## 2026-09-09 — v75 `75-featured1`: destaques do Mercado

- cartões mobile passam para carrossel horizontal largo;
- área de fotografia estável;
- nome em duas linhas;
- preço isolado;
- fallback vetorial quando imagem não existe.

## 2026-09-09 — v75 `75-drawer2`: drawer alinhado com a identidade

- drawer mantém lado direito;
- gradiente petróleo/teal alinhado com o cabeçalho;
- hambúrguer/X, swipe, Escape, foco e ARIA preservados.

## 2026-09-09 — v75 `75-layout1`: geometria transversal

- largura, margens, grelhas e ritmo vertical uniformizados;
- sem alteração ao núcleo financeiro.

## 2026-09-08 — v75 `75-stability1` e `75-header2`

- tipografia, safe areas, overflow, formulários, navegação e diálogos estabilizados;
- cabeçalho móvel simplificado;
- Mercado permanece terceiro destino da navegação inferior.

## Histórico anterior

As revisões anteriores permanecem preservadas no histórico Git e em `release-manifest.json`.
