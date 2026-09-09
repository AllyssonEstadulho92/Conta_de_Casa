# TODO — Conta de Casa

Atualizado: 9 de setembro de 2026

## P0 — v75 publicada e estabilidade transversal

- [x] Publicar v75 em `main` com Início / Despesas / Mercado / Planeamento / Mais.
- [x] Preservar `core.js`, `finance.js`, `STATE_VERSION = 5`, IndexedDB, pagamentos, cifragem e sincronização.
- [x] `75-header2`: cabeçalho móvel minimalista.
- [x] `75-stability1`: estabilidade transversal.
- [x] `75-layout1`: geometria e proporção entre páginas.
- [x] `75-drawer2`: drawer à direita alinhado com a paleta petróleo/teal.
- [x] `75-featured1`: Produtos em destaque em carrossel móvel.
- [x] `75-image-library1`: biblioteca persistente de fotografias oficiais por SKU.

## P0 — `75-catalog1`: catálogo visual progressivo

- [x] Rever a arquitetura real do Mercado e da `75-image-library1` antes de alterar código.
- [x] Criar `market-visual-catalog.js` numa camada separada do estado financeiro.
- [x] Criar `market-visual-catalog.css` responsivo e acessível.
- [x] Criar `market-catalog-image-resolver.js` para usar a URL oficial exata do produto.
- [x] Criar IndexedDB `conta-de-casa-market-visual-catalog` com stores `products` e `meta`.
- [x] Identificar/deduplicar SKUs por `marketId|pid`.
- [x] Não guardar preço no catálogo visual.
- [x] Criar 12 grupos iniciais: Bebidas, Lacticínios e ovos, Frutas e legumes, Carne e peixe, Padaria e pastelaria, Mercearia/Despensa, Congelados, Snacks e doces, Higiene pessoal, Limpeza, Bebé e Animais.
- [x] Pesquisar apenas Continente e Pingo Doce através do pipeline `cesta.pt` já suportado.
- [x] Exigir PID + URL oficial coerentes antes de indexar.
- [x] Limitar pesquisa automática a 18 por sessão e 48 por dia.
- [x] Aplicar intervalo de 15 s e impedir pesquisas Cesta concorrentes.
- [x] Suspender enriquecimento quando offline, página oculta ou `Save-Data` ativo.
- [x] Persistir cursor de seeds para continuar a descoberta entre sessões.
- [x] Limitar enriquecimento de imagem a 20 tentativas por sessão, 8 s entre passos e concorrência 2.
- [x] Reutilizar `75-image-library1` e os validadores oficiais existentes.
- [x] Criar ação **Ver preço atual** que delega à pesquisa viva existente em vez de usar preço armazenado.
- [x] Criar filtros Todos / Continente / Pingo Doce.
- [x] Mostrar estatísticas de produtos indexados e imagens validadas.
- [x] Criar fallback visual local quando ainda não existe imagem oficial validada.
- [x] Criar grelha 3 colunas desktop, 2 colunas até 680 px e 1 coluna em ecrãs muito estreitos.
- [x] Garantir ausência de `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents` e `amountCents` nos novos módulos.
- [x] Criar `CATALOG_REV = 75-catalog1`.
- [x] Atualizar Service Worker para cache `-image-library1-catalog1`.
- [x] Criar `tests/market-visual-catalog.test.cjs`.
- [x] Integrar o teste em CI e Pages.
- [x] Corrigir a única falha inicial do novo teste (regex da chave exata; código funcional não falhou).
- [x] Confirmar CI completo verde na branch no SHA técnico `8e5d61c3c68771cd3e1cd5990cbe201e30fb7baa`.
- [x] Atualizar documentação técnica obrigatória para estado pré-integração.
- [ ] Atualizar `release-manifest.json` com `75-catalog1`.
- [ ] Confirmar CI final verde depois da documentação/release manifest.
- [ ] Comparar branch com `main` e confirmar fast-forward seguro.
- [ ] Integrar `75-catalog1` em `main` sem force.
- [ ] Confirmar CI de `main` no SHA integrado.
- [ ] Confirmar GitHub Pages concluído sobre o SHA integrado.
- [ ] Fechar documentação como publicada no SHA final.

## P1 — Validação física de `75-catalog1`

- [ ] iPhone/Safari/PWA: confirmar atualização para cache `-catalog1`.
- [ ] Confirmar que **Catálogo visual** aparece uma única vez na página Mercado.
- [ ] Confirmar categorias e scroll horizontal da faixa de categorias.
- [ ] Confirmar filtro Todos / Continente / Pingo Doce.
- [ ] Confirmar contador de produtos indexados/imagens validadas.
- [ ] Confirmar que produtos vão surgindo progressivamente entre sessões.
- [ ] Confirmar que um mesmo `marketId|pid` não duplica.
- [ ] Confirmar imagem correta por PID no Continente.
- [ ] Confirmar imagem correta por PID no Pingo Doce.
- [ ] Confirmar fallback limpo quando ainda não há imagem.
- [ ] Confirmar **Ver preço atual** a abrir/disparar a pesquisa viva e não um preço armazenado.
- [ ] Confirmar que nenhum preço/quantidade/estado financeiro muda ao navegar pelo catálogo.
- [ ] Confirmar que modo offline não inicia enriquecimento.
- [ ] Confirmar comportamento com `Save-Data` quando disponível.
- [ ] Confirmar que background não continua a enriquecer com a página oculta.
- [ ] Rede lenta: confirmar que cartões existentes continuam utilizáveis.
- [ ] 320/350/375/390/430 px: sem overflow horizontal da página.
- [ ] Tablet/desktop: 2/3 colunas proporcionais, foco e teclado corretos.
- [ ] Tema escuro: contraste e fallback legíveis.

## P1 — Validação física de `75-image-library1`

- [ ] Pesquisar novamente um SKU depois de reabrir a PWA e confirmar reutilização da fotografia.
- [ ] Confirmar isolamento Continente/Pingo Doce por `marketId|pid`.
- [ ] Confirmar URL inválida/expirada a regressar ao fallback.
- [ ] Confirmar armazenamento privado/indisponível sem bloquear o Mercado.

## P1 — Validação física geral

- [ ] iPhone: inputs/selects sem zoom automático do Safari.
- [ ] iPhone/Android: navegação inferior com cinco destinos sem corte.
- [ ] Comparar margens de Início, Despesas, Mercado, Planeamento e Mais.
- [ ] 320/350/375/390/430 px: Calendário e Planeamento sem overflow/sobreposição.
- [ ] Android/tablet: transição natural entre colunas.
- [ ] Desktop 821–1120 px: grelhas/filtros sem compressão.
- [ ] Desktop >=1121 px: KPIs e painéis proporcionais.
- [ ] Desktop: tabelas, sidebar e diálogos sem regressão.
- [ ] `75-featured1`: carrossel, swipe, dots, imagens/fallback e **Ver todos**.
- [ ] `75-drawer2`: abertura pela direita, swipe, safe areas, foco e paleta.

## P1 — Mercado

- [x] Fallback para imagem remota falhada.
- [x] Área de fotografia estável e skeleton.
- [x] Grelha tradicional a duas colunas até 430 px.
- [x] Destaques móveis em `75-featured1`.
- [x] Biblioteca persistente de imagens em `75-image-library1`.
- [x] Catálogo visual progressivo e limitado em `75-catalog1`.
- [ ] Validar Continente/Pingo Doce em rede lenta, offline e URL quebrada.
- [ ] Medir crescimento real da base por categoria após várias sessões; não declarar cobertura integral sem dados.
- [ ] Se for necessária cobertura integral antecipada, avaliar uma fonte oficial/autorizada exaustiva em vez de crawling agressivo.

## P1 — QA e publicação

- [x] `tests/v75-stability.test.cjs`.
- [x] `tests/v75-layout-polish.test.cjs`.
- [x] `tests/v75-drawer-theme.test.cjs`.
- [x] `tests/v75-market-featured.test.cjs`.
- [x] `tests/market-image-library.test.cjs`.
- [x] `tests/market-visual-catalog.test.cjs`.
- [x] CI cobre arquitetura, estabilidade, layout, drawer, destaques, biblioteca de imagens e catálogo visual.
- [x] Pages repete a validação antes do deploy.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar regras financeiras.
- [ ] Depois da validação real, absorver as camadas v75 estáveis no sistema visual consolidado de uma release futura.
- [ ] Remover resíduos apenas após confirmar ausência de referências funcionais.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter `PROJECT_STATE.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `TODO.md` e `CHANGELOG.md` sincronizados em cada alteração relevante.
