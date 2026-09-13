# Arquitetura — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76`  
Distribuição: GitHub Pages / PWA

## 1. Modelo geral

A Conta de Casa é uma PWA estática/local-first. O browser recebe HTML/CSS/JavaScript; a fonte está a migrar incrementalmente para TypeScript strict. Estado financeiro, segurança, apresentação, sync e build são responsabilidades distintas.

Invariantes:

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- IndexedDB para estado financeiro cifrado;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sync GitHub opcional do envelope cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` como identidade canónica de SKU/fotografia;
- fotografia não é prova de preço/transação.

## 2. Fluxo de autenticação e sessão

### 2.1 Cofre

`core.js` mantém a autoridade criptográfica:

`PIN/palavra-passe → PBKDF2 → validação do check cifrado → AES-GCM → appState normalizado`.

`unlockVault()` não depende do GitHub para provar que o cofre local está correto.

### 2.2 Transição `76-auth-transition1`

Depois de um PIN local válido:

1. `enterApp()` continua a preparar shell, navegação, tema, handlers e guardas de sessão;
2. `v75-startup-guard.js` substitui apenas o gate de sync durante essa transição por um resultado imediato;
3. a implementação canónica de `enterApp()` termina e o Dashboard torna-se visível;
4. o gate de sincronização real é restaurado e executado em background;
5. `syncAuthVisibility()` garante exclusividade visual entre `#vaultScreen` e `#app`;
6. `v76-mobile-shell.css` contém uma defesa adicional: se `#vaultScreen` está visível, o `#app` adjacente não pode renderizar.

Consequência: disponibilidade do GitHub/sync não bloqueia a abertura do produto local nem pode fazer o dock móvel aparecer por cima do PIN.

Falha na transição:

- remove `app-active`;
- esconde `#app`;
- volta a mostrar o cofre;
- não altera dados financeiros nem material criptográfico.

## 3. Navegação e páginas

Rotas canónicas em `PAGE_META`:

- `dashboard`;
- `bills`;
- `calendar`;
- `planning`;
- `goals`;
- `market`;
- `reports`;
- `security`;
- `diagnostics`;
- `settings`.

`renderPage()` é o dispatcher funcional. O gate introduzido no PR #93 valida que cada rota tem exatamente uma secção HTML e um ramo de renderização, e que os assets locais existem no bundle Pages.

Existe dívida arquitetural: `v74-experience.js` ainda reescreve a navegação móvel e injeta apresentação histórica. A consolidação deve terminar com uma única autoridade de navegação, sem remover funcionalidades existentes antes da substituição.

## 4. Arquitetura visual

Ordem de responsabilidades:

- estilos base/históricos: compatibilidade;
- `v76-modern-ui.css`: tokens e componentes;
- `v76-product-pages.css`: composição interna das páginas;
- `v76-mobile-shell.css`: única autoridade final de geometria mobile, safe areas, scroll e dock;
- `v75-usability.css`: contém temporariamente `76-auth1` por compatibilidade histórica do cofre.

Regras:

- shell não contém lógica financeira;
- design system não detém viewport/safe areas;
- composição de página não altera fórmulas;
- touch baseline 44 px;
- reflow mínimo 320 CSS px;
- pinch-to-zoom permanece disponível;
- reduced-motion e forced-colors devem continuar cobertos.

## 5. Runtime funcional atual

Fontes JavaScript manuais ainda relevantes:

- `core.js`: estado, IndexedDB, cofre, normalização e backup;
- `finance.js`: cálculos;
- `render.js`: renderizadores funcionais;
- `forms.js`: formulários;
- `events.js`: eventos e `enterApp()` canónico;
- `sync.js`: sincronização cifrada;
- módulos Mercado, scanner, QR, assets e runtimes históricos;
- `sw.js`: Service Worker.

Esses ficheiros não são eliminados apenas por existir uma intenção de migração.

## 6. TypeScript

Fontes TypeScript canónicas já publicadas:

- `src/ui/veggie-menu-toggle.ts` → `v76-veggie-menu.js` gerado;
- `src/ui/market-branding.ts` → `market-branding.js` gerado;
- `src/sync/sync-conflict-policy.ts` → `sync-conflict-policy.js` gerado.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

`.generated/` e `dist/` são artefactos. Um `.js` público gerado não é fonte manual.

## 7. Build e deploy

`PR/push → TypeScript Foundation + CI integral → merge main → workflow_run CI verde → build:runtime → build:pages → allowlist → artefacto Pages → deploy`.

A alteração só é considerada publicada quando `Deploy Pages` termina com sucesso.

Baseline PR #96:

- merge `d18d274141b1032ab0e909729739b3f86cabfb9e`;
- TypeScript `34780407487` verde;
- CI `34780407473` verde;
- Pages `34780437328` verde.

## 8. Service Worker

- navegação: network-first com timeout de 4 s e fallback de `index.html` em cache;
- assets públicos: network-first/no-store, com fallback de cache;
- allowlist explícita;
- revisões de cache invalidam instalações anteriores;
- `auth-transition1` foi apenas uma invalidação de cache, sem mudança de estratégia.

## 9. Segurança

- nenhum segredo no repositório público;
- CSP ativa;
- armazenamento sensível em claro bloqueado;
- anexos reais bloqueados enquanto cifragem de ficheiros não estiver implementada;
- bloqueio de sessão por inatividade/perda de foco permanece em `core.js`;
- UI/UX não pode introduzir biometria fictícia;
- migração de linguagem não pode enfraquecer KDF/cifra.

## 10. Mercado

- pesquisa, imagem, barcode, lista/carrinho e accounting são responsabilidades separadas;
- preço pesquisado é estimativa até evidência suficiente;
- total real não deriva de fotografia;
- falta um teste dedicado que prove persistência de `pid` ponta a ponta antes de mexer nessa identidade.

## 11. Próxima consolidação arquitetural

1. uma autoridade única para navegação móvel;
2. deixar de criar no runtime v74 os blocos de Dashboard já substituídos;
3. reduzir a cascade histórica v74/v75 sem alterar comportamento;
4. migrar módulos JS por dependência e risco;
5. manter finanças/core/cifra para fases posteriores com vetores de paridade próprios.