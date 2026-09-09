# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — Baseline v75 preservada

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar `core.js`, `finance.js`, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM e sincronização.
- [x] Manter navegação móvel Início / Despesas / Mercado / Planeamento / Mais.
- [x] Manter drawer no lado direito e cabeçalho v75.

## P0 — Biblioteca e catálogo

- [x] Biblioteca persistente por `marketId|pid` em `75-image-library1`.
- [x] Catálogo visual progressivo por categorias.
- [x] Biblioteca dedicada Pingo Doce `75-pd-photo1`.
- [x] Mais de 200 termos / 15 famílias para descoberta Pingo Doce.
- [x] Não guardar preços no catálogo visual.
- [x] Manter limites de rede e suspensão offline/Save-Data/visibilidade.

## P0 — Auditoria “biblioteca só carrega e não abre”

- [x] Confirmar no código que **Atualizar biblioteca** era apenas sincronização e não existia ação de abertura.
- [x] Confirmar que `syncNow()` pode executar chamadas externas sequenciais e manter o botão ocupado.
- [x] Separar abertura local de sincronização.
- [x] Criar `75-pd-view1` com botão **Abrir biblioteca**.
- [x] Abrir a biblioteca sem rede, diretamente da IndexedDB Pingo Doce.
- [x] Paginar em 12 itens por página.
- [x] Adicionar pesquisa por nome/PID.
- [x] Adicionar filtros Todos / Com fotografia / Pendentes / Sem fotografia.
- [x] Usar apenas fotografias já validadas em `75-image-library1` e `loading='lazy'`.
- [x] Adicionar fecho por botão, backdrop e Escape.
- [x] Adicionar layout full-screen no mobile e modal no desktop.
- [x] Adicionar testes e distribuição ao bundle/Service Worker.

## P0 — Crash real Safari em `/#market`

- [x] Registar captura com **“Um problema ocorreu repetidamente”**.
- [x] Identificar excesso de trabalho no `75-photo-loader2` como risco provável: 18 hidratações, 6 prioridades, polling 500 ms × 24, observer global e sync paralelo.
- [x] Criar `75-photo-loader3` limitado ao viewport.
- [x] Priorizar 2 cartões no mobile / 4 no desktop.
- [x] Reduzir polling para 1200 ms × 10.
- [x] Limitar MutationObserver a `#page-market`.
- [x] Remover `warmPending()+syncNow()` automático na entrada do Mercado.
- [x] Quarentena local de 30 s para imagem quebrada.
- [x] Atualizar cache para `...pd-photo1-pd-view1-photo-loader3`.

## P0 — QA/publicação

- [x] CI da primeira versão `75-photo-loader3` passou integralmente.
- [x] Novo teste `pingo-doce-library-view.test.cjs` criado e incluído no CI.
- [ ] Confirmar CI final da branch depois de documentação final.
- [ ] Comparar branch com `main` e confirmar `behind 0`.
- [ ] Integrar por fast-forward sem force.
- [ ] Confirmar CI de `main` no SHA integrado.
- [ ] Confirmar GitHub Pages no mesmo SHA.

## P1 — Validação física obrigatória no iPhone

- [ ] Confirmar que `/#market` deixa de provocar crash repetido do Safari.
- [ ] Confirmar botão **Abrir biblioteca** visível junto de **Atualizar**.
- [ ] Confirmar abertura imediata da biblioteca mesmo sem rede.
- [ ] Confirmar 12 produtos no máximo por lote inicial.
- [ ] Confirmar pesquisa e filtros sem bloqueio.
- [ ] Confirmar que imagens em cache aparecem e imagens ausentes mostram fallback.
- [ ] Confirmar que **Atualizar** pode trabalhar sem impedir a abertura/fecho da biblioteca.
- [ ] Confirmar ausência de overflow horizontal e layout shift relevante.
- [ ] Confirmar Continente permanece funcional.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P1 — Cobertura de fotografias

- [ ] Depois de estabilizar o Safari, medir `ready/pending/missing` do Pingo Doce.
- [ ] Investigar apenas então por que categorias continuam com baixa cobertura.
- [ ] Não declarar 100% do catálogo sem fonte exaustiva/autorizada.

## P2 — Consolidação

- [ ] Após validação física, avaliar absorção das camadas `75-photo-loader3` e `75-pd-view1` numa arquitetura de Mercado consolidada.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Manter documentação sincronizada em cada alteração relevante.
