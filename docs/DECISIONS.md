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
Estado: aceite. Compras mantém título contextual, ação `+`, scanner, cartões-resumo, ações compactas e navegação inferior consistente.

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

`ui-consistency.css` consolida as regras visuais globais sem tocar no estado financeiro:

- Lucide é o único sistema vetorial;
- `.ui-icon-svg` e `.svg-icon` usam a mesma métrica;
- a navegação móvel mantém um único indicador ativo em `::before`;
- `::after` redundante é desativado;
- a faixa dos cartões-resumo é um `inset` sólido;
- `market-summary-item::before` fica reservado ao ícone semântico.

## D-023 — Cada alteração pública relevante gera versão, manifesto e instalação confirmada
Data: 6 de setembro de 2026 · Estado: aceite.

Ciclo oficial: **alteração → nova versão → notas no `release-manifest.json` → CI → `main` → Pages → instalação pelo Centro de Atualização**.

Regras:

- `latestVersion` deve corresponder ao build de `scripts/prepare-pages.cjs`;
- o manifesto é same-origin e consultado com `cache: no-store`;
- atualização normal não ativa silenciosamente o novo worker;
- **Atualizar agora** envia `APPLY_UPDATE`;
- a allowlist do Service Worker permanece explícita;
- atualizar assets não apaga/migra o cofre financeiro.

## D-024 — Auto-adição por código de barras exige correspondência conservadora
Data: 7 de setembro de 2026 · Estado: aceite para v64.

### Contexto

O utilizador pretende ler o produto no supermercado e reduzir ao mínimo a intervenção manual. O risco é adicionar automaticamente uma embalagem, variante ou loja errada.

### Decisão

A auto-adição só pode ocorrer quando:

- existe exatamente um supermercado selecionado;
- o resultado pertence ao mesmo supermercado;
- nome/marca e embalagem são compatíveis;
- score de correspondência é pelo menos `0.84`;
- a diferença para o segundo candidato é pelo menos `0.10`.

Resultados ambíguos exigem confirmação manual. O mesmo GTIN ainda pendente incrementa quantidade em vez de duplicar a linha.

### Segurança financeira

O preço encontrado atualiza apenas `estimatedCents`. A automatização não escreve `actualCents` e não pode transformar uma consulta de catálogo em prova do preço efetivamente pago.

## D-025 — Próximas faturas recorrentes começam como `Por preencher`
Data: 7 de setembro de 2026 · Estado: aceite para v64.

### Contexto

Uma recorrência mensal representa a continuidade da obrigação, não a garantia de que valor, referência ou observações serão iguais no mês seguinte.

### Decisão

Uma nova ocorrência recorrente automática mantém os campos estruturais reutilizáveis e limpa os campos variáveis:

- mantém descrição, fornecedor, categoria, método, recorrência e vencimento previsto;
- define `totalCents = 0`;
- limpa referência, observações e data de emissão;
- usa `draft: true` até o utilizador preencher a nova fatura.

Drafts não entram em pendentes/atrasos. Faturas com pagamentos, canceladas, arquivadas ou já editadas não são limpas pela migração.

## D-026 — Cabeçalho móvel é fixo; o conteúdo continua no scroller interno
Data: 7 de setembro de 2026 · Estado: aceite para v64.

### Contexto

Capturas reais de Safari/iPhone mostraram que a primeira linha do cabeçalho podia ficar parcialmente fora da área visível depois de deslocar a página. O código usava `position:sticky` dentro de `.main`, que é um scroller interno limitado por `100dvh`.

### Decisão

Sem substituir toda a arquitetura móvel:

- `.main` continua o scroller interno;
- a navegação inferior continua fixa;
- o cabeçalho móvel passa de `sticky` para `fixed` na camada final v64;
- `safe-area-inset-top` e uma folga mínima definem a zona tátil superior;
- `.main` recebe `padding-top` igual à altura do cabeçalho para impedir sobreposição.

### Motivo

A correção elimina a dependência de `sticky` no scroller interno do Safari, reduz o risco de regressão no teclado/bottom nav e preserva D-001/D-002.

## D-027 — O topbar móvel é global e não recebe decoração específica por página
Data: 7 de setembro de 2026 · Estado: aceite para v64.

### Contexto

A comparação direta entre **Início** e **Lista de compras** mostrou que a página de Compras estava a alterar o próprio cabeçalho global. Regras históricas associadas a `html.market-prototype-active` acrescentavam carrinho ao título, aumentavam a escala tipográfica, ampliavam o botão `+` e adicionavam um chevron ao Sync.

### Decisão

O cabeçalho móvel deve manter a mesma geometria em todas as páginas principais:

- título com a mesma hierarquia e tamanho;
- sem pseudo-ícone específico antes do `h1`;
- menu com a mesma caixa tátil;
- botão `+` com a mesma caixa e superfície visual;
- Sync com a mesma altura, largura máxima e sem chevron extra;
- fundo do topbar visualmente uniforme.

A identidade de cada módulo fica no conteúdo da página, nos cartões, estados e navegação, não na estrutura do topbar.

### Motivo

Evita que o utilizador interprete páginas como aplicações diferentes, reduz conflitos de CSS e mantém a hierarquia definida no Design System sem alterar rotas, dados ou fluxos.
