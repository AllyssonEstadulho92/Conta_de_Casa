# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria publicada: `75-layout1`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-layout1` está integrada em `main`, passou o pipeline completo e foi distribuída pelo GitHub Pages. É uma camada CSS-only dedicada a geometria, proporções, largura útil, distribuição de colunas e alinhamento entre páginas. Não reescreve `core.js`, `finance.js`, persistência, cifragem ou regras financeiras.

## Revisão `75-layout1`

A camada `v75-layout-polish.css` carrega depois de `v75-stability.css` e faz cada página usar a largura e as proporções adequadas ao espaço disponível.

Principais melhorias publicadas:

- coluna de conteúdo comum de até 1280 px no desktop;
- espaçamento vertical, padding e raio dos painéis uniformizados;
- Início com distribuição proporcional dos painéis e redução de colunas em web compacto;
- Despesas e Mercado com pesquisa, ações, filtros e resumos dimensionados sem comprimir campos;
- Calendário com sete colunas preservadas e densidade progressiva por breakpoint;
- Planeamento, Relatórios e Diagnóstico com duas colunas equilibradas no desktop e uma no mobile;
- Metas com grelha `auto-fit`, evitando cartões estreitos;
- Segurança e Sincronização com duas colunas apenas quando há largura útil suficiente;
- Definições centradas no desktop;
- toolbars, button rows, tabs, detail grids e panel heads com comportamento previsível;
- categorias do Planeamento reorganizadas em ecrãs estreitos para evitar texto, valor e barra sobrepostos;
- diálogos, quick actions e cofre mantêm a mesma coluna visual do restante produto.

## Cabeçalho e navegação preservados

O cabeçalho móvel `75-header2` permanece:

- hambúrguer + título à esquerda;
- notificações à direita;
- sem saudação/avatar duplicados no topbar;
- 60 px de linha útil mais safe area;
- alvos tácteis de 44 px;
- título com ellipsis em ecrãs estreitos;
- drawer à direita e hambúrguer ↔ X.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**.

## Integridade funcional preservada

Não foram modificados por `75-layout1`:

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

O teste dedicado impede que a camada de geometria passe a depender de `appState`, montantes, IndexedDB ou funções de persistência.

## Versionamento público

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura: `75-architecture2`;
- cabeçalho: `75-header2`;
- estabilidade: `75-stability1`;
- geometria: `75-layout1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1`.

`v75-layout-polish.css?v=75-layout1` integra a allowlist Pages e o cache do Service Worker.

## Pipeline e publicação

A revisão passou primeiro o CI completo na branch de trabalho e depois foi integrada por fast-forward em `main`.

O CI de `main` terminou com sucesso, incluindo:

- sintaxe;
- testes financeiros e auditoria financeira;
- invariantes de contagem e isolamento do cofre;
- datas, faturas e QR;
- Mercado, imagens, código de barras e contabilização;
- arquitetura v75, estabilidade v75 e teste `v75-layout-polish`;
- menu móvel, centro de atualização e segurança;
- responsividade, regressão mobile, navegação e acessibilidade;
- sincronização e manifesto.

O workflow GitHub Pages voltou a verificar a revisão testada, preparou a allowlist pública, carregou o artefacto e concluiu o deploy com sucesso.

## Limitação de validação

A validação automatizada confirma contratos de código, regressões e distribuição, mas não substitui inspeção física. Continuam necessários testes em iPhone/Safari/PWA, Android/Chrome, tablet e desktop para confirmar proporções visuais, safe areas, calendário, filtros, Planeamento, tema escuro, drawer, bottom navigation e ausência de overflow em hardware real.

## Próximo passo

Validar a revisão publicada em dispositivos reais. Qualquer regressão visual encontrada deve ser corrigida na camada de apresentação sem tocar no núcleo financeiro, salvo evidência de que a causa está realmente no domínio funcional.
