# Arquitetura — Conta de Casa

Atualizado: 9 de outubro de 2026
Versão: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA

## 0.5. Pipeline visual de fotografias oficiais

Os resultados oficiais transmitem `marketId`, `pid` e `sourceUrl` validado à `CDCOfficialMarketImages.resolve`. O bridge pode resolver diretamente a página oficial sem pesquisa repetida no cesta.pt, mas mantém a verificação da origem, pasta de imagens oficial e PID exato. `CDCPingoDocePhotoLibrary.syncNow` pode confirmar um máximo de três imagens prioritárias antes de responder ao clique; os limites de sessão/dia permanecem.

O catálogo visual cria `article[data-visual-catalog-card]` com `.market-visual-product-media`. `market-photo-loader.js` seleciona esse cartão e usa o atributo do botão apenas para a ação de pesquisa. Uma imagem só é considerada `ready` depois de `load`, não depois de definir `src`. Sem fotografia oficial válida, apresenta placeholder.

## 0.4. Filtros do Mercado, layout móvel sem interseções

`v76-mobile-shell.css` contém a autoridade final responsiva `76-market-filter-visual-qa1`. Em resoluções até 820 px, a grelha de filtros mantém duas colunas com largura mínima zero e redefine o seletor terceiro, que herdava mínimos de `v75-market-flow.css` (190 px). Até 359 px passa a uma coluna. O botão «Limpar filtros» é um item autónomo, não sobreposto. O catálogo, fontes de dados, preços, handlers e estado permanecem intocados.

Este é um contrato de layout. A verificação em Chromium a partir do artefacto de distribuição não substitui ensaios WebKit/Safari e navegação com cofre de teste.

## 0.3. Estado das autoridades após a auditoria

Na PWA a camada visual de autenticação pertence a `v75-usability.css` e a geometria do Mercado mobile a `v76-mobile-shell.css` / `v76-product-pages.css`. O Mercado recupera fotografias com validação restrita ao retalhista e PID; a contabilidade apenas expõe métricas adicionais de valores ainda estimados. Os contratos de cifra, armazenamento e sincronização mantêm-se.

A fusão destes módulos já passou nos testes de CI da `main`. Validação WebKit/Chromium real e experiência PWA instalada são responsabilidades de QA ainda abertas.

## 0.2. Toolchain e dependências da PWA

O build GitHub Pages usa Node 24, `package.json` e `package-lock.json` (lockfileVersion 3) na raiz. Os workflows CI, Deploy Pages e TypeScript Foundation usam `npm ci --ignore-scripts --no-audit --no-fund` e cache npm, impedindo resolução transitiva divergente durante builds sem alteração do lockfile. A instalação não altera artefactos financeiros.

A aplicação nativa `apps/mobile-native` é separada: o seu `package.json` e o workflow `mobile-native.yml` não foram migrados nesta intervenção porque ainda não há lockfile nativo verificado.

## 0.1. Transparência do valor estimado versus real

`monthNumbers(month)` continua a usar o mesmo cálculo para `marketSpent`, `cashSpent` e `budgetUsed`. Quando uma compra concluída tem `actualCents<=0`, o valor `estimatedCents` ainda contribui para o total pelo contrato anterior, mas duas métricas derivadas distinguem essa condição: `marketEstimatedCount` e `marketEstimatedCents` (valor estimado dessa parcela). Estes campos são exclusivamente de leitura, sem persistência.

O Início alerta quando há compras com preço real por confirmar, o Calendário informa no resumo mensal e o cartão do Mercado mostra `Estimado usado`. Não existe mudança silenciosa da contabilidade, do cofre ou da fonte de verdade.

## 0. Biblioteca de imagens oficiais do Mercado

A fonte monetária permanece separada das imagens. O catálogo identifica produtos por `marketId|pid`, e a resolução de fotografias aceita apenas origens oficiais conhecidas com PID idêntico ao produto. O Pingo Doce suporta o CDN atual `www.pingodoce.pt` e a origem histórica `static.pingodoce.pt`, com validação do caminho `Sites-pingo-doce-master`; o Continente mantém a verificação da sua origem/catálogo.

A CSP do bundle autoriza só as origens de imagem necessárias, sem wildcard genérico de HTTPS. Quando uma imagem não valida, usa placeholder, nunca correspondência não verificada. A fotografia não altera preços, quantidades, cálculos, PIN, cifragem ou sincronização.

## 1. Modelo geral

PWA estática/local-first. O browser recebe HTML/CSS/JavaScript; a fonte funcional está a migrar incrementalmente para TypeScript strict. Não existe framework UI.

Invariantes:

- `STATE_VERSION=5`;
- dinheiro em cêntimos inteiros;
- estado financeiro local cifrado;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` canónico quando existe identidade de loja/SKU;
- fotografia não prova preço/transação.

## 2. Cofre e sessão

`core.js` continua a autoridade de estado, cifra, normalização e sessão. A UI do cofre não pode modificar lógica de derivação, desbloqueio, armazenamento ou sync.

Autoridade visual: `v75-usability.css` / `76-auth-prototype-final1`.  
Contrato de exclusividade: `76-auth-exclusive-state1`.  
Ritmo vertical móvel: `76-auth-spacing3` dentro da mesma folha canónica.

- criação e desbloqueio são estados mutuamente exclusivos;
- atributos `hidden` não podem ser anulados por regras decorativas;
- `100svh`, safe areas e targets adequados permanecem requisitos móveis;
- o histórico `76-auth-spacing3` usa 56 px com gaps 30/16 px, mas o protótipo posterior voltava a ampliar controlos;
- proposta `76-auth-viewport-fit1`: autoridade final para iPhone até 620 px, keypad 52 px (48 px em ecrãs estreitos/baixos), scroll acessível quando a altura útil não chega, campo com fonte 16 px e safe areas;
- `#vaultMessage:empty` não reserva altura;
- esta arquitetura é exclusivamente visual e não altera PIN, PBKDF2, AES-GCM, IndexedDB, importação ou sync.

## 3. Rotas e navegação

Rotas canónicas:

- dashboard;
- bills;
- calendar;
- planning;
- goals;
- market;
- reports;
- security;
- diagnostics;
- settings.

`renderPage()` continua a ser o dispatcher funcional.

### 3.1 Controlos do diálogo

O `#formDialog` separa navegação contextual de encerramento:

- `[data-dialog-back]` é a ação **Voltar** e só fica disponível em `mode='detail'`; usa o ícone local `back` e regressa através de `closeDialog()`, que restaura o foco no elemento de origem;
- `[data-close-dialog]` é a ação **Fechar** e mantém o ícone local `close`;
- em mobile, Voltar ocupa a coluna esquerda, o título a coluna central e Fechar a coluna direita;
- CSS não pode converter `.dialog-close` numa seta através de pseudo-elementos ou máscaras;
- nenhuma destas ações altera domínio financeiro, persistência ou histórico.

Autoridades móveis:

- `v75-architecture.js`: composição/navegação progressiva;
- `mobile-menu-toggle.js`: drawer/hambúrguer;
- `v76-mobile-shell.css`: viewport autenticado, safe areas, scroll e dock;
- `mobile-layout.css`: refinamentos de feature sem propriedade global do viewport.

## 4. Arquitetura visual

Autoridades atuais:

- tokens/componentes: `v76-modern-ui.css` + `design-system.css`;
- composição de páginas: `v76-product-pages.css`, `v76-planning-more.css` e camadas v75 ainda ativas;
- geometria mobile autenticada: `v76-mobile-shell.css`;
- auth/cofre: `v75-usability.css`;
- refinamentos móveis de feature: `mobile-layout.css`;
- Calculadora de datas: `date-calculator.css` / `76-date-calculator-layout2`, com `76-date-calculator-mobile-spacing3` e `76-date-calculator-prototype-inputs5` dentro da mesma autoridade;
- marca: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer: `mobile-menu-toggle.js/.css` + `v75-drawer-theme.css`;
- formulários de despesas/QR: `invoice-capture.js/.css`.

A redução da cascade deve ser feita por componente e protegida por regressões, nunca por eliminação global de estilos.

## 5. Despesas mobile

Autoridade funcional:

- `renderBills()` filtra/renderiza;
- `events.js` mantém listeners;
- IDs canónicos não mudam.

Apresentação móvel final: `76-bills-mobile-alignment2`, com grelha contida e fallback para uma coluna antes de cortar conteúdo.

## 4.1 Datas civis em funcionalidades locais

A aplicação distingue timestamps absolutos de datas civis do utilizador. Funcionalidades cuja semântica é **o dia local** não podem derivar a data através de `toISOString().slice(0,10)`, porque isso usa UTC.

Contratos reforçados em `76-full-audit-fixes1`:

- o limite diário do catálogo do Mercado usa ano/mês/dia locais;
- a biblioteca Pingo Doce usa a mesma regra civil local para as quotas diárias;
- o nome do backup cifrado usa `currentLocalDateKey()`;
- timestamps de auditoria, pagamentos, sync e `updatedAt` continuam ISO UTC, porque representam instantes absolutos.

Preferências públicas não sensíveis podem usar Web Storage apenas com chaves `cdc_public_*` que não ativem o padrão de dados sensíveis. A preferência de supermercado usa `cdc_public_store_choice_v1`; o estado financeiro continua proibido em Web Storage.

## 5.1 Início e fila de pagamentos

`renderDashboard()` continua a obter todos os valores de `dashboardNumbers()`. A revisão `76-dashboard-priority1` altera apenas a leitura visual dos próximos vencimentos.

Contratos:

- a fila de prioridade inclui faturas do mês com `remainingForBill() > 0` e data válida, incluindo vencidas; a ordenação continua cronológica por vencimento;
- a ordem continua a ser produzida por `compareBillsByDue()`;
- `dashboardUpcomingBillHtml()` recebe o índice depois da ordenação e apresenta a posição ordinal;
- a posição é mapeada para rótulos visuais **Pagar**, **A seguir**, **Depois** e **Mais tarde**;
- a cor da posição não é gravada no estado nem altera `billUrgency()`, `billStatus()` ou regras de vencimento;
- a identidade visual de cada fatura usa uma inicial local e determinística, sem imagens remotas;
- a linha inteira preserva `data-bill-id`, portanto usa o mesmo controlador de abertura da fatura;
- o cartão de orçamento do Início continua a usar `profile.budgetCents` e `budgetUsed`; a barra é apenas apresentação e fica limitada visualmente a 0–100%;
- nenhum destes componentes escreve em IndexedDB, altera pagamentos ou cria uma segunda fonte de verdade.

Autoridade visual: `v76-product-pages.css` / `76-dashboard-priority1`. O shell móvel, safe areas e dock continuam exclusivamente em `v76-mobile-shell.css`.


### Entrega PWA da revisão

Uma revisão visual que dependa de HTML/CSS/JavaScript novo deve também produzir uma mudança observável no Service Worker quando se pretende atualização automática de clientes já abertos. Em `76-dashboard-priority-delivery1`:

- `SERVICE_WORKER_REV` identifica a revisão no URL de registo gerado;
- a chave `CACHE` de `sw.js` muda para garantir novo ciclo install/activate;
- `registration.update()` pode detetar a nova versão mesmo em clientes que ainda executam a página anterior;
- `skipWaiting()`, `clients.claim()` e o handler existente de `controllerchange` convergem para um reload seguro;
- o reload continua adiado enquanto existir formulário/dialog ativo ou um campo editável focado.

Este requisito evita que um deploy correto no Pages fique invisível numa PWA restaurada pelo iOS.
## 5.2 Contexto mensal partilhado

Calendário e Planeamento usam `selectedMonth` como única referência de mês. A revisão `76-month-context-sync1` formaliza o fluxo:

- alterações no `#monthPicker` passam por `selectMonthContext()`;
- o histórico do Calendário continua a escrever no mesmo `#monthPicker` e a disparar `change`;
- as setas do Planeamento continuam a alterar o `#monthPicker`, portanto entram no mesmo fluxo;
- `selectMonthContext()` atualiza `selectedMonth`, chama `monthProfile(next)`, sincroniza o campo, renderiza a página ativa e emite `cdc:month-change`;
- a arquitetura visual do Planeamento escuta `cdc:month-change` e recompõe o cartão mensal;
- `renderCalendar()` passa a chamar `billInMonth(b, selectedMonth)` de forma explícita.

Não existe cópia automática de orçamento ou saldo entre meses. Cada perfil mensal continua independente.

## 5.3 Fluxo de caixa vs. orçamento

A aplicação mantém duas bases mensais deliberadamente distintas:

- `paymentTotal`: pagamentos cuja `paidAt` pertence ao mês, representa fluxo de caixa real;
- `budgetPaymentTotal`: pagamentos associados a faturas cujo vencimento pertence ao mês;
- `marketSpent`: compras concluídas no mês;
- `cashSpent = paymentTotal + marketSpent`: gasto efetivamente movimentado no mês;
- `budgetUsed = budgetPaymentTotal + marketSpent`: consumo do orçamento atribuído ao mês da obrigação.

Uma fatura de outubro paga em setembro entra em `cashSpent` de setembro e em `budgetUsed` de outubro. Não existe dupla contagem dentro da mesma métrica.

`categoryTotals()` segue a base orçamental. `cashCategoryTotals()` segue a data real do pagamento e é a autoridade das categorias dos Relatórios. O Calendário usa `cashSpent` no resumo, `spendingForDate()` nos dias e `monthlySpendHistory()` no histórico, mantendo as três leituras reconciliadas.

## 6. Planeamento mobile

`76-planning-budget-card2` + `76-planning-ring-shape1` + `76-planning-commitment1`:

- `#monthPicker` continua a autoridade do mês;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- orçamento ausente permanece `Por definir`;
- o anel neutraliza altura legada e mantém proporção 1:1;
- `dashboardNumbers()` / `monthNumbers()` continuam a fonte financeira do resumo;
- **Orçamento utilizado** = `budgetUsed`;
- **Comprometido** = `outstanding`, já calculado pelo domínio a partir do remanescente das faturas ativas do mês;
- **Disponível real** = `budgetCents - budgetUsed - outstanding`;
- pagamentos parciais não são duplicados: a parte paga da fatura entra em `budgetUsed` do mês da obrigação e apenas o remanescente fica em `outstanding`;
- a percentagem do anel é baseada em `budgetUsed`, coerente com a finalidade orçamental do cartão;
- disponível real pode ser negativo para representar sobrecompromisso;
- a apresentação não cria uma segunda fonte de verdade e não altera persistência, estado ou regras de pagamento.

## 6.1 Rede e scanner QR

A revisão `76-local-zxing1` elimina a CDN do scanner. ZXing Browser 0.2.0 passa a ser dependência de build e artefacto público da própria aplicação.

Contrato atual:

- `script-src` autoriza apenas `self`;
- `@zxing/browser` está fixado em `0.2.0` e `@zxing/library` em `0.22.0`;
- `scripts/build-typescript-runtime.cjs` valida a versão instalada antes de copiar o UMD para `.generated/zxing-browser.min.js`;
- a licença da dependência é preservada em `.generated/ZXING_BROWSER_LICENSE.txt` e publicada no Pages;
- `barcode-reader-src` aponta para o asset local, nunca para uma origem externa;
- `invoice-capture.js` e `market-barcode.js` validam same-origin antes de inserir o script;
- ambos os fluxos reutilizam o mesmo script ZXing quando um deles já o carregou;
- o Service Worker inclui o runtime e a licença na allowlist, permitindo fallback ZXing offline após instalação;
- o scanner continua sem receber o estado financeiro cifrado nem enviar imagens para serviços externos.

## 7. Calculadora de datas

### 7.1 Autoridade funcional — `76-date-calculator1`

Entrada: **Mais → Ferramentas → Calculadora de datas**.

Arquitetura:

- fonte canónica: `src/ui/date-calculator.ts`;
- runtime browser: `.generated/date-calculator.js` → `dist/date-calculator.js`;
- build: `scripts/build-typescript-runtime.cjs` + `scripts/prepare-pages.cjs`;
- Service Worker inclui CSS/runtime na allowlist pública.

Contratos de exatidão:

- reutiliza primitivas de data civil de `core.js`;
- diferença é de datas civis, não de milissegundos/horas locais;
- DST/fuso não alteram a contagem de dias;
- inclusão/exclusão das datas-limite é explícita;
- “dias úteis” = segunda a sexta-feira;
- feriados só podem ser descontados quando existir jurisdição e fonte explícitas;
- não usa rede nem persiste resultados no estado financeiro.

### 7.2 Autoridade visual — `76-date-calculator-layout2`

Toda a apresentação continua em `date-calculator.css`. Os refinamentos #161, #163 e #165 alteram apenas a composição dentro desta mesma autoridade; não existem folhas paralelas nem duplicação de handlers.

Sistema de espaçamento local:

- 4 px: microajustes;
- 8 px: elementos diretamente relacionados;
- 12 px: ícone/texto e grupos compactos;
- 16 px: espaçamento padrão;
- 20 px: padding intermédio;
- 24 px: separação principal;
- 32 px: reservado para separação de grande escala.

Desktop:

- grelha com área principal flexível + coluna lateral de 280 px;
- `input` e `result` ocupam a coluna principal;
- `facts` ocupa a coluna lateral;
- `actions` permanece diretamente associado ao resultado;
- Data inicial e Data final permanecem lado a lado, com Trocar entre ambas.

Mobile `<=820px`:

- ordem canónica: `input → facts → result → actions`;
- dialog usa `100svh`, não `100dvh`;
- safe areas são aplicadas ao cabeçalho/layout/rodapé;
- sem scroll horizontal para descobrir controlos.

Mobile `<=560px`:

- `.cdc-datecalc-date-grid` usa flex vertical;
- ordem permanece Data inicial → Trocar → Data final;
- gap canónico do grupo: 8 px;
- labels anulam margem/altura herdadas;
- `.cdc-datecalc-input-action` é a moldura única do campo e usa grelha interna `48px minmax(0,1fr) auto`;
- a primeira coluna apresenta uma affordance visual local de calendário e divisor, sem rede e sem segundo date picker;
- o `input[type="date"]` nativo ocupa apenas a coluna central, com `min-width:0`, sem borda própria e sem padding artificial que aumente a largura intrínseca no WebKit;
- `::-webkit-calendar-picker-indicator` não é reposicionado por `left`/`position:absolute`; fica visualmente colapsado para não interferir na geometria;
- **Hoje** ocupa uma coluna própria à direita e mantém target >=44 px;
- foco do conjunto é desenhado na moldura com `:focus-within`;
- **Trocar** ocupa visualmente o eixo horizontal disponível, mas a superfície central continua 44×44 px;
- **Regra de contagem** usa duas colunas em telemóveis comuns.

Mobile `<=430px`:

- campos secundários passam a uma coluna;
- o grupo de data reduz a primeira coluna para 44 px e o botão Hoje para mínimo 56 px;
- padding é reduzido de forma controlada;
- a Regra de contagem continua em duas colunas enquanto existir largura útil.

Mobile `<=360px`:

- dialog ocupa integralmente o viewport estável.

Mobile `<=340px`:

- **Regra de contagem** passa a uma coluna antes de comprimir/cortar o texto.

Controlos:

- inputs/selects principais: 52 px e texto de 16 px;
- tabs: mínimo 48 px;
- ação **Hoje**: mínimo 44 px;
- opções de contagem: mínimo 44 px por label;
- superfície central de Trocar: 44×44 px;
- CTA principal: mínimo 52 px.

Acessibilidade e modos:

- foco visível preservado através de `:focus-within` nos campos compostos;
- o controlo semântico de data continua a ser `input[type="date"]` nativo;
- `forced-colors` e `prefers-reduced-motion` explícitos;
- impressão/PDF mantém apenas o conteúdo de resultado relevante;
- JavaScript/TypeScript funcional e IDs/handlers não foram duplicados.

`cdc-datecalc-workspace` usa `display:contents` apenas como composição visual; não existe um segundo componente de estado ou cálculo.

## 8. Mercado

- pesquisa live limitada às fontes já suportadas;
- preço pesquisado permanece separado do valor confirmado;
- `marketId|pid` preserva identidade quando existe SKU verificável;
- imagem/logótipo não prova preço/transação.

## 9. Faturas e captura

Fluxo Adicionar despesa:

- Manual;
- Ler fatura por imagem/QR AT;
- QR Code por câmara.

As alterações de auth e Calculadora de datas não alteram captura, finanças ou scanner.

## 10. TypeScript

Pipeline vigente:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

A Calculadora de datas continua com fonte funcional TypeScript strict. O PR #165 altera apenas CSS e regressões do contrato visual; `src/ui/date-calculator.ts` não foi modificado.

## 11. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → Deploy Pages`.

Service Worker:

- navegação network-first com timeout;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens técnicos invalidam cache sem alterar release pública.

Tokens recentes:

- `date-calculator-layout2`: autoridade visual base;
- `auth-spacing3`: ritmo móvel do cofre;
- `date-calculator-mobile-spacing3`: compactação do grupo Data inicial/Trocar/Data final;
- `date-calculator-prototype-inputs4`: token do último ciclo que alterou o cache do Service Worker;
- `76-date-calculator-prototype-inputs5`: marcador CSS da correção iOS atual; não exige novo token do Service Worker porque `date-calculator.css` já é pedido network-first/no-store.

Isto permite que o hotfix visual seja recebido por reload normal sem obrigar o utilizador a entrar no ecrã de atualização. `package.json`, manifesto de release e versão pública permanecem inalterados.

## 12. Segurança e dependências externas

- nenhum segredo deve existir no repositório público;
- CSP está ativa;
- iconografia Lucide é local/licenciada;
- ZXing é servido localmente e a página Segurança pode declarar ausência de CDN para o scanner;
- `script-src` permanece restrito a `self`; qualquer reintrodução de origem remota exige decisão técnica explícita e novos testes;
- `style-src 'unsafe-inline'` permanece dívida de hardening.

## 13. QA

A CI cobre sintaxe, TypeScript, finanças, isolamento, datas, QR, Mercado, scanner, UI, responsividade, acessibilidade, segurança e sync.

PR #165 adiciona regressões para:

- marcador `76-date-calculator-prototype-inputs5` dentro da autoridade canónica;
- moldura de data em grelha contida, com `min-width:0` e `overflow:hidden`;
- input nativo limitado à coluna central, sem borda duplicada;
- ausência de reposicionamento horizontal do indicador WebKit;
- ação Hoje numa terceira coluna com target adequado;
- foco visível no grupo por `:focus-within`;
- grupo móvel flex/coluna com gap de 8 px;
- eixo visual de Trocar e superfície central 44×44 px;
- Regra de contagem em duas colunas nos telemóveis comuns e uma coluna apenas em `<=340px`;
- manutenção de todos os vetores matemáticos civis multitimezone.

Evidência PR #165: TypeScript `35025919784` e CI `35025919606`, ambos com sucesso. Após merge: TypeScript `35025991379`, CI `35025991388` e Pages `35026044123`, todos com sucesso.

Limitação: testes estáticos não substituem Safari/WebKit real para rendering de `input[type="date"]`, top-layer, scroll, safe areas, browser chrome, partilha e impressão.

## 14. Próxima consolidação

1. validar `76-date-calculator-prototype-inputs5` no mesmo iPhone/Safari/PWA;
2. validar `76-auth-spacing3` e os restantes blocos móveis pendentes;
3. corrigir descrição factual de rede em Segurança;
4. validar fisicamente o fallback ZXing local/offline e manter a licença no bundle público;
5. endurecer CSP depois da remoção da dependência remota;
6. criar E2E WebKit/Chromium;
7. continuar redução de cascade por componente e migração TypeScript de baixo acoplamento.


## Ações diretas do registo de faturas

O controlo segmentado **Manual / Ler fatura / QR Code** tem responsabilidades separadas entre composição e captura.

- `v75-architecture.js` mantém o estado `data-v75-bill-mode` e emite `cdc:bill-mode-change`;
- `invoice-capture.js` recebe o evento e executa a ação correspondente;
- `manual`: termina qualquer sessão de scanner e foca o primeiro campo manual;
- `image`: garante que a superfície de captura existe e chama o `input[type=file]` no mesmo gesto do utilizador;
- `qr`: garante a superfície de captura e inicia o leitor de câmara;
- a leitura de imagem e câmara continua a validar apenas QR de faturação AT;
- o módulo não escreve diretamente em IndexedDB nem persiste ficheiros; apenas preenche campos compatíveis depois da leitura e revisão.

A abertura do seletor de ficheiro permanece síncrona ao gesto do utilizador para compatibilidade com Safari/iOS. A câmara exige contexto seguro e autorização do navegador.


## Pré-aquecimento do leitor QR

Quando um novo formulário de fatura é criado, `invoice-capture.js` inicia de forma assíncrona a preparação do ZXing. O objetivo é reduzir a latência do primeiro uso de **Ler fatura** e **QR Code** sem bloquear a renderização do formulário.

O pré-aquecimento é apenas uma otimização. A ação explícita continua a ser a autoridade funcional e volta a chamar `loadZxing()` se a biblioteca ainda não estiver pronta. A promessa interna é deduplicada por `zxingPromise`, evitando pedidos concorrentes para o mesmo runtime.


## Ativação tátil dos modos de fatura

Em mobile, a seleção de **Manual / Ler fatura / QR Code** não depende apenas do `click` sintetizado pelo browser. `v75-architecture.js` escuta também `touchend` em capture phase com `passive:false`, resolve o botão do modo e chama o mesmo `setBillMode()` usado por desktop.

Depois de um `touchend`, o `click` equivalente é ignorado por uma janela curta de deduplicação. Isto evita duas chamadas a `input.click()` ou duas tentativas de abrir a câmara.

O build publica revisões próprias para esta área:

- arquitetura: `76-architecture-touch2`;
- captura: `76-invoice-touch2`;
- Service Worker: `76-invoice-touch2`.

A separação mantém-se: a arquitetura seleciona o modo; `invoice-capture.js` executa ficheiro, câmara e leitura QR.


## Entrega automática de novas compilações

O ciclo PWA passa a privilegiar atualização automática de código, sem alterar dados locais.

1. `events.js` regista o Service Worker com `updateViaCache:'none'`, pede uma verificação imediata e volta a verificar enquanto a aplicação está aberta e online.
2. `sw.js` só chama `skipWaiting()` depois de `cache.addAll(PUBLIC_ASSETS)` terminar com sucesso.
3. Na ativação, caches antigos são removidos e `clients.claim()` transfere o controlo para o novo worker.
4. `events.js` escuta `controllerchange` e executa `location.reload()` uma única vez.

A atualização automática substitui código e assets públicos. IndexedDB, cofre cifrado, PIN e estado financeiro não são apagados nem reescritos por este mecanismo.

## Tabs de registo de fatura no iOS

`ensureBillTabs()` cria os três controlos e chama `bindBillTabs()`. Cada botão recebe listeners próprios de `touchend` e `click`. A seleção continua a passar por `setBillMode()`, que atualiza o estado visual e emite `cdc:bill-mode-change`; `invoice-capture.js` permanece a autoridade para ficheiro, câmara e leitura QR.


## Captura nativa de faturas no iOS

Os tabs **Ler fatura** e **QR Code** deixam de depender de uma chamada programática a `input.click()` no caminho móvel.

- **Ler fatura** contém um `input[type=file][accept="image/*"]` nativo sobre a própria superfície visual;
- **QR Code** contém `input[type=file][accept="image/*"][capture="environment"]` para dispositivos de toque;
- o `click` nativo apenas sincroniza o modo com `setBillMode(mode,{native:true})`; `invoice-capture.js` não abre um segundo picker nesse caminho;
- o evento `change` entrega o ficheiro diretamente a `scanImage(file,mode)`;
- `BarcodeDetector` é usado por feature detection quando disponível; ZXing permanece fallback;
- em desktop/fine pointer, QR Code pode continuar a iniciar o leitor ao vivo.

## Refresh automático seguro

O Service Worker pode assumir automaticamente uma nova compilação, mas `events.js` só executa `location.reload()` quando não existem diálogos críticos abertos, scanner ativo ou campos editáveis com foco. Se existir edição em curso, o reload é adiado e repetido até a página ficar segura.


## Mapa de ações dos modos de despesa

Os três controlos de registo são identificados por IDs estáveis e `data-v75-bill-action`. A resolução funcional é centralizada em `BILL_MODE_ACTIONS`:

- `expense-manual` → `manual`, sem captura nativa;
- `expense-image` → `image`, captura nativa de imagem;
- `expense-qr` → `qr`, captura nativa automática em dispositivos táteis e scanner ao vivo quando apropriado em desktop.

`activateBillModeAction()` é o único controlador visual destes três modos. `setBillMode()` grava simultaneamente `data-v75-bill-mode` e `data-v75-bill-action` no diálogo e emite `cdc:bill-mode-change` para `invoice-capture.js`. Assim, identificação visual, ação selecionada e função executada deixam de depender de inferência pelo texto do botão.


## Picker nativo sem JavaScript no gesto de abertura

No caminho mobile de **Ler fatura** e **QR Code**, o primeiro gesto pertence exclusivamente ao controlo nativo do browser. Não existe listener de `click` no `input[type=file]` que altere estado, dispare eventos internos ou execute tarefas antes de o sistema abrir Fotos/Câmara.

O fluxo é:

1. utilizador toca no input nativo sobre o tab;
2. iOS abre Fotos ou Câmara;
3. o utilizador escolhe/captura a imagem;
4. o input emite `change`;
5. `confirmNativeBillMode()` sincroniza modo/ação;
6. o listener delegado de `invoice-capture.js` processa o ficheiro;
7. `scanImage()` tenta `BarcodeDetector` e usa ZXing como fallback.

Os inputs nativos são excluídos de `keepFocusedDialogFieldVisible()` e do listener global de `focusin`, evitando cálculos de viewport enquanto o picker do sistema está a abrir. Em dispositivos touch/iOS, `prewarmZxing()` retorna sem carregar a biblioteca remota antes da seleção.


## Preenchimento automático a partir do QR AT

Depois de `scanImage()` reconhecer um QR válido, `showPreview()` chama imediatamente `applyInvoiceToForm({announce:false,focus:false})`. O utilizador não precisa de carregar num segundo botão para transferir os dados para o formulário.

`setBlankField()` escreve apenas em campos vazios e emite `input` + `change`. O mapeamento seguro é:

- `documentId` → **Descrição** (`Fatura <documento>`);
- `issuerNif` → **Fornecedor/entidade** como NIF quando o campo está vazio;
- `totalCents` → **Valor total**;
- `documentId` + ATCUD → **Referência**.

Os campos **Categoria**, **Vencimento** e **Método** não são derivados do QR. O formulário mantém os seus valores atuais e `data-invoice-review-fields` assinala os campos que exigem confirmação humana. `forms.js` continua a ser a única autoridade que valida e grava a fatura.


## Calendário mensal de gastos efetivos

O calendário financeiro usa duas dimensões distintas:

- **vencimentos**, obtidos de `billDueDateKey()` e apresentados pela data limite da fatura;
- **gastos efetivos**, obtidos de pagamentos em `paidAt` e compras de Mercado em `purchasedAt || updatedAt`.

`spendingForDate(dateKey)` devolve `paymentTotal`, `marketSpent` e `total` para um dia civil. `monthlySpendHistory(month,count)` lê diretamente pagamentos e compras datados para produzir o histórico mensal, sem criar perfis vazios nem materializar snapshots.

`renderCalendar()` apresenta resumo mensal, histórico recente, gasto diário e agenda de vencimentos. O histórico permanece derivado dos movimentos persistidos, portanto mudar para um novo mês não altera meses anteriores.

### Transição automática de mês

`syncMonthRollover()` mantém `observedLocalMonth`. Quando o mês civil muda, a aplicação só avança automaticamente se o utilizador ainda estiver a acompanhar o mês que acabou. Se estiver a consultar um mês histórico, a seleção é respeitada.

Um novo perfil mensal mantém valores financeiros neutros, mas a interface apresenta **Saldo inicial** e **Orçamento** vazios enquanto forem zero, evitando transportar visualmente valores do mês anterior.


## Disclosure dos filtros de Despesas

Em ecrãs até 820 px, `#billFiltersToggle` controla apenas a visibilidade de `#billFilterGrid`. A grelha canónica e os respetivos IDs permanecem únicos no DOM.

O estado visual é representado pela classe `bill-filters-open` em `#page-bills` e sincronizado com `aria-expanded`. `renderBills()` continua a ler os mesmos controlos e `syncBillFilterToggle()` calcula quantas opções estão fora do estado padrão, apresentando essa contagem no botão compacto.

A camada final de geometria é `v76-mobile-shell.css` (`76-mobile-shell3`). Em desktop o botão de disclosure fica oculto e a grelha mantém a apresentação permanente.


## Política de atividade em background

### Startup local-first

`events.js::enterApp()` é a autoridade canónica da abertura autenticada. Depois de o cofre local ser desbloqueado, a aplicação mostra imediatamente a rota local atual e inicia `syncStartupGate()` como promessa de background. O estado remoto nunca volta a ser requisito para mostrar dados que já foram desbloqueados localmente.

`v75-startup-guard.js` não substitui funções de runtime. A sua única responsabilidade é manter a exclusividade visual entre `#vaultScreen` e `#app`, incluindo `pageshow` em Safari/PWA.

### Sincronização

Alterações locais continuam a usar `queueRemoteSync()` com atraso curto. Para reconciliação passiva, `requestBackgroundSync()` aplica três guardas: aplicação visível, rede disponível e sync configurado. Foco, pageshow, visible e online convergem neste controlador e são deduplicados por 15 s. O fallback periódico é de 5 min.

### Atualizações da PWA

A aplicação verifica nova compilação ao entrar, regressar ao foreground, pageshow e recuperar rede. Existe ainda fallback de 15 min enquanto visível. Todos os triggers convergem em `window.__swUpdateCheck`, que não corre quando `document.hidden` ou offline. O reload continua protegido por `canReloadForNewBuild()`, portanto não interrompe formulários, scanner ou edição.

### Recomposição da camada de arquitetura

`v75-architecture.js` mantém `requestAnimationFrame` e MutationObservers específicos, mas deixa de agendar `apply()` para cliques sem relevância arquitetural. Isto reduz trabalho DOM em pesquisa, formulários, listas e outros controlos que já têm as suas próprias autoridades funcionais.


## 8. Aplicação móvel nativa

A migração nativa começa em `apps/mobile-native/` como projeto separado da PWA. Não existe WebView nem reaproveitamento da shell HTML/CSS.

Base técnica inicial:

- React Native + Expo SDK 57;
- TypeScript strict;
- `expo-sqlite` com `useSQLCipher=true`;
- chave da base de dados gerada aleatoriamente e guardada em `expo-secure-store`;
- dados financeiros continuam em cêntimos inteiros;
- datas de guarda do animal são datas civis `YYYY-MM-DD`;
- escrita de períodos usa transação exclusiva e uma tabela de dias com chave composta para impedir sobreposição;
- pagamentos do cuidador são reembolsos separados da base mensal.

Domínio inicial:

- `pet_share_months`: configuração mensal e método de cálculo;
- `pet_care_records`: períodos de guarda;
- `pet_care_days`: dias civis materializados para integridade e deteção de duplicados;
- `pet_share_payments`: reembolsos recebidos.

A PWA continua a autoridade dos módulos ainda não migrados. Não existe partilha automática de storage entre IndexedDB Web e SQLite nativo nesta fase.


### Development build nativa

O subprojeto `apps/mobile-native/` usa `expo-dev-client` para desenvolvimento em dispositivo real. A configuração de build vive em `apps/mobile-native/eas.json`.

Perfis definidos:

- `development`: development client, distribuição interna, iOS físico e Android;
- `development-simulator`: development client para simulador iOS;
- `preview`: distribuição interna para validação;
- `production`: build de produção com incremento de versão remoto.

Credenciais Apple/Google, certificados, provisioning profiles, tokens e segredos não pertencem ao repositório. A associação ao EAS deve ser feita por `eas init` com uma conta autorizada.


### Navegação dedicada da partilha do Walli

Na aplicação nativa, `Partilha` é um destino de topo independente de `Animais`.

Fluxo:

`Animais → Partilha → Entrega | Calendário | Registos | Configurações`

`Animais` contém o perfil e um resumo da partilha. `Partilha` é a autoridade visual e operacional para dias de guarda, valores, reembolsos e histórico. Os dados continuam a vir do mesmo repositório local cifrado e não são duplicados entre ecrãs.


### PWA: domínio e rota da partilha do Walli

A PWA passa a expor `petshare` como rota interna de primeiro nível no drawer completo. A navegação compacta inferior não é aumentada, para preservar os cinco destinos móveis atuais.

Estrutura no estado cifrado:

```text
petShare
├── petName
├── caregiverName
├── months[YYYY-MM]
│   ├── baseCents
│   ├── calculationMode
│   ├── dailyRateCents
│   └── updatedAt
├── records[]
│   ├── id
│   ├── startDate
│   ├── endDate
│   ├── note
│   └── timestamps
└── payments[]
    ├── id
    ├── monthKey
    ├── amountCents
    ├── paidAt
    ├── note
    └── timestamps
```

Regra proporcional:

`shareCents = roundHalfUp(baseCents × careDays ÷ daysInCivilMonth)`

Os dias são materializados logicamente a partir de intervalos civis `YYYY-MM-DD`; o cálculo mensal usa união de datas, evitando dupla contagem. A criação de um novo registo rejeita qualquer dia já coberto por outro intervalo.

Os reembolsos são eventos financeiros próprios em `petShare.payments` e não alteram retroativamente `baseCents`. A sincronização usa merge por ID para registos/reembolsos, merge por mês para configuração e tombstones para eliminações.


#### Edição e idas à rua

Cada elemento de `petShare.records[]` inclui também:

```text
walksCount: inteiro de 0 a 200
```

O valor é introduzido manualmente e representa a quantidade de idas à rua/passeios associada ao período. Não participa no cálculo financeiro da partilha, que continua a depender exclusivamente dos dias civis e da configuração mensal.

A edição conserva o mesmo `id` e `createdAt`, atualiza `updatedAt` e volta a validar sobreposição de datas, excluindo o próprio registo da comparação. Alterações a `walksCount` são tratadas como campo de negócio no mecanismo de conflitos cifrados.


#### Cálculo automático de passeios e total

A configuração mensal de `petShare.months[YYYY-MM]` inclui:

```text
walksPerDay: 1 | 2
walkRateCents: inteiro em cêntimos
```

O valor inicial de `walkRateCents` é 800 cêntimos para meses que ainda não tenham configuração explícita. O utilizador pode alterá-lo.

Para um mês:

```text
walkCount = uniqueCareDays × walksPerDay
walksCostCents = walkCount × walkRateCents
totalPayableCents = shareCents + walksCostCents
outstandingCents = max(0, totalPayableCents - outboundPaidCents)
```

A contagem usa a união de dias civis já usada pela partilha, pelo que intervalos sobrepostos continuam proibidos e não existe dupla contagem.

`petShare.payments[].direction` distingue:

- `outbound`: pagamento efetuado ao Nuno, reduz o valor por pagar;
- `inbound`: significado legado da versão anterior, quando a interface registava um valor recebido. Não reduz o novo total a pagar.

Registos antigos sem `direction` são normalizados como `inbound`, evitando reinterpretar historicamente movimentos já guardados.


#### Hierarquia visual da Partilha do Walli

A composição da rota `petshare` segue quatro níveis:

1. hero de contexto;
2. resumo mensal com Total/Estado como métricas prioritárias;
3. fluxo operacional Configuração → Registar período;
4. consulta Calendário + Histórico.

A lógica permanece em `walli-share.js`; `index.html` contém apenas a estrutura semântica e `v76-product-pages.css` é a autoridade visual. O redesign não cria uma segunda fonte de verdade nem replica cálculos no DOM.

Responsividade:

- desktop: resumo em quatro colunas, formulários lado a lado, calendário/histórico lado a lado;
- <=900 px: formulários e área inferior passam a uma coluna;
- <=620 px: campos e ações passam a uma coluna, inputs >=16 px;
- <=380 px: resumo passa a uma única coluna.

Acessibilidade mantém forced-colors, prefers-reduced-motion e targets tácteis mínimos de 44 px.


#### Pagamentos parciais da Partilha do Walli

A divisão é derivada apenas de `outstandingCents` e não cria uma nova entidade de financiamento.

Para `N` partes, com `N ∈ {2,3,4}`:

```text
quotient = floor(outstandingCents / N)
remainder = outstandingCents mod N

part[i] = quotient + 1, enquanto i < remainder
part[i] = quotient, nos restantes casos
```

Invariantes:

- todas as partes são inteiros em cêntimos;
- a soma das partes é exatamente `outstandingCents`;
- o pagamento registado usa `direction = outbound`;
- o valor restante é sempre `max(0, outstandingCents - paidNowCents)`;
- o sistema não guarda um plano de crédito, datas futuras ou juros;
- novos pagamentos continuam a usar `petShare.payments[]`, pelo que backup, cifra e sincronização existentes permanecem a autoridade.


#### Plano datado, ponte para Despesas e reversões

A estrutura `petShare` passa a incluir também `plans[]`.

Cada plano contém:

```text
id
monthKey
totalCents
parts
installments[]
  id
  amountCents
  dueDate
  paidAt?
  paymentId?
cancelledAt?
createdAt
updatedAt
```

Existe no máximo um plano ativo por mês. A soma das parcelas usa a mesma divisão inteira já existente e reconcilia exatamente com `outstandingCents`.

Um plano é considerado coerente quando:

`sum(unpaid installments.amountCents) === outstandingCents`

Se o valor da partilha mudar por alteração de dias, passeios ou preços, o plano é mostrado como desatualizado e não permite novas liquidações até ser cancelado e recriado.

### Ponte para Despesas

Cada pagamento `petShare.payments[]` com `direction = outbound` cria, no mesmo commit lógico:

- uma fatura em `bills[]`, categoria `Animais`;
- um pagamento em `payments[]`;
- ligação de retorno por `linkedBillId` e `linkedPaymentId`.

Os IDs são derivados do ID do pagamento Walli para tornar a operação idempotente e impedir dupla contabilização.

A data do movimento em Despesas é a data real do pagamento ao Nuno. Assim, o `cashSpent` global passa a refletir apenas dinheiro efetivamente pago, não o valor simplesmente planeado.

### Correções

Uma correção não elimina o pagamento Walli original. É acrescentado um registo:

`direction = outbound-reversal`

com `reversalOfId`. O cálculo de `paidCents` considera apenas pagamentos outbound que não tenham reversão. A Despesa espelhada é removida com tombstones e o plano volta a considerar a respetiva parcela como não paga.

### Reutilização mensal

`Usar mês anterior` copia apenas:

- base mensal;
- modo de cálculo;
- valor diário;
- passeios por dia;
- preço por passeio.

Dias de guarda, pagamentos, planos e histórico nunca são copiados.


#### Autoridade única para iconografia funcional

`ui-icons.js` é a autoridade para ícones funcionais da PWA. A aplicação usa o snapshot Lucide local já incluído no repositório e não depende de icon fonts ou CDN.

Regras:

- componentes dinâmicos usam `icon(nome, tamanho)`;
- elementos estáticos são normalizados pelo hydrator de `ui-icons.js`;
- módulos de arquitetura devem preferir `CDCIcons.markup`;
- SVG legado direto não pode coexistir com um ícone canónico na mesma ação;
- tamanho e stroke são definidos pelo renderer canónico;
- ícones são decorativos quando o texto/aria-label já comunica a ação;
- a marca `icon.svg` permanece separada da iconografia funcional.

O MutationObserver existente reexecuta a hidratação quando componentes dinâmicos são inseridos, mantendo consistência após rerenders.


#### Ecrã de desbloqueio do cofre

O desbloqueio mantém a mesma arquitetura funcional:

`index.html → events.js → unlockVault() → IndexedDB cifrado → enterApp()`

O redesign é estritamente visual e de composição. `#vaultUnlock`, `#unlockPassphrase`, `#vaultPinPad`, `#unlockVaultBtn` e os controlos de recuperação conservam os IDs existentes.

`events.js` aplica a classe `vault-unlock-active` ao `#vaultScreen` quando existe um cofre local. Isto permite que o protótipo visual seja aplicado apenas ao desbloqueio, sem afetar o fluxo de criação inicial do cofre.

A iconografia do PIN continua centralizada em `ui-icons.js`: Lock, Backspace, Key, Eye/Edit e ArrowRight usam o snapshot Lucide local. O CSS principal do protótipo vive em `v75-usability.css`, revisão `76-pin-prototype1`.
