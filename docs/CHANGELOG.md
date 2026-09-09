# Changelog Técnico — Conta de Casa

## 2026-09-09 — v75 `75-featured1`: Produtos em destaque alinhados com o protótipo

### Objetivo

Corrigir o bloco móvel **Produtos em destaque**, que continuava visualmente distante do protótipo aprovado: três colunas demasiado estreitas, área de imagem de 66 px, nomes partidos verticalmente e cartões pobres quando a fotografia não existia.

### Alterações

- criada `v75-market-featured.css` como camada visual específica do bloco;
- criada `v75-market-featured.js` como composição read-only sobre os mesmos itens e handlers existentes;
- a grelha de três colunas mobile passa a carrossel horizontal com `scroll-snap`;
- os cartões ocupam aproximadamente 78–84% do viewport móvel, deixando parte do seguinte visível;
- área de fotografia passa para 140–154 px conforme a largura do ecrã;
- nome do produto fica limitado a duas linhas;
- categoria passa para pill discreta e o preço fica isolado numa linha própria;
- rodapé mostra **Na sua lista**, evitando simular uma ação de adicionar num item que já está pendente;
- adicionados botões anterior/seguinte e indicadores de posição;
- imagens válidas já existentes continuam a ser utilizadas;
- quando não existe fotografia, surge fallback vetorial local por categoria com `Imagem indisponível`, em vez de broken-image icon ou cartão deformado;
- durante o carregamento existe skeleton discreto;
- se houver `productCode` GTIN válido, a camada pode consultar o Open Food Facts apenas por esse código e usar a imagem em apresentação, sem persistir o resultado;
- nomes da lista não são enviados automaticamente a serviços externos para procurar fotografias;
- URLs aceites são limitados a `images.openfoodfacts.org` e paths oficiais validados de Continente/Pingo Doce;
- `FEATURED_REV = 75-featured1` foi adicionado ao bundle Pages;
- Service Worker passa a usar cache com sufixo `-drawer2-featured1`;
- criado `tests/v75-market-featured.test.cjs`;
- CI e Pages passam a validar sintaxe e comportamento estrutural desta revisão.

### Segurança e integridade

- `v75-market-featured.js` lê os itens apenas para apresentação;
- não chama `commit()`, `saveState()`, não substitui `appState` e não altera montantes;
- `core.js`, `finance.js`, `STATE_VERSION = 5`, IndexedDB, PIN, PBKDF2-SHA-256, AES-GCM, QR, pagamentos e sincronização permanecem inalterados;
- não são criados preços, produtos ou fotografias fictícias.

### Distribuição

- revisão: `75-featured1`;
- assets: `v75-market-featured.css?v=75-featured1` e `v75-market-featured.js?v=75-featured1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1`.

## 2026-09-09 — v75 `75-drawer2`: drawer alinhado com a paleta oficial da aplicação

### Objetivo

Corrigir a inconsistência cromática observada no iPhone: o drawer `75-drawer1` tinha a composição espacial correta, mas o azul saturado destoava do cabeçalho e da identidade verde-petróleo/teal já consolidada na Conta de Casa.

### Alterações

- criada `v75-drawer-theme.css` como nova camada visual final;
- mantido o drawer no lado direito e a página clara visível à esquerda;
- mantida a largura `min(320px, calc(100vw - 72px))`;
- gradiente passa a usar `#003f4c → #005965 → #087a78`, a mesma família do cabeçalho `75-header2`;
- menta `#5be0c2` fica reservada para foco, seleção e detalhe;
- sombra e backdrop passam de azul para petróleo/teal;
- item ativo continua translúcido, sem cartão branco interno;
- `icon.svg`, Conta de Casa, X, Ocultar valores e Bloquear permanecem no mesmo drawer;
- `mobile-menu-toggle.js` não foi alterado, preservando swipe pela direita, Escape, foco, ARIA e hambúrguer ↔ X;
- `v75-drawer-blue.css` deixa de integrar o bundle público;
- `DRAWER_REV` passa a `75-drawer2`;
- Service Worker passa a usar cache com sufixo `-drawer2`;
- criado `tests/v75-drawer-theme.test.cjs`, incluindo verificação explícita da correspondência cromática entre drawer e cabeçalho;
- CI e Pages passam a executar o novo teste antes da publicação.

### Segurança e integridade

- `v75-drawer-theme.css` não referencia `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB ou persistência;
- `core.js`, `finance.js`, `STATE_VERSION = 5`, PIN, PBKDF2-SHA-256, AES-GCM, pagamentos, QR, Mercado e sincronização não foram modificados;
- a revisão não cria rotas, handlers ou uma segunda navegação.

### Distribuição

- revisão: `75-drawer2`;
- asset: `v75-drawer-theme.css?v=75-drawer2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2`.

## 2026-09-09 — v75 `75-drawer1`: drawer azul à direita inspirado no protótipo

### Objetivo

Substituir a sensação de painel branco pesado observada no menu móvel por uma composição mais próxima do protótipo fornecido: página clara visível e navegação num painel azul, mantendo a decisão estrutural do projeto de abrir o drawer pelo lado direito.

### Alterações

- criada `v75-drawer-blue.css` como camada CSS-only carregada depois de `v75-layout-polish.css`;
- drawer móvel continua ancorado à direita com `inset: 0 0 0 auto`;
- largura passa a `min(320px, calc(100vw - 72px))`, deixando uma faixa visível da página clara à esquerda;
- painel usa gradiente azul e cantos internos arredondados, sem cartões brancos internos;
- backdrop passa a ser muito leve e sem blur, preservando a leitura da página branca ao fundo;
- cabeçalho do drawer usa `icon.svg`, **Conta de Casa** e **Navegação**;
- o mesmo `#mobileMenuBtn` continua a ser reutilizado e, quando aberto, aparece no canto superior direito como X;
- grupos, ícones e labels usam branco/opacidades controladas;
- item ativo usa realce translúcido;
- `Ocultar valores` e `Bloquear` permanecem no rodapé do mesmo painel azul;
- `prefers-reduced-motion`, foco visível, safe areas, scroll interno e tema escuro foram preservados;
- `mobile-menu-toggle.js` não foi alterado, portanto swipe pela direita, Escape, foco e wiring existente continuam iguais;
- criada `DRAWER_REV = 75-drawer1` em `scripts/prepare-pages.cjs`;
- Service Worker passa a usar cache com sufixo `-stability1-layout1-drawer1`;
- criado `tests/v75-drawer-blue.test.cjs`;
- CI e Pages passam a validar a nova camada antes da publicação.

### Segurança e integridade

- `v75-drawer-blue.css` não referencia `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB ou funções de persistência;
- `core.js`, `finance.js`, `STATE_VERSION = 5`, PIN, PBKDF2-SHA-256, AES-GCM, pagamentos, QR, Mercado e sincronização não foram modificados;
- a alteração não cria rotas, labels funcionais paralelos nem uma segunda navegação.

### Validação

- CI completo da branch `fix/v75-blue-right-drawer` terminou com sucesso;
- a revisão foi integrada em `main` por fast-forward;
- CI de `main` e GitHub Pages terminaram com sucesso antes da revisão cromática `75-drawer2`.

## 2026-09-09 — v75 `75-layout1`: proporção e alinhamento transversal das páginas

### Objetivo

Uniformizar a geometria da aplicação depois da estabilização v75: largura útil, margens, ritmo vertical, grelhas, cartões, filtros, formulários e distribuição de colunas passam a adaptar-se ao tipo de página e à largura disponível sem alterar estado financeiro, persistência, cofre, QR ou sincronização.

### Alterações

- criada `v75-layout-polish.css` como camada CSS-only carregada depois de `v75-stability.css`;
- coluna útil desktop passa a ter máximo comum de 1280 px com padding fluido;
- `.page.active` usa ritmo vertical comum, eliminando diferenças de espaçamento entre páginas;
- painéis, cabeçalhos, toolbars, tabs, formulários, button rows, listas e detail grids recebem proporções coerentes;
- Início redistribui os painéis no desktop e reduz colunas em web compacto antes de comprimir conteúdo;
- KPIs do Início usam seis colunas em desktop largo e três entre 821–1120 px;
- Despesas e Mercado passam a distribuir pesquisa, botão de ação e filtros conforme a largura disponível;
- Calendário preserva sete dias, com células maiores no desktop e densidade reduzida progressivamente em smartphone;
- Planeamento, Relatórios e Diagnóstico usam duas colunas proporcionais no desktop e uma coluna no mobile;
- Metas usa `auto-fit` no desktop e uma coluna no telemóvel;
- Segurança mantém dois painéis principais no desktop e coloca Sincronização/painéis `span-2` a toda a largura; mobile usa uma coluna;
- Definições fica centrada numa coluna de leitura adequada no desktop;
- formulários de duas colunas passam para uma coluna antes de ficarem apertados;
- categorias do Planeamento reorganizam nome, valor e barra até 430 px para impedir sobreposição;
- quick dialog, cofre e cartões mobile passam a seguir a mesma coluna espacial do restante produto;
- adicionada revisão `LAYOUT_REV = 75-layout1` ao `scripts/prepare-pages.cjs`;
- Service Worker passa a usar cache com sufixo `-stability1-layout1`;
- criado `tests/v75-layout-polish.test.cjs` para validar geometria, distribuição e proibição de acesso ao estado financeiro;
- CI e Pages executam o novo teste antes da publicação.

### Segurança e integridade

- `v75-layout-polish.css` não referencia `appState`, montantes, `estimatedCents`, `actualCents`, IndexedDB ou funções de persistência;
- `core.js`, `finance.js`, `STATE_VERSION = 5`, PIN, PBKDF2-SHA-256, AES-GCM, pagamentos, QR e sincronização não foram modificados;
- preços, lojas, artigos e capacidades do Mercado não são criados nem alterados por esta revisão.

### Distribuição

- `LAYOUT_REV`: `75-layout1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1`;
- `v75-layout-polish.css?v=75-layout1` é carregado depois de `v75-stability.css?v=75-stability1`;
- CI completo da branch de trabalho terminou com sucesso;
- a revisão foi integrada por fast-forward em `main`;
- CI completo de `main` terminou com sucesso;
- GitHub Pages verificou o SHA integrado e concluiu o deploy com sucesso.

## 2026-09-08 — v75 `75-stability1`: estabilização transversal da aplicação

### Objetivo

Corrigir inconsistências ainda existentes entre páginas, tipografia, ícones, safe areas, formulários, navegação, diálogos, overflow e imagens do Mercado sem alterar regras financeiras, persistência, cofre ou sincronização.

### Alterações

- criada `v75-stability.css` como camada visual de estabilidade;
- criada `v75-stability.js` para estados visuais de imagens e sincronização de `theme-color`;
- stack tipográfica passa a usar fontes nativas do sistema, evitando depender de uma fonte não distribuída;
- flex/grid recebem contenção defensiva contra overflow e textos longos;
- safe areas esquerda/direita passam a ser consideradas em cabeçalho, conteúdo e navegação inferior;
- inputs/selects/textarea usam 16 px em mobile para evitar zoom automático do Safari;
- hambúrguer e sino ficam estabilizados em 44 px;
- barra inferior preserva cinco destinos, largura igual e labels com truncamento seguro;
- diálogos respeitam `100dvh`, safe areas e scroll próprio;
- tabelas ficam confinadas ao próprio scroll no desktop e deixam de duplicar cartões no mobile;
- fotografias do Mercado recebem `loading`, `loaded`, `error` e `empty`, skeleton e fallback `Imagem indisponível`;
- a ampliação de fotografia fica desativada durante falha remota e é restaurada quando o recurso volta a carregar corretamente;
- a grelha de produtos passa de três para duas colunas até 430 px para evitar cartões demasiado estreitos;
- falhas de imagem remota não removem artigos nem alteram preços;
- foco, `forced-colors` e `prefers-reduced-motion` foram reforçados;
- `release-manifest.json` foi alinhado com `75-header2` e `75-stability1`, removendo a descrição obsoleta da saudação no topbar;
- CI e Pages passam a validar a mesma arquitetura v74/v75, incluindo `v74-experience.js`, `v75-architecture.js`, `v75-stability.js`, `v75-architecture.test.cjs` e `v75-stability.test.cjs`.

### Distribuição

- `STABILITY_REV`: `75-stability1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1`;
- `v75-stability.css/js` são carregados depois de `v75-header-refinement.css` e `v75-architecture.js`;
- `core.js` e `finance.js` permanecem inalterados.

## 2026-09-08 — v75 `75-header2`: cabeçalho móvel refinado

### Objetivo

Reduzir ruído visual no topo da aplicação e aproximar a composição do padrão moderno definido para o protótipo, sem alterar navegação, notificações ou dados.

### Alterações

- removido visualmente do topbar o bloco `Olá, Utilizador / Bem-vindo de volta!` e o avatar;
- hambúrguer e título ficam alinhados à esquerda;
- sino de notificações permanece como única ação à direita;
- linha útil do cabeçalho passa a 60 px mais safe area superior;
- gradiente verde-petróleo/teal foi refinado com profundidade subtil;
- título usa maior definição tipográfica, letter-spacing controlado e ellipsis em ecrãs estreitos;
- hambúrguer e sino usam alvos tácteis de 44 px após a revisão transversal;
- sino recebe superfície translúcida discreta, sem virar um cartão pesado;
- badge de notificação ganha melhor contraste;
- `prefers-reduced-motion` permanece respeitado;
- `v75-header-refinement.css` continua a ser uma camada visual isolada, carregada depois da arquitetura v75.

### Distribuição

- `HEADER_REV`: `75-header2`;
- cache original do header2: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2`;
- `v75-header-refinement.css` permanece no bundle público;
- nenhum ficheiro financeiro, de cofre, QR ou sincronização foi alterado.

### Compatibilidade de atualização

O sufixo `header2` foi colocado no final da assinatura-base. `75-stability1`, `75-layout1`, `75-drawer2` e `75-featured1` acrescentam os seus próprios sufixos, preservando a sequência de invalidação de cache.

## 2026-09-08 — v75 publicada: reestruturação total alinhada com o protótipo

- publicada a camada final `v75-architecture.css/js` sobre a base funcional v74;
- identidade única em fundo claro, superfícies brancas, verde-petróleo/teal e acento menta;
- barra inferior com **Início / Despesas / Mercado / Planeamento / Mais**;
- Despesas reorganizada com filtros, pesquisa, movimentos e FAB;
- nova despesa mobile full-screen com **Manual / Ler fatura / QR Code**;
- scanner QR full-screen reutilizando `invoice-capture.js`;
- Mercado com fontes suportadas Continente e Pingo Doce;
- Planeamento, Relatórios, Mais, Sincronização, drawer e cofre alinhados com a mesma linguagem visual;
- núcleo financeiro, IndexedDB, `STATE_VERSION = 5`, pagamentos, PIN, PBKDF2-SHA-256, AES-GCM e sincronização preservados.

## 2026-09-08 — v74 publicada: novo modelo visual

- aplicado o sistema visual v74 baseado no primeiro protótipo;
- adicionados `v74-experience.css` e `v74-experience.js`;
- preservados cálculos, cofre, pagamentos, QR e sincronização.

## 2026-09-08 — v73 publicada: navegação lateral à direita

- sidebar desktop e drawer móvel reposicionados para a direita;
- swipe, ARIA, foco, Escape e hambúrguer ↔ X preservados.

## Histórico anterior

As alterações anteriores permanecem registadas no histórico Git e em `release-manifest.json`.