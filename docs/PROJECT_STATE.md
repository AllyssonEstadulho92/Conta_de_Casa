# Estado do Projeto — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `2a9cc3148e5750561b14f6a0505934d1a6d74d05` — PR #85  
Trabalho atual: `redesign/v76-product-hierarchy1` — Dashboard `76-product-pages1`  
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

Integrações relevantes:

- fundação TypeScript strict — PR #72;
- Despesas/Faturas `75-expenses1` — PR #73;
- Veggie Burger TypeScript + `76-modern-ui1` — PR #76;
- auditoria de versão `76-version-audit1` — PR #78;
- shell móvel `76-mobile-shell2` — PR #80;
- baseline arquitetural v76 — PR #82;
- propriedade UI/shell — PR #84;
- componentes partilhados `76-modern-ui2` / `ui-components1` — PR #85, merge `2a9cc3148e5750561b14f6a0505934d1a6d74d05`.

Após o merge do PR #85, GitHub Pages iniciou o deploy do novo `main`; a confirmação final do deployment deve ser registada quando o workflow terminar.

## 3. Trabalho atual — `redesign/v76-product-hierarchy1`

Primeiro bloco do redesign real já iniciado no código.

### Dashboard — `76-product-pages1`

Factos preservados do runtime real:

- `renderDashboard()` continua a usar `dashboardNumbers()`;
- saldo atual continua a ser `n.current`;
- por pagar continua a ser `n.pending`;
- em atraso continua a ser `n.overdue`;
- saldo projetado continua a ser `n.projected`;
- “Pago no mês” e “Próximos 7 dias” continuam a vir dos valores existentes;
- vencimentos, orçamento, categorias e atividade continuam a usar os mesmos renderizadores/dados.

Alteração visual:

- o cartão de `Saldo atual` existente passa a ser o resumo financeiro dominante;
- três KPIs reais ficam num nível secundário;
- alertas deixam de competir com o resumo principal;
- métricas secundárias tornam-se compactas;
- desktop organiza detalhe em `vencimentos + orçamento` e `atividade + categorias`;
- mobile usa fluxo `resumo → KPIs → métricas → vencimentos → orçamento → categorias → atividade`;
- nenhum novo cálculo ou métrica foi inventado;
- reduced-motion e forced-colors têm tratamento explícito.

### Nova camada visual

`v76-product-pages.css` é a camada v76 destinada à **composição e hierarquia das páginas**. Ela carrega depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`.

Ela não pode assumir:

- viewport;
- safe areas;
- scroll global;
- posição/dimensões estruturais do topbar;
- posição/dimensões estruturais do dock mobile.

Essas responsabilidades continuam exclusivas de `v76-mobile-shell.css`.

### Build/PWA/QA

- `scripts/prepare-pages.cjs` publica `v76-product-pages.css` como `76-product-pages1`;
- `sw.js` inclui a nova camada e invalida o cache com `product-pages1`;
- `tests/v76-product-pages.test.cjs` verifica ordem visual, responsive, reutilização do domínio existente e separação do shell;
- CI inclui o novo gate.

O primeiro CI da branch passou por sintaxe, finanças, Mercado, segurança, responsive, sync e pelo novo teste de hierarquia; conclusão final do workflow ainda deve ser confirmada após a última atualização documental.

## 4. Direção visual aprovada

Os protótipos são referência de **hierarquia e composição**, não de dados inventados.

- interface clean/premium com pouco ruído visual;
- teal como identidade; cores semânticas apenas quando têm função;
- uma família tipográfica;
- menos “card dentro de card” e mais espaço em branco;
- desktop com sidebar e conteúdo amplo;
- mobile com navegação `Início · Despesas · Mercado · Planeamento · Mais`;
- uma ação primária clara por contexto;
- todas as páginas devem reutilizar os mesmos tokens, componentes e estados.

Próximas páginas nesta branch: Mercado, Planeamento, Calendário e Faturas, sempre sobre funções reais já existentes.

## 5. Migração TypeScript

Meta: fonte funcional 100% TypeScript strict. Isto não significa ausência de JavaScript no browser; o browser recebe JavaScript gerado pelo build.

Regras:

- código-fonte funcional mantido em `.ts`;
- sem `@ts-nocheck` ou `any` em massa;
- JavaScript compilado é artefacto, não fonte manual;
- cada ficheiro JS legado só é removido depois de equivalência funcional provada;
- migração por blocos: funções puras → domínio financeiro → Mercado → core/persistência/cifra → sync → UI → PWA/build → testes/tooling.

Ainda não é seguro apagar `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` ou restantes módulos runtime. A remoção imediata quebraria a aplicação.

## 6. Riscos/lacunas abertas

- validação física em iPhone/Safari/PWA continua obrigatória após mudanças de UI;
- CSS histórico v74/v75 ainda contém sobreposição e `!important` a reduzir gradualmente;
- `main` não tem branch protection;
- `market-experience.js` ainda requer teste dedicado para persistência de `pid` em todo o fluxo;
- TypeScript ainda não cobre o runtime completo;
- protótipos não podem introduzir silenciosamente tarefas, simulações, comparações ou métricas inexistentes.

## 7. Próximo passo

1. Confirmar CI da branch após a documentação e abrir PR do Dashboard.
2. Validar visualmente o Dashboard publicado em preview/Pages antes de expandir a mesma camada.
3. Aplicar `76-product-pages` a Mercado, Planeamento, Calendário e Faturas.
4. Abrir branch separada para o primeiro módulo runtime TypeScript, sem misturar migração de linguagem com o redesign.
5. Só remover JavaScript fonte quando o build TypeScript equivalente estiver a alimentar o `dist/` com regressões verdes.
