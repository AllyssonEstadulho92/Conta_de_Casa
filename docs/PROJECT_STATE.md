# Estado do Projeto — Conta de Casa

Atualizado: 4 de setembro de 2026
Build funcional: v50
Distribuição: GitHub Pages

## Estado atual

A aplicação continua local-first, com cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

Foi auditado um defeito de layout reproduzido em iPhone/Safari: a área de conteúdo podia terminar prematuramente e deixar uma grande zona vazia acima da navegação inferior, apesar de existirem mais cartões na lista.

## Problema confirmado

O shell mobile (`.app-shell` e `.main`) estava limitado por `--visual-vh`. Essa variável é atualizada em JavaScript a partir de `window.visualViewport.height`, uma medida que pode variar durante alterações da barra do Safari e abertura/fecho do teclado. Como `html.app-active body` bloqueia o scroll global, um valor transitório reduzido podia limitar o contentor principal e produzir o corte visual observado.

A lista de compras continuava a ser gerada integralmente; o defeito encontrava-se na camada de layout/viewport, não no modelo de dados nem no `renderMarket()`.

## Última alteração

- criado `mobile-layout.css`, carregado depois do design system;
- o shell permanente mobile passa a usar `100dvh`/`100svh`, mantendo `VisualViewport` apenas para métricas de teclado e diálogos;
- reforçado o `sticky` do cabeçalho dentro do contentor móvel;
- cartões de compras entre 360 px e 560 px foram compactados sem reduzir os alvos tácteis principais;
- novo teste `tests/mobile-layout-regression.test.cjs` protege a correção;
- bundle do GitHub Pages e Service Worker passam a incluir `mobile-layout.css`.

## Impacto funcional

Nenhuma alteração foi feita a cálculos financeiros, PIN/palavra-passe, PBKDF2, AES-GCM, IndexedDB, backups, sincronização, estrutura dos registos ou regras de negócio.

## Próximo passo

1. Confirmar CI e publicação do GitHub Pages.
2. Validar fisicamente no iPhone com Safari, incluindo scroll longo em Compras, Faturas, Relatórios e abertura/fecho do teclado.
3. Se a validação real for positiva, consolidar progressivamente regras mobile duplicadas de `styles.css` e `design-system.css`, sem alterar comportamento.
