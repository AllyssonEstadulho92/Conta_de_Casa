# Arquitetura — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — UI/UX + auditoria integral + migração incremental TypeScript  
Distribuição: GitHub Pages / PWA

## 1. Invariantes

A aplicação é uma PWA estática/local-first. Estado financeiro, apresentação, catálogos, imagens, build e deploy permanecem separados.

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- IndexedDB para estado financeiro;
- PBKDF2-SHA-256 + AES-GCM, `PBKDF2_ITERATIONS = 250000`;
- sync remoto opcional apenas do envelope cifrado;
- `estimatedCents` distinto de `actualCents`;
- `marketId|pid` como identidade canónica no pipeline de SKU/fotografia;
- fotografia não é prova de preço ou compra.

## 2. Rotas e navegação

Rotas canónicas: `dashboard`, `bills`, `calendar`, `planning`, `market`, `reports`, `goals`, `security`, `diagnostics`, `settings`.

`PAGE_META` é a fonte de metadados da navegação. `renderPage()` deve conter um renderer para cada rota. As secções HTML `#page-*` devem corresponder exatamente às rotas declaradas.

Desde o PR #93, `tests/navigation.test.cjs` é um gate estrutural e verifica:

- igualdade entre `PAGE_META`, `page-*` e ramos de `renderPage()`;
- alvos `data-page` e `data-go` válidos;
- IDs HTML únicos;
- bundle `dist/` preparado de verdade;
- todos os assets locais referidos pelo HTML presentes no bundle;
- os mesmos assets cobertos pela allowlist do Service Worker;
- scripts de runtime `defer`;
- conteúdo interno (`tests`, `scripts`, `.github`, docs internas) ausente do Pages.

## 3. Núcleo funcional

Fontes JavaScript manuais ainda existentes incluem:

- `core.js`: schema, normalização, IndexedDB, cifragem, cofre, backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional/mutações;
- `sync.js`: motor de sincronização;
- `mobile-menu-toggle.js`: drawer/gestos;
- vários módulos de Mercado, scanner, imagens, captura, updates e runtimes históricos;
- `sw.js`.

Fontes TypeScript canónicas atualmente publicadas:

- `src/ui/veggie-menu-toggle.ts`;
- `src/ui/market-branding.ts`;
- `src/sync/sync-conflict-policy.ts`;
- `src/types/` e `src/type-tests/` para contratos de domínio.

## 4. Build TypeScript

Fluxo:

`src/**/*.ts → tsc --noEmit strict → scripts/build-typescript-runtime.cjs → .generated/*.js → scripts/prepare-pages.cjs → dist/*.js → Pages`

Runtimes gerados:

- `veggie-menu-toggle.ts` → `v76-veggie-menu.js`;
- `market-branding.ts` → `market-branding.js`;
- `sync-conflict-policy.ts` → `sync-conflict-policy.js`.

`.generated/` e `dist/` são artefactos, não fonte. O nome público `.js` é compatibilidade do browser. O build proíbe a reaparição de fontes JS manuais já migradas.

## 5. Política de conflitos de sync

`src/sync/sync-conflict-policy.ts` envolve a função existente `syncBusinessView` sem alterar `sync.js`.

No entity `market`, apenas os metadados auxiliares `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` são removidos da comparação de negócio. Preço, quantidade, estado de compra e restantes dados relevantes não são removidos; uma diferença financeira continua a gerar conflito.

`tests/sync-conflict-policy.test.cjs` executa o runtime gerado e prova os dois lados do contrato.

## 6. Pipeline CI/Pages

Fluxo de entrega:

`push/PR → npm install → TypeScript strict → gerar runtimes → CI completo → merge main → CI main → workflow_run Pages → regenerar runtimes → preparar allowlist → validar bundle → upload → deploy`

Uma alteração só é tratada como publicada quando o Deploy Pages da revisão de `main` termina com sucesso.

Baseline atual PR #95 (`a557ba3d93fec89bd31468183de89008a9181eb2`): TypeScript `34768413602`, CI `34768413588`, Pages `34768438493`, todos com sucesso.

## 7. Cascade/UI

Ordem final relevante:

1. estilos base e mobile históricos;
2. camadas v75;
3. `v75-usability.css?v=76-auth1` — acesso/cofre;
4. `v76-modern-ui.css?v=76-modern-ui2` — tokens/componentes;
5. `v76-product-pages.css?v=76-dashboard-clean1` — composição interna;
6. `v76-mobile-shell.css?v=76-mobile-shell2` — autoridade final de geometria móvel.

`v76-mobile-shell.css` é a única autoridade para viewport, scroll global, safe areas, topbar geometry, page gutters e dock ≤820 px. Feature CSS não pode recuperar essa responsabilidade.

## 8. Dashboard canónico

`renderDashboard()` + `dashboardNumbers()` continuam canónicos para dados e métricas.

O PR #94 identificou e neutralizou no Dashboard uma composição protótipo histórica injetada por `v74-experience.js`. Os elementos `cdcMobileGreeting`, `cdcMobileMonthWrap`, `cdcMonthHero`, `cdcQuickActions` e `cdcDashboardCategories` ficam ocultos apenas no Dashboard v76 porque duplicavam funções já presentes no shell/renderer real.

Equivalentes preservados: `#monthPicker`, notificações/topbar, `#kpiGrid`, botão `Adicionar`, `#categoryBars`, `#budgetPanel`.

Essa é uma medida de compatibilidade. A remoção definitiva do código v74 será feita apenas quando os consumidores restantes forem auditados.

## 9. Autenticação

`#vaultScreen` existe antes do shell autenticado. `v75-usability.css` contém temporariamente `76-auth1`.

IDs/handlers do PIN e palavra-passe, recuperação, PBKDF2/AES-GCM, IndexedDB e envelope cifrado não foram modificados pelo redesign. Nenhuma biometria é anunciada sem implementação real.

## 10. Mercado

Pesquisa, catálogo, fotos, scanner, carrinho/lista, preço e persistência continuam responsabilidades distintas. Preço pesquisado é estimativa até evidência suficiente. Fotografia é apoio visual. `marketId|pid` deve permanecer identidade canónica.

Lacuna conhecida: persistência explícita do `pid` extraído de Cesta em todo o fluxo ainda precisa de teste dedicado antes de refactor.

## 11. Segurança

Qualquer migração/redesign deve manter PIN/palavra-passe, PBKDF2/AES-GCM, isolamento do cofre, sync cifrada, CSP, validação de QR/importações e política de segredos.

A redução de JavaScript manual não autoriza mudanças criptográficas, de schema ou de semântica financeira.

## 12. QA obrigatório

Gates atuais cobrem finanças, contagem exata, isolamento/cofre, datas civis, faturas/QR, Mercado, scanner, imagens, PWA/Safari startup, navegação, acessibilidade, responsive/mobile, segurança, sync e manifesto, além do novo gate de integridade do bundle Pages.

Validação física de UI em dispositivos reais continua uma etapa separada de CI.

## 13. Ordem de migração

1. módulos folha/UI/políticas pequenas;
2. funções puras com vetores de paridade;
3. domínio financeiro;
4. Mercado/modelo/carrinho;
5. core/persistência/cifra;
6. sync principal;
7. render/forms/events e controladores complexos;
8. Service Worker/build/tooling;
9. remoção final de JavaScript fonte legado.

Nenhum `.js` funcional é apagado antes do equivalente TypeScript compilado, testado, publicado e documentado.