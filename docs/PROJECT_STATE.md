# Estado do Projeto — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX/arquitetura  
Branch pública: `main`  
Última baseline funcional publicada: `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`  
Build público de referência: `bb0cd65`  
Trabalho atual: `feat/v76-ui-consolidation1` — PR #84 (draft)  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica no pipeline especializado de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e funcionamento offline não podem regredir por mudanças visuais;
- alterações UI/UX, shell ou versionamento não podem modificar cálculos, pagamentos, faturas, persistência ou segurança.

## 2. Estado publicado em `main`

- `75-market1` — Mercado;
- `75-expenses1` — Despesas/Faturas;
- fundação TypeScript — PR #72;
- `76-veggie-menu1` — PR #74;
- `76-veggie-menu2` + `76-modern-ui1` — PR #76;
- `76-version-audit1` — PR #78;
- `76-mobile-shell2` — PR #80;
- baseline arquitetural transversal v76 — PR #82, merge `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`.

A baseline arquitetural foi validada no PR com CI e TypeScript Foundation verdes. Depois do merge, TypeScript Foundation `34577495832`, CI `34577495803` e GitHub Pages `34577588233` terminaram com sucesso.

## 3. Diagnóstico arquitetural

A auditoria de 11/09/2026 confirmou que o problema não era apenas um valor de margem/safe area. A UI acumulou várias folhas de estilo versionadas com responsabilidades sobre os mesmos elementos estruturais. O caso comprovado inicial era `mobile-layout.css`, que ainda definia `.app-shell`, `.main` e `.topbar` apesar de `v76-mobile-shell.css` já ser a autoridade final do viewport móvel.

A revisão seguinte confirmou uma segunda sobreposição concreta: `v76-modern-ui.css` ainda repetia geometria mobile de `.main`, `.topbar`, `.main>.page` e `.mobile-nav` que já era definida posteriormente por `v76-mobile-shell.css`. O valor final podia manter-se correto apenas porque o shell ganhava a cascata por ordem/especificidade/`!important`.

Conclusão vigente: não criar novas camadas de override para corrigir a mesma geometria. Consolidar a aplicação por propriedade/responsabilidade e com gates de regressão.

## 4. Pesquisa técnica realizada

Foram revistos referenciais primários/de elevada confiança:

- Apple Human Interface Guidelines / Apple Developer: safe areas, layout, toolbar e navegação;
- MDN Web Docs: `env(safe-area-inset-*)`, `viewport-fit=cover`, cascata/especificidade, cascade layers e container queries;
- W3C/WAI WCAG 2.2: Reflow a 320 CSS px, Target Size e Focus Not Obscured;
- web.dev: arquitetura PWA, Cache Storage, IndexedDB e estratégias de cache;
- OWASP Cheat Sheet Series: CSP e validação de inputs.

A Apple HIG é referência ergonómica/plataforma para iPhone. Os requisitos Web e de acessibilidade continuam ancorados em standards Web/WCAG.

## 5. Baseline arquitetural publicada

A baseline v76 estabelece:

- `v76-mobile-shell.css` como autoridade declarada para geometria global mobile ≤820 px;
- `mobile-layout.css` apenas para refinamentos de features móveis;
- um contrato automatizado em `tests/ui-architecture-contract.test.cjs`;
- regressão mobile alinhada com a arquitetura atual;
- invalidação de cache PWA `architecture-baseline1` para distribuir a alteração estrutural;
- CI com gate explícito de arquitetura UI;
- documentação permanente sincronizada com a nova propriedade por preocupação.

Esta etapa não altera `core.js`, `finance.js`, schema, IndexedDB, PBKDF2/AES-GCM, pagamentos, faturas, QR, scanner, sincronização cifrada ou regras financeiras/Mercado.

## 6. Consolidação UI em curso — PR #84

Objetivo: executar a primeira etapa da consolidação transversal sem mudança funcional nem refatoração “big-bang”.

Alterações já aplicadas na branch:

- removida de `v76-modern-ui.css` a geometria mobile duplicada de `.main`;
- removidas da camada visual master as dimensões/posicionamento global da `.topbar`, mantendo apenas apresentação e composição interna;
- removida da camada visual master a reserva geométrica de `.main>.page`, ficando a cargo do shell;
- removidos de `.mobile-nav` os offsets, posição fixa, dimensão e padding pertencentes ao shell, mantendo superfície, borda, sombra, blur e estados visuais;
- removidos dos ajustes ≤390 px os gutters/offsets estruturais já definidos pelo shell;
- preservados alvos tácteis de 44 px, hierarquia visual, cartões, formulários, tabs, dialogs, dashboard, despesas, Mercado e restantes páginas;
- `tests/v76-modern-ui.test.cjs` e `tests/ui-architecture-contract.test.cjs` agora impedem a reintrodução dessa geometria duplicada.

Escopo explicitamente não alterado: `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB, PIN, PBKDF2/AES-GCM, QR, scanner, backup, sincronização e regras financeiras/Mercado.

Estado: PR #84 aberto em draft; integração depende de CI + TypeScript Foundation verdes e revisão do diff.

## 7. Critério UI/UX v76

- uma única autoridade por preocupação transversal;
- mobile-first;
- reflow a 320 CSS px sem perda de informação/funcionalidade e sem scroll horizontal global;
- safe areas explícitas em dispositivos edge-to-edge;
- baseline interna de 44×44 CSS px para controlos tácteis primários no iPhone;
- foco e último conteúdo nunca escondidos por dock/header persistentes;
- bottom navigation apenas para destinos de topo; ações da vista ficam na toolbar/corpo/menu contextual;
- nenhum novo ficheiro “patch” para corrigir a mesma geometria;
- `@layer` só entra quando o domínio concorrente completo puder ser migrado em conjunto;
- reduzir `!important` por propriedade comprovadamente consolidada, nunca por remoção cega;
- container queries apenas para componentes dependentes do contentor;
- alterações visuais não podem tocar no domínio financeiro ou segurança sem decisão própria.

## 8. PWA e segurança

Critério de evolução:

- Cache Storage para recursos HTTP do app shell/rede escolhidos; IndexedDB para estado estruturado;
- manifestos/metadados de atualização não devem ficar presos a cache obsoleta;
- Service Worker não pode ser requisito para o núcleo online funcionar;
- CSP continua defesa em profundidade e deve ser progressivamente mais restrita;
- avaliar remoção da dependência runtime externa do ZXing, mantendo licença e funcionalidade;
- reduzir `style-src 'unsafe-inline'` apenas depois de migrar estilos inline necessários;
- validar dados remotos/QR/importação de faturas sintática e semanticamente antes de os aceitar no domínio.

## 9. Riscos/lacunas abertas

- validação física do build publicado em iPhone/Safari/PWA continua necessária;
- PR #84 ainda depende dos gates automáticos e não deve ser integrado antes de ficarem verdes;
- camadas v74/v75/v76 ainda contêm sobreposição de componentes/features e uso elevado de `!important` a consolidar em fases;
- `main` permanece sem branch protection;
- `market-experience.js` mantém a lacuna conhecida de persistência explícita de `pid` em todo o fluxo;
- release pública continua `v75` até decisão formal de promoção.

## 10. Próximo passo

1. Fechar PR #84 apenas com CI + TypeScript Foundation verdes e diff revisto.
2. Depois inventariar componentes visuais transversais: hierarquia de botões, grids, cards, formulários, iconografia, imagens/fotografias, estados e toolbars.
3. Consolidar primeiro componentes partilhados e só depois páginas específicas, verificando Início, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições.
4. Validar 320/360/375/390/430/768/820/1024+ px, teclado/foco, toque, dark mode e estados vazio/carregamento/erro/sucesso.
5. Não apagar CSS histórico nem alterar domínio financeiro/segurança sem prova de paridade e regressões verdes.
