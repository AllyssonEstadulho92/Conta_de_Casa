# Changelog Técnico — Conta de Casa

## 2026-09-04 — correção de corte do viewport mobile

### Problema

Em iPhone/Safari, páginas com conteúdo longo podiam apresentar um corte horizontal do conteúdo e uma grande área vazia antes da navegação inferior. A evidência foi observada na Lista de compras, onde o segundo item ficava parcialmente visível apesar de estar corretamente renderizado.

### Causa

O contentor permanente da aplicação estava limitado por uma variável CSS (`--visual-vh`) alimentada por `window.visualViewport.height`. Essa medida é adequada para acompanhar teclado e viewport visual transitório, mas é instável como dimensão estrutural de todo o shell da aplicação em Safari móvel.

### Alterações

- adicionado `mobile-layout.css` como última camada CSS;
- `.app-shell` e `.main` passam a seguir `100dvh`/`100svh` no mobile;
- mantida a utilização de VisualViewport para diálogos e deteção do teclado;
- reforçado cabeçalho sticky no contentor de scroll mobile;
- cartões de Compras compactados entre 360 px e 560 px;
- `mobile-layout.css` adicionado à allowlist de GitHub Pages e Service Worker;
- criado teste de regressão `tests/mobile-layout-regression.test.cjs`;
- CI e workflow de Pages passam a executar o novo teste.

### Segurança e dados

Sem alteração de schema, cálculos financeiros, IndexedDB, PBKDF2, AES-GCM, PIN/palavra-passe, backups ou sincronização.
