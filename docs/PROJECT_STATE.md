# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline funcional em `main`: `a80c0f9bfdbd9135dea69368ca2bde56196fab5d` — PR #165  
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
- PR #163 / `76-date-calculator-prototype-inputs4`: primeira aproximação dos campos de data ao protótipo;
- PR #165 / `76-date-calculator-prototype-inputs5`: corrige o overflow/clipping real observado no Safari/iOS sem alterar a lógica da calculadora.

## Calculadora de datas — estado atual

Autoridade funcional: `src/ui/date-calculator.ts` / `76-date-calculator1`.  
Autoridade visual: `date-calculator.css` / `76-date-calculator-layout2`, com refinamentos internos `76-date-calculator-mobile-spacing3` e `76-date-calculator-prototype-inputs5`.

A captura física posterior ao PR #163 confirmou que reposicionar `::-webkit-calendar-picker-indicator` com posicionamento absoluto podia aumentar a largura intrínseca do `input[type="date"]` no WebKit e deslocar/cortar toda a secção. O PR #165 substitui essa abordagem por uma composição contida:

- `.cdc-datecalc-input-action` é a moldura única do campo e usa grelha `48px minmax(0,1fr) auto`;
- a affordance visual de calendário fica na primeira coluna e não cria dependência de rede nem um segundo date picker;
- o `input[type="date"]` nativo permanece na coluna central, com `min-width:0`, sem borda própria duplicada;
- o indicador WebKit nativo deixa de ser deslocado horizontalmente; fica colapsado visualmente para não interferir na geometria;
- **Hoje** passa a ocupar uma coluna própria à direita, mantendo target >=44 px;
- o foco visível pertence à moldura através de `:focus-within`, evitando outlines duplicados;
- em `<=560px`, Data inicial → Trocar → Data final continuam num grupo vertical com gap de 8 px;
- **Trocar** mantém o eixo horizontal e superfície central 44×44 px;
- **Regra de contagem** mantém duas opções lado a lado em telemóveis comuns e só empilha em `<=340px`;
- inputs continuam com texto de 16 px, `100svh`, safe areas, `forced-colors`, `prefers-reduced-motion` e impressão/PDF;
- o Service Worker não recebeu novo token neste hotfix: `date-calculator.css` já é um asset público servido network-first/no-store, por isso a correção pode chegar num reload normal sem obrigar a passar pelo ecrã de atualização.

A matemática civil, inclusão/exclusão dos limites, soma/subtração, dias úteis, TypeScript funcional e persistência permanecem inalterados.

Evidência PR #165:

- head funcional `045d72e5af30b8a4f22ee6d3630ecb898e1f8a3e`;
- TypeScript Foundation PR `35025919784`: sucesso;
- CI PR `35025919606`: sucesso integral;
- merge `a80c0f9bfdbd9135dea69368ca2bde56196fab5d`;
- TypeScript Foundation `main` `35025991379`: sucesso;
- CI `main` `35025991388`: sucesso integral;
- Deploy Pages `35026044123`: sucesso.

Pendente: confirmação física no mesmo iPhone/Safari/PWA de que o campo permanece totalmente contido e a composição corresponde ao protótipo sem clipping lateral.

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

1. validar `76-date-calculator-prototype-inputs5` no iPhone/Safari/PWA;
2. validar `76-auth-spacing3` e os restantes blocos móveis pendentes;
3. corrigir a descrição factual de rede em Segurança;
4. empacotar ZXing local e endurecer CSP;
5. continuar a consolidação por componente e a migração TypeScript sem alterar invariantes.
