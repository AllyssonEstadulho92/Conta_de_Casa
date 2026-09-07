# Changelog Técnico — Conta de Casa

## 2026-09-08 — v70 publicada: movimento visível do hambúrguer ↔ X

### Observação em hardware real

A validação da v69 no iPhone confirmou que os estados finais do menu estavam corretos: fechado apresentava hambúrguer e aberto apresentava `X`. O problema remanescente era de movimento percebido: a transformação podia parecer instantânea quando o mesmo botão era movido entre o topbar e o `<dialog>`.

### Causa técnica

`#mobileMenuBtn` é o mesmo nó DOM nos dois estados. Durante a abertura, o drawer é ativado e o botão é reparented para `.drawer-head`; ao fechar, regressa ao topbar. A v69 usava CSS transitions para interpolar `top`, `width`, `transform` e `opacity`. No Safari, o reparenting pode fazer com que o browser apresente diretamente o estado final e a transição deixe de ser claramente visível.

### Correção publicada

- preservado o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- preservados os três spans, a sentinela Lucide oculta e `data-ui-icon-slot="menu"`;
- preservados `aria-expanded`, `aria-label`, `title` e `data-menu-state`;
- criado `animateMenuGlyph(open)` com Web Animations;
- cada linha recebe keyframes explícitos de posição, largura, rotação, escala e opacidade;
- abertura é animada no frame seguinte ao reparenting para o drawer;
- fecho pelo X é animado no frame seguinte ao regresso do mesmo nó ao topbar;
- glifo recebe micro movimento de escala/inclinação para tornar o toque perceptível sem deslocar layout;
- duração definida em cerca de `240 ms` com `cubic-bezier(.22,.8,.2,1)`;
- CSS transition de `240 ms` permanece como fallback;
- `prefers-reduced-motion` impede os keyframes adicionais;
- fechos externos restauram estado sem deixar animações pendentes;
- a animação inversa iniciada pelo próprio X não é cancelada pelo evento `close` posterior do dialog.

### Distribuição publicada

- build: `v70`;
- revisão do menu: `70-menu4`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v70-menu4`;
- PR #58 integrado;
- merge: `f4144bff69a3b46e0f6ec78a00af50d29b704578`;
- CI final do PR #1279 (`34170191884`): **sucesso**;
- CI de `main` #1280 (`34170229908`): **sucesso**;
- Deploy GitHub Pages #1273 (`34170256426`): **sucesso**.

### Testes

A matriz completa passou incluindo sintaxe, finanças, auditoria, invariantes, isolamento, datas, formulários, QR, Mercado, scanner, contabilidade, ícones, consistência visual, menu animado, Centro de Atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade e sincronização.

A regressão v70 verifica explicitamente Web Animations/reparenting, keyframes por linha, micro movimento do glifo, abertura/fecho no frame seguinte, fallback CSS e `prefers-reduced-motion`.

### Segurança e dados

Nenhuma alteração de `STATE_VERSION`, `appState`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, cifragem, IndexedDB, autenticação, APIs ou sincronização.

A publicação técnica está concluída. A validação física final deve confirmar no iPhone/Safari que o movimento agora é efetivamente perceptível.

## 2026-09-07 — v69 publicada: estados hambúrguer/X corrigidos

- resolvido conflito entre `ui-icons.js`/Lucide e os três spans animáveis;
- sentinela SVG oculta e `data-ui-icon-slot="menu"` impedem substituição destrutiva;
- estado aberto apresenta X correto e regressa ao hambúrguer;
- foco programático de pointer deixa de mostrar moldura grande no Safari;
- teclado mantém `:focus-visible`;
- PR #56 / merge `a66df37b0fc345491dacf3cac91313d88d080a05`;
- CI e Pages verdes.

A validação física posterior confirmou os estados finais e revelou que o movimento entre eles ainda não era suficientemente perceptível, tratado na v70.

## 2026-09-07 — v68 publicada: painel do menu móvel refinado

- painel lateral mais compacto e responsivo;
- botão 44 × 44 px e linhas `22 / 18 / 14 px`;
- `aria-expanded`, `aria-label`, `title` e `data-menu-state` sincronizados;
- drawer `min(364px, calc(100vw - 24px))`, abaixo de 360 px `calc(100vw - 20px)`;
- safe areas, scroll interno, `overflow-x:hidden` e alvos de 48 px;
- PR #54 / merge `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI e Pages verdes.

## 2026-09-07 — v67 publicada: menu móvel hambúrguer/X

- um único controlo móvel para abrir/fechar;
- botão acompanha o `<dialog>` modal;
- `#drawerCloseBtn` oculto e fora da tabulação;
- `aria-expanded`, `aria-label` e `title` sincronizados;
- alvo de 44 × 44 px;
- `prefers-reduced-motion` preservado;
- PR #52 / commit `a1d932e580abaa06e7026a515f797411ab205f6e`;
- CI e Pages verdes.

## 2026-09-07 — v66 publicada: fundo móvel uniforme no iPhone

- shell claro `#f5f7fa` e escuro `#0f1722`;
- documento, body, app shell, main e topbar usam o mesmo fundo no mobile;
- topbar opaco e sem blur;
- desktop mantém identidade do Mercado;
- PR #50 / commit `9657d558000018af1ea44e6040441f2b9d91648c`;
- CI/Pages verdes.

## 2026-09-07 — v65 publicada: Lista de compras focada no supermercado

- resumo inicial compacto;
- detalhe financeiro em disclosure;
- `+` do topbar reutiliza ação existente;
- filtros compactos;
- categorias pendentes abertas e Comprados recolhido;
- desktop e estado financeiro preservados;
- PR #48 / commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`;
- CI/Pages verdes.

## 2026-09-07 — v64 publicada

- safe area/cabeçalho móvel uniformizados;
- scanner exige correspondência conservadora e mantém preço em `estimatedCents`;
- GTIN repetido pendente incrementa quantidade;
- novas ocorrências recorrentes começam **Por preencher** sem herdar valores variáveis;
- cofre, PIN e dados financeiros cifrados preservados.

## 2026-09-06 — v63 publicada

- `ui-consistency.css` como camada final de apresentação;
- Lucide permanece sistema vetorial oficial;
- navegação inferior com um único indicador ativo;
- `release-manifest.json` e Centro de Atualização controlado por Service Worker.
