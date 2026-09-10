# Estado do Projeto — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX  
Branch pública: `main`  
HEAD funcional publicado: `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica no pipeline especializado de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e funcionamento offline não podem regredir por mudanças visuais;
- alterações UI/UX, shell ou versionamento não podem modificar cálculos, pagamentos, faturas, persistência ou segurança.

## 2. Estado integrado em `main`

- `75-market1` — Mercado;
- `75-expenses1` — Despesas/Faturas;
- fundação TypeScript — PR #72;
- `76-veggie-menu1` — PR #74;
- `76-veggie-menu2` + `76-modern-ui1` — PR #76, merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`;
- `76-version-audit1` — PR #78, merge `a68de711df1c42ec33948d3fff2f4d5e337e2436`;
- `76-mobile-shell2` — PR #80, merge `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`.

## 3. Erro visual confirmado no iPhone e correção publicada

A evidência física de 11/09/2026 mostrou dois defeitos de geometria:

1. o conteúdo da `.topbar` entrava na área da status bar do iPhone, aproximando/sobrepondo o Veggie Burger à hora e aos indicadores do sistema;
2. o dock inferior persistente podia cobrir o final da página, deixando categorias/itens visualmente cortados.

A revisão do código confirmou a causa estrutural: `mobile-layout.css` ainda mantinha `.app-shell` e `.main` presos a `100dvh`, com `overflow:hidden` no shell e scroll interno em `.main`, enquanto `76-modern-ui1` já tinha mudado a `.topbar` para fluxo normal. Existiam duas arquiteturas de viewport parcialmente sobrepostas.

`76-mobile-shell2` corrige a geometria móvel com uma camada final específica, carregada depois de `v76-modern-ui.css`:

- um único scroll vertical no documento;
- `.app-shell` e `.main` sem `max-height:100dvh`/clipping na camada final;
- topbar no fluxo com compensação explícita de `env(safe-area-inset-top)`;
- dock inferior fixo com altura conhecida e `safe-area-inset-bottom`;
- páginas com reserva inferior calculada para manter o último conteúdo acima do dock;
- ajustes para ≤390 px, ≤359 px e landscape de baixa altura;
- foco, reduced-motion, forced-colors e pinch-to-zoom preservados.

A versão do programa permanece `0.76.0-dev.1`; o Build ID distingue cada compilação.

## 4. UI/UX vigente

`76-modern-ui1` continua a ser o design system transversal para Início, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico, Definições, dialogs, drawer, bottom navigation, tabs, formulários e estados vazios.

`76-mobile-shell2` não substitui esse design system: resolve apenas viewport, safe areas, scroll e clipping. `76-veggie-menu2` continua a controlar o Veggie Burger/X em TypeScript strict.

## 5. Versão e atualização

`76-version-audit1` mantém três identificadores separados:

- **versão da aplicação:** `0.76.0-dev.1`;
- **release pública:** `v75`;
- **build exato:** SHA Git curto + data ISO.

`Verificar e atualizar agora` executa `registration.update()` antes de concluir que o build está atualizado. A instalação continua explícita por `APPLY_UPDATE`.

## 6. Isolamento e segurança

`76-mobile-shell2` altera CSS de geometria, distribuição/cache e regressões de layout. Não altera `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, schema, IndexedDB, PIN, PBKDF2, AES-GCM, backup, sincronização cifrada, QR, scanner, CSP ou regras financeiras/Mercado.

## 7. QA e publicação

`76-mobile-shell2`:

- teste específico `tests/v76-mobile-shell.test.cjs`: sucesso;
- CI funcional da branch `34541849503`: sucesso integral;
- PR #80: CI e TypeScript Foundation concluídos com sucesso;
- merge em `main`: `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`;
- TypeScript Foundation de `main` `34542259212`: sucesso;
- CI de `main` `34542259148`: sucesso;
- GitHub Pages `34542303536`: sucesso.

## 8. Riscos/lacunas abertas

- validação física pós-publicação de `76-mobile-shell2` em iPhone/Safari/PWA continua obrigatória;
- validar especialmente topo/status bar, scroll até ao último item e dock em 320/375/390/430 px;
- `main` permanece sem branch protection;
- `market-experience.js` mantém a lacuna conhecida de persistência explícita de `pid` em todo o fluxo;
- release pública continua `v75` até decisão formal de promoção.

## 9. Próximo passo

Validar no iPhone/Safari/PWA que: (a) o Veggie Burger nunca entra na área do sistema, (b) a topbar rola naturalmente com a página e (c) o último conteúdo fica totalmente acessível acima do dock. Se a validação física for positiva, retomar `feat/v76-money-dates`.
