# Changelog Técnico — Conta de Casa

## 2026-09-07 — v69 publicada: animação hambúrguer → X corrigida no runtime

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
- `aria-expanded="true"` e `data-menu-state="open"` conduzem em conjunto o estado visual;
- linha superior roda `45deg`, linha inferior `-45deg` e a linha central colapsa para `scaleX(.18)` + `opacity:0`;
- duração ajustada para aproximadamente 190 ms;
- `prefers-reduced-motion` preservado;
- foco programático originado por toque/rato deixa de desenhar a moldura observada no Safari;
- ativação por teclado mantém `:focus-visible`;
- geometria global do cabeçalho, drawer, safe areas, navegação e alvos de 48 px da v68 permanecem inalterados.

### Regressões adicionadas

`tests/mobile-menu-toggle.test.cjs` testa explicitamente o contrato entre `ui-icons.js` e `mobile-menu-toggle.js`, incluindo:

- chamada histórica de hidratação Lucide;
- sentinela oculta;
- `data-ui-icon-slot="menu"`;
- três spans animáveis;
- transformação para `X` por estado aberto;
- colapso da linha central;
- supressão de moldura apenas para pointer/toque;
- versionamento `v69` / `69-menu3`.

Os testes de Centro de Atualização, consistência visual e compatibilidade das camadas históricas do Mercado foram alinhados com o novo build público.

### Distribuição publicada

- build: `v69`;
- revisão do menu: `69-menu3`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v69-menu3`;
- PR #56 integrado;
- merge: `a66df37b0fc345491dacf3cac91313d88d080a05`;
- CI final do PR #1250 (`34168089348`): **sucesso**;
- CI de `main` #1251 (`34168145569`): **sucesso**;
- Deploy GitHub Pages #1244 (`34168165101`): **sucesso**.

### Segurança e dados

Nenhuma alteração de `STATE_VERSION`, `appState`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, cifragem, IndexedDB, autenticação, APIs ou sincronização.

A publicação técnica está concluída. Continua pendente a confirmação visual no mesmo iPhone/Safari que revelou o defeito.

## 2026-09-07 — v68 publicada: painel do menu móvel refinado

- painel lateral mais compacto e responsivo;
- botão 44 × 44 px e linhas `22 / 18 / 14 px`;
- `aria-expanded`, `aria-label`, `title` e `data-menu-state` sincronizados;
- drawer `min(364px, calc(100vw - 24px))`, abaixo de 360 px `calc(100vw - 20px)`;
- safe areas, scroll interno, `overflow-x:hidden` e alvos de 48 px;
- PR #54 / merge `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI e Pages verdes.

A validação física posterior revelou o conflito de hidratação do glifo, corrigido na v69.

## 2026-09-07 — v67 publicada: menu móvel hambúrguer/X

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
