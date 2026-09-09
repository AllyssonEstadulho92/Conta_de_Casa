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
- [x] Criar `75-drawer2` para alinhar o drawer com a paleta petróleo/teal da aplicação.

## P0 — `75-featured1`: Produtos em destaque alinhados com o protótipo

- [x] Confirmar a causa visual: três colunas mobile e imagem de 66 px da experiência v74.
- [x] Criar `v75-market-featured.css` sem alterar cálculos ou estado.
- [x] Criar `v75-market-featured.js` sobre os mesmos itens e handlers existentes.
- [x] Substituir no mobile a grelha apertada por carrossel horizontal com `scroll-snap`.
- [x] Definir cartão com 78–84% do viewport e área de imagem de 140–154 px.
- [x] Limitar nome do produto a duas linhas e separar preço/categoria.
- [x] Adicionar category pill e rodapé `Na sua lista`.
- [x] Criar fallback vetorial local `Imagem indisponível` para evitar cartões vazios/deformados.
- [x] Manter skeleton enquanto a fotografia carrega.
- [x] Reutilizar imagem já validada quando disponível.
- [x] Tentar recuperar imagem por GTIN no Open Food Facts quando existe `productCode`, sem persistir pela camada.
- [x] Não enviar automaticamente nomes da lista para procurar fotografias.
- [x] Adicionar controlos anterior/seguinte e indicadores de posição.
- [x] Manter `Ver todos` ligado à pesquisa real do Mercado.
- [x] Manter clique no cartão ligado ao item real através de `data-edit-market`.
- [x] Criar `FEATURED_REV = 75-featured1`.
- [x] Atualizar Service Worker para cache `-drawer2-featured1`.
- [x] Criar `tests/v75-market-featured.test.cjs`.
- [x] Atualizar CI e Pages para sintaxe e teste da nova camada.
- [x] Atualizar documentação técnica obrigatória.
- [ ] Confirmar CI completo verde na branch `fix/v75-featured-prototype`.
- [ ] Integrar a revisão validada em `main`.
- [ ] Confirmar CI de `main` no SHA final.
- [ ] Confirmar GitHub Pages concluído sobre o SHA final.

## P1 — Validação física de `75-featured1`

- [ ] iPhone/Safari/PWA: confirmar atualização do Service Worker e carregamento de `75-featured1`.
- [ ] Confirmar que já não aparecem três cartões espremidos lado a lado.
- [ ] Confirmar swipe horizontal e `scroll-snap` natural.
- [ ] Confirmar que o cartão seguinte fica parcialmente visível como indicação de carrossel.
- [ ] Confirmar fotografia quando existe URL válida.
- [ ] Confirmar fallback elegante quando a fotografia não existe/falha.
- [ ] Confirmar nomes longos em no máximo duas linhas.
- [ ] Confirmar preço isolado e legível.
- [ ] Confirmar category pill sem cortar informação essencial.
- [ ] Confirmar botões anterior/seguinte e dots.
- [ ] Confirmar `Ver todos` abre o browser real do Mercado.
- [ ] Confirmar toque no cartão abre os detalhes do item real.
- [ ] Confirmar ausência de overflow horizontal fora do carrossel.
- [ ] Confirmar tema escuro, safe areas e navegação inferior.

## P1 — Validação física de `75-drawer2`

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

- [x] Fallback quando `imageUrl` falha no catálogo tradicional.
- [x] Área de fotografia estável no catálogo tradicional.
- [x] Skeleton discreto.
- [x] `Imagem indisponível` em falha remota.
- [x] Ampliação desativada quando a imagem falha.
- [x] Grelha do catálogo a duas colunas até 430 px.
- [x] Destaques móveis com fallback próprio em `75-featured1`.
- [ ] Validar Continente/Pingo Doce em rede lenta, offline e URL quebrado.

## P1 — QA e publicação

- [x] `tests/v75-stability.test.cjs`.
- [x] `tests/v75-layout-polish.test.cjs`.
- [x] `tests/v75-drawer-theme.test.cjs`.
- [x] `tests/v75-market-featured.test.cjs`.
- [x] CI cobre arquitetura, estabilidade, layout, drawer e destaques.
- [x] Pages repete a validação antes do deploy.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver as camadas v75 estáveis no sistema visual consolidado de uma release futura.
- [ ] Remover resíduos apenas após confirmar ausência de referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
