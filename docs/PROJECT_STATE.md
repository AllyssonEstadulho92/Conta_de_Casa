# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público atual: `v75`
Revisão transversal publicada: `75-stability1`
Revisão de geometria em validação: `75-layout1`
Branch de trabalho: `fix/v75-layout-proportions`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão publicada `75-stability1` continua responsável por tipografia, safe areas, overflow, formulários, navegação, diálogos e estados visuais do Mercado. A nova revisão `75-layout1` foi criada separadamente para corrigir geometria, proporções, largura útil, distribuição de colunas e alinhamento entre páginas sem alterar `core.js`, `finance.js`, persistência, cifragem ou regras financeiras.

## Revisão `75-layout1`

A camada `v75-layout-polish.css` é CSS-only e carrega depois de `v75-stability.css`. O objetivo é fazer cada página usar a largura e as proporções adequadas ao espaço disponível, em vez de depender apenas das grelhas históricas genéricas.

Principais regras:

- coluna de conteúdo comum de até 1280 px no desktop;
- espaçamento vertical e padding de painéis uniformizados;
- Início com redistribuição proporcional dos painéis e redução de colunas em web compacto;
- Despesas e Mercado com pesquisa, ação e filtros dimensionados sem comprimir campos;
- Calendário com sete colunas preservadas, mas células adaptadas por breakpoint;
- Planeamento, Relatórios e Diagnóstico com proporção desktop equilibrada e reflow para uma coluna em mobile;
- Metas com grelha `auto-fit`, evitando cartões demasiado estreitos;
- Segurança e Sincronização com grelhas coerentes, formulários de duas colunas apenas quando há largura suficiente;
- Definições centradas no desktop;
- toolbars, button rows, tabs, detail grids e panel heads com comportamento previsível em tablet/telemóvel;
- categorias do Planeamento reorganizadas em ecrãs estreitos para evitar valores e barras espremidos;
- cartões do cofre, diálogos e quick actions mantêm a mesma coluna visual do produto.

A revisão não contém referências a `appState`, `estimatedCents`, `actualCents`, IndexedDB ou funções de persistência.

## Cabeçalho e navegação preservados

O cabeçalho móvel `75-header2` permanece minimalista:

- hambúrguer + título à esquerda;
- notificações à direita;
- sem saudação/avatar duplicados no topbar;
- 60 px de linha útil mais safe area;
- alvos tácteis de 44 px;
- título com ellipsis em ecrãs estreitos;
- drawer à direita e hambúrguer ↔ X preservados.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**.

## Integridade funcional preservada

Não foram modificados pela revisão de layout:

- `core.js` / persistência;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- pagamentos e histórico;
- PIN e palavra-passe;
- PBKDF2-SHA-256 + AES-GCM;
- QR fiscal e scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada;
- políticas de imagens/preços do Mercado.

## Distribuição preparada

A branch de trabalho prepara:

- `LAYOUT_REV = 75-layout1` em `scripts/prepare-pages.cjs`;
- `v75-layout-polish.css?v=75-layout1` carregado depois de `v75-stability.css`;
- cache PWA `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1`;
- teste dedicado `tests/v75-layout-polish.test.cjs`;
- CI e verificação pré-Pages configurados para executar o novo teste.

## Estado de validação

A revisão está em branch de trabalho enquanto o pipeline completo é executado. Não deve ser considerada publicada até a branch passar CI, ser integrada em `main`, o CI de `main` terminar com sucesso e o GitHub Pages concluir o deploy da revisão testada.

A validação automatizada não substitui inspeção em hardware real. Depois da publicação continuam necessários testes físicos em iPhone/Safari/PWA, Android/Chrome, tablet e desktop para confirmar proporções, safe areas, títulos, filtros, calendário, formulários, bottom navigation, drawer, tema escuro e ausência de overflow.

## Próximo passo

Concluir CI da branch `fix/v75-layout-proportions`. Se estiver verde, integrar por fast-forward em `main`, confirmar CI e Pages sobre o SHA integrado e só depois marcar `75-layout1` como publicada.
