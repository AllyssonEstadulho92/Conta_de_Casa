# Changelog Técnico — Conta de Casa

## 2026-09-07 — v64 candidata: auditoria móvel, scanner conservador e ciclo recorrente limpo

### Estado da release

- branch: `feature/v64-scanner-billing-safearea`;
- PR: #44;
- build candidato: `v64`;
- revisão visual: `64-ui1`;
- runtime: `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1`;
- integração em `main` e publicação Pages: pendentes até CI final verde.

### Auditoria iPhone/Safari

Duas capturas reais da Lista de compras mostraram estados diferentes do mesmo cabeçalho: numa captura o topo estava completo; noutra, após deslocação, menu/título/botão `+` ficaram parcialmente cortados. A estrutura móvel usava `.main` como scroller interno e `.topbar` como `sticky` dentro desse scroller.

A candidata v64:

- reforça `safe-area-inset-top` com folga tátil mínima;
- substitui a dependência móvel de `sticky` por `position:fixed` no cabeçalho;
- fixa os gutters esquerdo/direito;
- adiciona `padding-top` equivalente à altura do cabeçalho em `.main` para impedir sobreposição;
- mantém o scroller interno, bottom navigation, teclado e diálogos existentes;
- acrescenta regressão automatizada para esta estrutura.

### Código de barras / Compras

- leitura automática precisa exige um único supermercado selecionado;
- última loja individual pode ser guardada como preferência local de UI;
- o GTIN identificado é comparado com resultados reais da loja por nome/marca e embalagem;
- auto-adição só ocorre com score mínimo `0.84` e vantagem mínima `0.10` sobre o segundo candidato;
- embalagens/multipacks incompatíveis são rejeitados;
- ambiguidade exige confirmação manual;
- o mesmo GTIN pendente incrementa quantidade em vez de criar linha duplicada;
- preço encontrado atualiza `estimatedCents`;
- `actualCents` continua reservado ao preço efetivamente pago/confirmado.

### Faturas recorrentes

- próximas ocorrências automáticas passam a **Por preencher**;
- descrição, fornecedor, categoria, método, recorrência e vencimento previsto são reutilizados;
- valor, referência, observações e data de emissão não são herdados;
- drafts não entram em pendentes/atrasos;
- ao preencher e guardar, a ocorrência regressa ao fluxo normal;
- migração de dados antigos só atua sobre ocorrências futuras automáticas ainda não editadas e sem pagamentos.

### Segurança e dados

- `STATE_VERSION = 5` preservado;
- PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM e IndexedDB inalterados;
- nenhuma credencial/token/chave adicionada;
- scanner não transforma consulta de preço em preço pago;
- atualização continua same-origin e depende de **Atualizar agora**.

### Testes

- criado `tests/v64-runtime.test.cjs`;
- CI cobre confiança/ambiguidade do scanner, GTIN repetido, separação estimado/real, drafts recorrentes e safe area/cabeçalho móvel;
- regressões existentes de finanças, segurança, Mercado, atualização, responsividade, acessibilidade e sincronização permanecem na pipeline;
- uma execução completa da branch ficou verde antes do último reforço do cabeçalho; a release só será integrada após nova execução completa verde no HEAD final.

## 2026-09-06 — v63 publicada: consistência visual e atualização controlada (`63-ui2`)

### Publicação

- PR #42 integrado em `main`;
- merge: `1a034c84976c042e0433d016a5628feaa339a7a6`;
- CI de `main`: run #999 (`34065040862`) — **sucesso**;
- Deploy GitHub Pages: run #992 (`34065057875`) — **sucesso**;
- build público: `v63`;
- revisão visual pública: `63-ui2`;
- cache público: `conta-de-casa-public-v63-ui2`.

### Correções visuais

- criado `ui-consistency.css` como camada final de apresentação;
- Lucide permanece sistema vetorial oficial;
- `.ui-icon-svg` e `.svg-icon` usam métrica comum;
- a navegação inferior mantém apenas um indicador ativo em `::before`;
- `::after` redundante é anulado;
- a faixa dos cartões-resumo passa a `box-shadow: inset`, sólida e contínua;
- `market-summary-item::before` fica reservado ao ícone semântico;
- Lista de compras mantém agrupamento por categoria e alinhamento consistente.

### Centro de Atualização

- criado `release-manifest.json` como histórico público versionado;
- `scripts/prepare-pages.cjs` falha quando manifesto e build divergem;
- consulta same-origin com `cache: no-store`;
- novo Service Worker pode aguardar confirmação;
- ativação explícita usa `APPLY_UPDATE`;
- allowlist pública e cache-busting continuam restritos.

### Segurança

- cofre/criptografia e dados financeiros inalterados;
- atualização atua apenas nos assets da aplicação.

## 2026-09-06 — Lista de compras agrupada por categoria (`62-ui3`)

- PR #40 integrado em `main` com CI verde;
- merge: `98662aa366ea65316ebd47cf56df8f2a3eeac974`;
- criado `market-category-groups.js/.css`;
- mobile usa grupos por categoria com `<details>/<summary>`;
- desktop mantém tabela com separadores de categoria;
- handlers e schema financeiro preservados.

## 2026-09-06 — Hotfix iPhone/Safari do Mercado e conflitos técnicos (`62-ui2`)

- PR #38 integrado em `main` com CI/Pages verdes;
- merge: `f1557594aee99b69d10aca852a711b453502a698`;
- corrigida coluna fantasma no browser de produtos;
- preço reflui abaixo de 360 px;
- `sync-conflict-policy.js` separa metadados técnicos de conflitos financeiros.

## 2026-09-06 — Identidade visual do Mercado sem fotografias (`62-ui2`)

- PR #35 e PR #36 integrados com CI/Pages verdes;
- Mercado passa a `text-first`;
- fotografias/placeholder deixam de ocupar espaço principal;
- câmara permanece para leitura GTIN/EAN/UPC;
- módulos históricos de imagem permanecem temporariamente por compatibilidade.

## 2026-09-06 — v62: fotografia official-only nos cartões vivos

- política histórica de imagem oficial por cadeia/SKU;
- permanece apenas como compatibilidade do pipeline antigo.

## 2026-09-06 — v61: bridge de imagens oficiais

- criado `market-official-images.js`;
- associação pelo `pid` exato;
- reader CORS simples compatível com Safari.

## 2026-09-06 — v60: imagens oficiais e catálogo alargado

- prioridade por SKU oficial;
- validação de URL/CDN por retalhista;
- catálogo ampliado e reader restrito.

## 2026-09-05 — v59: auditoria e ampliação de imagens

- miniaturas ampliáveis;
- pesquisa auxiliar por Open Facts;
- persistência apenas de URL/metadados.

## 2026-09-05 — v58: Centro de Atualização inicial

- criado `app-update.js/.css`;
- adicionada **Definições → Atualização de Software**;
- verificação manual via Service Worker same-origin.

## Base funcional anterior

- cofre local cifrado com PBKDF2-SHA-256 + AES-GCM;
- IndexedDB para estado privado;
- Lucide como sistema de ícones local;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço via `cesta.pt`;
- `estimatedCents` e `actualCents` separados.
