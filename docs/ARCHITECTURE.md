# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA

## 1. Princípios

A aplicação é uma PWA estática/local-first. Apresentação, Mercado e catálogos são camadas separadas do núcleo financeiro. Alterações visuais ou de imagens não podem reescrever persistência, cálculos, cofre ou sincronização.

Invariantes:

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- sincronização opcional apenas do envelope cifrado;
- sem passwords, tokens ou chaves embutidos.

## 2. Camadas principais

### Núcleo

- `core.js`: estado, normalização, persistência, sanitização e cifragem;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada.

### Interface v75

- `design-system.css`;
- `v74-experience.css/js`;
- `v75-architecture.css/js`;
- `v75-header-refinement.css`;
- `v75-stability.css/js`;
- `v75-layout-polish.css`;
- `v75-market-featured.css/js`;
- `v75-drawer-theme.css`;
- `mobile-menu-toggle.css/js`.

### Mercado e imagens

- `market-experience.js`: pesquisa viva de produtos/preços;
- `market-category-groups.js`: categorias/lista;
- `market-barcode.js`: código de barras;
- `market-image-audit.js`: estados/validação de imagens;
- `market-retailer-image-policy.js`: política contra correspondência aproximada;
- `market-official-images.js`: bridge e validadores oficiais;
- `market-image-library.js`: cache persistente por `marketId|pid`;
- `market-catalog-image-resolver.js`: leitura da página oficial exata e resolução direta da imagem (`75-catalog2`);
- `market-visual-catalog.js`: catálogo visual progressivo (`75-catalog1` base);
- `pingo-doce-photo-library.js`: inventário Pingo Doce (`75-pd-photo1`);
- `market-photo-loader.js`: orquestração visual limitada ao viewport (`75-photo-loader3`).

## 3. Biblioteca geral `75-image-library1`

Base: `conta-de-casa-market-image-library`.

Chave canónica: `marketId|pid`. Guarda apenas mercado, PID, nome/embalagem para diagnóstico, URL oficial validado, URL oficial do produto quando disponível e timestamps. Não guarda binários, preços, faturas, dados pessoais ou credenciais. TTL positivo: 45 dias.

## 4. Catálogo visual

Base: `conta-de-casa-market-visual-catalog`.

Stores:

- `products`: `marketId|pid`, nome, embalagem, categorias, página oficial e timestamps;
- `meta`: cursor e orçamento de descoberta.

O catálogo usa `cesta.pt` para descobrir produtos reais de Continente/Pingo Doce e não persiste preço. **Ver preço atual** reutiliza a pesquisa viva existente.

## 5. Resolvedor direto `75-catalog2`

Fluxo:

1. `safeProductUrl()` confirma HTTPS, retalhista, path oficial e PID final;
2. `r.jina.ai` lê a página oficial exata sem credenciais;
3. são extraídos URLs candidatos;
4. `safeOfficialImageUrl()` exige host/path oficial e PID correspondente;
5. é escolhida a variante de maior prioridade;
6. a referência validada é devolvida à biblioteca.

A validade da referência e a disponibilidade de transporte são conceitos separados. O URL só é aceite depois de validação de origem/PID; o carregamento real é comprovado pelo `<img>` no browser.

## 6. Biblioteca Pingo Doce `75-pd-photo1`

Base: `conta-de-casa-pingo-doce-photo-library`.

Stores:

- `products` com chave `pingo-doce|pid`;
- `meta` para cursor, orçamento diário e timestamps.

Mantém inventário técnico `pending|ready|missing`, mais de 200 termos em 15 famílias, limites por sessão/dia e suspensão offline/oculta/Save-Data. Não guarda preços, quantidades, faturas, cofre ou credenciais.

## 7. Carregador `75-photo-loader3`

`market-photo-loader.js` é uma camada de apresentação/orquestração sem `fetch()` próprio.

### Objetivo

Evitar pressão excessiva no WebKit móvel e continuar a dar prioridade ao conteúdo realmente visível.

### Seleção de cartões

O loader deixa de assumir que os primeiros cartões do DOM são os cartões visíveis. Usa `getBoundingClientRect()` e uma margem de 160 px em torno do viewport.

Limites:

- mobile <= 820 px: no máximo 2 cartões prioritários;
- desktop: no máximo 4 cartões prioritários.

A hidratação e a resolução usam o mesmo conjunto reduzido. Não existe mais a hidratação eager dos primeiros 18 cartões do DOM.

### Orquestração

- polling: 1200 ms;
- máximo: 10 ciclos;
- scans coalescidos por `requestAnimationFrame`;
- `MutationObserver` limitado a `#page-market` e alterações relevantes do catálogo;
- entrada no Mercado já não dispara `warmPending()` + `syncNow()` em paralelo;
- a biblioteca Pingo Doce conserva o seu scheduler próprio;
- resolução visível é sequencial dentro do conjunto prioritário.

### Falhas de imagem

Uma falha real de `<img>`:

1. coloca o SKU em quarentena local por 30 s;
2. remove a referência da biblioteca com `forget()`;
3. evita recriar imediatamente o mesmo URL durante a janela de eliminação da IndexedDB;
4. mostra **Fotografia temporariamente indisponível**;
5. permite nova tentativa após o cooldown.

Isto reduz ciclos rápidos DOM → erro → cache → DOM que podem pressionar o processo WebKit.

### Orçamento Pingo Doce

`photoRuntimeRevision=75-photo-loader3` permite repor uma única vez `imagesToday` e `lastImageAt` da store `meta` para impedir que tentativas antigas bloqueiem a nova revisão. Nenhum dado financeiro é tocado.

## 8. Segurança

As camadas de imagem não podem aceder a `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, passwords ou tokens.

Pingo Doce: página HTTPS oficial, path `/home/produtos/`, PID final correspondente e imagem apenas em `static.pingodoce.pt/Sites-pingo-doce-master/.../images/(large|medium|small)/...` com PID correspondente.

Continente: validadores oficiais existentes permanecem inalterados.

## 9. Responsividade e acessibilidade

- mobile principal <=820 px;
- refinamentos 540/430/350 px;
- safe areas iOS preservadas;
- loader não altera altura estrutural do cartão;
- após 12 s, **Fotografia a validar…** substitui spinner prolongado;
- falha de transporte mostra estado estático temporário;
- `prefers-reduced-motion` continua a remover animações CSS;
- foco e navegação não são bloqueados.

## 10. Versionamento e cache

- catálogo/resolvedor: `75-catalog2`;
- Pingo Doce: `75-pd-photo1`;
- loader: `75-photo-loader3`;
- cache esperado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader3`.

## 11. QA

CI deve cobrir biblioteca de imagens, resolvedor, catálogo visual, Pingo Doce, loader, finanças, segurança, responsividade, navegação, acessibilidade e sync.

A validação em hardware real continua obrigatória porque o crash reportado é do Safari/iPhone e testes Node não medem memória/processo WebKit.
