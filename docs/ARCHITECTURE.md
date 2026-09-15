# Arquitetura — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA

## 1. Modelo geral

PWA estática/local-first. O browser recebe HTML/CSS/JavaScript; a fonte funcional está a migrar incrementalmente para TypeScript strict. Não existe framework UI.

Invariantes:

- `STATE_VERSION=5`;
- dinheiro em cêntimos inteiros;
- estado financeiro local cifrado;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` canónico quando existe identidade de loja/SKU;
- fotografia não prova preço/transação.

## 2. Cofre e sessão

`core.js` continua a autoridade de estado, cifra, normalização e sessão. A UI do cofre não pode modificar lógica de derivação, desbloqueio, armazenamento ou sync.

Autoridade visual: `v75-usability.css` / `76-auth-prototype-final1`.  
Contrato de exclusividade: `76-auth-exclusive-state1`.

- criação e desbloqueio são estados mutuamente exclusivos;
- atributos `hidden` não podem ser anulados por regras decorativas;
- `100svh`, safe areas e targets adequados permanecem requisitos móveis;
- o PR #156 não altera esta arquitetura.

## 3. Rotas e navegação

Rotas canónicas:

- dashboard;
- bills;
- calendar;
- planning;
- goals;
- market;
- reports;
- security;
- diagnostics;
- settings.

`renderPage()` continua a ser o dispatcher funcional.

Autoridades móveis:

- `v75-architecture.js`: composição/navegação progressiva;
- `mobile-menu-toggle.js`: drawer/hambúrguer;
- `v76-mobile-shell.css`: viewport autenticado, safe areas, scroll e dock;
- `mobile-layout.css`: refinamentos de feature sem propriedade global do viewport.

## 4. Arquitetura visual

Autoridades atuais:

- tokens/componentes: `v76-modern-ui.css` + `design-system.css`;
- composição de páginas: `v76-product-pages.css`, `v76-planning-more.css` e camadas v75 ainda ativas;
- geometria mobile autenticada: `v76-mobile-shell.css`;
- auth/cofre: `v75-usability.css`;
- refinamentos móveis de feature: `mobile-layout.css`;
- Calculadora de datas: `date-calculator.css` / `76-date-calculator-layout2`;
- marca: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer: `mobile-menu-toggle.js/.css` + `v75-drawer-theme.css`;
- formulários de despesas/QR: `invoice-capture.js/.css`.

A redução da cascade deve ser feita por componente e protegida por regressões, nunca por eliminação global de estilos.

## 5. Despesas mobile

Autoridade funcional:

- `renderBills()` filtra/renderiza;
- `events.js` mantém listeners;
- IDs canónicos não mudam.

Apresentação móvel final: `76-bills-mobile-alignment2`, com grelha contida e fallback para uma coluna antes de cortar conteúdo.

## 6. Planeamento mobile

`76-planning-budget-card2` + `76-planning-ring-shape1`:

- `#monthPicker` continua a autoridade do mês;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- orçamento ausente permanece `Por definir`;
- o anel neutraliza altura legada e mantém proporção 1:1;
- a apresentação não altera cálculos ou persistência.

## 7. Calculadora de datas

### 7.1 Autoridade funcional — `76-date-calculator1`

Entrada: **Mais → Ferramentas → Calculadora de datas**.

Arquitetura:

- fonte canónica: `src/ui/date-calculator.ts`;
- runtime browser: `.generated/date-calculator.js` → `dist/date-calculator.js`;
- build: `scripts/build-typescript-runtime.cjs` + `scripts/prepare-pages.cjs`;
- Service Worker inclui CSS/runtime na allowlist pública.

Contratos de exatidão:

- reutiliza primitivas de data civil de `core.js`;
- diferença é de datas civis, não de milissegundos/horas locais;
- DST/fuso não alteram a contagem de dias;
- inclusão/exclusão das datas-limite é explícita;
- “dias úteis” = segunda a sexta-feira;
- feriados só podem ser descontados quando existir jurisdição e fonte explícitas;
- não usa rede nem persiste resultados no estado financeiro.

### 7.2 Autoridade visual — `76-date-calculator-layout2`

PR #156 consolida toda a apresentação em `date-calculator.css` sem criar nova folha de correção.

Sistema de espaçamento local:

- 4 px: microajustes;
- 8 px: elementos diretamente relacionados;
- 12 px: ícone/texto e grupos compactos;
- 16 px: espaçamento padrão;
- 20 px: padding intermédio;
- 24 px: separação principal;
- 32 px: reservado para separação de grande escala.

Desktop:

- grelha com área principal flexível + coluna lateral de 280 px;
- `input` e `result` ocupam a coluna principal;
- `facts` ocupa a coluna lateral;
- `actions` permanece diretamente associado ao resultado;
- cards usam a mesma família de borda, raio e sombra.

Mobile `<=820px`:

- ordem canónica: `input → facts → result → actions`;
- dialog usa `100svh`, não `100dvh`;
- safe areas são aplicadas ao cabeçalho/layout/rodapé;
- sem scroll horizontal para descobrir controlos.

Breakpoints de feature:

- `<=820px`: uma coluna e viewport móvel estável;
- `<=560px`: datas, resultado e ações empilham;
- `<=430px`: campos secundários passam a uma coluna e paddings reduzem;
- `<=360px`: dialog ocupa integralmente o viewport estável.

Controlos:

- inputs/selects principais: 52 px e texto de 16 px;
- tabs: mínimo 48 px;
- ação **Hoje**: mínimo 44 px;
- opções de contagem: mínimo 44 px por label;
- botão de troca: 44×44 px;
- CTA principal: mínimo 52 px.

Acessibilidade e modos:

- foco visível preservado;
- `forced-colors` e `prefers-reduced-motion` explícitos;
- impressão/PDF mantém apenas o conteúdo de resultado relevante;
- JavaScript/TypeScript funcional e IDs/handlers não foram duplicados.

`cdc-datecalc-workspace` usa `display:contents` apenas como composição visual para permitir que os filhos existentes participem na única grelha da ferramenta; não existe um segundo componente de estado ou cálculo.

## 8. Mercado

- pesquisa live limitada às fontes já suportadas;
- preço pesquisado permanece separado do valor confirmado;
- `marketId|pid` preserva identidade quando existe SKU verificável;
- imagem/logótipo não prova preço/transação.

## 9. Faturas e captura

Fluxo Adicionar despesa:

- Manual;
- Ler fatura por imagem/QR AT;
- QR Code por câmara.

A reconfiguração da Calculadora de datas não altera captura, finanças ou scanner.

## 10. TypeScript

Pipeline vigente:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

A Calculadora de datas continua com fonte funcional TypeScript strict; o PR #156 altera apenas CSS, teste de contrato visual e token de cache.

## 11. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → Deploy Pages`.

Service Worker:

- navegação network-first com timeout;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens técnicos invalidam cache sem alterar release pública.

PR #156 acrescenta `date-calculator-layout2` ao token técnico de cache. `package.json`, manifesto de release e versão pública permanecem inalterados.

## 12. Segurança e dependências externas

- nenhum segredo deve existir no repositório público;
- CSP está ativa;
- iconografia Lucide é local/licenciada;
- ZXing ainda é carregado remotamente, portanto a página Segurança não pode afirmar ausência total de CDN;
- a localização do ZXing deve ocorrer antes de remover a origem remota da CSP;
- `style-src 'unsafe-inline'` permanece dívida de hardening.

## 13. QA

A CI cobre sintaxe, TypeScript, finanças, isolamento, datas, QR, Mercado, scanner, UI, responsividade, acessibilidade, segurança e sync.

Regressões específicas do PR #156 protegem:

- marcador `76-date-calculator-layout2`;
- escala 4/8/12/16/20/24/32;
- grelha desktop `input/facts/result/actions`;
- ordem móvel `input → facts → result → actions`;
- `100svh` e ausência de `100dvh` na autoridade final;
- targets de 44 px nas ações menores;
- breakpoints 820/430/360;
- matemática civil multitimezone já existente.

Evidência: PR TypeScript `35016302805`, PR CI `35016302738`; após merge, TypeScript `35016376375`, CI `35016376360` e Pages `35016440963`, todos com sucesso.

Limitação: testes estáticos não substituem Safari/WebKit real para top-layer de `<dialog>`, scroll, safe areas, partilha e impressão.

## 14. Próxima consolidação

1. validar `76-date-calculator-layout2` em iPhone/Safari/PWA e desktop;
2. validar os restantes blocos móveis pendentes;
3. corrigir descrição factual de rede em Segurança;
4. empacotar ZXing localmente com licença preservada;
5. endurecer CSP depois da remoção da dependência remota;
6. criar E2E WebKit/Chromium;
7. continuar redução de cascade por componente e migração TypeScript de baixo acoplamento.
