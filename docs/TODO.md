# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — v75 publicada e refinamento de cabeçalho

- [x] Publicar v75 em `main` com Início / Despesas / Mercado / Planeamento / Mais.
- [x] Preservar `core.js`, `finance.js`, `STATE_VERSION = 5`, IndexedDB, pagamentos, cifragem e sincronização.
- [x] Implementar `v75-architecture.css/js` sem criar lógica financeira paralela.
- [x] Manter drawer à direita e hambúrguer ↔ X.
- [x] Remover do topbar móvel o bloco `Olá, Utilizador / Bem-vindo de volta!` e o avatar.
- [x] Manter `#notificationsBtn` como única ação à direita.
- [x] Refinar topbar para `75-header2`: 60 px + safe area, gradiente discreto, título compacto, foco e estados de toque.
- [x] Atualizar asset versioning do cabeçalho para `75-header2`.
- [x] Atualizar nome do cache do Service Worker para invalidar a revisão anterior.
- [x] Atualizar documentação técnica obrigatória.

## P1 — Validação física do cabeçalho `75-header2`

- [ ] iPhone/Safari/PWA: confirmar atualização do Service Worker e carregamento da revisão nova.
- [ ] iPhone: safe area sem faixa duplicada ou salto vertical.
- [ ] iPhone: hambúrguer, título e sino alinhados numa única linha.
- [ ] iPhone: título longo com ellipsis sem colisão com o sino.
- [ ] iPhone: badge visível e centrado sem cortar no canto.
- [ ] iPhone: hambúrguer → X → hambúrguer sem deslocamento.
- [ ] Android/tablet: largura, orientação e alinhamento do cabeçalho.
- [ ] Tema escuro: contraste e consistência do cabeçalho.
- [ ] Desktop: confirmar ausência de regressão, porque o refinamento é mobile-only.

## P1 — Mercado

- [ ] Implementar fallback robusto quando `imageUrl` existe mas a imagem remota falha.
- [ ] Manter área da fotografia estável, sem cartão vazio ou deformado.
- [ ] Adicionar skeleton discreto durante carregamento.
- [ ] Usar fallback visual por categoria com texto `Imagem indisponível` quando necessário.
- [ ] Rever cartões em 3 colunas e reflow para 2 colunas quando a largura não permitir leitura confortável.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Remover resíduos apenas após confirmar que não existem referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
