# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v66`
Branch pública: `main`
Release integrada: PR #50
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v66 está integrada e publicada**. O PR #50 foi fundido em `main` no commit `9657d558000018af1ea44e6040441f2b9d91648c`. A CI do PR, run #1138, terminou com sucesso; a CI de `main`, run #1139, terminou com sucesso; o Deploy GitHub Pages, run #1132, terminou com sucesso.

A v66 corrige exclusivamente a diferença cromática branca/azulada observada fisicamente no iPhone no cabeçalho da **Lista de compras**.

## v66 — shell móvel com uma única cor

### Problema confirmado

Uma captura real de iPhone mostrou que a área do cabeçalho e a zona imediatamente adjacente não tinham a mesma cor: o cabeçalho aparecia quase branco e parte do fundo do módulo Compras apresentava tonalidade azulada.

A inspeção do código confirmou a causa:

- `market-brand.css` aplicava em `html.market-prototype-active .main` um `radial-gradient` azul sobre `var(--bg)`;
- o cabeçalho móvel é `fixed` e fica recuado por `--page-gutter`, deixando o fundo de `.main` visível nas margens;
- o cabeçalho usava fundo parcialmente composto e `backdrop-filter`, permitindo diferença de composição no Safari;
- `manifest.webmanifest`, HTML inicial e runtime de tema utilizavam tons claros próximos, mas não totalmente alinhados.

### Correção publicada

No mobile até 820 px, `v64-runtime.css` define um fundo canónico do shell:

- tema claro: `#f5f7fa`;
- tema escuro: `#0f1722`.

O mesmo fundo é aplicado a `html`, `body`, `.app-shell`, `.main`, ao `.main` específico do Mercado e ao `.topbar`. O cabeçalho fica opaco e sem `backdrop-filter` no mobile, impedindo que o radial azul do Mercado altere visualmente a sua cor no Safari.

O degradê do Mercado permanece disponível no desktop. Geometria, safe area, menu, título, `+`, Sync e navegação não foram alterados.

`manifest.webmanifest` usa `#f5f7fa` em `background_color` e `theme_color`. O build de Pages força o mesmo `theme-color` no HTML público; `render.js::applyTheme()` continua a trocar para `#0f1722` quando o tema escuro está ativo.

## Versionamento publicado

- build público: `v66`;
- revisão do shell CSS: `66-shell1`;
- runtime funcional preservado: `64-runtime1`;
- camada de Compras preservada: `65-shopping1`;
- revisão visual histórica preservada: `64-ui1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1`.

A distinção é intencional: `v64-runtime.js` não mudou; apenas a folha `v64-runtime.css`, historicamente associada ao cabeçalho móvel, recebeu a revisão de shell v66.

## QA confirmado

A matriz automatizada passou integralmente no PR e novamente em `main`, incluindo:

- finanças, auditoria e invariantes;
- isolamento/cifragem do cofre;
- faturas, pagamentos, datas e QR;
- Mercado, scanner e quantidade × preço;
- experiência de Compras v65;
- shell móvel claro/escuro e manifesto/theme-color;
- ícones, atualização, segurança, responsividade, navegação e acessibilidade;
- sincronização e conflitos técnicos.

O gate de GitHub Pages repetiu a verificação da revisão testada antes de preparar e publicar `dist`.

## Segurança e compatibilidade

A v66 não altera `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB ou sincronização.

Não foram adicionados segredos, tokens ou chaves. Permanece como dívida técnica separada a dependência runtime `@zxing/browser` carregada de `unpkg.com`.

## Validação física ainda pendente

A correção está publicada e coberta por CI, mas a confirmação final do aspeto exige o aparelho real:

- no mesmo iPhone que revelou o problema, confirmar ausência da faixa azul ao lado/abaixo do cabeçalho;
- iPhone/Safari: 320, 375, 390 e 430 px, portrait/landscape;
- confirmar fundo contínuo entre safe area, margens, topbar e conteúdo em Lista de compras;
- repetir em Início, Faturas e Relatórios;
- tema claro e escuro;
- scroll longo, retorno ao topo, rotação e chrome do navegador expandido/recolhido;
- confirmar que `+`, Sync, menu e navegação mantêm os mesmos alvos e alinhamento;
- restante validação física: scanner real, recorrências, QR e VoiceOver/TalkBack.

## Última alteração

Publicada a v66 com o shell móvel cromaticamente uniforme. PR #50, CI de `main` #1139 e GitHub Pages #1132 estão verdes.

## Próximo passo

1. instalar/atualizar para v66 no mesmo iPhone onde a diferença foi observada;
2. confirmar visualmente o fundo contínuo em claro e escuro;
3. se o hardware real ficar verde, manter a arquitetura estável e avançar para a validação funcional pendente;
4. tratar ZXing externo numa release de segurança separada.
