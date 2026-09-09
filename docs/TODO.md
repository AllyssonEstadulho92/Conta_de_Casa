# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — v75 publicada e estabilidade transversal

- [x] Publicar v75 em `main` com Início / Despesas / Mercado / Planeamento / Mais.
- [x] Preservar `core.js`, `finance.js`, `STATE_VERSION = 5`, IndexedDB, pagamentos, cifragem e sincronização.
- [x] Implementar `v75-architecture.css/js` sem criar lógica financeira paralela.
- [x] Manter drawer à direita e hambúrguer ↔ X.
- [x] Refinar topbar para `75-header2`.
- [x] Criar `75-stability1` para tipografia, overflow, safe areas, formulários, navegação e diálogos.
- [x] Criar `75-layout1` para geometria e proporção entre páginas.

## P0 — `75-drawer1`: composição espacial do menu

- [x] Rever o menu real no iPhone a partir da captura fornecida.
- [x] Preservar o drawer no lado direito.
- [x] Manter página clara visível atrás do menu.
- [x] Reduzir largura do drawer para preservar uma faixa da página.
- [x] Manter o mesmo `#mobileMenuBtn`, hambúrguer ↔ X, swipe, Escape, foco, safe areas e scroll.
- [x] Integrar e publicar `75-drawer1`.
- [x] Validar CI e GitHub Pages de `75-drawer1`.

`75-drawer1` fica historicamente concluído, mas a paleta azul foi substituída por `75-drawer2` após nova validação visual.

## P0 — `75-drawer2`: alinhar menu com o padrão da aplicação

- [x] Comparar a captura real com o cabeçalho atual.
- [x] Confirmar que o problema é cromático, não funcional.
- [x] Criar `v75-drawer-theme.css` como camada visual final.
- [x] Usar a mesma paleta do cabeçalho: `#003f4c`, `#005965`, `#087a78`.
- [x] Reservar `#5be0c2` para acento de seleção/foco.
- [x] Manter drawer no lado direito e a página branca visível à esquerda.
- [x] Manter item ativo translúcido, sem cartões brancos internos.
- [x] Manter `icon.svg`, Conta de Casa, X, Ocultar valores e Bloquear.
- [x] Preservar `mobile-menu-toggle.js` sem alteração.
- [x] Criar `DRAWER_REV = 75-drawer2`.
- [x] Atualizar Service Worker para cache `-drawer2`.
- [x] Retirar `v75-drawer-blue.css` da distribuição pública.
- [x] Criar `tests/v75-drawer-theme.test.cjs`.
- [x] Atualizar CI e Pages para o novo teste.
- [x] Atualizar `release-manifest.json`.
- [x] Atualizar documentação técnica obrigatória.
- [ ] Confirmar CI completo verde na branch `fix/v75-drawer-teal`.
- [ ] Integrar a revisão validada em `main`.
- [ ] Confirmar CI de `main` no SHA final.
- [ ] Confirmar GitHub Pages concluído sobre o SHA final.

## P1 — Validação física de `75-drawer2`

- [ ] iPhone/Safari/PWA: confirmar atualização do Service Worker e carregamento de `75-drawer2`.
- [ ] Confirmar gradiente petróleo/teal visualmente igual ao cabeçalho.
- [ ] Confirmar drawer a abrir exclusivamente pela direita.
- [ ] Confirmar página branca visível à esquerda do drawer.
- [ ] Confirmar largura equilibrada para labels longos.
- [ ] Confirmar logo/nome/X alinhados.
- [ ] Confirmar hambúrguer → X → hambúrguer sem deslocamento.
- [ ] Confirmar swipe pela margem direita.
- [ ] Confirmar scroll até ao rodapé.
- [ ] Confirmar safe areas superior/inferior.
- [ ] Confirmar item ativo com menta discreta e contraste adequado.
- [ ] Confirmar tema escuro e ausência de overflow horizontal.

## P1 — Validação física geral

- [ ] iPhone: focar inputs/selects sem zoom automático do Safari.
- [ ] iPhone/Android: navegação inferior com cinco destinos sem corte.
- [ ] Comparar Início, Despesas, Mercado, Planeamento e Mais para confirmar margens e largura iguais.
- [ ] 320/350/375/390/430 px: Calendário sem overflow.
- [ ] 320/375/390/430 px: Planeamento sem texto/valor sobreposto.
- [ ] Android/tablet: mudança natural entre uma e duas colunas.
- [ ] Desktop 821–1120 px: grelhas reduzidas e filtros sem compressão.
- [ ] Desktop >=1121 px: KPIs, Relatórios, Metas, Segurança e Definições proporcionais.
- [ ] Desktop: tabelas, sidebar e diálogos sem regressão.

## P1 — Mercado

- [x] Fallback quando `imageUrl` falha.
- [x] Área de fotografia estável.
- [x] Skeleton discreto.
- [x] `Imagem indisponível` em falha remota.
- [x] Ampliação desativada quando a imagem falha.
- [x] Grelha a duas colunas até 430 px.
- [ ] Validar Continente/Pingo Doce em rede lenta, offline e URL quebrado.

## P1 — QA e publicação

- [x] `tests/v75-stability.test.cjs`.
- [x] `tests/v75-layout-polish.test.cjs`.
- [x] `tests/v75-drawer-theme.test.cjs`.
- [x] CI cobre arquitetura, estabilidade, layout e drawer.
- [x] Pages repete a validação antes do deploy.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver `v75-stability.css`, `v75-layout-polish.css` e `v75-drawer-theme.css` no sistema visual consolidado de uma release futura.
- [ ] Remover resíduos apenas após confirmar ausência de referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
