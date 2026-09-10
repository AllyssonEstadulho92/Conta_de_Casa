# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build público: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX  
Branch pública: `main`  
HEAD funcional publicado: `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`  
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

## 2. Estado integrado em `main`

- `75-market1` — Mercado;
- `75-expenses1` — Despesas/Faturas;
- fundação TypeScript — PR #72;
- `76-veggie-menu1` — PR #74;
- `76-veggie-menu2` + `76-modern-ui1` — PR #76, merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

## 3. Problemas confirmados por validação física

Captura real em iPhone/Safari mostrou:

1. o Veggie Burger fechado aparecia, mas a transição ao abrir não era percebida de forma fiável;
2. a topbar sticky/fixa permanecia no viewport durante scroll e quebrava o fluxo visual;
3. as páginas necessitavam de uma linguagem visual transversal mais consistente.

## 4. Correção publicada

### `76-veggie-menu2`

- fonte `src/ui/veggie-menu-toggle.ts` em TypeScript strict;
- duas barras horizontais no estado fechado;
- animação explícita por Web Animations API;
- barra superior termina em `+45°` e inferior em `-45°`;
- ambas permanecem visíveis durante a transformação;
- continua a existir apenas um `#mobileMenuBtn`;
- com drawer aberto, o botão fica fora da `.nav-drawer-shell` transformada para não desaparecer no swipe;
- `prefers-reduced-motion` e `forced-colors` preservados.

### `76-modern-ui1`

Nova última camada visual transversal `v76-modern-ui.css`, cobrindo:

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
- dialogs, drawer, bottom navigation, tabs, formulários e estados vazios.

No mobile, a `.topbar` passou para fluxo normal (`position: relative`) e `.main` deixou de reservar espaço para um header fixo. A navegação inferior permanece persistente em formato dock.

## 5. Isolamento

A revisão não altera `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, schema, IndexedDB, PIN, PBKDF2, AES-GCM, backup, sincronização, QR, scanner ou CSP.

## 6. QA publicado

PR #76:

- TypeScript Foundation `34537361127`: **sucesso**;
- CI `34537361274`: **sucesso**;
- branch estava `behind 0` antes do merge.

Após merge em `main` (`6323b0a9...`):

- TypeScript Foundation `34537430909`: **sucesso**;
- CI `34537430967`: **sucesso**;
- GitHub Pages `34537469989`: **sucesso**;
- testes específicos `v76 Veggie Burger TypeScript tests` e `v76 master UI tests`: sucesso;
- regressões de finanças, faturas, Mercado, scanner, segurança, responsividade, acessibilidade, sincronização e manifest: sucesso.

## 7. Validação física ainda necessária

Depois de receber o novo cache/PWA no iPhone:

- confirmar animação duas linhas ↔ X;
- confirmar swipe sem desaparecimento do botão;
- confirmar que o header rola normalmente e não fica preso no viewport;
- confirmar que bottom navigation não tapa ações;
- validar Início, Despesas, Mercado, Planeamento e Mais;
- validar restantes páginas em 320/375/390/430 px, tablet e desktop;
- validar tema claro/escuro e orientação vertical/horizontal.

## 8. Próximo passo

Após validação física de `76-modern-ui1`, corrigir apenas regressões comprovadas e depois retomar `feat/v76-money-dates` para o Bloco 2 da migração TypeScript.
