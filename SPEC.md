# SPEC - Conta de Casa

## Objetivo

Aplicação financeira doméstica pessoal, mensal e local-first, para saber quanto existe disponível, quanto foi pago, quanto falta pagar, o que está em atraso e como evoluem as despesas.

## Princípios

- especificar antes de alterar;
- preservar funcionalidades corretas;
- tratar cálculos financeiros como componentes críticos;
- guardar moeda em cêntimos inteiros;
- separar estado financeiro de urgência;
- preservar o histórico dos meses anteriores;
- GitHub guarda código/documentação, nunca dados financeiros reais;
- nenhum dado financeiro/pessoal pode ir para terceiros, logs, URLs, telemetria ou GitHub;
- considerar concluído apenas o que possui critérios e testes verificáveis.

## Navegação

Desktop: Início, Faturas, Calendário, Planeamento, Mercado, Relatórios, Objetivos, Segurança, Configurações.

Mobile: Início, Faturas, botão +, Planeamento, Mais.

## Entidades v1

### Fatura

id, descrição, fornecedor, categoria, valor total em cêntimos, vencimento com data/hora, método, referência, observações, recorrência, criado em, atualizado em, cancelada, arquivada e relação recorrente.

### Pagamento

id, billId, valor em cêntimos, data/hora, método, notas, criado em.

### Rendimento

id, descrição, valor em cêntimos, data/hora, criado em.

### Mercado

id, produto, categoria, quantidade, unidade, estimativa, preço real, comprado, datas.

### Objetivo

id, nome, meta, valor poupado, prazo, arquivado.

### Perfil mensal

mês YYYY-MM, saldo inicial, orçamento.

### Segurança

último backup cifrado, último restauro validado e preferências de bloqueio.

### Anexos

Estrutura reservada, mas anexos reais permanecem bloqueados até haver cifragem individual de ficheiros, validação de tipo/tamanho e testes de restauro.

## Regras financeiras

- restante = max(valor total - soma de pagamentos, 0)
- saldo atual = saldo inicial + rendimentos - pagamentos - compras confirmadas
- saldo projetado = saldo atual - total ainda por pagar
- orçamento utilizado = pagamentos + compras confirmadas

## Estados

Ordem:

1. Cancelado
2. Arquivado
3. Pago
4. Em atraso
5. Pago parcialmente
6. Por pagar

## Urgência

- até 24 h: Crítico
- até 72 h: Urgente
- até 7 dias: Atenção
- acima de 7 dias: Normal

Os níveis de urgência são regras operacionais da aplicação.

## Recorrências

Semanal, mensal, trimestral, semestral e anual. Cada ocorrência é um novo registo; o histórico anterior não é alterado.

## Segurança v0.1 hardening

- IndexedDB como armazenamento local cifrado;
- AES-GCM 256;
- PBKDF2-SHA-256 com 250 000 iterações;
- salt aleatório;
- IV aleatório por gravação;
- IDs aleatórios seguros;
- chave apenas em memória durante sessão desbloqueada;
- limpeza das referências da chave/estado ao bloquear;
- bloqueio automático por inatividade;
- bloqueio ao perder foco/ficar oculta por tempo suficiente;
- modo privacidade para ocultar valores na UI;
- histórico local sem dados sensíveis explícitos;
- proibição de dados financeiros em `localStorage`/`sessionStorage`;
- CSP por `meta` compatível com GitHub Pages;
- ausência de dependências externas, CDNs, trackers e telemetria;
- service worker limitado a assets públicos;
- backup v2 cifrado com validação de versão, estrutura e integridade;
- restauro rejeita backups inválidos, desatualizados, corrompidos ou adulterados;
- exportação JSON financeira em claro bloqueada;
- anexos reais desativados até cifragem de ficheiros.

## UX/UI

Tema claro como principal. Azul para ação, verde para concluído, âmbar para atenção, vermelho para atraso/erro e cinza para neutro. Estados devem usar texto além da cor.

## Critérios de aceitação v0.1 hardening

- cofre pode ser criado e desbloqueado;
- palavra-passe incorreta não desbloqueia;
- fatura pode ser criada e editada;
- pagamento parcial reduz exatamente o restante;
- pagamento total produz estado Pago;
- vencimento ultrapassado com saldo restante produz Em atraso;
- cálculos usam cêntimos inteiros;
- mudança de mês preserva histórico;
- mercado e rendimentos afetam o mês correto;
- dados continuam cifrados após reload/desbloqueio;
- XSS em campos de texto é escapado antes de renderizar;
- backups v2 são cifrados e possuem checksum;
- backup inválido/corrompido/adulterado é rejeitado;
- service worker não guarda respostas arbitrárias;
- aplicação funciona offline após primeiro carregamento de assets públicos;
- testes financeiros e de segurança passam no CI.

## Roadmap

### v0.2

Categorias e métodos configuráveis, arquivo de faturas, edição de mercado, visão semanal melhorada e histórico mais detalhado.

### v0.3

Cifragem individual de anexos, comprovativos e política de importação segura de ficheiros.

### v0.4

Alertas/notificações configuráveis quando tecnicamente suportados.

### v0.5

Relatórios anuais, comparação mensal, orçamento por categoria, fixas vs variáveis.

### v0.6

Alteração segura da palavra-passe, WebAuthn/biometria quando suportado e auditoria externa.

### v1.0

Apenas após QA funcional, segurança, acessibilidade, persistência, PWA, anexos cifrados se forem usados, revisão em navegador real e critérios de aceitação concluídos.
