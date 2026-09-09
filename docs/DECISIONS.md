# Decisões Técnicas — Conta de Casa

Atualizado: 9 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O detalhe histórico permanece no Git e em `release-manifest.json`.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam viewport CSS; `VisualViewport` fica reservado a teclado e diálogos.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` mantém compatibilidade estrutural Safari/safe areas; releases podem acrescentar uma camada final versionada.

## D-003 — Densidade móvel sem sacrificar acessibilidade
Estado: aceite. Compactação não pode remover foco, contraste, legibilidade ou alvos de toque adequados.

## D-004 — Mercado como camada isolada
Estado: aceite. Mercado não reescreve cifragem, persistência ou núcleo financeiro sem necessidade comprovada.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não entram nos totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. Catálogo alimenta `estimatedCents`; `actualCents` representa valor efetivamente confirmado/pago.

## D-007 — Código de barras identifica produto, não prova preço
Estado: aceite. GTIN/EAN/UPC identifica artigo; preço continua estimado até confirmação.

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
Estado: aceite. `design-system.css` é a base consolidada; `ui-consistency.css` deixou de ser distribuído.

## D-023 — Cada alteração pública relevante gera revisão validável
Estado: aceite. Alterações visuais podem usar revisão interna dentro do mesmo build quando não existe mudança funcional; cache e asset versioning têm de permitir atualização real.

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
Estado: aceite e publicada. A fidelidade visual não autoriza preços, lojas, artigos ou capacidades fictícias.

## D-041 — Cabeçalho móvel minimalista e orientado à tarefa
Data: 8 de setembro de 2026 · Estado: aceite.

### Decisão

1. O cabeçalho móvel deve mostrar apenas navegação, contexto atual e notificações.
2. O bloco `Olá, Utilizador / Bem-vindo de volta!` e o avatar não pertencem ao topbar global e ficam ocultos.
3. Hambúrguer + título ficam à esquerda; `#notificationsBtn` fica como única ação à direita.
4. O sino mantém handler, badge, ARIA e semântica existentes; a alteração é visual.
5. A linha visual do header usa 60 px mais safe area superior.
6. Gradiente, sombra e efeitos devem ser discretos; evitar cartões ou ornamentos dentro da topbar.
7. O título deve truncar com ellipsis em ecrãs estreitos, sem empurrar notificações para fora do viewport.
8. Hambúrguer e sino mantêm área de toque >= 44 px, foco visível e `prefers-reduced-motion`.
9. `v75-header-refinement.css` é carregado depois de `v75-architecture.css` e não pode alterar estado da aplicação.
10. A revisão pública do cabeçalho é `75-header2`; o Service Worker usa cache distinto para invalidar a revisão anterior.

## D-042 — Correções transversais da v75 ficam numa camada final de estabilidade
Data: 8 de setembro de 2026 · Estado: aceite.

### Problema

A v75 acumulou camadas funcionais e visuais válidas, mas continuavam possíveis colisões entre breakpoints, métricas de tipografia, safe areas, controlos mobile, tabelas, diálogos e imagens remotas do Mercado. Corrigir estes problemas diretamente em `core.js` ou `finance.js` aumentaria risco sem relação com a causa.

### Decisão

1. Criar `v75-stability.css/js` como camada de estabilidade do bundle v75.
2. Limitar a camada a apresentação, responsividade, acessibilidade e estados visuais.
3. Não ler nem escrever `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB, cofre ou sincronização.
4. Uniformizar tipografia com a stack nativa do sistema para evitar dependência de fontes não distribuídas.
5. Em mobile, inputs/selects/textarea usam 16 px para evitar zoom automático do Safari.
6. Safe areas horizontais passam a ser consideradas no header, conteúdo e navegação inferior, além das áreas superior/inferior já existentes.
7. A barra inferior preserva exatamente cinco destinos e alvos de toque adequados.
8. Falha de fotografia remota no Mercado é um estado visual explícito (`Imagem indisponível`), nunca remoção do artigo nem alteração de preço.
9. `theme-color` acompanha tema e cabeçalho visível para reduzir discrepâncias entre Safari/PWA e a aplicação.
10. A revisão é `75-stability1`; o cache recebe o sufixo `-stability1`.
11. CI e verificação pré-deploy devem cobrir a mesma arquitetura v74/v75, incluindo a camada e respetivo teste.
12. A camada deve ser consolidada numa futura release apenas depois de validação real em hardware; não remover regras históricas sem prova de que deixaram de ser referenciadas.

## D-043 — Geometria de páginas é uma responsabilidade CSS separada
Data: 9 de setembro de 2026 · Estado: aceite.

### Problema

As páginas já partilhavam identidade visual e regras de estabilidade, mas os componentes continuavam a herdar grelhas genéricas de épocas diferentes. Isso podia produzir páginas com larguras, proporções e densidades diferentes, sobretudo entre desktop largo, web compacto e telemóvel. Alterar lógica de renderização ou núcleo financeiro para corrigir geometria seria risco desnecessário.

### Decisão

1. Criar `v75-layout-polish.css` como camada CSS-only carregada depois de `v75-stability.css`.
2. A revisão chama-se `75-layout1` e não altera o build funcional `v75`.
3. Todas as páginas usam uma coluna de conteúdo comum no desktop, com máximo de 1280 px e padding fluido.
4. Grelhas reduzem colunas antes de comprimir cartões, formulários ou textos abaixo de uma largura útil adequada.
5. Início, Despesas, Calendário, Mercado, Planeamento, Relatórios, Metas, Segurança, Diagnóstico e Definições recebem regras espaciais específicas quando a estrutura de informação o exige.
6. Tablet/web compacto (`821–1120px`) é tratado separadamente do desktop largo para evitar saltos bruscos de densidade.
7. Mobile continua a usar o breakpoint funcional de 820 px, com refinamentos adicionais em 540, 430 e 350 px.
8. A camada não pode referenciar `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB ou operações de persistência.
9. A camada não cria rotas, dados, preços, lojas, handlers ou capacidades; só altera geometria e apresentação.
10. O Service Worker e `prepare-pages.cjs` devem versionar e distribuir `v75-layout-polish.css` explicitamente para evitar cache antigo.
11. CI e Pages devem executar `tests/v75-layout-polish.test.cjs` antes de publicação.
12. Esta camada não substitui a validação em hardware real; qualquer consolidação futura em `design-system.css` só deve ocorrer depois de testes físicos e prova de ausência de regressões.

## D-044 — Drawer móvel usa painel azul à direita com página clara visível
Data: 9 de setembro de 2026 · Estado: substituída por D-045.

A revisão `75-drawer1` estabeleceu a composição espacial correta: página clara visível, drawer à direita, largura limitada, X no canto superior direito, rodapé integrado e sem segunda navegação. O azul saturado foi posteriormente substituído para recuperar coerência cromática com o resto da aplicação.

## D-045 — Drawer móvel partilha a paleta do cabeçalho
Data: 9 de setembro de 2026 · Estado: aceite.

### Problema

A validação visual mostrou que o drawer azul de `75-drawer1`, embora próximo da referência estrutural, destoava do cabeçalho e da identidade verde-petróleo/teal já consolidada na aplicação. O menu passava a parecer um produto visual diferente.

### Decisão

1. Manter integralmente a estrutura espacial aprovada em `75-drawer1`: lado direito, página clara visível, largura limitada, cantos internos arredondados e backdrop leve.
2. Substituir a camada por `v75-drawer-theme.css` com revisão `75-drawer2`.
3. Usar exatamente a mesma família cromática de `75-header2`: `#003f4c`, `#005965` e `#087a78`.
4. Usar `#5be0c2` apenas como acento de foco, seleção e detalhe; não transformar o menu num painel verde claro.
5. Manter ícones e labels em branco/opacidades controladas para contraste consistente.
6. Manter item ativo translúcido e evitar cartões brancos dentro do drawer.
7. `mobile-menu-toggle.js` não é alterado; hambúrguer/X, swipe pela direita, Escape, foco, ARIA e scroll interno continuam a ser o contrato funcional.
8. `v75-drawer-blue.css` deixa de integrar o bundle público e é substituído pela camada neutra `v75-drawer-theme.css`.
9. `DRAWER_REV = 75-drawer2` e o Service Worker recebe novo cache para impedir reutilização da revisão azul.
10. CI e Pages passam a executar `tests/v75-drawer-theme.test.cjs`, incluindo uma verificação explícita de correspondência entre a paleta do drawer e a do cabeçalho.
11. A camada continua proibida de aceder a `appState`, montantes, IndexedDB, persistência, cifragem, QR, Mercado ou sincronização.

## D-046 — Destaques do Mercado usam carrossel largo e fallback local, sem inventar imagens
Data: 9 de setembro de 2026 · Estado: aceite.

### Problema

O bloco móvel **Produtos em destaque** continuava a usar a grelha histórica de três colunas e uma área de imagem de 66 px. Em iPhone, nomes reais ficavam partidos verticalmente, preço e categoria perdiam hierarquia e a ausência de fotografia deixava o cartão visualmente vazio. Isto não correspondia ao protótipo aprovado.

### Decisão

1. Criar `v75-market-featured.css/js` com revisão `75-featured1`, sem reescrever `v74-experience.js` nem o núcleo financeiro.
2. Reutilizar os mesmos itens pendentes, `data-edit-market` e `data-v74-market-browser`; não criar catálogo ou handlers paralelos.
3. Em mobile, substituir a grelha de três colunas por carrossel horizontal com cartão de cerca de 78–84% do viewport e `scroll-snap`.
4. Reservar 140–154 px para a imagem, manter nome em no máximo duas linhas, preço em linha própria e categoria em pill.
5. Como os destaques atuais já pertencem à lista, o rodapé indica **Na sua lista** em vez de simular **Adicionar à lista**.
6. Se existir URL de imagem válida, mostrar a fotografia com `object-fit: contain` e skeleton durante o carregamento.
7. Se a imagem falhar ou não existir, mostrar fallback vetorial local por categoria; nunca mostrar broken-image icon nem deixar o cartão deformado.
8. Se houver `productCode` GTIN válido, a camada pode consultar o Open Food Facts apenas por esse GTIN para tentar recuperar uma imagem. A imagem recuperada é apenas de apresentação e não é persistida pela camada.
9. Não enviar automaticamente nomes da lista para serviços externos para procurar fotografias.
10. Aceitar apenas hosts de imagem explicitamente validados: `images.openfoodfacts.org`, paths oficiais do Continente em `www.continente.pt` e paths oficiais do Pingo Doce em `static.pingodoce.pt`.
11. `v75-market-featured.js` pode ler `appState.market` para compor o cartão, mas não pode chamar `commit()`, `saveState()`, substituir `appState` ou escrever montantes.
12. Adicionar `FEATURED_REV = 75-featured1`, novo sufixo de cache e `tests/v75-market-featured.test.cjs`; CI e Pages devem validar a revisão antes da publicação.
