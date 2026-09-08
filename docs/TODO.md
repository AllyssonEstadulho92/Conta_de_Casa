# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — Publicar o novo modelo v74

- [x] Analisar o protótipo móvel aprovado e mapear os ecrãs para fluxos reais da aplicação.
- [x] Consolidar identidade visual em `design-system.css`.
- [x] Criar `v74-experience.css` para composição móvel do novo modelo.
- [x] Criar `v74-experience.js` sem mutação direta do estado financeiro.
- [x] Implementar navegação móvel **Início / Despesas / Mercado / Planeamento / Mais**.
- [x] Implementar novo Início com saudação, mês, resumo, orçamento, ações rápidas e categorias.
- [x] Ligar **Adicionar despesa** ao fluxo real existente.
- [x] Ligar **Ler fatura** ao fluxo real de QR/fotografia e revisão.
- [x] Adaptar Mercado ao novo modelo mantendo estimativa/valor real separados.
- [x] Voltar a permitir fotografias verificadas sem as tornar requisito de identificação.
- [x] Adaptar Planeamento, Relatórios e Mais ao mesmo sistema visual.
- [x] Preservar sidebar/drawer à direita e hambúrguer ↔ X da v73.
- [x] Retirar `ui-consistency.css` e `v64-runtime.css` do bundle público depois da consolidação.
- [x] Manter `v64-runtime.js` por conter comportamento funcional em uso.
- [x] Atualizar build, manifesto e Service Worker para `v74` / `74-experience2`.
- [x] Atualizar testes antigos que validavam CSS já removido.
- [x] Validar finanças, cofre, QR, Mercado, scanner, segurança, responsividade, acessibilidade e sincronização no CI (`34209567627` / `#1435`: sucesso).
- [x] Atualizar documentação técnica da candidata v74.
- [ ] Abrir PR de `redesign/v74-prototipo-conta-de-casa` para `main`.
- [ ] Confirmar CI do PR.
- [ ] Integrar a v74 em `main`.
- [ ] Confirmar CI de `main`.
- [ ] Confirmar GitHub Pages com build v74.

## P1 — Validação física pós-publicação

- [ ] iPhone/Safari/PWA: onboarding, cabeçalho, safe area, navegação inferior e teclado.
- [ ] iPhone: hambúrguer → X → hambúrguer e swipe do drawer à direita.
- [ ] iPhone: Despesas, formulário, QR/fotografia e retorno ao ecrã anterior.
- [ ] iPhone: Mercado com/sem fotografia verificada e textos longos.
- [ ] Android/tablet: largura, orientação horizontal, teclado e drawer.
- [ ] Desktop: sidebar direita expandida/recolhida, densidade e ausência de overflow horizontal.
- [ ] Tema escuro em mobile e desktop.

## P2 — Consolidação técnica posterior

- [ ] Remover `#drawerCloseBtn` histórico apenas quando referências em `events.js`/ícones puderem ser eliminadas sem regressão.
- [ ] Rever se módulos CSS históricos que já não são necessários podem ser retirados numa release própria, sem misturar com mudanças funcionais.
- [ ] Rever pipeline externo do Mercado numa tarefa dedicada e sem alterar regras financeiras.
- [ ] Manter documentação e manifesto sincronizados após cada release.
