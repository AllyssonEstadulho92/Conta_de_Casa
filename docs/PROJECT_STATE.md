# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `2594ba1c1a3f4f2cabbcf5c92e2cdd5a8f28734c` — PR #154  
Branch funcional: `main`

## Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro cifrado em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` é a identidade canónica quando existe origem live verificável;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- UI/UX, utilitários e migração de linguagem não alteram silenciosamente domínio, persistência ou segurança.

## Estado publicado

A aplicação permanece em v76/`0.76.0`. Os blocos mais recentes são:

- PR #147 / `76-bills-mobile-alignment2`: Despesas mobile usa grelha de filtros contida, sem depender de uma faixa horizontal;
- PR #149 / `76-date-calculator1`: Calculadora de datas local em TypeScript strict em **Mais → Ferramentas**;
- PR #152 / `76-auth-prototype-final1`: ecrã de PIN consolidado numa única autoridade visual;
- PR #154 / `76-auth-exclusive-state1`: criação e desbloqueio do cofre tornam-se estados visualmente exclusivos, corrigindo a sobreposição confirmada no iPhone/Safari.

## Auth / iPhone / Safari — PR #152 + PR #154

A validação física mostrou duas etapas distintas:

1. o PR #152 consolidou o ecrã de PIN numa única composição visual, com keypad móvel de 56 px e espaçamento 30/16 px;
2. uma captura posterior mostrou simultaneamente **Criar cofre local** e **Introduza o seu PIN** no mesmo ecrã.

Causa confirmada do segundo problema:

- `events.js` já selecionava corretamente um único estado através de `idbGet('meta','vault')`;
- porém `v75-usability.css` aplicava `display:grid!important` a `#vaultCreate`;
- essa regra tinha especificidade suficiente para neutralizar visualmente o atributo `hidden` usado pelo runtime.

Correção publicada em `76-auth-exclusive-state1`:

- `hidden` volta a ser autoridade explícita para `#vaultScreen`, `#vaultCreate`, `#vaultUnlock` e painéis internos de recuperação/transferência;
- criação e desbloqueio nunca podem ser apresentados em simultâneo;
- o fluxo funcional continua a ser decidido exclusivamente pela existência do cofre local;
- a correção foi incorporada na mesma autoridade `v75-usability.css`, sem criar outra camada visual concorrente;
- keypad, espaçamentos, `100svh`, safe areas, dark mode, `forced-colors`, `prefers-reduced-motion` e targets >=44 px foram preservados;
- PIN, palavra-passe, `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação e sync não foram alterados;
- Service Worker usa o token técnico `auth-exclusive-state1` para retirar da PWA a folha antiga.

Evidência PR #154:

- head funcional: `eb8c7c3d165685776a863720ebfc2981efa80bef`;
- TypeScript Foundation PR `35003057035`: sucesso;
- CI PR `35003057086`: sucesso integral;
- merge: `2594ba1c1a3f4f2cabbcf5c92e2cdd5a8f28734c`;
- TypeScript Foundation `main` `35003207253`: sucesso;
- CI `main` `35003207139`: sucesso integral;
- Deploy Pages `35003264802`: sucesso.

Pendente: confirmação física pós-PR #154 no mesmo iPhone/Safari e na PWA instalada para verificar que apenas **Introduza o seu PIN** aparece quando o cofre já existe.

## Calculadora de datas — PR #149

Integrada em `main` no commit `8e58777f601d164bd4589f7d0e0e8f96e02686f0`.

- fonte funcional: `src/ui/date-calculator.ts`;
- runtime público gerado no build: `date-calculator.js`;
- estilos: `date-calculator.css`;
- entrada: **Mais → Ferramentas → Calculadora de datas**;
- matemática baseada nas primitivas civis de `core.js`, sem converter intervalos através de horas locais;
- diferença exata, inclusão/exclusão de extremos, anos/meses/dias, semanas, dia do ano e dia da semana;
- soma/subtração de dias corridos e úteis;
- “dias úteis” = segunda a sexta; feriados não são presumidos sem jurisdição;
- cálculo local, sem rede nem persistência no cofre;
- regressões multitimezone e gates verdes.

## Despesas — alinhamento móvel

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` + `76-bills-mobile-alignment2` estão integrados:

- `renderBills()` e `events.js` continuam autoridades funcionais;
- IDs canónicos não mudaram;
- lupa Lucide local é a única lupa funcional;
- Estado/Categoria e De/Até usam grelha móvel contida;
- Ordenar e Limpar filtros ocupam linhas completas;
- `<=360px` empilha antes de cortar conteúdo;
- sem alteração de cálculos, persistência, QR, scanner ou sync.

Pendente: validação física final no mesmo iPhone/PWA após refresh de cache.

## Planeamento

`76-planning-budget-card2` + `76-planning-ring-shape1` permanecem integrados:

- `#monthPicker`, `#monthPlanForm` e `#monthlyBudget` continuam autoridades canónicas;
- navegação mensal usa Lucide local;
- orçamento ausente permanece `Por definir`;
- anel usa `height:auto!important` + `aspect-ratio:1/1!important` para impedir elipse;
- diâmetros móveis: 136/128/116 px conforme breakpoint;
- cálculos e persistência não foram alterados.

Pendente: confirmação visual no mesmo iPhone/PWA.

## Segurança — dívida aberta

### ALTO

- validar PR #154 fisicamente no iPhone/Safari web e PWA;
- validar PR #147 e `76-planning-ring-shape1` no mesmo dispositivo;
- criar E2E WebKit/Chromium para PIN → Dashboard → drawer → Despesas → Adicionar → Manual/Imagem/QR;
- reduzir gradualmente a cascade CSS e o uso de `!important` por componente;
- `main` continua sem required checks/branch protection obrigatórios.

### MÉDIO

- a página Segurança ainda não deve afirmar “Sem CDNs” enquanto ZXing carregar de `unpkg.com`;
- empacotar ZXing localmente com licença preservada;
- depois remover `https://unpkg.com` de `script-src`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir.

## Próximo passo

1. validar fisicamente `76-auth-exclusive-state1` no mesmo iPhone/Safari e PWA instalada;
2. confirmar Despesas e Planeamento no mesmo dispositivo;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local + licença e endurecer CSP;
5. criar E2E WebKit/Chromium;
6. continuar TypeScript por módulos de baixo acoplamento, preservando invariantes.
