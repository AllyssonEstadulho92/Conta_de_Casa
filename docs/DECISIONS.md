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

A imagem oficial só é considerada oficial quando domínio, catálogo/CDN e identificador do produto correspondem. Open Facts pode existir como fonte auxiliar/fallback noutros contextos, mas não transforma uma correspondência aproximada em fotografia oficial.

## D-015 — Reader externo restrito a páginas públicas validadas

Estado: aceite.

Como Continente/Pingo Doce não expõem o HTML das páginas de produto através de CORS utilizável pela PWA, `r.jina.ai` pode ser usado exclusivamente como reader de uma URL pública de produto previamente validada. Não recebe dados do cofre nem credenciais.

## D-016 — Integração de imagens oficiais deve usar o contrato real do DOM

Data: 6 de setembro de 2026 · Estado: aceite.

### Contexto

A v60 passou probes de origem, mas a captura real no iPhone continuou com placeholders. A auditoria encontrou uma falha de fronteira entre módulos: funções privadas dentro de IIFEs e seletores que não correspondiam ao HTML real.

### Decisão

`market-official-images.js` depende apenas dos contratos públicos/reais:

- `[data-market-product-card]` para cadeia + `pid`;
- `.market-result-source` para a ação do retalhista;
- `[data-market-add-product]` para o fluxo real de adição;
- `appState.market`/`saveState()` apenas depois de o fluxo existente criar o item.

O bridge obtém a URL do SKU através de `cesta.pt`, valida cadeia e `pid`, lê a página pública através do reader restrito, aceita apenas imagem oficial com o mesmo `pid`, confirma carregamento e só depois substitui o placeholder.

O novo bridge usa GET com apenas `Accept: application/json` no reader para evitar preflight desnecessário no Safari.

### Sinalização

- `Consultado agora` = atualidade da consulta/preço;
- `Ver no Pingo Doce` / `Ver no Continente` = ligação para a página do produto;
- `Pingo Doce · imagem oficial` / `Continente · imagem oficial` = proveniência da fotografia.

## D-017 — Cartões vivos de retalhista são `official-only`

Data: 6 de setembro de 2026 · Estado: aceite.

### Contexto

Após a v61, a validação física mostrou fotografias que não correspondiam à imagem da página oficial. O bridge v61 estava correto, mas coexistia com mecanismos anteriores:

- `market-experience.js` podia enriquecer resultados vivos com imagem do Open Food Facts por semelhança textual;
- `market-image-audit.js` podia aplicar Open Food/Beauty/Products/Pet Facts quando a imagem oficial não fosse resolvida;
- esses mecanismos não tinham autorização semântica para afirmar que a imagem era a fotografia do SKU do Pingo Doce/Continente.

A causa foi classificada como **concorrência de políticas de imagem**, não como falha do CDN oficial.

### Decisão

Em resultados vivos do Pingo Doce e Continente, a política é exclusiva:

> Só a fotografia oficial validada para a mesma cadeia e o mesmo `pid` pode ser apresentada. Sem prova exata, mantém-se placeholder.

Implementação em `market-retailer-image-policy.js`:

- identifica apenas cartões `cesta-(continente|pingo-doce)-<pid>`;
- marca `data-market-image-audit="done"` para impedir fallback legado nesse cartão;
- marca `data-market-retailer-image-policy="official-only"`;
- valida qualquer imagem existente exclusivamente por `CDCOfficialMarketImages.safeOfficialImageUrl`;
- remove imagens de outras origens/variantes e volta a placeholder;
- observa alterações de DOM/`src` para impedir reintrodução posterior de fallback;
- após adicionar, remove metadados visuais auxiliares se não existir uma resolução oficial segura.

### Delimitação

Open Facts não é removido globalmente. Pode continuar a servir identificação por código de barras, itens anteriores e outros fluxos auxiliares explicitamente cobertos. A restrição é sobre a **fotografia dos cartões vivos de retalhista**.

### Segurança

A política v62 não acrescenta endpoints nem executa `fetch`. Reutiliza a validação v61. Falha visual não altera `estimatedCents`, `actualCents`, quantidade nem qualquer total financeiro.

### Consequência

Build passa a `v62`, cache a `conta-de-casa-public-v62-retailer-official-only`, `market-retailer-image-policy.js` entra em Pages/Service Worker antes da auditoria legada e os testes passam a exigir a regra `official-only`.
