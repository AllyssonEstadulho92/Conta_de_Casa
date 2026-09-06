# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público: v62

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. As integrações externas do Mercado servem descoberta de catálogo, preço, identificação de produto e referência visual; não recebem conteúdo financeiro do cofre.

## Camadas principais

### Estrutura e apresentação

- `index.html` — template semântico, CSP base, páginas, navegação e diálogos.
- `styles.css` / `design-system.css` — estilos base e design system.
- `mobile-layout.css` — compatibilidade de viewport/Safari e safe areas.
- `market-experience.css` — descoberta/apresentação do Mercado.
- `market-image-audit.css` — miniaturas interativas e visualizador ampliado.
- `market-barcode.css` — scanner GTIN/EAN/UPC.
- `ui-icons.css` — linguagem visual Lucide e overrides finais.
- `invoice-capture.css` — captura QR de faturas.
- `app-update.css` — Centro de Atualização.

### JavaScript

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários.
- `finance.js` — cálculos financeiros.
- `render.js` — renderização de páginas/listas.
- `forms.js` — formulários e validação.
- `sync.js` — sincronização cifrada opcional via GitHub.
- `events.js` — navegação, eventos, cofre e Service Worker.
- `market-experience.js` — catálogo/preço Pingo Doce e Continente via `cesta.pt`; criação confirmada de itens; mantém pesquisa visual auxiliar legada para compatibilidade.
- `market-retailer-image-policy.js` — política v62 que torna resultados vivos do Pingo Doce/Continente `official-only` e bloqueia imagens aproximadas de outras fontes.
- `market-image-audit.js` — resolvedor v59/v60, Open Facts, visualizador e fallbacks para contextos compatíveis/legados; não substitui cartões vivos marcados pela política v62.
- `market-official-images.js` — bridge v61/v62 entre o DOM real dos cartões e a resolução/persistência da fotografia oficial por `pid`.
- `market-barcode.js` — leitura GTIN e identificação assistida.
- `invoice-capture.js` — leitura local de QR fiscal.
- `ui-icons.js` — subset Lucide local.
- `app-update.js` — versão, notas de release e atualização do Service Worker.

## Modelo financeiro e segurança

O schema financeiro permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. O Mercado mantém `estimatedCents` separado de `actualCents`; quantidade permanece separada do preço unitário.

O cofre usa IndexedDB e envelope cifrado. O modelo continua baseado em PBKDF2-SHA-256 + AES-GCM. A v62 não altera autenticação, derivação de chave, backups ou sincronização.

Metadados visuais opcionais do item:

- `productCode`;
- `imageUrl`;
- `imageSource`;
- `imageMatchedAt`.

Apenas URL/metadados são persistidos. Binários não entram no cofre.

## Mercado — separação de responsabilidades

1. **Catálogo, preço e página do produto:** `market-experience.js` + `cesta.pt/mcp`.
2. **Código de barras:** `market-barcode.js`.
3. **Política visual dos cartões vivos:** `market-retailer-image-policy.js`.
4. **Fotografia oficial por SKU/pid:** `market-official-images.js`.
5. **Fallbacks/visualizador para contextos compatíveis:** `market-image-audit.js`.
6. **Persistência financeira:** fluxo existente de `market-experience.js`, apenas após ação explícita do utilizador.

Uma fotografia não é prova de preço. Um preço pesquisado não é o preço efetivamente pago. Um GTIN/PID identifica um artigo, mas a imagem de um cartão vivo Pingo Doce/Continente só é aceite como fotografia do produto quando a cadeia, catálogo/CDN e o `pid` coincidem exatamente.

## Evolução v60 → v61 → v62

### v60 — disponibilidade sem integração fiável

A fonte conseguia fornecer imagens oficiais, mas a camada usava seletores e fronteiras internas que não correspondiam ao browser real.

### v61 — bridge oficial pelo contrato real

Contratos públicos usados:

- cartão: `[data-market-product-card]`;
- ação de adicionar: `[data-market-add-product]`;
- ação da loja: `.market-result-source`;
- identificador do cartão: `cesta-(continente|pingo-doce)-<pid>`.

O bridge deixou de depender de `resultById` privado e passou a validar página/imagem por `pid`.

### v62 — exclusividade visual

A validação física posterior revelou que v61 coexistia com dois mecanismos anteriores:

- enriquecimento inicial por Open Food Facts em `market-experience.js`;
- fallbacks Open Facts em `market-image-audit.js`.

Esses mecanismos podiam apresentar uma imagem aproximada antes/depois de o bridge oficial atuar. A v62 estabelece uma fronteira explícita: **cartões vivos de retalhista são official-only**.

## Política `official-only` v62

`market-retailer-image-policy.js` executa antes de `market-image-audit.js` na composição pública Pages.

Para cada cartão vivo:

1. extrai `marketId` e `pid` de `data-market-product-card`;
2. define `data-market-retailer-image-policy="official-only"`;
3. define `data-market-image-audit="done"`, impedindo a auditoria/fallback legado de processar esse cartão;
4. valida qualquer `<img>` existente apenas através de `CDCOfficialMarketImages.safeOfficialImageUrl(url, marketId, pid)`;
5. se a validação falhar, substitui a imagem por `.market-product-photo.is-empty`;
6. um `MutationObserver` vigia novos cartões e alterações de `src`, impedindo reintrodução posterior de uma imagem não oficial;
7. a fotografia oficial resolvida pelo bridge é preservada porque passa a mesma validação exata por `pid`;
8. no fluxo real de adicionar, se a imagem criada pelo pipeline auxiliar não for oficial e não existir resolução oficial, os metadados visuais auxiliares são limpos antes de permanecerem no item.

A política não faz `fetch` nem adiciona uma fonte de rede.

## Fluxo da fotografia oficial

Para cada cartão visível/próximo do viewport:

1. extrair cadeia, nome, embalagem e `pid` do DOM real;
2. consultar/reutilizar `cesta.pt` para obter a URL pública do mesmo `pid`;
3. validar a página oficial;
4. pedir a página ao reader restrito `r.jina.ai` através de GET CORS simples;
5. extrair URLs candidatas;
6. aceitar apenas imagem do catálogo/CDN oficial com o `pid` exato;
7. testar o carregamento real com `Image`;
8. substituir o placeholder e manter o visualizador acessível;
9. depois da ação real `+`, persistir a mesma imagem/origem no item criado.

Máximo de três resoluções simultâneas. `IntersectionObserver` evita resolver de imediato todo o catálogo.

## Sinalização sem conflito

- **Consultado agora**: estado temporal da consulta/preço;
- **Ver no Pingo Doce / Ver no Continente**: ação para abrir a página do produto;
- **Pingo Doce · imagem oficial / Continente · imagem oficial**: proveniência da fotografia validada.

Se não existir imagem oficial segura, o cartão fica com placeholder. Não se substitui por uma imagem “parecida” para preencher espaço visual.

## Rede, CORS e privacidade

`cesta.pt` continua a ser a fonte de catálogo/preço. `r.jina.ai` recebe apenas uma URL pública de produto previamente validada e o bridge usa GET com `Accept: application/json`.

Pedidos do bridge usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`. Não há Authorization/API key. PIN, chave do cofre, faturas, saldos e token GitHub não são enviados para resolver imagens.

Open Facts continua autorizado na CSP porque scanner, itens anteriores e outros fluxos auxiliares podem necessitar dessas origens. **A autorização CSP não significa autorização semântica para preencher um cartão vivo de retalhista**; essa decisão pertence à política v62.

## CSP e distribuição v62

`scripts/prepare-pages.cjs` compõe `v62` e inclui:

- `market-retailer-image-policy.js`;
- `market-image-audit.js`;
- `market-official-images.js`.

A ordem pública é deliberada: política official-only → auditoria legada → bridge oficial.

Service Worker: `conta-de-casa-public-v62-retailer-official-only`.

O novo asset entra no cache offline do shell. Imagens remotas não são copiadas para o cofre.

## Testes e publicação

A cobertura v62 verifica sintaxe, exclusão dos cartões vivos do fallback legado, remoção de imagem não oficial, validação exclusiva por `safeOfficialImageUrl` + `pid`, limpeza de metadados auxiliares, ordem dos scripts, cache/build e regressões financeiras/segurança/responsividade.

Publicação confirmada:

- CI da branch: `34008447948` — `success`;
- CI do PR #34: `34008477059` — `success`;
- merge: `231e445839f07316344719b7423890c6e2e99c47`;
- CI de `main`: `34008497654` — `success`;
- Deploy Pages: `34008513566` — `success`.

Regras de manutenção:

- nunca usar semelhança textual para classificar uma fotografia de cartão vivo como imagem oficial;
- ausência de fotografia é preferível a fotografia de outra variante/origem;
- não depender de variáveis privadas de outro IIFE;
- manter preço, página da loja e proveniência da imagem semanticamente separados;
- novas origens exigem CSP explícita, testes e documentação;
- qualquer alteração Safari/dialog/safe area exige validação física.
