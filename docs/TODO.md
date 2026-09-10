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
- [x] Inspecionar o artefacto Pages publicado e confirmar `index.html`, estilos e scripts.
- [x] Confirmar navegação do Service Worker sem timeout antes do fallback.
- [x] Confirmar estado possível com `#vaultScreen` e `#app` simultaneamente ocultos durante a barreira inicial.
- [x] Criar revisão `75-startup1`.
- [x] Criar `v75-startup-guard.js` sem acesso a estado financeiro/IndexedDB/sync.
- [x] Manter o cofre visível com `aria-busy` quando cofre+shell ficariam ocultos.
- [x] Preservar o shell financeiro oculto até a barreira existente terminar.
- [x] Limitar navegação de rede a 4 s com `AbortController`.
- [x] Usar `index.html` em cache no timeout/erro.
- [x] Atualizar `index.html` em cache após navegação de rede bem-sucedida.
- [x] Devolver 503 legível se não houver rede nem cache.
- [x] Atualizar cache para sufixo `startup1`.
- [x] Incluir `v75-startup-guard.js` no bundle/Service Worker.
- [x] Adicionar `tests/safari-startup.test.cjs` e passo dedicado no CI.
- [x] Confirmar CI funcional da branch — run `34440532734`.
- [x] Confirmar CI após documentação — run `34440742219`.
- [x] Comparar branch com `main` e confirmar `behind 0`.
- [x] Integrar por fast-forward sem force no SHA `188c0820adff62540987fb6f8ef65c76ab9bf596`.
- [x] Confirmar CI completo de `main` — run `34440788510`.
- [x] Confirmar GitHub Pages — run `34440824303`.
- [ ] Revalidar no mesmo iPhone/Safari sem limpar IndexedDB/dados do site.

## P0 — Documentação desta correção

- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.
- [x] Registar CI e Pages da publicação.

## P1 — Revalidação física do arranque

- [ ] Abrir a URL em Safari com rede normal e confirmar carregamento sem branco prolongado.
- [ ] Repetir com rede degradada/instável e confirmar fallback após ~4 s quando o cache já existir.
- [ ] Desbloquear o cofre e confirmar estado **A preparar a aplicação com segurança…** quando a barreira inicial demorar.
- [ ] Confirmar que dados financeiros não aparecem antes do fim da barreira.
- [ ] Fechar/reabrir a PWA e confirmar comportamento idêntico.
- [ ] Confirmar que nenhuma validação exige limpar dados do Safari.

## P1 — Revalidação física do Mercado

- [ ] Confirmar cache com `catalog3` + `startup1`.
- [ ] Confirmar que fotografias já visíveis não desaparecem/reaparecem durante atualização de fundo.
- [ ] Confirmar ausência de flicker ao permanecer no Mercado por 30–60 s.
- [ ] Trocar categorias e filtros repetidamente e confirmar estabilidade dos cartões.
- [ ] Confirmar prioridade dos primeiros cartões.
- [ ] Confirmar **Fotografia a validar…** após a janela máxima quando necessário.
- [ ] Confirmar que o contador Pingo Doce deixa `0` quando existirem fotografias oficiais válidas.
- [ ] Confirmar imagem em cache sem atraso perceptível.
- [ ] Confirmar expurgo de imagem quebrada sem prender o cartão.
- [ ] Confirmar Pingo Doce sem fotografia de outro PID.
- [ ] Confirmar Continente correto.
- [ ] Confirmar rede lenta/offline sem bloqueio.
- [ ] Confirmar tema escuro, `prefers-reduced-motion` e ausência de overflow/layout shift relevante.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P1 — Cobertura do catálogo

- [ ] Medir SKUs Pingo Doce `ready/pending/missing` depois do runtime atualizado.
- [ ] Medir fotografias gerais e Pingo Doce por sessão.
- [ ] Identificar categorias com baixo recall apenas depois de estabilizado o pipeline visual.
- [ ] Revalidar `missing` com retry/backoff quando necessário.
- [ ] Não declarar 100% do catálogo sem fonte exaustiva/autorizada.

## P2 — Consolidação

- [ ] Após validação física, avaliar consolidação das camadas de Mercado.
- [ ] Avaliar integrar a guarda de arranque diretamente no fluxo funcional apenas se reduzir complexidade sem enfraquecer segurança.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Manter documentação sincronizada em cada alteração relevante.
