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
- `#vaultCreate[hidden]` e `#vaultUnlock[hidden]` também são autoridades explícitas e não podem ser anulados por regras de apresentação;
- sync opcional continua em background;
- anexos reais permanecem bloqueados até existir cifragem dedicada;
- UI do cofre não pode modificar lógica de derivação, unlock, IndexedDB ou sync.

### 2.1 Autoridade visual do cofre — `76-auth-prototype-final1` + `76-auth-exclusive-state1`

Autoridade visual: `v75-usability.css`.

O PR #152 substitui as duas camadas móveis anteriores (`76-vault-short-height1` e `76-auth-ios-spacing2`) por uma composição única baseada no protótipo aprovado em dispositivo real. O PR #154 corrige a última colisão de cascade observada fisicamente: `#vaultCreate{display:grid!important}` podia sobrepor o estado `hidden` definido pelo runtime e mostrar criação e desbloqueio ao mesmo tempo.

Contrato de estado:

- `events.js` consulta `idbGet('meta','vault')` e escolhe exatamente um estado: criação quando não existe cofre local, desbloqueio quando existe;
- `hidden` é autoridade superior à decoração CSS para `#vaultScreen`, `#vaultCreate`, `#vaultUnlock`, transferência e painéis de recuperação;
- uma regra visual com `display:* !important` nunca pode tornar visível um estado que o runtime marcou como `hidden`;
- não é criado um segundo controlador de autenticação nem uma alternância artificial entre “Criar” e “Entrar” quando já existe cofre.

Contrato móvel:

- `#vaultScreen` usa `100svh`, safe areas e scroll próprio do cofre;
- conteúdo começa no topo seguro e `.vault-card` usa `margin:0 auto`;
- input móvel mantém texto >=16 px para evitar auto-zoom do Safari;
- keypad padrão: teclas 56 px, `column-gap:30px`, `row-gap:16px`;
- `<=359px`: teclas 52 px, gaps 24/13 px;
- altura `<=720px`: teclas 50 px, gaps 22/9 px;
- todos os alvos essenciais permanecem >=44 px;
- o botão apagar é visualmente leve, mas mantém área funcional suficiente;
- Entrar é a ação principal; Usar palavra-passe e recuperação permanecem ações secundárias;
- `Usar dados de outro dispositivo` é uma superfície própria abaixo de um divisor, evitando competição visual com o CTA principal;
- pinch-to-zoom, `prefers-reduced-motion`, `forced-colors` e dark mode permanecem suportados.

A mudança é exclusivamente de apresentação/estado visual. HTML canónico, IDs, handlers, `createVault()`, `unlockVault()`, PBKDF2, AES-GCM, IndexedDB, importação e sync não mudam.

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
- auth/cofre: `v75-usability.css` / `76-auth-prototype-final1` com contrato de estado `76-auth-exclusive-state1`;
- refinamentos móveis de feature: `mobile-layout.css`;
- marca: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer: `mobile-menu-toggle.js/.css` + `v75-drawer-theme.css`;
- formulários de despesas/QR: `invoice-capture.js/.css`.

A cascade ainda contém regras históricas e `!important`; a redução deve ser por componente com regressões, nunca por eliminação em massa. No cofre, a regra explícita de `hidden` impede que especificidade visual altere o estado funcional.

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

PR #154 acrescenta `auth-exclusive-state1` ao token técnico de cache para distribuir a correção do estado `hidden`. `package.json`, `release-manifest.json`, `app-update.js` e v76/`0.76.0` permanecem inalterados.

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

Regressões do cofre após PR #154 protegem:

- `76-auth-prototype-final1` como autoridade visual única e `76-auth-exclusive-state1` como contrato de estado;
- `#vaultCreate[hidden]` e `#vaultUnlock[hidden]` com `display:none!important` de especificidade suficiente;
- decisão funcional de `events.js` baseada em `idbGet('meta','vault')`;
- `100svh` e safe areas;
- keypad 56 px com gaps 30/16 px no mobile padrão;
- fallbacks 52 px (`<=359px`) e 50 px (`<=720px` de altura);
- piso tátil >=44 px;
- transferência em superfície com min-height 70 px;
- token de cache `auth-exclusive-state1`.

Evidência PR #154: TypeScript Foundation `35003057035` e CI `35003057086` verdes; após merge, TypeScript `35003207253`, CI `35003207139` e Pages `35003264802` verdes.

Limitação: testes estáticos não substituem Safari/WebKit real para browser chrome, teclado virtual, scroll, foco, proporções e safe areas.

## 14. Próxima consolidação

1. validar `76-auth-exclusive-state1` no mesmo iPhone/Safari web e PWA;
2. confirmar Despesas/Planeamento no mesmo dispositivo;
3. corrigir descrição factual de rede em Segurança;
4. empacotar ZXing localmente com licença preservada;
5. remover `unpkg.com` de `script-src` e endurecer CSP;
6. criar E2E WebKit/Chromium;
7. reduzir cascade CSS por componente;
8. continuar TypeScript em módulos de baixo acoplamento.
