# Arquitetura — Conta de Casa

Atualizado: 25 de setembro de 2026  
Versão: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA

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
- keypad padrão em mobile mantém 56 px com gaps 30/16 px;
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
- o nome do backup cifrado usa `currentLocalDateKey()`;
- timestamps de auditoria, pagamentos, sync e `updatedAt` continuam ISO UTC, porque representam instantes absolutos.

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

## 6. Planeamento mobile

`76-planning-budget-card2` + `76-planning-ring-shape1` + `76-planning-commitment1`:

- `#monthPicker` continua a autoridade do mês;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- orçamento ausente permanece `Por definir`;
- o anel neutraliza altura legada e mantém proporção 1:1;
- `dashboardNumbers()` / `monthNumbers()` continuam a fonte financeira do resumo;
- **Gasto este mês** = `paymentTotal + marketSpent`;
- **Comprometido** = `outstanding`, já calculado pelo domínio a partir do remanescente das faturas ativas do mês;
- **Disponível real** = `budgetCents - budgetUsed - outstanding`;
- pagamentos parciais não são duplicados: a parte paga entra em gasto e apenas o remanescente fica comprometido;
- a percentagem do anel continua baseada exclusivamente em gasto efetivo;
- disponível real pode ser negativo para representar sobrecompromisso;
- a apresentação não cria uma segunda fonte de verdade e não altera persistência, estado ou regras de pagamento.

## 6.1 Rede e scanner QR

A página Segurança deve refletir as dependências reais da aplicação. Enquanto `invoice-capture.js` e `market-barcode.js` puderem carregar ZXing Browser 0.2.0 de `unpkg.com`, não é permitido afirmar que a aplicação funciona sem CDN.

Contrato atual:

- `script-src` autoriza `self` e `https://unpkg.com`;
- ZXing é fixado em `@zxing/browser@0.2.0`;
- o carregamento usa `referrerPolicy='no-referrer'` e não envia credenciais;
- o scanner não recebe o estado financeiro cifrado;
- a remoção de `unpkg.com` da CSP só pode ocorrer depois de ZXing estar empacotado localmente.

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
- ZXing ainda é carregado remotamente, portanto a página Segurança não pode afirmar ausência total de CDN;
- a localização do ZXing deve ocorrer antes de remover a origem remota da CSP;
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
4. empacotar ZXing localmente com licença preservada;
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
