# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM.
- [x] Manter `PBKDF2_ITERATIONS = 250000`.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sincronização cifrada por correções meramente visuais.

## P0 — Correções anteriores integradas

- [x] Acelerar a abertura pós-PIN em dispositivo já emparelhado sem reduzir segurança (`75-startup2`).
- [x] Dar estado terminal estável às fotografias (`75-photo-loader3`).
- [x] Reconciliar fotografias Pingo Doce com a base dedicada.
- [x] Remover resolução redundante quando existe `sourceUrl` oficial exata (`75-catalog4`).
- [x] Confirmar que `fix/v75-pin-images-stability` e `main` estão idênticas, `ahead 0 / behind 0`, no SHA `f85deed6d2fab5e1b0658ad74c25d323f621a19f`.

## P0 — Auditoria UX/UI solicitada

- [x] Rever ecrã de bloqueio/PIN.
- [x] Rever arquitetura e navegação de Início, Despesas, Mercado, Planeamento e Mais.
- [x] Rever sistema de ícones e documentação anterior.
- [x] Rever viewport, inputs, alvos tácteis e risco de zoom no Safari/iOS.
- [x] Confirmar que `index.html` é template e que o bundle público real é montado por `scripts/prepare-pages.cjs`.
- [x] Confirmar que o zoom manual não está bloqueado no meta viewport.
- [x] Identificar dívida de nomenclatura/camadas antigas sem a remover prematuramente.

## P0 — Parte 1 `75-usability1`

- [x] Criar `v75-usability.css` como camada isolada.
- [x] Aplicar `touch-action: manipulation` aos controlos interativos.
- [x] Reforçar `font-size:16px` nos controlos de formulário mobile.
- [x] Reforçar alvo táctil mínimo de 44 px.
- [x] Reforçar 48 px nas barras/filtros densos de Despesas e Mercado.
- [x] Melhorar viewport/safe areas/scroll do cofre mobile sem alterar o PIN.
- [x] Manter pinch-to-zoom e acessibilidade.
- [x] Incluir `v75-usability.css` no gerador de Pages.
- [x] Incluir `v75-usability.css` no Service Worker e invalidar cache com `usability1`.
- [x] Ampliar `tests/v75-stability.test.cjs` com regressões anti-zoom/distribuição.
- [x] Atualizar documentação técnica da branch.
- [ ] Confirmar CI verde da branch.
- [ ] Abrir/rever PR para `main`.
- [ ] Integrar apenas com CI verde.
- [ ] Confirmar CI de `main` e GitHub Pages no mesmo SHA.
- [ ] Validar no iPhone/Safari/PWA que tocar em inputs/botões não provoca auto-zoom/duplo-toque involuntário.

## P1 — Parte 2: Início + Despesas + Planeamento

- [ ] Rever hierarquia de informação e densidade dos cartões no Início.
- [ ] Garantir que ações rápidas têm rótulo/ícone/feedback coerentes.
- [ ] Rever estados vazio, erro e carregamento relevantes.
- [ ] Rever Despesas: pesquisa, filtros, ordenação, datas, ações e cartões mobile.
- [ ] Reduzir ruído visual sem remover filtros funcionais.
- [ ] Rever Planeamento: orçamento, saldo atual, saldo inicial, rendimentos e metas.
- [ ] Garantir consistência entre valores apresentados e dados já calculados pelo núcleo, sem alterar fórmulas.
- [ ] Testar 320/375/390/430 px, tablet e desktop.

## P1 — Parte 3: Mercado

- [ ] Rever pesquisa, filtros, lista, catálogo visual e ações de compra.
- [ ] Rever hierarquia entre estimativa, quantidade, valor real e estado comprado.
- [ ] Manter preço pesquisado separado do valor confirmado.
- [ ] Rever estados de imagem/carregamento sem reintroduzir flicker.
- [ ] Confirmar Continente/Pingo Doce sem troca de PID.
- [ ] Rever scanner/código de barras apenas na camada de apresentação, salvo erro funcional comprovado.

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
