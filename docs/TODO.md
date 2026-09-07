# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — v71 drawer off-canvas suave

### Observação física v70

- [x] Confirmar que o drawer abre no lado correto e mantém a navegação funcional.
- [x] Confirmar que hambúrguer/X está correto.
- [x] Identificar que o painel entra de forma demasiado seca.
- [x] Confirmar no código que a v70 desloca a superfície apenas `-18px` antes de abrir.
- [x] Confirmar que o backdrop surge já escurecido.
- [x] Confirmar que `drawer.close()` nativo imediato impede uma animação de saída completa.

### Implementação candidata v71

- [x] Manter o mesmo `#mobileDrawer`, `#mobileMenuBtn` e `NAV_GROUPS`.
- [x] Preservar Web Animations do hambúrguer/X da v70.
- [x] Alterar a superfície fechada para `translate3d(calc(-100% - 8px),0,0)`.
- [x] Usar abertura de aproximadamente `280 ms` com easing de desaceleração natural.
- [x] Usar fecho de aproximadamente `240 ms`.
- [x] Fazer o backdrop evoluir de transparente para escurecimento discreto.
- [x] Limitar o blur do backdrop a `1.5px`.
- [x] Animar apenas `transform`, opacidade e composição visual, sem largura/margens/layout.
- [x] Coordenar a instância `drawer.close()` com `transitionend` do `transform`.
- [x] Manter fallback temporal de `360 ms` para evitar dialog preso.
- [x] Manter o mesmo botão dentro do drawer até ao `close` real.
- [x] Preservar fecho por X, Escape, backdrop, item de navegação e breakpoint.
- [x] Preservar `prefers-reduced-motion` com fecho imediato.
- [x] Preservar ARIA, foco, safe areas, largura responsiva e alvos tácteis.
- [x] Versionar como `v71` / `71-menu5`.
- [x] Atualizar `release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js`.
- [x] Atualizar regressões do menu e testes de distribuição relacionados.
- [x] Atualizar `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` para estado candidato.
- [ ] Abrir PR da v71.
- [ ] Confirmar CI verde do PR.
- [ ] Rever diff final e escopo.
- [ ] Integrar em `main` apenas com CI verde.
- [ ] Confirmar CI de `main`.
- [ ] Confirmar Deploy GitHub Pages.
- [ ] Atualizar documentação para estado publicado.

### Validação física prioritária v71

- [ ] iPhone/Safari: tocar no hambúrguer e confirmar que o painel entra claramente da esquerda para a direita.
- [ ] Tocar no X e confirmar saída suave para a esquerda antes de desaparecer.
- [ ] Selecionar uma opção e confirmar a mesma saída suave.
- [ ] Fechar pelo backdrop e confirmar a mesma saída suave.
- [ ] Confirmar Escape/teclado quando disponível.
- [ ] Repetir abrir/fechar rapidamente e confirmar ausência de estado preso.
- [ ] Confirmar ausência de salto do X/hambúrguer durante o fecho.
- [ ] Confirmar que não existe scroll lateral nem deslocamento do conteúdo.
- [ ] Portrait/landscape e rotação.
- [ ] Android/Chrome em smartphone pequeno e grande.
- [ ] Tablet junto do breakpoint 820/821 px.
- [ ] Tema claro/escuro.
- [ ] VoiceOver/TalkBack.

## P0 — v70 movimento visível do hambúrguer ↔ X publicado

- [x] Manter um único botão real.
- [x] Preservar sentinela Lucide e três spans.
- [x] Usar Web Animations após reparenting.
- [x] Preservar `prefers-reduced-motion`.
- [x] Publicar v70 / `70-menu4` pelo PR #58.
- [x] CI e Pages verdes.
- [x] Validação física mostrou o drawer funcional e revelou apenas a necessidade de suavizar a própria superfície, tratada na v71.

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
- [x] A v71 não escreve em `appState` nem altera dados financeiros.

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
