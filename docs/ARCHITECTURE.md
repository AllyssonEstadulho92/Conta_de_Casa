# Arquitetura — Conta de Casa

Atualizado: 6 de setembro de 2026
Build em validação: v61

## Visão geral

**Conta de Casa** é uma aplicação web estática/PWA distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. As integrações externas do Mercado servem apenas descoberta de catálogo, preço e referência visual; não recebem conteúdo financeiro do cofre.

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
- `market-experience.js` — catálogo/preço Pingo Doce e Continente via `cesta.pt`; criação confirmada de itens.
- `market-image-audit.js` — resolvedor v59/v60, Open Facts, visualizador e fallbacks.
- `market-official-images.js` — bridge v61 entre o DOM real dos cartões e a resolução/persistência da fotografia oficial por `pid`.
- `market-barcode.js` — leitura GTIN e identificação assistida.
- `invoice-capture.js` — leitura local de QR fiscal.
- `ui-icons.js` — subset Lucide local.
- `app-update.js` — versão, notas de release e atualização do Service Worker.

## Modelo financeiro e segurança

O schema financeiro permanece `STATE_VERSION = 5`. Valores monetários são inteiros em cêntimos. O Mercado mantém `estimatedCents` separado de `actualCents`; quantidade permanece separada do preço unitário.

O cofre usa IndexedDB e envelope cifrado. O modelo continua baseado em PBKDF2-SHA-256 + AES-GCM. A v61 não altera autenticação, derivação de chave, backups ou sincronização.

Metadados visuais opcionais do item:

- `productCode`;
- `imageUrl`;
- `imageSource`;
- `imageMatchedAt`.

Apenas URL/metadados são persistidos. Binários não entram no cofre.

## Mercado — separação de responsabilidades

1. **Catálogo, preço e página do produto:** `market-experience.js` + `cesta.pt/mcp`.
2. **Código de barras:** `market-barcode.js`.
3. **Fotografia oficial por SKU:** `market-official-images.js`.
4. **Fallback de imagem e visualizador:** `market-image-audit.js`.
5. **Persistência financeira:** fluxo existente de `market-experience.js`, apenas após ação explícita do utilizador.

Uma fotografia não é prova de preço. Um preço pesquisado não é o preço efetivamente pago. Um GTIN/PID identifica um artigo, mas só é usado como prova visual quando a origem da imagem também é validada.

## Porque a v60 não funcionava no browser real

O problema confirmado era de fronteira entre módulos, não apenas de disponibilidade da fotografia.

`market-experience.js` guarda `resultById` e funções de pesquisa dentro de um IIFE. A camada v60 tentou alterar funções lexicais a partir de outro IIFE e também procurava seletores que não correspondiam ao HTML real. Assim, o probe isolado conseguia localizar a fotografia, mas o cartão real podia permanecer sem imagem.

Contratos reais usados pela v61:

- cartão: `[data-market-product-card]`;
- ação de adicionar: `[data-market-add-product]`;
- ação da loja: `.market-result-source`;
- identificador do cartão: `cesta-(continente|pingo-doce)-<pid>`.

A v61 não depende de acesso a `resultById` nem de monkey-patching de funções privadas entre IIFEs.

## Fluxo de fotografia oficial v61

Para cada cartão visível/próximo do viewport:

1. extrair cadeia, nome, embalagem e `pid` do DOM real;
2. consultar/reutilizar o catálogo `cesta.pt` e obter a URL pública do mesmo `pid`;
3. validar a página oficial:
   - Continente: `continente.pt` / `www.continente.pt`, caminho `/produto/`, `pid` no final da URL;
   - Pingo Doce: `pingodoce.pt` / `www.pingodoce.pt`, caminho `/home/produtos/`, `pid` no final da URL;
4. pedir a página ao reader restrito `r.jina.ai` através de GET CORS simples;
5. extrair URLs candidatas;
6. aceitar apenas:
   - Continente: `www.continente.pt`, `Sites-col-master-catalog`, ficheiro/caminho com `pid` exato;
   - Pingo Doce: `static.pingodoce.pt`, `Sites-pingo-doce-master/images/(large|medium|small)`, ficheiro iniciado pelo `pid`;
7. testar o carregamento real da imagem com `Image` antes de substituir o placeholder;
8. criar/atualizar o botão `.market-product-photo`, mantendo o visualizador acessível;
9. depois da ação real `+`, persistir a mesma imagem/origem no item criado.

Máximo de três resoluções simultâneas. `IntersectionObserver` evita resolver de imediato todo o catálogo.

## Sinalização sem conflito

A proveniência é dividida em três níveis:

- **Consultado agora**: estado temporal da consulta/preço;
- **Ver no Pingo Doce / Ver no Continente**: ação para abrir a página oficial do produto;
- **Pingo Doce · imagem oficial / Continente · imagem oficial**: proveniência da fotografia validada, associada à imagem/visualizador.

Não se usa o texto “Produto oficial” como rótulo genérico junto de um placeholder, porque isso mistura origem da página com origem visual.

## Rede, CORS e privacidade

`cesta.pt` continua a ser a fonte de catálogo/preço já integrada. As páginas dos retalhistas não são lidas diretamente pelo browser porque não oferecem um contrato CORS estável para a PWA.

O reader recebe apenas a URL pública previamente validada. A v61 usa GET com `Accept: application/json` e não envia cabeçalhos personalizados de retenção/resumo de imagem. Esta escolha reduz dependências de preflight no Safari; não se afirma que o preflight era a única causa da falha v60.

Pedidos externos usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`. Não há Authorization/API key. PIN, chave do cofre, faturas, saldos e token GitHub não são enviados para resolver imagens.

## CSP e distribuição v61

`scripts/prepare-pages.cjs` compõe `v61` e inclui `market-official-images.js` na allowlist pública.

`connect-src` público inclui apenas os hosts necessários, incluindo `cesta.pt`, `r.jina.ai` e APIs Open Facts já autorizadas.

`img-src` público inclui os hosts oficiais de imagem Continente/Pingo Doce e hosts Open Facts autorizados.

Service Worker:

`conta-de-casa-public-v61-official-images-bridge`

O novo asset `./market-official-images.js` entra no cache offline do shell. Imagens remotas não são copiadas para o cofre.

## Testes e manutenção

`tests/market-official-images.test.cjs` valida especificamente:

- seletores reais do Mercado;
- parsing de `pid`;
- URL oficial de página;
- URL oficial de imagem;
- exemplos Continente `8167440` e Pingo Doce `739490`;
- request simples ao reader;
- persistência da origem após o fluxo real de adicionar;
- inclusão em Pages/Service Worker.

CI funcional v61: `34002655320` — `success`.

Regras de manutenção:

- não depender de variáveis privadas de outro IIFE;
- não aceitar imagem sem correspondência exata de `pid` quando é classificada como oficial;
- manter preço, página da loja e proveniência da imagem semanticamente separados;
- novas origens exigem CSP explícita, testes e documentação;
- qualquer alteração de Safari/câmara/dialog/safe area exige validação física.
