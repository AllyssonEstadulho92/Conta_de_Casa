# Changelog Técnico — Conta de Casa

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

O resolvedor direto continua com timeout de 8 s e concorrência 2. Para cartões com `sourceUrl` oficial exata, uma tentativa sem resultado termina sem voltar ao bridge legado. Antes, o fallback podia repetir pesquisa Cesta + leitura da página + preflight, aumentando latência e concorrência. Pesquisa livre sem `sourceUrl` mantém o bridge legado.

### Segurança

- host/path/PID permanecem validados;
- nenhum acesso novo a valores financeiros, faturas, pagamentos ou preços pelas camadas de imagem;
- a otimização do arranque consulta apenas estado de emparelhamento/sync já existente;
- PBKDF2, AES-GCM e política de conflitos permanecem inalterados.

### QA da branch

CI run `34445844039`: sucesso completo, incluindo sonda real, sintaxe, finanças, auditoria, isolamento/cofre, faturas/QR, Mercado/imagens, catálogo, Pingo Doce, loader, segurança, responsividade, viewport móvel, navegação, acessibilidade, sync e manifest.

Publicação ainda pendente no momento deste registo: reconfirmar CI após documentação, exigir `behind 0`, fast-forward de `main`, CI de `main`, Pages e validação física.

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
