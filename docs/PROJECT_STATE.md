# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico: `v76` — migração incremental TypeScript  
Branch pública: `main`  
HEAD funcional publicado: `f196545662b5d120a0dd21b2c498a209cfc144d3`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- preço pesquisado no Mercado permanece `estimatedCents` e preço efetivamente confirmado permanece `actualCents`;
- identidade canónica do catálogo/fotografia permanece `marketId|pid` onde esse pipeline é utilizado;
- QR, scanner, backup/restauro, PWA, Service Worker e funcionamento offline não podem regredir por causa da migração TypeScript;
- alterações visuais não podem modificar cálculos, pagamentos, faturas, persistência ou segurança.

## 2. Estado integrado em `main`

### v75 funcional

- `75-market1` integrado pelo PR #71;
- `75-expenses1` integrado pelo PR #73 no commit `176450fcb236a2272afb9d6a6983b42681aa705d`;
- Despesas/Faturas tem pesquisa, filtros, resumo, tabela desktop e cartões mobile modernizados sem alterar o domínio financeiro;
- após `75-expenses1`, CI `34496500755`, TypeScript `34496500641` e Pages `34496540096` concluíram com sucesso.

### v76 TypeScript

- fundação TypeScript integrada pelo PR #72 no commit `2c1d78508507ab77d6df95850568d9fd7f6b9577`;
- `76-veggie-menu1` integrado pelo PR #74 no commit `f196545662b5d120a0dd21b2c498a209cfc144d3`.

O browser continua a receber JavaScript compatível. A migração é feita por blocos e cada runtime novo só entra depois de typecheck e regressão.

## 3. `76-veggie-menu1` — estado final publicado

Objetivo: substituir visualmente o hambúrguer de três linhas por **Veggie Burger de duas linhas**, fazendo as mesmas duas barras convergirem e rodarem para formar o **X**, sem duplicar controlos e sem desaparecer durante o gesto lateral.

### Diagnóstico confirmado

- `mobile-menu-toggle.js` v73 já controla abertura/fecho, swipe, foco e transferência do botão para o drawer;
- `#drawerCloseBtn` histórico já é ocultado pelo controlador para evitar um segundo X;
- o controlador v73 coloca `#mobileMenuBtn` dentro de `.drawer-head` quando abre;
- `.drawer-head` está dentro de `.nav-drawer-shell`, superfície transformada durante o swipe;
- por isso, o mesmo botão podia viajar com a superfície e desaparecer parcialmente durante o gesto;
- `.topbar` já era sticky na base, e a nova camada reforça explicitamente esta invariável no mobile.

### Implementação publicada

- `src/ui/veggie-menu-toggle.ts` — fonte TypeScript strict;
- `v76-veggie-menu.js` — runtime browser derivado da fonte TypeScript;
- `v76-veggie-menu.css` — geometria, transição duas linhas → X, overlay e acessibilidade;
- `tests/v76-veggie-menu.test.cjs` — isolamento, publicação e regressão.

Comportamento:

- fechado: exatamente duas linhas horizontais (`Veggie Burger`);
- aberto: linha superior `+45°` e inferior `-45°`, formando o X;
- existe apenas um `#mobileMenuBtn` para Abrir/Fechar;
- `aria-expanded`/`aria-label` permanecem associados ao mesmo controlo;
- com o dialog aberto, o mesmo botão é reposicionado como filho direto de `#mobileDrawer`, fora da `.nav-drawer-shell` transformada;
- durante `data-dragging` e `data-closing`, o controlo permanece visível no top-layer do dialog;
- `.drawer-head` reserva espaço à direita para evitar colisão;
- `prefers-reduced-motion` elimina animações e `forced-colors` mantém contraste;
- a camada não chama `commit()`, `saveState()` nem acede ao estado financeiro.

## 4. Distribuição

`scripts/prepare-pages.cjs` publica:

- `v76-veggie-menu.css?v=76-veggie-menu1`;
- `v76-veggie-menu.js?v=76-veggie-menu1` depois de `mobile-menu-toggle.js`.

`sw.js` inclui ambos os assets e a revisão de cache termina em `veggie-menu1`.

O build público continua identificado como `v75`; `76-veggie-menu1` é uma revisão incremental do programa v76 e não altera o schema financeiro.

## 5. QA confirmado

### Antes do merge

Head final do PR #74: `d2936117634ab167b5ee60040f616d969a83e7b8`.

- TypeScript Foundation `34517080694`: sucesso;
- CI push `34517080695`: sucesso;
- CI do PR `34517171967`: sucesso;
- TypeScript do PR `34517171997`: sucesso;
- branch estava `behind 0` relativamente a `main` antes do merge.

### Depois do merge em `main`

Commit publicado: `f196545662b5d120a0dd21b2c498a209cfc144d3`.

- TypeScript Foundation `34517268279`: **sucesso**;
- CI `34517268450`: **sucesso**;
- GitHub Pages `34517324242`: **sucesso**;
- o CI incluiu `v76 Veggie Burger TypeScript tests` e as regressões de finanças, faturas, Mercado, scanner, segurança, responsividade, acessibilidade, sincronização e manifest.

## 6. Validação física ainda necessária

Em iPhone/Safari/PWA validar:

- fechado mostra exatamente duas linhas;
- toque transforma as duas linhas em X e regressa sem salto;
- swipe de abertura e fecho sem o controlo desaparecer;
- X permanece no canto superior direito do drawer;
- não aparece segundo X;
- topbar permanece fixa durante scroll normal;
- sem colisão entre botão, marca e título;
- 320/375/390/430 px e orientação vertical/horizontal;
- tema claro/escuro e `prefers-reduced-motion`.

## 7. Próximo passo

1. validar fisicamente `76-veggie-menu1` no iPhone através de captura real;
2. corrigir apenas se a evidência em hardware mostrar regressão;
3. retomar `feat/v76-money-dates` para o Bloco 2 — dinheiro, quantidades e datas — com paridade JS → TS antes de substituir runtime financeiro.
