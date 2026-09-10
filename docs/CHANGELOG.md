# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git. Este ficheiro resume alterações relevantes para continuidade técnica.

## 2026-09-10 — v75 `75-expenses1` — layout moderno de Despesas

### Objetivo

Modernizar a página de Despesas/Faturas sem alterar cálculos, filtros, dados, pagamentos, segurança ou sincronização.

### Diagnóstico

- a página canónica já possuía Lista/Calendário, pesquisa, filtros completos, resumo, tabela desktop e cartões mobile;
- `renderBills()`/`filterBills()` já forneciam o comportamento correto;
- a principal oportunidade era visual: hierarquia, densidade, alinhamento, legibilidade e resposta entre desktop/mobile;
- reescrever lógica financeira para alcançar um redesign aumentaria risco sem benefício funcional.

### Alterações

Criado `v75-expenses-modern.css`, revisão `75-expenses1`, integralmente limitado a `html.cdc-v75 #page-bills`:

- Lista/Calendário com controlo segmentado mais limpo;
- pesquisa e `Nova fatura` em barra operacional moderna;
- pesquisa com indicador visual CSS, sem dependência externa;
- filtros agrupados num painel responsivo;
- cartões de resumo com hierarquia e alinhamento de valores reforçados;
- tabela desktop com contentor elevado, cabeçalho fixo, espaçamento e hover;
- cartões mobile com `Em falta` em destaque;
- vencimento, estado, Total, Pago, Categoria e progresso mantidos visíveis;
- ações Abrir/Detalhes, Editar, Pagar e Excluir preservadas;
- breakpoints específicos para 1100/820/430 px;
- tratamento explícito de `prefers-reduced-motion` e `forced-colors`.

### Isolamento

Não foram alterados `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` ou `index.html` fonte. Não existem mudanças em IndexedDB, PIN, PBKDF2, AES-GCM, faturas/pagamentos, Mercado, QR, scanner ou sync.

### Distribuição e QA

- `scripts/prepare-pages.cjs` publica `v75-expenses-modern.css?v=75-expenses1`;
- ordem: `v75-pages.css` → `v75-expenses-modern.css` → `v75-usability.css`;
- `sw.js` inclui o novo asset e invalida o cache com `expenses1`;
- criado `tests/v75-expenses-modern.test.cjs`;
- CI e Pages executam o novo teste;
- CI do head funcional `80be8a2ff2a7099046a2e40da42b0ae1d5aa6d7d`: run `34495192199` — sucesso;
- branch estava `behind 0` relativamente a `main` antes da atualização documental final;
- validação física permanece pendente em Safari/PWA, mobile, tablet, desktop e tema escuro.

---

## 2026-09-10 — v76 Bloco 1 — fundação TypeScript

- PR #72 integrado no `main` como `2c1d78508507ab77d6df95850568d9fd7f6b9577`;
- TypeScript adicionado apenas como ferramenta de desenvolvimento;
- `tsconfig.json` estrito/noEmit;
- tipos nominais e contratos do schema v5 em `src/types/`;
- type-tests e workflow dedicado;
- runtime JavaScript v75 preservado;
- TypeScript Foundation main `34485922921`: sucesso;
- CI main `34485922896`: sucesso;
- GitHub Pages `34485986996`: sucesso.

---

## 2026-09-10 — v75 `75-market1`

- pesquisa live e pesquisa da lista distinguidas;
- filtros mobile clarificados;
- preço pesquisado explicitamente tratado como estimativa;
- preço real pendente promovido quando necessário;
- browser corrigido para fotografia/conteúdo/ação;
- pipeline `marketId|pid`, scanner, cálculos e `75-photo-loader3` preservados;
- PR #71 integrado como `c44348dbc5a942b601f360fa38793bd9d8b47a1a`;
- Pages `34482133540`: sucesso.

---

## 2026-09-10 — v75 `75-assets1`

- biblioteca/critério local-first para fontes, ícones e assets;
- Lucide SVG local mantido como sistema principal;
- loader transversal opt-in para imagens/media/Lottie local;
- CSP não expandida;
- PR #69 integrado como `a8e04d6811bd6eb08487de139fb19fb2f12128ec`.

---

## 2026-09-10 — v75 `75-pages1`

- Início e Planeamento reorganizados;
- Despesas mobile restaurada para a vista funcional canónica com Lista/Calendário, filtros, resumo e cartões;
- PR #68 integrado como `c8ec45893c8936093ecd7c7da9ee08c9a268109c`.

---

## 2026-09-10 — v75 `75-usability1`

- `touch-action: manipulation`;
- inputs mobile seguros contra auto-zoom;
- alvos tácteis 44/48 px;
- cofre mobile com safe areas;
- pinch-to-zoom preservado;
- PR #66 integrado como `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`.

---

## 2026-09-10 — v75 `75-startup2` / `75-catalog4` / `75-photo-loader3`

- abertura pós-PIN deixa de bloquear na rede em dispositivo já emparelhado;
- fotografia termina em estado estável com cooldown;
- `sourceUrl` oficial exata evita resolução redundante;
- host/path/PID permanecem estritos.

## Próxima linha de trabalho

Depois de integrar e validar fisicamente `75-expenses1`, retomar `feat/v76-money-dates` para o Bloco 2 da migração TypeScript, sem misturar alterações visuais e matemáticas no mesmo PR.
