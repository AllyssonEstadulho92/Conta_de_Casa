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

## Invariantes vigentes

- `STATE_VERSION=5`;
- cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- `estimatedCents` ≠ `actualCents`;
- `marketId|pid` canónico;
- QR/scanner/backup/PWA/offline sem regressões;
- nenhum segredo no repositório público.
