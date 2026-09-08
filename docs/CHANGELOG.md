# Changelog Técnico — Conta de Casa

## 2026-09-08 — v74 candidata: novo modelo visual da aplicação

### Interface e experiência

- aplicado novo sistema visual inspirado no protótipo móvel aprovado;
- identidade canónica: fundo claro `#f4f8f8`, texto `#0c2830`, primário `#075b63`, acento `#17b890`;
- novo cabeçalho móvel em verde-petróleo, fixed e compatível com safe areas;
- navegação inferior passa a priorizar **Início / Despesas / Mercado / Planeamento / Mais**;
- Início recebe saudação, seletor mensal, resumo do mês, orçamento, ações rápidas e categorias;
- Despesas recebe composição móvel orientada a movimentos;
- **Adicionar despesa** reutiliza o formulário existente;
- **Ler fatura** reutiliza a captura QR/fotografia existente e mantém revisão antes de guardar;
- Mercado recebe apresentação alinhada com o novo modelo, mantendo pesquisa, scanner, estimativas e valores reais separados;
- fotografias verificadas podem voltar a ser apresentadas como apoio visual;
- Planeamento, Relatórios e Mais passam a usar a mesma hierarquia visual;
- onboarding visual aproxima-se do protótipo sem substituir o cofre real;
- navegação lateral v73 à direita e hambúrguer ↔ X preservados.

### Arquitetura

- `design-system.css` reescrito como sistema visual consolidado v74;
- adicionados `v74-experience.css` e `v74-experience.js`;
- `v74-experience.js` é camada de apresentação e não altera diretamente cálculos, IndexedDB, cifragem ou sincronização;
- `ui-consistency.css` e `v64-runtime.css` deixam de ser copiados para o bundle público;
- `v64-runtime.js` permanece por conter comportamento funcional ainda necessário;
- `scripts/prepare-pages.cjs` atualizado para `BUILD=v74` e `EXPERIENCE_REV=74-experience2`;
- Service Worker atualizado para `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`;
- `manifest.webmanifest` e `release-manifest.json` alinhados com a nova release.

### Segurança e integridade

- sem alteração de `STATE_VERSION = 5`;
- sem migração de dados financeiros;
- sem alteração do modelo de pagamentos;
- sem alteração do cofre PBKDF2-SHA-256 + AES-GCM;
- sem introdução de tokens, passwords ou chaves no código;
- sincronização continua a trabalhar sobre o envelope cifrado;
- dados fictícios do protótipo não são usados para preencher a aplicação;
- QR continua a ser preenchimento assistido e não é usado para inventar linhas de artigos.

### QA

CI candidata `34209567627` / `#1435`: **sucesso integral**.

Passaram testes de:

- sintaxe;
- finanças e invariantes em cêntimos;
- auditoria financeira;
- isolamento/cifragem;
- timezone;
- formulários e pagamentos;
- QR de faturas;
- Mercado, imagens oficiais/verificadas, scanner e quantidades;
- atualização PWA;
- segurança;
- responsividade e viewport móvel;
- navegação;
- acessibilidade;
- sincronização;
- manifesto.

### Publicação

Estado: candidata validada na branch `redesign/v74-prototipo-conta-de-casa`. Integração em `main` e GitHub Pages ainda por confirmar neste ponto do changelog.

## 2026-09-08 — v73 publicada: navegação lateral à direita

- sidebar desktop reposicionada para o lado direito;
- área principal passa a reservar espaço com `margin-right`;
- drawer móvel ancorado à direita;
- swipe de abertura começa na margem direita e move-se para a esquerda;
- hambúrguer/X, ARIA, foco, backdrop, Escape e `prefers-reduced-motion` preservados;
- PR `#62`, merge `fb5c1b975b6494590eb16a3ab09762218e135299`;
- CI de `main` `34180397609`: sucesso;
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
