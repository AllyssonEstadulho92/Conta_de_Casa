# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — Baseline v75 preservada

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar `core.js`, `finance.js`, pagamentos, faturas, PIN, PBKDF2-SHA-256, AES-GCM e sincronização.
- [x] Manter navegação móvel Início / Despesas / Mercado / Planeamento / Mais.
- [x] Manter drawer no lado direito e cabeçalho `75-header2`.
- [x] Manter `75-stability1`, `75-layout1`, `75-drawer2` e `75-featured1`.

## P0 — Biblioteca geral e catálogo visual

- [x] Biblioteca persistente por `marketId|pid` em `75-image-library1`.
- [x] Catálogo visual progressivo por categorias em `75-catalog1`.
- [x] Resolver fotografia pela página oficial exata quando disponível.
- [x] Não guardar preços no catálogo visual.
- [x] Limitar pesquisa/enriquecimento automático e respeitar offline/Save-Data/visibilidade.

## P0 — `75-pd-photo1`: biblioteca dedicada Pingo Doce

- [x] Criar `pingo-doce-photo-library.js`.
- [x] Criar IndexedDB isolada `conta-de-casa-pingo-doce-photo-library`.
- [x] Indexar exclusivamente por `pingo-doce|pid`.
- [x] Restringir pesquisa a `stores:['pingodoce']`.
- [x] Aceitar apenas página oficial Pingo Doce com PID correspondente.
- [x] Criar 15 famílias de descoberta.
- [x] Criar mais de 200 termos de pesquisa para aumentar cobertura.
- [x] Manter estados de imagem `pending`, `ready` e `missing`.
- [x] Reutilizar primeiro a biblioteca geral `75-image-library1`.
- [x] Resolver apenas a partir da página oficial exata do SKU.
- [x] Persistir fotografia final apenas após validação oficial existente.
- [x] Limitar a 24 pesquisas/sessão e 72/dia.
- [x] Limitar fotografias a 30 tentativas/sessão e 120/dia.
- [x] Suspender trabalho automático offline, página oculta ou `Save-Data`.
- [x] Adicionar estado/contador **Biblioteca Pingo Doce** na área do catálogo.
- [x] Adicionar botão **Atualizar biblioteca** com ação limitada.
- [x] Criar `tests/pingo-doce-photo-library.test.cjs`.

## P0 — `75-photo-loader1`: carregamento visual rápido

- [x] Criar `market-photo-loader.js`.
- [x] Criar `market-photo-loader.css`.
- [x] Mostrar skeleton/shimmer imediatamente em cartão sem fotografia.
- [x] Mostrar spinner e **A carregar fotografia…**.
- [x] Consultar primeiro IndexedDB/cache de imagens.
- [x] Usar `loading='eager'` para fotografia já resolvida em cartão visível.
- [x] Aquecer a biblioteca Pingo Doce no primeiro acesso ao Mercado.
- [x] Reavaliar cartões numa janela curta de 850 ms, máximo 18 ciclos.
- [x] Respeitar tema escuro e `prefers-reduced-motion`.
- [x] Garantir que o loader não faz chamadas externas próprias.
- [x] Criar `tests/market-photo-loader.test.cjs`.

## P0 — Distribuição e QA

- [x] Adicionar CSS/JS Pingo Doce à allowlist Pages.
- [x] Adicionar CSS/JS loader à allowlist Pages.
- [x] Atualizar Service Worker para `-catalog1-pd-photo1-photo-loader1`.
- [x] Atualizar CI com syntax check e novos testes.
- [x] Atualizar Pages com os mesmos testes.
- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.
- [x] Confirmar CI final verde da branch no SHA `7a59ae017a4640cfa3ad5ec357cd99425ca9ee71`.
- [x] Comparar branch final com `main`: ahead, behind 0.
- [x] Integrar por fast-forward sem force.
- [x] Confirmar CI de `main` no SHA integrado.
- [x] Confirmar GitHub Pages no SHA integrado.

## P1 — Validação física iPhone/Safari/PWA

- [ ] Confirmar instalação do cache `pd-photo1-photo-loader1`.
- [ ] Entrar em Mercado e verificar feedback imediato **A carregar fotografia…**.
- [ ] Confirmar que imagens já guardadas aparecem praticamente de imediato.
- [ ] Confirmar substituição do skeleton pela fotografia sem layout shift relevante.
- [ ] Confirmar que Pingo Doce nunca recebe fotografia de outro PID.
- [ ] Confirmar que Continente não é afetado pela biblioteca dedicada.
- [ ] Confirmar rede lenta sem bloqueio da página.
- [ ] Confirmar offline parcial com cartões utilizáveis.
- [ ] Confirmar `Save-Data` sem enriquecimento automático.
- [ ] Confirmar tema escuro e reduced motion.
- [ ] Confirmar ausência de overflow horizontal.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P1 — Cobertura do catálogo

- [ ] Medir SKUs Pingo Doce indexados após 1 sessão.
- [ ] Medir SKUs após vários dias de uso normal.
- [ ] Identificar categorias com baixo recall e acrescentar termos apenas quando necessário.
- [ ] Revalidar URLs marcadas `missing` numa futura política de retry com backoff.
- [ ] Avaliar fonte oficial/autorizada exaustiva caso venha a existir.
- [ ] Não declarar “100% do catálogo” sem prova de cobertura exaustiva.

## P2 — Consolidação

- [ ] Após validação real, avaliar absorção das camadas estáveis no sistema visual consolidado.
- [ ] Remover CSS/JS histórico apenas com prova de ausência de referências.
- [ ] Manter documentação sincronizada em cada alteração relevante.