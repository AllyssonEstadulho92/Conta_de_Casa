# Decisões Técnicas — Conta de Casa

Atualizado: 15 de setembro de 2026

## D-064 — migração TypeScript incremental

- destino: fonte funcional TypeScript com `strict`;
- browser pode continuar a executar JavaScript gerado;
- sem framework novo apenas para mudar linguagem;
- cada runtime substitui JS manual apenas depois de paridade e regressões;
- schema, cifragem e fórmulas não mudam por causa da linguagem.

## D-065 — total de Mercado exige evidência completa

Um total só é exato quando SKU, quantidade/peso, preço aplicável, promoções/condições e ajustes relevantes estiverem confirmados. Caso contrário é estimativa.

## D-066 — imagem não é prova de preço

Fotografias/logos são apresentação e identidade; não definem `actualCents` nem provam uma transação.

## D-072 — shell móvel com uma única autoridade geométrica

`v76-mobile-shell.css` é a autoridade final de viewport autenticado, safe areas, scroll, reserva e posição do dock.

## D-073 — propriedade por preocupação

- tokens/componentes: design system;
- composição: product pages/camadas de página v76;
- geometria mobile: mobile shell;
- domínio: finanças/Mercado;
- persistência/cifra: core;
- sync: camada própria;
- build/PWA: tooling + Service Worker.

## D-075 — hierarquia visual canónica

O sistema visual v76 define primary, secondary, danger, link, icon-button, baseline tátil 44 px, foco e estados disabled/hover.

## D-076 — “100% TypeScript” significa fonte TypeScript

`.js` público gerado pode continuar a existir. O que deve desaparecer é JavaScript manual mantido como fonte funcional.

## D-077 — protótipo não autoriza funções inventadas

Protótipos são referência de hierarquia. Métricas, biometria, comparação de preços, tarefas ou outras funções só entram se existirem no domínio real e forem implementadas/testadas.

## D-078 — composição não altera domínio

CSS pode ordenar/priorizar, mas não calcular dinheiro, escrever IndexedDB ou alterar segurança.

## D-079 — exclusão de JS exige substituição comprovada

Um JS manual só sai depois de TS equivalente, build gerado, consumidores migrados e gates verdes.

## D-080 — JS gerado é artefacto

`.generated/*.js` e `dist/*.js` produzidos a partir de TypeScript não são fonte manual.

## D-081 — migração por blocos auditáveis

Baixo acoplamento primeiro; finanças, core/cifra e controladores complexos apenas com contratos e vetores de paridade suficientes.

## D-082 — mudança visual tem de ser perceptível

Não comunicar build/cache/TypeScript como redesign se a composição visível não mudou.

## D-083 — PIN local válido não depende de sync remoto

Depois de `unlockVault()` validar o cofre local, a aplicação abre sem depender de rede; sync continua em background.

## D-084 — regressão física tem prioridade sobre contrato legado

Se dispositivo real contradiz teste verde, o teste deve ser revisto para o comportamento final desejado.

## D-085 — `hidden` é autoridade explícita no auth

`#vaultScreen[hidden]` e `#app[hidden]` têm de ser efetivamente invisíveis mesmo perante CSS histórico com `!important`.

## D-086 — auditoria UI usa referências externas, não cópia de design

Apple HIG, Material/Android accessibility, WCAG 2.2/W3C e web.dev são referências; a implementação é adaptada à PWA real.

## D-087 — header móvel final é neutro

Superfície do design system, texto/ícones com contraste, borda subtil, controlos de 44 px e foco visível. Cor de marca fica reservada para ação/seleção/status.

## D-089 — dock móvel: consistência antes de decoração

Superfície neutra, cinco destinos primários, selected state discreto, ícones lineares, labels legíveis e safe areas.

## D-090 — navegação móvel tem uma única autoridade

A duplicação histórica com v74 foi retirada. `v75-architecture.js` mantém a composição atual e `mobile-menu-toggle.js` controla o drawer/hambúrguer.

## D-091 — marca e iconografia têm autoridades distintas

- `icon.svg` é a marca gráfica canónica;
- Lucide é a família de ícones funcionais;
- um ícone deve representar a ação real;
- decoração não deve duplicar significado.

## D-092 — `marketId|pid` acompanha o artigo pesquisado

A identidade de um SKU pesquisado não pode desaparecer quando o produto entra na lista.

Regras:

- `marketId` só aceita retalhistas live suportados (`pingo-doce`, `continente`) ou vazio;
- `pid` é normalizado para dígitos, máximo 32 caracteres;
- itens manuais/legados continuam válidos com ambos vazios;
- a identidade é preservada antes do commit e durante a normalização;
- `marketId/pid` não são removidos pela política de conflitos técnicos de sync;
- esta alteração é aditiva e não exige `STATE_VERSION` novo;
- `estimatedCents`, `actualCents`, quantidade e estado de compra permanecem intocados.

## D-093 — correção técnica não obriga alteração da release

Hotfixes e correções internas podem ser publicados mantendo `v76`/`0.76.0` quando não existe mudança de release. Cache interno do Service Worker pode mudar para distribuir o código, mas não se altera `release-manifest.json`, `app-update.js` ou a versão mostrada ao utilizador apenas para forçar refresh.

## D-094 — testes estáticos não equivalem a WebKit real

Contratos por regex/sintaxe continuam úteis, mas não contam como validação física de hit-testing, teclado virtual, scroll, foco ou top-layer. Fluxos críticos móveis devem ganhar E2E WebKit/Chromium.

## D-095 — dependência CDN deve ser descrita com precisão

Enquanto ZXing for carregado de `unpkg.com`, a página Segurança não pode afirmar literalmente “Sem CDNs”. A direção preferida é bundle local + licença preservada + CSP mais restritiva.

## D-096 — identidade transitória do Mercado tem validade de um ciclo de evento

A ponte `76-market-identity1` usa estado temporário apenas para transportar `marketId|pid` entre o clique de um resultado live e o `commit('created','market')` executado nesse mesmo fluxo.

- a identidade é copiada para o item antes do primeiro `await` do commit;
- se o clique não chegar a criar o artigo, o estado temporário é limpo no microtask seguinte;
- um item criado manualmente depois não pode herdar a identidade de um clique live abortado;
- o guard não altera preço, quantidade, contabilidade, scanner ou persistência financeira.

## D-097 — drawer completo usa hierarquia vertical e destinos de primeiro nível

O menu móvel completo não deve reproduzir todas as rotas internas nem apresentar uma grelha de cartões com igual peso visual.

- `76-drawer-hierarchy1` usa uma coluna e leitura sequencial;
- destinos de primeiro nível: Início, Despesas, Planeamento, Mercado, Relatórios, Segurança e sincronização, Definições;
- Calendário permanece em Despesas, Metas em Planeamento e Diagnóstico em Definições;
- Segurança tem estado ativo próprio no drawer completo, mas continua agrupada em Mais no dock compacto;
- o drawer permanece à direita para preservar o controlador/gesto existente e evitar uma mudança puramente estética com risco funcional;
- botão de fecho e ações de sessão usam targets tácteis >=44 px e estados de foco explícitos;
- esta consolidação é de apresentação/navegação e não altera domínio, persistência, segurança ou release.

## D-098 — ícones semânticos usam geometria Lucide coerente com a responsabilidade

A família de ícones funcional continua a ser o subset Lucide local e auditável, mas a reutilização de uma geometria inadequada não é aceite apenas porque o nome semântico já existe.

- `plan` representa Planeamento com `CalendarCheck2`, não com a mesma geometria de `wallet`;
- `settings` representa Definições com `Settings`/engrenagem, não com sliders;
- as geometrias devem vir do snapshot Lucide já fixado no repositório (`94e4cb9d9db5907053ebf3636a97c45529cf776b`) ou de atualização explícita e auditada desse snapshot;
- `icon.svg` continua reservado à marca, não a ações funcionais;
- nomes semânticos e callers devem permanecer estáveis quando apenas a representação gráfica muda;
- mudanças de iconografia não alteram rotas, handlers, dados, persistência, segurança ou release;
- testes devem impedir regressões para geometrias semanticamente incorretas.

## D-099 — filtros móveis de Despesas preservam a autoridade funcional existente

A reorganização visual dos filtros de Despesas não cria uma segunda implementação de pesquisa, filtragem ou estado.

- `renderBills()` permanece a autoridade da renderização/filtragem;
- `events.js` permanece a autoridade dos listeners;
- os IDs canónicos dos controlos não mudam;
- `mobile-layout.css` pode reorganizar pesquisa, ação e filtros em `<=820px`, mas não pode calcular, persistir nem alterar critérios;
- o sistema Lucide local é a única lupa visível da pesquisa; pseudo-elementos históricos que duplicavam o símbolo devem ser neutralizados;
- Estado/Categoria podem usar duas colunas e De/Até/Ordenar podem ser reorganizados desde que os inputs reais permaneçam acessíveis e funcionais;
- em ecrãs muito estreitos a composição deve empilhar antes de cortar conteúdo;
- targets essenciais mantêm pelo menos 44 px e foco/forced-colors/reduced-motion permanecem explícitos;
- `mobile-layout.css` é CSS de feature: não pode assumir `100dvh`, scroll global ou a geometria do viewport, que pertence exclusivamente a `v76-mobile-shell.css`;
- esta decisão não altera cálculos, `STATE_VERSION`, IndexedDB, PIN/cofre, QR, scanner, sync ou release.

## D-100 — resumo móvel de Planeamento é uma fachada sobre o formulário canónico

O protótipo de orçamento móvel melhora a hierarquia e a eficiência, mas não cria um segundo fluxo de domínio.

- `dashboardNumbers()`/`dashboardMetrics()` continuam a origem dos valores apresentados no resumo;
- `categoryTotals()` continua a origem da distribuição por categoria;
- `#monthPicker` continua a autoridade do mês e os botões anterior/seguinte apenas disparam o fluxo existente;
- `#monthPlanForm` e `events.js` continuam a única autoridade de validação e gravação do planeamento mensal;
- `#monthlyBudget` continua a ser o campo canónico de orçamento;
- `Definir orçamento`, `Editar orçamento`, a linha Orçamento e a orientação contextual apenas fazem scroll/foco para `#monthlyBudget`;
- a camada de apresentação não chama `commit()`, `saveState()` nem altera `budgetCents`;
- orçamento ausente deve continuar explícito como `Por definir`, nunca convertido visualmente em `0%`;
- o intervalo do mês é calculado a partir de `selectedMonth`, não codificado no HTML;
- a navegação mensal e ações usam iconografia Lucide local/licenciada;
- em telemóveis estreitos, legibilidade das métricas tem prioridade sobre apresentar três cartões na mesma linha;
- a melhoria pode invalidar apenas o cache técnico PWA, sem alterar `v76`/`0.76.0`.

## D-101 — componentes circulares não podem depender de altura legada fixa

A validação física do PR #143 mostrou que `aspect-ratio` não corrige um componente quando uma camada anterior ainda impõe simultaneamente largura/altura com `!important`.

- a camada canónica mais recente deve neutralizar explicitamente dimensões legadas incompatíveis antes de depender de `aspect-ratio`;
- o anel de orçamento usa `height:auto!important` + `aspect-ratio:1/1!important`, garantindo geometria circular;
- tamanhos móveis podem variar por breakpoint, mas largura e altura efetivas devem permanecer 1:1;
- testes devem proteger a neutralização da altura histórica e os tamanhos 136/128/116 px;
- esta correção é exclusivamente visual e não altera percentagem, orçamento, cálculos, persistência ou domínio.

## D-102 — filtros móveis de Despesas não usam faixa horizontal como apresentação final

A validação física no iPhone mostrou que a faixa horizontal herdada de `v75-expenses-modern.css` criava pressão lateral e campos parcialmente cortados.

- em `<=820px`, a apresentação final usa grelha contida na largura disponível;
- Estado/Categoria formam um par e De/Até outro;
- Ordenar e Limpar filtros ocupam linhas completas;
- `<=360px` usa uma coluna antes de cortar conteúdo;
- scroll horizontal não é requisito para descobrir controlos essenciais;
- `mobile-layout.css` pode neutralizar a apresentação histórica, mas não assume viewport global;
- `v76-mobile-shell.css` continua a autoridade de safe areas, scroll e dock;
- a decisão não altera `renderBills()`, listeners, fórmulas, IndexedDB, PIN/cofre, QR, scanner, Mercado, sync ou release.

## D-103 — a calculadora de datas usa aritmética civil e regras explícitas

`76-date-calculator1` não calcula intervalos dividindo milissegundos por 24 horas.

- reutiliza as primitivas civis de `core.js` para validar, ordenar e deslocar datas;
- diferença de datas deve ser determinística entre fusos e mudanças de horário de verão;
- inclusão/exclusão da data inicial e final é escolha explícita do utilizador;
- período em anos/meses/dias é civil e separado do total absoluto de dias;
- “dias úteis” significa segunda a sexta-feira; feriados não são presumidos sem jurisdição configurada;
- a ferramenta é local: não usa rede, IndexedDB, `appState`, `commit()` ou `saveState()`;
- a fonte funcional permanece TypeScript strict e o JavaScript público é artefacto gerado;
- qualquer futura integração de feriados requer fonte/jurisdição explícita, testes e decisão própria.

## D-104 — o auth móvel segue a altura útil do iOS, não um modelo fixo de iPhone

A captura física no Safari mostrou que um layout correto por largura ainda pode ficar verticalmente desequilibrado por causa das barras do browser e da altura disponível.

- o cofre móvel usa `100svh` como referência estável quando o browser chrome está visível;
- safe areas continuam a ser respeitadas com `env(safe-area-inset-*)`;
- o conteúdo começa no topo seguro e `.vault-card` não usa margem vertical automática no mobile;
- nenhum alvo essencial pode descer abaixo de 44 px;
- o input mantém pelo menos 16 px de texto no iOS para evitar auto-zoom indesejado;
- pinch-to-zoom permanece permitido;
- esta decisão é exclusivamente de apresentação e não altera PIN, PBKDF2, AES-GCM, unlock, IndexedDB, importação ou sync;
- os tamanhos 58/54/48 px do PR #150 foram uma etapa intermédia e são substituídos pela autoridade final definida em D-105;
- testes estáticos protegem o contrato, mas validação física Safari/PWA continua obrigatória.

## D-105 — o ecrã de PIN tem uma única autoridade visual baseada no protótipo aprovado

A validação física após o PR #150 mostrou que acumular breakpoints corretivos não produzia uma composição coerente. O PR #152 substitui essas secções por `76-auth-prototype-final1`.

- `v75-usability.css` contém uma única secção canónica de apresentação do cofre;
- `76-vault-short-height1` e `76-auth-ios-spacing2` deixam de existir como blocos CSS concorrentes;
- o HTML e todos os IDs/handlers do auth permanecem canónicos e inalterados;
- keypad mobile padrão usa teclas de 56 px, `column-gap:30px` e `row-gap:16px` para corresponder ao protótipo aprovado;
- em `<=359px`, o keypad usa 52 px com gaps 24/13 px;
- em alturas `<=720px`, usa 50 px com gaps 22/9 px antes de permitir clipping;
- `100svh`, safe areas, scroll, pinch-to-zoom e input >=16 px permanecem requisitos iOS;
- Entrar é a ação visual principal; palavra-passe/recuperação são secundárias; transferência de cofre é superfície própria;
- targets essenciais nunca descem abaixo de 44 px;
- dark mode, `forced-colors` e `prefers-reduced-motion` continuam obrigatórios;
- a alteração não toca PIN, palavra-passe, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync ou domínio financeiro;
- regressão visual real no dispositivo tem prioridade sobre preservar dimensões históricas apenas porque testes antigos as esperavam.

## D-106 — `hidden` também é autoridade entre estados internos do cofre

A captura real após o PR #152 revelou que a exclusividade entre o shell e o cofre não era suficiente: `#vaultCreate` podia reaparecer ao lado de `#vaultUnlock` porque uma regra de apresentação usava `display:grid!important`.

- a presença de metadata local em `events.js` continua a decidir o estado: sem cofre → criação; com cofre → desbloqueio;
- `#vaultCreate[hidden]` e `#vaultUnlock[hidden]` têm de permanecer efetivamente invisíveis independentemente da especificidade de estilos decorativos;
- o mesmo princípio aplica-se a painéis internos que usam `hidden`, como transferência, ajuda e alteração de PIN bloqueado;
- CSS não pode converter um estado funcionalmente oculto num segundo modo simultâneo;
- não se introduz uma aba “Criar cofre” quando já existe um cofre local, porque isso criaria ambiguidade e risco de ação destrutiva;
- testes devem verificar tanto a regra CSS de exclusividade como a seleção do runtime baseada em `idbGet('meta','vault')`;
- a correção é visual/semântica e não altera `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync ou domínio financeiro.

## D-107 — a Calculadora de datas tem uma única autoridade de espaçamento e responsividade

O PR #156 substitui o CSS visual anterior da ferramenta por `76-date-calculator-layout2`, sem criar uma folha adicional de correção.

- `date-calculator.css` é a única autoridade visual da ferramenta;
- a escala de espaçamento local é 4/8/12/16/20/24/32 px;
- desktop usa uma grelha com área principal + coluna lateral de informação;
- mobile usa a ordem `input → facts → result → actions`;
- `cdc-datecalc-workspace` usa `display:contents` apenas para composição, preservando os elementos/IDs/handlers existentes;
- `<=820px` usa `100svh` e safe areas; `100dvh` não faz parte da autoridade final;
- `<=560px`, `<=430px` e `<=360px` reduzem composição antes de permitir clipping ou scroll horizontal;
- inputs principais usam 52 px e texto de 16 px; targets menores permanecem >=44 px;
- `forced-colors`, `prefers-reduced-motion` e impressão/PDF continuam protegidos;
- o Service Worker recebe apenas o token técnico `date-calculator-layout2` para invalidar CSS antigo;
- a decisão é estritamente de apresentação: `76-date-calculator1`, matemática civil, regras de dias úteis, TypeScript, domínio financeiro, armazenamento, auth, sync, QR, scanner e Mercado não mudam;
- validação estática/CI não substitui a verificação física do `<dialog>` em Safari/WebKit real.

## D-108 — o auth móvel compacta o espaço entre blocos sem reduzir o keypad aprovado

A validação física posterior mostrou que o problema remanescente não estava no tamanho das teclas, mas no somatório de margens entre secções, que empurrava transferência e nota inferior para a zona do chrome do Safari.

- `v75-usability.css` continua a única autoridade visual do cofre; não se cria uma nova folha corretiva;
- keypad padrão permanece 56 px com `column-gap:30px` e `row-gap:16px`;
- em mobile, marca usa 16 px de separação; campo PIN e keypad usam 18 px; CTA usa 20 px após o keypad;
- ações secundárias são aproximadas sem reduzir os respetivos targets abaixo de 44 px;
- transferência usa 14 px de margem superior e 12 px de separador interno;
- `#vaultMessage:empty` não pode reservar altura quando não existe estado a anunciar;
- `100svh`, safe areas, input >=16 px, pinch-to-zoom, dark mode, `forced-colors` e `prefers-reduced-motion` permanecem requisitos;
- o token técnico `auth-spacing3` invalida apenas o cache PWA necessário para distribuir a composição atual;
- a mudança é estritamente visual e não altera PIN, palavra-passe, criação/desbloqueio, PBKDF2, AES-GCM, IndexedDB, importação, sync ou domínio financeiro;
- a validação física no mesmo iPhone/Safari/PWA continua necessária, pois CI estática não mede a geometria real do browser chrome.

## D-109 — campos de data móveis formam um único grupo compacto

A captura física da Calculadora de datas mostrou que a versão móvel estava funcionalmente correta, mas o empilhamento com tracks de grid e espaçamento acumulado fazia **Data inicial**, **Trocar** e **Data final** parecerem três blocos demasiado afastados.

- `date-calculator.css` continua a única autoridade visual; não se cria outra folha corretiva;
- em `<=560px`, `.cdc-datecalc-date-grid` usa flex vertical em vez de tracks de grid;
- a ordem funcional permanece Data inicial → Trocar → Data final;
- o gap canónico do grupo é 8 px;
- labels anulam `margin` e `min-height` herdados que possam criar vazio artificial;
- `.cdc-datecalc-input-action` mantém pelo menos 52 px;
- o botão Trocar permanece 44×44 px, centrado e sem margem vertical adicional;
- desktop mantém a grelha de três colunas e não é alterado por esta decisão;
- IDs, handlers, labels, matemática civil, regras de dias úteis e TypeScript funcional permanecem inalterados;
- `date-calculator-mobile-spacing3` é apenas um token técnico de cache e não altera a release pública;
- CI protege a geometria declarada, mas a confirmação final continua dependente de Safari/WebKit real.

## D-110 — primeira aproximação do campo de data ao protótipo, substituída no WebKit por D-111

O PR #163 definiu a hierarquia visual calendário → valor → Hoje e tentou obter essa composição reposicionando `::-webkit-calendar-picker-indicator` à esquerda. A captura física posterior no iPhone mostrou que esse detalhe não é robusto no WebKit e podia provocar overflow/clipping. A hierarquia continua válida, mas a técnica de reposicionamento foi substituída pela D-111.

- `input[type="date"]` continua a ser a fonte semântica de interação;
- **Hoje** permanece um botão real e independente com target >=44 px;
- Trocar mantém o eixo horizontal e superfície central 44×44 px;
- `date-calculator.css` continua a única autoridade visual;
- a regra de não introduzir um segundo date picker permanece;
- a técnica de `left`/`position:absolute` sobre o indicador WebKit não deve voltar a ser usada como autoridade final.

## D-111 — o campo de data iOS usa uma moldura contida e não desloca o indicador nativo

A captura física após o PR #163 mostrou a secção deslocada e cortada lateralmente no Safari/iOS. O problema confirmado era de apresentação: a combinação de padding reservado e reposicionamento absoluto do indicador nativo podia aumentar a largura intrínseca de `input[type="date"]` no WebKit.

- `.cdc-datecalc-input-action` passa a ser a única moldura visual do campo, com grelha interna `48px minmax(0,1fr) auto`;
- a affordance visual de calendário e o divisor pertencem à moldura e não introduzem rede, biblioteca ou segundo widget de data;
- o `input[type="date"]` nativo ocupa a coluna central, usa `min-width:0` e não recebe borda própria duplicada;
- `::-webkit-calendar-picker-indicator` não é reposicionado por coordenadas; fica visualmente colapsado para não interferir na geometria;
- **Hoje** ocupa a terceira coluna em fluxo normal, não `position:absolute`;
- o foco visível é aplicado à moldura por `:focus-within`;
- em telemóveis comuns a Regra de contagem preserva duas colunas; só empilha em `<=340px`;
- o hotfix não altera o token do Service Worker: como `date-calculator.css` já é servido network-first/no-store, um reload normal pode obter a correção sem obrigar o utilizador ao ecrã de atualização;
- a correção é estritamente visual e não altera TypeScript funcional, matemática civil, IDs, handlers, IndexedDB, auth, sync, QR, scanner, Mercado ou release;
- CI protege a estrutura declarada, mas a confirmação final continua dependente do mesmo iPhone/Safari/PWA real.

## Invariantes vigentes

- `STATE_VERSION=5`;
- cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- `estimatedCents` ≠ `actualCents`;
- `marketId|pid` canónico;
- QR/scanner/backup/PWA/offline sem regressões;
- nenhum segredo no repositório público.

## D-112 — selecionar um modo de fatura executa a respetiva ação

A apresentação de **Manual**, **Ler fatura** e **QR Code** como controlo segmentado cria expectativa de ação imediata. Um modo que apenas muda de estado visual, obrigando a procurar um segundo controlo, é considerado comportamento incompleto para este fluxo.

- `v75-architecture.js` continua a ser responsável apenas pela seleção e semântica dos tabs;
- `invoice-capture.js` é a única autoridade funcional de captura;
- selecionar **Manual** foca o fluxo de preenchimento;
- selecionar **Ler fatura** abre diretamente o seletor de imagem;
- selecionar **QR Code** abre diretamente o fluxo da câmara;
- não se introduz OCR fictício: fotografia significa procurar QR AT na imagem;
- nenhum ficheiro ou fotograma é guardado pelo módulo;
- Service Worker deve invalidar o runtime anterior sempre que este contrato de interação mudar.


## D-113 — o leitor QR pode ser preparado antes do primeiro toque

A dependência ZXing continua temporariamente remota. Para reduzir a espera no primeiro uso sem antecipar permissões de câmara nem bloquear o formulário:

- o runtime do leitor pode ser carregado em background quando a nova fatura abre;
- a câmara não é ativada durante o pré-aquecimento;
- erros de pré-aquecimento são silenciosos e recuperáveis pela ação explícita posterior;
- `zxingPromise` continua a deduplicar carregamentos;
- esta otimização não substitui a decisão já pendente de empacotar ZXing localmente.
