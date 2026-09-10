# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico: `v76` — migração incremental TypeScript  
Branch pública: `main`  
Branch de trabalho atual: `feat/v76-typescript-veggie-menu`  
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
- `75-expenses1` integrado pelo PR #73 no commit funcional `176450fcb236a2272afb9d6a6983b42681aa705d`;
- Despesas/Faturas tem pesquisa, filtros, resumo, tabela desktop e cartões mobile modernizados sem alterar o domínio financeiro;
- após a integração de `75-expenses1`, CI `34496500755`, TypeScript `34496500641` e Pages `34496540096` concluíram com sucesso.

### v76 Bloco 1

A fundação TypeScript foi integrada pelo PR #72 no commit `2c1d78508507ab77d6df95850568d9fd7f6b9577`.

Inclui:

- `package.json` com TypeScript apenas como ferramenta de desenvolvimento;
- `tsconfig.json` com `strict`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes`;
- contratos em `src/types/` para valores, estado persistido e Mercado;
- `src/type-tests/contracts.ts`;
- workflow `.github/workflows/typescript.yml`.

O browser continua a receber JavaScript. A migração é feita por blocos e cada runtime novo só pode entrar depois de validação TypeScript + regressão.

## 3. Bloco atual — Veggie Burger TypeScript

Objetivo solicitado: substituir visualmente o hambúrguer de três linhas por **Veggie Burger de duas linhas**, fazendo as mesmas duas barras convergirem e rodarem para formar o **X**, sem duplicar controlos e sem desaparecer durante o gesto lateral.

### Factos encontrados antes da alteração

- `mobile-menu-toggle.js` v73 já controla abertura/fecho, swipe, foco e transferência do botão para o drawer;
- o botão histórico `#drawerCloseBtn` já é ocultado pelo controlador para evitar um segundo X;
- o controlador v73 coloca `#mobileMenuBtn` dentro de `.drawer-head`, que por sua vez está dentro de `.nav-drawer-shell`;
- `.nav-drawer-shell` é a superfície transformada durante o swipe;
- por isso, o mesmo botão também viajava com a superfície e podia desaparecer parcialmente enquanto o drawer era arrastado;
- a `.topbar` já era `sticky` na base, mas a nova camada reforça explicitamente esta invariável no mobile.

### Implementação

Criados:

- `src/ui/veggie-menu-toggle.ts` — fonte TypeScript estrita da nova camada;
- `v76-veggie-menu.js` — runtime browser derivado da fonte TypeScript;
- `v76-veggie-menu.css` — geometria, transição duas linhas → X, controlo overlay e acessibilidade;
- `tests/v76-veggie-menu.test.cjs` — proteção de isolamento, publicação e regressão.

Comportamento:

- fechado: duas linhas horizontais iguais (`Veggie Burger`);
- aberto: linha superior roda `+45°` e inferior `-45°`, formando o X;
- o mesmo `#mobileMenuBtn` continua a representar Abrir/Fechar e mantém `aria-expanded`/`aria-label` do controlador existente;
- quando o dialog está aberto, a camada TypeScript reposiciona o mesmo botão como filho direto de `#mobileDrawer`, fora do `.nav-drawer-shell` transformado;
- durante `data-dragging` e `data-closing`, o controlo permanece visível no top-layer do dialog;
- `.drawer-head` reserva espaço à direita para não colidir com o botão;
- `prefers-reduced-motion` elimina animações; `forced-colors` mantém contorno legível;
- não existem chamadas a `commit()`, `saveState()` nem acesso a estado financeiro nesta camada.

## 4. Distribuição do bloco atual

`scripts/prepare-pages.cjs` publica:

- `v76-veggie-menu.css?v=76-veggie-menu1`;
- `v76-veggie-menu.js?v=76-veggie-menu1` depois do controlador `mobile-menu-toggle.js` validado.

`sw.js` inclui ambos os assets e a revisão de cache termina em `veggie-menu1`.

O build público continua identificado como `v75`; `76-veggie-menu1` é uma revisão incremental do programa de migração v76, não uma alteração do schema financeiro.

## 5. QA automatizado do bloco atual

No head funcional `95bdacab47b8b97d5f6cf61d52fc492b5a10ceca`:

- TypeScript Foundation run `34516585121`: **sucesso**;
- CI run `34516585241`: **sucesso**;
- `src/ui/veggie-menu-toggle.ts` passou `npm run typecheck` em modo strict;
- `v76-veggie-menu.js` passou syntax check;
- teste específico `v76 Veggie Burger TypeScript tests`: sucesso;
- passaram igualmente finanças, auditoria, contagem, isolamento, datas, faturas, QR, Mercado, imagens, scanner, segurança, responsividade, navegação, acessibilidade, sincronização, PWA e manifest.

As alterações documentais posteriores criam novo head e exigem nova confirmação dos checks antes do merge.

## 6. Validação física ainda necessária

Após publicação em `main`, validar em iPhone/Safari/PWA:

- Veggie Burger fechado com exatamente duas linhas;
- toque: transição suave para X e regresso ao Veggie Burger;
- swipe de abertura e de fecho sem o controlo desaparecer;
- X fixo no canto superior direito do drawer;
- topbar permanece fixa durante scroll normal;
- ausência de segundo X;
- ausência de colisão entre botão, marca e título;
- larguras 320/375/390/430 px e orientação vertical/horizontal;
- tema claro/escuro e `prefers-reduced-motion`.

## 7. Próximo passo

1. confirmar novamente CI + TypeScript no head documental final;
2. comparar a branch com `main` e confirmar `behind 0`;
3. abrir PR e integrar apenas com checks verdes;
4. confirmar CI + TypeScript + GitHub Pages no SHA integrado;
5. validar fisicamente o menu no iPhone através de captura real;
6. depois retomar o Bloco 2 v76 — dinheiro, quantidades e datas — com paridade JS → TS antes de substituir runtime financeiro.
