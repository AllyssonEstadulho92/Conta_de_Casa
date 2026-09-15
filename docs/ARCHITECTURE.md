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
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` canónico quando existe identidade de loja/SKU;
- fotografia não prova preço/transação.

## 2. Segurança, cofre e sessão

`core.js` continua a autoridade de estado, cifra, normalização e sessão:

`PIN/palavra-passe → PBKDF2 → check cifrado → AES-GCM → AppStateV5 normalizado`.

Contratos:

- PIN local válido abre a aplicação sem depender do sync remoto;
- `#vaultScreen[hidden]` e `#app[hidden]` são exclusivos;
- sync opcional continua em background;
- anexos reais permanecem bloqueados até existir cifragem dedicada;
- UI do cofre não pode modificar lógica de derivação, unlock, IndexedDB ou sync.

### 2.1 Geometria do cofre móvel — `76-vault-short-height1` + `76-auth-ios-spacing2`

Autoridade visual: `v75-usability.css`.

A correção do PR #150 mantém o mesmo HTML e os mesmos handlers, mas adapta o ecrã de PIN à altura útil do browser:

- mobile usa `100svh` para considerar o estado pequeno do viewport com barras do Safari visíveis;
- alinhamento vertical começa no topo seguro (`align-items:start`) e o cartão usa `margin:0 auto`, evitando recentragem vertical por margem automática;
- safe areas continuam via `env(safe-area-inset-*)`;
- densidade do keypad reduz progressivamente para 58 px em `<=900px`, 54 px em `<=780px` e 48 px em `<=640px`;
- o piso tátil funcional permanece >=44 px;
- campos mantêm 16 px no mobile para evitar auto-zoom do Safari;
- zoom manual/pinch-to-zoom continua permitido;
- `prefers-reduced-motion`, `forced-colors` e dark mode permanecem cobertos.

A correção é exclusivamente de apresentação. Não existe nova autoridade de autenticação.

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

Hierarquia do drawer:

- Principal: Início, Despesas, Planeamento, Mercado;
- Análise: Relatórios;
- Sistema: Segurança e sincronização, Definições.

Calendário, Metas e Diagnóstico permanecem nas páginas-pai.

## 4. Arquitetura visual

Autoridades atuais:

- tokens/componentes: `v76-modern-ui.css` + `design-system.css`;
- composição de páginas: `v76-product-pages.css`, `v76-planning-more.css` e camadas v75 ainda ativas;
- geometria mobile autenticada: `v76-mobile-shell.css`;
- auth/cofre: `v75-usability.css`;
- refinamentos móveis de feature: `mobile-layout.css`;
- marca: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer: `mobile-menu-toggle.js/.css` + `v75-drawer-theme.css`;
- formulários de despesas/QR: `invoice-capture.js/.css`.

A cascade ainda contém regras históricas e `!important`; a redução deve ser por componente com regressões, nunca por eliminação em massa.

## 5. Despesas mobile — `76-bills-mobile-alignment2`

Autoridade funcional preservada:

- `renderBills()` filtra/renderiza;
- `events.js` mantém listeners;
- IDs canónicos não mudaram.

Composição final móvel:

- pesquisa + ação principal compactas;
- lupa Lucide local como única lupa funcional;
- filtros em grelha contida, sem depender de scroll horizontal;
- Estado/Categoria e De/Até em pares;
- Ordenar e Limpar filtros em linhas completas;
- `<=360px` empilha antes de cortar conteúdo;
- `mobile-layout.css` continua sem assumir a geometria global do shell.

## 6. Planeamento mobile

`76-planning-budget-card2` + `76-planning-ring-shape1`:

- `dashboardNumbers()`/`categoryTotals()` fornecem os valores apresentados;
- `#monthPicker` continua a autoridade do mês;
- `#monthPlanForm` e `#monthlyBudget` continuam a única gravação do orçamento;
- ações Definir/Editar apenas focam o campo canónico;
- orçamento ausente permanece `Por definir`;
- navegação mensal usa Lucide local;
- o anel neutraliza altura legada com `height:auto!important` e `aspect-ratio:1/1!important`;
- desktop mantém os painéis/formulários canónicos.

## 7. Calculadora de datas — `76-date-calculator1`

PR #149 adicionou um utilitário local sem criar nova rota principal.

Entrada: **Mais → Ferramentas → Calculadora de datas**.

Arquitetura:

- fonte canónica: `src/ui/date-calculator.ts`;
- runtime browser: `.generated/date-calculator.js` → `dist/date-calculator.js`;
- estilos: `date-calculator.css`;
- build: `scripts/build-typescript-runtime.cjs` + `scripts/prepare-pages.cjs`;
- Service Worker inclui CSS/runtime na allowlist pública.

Contratos de exatidão:

- reutiliza `parseCivilDateKey`, `cleanDateKey`, `civilDayNumber`, `civilDayDiff`, `addCivilDays`, `addCivilMonthsClamped` e `currentLocalDateKey` de `core.js`;
- diferença é de datas civis, não de milissegundos/horas locais;
- DST/fuso não alteram a contagem de dias;
- inclusão/exclusão de data inicial/final é explícita;
- “dias úteis” = segunda a sexta; feriados só podem ser descontados se existir jurisdição explícita futura;
- não usa rede, IndexedDB, `appState`, `commit()` ou `saveState()`;
- fechar o shell autenticado fecha também o dialog da ferramenta.

## 8. Mercado

- pesquisa live: Pingo Doce e Continente através de cesta.pt;
- fotografia opcional: Open Food Facts quando existe correspondência validada;
- preço pesquisado entra como `estimatedCents`;
- valor pago só entra em `actualCents` após confirmação;
- `marketId|pid` preserva identidade quando existe SKU verificável;
- imagem/logótipo não prova preço/transação.

## 9. Faturas e captura

Fluxo Adicionar despesa:

- Manual;
- Ler fatura por imagem/QR AT;
- QR Code por câmara.

PR #132 mantém um único proprietário de scroll no mobile Safari. Os blocos de alinhamento de Despesas não alteram captura nem domínio financeiro.

## 10. TypeScript

Pipeline vigente:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

Runtimes TypeScript ativos incluem Market branding, Sync conflict policy e Calculadora de datas. JavaScript manual só sai depois de substituição comprovada e regressões verdes.

## 11. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → Deploy Pages`.

Service Worker:

- navegação network-first com timeout de 4 s;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens técnicos invalidam cache sem alterar release pública.

PR #149 adicionou `date-calculator1`; PR #150 acrescenta `auth-ios-spacing2`. `package.json`, `release-manifest.json`, `app-update.js` e v76/`0.76.0` permanecem inalterados.

## 12. Segurança e dependências externas

- nenhum segredo deve existir no repositório público;
- CSP está ativa;
- armazenamento sensível em claro está bloqueado;
- zoom manual não é bloqueado;
- iconografia Lucide é local/licenciada;
- ZXing ainda é carregado de `unpkg.com`, portanto “Sem CDNs” continua factual e tecnicamente incorreto até bundle local;
- `style-src 'unsafe-inline'` permanece dívida de hardening.

## 13. QA

A CI cobre sintaxe, TypeScript, finanças, isolamento, datas, QR, Mercado, imagens, scanner, UI, responsividade, acessibilidade, segurança e sync.

A regressão de acessibilidade protege especificamente o cofre móvel:

- `100svh`;
- `margin:0 auto` no cartão mobile;
- bandas de keypad 58/54/48 px;
- piso tátil >=44 px;
- token de cache `auth-ios-spacing2`.

Limitação: testes estáticos não substituem Safari/WebKit real para browser chrome, teclado virtual, scroll, foco e safe areas.

## 14. Próxima consolidação

1. validar PR #150 no mesmo iPhone/Safari web e PWA;
2. confirmar Despesas/Planeamento no mesmo dispositivo;
3. corrigir descrição factual de rede em Segurança;
4. empacotar ZXing localmente com licença preservada;
5. remover `unpkg.com` de `script-src` e endurecer CSP;
6. criar E2E WebKit/Chromium;
7. reduzir cascade CSS por componente;
8. continuar TypeScript em módulos de baixo acoplamento.
