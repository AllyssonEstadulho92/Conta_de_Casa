# Arquitetura — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA

## 1. Modelo geral

PWA estática/local-first. O browser recebe HTML/CSS/JavaScript; a fonte funcional está a migrar incrementalmente para TypeScript strict. Não existe framework UI. A interface é composta por HTML, CSS e runtime próprio.

Invariantes:

- `STATE_VERSION=5`;
- dinheiro em cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` canónico quando existe identidade de loja/SKU;
- fotografia não prova preço/transação.

## 2. Segurança, cofre e sessão

`core.js` continua a autoridade de estado, cifra, normalização base e sessão:

`PIN/palavra-passe → PBKDF2 → check cifrado → AES-GCM → AppStateV5 normalizado`.

Contratos publicados:

- PIN local válido abre a aplicação sem depender do sync remoto;
- cofre e shell autenticado são visualmente exclusivos;
- `[hidden]` é autoridade explícita no Safari/WebKit;
- sync, quando configurado, continua em background;
- anexos reais continuam bloqueados até existir cifragem dedicada.

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

- `v75-architecture.js`: composição/navegação progressiva atual;
- `mobile-menu-toggle.js`: drawer/hambúrguer;
- `v76-mobile-shell.css`: geometria do viewport, safe areas, scroll e dock;
- `mobile-layout.css`: refinamentos de feature sem propriedade de viewport.

### 3.1 Hierarquia do menu completo — `76-drawer-hierarchy1`

- **Principal:** Início, Despesas, Planeamento, Mercado;
- **Análise:** Relatórios;
- **Sistema:** Segurança e sincronização, Definições.

Rotas secundárias permanecem nas páginas-pai:

- `calendar` → Despesas;
- `goals` → Planeamento;
- `diagnostics` → Definições.

O drawer permanece do lado direito para preservar controlador e gesto existentes.

## 4. Arquitetura visual

Autoridades atuais:

- tokens/componentes: `v76-modern-ui.css` + `design-system.css`;
- composição de páginas: `v76-product-pages.css`, `v76-planning-more.css` e camadas v75 ainda ativas;
- geometria mobile: `v76-mobile-shell.css`;
- refinamentos móveis específicos: `mobile-layout.css`;
- marca: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer: `mobile-menu-toggle.js/.css` + `v75-drawer-theme.css`;
- formulários de despesas/QR: `invoice-capture.js/.css`.

A cascade ainda contém regras históricas e `!important`; a redução deve ser feita por componente e com regressões, nunca por eliminação em massa.

### 4.1 Drawer móvel

`v75-drawer-theme.css` (`76-drawer-hierarchy1`) define uma lista vertical legível, targets adequados, seleção clara, safe areas, foco, `prefers-reduced-motion` e `forced-colors`.

### 4.2 Iconografia funcional — `76-icon-semantics1`

- `icon.svg` é reservado à marca;
- `ui-icons.js` usa subset Lucide local, sem icon font/CDN;
- snapshot fixado em `94e4cb9d9db5907053ebf3636a97c45529cf776b` com `LUCIDE_LICENSE.txt`;
- `plan` usa `CalendarCheck2`;
- `settings` usa `Settings`/engrenagem;
- nomes semânticos permanecem estáveis.

### 4.3 Despesas mobile — `76-bills-mobile-filters1` + `76-bills-mobile-spacing1` + `76-bills-mobile-alignment2`

Autoridade funcional preservada:

- `renderBills()` filtra/renderiza;
- `events.js` mantém listeners;
- IDs canónicos não mudaram: `billSearch`, `newBillBtn`, `billStatusFilter`, `billCategoryFilter`, `billDateFrom`, `billDateTo`, `billSort`, `billClearFilters`, `billSummary`, `billsList`.

Composição final móvel:

- pesquisa + ação principal em superfície compacta, com lupa Lucide local como única lupa funcional;
- o PR #147 neutraliza a antiga apresentação horizontal herdada de `v75-expenses-modern.css`;
- `mobile-layout.css` é a autoridade final apenas para a apresentação móvel do bloco Pesquisa + Filtros;
- filtros usam grelha contida na largura disponível, sem depender de scroll horizontal;
- Estado/Categoria ocupam a primeira linha de controlos;
- De/Até ocupam a segunda linha;
- Ordenar ocupa uma linha completa;
- Limpar filtros permanece ação terciária numa linha própria;
- espaçamento entre secções é 20 px; controlos móveis usam 50 px de altura e o target mínimo funcional continua >=44 px;
- `min-width:0` e `max-width:100%` impedem pressão horizontal e texto/inputs cortados;
- `<=360px` empilha a composição numa coluna;
- `prefers-reduced-motion` e `forced-colors` têm fallback explícito.

Limite arquitetural: `mobile-layout.css` não pode declarar geometria global de `.app-shell`, `.main`, `.topbar` ou `.mobile-nav`, nem assumir `100dvh`. O PR #147 foi corrigido durante a CI para remover `overflow:hidden` genérico que violava esse contrato; `v76-mobile-shell.css` continua a única autoridade do viewport móvel.

### 4.4 Planeamento mobile — `76-planning-budget-card2` + `76-planning-ring-shape1`

**Autoridade de dados e cálculo:**

- `dashboardNumbers()` fornece números agregados;
- `categoryTotals()` fornece distribuição de despesas;
- `monthProfile()` representa o perfil mensal;
- `#monthPicker` continua a autoridade do mês selecionado;
- `stepMonth()` apenas atualiza `#monthPicker` e dispara o `change` existente.

**Autoridade de gravação:**

- `#monthPlanForm` permanece o único formulário de planeamento mensal;
- `#monthlyBudget` permanece o único campo canónico de orçamento mensal;
- `events.js` continua a validar e executar `commit('updated','planning')`;
- botões visuais Definir/Editar apenas fazem scroll/foco para `#monthlyBudget`.

**Composição visual:**

- `v75-architecture.js` gera seletor mensal, intervalo e resumo;
- `v76-planning-more.css` estiliza o cartão;
- orçamento ausente permanece `Por definir`, sem percentagem falsa;
- navegação mensal usa Lucide local;
- em telemóveis estreitos, métricas ficam numa coluna;
- o anel usa `height:auto!important` + `aspect-ratio:1/1!important`, com 136 px, 128 px em `<=430px` e 116 px em `<=350px`.

O overview dinâmico continua oculto em `>=821px`; desktop mantém os painéis/formulários canónicos.

## 5. Design system

Direção vigente:

- superfícies neutras;
- teal como marca/ação/seleção;
- sombras mínimas;
- hierarquia por tipografia, alinhamento e espaço;
- Lucide para ações/estados e `icon.svg` para marca;
- targets essenciais >=44 px;
- WCAG 2.2 AA como referência mínima quando aplicável;
- light/dark, forced-colors e reduced-motion preservados.

## 6. Mercado

### Fontes e evidência

- pesquisa live: Pingo Doce e Continente através de cesta.pt;
- fotografia opcional: Open Food Facts quando existe correspondência forte/validada;
- preço pesquisado entra como `estimatedCents`;
- valor pago só entra em `actualCents` após confirmação;
- imagem/logótipo não prova preço/transação.

### Identidade canónica

`marketId|pid` identifica SKUs reais quando existe origem verificável. `76-market-identity1` e `76-market-identity-stale1` preservam a identidade em criação/normalização/reload/restauro/sync e impedem herança de estado transitório obsoleto.

## 7. Faturas e captura

O fluxo Adicionar despesa mantém três modos:

- Manual;
- Ler fatura por imagem/QR AT;
- QR Code por câmara.

PR #132 mantém um único proprietário de scroll no mobile Safari. PR #140/#142/#147 atuam apenas na lista/pesquisa/filtros de Despesas e não alteram captura nem domínio financeiro.

## 8. TypeScript

Fontes canónicas já existentes incluem `src/types/*`, `src/ui/market-branding.ts` e `src/sync/sync-conflict-policy.ts`.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

JavaScript manual só sai depois de substituição comprovada e regressões verdes.

## 9. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → build Pages → deploy`.

Service Worker:

- navegação network-first com timeout de 4 s;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens técnicos invalidam cache sem alterar release pública.

PR #147 acrescentou o token técnico `expenses-mobile-alignment2`. `package.json`, `release-manifest.json`, `app-update.js` e v76/`0.76.0` permanecem inalterados.

## 10. Segurança e dependências externas

- nenhum segredo deve existir no repositório público;
- CSP está ativa;
- armazenamento sensível em claro está bloqueado;
- zoom manual não é bloqueado;
- iconografia Lucide é local/licenciada;
- ZXing ainda é carregado de `unpkg.com`, logo a afirmação “Sem CDNs” na página Segurança continua incorreta até bundle local;
- `style-src 'unsafe-inline'` permanece dívida de hardening.

## 11. QA

A CI cobre sintaxe, TypeScript, finanças, isolamento, datas, QR, Mercado, imagens, scanner, UI, responsividade, acessibilidade, segurança e sync.

PR #147:

- TypeScript Foundation PR `34951435419`: sucesso;
- CI PR `34951435285`: sucesso integral;
- merge `480dc501ff10bf29413b934e623d8641d5e95229`;
- TypeScript Foundation `main` `34951525321`: sucesso;
- CI `main` `34951525416`: sucesso integral;
- Pages `34951589187`: sucesso.

Limitação conhecida: testes estáticos não substituem validação física/E2E WebKit/Chromium para toque, teclado, scroll, foco e proporções reais. A nova grelha de Despesas deve ser confirmada no mesmo iPhone/PWA que revelou o desalinhamento.

## 12. Próxima consolidação

1. validar fisicamente `76-bills-mobile-alignment2` no iPhone/PWA;
2. confirmar `76-planning-ring-shape1` e drawer/iconografia;
3. corrigir a descrição factual de rede na página Segurança;
4. empacotar ZXing localmente com licença preservada;
5. depois remover `unpkg.com` de `script-src` e endurecer CSP;
6. criar E2E WebKit/Chromium;
7. reduzir cascade CSS por componente;
8. continuar TypeScript em módulos de baixo acoplamento.
