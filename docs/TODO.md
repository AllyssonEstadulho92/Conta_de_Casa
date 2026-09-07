# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — v70 movimento visível do hambúrguer ↔ X

### Observação física v69

- [x] Confirmar no iPhone que o estado fechado mostra hambúrguer correto.
- [x] Confirmar no iPhone que o estado aberto mostra X correto.
- [x] Confirmar que o drawer e a navegação continuam funcionais.
- [x] Identificar que o problema atual é ausência de movimento claramente perceptível entre os estados, não estado visual incorreto.

### Causa e arquitetura

- [x] Confirmar que o mesmo `#mobileMenuBtn` é reparented entre topbar e `.drawer-head`.
- [x] Confirmar que a v69 depende de CSS transitions para interpolar os spans.
- [x] Preservar a sentinela Lucide e `data-ui-icon-slot="menu"`.
- [x] Evitar criar segundo botão, segundo X ou segunda implementação do menu.

### Implementação candidata v70

- [x] Adicionar `animateMenuGlyph(open)` com Web Animations.
- [x] Animar explicitamente `top`, `width`, `transform` e `opacity` das três linhas.
- [x] Executar abertura no frame seguinte ao reparenting para o drawer.
- [x] Executar animação inversa no frame seguinte ao regresso ao topbar.
- [x] Adicionar micro movimento discreto de escala/inclinação do glifo.
- [x] Usar duração aproximada de `240 ms` e easing `cubic-bezier(.22,.8,.2,1)`.
- [x] Preservar CSS transition como fallback.
- [x] Preservar `prefers-reduced-motion`.
- [x] Não cancelar a animação inversa do X através do evento `close` do dialog.
- [x] Preservar ARIA, foco pointer/teclado, dimensões, safe areas e breakpoints.
- [x] Versionar candidata como `v70` / `70-menu4`.
- [x] Atualizar `release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js`.
- [x] Atualizar regressões específicas e testes de distribuição relacionados.
- [x] Atualizar `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md`.
- [ ] Abrir PR da v70.
- [ ] Confirmar CI verde do PR.
- [ ] Rever diff final e escopo.
- [ ] Integrar em `main` apenas com CI verde.
- [ ] Confirmar CI de `main`.
- [ ] Confirmar Deploy GitHub Pages.
- [ ] Atualizar documentação para estado publicado.

### Validação física prioritária v70

- [ ] iPhone/Safari: tocar hambúrguer e observar movimento contínuo até ao X.
- [ ] Tocar no X e observar movimento inverso até ao hambúrguer.
- [ ] Repetir abrir/fechar rapidamente e confirmar ausência de estado preso.
- [ ] Confirmar que não existe salto de layout.
- [ ] Confirmar ausência de moldura grande após toque.
- [ ] Confirmar foco visível por teclado.
- [ ] Escape, backdrop e seleção de item.
- [ ] Portrait/landscape e rotação.
- [ ] Android/Chrome em smartphone pequeno e grande.
- [ ] Tablet junto do breakpoint 820/821 px.
- [ ] Tema claro/escuro.
- [ ] VoiceOver/TalkBack.

## P0 — v69 estados hambúrguer/X publicados

- [x] Resolver conflito `ui-icons.js` / Lucide que substituía os três spans.
- [x] Preservar sentinela oculta e `data-ui-icon-slot="menu"`.
- [x] Manter um único botão e X correto no drawer.
- [x] Corrigir moldura programática de pointer no Safari mantendo `:focus-visible` por teclado.
- [x] Publicar v69 / `69-menu3` pelo PR #56.
- [x] CI e Pages verdes.
- [x] Validação física confirmou estados finais corretos.
- [x] Validação física revelou que o movimento entre estados não é suficientemente perceptível, tratado na v70.

## P0 — v68 painel do menu móvel refinado

- [x] Drawer responsivo e limitado.
- [x] Safe areas, scroll e ausência de overflow lateral.
- [x] Itens e ações com alvos mínimos de 48 px.
- [x] Estados hover/active/focus/current.
- [x] Release `v68` / `68-menu2` publicada.

## P0 — regressões essenciais que não podem quebrar

- [x] Cofre isolado e credenciais fora do código público.
- [x] PBKDF2-SHA-256 + AES-GCM e IndexedDB preservados.
- [x] Faturas, pagamentos, datas civis e totais financeiros cobertos por CI.
- [x] `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário coberta por invariantes.
- [x] QR fiscal continua preenchimento assistido/local.
- [x] Lucide continua sistema de ícones local.
- [x] Topbar móvel global preservado.
- [x] Centro de Atualização continua same-origin e controlado pelo utilizador.
- [x] CSP/allowlist, responsividade, acessibilidade e sincronização permanecem na CI.
- [x] A v70 não escreve em `appState` nem altera dados financeiros.

## P0 — validação física funcional ainda pendente

- [ ] Scanner: produtos reais no Pingo Doce e Continente, EAN-8/EAN-13, baixa luz, código inválido, repetido e ambíguo.
- [ ] Faturas: validar passagem setembro → outubro com recorrência **Por preencher**.
- [ ] QR fiscal: permitir/recusar/revogar câmara e confirmar encerramento dos tracks.
- [ ] VoiceOver/TalkBack: Lista de compras, cabeçalho, drawer e controlos icon-only.

## P1 — segurança e simplificação técnica

- [ ] Rever `@zxing/browser` carregado de `unpkg.com` e decidir auto-hospedagem local ou integridade verificável.
- [ ] Depois das releases móveis validadas fisicamente, avaliar remoção do pipeline histórico de imagens.
- [ ] Consolidar CSS antigo apenas numa release separada após hardware real verde.
- [ ] Confirmar nomes acessíveis de todos os botões icon-only.
- [ ] Num refactor dedicado, avaliar remoção definitiva de `#drawerCloseBtn` e referências históricas.

## P2 — manutenção

- [ ] Remover glifos Unicode antigos depois da validação final Lucide.
- [ ] Avaliar fonte única de versão depois de validar transições reais pelo Centro de Atualização.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança e privacidade.
