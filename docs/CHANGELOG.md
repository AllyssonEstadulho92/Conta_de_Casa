# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-15 — `76-market-identity1` — identidade canónica do Mercado

### Problema confirmado

- a pesquisa Cesta e o catálogo visual conheciam a identidade `marketId|pid`;
- ao adicionar um resultado live à lista, essa identidade deixava de estar garantida no ciclo de commit/normalização;
- `MarketItem` não declarava `marketId` nem `pid`, apesar de `MarketCatalogIdentity` já existir nos tipos.

### Correção

- `v75-market-flow.js` adiciona uma ponte transitória `76-market-identity1`;
- a ação `data-market-add-product="cesta-<marketId>-<pid>"` é usada para transportar a identidade até ao novo item;
- `marketId/pid` são aplicados imediatamente antes do commit `created/market`;
- `normalizeMarketItem()` é envolvido para preservar os dois campos depois de reload, restauro e sincronização;
- retalhistas aceites: `pingo-doce`, `continente`; itens manuais/legados permanecem válidos com campos vazios;
- `src/types/persisted-state.ts` e os contratos TypeScript passam a incluir a identidade;
- `src/sync/sync-conflict-policy.ts` continua sem remover `marketId/pid`, porque identidade de SKU não é metadado visual descartável;
- regressões em `tests/v75-market-flow.test.cjs` protegem o contrato;
- Service Worker recebe o token técnico `market-identity1` para distribuição imediata.

### Preservado

Sem alteração de `STATE_VERSION`, release pública, `package.json`, `release-manifest.json`, `app-update.js`, cálculos, `estimatedCents`, `actualCents`, quantidade, PIN/cofre, IndexedDB, QR ou scanner.

### Higiene

- PR #45/v65 encerrado como obsoleto; não deve ser integrado na baseline v76.

### Estado

Branch: `fix/v76-market-canonical-identity1`. Integração depende de CI + TypeScript + Pages verdes.

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

### Evidência mais recente antes de 15/09

Commit `863942d018887b35d3277cd2b36062f1509ad29a` com TypeScript, CI `quality` e GitHub Pages concluídos com sucesso.

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
- correção técnica não exige mudar a release pública;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de CDN para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.
