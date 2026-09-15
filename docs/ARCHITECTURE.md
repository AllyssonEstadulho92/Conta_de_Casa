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

### 4.3 Despesas mobile — `76-bills-mobile-filters1` + `76-bills-mobile-spacing1`

Autoridade funcional preservada:

- `renderBills()` filtra/renderiza;
- `events.js` mantém listeners;
- IDs canónicos não mudaram.

Composição:

- pesquisa + ação principal em superfície compacta;
- lupa Lucide local é a única lupa funcional;
- filtros em cartão com Estado/Categoria, datas, ordenação e limpar;
- PR #142 acrescenta espaçamento/ritmo vertical e remove offsets visuais desnecessários;
- `<=360px` empilha antes de cortar conteúdo;
- foco, reduced-motion, forced-colors e targets tácteis preservados.

### 4.4 Planeamento mobile — `76-planning-budget-card2`

O PR #143 altera apenas a composição móvel do resumo de orçamento em `#page-planning`.

**Autoridade de dados e cálculo:**

- `dashboardNumbers()` continua a fornecer os números agregados usados por `dashboardMetrics()`;
- `categoryTotals()` continua a fornecer a distribuição de despesas;
- `monthProfile()` continua a representar o perfil mensal;
- `#monthPicker` continua a ser o controlo canónico do mês selecionado;
- `stepMonth()` apenas atualiza `#monthPicker` e dispara o `change` já existente.

**Autoridade de gravação:**

- `#monthPlanForm` permanece o único formulário de planeamento mensal;
- `#monthlyBudget` permanece o único campo canónico de orçamento mensal;
- `events.js` continua a validar `accountBalance`, `openingBalance` e `monthlyBudget` e a executar `commit('updated','planning')`;
- os botões visuais `Definir/Editar orçamento` do novo cartão possuem apenas `data-v75-budget-focus`: deslocam a viewport e focam `#monthlyBudget`; não escrevem estado, não fazem `saveState()` nem `commit()`.

**Composição visual:**

- `v75-architecture.js` gera o seletor mensal, intervalo real do mês e cartão de orçamento;
- `v76-planning-more.css` (`76-planning-budget-card2`) estiliza título, estado circular, métricas, orientação e CTA dentro de uma única superfície;
- orçamento ausente permanece factual (`Por definir`), sem percentagem falsa;
- quando existe orçamento, percentagem, gasto e disponível continuam calculados pela lógica existente;
- navegação mensal usa ícones Lucide locais em vez dos caracteres `‹/›`;
- `<=430px` mantém métricas numa coluna, removendo a antiga compressão em três colunas;
- `<=350px` adapta o cabeçalho sem remover ações;
- `prefers-reduced-motion` e `forced-colors` têm fallback explícito.

O overview dinâmico continua oculto em `>=821px`; desktop mantém o formulário/painéis canónicos existentes. O protótipo foi aplicado ao contexto móvel solicitado, sem criar uma segunda arquitetura financeira.

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

PR #132 mantém um único proprietário de scroll no mobile Safari. PR #140/#142 atuam apenas na lista/filtros de Despesas e não alteram captura nem domínio financeiro.

## 8. TypeScript

Fontes canónicas já existentes incluem `src/types/*`, `src/ui/market-branding.ts` e `src/sync/sync-conflict-policy.ts`.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

JavaScript manual só sai depois de substituição comprovada e regressões verdes. `v75-architecture.js` e `ui-icons.js` continuam JavaScript manual neste bloco.

## 9. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → build Pages → deploy`.

Service Worker:

- navegação network-first com timeout de 4 s;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens técnicos invalidam cache sem alterar release pública.

PR #143 acrescenta apenas o token `planning-budget-card2`; `package.json`, `release-manifest.json`, `app-update.js` e `v76/0.76.0` permanecem inalterados.

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

PR #143:

- TypeScript Foundation PR `34946433827`: sucesso;
- CI PR `34946433799`: sucesso;
- merge `386d75b35060eb011c2a2d68ec6b965c87c5080c`;
- TypeScript Foundation main `34946493929`: sucesso;
- CI main `34946493911`: sucesso;
- Pages `34946542013`: sucesso.

Limitação conhecida: testes estáticos não substituem validação física/E2E WebKit/Chromium para toque, teclado, scroll, foco e proporções reais.

## 12. Próxima consolidação

1. validar fisicamente Planeamento PR #143 e Despesas PR #142 no iPhone/PWA;
2. corrigir a descrição factual de rede na página Segurança;
3. empacotar ZXing localmente com licença preservada;
4. depois remover `unpkg.com` de `script-src` e endurecer CSP;
5. criar E2E WebKit/Chromium;
6. reduzir cascade CSS por componente;
7. continuar TypeScript em módulos de baixo acoplamento;
8. migrar `render/forms/events` só depois dos contratos visuais estabilizarem;
9. deixar finanças/core/cifra para blocos com vetores de paridade próprios.
