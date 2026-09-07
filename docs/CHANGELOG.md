# Changelog Técnico — Conta de Casa

## 2026-09-07 — v68 publicada: painel do menu móvel refinado

### Objetivo

Evoluir o menu hambúrguer já corrigido na v67 para um painel mais moderno, elegante, compacto e responsivo, sem criar uma segunda implementação nem alterar o tamanho global da aplicação.

### Auditoria antes da alteração

Foi confirmado no código real que:

- `#mobileMenuBtn` e `#mobileDrawer` são a implementação móvel existente;
- `#mobileDrawer` é um `<dialog>` modal;
- `events.js` gere abertura/fecho, Escape, backdrop e adaptação de breakpoint;
- `render.js` usa os mesmos `NAV_GROUPS` para `#desktopNav` e `#drawerNav`;
- a v67 já usava o mesmo botão para hambúrguer e `X`, movendo o nó para dentro do modal quando aberto;
- Lucide local continua a ser o sistema oficial de ícones;
- Inter/SF/system continua a ser a tipografia base;
- o breakpoint móvel existente é 820 px;
- não foi encontrado defeito global de viewport, container ou overflow que justificasse redimensionar a aplicação.

### Problema identificado

O painel do drawer ainda herdava regras de apresentação de camadas históricas. O resultado tinha:

- sombra mais pesada do que o necessário;
- largura e densidade pouco afinadas para ecrãs pequenos/grandes;
- hierarquia interna genérica;
- estados hover/focus/current dependentes sobretudo dos estilos globais;
- necessidade de tornar scroll e overflow do próprio drawer mais explícitos.

### Corrigido — botão e estado

- preservado o mesmo botão de `44 × 44 px`;
- preservadas as três linhas `22 / 18 / 14 px` que se transformam no próprio `X`;
- animação ajustada para cerca de 200 ms, com curva curta e natural;
- `aria-expanded`, `aria-label` e `title` continuam sincronizados;
- acrescentado `data-menu-state="open|closed"` ao botão e drawer para estado observável/diagnóstico;
- `prefers-reduced-motion` continua a desativar movimento não essencial;
- sem moldura branca, fundo verde ou outro estado cromático pesado.

### Corrigido — painel responsivo

- largura normal: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `width: calc(100vw - 20px)`, mantendo 20 px de backdrop sem limitar artificialmente o painel a 300 px;
- alvos de navegação e footer permanecem com 48 px mesmo nos ecrãs mais pequenos;
- altura `100dvh` e safe areas superior/inferior;
- drawer com scroll vertical próprio, overscroll contido e `overflow-x:hidden`;
- backdrop suavizado e sombra reduzida;
- cabeçalho interno mais compacto e alinhado;
- marca do drawer reduzida para 36 × 36 px;
- labels de grupo com hierarquia discreta;
- ícones Lucide a 20 px;
- página atual com fundo suave + indicador lateral de 3 px;
- hover aplicado apenas a rato/pointer fino;
- estados active e focus-visible explícitos;
- texto longo usa ellipsis em vez de criar overflow.

### Compatibilidade

`#drawerCloseBtn` continua no DOM mas oculto. Não foi removido porque ainda existem referências em `events.js` e `ui-icons.js`; eliminá-lo nesta release criaria um refactor lateral não necessário para o objetivo visual.

### Distribuição publicada

- build: `v68`;
- revisão do menu: `68-menu2`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v68-menu2`.

`release-manifest.json`, `scripts/prepare-pages.cjs` e `sw.js` estão alinhados com a release pública.

### QA e publicação

- `tests/mobile-menu-toggle.test.cjs` cobre sizing, safe areas, overflow, alvos, estados, ARIA, ecrãs <360 px e movimento reduzido;
- `tests/app-update.test.cjs` cobre build/cache/assets v68;
- `tests/ui-consistency.test.cjs` cobre integração com tipografia/Lucide/shell/Compras;
- regressões históricas de Mercado/Compras foram alinhadas com o novo build público sem alterar revisões internas preservadas;
- PR #54 integrado em `main`;
- commit: `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI final do PR run #1217 (`34166823195`): **sucesso**;
- CI de `main` run #1218 (`34166862646`): **sucesso**;
- Deploy GitHub Pages run #1211 (`34166882992`): **sucesso**.

A matriz final passou em sintaxe, finanças, auditoria, invariantes, isolamento do cofre, datas, formulários, QR, Mercado, scanner, contabilidade, ícones, consistência visual, menu animado, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade e sincronização.

### Segurança e dados

- nenhuma alteração de `STATE_VERSION`;
- nenhuma alteração a `appState`, `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização;
- nenhum segredo, token, chave, endpoint externo ou armazenamento novo.

### Limitação de validação

A publicação e os testes automatizados estão confirmados. A validação física final em iPhone/Safari, Android/Chrome, tablet, orientação horizontal e VoiceOver/TalkBack continua pendente.

## 2026-09-07 — v67 publicada: menu móvel hambúrguer/X animado

### Objetivo

Modernizar o comando do menu móvel segundo o padrão visual solicitado: três traços proporcionais no estado fechado, transformação suave em `X` ao abrir e regresso ao hambúrguer ao fechar. A alteração mantém o tamanho e a arquitetura do cabeçalho atual.

### Problema confirmado no código

- `#mobileMenuBtn` abria `#mobileDrawer` com um SVG hambúrguer fixo;
- o drawer apresentava um segundo controlo `#drawerCloseBtn` com `X`;
- um simples `aria-expanded`/CSS no botão exterior não seria suficiente para o tornar clicável durante `showModal()`, porque os elementos exteriores ao `<dialog>` modal ficam inertes;
- a duplicação de comandos permitia que o utilizador visse um hambúrguer e um `X` como elementos separados, em vez de um único controlo que muda de estado.

### Alterado — navegação e apresentação

- criados `mobile-menu-toggle.js` e `mobile-menu-toggle.css`;
- o mesmo `#mobileMenuBtn` abre e fecha o drawer;
- ao abrir, o mesmo nó DOM é movido para `.drawer-head`, ficando dentro do `<dialog>` modal e continuando realmente interativo;
- ao fechar, regressa ao ponto original no topbar;
- os três traços transformam-se em `X` através de `aria-expanded="true"` e voltam ao hambúrguer em `false`;
- `#drawerCloseBtn` permanece no DOM apenas por compatibilidade com wiring histórico, mas fica oculto e fora da tabulação;
- não existe segundo `X` visível;
- o botão mantém alvo de `44 × 44 px`, sem moldura branca, fundo verde/selecionado ou sombra nova;
- `aria-label`/`title` alternam entre **Abrir menu** e **Fechar menu**;
- `prefers-reduced-motion: reduce` desativa a animação;
- Escape, backdrop e evento `close` continuam preservados pelo fluxo existente.

### Publicação

- build `v67`, menu `67-menu1`;
- PR #52 / commit `a1d932e580abaa06e7026a515f797411ab205f6e`;
- CI do PR #1178, CI de `main` #1179 e Pages #1172: **sucesso**.

## 2026-09-07 — v66 publicada: fundo móvel uniforme no iPhone

- shell claro `#f5f7fa` e escuro `#0f1722`;
- documento, body, app shell, main e topbar usam o mesmo fundo no mobile;
- topbar opaco e sem blur;
- desktop mantém identidade do Mercado;
- geometria do cabeçalho e navegação inalteradas;
- PR #50 / commit `9657d558000018af1ea44e6040441f2b9d91648c`;
- CI/Pages verdes.

## 2026-09-07 — v65 publicada: Lista de compras focada no supermercado

- resumo inicial compacto: por comprar, comprados e previsto;
- detalhe financeiro em disclosure;
- `+` do topbar reutiliza ação existente;
- filtros compactos e Limpar apenas quando necessário;
- categorias pendentes abertas e Comprados recolhido;
- cartões priorizam checkbox, nome, quantidade e preço;
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

## 2026-09-06 — Lista de compras agrupada por categoria

- criado `market-category-groups.js/.css`;
- mobile usa grupos por categoria; desktop mantém tabela e separadores;
- handlers e schema financeiro preservados.

## 2026-09-06 — Mercado e conflitos técnicos

- corrigida coluna fantasma no browser de produtos;
- preço reflui abaixo de 360 px;
- `sync-conflict-policy.js` separa metadados técnicos de conflitos financeiros;
- Mercado passa a `text-first`;
- câmara permanece para GTIN/EAN/UPC;
- módulos históricos de imagem permanecem temporariamente por compatibilidade.

## Base funcional preservada

- cofre local cifrado com PBKDF2-SHA-256 + AES-GCM;
- IndexedDB para estado privado;
- Lucide como sistema de ícones local;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço via `cesta.pt`;
- `estimatedCents` e `actualCents` separados.
