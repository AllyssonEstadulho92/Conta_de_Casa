# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — Baseline v75 preservada

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar `core.js`, `finance.js`, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM e sincronização.
- [x] Manter navegação móvel Início / Despesas / Mercado / Planeamento / Mais.
- [x] Manter drawer no lado direito e cabeçalho `75-header2`.
- [x] Manter `75-stability1`, `75-layout1`, `75-drawer2` e `75-featured1`.

## P0 — Pipeline de fotografias existente

- [x] Biblioteca persistente por `marketId|pid` em `75-image-library1`.
- [x] Catálogo visual progressivo em `75-catalog1`.
- [x] Resolvedor `75-catalog2` sem preflight visual duplicado.
- [x] Biblioteca dedicada Pingo Doce em `75-pd-photo1`.
- [x] Não guardar preços no catálogo visual.
- [x] Manter validação oficial por retalhista/PID.

## P0 — Incidente real Safari: página `#market` termina repetidamente

Evidência física: Safari/iPhone apresenta **“Um problema ocorreu repetidamente”** ao abrir o Mercado após `75-photo-loader2`.

- [x] Registar que a mensagem é do browser e não da UI da aplicação.
- [x] Não declarar exceção WebKit exata sem crash log do dispositivo.
- [x] Inspecionar `market-photo-loader.js`.
- [x] Identificar observer global em `document.body`/`subtree`.
- [x] Identificar scans não coalescidos.
- [x] Identificar ausência de mutex para hidratação/aquecimento.
- [x] Identificar polling 500 ms/24 e trabalho Pingo Doce paralelo na entrada.

## P0 — `75-photo-loader3`

- [x] Observar apenas `#page-market`.
- [x] Ignorar mutações produzidas pelo próprio loader dentro da media/status.
- [x] Coalescer scans com `scanQueued`, `scanRunning` e `scanPending`.
- [x] Serializar hidratação global com `refreshPromise`.
- [x] Serializar resolução prioritária com `warmPromise`.
- [x] Limitar hidratação a 8 cartões/passagem.
- [x] Limitar prioridade a 4 cartões.
- [x] Processar resolução prioritária sequencialmente.
- [x] Reduzir polling para 1000 ms/12 ciclos.
- [x] Adiar `syncNow()` Pingo Doce 5 s/idle e limitar a 1 seed.
- [x] Retirar `warmPending()` da entrada do loader.
- [x] Manter cooldown de 30 s.
- [x] Manter **Fotografia a validar…** após 12 s.
- [x] Manter `forget()` para imagem que falhe no `<img>`.
- [x] Manter loader sem `fetch()` próprio e sem referências financeiras.
- [x] Atualizar teste específico do loader.

## P0 — Distribuição `75-photo-loader3`

- [x] Atualizar `PHOTO_LOADER_REV` para `75-photo-loader3`.
- [x] Atualizar Service Worker para cache `...-photo-loader3`.
- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.
- [ ] Confirmar CI verde da branch `fix/v75-market-safari-crash`.
- [ ] Comparar branch final com `main` e confirmar `behind 0`.
- [ ] Integrar por fast-forward sem force.
- [ ] Confirmar CI de `main` no SHA integrado.
- [ ] Confirmar GitHub Pages no SHA integrado.

## P0 — Revalidação física iPhone/Safari/PWA

Ordem obrigatória:

- [ ] Confirmar que `#market` abre sem a mensagem **“Um problema ocorreu repetidamente”**.
- [ ] Manter a página Mercado aberta durante pelo menos 60 s sem crash/reload involuntário.
- [ ] Trocar entre duas categorias e Continente/Pingo Doce sem crash.
- [ ] Confirmar que scroll permanece fluido e o iPhone não aquece de forma anormal durante o teste curto.
- [ ] Só depois medir `SKUs indexados` / `fotografias oficiais`.
- [ ] Confirmar que fotografias em cache aparecem sem atraso relevante.
- [ ] Confirmar que **Fotografia a validar…** substitui o spinner prolongado.
- [ ] Confirmar que imagem quebrada é expurgada sem prender o cartão.
- [ ] Confirmar que Pingo Doce nunca recebe fotografia de outro PID.
- [ ] Confirmar que Continente continua correto.
- [ ] Confirmar rede lenta/offline sem crash.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P1 — Cobertura do catálogo

- [ ] Medir SKUs Pingo Doce `ready/pending/missing` apenas depois da estabilidade física.
- [ ] Medir fotografias gerais e Pingo Doce por sessão.
- [ ] Identificar categorias com baixo recall.
- [ ] Revalidar `missing` com retry/backoff quando necessário.
- [ ] Não declarar 100% do catálogo sem fonte exaustiva/autorizada.

## P2 — Consolidação

- [ ] Após validação física, avaliar consolidação de `75-catalog2`/`75-photo-loader3`.
- [ ] Não voltar a aumentar concorrência/polling sem teste físico iPhone.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Manter documentação sincronizada em cada alteração relevante.
