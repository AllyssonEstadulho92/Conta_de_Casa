# Arquitetura — Conta de Casa

Atualizado: 15 de setembro de 2026  
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

## 6. Planeamento mobile

`76-planning-budget-card2` + `76-planning-ring-shape1`:

- `#monthPicker` continua a autoridade do mês;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- orçamento ausente permanece `Por definir`;
- o anel neutraliza altura legada e mantém proporção 1:1;
- a apresentação não altera cálculos ou persistência.

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
