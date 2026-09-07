# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — v70 movimento visível do hambúrguer ↔ X publicado

### Observação física v69

- [x] Confirmar no iPhone que o estado fechado mostra hambúrguer correto.
- [x] Confirmar no iPhone que o estado aberto mostra X correto.
- [x] Confirmar que o drawer e a navegação continuam funcionais.
- [x] Identificar que o problema atual era ausência de movimento claramente perceptível entre os estados, não estado visual incorreto.

### Implementação e publicação v70

- [x] Manter o mesmo `#mobileMenuBtn`, `#mobileDrawer` e navegação.
- [x] Preservar sentinela Lucide, três spans e `data-ui-icon-slot="menu"`.
- [x] Adicionar `animateMenuGlyph(open)` com Web Animations.
- [x] Animar `top`, `width`, `transform` e `opacity` das três linhas.
- [x] Executar abertura no frame seguinte ao reparenting para o drawer.
- [x] Executar animação inversa no frame seguinte ao regresso ao topbar.
- [x] Adicionar micro movimento discreto de escala/inclinação do glifo.
- [x] Usar duração aproximada de `240 ms` e easing `cubic-bezier(.22,.8,.2,1)`.
- [x] Preservar CSS transition como fallback.
- [x] Preservar `prefers-reduced-motion`.
- [x] Não cancelar a animação inversa do X através do evento `close` do dialog.
- [x] Preservar ARIA, foco pointer/teclado, dimensões, safe areas e breakpoints.
- [x] Versionar como `v70` / `70-menu4`.
- [x] Atualizar `release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js`.
- [x] Atualizar regressões específicas e testes de distribuição relacionados.
- [x] Atualizar os cinco documentos de continuidade.
- [x] Abrir PR #58.
- [x] Confirmar CI verde do PR: run #1279 (`34170191884`).
- [x] Rever diff final: apenas menu, distribuição, testes relacionados e documentação.
- [x] Integrar PR #58 em `main`: `f4144bff69a3b46e0f6ec78a00af50d29b704578`.
- [x] Confirmar CI de `main`: run #1280 (`34170229908`).
- [x] Confirmar Deploy GitHub Pages: run #1273 (`34170256426`).
- [x] Atualizar documentação para estado publicado.

### Validação física prioritária v70

- [ ] iPhone/Safari: instalar v70 e tocar hambúrguer, confirmando movimento contínuo até ao X.
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
- [x] Validação física revelou que o movimento entre estados não era suficientemente perceptível, tratado na v70.

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
