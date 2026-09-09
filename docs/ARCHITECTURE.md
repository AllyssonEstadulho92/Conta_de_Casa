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
- `pingo-doce-photo-library.js`: expansão dedicada do inventário Pingo Doce (`75-pd-photo1`);
- `market-photo-loader.js`: prioridade aos cartões visíveis e feedback de carregamento (`75-photo-loader2`).

## 3. Biblioteca geral `75-image-library1`

Base: `conta-de-casa-market-image-library`.

Chave canónica: `marketId|pid`.

A store guarda:

- mercado;
- PID;
- nome/embalagem apenas para diagnóstico;
- URL oficial validado da fotografia;
- URL oficial do produto quando disponível;
- timestamps/expiração.

Não guarda binários, preços, faturas, dados pessoais ou credenciais. TTL positivo: 45 dias.

## 4. Catálogo visual `75-catalog1`

Base: `conta-de-casa-market-visual-catalog`.

Stores:

- `products`: `marketId|pid`, nome, embalagem, categorias, página oficial, timestamps;
- `meta`: cursor e orçamento de descoberta.

O catálogo usa `cesta.pt` para descobrir produtos reais de Continente/Pingo Doce e não persiste preço. O clique em **Ver preço atual** transfere o nome para `#marketCatalogSearch` e aciona a pesquisa viva existente.

O objeto público `CDCMarketVisualCatalog` expõe `listCategory()`. `75-photo-loader2` reutiliza este contrato para localizar os registos exatos correspondentes aos cartões visíveis, sem aceder diretamente à IndexedDB do catálogo.

## 5. Resolvedor direto `75-catalog2`

### Contrato de identidade

Entrada mínima:

- `marketId` = `continente|pingo-doce`;
- `pid` numérico;
- `sourceUrl` da página oficial exata;
- nome/embalagem opcionais para UI/diagnóstico.

### Fluxo

1. `safeProductUrl()` confirma HTTPS, retalhista, path oficial e PID final;
2. `r.jina.ai` lê a página oficial exata sem credenciais;
3. são extraídos URLs candidatos;
4. `safeOfficialImageUrl()` exige host/path oficial e PID correspondente;
5. é escolhida a variante de maior prioridade (`large` no Pingo Doce, `frente` no Continente quando disponível);
6. a referência validada é devolvida imediatamente à biblioteca.

### Alteração face a `75-catalog1`

Foi removido o segundo `new Image()` bloqueante antes de devolver a referência. Essa etapa duplicava a validação de transporte e, no Safari, podia ficar até 10 s à espera ou produzir falso negativo apesar de a URL já estar validada por página oficial + host/path/PID.

A segurança de identidade não é relaxada: a referência só entra na biblioteca depois de passar os mesmos validadores estritos. O carregamento real é testado no cartão; uma imagem que falhe é removida da biblioteca por `75-photo-loader2`.

Timeout do reader: 8 s. Concorrência direta: 2.

## 6. Biblioteca Pingo Doce `75-pd-photo1`

Base: `conta-de-casa-pingo-doce-photo-library`.

Stores:

- `products` com chave `pingo-doce|pid`;
- `meta` para cursor, orçamento diário e timestamps.

Campos principais:

- `marketId = pingo-doce`;
- `pid`;
- `name`;
- `pack`;
- `categoryId`;
- `sourceUrl` oficial;
- `imageState = pending | ready | missing`;
- `firstSeenAt`, `lastSeenAt`, `imageCheckedAt`.

A descoberta tem 15 grupos e mais de 200 termos. Limites históricos mantidos: 24 pesquisas/sessão, 72/dia, 30 tentativas de imagem/sessão, 120/dia e suspensão offline/oculta/Save-Data.

## 7. Carregador prioritário `75-photo-loader2`

`market-photo-loader.js` continua uma camada de apresentação/orquestração sem `fetch()` próprio.

### Entrada no Mercado

O loader só trabalha quando `#page-market.page.active` está realmente ativo. Ao primeiro acesso:

1. consulta a biblioteca persistente para os cartões já renderizados;
2. garante que a base Pingo Doce já foi aberta;
3. liberta **uma única vez nesta revisão** o contador diário `imagesToday` do runtime antigo, gravando `photoRuntimeRevision=75-photo-loader2`;
4. inicia atualização limitada Pingo Doce;
5. em paralelo, prioriza os cartões visíveis.

A recuperação de `imagesToday` existe apenas para impedir que falhas acumuladas por `75-photo-loader1` mantenham o novo runtime bloqueado até à mudança do dia. Não altera contadores financeiros ou dados de produtos.

### Prioridade visível

- até 6 cartões visíveis por ciclo;
- identifica cada cartão por `marketId|pid`;
- usa `CDCMarketVisualCatalog.listCategory()` para obter `sourceUrl`/metadados do SKU;
- verifica primeiro `CDCMarketImageLibrary.get()`;
- se não houver cache, chama `CDCOfficialMarketImages.resolve()` imediatamente para o SKU visível;
- resultado válido é persistido e o cartão é hidratado com `loading='eager'`;
- evento `cdc:market-photo-ready` acelera atualização da UI.

### Estados visuais

- `A carregar fotografia…` aparece imediatamente;
- poll: 500 ms, máximo 24 ciclos;
- após 12 s sem resolução, o spinner para e o texto passa a **Fotografia a validar…**;
- retry do mesmo SKU: cooldown de 30 s;
- erro real de `<img>` chama `CDCMarketImageLibrary.forget()` e mantém o cartão utilizável.

O loader não cria polling infinito e não altera a altura estrutural do cartão.

## 8. Separação entre validação de origem e disponibilidade de transporte

A arquitetura passa a distinguir explicitamente:

- **validade da referência**: comprovada pela página oficial, domínio/path autorizado e PID exato;
- **disponibilidade de transporte**: comprovada quando o browser efetivamente carrega a imagem.

Uma falha transitória de transporte não deve tornar uma referência oficialmente identificada num produto diferente. Também não deve prender a UI indefinidamente: a referência quebrada é expurgada e pode ser reavaliada mais tarde.

## 9. Ordem de assets

Scripts relevantes:

1. `market-image-library.js`;
2. política/auditoria;
3. `market-official-images.js`;
4. `market-catalog-image-resolver.js?v=75-catalog2`;
5. `market-visual-catalog.js?v=75-catalog2` (asset versionado com o bundle do catálogo; contrato interno base permanece compatível);
6. `pingo-doce-photo-library.js?v=75-pd-photo1`;
7. `market-photo-loader.js?v=75-photo-loader2`;
8. runtime/apresentação restantes.

## 10. Segurança

As camadas de imagem não podem aceder a:

- `appState`;
- `saveState()`;
- `commit()`;
- `estimatedCents`;
- `actualCents`;
- `amountCents`;
- PIN/passwords/tokens.

Pingo Doce: página HTTPS `pingodoce.pt|www.pingodoce.pt`, path `/home/produtos/`, PID final correspondente; imagem apenas `static.pingodoce.pt/Sites-pingo-doce-master/.../images/(large|medium|small)/...` com PID correspondente.

Continente: regras oficiais já existentes permanecem inalteradas.

## 11. Responsividade/acessibilidade

- mobile principal <=820 px;
- refinamentos 540/430/350 px;
- safe areas iOS preservadas;
- loader não altera geometria do cartão;
- texto de estado substitui animação prolongada;
- `prefers-reduced-motion` continua a remover animações CSS;
- foco e navegação não são bloqueados.

## 12. Versionamento e cache

- base visual: `75-catalog1`;
- resolvedor/distribuição catálogo: `75-catalog2`;
- Pingo Doce: `75-pd-photo1`;
- loader: `75-photo-loader2`;
- cache esperado: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader2`.

## 13. QA

CI/Pages devem executar:

- `tests/market-image-library.test.cjs`;
- `tests/market-official-images.test.cjs`;
- `tests/market-visual-catalog.test.cjs`;
- `tests/pingo-doce-photo-library.test.cjs`;
- `tests/market-photo-loader.test.cjs`;
- regressões de finanças, segurança, responsividade, navegação, acessibilidade e sync.

A validação em hardware real é obrigatória porque o problema atual foi observado especificamente no Safari/iPhone e envolve transporte de imagens/cache/runtime.