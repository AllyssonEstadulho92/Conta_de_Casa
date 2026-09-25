# Estado do Projeto — Conta de Casa

Atualizado: 25 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main` antes deste bloco: `47bd94951b8748fbb8bd4153e967f4b7b948fe32` (Comprometido e Disponível real integrados no Planeamento)
Branch funcional: `main`

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

## Planeamento

`76-planning-budget-card2` + `76-planning-ring-shape1` permanecem integrados. A revisão `76-planning-commitment1` acrescenta uma hierarquia financeira sem alterar a origem dos dados:

- **Gasto este mês** continua a representar apenas pagamentos efetivamente registados e compras de Mercado concluídas;
- **Comprometido** usa `monthNumbers().outstanding`, isto é, o valor remanescente das faturas ativas do mês, incluindo pendentes, vencidas e parcialmente pagas;
- **Orçamento** continua a vir de `profile.budgetCents`;
- **Disponível real** = orçamento menos gasto efetivo menos comprometido;
- o valor disponível não é limitado artificialmente a zero, para que um mês sobrecomprometido seja visível;
- a percentagem do anel continua a representar apenas gasto efetivo sobre orçamento, sem transformar faturas pendentes em gasto;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- não existe alteração de `STATE_VERSION`, IndexedDB, pagamentos, Mercado, sync ou cifragem.

A chave de recomposição do resumo inclui agora o valor comprometido, evitando que a área fique desatualizada quando uma fatura pendente é criada, editada, paga parcialmente ou eliminada.

Pendente: validação física no mesmo iPhone/PWA, incluindo orçamento definido, ausência de orçamento, valor comprometido e cenário de disponível real negativo.

## Segurança — dívida aberta

- corrigir o texto de rede da página Segurança enquanto existir dependência remota do scanner;
- empacotar ZXing localmente com licença preservada;
- só depois retirar a origem remota da CSP;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- criar E2E WebKit/Chromium para os fluxos críticos.

## Próximo passo

1. validar `76-dashboard-priority1` no iPhone/Safari/PWA com seis faturas, nomes longos e largura real do dispositivo;
2. validar `76-date-calculator-prototype-inputs5` e `76-auth-spacing3` nos mesmos ambientes;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local e endurecer CSP;
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

Foi confirmado que a publicação anterior já estava concluída no GitHub Pages. A latência sentida no primeiro uso do leitor pode ocorrer porque o ZXing ainda é carregado remotamente quando necessário.

Para reduzir a espera sem alterar o fluxo funcional:

- o leitor ZXing passa a ser preparado em background assim que o formulário de nova fatura existe;
- o carregamento é assíncrono e não bloqueia a abertura do formulário;
- falha de pré-aquecimento não impede o utilizador de continuar, porque o fluxo normal mantém a tentativa ao usar **Ler fatura** ou **QR Code**;
- nenhum cálculo, dado financeiro, cofre, IndexedDB ou sincronização é alterado;
- o Service Worker recebe `invoice-capture-warmup1` para distribuir a revisão.

Dívida técnica mantida: empacotar ZXing localmente e retirar a dependência remota, conforme o plano de segurança existente.


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
