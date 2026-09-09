# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Revisão de geometria: `75-layout1`
Revisão do drawer móvel: `75-drawer1`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-drawer1` está integrada em `main` sobre `75-layout1`. É uma camada CSS-only inspirada no protótipo visual fornecido: a página principal continua clara/branca e o menu móvel abre num painel azul pelo **lado direito**, mantendo uma faixa visível da página ao fundo.

## Revisão `75-drawer1`

A nova camada `v75-drawer-blue.css` é carregada depois de `v75-layout-polish.css` e modifica exclusivamente a apresentação do drawer móvel.

Principais alterações:

- drawer continua ancorado à direita (`inset: 0 0 0 auto`);
- largura passa a `min(320px, calc(100vw - 72px))`, deixando parte da página clara visível à esquerda;
- painel usa gradiente azul com profundidade discreta, sem superfície branca pesada;
- cantos internos do drawer recebem arredondamento, mantendo a extremidade direita alinhada ao ecrã;
- cabeçalho usa `icon.svg`, nome **Conta de Casa** e subtítulo **Navegação** em branco;
- o mesmo `#mobileMenuBtn` continua a mover-se para o drawer e transforma-se em X; dentro do drawer fica no canto superior direito;
- grupos, ícones e labels usam branco/transparências controladas;
- item ativo usa realce translúcido em vez de cartão branco;
- `Ocultar valores` e `Bloquear` permanecem integrados no plano azul;
- backdrop é muito leve e sem blur, para que a página clara continue perceptível;
- `prefers-reduced-motion`, foco visível e safe areas continuam preservados.

A revisão não cria uma segunda navegação nem muda destinos, rotas, gestos ou handlers.

## Revisões anteriores preservadas

`75-layout1` continua responsável por geometria, proporção e alinhamento entre páginas. `75-stability1` continua responsável por tipografia, overflow, safe areas, formulários, navegação inferior, diálogos e estados visuais. `75-header2` continua responsável pelo cabeçalho móvel minimalista.

## Cabeçalho e navegação

O cabeçalho móvel mantém:

- hambúrguer + título à esquerda;
- notificações à direita;
- sem saudação/avatar duplicados no topbar;
- 60 px de linha útil mais safe area;
- alvos tácteis de 44 px;
- título com ellipsis em ecrãs estreitos.

A navegação móvel continua **Início / Despesas / Mercado / Planeamento / Mais**. O drawer continua a abrir e fechar pela direita e o gesto horizontal continua a usar a margem direita.

## Integridade funcional preservada

Não foram modificados por `75-drawer1`:

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

O teste `tests/v75-drawer-blue.test.cjs` impede que a camada visual passe a aceder ao estado financeiro ou persistência.

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
- drawer visual: `75-drawer1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer1`.

`v75-drawer-blue.css?v=75-drawer1` integra a allowlist Pages e o cache do Service Worker.

## Pipeline

A revisão passou o CI completo na branch `fix/v75-blue-right-drawer`, incluindo testes financeiros, auditoria, isolamento, QR, Mercado, arquitetura, estabilidade, geometria, menu animado, segurança, responsividade, acessibilidade, sincronização e o teste específico do novo drawer.

Depois da integração em `main`, o pipeline público deve validar novamente o mesmo SHA antes do deploy Pages.

## Validação manual necessária

A referência visual foi implementada por código, mas a validação final deve ser feita em iPhone/Safari/PWA real para confirmar:

- largura do menu e quantidade de página branca visível;
- azul e contraste dos labels/ícones;
- posição do X no canto superior direito do drawer;
- animação hambúrguer → X → hambúrguer;
- safe area superior/inferior;
- scroll do menu quando todo o conteúdo não couber;
- swipe pela direita;
- ausência de colisão com a barra inferior e Safari.

## Próximo passo

Validar `75-drawer1` no iPhone real. Se a proporção ou o tom de azul precisar de ajuste, a correção deve permanecer em `v75-drawer-blue.css`, sem tocar no núcleo financeiro.
