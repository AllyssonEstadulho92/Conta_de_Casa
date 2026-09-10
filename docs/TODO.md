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
- [x] Publicar `75-usability1` com anti-zoom, alvos tácteis e reforço do cofre.

## P0 — Auditoria UX/UI solicitada

- [x] Rever ecrã de bloqueio/PIN.
- [x] Rever arquitetura e navegação de Início, Despesas, Mercado, Planeamento e Mais.
- [x] Rever sistema de ícones e documentação anterior.
- [x] Rever viewport, inputs, alvos tácteis e risco de zoom no Safari/iOS.
- [x] Confirmar que `index.html` é template e que o bundle público real é montado por `scripts/prepare-pages.cjs`.
- [x] Confirmar que o zoom manual não está bloqueado no meta viewport.
- [x] Identificar dívida de nomenclatura/camadas antigas sem a remover prematuramente.

## P0 — Parte 1 `75-usability1`

- [x] Implementar e integrar `v75-usability.css`.
- [x] Aplicar `touch-action: manipulation` aos controlos interativos.
- [x] Reforçar `font-size:16px` em formulários mobile.
- [x] Reforçar alvos tácteis de 44/48 px.
- [x] Melhorar viewport/safe areas/scroll do cofre mobile.
- [x] Manter pinch-to-zoom e acessibilidade.
- [x] Publicar no GitHub Pages com CI verde.
- [ ] Validar fisicamente no iPhone/Safari/PWA que tocar em inputs/botões não provoca auto-zoom/duplo-toque involuntário.

## P1 — Parte 2 `75-pages1`: Início + Despesas + Planeamento

### Início

- [x] Rever hierarquia de informação e densidade dos cartões.
- [x] Melhorar relação mês → resumo → ações rápidas → categorias.
- [x] Uniformizar feedback de toque/hover sem alterar handlers.
- [x] Melhorar apresentação de alertas móveis.
- [x] Manter grelhas legadas ocultas no móvel para evitar duplicação.

### Despesas

- [x] Confirmar que `renderBills()`/`filterBills()` já suportam pesquisa, estado, categoria, datas e ordenação.
- [x] Identificar que a composição v74 escondia a vista funcional canónica no móvel.
- [x] Restaurar Lista/Calendário em mobile.
- [x] Restaurar `bill-filter-grid` em mobile.
- [x] Restaurar `billSummary` e `billsList` em mobile.
- [x] Usar cartões móveis já produzidos pelo renderer principal.
- [x] Ocultar o feed simplificado `cdcExpenseFeed` como vista principal móvel.
- [x] Preservar FAB de nova despesa, pesquisa, vencimentos, progresso e ações existentes.
- [x] Não alterar `render.js`, filtros, pagamentos ou cálculos.

### Planeamento

- [x] Rever resumo de orçamento, categorias, formulário e rendimentos.
- [x] Melhorar hierarquia e densidade do resumo.
- [x] Empilhar os painéis funcionais em mobile.
- [x] Melhorar leitura de saldo atual, saldo calculado e diferença de conciliação.
- [x] Melhorar lista de rendimentos sem alterar dados.
- [x] Preservar fórmulas e valores do núcleo.

### Distribuição/QA

- [x] Criar `v75-pages.css` revisão `75-pages1`.
- [x] Incluir `v75-pages.css` no gerador de Pages.
- [x] Incluir `v75-pages.css` no Service Worker e invalidar cache com `pages1`.
- [x] Manter `v75-usability.css` carregado depois de `v75-pages.css`.
- [x] Ampliar `tests/v75-stability.test.cjs` com regressões da Parte 2.
- [x] Atualizar documentação técnica.
- [x] Abrir/rever PR #68 e integrar em `main`.
- [x] Confirmar CI de `main` verde no merge `c8ec45893c8936093ecd7c7da9ee08c9a268109c`: run `34474037338`.
- [x] Confirmar GitHub Pages no mesmo SHA: run `34474069564`.
- [ ] Validar fisicamente 320/375/390/430 px, tablet e desktop quando disponível.

## P1 — Fundação de design/assets `75-assets1`

### Catálogo e critérios

- [x] Criar registo reutilizável de fornecedores em `design-asset-library.js`.
- [x] Registar Lottie, Google Fonts, Fontshare, Font Squirrel, DaFont, UNCUT.wtf, Adobe Fonts, MyFonts, Fontpair, Fontjoy, Font Awesome, Material Symbols, Type Icons e o item não verificado “Free Icon Font Proyectos”.
- [x] Manter Lucide local como sistema principal de ícones da Conta de Casa.
- [x] Definir uma família tipográfica preferencial e máximo de duas por aplicação.
- [x] Exigir validação de origem/licença antes de incorporar ficheiros.
- [x] Bloquear integração automática de recursos classificados como restritos ou não verificados.
- [x] Documentar critérios em `docs/DESIGN_ASSET_LIBRARY.md`.

### Carregamento de fotos e outros recursos

- [x] Criar `asset-loader.js` opt-in.
- [x] Aplicar lazy loading, async decode, prioridade e `IntersectionObserver` a imagens declaradas.
- [x] Criar estados loading/ready/error e fallback visual em `asset-loader.css`.
- [x] Suportar vídeo/áudio com `preload="metadata"` por defeito e sem autoplay automático.
- [x] Preparar integração Lottie apenas com runtime e JSON locais aprovados.
- [x] Respeitar `prefers-reduced-motion` e fallback estático.
- [x] Não substituir `market-photo-loader.js` nem a identidade `marketId|pid`.
- [x] Não expandir a CSP nem introduzir kits/tokens/CDNs.

### Distribuição/QA

- [x] Incluir `asset-loader.css`, `design-asset-library.js` e `asset-loader.js` no bundle Pages.
- [x] Incluir os três recursos no Service Worker e invalidar cache com `assets1`.
- [x] Criar `tests/design-asset-library.test.cjs`.
- [x] Incluir syntax check e teste dedicado no CI e no pipeline Pages.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG.
- [x] Confirmar CI verde da branch final: run `34477808822`.
- [x] Confirmar branch `behind 0` relativamente a `main` antes do PR.
- [x] Abrir/rever PR #69.
- [x] Confirmar CI do PR: run `34477918443` — sucesso.
- [x] Integrar em `main` por squash: `a8e04d6811bd6eb08487de139fb19fb2f12128ec`.
- [x] Confirmar CI de `main`: run `34478047035` — sucesso.
- [x] Confirmar GitHub Pages no mesmo SHA: run `34478091014` — sucesso.
- [ ] Validar em hardware um componente opt-in com imagem lazy/fallback.
- [ ] Quando houver runtime Lottie local e animação aprovada, validar `prefers-reduced-motion` e fallback estático.

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
- [ ] Em aplicações futuras, reutilizar o critério `75-assets1` e acrescentar apenas assets aprovados, nunca catálogos completos como dependência automática.
