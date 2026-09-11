# Estado do Projeto — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX/arquitetura  
Branch pública: `main`  
Branch em avaliação: `refactor/v76-architecture-baseline`  
HEAD funcional publicado: `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`  
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
- `76-mobile-shell2` — PR #80, merge funcional `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`;
- documentação de publicação sincronizada em `main` por `0011e5fe7c77dbc1b02b62ba42688f5914bcb9a3`.

## 3. Diagnóstico arquitetural atual

A correção `76-mobile-shell2` resolveu a geometria final por precedência, mas a auditoria de 11/09/2026 confirmou uma dívida estrutural maior: a UI acumulou várias folhas de estilo versionadas com responsabilidades sobre os mesmos elementos.

O exemplo objetivo era `mobile-layout.css`, que ainda definia `.app-shell`, `.main` e `.topbar` apesar de `v76-mobile-shell.css` já ser a autoridade final do viewport móvel. O resultado funcional podia ficar correto, mas dependia de ordem de carregamento, especificidade e `!important`. Isto aumenta o risco de regressão a cada nova alteração visual.

Conclusão: não continuar a corrigir a aplicação através de novas camadas de override. O próximo ciclo deve consolidar propriedade por preocupação e introduzir gates arquiteturais.

## 4. Pesquisa técnica realizada

Foram revistos referenciais primários/de elevada confiança para alinhar o critério da aplicação:

- Apple Human Interface Guidelines / Apple Developer: safe areas, layout, toolbar e navegação;
- MDN Web Docs: `env(safe-area-inset-*)`, `viewport-fit=cover`, cascade/specifity, cascade layers e container queries;
- W3C/WAI WCAG 2.2: Reflow a 320 CSS px, Target Size e Focus Not Obscured;
- web.dev: arquitetura PWA, Cache Storage, IndexedDB e estratégias de cache;
- OWASP Cheat Sheet Series: CSP e validação de inputs.

A Apple HIG é usada como referência ergonómica/plataforma para iPhone; os requisitos Web e de acessibilidade continuam ancorados em standards Web/WCAG.

## 5. Baseline arquitetural em implementação

Branch: `refactor/v76-architecture-baseline`.

Alterações já efetuadas na branch:

- `mobile-layout.css` deixou de possuir viewport, scroll principal, topbar ou bottom navigation;
- o ficheiro mantém apenas refinamentos móveis de feature do Mercado;
- `v76-mobile-shell.css` passa a ser a única autoridade declarada para geometria global mobile ≤820 px;
- `tests/mobile-layout-regression.test.cjs` foi atualizado para testar a arquitetura atual em vez da arquitetura antiga;
- criado `tests/ui-architecture-contract.test.cjs`;
- CI passa a executar o novo contrato;
- `ARCHITECTURE.md`, `DECISIONS.md` e `TODO.md` foram atualizados com o critério transversal.

Ainda não considerar esta baseline integrada/publicada enquanto CI, TypeScript Foundation, revisão do diff, merge e Pages não estiverem concluídos.

## 6. Critério UI/UX v76

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

## 7. PWA e segurança

Critério de evolução:

- Cache Storage para recursos HTTP do app shell/rede escolhidos; IndexedDB para estado estruturado;
- manifestos/metadados de atualização não devem ficar presos a cache obsoleta;
- Service Worker não pode ser requisito para o núcleo online funcionar;
- CSP continua defesa em profundidade e deve ser progressivamente mais restrita;
- avaliar remoção da dependência runtime externa do ZXing, mantendo licença e funcionalidade;
- reduzir `style-src 'unsafe-inline'` apenas depois de migrar estilos inline necessários;
- validar dados remotos/QR/importação de faturas sintática e semanticamente antes de os aceitar no domínio.

## 8. Riscos/lacunas abertas

- validação física pós-publicação de `76-mobile-shell2` em iPhone/Safari/PWA continua necessária;
- a baseline arquitetural atual ainda precisa de CI/TypeScript/merge/Pages;
- `v76-modern-ui.css` e camadas v74/v75 ainda contêm sobreposição de responsabilidade e `!important` a consolidar em fases;
- `main` permanece sem branch protection;
- `market-experience.js` mantém a lacuna conhecida de persistência explícita de `pid` em todo o fluxo;
- release pública continua `v75` até decisão formal de promoção.

## 9. Próximo passo

Concluir os gates da branch `refactor/v76-architecture-baseline`. Se verdes, integrar a baseline e publicar. Depois executar a consolidação transversal por domínio, começando por shell/UI, sem big-bang e sem alterar domínio financeiro. A validação física iPhone/Safari/PWA permanece obrigatória durante esse processo.
