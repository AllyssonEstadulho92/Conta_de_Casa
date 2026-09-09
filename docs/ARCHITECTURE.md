# Arquitetura — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA

## 1. Princípios

A aplicação é uma PWA estática/local-first. Apresentação, Mercado e catálogos são camadas separadas do núcleo financeiro.

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
- `market-catalog-image-resolver.js`: resolução direta de fotografia oficial (`75-catalog2`);
- `market-visual-catalog.js`: catálogo visual progressivo (`75-catalog1` base);
- `pingo-doce-photo-library.js`: inventário Pingo Doce (`75-pd-photo1`);
- `market-photo-loader.js`: orquestração visual limitada (`75-photo-loader3` em validação).

## 3. Biblioteca geral `75-image-library1`

Base: `conta-de-casa-market-image-library`.

Chave canónica: `marketId|pid`.

Guarda apenas metadados e URL oficial validado. Não guarda binários, preços, faturas, dados pessoais ou credenciais. TTL positivo: 45 dias.

## 4. Catálogo visual `75-catalog1`

Base: `conta-de-casa-market-visual-catalog`.

Stores:

- `products`: `marketId|pid`, nome, embalagem, categorias, página oficial, timestamps;
- `meta`: cursor e orçamento de descoberta.

Não persiste preço. **Ver preço atual** reutiliza a pesquisa viva existente. `CDCMarketVisualCatalog.listCategory()` é o contrato público usado pelo loader para obter o registo exato do SKU.

## 5. Resolvedor direto `75-catalog2`

Fluxo:

1. `safeProductUrl()` confirma HTTPS, retalhista, path oficial e PID final;
2. o reader lê a página oficial exata;
3. são extraídos URLs candidatos;
4. `safeOfficialImageUrl()` exige host/path oficial e PID correspondente;
5. é escolhida a variante de maior prioridade;
6. a referência validada é devolvida à biblioteca.

O segundo preflight visual bloqueante foi removido porque duplicava a validação de transporte e podia produzir falso negativo no Safari. A disponibilidade real é comprovada pelo `<img>` do cartão; se falhar, a referência é removida da biblioteca.

Timeout do reader: 8 s. Concorrência direta: 2.

## 6. Biblioteca Pingo Doce `75-pd-photo1`

Base: `conta-de-casa-pingo-doce-photo-library`.

Stores:

- `products` com chave `pingo-doce|pid`;
- `meta` para cursor, orçamento diário e timestamps.

Estados: `pending | ready | missing`.

A descoberta tem 15 grupos e mais de 200 termos. Limites: 24 pesquisas/sessão, 72/dia, 30 tentativas de imagem/sessão, 120/dia, com suspensão offline/oculta/Save-Data.

## 7. Incidente Safari após `75-photo-loader2`

A captura física do iPhone mostrou a mensagem nativa do Safari **“Um problema ocorreu repetidamente”** ao abrir `#market`.

Sem crash log de WebKit não é possível provar a exceção interna. A inspeção, porém, encontrou um padrão de risco em `75-photo-loader2`:

- `MutationObserver` global em `document.body` com `subtree:true`;
- scans agendados sem coalescência por mutações de DOM;
- hidratação, resolução e trabalho de entrada potencialmente sobrepostos;
- polling de 500 ms/24 ciclos;
- sincronização Pingo Doce iniciada em paralelo ao aquecimento de cartões.

## 8. Carregador limitado `75-photo-loader3`

`market-photo-loader.js` permanece uma camada de apresentação/orquestração sem `fetch()` próprio.

### Limites de trabalho

- observer apenas em `#page-market`;
- mutações do próprio loader em `.market-visual-product-media` e no estado Pingo Doce são ignoradas;
- `scheduleScan()` é coalescido com `scanQueued`, `scanRunning` e `scanPending`;
- `refreshPromise` impede hidratações globais concorrentes;
- `warmPromise` impede aquecimentos concorrentes;
- até 8 cartões são hidratados por passagem;
- até 4 cartões recebem resolução prioritária;
- os 4 são processados sequencialmente para reduzir picos de CPU/rede;
- polling: 1 s, máximo 12 ciclos;
- retry do mesmo SKU: 30 s;
- após 12 s, o estado passa para **Fotografia a validar…**.

### Entrada no Mercado

1. o loader só trabalha se `#page-market.page.active` estiver ativo;
2. repõe uma única vez o orçamento antigo através de `photoRuntimeRevision=75-photo-loader3`;
3. aquece apenas os cartões prioritários;
4. a sincronização Pingo Doce deixa de arrancar em paralelo: é adiada 5 s e usa 1 seed;
5. `warmPending()` deixa de ser chamado pelo loader na entrada.

### Erro de imagem

Se `<img>` falhar, `CDCMarketImageLibrary.forget()` remove a referência e o cartão mantém estado utilizável/fallback. Nenhum produto é apagado.

## 9. Separação entre origem e transporte

- **validade da referência**: página oficial + domínio/path autorizado + PID exato;
- **disponibilidade de transporte**: carregamento real pelo browser.

Estas duas responsabilidades permanecem separadas para não confundir falha transitória de rede com identidade incorreta do produto.

## 10. Ordem de assets

1. `market-image-library.js`;
2. política/auditoria;
3. `market-official-images.js`;
4. `market-catalog-image-resolver.js?v=75-catalog2`;
5. `market-visual-catalog.js?v=75-catalog2`;
6. `pingo-doce-photo-library.js?v=75-pd-photo1`;
7. `market-photo-loader.js?v=75-photo-loader3`;
8. runtime/apresentação restantes.

## 11. Segurança

As camadas de imagem não podem aceder a:

- `appState`;
- `saveState()`;
- `commit()`;
- `estimatedCents`;
- `actualCents`;
- `amountCents`;
- PIN/passwords/tokens.

Pingo Doce: página HTTPS oficial com path `/home/produtos/` e PID final correspondente; imagem apenas em host/path oficial permitido com PID coerente. Continente mantém as regras oficiais existentes.

## 12. Responsividade/acessibilidade

- mobile principal <=820 px;
- refinamentos 540/430/350 px;
- safe areas iOS preservadas;
- loader não altera geometria estrutural do cartão;
- `prefers-reduced-motion` continua respeitado;
- foco e navegação não são bloqueados.

## 13. Versionamento e cache

- base visual: `75-catalog1`;
- resolvedor/distribuição catálogo: `75-catalog2`;
- Pingo Doce: `75-pd-photo1`;
- loader em validação: `75-photo-loader3`;
- cache esperado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader3`.

## 14. QA obrigatório

CI deve cobrir:

- sintaxe;
- finanças/auditoria;
- QR/faturas;
- Mercado/fontes;
- biblioteca geral;
- catálogo visual;
- biblioteca Pingo Doce;
- `tests/market-photo-loader.test.cjs` com garantias de coalescência/limites;
- segurança, responsividade, navegação, acessibilidade e sync.

A validação física no iPhone continua obrigatória. Para este incidente, o primeiro critério é **#market abrir e permanecer estável**; o segundo é a evolução das fotografias oficiais.
