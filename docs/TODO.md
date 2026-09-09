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

## P0 — `75-drawer1`: menu azul inspirado no protótipo

- [x] Rever o menu real no iPhone a partir da captura fornecida pelo utilizador.
- [x] Preservar a direção canónica do drawer no lado direito.
- [x] Criar `v75-drawer-blue.css` como camada visual isolada.
- [x] Manter página clara/branca visível atrás do drawer.
- [x] Reduzir a largura do menu para deixar uma faixa perceptível da página sem comprimir labels.
- [x] Aplicar painel azul com ícones/textos claros e item ativo translúcido.
- [x] Manter o mesmo `#mobileMenuBtn` e a animação hambúrguer ↔ X.
- [x] Colocar o X no canto superior direito quando o drawer está aberto.
- [x] Usar `icon.svg` e identidade real da Conta de Casa; não inventar fotografia de perfil.
- [x] Manter `Ocultar valores` e `Bloquear` no mesmo drawer.
- [x] Preservar swipe pela direita, Escape, foco, safe areas, scroll interno e `prefers-reduced-motion`.
- [x] Adicionar `DRAWER_REV = 75-drawer1` ao bundle Pages.
- [x] Atualizar Service Worker para cache `-stability1-layout1-drawer1`.
- [x] Adicionar `tests/v75-drawer-blue.test.cjs`.
- [x] Incluir o teste do drawer no CI e Pages.
- [x] Confirmar CI completo verde na branch `fix/v75-blue-right-drawer`.
- [x] Integrar a revisão validada em `main` por fast-forward.
- [ ] Confirmar CI de `main` no SHA final com toda a documentação atualizada.
- [ ] Confirmar GitHub Pages concluído sobre o SHA final.

## P1 — Validação física de `75-header2` + `75-stability1` + `75-layout1` + `75-drawer1`

- [ ] iPhone/Safari/PWA: confirmar atualização do Service Worker e carregamento de `75-drawer1`.
- [ ] iPhone: confirmar drawer azul a abrir exclusivamente pela direita.
- [ ] iPhone: confirmar que a página branca permanece visível à esquerda do drawer.
- [ ] iPhone: verificar se a largura do painel é equilibrada para labels longos.
- [ ] iPhone: confirmar logo/nome/X alinhados no cabeçalho do menu.
- [ ] iPhone: hambúrguer → X → hambúrguer sem deslocamento.
- [ ] iPhone: swipe pela margem direita continua funcional.
- [ ] iPhone: scroll do drawer permite chegar a todos os itens e ao rodapé.
- [ ] iPhone: safe area superior/inferior sem corte.
- [ ] iPhone: backdrop leve, sem transformar a página em fundo cinzento pesado.
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
- [x] `tests/v75-drawer-blue.test.cjs` cobre lado direito, proporção, gradiente, ordem de distribuição e proibição de acesso ao estado financeiro.
- [x] Sintaxe CI cobre `v74-experience.js`, `v75-architecture.js` e `v75-stability.js`.
- [x] Verificação Pages repete arquitetura, estabilidade, layout e drawer antes do deploy.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver `v75-stability.css`, `v75-layout-polish.css` e `v75-drawer-blue.css` no sistema visual consolidado de uma release futura, evitando acumulação indefinida de camadas.
- [ ] Remover resíduos apenas após confirmar que não existem referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
