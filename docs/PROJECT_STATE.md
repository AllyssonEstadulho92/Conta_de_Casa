# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v67`
Branch pública: `main`
Release pública integrada: PR #52
Commit público: `a1d932e580abaa06e7026a515f797411ab205f6e`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v67 está publicada**. O PR #52 foi integrado em `main`, a CI final de `main` terminou com sucesso e o Deploy GitHub Pages concluiu sem erro.

Referências de publicação:

- PR: #52 — `v67: menu hambúrguer animado no mobile`;
- merge em `main`: `a1d932e580abaa06e7026a515f797411ab205f6e`;
- CI do PR: run #1178 — sucesso;
- CI de `main`: run #1179 (`34157629736`) — sucesso;
- Deploy GitHub Pages: run #1172 (`34157653463`) — sucesso.

## v67 — menu hambúrguer/X animado

### Objetivo implementado

O comando móvel foi consolidado num único botão moderno:

- fechado: hambúrguer de três traços proporcionais;
- aberto: os próprios traços transformam-se num `X`;
- novo toque no `X`: fecha o menu e repõe o hambúrguer;
- sem moldura branca, sem fundo verde/estado selecionado e sem segundo `X` visível;
- dimensões compatíveis com o cabeçalho atual da aplicação.

### Implementação publicada

`mobile-menu-toggle.css` e `mobile-menu-toggle.js` formam uma camada final e isolada da navegação móvel.

O botão `#mobileMenuBtn` mantém um alvo tátil de `44 × 44 px`; o glifo ocupa aproximadamente `24 × 18 px`. Os três traços usam comprimentos progressivos e transformam-se por rotação/translação em `X`. Em `prefers-reduced-motion: reduce`, a transição é desativada.

Como `#mobileDrawer` é um `<dialog>` modal, elementos exteriores ficam inertes enquanto o menu está aberto. Para que o **mesmo botão** continue tocável como `X`, o mesmo nó DOM é movido para o cabeçalho do drawer depois de `showModal()` e regressa ao topbar quando o menu fecha. Isto preserva a semântica modal e evita dois controlos concorrentes.

O botão legado `#drawerCloseBtn` permanece no DOM por compatibilidade com o wiring histórico de `events.js`, mas fica oculto e fora da ordem de tabulação. Escape, clique no backdrop e o evento `close` continuam a usar o fluxo existente.

`aria-expanded`, `aria-label` e `title` acompanham o estado **Abrir menu / Fechar menu**.

## Versionamento publicado

- build: `v67`;
- revisão do menu: `67-menu1`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- revisão visual histórica preservada: `64-ui1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v67-menu1`.

`release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js` estão alinhados com a v67. A instalação continua controlada pelo utilizador através do Centro de Atualização.

## QA da v67

`tests/mobile-menu-toggle.test.cjs` valida:

- transformação hambúrguer → `X` → hambúrguer;
- utilização do mesmo nó DOM no topbar e no drawer;
- remoção visual do `X` duplicado;
- alvo de 44 px e ausência de fundo verde/borda visual;
- estado ARIA e nomes acessíveis;
- `prefers-reduced-motion`;
- inclusão dos assets na distribuição e no Service Worker;
- coerência entre build v67 e `release-manifest.json`.

A matriz final de CI passou também por finanças, cofre, Mercado, scanner, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

## Segurança e compatibilidade

A v67 não altera `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos nem armazenamento novo. Permanece como dívida técnica separada a dependência runtime `@zxing/browser` carregada de `unpkg.com`.

## v66 preservada

A v66 continua responsável por um único fundo canónico do shell móvel:

- tema claro: `#f5f7fa`;
- tema escuro: `#0f1722`.

O fundo continua aplicado ao documento, `body`, `.app-shell`, `.main`, Mercado e `.topbar` até 820 px, com topbar opaco e sem `backdrop-filter`. A v67 não altera esta geometria nem a política cromática.

## Validação física ainda pendente

A publicação e a validação automatizada estão confirmadas. A validação física continua necessária no aparelho real:

- iPhone/Safari: 320, 375, 390 e 430 px, portrait/landscape;
- hambúrguer → `X` ao abrir e `X` → hambúrguer ao fechar;
- fechar por `X`, Escape, backdrop e seleção de navegação;
- ausência de segundo `X`, moldura branca ou fundo verde;
- alinhamento do ícone com título, `+` e Sync;
- tema claro e escuro;
- VoiceOver/TalkBack e foco por teclado;
- confirmar que a correção cromática v66 continua intacta.

Continuam pendentes as validações físicas funcionais já registadas: scanner real, recorrências, QR e tecnologias de apoio.

## Última alteração

Publicada a v67 através do PR #52, com um único botão móvel animado, assets dedicados, versão/cache próprios e regressões automáticas. CI de `main` #1179 e Deploy Pages #1172 terminaram com sucesso.

## Próximo passo

1. validar fisicamente no iPhone o ciclo hambúrguer ↔ `X` e os restantes fechos do drawer;
2. confirmar alinhamento e ausência de regressões visuais em 320–430 px;
3. validar VoiceOver/TalkBack e movimento reduzido;
4. manter ZXing externo como tarefa de segurança separada.
