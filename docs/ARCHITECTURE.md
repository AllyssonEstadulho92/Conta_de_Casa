# Arquitetura — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + UI/UX  
Distribuição: GitHub Pages / PWA

## 1. Invariantes

A aplicação continua PWA estática/local-first. Estado financeiro, apresentação, recursos visuais, catálogos e metadados de build permanecem separados.

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhum segredo no código público;
- `estimatedCents` distinto de `actualCents`;
- `marketId|pid` continua identidade canónica do pipeline especializado de SKU/fotografia.

## 2. Núcleo funcional

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- `mobile-menu-toggle.js`: controlador móvel v73;
- `v75-architecture.js`: hierarquia de navegação;
- `src/`: módulos e contratos em migração progressiva para TypeScript;
- `app-update.js`: Centro de Versão e Atualizações, isolado do domínio financeiro.

## 3. Composição pública

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` por allowlist explícita. `sw.js` mantém allowlist e revisão de cache equivalente.

Ordem visual relevante:

1. base/responsive;
2. `mobile-menu-toggle.css`;
3. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
4. páginas, Despesas e Mercado v75;
5. `v76-veggie-menu.css` (`76-veggie-menu2`);
6. `v75-usability.css`;
7. `v76-modern-ui.css` (`76-modern-ui1`) — design system transversal;
8. `v76-mobile-shell.css` (`76-mobile-shell2`) — autoridade final da geometria em ≤820 px;
9. `v76-version-about.css` (`76-version-audit1`) — apresentação específica do Centro de Versão.

A ordem de `v76-mobile-shell.css` depois de `v76-modern-ui.css` é deliberada: o design system define aparência; o shell final define apenas viewport, safe areas, scroll e reserva da navegação persistente.

## 4. Modelo de versionamento

- **Application Version**: `package.json.version`, atualmente `0.76.0-dev.1`;
- **Public Release**: `BUILD`/`release-manifest.json`, atualmente `v75`;
- **Build ID**: primeiros 7 caracteres do SHA Git do código compilado;
- **Build Date**: data ISO gerada no processo de preparação do Pages.

`scripts/prepare-pages.cjs` injeta `app-version`, `app-build`, `app-build-id` e `app-build-date` no HTML público. Alterações dentro da mesma versão de desenvolvimento são distinguidas pelo Build ID, não por aumento artificial da release.

## 5. Atualizações PWA

`app-update.js` e `sw.js` implementam atualização controlada:

1. `release-manifest.json` é consultado com `cache: no-store`;
2. resolve-se a instalação atual por `navigator.serviceWorker.getRegistration()`;
3. a verificação manual chama `registration.update()` antes de declarar “atualizado”;
4. uma release igual não bloqueia a procura de um Service Worker mais recente;
5. um worker em espera só é aplicado por `APPLY_UPDATE` após ação explícita;
6. `controllerchange` faz reload controlado;
7. dados financeiros, PIN e cofre não participam deste protocolo.

## 6. Navegação

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer mantém destinos secundários. Rotas, IDs, permissões e handlers não são substituídos por CSS.

## 7. Shell móvel — `76-mobile-shell2`

### Problema anterior

Existiam duas decisões incompatíveis em cascata:

- `mobile-layout.css` mantinha `.app-shell` e `.main` com `height/max-height:100dvh`, `overflow:hidden` no shell e scroll interno em `.main`;
- `76-modern-ui1` já tinha tornado a `.topbar` relativa e no fluxo normal, mas sem revogar integralmente as limitações do viewport e sem repor `safe-area-inset-top`.

Em Safari/iPhone isto produziu clipping real: cabeçalho dentro da status bar e conteúdo final por baixo do dock.

### Arquitetura corrigida

Em ≤820 px, `v76-mobile-shell.css` estabelece:

- `body` como único scroll vertical da aplicação desbloqueada;
- `.app-shell`: `height:auto`, `min-height:100dvh`, sem `max-height` e sem clipping;
- `.main`: altura automática, sem scroll container paralelo;
- `.topbar`: `position:relative`, no fluxo, com `--v76-shell-safe-top=max(24px, env(safe-area-inset-top))`;
- `.page`: conteúdo elástico e `padding-bottom` calculado por `--v76-shell-nav-reserve`;
- `.mobile-nav`: continua `position:fixed`, com altura explícita e deslocamento por `safe-area-inset-bottom`;
- ajustes para ≤390 px, ≤359 px e landscape de baixa altura;
- `scroll-margin-bottom` em elementos focáveis para não ficarem atrás do dock.

O drawer/dialog continua a usar a sua própria geometria modal; a alteração não interfere no gesto lateral nem no Veggie Burger.

## 8. Veggie Burger TypeScript — `76-veggie-menu2`

Fonte: `src/ui/veggie-menu-toggle.ts`. Runtime: `v76-veggie-menu.js`.

- fechado: duas barras horizontais;
- aberto: superior `+45°`, inferior `-45°`;
- Web Animations API anima ambas;
- `#mobileMenuBtn` é controlo único;
- `aria-expanded`/`aria-label` preservados;
- com drawer aberto, o botão permanece fora da shell transformada;
- reduced-motion e forced-colors preservados.

## 9. Sistema visual master — `76-modern-ui1`

`v76-modern-ui.css` define tokens comuns de background, superfícies, texto, muted, primary/accent, estados, bordas, sombras, raios e foco.

Cobertura: Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições, além de tabs, botões, inputs, painéis, tabelas, estados vazios, dialogs, drawer e bottom navigation.

## 10. Segurança

`76-mobile-shell2`, `76-version-audit1`, `76-veggie-menu2` e `76-modern-ui1` não alteram `core.js`, `finance.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sync, QR/scanner, CSP, endpoints ou segredos.

O novo shell é CSS/layout + distribuição/cache; não lê estado financeiro.

## 11. QA

`tests/v76-mobile-shell.test.cjs` valida:

- safe area superior/inferior;
- revogação de `height/max-height:100dvh` e `overflow:hidden` no shell final;
- scroll de documento;
- reserva inferior baseada na altura do dock;
- topbar relativa com compensação da status bar;
- folha `v76-mobile-shell.css` posterior a `v76-modern-ui.css` no `dist`;
- allowlist de Pages e Service Worker;
- ausência de `zoom` CSS.

CI funcional da branch antes da documentação: `34541849503` — sucesso integral. Validação física pós-publicação continua obrigatória para Safari/iPhone/PWA.
