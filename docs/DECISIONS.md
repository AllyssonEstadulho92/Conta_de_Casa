# Decisões Técnicas — Conta de Casa

Atualizado: 6 de setembro de 2026

Este ficheiro mantém as decisões arquiteturais vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## D-001 — Altura estrutural separada do VisualViewport

Estado: aceite.

`.app-shell`/`.main` usam `100dvh`/`100svh`; `VisualViewport` fica reservado a teclado e diálogos. Evita cortes provocados pelas barras móveis do Safari.

## D-002 — Camada móvel dedicada

Estado: aceite.

`mobile-layout.css` permanece como camada de compatibilidade enquanto o CSS legado é consolidado gradualmente.

## D-003 — Densidade móvel sem sacrificar alvos tácteis

Estado: aceite.

Cartões podem compactar a hierarquia em mobile, mantendo legibilidade e alvos tácteis adequados.

## D-004 — Mercado como camada isolada

Estado: aceite.

Descoberta/apresentação do Mercado não reescreve o núcleo de estado, cifragem ou cálculos financeiros.

## D-005 — Nunca tratar demonstração como preço real

Estado: aceite.

Valores fictícios não alimentam totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa

Estado: aceite.

Preços obtidos do catálogo entram em `estimatedCents`; `actualCents` representa o valor efetivamente pago.

## D-007 — Código de barras identifica produto, não preço

Estado: aceite.

GTIN/EAN/UPC pode identificar o SKU, mas o preço é obtido de fonte própria e exige confirmação do utilizador.

## D-008 — Lucide como sistema vetorial oficial

Estado: aceite.

Lucide é vendorizado localmente, sem icon font/CDN em runtime. Snapshot auditável: `94e4cb9d9db5907053ebf3636a97c45529cf776b`.

## D-009 — QR fiscal como preenchimento assistido

Estado: aceite.

A leitura QR preenche apenas campos estruturados comprováveis; o utilizador revê antes de guardar. Imagens não são persistidas.

## D-010 — Protótipo aprovado orienta a hierarquia móvel

Estado: aceite.

Compras mantém título contextual, ação `+`, scanner, cartões-resumo, ações compactas e navegação consistente sem alterar o modelo financeiro.

## D-011 — Cofre moderno não simula biometria

Estado: aceite.

A interface pode usar linguagem visual moderna de PIN, mas não mostra passkey/biometria sem implementação WebAuthn real e auditada.

## D-012 — Fotografia é referência visual independente do preço

Estado: aceite.

Uma fotografia não é prova do preço nem da transação. Ausência de imagem é preferível a uma variante incorreta.

## D-013 — Atualização de software usa Service Worker same-origin

Estado: aceite.

O Centro de Atualização usa `ServiceWorkerRegistration.update()`, `SKIP_WAITING`, `controllerchange` e notas de release versionadas. Beta continua desativado sem pipeline própria.

## D-014 — Imagens por SKU com validação estrita

Estado: aceite.

A imagem oficial só é considerada oficial quando domínio, catálogo/CDN e identificador do produto correspondem. Open Facts permanece fallback. Não se aceita URL arbitrária devolvida por um reader.

## D-015 — Reader externo restrito a páginas públicas validadas

Estado: aceite.

Como Continente/Pingo Doce não expõem o HTML das páginas de produto através de CORS utilizável pela PWA, `r.jina.ai` pode ser usado exclusivamente como reader de uma URL pública de produto previamente validada. Não recebe dados do cofre nem credenciais.

## D-016 — Integração de imagens oficiais deve usar o contrato real do DOM

Data: 6 de setembro de 2026 · Estado: aceite.

### Contexto

A v60 passou todos os probes de origem, mas a captura real no iPhone continuou com placeholders. A auditoria do código encontrou uma falha de fronteira entre módulos:

- `market-experience.js` mantém `resultById` e funções relacionadas dentro de um IIFE;
- a camada externa v60 tentou alterar funções privadas que não eram globais;
- procurava `.market-product-source[href]`, mas o controlo renderizado é `.market-result-source`;
- tentava interceptar `[data-market-add]`, mas o botão real é `[data-market-add-product]`.

Logo, a existência da fotografia na fonte não garantia que o cartão real a recebesse.

### Decisão

Criar `market-official-images.js` como bridge progressivo que depende apenas de contratos públicos/reais:

- `[data-market-product-card]` para cadeia + `pid`;
- `.market-result-source` para a ação do retalhista;
- `[data-market-add-product]` para o fluxo real de adição;
- `appState.market`/`saveState()` apenas depois de o fluxo existente criar o item.

O bridge não tenta aceder a `resultById` nem reatribuir funções privadas de outro IIFE.

### Resolução da imagem

1. obter URL do SKU através de `cesta.pt`;
2. validar cadeia e `pid`;
3. ler a página pública via reader restrito;
4. aceitar apenas imagem oficial com o mesmo `pid`;
5. confirmar que a imagem carrega;
6. substituir o placeholder e manter o zoom;
7. persistir URL/origem após a ação real de adicionar.

### CORS/Safari

O novo bridge usa GET com apenas `Accept: application/json` no reader. Cabeçalhos personalizados de retenção/resumo de imagem foram removidos do pedido desta camada para evitar preflight desnecessário. Isto é uma medida de robustez; não se declara que o preflight era a única causa da falha v60.

### Sinalização

A interface separa três conceitos:

- `Consultado agora` = atualidade da consulta/preço;
- `Ver no Pingo Doce` / `Ver no Continente` = ligação para a página do produto;
- `Pingo Doce · imagem oficial` / `Continente · imagem oficial` = proveniência da fotografia.

O texto genérico “Produto oficial” deixa de ser usado pelo bridge porque podia sugerir, junto de um placeholder, que a própria miniatura vazia era oficial.

### Segurança

- nenhuma credencial no bridge;
- `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- reader recebe apenas URL pública validada;
- nenhuma informação financeira ou conteúdo do cofre é enviado;
- imagem oficial exige correspondência exata do `pid`;
- falha de imagem nunca altera preço nem impede a adição do produto.

### Consequência

Build passa a v61, cache a `conta-de-casa-public-v61-official-images-bridge`, novo asset entra na allowlist Pages/Service Worker e existe teste dedicado `tests/market-official-images.test.cjs`.
