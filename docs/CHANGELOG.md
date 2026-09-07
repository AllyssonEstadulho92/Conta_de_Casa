# Changelog Técnico — Conta de Casa

## 2026-09-07 — v69 candidata: animação hambúrguer → X corrigida no runtime

### Problema observado em hardware real

As capturas reais do iPhone mostraram que, depois de abrir o menu, o mesmo botão era movido corretamente para o drawer mas continuava visualmente como hambúrguer. Também surgia uma moldura grande em torno do controlo depois do foco programático.

### Causa confirmada

A implementação v68 criava corretamente três `<span>` animáveis em `mobile-menu-toggle.js`. Contudo, `ui-icons.js::hydrate()` executava `fillIcon(document.querySelector('#mobileMenuBtn'),'menu',22)` sempre que o `MutationObserver` detetava alterações de `aria-expanded` ou `class`.

`fillIcon()` usa `replaceChildren()`. Assim, ao abrir/fechar o drawer, o sistema Lucide removia os três `<span>` e colocava um SVG estático de menu. O CSS de rotação continuava correto, mas os elementos que devia animar já não existiam.

### Correção aplicada

- preservado o mesmo `#mobileMenuBtn` e o mesmo `#mobileDrawer`;
- preservadas três linhas proporcionais `22 / 18 / 14 px`;
- preservado um SVG Lucide direto como sentinela oculta `.mobile-menu-icon-sentinel`;
- mantido `data-ui-icon-slot="menu"`, fazendo o hidratador reconhecer o botão como já tratado e evitar a substituição destrutiva;
- `aria-expanded="true"` e `data-menu-state="open"` passam a conduzir em conjunto o estado visual;
- linha superior roda `45deg`, linha inferior `-45deg` e a linha central colapsa para `scaleX(.18)` + `opacity:0`;
- duração ajustada para aproximadamente 190 ms;
- `prefers-reduced-motion` preservado;
- foco programático originado por toque/rato deixa de desenhar a moldura observada no Safari;
- ativação por teclado mantém `:focus-visible`;
- geometria global do cabeçalho, drawer, safe areas, navegação e alvos de 48 px da v68 permanecem inalterados.

### Regressão adicionada

`tests/mobile-menu-toggle.test.cjs` passa a testar explicitamente o contrato entre `ui-icons.js` e `mobile-menu-toggle.js`, incluindo:

- existência da chamada histórica de hidratação Lucide;
- sentinela oculta;
- `data-ui-icon-slot="menu"`;
- três spans animáveis;
- transformação para `X` por estado aberto;
- colapso da linha central;
- supressão de moldura apenas para pointer/toque;
- versionamento `v69` / `69-menu3`.

`tests/app-update.test.cjs` e `tests/ui-consistency.test.cjs` foram alinhados com a candidata v69.

### Distribuição candidata

- build: `v69`;
- revisão do menu: `69-menu3`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v69-menu3`.

### Segurança e dados

Nenhuma alteração de `STATE_VERSION`, `appState`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, cifragem, IndexedDB, autenticação, APIs ou sincronização.

A v69 só será considerada publicada depois de CI do PR, merge em `main`, CI de `main` e Deploy GitHub Pages concluídos com sucesso.

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

O painel do drawer ainda herdava regras de apresentação de camadas históricas. O resultado tinha sombra mais pesada, largura/densidade pouco afinadas, hierarquia interna genérica e estados de interação pouco específicos.

### Corrigido — botão e painel

- botão `44 × 44 px`;
- linhas `22 / 18 / 14 px`;
- animação aproximada de 200 ms;
- `aria-expanded`, `aria-label`, `title` e `data-menu-state` sincronizados;
- drawer `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `calc(100vw - 20px)`;
- safe areas, scroll interno, `overflow-x:hidden`;
- itens e ações com 48 px;
- hover/active/focus/current;
- tema claro/escuro preservado.

### Publicação

- build `v68`, menu `68-menu2`;
- PR #54 / merge `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI final do PR #1217: sucesso;
- CI de `main` #1218: sucesso;
- Pages #1211: sucesso.

A validação física posterior revelou o conflito de hidratação do glifo, corrigido na candidata v69.

## 2026-09-07 — v67 publicada: menu móvel hambúrguer/X animado

- criado o mesmo controlo móvel para abrir/fechar;
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

## 2026-09-05/06 — v58–v62

- Centro de Atualização em Definições;
- miniaturas e pesquisa auxiliar histórica por Open Facts;
- políticas históricas de imagem por cadeia/SKU;
- bridge de imagens oficiais por identificador exato.

## Base funcional preservada

- cofre local cifrado com PBKDF2-SHA-256 + AES-GCM;
- IndexedDB para estado privado;
- Lucide como sistema de ícones local;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço via `cesta.pt`;
- `estimatedCents` e `actualCents` separados.
