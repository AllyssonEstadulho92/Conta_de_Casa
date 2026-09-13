# Decisões Técnicas — Conta de Casa

Atualizado: 13 de setembro de 2026

Este ficheiro contém as decisões vigentes necessárias para continuidade. O detalhe histórico integral permanece no Git.

## D-064 — migração TypeScript incremental

Estado: vigente desde PR #72.

- destino: fonte funcional TypeScript com `strict`;
- browser continua a executar JavaScript compilado;
- não introduzir framework apenas para mudar linguagem;
- cada runtime só substitui JS manual depois de paridade e regressões;
- schema, cifragem e fórmulas não mudam por causa da linguagem;
- `@ts-nocheck` e `any` em massa não satisfazem a meta.

## D-065 — total de Mercado exige evidência completa

Um total só pode ser apresentado como exato quando SKU, quantidade/peso, preço aplicável, promoções/condições e ajustes relevantes estiverem confirmados. Caso contrário é `Estimativa` ou `Preço por confirmar`.

## D-066 — imagem não é prova de preço

Fotografias e logos são apresentação/identidade. Não podem, por si, definir `actualCents` nem provar uma transação.

## D-072 — shell móvel com uma única autoridade

`v76-mobile-shell.css` é a autoridade final para viewport autenticado, safe areas, scroll, reserva e posição do dock móvel. Outras folhas podem estilizar componentes, mas não recriar a geometria global.

## D-073 — propriedade única por preocupação

- tokens/componentes: design system;
- composição interna: product pages;
- geometria mobile: mobile shell;
- domínio: finanças/Mercado;
- persistência/cifra: core;
- sync: camada própria;
- build/PWA: tooling e Service Worker.

## D-075 — hierarquia visual canónica

`76-modern-ui2` define primary, secondary, danger, link e icon-button, baseline tátil de 44 px, foco visível e estados disabled/hover coerentes.

## D-076 — “100% TypeScript” significa fonte TypeScript

O nome público `.js` pode continuar a existir como artefacto de build. O que deve desaparecer é JavaScript manual mantido como fonte funcional, módulo a módulo.

## D-077 — protótipo não autoriza dados ou funções inventadas

Dashboard, Mercado, Planeamento, Calendário e Faturas usam os protótipos como referência de hierarquia. Métricas, tarefas, comparação de preços, biometria ou outras funções só entram se existirem no domínio real e forem implementadas/testadas.

## D-078 — composição v76 não altera domínio

`v76-product-pages.css` pode ordenar, dimensionar e priorizar secções, mas não calcular dinheiro, escrever IndexedDB ou alterar fluxo de segurança.

## D-079 — exclusão de JS exige substituição comprovada

Um `.js` manual só é removido depois de existir `.ts` equivalente, build gerado, consumidores migrados e gates verdes. Esta regra surgiu após a remoção prematura de `v75-architecture.js` quebrar CI/Pages.

## D-080 — artefactos JS gerados não contam como fonte manual

`.generated/*.js` e `dist/*.js` produzidos a partir de TypeScript são artefactos e não devem ser editados/versionados como fonte.

## D-081 — migração avança por blocos auditáveis

Módulos de baixo acoplamento primeiro; domínio financeiro, core/cifra e controladores complexos apenas depois de contratos de tipos e vetores de paridade suficientes.

Runtimes já migrados:

- Veggie menu — PR #88;
- Market branding — PR #89;
- Sync conflict policy — PR #95.

## D-082 — mudança visual tem de ser realmente perceptível

Não comunicar alterações de build/cache/TypeScript como redesign quando a composição visível não mudou. `76-auth1` foi o primeiro bloco explicitamente orientado a essa regra.

## D-083 — PIN local válido não depende de sincronização remota

Estado: integrado/publicado pelo PR #96, merge `d18d274141b1032ab0e909729739b3f86cabfb9e`.

Decisão:

1. O cofre local é a autoridade para autenticar a sessão local.
2. Depois de `unlockVault()` validar e decifrar o estado, a aplicação deve abrir o Dashboard imediatamente.
3. A sincronização GitHub é opcional e não pode bloquear o primeiro ecrã autenticado.
4. O sync real continua em background e pode atualizar o estado/status depois da abertura.
5. `#vaultScreen` e `#app` são estados visuais mutuamente exclusivos.
6. O dock móvel nunca pode ser renderizado por cima do cofre.
7. Em falha da transição, retirar `app-active`, esconder `#app` e restaurar o cofre.
8. A decisão não altera PBKDF2-SHA-256, AES-GCM, IndexedDB, `STATE_VERSION`, finanças nem política de conflitos.

Motivo: em Safari/iPhone foi observado PIN/cofre ainda visível enquanto o dock autenticado já aparecia e cobria a zona inferior. A causa era a espera por `syncStartupGate()` combinada com o guard de startup que voltava a mostrar o cofre.

Evidência:

- TypeScript Foundation `34780407487`: sucesso;
- CI `34780407473`: sucesso;
- Deploy Pages `34780437328`: sucesso.

## D-084 — regressão física tem prioridade sobre contrato legado

Quando uma captura/dispositivo real contradiz um teste verde, o teste deve ser revisto para cobrir o comportamento final desejado. Não preservar comportamento v74 apenas porque um teste histórico o exige.

Aplicação atual: `safari-startup.test.cjs` cobre transição local-first/rollback e `v76-mobile-shell.test.cjs` proíbe o app shell/dock enquanto o cofre estiver visível.

## Invariantes vigentes

- `STATE_VERSION=5`;
- cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- `estimatedCents` ≠ `actualCents`;
- `marketId|pid` canónico;
- QR/scanner/backup/PWA/offline sem regressões;
- nenhum segredo no repositório público.