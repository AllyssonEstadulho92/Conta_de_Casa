# Decisões Técnicas — Conta de Casa

Atualizado: 7 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam unidades de viewport CSS; `VisualViewport` fica reservado a teclado e diálogos. A v64 não elimina o scroller interno de `.main`; apenas deixa de depender de `sticky` para o cabeçalho móvel.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` continua como compatibilidade para Safari, safe areas e viewport móvel. Correções de release podem ser aplicadas numa camada final explicitamente versionada.

## D-003 — Densidade móvel sem sacrificar alvos tácteis
Estado: aceite. A interface pode compactar cartões mantendo legibilidade, foco e alvos tácteis adequados.

## D-004 — Mercado como camada isolada
Estado: aceite. A experiência de Compras não reescreve cifragem, persistência ou o núcleo financeiro sem necessidade comprovada.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não alimentam totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. O catálogo alimenta `estimatedCents`; `actualCents` representa o preço efetivamente pago/confirmado.

## D-007 — Código de barras identifica produto, não prova preço pago
Estado: aceite. GTIN/EAN/UPC identifica o artigo. O preço vem da fonte do Mercado e permanece estimado até existir confirmação da compra.

## D-008 — Lucide como sistema vetorial oficial
Estado: aceite. Os ícones são locais, auditáveis e não dependem de icon fonts/CDN em runtime.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. O QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Hierarquia móvel consistente
Estado: aceite e refinada por D-029. Compras mantém título contextual, ação `+`, scanner, informação financeira e navegação inferior consistente, mas a informação secundária pode usar progressive disclosure para não bloquear a tarefa principal.

## D-011 — Cofre não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta autenticação/capacidades que não estejam realmente implementadas.

## D-012 — Fotografia é independente do preço
Estado: aceite como regra histórica. Uma fotografia nunca prova preço nem transação.

## D-013 — Atualização de software usa Service Worker same-origin
Estado: aceite. Atualizações públicas são distribuídas pela própria PWA.

## D-014 — Imagens por SKU com validação estrita
Estado: compatibilidade histórica. Enquanto os módulos antigos existirem, uma imagem só é considerada oficial quando cadeia e identificador correspondem.

## D-015 — Reader externo restrito a páginas públicas validadas
Estado: compatibilidade histórica enquanto o pipeline antigo de imagens estiver distribuído.

## D-016 — Integração de imagens usa o contrato real do DOM
Estado: histórico/compatibilidade. A integração depende de seletores e identificadores públicos, não de estado privado entre módulos.

## D-017 — Cartões vivos de retalhista eram `official-only`
Estado: substituída na apresentação por D-018; permanece apenas no pipeline histórico.

## D-018 — Mercado orientado a nomes, sem fotografias de produto
Data: 6 de setembro de 2026 · Estado: aceite.

A interface é `text-first`: nome, embalagem/quantidade, loja, categoria, estado e preço são a identidade principal. Fotografias/placeholder não ocupam espaço. A câmara permanece para código de barras. Metadados históricos de imagem são preservados por compatibilidade.

## D-019 — Browser do Mercado usa posições explícitas em mobile
Data: 6 de setembro de 2026 · Estado: aceite.

Conteúdo textual e botão `+` usam posições explícitas no Grid para impedir colunas fantasma. Abaixo de 360 px, o preço reflui em vez de comprimir palavras.

## D-020 — Metadados visuais do Mercado são conflitos técnicos
Data: 6 de setembro de 2026 · Estado: aceite.

`sync-conflict-policy.js` retira apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` da vista de equivalência de negócio. Nome, quantidade, `estimatedCents`, `actualCents`, estado e datas continuam protegidos como dados reais.

## D-021 — Lista de compras agrupada por categoria sem alterar o modelo
Data: 6 de setembro de 2026 · Estado: aceite.

O agrupamento reutiliza a categoria e os mesmos nós/handlers. Mobile usa `<details>/<summary>`; desktop mantém tabela e separadores de categoria.

## D-022 — Uma camada final resolve colisões visuais entre CSS legados
Data: 6 de setembro de 2026 · Estado: aceite e publicada na v63.

`ui-consistency.css` consolida regras visuais globais sem tocar no estado financeiro. Lucide mantém métrica comum, a navegação móvel usa um único indicador ativo e a faixa dos cartões-resumo permanece sólida.

## D-023 — Cada alteração pública relevante gera versão, manifesto e instalação confirmada
Data: 6 de setembro de 2026 · Estado: aceite.

Ciclo oficial: **alteração → nova versão → notas no `release-manifest.json` → CI → `main` → Pages → instalação pelo Centro de Atualização**.

`latestVersion` deve corresponder ao build; a atualização normal não ativa silenciosamente o novo worker; **Atualizar agora** envia `APPLY_UPDATE`; a allowlist do Service Worker permanece explícita; atualizar assets não apaga o cofre.

## D-024 — Auto-adição por código de barras exige correspondência conservadora
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

A auto-adição só ocorre quando existe exatamente um supermercado selecionado, o resultado pertence à mesma loja, nome/marca e embalagem são compatíveis, score >= `0.84` e a diferença para o segundo candidato >= `0.10`. Ambiguidade exige confirmação manual. GTIN repetido pendente incrementa quantidade. O preço encontrado atualiza apenas `estimatedCents`.

## D-025 — Próximas faturas recorrentes começam como `Por preencher`
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

Uma nova ocorrência automática mantém descrição, fornecedor, categoria, método, recorrência e vencimento; define `totalCents = 0`; limpa referência, observações e data de emissão; usa `draft: true` até preenchimento. Drafts não entram em pendentes/atrasos. Faturas com pagamentos, canceladas, arquivadas ou editadas são preservadas.

## D-026 — Cabeçalho móvel é fixo; o conteúdo continua no scroller interno
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

`.main` continua o scroller interno e a navegação inferior continua fixa. O cabeçalho móvel usa `fixed`, respeita `safe-area-inset-top` e `.main` recebe `padding-top` para impedir sobreposição.

## D-027 — O topbar móvel é global e não recebe decoração específica por página
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

Início, Faturas, Compras e Relatórios mantêm a mesma geometria de título, menu, botão `+`, Sync e fundo. A identidade de cada módulo permanece no conteúdo e não na estrutura global do cabeçalho.

## D-028 — O redeploy manual de Pages deve repetir as verificações específicas da release
Data: 7 de setembro de 2026 · Estado: aceite, integrada no PR #46 e publicada.

O caminho manual de Pages deve verificar a sintaxe e executar a regressão específica das camadas críticas da release antes de preparar/publicar `dist`. A v64 acrescentou `v64-runtime.js` e o respetivo teste; a v65 estendeu o mesmo princípio a `market-shopping-focus.js` e `tests/market-shopping-focus.test.cjs`.

## D-029 — Lista de compras móvel prioriza execução e usa progressive disclosure
Data: 7 de setembro de 2026 · Estado: aceite, integrada no PR #48 e publicada na v65.

### Contexto

A página móvel apresentava pesquisa, botão de adição duplicado, três filtros, limpar filtros e quatro cartões financeiros antes do conteúdo operacional. Os cartões de cada produto também expunham permanentemente preço real, diferença e ações secundárias, mesmo durante a tarefa simples de marcar compras.

### Decisão

Na Lista de compras até 820 px:

- a primeira informação é uma linha compacta com **por comprar**, **comprados** e **previsto**;
- o detalhe financeiro completo fica em **Resumo financeiro**;
- o `+` do topbar reutiliza o handler existente de `#newMarketBtn`; o botão duplicado da página fica oculto no mobile;
- filtros mantêm os mesmos valores/handlers, mas ocupam menos espaço e **Limpar filtros** só aparece quando necessário;
- categorias com pendentes ficam abertas;
- comprados migram apenas no DOM para um grupo **Comprados** fechado por padrão;
- cada cartão mostra primeiro checkbox, nome, quantidade e preço, colocando informação secundária em `<details>`.

### Restrições

A camada não escreve em `appState`, não altera `estimatedCents`/`actualCents`/quantidade, não chama `commit()`/`saveState()`, não substitui handlers financeiros e não altera desktop. O agrupamento móvel move os nós existentes para preservar listeners e acessibilidade.

### Validação

PR #48 integrado no commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`. CI do PR run #1110, CI de `main` run #1111 e Deploy GitHub Pages run #1104 terminaram com sucesso.

## D-030 — Versão pública e revisões internas são conceitos distintos
Data: 7 de setembro de 2026 · Estado: aceite.

### Contexto

Ao promover a aplicação de v64 para v65, alguns testes históricos de imagens ainda exigiam literalmente `const BUILD = 'v64'`. O componente `v64-runtime.js` e a revisão `64-runtime1` continuam válidos e preservados, mas o build público passou corretamente para `v65`.

### Decisão

Testes de distribuição validam a **versão pública atual** quando inspecionam `BUILD`, assets versionados, manifesto e Service Worker. Testes de componentes preservados podem continuar a validar identificadores internos (`v64-runtime.js`, `64-runtime1`, `65-shopping1`) quando essas revisões não mudaram.

### Motivo

Separar a versão da aplicação da revisão de componentes evita falsos negativos de CI durante releases de apresentação e impede que um teste legado force alterações artificiais em código funcional que não mudou.

## D-031 — O shell móvel usa uma única cor canónica
Data: 7 de setembro de 2026 · Estado: aceite, integrada no PR #50 e publicada na v66.

### Contexto

Uma captura real de iPhone na Lista de compras mostrou uma diferença visível entre o fundo quase branco do cabeçalho e uma faixa/área azulada adjacente. A inspeção do código confirmou que `market-brand.css` aplicava um `radial-gradient` azul a `.main` no Mercado, enquanto o topbar `fixed` usava outro fundo com transparência e `backdrop-filter`. Como o topbar tem recuo lateral por `--page-gutter`, o fundo do Mercado ficava visível nas margens e a composição do Safari acentuava a diferença.

Também existiam três tons claros próximos na superfície PWA: tokens CSS, `theme-color` e `manifest.webmanifest`.

### Decisão

Até 820 px, todo o shell estrutural da aplicação usa um único token:

- claro: `--mobile-shell-bg: #f5f7fa`;
- escuro: `--mobile-shell-bg: #0f1722`.

O token é aplicado ao documento ativo, `body`, `.app-shell`, `.main`, `.main` específico do Mercado e `.topbar`. O topbar móvel fica opaco e sem `backdrop-filter`. O radial azul do Mercado continua permitido no desktop, mas é suprimido no shell móvel.

`manifest.webmanifest` e o `theme-color` inicial do build público usam `#f5f7fa`; `applyTheme()` continua a alternar para `#0f1722` no tema escuro.

### Versionamento

A release pública é `v66`. Como apenas a folha historicamente chamada `v64-runtime.css` mudou, ela recebe revisão própria `66-shell1`; `v64-runtime.js` permanece `64-runtime1` e `market-shopping-focus.js/.css` permanece `65-shopping1`.

### Restrições

A correção não altera geometria do cabeçalho, safe area, navegação, dados, scanner, faturas, pagamentos, persistência, cifragem ou sincronização. Não remove a identidade visual do Mercado no desktop.

### Validação

PR #50 integrado no commit `9657d558000018af1ea44e6040441f2b9d91648c`. CI do PR #1138, CI de `main` #1139 e Deploy GitHub Pages #1132 terminaram com sucesso. A verificação visual final no mesmo iPhone continua necessária porque a CI não reproduz a composição física do Safari/PWA.

### Motivo

Uma única superfície cromática elimina a emenda branco/azulado, reduz diferenças de composição entre Safari/PWA e mantém a regra D-027 de que o topbar é um componente global, não uma área tematizada por página.
