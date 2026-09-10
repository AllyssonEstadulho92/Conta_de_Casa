# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM.
- [x] Manter `PBKDF2_ITERATIONS = 250000`.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sincronização cifrada por correções meramente visuais.
- [x] Preservar `estimatedCents` separado de `actualCents` no Mercado.
- [x] Preservar `marketId|pid` como identidade canónica de SKU/fotografia.

## P0 — Revisões integradas

- [x] `75-startup2` — abertura pós-PIN sem bloqueio remoto em dispositivo emparelhado.
- [x] `75-photo-loader3` — estado terminal estável das fotografias.
- [x] `75-catalog4` — resolução exata sem tentativa redundante de `sourceUrl` oficial.
- [x] `75-usability1` — anti-zoom, alvos tácteis e cofre mobile.
- [x] `75-pages1` — Início, Despesas e Planeamento.
- [x] `75-assets1` — biblioteca/critério local-first e loader transversal opt-in.

## P1 — Validação física acumulada

- [ ] Validar no iPhone/Safari/PWA o anti-zoom e os alvos tácteis.
- [ ] Validar `75-pages1` em 320/375/390/430 px, tablet e desktop.
- [ ] Validar em hardware um componente `75-assets1` com imagem lazy/fallback.
- [ ] Quando existir runtime/animação Lottie local aprovada, validar reduced-motion/fallback.

## P1 — Parte 3 `75-market1`: Mercado

### Auditoria

- [x] Rever pesquisa live e pesquisa da lista.
- [x] Rever filtros, lista, catálogo visual e ações de compra.
- [x] Rever hierarquia entre estimativa, quantidade, valor real e estado comprado.
- [x] Confirmar que preço pesquisado continua separado do valor confirmado.
- [x] Rever estados de imagem/carregamento sem reintroduzir flicker.
- [x] Confirmar identidade `marketId|pid` e validação de PID nas URLs oficiais.
- [x] Rever scanner/código de barras e não alterar sem erro funcional comprovado.

### Implementação

- [x] Criar `v75-market-flow.js`/`.css` revisão `75-market1`.
- [x] Alterar apenas a comunicação de `#marketSearch` para **Pesquisar na minha lista…**.
- [x] Tornar Estado/Categoria/Ordenar visíveis no mobile.
- [x] Expor estado visual Por comprar / Preço por confirmar / Comprado.
- [x] Qualificar valor compacto como Estimativa total / Estimativa provisória / Total contabilizado.
- [x] Reutilizar o mesmo `.market-mobile-real` e `data-market-actual` existentes.
- [x] Promover o campo de preço real para fora de Detalhes quando o item comprado ainda não tem valor confirmado.
- [x] Abrir o grupo Comprados quando existe preço por confirmar.
- [x] Corrigir browser live para três colunas explícitas: fotografia / conteúdo / ação.
- [x] Rotular preço live como **Preço pesquisado** e adicionar nota de estimativa.
- [x] Manter `data-market-add-product` e acrescentar rótulo visível **Adicionar**.
- [x] Aplicar `CDCAssetLoader` apenas às imagens genéricas do browser live.
- [x] Manter `75-photo-loader3` e apenas espelhar carregamento do catálogo para `aria-busy`.
- [x] Não alterar `render.js`, `events.js`, `finance.js`, scanner, PID ou loaders especializados.

### Distribuição e QA

- [x] Incluir `v75-market-flow.css/js` no gerador Pages.
- [x] Incluir ambos no Service Worker e acrescentar `market1` ao final do cache.
- [x] Manter `v75-market-flow.css` antes de `v75-usability.css`.
- [x] Criar `tests/v75-market-flow.test.cjs`.
- [x] Incluir syntax check/teste no CI e no workflow Pages.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG.
- [x] Obter CI verde durante implementação: run `34481330929`.
- [ ] Confirmar CI final verde após atualização documental.
- [ ] Confirmar branch `behind 0` relativamente a `main`.
- [ ] Abrir e rever PR da Parte 3.
- [ ] Integrar apenas com CI verde.
- [ ] Confirmar CI de `main` e GitHub Pages no SHA publicado.
- [ ] Validar fisicamente o fluxo marcar comprado → confirmar preço real no iPhone/Safari/PWA.
- [ ] Validar visualmente pesquisa/filtros/browser em 320/375/390/430 px, tablet e desktop.

## P1 — Parte 4: Mais + ícones + acessibilidade final

- [ ] Rever grupos de Mais e reduzir duplicações de navegação.
- [ ] Rever Segurança, Diagnóstico, Aparência e Preferências como fluxos secundários.
- [ ] Consolidar ícones Lucide visíveis e eliminar fallback redundante apenas com prova de ausência de regressão.
- [ ] Rever foco, teclado, leitores de ecrã e `prefers-reduced-motion`.
- [ ] Auditoria final de contraste e alvos tácteis.

## P2 — Consolidação técnica

- [ ] Depois da validação física, medir se camadas visuais antigas podem ser fundidas com segurança.
- [ ] Remover código histórico apenas com prova de ausência de referências.
- [ ] Alinhar nomenclatura base (`PAGE_META`/template) com a arquitetura v75 sem alterar rotas nem IDs.
- [ ] Revalidar segurança, finanças, sincronização, manifest e offline depois de qualquer consolidação.
- [ ] Nas aplicações futuras, reutilizar o critério `75-assets1` e acrescentar apenas assets aprovados, nunca catálogos completos como dependência automática.
