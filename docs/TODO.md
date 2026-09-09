# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

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

## P0 — `75-layout1`: geometria e proporção entre páginas

- [x] Criar `v75-layout-polish.css` como camada CSS-only, sem acesso a estado financeiro.
- [x] Uniformizar largura útil, ritmo vertical, padding e proporção dos painéis.
- [x] Ajustar Início para desktop largo e web compacto sem esmagar cartões/KPIs.
- [x] Ajustar Despesas e Mercado: pesquisa, ações, filtros e resumos por largura disponível.
- [x] Preservar sete colunas do Calendário com densidade adaptativa em mobile.
- [x] Ajustar Planeamento, Relatórios, Metas, Segurança, Diagnóstico e Definições aos breakpoints adequados.
- [x] Fazer formulários e button rows refluírem para uma coluna antes de ficarem apertados.
- [x] Corrigir categorias do Planeamento em ecrãs até 430 px.
- [x] Adicionar `LAYOUT_REV = 75-layout1` ao bundle Pages.
- [x] Atualizar Service Worker para cache `-stability1-layout1`.
- [x] Adicionar `tests/v75-layout-polish.test.cjs`.
- [x] Incluir o teste de layout no CI e na verificação pré-deploy Pages.
- [x] Atualizar `release-manifest.json` e documentação técnica obrigatória.
- [x] Confirmar CI completo verde na branch `fix/v75-layout-proportions`.
- [x] Integrar a revisão validada em `main`.
- [x] Confirmar CI verde no SHA integrado em `main`.
- [x] Confirmar GitHub Pages concluído sobre o SHA integrado.

## P1 — Validação física de `75-header2` + `75-stability1` + `75-layout1`

- [ ] iPhone/Safari/PWA: confirmar atualização do Service Worker e carregamento da revisão `75-layout1`.
- [ ] iPhone: safe area superior e laterais sem faixa duplicada ou salto vertical.
- [ ] iPhone: hambúrguer, título e sino alinhados numa única linha.
- [ ] iPhone: título longo com ellipsis sem colisão com o sino.
- [ ] iPhone: badge visível e centrado sem cortar no canto.
- [ ] iPhone: hambúrguer → X → hambúrguer sem deslocamento.
- [ ] iPhone: focar inputs/selects sem zoom automático do Safari.
- [ ] iPhone/Android: navegação inferior com cinco destinos sem corte de labels.
- [ ] iPhone/Android: comparar Início, Despesas, Mercado, Planeamento e Mais para confirmar margens e largura iguais.
- [ ] 320/350/375/390/430 px: confirmar Calendário sem overflow e células proporcionais.
- [ ] 320/375/390/430 px: confirmar categorias do Planeamento sem texto/valor sobreposto.
- [ ] Android/tablet: confirmar mudança natural entre uma e duas colunas sem cartões espremidos.
- [ ] Desktop 821–1120 px: confirmar grelhas reduzidas e filtros sem compressão.
- [ ] Desktop >=1121 px: confirmar KPIs, Relatórios, Metas, Segurança e Definições proporcionais.
- [ ] Tema escuro: contraste, `theme-color`, painéis, filtros e consistência geral.
- [ ] Desktop: confirmar tabelas, sidebar e diálogos sem regressão.
- [ ] Confirmar ausência de overflow horizontal em todas as páginas principais.

## P1 — Mercado

- [x] Implementar fallback quando `imageUrl` existe mas a imagem remota falha.
- [x] Manter área da fotografia estável, sem cartão vazio ou deformado.
- [x] Adicionar skeleton discreto durante carregamento.
- [x] Usar fallback visual com texto `Imagem indisponível` nas miniaturas móveis adequadas.
- [x] Desativar ampliação quando a fotografia remota falha e restaurar o controlo quando a imagem volta a ficar válida.
- [x] Reflow da grelha de produtos para 2 colunas até 430 px, evitando cartões demasiado estreitos.
- [ ] Validar em hardware imagens oficiais Continente/Pingo Doce com rede lenta, offline e URL quebrado.

## P1 — QA e publicação

- [x] `tests/v75-stability.test.cjs` mantém cobertura da camada transversal.
- [x] `tests/v75-layout-polish.test.cjs` cobre distribuição, ordem de CSS, cache e proibição de acesso ao estado financeiro.
- [x] Sintaxe CI cobre `v74-experience.js`, `v75-architecture.js` e `v75-stability.js`.
- [x] Verificação Pages repete arquitetura, estabilidade e layout antes do deploy.
- [x] Execução completa da revisão `75-layout1` terminou sem regressões nos testes financeiros, segurança, responsividade, navegação e sincronização.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver `v75-stability.css` e `v75-layout-polish.css` no sistema visual consolidado de uma release futura, evitando acumulação indefinida de camadas.
- [ ] Remover resíduos apenas após confirmar que não existem referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
