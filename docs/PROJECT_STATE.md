# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico: `v76` — migração incremental TypeScript  
Branch pública: `main`  
HEAD público atual de partida: `2c1d78508507ab77d6df95850568d9fd7f6b9577`  
Branch de trabalho visual: `feat/v75-expenses-modern-ui`  
Revisão candidata: `75-expenses1`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional limitada ao envelope cifrado;
- `estimatedCents` e `actualCents` permanecem separados no Mercado;
- QR, scanner, backup/restauro, PWA, Service Worker e offline não podem regredir;
- alterações exclusivamente visuais não podem mudar fórmulas, faturas, pagamentos ou persistência.

## 2. Baseline confirmada

A revisão `75-market1` está publicada. O Bloco 1 da fundação TypeScript foi integrado pelo PR #72 no commit `2c1d78508507ab77d6df95850568d9fd7f6b9577` sem substituir o runtime JavaScript.

Após o merge do PR #72:

- TypeScript Foundation run `34485922921`: sucesso;
- CI de `main` run `34485922896`: sucesso;
- GitHub Pages run `34485986996`: sucesso.

A migração funcional para TypeScript continua separada da revisão visual de Despesas. A branch `feat/v76-money-dates` existe para o Bloco 2 e não deve receber alterações visuais desta revisão.

## 3. Pedido atual — Despesas mais modernas

Auditoria do código confirmou que a página canónica de Despesas já contém e deve preservar:

- vistas `Lista de faturas` e `Calendário`;
- pesquisa por descrição, fornecedor ou referência;
- filtros Estado, Categoria, De, Até e Ordenar;
- ação `Nova fatura`;
- resumo `Em aberto`, `A vencer`, `Em atraso` e `Resultados`;
- tabela desktop;
- cartões mobile;
- ações Abrir/Detalhes, Editar, Pagar e Excluir conforme o estado da fatura.

`renderBills()` e `filterBills()` continuam responsáveis pelo conteúdo e filtros. Não foi identificada necessidade de alterar a lógica funcional para modernizar o layout.

## 4. `75-expenses1` implementada na branch

Criado `v75-expenses-modern.css`, isolado a `html.cdc-v75 #page-bills`.

Alterações visuais:

- tabs Lista/Calendário com controlo segmentado mais limpo;
- pesquisa e `Nova fatura` reunidas numa barra operacional moderna;
- pesquisa recebe indicador visual sem dependência externa;
- filtros passam a painel visual coerente e responsivo;
- quatro cartões de resumo ganham hierarquia, alinhamento numérico e acento discreto;
- tabela desktop recebe contentor elevado, cabeçalho fixo, espaçamento e hover mais claros;
- cartões mobile destacam `Em falta`, vencimento, estado, Total/Pago/Categoria e progresso;
- ações mobile permanecem acessíveis e com dimensões tácteis adequadas;
- breakpoints específicos para desktop intermédio, `820px` e `430px`;
- `prefers-reduced-motion` e `forced-colors` tratados explicitamente.

## 5. Isolamento e risco

A revisão não altera:

- `core.js`;
- `finance.js`;
- `render.js`;
- `forms.js`;
- `events.js`;
- `index.html` fonte;
- IndexedDB, PIN, PBKDF2, AES-GCM ou sincronização;
- regras de faturas/pagamentos;
- Mercado, QR ou scanner.

Foram alterados apenas CSS, distribuição/cache, testes e documentação. O novo CSS é publicado depois de `v75-pages.css` e antes de `v75-usability.css`, mantendo a política transversal de usabilidade como última camada.

## 6. Distribuição e QA

- `scripts/prepare-pages.cjs` inclui `v75-expenses-modern.css?v=75-expenses1`;
- `sw.js` inclui o asset e invalida o cache com sufixo `expenses1`;
- criado `tests/v75-expenses-modern.test.cjs`;
- CI e workflow Pages executam o novo teste;
- comparação antes da documentação: branch `behind 0` relativamente a `main`;
- CI do head funcional `80be8a2ff2a7099046a2e40da42b0ae1d5aa6d7d`: run `34495192199` — sucesso.

A atualização documental cria novo head e exige nova confirmação do CI antes do merge.

## 7. Validação ainda necessária

- revisão visual física em iPhone/Safari/PWA;
- 320/375/390/430 px;
- tablet;
- desktop;
- tema claro e escuro;
- pesquisa, filtros, limpar filtros, abrir, editar, pagar e excluir;
- tabela com muitas faturas e textos longos;
- navegação Lista ↔ Calendário.

## 8. Próximo passo

1. confirmar CI verde no head documental final;
2. confirmar `behind 0`;
3. abrir PR de `75-expenses1`;
4. integrar apenas com checks verdes;
5. confirmar CI e Pages de `main` no SHA integrado;
6. validar fisicamente a página de Despesas;
7. depois retomar `feat/v76-money-dates` para o Bloco 2 da migração TypeScript.
