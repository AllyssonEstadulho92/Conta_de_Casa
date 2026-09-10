# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Baseline v75 preservada

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar `core.js`, `finance.js`, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM e sincronização.
- [x] Manter navegação móvel Início / Despesas / Mercado / Planeamento / Mais.
- [x] Manter drawer no lado direito e cabeçalho `75-header2`.
- [x] Manter `75-stability1`, `75-layout1`, `75-drawer2` e `75-featured1`.

## P0 — Pipeline de imagens

- [x] Biblioteca persistente por `marketId|pid` em `75-image-library1`.
- [x] Catálogo visual progressivo.
- [x] Biblioteca dedicada Pingo Doce em `75-pd-photo1`.
- [x] Resolver oficial não bloqueante `75-catalog2`.
- [x] Carregador prioritário `75-photo-loader2`.
- [x] Renderer incremental `75-catalog3` sem reconstrução destrutiva da grelha.
- [x] Manter limites de rede e suspensão offline/Save-Data/visibilidade.

## P0 — Ecrã branco no Safari/PWA

- [x] Rever a captura física e separar factos de causa provável.
- [x] Inspecionar o artefacto Pages publicado e confirmar que `index.html`, estilos e scripts existem.
- [x] Confirmar que a navegação do Service Worker tinha `fetch()` sem timeout antes do fallback.
- [x] Confirmar que o fluxo de entrada pode ocultar `#vaultScreen` e `#app` durante a barreira inicial.
- [x] Criar revisão `75-startup1`.
- [x] Criar `v75-startup-guard.js` sem acesso a estado financeiro/IndexedDB/sync.
- [x] Manter o cofre visível com `aria-busy` quando cofre+shell ficariam simultaneamente ocultos.
- [x] Preservar o shell financeiro oculto até a barreira existente terminar.
- [x] Limitar navegação de rede a 4 s com `AbortController`.
- [x] Usar `index.html` em cache no timeout/erro.
- [x] Atualizar a cópia de `index.html` em cache após navegação de rede bem-sucedida.
- [x] Devolver 503 legível se não houver rede nem cache.
- [x] Atualizar cache para sufixo `startup1`.
- [x] Incluir `v75-startup-guard.js` no bundle/Service Worker.
- [x] Adicionar `tests/safari-startup.test.cjs` e passo dedicado no CI.
- [x] Confirmar CI funcional da branch — run `34440532734`.
- [ ] Confirmar CI após documentação.
- [ ] Comparar branch com `main` e confirmar `behind 0`.
- [ ] Integrar por fast-forward sem force.
- [ ] Confirmar CI completo de `main`.
- [ ] Confirmar GitHub Pages no SHA integrado.
- [ ] Revalidar no mesmo iPhone/Safari sem limpar IndexedDB/dados do site.

## P0 — Documentação desta correção

- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.

## P1 — Revalidação física do Mercado

- [ ] Confirmar novo cache com `catalog3` + `startup1`.
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

- [ ] Após validação física, avaliar consolidação das camadas de Mercado numa implementação mais simples.
- [ ] Avaliar integrar a guarda de arranque diretamente no fluxo funcional apenas se isso reduzir complexidade sem enfraquecer a segurança.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Manter documentação sincronizada em cada alteração relevante.
