# Changelog

## v42 — diálogo mobile estável e exclusão completa de faturas

- diálogo de formulário passa a ser ancorado ao visual viewport real quando o teclado do iPhone está aberto;
- largura, altura e posição do diálogo usam as métricas atuais do Visual Viewport, evitando que metade do formulário fique fora da área útil;
- cabeçalho do diálogo fica sticky e continua acessível enquanto o formulário é percorrido;
- reposicionamento do campo ativo deixa de usar scroll global/centrado e passa a deslocar somente o contentor interno o mínimo necessário;
- ações de Editar pagamento e Eliminar pagamento ficam explícitas e com alvo táctil adequado;
- Excluir fatura passa a funcionar mesmo quando existem pagamentos, com confirmação destrutiva e remoção em cascata da fatura, pagamentos associados e recorrências futuras geradas;
- tombstones de sincronização são criados para cada pagamento e fatura removidos, impedindo reintrodução por outro dispositivo;
- os totais e relatórios são recalculados após a exclusão porque os registos financeiros associados deixam de fazer parte do estado ativo;
- schema 5, cálculos monetários, cofre, backup/restauro e protocolo cifrado de sincronização permanecem inalterados;
- Service Worker e cache público promovidos para v42.

## v41 — correção iPhone/Safari e edição de faturas

- campos editáveis no mobile passam a usar 16 px para impedir o auto-zoom do Safari ao receber foco;
- diálogos passam a respeitar a altura real do visual viewport e mantêm scroll interno durante a abertura do teclado;
- o campo focado dentro do diálogo é reposicionado automaticamente após a animação do teclado;
- a navegação inferior é ocultada enquanto o teclado está aberto para não sobrepor formulários;
- faturas passam a expor a ação Editar diretamente na lista, incluindo quando o estado já é Pago;
- a validação financeira já existente é preservada: o valor total pode ser editado, mas nunca para um valor inferior ao total já pago;
- schema 5, pagamentos, auditoria, cofre, backups e sincronização permanecem inalterados;
- Service Worker e cache público promovidos para v41.

## v40 — Mercado e Compras operacionais

- Mercado passa a ter pesquisa, filtros por estado/categoria e ordenação sem alterar o schema de dados;
- resumo distingue estimado total, gasto contabilizado, valor ainda por comprar e diferença entre estimado e contabilizado dos itens comprados;
- quando um item comprado ainda não tem preço real, a interface indica explicitamente que os relatórios continuam a usar o estimado, preservando a regra financeira existente;
- desktop passa a usar tabela operacional com quantidade, estimado, preço real, diferença, estado e ações;
- mobile passa a usar cartões próprios com controlos de compra, preço real e comparação de valores;
- itens podem agora ser editados sem perder estado de compra, preço real, data de compra ou identidade do registo;
- pesquisa, filtros, edição e estado vazio usam os fluxos cifrados já existentes;
- schema 5, cálculo mensal, cofre, backups e protocolo de sincronização permanecem inalterados;
- Service Worker e cache público promovidos para v40.

## v39 — Faturas operacionais

- área de Faturas reorganizada com pesquisa e ação de criação em primeiro nível e filtros agrupados por estado, categoria, período e ordenação;
- desktop passa a usar tabela operacional com descrição, estado, vencimento, total, pago, em falta e ações;
- mobile passa a usar cartões compactos com valor em falta, vencimento, progresso e ações de detalhe/pagamento;
- vencimentos recebem sinal visual próprio sem alterar a regra financeira de estado ou urgência;
- resumo do mês distingue Em aberto, A vencer e Em atraso usando os totais já calculados pelo motor financeiro;
- estado vazio permite limpar filtros diretamente;
- schema 5, fórmulas, arredondamentos, cofre, backups e protocolo de sincronização permanecem inalterados;
- Service Worker e cache público promovidos para v39.

## v38 — hierarquia financeira do Dashboard

- os indicadores principais passam a concentrar Saldo atual, Por pagar, Em atraso e Saldo projetado;
- Pago no mês e Próximos 7 dias passam a indicadores complementares, mantendo os mesmos valores e regras existentes;
- grelha principal otimizada para 4 colunas no desktop e 2 colunas em tablet/mobile;
- indicadores complementares adaptam-se para 2 colunas no desktop e 1 coluna no mobile;
- nenhuma alteração ao schema 5, motor financeiro, cofre, backups ou protocolo de sincronização;
- assets públicos, Service Worker e cache promovidos para v38 para evitar reutilização visual da v37.

## v37 — atualização segura da fundação visual

- seletor do mês, estado de sincronização e tabs secundárias normalizados para alvos mínimos de 44 px;
- testes de acessibilidade reforçados para impedir regressões nesses controlos;
- identificador de build, referências de assets, Service Worker e cache promovidos em conjunto para garantir que móvel e computador recebem o CSS corrigido imediatamente;
- schema financeiro, cofre, backups e protocolo de sincronização permanecem inalterados.

## v36 — fundação visual e navegação adaptativa

### Arquitetura da informação
- navegação principal agrupada em Principal, Finanças, Compras, Análise e Sistema;
- Calendário passa a ser uma vista de Faturas;
- Objetivos passa a ser uma vista de Planeamento;
- Integridade passa a ser uma vista de Definições;
- remoção do antigo modal móvel “Mais”.

### Navegação e sistema visual
- sidebar de 248 px recolhível para navigation rail de 76 px;
- rail automático em ecrãs intermédios;
- drawer completo no mobile e acesso rápido com quatro destinos;
- ação Adicionar colocada na app bar;
- contexto e título de página separados;
- tokens de superfície, tipografia, espaçamento, radius, contraste e tema escuro reunidos em `design-system.css`;
- `aria-current`, tabs acessíveis, foco e redução de movimento preservados.

### Segurança e compatibilidade
- schema financeiro e formato do cofre continuam na versão 5;
- nenhuma alteração no motor financeiro ou protocolo de sincronização;
- novo cache público v36 inclui a fundação visual;
- testes específicos de navegação e contraste adicionados ao CI.

## v35 — resolução de conflitos de sincronização

### Reconciliação assistida
- comparação lado a lado apenas dos campos que realmente divergem;
- escolha explícita por registo entre “Manter deste dispositivo” e “Usar o sincronizado”;
- nenhuma diferença financeira é escolhida automaticamente;
- a versão não escolhida continua preservada no histórico cifrado de conflitos;
- o schema 5 marca tecnicamente a versão confirmada para o segundo dispositivo convergir sem repetir a mesma decisão;
- atualização remota somente após todas as decisões, com verificação do SHA e da revisão para impedir sobrescrita concorrente;
- o antigo ciclo de “Reconciliar novamente” foi substituído por uma resolução conclusiva.

### Validação
- teste de execução completo para migração v33/v34, deteção de conflito, decisão e avanço da revisão remota;
- cache e referências de assets atualizados para v35.

## v34 — integridade financeira

### Cálculos
- acumulador monetário central com `BigInt` durante as somas e retorno apenas de inteiros seguros;
- ledger único por fatura para total, pago, restante, excedente e validade;
- limites monetários validados antes da gravação;
- diagnóstico de totais agregados inválidos.

### Histórico
- linha temporal cifrada por fatura;
- registo de criação, edição, cancelamento, duplicação e recorrência;
- registo de criação, edição e eliminação de pagamentos com valores anterior e posterior;
- união segura do histórico entre dispositivos por ID.

### PWA
- schema de estado 4;
- cache e referências de assets atualizados para v34.

## 0.1.1-hardening — em proposta

### Segurança
- regra explícita de confidencialidade para dados financeiros e pessoais;
- CSP compatível com GitHub Pages;
- eliminação de CDNs, trackers e chamadas externas na auditoria de assets;
- IDs com aleatoriedade criptográfica;
- sanitização/escaping centralizado antes de renderizar dados do utilizador;
- histórico de atividade sem nomes, valores, fornecedores ou referências;
- guardas contra dados sensíveis em localStorage/sessionStorage;
- bloqueio automático reforçado por inatividade e perda de foco;
- limpeza de chave, estado e UI sensível ao bloquear;
- backup cifrado v2 com validação de versão, estrutura e integridade;
- restauro bloqueia backups inválidos, corrompidos ou adulterados;
- service worker restrito a cache de assets públicos;
- anexos reais bloqueados até cifragem individual de ficheiros.

### Testes
- senha errada;
- payload adulterado;
- backup inválido/corrompido;
- XSS/escaping;
- persistência cifrada após reload;
- auditoria de assets externos e cache;
- cálculos financeiros existentes.

## 0.1.0 — 2026-09-01

Primeira versão utilizável da Conta de Casa.

### Incluído
- interface responsiva clara;
- PWA e funcionamento offline;
- cofre local cifrado;
- dashboard mensal;
- faturas e pagamentos parciais;
- estados e urgência automáticos;
- recorrências;
- calendário;
- planeamento e rendimentos;
- mercado;
- relatórios;
- objetivos;
- histórico de atividade;
- modo privacidade;
- backup/restauro cifrado;
- testes financeiros;
- CI e workflow de GitHub Pages.
