# Arquitetura — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão candidata: `0.76.0`  
Release candidata: `v76`  
Programa técnico: `v76` — migração incremental TypeScript + UI/UX + validação de release  
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
- `mobile-menu-toggle.js`: controlador móvel legado compatível;
- `v75-architecture.js`: hierarquia de navegação;
- `src/`: módulos e contratos em migração progressiva para TypeScript;
- `app-update.js`: Centro de Versão e Atualizações, isolado do domínio financeiro.

A promoção para v76 não muda estas fronteiras nem o schema persistido.

## 3. Composição pública

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` por allowlist explícita. `sw.js` mantém a allowlist/cache do app shell.

Ordem visual relevante:

1. base/responsive;
2. `mobile-layout.css` — apenas refinamentos de features móveis, sem propriedade do viewport;
3. `mobile-menu-toggle.css`;
4. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
5. páginas, Despesas e Mercado v75;
6. `v76-veggie-menu.css`;
7. `v75-usability.css`;
8. `v76-modern-ui.css` — design system transversal;
9. `v76-mobile-shell.css` — autoridade final da geometria em ≤820 px;
10. `v76-version-about.css` — apresentação do Centro de Versão.

A ordem de `v76-mobile-shell.css` depois de `v76-modern-ui.css` é deliberada enquanto decorre a consolidação: aparência e componentes ficam na camada visual; viewport/safe areas/scroll/dock pertencem ao shell.

## 4. Modelo de versionamento

- **Application Version**: `package.json.version`; candidata estável `0.76.0`;
- **Public Release**: `BUILD`/`release-manifest.json`; candidata `v76`;
- **Build ID**: primeiros 7 caracteres do SHA Git efetivamente compilado;
- **Build Date**: data ISO gerada no `prepare-pages`.

`scripts/prepare-pages.cjs` injeta os quatro metadados no HTML público. Application Version, Public Release e Build ID continuam deliberadamente distintos.

## 5. Atualizações PWA

`app-update.js` e `sw.js` implementam atualização controlada:

1. `release-manifest.json` é consultado com `cache: no-store`;
2. a verificação manual chama `registration.update()` antes de declarar “atualizado”;
3. release igual não prova build igual;
4. worker em espera só é aplicado por ação explícita (`APPLY_UPDATE`);
5. `controllerchange` faz reload controlado;
6. dados financeiros, PIN e cofre não participam deste protocolo.

Na v76 o nome de cache é revisto para `v76-release1`, de modo a invalidar o app shell antigo. A ativação remove caches da aplicação com chave anterior, mas não elimina IndexedDB.

Critério de cache:

- Cache Storage para recursos HTTP do app shell/rede escolhidos;
- IndexedDB para estado estruturado;
- manifestos/metadados de atualização não devem ficar presos a cache obsoleta;
- Service Worker não pode ser requisito para o núcleo funcionar online.

## 6. Navegação

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer mantém destinos secundários. Bottom navigation contém destinos, não comandos da vista. Toolbar/cabeçalho contém título, contexto e ações prioritárias. A hierarquia funcional deve ser equivalente entre mobile e desktop.

## 7. Shell móvel

Em ≤820 px, `v76-mobile-shell.css` é a autoridade da geometria global:

- `body` é o único scroll vertical da aplicação desbloqueada;
- `.app-shell` tem altura automática e `min-height:100dvh`, sem clipping;
- `.main` não cria scroll container paralelo;
- `.topbar` permanece `position:relative` no fluxo, compensada por `safe-area-inset-top`;
- `.page` reserva o dock inferior;
- `.mobile-nav` permanece persistente e respeita `safe-area-inset-bottom` e safe areas laterais;
- existem contratos para ≤390 px, ≤359 px e landscape de baixa altura;
- foco/último conteúdo não podem ficar atrás do dock;
- drawer/dialogs mantêm geometria modal própria.

`mobile-layout.css` não pode voltar a definir `.app-shell`, `.main`, `.topbar` ou `.mobile-nav` como viewport global. `tests/ui-architecture-contract.test.cjs` protege este contrato.

## 8. Sistema visual

`v76-modern-ui.css` define tokens e aparência transversal para Dashboard, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições, além de botões, inputs, tabs, tabelas, dialogs, drawer e bottom navigation.

Separação de responsabilidade:

- **tokens**: cor, tipografia, espaçamento, raios, sombra e foco;
- **shell**: viewport, scroll, safe areas, topbar, área principal e navegação persistente;
- **components**: botões, inputs, cards, tabs, dialogs e tabelas;
- **features**: páginas/domínios visuais;
- **states**: active, focus, disabled, loading, empty, error, offline;
- **utilities**: helpers genéricos.

Não criar novos ficheiros de “patch” para a mesma geometria. `@layer` só será introduzido quando o domínio concorrente completo puder ser migrado sem inverter precedência. `!important` novo exige justificação.

## 9. Responsive, iPhone e acessibilidade

Critério mínimo:

- mobile-first;
- reflow a 320 CSS px sem perda de informação/funcionalidade;
- sem scroll horizontal global, salvo componentes que semanticamente exijam duas dimensões;
- `viewport-fit=cover` + `env(safe-area-inset-*)`;
- sem offsets por modelo específico de iPhone;
- 44×44 CSS px como baseline interna para controlos tácteis primários;
- WCAG 2.2 AA mantém mínimo normativo próprio;
- foco nunca totalmente oculto por header/dock/overlay;
- pinch-to-zoom preservado;
- teclado virtual, portrait/landscape e visual viewport entram na regressão.

Matriz estrutural: 320, 360/375, 390, 430, 768/820 e ≥1024 px.

## 10. TypeScript

A migração continua incremental e `strict`:

- o browser ainda executa JavaScript onde o runtime não foi substituído;
- módulos só substituem runtime após paridade comprovada;
- não introduzir React, Flutter ou .NET MAUI como efeito lateral da migração;
- `any` não justificado não é estratégia aceite;
- schema, cifragem e sincronização não mudam apenas por mudança de linguagem.

Na release v76, `npm run typecheck` passa também a integrar o job principal do CI que autoriza publicação.

## 11. Segurança

- CSP é defesa em profundidade, não substituto de validação/escaping;
- reduzir progressivamente dependências externas e `unsafe-inline`, sem ampliar CSP por conveniência;
- validar inputs externos sintática e semanticamente;
- dados remotos de preço/fotografia não são prova financeira;
- upload/leitura de faturas deve validar formato, limites e conteúdo;
- nenhum token, palavra-passe ou chave entra no repositório público;
- mudanças UI/release não podem enfraquecer isolamento do cofre ou sincronização cifrada.

## 12. CI v76 — gate único de qualidade

`.github/workflows/ci.yml` passa a representar o gate de publicação completo.

### Job `quality`

Executa:

- instalação da toolchain fixada em `package.json`;
- TypeScript strict;
- probe das fontes de Mercado;
- syntax checks;
- testes financeiros, auditoria e counting invariants;
- isolamento, datas, faturas e QR;
- Mercado, imagens, catálogo, scanner e contabilização;
- UI, arquitetura, Safari-startup estático, responsive, navegação e acessibilidade;
- atualização PWA;
- segurança;
- sync/conflitos;
- `tests/release-readiness.test.cjs`;
- manifestos.

### Job `browser-smoke`

Só inicia depois de `quality` verde. Usa Playwright com Chromium e WebKit nos perfis:

- Chromium desktop 1280×800;
- Chromium mobile 390×844;
- WebKit mobile 320×568;
- WebKit mobile 430×932.

Os smoke tests validam metadados `0.76.0/v76`, manifesto/recurso Service Worker, ausência de erro fatal capturado, overflow horizontal, geometria do menu/dock, reserva do último conteúdo e unicidade/acessibilidade de `#mobileMenuBtn`.

WebKit automatizado é evidência de compatibilidade do motor, não substituto de Safari/PWA instalada em iPhone físico.

## 13. Publicação GitHub Pages

`.github/workflows/pages.yml` só publica automaticamente depois de **todo o workflow CI** concluir com sucesso em `main`.

O deploy:

1. faz checkout do `workflow_run.head_sha` aprovado;
2. confirma que `git rev-parse HEAD` é exatamente esse SHA;
3. repete TypeScript strict e release-readiness;
4. gera `dist/` pela allowlist;
5. valida `app-version=0.76.0`, `app-build=v76`, Build ID de 7 hex e manifesto v76;
6. só depois envia o artefacto ao GitHub Pages.

Isto reduz o risco de publicar um commit diferente daquele que passou o CI.

## 14. Gate de release

`tests/release-readiness.test.cjs` é o contrato entre source e bundle publicado. Ele confirma:

- versão estável sem sufixo prerelease;
- release manifest v76;
- `prepare-pages` v76;
- cache PWA v76;
- metadados do `dist`;
- existência de todos os assets locais referenciados pelo HTML;
- existência dos assets listados pelo Service Worker;
- exclusão de documentação, testes, scripts e ficheiros internos do bundle público.

Uma release só é considerada tecnicamente publicável depois deste gate, do CI funcional e dos browsers automatizados verdes.

## 15. Limite da certificação automatizada

A automação não consegue certificar características físicas do iPhone — status bar/Dynamic Island real, safe-area efetiva do dispositivo, comportamento da PWA instalada, teclado/gestos e rendering específico de uma versão concreta do Safari em hardware. A validação física permanece uma etapa de QA separada e deve ser documentada quando executada.
