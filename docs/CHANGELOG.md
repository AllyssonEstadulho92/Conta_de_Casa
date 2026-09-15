# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-15 — PR #140 / `76-bills-mobile-filters1` — pesquisa e filtros móveis de Despesas — integrado

### Problema confirmado

A página Despesas mantinha os controlos funcionais corretos, mas a apresentação móvel estava desalinhada com o protótipo aprovado:

- a pesquisa podia mostrar duas lupas sobrepostas porque `v75-expenses-modern.css` desenhava uma lupa por pseudo-elementos ao mesmo tempo que `ui-icons.js` injetava a lupa Lucide local;
- a faixa horizontal de filtros criava labels cortados e leitura pouco previsível no iPhone;
- pesquisa, ação principal e filtros tinham dimensões/ritmo visual inconsistentes;
- a solução tinha de preservar os IDs e listeners canónicos para não arriscar regressão funcional.

### Correção

- `mobile-layout.css` passa a declarar `76-bills-mobile-filters1` apenas como refinamento de feature móvel;
- `.bill-command-bar` organiza pesquisa + Nova fatura numa composição compacta;
- a lupa CSS histórica é neutralizada e a lupa Lucide local passa a ser a única representação visível da pesquisa;
- `#newBillBtn` mantém o mesmo controlo/handler e passa a uma superfície móvel quadrada com ícone e label acessível preservada;
- o bloco de filtros passa a cartão com hierarquia clara “Filtros” + texto auxiliar;
- Estado/Categoria ficam lado a lado em telefones com largura suficiente;
- De/Até continuam a ser inputs `date` reais; Ordenar e Limpar filtros permanecem funcionais;
- `<=360px` empilha a composição para evitar clipping;
- targets essenciais >=44 px, foco, reduced-motion e forced-colors foram preservados;
- `mobile-layout.css` não assume viewport/scroll global, mantendo `v76-mobile-shell.css` como autoridade geométrica.

### Regressão encontrada e resolvida durante o PR

O primeiro ciclo de CI bloqueou a alteração porque o CSS de feature continha `overflow:hidden`, violando o contrato que impede `mobile-layout.css` de recriar um viewport recortado. A regra foi removida/substituída por clipping acessível sem propriedade global de overflow e o gate `UI architecture contract tests` voltou a verde antes do merge.

### Evidência

- PR #140 head final `f7744d48e1b9ce28942e9765b199dc8f209ab4df`;
- TypeScript Foundation PR `34942844618`: sucesso;
- CI PR `34942844692`: sucesso integral;
- CI push `34942841985`: sucesso integral;
- merge PR #140: `387a953e427331a5aa48d872cd7c54e1552d2c1c`;
- Pages `34942974208`: iniciado após o merge; confirmação final pendente no momento deste registo.

### Preservado

Sem alteração de `renderBills()`, listeners, IDs canónicos, cálculos, `STATE_VERSION`, release `v76`, versão `0.76.0`, `package.json`, `release-manifest.json`, `app-update.js`, PIN/cofre, IndexedDB, Mercado, QR, scanner ou sync.

### Pendente

- confirmar o Pages do merge #140;
- validar a composição no mesmo iPhone/Safari web e PWA instalada, incluindo 360/375/390/430 px;
- prosseguir com a correção factual da página Segurança e, depois, ZXing local/CSP em bloco separado.

---

## 2026-09-15 — PR #138 / `76-icon-semantics1` — iconografia funcional semântica — publicado

### Problema confirmado

A família Lucide já era a autoridade funcional, mas duas entradas do subset local não correspondiam bem à responsabilidade apresentada:

- `plan` reutilizava exatamente a mesma geometria de `wallet`, fazendo Planeamento parecer uma carteira/tray;
- `settings` usava sliders, aproximando Definições de filtros/ajustes rápidos em vez de uma configuração global.

### Correção

- `ui-icons.js` passa a declarar `76-icon-semantics1`;
- Planeamento mantém o nome semântico `plan`, mas usa `CalendarCheck2` do snapshot Lucide fixado no projeto;
- Definições mantém o nome semântico `settings`, mas usa `Settings`/engrenagem do mesmo snapshot;
- snapshot de origem permanece `94e4cb9d9db5907053ebf3636a97c45529cf776b`;
- `LUCIDE_LICENSE.txt` e distribuição local/offline permanecem inalterados;
- `CDCIcons` expõe a revisão sem alterar a API `markup` já usada pela arquitetura;
- regressões verificam que Planeamento não volta a wallet/tray e Definições não volta a sliders.

### Evidência

- PR #138 head `fc08456427aad0069774b01caabbafd64c1b6c3b`;
- TypeScript Foundation PR `34938701913`: sucesso;
- CI PR `34938701834`: sucesso integral;
- merge PR #138: `d2348c940ccdee2812805c82a6f2e62cccf24863`;
- TypeScript Foundation main `34938763131`: sucesso;
- CI main `34938763232`: sucesso integral;
- Pages `34938807431`: sucesso.

### Preservado

Sem alteração de CSS, rotas, handlers, `STATE_VERSION`, release `v76`, versão `0.76.0`, `package.json`, `release-manifest.json`, `app-update.js`, cálculos, PIN/cofre, IndexedDB, Mercado, QR, scanner ou sync. Nenhuma CDN foi adicionada.

### Pendente

- validação física dos novos ícones no mesmo iPhone/Safari/PWA e desktop;
- correção do texto “Sem CDNs” na página Segurança enquanto ZXing continuar carregado de `unpkg.com`.

---

## 2026-09-15 — PR #136 / `76-drawer-hierarchy1` — drawer móvel harmonizado — publicado

### Problema confirmado no iPhone

O drawer móvel estava funcional, mas a composição dificultava a leitura:

- destinos apresentados em cartões de duas colunas com peso visual semelhante;
- labels longos quebravam de forma pouco natural;
- rotas principais e secundárias competiam no mesmo nível;
- ícones tinham superfícies internas excessivas;
- botão X apresentava uma moldura visual demasiado pesada;
- `Ocultar valores` e `Bloquear` competiam lado a lado na zona inferior.

### Correção

- `v75-drawer-theme.css` passa a declarar `76-drawer-hierarchy1`;
- drawer continua à direita para preservar controlador e gesto existentes;
- largura útil aumenta até 360 px, mantendo margem no viewport;
- navegação passa para uma coluna com leitura vertical;
- grupos finais: Principal, Análise e Sistema;
- destinos de primeiro nível: Início, Despesas, Planeamento, Mercado, Relatórios, Segurança e sincronização, Definições;
- Calendário permanece em Despesas, Metas em Planeamento e Diagnóstico em Definições;
- Segurança recebe estado ativo próprio no drawer completo e continua agrupada em Mais apenas no dock compacto;
- ícones deixam de usar cartões internos decorativos;
- botão de fecho fica numa única superfície circular de 44 px;
- `Ocultar valores` e `Bloquear` passam a ações verticais de largura completa;
- foco, reduced-motion, forced-colors e safe areas mantêm contratos próprios.

### QA e regressões

Durante o PR, dois contratos antigos foram encontrados e atualizados para a arquitetura final:

- `ui-consistency.test.cjs` ainda exigia a nomenclatura/hierarquia anterior de Mais;
- `app-update.test.cjs` ainda exigia o marcador visual `76-drawer-neutral1`.

Os testes foram atualizados para proteger o comportamento novo, sem recuar a interface.

### Evidência

- merge PR #136: `6cc4707197a50c022179d0af66895079ef1583bc`;
- TypeScript Foundation main `34933261324`: sucesso;
- CI main `34933261352`: sucesso integral;
- Pages `34933296570`: sucesso.

### Preservado

Sem alteração de `STATE_VERSION`, release `v76`, versão `0.76.0`, `package.json`, `release-manifest.json`, `app-update.js`, cálculos, `finance.js`, PIN/cofre, IndexedDB, Mercado, QR, scanner ou sync.

### Pendente

- validação física do drawer no mesmo iPhone/Safari/PWA.

---

## 2026-09-15 — PR #134 / `76-market-identity-stale1` — hardening da identidade temporária — publicado

### Risco identificado após PR #133

A ponte de identidade guarda temporariamente `marketId|pid` entre o clique num resultado live e o commit do novo artigo. Se o clique não chegasse ao commit, esse estado podia permanecer em memória e, em teoria, ser consumido por uma criação manual posterior.

### Correção

- a identidade pendente expira no microtask seguinte se não for consumida;
- no fluxo live normal, `marketId|pid` continuam a ser copiados para o item antes do primeiro `await` do commit;
- regressão específica protege a expiração e impede reintrodução do estado obsoleto;
- Service Worker recebe apenas o token técnico `market-identity-stale1`.

### Preservado

Sem alteração de release/centro de atualizações, `STATE_VERSION`, preços, cêntimos, quantidade, `finance.js`, PIN/cofre, IndexedDB, QR ou scanner.

### Evidência

- merge PR #134: `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`;
- TypeScript Foundation main `34914028412`: sucesso;
- CI main `34914028440`: sucesso integral;
- Pages `34914061390`: sucesso.

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
- ícones funcionais devem representar a responsabilidade real e usar geometria do snapshot Lucide auditado;
- filtros móveis de Despesas podem ser reorganizados visualmente, mas mantêm `renderBills()`, IDs e listeners como única autoridade funcional;
- CSS de feature não assume viewport/scroll global; `v76-mobile-shell.css` continua autoridade geométrica;
- o drawer completo usa uma coluna e expõe apenas destinos de primeiro nível;
- rotas secundárias permanecem nas páginas-pai em vez de duplicarem a navegação;
- `marketId|pid` acompanha o SKU pesquisado quando existe origem verificável;
- estado temporário de identidade expira se não for consumido pelo fluxo live;
- correção técnica não exige mudar a release pública;
- testes estáticos não substituem E2E/validação WebKit real;
- ZXing deve migrar de CDN para bundle local antes de endurecer `script-src`;
- migração TypeScript continua por blocos com paridade e regressões.
