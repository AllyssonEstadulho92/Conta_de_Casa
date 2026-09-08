# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v70`
Build candidato: `v71`
Branch pública: `main`
Branch candidata: `ui/v71-smooth-drawer`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v70 continua pública e funcional**. A validação física no iPhone confirmou que o painel abre, os destinos estão corretos e o hambúrguer/X funciona. A observação remanescente é exclusivamente de interação: o drawer deve comportar-se como uma superfície móvel, acompanhando o dedo lateralmente em vez de parecer preso a estados fechado/aberto.

## Problema identificado pela validação física

### Factos observáveis

- o drawer abre no lado correto e mantém a hierarquia visual;
- a página selecionada e os restantes itens continuam funcionais;
- o `X` está corretamente integrado no cabeçalho do drawer;
- a entrada automática ainda pode parecer seca se o painel apenas saltar entre estados;
- ao arrastar horizontalmente, a experiência pretendida é o painel acompanhar o dedo em tempo real e só decidir abrir/fechar quando o gesto termina.

### Causa técnica

A implementação anterior trabalha essencialmente com dois estados CSS: fechado e aberto. Mesmo com uma boa transição automática, isso não cria uma interação direta de arrasto. Para obter comportamento semelhante ao drawer do ChatGPT é necessário calcular a posição do painel a partir do deslocamento real do toque e desligar temporariamente a transição enquanto o dedo está no ecrã.

## v71 — correção candidata

A v71 preserva a arquitetura e transforma o drawer existente num off-canvas completo com gesto horizontal interativo:

- o mesmo `#mobileDrawer` e o mesmo `#mobileMenuBtn` são reutilizados;
- o painel fechado começa em `translate3d(calc(-100% - 8px),0,0)` e termina em `translate3d(0,0,0)`;
- abertura automática do painel: aproximadamente `280 ms` com `cubic-bezier(.32,.72,0,1)`;
- fecho automático: aproximadamente `240 ms`, ligeiramente mais rápido;
- backdrop parte de transparente e chega a `rgba(10,18,30,.34)` com blur discreto de `1px`;
- apenas `transform`, opacidade e composição visual são animados; largura, margens e layout não são animados;
- quando o drawer está aberto, um swipe horizontal para a esquerda faz o painel acompanhar diretamente o dedo;
- quando está fechado, um gesto iniciado nos primeiros `30 px` da margem esquerda permite puxar o drawer para dentro do ecrã;
- o gesto só é capturado depois de pelo menos `8 px` de movimento e depois de confirmar predominância horizontal, preservando o scroll vertical normal da lista;
- a posição durante o arrasto é calculada diretamente a partir do delta do toque e aplicada por `--drawer-drag-x`, sem transição intermédia;
- o backdrop também acompanha o progresso do gesto através de `--drawer-drag-alpha` e `--drawer-drag-blur`;
- ao soltar, o drawer decide o destino por progresso (`34%` para abrir; abaixo de `66%` para fechar quando já estava aberto) e por velocidade de fling (`0.45 px/ms`);
- depois de soltar, anima apenas o pequeno percurso restante até totalmente aberto ou fechado;
- cliques sintetizados imediatamente após um swipe são bloqueados durante `320 ms` para evitar abrir uma opção por acidente;
- a instância de `drawer.close` continua coordenada por `mobile-menu-toggle.js`: os fluxos existentes chamam o mesmo método, mas o `close()` nativo só é executado depois do `transitionend` do `transform`, com fallback de `360 ms`;
- durante o fecho, o botão permanece no cabeçalho do drawer e regressa ao topbar apenas no evento `close`, evitando salto de layout;
- `prefers-reduced-motion` elimina as transições e desativa a captura do gesto adicional;
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

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo. `events.js` e `render.js` não são reescritos; o controlador do menu coordena somente a instância real do `<dialog>` existente e eventos de toque locais.

## QA necessário antes de publicar

1. CI do PR totalmente verde;
2. validar parser e regressões específicas do drawer off-canvas;
3. validar swipe da margem esquerda para abrir;
4. validar swipe para a esquerda para fechar;
5. validar que o scroll vertical da lista não fica bloqueado;
6. validar snap por distância e por velocidade;
7. validar abertura e fecho por X, Escape, backdrop e seleção de item;
8. validar `prefers-reduced-motion` e ausência de estado preso;
9. validar build/manifest/cache `v71` / `71-menu5`;
10. integrar em `main` apenas com CI verde;
11. confirmar CI de `main` e Deploy GitHub Pages;
12. repetir a validação física no mesmo iPhone.

## Última alteração

A candidata v71 passou de uma animação off-canvas apenas automática para um drawer realmente interativo: durante o swipe, a superfície e o backdrop seguem o dedo em tempo real e só completam o percurso depois de o gesto terminar.

## Próximo passo

Obter CI verde da v71 e confirmar no iPhone que o drawer pode ser puxado e empurrado lateralmente sem sensação de bloqueio, mantendo o scroll vertical natural e sem abrir itens acidentalmente.
