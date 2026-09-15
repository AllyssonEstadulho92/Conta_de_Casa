# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `79cd9e52feb0ac87678c253e0392ba402ae6f718` — PR #158  
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
- PR #156 / `76-date-calculator-layout2`: autoridade visual canónica da Calculadora de datas;
- PR #158 / `76-auth-spacing3`: ritmo vertical do PIN ajustado para Safari/iOS sem alterar o fluxo de autenticação.

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

Evidência PR #156:

- merge `00ec8351cfedb8eba657fe4f19a4f2614c86347f`;
- TypeScript Foundation `main` `35016376375`: sucesso;
- CI `main` `35016376360`: sucesso integral;
- Deploy Pages `35016440963`: sucesso.

Pendente: validação física em iPhone/Safari/PWA, tablet e desktop, incluindo scroll, top-layer, partilha e impressão/PDF.

## Auth / iOS — PR #158

`v75-usability.css` continua a única autoridade visual do cofre. O PR #158 não cria nova folha nem duplica handlers; apenas corrige o ritmo vertical dentro da autoridade existente.

Alterações de apresentação:

- keypad móvel mantém 56 px com `column-gap:30px` e `row-gap:16px`;
- espaço entre marca e conteúdo: 16 px;
- campo PIN e keypad usam 18 px de separação dos blocos anteriores;
- CTA **Entrar** mantém 52 px e passa a 20 px após o keypad;
- ações secundárias ficam mais próximas do CTA sem perder targets >=44 px;
- transferência passa a 14 px de margem superior + 12 px de separador interno;
- `#vaultMessage:empty` deixa de reservar altura quando não existe mensagem;
- `100svh`, safe areas, input >=16 px, pinch-to-zoom, dark mode, `forced-colors` e `prefers-reduced-motion` permanecem ativos;
- cache PWA recebe o token técnico `auth-spacing3`.

Preservado: PIN, palavra-passe, `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync e dados financeiros.

Evidência PR #158:

- head `4632fa25a608524a5e0ce2e313378a21f1458e9f`;
- TypeScript Foundation PR `35019148671`: sucesso;
- CI PR `35019148364`: sucesso integral;
- merge `79cd9e52feb0ac87678c253e0392ba402ae6f718`;
- TypeScript Foundation `main` `35019232012`: sucesso;
- CI `main` `35019231922`: sucesso integral;
- Deploy Pages `35019295696`: sucesso.

Pendente: confirmação física no mesmo iPhone/Safari e PWA instalada para validar que transferência e nota inferior permanecem acima do browser chrome.

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

1. validar `76-auth-spacing3` no iPhone/Safari/PWA;
2. validar `76-date-calculator-layout2` e os restantes blocos móveis pendentes;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local e endurecer CSP;
5. continuar a consolidação por componente e a migração TypeScript sem alterar invariantes.
