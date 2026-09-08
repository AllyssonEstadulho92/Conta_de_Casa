# Changelog Técnico — Conta de Casa

## 2026-09-08 — v75 candidata: reestruturação total alinhada com o protótipo

### Interface e experiência

- criada camada final `v75-architecture.css/js` sobre a base funcional v74;
- identidade única: fundo claro suave, superfícies brancas, verde-petróleo/teal e acento menta;
- topbar móvel full-width, fixed e compatível com safe areas;
- Início integra saudação no cabeçalho e mantém mês, resumo, orçamento, ações rápidas e categorias;
- barra inferior passa a garantir cinco destinos visíveis: **Início / Despesas / Mercado / Planeamento / Mais**;
- corrigida a regra histórica que ocultava o terceiro destino móvel e fazia desaparecer Mercado;
- Despesas reorganizada em Todas/Entradas/Saídas, pesquisa, movimentos compactos e FAB;
- nova despesa passa a usar ecrã completo no móvel com modos **Manual / Ler fatura / QR Code**;
- scanner QR passa a usar composição full-screen com guia de enquadramento, reutilizando o scanner real existente;
- Mercado reorganizado em pesquisa, cartões compactos e lojas suportadas;
- Planeamento reorganizado em mês, orçamento, gasto, disponível e categorias antes da edição detalhada;
- Relatórios, Mais, Sincronização, drawer e cofre recebem a mesma linguagem visual;
- onboarding/cofre reutilizam `icon.svg` local;
- PIN móvel passa a grelha convencional de três colunas.

### Limites de fidelidade ao protótipo

- não são apresentadas Auchan, Lidl, Mercadona ou outras lojas sem suporte real do pipeline atual;
- apenas Continente e Pingo Doce permanecem como lojas suportadas na experiência Mercado;
- QR fiscal continua a fornecer apenas campos comprováveis; não são inventadas linhas de artigos para reproduzir imagens do protótipo;
- fotografias de produtos continuam opcionais e sujeitas às regras de validação existentes;
- valores de demonstração do protótipo não entram na aplicação.

### Arquitetura e segurança

- `core.js`, `finance.js`, IndexedDB, `STATE_VERSION = 5`, pagamentos e histórico preservados;
- cofre PBKDF2-SHA-256 + AES-GCM preservado;
- sincronização continua opcional e sobre envelope cifrado;
- `v75-architecture.js` reorganiza apresentação e chama handlers existentes, sem escrever diretamente valores financeiros;
- `v64-runtime.js` continua funcional;
- `ui-consistency.css` e `v64-runtime.css` continuam fora do bundle público;
- build candidato `v75`, arquitetura `75-architecture2`;
- cache `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

### QA

- testes financeiros, isolamento, datas, formulários, QR, Mercado, imagens oficiais, scanner e contabilização mantidos;
- testes ligados à identificação literal de versões antigas foram atualizados sem remover invariantes;
- publicação permanece bloqueada até a suite completa da candidata ficar verde.

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

## 2026-09-08 — v72/v71

- continuidade visual do botão hambúrguer durante reparenting;
- drawer off-canvas acompanha o dedo durante swipe;
- snap por distância/velocidade e backdrop progressivo.

## Histórico anterior

As alterações das versões anteriores permanecem registadas no histórico Git e em `release-manifest.json`.
