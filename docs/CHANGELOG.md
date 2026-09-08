# Changelog Técnico — Conta de Casa

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
- hambúrguer e sino usam alvos tácteis de 42 px com estados de toque e foco;
- sino recebe superfície translúcida discreta, sem virar um cartão pesado;
- badge de notificação ganha melhor contraste;
- `prefers-reduced-motion` permanece respeitado;
- `v75-header-refinement.css` continua a ser uma camada visual isolada, carregada depois da arquitetura v75.

### Distribuição

- `HEADER_REV`: `75-header2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2`;
- `v75-header-refinement.css` permanece no bundle público;
- nenhum ficheiro financeiro, de cofre, QR, Mercado ou sincronização foi alterado.

### Compatibilidade de atualização

O sufixo `header2` foi colocado no final da assinatura do cache. Assim, a revisão força um cache novo sem alterar a assinatura-base histórica da v75 usada pelas verificações de regressão.

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
