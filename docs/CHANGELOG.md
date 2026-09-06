# Changelog Técnico — Conta de Casa

## 2026-09-06 — v63 publicada: consistência visual e atualização controlada (`63-ui2`)

### Publicação

- PR #42 — `Release v63: consistência visual e atualização controlada` — integrado em `main`;
- merge em `main`: `1a034c84976c042e0433d016a5628feaa339a7a6`;
- CI de `main`: run #999 (`34065040862`) — **sucesso**;
- Deploy GitHub Pages: run #992 (`34065057875`) — **sucesso**;
- build público: `v63`;
- revisão visual pública: `63-ui2`;
- cache público: `conta-de-casa-public-v63-ui2`.

A validação física final em iPhone/Safari continua pendente e não é substituída pela CI.

### Problemas confirmados e corrigidos

A validação física anterior revelou duas regressões visuais acumuladas entre camadas CSS:

- o item ativo da navegação inferior apresentava **duas barras azuis**;
- a faixa de cor no topo dos cartões-resumo do Mercado aparecia **segmentada/pontilhada** em vez de contínua.

A auditoria confirmou as causas:

- `design-system.css` já usava `.mobile-nav .nav-btn::before` como indicador ativo, enquanto `ui-icons.css` e `market-brand.css` acrescentavam `::after`;
- `ui-icons.css` utilizava `#page-market .market-summary-item::before` como ícone semântico e `market-brand.css` reutilizava o mesmo pseudo-elemento como faixa superior.

### Correções visuais

- criado `ui-consistency.css` como camada final de apresentação;
- Lucide permanece o sistema vetorial oficial;
- `.ui-icon-svg` e `.svg-icon` recebem métrica comum: `stroke-width: 2`, linecap/linejoin arredondados, `vector-effect: non-scaling-stroke` e tamanhos contextuais consistentes;
- a navegação inferior mantém apenas `::before` como indicador ativo;
- `::after` redundante é anulado;
- indicador ativo: 42 px × 3 px, reduzido para 38 px até 430 px;
- a faixa dos cartões-resumo passa a ser um `box-shadow: inset` sólido e contínuo;
- `market-summary-item::before` fica reservado ao ícone semântico;
- `Mercearia / Despensa` passa a usar um ícone local mais adequado do que o carrinho;
- Lista de compras mantém agrupamento por categoria e alinhamento consistente à esquerda.

### Centro de Atualização e versionamento

- build formal sobe de v62 para v63;
- criado `release-manifest.json` como histórico público versionado;
- `scripts/prepare-pages.cjs` falha se `latestVersion` do manifesto não corresponder ao build;
- o Centro de Atualização consulta o manifesto same-origin com `cache: no-store`;
- versões futuras podem ser apresentadas na área **Atualização de Software** antes de instalar;
- o Service Worker deixa de fazer `skipWaiting()` automaticamente numa atualização normal;
- a ativação depende de ação explícita em **Atualizar agora**, via `APPLY_UPDATE`;
- `SKIP_WAITING` permanece como compatibilidade com clientes v62;
- após ativação explícita, o worker elimina caches antigos, reclama clientes e reinicia/navega a janela controlada;
- `v` e `ts` são os únicos parâmetros de cache-busting aceites e continuam sujeitos à allowlist `PUBLIC_ASSET_SET`.

### Segurança e dados

- `STATE_VERSION = 5` preservado;
- PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM e IndexedDB inalterados;
- `estimatedCents`, `actualCents`, quantidade e estado de compra inalterados;
- sem credenciais, cookies, telemetria ou endpoints externos novos;
- atualização atua nos assets da aplicação e não apaga/migra o cofre financeiro.

### Testes

- criado `tests/ui-consistency.test.cjs`;
- CI valida a supressão da segunda barra ativa;
- CI valida acento sólido dos cartões-resumo independente do pseudo-elemento do ícone;
- CI valida ícones, Mercado, imagens históricas, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização e manifest;
- o mesmo conjunto terminou verde no `main` após o merge.

### Nota de transição

A v62 ainda não continha o manifesto/controlador completo da v63. Um dispositivo que continue a executar v62 pode precisar de fechar/reabrir ou atualizar a aplicação uma vez para receber a v63. A partir da v63, as versões seguintes seguem o fluxo explícito do Centro de Atualização.

## 2026-09-06 — Lista de compras agrupada por categoria (`62-ui3`)

- PR #40 integrado em `main` com CI verde;
- merge: `98662aa366ea65316ebd47cf56df8f2a3eeac974`;
- GitHub Pages publicado com sucesso;
- criado `market-category-groups.js/.css`;
- mobile usa grupos por categoria com `<details>/<summary>`;
- desktop mantém tabela com separadores de categoria;
- categoria deixa de ser repetida em cada item mobile;
- handlers de checkbox, editar, eliminar e preço real são preservados;
- nenhuma alteração ao schema financeiro.

## 2026-09-06 — Hotfix iPhone/Safari do Mercado e conflitos técnicos (`62-ui2`)

- PR #38 integrado em `main` com CI e Pages verdes;
- merge: `f1557594aee99b69d10aca852a711b453502a698`;
- corrigida coluna fantasma no browser de produtos em mobile;
- preço reflui abaixo de 360 px em vez de comprimir texto;
- criado `sync-conflict-policy.js` para tratar `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` como metadados técnicos;
- campos financeiros/operacionais continuam a gerar conflitos reais quando divergem.

## 2026-09-06 — Identidade visual do Mercado sem fotografias (`62-ui2`)

- PR #35 e reforço de qualidade PR #36 integrados com CI/Pages verdes;
- Mercado passa a ser `text-first`;
- fotografias/placeholder deixam de ocupar espaço na experiência principal;
- nome, embalagem/quantidade, loja, categoria, estado e preço tornam-se a identidade principal;
- câmara permanece para leitura GTIN/EAN/UPC;
- módulos históricos de imagem permanecem temporariamente no bundle por compatibilidade.

## 2026-09-06 — v62: fotografia official-only nos cartões vivos

- política histórica que impedia fotografias aproximadas nos resultados vivos Pingo Doce/Continente;
- fotografia só era aceite quando cadeia e `pid`/SKU correspondiam ao produto oficial;
- regra permanece no pipeline legado, embora a apresentação atual seja sem fotografias.

## 2026-09-06 — v61: bridge de imagens oficiais

- criado `market-official-images.js`;
- associação pelo `pid` exato;
- reader CORS simples compatível com Safari;
- origem da página da loja separada da proveniência da fotografia.

## 2026-09-06 — v60: imagens oficiais e catálogo alargado

- prioridade por SKU oficial;
- validação de URL/CDN por retalhista;
- catálogo ampliado e reader restrito;
- compatibilidade histórica mantida até remoção futura do pipeline antigo.

## 2026-09-05 — v59: auditoria e ampliação de imagens

- miniaturas ampliáveis;
- pesquisa auxiliar por Open Facts;
- persistência apenas de URL/metadados;
- placeholder mantido quando a correspondência não era suficientemente segura.

## 2026-09-05 — v58: Centro de Atualização inicial

- criado `app-update.js/.css`;
- adicionada **Definições → Atualização de Software**;
- verificação manual via Service Worker same-origin;
- canal beta mantido desativado sem pipeline própria.

## Base funcional anterior

- cofre local cifrado com PBKDF2-SHA-256 + AES-GCM;
- IndexedDB para estado privado;
- Lucide como sistema de ícones local;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço através de `cesta.pt`;
- `estimatedCents` e `actualCents` permanecem separados.
