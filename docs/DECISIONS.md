# Decisões Técnicas — Conta de Casa

Atualizado: 9 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## Decisões estruturais vigentes

- Estado financeiro local-first e separado das camadas visuais/de catálogo.
- Valores monetários em cêntimos; `STATE_VERSION = 5` permanece estável.
- Fotografias nunca são prova de preço ou transação.
- Preço pesquisado é estimativa; `actualCents` representa valor confirmado/pago.
- GTIN/PID identifica o artigo, não prova o preço.
- Mercado não pode reescrever cofre, cálculos ou sincronização por motivos visuais.
- Drawer móvel e sidebar permanecem no lado direito.
- Cabeçalho móvel permanece minimalista.
- Falhas de imagem têm fallback visual e nunca removem o artigo.
- Releases públicas relevantes usam revisão própria e cache invalidável.

## D-046 — Destaques do Mercado em carrossel largo

Estado: aceite. `75-featured1` usa carrossel horizontal no telemóvel, reserva área estável para fotografia e mantém fallback local.

## D-047 — Biblioteca geral por retalhista + PID

Estado: aceite. `75-image-library1` usa IndexedDB separada e chave `marketId|pid`; guarda metadados e URL oficial validado, não binários.

## D-048 — Catálogo visual é progressivo e não guarda preços

Estado: aceite. O catálogo guarda SKU, categoria, página oficial e timestamps. **Ver preço atual** volta à fonte viva.

## D-049 — Biblioteca Pingo Doce dedicada

Estado: aceite. `75-pd-photo1` mantém inventário `pending|ready|missing` por `pingo-doce|pid`, com descoberta limitada e sem dados financeiros.

## D-050 — Feedback imediato de carregamento

Estado: substituída parcialmente. `75-photo-loader1` introduziu skeleton/spinner, mas hardware real mostrou que feedback visual sem priorização efetiva não resolvia latência.

## D-051 — Publicação exige CI e Pages

Estado: aceite. Fluxo obrigatório: CI verde da branch → fast-forward para `main` sem force → CI verde de `main` → Pages no mesmo SHA → validação física quando relevante.

## D-052 — Separar validade oficial de transporte

Estado: aceite. `75-catalog2` valida página/host/path/PID e deixa o `<img>` comprovar transporte real; URL quebrado é expurgado.

## D-053 — Evidência em hardware prevalece sobre teste sintético

Estado: aceite. Testes unitários não provam estabilidade do WebKit; alterações de imagens remotas exigem validação física no iPhone/Safari/PWA.

## D-054 — Loader do Mercado deve ser limitado pelo viewport

Data: 9 de setembro de 2026 · Estado: aceite para publicação.

### Factos

Depois de `75-photo-loader2`, o iPhone/Safari apresentou **“Um problema ocorreu repetidamente”** em `/#market`. Auditoria encontrou que o loader hidratava os primeiros 18 cartões do DOM, usava até 6 resoluções prioritárias, polling de 500 ms por 24 ciclos, observava toda a `document.body` e ainda disparava `warmPending()` + `syncNow()` na entrada do Mercado.

Não existe perfil de memória WebKit, portanto não se atribui o crash a um único ponto. A causa provável é pressão combinada de DOM, imagens, polling, observers e resolução concorrente.

### Decisão

`75-photo-loader3`:

1. usa `getBoundingClientRect()` para selecionar apenas cartões realmente visíveis;
2. limita prioridade a 2 cartões em mobile e 4 em desktop;
3. remove hidratação eager dos primeiros 18 cartões;
4. processa o pequeno conjunto prioritário sequencialmente;
5. reduz polling para 1200 ms e 10 ciclos;
6. observa apenas `#page-market` e alterações relevantes;
7. coalesca scans com `requestAnimationFrame`;
8. deixa a biblioteca Pingo Doce usar o scheduler próprio, sem `warmPending()+syncNow()` automático na entrada;
9. põe URL quebrado em quarentena local de 30 s e remove-o da biblioteca antes de nova tentativa;
10. não toca no estado financeiro.

## D-055 — “Biblioteca Pingo Doce” precisa de uma vista abrível independente da sincronização

Data: 9 de setembro de 2026 · Estado: aceite para publicação.

### Facto confirmado

O componente existente chamado **Biblioteca Pingo Doce** não tinha qualquer ação para abrir uma biblioteca. O único botão era **Atualizar biblioteca**, cujo handler executava sincronização de rede e podia permanecer ocupado durante chamadas externas. Portanto, “carrega e não abre” era coerente com o código: não existia vista de abertura.

### Decisão

Criar `75-pd-view1` como camada apenas de leitura/apresentação:

- botão **Abrir biblioteca** separado de **Atualizar**;
- abertura imediata a partir da IndexedDB local, sem `fetch()`;
- painel/dialog acessível, ecrã completo no mobile;
- paginação de 12 produtos por vez;
- pesquisa local por nome/PID;
- filtros Todos / Com fotografia / Pendentes / Sem fotografia;
- imagens apenas da `75-image-library1`, com `loading='lazy'`;
- nenhum resolvedor de rede é disparado ao abrir;
- nenhum acesso a preços, faturas, PIN, cofre, tokens ou estado financeiro.

Esta separação impede que o utilizador confunda “abrir” com “sincronizar” e reduz carga no Safari.
