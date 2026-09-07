# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v69`
Branch pública: `main`
Release pública integrada: PR #56
Commit público: `a66df37b0fc345491dacf3cac91313d88d080a05`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v69 está publicada**. O PR #56 foi integrado em `main`; a CI final de `main` e o Deploy GitHub Pages concluíram com sucesso.

Referências de publicação:

- PR funcional: #56 — `v69: corrigir animação hambúrguer para X no iPhone`;
- merge em `main`: `a66df37b0fc345491dacf3cac91313d88d080a05`;
- CI final do PR: run #1250 (`34168089348`) — sucesso;
- CI de `main`: run #1251 (`34168145569`) — sucesso;
- Deploy GitHub Pages: run #1244 (`34168165101`) — sucesso.

## Problema confirmado na v68

A validação física através das capturas reais do iPhone mostrou que o botão era movido corretamente para o drawer, mas continuava visualmente como hambúrguer em vez de se transformar num `X`. Também podia surgir uma moldura visual grande depois do foco programático.

### Causa técnica confirmada

`mobile-menu-toggle.js` criava corretamente três `<span>` animáveis. Porém `ui-icons.js::hydrate()` contém `fillIcon(document.querySelector('#mobileMenuBtn'),'menu',22)` e observa alterações de `aria-expanded`/`class`.

`fillIcon()` usa `replaceChildren()`. Assim, a cada mudança de estado, os três `<span>` eram substituídos por um SVG Lucide estático de menu e o CSS deixava de ter os elementos necessários para executar a transformação visual.

## v69 — correção publicada

- preservado o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- preservadas as três linhas proporcionais `22 / 18 / 14 px`;
- preservado o mesmo nó DOM durante fechado/aberto;
- adicionado um SVG Lucide oculto como sentinela de hidratação e mantido `data-ui-icon-slot="menu"`, impedindo `fillIcon()` de substituir o glifo animável;
- estado aberto sincronizado por `aria-expanded="true"` e `data-menu-state="open"`;
- linha superior roda `45deg`, linha inferior `-45deg` e a linha central colapsa;
- animação aproximada de 190 ms, curta e discreta;
- `prefers-reduced-motion` preservado;
- foco programático após toque/rato deixa de desenhar a moldura observada no Safari;
- ativação por teclado continua a mostrar foco visível;
- drawer, largura, safe areas, scroll, navegação e alvos de 48 px da v68 permanecem inalterados.

## Versionamento público

- build: `v69`;
- revisão do menu: `69-menu3`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v69-menu3`.

`release-manifest.json`, `scripts/prepare-pages.cjs`, `sw.js` e as regressões foram publicados em conjunto.

## QA automatizado

A CI final validou com sucesso sintaxe, finanças, auditoria, invariantes, isolamento do cofre, datas civis, formulários, QR, Mercado, agrupamento e Lista de compras, fontes reais, imagens históricas, scanner, quantidade/contabilidade, runtime v64, ícones, consistência visual, menu animado, Centro de Atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade e sincronização.

Foi acrescentada regressão específica do contrato entre `ui-icons.js` e `mobile-menu-toggle.js`, cobrindo a sentinela Lucide, os três spans animáveis, estado aberto, colapso da linha central e foco por pointer/teclado.

## Segurança e compatibilidade

A v69 não altera `appState`, `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints externos ou armazenamento novo.

## Validação física ainda pendente

A publicação técnica está concluída, mas a correção visual deve ser confirmada no mesmo iPhone que revelou o defeito:

- abrir: hambúrguer → `X` real no mesmo botão;
- fechar pelo `X`: `X` → hambúrguer;
- confirmar ausência de moldura visual após toque;
- confirmar foco visível por teclado;
- Escape, backdrop e seleção de item;
- portrait/landscape;
- iPhone/Safari e Android/Chrome;
- tema claro/escuro e VoiceOver/TalkBack.

## Última alteração

Publicada a v69 para corrigir o conflito entre o hidratador Lucide e o glifo animado do menu móvel, identificado pela validação física da v68.

## Próximo passo

Instalar/atualizar para a v69 no dispositivo real e confirmar visualmente o ciclo hambúrguer → `X` → hambúrguer e a ausência da moldura após toque.
