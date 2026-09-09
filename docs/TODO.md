# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — Baseline v75 preservada

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar `core.js`, `finance.js`, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM e sincronização.
- [x] Manter navegação móvel Início / Despesas / Mercado / Planeamento / Mais.
- [x] Manter drawer no lado direito e cabeçalho `75-header2`.
- [x] Manter `75-stability1`, `75-layout1`, `75-drawer2` e `75-featured1`.

## P0 — Pipeline de imagens anterior

- [x] Biblioteca persistente por `marketId|pid` em `75-image-library1`.
- [x] Catálogo visual progressivo.
- [x] Biblioteca dedicada Pingo Doce em `75-pd-photo1`.
- [x] Resolver oficial não bloqueante `75-catalog2`.
- [x] Carregador prioritário `75-photo-loader2`.
- [x] Manter limites de rede e suspensão offline/Save-Data/visibilidade.

## P0 — Bug novo: fotografias/cartões a piscar

Evidência: captura física no iPhone mostra a zona da fotografia a piscar enquanto o catálogo continua a trabalhar em background.

- [x] Inspecionar o renderer real do catálogo e não assumir causa CSS.
- [x] Confirmar que `scheduleImageWarm()` chamava `renderProducts()` depois de cada fotografia.
- [x] Confirmar que `renderProducts()` eliminava a grelha com `grid.replaceChildren()`.
- [x] Confirmar impacto: `<img>` já carregados eram destruídos e recriados.
- [x] Criar revisão `75-catalog3`.
- [x] Reconciliar cartões por `marketId|pid`.
- [x] Preservar o mesmo nó DOM/media para produtos ainda presentes.
- [x] Remover apenas cartões obsoletos.
- [x] Criar apenas cartões realmente novos.
- [x] Retirar `renderProducts()` do aquecimento periódico de imagens.
- [x] Emitir `cdc:market-photo-ready` quando background persiste uma fotografia.
- [x] Reutilizar `75-photo-loader2` para hidratar o cartão existente.
- [x] Atualizar `CATALOG_REV` para `75-catalog3`.
- [x] Atualizar cache do Service Worker para `catalog3`.
- [x] Adicionar regressão que impede reconstrução destrutiva da grelha.
- [x] Atualizar teste Pingo Doce para o novo identificador de cache.
- [x] Confirmar CI completo da branch no SHA `501c21dca60cffc32489768238c5f308e1785e34`.

## P0 — Documentação da correção

- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.

## P0 — Integração/publicação `75-catalog3`

- [ ] Reconfirmar CI da branch depois dos commits documentais.
- [ ] Comparar branch com `main` e confirmar `behind 0` antes da integração.
- [ ] Integrar por fast-forward sem force.
- [ ] Confirmar CI completo de `main` no SHA integrado.
- [ ] Confirmar GitHub Pages no SHA integrado.
- [ ] Atualizar documentação com o SHA de publicação confirmado.

## P1 — Revalidação física iPhone/Safari/PWA

- [ ] Confirmar novo cache `catalog3-pd-photo1-photo-loader2`.
- [ ] Confirmar que fotografias já visíveis não desaparecem/reaparecem durante atualização de fundo.
- [ ] Confirmar ausência de flicker ao permanecer no Mercado por pelo menos 30–60 s.
- [ ] Trocar categorias e filtros repetidamente e confirmar estabilidade dos cartões.
- [ ] Confirmar que os primeiros cartões continuam a receber prioridade de fotografia.
- [ ] Confirmar que **Fotografia a validar…** substitui o spinner após a janela máxima quando necessário.
- [ ] Confirmar que o contador Pingo Doce deixa `0` quando existem fotografias oficiais válidas.
- [ ] Confirmar que imagem em cache surge sem atraso perceptível.
- [ ] Confirmar que imagem quebrada é expurgada e não prende o cartão.
- [ ] Confirmar que Pingo Doce nunca recebe fotografia de outro PID.
- [ ] Confirmar que Continente continua correto.
- [ ] Confirmar rede lenta/offline sem bloqueio da página.
- [ ] Confirmar tema escuro e `prefers-reduced-motion`.
- [ ] Confirmar ausência de overflow horizontal/layout shift relevante.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P1 — Cobertura do catálogo

- [ ] Medir SKUs Pingo Doce `ready/pending/missing` depois do runtime atualizado.
- [ ] Medir fotografias gerais e Pingo Doce por sessão.
- [ ] Identificar categorias com baixo recall só depois de estabilizado o pipeline visual.
- [ ] Revalidar `missing` com política de retry/backoff quando necessário.
- [ ] Não declarar 100% do catálogo sem fonte exaustiva/autorizada.

## P2 — Consolidação

- [ ] Após validação física, avaliar consolidação de `75-catalog2`/`75-catalog3`/`75-photo-loader2` numa camada de Mercado única e mais simples.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Avaliar serialização explícita de renderizações concorrentes se a validação física ou profiling mostrar chamadas sobrepostas.
- [ ] Manter documentação sincronizada em cada alteração relevante.
