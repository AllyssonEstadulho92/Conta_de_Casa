# Estado do Projeto — Conta de Casa

Atualizado: 9 de outubro de 2026
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main` antes deste bloco: `3999f74bf25396484ce2f8550c9c3d7c60bb313c` (`security: empacotar ZXing localmente e remover CDN`)
Branch da melhoria de autenticação: `fix/v76-auth-viewport-fit1` (proposta); base funcional: `main`
Histórico anterior: bloco `76-dialog-controls1` preservado abaixo.

## Ecrã PIN compacto no Safari: 76-auth-viewport-fit1 (proposta, 09/10/2026)

A regra visual final `76-pin-prototype1` aumentava de novo a dimensão do teclado e os espaços já compactados em `76-auth-spacing3`. A vista de desbloqueio podia ultrapassar a altura útil do iPhone.

Correção proposta na mesma autoridade visual `v75-usability.css`: teclado de 52 px em iPhone, 48 px em ecrãs estreitos/baixos, espaçamentos reduzidos, campo de 16 px para evitar zoom iOS, `100svh`, safe areas e scroll caso o conteúdo não caiba (texto ampliado, rotação ou teclado virtual). Recuperação, importação e botão Entrar permanecem disponíveis. Não modifica `core.js`, PIN, PBKDF2, AES-GCM, IndexedDB, estado financeiro nem sincronização.

Entrega: alterar `USABILITY_REV` no build Pages para invalidar a versão CSS anterior e atualizar regressões. Pendente: CI e validação física Safari/PWA em 320/360/390/430 px, alturas curtas, dark mode e teclado virtual.

## Controlos Voltar e Fechar do diálogo: 76-dialog-controls1

A captura física enviada em 30 de setembro mostrou, em **Detalhes da fatura**, a seta de voltar e o X desenhados sobre o mesmo botão no canto esquerdo. A causa foi confirmada na cascade: `v75-architecture.css` transformava `.dialog-close` visualmente numa seta através de `::before`, enquanto `ui-icons.js` continuava a inserir o ícone Lucide `close` no mesmo elemento.

Correção:

- `#formDialog` passa a ter `data-dialog-back` e `data-close-dialog` como controlos independentes;
- **Voltar** aparece no modo `detail`, ocupa a posição esquerda e regressa pelo caminho canónico `closeDialog()`, restaurando o foco no elemento que abriu o detalhe;
- **Fechar** mantém o X Lucide e passa a ocupar a posição direita no cabeçalho móvel;
- a camada de despesas deixa de substituir o X por uma máscara de seta;
- a iconografia continua local, sem rede adicional;
- `SERVICE_WORKER_REV` e a chave de cache recebem `76-dialog-controls1` para entrega automática em Safari/PWA;
- testes de navegação, acessibilidade, iconografia, arquitetura móvel e distribuição passam a proteger a separação.

Preservado: `STATE_VERSION`, IndexedDB, PIN/cofre, PBKDF2/AES-GCM, faturas, pagamentos, cálculos, Mercado, sincronização e scanner.

Pendente: validação visual final no mesmo iPhone/Safari/PWA após publicação, confirmando seta isolada à esquerda, título centrado e X isolado à direita.

## Segurança e offline do scanner: 76-local-zxing1

A dependência remota do leitor ZXing foi retirada do runtime público. A aplicação passa a empacotar a versão fixa `@zxing/browser@0.2.0` durante o build e a publicar o ficheiro resultante como asset da própria aplicação.

Alterações:

- `package.json` fixa `@zxing/browser` em `0.2.0` e `@zxing/library` em `0.22.0`;
- `scripts/build-typescript-runtime.cjs` valida a versão instalada, copia o UMD para `.generated/zxing-browser.min.js` e preserva a licença em `.generated/ZXING_BROWSER_LICENSE.txt`;
- `scripts/prepare-pages.cjs` publica os dois artefactos no `dist` e aponta `barcode-reader-src` para o asset local;
- a CSP deixa de autorizar `https://unpkg.com` em `script-src`, ficando o scanner limitado a `self`;
- `invoice-capture.js` e `market-barcode.js` rejeitam origens externas e partilham o mesmo carregamento local quando possível;
- o Service Worker inclui ZXing e a respetiva licença na allowlist/precache, permitindo o fallback ZXing também sem rede depois da instalação;
- a página Segurança deixa de descrever uma dependência de CDN que já não existe;
- regressões de build, segurança, captura de faturas, scanner de Mercado e atualização PWA passam a proteger este contrato.

Preservado: regras financeiras, `STATE_VERSION`, IndexedDB, PIN/cofre, cifra, dados de pagamentos, Mercado e sincronização.

Pendente apenas validação física do scanner em iPhone/Safari/PWA, com rede e em modo offline após instalação.

## Correção completa de orçamento e fluxo de caixa: 76-budget-cash-separation3

A revisão de `76-budget-bill-month2` confirmou que a regra de orçamento estava correta, mas duas superfícies continuavam a misturar semânticas: o Calendário mostrava `budgetUsed` como **Gasto no mês** apesar de os dias e o histórico usarem a data real do pagamento, e os Relatórios combinavam total de caixa com categorias alocadas ao mês da fatura.

A separação passa a ser explícita:

- `cashSpent = paymentTotal + marketSpent`: dinheiro efetivamente movimentado no mês, pela data `paidAt`, usado no Calendário e nos Relatórios;
- `budgetUsed = budgetPaymentTotal + marketSpent`: consumo do orçamento do mês da fatura, usado no Início e no Planeamento;
- `categoryTotals()` mantém a distribuição por orçamento;
- `cashCategoryTotals()` fornece a distribuição dos Relatórios por data real do pagamento;
- o Planeamento passa a chamar a métrica **Orçamento utilizado**, evitando apresentar alocação orçamental como gasto de caixa;
- os diagnósticos verificam separadamente total de caixa, total orçamental e respetivas categorias;
- `render.js`, `finance.js`, arquitetura e Service Worker recebem a revisão `76-budget-cash-separation3`.

Não existe migração de dados, alteração de `STATE_VERSION`, IndexedDB, cifra, PIN/cofre, pagamentos gravados ou sincronização.

## Auditoria transversal rápida — 76-full-audit-fixes1

Auditoria executada sobre o estado publicado após `ae17e96`, abrangendo domínio financeiro, navegação, Planeamento/Calendário, faturas/pagamentos, Mercado, PWA/cache, Segurança e contratos de regressão.

Erros concretos encontrados e corrigidos:

- **Prioridade de pagamentos:** a lista do Início excluía faturas já vencidas porque exigia `days >= 0`. Faturas em atraso do mês podiam aparecer no alerta, mas desaparecer da fila que orienta o que pagar primeiro. A fila passa a incluir todo o saldo pendente com data válida, ordenar por vencimento e rotular segundo o estado real: **Pagar agora**, **Vence hoje**, **Prioridade**, **A seguir**, **Depois** e **Mais tarde**.
- **Mercado / quotas diárias:** o catálogo visual e a biblioteca Pingo Doce usavam `toISOString().slice(0,10)`, portanto os limites diários podiam mudar segundo UTC em vez da data local do dispositivo. Ambos passam a usar componentes civis locais.
- **Preferência de supermercado:** `v64-runtime.js` tentava guardar a loja preferida em `cdc.market.scan.retailer.v1`, mas a política de segurança bloqueia qualquer escrita em Web Storage que não use uma chave pública permitida. O erro era silenciosamente ignorado e a preferência não persistia. A nova chave é `cdc_public_store_choice_v1`, mantendo leitura da chave antiga para migração.
- **Backup:** o nome do ficheiro de backup também usava a data UTC e podia ficar com o dia anterior/próximo em determinados fusos. Passa a usar `currentLocalDateKey()`.
- **Distribuição PWA:** `render.js` e o Service Worker recebem a revisão `76-full-audit-fixes1` para impedir reutilização do runtime anterior.

Não foram alterados `STATE_VERSION`, IndexedDB, cifra, PIN/cofre, regras de pagamentos, fórmulas em cêntimos, sync ou identidade `marketId|pid`.

## Invariantes

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro local cifrado;
- sync opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` mantém identidade de origem verificável;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- alterações visuais não podem alterar domínio, persistência ou regras de cálculo.

## Estado publicado

Blocos atuais relevantes:

- PR #147 / `76-bills-mobile-alignment2`: filtros de Despesas em grelha móvel contida;
- PR #149 / `76-date-calculator1`: Calculadora de datas local em TypeScript strict;
- PR #152 / `76-auth-prototype-final1`: composição móvel consolidada do cofre;
- PR #154 / `76-auth-exclusive-state1`: criação e desbloqueio do cofre são estados visualmente exclusivos;
- PR #156 / `76-date-calculator-layout2`: autoridade visual canónica da Calculadora de datas;
- PR #158 / `76-auth-spacing3`: ritmo vertical do PIN ajustado para Safari/iOS;
- PR #161 / `76-date-calculator-mobile-spacing3`: Data inicial, Trocar e Data final formam um grupo móvel compacto;
- PR #163 / `76-date-calculator-prototype-inputs4`: primeira aproximação dos campos de data ao protótipo;
- PR #165 / `76-date-calculator-prototype-inputs5`: corrige o overflow/clipping real observado no Safari/iOS sem alterar a lógica da calculadora.

## Calculadora de datas — estado atual

Autoridade funcional: `src/ui/date-calculator.ts` / `76-date-calculator1`.  
Autoridade visual: `date-calculator.css` / `76-date-calculator-layout2`, com refinamentos internos `76-date-calculator-mobile-spacing3` e `76-date-calculator-prototype-inputs5`.

A captura física posterior ao PR #163 confirmou que reposicionar `::-webkit-calendar-picker-indicator` com posicionamento absoluto podia aumentar a largura intrínseca do `input[type="date"]` no WebKit e deslocar/cortar toda a secção. O PR #165 substitui essa abordagem por uma composição contida:

- `.cdc-datecalc-input-action` é a moldura única do campo e usa grelha `48px minmax(0,1fr) auto`;
- a affordance visual de calendário fica na primeira coluna e não cria dependência de rede nem um segundo date picker;
- o `input[type="date"]` nativo permanece na coluna central, com `min-width:0`, sem borda própria duplicada;
- o indicador WebKit nativo deixa de ser deslocado horizontalmente; fica colapsado visualmente para não interferir na geometria;
- **Hoje** passa a ocupar uma coluna própria à direita, mantendo target >=44 px;
- o foco visível pertence à moldura através de `:focus-within`, evitando outlines duplicados;
- em `<=560px`, Data inicial → Trocar → Data final continuam num grupo vertical com gap de 8 px;
- **Trocar** mantém o eixo horizontal e superfície central 44×44 px;
- **Regra de contagem** mantém duas opções lado a lado em telemóveis comuns e só empilha em `<=340px`;
- inputs continuam com texto de 16 px, `100svh`, safe areas, `forced-colors`, `prefers-reduced-motion` e impressão/PDF;
- o Service Worker não recebeu novo token neste hotfix: `date-calculator.css` já é um asset público servido network-first/no-store, por isso a correção pode chegar num reload normal sem obrigar a passar pelo ecrã de atualização.

A matemática civil, inclusão/exclusão dos limites, soma/subtração, dias úteis, TypeScript funcional e persistência permanecem inalterados.

Evidência PR #165:

- head funcional `045d72e5af30b8a4f22ee6d3630ecb898e1f8a3e`;
- TypeScript Foundation PR `35025919784`: sucesso;
- CI PR `35025919606`: sucesso integral;
- merge `a80c0f9bfdbd9135dea69368ca2bde56196fab5d`;
- TypeScript Foundation `main` `35025991379`: sucesso;
- CI `main` `35025991388`: sucesso integral;
- Deploy Pages `35026044123`: sucesso.

Pendente: confirmação física no mesmo iPhone/Safari/PWA de que o campo permanece totalmente contido e a composição corresponde ao protótipo sem clipping lateral.

## Auth / iOS — PR #158

`v75-usability.css` continua a única autoridade visual do cofre.

- keypad móvel mantém 56 px com `column-gap:30px` e `row-gap:16px`;
- espaço entre marca e conteúdo: 16 px;
- campo PIN e keypad usam 18 px de separação dos blocos anteriores;
- CTA **Entrar** mantém 52 px;
- `#vaultMessage:empty` deixa de reservar altura;
- `100svh`, safe areas, input >=16 px, pinch-to-zoom, dark mode, `forced-colors` e `prefers-reduced-motion` permanecem ativos;
- cache PWA usa o token técnico `auth-spacing3`.

Preservado: PIN, palavra-passe, `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync e dados financeiros.

Pendente: confirmação física no mesmo iPhone/Safari e PWA instalada.

## Despesas

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` + `76-bills-mobile-alignment2` permanecem integrados. Pesquisa, filtros e IDs funcionais são preservados; a apresentação móvel evita faixa horizontal e empilha em ecrãs estreitos.

Pendente: validação física final no mesmo iPhone/PWA.

## Início: correção de entrega da nova interface

Revisão técnica: `76-dashboard-priority-delivery1`.

Após o merge de `76-dashboard-priority1`, o artefacto publicado no GitHub Pages foi verificado e continha corretamente o novo markup, `render.js` e `v76-product-pages.css`. A captura no iPhone, porém, continuava a mostrar o texto antigo **Contas que exigem atenção.**, prova de que o cliente ainda estava a executar a shell anterior.

Foi identificado um erro na estratégia de atualização: a alteração do Dashboard não modificou o conteúdo de `sw.js` nem o `SERVICE_WORKER_REV`. Como o mecanismo automático depende de uma nova versão do Service Worker para assumir controlo e recarregar a página com segurança, uma PWA/Safari já aberta podia continuar no documento anterior apesar de o Pages já ter a compilação correta.

Correção:

- o nome do cache do Service Worker recebe `dashboard-priority-delivery1`;
- `SERVICE_WORKER_REV` passa para `76-dashboard-priority-delivery1`;
- uma instalação já aberta deteta a alteração através de `registration.update()`, ativa o novo worker e entra no fluxo existente de `controllerchange`/reload seguro;
- o cache antigo é removido na ativação e os assets públicos são recarregados;
- testes de atualização, Safari/startup, arquitetura e páginas de produto passam a exigir esta revisão.

A correção não altera dados financeiros, IndexedDB, PIN/cofre, pagamentos, Mercado, sync ou fórmulas.

## Início: prioridade dos próximos pagamentos

Revisão técnica: `76-dashboard-priority1`.

O bloco **Próximos vencimentos** passa a explicitar a ordem de pagamento sem criar uma nova regra financeira:

- continua a selecionar até seis faturas ativas com valor em falta e vencimento futuro no mês;
- continua a ordenar pelo comparador canónico `compareBillsByDue()`;
- cada linha mostra posição ordinal, orientação (**Pagar**, **A seguir**, **Depois**, **Mais tarde**), identidade local por inicial, descrição, data/categoria, valor em falta e contagem até ao vencimento;
- cores e faixa lateral representam apenas a posição visual na fila, não uma classificação de risco persistida;
- tocar numa linha continua a abrir a fatura real através de `data-bill-id`;
- o cabeçalho indica explicitamente **Ordenado por prioridade de pagamento** e mantém **Ver faturas** como navegação canónica;
- o cartão de Orçamento do Início foi aproximado ao protótipo com valor orçado, percentagem utilizada, valor consumido e barra acessível;
- `render.js` e `v76-product-pages.css` recebem o token `76-dashboard-priority1` no build para evitar reutilização visual antiga.

Não existem logos remotos nem novas dependências. O selo de identidade usa apenas uma inicial local derivada dos dados já existentes da fatura.

Pendente: validação física em iPhone/Safari/PWA, sobretudo largura de 390 px, nomes longos, seis vencimentos e dark mode.

## Planeamento e Calendário: contexto mensal sincronizado

Revisão técnica: `76-month-context-sync1`.

Foi corrigida uma divergência de atualização entre o mês selecionado e a camada visual de Planeamento. O seletor global, o histórico do Calendário e as setas do Planeamento passam a convergir no mesmo contexto mensal:

- `selectMonthContext()` é a autoridade para alterar `selectedMonth` no runtime de eventos;
- a mudança atualiza o `monthPicker`, garante o perfil do mês e volta a renderizar a página ativa;
- é emitido `cdc:month-change` quando o mês muda;
- `v75-architecture.js` escuta esse evento e recompõe imediatamente o resumo visual do Planeamento;
- o Calendário filtra explicitamente os vencimentos pelo mesmo `selectedMonth`;
- mudança automática de mês também usa a mesma função, evitando caminhos diferentes.

Preservado: os valores continuam separados por mês, sem copiar orçamento, saldo ou rendimentos entre meses.

## Auditoria funcional: orçamento e pagamentos

Revisão técnica: `76-budget-bill-month2`.

A auditoria confirmou uma divergência real entre o estado **Pago** de uma fatura e o cartão **Orçamento**. Uma fatura de outubro paga antecipadamente em setembro ficava **Paga**, mas o orçamento de outubro permanecia em 0,00 €, porque `budgetUsed` usava apenas a data real do pagamento.

Correção:

- `paymentTotal` continua a representar fluxo de caixa real pelo mês de `paidAt`;
- `budgetPaymentTotal` passa a somar pagamentos associados às faturas do mês selecionado;
- `budgetUsed = budgetPaymentTotal + marketSpent`;
- Planeamento e Orçamento usam `budgetUsed`;
- categorias do orçamento usam a mesma alocação por mês da fatura;
- calendário e relatórios de movimentos reais continuam a usar `paidAt`;
- `finance.js`, arquitetura e Service Worker recebem revisão própria para impedir runtime antigo no iPhone/PWA.

## Planeamento

`76-planning-budget-card2` + `76-planning-ring-shape1` permanecem integrados. A revisão `76-planning-commitment1` acrescenta uma hierarquia financeira sem alterar a origem dos dados:

- **Orçamento utilizado** usa `budgetUsed`, isto é, pagamentos alocados ao mês da respetiva fatura mais compras de Mercado concluídas no mês;
- **Comprometido** usa `monthNumbers().outstanding`, isto é, o valor remanescente das faturas ativas do mês, incluindo pendentes, vencidas e parcialmente pagas;
- **Orçamento** continua a vir de `profile.budgetCents`;
- **Disponível real** = orçamento menos `budgetUsed` menos comprometido;
- o valor disponível não é limitado artificialmente a zero, para que um mês sobrecomprometido seja visível;
- a percentagem do anel representa `budgetUsed` sobre o orçamento, sem transformar o remanescente de faturas pendentes em valor já utilizado;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- não existe alteração de `STATE_VERSION`, IndexedDB, pagamentos, Mercado, sync ou cifragem.

A chave de recomposição do resumo inclui agora o valor comprometido, evitando que a área fique desatualizada quando uma fatura pendente é criada, editada, paga parcialmente ou eliminada.

Pendente: validação física no mesmo iPhone/PWA, incluindo orçamento definido, ausência de orçamento, valor comprometido e cenário de disponível real negativo.

## Segurança — descrição factual da rede

Revisão técnica: `76-security-network-copy1`.

Esta revisão histórica corrigiu a descrição da rede enquanto ZXing ainda era remoto. Foi posteriormente substituída por `76-local-zxing1`, que empacota ZXing localmente, retira `unpkg.com` da CSP e mantém o scanner dentro da própria origem.

## Segurança — dívida aberta

- [resolvido em `76-local-zxing1`] descrição da rede alinhada com o scanner local;
- [resolvido em `76-local-zxing1`] ZXing empacotado com licença preservada;
- [resolvido em `76-local-zxing1`] `unpkg.com` removido de `script-src`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- criar E2E WebKit/Chromium para os fluxos críticos.

## Próximo passo

1. validar `76-dashboard-priority1` no iPhone/Safari/PWA com seis faturas, nomes longos e largura real do dispositivo;
2. validar `76-date-calculator-prototype-inputs5` e `76-auth-spacing3` nos mesmos ambientes;
3. corrigir a descrição factual de rede em Segurança;
4. concluir validação física do ZXing local/offline e continuar o endurecimento de CSP sobre estilos inline;
5. continuar a consolidação por componente e a migração TypeScript sem alterar invariantes.


## Registo de faturas — correção de interação 24/09/2026

Revisão técnica: `76-expense-mode-action1`.

- **Manual** volta diretamente ao fluxo de introdução e coloca o foco no primeiro campo do registo;
- **Ler fatura** abre imediatamente o seletor local de imagem a partir do toque no modo;
- **QR Code** inicia imediatamente o fluxo da câmara a partir do toque no modo;
- `v75-architecture.js` continua apenas a selecionar o modo e a emitir `cdc:bill-mode-change`;
- `invoice-capture.js` mantém a autoridade funcional sobre ficheiro, câmara, scanner e preenchimento assistido;
- leitura por imagem continua limitada ao QR AT existente na fotografia, sem OCR integral da fatura;
- imagens e fotogramas não são persistidos nem enviados pelo módulo de captura;
- o cache do Service Worker foi invalidado com `invoice-mode-action1` para impedir reutilização do runtime anterior.

Pendente: validação física em iPhone/Safari/PWA das permissões da câmara, cancelamento do seletor de imagem e retorno ao modo Manual.


## Performance do leitor de faturas — 24/09/2026

Revisão técnica: `76-invoice-capture-warmup1`.

Foi confirmado que a publicação anterior já estava concluída no GitHub Pages. Na altura, a latência do primeiro uso podia ocorrer porque ZXing ainda era carregado remotamente; `76-local-zxing1` elimina essa dependência de rede.

Para reduzir a espera sem alterar o fluxo funcional:

- o leitor ZXing passa a ser preparado em background assim que o formulário de nova fatura existe;
- o carregamento é assíncrono e não bloqueia a abertura do formulário;
- falha de pré-aquecimento não impede o utilizador de continuar, porque o fluxo normal mantém a tentativa ao usar **Ler fatura** ou **QR Code**;
- nenhum cálculo, dado financeiro, cofre, IndexedDB ou sincronização é alterado;
- o Service Worker recebe `invoice-capture-warmup1` para distribuir a revisão.

Dívida técnica posteriormente resolvida em `76-local-zxing1`: ZXing passa a ser local e `unpkg.com` sai da CSP.


## Despesas — regressão física dos modos de registo (24/09/2026)

A validação física no iPhone/Safari após o deploy do commit `1c0adc1` confirmou que **Manual / Ler fatura / QR Code** continuavam visualmente presentes, mas o toque em **Ler fatura** e **QR Code** não produzia ação observável. O deploy estava concluído, portanto o problema deixou de ser tratado como atraso de publicação.

Correção `76-expense-ios-tab-touch2`:

- adiciona ativação explícita por `touchend` em Safari/iOS;
- mantém `click` e teclado para desktop e acessibilidade;
- deduplica o `click` sintetizado depois do toque para evitar abrir ficheiro/câmara duas vezes;
- altera os tokens de cache de `v75-architecture.js`, `invoice-capture.js` e do Service Worker, para impedir reutilização do runtime anterior;
- não altera domínio financeiro, IndexedDB, cofre, Mercado ou sincronização.

Pendente: confirmação física no mesmo iPhone de que **Ler fatura** abre o seletor e **QR Code** inicia a câmara no primeiro toque.


## Despesas — listeners diretos e atualização automática (24/09/2026)

A nova captura física no iPhone mostrou novamente **Manual / Ler fatura / QR Code** visíveis, mas sem reação observável ao toque. O deploy anterior estava concluído. Não é possível confirmar apenas pela captura qual build estava efetivamente a controlar a página, e a política anterior permitia que um Service Worker novo ficasse em espera até ação explícita do utilizador.

Revisões técnicas: `76-expense-ios-tab-direct3` e `auto-refresh2`.

- os três tabs de registo recebem listeners diretamente nos próprios botões, em vez de dependerem do listener global do `document`;
- `touchend` não é cancelado, preservando o gesto do utilizador para abertura do seletor de ficheiros/câmara;
- o click sintetizado continua deduplicado;
- um Service Worker novo chama `skipWaiting()` só depois de concluir o cache dos assets públicos;
- ao assumir o controlo, `controllerchange` recarrega a página automaticamente;
- enquanto a aplicação está aberta e online, o runtime verifica atualizações a cada 30 segundos;
- cofre, PIN, IndexedDB, cálculos, Mercado e sincronização não são alterados.

Validação pendente: confirmar no mesmo iPhone, após o novo deploy automático, que **Ler fatura** abre o seletor e **QR Code** abre a câmara no primeiro toque.


## Despesas — captura nativa e refresh seguro (24/09/2026)

A validação física no mesmo iPhone confirmou que **Ler fatura** e **QR Code** continuavam sem concluir a ação e que a página podia aparentar bloqueio. A captura não permite atribuir uma única causa com certeza. Dois pontos foram eliminados da cadeia crítica: abertura programática de ficheiro/câmara e reload automático durante um formulário aberto.

Revisões: `76-expense-native-input4` e `safe-refresh3`.

- **Ler fatura** passa a usar um `input[type=file]` nativo integrado no próprio tab;
- **QR Code** passa a usar `input[type=file][capture=environment]` em dispositivos táteis, abrindo a câmara nativa sem depender de `getUserMedia` para a primeira ação;
- desktop mantém o leitor QR ao vivo quando existe apontador fino;
- leitura de fotografia tenta `BarcodeDetector` quando disponível e usa ZXing como fallback;
- o modo nativo não executa um segundo `input.click()` programático;
- atualização automática continua ativa, mas um novo build não recarrega a página enquanto existir formulário/modal ativo ou campo em edição;
- ao fechar o registo, a atualização pendente recarrega automaticamente a página;
- dados financeiros, cofre/PIN e IndexedDB não são alterados.

Pendente: validação física no mesmo iPhone após publicação desta revisão.


## Despesas — identificação explícita dos três modos (24/09/2026)

Revisão técnica: `76-expense-action-map5`.

Foi revisto o código real dos três controlos. Antes desta revisão existiam modos funcionais e inputs nativos, mas a identificação da ação estava distribuída entre `data-v75-bill-mode`, labels e inputs. Agora cada opção tem identidade e ação explícitas:

- **Manual**: `#expenseModeManual` → `data-v75-bill-action="expense-manual"` → modo `manual`;
- **Ler fatura**: `#expenseModeImage` → `data-v75-bill-action="expense-image"` → input nativo `#expenseModeImageInput`;
- **QR Code**: `#expenseModeQr` → `data-v75-bill-action="expense-qr"` → input nativo `#expenseModeQrInput` com `capture="environment"` em mobile.

Um único mapa `BILL_MODE_ACTIONS` resolve controlo → ação → modo → caminho nativo. O diálogo expõe `data-v75-bill-action` com a ação selecionada, facilitando diagnóstico e testes. Nenhuma regra financeira ou persistência foi alterada.


## Despesas — desbloqueio do seletor nativo iOS (24/09/2026)

Revisão técnica: `76-expense-picker-unblock6`.

A auditoria do fluxo de faturas encontrou três interferências no mesmo gesto que abre Fotos/Câmara no Safari: listener JavaScript no controlo nativo, associação `for` redundante num `label` que já contém o próprio input e gestão de `focusin/visualViewport` aplicada aos inputs invisíveis. O ZXing também era pré-carregado em mobile antes de existir uma imagem para processar.

Correção aplicada:

- **Ler fatura** e **QR Code** deixam de executar JavaScript no `click` que abre o picker nativo;
- a seleção do modo nativo só é confirmada no evento `change`, depois de o iOS devolver um ficheiro;
- removidos os atributos `for` redundantes dos dois labels;
- inputs `data-v75-native-invoice` são excluídos da gestão de foco/viewport;
- o pré-aquecimento do ZXing é desativado em iOS/touch e mantido apenas onde não interfere com o picker;
- em desktop, QR continua a poder usar o scanner ao vivo;
- revisões públicas: arquitetura `76-architecture-unblock6`, captura `76-invoice-unblock6`, Service Worker `76-safe-refresh4`.

Pendente apenas validação física no mesmo iPhone depois do deploy. Dados financeiros, cofre, IndexedDB e regras de negócio não foram alterados.


## Faturas — preenchimento automático após leitura QR (24/09/2026)

Revisão técnica: `76-invoice-autofill7`.

A análise do formulário confirmou que os campos obrigatórios reais são **Descrição**, **Categoria**, **Valor total** e **Vencimento**. Categoria e vencimento já nascem com valores do formulário; o QR da AT fornece de forma fiável o identificador do documento, NIF do emitente, data do documento e total, mas não fornece o nome comercial do fornecedor, categoria, método de pagamento ou data limite de pagamento.

Alteração aplicada:

- após um QR AT válido, a aplicação preenche automaticamente **Descrição**, **Valor total**, **Fornecedor/NIF** e **Referência**, sem exigir o segundo toque em “Preencher campos”;
- campos já preenchidos manualmente não são substituídos;
- eventos `input` e `change` são emitidos nos campos alterados para manter validação/UI sincronizadas;
- o formulário verifica se **Descrição**, **Categoria**, **Valor total** e **Vencimento** ficaram preenchidos;
- **Categoria**, **Vencimento**, **Método** e o nome do fornecedor permanecem explicitamente marcados para revisão, porque não podem ser obtidos de forma fiável a partir do QR AT;
- o botão de revisão passa a “Reaplicar dados”, como ação secundária opcional;
- nova revisão pública do runtime de captura: `76-invoice-autofill7`.

Não foi inventada uma data de vencimento nem uma categoria a partir da data do documento. Dados financeiros e persistência continuam a ser gravados apenas pelo submit canónico de `forms.js`.


## Calendário financeiro mensal — gastos efetivos e transição de mês (24/09/2026)

Revisão técnica: `76-monthly-spend-calendar1`.

O calendário passa a mostrar não apenas vencimentos, mas também o que foi efetivamente gasto em cada dia e em cada mês.

- **Gasto no mês** = pagamentos de faturas + compras de Mercado concluídas no mês selecionado;
- cada dia do calendário pode mostrar o total efetivamente gasto nesse dia, separado dos vencimentos;
- o topo do calendário apresenta **Gasto no mês**, **Faturas pagas**, **Mercado** e **Por pagar**;
- os últimos seis meses ficam disponíveis no histórico com o total gasto em cada mês;
- os valores históricos não são copiados nem apagados: continuam derivados dos movimentos datados já guardados no cofre;
- ao mudar de mês no histórico, o seletor mensal passa a consultar diretamente os dados desse período;
- quando o mês civil muda e o utilizador estava a acompanhar o mês corrente, a aplicação muda automaticamente para o novo mês e preserva o anterior;
- num mês novo sem planeamento, **Saldo inicial** e **Orçamento do mês** aparecem vazios em vez de `0,00`, ficando prontos para o próximo registo.

Nenhuma despesa histórica é eliminada no rollover. A mudança mensal apenas altera o período em análise e cria o perfil mensal vazio se ainda não existir.


## Despesas — filtros recolhidos no telemóvel (25/09/2026)

Revisão técnica: `76-bills-filter-collapse1` / `76-mobile-shell3`.

A captura física mostrou que o cartão **Filtros** ocupava uma parte excessiva do ecrã antes da lista de despesas. A funcionalidade permanece intacta, mas no mobile os filtros avançados passam a iniciar recolhidos.

- novo botão compacto **Filtros** junto da pesquisa e de **Nova fatura**;
- o cartão com Estado, Categoria, datas, Ordenar e Limpar filtros só aparece quando o utilizador pede;
- o botão expõe `aria-expanded` e `aria-controls` para acessibilidade;
- quando existem critérios diferentes do padrão, o botão mostra a quantidade de opções alteradas;
- **Limpar filtros** repõe os valores e volta a recolher o painel no telemóvel;
- desktop continua com os filtros sempre visíveis;
- os IDs e listeners canónicos não foram substituídos nem duplicados.

Objetivo: libertar área vertical e colocar resumo/lista de despesas mais perto do topo sem perder capacidade de pesquisa avançada.


## Estabilidade e eficiência de runtime — 25/09/2026

Revisão técnica: `76-runtime-efficiency1`, arquitetura `76-architecture-efficiency7`, startup `76-startup-canonical3`, Service Worker `76-background-efficiency5`.

Objetivo deste bloco: reduzir trabalho de fundo e remover autoridades duplicadas sem alterar domínio financeiro, persistência, cofre, QR, Mercado ou sincronização de dados.

Alterações executadas:

- **startup local-first passou a canónico em `events.js`**: depois de um PIN válido, a interface local abre imediatamente; a verificação remota de sync corre em background;
- **`v75-startup-guard.js` deixou de substituir `enterApp` e `syncStartupGate`** e mantém apenas exclusividade visual cofre/shell no Safari/PWA;
- **sincronização automática** continua imediata após alterações locais, foco/retoma e regresso online, mas a reconciliação periódica passa de 1 minuto para 5 minutos e pausa quando a aplicação está oculta;
- eventos próximos de foco/pageshow/visibility são deduplicados por 15 segundos;
- **verificação de nova versão** mantém check imediato e ao regressar à aplicação/Internet, com fallback periódico de 15 minutos em vez de 30 segundos;
- o ciclo de atualização não corre quando a aplicação está oculta ou offline;
- a camada `v75-architecture.js` deixa de executar `apply()` depois de qualquer click irrelevante; apenas ações arquiteturais e MutationObservers dedicados pedem recomposição;
- transição mensal de calendário mantém verificação por foco/visibilidade e reduz o fallback temporal para 5 minutos.

Impacto esperado: menos rede, menos timers ativos, menos recomposição DOM, menor consumo de bateria e menor probabilidade de sensação de bloqueio em Safari/PWA.

Pendente: validação física no mesmo iPhone/Safari/PWA de arranque, desbloqueio, registo de fatura, retorno de background e atualização automática.


## Aplicação móvel nativa: fundação Animais / Walli / Partilha com Nuno

Em 4 de outubro de 2026 foi criada uma fundação separada em `apps/mobile-native/` para iniciar a migração da Conta de Casa para uma aplicação móvel nativa, sem reutilizar a shell Web/PWA como interface móvel.

Estado deste bloco:

- React Native + Expo SDK 57, TypeScript strict;
- primeiro fluxo funcional: **Animais → Walli → Partilha com Nuno**;
- registo de períodos/dias, calendário mensal, histórico, edição e eliminação;
- cálculo proporcional pelos dias reais do mês ou valor diário fixo;
- valores financeiros em cêntimos inteiros;
- outubro de 2026: 120,00 € × 8 / 31 = 30,97 € para o Nuno e 89,03 € para o proprietário;
- reembolso recebido é registado separadamente e não reescreve a base mensal;
- persistência local nativa em SQLite com SQLCipher;
- chave aleatória de 256 bits guardada no SecureStore do sistema;
- operações SQL parametrizadas e transações para impedir dias duplicados;
- a aplicação Web/PWA existente permanece intacta.

Pendente antes de considerar esta base pronta para produção: instalar dependências, gerar a build nativa, executar os testes/typecheck no CI, validar iOS/Android físicos, rever backup/restauro e definir a migração segura dos restantes módulos.


## Build nativa de desenvolvimento preparada

Em 4 de outubro de 2026 foi acrescentada a configuração necessária para instalar e validar a nova aplicação em dispositivos reais.

Incluído:

- `expo-dev-client` compatível com Expo SDK 57;
- `apps/mobile-native/eas.json` com perfis `development`, `development-simulator`, `preview` e `production`;
- build de desenvolvimento interna para iOS físico e Android;
- perfil separado para simulador iOS;
- documentação de inicialização EAS sem guardar credenciais ou inventar `projectId`.

A configuração não cria certificados, provisioning profiles, contas Expo ou credenciais Apple/Google no repositório. Esses elementos permanecem fora do código e dependem de autenticação explícita do titular.

Pendente: executar `eas init` com a conta Expo autorizada, gerar as primeiras builds iOS/Android e validar visualmente o fluxo Animais/Walli em dispositivos físicos.


## Secção dedicada: Partilha do Walli

Em 4 de outubro de 2026 a aplicação móvel nativa passou a ter uma secção de navegação própria para a partilha do Walli com o Nuno.

Alterações:

- novo destino de topo `Partilha` na navegação inferior da aplicação móvel;
- ecrã dedicado `WalliShareScreen`;
- Animais mantém o perfil do Walli e apresenta apenas um resumo com acesso à partilha;
- a secção Partilha concentra base mensal, dias com o Nuno, valor do Nuno, parte do proprietário, estado do reembolso, calendário, registos e configurações;
- após guardar uma entrega, o utilizador regressa à secção Partilha;
- subecrãs de calendário, registos e configurações regressam à Partilha em vez de regressarem ao perfil Animais.

A lógica financeira, SQLite/SQLCipher, SecureStore, reembolsos e prevenção de dias duplicados foram preservados.


## PWA: Partilha do Walli no menu móvel

Em 4 de outubro de 2026, a área de partilha do Walli passou a ser integrada também na Conta de Casa PWA utilizada no iPhone, diretamente no drawer móvel mostrado na validação física.

Estado implementado:

- novo grupo `Animais` no menu completo, entre Compras e Análise;
- novo destino `Partilha do Walli` com ícone local de pata;
- nova rota interna `petshare` e página `#page-petshare`;
- configuração mensal com cálculo proporcional pelos dias civis reais do mês ou valor diário fixo;
- registo de períodos com o Nuno, bloqueando dias sobrepostos;
- calendário mensal, histórico e eliminação de registos;
- reembolsos guardados separadamente da base mensal;
- valores em cêntimos inteiros, arredondamento proporcional half-up uma vez no total mensal;
- dados incluídos no mesmo `appState` cifrado do cofre existente;
- integração com backup e sincronização cifrada, incluindo tombstones e revisão de conflitos;
- novo asset público `walli-share.js`, incluído no build do Pages e no Service Worker.

Preservado: `STATE_VERSION = 5`, faturas, pagamentos, Mercado, Planeamento, PIN/cofre, PBKDF2/AES-GCM e navegação compacta inferior existente.

Pendente: validação física no mesmo iPhone/Safari/PWA após publicação, confirmando que o grupo Animais aparece no drawer, abre a página correta e mantém persistência após fechar/reabrir.


## PWA: edição dos registos e idas à rua do Walli

Em 4 de outubro de 2026 foi acrescentada edição aos registos da Partilha do Walli.

Implementado:

- cada registo passa a ter ação **Editar**, além de Eliminar;
- o formulário entra em modo de edição, preenchendo datas, observação e quantidade de idas à rua;
- botão **Cancelar edição** regressa ao modo de novo registo sem gravar alterações;
- novo campo manual **Idas à rua**, inteiro entre 0 e 200 por período;
- registos antigos são normalizados com `walksCount = 0`;
- a verificação de sobreposição ignora o próprio registo durante a edição, continuando a bloquear colisões com os restantes;
- `walksCount` entra no cofre cifrado, backup e revisão de conflitos da sincronização;
- Service Worker e asset Walli recebem revisão `76-walli-edit-walks2`.

Pendente: validação física no iPhone, incluindo criar, editar, cancelar edição, fechar/reabrir a PWA e confirmar persistência.


## PWA: cálculo automático de passeios e total a pagar

Em 4 de outubro de 2026, a Partilha do Walli deixou de exigir a introdução manual do número de idas à rua.

Implementado:

- configuração mensal de **1 ou 2 passeios por dia**;
- preço por passeio configurável, com referência inicial de **8,00 €**;
- ao selecionar as datas em que o Walli fica com o Nuno, a aplicação calcula automaticamente:
  - dias do período;
  - número de passeios;
  - custo dos passeios;
  - parte base proporcional ou diária;
  - **total a pagar ao Nuno**;
  - valor já pago;
  - valor ainda por pagar;
- fórmula dos passeios: `walkCount = careDays × walksPerDay`;
- custo: `walksCostCents = walkCount × walkRateCents`;
- total: `totalPayableCents = shareCents + walksCostCents`;
- o campo manual `walliCareWalks` foi removido da interface;
- a prévia do formulário reage imediatamente às datas, frequência e preço;
- pagamentos novos ficam marcados como `direction = outbound`;
- pagamentos criados pela versão anterior, que significavam valores recebidos, são preservados como `inbound` e não são abatidos ao total a pagar.

Pesquisa de referência em 4 de outubro de 2026: Zaask indica média de 8 € por 30 minutos, Fixando mostra intervalo de 7 € a 20 € por serviço em Lisboa, e SeePet apresenta referências de 10 € a 12 € por passeio em pacotes recorrentes. O valor de 8 € é apenas uma referência inicial editável, não uma obrigação contratual.

Pendente: validação física no iPhone, incluindo 1 e 2 passeios por dia, alteração do preço, edição de períodos e marcação como pago.


## PWA: refinamento UI/UX da Partilha do Walli

Em 4 de outubro de 2026, a área **Partilha do Walli** foi reorganizada visualmente sem alterar o domínio financeiro.

Melhorias:

- hero próprio com identidade do Walli e indicação de cofre cifrado;
- resumo mensal com hierarquia explícita, destacando primeiro **Total a pagar** e **Estado/Por pagar**;
- métricas secundárias separadas em cartões menores;
- configuração e registo de período apresentados como passos 1 e 2;
- formulários em duas colunas no desktop e uma coluna no mobile;
- prévia automática separa quantidade de passeios e custo estimado;
- calendário e histórico passam a uma grelha organizada no desktop e empilham no mobile;
- registos passam a mostrar chips de dias/passeios e ações mais claras;
- touch targets, inputs móveis a 16 px, forced-colors e reduced-motion preservados;
- nova revisão pública `76-walli-ux-polish4`.

Preservado: cálculos em cêntimos, datas civis, prevenção de sobreposição, pagamentos inbound/outbound, cofre cifrado, sincronização e dados existentes.

Pendente: validação visual física no iPhone em 390/430 px, dark mode e com registos longos.


## PWA: pagamentos parciais ao Nuno

Em 4 de outubro de 2026, a Partilha do Walli passou a permitir liquidar o valor em aberto por partes, sem obrigar a pagar tudo de uma vez.

Implementado:

- botão **Pagar tudo** mantém a liquidação integral;
- nova área **Dividir pagamento** dentro do estado por pagar;
- divisão automática em **2, 3 ou 4 partes**;
- valores são distribuídos em cêntimos inteiros e a soma das partes é sempre exatamente igual ao valor em aberto;
- a primeira parte recebe o eventual cêntimo de resto antes das seguintes;
- a interface mostra **Pagar agora** e **Fica por pagar** antes de confirmar;
- cada pagamento parcial é um novo movimento `outbound` no histórico existente;
- após cada pagamento, `paidCents` e `outstandingCents` são recalculados;
- não há juros, crédito ou calendário de dívida: é apenas divisão interna do valor em aberto;
- revisão pública atualizada para `76-walli-partial-pay5`.

Exemplo matemático: 94,97 € em 2 partes resulta em 47,49 € + 47,48 €, sem perder nem criar cêntimos.

Preservado: total da partilha, cálculo dos passeios, pagamentos anteriores, cofre cifrado, sync e prevenção de sobreposição de dias.


## PWA: plano com datas, Despesas e correções do Walli

Em 4 de outubro de 2026, a Partilha do Walli foi consolidada com melhorias de pagamento, integração financeira, reutilização mensal e auditoria.

Implementado:

- planos de pagamento persistentes em 2, 3 ou 4 partes, com data definida para cada parcela;
- painel próprio **Plano e movimentos**, com estado pago, por pagar e em atraso;
- pagamento individual de cada parcela;
- se o total do mês mudar depois de criar o plano, o plano é sinalizado como desatualizado e o pagamento é bloqueado até recriação;
- pagamentos efetivamente feitos ao Nuno passam automaticamente a criar um movimento correspondente em **Despesas**, categoria `Animais`;
- cada pagamento Walli tem IDs determinísticos de ligação para impedir duplicação contabilística;
- anulação de pagamento mantém o lançamento original no histórico e acrescenta uma reversão, em vez de apagar o registo Walli;
- ao anular, a Despesa ligada é retirada e recebe tombstones de sincronização;
- parcelas anuladas voltam ao estado por pagar no plano;
- configuração do mês anterior pode ser copiada sem copiar dias, pagamentos ou planos;
- markup da área Walli deixa de usar SVG próprio no hero e passa a usar o sistema de ícones canónico do projeto;
- revisão pública `76-walli-enhancements6`.

Preservado: cálculo de dias, passeios, base, preços, cêntimos inteiros, cofre cifrado, sincronização, pagamentos legados inbound e restantes módulos financeiros.

Pendente: validação física no iPhone para plano 2x/3x/4x, criação automática da Despesa, anulação e sincronização entre dois dispositivos.


## PWA: iconografia funcional unificada

Em 4 de outubro de 2026 foi consolidada a iconografia funcional visível para reduzir diferenças entre ícones históricos, SVGs estáticos e o sistema Lucide local.

Implementado:

- `ui-icons.js` continua a autoridade canónica e passa à revisão `76-icons-unified7`;
- adicionado o ícone canónico `clock`;
- ícones do cabeçalho de Prioridade de pagamentos, Orçamento e respetiva navegação são normalizados pelo mesmo hydrator;
- o indicador de prazo das despesas deixa de gerar SVG próprio em `render.js` e usa `icon('clock')`;
- ações de navegação removem SVG direto legado antes de inserir o ícone canónico, evitando duplicação visual;
- navegação criada por `v75-architecture.js` já delegava em `CDCIcons.markup` e permanece assim;
- Walli, menus, cofre, filtros, Mercado, diálogos e ações continuam no mesmo sistema local;
- Service Worker recebe revisão `76-icons-unified7`.

Preservado: IDs, handlers, navegação, fórmulas, dados, cofre, CSP e licença Lucide local.

Pendente: validação visual física no iPhone para confirmar alinhamento ótico em light/dark mode.


## PWA: ecrã de PIN alinhado ao protótipo

Em 5 de outubro de 2026, o ecrã de desbloqueio do cofre foi redesenhado para seguir o protótipo visual aprovado, sem alterar a criptografia, o fluxo de autenticação ou a persistência.

Alterações:

- fundo de autenticação em gradiente verde-petróleo, com formas ambientais discretas;
- marca Conta de Casa deslocada visualmente para o cabeçalho do fundo;
- conteúdo de desbloqueio passa a um cartão translúcido/frosted de alto contraste;
- badge de cadeado maior, título e subtítulo com hierarquia mais forte;
- campo PIN maior e centrado;
- teclado numérico aumentado, com alvos tácteis circulares de 70–74 px;
- botão Entrar em gradiente com affordance circular e ícone ArrowRight canónico;
- alternância Palavra-passe/PIN usa ícone Key canónico;
- Mostrar PIN e Alterar PIN mantêm os mesmos IDs/handlers, agora com iconografia Lucide;
- SVGs locais de cadeado e apagar foram retirados do HTML e continuam a ser fornecidos pelo sistema de ícones;
- dark/forced-colors/reduced-motion e safe areas permanecem suportados;
- revisão pública `76-pin-prototype1`.

Não houve alteração ao PBKDF2, AES-GCM, IndexedDB, política de bloqueio automático ou requisitos mínimos do PIN.
