# Estado do Projeto — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX  
Branch pública: `main`  
HEAD funcional publicado antes de `76-mobile-shell2`: `a68de711df1c42ec33948d3fff2f4d5e337e2436`  
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
- `76-version-audit1` — PR #78, merge `a68de711df1c42ec33948d3fff2f4d5e337e2436`.

## 3. Erro visual confirmado no iPhone — `76-mobile-shell2`

A evidência física de 11/09/2026 mostrou dois defeitos de geometria:

1. o conteúdo da `.topbar` entrava na área da status bar do iPhone, aproximando/sobrepondo o Veggie Burger à hora e aos indicadores do sistema;
2. o dock inferior persistente podia cobrir o final da página, deixando categorias/itens visualmente cortados.

A revisão do código confirmou a causa estrutural: `mobile-layout.css` ainda mantinha `.app-shell` e `.main` presos a `100dvh`, com `overflow:hidden` no shell e scroll interno em `.main`, enquanto `76-modern-ui1` já tinha mudado a `.topbar` para fluxo normal. Ficaram, portanto, duas arquiteturas de viewport parcialmente sobrepostas.

### Correção candidata

Branch: `fix/v76-mobile-shell2`.

Novo `v76-mobile-shell.css`, carregado depois de `v76-modern-ui.css`, passa a ser a autoridade final apenas para geometria móvel:

- um único scroll vertical no documento;
- `.app-shell` e `.main` deixam de impor `max-height:100dvh`/clipping;
- topbar continua no fluxo e recebe compensação explícita de `env(safe-area-inset-top)`;
- dock inferior continua fixo, mas com altura conhecida e `safe-area-inset-bottom`;
- todas as páginas reservam espaço inferior suficiente para o dock;
- ajustes próprios para ≤390 px, ≤359 px e landscape de baixa altura;
- foco, reduced-motion e forced-colors preservados.

A versão do programa permanece `0.76.0-dev.1`; o build exato continua a distinguir esta compilação, conforme D-071.

## 4. UI/UX vigente

### `76-veggie-menu2`

- fonte `src/ui/veggie-menu-toggle.ts` em TypeScript strict;
- duas barras horizontais no estado fechado;
- Web Animations API para Burger ↔ X;
- um único `#mobileMenuBtn`;
- botão fora da `.nav-drawer-shell` transformada durante drawer/swipe;
- `prefers-reduced-motion` e `forced-colors` preservados.

### `76-modern-ui1`

`v76-modern-ui.css` cobre Início, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico, Definições, dialogs, drawer, bottom navigation, tabs, formulários e estados vazios.

`76-mobile-shell2` não substitui esse design system: apenas resolve geometria, safe areas e clipping.

## 5. Versão e atualização

`76-version-audit1` mantém três identificadores separados:

- **versão da aplicação:** `0.76.0-dev.1`;
- **release pública:** `v75`;
- **build exato:** SHA Git curto + data ISO.

`Verificar e atualizar agora` executa `registration.update()` antes de concluir que o build está atualizado. A instalação continua explícita por `APPLY_UPDATE`.

## 6. Isolamento e segurança

`76-mobile-shell2` altera apenas CSS de geometria, distribuição/cache e regressões de layout. Não altera `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, schema, IndexedDB, PIN, PBKDF2, AES-GCM, backup, sincronização cifrada, QR, scanner, CSP ou regras financeiras/Mercado.

## 7. QA

Última baseline publicada:

- TypeScript `main` `34540271567`: sucesso;
- CI `main` `34540271547`: sucesso;
- Pages `34540307404`: sucesso.

`76-mobile-shell2`:

- novo teste `tests/v76-mobile-shell.test.cjs` valida safe areas, remoção de clipping `100dvh`, reserva do dock, ordem final da folha CSS, allowlist Pages e cache PWA;
- primeira execução `34541749424`: o novo teste do shell passou; a suite parou apenas porque `tests/app-update.test.cjs` esperava `0.76.0-dev.1` enquanto a branch tinha sido temporariamente avançada para `dev.2`;
- a versão foi corretamente mantida em `0.76.0-dev.1`, usando Build ID para distinguir a compilação;
- CI final funcional antes da documentação `34541849503`: sucesso integral.

## 8. Riscos/lacunas abertas

- validação física pós-publicação de `76-mobile-shell2` em iPhone/Safari/PWA ainda é obrigatória;
- validar especialmente topo/status bar, scroll até ao último item e dock em 320/375/390/430 px;
- `main` permanece sem branch protection;
- `market-experience.js` mantém a lacuna conhecida de persistência explícita de `pid` em todo o fluxo;
- release pública continua `v75` até decisão formal de promoção.

## 9. Próximo passo

Integrar `76-mobile-shell2` apenas com CI e TypeScript verdes, confirmar GitHub Pages e validar no iPhone que: (a) o Veggie Burger nunca entra na área do sistema, (b) a topbar rola naturalmente com a página e (c) o último conteúdo fica totalmente acessível acima do dock. Depois retomar `feat/v76-money-dates`.
