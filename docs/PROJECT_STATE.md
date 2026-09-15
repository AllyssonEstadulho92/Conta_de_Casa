# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `a1cbdce6661bbde015699fca39d5aa7ac284ec90` — PR #161  
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
- PR #158 / `76-auth-spacing3`: ritmo vertical do PIN ajustado para Safari/iOS;
- PR #161 / `76-date-calculator-mobile-spacing3`: Data inicial, Trocar e Data final formam um grupo móvel compacto.

## Calculadora de datas — estado atual

Autoridade funcional: `src/ui/date-calculator.ts`.  
Autoridade visual: `date-calculator.css` / `76-date-calculator-layout2`, com refinamento interno `76-date-calculator-mobile-spacing3`.

O PR #156 consolidou o componente sem alterar a matemática civil e o PR #161 corrige especificamente o espaçamento observado no telemóvel:

- escala de espaçamento continua 4/8/12/16/20/24/32 px;
- desktop: formulário/resultado na área principal e informação rápida na coluna lateral;
- mobile `<=820px`: **Calculadora → Informação rápida → Resultado → Ações**;
- `<=560px`: Data inicial → Trocar → Data final usa uma coluna flexível com gap canónico de 8 px;
- labels do grupo de datas neutralizam altura/margem herdadas que possam criar vazio artificial;
- botão Trocar mantém 44×44 px, centrado e sem margem vertical adicional;
- inputs mantêm 52 px, texto de 16 px e ação **Hoje** >=44 px;
- `<=430px`: grupos secundários passam a uma coluna;
- `<=360px`: dialog usa `100svh` em ecrã completo;
- sem scroll horizontal como requisito de navegação;
- `forced-colors`, `prefers-reduced-motion` e impressão/PDF permanecem suportados;
- Service Worker usa os tokens técnicos `date-calculator-layout2` e `date-calculator-mobile-spacing3`.

A lógica continua local, baseada nas primitivas civis de `core.js`; não foi criada uma segunda implementação de cálculos. Dias úteis continuam a significar segunda a sexta-feira e não descontam feriados sem jurisdição configurada.

Evidência PR #161:

- head `44322ce724e1ec7795b2f76f73bfd7535dc7427d`;
- TypeScript Foundation PR `35021139249`: sucesso;
- CI PR `35021139256`: sucesso integral;
- merge `a1cbdce6661bbde015699fca39d5aa7ac284ec90`;
- TypeScript Foundation `main` `35021210449`: sucesso;
- CI `main` `35021210442`: sucesso integral;
- Deploy Pages `35021281637`: sucesso.

Pendente: confirmação física no mesmo iPhone/Safari/PWA de que o espaço entre as duas datas ficou proporcional e sem novo clipping.

## Auth / iOS — PR #158

`v75-usability.css` continua a única autoridade visual do cofre. O PR #158 não cria nova folha nem duplica handlers; apenas corrige o ritmo vertical dentro da autoridade existente.

- keypad móvel mantém 56 px com `column-gap:30px` e `row-gap:16px`;
- espaço entre marca e conteúdo: 16 px;
- campo PIN e keypad usam 18 px de separação dos blocos anteriores;
- CTA **Entrar** mantém 52 px e passa a 20 px após o keypad;
- transferência passa a 14 px de margem superior + 12 px de separador interno;
- `#vaultMessage:empty` deixa de reservar altura;
- `100svh`, safe areas, input >=16 px, pinch-to-zoom, dark mode, `forced-colors` e `prefers-reduced-motion` permanecem ativos;
- cache PWA usa o token técnico `auth-spacing3`.

Preservado: PIN, palavra-passe, `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação, sync e dados financeiros.

Pendente: confirmação física no mesmo iPhone/Safari e PWA instalada.

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

1. validar `76-date-calculator-mobile-spacing3` no iPhone/Safari/PWA;
2. validar `76-auth-spacing3` e os restantes blocos móveis pendentes;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local e endurecer CSP;
5. continuar a consolidação por componente e a migração TypeScript sem alterar invariantes.
