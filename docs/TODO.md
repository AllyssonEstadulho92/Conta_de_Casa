# TODO — Conta de Casa

Atualizado: 7 de setembro de 2026

## P0 — v69 animação hambúrguer → X publicada

### Problema físico confirmado

- [x] Rever as capturas reais do iPhone.
- [x] Confirmar que o estado aberto continuava visualmente como hambúrguer.
- [x] Confirmar moldura visual após foco programático no Safari.
- [x] Comparar comportamento observado com o código real.

### Causa técnica

- [x] Confirmar que `mobile-menu-toggle.js` cria três `<span>` animáveis.
- [x] Confirmar que `ui-icons.js::hydrate()` executa `fillIcon(#mobileMenuBtn, 'menu', 22)`.
- [x] Confirmar que o `MutationObserver` de `ui-icons.js` observa `aria-expanded` e `class`.
- [x] Confirmar que `fillIcon()` usa `replaceChildren()` e substituía o glifo animável por SVG estático.

### Implementação e publicação v69

- [x] Manter um único `#mobileMenuBtn`.
- [x] Manter o mesmo `#mobileDrawer` e fluxo de `events.js`.
- [x] Preservar três linhas proporcionais `22 / 18 / 14 px`.
- [x] Preservar um SVG Lucide como sentinela oculta.
- [x] Manter `data-ui-icon-slot="menu"` para impedir re-hidratação destrutiva.
- [x] Usar `aria-expanded` e `data-menu-state` como estados visuais sincronizados.
- [x] Fazer linha superior → `45deg` e inferior → `-45deg`.
- [x] Colapsar a linha central durante a abertura.
- [x] Ajustar animação para ~190 ms.
- [x] Preservar `prefers-reduced-motion`.
- [x] Suprimir apenas a moldura de foco programático após pointer/toque.
- [x] Preservar `:focus-visible` em teclado.
- [x] Manter drawer v68, safe areas, scroll, largura e alvos de 48 px.
- [x] Versionar como `v69` / `69-menu3`.
- [x] Atualizar `release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js`.
- [x] Atualizar regressões do menu, consistência, Mercado histórico e Centro de Atualização.
- [x] Abrir PR #56.
- [x] Confirmar CI verde do PR: run #1250 (`34168089348`).
- [x] Rever diff final: apenas menu, distribuição, testes relacionados e documentação.
- [x] Integrar PR #56 em `main`: `a66df37b0fc345491dacf3cac91313d88d080a05`.
- [x] Confirmar CI de `main`: run #1251 (`34168145569`).
- [x] Confirmar Deploy GitHub Pages: run #1244 (`34168165101`).
- [x] Atualizar documentação para estado publicado.

### Validação física prioritária v69

- [ ] No mesmo iPhone/Safari: tocar hambúrguer e confirmar transformação visível em `X`.
- [ ] Tocar no `X` e confirmar transformação inversa para hambúrguer.
- [ ] Confirmar que não existe moldura grande após toque.
- [ ] Confirmar que teclado continua a mostrar foco visível.
- [ ] Confirmar fecho por Escape, backdrop e seleção de item.
- [ ] Confirmar portrait/landscape e rotação.
- [ ] Android/Chrome em smartphone pequeno e grande.
- [ ] Tablet junto do breakpoint 820/821 px.
- [ ] Tema claro/escuro.
- [ ] VoiceOver/TalkBack.

## P0 — v68 painel do menu móvel refinado publicado

- [x] Drawer responsivo e limitado.
- [x] Safe areas, scroll e ausência de overflow lateral.
- [x] Itens e ações com alvos mínimos de 48 px.
- [x] Estados hover/active/focus/current.
- [x] Release `v68` / `68-menu2` publicada pelo PR #54.
- [x] CI e Pages verdes.
- [x] Validação física revelou falha real na transformação do glifo, corrigida na v69.

## P0 — v67 menu móvel hambúrguer/X publicado

- [x] Um único controlo real acompanha o `<dialog>` modal.
- [x] `#drawerCloseBtn` fica oculto e fora da tabulação.
- [x] Escape, backdrop, evento `close` e foco de retorno preservados.
- [x] `aria-expanded`, `aria-label` e `title` sincronizados.
- [x] Release `v67` / `67-menu1` publicada pelo PR #52.

## P0 — v66 uniformidade cromática do shell móvel publicada

- [x] Shell claro unificado em `#f5f7fa` e escuro em `#0f1722`.
- [x] Topbar opaco, sem blur, mesma geometria em todas as páginas.
- [x] Release `v66` / `66-shell1` publicada pelo PR #50.

## P0 — v65 Lista de compras móvel preservada

- [x] Resumo compacto.
- [x] `+` contextual no topbar.
- [x] Filtros compactos.
- [x] Categorias pendentes abertas e Comprados recolhido.
- [x] Desktop, schema, cálculos, scanner, cofre e sincronização preservados.

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
- [x] A v69 não escreve em `appState` nem altera dados financeiros.

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
