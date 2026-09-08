# Changelog Técnico — Conta de Casa

## 2026-09-08 — v75 publicada: reestruturação total alinhada com o protótipo

### Causa raiz da versão pública não mudar

- o redesign final permanecia apenas em `redesign/v75-prototipo-fiel`;
- `main` continuava na v74, por isso o GitHub Pages servia a versão anterior;
- alguns testes de regressão ainda esperavam `75-architecture1`, enquanto a implementação final já utilizava `75-architecture2`;
- estes bloqueios eram de publicação/versionamento e testes desatualizados, não falhas do núcleo financeiro.

### Interface e experiência

- publicada a camada final `v75-architecture.css/js` sobre a base funcional v74;
- identidade única: fundo claro suave, superfícies brancas, verde-petróleo/teal e acento menta;
- topbar móvel full-width, fixed e compatível com safe areas;
- Início integra saudação no cabeçalho e mantém mês, resumo, orçamento, ações rápidas e categorias;
- barra inferior garante cinco destinos visíveis: **Início / Despesas / Mercado / Planeamento / Mais**;
- corrigida a regra histórica que ocultava o terceiro destino móvel e fazia desaparecer Mercado;
- Despesas reorganizada em Todas/Entradas/Saídas, pesquisa, movimentos compactos e FAB;
- nova despesa usa ecrã completo no móvel com **Manual / Ler fatura / QR Code**;
- scanner QR usa composição full-screen com guia de enquadramento, reutilizando o scanner real existente;
- Mercado reorganizado em pesquisa, cartões compactos e lojas suportadas;
- Planeamento reorganizado em mês, orçamento, gasto, disponível e categorias antes da edição detalhada;
- Relatórios, Mais, Sincronização, drawer e cofre usam a mesma linguagem visual;
- onboarding/cofre reutilizam `icon.svg` local;
- PIN móvel usa grelha convencional de três colunas.

### Limites de fidelidade ao protótipo

- não são apresentadas lojas sem suporte real do pipeline atual;
- Continente e Pingo Doce permanecem como lojas suportadas na experiência Mercado;
- QR fiscal continua a fornecer apenas campos comprováveis; não são inventadas linhas de artigos;
- fotografias de produtos continuam opcionais e sujeitas às regras de validação existentes;
- valores de demonstração do protótipo não entram na aplicação.

### Arquitetura, cache e segurança

- `core.js`, `finance.js`, IndexedDB, `STATE_VERSION = 5`, pagamentos e histórico preservados;
- cofre PBKDF2-SHA-256 + AES-GCM preservado;
- sincronização continua opcional e sobre envelope cifrado;
- `v75-architecture.js` reorganiza apresentação e chama handlers existentes, sem escrever diretamente valores financeiros;
- `v64-runtime.js` continua funcional;
- `ui-consistency.css` e `v64-runtime.css` continuam fora do bundle público;
- build `v75`, arquitetura `75-architecture2`;
- cache `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`;
- Service Worker elimina caches anteriores na ativação e é registado como `sw.js?v=75` com `updateViaCache:'none'`.

### QA e publicação

- CI final da branch `34226581162` / `#1488`: sucesso;
- PR `#65`;
- merge `40fe62f8140f1f58af9e9ab8d8c8b642695b7cf3`;
- CI de `main` `34226711267` / `#1490`: sucesso;
- GitHub Pages `34226749117` / `#1483`: sucesso;
- artefacto Pages contém 43 assets e inclui `v75-architecture.css` e `v75-architecture.js`;
- URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`.

Validação física em iPhone, Android/tablet e desktop continua como controlo pós-publicação.

## 2026-09-08 — v74 publicada: novo modelo visual da aplicação

- aplicado o sistema visual v74 baseado no primeiro protótipo;
- adicionados `v74-experience.css` e `v74-experience.js`;
- preservados cálculos, cofre, pagamentos, QR e sincronização;
- PR `#64`, merge `a1974860755d70e7abf30ed93cee7220f5e65409`;
- CI e GitHub Pages confirmados com sucesso.

## 2026-09-08 — v73 publicada: navegação lateral à direita

- sidebar desktop e drawer móvel reposicionados para a direita;
- swipe, ARIA, foco, Escape e hambúrguer ↔ X preservados;
- PR `#62`, merge `fb5c1b975b6494590eb16a3ab09762218e135299`.

## Histórico anterior

As alterações das versões anteriores permanecem registadas no histórico Git e em `release-manifest.json`.
