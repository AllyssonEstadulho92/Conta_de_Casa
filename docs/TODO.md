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
- [x] Confirmar CI completo verde na branch `fix/v75-featured-prototype`.
- [x] Integrar a revisão validada em `main`.
- [x] Confirmar CI de `main` no SHA funcional `998bb19476e175647d4aad395008b8188e9c13f1`.
- [x] Confirmar GitHub Pages concluído sobre o mesmo SHA funcional.

## P0 — `75-image-library1`: biblioteca persistente de fotografias oficiais

- [x] Rever o pipeline real de Continente/Pingo Doce antes de alterar a arquitetura.
- [x] Criar `market-image-library.js` numa camada separada do estado financeiro.
- [x] Criar IndexedDB própria `conta-de-casa-market-image-library`.
- [x] Indexar cada fotografia por `marketId|pid`, nunca apenas pelo nome do produto.
- [x] Validar estritamente URLs oficiais do Continente por host, catálogo e PID.
- [x] Validar estritamente URLs oficiais do Pingo Doce por host, catálogo, tamanho e PID.
- [x] Guardar apenas metadados/URL oficial validado, sem copiar binários dos retalhistas para o repositório.
- [x] Definir expiração de 45 dias para revalidar referências antigas.
- [x] Capturar automaticamente imagens oficiais já resolvidas nos cartões do catálogo.
- [x] Reutilizar a imagem da biblioteca quando o mesmo SKU volta a aparecer.
- [x] Manter fallback `Imagem indisponível` quando a fotografia não existe, expira ou falha.
- [x] Garantir ausência de acesso a `appState`, `saveState()`, `commit()`, montantes, cofre e sincronização financeira.
- [x] Criar `IMAGE_LIBRARY_REV = 75-image-library1`.
- [x] Adicionar `market-image-library.js` ao bundle público antes da política/bridge de imagens.
- [x] Atualizar Service Worker para cache `-image-library1`.
- [x] Criar `tests/market-image-library.test.cjs`.
- [x] Atualizar CI e Pages para validar sintaxe, isolamento, distribuição e cache.
- [x] Confirmar CI final verde na branch no SHA `5f7b051c2b767c71581b4dc86054f502629a54cd`.
- [x] Integrar `75-image-library1` em `main` por fast-forward no mesmo SHA.
- [x] Confirmar CI de `main` concluído com sucesso no SHA `5f7b051c2b767c71581b4dc86054f502629a54cd`.
- [x] Confirmar GitHub Pages concluído com sucesso sobre o mesmo SHA.

## P1 — Validação física de `75-image-library1`

- [ ] iPhone/Safari/PWA: confirmar instalação do novo Service Worker/cache.
- [ ] Pesquisar um SKU com fotografia oficial e voltar a pesquisá-lo depois de reabrir a aplicação.
- [ ] Confirmar que a fotografia reaparece para o mesmo PID sem troca entre produtos.
- [ ] Confirmar que Continente e Pingo Doce permanecem isolados por `marketId|pid`.
- [ ] Confirmar que URL inválida/expirada regressa ao fallback sem cartão quebrado.
- [ ] Confirmar funcionamento aceitável em rede lenta e offline parcial.
- [ ] Confirmar que o armazenamento indisponível/privado não bloqueia a pesquisa do Mercado.
- [ ] Confirmar que nenhum preço, quantidade ou estado de compra é alterado pela biblioteca.

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
- [x] Biblioteca persistente de metadados oficiais por SKU em `75-image-library1`.
- [ ] Validar Continente/Pingo Doce em rede lenta, offline e URL quebrado.
- [ ] Avaliar futuramente uma fonte oficial/autorizada exaustiva se for necessária cobertura integral antecipada do catálogo, sem crawling agressivo.

## P1 — QA e publicação

- [x] `tests/v75-stability.test.cjs`.
- [x] `tests/v75-layout-polish.test.cjs`.
- [x] `tests/v75-drawer-theme.test.cjs`.
- [x] `tests/v75-market-featured.test.cjs`.
- [x] `tests/market-image-library.test.cjs`.
- [x] CI cobre arquitetura, estabilidade, layout, drawer, destaques e biblioteca de imagens.
- [x] Pages repete a validação antes do deploy.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver as camadas v75 estáveis no sistema visual consolidado de uma release futura.
- [ ] Remover resíduos apenas após confirmar ausência de referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
