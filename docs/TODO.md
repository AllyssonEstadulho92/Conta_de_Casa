# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — v73 navegação à direita

- [x] Reposicionar sidebar desktop para o lado direito.
- [x] Trocar `margin-left` estrutural por `margin-right` na área principal desktop.
- [x] Espelhar borda, sombra e indicador ativo da navegação desktop.
- [x] Ancorar o drawer móvel ao lado direito.
- [x] Inverter a transição off-canvas para entrar da direita.
- [x] Inverter o gesto de abertura para a margem direita / movimento para a esquerda.
- [x] Inverter o gesto de fecho para movimento para a direita.
- [x] Preservar o mesmo hambúrguer/X, ARIA, backdrop, Escape e `prefers-reduced-motion`.
- [x] Preservar o header móvel fixed e as safe areas existentes.
- [x] Atualizar build, manifesto e cache para `v73` / `73-menu8`.
- [ ] Integrar a branch `ui/v73-right-navigation` em `main`.
- [ ] Confirmar deploy GitHub Pages.
- [ ] Validar fisicamente no iPhone: entrada da direita, fecho suave e swipe.
- [ ] Validar Android/tablet: largura, safe areas e orientação horizontal.
- [ ] Validar desktop: sidebar direita em estado expandido e recolhido, sem overflow horizontal.

## P1 — Consolidação do sistema de ícones

- [ ] Continuar a reduzir interferência entre `ui-icons.js`, SVGs históricos e controlos animados.
- [ ] Remover `#drawerCloseBtn` apenas quando as referências históricas em `events.js`/ícones forem retiradas com segurança.

## P2 — Dívida técnica não relacionada

- [ ] Rever pipeline histórico de imagens do Mercado e dependências externas quando houver uma tarefa dedicada.
- [ ] Manter documentação de publicação sincronizada após cada release.
