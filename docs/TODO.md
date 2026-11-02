# TODO — Conta de Casa

## Plano Mensal, organização aprovada (02/11/2026)

- [x] Identificar o motivo pelo qual as três linhas do orçamento apareciam como texto corrido.
- [x] Restaurar a hierarquia do protótipo com pontos de estado, legendas à esquerda e valores à direita.
- [x] Repor o progresso do círculo sem alterar o sanitizador nem a fórmula da percentagem.
- [x] Testar markup admissível e os estados vazio, normal e orçamento ultrapassado.
- [ ] Confirmar no Safari/iPhone físico o alinhamento com os dados existentes e diferentes tamanhos de letra.

## Notificações — apresentação aprovada (02/11/2026)

- [x] Corrigir os grupos convertidos em texto corrido sem alargar o sanitizador global.
- [x] Separar alertas, atividades e datas em cartões, conforme o protótipo validado.
- [x] Manter os filtros Todas, Importantes e Informativas e as ações existentes.
- [x] Cobrir a renderização e os filtros em testes automatizados.
- [ ] Confirmar o resultado visual presencialmente no Safari/iPhone real com o cofre existente.

## Faturas, extrato mensal e Safari físico (02/11/2026)

- [x] Integrar OCR opcional em português com carregamento local, revisão dos campos e sem envio das fotografias.
- [x] Manter QR AT como fonte preferida e entrada manual segura quando OCR não identifica os dados.
- [x] Gerar extrato do mês a partir de rendimentos, pagamentos e compras reais, incluindo quantidade e preços estimados.
- [x] Exportar CSV em EUR e proteger campos contra interpretação como fórmulas em folhas de cálculo.
- [x] Acrescentar testes de parser OCR, reconciliação do extrato, CSV e integração do build de Pages.
- [ ] Executar a validação presencial no iPhone com a lista `docs/IPHONE_QA_CHECKLIST.md` e um backup cifrado prévio.
- [ ] Confirmar em faturas reais de formatos distintos a qualidade dos totais e datas reconhecidos por OCR; não declarar 100% de precisão.
- [ ] Experimentar partilha/abertura do CSV em Numbers, Excel e Ficheiros no Safari real.
- [ ] Testar Face ID somente quando existir uma implementação autenticada e segura; o PIN continua o caminho de acesso.

## Partilha do Walli, continuidade visual (02/11/2026)

- [x] Colocar título e seletor de mês iguais aos da navegação financeira nova.
- [x] Mostrar total/estado, dias/passeios e disponibilizar as restantes métricas em detalhes expansíveis.
- [x] Manter todas as ações existentes, incluindo pagamentos fracionados e edições.
- [x] Adaptar os cartões e o calendário do Walli para a paleta comum.
- [x] Cobrir o novo contrato visual e os cálculos existentes em testes automatizados.
- [ ] Confirmar a composição num iPhone real com dados no cofre, sem apagar armazenamento.


## Auditoria adicional do menu, relógio e Calendário (02/11/2026)

- [x] Remover no Início apenas o sino do cabeçalho e preservar o badge no sino de boas-vindas.
- [x] Ocultar o botão de três linhas nos ecrãs móveis e deixar os cinco destinos da dock.
- [x] Tornar a saudação automática pela hora local com atualização periódica, foco e visibilidade.
- [x] Transferir as rotas e as ações Ocultar valores e Bloquear para Mais.
- [x] Uniformizar o Calendário com o visual do Plano e Contas, com seleção de mês e quatro resumos reais.
- [x] Tornar as células do Calendário funcionais, abrindo despesas e faturas do dia.
- [ ] Validar o resultado visual no Safari/iPhone físico e num cofre real, sem limpar armazenamento.


## Publicação autorizada no GitHub Pages (02/11/2026)

- [x] Receber autorização explícita para atualizar a aplicação principal.
- [x] Comparar a versão `main` do GitHub com a base da revisão privada.
- [x] Transferir apenas os ficheiros da interface e os testes para o repositório GitHub.
- [x] Executar 59 ficheiros de testes Node, TypeScript e build de Pages na árvore pública.
- [x] Atualizar `main` e confirmar o fluxo de publicação GitHub Actions da primeira versão visual (`48529c4`).
- [ ] Verificar visualmente a aplicação pública em dispositivo real com o cofre existente, sem apagar os dados.


## Referência visual completa, revisão 77 (01/11/2026)

- [x] Confirmar a imagem e especificar cinco ecrãs, menus e estados sem dados fictícios.
- [x] Corrigir o Plano para mostrar um único cartão de orçamento e anel também sem limite definido.
- [x] Reordenar o menu inferior e alinhar símbolos com Início, Plano, Contas, Relatórios e Mais.
- [x] Simplificar Mais para as quatro ações principais do protótipo, preservando funções secundárias.
- [x] Aproximar Contas e próximas contas do estilo compacto e manter ações de edição/pagamento.
- [x] Apresentar atividade recente real no Centro de Notificações, com filtros existentes.
- [ ] Confirmar o resultado visual e a interação em iPhone/Safari e ecrã de computador com cofre fictício.
- [ ] Obter aprovação explícita antes de integrar alterações na aplicação pública.

## Continuação do protótipo para os ecrãs restantes (01/11/2026)

- [x] Inspecionar a `main` e distinguir implementação real do protótipo ilustrado.
- [x] Renovar o Início com resumo financeiro calculado e acessos rápidos.
- [x] Renovar o Plano com orçamento visual, compromissos e mudança de mês.
- [x] Introduzir filtros rápidos e cartões compactos de Contas preservando ações.
- [x] Acrescentar separadores de alertas sem criar notificações falsas.
- [x] Corrigir `NotFoundError` do lançador de atualizações e retirar o atalho Mercado do manifesto.
- [x] Atualizar bundle, cache, contratos de regressão e documentação.
- [x] Verificar os 58 testes Node em sequência, TypeScript e build de Pages.
- [x] Disponibilizar uma versão de teste privada em HTTPS, isolada do GitHub Pages.
- [ ] Testar a versão separada em HTTPS no Safari/iPhone com cofre e dados fictícios.
- [ ] Validar contraste, zoom, VoiceOver, rotação e modo discreto, inclusive labels acessíveis.
- [ ] Rever a integração com #223, #224 e #225 antes de qualquer alteração à `main`.


## Revisão final para publicação (01/11/2026)

- [x] Corrigir dock móvel para Início, Faturas, Plano, Relatórios e Mais.
- [x] Corrigir visibilidade do terceiro separador e ligação acessível de Mais ao painel existente.
- [x] Invalidar cache dos scripts principais e da shell móvel em conjunto.
- [x] Acrescentar contratos de regressão para PIN único, Mercado retirado e navegação de cinco destinos.
- [ ] Confirmar todas as execuções de CI e TypeScript da proposta.
- [ ] Validar ecrã PIN, navegação, abertura de opções e recuperação no Safari/iPhone real.
- [ ] Verificar visual em modo claro, escuro, alto contraste e movimento reduzido.
- [ ] Testar importação/restauro num cofre fictício antes de uma migração de dados pessoais.
- [ ] Só remover scripts legados de compras após auditoria de dependências e dados históricos.


## PIN aprovado e desativação de Mercado (01/11/2026)

- [x] Aplicar aparência escura aprovada ao desbloqueio móvel e manter um único indicador do PIN.
- [x] Recolher opções de palavra-passe, mostrar PIN, alteração, recuperação e transferência sem remover ações.
- [x] Adaptar teclado, foco, responsive, movimento reduzido e alto contraste.
- [x] Remover Mercado de menus, dock, quick add e rota; manter dados antigos e contabilização.
- [x] Atualizar os contratos de navegação e revisão de cache do site.
- [x] Adicionar testes de integridade do cofre e desativação de Mercado.
- [ ] Concluir CI e TypeScript, construção e revisão da proposta.
- [ ] Validar com dados fictícios no iPhone real: PIN, palavra-passe, alteração e recuperação sem perdas.
- [ ] Confirmar que a navegação e os relatórios não encaminham para Mercado; validar o histórico.
- [ ] Auditar dependências e criar migração separada antes de remover elementos legados.
- [ ] Só integrar e publicar após QA e aprovação do visual final.


## Correções solicitadas em capturas do iPhone (01/11/2026)

- [x] Separar automaticamente receitas menos despesas do saldo bancário manual.
- [x] Evitar apresentar o mesmo valor como projeção quando não há faturas pendentes.
- [x] Indicar quando existem compras com preço apenas estimado.
- [x] Ocultar o segundo X por trás do menu móvel, sem mexer no controlador existente.
- [x] Introduzir testes de cálculo e regressões de interface e cache.
- [ ] Confirmar CI, TypeScript e Pages da proposta de correção.
- [ ] Validar no Safari/iPhone os valores, modo discreto, abertura/fecho do menu, navegação e foco.
- [ ] Confirmar com saldos conciliados que a apresentação corresponde aos movimentos registados, sem transmitir dados reais para GitHub.


## Revisão transversal de finanças pessoais e apresentação (01/11/2026)

- [x] Confirmar a base real da aplicação, dependências críticas e PRs abertas.
- [x] Distinguir projeção, saldo atual, gasto confirmado e contas ainda por pagar no Plano.
- [x] Aproximar o orçamento e os próximos vencimentos da primeira leitura, mantendo o formulário único.
- [x] Agrupar notificações existentes e incluir faturas a vencer entre um e sete dias.
- [x] Aperfeiçoar transição hambúrguer/X sem duplicar a lógica do menu.
- [x] Introduzir feedback visual não persistente do PIN e preservar o modo palavra-passe.
- [x] Atualizar chaves de cache e adicionar contrato de regressão.
- [ ] Confirmar suite CI, TypeScript e compilação Pages.
- [ ] Validar no iPhone os pontos do PIN, os alertas, o menu e a ordem do Plano com dados fictícios.
- [ ] Avaliar futuramente acessibilidade, contraste, notificação sem rede e tempo de resposta em dispositivo real.
- [ ] Integrar separadamente e testar PRs #223 e #224. Não alterar a privacidade do alojamento sem plano de migração.


## Reformulação visual linear e Plano Mensal (01/11/2026)

- [x] Auditar as 11 páginas existentes, os controlos, as camadas CSS e os formulários.
- [x] Acrescentar guias breves e sequência de três passos, mantendo os identificadores e listeners.
- [x] Redesenhar Plano Mensal com cartões para saldo, rendimentos, despesas e dívida do mês.
- [x] Acrescentar saldo projetado com distinção entre referência manual e estimativa.
- [x] Apresentar até cinco próximas contas sem esconder vencimentos de outros meses.
- [x] Manter orçamento visual, formulário único, lista de rendimentos e funções de registo.
- [x] Reforçar o aviso visual da ação de eliminação local.
- [x] Atualizar revisões da PWA e contratos estáticos de regressão.
- [ ] Confirmar CI, TypeScript e publicação controlada da nova apresentação.
- [ ] Testar em Safari/iPhone e computador, inclusive modo discreto, teclado, zoom e layout.
- [ ] Rever compatibilidade com PR #223 e #224 antes da sua integração.
- [ ] Continuar consolidação de CSS legado apenas após QA físico.


- [x] Reorganizar Relatórios com quatro indicadores, estado das contas, saldo e projeção e tabela de faturas com filtros.\n- [x] Criar visual responsivo inspirado na referência, sem copiar valores nem moeda fictícia.\n- [x] Acrescentar testes estáticos, filtros e escape das descrições.\n- [ ] Validar regressões completas e distribuição GitHub Pages na atualização do dia 01/11/2026.\n- [ ] Testar no iPhone os filtros, contas e modo discreto com dados fictícios.\n\n
## Estatísticas de dívidas e saldo (31/10/2026)

- [x] Especificar visão do mês selecionado e de todas as faturas registadas, sem misturar pagamentos por data com faturas por vencimento.
- [x] Calcular total, liquidado, por pagar, atrasado, vencimentos futuros, parciais, anomalias e contagens.
- [x] Integrar cartões de relatórios e projeção do saldo, com distinção entre saldo confirmado manualmente e estimado.
- [x] Marcar quantias, contagens e notas com `data-money` para o modo discreto.
- [x] Acrescentar regressões e invalidação de cache.
- [ ] Confirmar CI/Pages/TypeScript.
- [ ] Validar Safari/iPhone com cofre fictício e modo de privacidade.
- [ ] Integrar com as propostas #223 e #224 apenas após resolução de conflitos e QA físico.
- [ ] Testar restauro e verificar integridade financeira num perfil isolado antes de dados reais.


Atualizado: 27 de outubro de 2026

## P1 — Utilidade diária do Início entre meses (27/10/2026)

- [x] Manter os KPI, orçamento e saldo projetado no mês selecionado, identificando-o nos rótulos.
- [x] Calcular «Próximos 7 dias» com faturas válidas de todos os meses, incluindo o mês seguinte.
- [x] Mostrar atrasos de meses anteriores sem misturar o montante nos totais do mês.
- [x] Permitir abrir o mês correto diretamente a partir do alerta no Início e no Centro de Alertas.
- [x] Priorizar atrasos e vencimentos urgentes de vários meses, mantendo o detalhe canónico das faturas.
- [x] Acrescentar teste específico de fronteira mensal e diagnóstico financeiro.
- [x] Executar 52/52 testes locais, `npm run typecheck` e `npm run build:pages` sem erros.
- [x] Incluir o teste de fronteira mensal nos workflows CI e Deploy Pages.
- [ ] Confirmar visualmente em Safari/PWA no iPhone (alertas, mudança de mês, lista e prioridade).
- [ ] Validar CI, revisão e publicação da proposta antes de considerar a melhoria distribuída.

## P0 — Mostrar fotografias verificadas do Pingo Doce

- [x] Identificar perda do `sourceUrl` no bridge, seletor de cartão incorreto e atualização manual sem imagens prioritárias.
- [x] Corrigir o carregamento no artigo real e validação por evento `load`.
- [x] Priorizar até três fotos exatas durante a atualização da biblioteca, sem alterar o limite de chamadas.
- [x] Invalidar revisões PWA do bridge, biblioteca e photo-loader.
- [ ] Validar CI + testes de integração e publicar a correção.
- [ ] Confirmar no Safari/PWA que as fotografias oficiais abrem e o contador é coerente com os produtos reais.
- [ ] Identificar falhas externas de rede, CSP ou imagens indisponíveis por produto, sem recorrer a fotos aproximadas.

## P0 — QA visual do Mercado (09/10/2026)

- [x] Reproduzir controlos com HTML/CSS do artefacto publicado `f93b8fd` em Chromium.
- [x] Identificar a interseção entre `Ordenar` e `Limpar filtros` a 360 e 390 px.
- [x] Preparar a correção em `v76-mobile-shell.css` e validação geométrica de 320, 360, 390, 430, 768, 1440 px, sem overflow horizontal.
- [x] Atualizar versão CSS do bundle e regressões de layout.
- [ ] Validar CI/TypeScript da PR e publicação a partir de `main`.
- [ ] Confirmar presencialmente Safari/PWA com navegação, listas reais, imagem de produto e filtros.
- [ ] Validar a transferência e recuperação do cofre nas alturas úteis curtas, com o menu do Safari visível.

## P1 — DevOps e dependências reproduzíveis

- [x] Gerar lockfile npm v3 do projeto PWA num runner Node 24.
- [x] Substituir `npm install` por `npm ci` em CI, Pages e TypeScript Foundation; ativar cache dependente do lockfile.
- [x] Remover do workflow a etapa temporária de recolha de lockfile.
- [x] CI de `main` com `npm ci` concluída com sucesso após #217.
- [ ] Confirmar visualmente a publicação com o lockfile PWA.
- [ ] Gerar e validar, em tarefa separada, o lockfile do projeto Expo nativo.
- [ ] Criar testes E2E em browser real WebKit e Chromium, mantendo a separação das suites atuais.

## P1 — Fiabilidade dos montantes exibidos

- [x] Acrescentar `marketEstimatedCount` e `marketEstimatedCents` sem modificar as fórmulas do mês.
- [x] Distinguir no UI uma compra efetivada mas com preço estimado no Início, Calendário e Mercado.
- [x] Proteger este caso com regressões em `tests/finance.test.cjs`.
- [x] CI de qualidade e TypeScript verdes na PR #216.
- [ ] Teste visual das novas indicações em Safari/PWA.
- [ ] Definir formalmente se o indicador de caixa deve excluir valores não confirmados numa futura mudança de domínio.

## P0 — Correções do Mercado

- [x] Integrar a PR #213: geometria mobile de Adicionar produto.
- [x] Reaplicar a PR #212 sobre o novo estado de `main`, sem perder o CSS do PIN ou o histórico.
- [x] PR #215 validada em CI, TypeScript e testes de segurança; integrada em `main`.
- [ ] Confirmar fotografias oficiais Pingo Doce/Continente no Safari, sem aceitações de PID divergente.
- [ ] Confirmar visualmente o PIN e o formulário Mercado após a nova publicação.

## P1 — Qualidade transversal

- [ ] Criar testes E2E reais WebKit/Chromium com percurso do PIN, Despesas e Mercado, sem substituir os testes Node existentes.
- [x] Distinguir preço estimado de confirmado no Mercado e no resumo financeiro, sem alterar fórmulas (#216).
- [x] Implementar lockfile e `npm ci` nos três workflows da PWA (#217); lockfile Expo nativo continua pendente.
- [ ] Consolidar CSS v75/v76 por componente com testes visuais e segurança de regressão.
- [ ] Testar backup, restauro e sincronização em dois dispositivos reais.

## P0 — Invariantes

- [x] `STATE_VERSION = 5`.
- [x] Dinheiro em cêntimos inteiros.
- [x] PBKDF2-SHA-256 + AES-GCM, 250000 iterações.
- [x] IndexedDB financeiro preservado.
- [x] `estimatedCents` separado de `actualCents`.
- [x] `marketId|pid` definido como identidade canónica.
- [x] UI/UX e migração sem alteração silenciosa de domínio.

## P0 — Auth / Safari / iOS

- [x] Preparar `76-auth-viewport-fit1` no CSS canónico: teclado 52/48 px, formulário mais compacto e scroll de segurança.
- [x] Atualizar versão do asset em `build:pages` e acrescentar contratos de regressão de acessibilidade.
- [x] Validar o novo bloco na CI (quality e TypeScript Foundation verdes na PR #214, commit `d96cee9`).
- [ ] Testar em iPhone Safari/PWA a 320/360/390/430 px e alturas úteis diferentes, com PIN normal, erro, recuperação e importação.
- [ ] Confirmar texto ampliado, teclado virtual, rotação, dark mode e utilização sem cofre num perfil novo.
- [ ] Rever PR #212 (fotografias Pingo Doce) e PR #213 (geometria Mercado) separadamente, sem duplicar correções na branch de autenticação.

- [x] PIN local abre aplicação sem depender de sync.
- [x] `[hidden]` impede cofre e shell simultâneos.
- [x] Formulário de despesa mobile usa um único scroll owner após PR #132.
- [x] PR #150 introduziu `100svh`, safe areas e topo seguro para Safari/iOS.
- [x] PR #152 / `76-auth-prototype-final1`: autoridade visual única do cofre.
- [x] PR #152: keypad mobile 56 px com gaps 30/16 px; fallbacks estreitos/baixos preservados.
- [x] PR #154 / `76-auth-exclusive-state1`: `hidden` é autoridade também entre criação e desbloqueio.
- [x] PR #154: testes protegem exclusividade do estado e decisão do runtime.
- [x] PR #158 / `76-auth-spacing3`: ritmo vertical compactado sem alterar a geometria aprovada do keypad.
- [x] PR #158: `#vaultMessage:empty` deixa de reservar altura; cache PWA invalidado com `auth-spacing3`.
- [x] PR #158: TypeScript, CI e Pages verdes.
- [ ] Confirmar `76-auth-spacing3` no mesmo iPhone/Safari web e PWA instalada.
- [ ] Validar estado sem cofre num browser/perfil limpo.
- [ ] Validar portrait/landscape e teclado virtual.
- [ ] Criar E2E WebKit/Chromium para criação/desbloqueio → Dashboard → drawer → Despesas → Adicionar.

## P0 — Início / prioridade de pagamentos

- [x] `76-full-audit-fixes1`: incluir faturas vencidas na fila de prioridade do mês.
- [x] Rótulos da fila passam a depender de atraso/vencimento real e não apenas da posição.
- [x] Corrigir data diária do catálogo do Mercado para o calendário local.
- [x] Corrigir data diária da biblioteca Pingo Doce para o calendário local.
- [x] Corrigir persistência da loja preferida para uma chave pública aceite pelo storage guard.
- [x] Corrigir data do nome do backup para o calendário local.

- [x] `76-dashboard-priority-delivery1`: invalidar Service Worker para que o visual novo chegue a Safari/PWA já abertos.
- [x] Atualizar `SERVICE_WORKER_REV` e chave `CACHE` em conjunto.
- [x] Proteger a revisão com testes de app-update, Safari/startup, arquitetura e product-pages.

- [x] `76-dashboard-priority1`: próximos vencimentos ordenados pela regra canónica existente.
- [x] Mostrar posição ordinal e orientação Pagar / A seguir / Depois / Mais tarde.
- [x] Mostrar identidade local, descrição, data/categoria, valor em falta e contagem para vencimento.
- [x] Preservar abertura da fatura pelo `data-bill-id` existente.
- [x] Aproximar cartão de Orçamento do Início ao protótipo com percentagem e barra acessível.
- [x] Versionar `render.js` e `v76-product-pages.css` com `76-dashboard-priority1`.
- [ ] Validar fisicamente 390 px e 430 px com seis faturas.
- [ ] Validar nomes/categorias longos, dark mode e forced-colors.
- [ ] Confirmar que empates de data/hora mantêm ordem estável e previsível no dispositivo real.

## P0 — Despesas/Faturas

- [x] `76-dialog-controls1`: separar a seta Voltar do X no cabeçalho de **Detalhes da fatura**.
- [x] Voltar usa `data-dialog-back` e ícone local `back`; Fechar mantém `data-close-dialog` e ícone local `close`.
- [x] Remover a seta sintética de `.dialog-close::before` e a máscara equivalente do fluxo de despesa.
- [x] Posicionar Voltar à esquerda e Fechar à direita no cabeçalho móvel, com título centrado.
- [x] Invalidar Service Worker/cache e acrescentar testes de navegação, acessibilidade, iconografia e arquitetura.
- [ ] Validar fisicamente o cabeçalho no mesmo iPhone/Safari/PWA após deploy.

- [x] Pesquisa, filtros, resumo e lista canónicos restaurados.
- [x] Fluxo Adicionar despesa profissionalizado.
- [x] Modos Manual / Ler fatura / QR estabilizados.
- [x] Hotfix touch/scroll Safari PR #132.
- [x] PR #140 / `76-bills-mobile-filters1`: pesquisa + ação + filtros mobile sem alterar IDs/handlers.
- [x] PR #142 / `76-bills-mobile-spacing1`: ritmo e espaçamento do cartão de filtros.
- [x] PR #147 / `76-bills-mobile-alignment2`: grelha móvel contida, sem faixa horizontal como apresentação final.
- [x] Estado/Categoria e De/Até organizados em pares; Ordenar/Limpar em linhas completas.
- [x] `<=360px` empilha antes de cortar conteúdo.
- [ ] Validar fisicamente pesquisa/filtros em 360/390/430 px equivalentes e portrait/landscape.
- [ ] E2E de criar/editar/pagar/eliminar/cancelar.
- [ ] Uniformizar estados loading/error/success onde ainda existam diferenças.

## P0 — Planeamento + Calendário

- [x] `76-budget-cash-separation3`: separar explicitamente fluxo de caixa real de consumo do orçamento.
- [x] Introduzir `cashSpent = paymentTotal + marketSpent` sem alterar `budgetUsed`.
- [x] Fazer o resumo do Calendário usar `cashSpent`, coerente com dias e histórico.
- [x] Fazer cartões, tendência e categorias dos Relatórios usar a mesma base de caixa.
- [x] Manter `categoryTotals()` como distribuição orçamental e criar `cashCategoryTotals()` para Relatórios.
- [x] Renomear no Planeamento a métrica para **Orçamento utilizado**.
- [x] Adicionar invariantes para `cashSpent` e categorias de caixa.
- [ ] Validar fisicamente o cenário de fatura de outubro paga em setembro: saída em setembro, orçamento utilizado em outubro.

- [x] `76-budget-bill-month2`: corrigir orçamento que permanecia em 0 após pagar uma fatura de outro mês civil.
- [x] Separar `paymentTotal` (caixa) de `budgetPaymentTotal` (orçamento da fatura).
- [x] Alinhar categorias e Planeamento com `budgetUsed`.
- [x] Cobrir fatura de outubro paga antecipadamente em setembro.


- [x] `76-month-context-sync1`: unificar mudança de mês entre Planeamento, Calendário e seletor global.
- [x] Emitir `cdc:month-change` e recompor a camada visual do Planeamento.
- [x] Tornar o filtro mensal do Calendário explícito com `selectedMonth`.
- [ ] Validar no iPhone a sequência setembro → outubro → calendário → planeamento e regresso.

- [x] Planeamento v76 e estado `Por definir` para orçamento ausente.
- [x] `plan` usa `CalendarCheck2` do snapshot Lucide fixado.
- [x] `76-planning-budget-card2`: seletor mensal, resumo e CTA sem duplicar gravação.
- [x] `76-planning-ring-shape1`: neutralizar altura legada e garantir proporção 1:1.
- [x] Anel móvel usa 136/128/116 px conforme breakpoint.
- [x] `76-planning-commitment1`: separar Orçamento utilizado, Comprometido, Orçamento e Disponível real.
- [x] Comprometido reutiliza `monthNumbers().outstanding` sem criar nova persistência.
- [x] Disponível real = orçamento menos `budgetUsed` menos comprometido, preservando valores negativos.
- [x] Chave de recomposição inclui comprometido para evitar resumo desatualizado.
- [ ] Confirmar fisicamente o anel no mesmo iPhone/Safari/PWA.
- [ ] Validar estado sem orçamento e com orçamento definido.
- [ ] Validar Comprometido com fatura pendente, pagamento parcial, fatura vencida e fatura liquidada.
- [ ] Validar Disponível real positivo, zero e negativo em mobile e desktop.
- [ ] Rever calendário/vencimentos em E2E e densidade tablet/desktop.

## P0 — Calculadora de datas

- [x] PR #149 / `76-date-calculator1` integrado em `main` (`8e58777f601d164bd4589f7d0e0e8f96e02686f0`).
- [x] Fonte funcional TypeScript strict em `src/ui/date-calculator.ts`.
- [x] Diferença civil determinística com regra explícita de inclusão dos extremos.
- [x] Soma/subtração de dias corridos e dias úteis.
- [x] Dias úteis definidos como segunda a sexta; feriados não presumidos sem jurisdição.
- [x] Testes multitimezone adicionados.
- [x] Sem rede, IndexedDB, `appState`, `commit()` ou `saveState()`.
- [x] PR #156 / `76-date-calculator-layout2`: `date-calculator.css` passa a única autoridade visual da ferramenta.
- [x] PR #156: escala de espaçamento 4/8/12/16/20/24/32 px.
- [x] PR #156: desktop usa área principal + coluna lateral de informação rápida.
- [x] PR #156: mobile usa `Calculadora → Informação rápida → Resultado → Ações`.
- [x] PR #156: `100svh` substitui `100dvh` na autoridade móvel final.
- [x] PR #156: inputs principais 52 px; targets menores >=44 px.
- [x] PR #156: breakpoints 820/560/430/360 e ausência de scroll horizontal como requisito.
- [x] PR #156: forced-colors, reduced-motion e impressão/PDF preservados.
- [x] PR #161 / `76-date-calculator-mobile-spacing3`: Data inicial → Trocar → Data final compactados no mobile sem alterar markup ou lógica.
- [x] PR #161: `<=560px` usa flex vertical, gap de 8 px, labels sem margem/altura herdada e Trocar 44×44 px centrado.
- [x] PR #163 / `76-date-calculator-prototype-inputs4`: primeira aproximação da apresentação ao protótipo.
- [x] Captura física posterior ao PR #163 confirmou overflow/clipping lateral no Safari/iOS causado pela técnica de reposicionamento do indicador nativo.
- [x] PR #165 / `76-date-calculator-prototype-inputs5`: remove o reposicionamento absoluto do indicador WebKit e contém o campo numa grelha interna própria.
- [x] PR #165: calendário visual/divisor à esquerda, input nativo na coluna central e Hoje à direita em fluxo normal.
- [x] PR #165: `min-width:0`, `max-width:100%` e moldura contida impedem a largura intrínseca do `input[type="date"]` de deslocar o cartão.
- [x] PR #165: foco visível por `:focus-within`; targets e `forced-colors` preservados.
- [x] PR #165: Regra de contagem mantém duas colunas em telemóveis comuns e só empilha em `<=340px`.
- [x] PR #165: não altera token do Service Worker; o CSS público network-first/no-store pode atualizar num reload normal, sem ecrã de atualização.
- [x] PR #165: TypeScript PR `35025919784` e CI PR `35025919606` verdes.
- [x] PR #165: merge `a80c0f9bfdbd9135dea69368ca2bde56196fab5d`.
- [x] PR #165: TypeScript `main` `35025991379`, CI `main` `35025991388` e Pages `35026044123` verdes.
- [ ] Confirmar fisicamente `76-date-calculator-prototype-inputs5` no mesmo iPhone/Safari/PWA.
- [ ] Confirmar que Data inicial/Data final permanecem totalmente dentro do cartão sem clipping ou deslocamento lateral.
- [ ] Confirmar visualmente o dialog em tablet e desktop.
- [ ] Validar top-layer/scroll do `<dialog>` em WebKit real.
- [ ] Validar copiar/partilhar/imprimir-PDF em dispositivo real.
- [ ] Avaliar futura integração de feriados portugueses apenas com jurisdição/fonte oficial explícita.

## P0 — Mercado

- [x] Pesquisa live limitada a Pingo Doce/Continente.
- [x] Catálogo visual usa identidade `marketId|pid`.
- [x] Persistência e guard de identidade publicados nos PR #133/#134.
- [ ] Validar pesquisa → adicionar → reload → editar → sync em dispositivo real.
- [ ] Rever logos/imagens/licenças antes de ampliar catálogo visual.

## P0 — Segurança + Diagnóstico + Definições

- [x] `settings` usa engrenagem Lucide.
- [x] `76-security-network-copy1`: corrigir texto `Sem CDNs` enquanto ZXing usar origem remota.
- [x] `76-local-zxing1`: empacotar ZXing localmente com licença preservada.
- [x] Remover `https://unpkg.com` de `script-src` e limitar o scanner a `self`.
- [ ] Validar fisicamente QR/fatura e código de barras com rede e offline após instalação PWA.
- [ ] Reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir.
- [ ] Rever feedback/destructive actions/dark mode/forced-colors fisicamente.
- [x] `76-deterministic-cache1`: chave de cache PWA curta e determinística por release + build id, sem acumular tokens históricos.
- [ ] Confirmar offline/update da PWA após cada invalidação relevante de cache.

## P0 — Navegação e shell

- [x] Runtime/CSS v74 e Featured retirados do bundle/repositório.
- [x] `mobile-menu-toggle.js` é autoridade do drawer/hambúrguer.
- [x] `v76-mobile-shell.css` é autoridade geométrica do shell autenticado.
- [x] Safe areas, dock e labels em ecrãs estreitos.
- [x] Drawer numa coluna, hierarquia simples e targets adequados.
- [ ] Validar fisicamente drawer no iPhone/Safari e PWA.
- [ ] E2E de abertura/fecho, foco, Escape e swipe.

## P0 — Iconografia transversal

- [x] `icon.svg` reservado à marca e Lucide à iconografia funcional.
- [x] Snapshot Lucide `94e4cb9d9db5907053ebf3636a97c45529cf776b` + licença local.
- [x] Planeamento usa `CalendarCheck2`; Definições usa `Settings`.
- [ ] Validar visualmente Planeamento/Definições no iPhone/PWA e desktop.

## P0 — TypeScript

### Concluído

- [x] Fundação strict.
- [x] Tipos de estado/mercado em `src/types`.
- [x] Market branding TS.
- [x] Sync conflict policy TS.
- [x] Calculadora de datas TS com runtime gerado.

### Próximos blocos

- [ ] Migrar módulos UI/baixo acoplamento restantes.
- [ ] Criar mais vetores de paridade para dinheiro/datas/quantidades.
- [ ] Migrar domínio Mercado para TS e retirar ponte transitória quando houver autoridade única.
- [ ] Migrar `ui-icons.js` para TypeScript preservando registry/hydrator.
- [ ] Migrar `render/forms/events` depois dos contratos visuais estabilizarem.
- [ ] Migrar core/persistência/cifra apenas com vetores próprios.
- [ ] Migrar Service Worker/tooling no bloco final.

## P1 — Relatórios + Objetivos

- [ ] Rever visualizações/legendas sem depender só de cor.
- [ ] Rever empty states e densidade final.

## P1 — Higiene do repositório

- [x] PR #45/v65 encerrado como obsoleto em 15/09/2026.
- [ ] Rever branches antigas e apagar apenas quando não contiverem trabalho exclusivo necessário.
- [ ] Ativar required checks/branch protection em `main` quando houver permissão administrativa.

## P0 — QA final

- [ ] Safari/iPhone web.
- [ ] Safari/iPhone PWA.
- [ ] WebKit E2E.
- [ ] Chromium E2E.
- [ ] Android/Chrome.
- [ ] tablet.
- [ ] desktop.
- [ ] portrait/landscape.
- [ ] teclado virtual/foco.
- [ ] Light/Dark/System.
- [ ] reduced-motion/forced-colors.
- [ ] 320/360/375/390/430/768/820 px.

## Critério de conclusão

Só concluir quando as rotas partilharem sistema visual e comportamento coerentes, mobile/desktop preservarem informação essencial, não houver sobreposição/overflow conhecido, acessibilidade estiver coberta, CI/Pages estiverem verdes, validação física/E2E confirmar o produto e a migração TypeScript seguir o plano sem regressão de domínio.


## Concluído em 24/09/2026

- [x] `76-expense-mode-action1`: tornar **Manual**, **Ler fatura** e **QR Code** ações funcionais imediatas.
- [x] abrir o seletor de imagem diretamente a partir de **Ler fatura**.
- [x] iniciar a câmara diretamente a partir de **QR Code**.
- [x] devolver foco ao preenchimento ao selecionar **Manual**.
- [x] adicionar testes de regressão para o contrato de interação e invalidar cache PWA.
- [ ] validar fisicamente o fluxo no mesmo iPhone/Safari/PWA, incluindo permissões e cancelamento.


## Performance do registo de faturas

- [x] `76-invoice-capture-warmup1`: preparar o leitor QR em background quando o formulário de nova fatura abre.
- [ ] medir no iPhone/Safari/PWA a diferença entre primeiro uso e usos seguintes.
- [x] `76-local-zxing1`: empacotar ZXing localmente para eliminar a dependência da origem remota e permitir fallback offline.


## Regressão física dos modos de fatura

- [x] `76-expense-ios-tab-touch2`: adicionar caminho `touchend` explícito aos tabs de registo.
- [x] deduplicar o click sintetizado após toque.
- [x] alterar revisões de cache dos runtimes envolvidos e do Service Worker.
- [x] proteger o contrato com testes estáticos/Pages.
- [ ] validar no mesmo iPhone que **Ler fatura** abre o seletor no primeiro toque.
- [ ] validar no mesmo iPhone que **QR Code** solicita/abre a câmara no primeiro toque.


## Entrega automática e registo de faturas

- [x] `76-expense-ios-tab-direct3`: ligar os três modos diretamente aos respetivos botões.
- [x] preservar o gesto `touchend` sem `preventDefault()` no iOS.
- [x] deduplicar o click sintetizado depois do toque.
- [x] `auto-refresh2`: ativar automaticamente o novo Service Worker depois de concluir o cache.
- [x] recarregar automaticamente a página em `controllerchange`.
- [x] verificar novas compilações a cada 30 segundos quando a aplicação está visível e online.
- [ ] validar fisicamente **Ler fatura** no mesmo iPhone após o novo deploy.
- [ ] validar fisicamente **QR Code** e pedido de câmara no mesmo iPhone.


## Captura nativa e atualização segura

- [x] `76-expense-native-input4`: substituir abertura programática pelo input nativo em **Ler fatura**.
- [x] usar `capture=environment` no **QR Code** móvel.
- [x] impedir abertura duplicada do picker no caminho nativo.
- [x] tentar `BarcodeDetector` antes de ZXing quando disponível.
- [x] `safe-refresh3`: adiar reload automático enquanto houver edição/modal ativo.
- [x] versionar separadamente arquitetura, invoice JS/CSS e Service Worker no Pages build.
- [ ] validar fisicamente **Ler fatura** no mesmo iPhone.
- [ ] validar fisicamente **QR Code** e retorno da câmara no mesmo iPhone.
- [ ] confirmar que um deploy novo recarrega automaticamente depois de fechar o formulário, sem interromper edição.


## Modos de registo de despesa

- [x] `76-expense-action-map5`: atribuir ID estável a Manual, Ler fatura e QR Code.
- [x] adicionar `data-v75-bill-action` explícito a cada controlo.
- [x] centralizar a resolução em `BILL_MODE_ACTIONS`.
- [x] expor no diálogo a ação atualmente selecionada.
- [x] proteger o contrato com testes.
- [ ] validar fisicamente no iPhone os três caminhos após publicação.


## Desbloqueio do picker iOS

- [x] `76-expense-picker-unblock6`: retirar lógica de click dos inputs nativos de fatura.
- [x] confirmar modo apenas no `change` depois de Fotos/Câmara devolver imagem.
- [x] remover `for` redundante dos labels que contêm os inputs.
- [x] excluir inputs nativos de `focusin`/gestão de visual viewport.
- [x] impedir pré-aquecimento do ZXing em iOS/touch.
- [x] manter scanner ao vivo no desktop sem afetar mobile.
- [ ] validar **Ler fatura** no mesmo iPhone.
- [ ] validar **QR Code** no mesmo iPhone.
- [ ] confirmar que regressar de Fotos/Câmara não deixa o formulário bloqueado.


## Preenchimento automático de faturas

- [x] `76-invoice-autofill7`: preencher automaticamente dados seguros depois de QR AT válido.
- [x] preencher Descrição, Valor total, NIF do fornecedor e Referência apenas se estiverem vazios.
- [x] verificar os quatro campos obrigatórios após o autofill.
- [x] manter Categoria, Vencimento, Método e fornecedor comercial como campos de revisão.
- [x] não usar data do documento como vencimento.
- [x] manter submit/persistência exclusivamente em `forms.js`.
- [ ] validar fisicamente no iPhone que os campos aparecem preenchidos logo após a leitura.


## Calendário financeiro mensal

- [x] `76-monthly-spend-calendar1`: mostrar gasto efetivo por dia no calendário.
- [x] mostrar resumo do mês com gasto total, faturas pagas, Mercado e por pagar.
- [x] manter histórico dos últimos seis meses com total gasto.
- [x] permitir mudar de mês diretamente pelo histórico.
- [x] avançar automaticamente para o novo mês quando o utilizador estava no mês corrente.
- [x] manter meses anteriores intactos e consultáveis.
- [x] apresentar Saldo inicial e Orçamento vazios num mês novo quando ainda estão a zero.
- [ ] validar visualmente o calendário mensal no mesmo iPhone/Safari/PWA.


## Limpeza visual dos filtros de Despesas

- [x] `76-bills-filter-collapse1`: recolher filtros avançados por defeito no mobile.
- [x] adicionar botão compacto acessível com `aria-expanded` / `aria-controls`.
- [x] mostrar contador quando existirem filtros/ordenação fora do padrão.
- [x] manter IDs, listeners e `renderBills()` como autoridades existentes.
- [x] manter filtros sempre visíveis em desktop.
- [ ] validar fisicamente em iPhone que a lista/resumo aparecem imediatamente sem o cartão alto de filtros.


## Estabilidade e eficiência de runtime

- [x] `76-runtime-efficiency1`: tornar startup local-first canónico em `events.js`.
- [x] retirar monkey-patching de `enterApp` / `syncStartupGate` do startup guard.
- [x] reduzir sync passivo para fallback de 5 min, mantendo push imediato de alterações locais.
- [x] deduplicar triggers de sync de foco/pageshow/visibilidade.
- [x] tornar checks da PWA event-driven com fallback de 15 min.
- [x] suspender checks de versão em background/offline.
- [x] remover recomposição global da arquitetura após clicks irrelevantes.
- [x] atualizar revisões de Pages/PWA e testes de regressão.
- [ ] validar no iPhone/Safari/PWA que desbloqueio abre imediatamente sem ecrã vazio.
- [ ] validar retorno do background e atualização automática sem interromper edição.
- [ ] medir tempos de abertura e interação em dispositivo real antes do próximo bloco de consolidação.


## P0 — Aplicação móvel nativa

- [x] Criar fundação em `apps/mobile-native/` sem WebView.
- [x] Implementar Animais → Walli → Partilha com Nuno.
- [x] Trabalhar valores em cêntimos inteiros.
- [x] Calcular proporcionalmente pelos dias reais do mês.
- [x] Separar reembolso recebido da base mensal.
- [x] Criar SQLite com SQLCipher e chave no SecureStore.
- [x] Impedir dias duplicados por schema + transação.
- [ ] Confirmar `npm ci`, TypeScript e testes no GitHub Actions.
- [ ] Gerar development build iOS e Android.
- [ ] Validar fluxo completo em iPhone físico.
- [ ] Validar fluxo completo em Android físico.
- [ ] Rever estratégia de backup/restauro da base SQLCipher e da chave.
- [ ] Definir migração segura de dados da PWA para a aplicação nativa.
- [ ] Migrar Início, Despesas e Mais apenas depois de estabilizar Animais.


### Build e validação nativa

- [x] Preparar development client e perfis EAS.
- [ ] Associar o subprojeto móvel a um projeto Expo real com `eas init`.
- [ ] Gerar development build para iPhone físico.
- [ ] Gerar development build para Android físico.
- [ ] Validar UI/UX do fluxo Walli/Nuno em iPhone.
- [ ] Validar UI/UX do fluxo Walli/Nuno em Android.
- [ ] Confirmar persistência SQLCipher após fechar e reabrir a aplicação.
- [ ] Confirmar comportamento de SecureStore após atualização da aplicação.


### Navegação da partilha

- [x] Criar destino de topo Partilha para Walli/Nuno.
- [x] Separar perfil Animais da área operacional de partilha.
- [x] Fazer subecrãs regressarem à Partilha.
- [x] Adicionar teste de contrato de navegação da secção.
- [ ] Validar a barra inferior com 5 destinos em iPhone físico.
- [ ] Validar labels e targets em Android físico.


### Partilha do Walli na PWA

- [x] Colocar Partilha do Walli no drawer da PWA.
- [x] Criar grupo Animais e rota petshare.
- [x] Guardar dados dentro do cofre cifrado existente.
- [x] Implementar cálculo proporcional pelos dias reais do mês e valor diário fixo.
- [x] Impedir sobreposição de dias.
- [x] Separar reembolso da base mensal.
- [x] Integrar registos, pagamentos e configuração mensal no sync cifrado.
- [x] Adicionar asset ao build Pages e Service Worker.
- [x] Adicionar testes de domínio, navegação, segurança e isolamento.
- [ ] Confirmar visualmente o novo item no drawer no iPhone físico.
- [ ] Confirmar persistência após fechar/reabrir Safari/PWA.
- [ ] Confirmar sincronização do Walli entre dois cofres/dispositivos reais.


### Edição e idas à rua do Walli

- [x] Permitir editar registos existentes da Partilha do Walli.
- [x] Adicionar quantidade manual de idas à rua.
- [x] Validar idas à rua entre 0 e 200.
- [x] Manter prevenção de sobreposição durante edição.
- [x] Sincronizar idas à rua no cofre cifrado.
- [ ] Validar o fluxo completo no iPhone físico.


### Passeios automáticos e total a pagar

- [x] Calcular automaticamente os passeios a partir dos dias.
- [x] Permitir escolher 1 ou 2 passeios por dia.
- [x] Configurar 8,00 € como referência inicial editável por passeio.
- [x] Calcular custo dos passeios em cêntimos inteiros.
- [x] Mostrar total a pagar ao Nuno.
- [x] Separar pagamentos outbound de recebimentos legados inbound.
- [x] Remover contagem manual de passeios da interface.
- [ ] Validar 1 passeio/dia no iPhone físico.
- [ ] Validar 2 passeios/dia no iPhone físico.
- [ ] Confirmar com o Nuno o preço real acordado e substituir a referência de 8 € se necessário.
- [ ] Avaliar integração futura do pagamento ao Nuno como despesa do fluxo financeiro global, evitando dupla contabilização.


### UI/UX da Partilha do Walli

- [x] Reorganizar visualmente a Partilha do Walli por prioridade.
- [x] Destacar Total a pagar e Estado/Por pagar.
- [x] Separar configuração e registo em passos claros.
- [x] Melhorar prévia automática de passeios.
- [x] Organizar calendário e histórico em grelha responsiva.
- [x] Melhorar leitura dos registos com metadados compactos.
- [x] Proteger forced-colors e reduced-motion.
- [ ] Validar visualmente em iPhone 390 px e 430 px.
- [ ] Validar dark mode em dispositivo físico.
- [ ] Testar notas longas e meses com muitos registos.


### Pagamentos parciais do Walli

- [x] Permitir pagar a Partilha do Walli por partes.
- [x] Dividir automaticamente em 2, 3 ou 4 partes.
- [x] Garantir soma exata em cêntimos.
- [x] Mostrar Pagar agora e Fica por pagar.
- [x] Registar cada parte como pagamento outbound normal.
- [x] Manter opção Pagar tudo.
- [ ] Validar fluxo 2x, 3x e 4x no iPhone físico.
- [ ] Confirmar comportamento após vários pagamentos parciais no mesmo mês.


### Consolidação financeira da Partilha do Walli

- [x] Criar plano de pagamento do Walli com datas.
- [x] Permitir 2, 3 ou 4 parcelas com soma exata.
- [x] Mostrar parcelas pagas, pendentes e em atraso.
- [x] Bloquear plano desatualizado quando o total muda.
- [x] Integrar pagamentos reais em Despesas sem dupla contabilização.
- [x] Ligar pagamento Walli à fatura/pagamento espelhados.
- [x] Corrigir pagamentos por reversão sem apagar histórico.
- [x] Remover a Despesa espelhada quando o pagamento é anulado.
- [x] Reabrir parcela do plano após anulação.
- [x] Copiar apenas a configuração do mês anterior.
- [x] Retirar SVG próprio do hero Walli e usar iconografia canónica.
- [ ] Validar plano 2x/3x/4x no iPhone físico.
- [ ] Validar Despesas e Relatórios depois de pagamento parcial e reversão.
- [ ] Validar conflito de plano entre dois dispositivos sincronizados.


### Iconografia

- [x] Unificar os ícones funcionais pelo sistema Lucide local.
- [x] Adicionar relógio canónico para prazos.
- [x] Normalizar ícones estáticos do Dashboard.
- [x] Evitar ícone de navegação duplicado.
- [x] Manter Walli no mesmo sistema canónico.
- [x] Atualizar revisão/cache da PWA.
- [ ] Validar alinhamento de ícones no iPhone físico em light mode.
- [ ] Validar alinhamento de ícones no iPhone físico em dark mode.


## Ecrã de PIN

- [x] Aplicar o protótipo moderno ao ecrã de PIN.
- [x] Separar visualmente marca e cartão de autenticação.
- [x] Aumentar teclado e campo PIN para uso móvel.
- [x] Aplicar Entrar com affordance ArrowRight.
- [x] Usar iconografia Lucide canónica no fluxo de desbloqueio.
- [x] Preservar criação de cofre e lógica de autenticação.
- [x] Preservar forced-colors, reduced-motion e safe areas.
- [ ] Validar visualmente em iPhone 390 px e 430 px.
- [ ] Validar modo de palavra-passe com teclado iOS aberto.
- [ ] Validar dark mode e rotação do dispositivo físico.


## Orçamento mensal utilizável nas contas

- [x] `76-budget-commitment4`: adicionar `budgetCommitted` e `budgetAvailable` ao domínio financeiro.
- [x] usar compromissos pendentes na percentagem do orçamento.
- [x] manter **Já utilizado** separado de **Por pagar**.
- [x] alinhar o cartão do Início com o Planeamento.
- [x] permitir percentagem textual acima de 100% e disponível negativo.
- [x] acrescentar invariantes financeiros e testes de regressão.
- [ ] validar no iPhone com um orçamento real e pelo menos uma fatura pendente.
