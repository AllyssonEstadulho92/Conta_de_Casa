# TODO — Conta de Casa

## P0 — validação imediata

- [ ] Confirmar CI da revisão com `mobile-layout.css`.
- [ ] Confirmar publicação do GitHub Pages após CI.
- [ ] Validar no iPhone/Safari que Compras percorre todos os cartões sem corte ou grande área vazia.
- [ ] Validar Faturas, Início, Relatórios e ecrãs de definições com listas longas.
- [ ] Abrir e fechar o teclado em campos editáveis e confirmar que o shell não reduz permanentemente de altura.
- [ ] Testar rotação retrato/paisagem e regresso a retrato.

## P1 — robustez de UI

- [ ] Consolidar regras mobile duplicadas existentes em `styles.css` e `design-system.css` depois da validação física.
- [ ] Criar testes de browser real para Safari/iOS quando existir infraestrutura adequada.
- [ ] Rever consistência da densidade vertical dos cartões de Faturas e Compras.
- [ ] Confirmar contraste, foco e alvos tácteis em todos os controlos após consolidação CSS.

## P2 — manutenção

- [ ] Avaliar remoção gradual de blocos CSS antigos que já estejam totalmente substituídos pelo design system.
- [ ] Manter documentação de arquitetura, decisões e estado atualizada a cada alteração importante.
