# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v70`
Branch pública: `main`
Release pública integrada: PR #58
Commit público: `f4144bff69a3b46e0f6ec78a00af50d29b704578`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v70 está publicada**. A alteração foi integrada apenas depois da CI do PR terminar com sucesso; a CI de `main` e o Deploy GitHub Pages também concluíram com sucesso.

Referências de publicação:

- PR funcional: #58 — `v70: tornar visível o movimento do menu hambúrguer no iPhone`;
- merge em `main`: `f4144bff69a3b46e0f6ec78a00af50d29b704578`;
- CI final do PR: run #1279 (`34170191884`) — sucesso;
- CI de `main`: run #1280 (`34170229908`) — sucesso;
- Deploy GitHub Pages: run #1273 (`34170256426`) — sucesso.

## Problema confirmado pela validação física da v69

No iPhone, a v69 já apresentava corretamente hambúrguer no estado fechado e `X` no estado aberto. O problema remanescente era de movimento percebido: a transformação podia parecer instantânea porque o mesmo `#mobileMenuBtn` é movido entre o topbar e `.drawer-head` durante a abertura/fecho do `<dialog>`.

A v69 dependia principalmente de CSS transitions. Durante esse reparenting, Safari pode recalcular o elemento já no estado final sem apresentar frames intermédios suficientes para tornar a interpolação perceptível.

## v70 — correção publicada

A v70 preserva a arquitetura existente e acrescenta movimento explícito depois do reparenting:

- mantém o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- mantém as três linhas `22 / 18 / 14 px` e o X de `45deg / -45deg`;
- mantém a sentinela Lucide oculta e `data-ui-icon-slot="menu"`;
- mantém `aria-expanded`, `aria-label`, `title` e `data-menu-state` sincronizados;
- usa Web Animations com keyframes explícitos no frame seguinte à mudança de posição do botão;
- ao abrir, as linhas convergem e rodam até formar o X;
- ao fechar pelo X, a sequência inversa é executada depois de o botão regressar ao topbar;
- o glifo recebe apenas um micro movimento discreto de escala/inclinação, sem deslocar layout;
- duração aproximada: `240 ms`, easing `cubic-bezier(.22,.8,.2,1)`;
- CSS transition permanece como fallback;
- `prefers-reduced-motion` impede os keyframes adicionais;
- Escape, backdrop, foco, safe areas, largura do drawer, breakpoints e alvos de toque permanecem preservados.

## Versionamento público

- build: `v70`;
- revisão do menu: `70-menu4`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v70-menu4`.

## QA automatizado

A CI validou com sucesso sintaxe, finanças, auditoria, invariantes, isolamento do cofre, datas, formulários, QR, Mercado, scanner, contabilidade, ícones, consistência visual, menu animado, Centro de Atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade e sincronização.

A regressão específica da v70 cobre os keyframes por linha, o micro movimento do glifo, abertura/fecho no frame seguinte ao reparenting, fallback, movimento reduzido e sincronização de estado.

## Segurança e compatibilidade

A v70 não altera `appState`, `STATE_VERSION`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo.

## Validação física ainda necessária

A publicação técnica está concluída. Falta confirmar no iPhone/Safari que o movimento agora é efetivamente perceptível:

- hambúrguer → movimento → `X`;
- `X` → movimento inverso → hambúrguer;
- abrir/fechar repetidamente sem estado preso;
- ausência de salto de layout e moldura grande após toque;
- Escape, backdrop e seleção de item;
- portrait/landscape;
- Android/Chrome, tablet, tema claro/escuro e VoiceOver/TalkBack quando possível.

## Última alteração

Publicada a v70 para tornar visível o movimento do mesmo botão hambúrguer ↔ `X` no Safari/iPhone, preservando drawer, navegação, acessibilidade e dados.

## Próximo passo

Instalar a v70 pelo Centro de Atualização no iPhone e validar visualmente o movimento de abertura e fecho.
