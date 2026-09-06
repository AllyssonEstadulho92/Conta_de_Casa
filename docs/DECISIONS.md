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
Estado: aceite. Os ícones são locais, auditáveis e não dependem de icon fonts/CDN em runtime.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. O QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Protótipo aprovado orienta a hierarquia móvel
Estado: aceite. Compras mantém título contextual, ação `+`, scanner, cartões-resumo, ações compactas e navegação consistente.

## D-011 — Cofre moderno não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta capacidades de autenticação que não estejam realmente implementadas.

## D-012 — Fotografia é independente do preço
Estado: aceite como regra histórica. Uma fotografia nunca prova preço nem transação.

## D-013 — Atualização de software usa Service Worker same-origin
Estado: aceite. Atualizações públicas são distribuídas pela própria aplicação/PWA.

## D-014 — Imagens por SKU com validação estrita
Estado: compatibilidade histórica. Enquanto os módulos antigos existirem, uma imagem só pode ser considerada oficial quando cadeia e identificador correspondem.

## D-015 — Reader externo restrito a páginas públicas validadas
Estado: compatibilidade histórica. Mantém-se apenas enquanto o pipeline antigo de imagens estiver distribuído.

## D-016 — Integração de imagens usa o contrato real do DOM
Estado: histórico/compatibilidade. A integração depende de seletores e identificadores públicos, não de estado privado entre módulos.

## D-017 — Cartões vivos de retalhista eram `official-only`
Estado: substituída na apresentação por D-018. A regra permanece apenas no pipeline histórico ainda distribuído.

## D-018 — Mercado orientado a nomes, sem fotografias de produto
Data: 6 de setembro de 2026 · Estado: aceite.

A interface de Compras/Mercado é `text-first`: nome, embalagem/quantidade, loja, categoria, estado e preço são a identidade principal. Fotografias/placeholder não ocupam espaço. A câmara permanece para leitura de código de barras. Metadados históricos de imagem são preservados por compatibilidade.

## D-019 — O layout do browser do Mercado tem posições explícitas em mobile
Data: 6 de setembro de 2026 · Estado: aceite.

Conteúdo textual e botão `+` usam posições explícitas no Grid para impedir colunas fantasma causadas por slots históricos ocultos. Abaixo de 360 px, o preço reflui em vez de comprimir palavras.

## D-020 — Metadados visuais do Mercado são conflitos técnicos, não decisões financeiras
Data: 6 de setembro de 2026 · Estado: aceite.

`sync-conflict-policy.js` retira apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` da vista de equivalência do Mercado. Nome, categoria, quantidade, unidade, `estimatedCents`, `actualCents`, estado e datas de compra continuam a ser dados reais.

## D-021 — A Lista de compras é agrupada por categoria sem alterar o modelo
Data: 6 de setembro de 2026 · Estado: aceite.

A Lista de compras agrupa itens pela categoria existente, usando `<details>/<summary>` em mobile e separadores na tabela desktop. A camada reorganiza os mesmos nós por `data-market-toggle`, sem criar/migrar dados e preservando os handlers existentes.

## D-022 — Uma única camada final resolve colisões visuais entre CSS legados
Data: 6 de setembro de 2026 · Estado: aceite e publicada na v63.

### Contexto

A aplicação acumulou camadas visuais legítimas em momentos diferentes. Duas colisões foram confirmadas no Safari/iPhone:

- a navegação inferior desenhava simultaneamente o indicador ativo em `::before` e `::after`;
- `market-summary-item::before` era usado ao mesmo tempo como ícone semântico e como faixa cromática superior.

O problema não estava no SVG em si, mas na sobreposição de responsabilidades entre pseudo-elementos e folhas CSS diferentes.

### Decisão

`ui-consistency.css` é a **última camada de apresentação**, sem acesso a estado ou regras de negócio.

Regras obrigatórias:

- Lucide continua o único sistema vetorial oficial;
- `.ui-icon-svg` e `.svg-icon` usam métrica final comum (`stroke-width: 2`, linecap/linejoin arredondados e `vector-effect: non-scaling-stroke`);
- navegação mobile mantém apenas `::before` como indicador ativo e anula `::after` redundante;
- a faixa dos cartões-resumo é um `inset` sólido no próprio cartão;
- `market-summary-item::before` fica reservado exclusivamente ao ícone semântico;
- a camada final é carregada depois de `market-brand.css` e `market-category-groups.css`.

### Consequência

A app tem um ponto explícito de consolidação visual sem reescrever o design system inteiro. A mudança é isolada e reduz regressões de especificidade no Safari.

## D-023 — Cada alteração pública relevante gera versão, manifesto e instalação confirmada
Data: 6 de setembro de 2026 · Estado: aceite e publicada na v63.

### Contexto

As alterações futuras devem aparecer na área **Atualização de Software**, com histórico, número de versão e instalação deliberada. Atualizações silenciosas dificultam saber o que mudou e comparar dispositivos.

### Decisão

A partir da v63:

- `release-manifest.json` é a fonte pública do histórico de releases;
- `latestVersion` deve corresponder ao build produzido por `scripts/prepare-pages.cjs`;
- divergência entre manifesto e build faz a preparação do Pages falhar;
- o Centro de Atualização consulta o manifesto same-origin com `cache: no-store`;
- um Service Worker novo permanece `waiting` durante uma atualização normal;
- a ativação é solicitada após ação explícita em **Atualizar agora**, via `APPLY_UPDATE`;
- `SKIP_WAITING` permanece como compatibilidade com clientes v62;
- a atualização substitui assets da aplicação e não migra/apaga o cofre financeiro;
- o Service Worker continua a cachear apenas caminhos existentes em `PUBLIC_ASSET_SET`.

### Regra de transição

A v62 não tinha ainda o manifesto/controlador completo da v63. Por isso, a passagem inicial v62 → v63 pode exigir fechar/reabrir ou atualizar a aplicação uma vez. Depois de instalada a v63, as versões seguintes seguem o fluxo explícito do Centro de Atualização.

### Segurança

O parâmetro `ts` usado para obter um manifesto fresco só é aceite como parâmetro único e não contorna a allowlist de assets. Não são introduzidos endpoints externos, credenciais ou telemetria.

### Consequência

O ciclo oficial passa a ser: **alteração → nova versão → notas no manifesto → CI → main → Pages → instalação pelo Centro de Atualização**. A versão é parte do critério de conclusão de releases públicas.
