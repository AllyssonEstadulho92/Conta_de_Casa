# Decisões Técnicas — Conta de Casa

Atualizado: 6 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam `100dvh`/`100svh`; `VisualViewport` fica reservado a teclado e diálogos.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` permanece como camada de compatibilidade para Safari, safe areas e viewport móvel.

## D-003 — Densidade móvel sem sacrificar alvos tácteis
Estado: aceite. A interface pode compactar cartões em mobile mantendo legibilidade e alvos tácteis adequados.

## D-004 — Mercado como camada isolada
Estado: aceite. A experiência do Mercado não reescreve o núcleo financeiro, cifragem ou persistência.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não alimentam totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. O catálogo alimenta `estimatedCents`; `actualCents` representa o preço efetivamente pago.

## D-007 — Código de barras identifica produto, não preço
Estado: aceite. GTIN/EAN/UPC pode ajudar a identificar o artigo; o preço continua a vir da fonte própria do Mercado.

## D-008 — Lucide como sistema vetorial oficial
Estado: aceite. Os ícones são locais e auditáveis.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. O QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Protótipo aprovado orienta a hierarquia móvel
Estado: aceite. Compras mantém título contextual, ação `+`, scanner, cartões-resumo, ações compactas e navegação consistente.

## D-011 — Cofre moderno não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta capacidades de autenticação que não estejam realmente implementadas.

## D-012 — Fotografia é independente do preço
Estado: aceite como regra histórica. Uma fotografia nunca prova preço nem transação.

## D-013 — Atualização de software usa Service Worker same-origin
Estado: aceite. Atualizações públicas continuam a ser distribuídas pela própria aplicação/PWA.

## D-014 — Imagens por SKU com validação estrita
Estado: compatibilidade histórica. Enquanto os módulos antigos existirem, uma imagem só pode ser considerada oficial quando cadeia e identificador correspondem.

## D-015 — Reader externo restrito a páginas públicas validadas
Estado: compatibilidade histórica. Mantém-se apenas enquanto o pipeline antigo de imagens estiver distribuído.

## D-016 — Integração de imagens usa o contrato real do DOM
Estado: histórico/compatibilidade. A integração deve depender de seletores e identificadores públicos, não de estado privado entre módulos.

## D-017 — Cartões vivos de retalhista eram `official-only`
Estado: substituída na apresentação por D-018. A regra continua válida apenas para o pipeline histórico que ainda permaneça no código.

## D-018 — Mercado orientado a nomes, sem fotografias de produto
Data: 6 de setembro de 2026 · Estado: aceite.

### Contexto
A fotografia deixou de ser requisito da experiência. Nome, embalagem/quantidade, loja, categoria e preço são suficientes para identificar o produto e tomar a decisão de compra.

### Decisão
A interface de Compras/Mercado passa a ser `text-first`:

- fotografias e placeholders deixam de ocupar espaço;
- o nome passa a ser o identificador visual principal;
- preço, estado e loja continuam claramente visíveis;
- a câmara permanece porque serve leitura de código de barras;
- nomes/logos dos mercados podem permanecer porque identificam a fonte;
- metadados antigos de imagem não são apagados apenas por esta alteração visual.

### Implementação
`market-brand.css` oculta fotografias e reorganiza os cards. `market-branding.js` atualiza apenas a cópia informativa do browser e não toca no estado financeiro. `scripts/prepare-pages.cjs` e `sw.js` distribuem os dois assets.

Os módulos antigos de imagem permanecem temporariamente por compatibilidade. A sua remoção definitiva será uma alteração separada, após validação física, para não misturar uma mudança visual com uma refatoração arquitetural ampla.

### Consequência
A decisão reduz ruído visual e preserva os dados e comportamentos existentes. Nenhum cálculo, preço, quantidade, credencial, cofre ou sincronização é alterado.

## D-019 — O layout do browser do Mercado tem posições explícitas em mobile
Data: 6 de setembro de 2026 · Estado: aceite.

### Contexto
A validação física em iPhone/Safari revelou um cartão com grande área vazia à esquerda e todo o texto comprimido numa coluna estreita à direita. O DOM histórico ainda pode conter um nó de fotografia oculto e diferentes camadas CSS podem influenciar o auto-placement do Grid.

### Decisão
No browser do Mercado, o conteúdo textual e o botão `+` passam a ter `grid-column`/`grid-row` explícitos. O bloco textual organiza nome, embalagem/loja, estado/origem e preço sem depender do auto-placement de um nó de imagem oculto. Abaixo de 360 px o preço reflui para uma linha própria.

### Consequência
A ausência de fotografia deixa de poder criar uma “coluna fantasma”. O cartão mantém largura útil, palavras inteiras, preço legível e ação tátil estável em iPhone/Safari.

## D-020 — Metadados visuais do Mercado são conflitos técnicos, não decisões financeiras
Data: 6 de setembro de 2026 · Estado: aceite.

### Contexto
A sincronização podia apresentar uma revisão com `0 diferenças` quando dois dispositivos tinham o mesmo item financeiro mas metadados auxiliares diferentes (`productCode`, `imageUrl`, `imageSource`, `imageMatchedAt`). Esses campos não constam da comparação financeira visível e não devem exigir uma escolha do utilizador.

### Decisão
`sync-conflict-policy.js` remove apenas esses quatro campos da vista de negócio usada para decidir se dois registos do Mercado são equivalentes. O motor base continua a escolher e preservar o registo compatível mais completo. Campos de negócio como nome, categoria, quantidade, unidade, preço estimado, preço real, estado de compra e data de compra continuam a gerar conflito real quando divergem sem uma versão temporalmente mais recente.

### Consequência
Diferenças técnicas de imagem/código de barras são reconciliadas automaticamente e deixam de bloquear a sincronização. Nenhum valor financeiro é escolhido automaticamente.

## D-021 — A Lista de compras é agrupada por categoria sem alterar o modelo
Data: 6 de setembro de 2026 · Estado: aceite e publicado.

### Contexto
A validação física da lista mostrou que uma sequência longa de cartões individuais dificulta localizar produtos e repete a categoria em cada item. A informação já possui categoria estruturada, pelo que não é necessário alterar o schema para melhorar a organização.

### Decisão
A apresentação da Lista de compras passa a agrupar itens pela categoria já existente:

- cada categoria é um grupo visual independente, expandido por defeito e recolhível com `<details>/<summary>`;
- o cabeçalho mostra categoria e contagem de itens;
- a ordem das categorias segue a taxonomia conhecida do Mercado e categorias não previstas ficam no fim por ordem alfabética;
- a ordem interna dos itens continua a ser a definida pelos filtros/ordenação existentes;
- em mobile, os cartões tornam-se linhas compactas dentro do grupo;
- em desktop, a tabela mantém as colunas e recebe separadores de categoria;
- nenhuma categoria, preço, quantidade ou estado é alterado pela camada de apresentação.

### Implementação
`market-category-groups.js` reorganiza o DOM já renderizado usando o identificador real `data-market-toggle` e a categoria presente em `appState.market`. `market-category-groups.css` aplica a apresentação compacta. Os handlers existentes de editar, eliminar, checkbox e preço real são preservados porque os mesmos nós são movidos, não recriados.

### Consequência
A lista fica mais previsível e rápida de consultar sem duplicar lógica de negócio nem alterar persistência. A mudança pode ser removida isoladamente sem migração de dados.

### Publicação
A decisão foi integrada em `main` através do PR #40, merge `98662aa366ea65316ebd47cf56df8f2a3eeac974`, com CI de `main` e Deploy GitHub Pages concluídos com sucesso.
