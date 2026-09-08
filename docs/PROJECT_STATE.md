# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v73`
Branch pública: `main`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB; o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM; a sincronização GitHub continua opcional e transfere apenas o envelope cifrado. O schema financeiro base permanece `STATE_VERSION = 5`.

A **v73 está integrada e publicada**. No desktop, a sidebar passou para o lado direito e o conteúdo reserva espaço através de `margin-right`. No mobile/tablet, o mesmo `#mobileDrawer` abre a partir da direita. O mesmo `#mobileMenuBtn` mantém a transformação hambúrguer ↔ X.

## Implementação v73

- sidebar desktop ancorada à direita, com borda, sombra, gradiente e indicador ativo espelhados;
- drawer móvel: `inset: 0 0 0 auto`;
- fechado: `translate3d(calc(100% + 8px),0,0)`;
- aberto: `translate3d(0,0,0)`;
- abertura ~300 ms; fecho ~250 ms;
- swipe de abertura: margem direita → esquerda;
- swipe de fecho: movimento para a direita;
- header móvel fixed, safe areas, ARIA, foco, backdrop e `prefers-reduced-motion` preservados;
- desktop/mobile continuam a usar `NAV_GROUPS` como fonte única dos destinos.

## Publicação

- PR funcional: `#62`;
- merge em `main`: `fb5c1b975b6494590eb16a3ab09762218e135299`;
- CI automática do PR `#1383` (`34180312212`): sucesso;
- CI automática de `main` `#1384` (`34180397609`): sucesso;
- Deploy GitHub Pages `#1377` (`34180421362`): sucesso;
- build: `v73`;
- revisão do menu: `73-menu8`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v73-menu8`.

## Segurança e escopo

A v73 não altera faturas, pagamentos, Compras, scanner, PIN, cofre, IndexedDB, cifragem, autenticação, APIs, sincronização ou regras de negócio.

## Próximo passo

Validar fisicamente no iPhone/Android e no desktop a nova direção: entrada/saída da direita, swipe, sidebar expandida/recolhida e ausência de overflow horizontal.
