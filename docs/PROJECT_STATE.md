# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público: `v75`
Revisão transversal: `75-stability1`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A v75 mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

A revisão `75-stability1` é uma camada final exclusivamente de apresentação. Foi criada para corrigir inconsistências transversais de tipografia, alinhamento, overflow, safe areas, formulários, navegação, diálogos e estados visuais do Mercado sem reescrever `core.js`, `finance.js`, persistência, cifragem ou regras financeiras.

## Cabeçalho móvel `75-header2`

O cabeçalho móvel continua minimalista:

- sem `Olá, Utilizador / Bem-vindo de volta!` e sem avatar no topbar;
- hambúrguer + título à esquerda;
- sino de notificações como única ação à direita;
- linha visual de 60 px mais safe area;
- título com ellipsis em ecrãs estreitos;
- hambúrguer e sino com alvo tátil estabilizado em 44 px pela revisão transversal;
- foco visível e `prefers-reduced-motion` preservados.

## Estabilidade transversal `75-stability1`

A nova revisão acrescenta:

- stack tipográfica nativa consistente em iOS, Android, macOS e Windows;
- `min-width: 0`, controlo de overflow e wrapping defensivo em flex/grid;
- safe areas laterais e superior/inferior no cabeçalho, conteúdo, navegação e diálogos;
- inputs/selects/textarea com 16 px no mobile para evitar zoom automático do Safari;
- barra inferior com cinco destinos, dimensões estáveis e labels truncados de forma segura;
- tabelas confinadas ao próprio scroll no desktop e ocultadas quando existe representação móvel equivalente;
- foco visível coerente, suporte a `forced-colors` e redução de movimento;
- sincronização da cor do browser/PWA com o tema e o cabeçalho visível;
- estados `loading`, `loaded`, `error` e `empty` para fotografias do Mercado, com skeleton e fallback `Imagem indisponível`;
- observação de re-renderizações para que falhas de imagem remota não deixem cartões vazios/deformados.

## Arquitetura v75 preservada

- navegação móvel: **Início / Despesas / Mercado / Planeamento / Mais**;
- Despesas: Todas/Entradas/Saídas, pesquisa, movimentos e FAB;
- nova despesa mobile full-screen com **Manual / Ler fatura / QR Code**;
- QR/câmara reutiliza `invoice-capture.js`;
- Mercado mantém apenas fontes realmente suportadas: Continente e Pingo Doce;
- Planeamento usa métricas reais de orçamento, gasto, disponível e categorias;
- drawer à direita e animação hambúrguer ↔ X preservados;
- PIN/cofre, IndexedDB e sincronização não foram migrados.

## Versionamento público

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura final: `75-architecture2`;
- cabeçalho: `75-header2`;
- estabilidade: `75-stability1`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1`.

O Service Worker continua a eliminar caches anteriores durante `activate`. O bundle Pages carrega `v75-stability.css/js?v=75-stability1` depois da arquitetura e do cabeçalho, garantindo invalidação real sem alterar o build funcional.

## Integridade funcional

Continuam preservados:

- `core.js` / persistência;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- pagamentos e histórico;
- PIN e palavra-passe;
- PBKDF2-SHA-256 + AES-GCM;
- QR fiscal e scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada.

## Pipeline

CI e Pages passam a verificar também `v74-experience.js`, `v75-architecture.js`, `v75-stability.js`, `v75-architecture.test.cjs` e `v75-stability.test.cjs`, eliminando a diferença que existia entre a validação principal e a verificação anterior ao deploy.

## Próximo passo

Depois de CI verde e publicação, fazer validação física em iPhone/Safari/PWA e Android/Chrome: safe areas, títulos longos, badge, hambúrguer/X, rotação, tema escuro, formulários sem zoom, navegação inferior, ausência de overflow e fallback de imagens do Mercado. Qualquer regressão encontrada deve ser corrigida na camada de apresentação antes de tocar no núcleo financeiro.
