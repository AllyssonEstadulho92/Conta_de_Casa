# TODO — Conta de Casa

Atualizado: 7 de setembro de 2026

## P0 — v67 menu móvel hambúrguer/X

### Implementação e publicação — PR #52

- [x] Confirmar no código que o menu móvel usa `#mobileMenuBtn` para abrir e `#drawerCloseBtn` como segundo `X` dentro de `#mobileDrawer`.
- [x] Confirmar que `#mobileDrawer` é um `<dialog>` modal e que um botão deixado fora do diálogo ficaria inerte enquanto `showModal()` estiver ativo.
- [x] Definir um único controlo real que acompanha o drawer, sem segundo `X` visível.
- [x] Criar `mobile-menu-toggle.css` com glifo de três traços e transformação animada para `X`.
- [x] Manter alvo tátil de `44 × 44 px` e glifo proporcional ao cabeçalho atual.
- [x] Remover visualmente borda branca, fundo verde/selecionado e sombra adicional do comando móvel.
- [x] Criar `mobile-menu-toggle.js` para mover o mesmo nó DOM para dentro do drawer quando aberto e repô-lo no topbar ao fechar.
- [x] Sincronizar `aria-expanded`, `aria-label` e `title` com **Abrir menu / Fechar menu**.
- [x] Ocultar `#drawerCloseBtn` sem o remover do DOM, preservando o wiring legado de `events.js`.
- [x] Preservar Escape, backdrop, evento `close` e foco de retorno.
- [x] Respeitar `prefers-reduced-motion`.
- [x] Versionar a release como `v67` / `67-menu1`.
- [x] Incluir os novos assets em `scripts/prepare-pages.cjs` e na allowlist/cache do Service Worker.
- [x] Atualizar `release-manifest.json` e `tests/app-update.test.cjs`.
- [x] Criar `tests/mobile-menu-toggle.test.cjs`.
- [x] Incluir sintaxe/teste específico na CI e no gate de Pages.
- [x] Abrir PR #52.
- [x] Confirmar CI verde do PR #52 — run #1178.
- [x] Rever diff final e confirmar que não existem alterações a dados/finanças/segurança.
- [x] Integrar PR #52 em `main` no commit `a1d932e580abaa06e7026a515f797411ab205f6e`.
- [x] Confirmar CI de `main` #1179 com sucesso.
- [x] Confirmar Deploy GitHub Pages #1172 com sucesso.
- [x] Sincronizar os documentos de continuidade com o estado publicado da v67.

### Validação física v67

- [ ] iPhone/Safari 320, 375, 390 e 430 px: tocar no hambúrguer e confirmar transformação em `X`.
- [ ] Tocar no `X` e confirmar fecho + regresso ao hambúrguer.
- [ ] Confirmar ausência de segundo `X` no drawer.
- [ ] Confirmar ausência de moldura branca, fundo verde ou indicador de seleção no botão.
- [ ] Confirmar alinhamento com título, `+` e Sync sem alterar a geometria do topbar.
- [ ] Confirmar fecho por Escape/backdrop e reposição correta do ícone.
- [ ] Confirmar fecho após navegação pelo drawer e reposição correta do ícone.
- [ ] Validar portrait/landscape, scroll e rotação.
- [ ] Validar tema claro e escuro.
- [ ] Validar foco por teclado e VoiceOver/TalkBack no estado **Abrir menu / Fechar menu**.
- [ ] Validar `prefers-reduced-motion` num sistema com movimento reduzido.

## P0 — v66 uniformidade cromática do shell móvel

### Implementação e publicação

- [x] Confirmar a diferença branco/azulado através da captura real de iPhone.
- [x] Identificar no código a sobreposição entre o radial azul do Mercado e o topbar móvel `fixed`.
- [x] Definir um único `--mobile-shell-bg` para tema claro e escuro.
- [x] Aplicar o mesmo fundo a documento, `body`, `.app-shell`, `.main`, `.main` do Mercado e `.topbar` até 820 px.
- [x] Remover transparência/`backdrop-filter` do topbar móvel para evitar composição cromática diferente no Safari.
- [x] Preservar o radial/identidade do Mercado no desktop.
- [x] Alinhar `manifest.webmanifest` e `theme-color` público ao fundo claro `#f5f7fa`.
- [x] Manter `applyTheme()` e o fundo escuro coerentes em `#0f1722`.
- [x] Versionar release como `v66`, shell `66-shell1` e novo cache do Service Worker.
- [x] Preservar `v64-runtime.js` em `64-runtime1` e Compras em `65-shopping1`.
- [x] Atualizar regressões de shell, manifesto, build, imagens legadas, Compras e Centro de Atualização.
- [x] Preservar schema, finanças, scanner, cofre e sincronização.
- [x] Abrir PR #50 e obter CI verde (#1138).
- [x] Rever diff final e confirmar escopo exclusivamente visual/distribuição.
- [x] Integrar PR #50 em `main` no commit `9657d558000018af1ea44e6040441f2b9d91648c`.
- [x] Confirmar CI de `main` #1139 com sucesso.
- [x] Confirmar Deploy GitHub Pages #1132 com sucesso.
- [x] Sincronizar os cinco documentos de continuidade com o estado pós-publicação.

### Validação física v66

- [ ] No mesmo iPhone que revelou o problema, confirmar ausência de faixa azul ao lado/abaixo do cabeçalho.
- [ ] iPhone/Safari: 320, 375, 390 e 430 px; portrait e landscape.
- [ ] Confirmar fundo contínuo entre safe area, margens, topbar e conteúdo em **Lista de compras**.
- [ ] Repetir em Início, Faturas e Relatórios para validar consistência global.
- [ ] Validar tema claro e escuro.
- [ ] Validar scroll longo, retorno ao topo, rotação e browser chrome expandido/recolhido.
- [ ] Confirmar que menu, título, `+` e Sync mantêm posição, tamanho e área tátil.
- [ ] Confirmar que desktop mantém a identidade visual anterior do Mercado.
- [ ] Num dispositivo com v65/v66, confirmar deteção/instalação da próxima versão pelo Centro de Atualização.

## P0 — v65 Lista de compras móvel preservada

- [x] Resumo compacto com contagem por comprar, comprados e total previsto.
- [x] Resumo financeiro completo em disclosure no mobile.
- [x] `+` do topbar reutiliza a ação existente de adicionar produto.
- [x] Botão de adição duplicado oculto apenas no mobile.
- [x] Filtros compactos e **Limpar filtros** apenas quando necessário.
- [x] Categorias pendentes abertas e **Comprados** recolhido.
- [x] Cartões priorizam checkbox, nome, quantidade e preço; secundários ficam em **Detalhes**.
- [x] Desktop, schema, cálculos, scanner, cofre e sincronização preservados.
- [x] PR #48 integrado e v65 publicada com CI/Pages verdes.

## P0 — regressões essenciais que não podem quebrar

- [x] Cofre isolado e credenciais fora do código público.
- [x] PBKDF2-SHA-256 + AES-GCM e IndexedDB preservados.
- [x] Faturas, pagamentos, datas civis e totais financeiros cobertos por CI.
- [x] `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário coberta por invariantes.
- [x] QR fiscal continua preenchimento assistido/local.
- [x] Lucide continua sistema de ícones local.
- [x] Um único indicador ativo na navegação inferior.
- [x] Topbar móvel usa a mesma geometria e o mesmo fundo em Início/Faturas/Compras/Relatórios.
- [x] Centro de Atualização continua same-origin e controlado pelo utilizador.
- [x] CSP/allowlist, responsividade, acessibilidade e sincronização permanecem na CI.
- [x] A v67 publicada mantém um único controlo móvel efetivo e não altera `appState`.

## P0 — validação física funcional ainda pendente

- [ ] Scanner: produtos reais no Pingo Doce e Continente, EAN-8/EAN-13, baixa luz, código inválido, repetido e ambíguo.
- [ ] Faturas: validar fisicamente passagem setembro → outubro com recorrência **Por preencher**.
- [ ] QR fiscal: permitir/recusar/revogar câmara e confirmar encerramento dos tracks.
- [ ] VoiceOver/TalkBack: Lista de compras, cabeçalho e controlos icon-only.

## P1 — segurança e simplificação técnica

- [ ] Rever a dependência runtime `@zxing/browser` carregada de `unpkg.com` e decidir entre auto-hospedagem local ou integridade verificável numa release dedicada.
- [ ] Depois das releases móveis validadas fisicamente, avaliar remoção do pipeline histórico de imagens (`market-retailer-image-policy.js`, `market-image-audit.js`, `market-official-images.js`, CSS associado).
- [ ] Manter Open Food Facts quando necessário para identificação por GTIN mesmo que o pipeline de fotografias seja removido.
- [ ] Consolidar CSS antigo substituído por `ui-consistency.css`/`v64-runtime.css`/`market-shopping-focus.css` apenas numa release separada, depois de hardware real verde.
- [ ] Avaliar incorporar o estado `draft` de recorrência diretamente no schema numa migração formal futura.
- [ ] Rever contraste dos estados em tema claro/escuro em hardware real.
- [ ] Confirmar nomes acessíveis de todos os botões icon-only.

## P2 — manutenção

- [ ] Remover glifos Unicode antigos depois da validação final Lucide.
- [ ] Avaliar fonte única de versão depois de validar transições reais pelo Centro de Atualização.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança e privacidade.
