# Changelog

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
