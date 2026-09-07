# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v65`
Candidato em validação: `v66`
Branch candidata: `fix/v66-mobile-shell-color`
Branch pública: `main`
Última release pública integrada: PR #48
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v65 continua a versão pública confirmada**. O PR #48 está integrado em `main` no commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`; a documentação pós-publicação foi sincronizada pelo PR #49 no commit `c69a4991dfb6125ef6c389d9dc0388e268ec8860`. A CI e o GitHub Pages desse estado terminaram verdes.

A alteração atual prepara a **v66**, exclusivamente para corrigir a diferença cromática branca/azulada observada fisicamente no iPhone no cabeçalho da **Lista de compras**.

## v66 — shell móvel com uma única cor

### Problema confirmado

Uma captura real de iPhone mostrou que a área do cabeçalho e a zona imediatamente adjacente não tinham a mesma cor: o cabeçalho aparecia quase branco e parte do fundo do módulo Compras apresentava tonalidade azulada.

A causa está no CSS real:

- `market-brand.css` aplica em `html.market-prototype-active .main` um `radial-gradient` azul sobre `var(--bg)`;
- o cabeçalho móvel é `fixed` e fica recuado por `--page-gutter`, deixando o fundo de `.main` visível nas margens;
- o cabeçalho também usava `color-mix` com transparência e `backdrop-filter`, permitindo composição visual diferente no Safari;
- `manifest.webmanifest`, `index.html` e `applyTheme()` usavam tons claros próximos, mas não idênticos.

## Correção candidata

No mobile até 820 px, `v64-runtime.css` passa a definir um fundo canónico do shell:

- tema claro: `#f5f7fa`;
- tema escuro: `#0f1722`.

Esse fundo é aplicado a `html`, `body`, `.app-shell`, `.main`, ao `.main` específico do Mercado e ao `.topbar`. O cabeçalho fica opaco e sem `backdrop-filter` no mobile, impedindo que o radial azul do Mercado altere visualmente a sua cor no Safari.

O degradê do Mercado permanece disponível no desktop; apenas o shell móvel é uniformizado. Geometria, safe area, menu, título, `+`, Sync e navegação não foram alterados.

`manifest.webmanifest` também passa a usar `#f5f7fa` em `background_color` e `theme_color`, coerente com o valor claro já aplicado por `render.js::applyTheme()`. O build de Pages força o mesmo `theme-color` no HTML público.

## Versionamento

A candidata usa:

- build público: `v66`;
- revisão do shell CSS: `66-shell1`;
- runtime funcional preservado: `64-runtime1`;
- camada de Compras preservada: `65-shopping1`;
- revisão visual histórica preservada: `64-ui1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1`.

A distinção é intencional: `v64-runtime.js` não mudou; apenas a folha `v64-runtime.css`, historicamente associada ao cabeçalho móvel, recebeu a revisão de shell v66.

## Risco e segurança

Risco funcional esperado: baixo. A alteração é CSS, manifesto e versionamento de distribuição. Não escreve em `appState`, não altera `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB ou sincronização.

Não foram adicionados segredos, tokens ou chaves. Permanece como dívida técnica separada a dependência runtime `@zxing/browser` carregada de `unpkg.com`.

## QA da candidata

Foram atualizados testes para verificar explicitamente:

- uma única cor de shell móvel em claro/escuro;
- remoção de blur/transparência do topbar móvel;
- sobreposição do radial do Mercado apenas no mobile;
- alinhamento entre `theme-color` e `manifest.webmanifest`;
- build `v66`, revisão `66-shell1` e novo cache;
- preservação do runtime `64-runtime1` e da experiência de Compras `65-shopping1`.

A CI e o GitHub Pages da v66 ainda não devem ser considerados confirmados até o PR ser criado, validado e integrado.

## Validação física ainda pendente

- iPhone/Safari: 320, 375, 390 e 430 px, portrait/landscape;
- confirmar que safe area, margens laterais, cabeçalho e área de conteúdo mostram o mesmo fundo na Lista de compras;
- repetir a verificação em Início, Faturas e Relatórios para garantir consistência global;
- tema claro e escuro;
- scroll longo, retorno ao topo, rotação e chrome do navegador expandido/recolhido;
- confirmar que `+`, Sync, menu e navegação mantêm os mesmos alvos e alinhamento;
- restante validação física da v65: scanner real, recorrências, QR, VoiceOver/TalkBack e atualização controlada.

## Última alteração

Preparada a candidata v66 para eliminar a diferença branco/azulado do shell móvel, usando uma cor canónica única e removendo a composição translúcida do cabeçalho no mobile.

## Próximo passo

1. concluir atualização da cobertura de regressão e documentação da candidata;
2. abrir PR da v66 e obter CI totalmente verde;
3. integrar apenas com CI verde;
4. confirmar CI de `main` e Deploy GitHub Pages;
5. sincronizar estes documentos para marcar v66 como pública;
6. validar a correção no mesmo iPhone que revelou a diferença cromática.
