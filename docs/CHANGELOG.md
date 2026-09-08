# Changelog Técnico — Conta de Casa

## 2026-09-08 — v74 publicada: novo modelo visual da aplicação

### Interface e experiência

- aplicado o novo sistema visual baseado no protótipo móvel aprovado;
- identidade: fundo `#f4f8f8`, texto `#0c2830`, primário `#075b63`, acento `#17b890`;
- novo cabeçalho móvel verde-petróleo, fixed e compatível com safe areas;
- navegação inferior: **Início / Despesas / Mercado / Planeamento / Mais**;
- Início recebe saudação, seletor mensal, resumo, orçamento, ações rápidas e categorias;
- Despesas recebe composição móvel orientada a movimentos;
- **Adicionar despesa** reutiliza o formulário existente;
- **Ler fatura** reutiliza captura QR/fotografia e revisão antes de guardar;
- Mercado mantém pesquisa, scanner, estimativas e valores reais separados;
- fotografias verificadas podem ser apresentadas como apoio visual;
- Planeamento, Relatórios e Mais passam a usar a mesma hierarquia;
- onboarding visual aproxima-se do protótipo sem substituir o cofre real;
- navegação lateral à direita e hambúrguer ↔ X da v73 preservados.

### Arquitetura

- `design-system.css` consolidado como sistema visual v74;
- adicionados `v74-experience.css` e `v74-experience.js`;
- `v74-experience.js` não altera diretamente cálculos, IndexedDB, cifragem ou sincronização;
- `ui-consistency.css` e `v64-runtime.css` retirados do bundle público;
- `v64-runtime.js` permanece por conter comportamento funcional;
- build `v74`, experiência `74-experience2`;
- cache `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

### Segurança e integridade

- `STATE_VERSION = 5` preservado;
- sem migração de dados financeiros;
- modelo de pagamentos preservado;
- cofre PBKDF2-SHA-256 + AES-GCM preservado;
- sem tokens, passwords ou chaves introduzidos no código;
- sincronização continua sobre envelope cifrado;
- dados fictícios do protótipo não são injetados;
- QR continua a ser preenchimento assistido e não inventa artigos.

### QA e publicação

- PR `#64`;
- CI PR `34210060213` / `#1441`: sucesso;
- merge `a1974860755d70e7abf30ed93cee7220f5e65409`;
- CI `main` `34210146307` / `#1442`: sucesso;
- GitHub Pages `34210213884` / `#1435`: sucesso;
- build público: `v74`.

Validação física em iPhone, Android/tablet e desktop permanece recomendada após publicação.

## 2026-09-08 — v73 publicada: navegação lateral à direita

- sidebar desktop reposicionada para o lado direito;
- área principal reserva espaço com `margin-right`;
- drawer móvel ancorado à direita;
- swipe de abertura começa na margem direita e move-se para a esquerda;
- hambúrguer/X, ARIA, foco, backdrop, Escape e `prefers-reduced-motion` preservados;
- PR `#62`, merge `fb5c1b975b6494590eb16a3ab09762218e135299`;
- CI `main` `34180397609`: sucesso;
- GitHub Pages `34180421362`: sucesso.

## 2026-09-08 — v72: continuidade visual do hambúrguer

- o mesmo botão é preparado dentro do drawer antes de `showModal()`;
- placeholder invisível mantém a geometria do topbar;
- drawer e transformação hambúrguer → X começam no frame seguinte.

## 2026-09-08 — v71: drawer off-canvas com gesto horizontal

- drawer acompanha o dedo durante swipe;
- snap por distância/velocidade;
- backdrop acompanha o progresso;
- fecho do `<dialog>` espera pela transição lateral;
- scroll vertical e `prefers-reduced-motion` preservados.

## Histórico anterior

As alterações das versões anteriores permanecem registadas no histórico Git e em `release-manifest.json`.
