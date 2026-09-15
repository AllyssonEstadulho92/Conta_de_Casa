# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `ceaa4fc8a79cbb2ad442854ffaacd501dac7313f` — PR #152  
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

- PR #147 / `76-bills-mobile-alignment2`: Despesas mobile usa grelha de filtros contida, sem depender de faixa horizontal;
- PR #149 / `76-date-calculator1`: Calculadora de datas local em TypeScript strict em **Mais → Ferramentas**;
- PR #150 / `76-auth-ios-spacing2`: primeira correção de altura útil do iPhone/Safari;
- PR #152 / `76-auth-prototype-final1`: substitui a composição visual anterior do PIN pelo protótipo final aprovado e consolida uma única autoridade visual do cofre.

## Auth / iPhone / Safari — PR #152

A validação física posterior ao PR #150 mostrou que o ecrã continuava visualmente incoerente: o keypad parecia demasiado estreito, o ritmo entre blocos não correspondia ao protótipo e a transferência de cofre perdia hierarquia junto ao rodapé do Safari.

Correção publicada em `76-auth-prototype-final1`:

- `v75-usability.css` passa a concentrar a autoridade visual do cofre num único bloco;
- os blocos visuais históricos `76-vault-short-height1` e `76-auth-ios-spacing2` deixam de existir como secções CSS concorrentes;
- mobile mantém `min-height:100svh`, safe areas e scroll compatível com Safari/iOS;
- `.vault-card` móvel usa `margin:0 auto`, sem recentragem vertical implícita;
- keypad móvel padrão: teclas de 56 px, `column-gap:30px` e `row-gap:16px`;
- `<=359px`: teclas 52 px, gap horizontal 24 px e vertical 13 px;
- altura útil `<=720px`: teclas 50 px, gap horizontal 22 px e vertical 9 px;
- todos os alvos essenciais permanecem >=44 px;
- teclas recebem superfície/borda/sombra discretas; apagar continua visualmente leve;
- botão Entrar, alternância para palavra-passe, recuperação e transferência passam a uma hierarquia única e mais legível;
- `Usar dados de outro dispositivo` passa a superfície própria, evitando mistura com o rodapé;
- dark mode, `forced-colors`, `prefers-reduced-motion`, pinch-to-zoom e prevenção de auto-zoom do Safari permanecem cobertos;
- PIN, unlock, PBKDF2, AES-GCM, IndexedDB, importação e sync não foram alterados;
- Service Worker usa o token técnico `auth-prototype-final1` para invalidar a apresentação anterior.

Evidência:

- PR #152 head final: `1124fc2284ab15dfc7b8e384792196a8256f89c6`;
- TypeScript Foundation PR `34977687455`: sucesso;
- CI PR `34977687437`: sucesso integral;
- merge: `ceaa4fc8a79cbb2ad442854ffaacd501dac7313f`;
- TypeScript Foundation `main` `34977780423`: sucesso;
- CI `main` `34977780342`: sucesso integral;
- Deploy Pages `34977846729`: sucesso.

Pendente apenas a validação visual física no mesmo iPhone/Safari e PWA instalada após atualização do cache. O teste automatizado confirma contratos estruturais, não proporções reais do dispositivo.

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

- validar `76-auth-prototype-final1` fisicamente no iPhone/Safari web e PWA;
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

1. validar fisicamente `76-auth-prototype-final1` no iPhone/Safari web e PWA instalada;
2. confirmar Despesas e Planeamento no mesmo dispositivo;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local + licença e endurecer CSP;
5. criar E2E WebKit/Chromium;
6. continuar TypeScript por módulos de baixo acoplamento, preservando invariantes.
