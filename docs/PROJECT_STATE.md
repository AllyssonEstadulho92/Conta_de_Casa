# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `a140211813f2194926b2cbd5bde7c53a8798b140` — PR #150  
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
- PR #150 / `76-auth-ios-spacing2`: espaçamento do ecrã de PIN adaptado à altura útil do iPhone/Safari.

## Auth / iPhone / Safari — PR #150

Problema observado fisicamente: o ecrã de PIN apresentava demasiado espaço vertical e a zona inferior aproximava-se da barra do Safari.

Correção publicada:

- `#vaultScreen` móvel usa `min-height:100svh` para considerar o small viewport com browser chrome visível;
- `.vault-card` usa `margin:0 auto`, evitando recentragem vertical por margem automática;
- safe areas continuam via `env(safe-area-inset-*)`;
- ritmo vertical é reduzido progressivamente sem alterar a hierarquia;
- `<=900px` usa keypad de 58 px;
- `<=780px` usa 54 px;
- `<=640px` usa 48 px;
- todos os alvos essenciais continuam >=44 px;
- zoom manual, `prefers-reduced-motion`, `forced-colors` e dark mode são preservados;
- PIN, unlock, PBKDF2, AES-GCM, IndexedDB, importação e sync não foram alterados;
- Service Worker usa o token técnico `auth-ios-spacing2` para retirar a geometria anterior da PWA instalada.

Evidência:

- PR #150 head final: `5713cb7514344298aeda578e061281667c6aca48`;
- TypeScript Foundation PR `34961244599`: sucesso;
- CI PR `34961244608`: sucesso integral;
- merge: `a140211813f2194926b2cbd5bde7c53a8798b140`;
- TypeScript Foundation `main` `34961349276`: sucesso;
- CI `main` `34961349248`: sucesso integral;
- Deploy Pages `34961403315`: sucesso.

Pendente apenas a validação física final no mesmo iPhone/Safari web e PWA instalada, com barras do browser abertas/recolhidas, portrait/landscape e teclado virtual.

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
- `<=360px` empilha para evitar clipping;
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

- validar PR #150 fisicamente no iPhone/Safari web e PWA;
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

1. validar fisicamente `76-auth-ios-spacing2` no iPhone/Safari web e PWA instalada;
2. confirmar Despesas e Planeamento no mesmo dispositivo;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local + licença e endurecer CSP;
5. criar E2E WebKit/Chromium;
6. continuar TypeScript por módulos de baixo acoplamento, preservando invariantes.
