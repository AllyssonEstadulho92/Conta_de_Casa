# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build público: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX  
Branch pública: `main`  
Branch de trabalho: `fix/v76-menu-flow-modern-ui`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica no pipeline especializado de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e funcionamento offline não podem regredir por mudanças visuais;
- alterações UI/UX não podem modificar cálculos, pagamentos, faturas, persistência ou segurança.

## 2. Base integrada em `main`

- `75-market1` — Mercado;
- `75-expenses1` — Despesas/Faturas;
- fundação TypeScript — PR #72;
- `76-veggie-menu1` — PR #74;
- documentação de publicação — PR #75.

## 3. Evidência física recebida em iPhone/Safari

A captura real de 10/09/2026 mostrou duas regressões de apresentação:

1. o Veggie Burger fechado aparece, mas a transição ao abrir não é percebida de forma fiável;
2. a topbar mantida sticky/fixa entra em conflito com o fluxo do conteúdo durante scroll, produzindo uma composição visual incoerente.

A mesma captura confirmou que o conteúdo funcional continua presente: conciliação, resumo mensal, ações rápidas, categorias e navegação inferior.

## 4. Candidato atual — `76-veggie-menu2` + `76-modern-ui1`

### Menu

`src/ui/veggie-menu-toggle.ts` passa a animar explicitamente as duas linhas por Web Animations API:

- fechado: duas linhas horizontais;
- aberto: superior `+45°`, inferior `-45°`;
- ambas mantêm `opacity: 1` durante a transição;
- o mesmo `#mobileMenuBtn` continua canónico;
- o botão permanece fora da `.nav-drawer-shell` transformada enquanto o drawer está aberto;
- `prefers-reduced-motion` permanece suportado.

### Cabeçalho

`v76-modern-ui.css` remove a política fixa/sticky no mobile:

- `.topbar` volta ao fluxo normal com `position: relative`;
- `.main` deixa de reservar padding fantasma para um header fixo;
- o conteúdo começa depois do cabeçalho sem sobreposição;
- o cabeçalho mantém identidade teal, hierarquia e alvo táctil adequado.

### Sistema visual master

Criado `v76-modern-ui.css` como última camada visual transversal, cobrindo explicitamente:

- Início;
- Despesas;
- Mercado;
- Calendário;
- Planeamento;
- Relatórios;
- Objetivos;
- Segurança;
- Diagnóstico;
- Definições;
- dialogs;
- drawer;
- bottom navigation;
- estados vazios, formulários, botões, tabs e superfícies.

O sistema introduz tokens coerentes para superfícies, contraste, bordas, sombras, raios, estados, foco e espaçamento. Mantém tema escuro, `prefers-reduced-motion` e `forced-colors`.

## 5. Distribuição

`scripts/prepare-pages.cjs` foi preparado para:

- publicar `v76-veggie-menu.css/js?v=76-veggie-menu2`;
- publicar `v76-modern-ui.css?v=76-modern-ui1` depois de `v75-usability.css`;
- manter todos os módulos funcionais atuais em JavaScript durante a migração incremental.

`sw.js` inclui o novo asset e invalida o cache em `veggie-menu2-modern-ui1`.

## 6. QA atual

Branch `fix/v76-menu-flow-modern-ui`, head funcional validado antes da documentação:

- CI push `34537017339`: **sucesso**;
- `v76 Veggie Burger TypeScript tests`: sucesso;
- `v76 master UI tests`: sucesso;
- regressões de finanças, faturas, Mercado, scanner, segurança, responsividade, acessibilidade, sincronização e manifest: sucesso.

TypeScript strict será confirmado novamente pelo workflow de pull request antes do merge.

## 7. Riscos e limites

- testes automáticos não substituem validação física em Safari/iPhone;
- o redesign é CSS e não muda a lógica de negócio;
- a topbar deixa deliberadamente de acompanhar o scroll no mobile porque a evidência física mostrou que isso prejudicava a arquitetura visual;
- a navegação inferior continua fixa por ser controlo persistente de navegação, mas passa a formato dock compacto.

## 8. Próximo passo

1. atualizar os cinco documentos permanentes;
2. comparar branch com `main` e confirmar ausência de regressões não intencionais;
3. abrir PR;
4. exigir CI + TypeScript strict verdes;
5. integrar apenas com checks verdes;
6. confirmar CI + TypeScript + Pages no SHA integrado;
7. validar fisicamente em iPhone/Safari o menu, scroll e todas as páginas principais;
8. só depois retomar `feat/v76-money-dates`.
