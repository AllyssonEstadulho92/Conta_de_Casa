# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — Baseline v75 preservada

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar `core.js`, `finance.js`, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM e sincronização.
- [x] Manter navegação móvel Início / Despesas / Mercado / Planeamento / Mais.
- [x] Manter drawer no lado direito e cabeçalho `75-header2`.
- [x] Manter `75-stability1`, `75-layout1`, `75-drawer2` e `75-featured1`.

## P0 — Biblioteca e catálogo

- [x] Biblioteca persistente por `marketId|pid` em `75-image-library1`.
- [x] Catálogo visual progressivo por categorias em `75-catalog1`.
- [x] Biblioteca dedicada Pingo Doce em `75-pd-photo1`.
- [x] Mais de 200 termos / 15 famílias para descoberta Pingo Doce.
- [x] Não guardar preços no catálogo visual.
- [x] Manter limites de rede e suspensão offline/Save-Data/visibilidade.

## P0 — Bug real iPhone: `0 fotografias oficiais`

Evidência física: 285 SKUs Pingo Doce indexados, 0 fotografias oficiais e cartões presos em **A carregar fotografia…**.

- [x] Inspecionar pipeline real desde catálogo → página oficial → resolver → biblioteca → cartão.
- [x] Confirmar que a sonda CI encontra resultado Pingo Doce e imagem exata em fonte conhecida.
- [x] Identificar preflight `new Image()` bloqueante de até 10 s no resolvedor direto.
- [x] Identificar que `75-photo-loader1` não priorizava cartões visíveis.
- [x] Identificar risco de orçamento persistido `imagesToday` esgotado por falsos negativos antigos.

## P0 — `75-catalog2`

- [x] Manter `safeProductUrl()` antes de qualquer resolução.
- [x] Manter `safeOfficialImageUrl()` com host/path/PID exatos.
- [x] Reduzir timeout do reader direto para 8 s.
- [x] Remover o segundo `new Image()` bloqueante do resolvedor direto.
- [x] Transferir a prova de transporte real para o componente que apresenta `<img>`.
- [x] Atualizar teste para garantir ausência do preflight e preservação dos validadores oficiais.
- [x] Atualizar versão de distribuição `CATALOG_REV=75-catalog2`.

## P0 — `75-photo-loader2`

- [x] Trabalhar apenas quando `#page-market.page.active` está ativo.
- [x] Priorizar até 6 cartões visíveis.
- [x] Obter registos por `CDCMarketVisualCatalog.listCategory()`.
- [x] Consultar primeiro `CDCMarketImageLibrary`.
- [x] Resolver imediatamente SKU visível sem cache através de `CDCOfficialMarketImages.resolve()`.
- [x] Persistir apenas resultado aceite pela biblioteca geral.
- [x] Usar `loading='eager'` para fotografia visível resolvida.
- [x] Emitir/escutar `cdc:market-photo-ready` para atualizar a UI sem esperar pelo próximo ciclo.
- [x] Reduzir intervalo visual para 500 ms e limitar a 24 ciclos.
- [x] Após 12 s, substituir spinner contínuo por **Fotografia a validar…**.
- [x] Aplicar cooldown de 30 s por SKU.
- [x] Se `<img>` falhar, remover referência da biblioteca com `forget()`.
- [x] Libertar uma única vez `imagesToday` herdado do runtime antigo, marcado por `photoRuntimeRevision=75-photo-loader2`.
- [x] Garantir que essa recuperação só toca na store `meta` da base Pingo Doce.
- [x] Manter loader sem `fetch()` próprio e sem referências financeiras.
- [x] Atualizar testes do loader2.

## P0 — Distribuição e QA desta correção

- [x] Atualizar Service Worker para `...-catalog2-pd-photo1-photo-loader2`.
- [x] Atualizar `scripts/prepare-pages.cjs` para `75-catalog2` / `75-photo-loader2`.
- [x] Atualizar testes do catálogo, loader e biblioteca Pingo Doce para o novo cache.
- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.
- [ ] Confirmar CI final verde da branch `fix/v75-market-photo-runtime`.
- [ ] Comparar branch final com `main`: `ahead`, `behind 0`.
- [ ] Integrar por fast-forward sem force.
- [ ] Confirmar CI de `main` no SHA integrado.
- [ ] Confirmar GitHub Pages no mesmo SHA.

## P1 — Revalidação física iPhone/Safari/PWA

- [ ] Confirmar novo cache `catalog2-pd-photo1-photo-loader2`.
- [ ] Confirmar que **A carregar fotografia…** surge de imediato apenas enquanto necessário.
- [ ] Confirmar que os primeiros cartões visíveis são os primeiros a resolver.
- [ ] Confirmar que **Fotografia a validar…** substitui o spinner após janela máxima.
- [ ] Confirmar que o contador Pingo Doce deixa `0` quando existem fotografias oficiais válidas.
- [ ] Confirmar que fotografia em cache surge sem atraso perceptível.
- [ ] Confirmar que imagem quebrada é expurgada e não prende o cartão.
- [ ] Confirmar que Pingo Doce nunca recebe fotografia de outro PID.
- [ ] Confirmar que Continente continua correto.
- [ ] Confirmar rede lenta/offline sem bloqueio da página.
- [ ] Confirmar tema escuro e `prefers-reduced-motion`.
- [ ] Confirmar ausência de overflow horizontal/layout shift relevante.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P1 — Cobertura do catálogo

- [ ] Medir SKUs Pingo Doce `ready/pending/missing` depois do runtime2.
- [ ] Medir fotografias gerais e Pingo Doce por sessão.
- [ ] Identificar categorias com baixo recall apenas depois de corrigido o pipeline de resolução.
- [ ] Revalidar `missing` com política de retry/backoff quando necessário.
- [ ] Não declarar 100% do catálogo sem fonte exaustiva/autorizada.

## P2 — Consolidação

- [ ] Após validação física, avaliar absorção de `75-catalog2`/`75-photo-loader2` numa camada de Mercado consolidada.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Manter documentação sincronizada em cada alteração relevante.
