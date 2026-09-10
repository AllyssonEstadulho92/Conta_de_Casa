# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build público: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + UI/UX  
Distribuição: GitHub Pages / PWA

## 1. Invariantes

A aplicação continua PWA estática/local-first. Estado financeiro, apresentação, recursos visuais e catálogos permanecem separados.

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
- `src/`: módulos e contratos em migração progressiva para TypeScript.

## 3. Composição pública

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` por allowlist explícita. `sw.js` mantém allowlist e revisão de cache equivalente.

Ordem visual relevante:

1. base/responsive;
2. `mobile-menu-toggle.css`;
3. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
4. páginas, Despesas e Mercado v75;
5. `v76-veggie-menu.css` (`76-veggie-menu2`);
6. `v75-usability.css`;
7. `v76-modern-ui.css` (`76-modern-ui1`) como última camada visual.

## 4. Navegação

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer mantém destinos secundários agrupados. Rotas, IDs, permissões e handlers não são substituídos pelo redesign.

## 5. Cabeçalho mobile

Após validação física, a política vigente é:

- `.topbar` em fluxo normal com `position: relative`;
- sem `padding-top` reservado para header fixo;
- conteúdo começa depois do cabeçalho sem sobreposição;
- navegação inferior continua persistente por ser navegação global.

## 6. Veggie Burger TypeScript — `76-veggie-menu2`

Fonte: `src/ui/veggie-menu-toggle.ts`. Runtime: `v76-veggie-menu.js`.

- fechado: duas barras horizontais;
- aberto: superior `+45°`, inferior `-45°`;
- Web Animations API anima explicitamente ambas;
- as duas barras permanecem visíveis;
- `#mobileMenuBtn` continua controlo único;
- `aria-expanded`/`aria-label` continuam associados ao mesmo controlo;
- com drawer aberto, o botão permanece fora da `.nav-drawer-shell` transformada;
- reduced-motion e forced-colors preservados.

## 7. Sistema visual master — `76-modern-ui1`

`v76-modern-ui.css` define tokens transversais para background, superfícies, texto, muted, primary/accent, estados, bordas, sombras, raios e foco.

Cobertura explícita:

- `#page-dashboard`;
- `#page-bills`;
- `#page-market`;
- `#page-calendar`;
- `#page-planning`;
- `#page-reports`;
- `#page-goals`;
- `#page-security`;
- `#page-diagnostics`;
- `#page-settings`.

Também cobre tabs, botões, inputs, painéis, tabelas, estados vazios, dialogs, drawer e bottom navigation.

## 8. Princípios UI/UX

- uma família tipográfica principal;
- hierarquia por tamanho, peso, espaçamento e contraste;
- ações primárias, secundárias e destrutivas visualmente distintas;
- superfícies com bordas leves e sombras discretas;
- alvos tácteis mínimos de 44 px;
- campos mobile compatíveis com Safari sem zoom automático;
- `prefers-reduced-motion`, `forced-colors` e pinch-to-zoom preservados;
- bottom navigation mantém cinco destinos previsíveis.

## 9. Despesas e Mercado

Despesas continuam a usar `renderBills()`/`filterBills()` e domínio financeiro atual. O master UI só altera apresentação.

No Mercado, preço pesquisado continua estimado, preço real continua separado e imagem nunca prova preço. Exatidão de caixa futura exige identidade, quantidade/peso, preço e condições relevantes confirmados.

## 10. Segurança

`76-veggie-menu2` e `76-modern-ui1` não alteram `core.js`, `finance.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sync, QR/scanner, CSP, endpoints ou segredos.

## 11. Estado publicado e QA

PR #76 integrado em `main` no commit `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

- TypeScript PR `34537361127`: sucesso;
- CI PR `34537361274`: sucesso;
- TypeScript main `34537430909`: sucesso;
- CI main `34537430967`: sucesso;
- Pages `34537469989`: sucesso.

Validação física pós-publicação continua obrigatória para Safari/iPhone, especialmente animação, swipe, scroll e geometrias 320/375/390/430 px.
