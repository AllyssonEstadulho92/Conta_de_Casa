# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main` antes deste PR: `8e58777f601d164bd4589f7d0e0e8f96e02686f0` — PR #149  
Bloco em validação: PR #150 / `76-auth-ios-spacing2`

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

## Estado atual

A aplicação permanece em v76/`0.76.0`. Os blocos mais recentes são:

- PR #147 / `76-bills-mobile-alignment2`: Despesas mobile deixou de depender de uma faixa horizontal de filtros e passou para grelha contida;
- PR #149 / `76-date-calculator1`: Calculadora de datas local em TypeScript strict, integrada em **Mais → Ferramentas**, com diferença civil, soma/subtração de dias e dias úteis;
- PR #150 / `76-auth-ios-spacing2`: correção do espaçamento do ecrã de PIN no iPhone/Safari, ainda em validação neste branch.

## Auth / iPhone / Safari — PR #150

Problema observado fisicamente: o ecrã de PIN apresentava demasiado espaço vertical e o conteúdo inferior aproximava-se/ficava atrás das barras do Safari, apesar de os controlos estarem funcionais.

Correção implementada em `v75-usability.css`:

- o cofre móvel usa `min-height:100svh` para considerar a altura pequena/útil do browser com chrome visível;
- `.vault-card` passa de margem vertical automática para `margin:0 auto`, evitando recentragem vertical do formulário;
- ritmo vertical é reduzido progressivamente sem alterar a hierarquia;
- breakpoint adicional `<=900px` usa keypad de 58 px;
- `<=780px` mantém 54 px;
- `<=640px` mantém 48 px;
- todos os tamanhos continuam acima do piso tátil de 44 px;
- safe areas, zoom manual, `prefers-reduced-motion`, `forced-colors` e dark mode são preservados;
- nenhuma função de PIN, unlock, cifra, IndexedDB, importação ou sync foi alterada;
- Service Worker recebeu apenas o token técnico `auth-ios-spacing2` para invalidar a geometria anterior na PWA instalada.

Pendente: confirmar no mesmo iPhone/Safari e na PWA instalada após publicação que a zona inferior fica confortável com as barras do browser abertas e recolhidas.

## Calculadora de datas — PR #149

Integrada em `main` no commit `8e58777f601d164bd4589f7d0e0e8f96e02686f0`.

- fonte funcional: `src/ui/date-calculator.ts`;
- runtime público gerado no build: `date-calculator.js`;
- estilos: `date-calculator.css`;
- entrada: **Mais → Ferramentas → Calculadora de datas**;
- matemática baseada em datas civis já existentes em `core.js`, sem converter intervalos através de horas locais;
- diferença exata, inclusão/exclusão de extremos, anos/meses/dias, semanas, dia do ano e dia da semana;
- soma/subtração de dias corridos e úteis;
- “dias úteis” significa explicitamente segunda a sexta; feriados não são presumidos sem jurisdição;
- cálculo local, sem rede nem persistência no cofre;
- testes multitimezone adicionados e CI/TypeScript Foundation verdes no PR e após merge.

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

- criar E2E WebKit/Chromium para PIN → Dashboard → drawer → Despesas → Adicionar → Manual/Imagem/QR;
- validar PR #150 fisicamente no iPhone/Safari web e PWA;
- validar PR #147 e `76-planning-ring-shape1` no mesmo dispositivo;
- reduzir gradualmente a cascade CSS e o uso de `!important` por componente;
- `main` continua sem required checks/branch protection obrigatórios.

### MÉDIO

- a página Segurança ainda não deve afirmar “Sem CDNs” enquanto ZXing carregar de `unpkg.com`;
- empacotar ZXing localmente com licença preservada;
- depois remover `https://unpkg.com` de `script-src`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir.

## Próximo passo

1. concluir CI do PR #150;
2. publicar e validar fisicamente o novo espaçamento do cofre no iPhone/Safari e PWA;
3. confirmar Despesas e Planeamento no mesmo dispositivo;
4. corrigir a descrição factual de rede em Segurança;
5. empacotar ZXing local + licença e endurecer CSP;
6. criar E2E WebKit/Chromium;
7. continuar TypeScript por módulos de baixo acoplamento, preservando invariantes.
