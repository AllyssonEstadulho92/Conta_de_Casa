# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `00ec8351cfedb8eba657fe4f19a4f2614c86347f` — PR #156  
Branch funcional: `main`

## Invariantes

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro local cifrado;
- sync opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` mantém identidade de origem verificável;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- alterações visuais não podem alterar domínio, persistência ou regras de cálculo.

## Estado publicado

Blocos atuais relevantes:

- PR #147 / `76-bills-mobile-alignment2`: filtros de Despesas em grelha móvel contida;
- PR #149 / `76-date-calculator1`: Calculadora de datas local em TypeScript strict;
- PR #152 / `76-auth-prototype-final1`: composição móvel consolidada do cofre;
- PR #154 / `76-auth-exclusive-state1`: criação e desbloqueio do cofre são estados visualmente exclusivos;
- PR #156 / `76-date-calculator-layout2`: autoridade visual canónica da Calculadora de datas.

## Calculadora de datas — estado atual

Autoridade funcional: `src/ui/date-calculator.ts`.  
Autoridade visual: `date-calculator.css` / `76-date-calculator-layout2`.

O PR #156 reconfigurou o componente sem alterar a matemática civil:

- escala de espaçamento 4/8/12/16/20/24/32 px;
- desktop: formulário/resultado na área principal e informação rápida na coluna lateral;
- mobile `<=820px`: **Calculadora → Informação rápida → Resultado → Ações**;
- `<=560px`: campos de data, resultado e ações empilham antes de comprimir;
- `<=430px`: grupos secundários passam a uma coluna;
- `<=360px`: dialog usa `100svh` em ecrã completo;
- inputs principais usam 52 px e texto de 16 px;
- targets essenciais permanecem >=44 px;
- sem scroll horizontal como requisito de navegação;
- `forced-colors`, `prefers-reduced-motion` e impressão/PDF permanecem suportados;
- Service Worker usa o token técnico `date-calculator-layout2` para invalidar o CSS anterior.

A lógica continua local, baseada nas primitivas civis de `core.js`; não foi criada uma segunda implementação de cálculos. Dias úteis continuam a significar segunda a sexta-feira e não descontam feriados sem jurisdição configurada.

Evidência:

- PR #156 head: `e82bcf394be18fb3f102164242704040289ccab8`;
- TypeScript Foundation PR `35016302805`: sucesso;
- CI PR `35016302738`: sucesso integral;
- merge `00ec8351cfedb8eba657fe4f19a4f2614c86347f`;
- TypeScript Foundation `main` `35016376375`: sucesso;
- CI `main` `35016376360`: sucesso integral;
- Deploy Pages `35016440963`: sucesso.

Pendente: validação física em iPhone/Safari/PWA, tablet e desktop, incluindo scroll, top-layer, partilha e impressão/PDF.

## Auth / iOS

`76-auth-prototype-final1` + `76-auth-exclusive-state1` permanecem integrados. O estado visual do cofre continua exclusivo e a composição móvel usa `100svh`, safe areas e targets adequados. A lógica de criação/desbloqueio e o armazenamento local não foram alterados pelo PR #156.

Pendente: validação física pós-PR #154 no mesmo iPhone/Safari e PWA instalada.

## Despesas

`76-bills-mobile-filters1` + `76-bills-mobile-spacing1` + `76-bills-mobile-alignment2` permanecem integrados. Pesquisa, filtros e IDs funcionais são preservados; a apresentação móvel evita faixa horizontal e empilha em ecrãs estreitos.

Pendente: validação física final no mesmo iPhone/PWA.

## Planeamento

`76-planning-budget-card2` + `76-planning-ring-shape1` permanecem integrados. Orçamento ausente continua `Por definir`; o anel mantém proporção 1:1 e a gravação continua no formulário canónico.

Pendente: validação física no mesmo iPhone/PWA.

## Segurança — dívida aberta

- corrigir o texto de rede da página Segurança enquanto existir dependência remota do scanner;
- empacotar ZXing localmente com licença preservada;
- só depois retirar a origem remota da CSP;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- criar E2E WebKit/Chromium para os fluxos críticos.

## Próximo passo

1. validar `76-date-calculator-layout2` no iPhone/Safari/PWA e desktop;
2. confirmar Auth, Despesas e Planeamento em dispositivo real;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local e endurecer CSP;
5. continuar a consolidação por componente e a migração TypeScript sem alterar invariantes.
