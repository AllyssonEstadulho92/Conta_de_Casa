# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `1bf42cfc2ed7c2b67413db49c7828416dcae4d4c` — PR #163  
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
- PR #161 / `76-date-calculator-mobile-spacing3`: Data inicial, Trocar e Data final formam um grupo móvel compacto;
- PR #163 / `76-date-calculator-prototype-inputs4`: campos de data, controlo Trocar e regra de contagem alinhados ao protótipo aprovado.

## Calculadora de datas — estado atual

Autoridade funcional: `src/ui/date-calculator.ts` / `76-date-calculator1`.  
Autoridade visual: `date-calculator.css` / `76-date-calculator-layout2`, com refinamentos internos `76-date-calculator-mobile-spacing3` e `76-date-calculator-prototype-inputs4`.

O PR #163 adapta a apresentação ao protótipo aprovado sem criar uma segunda implementação:

- os campos `input[type="date"]` preservam o seletor nativo;
- a affordance nativa do calendário fica à esquerda em WebKit, com divisor visual interno;
- o valor da data mantém espaço reservado entre calendário e ação **Hoje**;
- **Hoje** permanece à direita com target >=44 px;
- em `<=560px`, Data inicial → Trocar → Data final continuam num grupo vertical com gap de 8 px;
- o controlo **Trocar** passa a funcionar visualmente como eixo horizontal, mantendo uma superfície central de 44×44 px;
- **Regra de contagem** usa duas colunas quando existe largura suficiente e passa a uma coluna em `<=430px` para evitar compressão;
- inputs principais mantêm 52 px e texto de 16 px;
- `100svh`, safe areas, `forced-colors`, `prefers-reduced-motion` e impressão/PDF permanecem suportados;
- Service Worker usa o token técnico `date-calculator-prototype-inputs4` para invalidar a apresentação anterior.

A lógica continua local e baseada nas primitivas civis de `core.js`. Não foi alterada a matemática de datas, inclusão/exclusão dos limites, soma/subtração, definição de dias úteis ou persistência.

Evidência PR #163:

- head funcional `c2bbcf7d98bcd7511dbde748e049f3e15258bd3b`;
- TypeScript Foundation PR `35023063165`: sucesso;
- CI PR `35023063147`: sucesso integral;
- merge `1bf42cfc2ed7c2b67413db49c7828416dcae4d4c`;
- TypeScript Foundation `main` `35023156381`: sucesso;
- CI `main` `35023156390`: sucesso integral;
- Deploy Pages `35023224573`: sucesso.

Pendente: confirmação física no mesmo iPhone/Safari/PWA de que o indicador nativo, o divisor, o botão Hoje, o eixo Trocar e a regra de contagem mantêm a composição prevista sem clipping.

## Auth / iOS — PR #158

`v75-usability.css` continua a única autoridade visual do cofre.

- keypad móvel mantém 56 px com `column-gap:30px` e `row-gap:16px`;
- espaço entre marca e conteúdo: 16 px;
- campo PIN e keypad usam 18 px de separação dos blocos anteriores;
- CTA **Entrar** mantém 52 px;
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

1. validar `76-date-calculator-prototype-inputs4` no iPhone/Safari/PWA;
2. validar `76-auth-spacing3` e os restantes blocos móveis pendentes;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local e endurecer CSP;
5. continuar a consolidação por componente e a migração TypeScript sem alterar invariantes.
