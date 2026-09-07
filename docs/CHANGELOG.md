# Changelog Técnico — Conta de Casa

## 2026-09-07 — v67 candidata: menu móvel hambúrguer/X animado

### Objetivo

Modernizar o comando do menu móvel segundo o padrão visual solicitado: três traços proporcionais no estado fechado, transformação suave em `X` ao abrir e regresso ao hambúrguer ao fechar. A alteração deve manter o tamanho e a arquitetura do cabeçalho atual.

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
- `#drawerCloseBtn` permanece no DOM apenas por compatibilidade com o wiring histórico, mas fica oculto e fora da tabulação;
- não existe segundo `X` visível;
- o botão mantém alvo de `44 × 44 px`, sem moldura branca, fundo verde/selecionado ou sombra nova;
- `aria-label`/`title` alternam entre **Abrir menu** e **Fechar menu**;
- `prefers-reduced-motion: reduce` desativa a animação;
- Escape, backdrop e evento `close` continuam preservados pelo fluxo existente.

### Distribuição candidata

- build: `v67`;
- revisão do menu: `67-menu1`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v67-menu1`;
- `release-manifest.json`, `scripts/prepare-pages.cjs` e Service Worker atualizados para incluir os novos assets.

### QA

- criado `tests/mobile-menu-toggle.test.cjs`;
- CI e gate de Pages passam a verificar sintaxe do novo runtime e regressões do componente;
- `tests/app-update.test.cjs` foi atualizado para build, manifesto, ordem de carregamento e cache v67;
- PR #52 aberto para revisão e CI.

### Segurança e dados

- nenhuma alteração de `STATE_VERSION`;
- nenhuma alteração a `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB ou sincronização;
- nenhum segredo, token, chave ou endpoint externo novo;
- a dívida técnica do ZXing via `unpkg.com` permanece separada desta release.

A v67 só deve passar a **publicada** depois de CI verde, integração em `main` e Deploy GitHub Pages concluídos.

## 2026-09-07 — v66 publicada: fundo móvel uniforme no iPhone

### Problema observado

Uma captura real de iPhone na **Lista de compras** revelou uma diferença cromática entre o cabeçalho quase branco e uma área azulada adjacente. O problema era visual, mas quebrava a continuidade do shell e tornava o cabeçalho aparentemente mal configurado.

### Causa confirmada

- `market-brand.css` aplicava um `radial-gradient` azul a `html.market-prototype-active .main`;
- o topbar móvel é `fixed` e usa recuo lateral por `--page-gutter`, deixando o fundo de `.main` visível nas margens;
- o topbar usava fundo parcialmente composto e `backdrop-filter`, podendo herdar tonalidades diferentes na composição do Safari;
- os tons claros do token visual, `theme-color` e `manifest.webmanifest` eram próximos, mas não idênticos.

### Corrigido — shell móvel

- criado `--mobile-shell-bg` no breakpoint até 820 px;
- tema claro: `#f5f7fa`;
- tema escuro: `#0f1722`;
- documento ativo, `body`, `.app-shell`, `.main`, `.main` do Mercado e `.topbar` usam o mesmo fundo no mobile;
- o radial azul do Mercado é suprimido apenas no shell móvel e continua disponível no desktop;
- topbar móvel passa a fundo opaco, sem `backdrop-filter`/`-webkit-backdrop-filter`;
- geometria do cabeçalho, safe area, menu, título, `+`, Sync e navegação permanecem inalteradas.

### PWA e versionamento

- build: `v66`;
- revisão de shell: `66-shell1`;
- runtime funcional preservado: `64-runtime1`;
- camada de Compras preservada: `65-shopping1`;
- revisão visual preservada: `64-ui1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1`;
- `manifest.webmanifest.background_color` e `theme_color` usam `#f5f7fa`;
- Pages força o `theme-color` inicial do HTML público para `#f5f7fa`; `applyTheme()` continua a trocar para `#0f1722` no tema escuro.

### Segurança e dados

- nenhuma alteração de `STATE_VERSION`;
- nenhuma alteração a `estimatedCents`, `actualCents`, faturas, pagamentos, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB ou sincronização;
- nenhum segredo, token ou chave adicionado;
- a dívida técnica do ZXing via `unpkg.com` permanece separada desta release.

### QA e publicação

- PR #50 integrado em `main`;
- commit: `9657d558000018af1ea44e6040441f2b9d91648c`;
- CI do PR run #1138: **sucesso**;
- CI de `main` run #1139: **sucesso**;
- Deploy GitHub Pages run #1132: **sucesso**;
- matriz completa de regressão passou, incluindo shell, manifesto/theme-color, finanças, cofre, Mercado, scanner, Lista de compras v65, acessibilidade, responsividade e sincronização.

A validação física no mesmo iPhone continua pendente; a publicação e a cobertura automatizada estão confirmadas, mas a composição real do Safari/PWA só pode ser validada no aparelho.

## 2026-09-07 — v65 publicada: Lista de compras focada no supermercado

### Objetivo

Reduzir densidade e duplicação no mobile sem tocar no modelo financeiro. A tarefa primária passa a ser encontrar o próximo produto e marcá-lo rapidamente.

### Alterado — apresentação móvel

- criado `market-shopping-focus.js/.css` como camada de apresentação isolada;
- resumo inicial compacto: por comprar, comprados e total previsto;
- detalhes financeiros completos disponíveis em **Resumo financeiro**;
- `#marketSummary` grande fica oculto apenas no mobile;
- `+` do topbar reutiliza `#newMarketBtn` quando Compras está ativa;
- botão de adição duplicado da página fica oculto apenas no mobile;
- Estado, Categoria e Ordenar usam apresentação compacta;
- **Limpar filtros** só aparece quando pesquisa/filtros/ordenação estão ativos;
- categorias com itens pendentes permanecem abertas;
- itens comprados são movidos apenas no DOM para **Comprados**, fechado por padrão;
- cartões móveis mostram primeiro checkbox, nome, quantidade e preço;
- preço real, diferença, editar e eliminar permanecem disponíveis em **Detalhes**;
- desktop permanece com tabela, filtros e resumos completos.

### Segurança e dados

- `STATE_VERSION = 5` preservado;
- nenhuma escrita nova em `appState` pela camada v65;
- `estimatedCents`, `actualCents`, quantidade, scanner, faturas, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB e sincronização permanecem inalterados;
- os mesmos nós e handlers existentes são reutilizados para adicionar/editar/eliminar e introduzir preço real;
- nenhum segredo, token ou chave foi adicionado.

### Versionamento e validação

- build: `v65`;
- Compras: `65-shopping1`;
- runtime: `64-runtime1`;
- cache anterior: `conta-de-casa-public-v64-runtime1-v65-shopping1`;
- PR #48 integrado no commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`;
- CI do PR #1110: sucesso;
- CI de `main` #1111: sucesso;
- Deploy GitHub Pages #1104: sucesso.

## 2026-09-07 — auditoria pós-publicação v64

- PR #44 integrado;
- merge público da v64: `78612a9701d60938532d7be768ea35f84c36c7fc`;
- reforço do redeploy manual integrado pelo PR #46;
- `pages.yml` passou a repetir sintaxe/teste de `v64-runtime.js` no caminho manual;
- CI de `main` #1094 e Pages #1087: sucesso.

## 2026-09-07 — v64 publicada: scanner conservador, recorrências limpas e cabeçalho móvel

- safe area/cabeçalho móvel uniformizados em geometria;
- scanner exige correspondência conservadora e mantém preço pesquisado em `estimatedCents`;
- GTIN repetido pendente incrementa quantidade;
- novas ocorrências recorrentes começam **Por preencher** sem herdar valores variáveis;
- cofre, PIN e dados financeiros cifrados preservados.

## 2026-09-06 — v63 publicada: consistência visual e atualização controlada (`63-ui2`)

- `ui-consistency.css` como camada final de apresentação;
- Lucide permanece sistema vetorial oficial;
- navegação inferior com um único indicador ativo;
- `release-manifest.json` e Centro de Atualização controlado por Service Worker.

## 2026-09-06 — Lista de compras agrupada por categoria (`62-ui3`)

- PR #40 integrado com CI verde;
- criado `market-category-groups.js/.css`;
- mobile usa grupos por categoria; desktop mantém tabela e separadores;
- handlers e schema financeiro preservados.

## 2026-09-06 — Hotfix iPhone/Safari do Mercado e conflitos técnicos (`62-ui2`)

- corrigida coluna fantasma no browser de produtos;
- preço reflui abaixo de 360 px;
- `sync-conflict-policy.js` separa metadados técnicos de conflitos financeiros.

## 2026-09-06 — Identidade visual do Mercado sem fotografias (`62-ui2`)

- Mercado passa a `text-first`;
- fotografias/placeholder deixam de ocupar espaço principal;
- câmara permanece para leitura GTIN/EAN/UPC;
- módulos históricos de imagem permanecem temporariamente por compatibilidade.

## 2026-09-06 — v62/v61/v60

- política histórica de imagens official-only por cadeia/SKU;
- bridge de imagens oficiais por identificador exato;
- catálogo ampliado com validação de URL/CDN.

## 2026-09-05 — v59/v58

- miniaturas ampliáveis e pesquisa auxiliar por Open Facts;
- criado Centro de Atualização inicial em Definições.

## Base funcional anterior

- cofre local cifrado com PBKDF2-SHA-256 + AES-GCM;
- IndexedDB para estado privado;
- Lucide como sistema de ícones local;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço via `cesta.pt`;
- `estimatedCents` e `actualCents` separados.
