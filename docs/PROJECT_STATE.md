# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v68`
Build candidato: `v69`
Branch pública: `main`
Branch candidata: `fix/v69-mobile-menu-animation`
Release pública integrada: PR #54
Commit público: `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v68 continua pública**. A validação física através das capturas reais do iPhone revelou que o comportamento anunciado do botão hambúrguer/X não estava efetivamente visível no runtime: ao abrir o drawer, o botão continuava a mostrar o hambúrguer e podia apresentar uma moldura de foco grande.

## Problema confirmado na v68

### Facto observado

Nas capturas reais:

- estado fechado: o topbar mostra o hambúrguer;
- estado aberto: o mesmo controlo é movido para o drawer, mas continua a mostrar o hambúrguer em vez do `X`;
- no drawer aparece uma moldura visual em torno do botão após o foco programático.

### Causa técnica confirmada no código

`mobile-menu-toggle.js` cria corretamente três `<span>` animáveis e altera `aria-expanded`. Porém `ui-icons.js::hydrate()` contém:

`fillIcon(document.querySelector('#mobileMenuBtn'),'menu',22)`

O sistema de ícones observa mudanças de `aria-expanded` e `class`. Sempre que o botão muda de estado, `fillIcon()` substitui os três `<span>` por um SVG Lucide estático de menu. Assim, o CSS da transformação hambúrguer → `X` deixa de ter elementos para animar.

A moldura observada é compatível com o `:focus-visible` aplicado após o foco programático do mesmo controlo no Safari/iPhone.

## v69 — correção candidata

A v69 preserva a arquitetura atual e corrige apenas o conflito de runtime:

- mantém o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- mantém três linhas proporcionais `22 / 18 / 14 px`;
- mantém o mesmo nó DOM durante fechado/aberto;
- preserva um SVG Lucide oculto como sentinela de hidratação e `data-ui-icon-slot="menu"`, impedindo `fillIcon()` de substituir o glifo animável;
- estado aberto é refletido por `aria-expanded="true"` e `data-menu-state="open"`;
- linha superior roda `45deg`, linha inferior `-45deg` e a linha central colapsa;
- animação aproximada de 190 ms, curta e discreta;
- `prefers-reduced-motion` continua suportado;
- foco programático após toque/rato não desenha a moldura observada no Safari;
- ativação por teclado mantém indicação de foco visível;
- drawer, largura, safe areas, scroll, navegação e alvos de 48 px da v68 permanecem inalterados.

## Versionamento candidato

- build: `v69`;
- revisão do menu: `69-menu3`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v69-menu3`.

`release-manifest.json`, `scripts/prepare-pages.cjs`, `sw.js` e regressões do menu/atualização/consistência foram alinhados com a candidata.

## Segurança e compatibilidade

A v69 não altera `appState`, `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo.

## QA necessário

Antes de publicar a v69:

1. CI do PR deve ficar totalmente verde;
2. confirmar regressão específica entre `ui-icons.js` e `mobile-menu-toggle.js`;
3. confirmar build/manifest/Service Worker v69;
4. integrar em `main` apenas com a matriz verde;
5. confirmar CI de `main` e Deploy GitHub Pages;
6. repetir validação física no iPhone que revelou o problema.

## Validação física prioritária após publicação

- abrir: hambúrguer → `X` real no mesmo botão;
- fechar pelo `X`: `X` → hambúrguer;
- confirmar ausência de moldura visual após toque;
- confirmar foco visível por teclado;
- Escape, backdrop e seleção de item;
- portrait/landscape;
- iPhone/Safari e Android/Chrome;
- tema claro/escuro e VoiceOver/TalkBack.

## Última alteração

Preparada a candidata v69 para corrigir o conflito entre o hidratador Lucide e o glifo animado do menu móvel, identificado pela validação física da v68.

## Próximo passo

Abrir PR da v69, executar a CI completa, integrar apenas se verde e confirmar a correção em hardware real após o deploy.
