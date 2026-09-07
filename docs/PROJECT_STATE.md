# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v70`
Build candidato: `v71`
Branch pública: `main`
Branch candidata: `ui/v71-smooth-drawer`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v70 continua pública e funcional**. A validação física no iPhone confirmou que o painel abre, os destinos estão corretos e o hambúrguer/X funciona. A nova observação é exclusivamente de movimento do painel: a entrada lateral continua visualmente seca, porque o drawer final da v70 parte apenas de `translateX(-18px)` e o backdrop já surge praticamente no estado final.

## Problema identificado pela validação física

### Factos observáveis

- o drawer abre no lado correto e mantém a hierarquia visual;
- a página selecionada e os restantes itens continuam funcionais;
- o `X` está corretamente integrado no cabeçalho do drawer;
- a entrada do painel não transmite um movimento lateral contínuo da esquerda para a direita;
- o fecho nativo do `<dialog>` também pode desaparecer antes de uma animação de saída ser visível.

### Causa técnica

A camada final `mobile-menu-toggle.css` da v70 usa apenas `translateX(-18px) → 0` e `opacity .82 → 1`, portanto o deslocamento é demasiado pequeno para comunicar uma entrada off-canvas real. Além disso, `events.js::closeMobileDrawer()` e `render.js::showPage()` chamam `drawer.close()` imediatamente. Um `<dialog>` fechado deixa de participar na renderização, pelo que uma transição de saída CSS não teria tempo de terminar.

## v71 — correção candidata

A v71 preserva a arquitetura e transforma o drawer existente num off-canvas completo:

- o mesmo `#mobileDrawer` e o mesmo `#mobileMenuBtn` são reutilizados;
- o painel fechado começa em `translate3d(calc(-100% - 8px),0,0)` e termina em `translate3d(0,0,0)`;
- abertura do painel: aproximadamente `280 ms` com `cubic-bezier(.22,1,.36,1)`;
- fecho: aproximadamente `240 ms`, ligeiramente mais rápido;
- backdrop parte de transparente e chega a `rgba(10,18,30,.38)` com blur discreto de `1.5px`;
- apenas `transform`, opacidade e composição visual são animados; largura, margens e layout não são animados;
- a instância de `drawer.close` é coordenada por `mobile-menu-toggle.js`: os fluxos existentes continuam a chamar o mesmo método, mas o `close()` nativo só é executado depois do `transitionend` do `transform`, com fallback temporal de segurança;
- durante o fecho, o botão permanece no cabeçalho do drawer e regressa ao topbar apenas no evento `close`, evitando salto de layout;
- `prefers-reduced-motion` elimina as transições e fecha imediatamente;
- Escape, backdrop, seleção de item, mudança de breakpoint e fecho pelo X continuam a passar pelos fluxos existentes;
- ARIA, foco, safe areas, largura responsiva, scroll interno, temas e alvos tácteis permanecem preservados.

## Versionamento candidato

- build: `v71`;
- revisão do menu: `71-menu5`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v71-menu5`.

## Segurança e escopo

A v71 não altera `appState`, `STATE_VERSION`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo. `events.js` e `render.js` não são reescritos; o controlador do menu coordena somente a instância real do `<dialog>` existente.

## QA necessário antes de publicar

1. CI do PR totalmente verde;
2. validar parser e regressões específicas do drawer off-canvas;
3. validar abertura e fecho por X, Escape, backdrop e seleção de item;
4. validar `prefers-reduced-motion` e ausência de estado preso;
5. validar build/manifest/cache `v71` / `71-menu5`;
6. integrar em `main` apenas com CI verde;
7. confirmar CI de `main` e Deploy GitHub Pages;
8. repetir a validação física no mesmo iPhone.

## Última alteração

Preparada a candidata v71 para substituir a entrada curta e seca do drawer por uma transição off-canvas completa, com backdrop progressivo e saída coordenada antes do fecho real do `<dialog>`.

## Próximo passo

Executar a CI completa da v71, publicar apenas se verde e confirmar no iPhone que o painel entra da esquerda e sai para a esquerda de forma limpa, contínua e sem saltos.
