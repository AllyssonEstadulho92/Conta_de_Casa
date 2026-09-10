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
- `marketId|pid` continua identidade canónica do pipeline especializado de SKU/fotografia;
- alterações visuais não podem modificar domínio financeiro, segurança ou persistência.

## 2. Núcleo funcional

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- `mobile-menu-toggle.js`: controlador móvel v73;
- `v75-architecture.js`: hierarquia de navegação;
- `src/`: módulos/contratos migrados progressivamente para TypeScript.

O browser continua a executar JavaScript durante a migração. TypeScript é a fonte verificada para os novos blocos.

## 3. Composição pública

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` por allowlist explícita e injeta revisões de cache. `sw.js` mantém allowlist equivalente.

Ordem visual relevante:

1. estilos base e responsive;
2. `mobile-menu-toggle.css`;
3. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
4. páginas, Despesas e Mercado v75;
5. `v76-veggie-menu.css`;
6. `v75-usability.css`;
7. **`v76-modern-ui.css` como última camada transversal**.

A última camada tem autoridade apenas sobre apresentação, geometria, estados visuais e responsividade.

## 4. Navegação

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer completo mantém destinos secundários agrupados. Rotas, IDs, permissões e handlers existentes não são substituídos pelo redesign.

## 5. Cabeçalho mobile — nova política

A evidência física em iPhone mostrou que a combinação de header sticky/fixo com padding reservado criava uma composição estranha durante scroll. A política v76 passa a ser:

- `.topbar` no fluxo normal (`position: relative`) em mobile;
- sem `padding-top` estrutural reservado para header fixo;
- conteúdo começa imediatamente depois do header;
- safe areas permanecem respeitadas pelas camadas base/PWA;
- navegação inferior continua persistente por ser controlo de navegação e não cabeçalho de conteúdo.

## 6. Veggie Burger TypeScript — `76-veggie-menu2`

Fonte: `src/ui/veggie-menu-toggle.ts`.  
Runtime browser: `v76-veggie-menu.js`.

O controlo canónico permanece `#mobileMenuBtn`:

- fechado: duas barras horizontais;
- aberto: superior `+45°`, inferior `-45°`;
- Web Animations API anima explicitamente as duas barras;
- ambas permanecem visíveis durante a transição;
- `aria-expanded`/`aria-label` continuam a vir do controlador funcional;
- com drawer aberto, o mesmo botão fica fora da `.nav-drawer-shell` transformada;
- `prefers-reduced-motion` desativa animação;
- não há segundo botão/X funcional.

## 7. Sistema visual master — `76-modern-ui1`

`v76-modern-ui.css` define tokens transversais para:

- background/surface/surface-soft;
- texto e muted;
- primary/accent;
- danger/warning/success;
- bordas;
- sombras;
- raios;
- foco.

Aplica estes contratos de apresentação a todas as páginas:

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
- hierarquia visual baseada em tamanho, peso, espaçamento e contraste, não em excesso de cores;
- ações primárias distinguíveis de ações secundárias/destrutivas;
- superfícies com bordas leves e sombras discretas;
- alvos tácteis mínimos de 44 px;
- campos mobile com 16 px para evitar zoom automático Safari;
- `prefers-reduced-motion` e `forced-colors` preservados;
- pinch-to-zoom não é bloqueado;
- bottom navigation mantém cinco destinos previsíveis.

## 9. Despesas

`renderBills()`/`filterBills()` permanecem canónicos. `v75-expenses-modern.css` e `v76-modern-ui.css` apenas alteram apresentação. Estados, vencimentos, valores, Total/Pago/Em falta e ações continuam derivados do domínio atual.

## 10. Mercado

A apresentação pode evoluir sem confundir precisão:

- preço pesquisado continua estimado;
- preço real continua confirmação distinta;
- imagem não prova preço;
- futura exatidão de caixa exige SKU, quantidade/peso, preço aplicável e descontos/regras relevantes confirmados;
- lacuna conhecida: `pid` extraído pela pesquisa live ainda precisa de persistência explícita com teste próprio.

## 11. Segurança

`76-veggie-menu2` e `76-modern-ui1` não alteram:

- `core.js`;
- `finance.js`;
- IndexedDB;
- PIN;
- PBKDF2/AES-GCM;
- backup;
- sincronização;
- QR/scanner;
- CSP;
- endpoints ou segredos.

## 12. QA

Testes específicos:

- `tests/v76-veggie-menu.test.cjs`;
- `tests/v76-modern-ui.test.cjs`.

CI do head funcional da branch `fix/v76-menu-flow-modern-ui`: run `34537017339` — sucesso, incluindo todas as regressões existentes e os dois testes v76.

TypeScript strict deve passar no PR antes de integração. Depois do merge, CI + TypeScript + Pages devem ser confirmados novamente.
