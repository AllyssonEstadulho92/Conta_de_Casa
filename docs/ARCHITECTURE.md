# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
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
7. `v76-modern-ui.css` (`76-modern-ui1`) como última camada visual transversal;
8. `v76-version-about.css` (`76-version-audit1`) limita-se ao ecrã de versão/atualizações e usa os tokens v76 existentes.

## 4. Modelo de versionamento

O versionamento passa a ter dimensões explícitas, sem conflitar semver com a release pública:

- **Application Version**: `package.json.version`, atualmente `0.76.0-dev.1`;
- **Public Release**: `BUILD`/`release-manifest.json`, atualmente `v75`;
- **Build ID**: primeiros 7 caracteres do SHA Git do código efetivamente compilado;
- **Build Date**: data ISO gerada no processo de preparação do Pages.

`scripts/prepare-pages.cjs` injeta no `dist/index.html`:

- `meta[name="app-version"]`;
- `meta[name="app-build"]`;
- `meta[name="app-build-id"]`;
- `meta[name="app-build-date"]`.

O Build ID é obtido por `git rev-parse --short=7 HEAD`, com `GITHUB_SHA` como fallback de CI e `local` apenas como fallback final.

## 5. Atualizações PWA

`app-update.js` e `sw.js` implementam atualização controlada:

1. o histórico de release é consultado com `cache: no-store`;
2. `navigator.serviceWorker.getRegistration()` resolve a instalação atual;
3. a verificação manual chama `registration.update()` **antes** de qualquer conclusão de “atualizado”;
4. uma release numericamente igual não bloqueia a procura de um Service Worker de build mais recente;
5. se existir `registration.waiting`, a instalação só avança por `APPLY_UPDATE` após ação explícita;
6. `controllerchange` provoca reload controlado;
7. dados financeiros, PIN e cofre não participam deste protocolo.

Esta ordem segue o princípio técnico usado pelo Foco Jornada: versão visível + identidade da compilação + revalidação real do Service Worker.

## 6. Navegação

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer mantém destinos secundários agrupados. Rotas, IDs, permissões e handlers não são substituídos pelo redesign.

## 7. Cabeçalho mobile

- `.topbar` em fluxo normal com `position: relative`;
- sem `padding-top` reservado para header fixo;
- conteúdo começa depois do cabeçalho sem sobreposição;
- navegação inferior continua persistente por ser navegação global.

## 8. Veggie Burger TypeScript — `76-veggie-menu2`

Fonte: `src/ui/veggie-menu-toggle.ts`. Runtime: `v76-veggie-menu.js`.

- fechado: duas barras horizontais;
- aberto: superior `+45°`, inferior `-45°`;
- Web Animations API anima explicitamente ambas;
- as duas barras permanecem visíveis;
- `#mobileMenuBtn` continua controlo único;
- `aria-expanded`/`aria-label` continuam associados ao mesmo controlo;
- com drawer aberto, o botão permanece fora da `.nav-drawer-shell` transformada;
- reduced-motion e forced-colors preservados.

## 9. Sistema visual master — `76-modern-ui1`

`v76-modern-ui.css` define tokens transversais para background, superfícies, texto, muted, primary/accent, estados, bordas, sombras, raios e foco.

Cobertura explícita: Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições, além de tabs, botões, inputs, painéis, tabelas, estados vazios, dialogs, drawer e bottom navigation.

## 10. Segurança

`76-version-audit1`, `76-veggie-menu2` e `76-modern-ui1` não alteram `core.js`, `finance.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sync, QR/scanner, CSP, endpoints ou segredos.

O novo ecrã de versão não lê nem transmite dados do cofre. A verificação usa apenas `release-manifest.json`, Service Worker e metadados de build da própria distribuição.

## 11. QA

`76-version-audit1` tem regressão específica em `tests/app-update.test.cjs` para:

- semver da aplicação;
- metadados version/release/build/date em `dist`;
- distribuição do CSS de versão;
- cache do Service Worker;
- garantia de que `registration.update()` precede a conclusão “não existe atualização pendente”;
- prevenção do antigo retorno antecipado quando a release é igual.

CI da branch após correção do teste: `34539811658` — sucesso.

Validação física pós-publicação continua obrigatória para Safari/iPhone/PWA.
