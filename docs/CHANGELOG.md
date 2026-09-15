# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-15 — `76-market-identity-stale1` — hardening da identidade temporária

### Risco identificado após PR #133

A ponte de identidade guarda temporariamente `marketId|pid` entre o clique num resultado live e o commit do novo artigo. Se o clique não chegasse ao commit, esse estado podia permanecer em memória e, em teoria, ser consumido por uma criação manual posterior.

### Correção

- a identidade pendente expira no microtask seguinte se não for consumida;
- no fluxo normal live, `marketId|pid` continuam a ser copiados para o item antes do primeiro `await` do commit;
- regressão específica protege a expiração e impede reintrodução do estado obsoleto;
- Service Worker recebe apenas o token técnico `market-identity-stale1`.

### Preservado

Sem alteração de release/centro de atualizações, `STATE_VERSION`, preços, cêntimos, quantidade, `finance.js`, PIN/cofre, IndexedDB, QR ou scanner.

Estado: branch `fix/v76-market-identity-stale-guard1`; depende de CI + TypeScript + Pages verdes.

---

## 2026-09-15 — PR #133 / `76-market-identity1` — identidade canónica do Mercado — publicado

### Problema confirmado

- a pesquisa Cesta e o catálogo visual conheciam a identidade `marketId|pid`;
- ao adicionar um resultado live à lista, essa identidade deixava de estar garantida no ciclo de commit/normalização;
- `MarketItem` não declarava `marketId` nem `pid`, apesar de `MarketCatalogIdentity` já existir nos tipos.

### Correção

- `v75-market-flow.js` adicionou a ponte transitória `76-market-identity1`;
- a ação `data-market-add-product="cesta-<marketId>-<pid>"` transporta a identidade até ao novo item;
- `marketId/pid` são aplicados imediatamente antes do commit `created/market`;
- `normalizeMarketItem()` preserva os dois campos depois de reload, restauro e sincronização;
- retalhistas aceites: `pingo-doce`, `continente`; itens manuais/legados permanecem válidos com campos vazios;
- `src/types/persisted-state.ts` e contratos TypeScript incluem a identidade;
- `src/sync/sync-conflict-policy.ts` não remove `marketId/pid`, porque identidade de SKU não é metadado visual descartável;
- Service Worker recebeu o token técnico `market-identity1`.

### Preservado

Sem alteração de `STATE_VERSION`, release pública, `package.json`, `release-manifest.json`, `app-update.js`, cálculos, `estimatedCents`, `actualCents`, quantidade, PIN/cofre, IndexedDB, QR ou scanner.

### Evidência

- merge PR #133: `62359b4997075c4bd476f43f69ab18e41327f1bd`;
- TypeScript Foundation PR `34913445635`: sucesso;
- CI PR `34913445733`: sucesso integral;
- TypeScript Foundation main `34913506775`: sucesso;
- CI main `34913506766`: sucesso integral;
- Pages `34913539151`: sucesso.

### Higiene

- PR #45/v65 encerrado como obsoleto e não integrado.

---

## 2026-09-14 — release v76 e estabilização estrutural

### Consolidação arquitetural

- arquitetura atual foi desacoplada do runtime v74;
- `v74-experience.js/.css` e Featured foram retirados do bundle e posteriormente do repositório;
- navegação/composição móvel passou a uma única autoridade;
- release pública foi oficializada como v76/`0.76.0`;
- shell, safe areas, drawer, menu e páginas foram alinhados ao sistema v76.

### UI/UX

- Dashboard passou a usar hero de saldo e indicadores canónicos;
- Despesas e Mercado recuperaram os fluxos funcionais canónicos com pesquisa/filtros/listas;
- Planeamento, Metas e Mais foram alinhados ao protótipo sem inventar domínio;
- browser Adicionar produto foi refinado;
- drawer móvel passou a grelha coerente;
- pesquisa do Mercado deixou de desenhar moldura duplicada.

### Despesas/Safari

- modos Manual / Ler fatura / QR ficaram determinísticos e acessíveis;
- PR #131 profissionalizou o formulário Adicionar despesa;
- PR #132 corrigiu hit-testing/touch no Safari/iPhone removendo scrolls aninhados e preservando campos/tabs interativos.

---

## 2026-09-13 — estabilização auth/UI e início da migração TypeScript

- PIN local passou a abrir a aplicação sem depender do sync remoto;
- Safari/WebKit passou a respeitar explicitamente `[hidden]` entre cofre e shell;
- header/dock/drawer receberam auditoria transversal;
- marca `icon.svg` e Lucide foram consolidados;
- gate de integridade de páginas passou a verificar rota ↔ secção ↔ renderer, IDs e bundle Pages;
- Sync conflict policy migrou para TypeScript.

---

## Decisões de continuidade

- regressão real em dispositivo tem prioridade sobre teste legado;
- `icon.svg` é a marca canónica e Lucide é a iconografia funcional;
- `marketId|pid` acompanha o SKU pesquisado quando existe origem verificável;
- estado temporário de identidade expira se não for consumido pelo fluxo live;
- correção técnica não exige mudar a release pública;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de CDN para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.
