# Changelog Técnico — Conta de Casa

## 2026-09-08 — v73 publicada: navegação lateral à direita

### Alterações

- sidebar desktop reposicionada para o lado direito;
- área principal desktop passa a reservar espaço com `margin-right`;
- borda, sombra, gradiente e indicador ativo espelhados para a nova direção;
- drawer móvel ancorado à direita com `inset: 0 0 0 auto`;
- entrada off-canvas invertida para `translate3d(calc(100% + 8px),0,0) → translate3d(0,0,0)`;
- abertura ~300 ms e fecho ~250 ms;
- swipe de abertura passa a começar na margem direita e mover-se para a esquerda;
- swipe de fecho passa a mover-se para a direita;
- hambúrguer/X, placeholder anti-salto, ARIA, foco, backdrop, Escape e `prefers-reduced-motion` preservados;
- header móvel fixed, safe areas, largura responsiva e scroll interno preservados;
- build/manifest/cache atualizados para `v73` / `73-menu8`.

### Publicação

- PR `#62`;
- merge `fb5c1b975b6494590eb16a3ab09762218e135299`;
- CI PR `#1383` (`34180312212`): sucesso;
- CI `main` `#1384` (`34180397609`): sucesso;
- GitHub Pages `#1377` (`34180421362`): sucesso.

### Escopo

Nenhuma alteração a faturas, pagamentos, Compras, scanner, cofre, IndexedDB, cifragem, autenticação, APIs ou sincronização. A validação física da nova composição continua pendente.

## 2026-09-08 — v72: continuidade visual do hambúrguer

- o mesmo botão passa a ser preparado dentro do drawer antes de `showModal()`;
- placeholder invisível de `44x44px` mantém a geometria do topbar;
- drawer e transformação hambúrguer → X começam no frame seguinte, reduzindo o desaparecimento/reaparecimento observado no Safari.

## 2026-09-08 — v71: drawer off-canvas com gesto horizontal

- drawer passou a acompanhar o dedo durante swipe;
- snap por distância/velocidade;
- backdrop acompanha o progresso;
- fecho real do `<dialog>` espera pela transição lateral;
- scroll vertical e `prefers-reduced-motion` preservados.

## Histórico anterior

As alterações das versões v58–v70 permanecem registadas no histórico Git e em `release-manifest.json`.
