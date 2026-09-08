# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — v75 publicada e estabilidade transversal

- [x] Publicar v75 em `main` com Início / Despesas / Mercado / Planeamento / Mais.
- [x] Preservar `core.js`, `finance.js`, `STATE_VERSION = 5`, IndexedDB, pagamentos, cifragem e sincronização.
- [x] Implementar `v75-architecture.css/js` sem criar lógica financeira paralela.
- [x] Manter drawer à direita e hambúrguer ↔ X.
- [x] Remover do topbar móvel o bloco `Olá, Utilizador / Bem-vindo de volta!` e o avatar.
- [x] Manter `#notificationsBtn` como única ação à direita.
- [x] Refinar topbar para `75-header2`: 60 px + safe area, gradiente discreto, título compacto, foco e estados de toque.
- [x] Criar `75-stability1` para corrigir tipografia, overflow, safe areas, formulários, navegação e diálogos sem alterar o núcleo.
- [x] Estabilizar alvos móveis principais em 44 px.
- [x] Evitar zoom automático do Safari em inputs/selects/textarea mobile.
- [x] Sincronizar `theme-color` com tema e cabeçalho visível.
- [x] Atualizar asset versioning e cache para `-stability1`.
- [x] Alinhar validação CI e Pages para v74/v75.
- [x] Atualizar documentação técnica obrigatória.

## P1 — Validação física de `75-header2` + `75-stability1`

- [ ] iPhone/Safari/PWA: confirmar atualização do Service Worker e carregamento da revisão nova.
- [ ] iPhone: safe area superior e laterais sem faixa duplicada ou salto vertical.
- [ ] iPhone: hambúrguer, título e sino alinhados numa única linha.
- [ ] iPhone: título longo com ellipsis sem colisão com o sino.
- [ ] iPhone: badge visível e centrado sem cortar no canto.
- [ ] iPhone: hambúrguer → X → hambúrguer sem deslocamento.
- [ ] iPhone: focar inputs/selects sem zoom automático do Safari.
- [ ] iPhone/Android: navegação inferior com cinco destinos sem corte de labels.
- [ ] Android/tablet: largura, orientação e alinhamento do cabeçalho/conteúdo.
- [ ] Tema escuro: contraste, `theme-color` e consistência geral.
- [ ] Desktop: confirmar painéis, tabelas e sidebar sem regressão.
- [ ] 320/375/390/430 px: confirmar ausência de overflow horizontal.

## P1 — Mercado

- [x] Implementar fallback quando `imageUrl` existe mas a imagem remota falha.
- [x] Manter área da fotografia estável, sem cartão vazio ou deformado.
- [x] Adicionar skeleton discreto durante carregamento.
- [x] Usar fallback visual com texto `Imagem indisponível` nas miniaturas móveis adequadas.
- [x] Desativar ampliação quando a fotografia remota falha e restaurar o controlo quando a imagem volta a ficar válida.
- [x] Reflow da grelha de produtos para 2 colunas até 430 px, evitando cartões demasiado estreitos.
- [ ] Validar em hardware imagens oficiais Continente/Pingo Doce com rede lenta, offline e URL quebrado.

## P1 — QA e publicação

- [x] Adicionar `tests/v75-stability.test.cjs`.
- [x] Sintaxe CI: incluir `v74-experience.js`, `v75-architecture.js` e `v75-stability.js`.
- [x] Verificação Pages: incluir `v75-architecture.test.cjs` e `v75-stability.test.cjs`.
- [x] Confirmar CI completo verde sobre a revisão integrada em `main`.
- [x] Confirmar deploy Pages concluído com sucesso sobre a revisão integrada em `main`.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver `v75-stability.css` no sistema visual consolidado de uma release futura, em vez de acumular camadas indefinidamente.
- [ ] Remover resíduos apenas após confirmar que não existem referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
