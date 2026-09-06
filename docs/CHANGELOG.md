# Changelog Técnico — Conta de Casa

## 2026-09-06 — Release candidata v63: consistência visual e atualização controlada (`63-ui2`)

### Estado

- branch: `ui/market-left-alignment`;
- build candidato: `v63`;
- revisão visual final: `63-ui2`;
- cache candidato: `conta-de-casa-public-v63-ui2`;
- CI completa da branch: sucesso antes das alterações exclusivamente documentais finais;
- integração em `main`: pendente;
- Deploy GitHub Pages: pendente.

### Problemas confirmados

A validação física em iPhone/Safari revelou duas regressões visuais acumuladas entre camadas CSS:

- o item ativo da navegação inferior apresentava **duas barras azuis**;
- a faixa de cor no topo dos cartões-resumo do Mercado aparecia **segmentada/pontilhada** em vez de contínua.

A auditoria do código confirmou as causas:

- `design-system.css` já usava `.mobile-nav .nav-btn::before` como indicador ativo, enquanto `ui-icons.css` e `market-brand.css` acrescentavam `::after`;
- `ui-icons.css` utilizava `#page-market .market-summary-item::before` como ícone semântico e `market-brand.css` reutilizava o mesmo pseudo-elemento como faixa superior.

### Correções visuais

- criado `ui-consistency.css` como camada final de apresentação da v63;
- Lucide permanece o único sistema vetorial oficial;
- `.ui-icon-svg` e `.svg-icon` recebem uma métrica final comum: `stroke-width: 2`, extremidades/junções arredondadas, `vector-effect: non-scaling-stroke` e tamanhos contextuais previsíveis;
- a navegação inferior passa a manter apenas o `::before` como indicador ativo;
- qualquer `::after` redundante do item ativo é explicitamente anulado;
- o indicador ativo usa 42 px de largura, 3 px de altura e reduz para 38 px em ecrãs até 430 px;
- a faixa dos cartões-resumo passa a ser um `box-shadow: inset` sólido e contínuo no próprio cartão;
- `market-summary-item::before` fica reservado ao ícone semântico;
- cores `primary`, `success`, `warning`, `normal` e `danger` continuam representadas sem sobrepor responsabilidades de pseudo-elementos;
- `Mercearia / Despensa` passa a usar um ícone local mais adequado do que o carrinho;
- a Lista de compras mantém agrupamento por categoria e alinhamento consistente à esquerda.

### Centro de Atualização e versionamento

- build formal passa de `v62` para `v63`;
- criado `release-manifest.json` como histórico público versionado da aplicação;
- `scripts/prepare-pages.cjs` valida que `latestVersion` do manifesto corresponde ao build;
- o Centro de Atualização consulta o manifesto same-origin com `cache: no-store`;
- uma nova versão é apresentada ao utilizador antes da instalação;
- o Service Worker deixa de executar `skipWaiting()` automaticamente durante a instalação de uma atualização;
- a ativação passa a depender de ação explícita em **Atualizar agora**, usando `APPLY_UPDATE`;
- `SKIP_WAITING` permanece para compatibilidade com clientes v62;
- após ativação explícita, o worker reclama clientes, elimina caches anteriores e pode reiniciar/navegar a janela controlada;
- `v` e `ts` são os únicos parâmetros de cache-busting aceites, sempre como parâmetro único e sempre sujeitos à allowlist `PUBLIC_ASSET_SET`.

### Segurança e dados

- sem alteração ao `STATE_VERSION = 5`;
- sem alteração a PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM ou IndexedDB;
- sem alteração a `estimatedCents`, `actualCents`, quantidade ou estado de compra;
- sem credenciais, cookies, telemetria ou endpoints externos novos;
- `release-manifest.json` e o Centro de Atualização são same-origin;
- a atualização substitui assets da aplicação e não apaga nem migra o cofre financeiro.

### Testes

- criado `tests/ui-consistency.test.cjs`;
- CI passa a validar explicitamente a supressão da segunda barra ativa;
- CI valida que o cartão-resumo usa acento contínuo independente do pseudo-elemento de ícone;
- testes de ícones, Mercado, imagens históricas, atualização, segurança e responsividade foram atualizados para a composição `v63` / `63-ui2`;
- a execução completa validou finanças, isolamento do cofre, datas, faturas, Mercado, categorias, scanner, iconografia, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização e manifest.

A validação visual física final em iPhone/Safari permanece necessária depois da publicação em `main`/GitHub Pages.

## 2026-09-06 — Lista de compras agrupada por categoria (`62-ui3`)

### Publicação

- PR #40 — `UI: organizar Lista de compras por categoria` — integrado em `main` com CI verde;
- merge em `main`: `98662aa366ea65316ebd47cf56df8f2a3eeac974`;
- CI de `main` após o merge: sucesso;
- Deploy GitHub Pages da mesma revisão: sucesso;
- build formal mantido em v62;
- novos assets de agrupamento: `62-ui3`;
- cache público: `conta-de-casa-public-v62-market-ui2-category-ui3`.

A validação automática final incluiu o novo teste de agrupamento e todas as regressões já existentes de finanças, segurança, responsividade, viewport móvel, navegação, acessibilidade, Mercado e sincronização. A validação física final em iPhone/Safari permanece pendente.

### Motivação

A validação física da página **Lista de compras** mostrou que a sequência de cartões individuais era funcional, mas visualmente repetitiva e difícil de consultar quando existiam vários produtos de categorias diferentes.

### Alterações

- criado `market-category-groups.js` para agrupar os itens pela categoria já existente no estado;
- criado `market-category-groups.css` para apresentar grupos compactos e recolhíveis em mobile;
- cada grupo mostra a categoria e a respetiva contagem de itens;
- a categoria deixa de ser repetida dentro de cada linha mobile;
- categorias conhecidas seguem uma ordem previsível alinhada com a taxonomia existente do Mercado; categorias adicionais ficam depois por ordem alfabética;
- dentro de cada grupo é preservada a ordenação já calculada por `marketFilteredItems()`;
- itens pendentes deixam de repetir visualmente os blocos `Estimado`/`Previsto` quando representam o mesmo valor;
- itens comprados continuam a expor preço real e diferença;
- os mesmos nós e atributos `data-market-toggle`, `data-edit-market`, `data-delete-market` e `data-market-actual` são preservados, mantendo os handlers existentes;
- a tabela desktop recebe separadores de categoria sem perder colunas ou ações;
- adicionada revisão pública isolada `62-ui3` para os novos assets;
- Service Worker atualizado para `conta-de-casa-public-v62-market-ui2-category-ui3`;
- os breakpoints de 430 px e 359 px permanecem em media queries independentes para maior previsibilidade em Safari;
- os botões de ação compactos mantêm alvo tátil mínimo de 44 px.

### Testes

- criado `tests/market-category-groups.test.cjs`;
- CI e Deploy Pages validam sintaxe e composição do novo módulo;
- o teste confirma que a camada não escreve em estado financeiro e que os assets são publicados depois do branding existente;
- branding e política de conflitos permanecem em `62-ui2`, evitando uma alteração desnecessária dos assets anteriores.

### Segurança e dados

- sem alterações ao schema `STATE_VERSION = 5`;
- sem alterações a `estimatedCents`, `actualCents`, quantidade, estado de compra ou sincronização;
- sem novos endpoints, credenciais, armazenamento local ou telemetria;
- nenhuma categoria é criada ou migrada pela camada de apresentação.

## 2026-09-06 — Hotfix iPhone/Safari: cartões do Mercado e conflitos técnicos

### Publicação

- PR #38 — `Fix: cartões do Mercado no iPhone e conflitos técnicos de sincronização` — integrado em `main` com CI verde;
- merge em `main`: `f1557594aee99b69d10aca852a711b453502a698`;
- CI de `main` após o merge: sucesso;
- Deploy GitHub Pages da mesma revisão: sucesso;
- build formal mantido em v62;
- revisão pública de interface: `62-ui2`;
- cache público: `conta-de-casa-public-v62-market-ui2`.

A validação automática final cobriu fontes do Mercado, sintaxe, finanças, isolamento do cofre, datas, faturas, browser de produtos, código de barras, contabilização, ícones, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização, política de conflitos técnicos e manifest.

A validação física final no iPhone/Safari continua necessária para confirmar o resultado visual no hardware real e a limpeza de um conflito técnico já gravado.

### Problemas confirmados em validação física

- o browser de produtos podia mostrar uma grande área vazia à esquerda e comprimir todo o conteúdo textual à direita;
- o estado de sincronização podia apresentar `Conflito` com `0 diferenças` quando apenas metadados auxiliares do Mercado divergiam entre dispositivos;
- a cópia do aviso do browser continuava excessivamente longa e centrada no pipeline antigo de fotografia.

### Correções

- `market-brand.css` passa a fixar explicitamente o conteúdo textual na primeira coluna e o botão `+` na coluna de ação;
- nome, embalagem/loja e estado/origem ficam à esquerda e o preço passa a uma coluna interna própria quando existe largura;
- abaixo de 360 px o preço reflui para baixo do conteúdo para impedir compressão letra a letra;
- estado, ligação da loja e preço deixam de permitir quebras internas destrutivas;
- `market-branding.js` usa uma mensagem curta: “Mostramos produtos que correspondem pelo nome, embalagem, loja e preço. A fotografia é opcional.”;
- criado `sync-conflict-policy.js` para classificar `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` como metadados técnicos na comparação de equivalência do Mercado;
- diferenças financeiras/operacionais reais continuam a exigir revisão manual;
- cache público renovado para `conta-de-casa-public-v62-market-ui2`;
- `market-brand.css`, `market-branding.js` e `sync-conflict-policy.js` são publicados com revisão `62-ui2` para evitar assets antigos no Safari.

### Testes

- reforçado `tests/market-experience.test.cjs` com invariantes de Grid explícito e nova cópia;
- criado `tests/sync-conflict-policy.test.cjs` para impedir regressão de `0 diferenças`;
- atualizado `tests/app-update.test.cjs` para validar a composição pública `62-ui2`;
- CI e Deploy Pages passam a validar sintaxe e comportamento da nova política.

### Segurança e dados

- nenhum cálculo financeiro foi alterado;
- nenhum preço é escolhido automaticamente;
- a política técnica não inclui `estimatedCents`, `actualCents`, quantidade, estado de compra ou datas financeiras;
- PBKDF2, AES-GCM, IndexedDB, PIN e credenciais permanecem inalterados;
- metadados antigos não são apagados.

## 2026-09-06 — Publicação validada da identidade visual do Mercado sem fotografias

A revisão visual foi integrada em `main` através do PR #35 e publicada com sucesso no GitHub Pages.

### Publicação

- PR #35 — `UI: identidade visual do Mercado sem fotografias` — integrado com CI verde;
- merge funcional: `2411a2e5ca30597d7fc5c04a50833fe63aff1042`;
- CI de `main` após o merge: sucesso;
- Deploy Pages: sucesso;
- PR #36 — reforço da validação de sintaxe da camada `market-branding.js` — integrado com CI verde;
- merge de qualidade: `03cf7f7a07cb28554ddf3ed37dd08c00257acf2e`;
- CI final de `main`: sucesso;
- Deploy Pages final: sucesso.

A validação automática incluiu fontes do Mercado, sintaxe, finanças, isolamento do cofre, datas, faturas, Mercado, código de barras, contabilização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização e manifest.

A validação física em iPhone/Safari permanece como próximo passo e não é substituída pela CI.

## 2026-09-06 — Identidade visual do Mercado sem fotografias

### Decisão de produto

A interface de Compras/Mercado deixa de depender de fotografias de produto. Para identificação e decisão de compra, passam a ser prioritários o nome, embalagem/quantidade, loja, categoria, estado e preço.

A alteração é visual e não destrutiva: metadados antigos de imagem continuam tolerados pelo schema, mas deixam de ocupar espaço na interface.

### Alterações

- criado `market-brand.css` como camada final de identidade visual do Mercado;
- criado `market-branding.js` para alinhar o aviso de origem com a experiência sem fotografias;
- fotografias, botões de fotografia e placeholders ficam ocultos no contexto do Mercado;
- cards de lista passam a usar a hierarquia `checkbox + conteúdo + estado`;
- resultados do browser passam a usar `conteúdo + ação +`, sem coluna reservada a imagem;
- reforçada a identidade azul/ink com verde para contabilizado, âmbar para pendentes e violeta para diferença neutra;
- refinados raios, bordas, sombras, tipografia, foco e navegação inferior móvel;
- `scripts/prepare-pages.cjs` e `sw.js` passam a distribuir/cachear os novos assets;
- `tests/market-experience.test.cjs` passa a verificar os novos assets, o reflow sem fotografia e a separação entre branding e estado financeiro.

### Compatibilidade

Os módulos de imagem v59–v62 permanecem temporariamente no repositório e no bundle público para evitar misturar a mudança visual com uma refatoração arquitetural ampla. A camada visual tem precedência e não apresenta fotografias.

A remoção definitiva do pipeline antigo fica para uma alteração posterior, após validação física. O scanner de código de barras permanece porque a câmara serve identificação GTIN/EAN/UPC, não fotografia do produto.

### Segurança e dados

- nenhuma alteração a PBKDF2, AES-GCM, IndexedDB ou sincronização;
- nenhuma alteração a `estimatedCents`, `actualCents`, quantidade ou totais;
- `market-branding.js` não lê `appState` e não faz pedidos de rede;
- nenhuma credencial, endpoint ou permissão adicional;
- nenhum dado antigo é apagado por esta revisão visual.

## 2026-09-06 — Fotografias official-only nos cartões vivos v62

A v62 corrigiu a concorrência entre pipelines de imagem e determinou que cartões vivos Pingo Doce/Continente só podiam apresentar fotografia oficial validada para o mesmo `pid`. Essa regra permanece como proteção histórica do pipeline de imagem, mas a apresentação foi posteriormente substituída pela experiência sem fotografias descrita acima.

Validação da v62 concluída antes desta revisão: PR #34 integrado em `main`, CI de `main` e Deploy Pages com sucesso.

## 2026-09-06 — Bridge de imagens oficiais v61

A v61 criou `market-official-images.js` baseado nos seletores reais, `pid` exato, reader CORS simples e validação do CDN oficial. O bridge corrigiu a integração entre o catálogo e os cartões reais.

## 2026-09-06 — Imagens oficiais e catálogo alargado v60

A v60 introduziu prioridade por SKU oficial, validação de URL/imagem, reader restrito e catálogo alargado. Os probes externos passaram, mas a validação física revelou uma integração incompleta, depois tratada na v61/v62.

## 2026-09-05 — Auditoria e ampliação v59

- auditoria individual de imagens por produto;
- Open Facts como fontes auxiliares/fallback;
- miniaturas tácteis/clicáveis com visualizador ampliado;
- persistência apenas de URL/metadados;
- placeholder preservado quando a correspondência não era segura.

## 2026-09-05 — Centro de Atualização v58

- criado `app-update.js/.css`;
- adicionada **Definições → Atualização de Software**;
- verificação manual via Service Worker same-origin;
- canal beta mantido desativado sem pipeline própria.

## 2026-09-05 — Fotografias reais v57

- introduzidos `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt`;
- primeira pesquisa de fotografia via Open Food Facts;
- imagem mantida separada do preço.

## 2026-09-05 — Cofre, UI e Mercado anteriores

- cofre visual moderno com PIN/palavra-passe e criptografia preservados;
- Lucide adotado como sistema vetorial local;
- hierarquia mobile de Compras refinada;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço através de `cesta.pt`;
- `estimatedCents` e `actualCents` permanecem separados.
