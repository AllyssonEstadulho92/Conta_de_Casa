# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — Publicação do novo modelo v74

- [x] Analisar o protótipo e mapear os ecrãs para fluxos reais.
- [x] Consolidar identidade em `design-system.css`.
- [x] Criar `v74-experience.css` e `v74-experience.js`.
- [x] Implementar navegação móvel **Início / Despesas / Mercado / Planeamento / Mais**.
- [x] Implementar novo Início, Despesas, Mercado, Planeamento, Relatórios e Mais.
- [x] Ligar **Adicionar despesa** ao formulário existente.
- [x] Ligar **Ler fatura** ao fluxo real de QR/fotografia e revisão.
- [x] Preservar estimativa/valor real no Mercado e fotografias apenas quando verificadas.
- [x] Preservar sidebar/drawer à direita e hambúrguer ↔ X.
- [x] Retirar `ui-consistency.css` e `v64-runtime.css` do bundle público após consolidação.
- [x] Manter `v64-runtime.js` funcional.
- [x] Atualizar build, manifesto e Service Worker para `v74` / `74-experience2`.
- [x] Atualizar testes de regressão para a arquitetura v74.
- [x] Validar finanças, cofre, QR, Mercado, scanner, segurança, responsividade, acessibilidade e sincronização.
- [x] Atualizar documentação técnica.
- [x] Abrir PR `#64` para `main`.
- [x] Confirmar CI do PR `34210060213` / `#1441`.
- [x] Integrar em `main` — merge `a1974860755d70e7abf30ed93cee7220f5e65409`.
- [x] Confirmar CI de `main` `34210146307` / `#1442`.
- [x] Confirmar GitHub Pages `34210213884` / `#1435`.

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
- [ ] Rever módulos CSS históricos restantes numa release própria, sem misturar com mudanças funcionais.
- [ ] Rever pipeline externo do Mercado numa tarefa dedicada e sem alterar regras financeiras.
- [ ] Manter documentação e manifesto sincronizados após cada release.
