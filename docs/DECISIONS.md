# Decisões Técnicas — Conta de Casa

Atualizado: 11 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## Decisões estruturais vigentes

- Estado financeiro local-first separado de apresentação e catálogos.
- Valores monetários em cêntimos e `STATE_VERSION = 5`.
- Cofre PBKDF2-SHA-256 + AES-GCM; `PBKDF2_ITERATIONS = 250000`.
- Fotografias não são prova de preço nem de transação.
- `marketId|pid` é a identidade canónica de fotografia/SKU no pipeline especializado.
- Preço pesquisado é estimativa; preço efetivamente pago continua separado.
- Falha de fotografia nunca remove o artigo.
- Releases públicas relevantes usam revisão/cache invalidável.
- Correções de zoom não podem bloquear pinch-to-zoom.
- A UI móvel não deve esconder funcionalidades canónicas sem substituição funcional equivalente.

## D-064 — migração TypeScript incremental

Estado: integrado em `main` pelo PR #72.

1. Destino: código-fonte funcional TypeScript com `strict`.
2. Browser continua a receber JavaScript durante a transição.
3. Não introduzir React, Flutter ou .NET MAUI durante a migração de linguagem.
4. Cada módulo só substitui runtime depois de paridade e regressão.
5. Schema, cifragem e sincronização não mudam apenas por causa da linguagem.
6. `any` não justificado não é estratégia aceite.

## D-065 — total de Mercado só é exato com evidência completa

Um total só pode ser apresentado como **Exato** quando estiverem confirmados SKU, quantidade/peso, preço aplicável, promoções/condições, cartão/cupão quando aplicável, regra fiscal necessária e ajustes identificados na fatura/talão. Sem isso, permanece `Estimativa` ou `Preço por confirmar`.

## D-066 — imagens e logos preservam identidade, licença e CSP

- imagens são enriquecimento visual, não prova de preço;
- preferir GTIN/PID e fonte verificada;
- logos SVG só entram como assets locais com origem/direito de utilização verificados;
- não expandir CSP apenas para branding.

## D-067 — modernização de Despesas é visual e isolada

Estado: integrado em `main` como `75-expenses1` pelo PR #73. `renderBills()`/`filterBills()` permanecem canónicos e o redesign não altera domínio financeiro ou persistência.

## D-068 — Veggie Burger/X usa um único controlo TypeScript

Estado vigente: `76-veggie-menu2`, integrado pelo PR #76.

1. Fechado: exatamente duas linhas horizontais.
2. Aberto: mesmas linhas formam X (`+45°/-45°`).
3. `#mobileMenuBtn` é o único controlo canónico.
4. Fonte em `src/ui/veggie-menu-toggle.ts` com TypeScript strict.
5. Animação explícita por Web Animations API; ambas as barras permanecem visíveis.
6. O botão fica fora da `.nav-drawer-shell` transformada enquanto o drawer está aberto.
7. `aria-expanded` e `aria-label` continuam associados ao mesmo botão.
8. Reduced-motion, foco e alvo táctil permanecem suportados.
9. A camada não acede ao estado financeiro.

## D-069 — topbar mobile permanece no fluxo normal

Estado: integrado pelo PR #76.

1. `.topbar` usa `position: relative` em mobile.
2. `.main` não reserva `padding-top` para header fixo.
3. Conteúdo começa depois do cabeçalho no fluxo normal.
4. Bottom navigation pode continuar persistente porque é navegação global.
5. Safe areas, acessibilidade e alvos tácteis permanecem obrigatórios.

## D-070 — UI/UX master é camada visual transversal e isolada

Estado: integrado pelo PR #76 como `76-modern-ui1`.

1. `v76-modern-ui.css` define o design system transversal.
2. Cobre todas as páginas funcionais e componentes partilhados.
3. Não altera handlers, dados, cálculos, IndexedDB, PIN, cifragem, sync, scanner, QR ou CSP.
4. Tema escuro, reduced-motion, forced-colors, pinch-to-zoom e alvos tácteis permanecem requisitos.
5. Geometria do viewport móvel pertence ao shell, não ao design system.

## D-071 — versão, release e build são identidades separadas

Estado: integrado pelo PR #78.

1. `package.json.version` é a versão da aplicação.
2. `app-build`/`release-manifest.json` identificam a release pública.
3. cada compilação pública recebe Build ID de 7 caracteres e Build Date ISO;
4. `scripts/prepare-pages.cjs` injeta estes metadados;
5. `registration.update()` ocorre antes de concluir que não há atualização;
6. release igual não prova build igual;
7. aplicação de Service Worker em espera depende de ação explícita;
8. o mecanismo não lê nem transmite estado financeiro, PIN ou cofre.

A decisão anterior de não promover v75 sem release formal é satisfeita pela D-074 e respetivos gates.

## D-072 — shell móvel tem um único scroll e respeita safe areas

Estado: integrado em `main` pelo PR #80.

1. Em ≤820 px, aplicação desbloqueada usa um único scroll vertical no documento.
2. `.app-shell` e `.main` não impõem `max-height:100dvh` ou clipping.
3. Topbar fica no fluxo com compensação de `safe-area-inset-top`.
4. Bottom navigation persistente entra na reserva inferior das páginas e respeita `safe-area-inset-bottom`.
5. `v76-mobile-shell.css` é a autoridade de geometria, não de domínio.
6. Contratos cobrem 320/375/390/430 px e landscape de baixa altura.
7. Não usar `zoom` nem bloquear pinch-to-zoom.
8. Foco deve poder ficar acima do dock.
9. Drawer/dialogs mantêm geometrias próprias.

## D-073 — arquitetura UI v76 tem propriedade única por preocupação

Estado: integrado em `main` pelo PR #82, merge `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`.

1. Cada preocupação transversal tem uma autoridade: shell, tokens, components, features, states, domínio, persistência, sync, PWA e segurança.
2. `v76-mobile-shell.css` é a autoridade de geometria global mobile.
3. `mobile-layout.css` fica restrito a refinamentos de features.
4. Não criar novos ficheiros “patch” para corrigir a mesma geometria.
5. `@layer` só é adotado por domínio completo, preservando precedência.
6. `!important` novo em shell/components exige justificação e será reduzido progressivamente.
7. Reflow deve funcionar a 320 CSS px sem perda funcional nem scroll horizontal global.
8. 44×44 CSS px é baseline tátil interna para controlos primários; WCAG 2.2 mantém o mínimo normativo próprio.
9. Safe areas usam `env(safe-area-inset-*)`, sem offsets por modelo.
10. Bottom navigation contém destinos de topo, não ações da vista.
11. Conteúdo/foco não podem ficar atrás de docks/headers.
12. Container queries aplicam-se a componentes dependentes do contentor, não substituem shell/safe areas.
13. Cache Storage e IndexedDB permanecem responsabilidades distintas.
14. CSP é defesa em profundidade; inputs externos requerem validação sintática e semântica.
15. Refatorações transversais passam pelos gates financeiros, segurança, sync, responsive, acessibilidade e PWA.

Implementação inicial: contrato `tests/ui-architecture-contract.test.cjs`, remoção da geometria antiga de `mobile-layout.css` e invalidação de cache `architecture-baseline1`.

## D-074 — v76 estável exige um único gate de publicação e validação multi-motor

Data: 11 de setembro de 2026. Estado: em validação na branch `release/v76-ready`.

### Problema

Antes desta decisão, a aplicação tinha CI funcional extenso, TypeScript num workflow separado e Pages que repetia manualmente uma lista própria de testes. Isto criava três riscos:

- o CI principal podia ficar verde sem o TypeScript Foundation fazer parte da mesma conclusão;
- a lista de validações do Pages podia divergir da lista do CI;
- não existia execução real do bundle em motores de browser no gate de release.

### Decisão

1. A versão estável candidata é `0.76.0`; a release pública candidata é `v76`.
2. A promoção não altera `STATE_VERSION=5`, schema, cêntimos, PBKDF2/AES-GCM, sincronização ou domínio financeiro.
3. `.github/workflows/ci.yml` é o **gate técnico único** que autoriza deploy automático.
4. TypeScript `strict` é executado dentro do job `quality`, para que um CI verde inclua obrigatoriamente o typecheck.
5. O job `quality` mantém todos os testes funcionais, financeiros, segurança, UI, PWA e sync já existentes e acrescenta `release-readiness`.
6. Um segundo job `browser-smoke`, dependente de `quality`, executa Playwright em Chromium e WebKit.
7. Os perfis mínimos de browser são desktop 1280×800 e mobile 390×844 em Chromium, e 320×568/430×932 em WebKit.
8. `tests/release-readiness.test.cjs` verifica coerência de versão/release, `dist/`, referências locais, allowlist pública e cache do Service Worker.
9. GitHub Pages só publica automaticamente quando o workflow CI completo de `main` concluir com sucesso.
10. Pages faz checkout do `head_sha` aprovado e confirma que o SHA local é exatamente o SHA testado.
11. Pages repete apenas gates de integridade de release (TypeScript + release-readiness + metadados do `dist`), em vez de manter uma segunda cópia manual de toda a suíte funcional.
12. `app-version=0.76.0`, `app-build=v76`, Build ID de 7 hex e `release-manifest.latestVersion=v76` são pré-condições de deploy.
13. O Service Worker recebe revisão `v76-release1` para invalidar o app shell anterior sem apagar IndexedDB.
14. Falhas de browser smoke preservam traces temporárias para diagnóstico.
15. WebKit automatizado reduz risco de compatibilidade do motor, mas **não autoriza afirmar validação física de Safari/PWA em iPhone**. Essa evidência continua separada.

### Critério de integração

A branch só pode entrar em `main` quando CI completo da branch/PR estiver verde, o diff for revisto e não houver alteração não justificada no núcleo financeiro/segurança. Depois do merge é obrigatório confirmar CI de `main` e Pages do SHA integrado.

## Evidência histórica relevante

- PR #76: UI/UX + Veggie Burger v2;
- PR #78: version audit;
- PR #80: mobile shell;
- PR #82: baseline arquitetural v76;
- PR #83: sincronização documental da baseline.

## Lacunas preservadas

- `market-experience.js` extrai `pid` da resposta Cesta, mas a persistência explícita em todo o fluxo ainda necessita teste próprio;
- consolidação das camadas CSS v74/v75/v76 continua progressiva;
- validação física em iPhone/Safari/PWA continua pendente enquanto não houver evidência real do dispositivo.
