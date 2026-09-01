# SPEC — Conta de Casa

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

## Regras financeiras
- restante = max(valor total − soma de pagamentos, 0)
- saldo atual = saldo inicial + rendimentos − pagamentos − compras confirmadas
- saldo projetado = saldo atual − total ainda por pagar
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

## Segurança v1
- IndexedDB;
- AES-GCM 256;
- PBKDF2-SHA-256;
- salt aleatório;
- IV aleatório;
- chave apenas em memória;
- bloqueio automático;
- modo privacidade;
- backup/restauro cifrado.

## UX/UI
Tema claro como principal. Azul para ação, verde para concluído, âmbar para atenção, vermelho para atraso/erro e cinza para neutro. Estados devem usar texto além da cor.

## Critérios de aceitação v0.1.0
- cofre pode ser criado e desbloqueado;
- palavra-passe incorreta não desbloqueia;
- fatura pode ser criada e editada;
- pagamento parcial reduz exatamente o restante;
- pagamento total produz estado Pago;
- vencimento ultrapassado com saldo restante produz Em atraso;
- cálculos usam cêntimos inteiros;
- mudança de mês preserva histórico;
- mercado e rendimentos afetam o mês correto;
- backup pode ser exportado/restaurado;
- aplicação funciona offline após primeiro carregamento;
- testes financeiros passam no CI.

## Roadmap
### v0.2
Categorias e métodos configuráveis, arquivo de faturas, edição de mercado, visão semanal melhorada e histórico mais detalhado.

### v0.3
Anexos, comprovativos e exportação CSV.

### v0.4
Alertas/notificações configuráveis quando tecnicamente suportados.

### v0.5
Relatórios anuais, comparação mensal, orçamento por categoria, fixas vs variáveis.

### v0.6
Alteração segura da palavra-passe, WebAuthn/biometria quando suportado e auditoria de segurança.

### v1.0
Apenas após QA funcional, segurança, acessibilidade, persistência, PWA e critérios de aceitação concluídos.
