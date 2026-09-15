# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `cd45ec537989c51f125747958e198c8e0431a352` — PR #142  
Branch funcional: `main`

## Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro cifrado em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` é a identidade canónica de produto quando existe origem live verificável;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- UI/UX e migração de linguagem não alteram silenciosamente domínio, persistência ou segurança.

## Estado publicado

A `main` está oficialmente em v76/`0.76.0`.

Consolidações relevantes:

- PR #105–#116: retirada progressiva do runtime v74, autoridade única de navegação/composição e oficialização da v76;
- PR #117–#130: menu móvel, shell/safe areas, Planeamento/Mais, Dashboard, Mercado, drawer e pesquisa alinhados ao produto v76;
- PR #131: fluxo profissional de Adicionar despesa;
- PR #132: hotfix Safari/iPhone para touch/scroll do formulário de despesas;
- PR #133: persistência retrocompatível de `marketId|pid` no Mercado;
- PR #134: expiração segura da identidade temporária se um clique live não chegar ao commit;
- PR #136: `76-drawer-hierarchy1`, substituição do drawer móvel denso por uma hierarquia vertical legível;
- PR #138: `76-icon-semantics1`, correção semântica dos ícones de Planeamento e Definições com geometrias do snapshot Lucide já fixado no projeto;
- PR #140: `76-bills-mobile-filters1`, reorganização móvel da pesquisa e filtros de Despesas, com remoção visual da lupa CSS duplicada e preservação integral dos IDs/handlers canónicos;
- PR #142: `76-bills-mobile-spacing1`, consolidação do ritmo vertical e limpeza de espaçamento do mesmo bloco móvel de Despesas.

Evidência mais recente do bloco PR #142:

- merge PR #142: `cd45ec537989c51f125747958e198c8e0431a352`;
- TypeScript Foundation PR `34944913748`: sucesso;
- CI PR `34944913749`: sucesso integral;
- TypeScript Foundation main `34944980784`: sucesso;
- CI main `34944980812`: sucesso integral;
- Pages `34945033256`: sucesso.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados pelo PR #142.

## Despesas — pesquisa, filtros e espaçamento móveis

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` estão integrados em `main`:

- `#billSearch`, `#newBillBtn`, `#billStatusFilter`, `#billCategoryFilter`, `#billDateFrom`, `#billDateTo`, `#billSort` e `#billClearFilters` continuam a ser os controlos canónicos;
- `renderBills()` e os listeners existentes em `events.js` continuam a autoridade funcional;
- a pesquisa móvel e o botão de nova despesa usam composição compacta e targets tácteis adequados;
- a lupa manual histórica de `v75-expenses-modern.css` permanece neutralizada quando o sistema Lucide local fornece `.ui-search-icon`;
- pesquisa e filtros passam a ter separação vertical explícita de 20 px;
- o cartão de filtros usa padding próprio de feature e gaps consistentes, sem depender de compensações negativas;
- o subtítulo “Refine a sua pesquisa de despesas” deixou de usar `margin-top` negativo;
- Estado/Categoria mantêm duas colunas em telefones com largura suficiente e os restantes campos têm ritmo vertical explícito;
- `#billClearFilters` mantém target de 44 px e recebe separação visual própria;
- em `<=360px`, os filtros passam para uma coluna com espaçamento vertical regular para evitar clipping e compressão;
- foi removida duplicação CSS dos prefixos “Período ·” sem alterar os inputs reais;
- `forced-colors` e `prefers-reduced-motion` permanecem cobertos;
- `mobile-layout.css` continua limitado a refinamentos de feature e não assume a geometria global do viewport, que pertence a `v76-mobile-shell.css`;
- cálculos, persistência, PIN/cofre, QR, scanner e sync não foram alterados.

Validação física deste bloco no mesmo iPhone/Safari/PWA ainda está pendente; CI verde e Pages publicados não substituem observação real do layout.

## Iconografia funcional — estado atual

`76-icon-semantics1` está publicado:

- `icon.svg` continua a ser a marca canónica da aplicação;
- `ui-icons.js` + `ui-icons.css` continuam a ser a autoridade da iconografia funcional Lucide;
- o snapshot Lucide permanece fixado em `94e4cb9d9db5907053ebf3636a97c45529cf776b` e a licença local continua preservada;
- Planeamento mantém o nome semântico `plan`, mas passa a usar a geometria `CalendarCheck2`, com calendário + confirmação;
- Definições mantém o nome semântico `settings`, mas passa a usar a geometria `Settings`/engrenagem;
- a antiga geometria de carteira/tray deixa de representar Planeamento;
- a antiga geometria de sliders deixa de representar Definições;
- testes impedem regressão para essas geometrias inadequadas;
- nenhuma CDN, rota, handler, cálculo ou persistência foi introduzida ou alterada neste bloco.

## Navegação móvel — estado atual

`76-drawer-hierarchy1` está publicado:

- drawer continua a abrir pela direita para preservar o controlador/gesto móvel existente;
- largura útil foi aumentada para evitar labels comprimidos;
- navegação passou de cartões em duas colunas para uma lista vertical de uma coluna;
- Principal: Início, Despesas, Planeamento e Mercado;
- Análise: Relatórios;
- Sistema: Segurança e sincronização, Definições;
- Calendário permanece dentro de Despesas, Metas dentro de Planeamento e Diagnóstico dentro de Definições, evitando duplicação de rotas secundárias;
- Segurança tem seleção própria no menu completo, mas continua agrupada em Mais no dock compacto;
- botão de fecho é uma única superfície circular de 44 px;
- Ocultar valores e Bloquear são ações verticais de largura completa;
- foco, reduced-motion, forced-colors e safe areas foram preservados.

Validação física no mesmo iPhone/Safari/PWA ainda está pendente; CI verde não substitui observação real do layout.

## Mercado — estado de identidade

`76-market-identity1` + `76-market-identity-stale1` estão publicados:

- a pesquisa Cesta preserva `marketId` e `pid` ao adicionar um produto;
- normalização/reload/restauro/sync retêm a identidade;
- itens manuais/legados continuam compatíveis com campos vazios;
- a identidade temporária usada entre clique e commit expira no microtask seguinte quando não é consumida;
- preço, quantidade, `estimatedCents`, `actualCents`, scanner e persistência financeira permanecem inalterados.

## Auditoria atual — problemas abertos

### ALTO

- validar fisicamente `76-bills-mobile-filters1` + `76-bills-mobile-spacing1`, drawer e iconografia no mesmo iPhone/Safari e PWA instalada;
- acrescentar E2E real com WebKit/Chromium para toque, teclado, scroll e transição PIN → aplicação;
- reduzir gradualmente a cascade CSS e dependência de `!important`;
- `main` continua sem branch protection/required checks obrigatórios.

### MÉDIO

- ZXing do scanner continua dependente de `unpkg.com`; a página Segurança não deve afirmar literalmente “Sem CDNs” enquanto isso existir;
- migrar ZXing para bundle local, preservando licença, antes de restringir `script-src` para `'self'`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- continuar migração TypeScript por risco, sem começar por `finance.js`/cifra.

## Higiene de repositório

- PR #45/v65 encerrado como obsoleto em 15/09/2026; não deve ser reaberto ou integrado na v76.

## Próximo passo

1. validar fisicamente `76-bills-mobile-filters1` + `76-bills-mobile-spacing1` no iPhone/Safari web e PWA instalada com nova captura;
2. validar visualmente `76-drawer-hierarchy1` + `76-icon-semantics1` no mesmo dispositivo;
3. corrigir a descrição da página Segurança para refletir a dependência ZXing real, sem mudança de release;
4. preparar ZXing local e endurecimento CSP num bloco isolado;
5. criar primeiro fluxo E2E WebKit/Chromium;
6. consolidar CSS por propriedade, sem apagar regras sem prova de não utilização;
7. continuar TypeScript em módulos de baixo acoplamento.
