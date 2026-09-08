# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v72`
Build candidato: `v73`
Branch pública: `main`
Branch candidata: `ui/v73-right-navigation`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB; o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM; a sincronização GitHub continua opcional e transfere apenas o envelope cifrado. O schema financeiro base permanece `STATE_VERSION = 5`.

A v73 altera apenas a direção estrutural da navegação. No desktop, a sidebar passa para o lado direito e o conteúdo reserva espaço através de `margin-right`. No mobile/tablet, o mesmo `#mobileDrawer` passa a abrir a partir da direita. O mesmo `#mobileMenuBtn` continua a transformar as três linhas em X e regressa ao hambúrguer ao fechar.

## Implementação v73

- `mobile-menu-toggle.css` é a camada final de navegação e espelha sidebar, bordas, sombras e indicadores ativos para a direita;
- o drawer móvel usa `inset: 0 0 0 auto` e entra de `translate3d(calc(100% + 8px),0,0)` para `translate3d(0,0,0)`;
- abertura automática: cerca de 300 ms com `cubic-bezier(.32,.72,0,1)`;
- fecho: cerca de 250 ms;
- o backdrop permanece discreto e acompanha a transição;
- o swipe de abertura passa a começar na margem direita e a mover-se para a esquerda;
- o swipe de fecho passa a mover-se para a direita;
- o header móvel continua fixed através de `v64-runtime.css`, respeitando safe areas e o breakpoint de 820 px;
- o drawer mantém cabeçalho fixo dentro da superfície e scroll vertical apenas na navegação;
- desktop, tablet e mobile continuam a usar a mesma fonte `NAV_GROUPS` para os destinos.

## Segurança e escopo

A v73 não altera faturas, pagamentos, Compras, scanner, PIN, cofre, IndexedDB, cifragem, autenticação, APIs, sincronização ou regras de negócio. Não adiciona endpoints, segredos ou armazenamento novo.

## Verificação nesta intervenção

Por pedido do utilizador, não foi criada nem executada uma fase extensa de testes. A alteração foi mantida limitada à camada de navegação, ao controlador do gesto e ao versionamento público. A validação física final deve ser feita no iPhone/Android após publicação.

## Próximo passo

Integrar a v73 em `main`, atualizar pelo Centro de Atualização e confirmar visualmente: drawer a entrar pela direita, saída suave, swipe coerente, sidebar desktop à direita e ausência de overflow horizontal.
