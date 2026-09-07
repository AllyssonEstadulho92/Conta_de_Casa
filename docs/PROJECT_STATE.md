# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v69`
Build candidato: `v70`
Branch pública: `main`
Branch candidata: `fix/v70-visible-menu-motion`
Release pública atual: PR #56
Commit público atual: `a66df37b0fc345491dacf3cac91313d88d080a05`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v69 continua pública**. A validação física no iPhone confirmou que os dois estados visuais estão agora corretos: fechado apresenta hambúrguer e aberto apresenta `X`, sem o conflito Lucide que existia antes. A nova observação é diferente: a transformação entre esses estados pode parecer instantânea, sem movimento claramente perceptível ao toque.

## Problema observado após validação física da v69

### Factos observáveis

- estado fechado: hambúrguer correto no topbar;
- estado aberto: `X` correto no cabeçalho do drawer;
- painel abre corretamente e a navegação continua funcional;
- a transformação entre os dois estados não fica claramente visível no iPhone como uma animação contínua.

### Causa técnica provável confirmada pela arquitetura

`#mobileMenuBtn` é deliberadamente o mesmo nó DOM nos dois estados. Ao abrir, `openMobileDrawer()` ativa o `<dialog>` e `mobile-menu-toggle.js` move esse mesmo botão do topbar para `.drawer-head`. Ao fechar, o nó regressa ao topbar.

A v69 depende principalmente de CSS transitions nas propriedades `top`, `width`, `transform` e `opacity`. Durante o mesmo ciclo em que o elemento muda de ancestral/render tree, Safari pode não apresentar um frame intermédio suficiente para tornar a transição perceptível. O estado final continua correto, mas o movimento pode ser consumido pelo reparenting.

## v70 — correção candidata

A v70 mantém a arquitetura v69 e acrescenta movimento explícito depois da reposição do nó:

- mantém o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- mantém as três linhas `22 / 18 / 14 px` e o X de `45deg / -45deg`;
- mantém a sentinela Lucide oculta e `data-ui-icon-slot="menu"`;
- mantém `aria-expanded`, `aria-label`, `title` e `data-menu-state` sincronizados;
- depois de o botão entrar no drawer, executa Web Animations com keyframes explícitos no frame seguinte;
- ao fechar pelo X, executa a sequência inversa depois de o botão regressar ao topbar;
- acrescenta apenas um micro movimento discreto de escala/inclinação ao glifo, sem deslocar o layout;
- duração: cerca de `240 ms` com `cubic-bezier(.22,.8,.2,1)`;
- mantém CSS transition como fallback;
- `prefers-reduced-motion` impede os keyframes adicionais;
- fechos externos por Escape/backdrop continuam a restaurar estado sem deixar animações pendentes;
- foco por teclado, foco por pointer, safe areas, largura do drawer, breakpoints e alvos de toque permanecem inalterados.

## Versionamento candidato

- build: `v70`;
- revisão do menu: `70-menu4`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v70-menu4`.

## Segurança e escopo

A v70 não altera `appState`, `STATE_VERSION`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo. O uso de Web Animations é exclusivamente local no elemento visual do menu.

## QA necessário antes de publicar

1. CI do PR totalmente verde;
2. validar sintaxe e regressão específica de Web Animations/reparenting;
3. validar `prefers-reduced-motion`;
4. validar build/manifest/cache `v70` / `70-menu4`;
5. integrar em `main` apenas com CI verde;
6. confirmar CI de `main` e Deploy GitHub Pages;
7. repetir validação física no mesmo iPhone.

## Validação física prioritária v70

- tocar no hambúrguer e ver as linhas moverem-se até formar o `X`;
- tocar no `X` e ver a animação inversa até ao hambúrguer;
- confirmar que não existe salto de layout nem moldura grande após toque;
- confirmar abertura/fecho repetidos sem estado preso;
- Escape, backdrop e seleção de item;
- portrait/landscape;
- iPhone/Safari, Android/Chrome e tablet junto do breakpoint 820/821 px;
- tema claro/escuro e VoiceOver/TalkBack.

## Última alteração

Preparada a candidata v70 para tornar fisicamente perceptível o movimento hambúrguer ↔ `X` no mesmo botão, sem reescrever o drawer nem a navegação.

## Próximo passo

Executar CI completa da v70, integrar apenas se verde, publicar pelo GitHub Pages e repetir o teste visual no iPhone.
