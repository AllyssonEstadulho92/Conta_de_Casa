# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v67`
Build candidato: `v68`
Branch pública: `main`
Branch candidata: `ui/v68-modern-menu-panel`
Release pública integrada: PR #52
Release candidata: PR #54
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v67 permanece a versão pública** enquanto a v68 está em validação no PR #54. A v68 refina exclusivamente o painel do menu móvel e a respetiva apresentação/interação, sem alterar navegação funcional, dados, APIs, autenticação, persistência ou regras de negócio.

## Auditoria do menu antes da v68

A análise do código real confirmou:

- `#mobileMenuBtn` é o comando móvel existente;
- `#mobileDrawer` é um `<dialog>` modal e continua a ser o único painel móvel;
- `events.js` mantém abertura/fecho, Escape, backdrop e adaptação ao breakpoint;
- `render.js` injeta os mesmos `NAV_GROUPS` no sidebar desktop e no drawer móvel, mantendo destinos coerentes;
- `mobile-menu-toggle.js/.css` v67 já implementam o mesmo botão hambúrguer ↔ `X`;
- a família de ícones oficial continua Lucide local, sem dependência nova;
- o breakpoint móvel existente é `<=820px`; entre 821–1180 px mantém-se o sidebar compacto;
- não foi identificado problema global de viewport, tamanho da aplicação ou overflow que justificasse redimensionar o shell.

O problema real estava no **painel aberto**: herdava estilos históricos de várias camadas, com sombra relativamente pesada, largura e espaçamentos menos refinados e estados hover/focus/current pouco específicos para o drawer.

## v68 — refinamento do painel móvel

### Alterações propostas

- preservado o mesmo botão de `44 × 44 px` e o glifo de três linhas que se transforma em `X`;
- animação curta, aproximadamente 200 ms, com `prefers-reduced-motion`;
- estado sincronizado em `aria-expanded`, `aria-label`, `title` e `data-menu-state`;
- drawer limitado a `min(364px, calc(100vw - 24px))`, deixando backdrop visível;
- salvaguarda específica abaixo de 360 px: `min(300px, calc(100vw - 20px))`;
- safe areas superiores/inferiores preservadas;
- scroll vertical interno no drawer e `overflow-x: hidden` para impedir deslocamento lateral;
- cabeçalho, marca e tipografia do drawer mais compactos;
- itens de navegação e ações inferiores com alvo mínimo de 48 px;
- estados hover apenas para pointer fino, `active`, `focus-visible` e página atual com tratamento discreto;
- tema claro/escuro preservado;
- sombra e backdrop suavizados para reduzir peso visual.

`#drawerCloseBtn` continua no DOM mas oculto. Não foi removido porque ainda é referenciado pelo wiring histórico de `events.js` e pela camada de ícones; eliminá-lo nesta tarefa exigiria um refactor mais amplo sem benefício funcional para o objetivo atual.

## Versionamento candidato

- build público proposto: `v68`;
- revisão do menu: `68-menu2`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- revisão visual histórica preservada: `64-ui1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v68-menu2`.

`release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js` foram atualizados para a candidata v68. A instalação continua controlada pelo utilizador através do Centro de Atualização.

## QA da v68

Foram atualizadas regressões para validar:

- hambúrguer → `X` → hambúrguer no mesmo controlo;
- estado ARIA e `data-menu-state` sincronizados;
- largura fluida e salvaguarda para ecrãs <360 px;
- safe areas e ausência de overflow horizontal;
- alvos de 48 px no painel;
- estados hover/active/focus/current;
- movimento reduzido;
- build, Service Worker e Centro de Atualização v68;
- preservação das camadas v65/v66 e módulos históricos do Mercado.

O resultado final da CI do PR #54 deve ser confirmado antes do merge.

## Segurança e compatibilidade

A v68 não altera `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo. Permanece como dívida técnica separada a dependência runtime `@zxing/browser` carregada de `unpkg.com`.

## v67/v66 preservadas

A arquitetura do botão único introduzida na v67 permanece. O mesmo nó DOM acompanha o `<dialog>` modal para continuar interativo como `X`, regressando ao topbar no fecho.

A v66 continua responsável pelo fundo canónico do shell móvel:

- claro: `#f5f7fa`;
- escuro: `#0f1722`.

A v68 não altera safe area do topbar, título, `+`, Sync, navegação inferior nem geometria global da aplicação.

## Validação física ainda pendente

Depois de a v68 ser publicada, validar em hardware real:

- iPhone/Safari: 320, 375, 390 e 430 px, portrait/landscape;
- Android/Chrome em smartphone pequeno e grande;
- tablet próximo do breakpoint 820/821 px;
- hambúrguer ↔ `X`, incluindo fecho por X, Escape, backdrop e seleção de item;
- scroll de um drawer com conteúdo maior que o viewport;
- ausência de scroll lateral e saltos de layout;
- tema claro/escuro;
- toque, rato, teclado, VoiceOver/TalkBack;
- `prefers-reduced-motion`;
- confirmar que as correções v65/v66/v67 continuam intactas.

Continuam pendentes as validações físicas funcionais já registadas: scanner real, recorrências e QR.

## Última alteração

Preparada a candidata v68 no PR #54 para refinar o painel móvel existente sem criar uma segunda implementação. O escopo está limitado a `mobile-menu-toggle.js/.css`, distribuição/versionamento e regressões relacionadas.

## Próximo passo

1. confirmar CI verde do PR #54;
2. rever o diff final e garantir ausência de alterações fora do escopo;
3. integrar em `main` apenas com a matriz verde;
4. confirmar CI de `main` e Deploy GitHub Pages;
5. atualizar estes documentos para estado publicado;
6. executar a validação física em iPhone/Android/tablet.
