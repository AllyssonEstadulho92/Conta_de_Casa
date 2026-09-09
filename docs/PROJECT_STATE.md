# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão do drawer móvel: `75-drawer2`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-drawer2` substitui a experiência azul de `75-drawer1` por uma composição alinhada com o padrão visual já usado no cabeçalho móvel. A página principal continua clara/branca e o menu continua a abrir pelo **lado direito**.

## Revisão `75-drawer2`

A camada final passa a ser `v75-drawer-theme.css`, carregada depois de `v75-layout-polish.css` e com responsabilidade exclusivamente visual sobre o drawer móvel.

Principais alterações:

- drawer continua ancorado à direita (`inset: 0 0 0 auto`);
- largura mantém `min(320px, calc(100vw - 72px))`, preservando uma faixa visível da página à esquerda;
- paleta passa a usar a mesma família cromática do cabeçalho `75-header2`: `#003f4c`, `#005965` e `#087a78`;
- menta `#5be0c2` passa a ser usada apenas como acento de foco/seleção;
- gradiente, sombras e backdrop deixam de usar azul saturado e passam para verde-petróleo/teal;
- item ativo mantém superfície translúcida, sem cartão branco interno;
- `icon.svg`, nome **Conta de Casa**, subtítulo e X continuam no cabeçalho do drawer;
- `Ocultar valores` e `Bloquear` permanecem no mesmo painel;
- safe areas, foco, scroll interno, `prefers-reduced-motion`, Escape e swipe da direita continuam preservados.

A revisão não cria uma segunda navegação nem altera destinos, rotas, gestos ou handlers.

## Revisões anteriores preservadas

`75-layout1` continua responsável por geometria, proporção e alinhamento entre páginas. `75-stability1` continua responsável por tipografia, overflow, safe areas, formulários, navegação inferior, diálogos e estados visuais. `75-header2` continua responsável pelo cabeçalho móvel minimalista.

## Cabeçalho e navegação

O cabeçalho móvel mantém:

- hambúrguer + título à esquerda;
- notificações à direita;
- sem saudação/avatar duplicados no topbar;
- 60 px de linha útil mais safe area;
- alvos tácteis de 44 px;
- título com ellipsis em ecrãs estreitos;
- gradiente `#003f4c → #005965 → #087a78`.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**. O drawer continua a abrir e fechar pela direita e o gesto horizontal continua a usar a margem direita.

## Integridade funcional preservada

Não foram modificados por `75-drawer2`:

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
- regras e dados do Mercado;
- `mobile-menu-toggle.js` e a lógica de swipe/hambúrguer/X.

O teste `tests/v75-drawer-theme.test.cjs` valida direção, proporção, correspondência cromática com o cabeçalho, distribuição pública, cache e ausência de acesso ao estado financeiro.

## Versionamento público

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu funcional: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura: `75-architecture2`;
- cabeçalho: `75-header2`;
- estabilidade: `75-stability1`;
- geometria: `75-layout1`;
- drawer visual: `75-drawer2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2`.

`v75-drawer-theme.css?v=75-drawer2` integra a allowlist Pages e o cache do Service Worker. `v75-drawer-blue.css` deixa de integrar a distribuição pública.

## Pipeline

A revisão deve passar primeiro o CI completo na branch `fix/v75-drawer-teal`, incluindo testes financeiros, auditoria, isolamento, QR, Mercado, arquitetura, estabilidade, geometria, menu animado, segurança, responsividade, acessibilidade, sincronização e o teste específico `v75-drawer-theme.test.cjs`.

Depois da integração em `main`, o mesmo conjunto de regressões deve voltar a passar antes do deploy Pages.

## Validação manual necessária

Validar em iPhone/Safari/PWA real:

- cor do drawer igual ao padrão do cabeçalho;
- largura do menu e quantidade de página branca visível;
- posição do X no canto superior direito;
- contraste de labels e ícones;
- item ativo em menta/transparência sem excesso de brilho;
- animação hambúrguer → X → hambúrguer;
- safe area superior/inferior;
- scroll do menu;
- swipe pela direita;
- ausência de colisão com a barra inferior e Safari.

## Próximo passo

Confirmar CI da branch, integrar `75-drawer2` em `main`, validar CI público e GitHub Pages e depois confirmar visualmente no iPhone real.
