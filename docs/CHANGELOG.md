# Changelog Técnico — Conta de Casa

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
- resultados do browser passam a usar `conteúdo + ação +`, sem coluna reservada à imagem;
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
