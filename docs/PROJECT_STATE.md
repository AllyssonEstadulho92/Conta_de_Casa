# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v68`
Branch pública: `main`
Release pública integrada: PR #54
Commit público: `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v68 está publicada**. O PR #54 foi integrado em `main`; a CI de `main` e o Deploy GitHub Pages concluíram com sucesso.

Referências de publicação:

- PR funcional: #54 — `v68: refinar menu móvel e painel responsivo`;
- merge em `main`: `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI final do PR: run #1217 (`34166823195`) — sucesso;
- CI de `main`: run #1218 (`34166862646`) — sucesso;
- Deploy GitHub Pages: run #1211 (`34166882992`) — sucesso.

## Auditoria do menu

A análise do código real confirmou:

- `#mobileMenuBtn` é o comando móvel existente;
- `#mobileDrawer` é um `<dialog>` modal e continua a ser o único painel móvel;
- `events.js` mantém abertura/fecho, Escape, backdrop e adaptação ao breakpoint;
- `render.js` usa os mesmos `NAV_GROUPS` no sidebar desktop e no drawer móvel, mantendo opções e destinos coerentes;
- `mobile-menu-toggle.js/.css` continua a ser a camada isolada do botão hambúrguer ↔ `X`;
- Lucide local continua a ser o sistema oficial de ícones;
- o breakpoint móvel existente continua em `<=820px`; entre 821–1180 px mantém-se o sidebar compacto;
- não foi identificado problema global de viewport, tamanho da aplicação ou overflow que justificasse redimensionar o shell.

O problema efetivo estava na apresentação do painel aberto: regras históricas deixavam sombra mais pesada, densidade menos afinada e estados de interação pouco específicos.

## v68 — resultado publicado

- o mesmo botão de `44 × 44 px` continua a transformar as próprias três linhas em `X`;
- animação curta, aproximadamente 200 ms, com `prefers-reduced-motion`;
- `aria-expanded`, `aria-label`, `title` e `data-menu-state` permanecem sincronizados com o estado real;
- largura normal do drawer: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `width: calc(100vw - 20px)`, mantendo 20 px de backdrop e sem reduzir os alvos de toque;
- safe areas superiores/inferiores preservadas;
- scroll vertical interno e `overflow-x:hidden` evitam scroll lateral;
- cabeçalho, marca, tipografia e espaçamentos do painel foram compactados e alinhados;
- itens de navegação e ações inferiores mantêm alvo mínimo de 48 px, inclusive em smartphones pequenos;
- estados hover, active, focus-visible e página atual são discretos e consistentes;
- tema claro/escuro preservado;
- sombra e backdrop foram suavizados.

`#drawerCloseBtn` continua no DOM mas oculto. Ainda é referenciado pelo wiring histórico de `events.js` e `ui-icons.js`; removê-lo sem eliminar essas dependências criaria um refactor lateral desnecessário nesta release.

## Versionamento público

- build: `v68`;
- revisão do menu: `68-menu2`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- revisão visual histórica preservada: `64-ui1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v68-menu2`.

`release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js` estão alinhados com a v68. A instalação continua controlada pelo utilizador através do Centro de Atualização.

## QA automatizado

A matriz publicada validou:

- hambúrguer → `X` → hambúrguer no mesmo controlo;
- estado ARIA e `data-menu-state`;
- largura responsiva, incluindo ecrãs <360 px;
- safe areas, scroll e ausência de overflow horizontal;
- alvos de 48 px no painel;
- hover/active/focus/current;
- movimento reduzido;
- build, Service Worker e Centro de Atualização v68;
- finanças, auditoria, datas, faturas, QR, Mercado, scanner, ícones, segurança, responsividade, acessibilidade, navegação e sincronização.

## Segurança e compatibilidade

A v68 não altera `appState`, `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo. Permanece como dívida técnica separada a dependência runtime `@zxing/browser` carregada de `unpkg.com`.

## Validação física ainda pendente

A CI não substitui hardware real. Validar:

- iPhone/Safari: 320, 375, 390 e 430 px, portrait/landscape;
- Android/Chrome em smartphone pequeno e grande;
- tablet junto do breakpoint 820/821 px;
- fecho por `X`, Escape, backdrop e seleção de item;
- scroll de drawer maior que o viewport;
- ausência de scroll lateral e saltos de layout;
- tema claro/escuro;
- toque, rato, teclado, VoiceOver/TalkBack;
- `prefers-reduced-motion`;
- continuidade das correções v65/v66/v67.

Continuam pendentes as validações físicas funcionais já registadas: scanner real, recorrências e QR.

## Última alteração

Publicada a v68 através do PR #54, mantendo um único menu móvel e refinando apenas apresentação, interação, responsividade, distribuição e respetivas regressões.

## Próximo passo

1. validar a v68 em iPhone/Android/tablet reais;
2. confirmar comportamento em portrait/landscape e tecnologias de apoio;
3. tratar ZXing externo e eventual remoção definitiva de `#drawerCloseBtn` apenas em tarefas separadas e auditadas.
