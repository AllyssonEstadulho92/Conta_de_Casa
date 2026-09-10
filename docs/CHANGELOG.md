# Changelog Técnico — Conta de Casa

## 2026-09-10 — v75 `75-pages1` — Parte 2 da auditoria UX/UI

### Âmbito

Revisão de **Início, Despesas e Planeamento**, com prioridade à equivalência funcional entre mobile e desktop, hierarquia visual, densidade, filtros, estados, ações e responsividade. A alteração é exclusivamente visual e não modifica cálculos, dados, segurança ou persistência.

### Diagnóstico

- **Início** já tinha composição v74/v75 adequada, mas beneficiava de uma hierarquia visual mais clara entre mês, resumo, orçamento, ações rápidas, alertas e categorias.
- **Despesas** apresentava a principal divergência: no móvel, a composição v74 escondia Lista/Calendário, `bill-filter-grid`, `billSummary` e `billsList`, substituindo-os por `cdcExpenseFeed` simplificado.
- O feed simplificado permitia Todas/Entradas/Saídas e pesquisa, mas não expunha no móvel os filtros funcionais já existentes de estado, categoria, datas e ordenação, nem a mesma informação de vencimento, progresso e ações dos cartões canónicos.
- **Planeamento** já utilizava os valores do núcleo e precisava sobretudo de melhor sequência visual e empilhamento dos painéis no móvel.
- Os ícones necessários nesta fase já estão cobertos pelo sistema Lucide local; não foi adicionada qualquer biblioteca externa.

### Alterações — `75-pages1`

Foi criado `v75-pages.css`:

- **Início:** reforço da leitura mês → resumo → ações rápidas → categorias; resumo mensal com destaque estrutural mais claro; alertas mais compactos no móvel; feedback de interação uniforme; sem reintroduzir os blocos legados duplicados.
- **Despesas:** Lista/Calendário volta a estar acessível no móvel; filtros de estado, categoria, datas e ordenação voltam a ser apresentados; `billSummary` e `billsList` canónicos voltam a ser visíveis; os cartões móveis existentes passam a concentrar valor em falta, vencimento, total, pago, categoria, progresso e ações; `cdcExpenseFeed`/`cdcExpenseTabs` deixam de ser a vista principal móvel.
- **Planeamento:** resumo de orçamento e categorias recebe melhor hierarquia; formulário de saldo/orçamento e rendimentos passam a uma coluna em mobile; conciliação e lista de rendimentos ganham melhor legibilidade.
- Breakpoint muito estreito mantém filtros e ações em coluna para evitar compressão excessiva.
- `prefers-reduced-motion` e `forced-colors` continuam tratados.

### Distribuição e QA

- `scripts/prepare-pages.cjs` inclui `v75-pages.css?v=75-pages1`;
- `v75-pages.css` é carregado depois da arquitetura/drawer e antes de `v75-usability.css`, preservando a política final de anti-zoom e alvos tácteis;
- `sw.js` inclui o novo ativo e invalida o cache com `pages1`;
- `tests/v75-stability.test.cjs` verifica a visibilidade funcional de Despesas no móvel, o empilhamento de Planeamento, a ordem das camadas, distribuição e isolamento relativamente ao estado financeiro/criptográfico;
- não foram alterados `core.js`, `finance.js`, `render.js`, IndexedDB, PBKDF2, AES-GCM, PIN, sincronização, pagamentos, QR ou scanner.

### Estado

Implementação concluída na branch `fix/v75-pages-part2`. Integração/publicação dependem de CI verde, comparação sem divergência relativamente a `main` e validação posterior do GitHub Pages.

---

## 2026-09-10 — v75 `75-usability1` — Parte 1 da auditoria UX/UI

### Âmbito

Auditoria transversal do ecrã de bloqueio, navegação e páginas Início, Despesas, Mercado, Planeamento e Mais, com foco inicial em interação mobile, zoom acidental, alvos tácteis e estabilidade do cofre.

### Constatações

- `v75-stability.css` já impedia o auto-zoom de foco do Safari/iOS ao usar `16px` nos campos mobile;
- o meta viewport preservava corretamente a ampliação manual e não continha `user-scalable=no`/`maximum-scale=1`;
- faltava uma política transversal para o duplo toque em controlos;
- o cofre mobile beneficiava de reforço explícito de `100dvh`, safe areas e scroll controlado;
- a linguagem oficial de ícones continua a ser Lucide local via `ui-icons.js`, embora existam fallbacks históricos no template/base;
- a distribuição pública continua a ser gerada por `scripts/prepare-pages.cjs`, não pelo `index.html` isoladamente.

### Alterações

Criado `v75-usability.css` revisão `75-usability1`:

- `touch-action: manipulation` nos elementos interativos para reduzir zoom acidental por duplo toque;
- `font-size:16px` reforçado em inputs/selects/textareas mobile;
- alvos tácteis mínimos de 44 px em controlos compactos;
- 48 px em ações/filtros densos de Despesas e Mercado quando aplicável;
- cofre mobile com `100dvh`, safe areas, scroll controlado e cartão responsivo;
- navegação inferior mantém áreas de toque estáveis;
- `prefers-reduced-motion` preservado;
- pinch-to-zoom continua disponível.

### Distribuição e QA

- `scripts/prepare-pages.cjs` inclui `v75-usability.css?v=75-usability1` como última camada visual transversal;
- `sw.js` inclui o novo ativo e o cache foi revisionado com `usability1`;
- `tests/v75-stability.test.cjs` passou a verificar anti-zoom, acessibilidade do viewport, 16 px, alvos tácteis, bundle Pages e Service Worker;
- não houve alterações em `core.js`, `finance.js`, IndexedDB, PBKDF2, AES-GCM, PIN, sincronização, faturas, pagamentos, QR ou scanner.

Durante o QA, duas execuções detetaram incompatibilidades em testes que validavam a ordem textual da assinatura do cache. A correção preservou as assinaturas legadas e colocou `usability1` no final da revisão do cache. A execução seguinte ficou verde.

### Integração/publicação

- PR `#66` integrado por squash em `main`;
- commit público: `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`;
- CI da branch: run `34471692881` — sucesso;
- CI de `main`: run `34471773663` — sucesso;
- GitHub Pages do mesmo SHA: run `34471814790` — sucesso.

Validação física específica de `75-usability1` em iPhone/Safari/PWA permanece pendente.

---

## 2026-09-10 — v75 `75-startup2` + `75-catalog4` + `75-photo-loader3`

### Evidência

Validação física no iPhone/Safari mostrou:

- demora depois de introduzir o PIN;
- cartões do catálogo presos em carregamento/validação de fotografia;
- `1863 produtos indexados · 125 imagens validadas` no catálogo geral;
- `1229 SKUs indexados · 0 fotografias oficiais` na biblioteca dedicada Pingo Doce.

### Diagnóstico do PIN

O PIN correto concluía `unlockVault()`, mas o shell só era apresentado depois de `syncStartupGate()`. Num dispositivo já emparelhado, a verificação GitHub podia bloquear a abertura apesar de já existir uma cópia local cifrada confirmada.

### `75-startup2`

- PBKDF2 permanece em 250000 iterações;
- nenhum relaxamento de AES-GCM, PIN ou cofre;
- dispositivo com `pairedAt + lastRemoteSha`, token local, sync ativo e rede disponível abre imediatamente a cópia local confirmada;
- `syncNow('startup-background')` continua a verificação remota sem bloquear a UI;
- primeiro emparelhamento e estados não confirmados continuam a usar o gate original;
- proteção contra ecrã branco de `75-startup1` permanece.

### Diagnóstico das fotografias

A sonda real foi reforçada para aplicar também o validador usado no runtime. O run de diagnóstico `34444945747` confirmou:

- Cesta devolve Continente e Pingo Doce;
- reader responde para o origin GitHub Pages;
- Continente conhecido: `runtime-safe=true`;
- Pingo Doce `pid 739490`: `runtime-safe=true`.

Isto exclui uma rejeição universal do formato atual das fotografias Pingo Doce como causa do contador zero.

Foram confirmadas duas falhas de pipeline:

1. `75-photo-loader2` podia ficar visualmente em **Fotografia a validar…** sem estado terminal;
2. uma imagem Pingo Doce resolvida pelo loader era guardada na biblioteca partilhada, mas o registo correspondente da DB Pingo Doce não era imediatamente marcado como `ready`.

### `75-photo-loader3`

- prioridade visível sobe para 8 cartões e procura equilíbrio entre as duas lojas;
- 0–7 s: **A carregar fotografia…**;
- 7–12 s: **A validar fotografia…**;
- após 12 s: estado final estável **Sem fotografia**;
- retry automático só depois de 5 min, salvo atualização explícita/nova navegação;
- imagem Pingo Doce existente no cache partilhado ou resolvida com sucesso atualiza também `imageState='ready'` na base dedicada;
- métrica Pingo Doce é atualizada após reconciliação;
- o orçamento diário de imagens herdado é reposto uma vez ao entrar nesta revisão.

### `75-catalog4`

O resolvedor direto continua com timeout de 8 s e concorrência 2. Para cartões com `sourceUrl` oficial exata, uma tentativa sem resultado termina sem voltar ao bridge legado. Pesquisa livre sem `sourceUrl` mantém o bridge legado.

### Segurança

- host/path/PID permanecem validados;
- nenhum acesso novo a valores financeiros, faturas, pagamentos ou preços pelas camadas de imagem;
- a otimização do arranque consulta apenas estado de emparelhamento/sync já existente;
- PBKDF2, AES-GCM e política de conflitos permanecem inalterados.

### QA da branch

CI run `34445844039`: sucesso completo, incluindo sonda real, sintaxe, finanças, auditoria, isolamento/cofre, faturas/QR, Mercado/imagens, catálogo, Pingo Doce, loader, segurança, responsividade, viewport móvel, navegação, acessibilidade, sync e manifest.

A comparação posterior confirmou `fix/v75-pin-images-stability` e `main` idênticas no SHA `f85deed6d2fab5e1b0658ad74c25d323f621a19f`.

---

## 2026-09-10 — v75 `75-startup1`

- Service Worker passou a limitar navegação de rede a 4 s e usar `index.html` em cache em erro/timeout;
- criado `v75-startup-guard.js` para impedir superfície totalmente branca durante a barreira inicial;
- CI e Pages concluídos com sucesso;
- a validação física seguinte revelou separadamente a demora pós-PIN e a instabilidade das fotografias tratadas acima.

---

## 2026-09-09 — v75 `75-catalog3`

- renderer do catálogo deixou de destruir a grelha inteira durante atualização de fundo;
- cartões são reconciliados por `marketId|pid`;
- nós DOM e imagens carregadas são preservados;
- `cdc:market-photo-ready` passou a propagar fotografias resolvidas;
- correção direcionada ao flicker observado no iPhone.

## Histórico anterior

As revisões anteriores permanecem no histórico Git e em `release-manifest.json`. Continuam vigentes as decisões de `75-catalog2`, `75-photo-loader2`, `75-pd-photo1`, `75-image-library1`, `75-featured1`, `75-drawer2`, `75-layout1`, `75-stability1`, `75-header2` e baseline v74/v73 quando não substituídas explicitamente pelas revisões acima.
