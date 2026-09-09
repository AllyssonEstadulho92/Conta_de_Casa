# Decisões Técnicas — Conta de Casa

Atualizado: 9 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O detalhe histórico permanece no Git e em `release-manifest.json`.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam viewport CSS; `VisualViewport` fica reservado a teclado e diálogos.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` mantém compatibilidade Safari/safe areas; releases podem acrescentar uma camada final versionada.

## D-003 — Densidade móvel sem sacrificar acessibilidade
Estado: aceite. Compactação não pode remover foco, contraste, legibilidade ou alvos tácteis adequados.

## D-004 — Mercado como camada isolada
Estado: aceite. Mercado não reescreve cifragem, persistência financeira ou núcleo de cálculos sem necessidade comprovada.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não entram nos totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. Pesquisa pode alimentar `estimatedCents`; `actualCents` representa valor confirmado/pago.

## D-007 — Código de barras/PID identifica produto, não prova preço
Estado: aceite. GTIN/EAN/UPC/PID identifica artigo; preço continua independente e sujeito a confirmação.

## D-008 — Lucide como sistema vetorial oficial
Estado: aceite. Ícones são locais, auditáveis e sem icon font/CDN em runtime.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Hierarquia móvel consistente
Estado: aceite. Informação secundária pode usar progressive disclosure para não bloquear a tarefa principal.

## D-011 — Cofre não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta autenticação/biometria que não exista no produto.

## D-012 — Fotografia é independente do preço
Estado: aceite. Imagem nunca prova preço nem transação.

## D-013 — Atualização usa Service Worker same-origin
Estado: aceite. Releases são distribuídas pela própria PWA e instaladas de forma controlada.

## D-018 — Mercado é `text-first`; fotografia é opcional
Estado: aceite. Nome, embalagem, loja, categoria, estado e preço identificam o artigo; fotografia verificada é apoio visual.

## D-021 — Lista de compras é agrupada sem alterar o modelo
Estado: aceite. Agrupamento e disclosures reutilizam os mesmos itens, IDs e handlers.

## D-022 — Colisões visuais devem ser consolidadas
Estado: aceite. `design-system.css` é a base consolidada; camadas históricas só podem ser removidas após prova de ausência de referências.

## D-023 — Cada alteração pública relevante gera revisão validável
Estado: aceite. Alterações podem usar revisão interna no mesmo build; cache e asset versioning têm de permitir atualização real.

## D-024 — Auto-adição por código de barras é conservadora
Estado: aceite. Exige correspondência forte; ambiguidade exige confirmação. Só estimativas podem ser atualizadas automaticamente.

## D-025 — Faturas recorrentes futuras começam como `Por preencher`
Estado: aceite. Ocorrências novas não inventam montantes variáveis.

## D-026 — Cabeçalho móvel é fixed; `.main` continua o scroller
Estado: aceite. Safe area e offset do conteúdo são obrigatórios.

## D-030 — Versão pública e revisões internas são distintas
Estado: aceite. Uma release pode reutilizar módulos funcionais validados com revisões visuais posteriores.

## D-032 — O botão móvel é um único controlo
Estado: aceite. `#mobileMenuBtn` é o mesmo nó nos estados hambúrguer e X.

## D-033 — Refinar o drawer sem criar segunda navegação
Estado: aceite. Drawer, eventos e renderização continuam únicos.

## D-038 — Navegação lateral usa o lado direito como direção canónica
Estado: aceite. Desktop e drawer móvel permanecem alinhados com a decisão da v73.

## D-040 — v75 usa o protótipo como referência visual sem transformar demonstração em funcionalidade
Estado: aceite e publicada. Fidelidade visual não autoriza preços, lojas, artigos ou capacidades fictícias.

## D-041 — Cabeçalho móvel minimalista e orientado à tarefa
Data: 8 de setembro de 2026 · Estado: aceite.

- hambúrguer + título à esquerda;
- notificações à direita;
- sem saudação/avatar duplicados no topbar global;
- alvos de toque >= 44 px;
- `75-header2` é camada visual e não altera estado.

## D-042 — Correções transversais da v75 ficam numa camada final de estabilidade
Data: 8 de setembro de 2026 · Estado: aceite.

`v75-stability.css/js` trata apresentação, responsividade, acessibilidade, safe areas e estados visuais sem ler/escrever estado financeiro. Revisão `75-stability1`.

## D-043 — Geometria de páginas é uma responsabilidade CSS separada
Data: 9 de setembro de 2026 · Estado: aceite.

`v75-layout-polish.css` (`75-layout1`) uniformiza largura útil, margens, ritmo, grelhas e breakpoints sem criar rotas, dados, preços ou handlers.

## D-044 — Drawer móvel azul à direita
Data: 9 de setembro de 2026 · Estado: substituída por D-045.

A composição espacial foi mantida, mas a cor azul foi substituída para recuperar coerência com a identidade da aplicação.

## D-045 — Drawer móvel partilha a paleta do cabeçalho
Data: 9 de setembro de 2026 · Estado: aceite.

`v75-drawer-theme.css` (`75-drawer2`) mantém o drawer à direita, página clara visível, hambúrguer/X, swipe, Escape, foco e ARIA. Paleta canónica: `#003f4c`, `#005965`, `#087a78`; menta `#5be0c2` apenas como acento.

## D-046 — Destaques do Mercado usam carrossel largo e fallback local
Data: 9 de setembro de 2026 · Estado: aceite.

`v75-market-featured.css/js` (`75-featured1`) transforma os destaques móveis em carrossel largo sem criar catálogo paralelo nem alterar montantes. Imagem pode ser recuperada por GTIN quando existe; nomes não são enviados automaticamente para procura de imagem.

## D-047 — Fotografias oficiais são indexadas por retalhista + PID numa biblioteca separada
Data: 9 de setembro de 2026 · Estado: aceite.

### Problema

O pipeline resolvia fotografias oficiais, mas podia repetir consultas e perder a fotografia entre sessões. Copiar em massa os binários dos retalhistas para o repositório seria pesado, rapidamente obsoleto e inadequado para a arquitetura.

### Decisão

1. `market-image-library.js` usa revisão `75-image-library1`.
2. A base `conta-de-casa-market-image-library` é separada do estado financeiro.
3. A chave canónica é `marketId|pid`; nome textual nunca identifica sozinho uma imagem.
4. Só são guardados metadados e URL oficial validada, nunca binários copiados.
5. Continente: `www.continente.pt` + `Sites-col-master-catalog` + PID exato.
6. Pingo Doce: `static.pingodoce.pt` + `Sites-pingo-doce-master` + tamanho oficial + PID exato.
7. Entradas positivas expiram após 45 dias.
8. Falha/expiração regressa ao pipeline/fallback sem alterar artigo ou preço.
9. O módulo não pode referenciar `appState`, `saveState()`, `commit()`, cofre, pagamentos ou sincronização financeira.
10. “Biblioteca de todas as imagens” significa biblioteca extensível dos SKUs efetivamente encontrados e validados; não se declara cobertura integral de um catálogo dinâmico sem fonte oficial exaustiva/autorizada.

## D-048 — Catálogo visual cresce progressivamente com SKUs reais, sem armazenar preços
Data: 9 de setembro de 2026 · Estado: aceite para `75-catalog1`.

### Problema

A biblioteca de imagens só cresce quando um SKU é encontrado. Para obter uma experiência de Mercado mais rica, é útil antecipar produtos por categorias e ir formando um catálogo local de centenas/milhares de SKUs. Fazer crawling massivo dos sites, guardar preços antigos ou associar produtos apenas por nome criaria risco técnico, de dados obsoletos e de correspondência incorreta.

### Decisão

1. Criar `market-visual-catalog.js/css` com revisão `75-catalog1`.
2. Criar IndexedDB própria `conta-de-casa-market-visual-catalog`, separada das bases financeira e de imagens.
3. A identidade continua `marketId|pid`; deduplicação por nome é proibida.
4. O índice local guarda nome, embalagem, categorias, URL oficial e timestamps; **não guarda preço**.
5. O catálogo começa com 12 grupos úteis: Bebidas, Lacticínios e ovos, Frutas e legumes, Carne e peixe, Padaria e pastelaria, Mercearia/Despensa, Congelados, Snacks e doces, Higiene pessoal, Limpeza, Bebé e Animais.
6. Os termos de categoria são seeds de descoberta da aplicação, não taxonomia oficial dos retalhistas.
7. A descoberta usa exclusivamente o pipeline real suportado para Continente e Pingo Doce; resultados exigem PID e URL oficial coerentes.
8. Enriquecimento automático é limitado a 18 pesquisas por sessão, 48 por dia e intervalo mínimo de 15 s; só uma pesquisa Cesta pode estar em voo.
9. Enriquecimento de imagens é ainda mais lento: máximo de 20 tentativas por sessão, intervalo de 8 s e resolução direta com concorrência máxima 2.
10. Não executar enriquecimento quando offline, quando a página está oculta ou quando `Save-Data` está ativo.
11. Persistir cursor de descoberta para que sessões seguintes continuem noutros termos, permitindo crescimento progressivo sem crawling agressivo.
12. Criar `market-catalog-image-resolver.js` para aproveitar a URL exata do produto e tentar a imagem oficial sem repetir uma pesquisa por nome; se falhar, usar o resolvedor oficial existente.
13. Imagens continuam a passar pelos validadores estritos de domínio/path/PID e são guardadas pela `75-image-library1`.
14. Ao tocar num produto, a ação **Ver preço atual** reutiliza `#marketCatalogSearch` e o evento `input`; o preço volta a ser consultado pela pesquisa viva existente.
15. O catálogo não pode referenciar `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents` ou `amountCents`.
16. `CATALOG_REV = 75-catalog1`; Service Worker e Pages devem versionar/distribuir os novos assets.
17. CI e Pages devem executar `tests/market-visual-catalog.test.cjs` antes de publicação.
18. Não declarar “todos os produtos” ou “milhares já carregados” sem medição real da base local; a arquitetura permite acumulação progressiva, não cobertura instantânea garantida.
