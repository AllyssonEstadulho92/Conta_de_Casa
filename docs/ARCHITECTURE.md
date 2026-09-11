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

Ordem visual relevante atualmente:

1. base/responsive;
2. `mobile-layout.css` — apenas refinamentos de features móveis, sem propriedade do viewport;
3. `mobile-menu-toggle.css`;
4. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
5. páginas, Despesas e Mercado v75;
6. `v76-veggie-menu.css` (`76-veggie-menu2`);
7. `v75-usability.css`;
8. `v76-modern-ui.css` (`76-modern-ui1`) — design system transversal;
9. `v76-mobile-shell.css` (`76-mobile-shell2`) — autoridade final da geometria em ≤820 px;
10. `v76-version-about.css` (`76-version-audit1`) — apresentação específica do Centro de Versão.

A ordem de `v76-mobile-shell.css` depois de `v76-modern-ui.css` continua deliberada. O objetivo da consolidação v76 é reduzir a dependência de precedência histórica sem alterar de uma vez todo o valor computado da UI.

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

Critério v76 para evolução do cache:

- Cache Storage fica reservado a recursos HTTP necessários ao app shell e recursos de rede explicitamente escolhidos;
- IndexedDB continua a ser a persistência de estado estruturado da aplicação;
- não guardar em cache por rotina endpoints de atualização/manifestos que precisam de frescura;
- cada estratégia de cache deve ser escolhida por tipo de recurso e testada para offline, atualização e invalidação;
- o núcleo online não pode depender da existência do Service Worker.

## 6. Navegação

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer mantém destinos secundários. Rotas, IDs, permissões e handlers não são substituídos por CSS.

Critério de navegação:

- bottom navigation = destinos de topo, não comandos da vista;
- toolbar/cabeçalho = título, navegação contextual e ações prioritárias;
- ações secundárias passam para o corpo, menu contextual ou “Mais” quando o espaço for insuficiente;
- a hierarquia funcional deve ser equivalente entre mobile e desktop mesmo quando a apresentação muda.

## 7. Shell móvel — `76-mobile-shell2`

Estado publicado em `main`: PR #80, merge `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`.

### Problema histórico

Existiam duas decisões incompatíveis em cascata:

- `mobile-layout.css` mantinha `.app-shell` e `.main` com `height/max-height:100dvh`, `overflow:hidden` no shell e scroll interno em `.main`;
- `76-modern-ui1` já tinha tornado a `.topbar` relativa e no fluxo normal, mas sem revogar integralmente as limitações do viewport e sem repor `safe-area-inset-top`.

Em Safari/iPhone isto produziu clipping real: cabeçalho dentro da status bar e conteúdo final por baixo do dock.

### Estado na arquitetura baseline v76

`mobile-layout.css` deixou de possuir qualquer geometria global de `.app-shell`, `.main`, `.topbar` ou `.mobile-nav`. O ficheiro fica restrito a refinamentos de features móveis, atualmente densidade dos cartões de Mercado.

Em ≤820 px, `v76-mobile-shell.css` é a autoridade do shell e estabelece:

- `body` como único scroll vertical da aplicação desbloqueada;
- `.app-shell`: altura automática, `min-height:100dvh`, sem `max-height` e sem clipping;
- `.main`: altura automática, sem scroll container paralelo;
- `.topbar`: `position:relative`, no fluxo, com compensação por `env(safe-area-inset-top)`;
- `.page`: conteúdo elástico e `padding-bottom` calculado pela reserva do dock;
- `.mobile-nav`: persistente, com altura explícita e compensação de `safe-area-inset-bottom`;
- safe areas laterais para não encostar controlos a recortes/arestas;
- ajustes para ≤390 px, ≤359 px e landscape de baixa altura;
- `scroll-margin`/reserva suficientes para foco e último conteúdo não ficarem atrás do dock.

Drawer e dialogs continuam a usar geometria modal própria; não transferem o scroll principal novamente para `.main`.

## 8. Sistema visual master — `76-modern-ui1`

`v76-modern-ui.css` define tokens comuns de background, superfícies, texto, muted, primary/accent, estados, bordas, sombras, raios e foco.

Cobertura: Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições, além de tabs, botões, inputs, painéis, tabelas, estados vazios, dialogs, drawer e bottom navigation.

### Propriedade visual v76

A arquitetura passa a separar explicitamente:

- **tokens**: cor, tipografia, espaçamento, raios, sombra, foco;
- **shell**: viewport, scroll, safe areas, topbar, área principal e navegação persistente;
- **componentes**: botões, inputs, cards, tabs, dialogs, tabelas e estados;
- **features**: Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições;
- **estados**: active, focus, disabled, loading, empty, error, offline;
- **utilities**: apenas helpers genéricos sem semântica de domínio.

Uma propriedade só deve ter uma autoridade estrutural. Novas correções não devem criar ficheiros “patch” para voltar a substituir o mesmo seletor.

### Estratégia de cascata

A base atual ainda contém CSS histórico e `!important`. A migração para cascade layers será gradual e por domínio completo.

Ordem de destino:

`base → tokens → shell → components → features → states → utilities`

Não introduzir `@layer` apenas num ficheiro novo enquanto o restante código concorrente continuar sem layer, porque regras normais sem layer têm precedência sobre regras normais em layers. A adoção deve preservar o valor computado atual e ser acompanhada por testes.

Preferir seletores de baixa especificidade (`:where()` quando adequado), classes semânticas e composição. `!important` novo exige justificação explícita; o objetivo é eliminá-lo progressivamente onde já não houver conflito de propriedade.

## 9. Responsive, iPhone e acessibilidade

Critério mínimo para toda a aplicação:

- mobile-first;
- reflow sem perda de informação/funcionalidade a 320 CSS px;
- sem scroll horizontal global; exceções apenas em componentes cuja semântica realmente exija duas dimensões, como tabelas largas;
- `viewport-fit=cover` apenas com `env(safe-area-inset-*)` para conteúdo importante;
- não codificar offsets por modelo específico de iPhone;
- 44×44 CSS px como baseline interno para controlos tácteis primários no iPhone;
- WCAG 2.2 AA mantém o mínimo normativo de 24×24 CSS px ou espaçamento equivalente;
- foco nunca pode ficar totalmente oculto por header, dock, drawer persistente ou overlay do autor;
- inputs no iPhone devem manter tipografia que não provoque auto-zoom acidental e nunca bloquear pinch-to-zoom;
- landscape, teclado virtual e visual viewport entram na matriz de regressão;
- container queries são preferíveis em componentes reutilizáveis cuja adaptação depende da largura do contentor, mas não substituem safe areas nem breakpoints globais do shell.

Matriz obrigatória de viewport para QA visual/estrutural:

- 320 px;
- 360/375 px;
- 390 px;
- 430 px;
- 768/820 px;
- desktop ≥1024 px;
- portrait e landscape onde aplicável.

## 10. Veggie Burger TypeScript — `76-veggie-menu2`

Fonte: `src/ui/veggie-menu-toggle.ts`. Runtime: `v76-veggie-menu.js`.

- fechado: duas barras horizontais;
- aberto: superior `+45°`, inferior `-45°`;
- Web Animations API anima ambas;
- `#mobileMenuBtn` é controlo único;
- `aria-expanded`/`aria-label` preservados;
- com drawer aberto, o botão permanece fora da shell transformada;
- reduced-motion e forced-colors preservados.

## 11. Segurança

Camadas UI não alteram `core.js`, `finance.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sync, QR/scanner, endpoints ou segredos sem decisão própria.

Critérios adicionais v76:

- CSP é defesa em profundidade, não substituto de validação/escaping;
- reduzir progressivamente dependências de runtime externas e `unsafe-inline`; não ampliar CSP por conveniência;
- validar inputs externos no limite de entrada, tanto sintaticamente como semanticamente;
- nunca tratar dados remotos de preço/fotografia como prova financeira;
- upload/leitura de faturas deve validar formato, limites e conteúdo antes de persistir dados derivados;
- nenhum token, palavra-passe ou chave entra no repositório público;
- mudanças de UI não podem enfraquecer isolamento do cofre ou sincronização cifrada.

## 12. QA e gates arquiteturais

Além dos testes funcionais existentes, a baseline v76 introduz `tests/ui-architecture-contract.test.cjs`.

O gate verifica:

- `mobile-layout.css` não volta a definir viewport, `.main`, `.topbar` ou bottom navigation persistente;
- `v76-mobile-shell.css` mantém safe areas e propriedade do documento/scroll;
- `viewport-fit=cover` está presente sem bloquear zoom do utilizador;
- controlos críticos mantêm baseline de 44 px;
- `v76-mobile-shell.css` continua depois de `v76-modern-ui.css` no build;
- a regressão mobile deixa de testar a arquitetura antiga como comportamento obrigatório.

Qualquer refatoração transversal deve manter verdes, no mínimo:

- finance/audit/counting invariants;
- isolamento/cofre;
- datas civis;
- formulários/faturas/QR;
- Mercado/SKU/imagens/scanner;
- responsive/mobile;
- navegação/acessibilidade;
- sync/conflitos;
- atualização PWA/manifesto;
- TypeScript strict.

## 13. Referências técnicas usadas na revisão de 11/09/2026

Fontes primárias/de referência:

- Apple Human Interface Guidelines — Layout, Toolbars e padrões de navegação;
- Apple Developer — Safe Area Layout Guide;
- MDN Web Docs — CSS `env()`, safe-area insets, viewport meta, specificity, cascade layers e container queries;
- W3C/WAI — WCAG 2.2, Reflow, Target Size (Minimum) e Focus Not Obscured;
- web.dev — Storage for the web e Service Worker caching;
- OWASP Cheat Sheet Series — Content Security Policy e Input Validation.

Estas fontes orientam os critérios de plataforma, Web, acessibilidade, PWA e segurança. Não substituem testes reais no Safari/iPhone/PWA nem prova de regressão no código do projeto.
