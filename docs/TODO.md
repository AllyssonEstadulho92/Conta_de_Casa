# TODO — Conta de Casa

Atualizado: 7 de setembro de 2026

## P0 — v68 painel do menu móvel refinado

### Auditoria, implementação e publicação — PR #54

- [x] Ler estado, arquitetura e decisões antes de alterar código.
- [x] Confirmar `#mobileMenuBtn`, `#mobileDrawer`, `events.js`, `render.js` e camadas CSS responsáveis.
- [x] Confirmar que desktop e drawer reutilizam os mesmos `NAV_GROUPS`.
- [x] Confirmar que o breakpoint existente é 820/821 px e que não existe necessidade de redimensionar globalmente a aplicação.
- [x] Confirmar que Lucide local e a tipografia existente devem ser preservados.
- [x] Confirmar conflitos visuais históricos do drawer e manter `mobile-menu-toggle.css` como camada final escopada.
- [x] Preservar o mesmo botão hambúrguer ↔ `X`, sem trocar dois ícones independentes.
- [x] Manter alvo do botão em `44 × 44 px`.
- [x] Encurtar/suavizar a animação e preservar `prefers-reduced-motion`.
- [x] Sincronizar `aria-expanded`, `aria-label`, `title` e `data-menu-state`.
- [x] Definir largura fluida do drawer sem ocupar todo o ecrã.
- [x] Em ecrãs abaixo de 360 px, manter `width: calc(100vw - 20px)` e alvos de 48 px.
- [x] Preservar safe areas e criar scroll vertical interno sem overflow lateral.
- [x] Refinar cabeçalho, marca, tipografia e espaçamentos do painel.
- [x] Definir alvos de 48 px para itens e ações do drawer.
- [x] Adicionar estados discretos hover, active, focus-visible e current.
- [x] Preservar tema claro/escuro e fundo global v66.
- [x] Preservar Escape, backdrop, navegação e fluxo de fecho existente.
- [x] Manter `#drawerCloseBtn` oculto por compatibilidade enquanto existirem referências em `events.js`/`ui-icons.js`.
- [x] Versionar release como `v68` / `68-menu2`.
- [x] Atualizar `release-manifest.json`, `scripts/prepare-pages.cjs` e Service Worker.
- [x] Atualizar testes do menu, Centro de Atualização, consistência, Compras e compatibilidade histórica.
- [x] Abrir PR #54.
- [x] Confirmar CI verde do PR #54 — run #1217 (`34166823195`).
- [x] Rever diff final e confirmar escopo restrito a UI/menu/distribuição/testes/docs.
- [x] Integrar PR #54 em `main` — commit `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`.
- [x] Confirmar CI de `main` — run #1218 (`34166862646`) com sucesso.
- [x] Confirmar Deploy GitHub Pages — run #1211 (`34166882992`) com sucesso.
- [x] Atualizar documentação para estado publicado.

### Validação física v68 ainda pendente

- [ ] iPhone/Safari 320, 375, 390 e 430 px: abrir/fechar e confirmar hambúrguer ↔ `X`.
- [ ] Android/Chrome em smartphone pequeno e grande.
- [ ] Tablet próximo de 820/821 px e orientação horizontal.
- [ ] Confirmar largura equilibrada do painel e backdrop visível.
- [ ] Confirmar ausência de scroll lateral ou salto do layout.
- [ ] Testar drawer com conteúdo que exceda a altura do viewport.
- [ ] Confirmar fecho por X, Escape, backdrop e seleção de item.
- [ ] Confirmar estados current, hover com rato, active por toque e focus por teclado.
- [ ] Validar tema claro e escuro.
- [ ] Validar VoiceOver/TalkBack e nomes Abrir/Fechar menu.
- [ ] Validar `prefers-reduced-motion`.
- [ ] Confirmar que topbar, `+`, Sync e navegação inferior não mudaram de posição/tamanho.

## P0 — v67 menu móvel hambúrguer/X publicado

- [x] Um único controlo real acompanha o `<dialog>` modal.
- [x] Três linhas transformam-se em `X` e regressam no mesmo nó DOM.
- [x] `#drawerCloseBtn` fica oculto e fora da tabulação.
- [x] Escape, backdrop, evento `close` e foco de retorno preservados.
- [x] `aria-expanded`, `aria-label` e `title` sincronizados.
- [x] Release `v67` / `67-menu1` publicada pelo PR #52.

## P0 — v66 uniformidade cromática do shell móvel publicada

- [x] Shell claro unificado em `#f5f7fa` e escuro em `#0f1722`.
- [x] Topbar opaco, sem blur, mesma geometria em todas as páginas.
- [x] Desktop mantém identidade do Mercado.
- [x] Release `v66` / `66-shell1` publicada pelo PR #50.

## P0 — v65 Lista de compras móvel preservada

- [x] Resumo compacto com contagem por comprar, comprados e total previsto.
- [x] Resumo financeiro completo em disclosure no mobile.
- [x] `+` do topbar reutiliza a ação existente de adicionar produto.
- [x] Botão duplicado oculto apenas no mobile.
- [x] Filtros compactos e **Limpar filtros** apenas quando necessário.
- [x] Categorias pendentes abertas e **Comprados** recolhido.
- [x] Cartões priorizam checkbox, nome, quantidade e preço; secundários ficam em **Detalhes**.
- [x] Desktop, schema, cálculos, scanner, cofre e sincronização preservados.

## P0 — regressões essenciais que não podem quebrar

- [x] Cofre isolado e credenciais fora do código público.
- [x] PBKDF2-SHA-256 + AES-GCM e IndexedDB preservados.
- [x] Faturas, pagamentos, datas civis e totais financeiros cobertos por CI.
- [x] `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário coberta por invariantes.
- [x] QR fiscal continua preenchimento assistido/local.
- [x] Lucide continua sistema de ícones local.
- [x] Um único indicador ativo na navegação inferior.
- [x] Topbar móvel usa a mesma geometria e fundo em Início/Faturas/Compras/Relatórios.
- [x] Centro de Atualização continua same-origin e controlado pelo utilizador.
- [x] CSP/allowlist, responsividade, acessibilidade e sincronização permanecem na CI.
- [x] A v68 não escreve em `appState` nem altera dados financeiros.

## P0 — validação física funcional ainda pendente

- [ ] Scanner: produtos reais no Pingo Doce e Continente, EAN-8/EAN-13, baixa luz, código inválido, repetido e ambíguo.
- [ ] Faturas: validar passagem setembro → outubro com recorrência **Por preencher**.
- [ ] QR fiscal: permitir/recusar/revogar câmara e confirmar encerramento dos tracks.
- [ ] VoiceOver/TalkBack: Lista de compras, cabeçalho, drawer e controlos icon-only.

## P1 — segurança e simplificação técnica

- [ ] Rever `@zxing/browser` carregado de `unpkg.com` e decidir auto-hospedagem local ou integridade verificável em release dedicada.
- [ ] Depois das releases móveis validadas fisicamente, avaliar remoção do pipeline histórico de imagens.
- [ ] Manter Open Food Facts quando necessário para identificação por GTIN.
- [ ] Consolidar CSS antigo substituído por camadas finais apenas numa release separada após hardware real verde.
- [ ] Avaliar incorporação formal do estado `draft` no schema numa migração futura.
- [ ] Rever contraste dos estados em tema claro/escuro em hardware real.
- [ ] Confirmar nomes acessíveis de todos os botões icon-only.
- [ ] Num refactor de navegação dedicado, avaliar remoção definitiva de `#drawerCloseBtn` juntamente com referências em `events.js`, `ui-icons.js` e testes.

## P2 — manutenção

- [ ] Remover glifos Unicode antigos depois da validação final Lucide.
- [ ] Avaliar fonte única de versão depois de validar transições reais pelo Centro de Atualização.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança e privacidade.
