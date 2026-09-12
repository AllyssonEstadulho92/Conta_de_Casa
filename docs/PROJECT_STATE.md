# Estado do Projeto — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — consolidação UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`  
Trabalho atual: `feat/v76-ui-components1` — PR #85; gates verdes no commit anterior, reconfirmação pendente após atualização documental  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` até existir migração de schema aprovada e testada;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- redesign não pode alterar silenciosamente cálculos, pagamentos, faturas, persistência, autenticação ou segurança.

## 2. Estado publicado em `main`

Integrações relevantes já publicadas:

- fundação TypeScript strict — PR #72;
- Despesas/Faturas `75-expenses1` — PR #73;
- Veggie Burger TypeScript + `76-modern-ui1` — PR #76;
- auditoria de versão `76-version-audit1` — PR #78;
- shell móvel `76-mobile-shell2` — PR #80;
- baseline arquitetural v76 — PR #82;
- consolidação da propriedade UI/shell — PR #84, merge `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`.

`v76-mobile-shell.css` é a autoridade da geometria mobile global. `v76-modern-ui.css` não deve voltar a possuir viewport, safe areas, offsets do dock ou reserva estrutural de página.

## 3. Trabalho atual — `feat/v76-ui-components1`

A branch está a consolidar componentes visuais partilhados antes de redesenhar páginas individualmente.

Já aplicado:

- revisão `76-modern-ui2`;
- altura mínima de 44 px para controlos principais;
- hierarquia consistente de `primary`, `secondary`, `danger`, `link` e `icon button`;
- estado disabled/`aria-disabled`, focus-visible e hover apenas para ponteiro fino;
- métricas consistentes de ícones dentro de botões;
- `min-width:0` e gaps comuns em grids partilhados para evitar overflow;
- apresentação de fotografias do Mercado com `object-fit:contain`, centro e fallback sem alterar identidade/preço;
- revisão de cache PWA `ui-components1`;
- testes de `modern-ui`, Veggie Burger, mobile shell e contrato de arquitetura alinhados com `76-modern-ui2`.

Gates do PR #85 antes desta atualização documental: CI `34664678296` e TypeScript Foundation `34664678384`, ambos com sucesso. O diff foi revisto e não contém alterações de domínio. Como a documentação alterou o SHA da branch, os gates devem permanecer verdes no novo head antes do merge.

Não alterado nesta branch: `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB, cifragem, sincronização, QR/scanner, faturas ou regras de Mercado.

## 4. Direção visual aprovada para implementação

Os protótipos recentes passam a ser referência de **hierarquia e composição**, não de dados inventados.

Direção:

- interface clean/premium, com pouco ruído visual;
- teal como identidade principal; cores semânticas apenas para sucesso, atenção e erro;
- uma única família tipográfica;
- menos “card dentro de card” e mais espaço em branco;
- desktop com sidebar e conteúdo amplo;
- mobile com navegação `Início · Despesas · Mercado · Planeamento · Mais`;
- ação principal evidente por contexto;
- Dashboard: resumo principal → KPIs reais → vencimentos/orçamento → categorias/atividade;
- Mercado: pesquisa/lista/carrinho/estimativa/fatura mantendo distinção entre preço observado e confirmado;
- Planeamento, Calendário e Faturas devem reutilizar os mesmos tokens, grids, botões, inputs, estados e navegação.

Qualquer métrica ou função presente num mockup que não exista no domínio atual deve ser validada antes de entrar em código.

## 5. Migração TypeScript

A meta pedida é fonte funcional 100% TypeScript. Isto **não significa ausência de JavaScript no browser**: navegadores executam JavaScript gerado pelo build. A meta correta é:

- código-fonte funcional mantido em `.ts`;
- `strict` ativo;
- sem `any` não justificado;
- JavaScript gerado apenas no build/deploy e não usado como fonte manual;
- remoção de cada ficheiro JS legado apenas depois de equivalência funcional provada.

O repositório ainda contém vários módulos JavaScript de runtime. Apagá-los agora quebraria a aplicação; a remoção será feita por blocos auditáveis.

## 6. Riscos/lacunas abertas

- validação física em iPhone/Safari/PWA continua obrigatória após mudanças de UI;
- CSS histórico v74/v75 ainda contém sobreposição e `!important` a reduzir por componente;
- `main` não tem branch protection;
- `market-experience.js` ainda requer teste dedicado para persistência de `pid` em todo o fluxo;
- TypeScript ainda cobre fundação/tipos e Veggie Burger, não o runtime completo;
- os protótipos são referência visual e não podem ser copiados literalmente quando apresentarem dados/ações não suportados pelo código real.

## 7. Próximo passo

1. Reconfirmar CI + TypeScript Foundation no head atual do PR #85.
2. Integrar a hierarquia de componentes em `main` após os gates verdes.
3. Confirmar GitHub Pages no merge.
4. Abrir bloco de redesign real, começando por Dashboard e reutilizando os componentes nas páginas Mercado, Planeamento, Calendário e Faturas.
5. Em paralelo controlado, iniciar a migração do runtime JavaScript para TypeScript por módulos, começando por funções puras/determinísticas e só depois domínio financeiro, persistência, sync e UI.
6. Só remover ficheiros JS legados quando o módulo TypeScript equivalente estiver compilado, testado e usado pelo Pages.
