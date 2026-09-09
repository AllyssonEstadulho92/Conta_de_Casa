# Decisões Técnicas — Conta de Casa

Atualizado: 9 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## Decisões estruturais vigentes

- O estado financeiro continua local-first e separado das camadas visuais/de catálogo.
- Valores monetários são guardados em cêntimos; `STATE_VERSION = 5` permanece estável.
- Fotografias nunca são prova de preço ou transação.
- Preço pesquisado é estimativa; `actualCents` representa valor confirmado/pago.
- GTIN/PID identifica o artigo, não prova o preço.
- Mercado não pode reescrever cofre, cálculos ou sincronização por motivos visuais.
- Drawer móvel e sidebar permanecem no lado direito.
- Cabeçalho móvel permanece minimalista: hambúrguer+título à esquerda, notificações à direita.
- A aplicação usa Lucide local como sistema de ícones.
- Falhas de imagem têm fallback visual e nunca removem o artigo.
- Releases públicas relevantes usam revisão própria e cache invalidável.

## D-046 — Destaques do Mercado em carrossel largo

Estado: aceite.

`75-featured1` substitui a grelha mobile apertada por carrossel horizontal, reserva área estável para a fotografia, limita o nome a duas linhas e usa fallback local quando a fotografia não existe.

## D-047 — Biblioteca geral por retalhista + PID

Estado: aceite.

`75-image-library1` usa IndexedDB separada e chave `marketId|pid`. Guarda apenas metadados e URL oficial validado. Não copia binários para o GitHub e não usa o nome textual como identidade suficiente da fotografia.

## D-048 — Catálogo visual é progressivo e não guarda preços

Data: 9 de setembro de 2026 · Estado: aceite.

1. `75-catalog1` mantém um índice local separado de SKUs reais.
2. A identidade continua `marketId|pid`.
3. O catálogo guarda nome, embalagem, categoria, URL oficial e timestamps, mas não persiste preço.
4. **Ver preço atual** reutiliza a pesquisa viva existente.
5. A descoberta é limitada por sessão/dia e suspensa offline, em página oculta ou com `Save-Data`.
6. Fotografias são resolvidas pela página oficial exata quando possível e persistidas apenas depois da validação existente.
7. “Catálogo completo” é objetivo de cobertura progressiva, nunca afirmação automática de 100%.

## D-049 — Biblioteca Pingo Doce dedicada aumenta cobertura sem duplicar estado financeiro

Data: 9 de setembro de 2026 · Estado: aceite.

1. `pingo-doce-photo-library.js` usa revisão `75-pd-photo1` e IndexedDB própria.
2. Descoberta é feita exclusivamente por `search_products` com `stores:['pingodoce']`.
3. Só entra produto com PID e URL oficial `pingodoce.pt/home/produtos/...-<pid>.html` coerentes.
4. O inventário mantém `pending|ready|missing`.
5. A fotografia é persistida na biblioteca geral `75-image-library1`.
6. A base dedicada não guarda preços, quantidades, faturas, cofre ou credenciais.
7. Mais de 200 termos em 15 famílias aumentam recall.
8. Rede permanece limitada e suspensa offline/oculta/Save-Data.
9. Não se declara cobertura integral sem fonte exaustiva que a prove.

## D-050 — Carregamento de fotografia deve ter feedback imediato

Data: 9 de setembro de 2026 · Estado: substituída parcialmente por D-052.

`75-photo-loader1` introduziu skeleton, spinner, texto **A carregar fotografia…**, consulta de cache e janela curta de polling. A validação física mostrou que feedback sem priorização real não era suficiente: a UI podia continuar a indicar carregamento enquanto a fila de resolução avançava lentamente por outros SKUs.

## D-051 — Publicação exige CI da branch, CI de main e Pages

Estado: aceite.

Fluxo obrigatório: CI verde da branch → fast-forward para `main` sem force → CI verde de `main` → GitHub Pages concluído no SHA integrado → validação física quando relevante.

## D-052 — Separar validade oficial de transporte e priorizar cartões visíveis

Data: 9 de setembro de 2026 · Estado: aceite para validação.

### Factos que motivaram a decisão

A validação real no iPhone mostrou `285 SKUs indexados · 0 fotografias oficiais` na Biblioteca Pingo Doce e cartões presos em **A carregar fotografia…**. Em paralelo, a sonda de CI conseguia obter, para um SKU Pingo Doce conhecido, resposta do reader e URL de imagem com PID exato.

O runtime anterior fazia ainda um segundo `new Image()` com timeout de 10 s antes de permitir persistência e processava imagens Pingo Doce em fila lenta. O orçamento diário de tentativas também era persistido, pelo que falhas anteriores podiam bloquear novas tentativas até ao dia seguinte.

### Decisão

1. Criar revisão de distribuição/resolvedor `75-catalog2`.
2. Depois de validar **página oficial + host/path de imagem + PID exato**, não executar um segundo `new Image()` bloqueante no resolvedor direto.
3. Tratar disponibilidade de transporte no componente que realmente apresenta a imagem.
4. Se `<img>` falhar no browser, remover a referência da biblioteca com `forget()` e manter fallback/retry.
5. Criar `75-photo-loader2` para priorizar até 6 cartões visíveis, em vez de depender somente da fila de fundo.
6. Obter o registo do cartão através da API pública `CDCMarketVisualCatalog.listCategory()`, preservando encapsulamento da IndexedDB.
7. Para cartão visível sem cache, chamar imediatamente `CDCOfficialMarketImages.resolve()` com `marketId|pid|sourceUrl` exatos e persistir apenas resultado que continue a passar pelo validador oficial.
8. Reavaliar UI a cada 500 ms por no máximo 24 ciclos; depois de 12 s mudar para **Fotografia a validar…**, sem spinner infinito.
9. Aplicar cooldown de 30 s por SKU para evitar repetição agressiva.
10. Libertar uma única vez o contador `imagesToday` herdado do runtime antigo quando `photoRuntimeRevision` ainda não for `75-photo-loader2`, para que um orçamento esgotado por falsos negativos não bloqueie a correção até ao dia seguinte.
11. Esta recuperação de orçamento só pode tocar na store `meta` da IndexedDB Pingo Doce; não pode alterar produtos, preços, faturas ou estado financeiro.
12. O loader continua proibido de fazer `fetch()` direto; rede permanece centralizada nos resolvers existentes.

### Consequências

- melhora a latência dos produtos que o utilizador está efetivamente a ver;
- reduz falso negativo de Safari causado por dupla validação de transporte;
- mantém validação estrita de identidade/origem;
- uma imagem remota que deixou de existir não fica permanentemente presa na cache;
- nenhuma promessa de 100% de cobertura ou tempo fixo de carregamento é feita, porque disponibilidade do retalhista/rede continua externa.

## D-053 — Evidência em hardware prevalece sobre teste sintético de loader

Data: 9 de setembro de 2026 · Estado: aceite.

Testes unitários que confirmam presença de spinner/cache não são prova suficiente de que fotografias reais chegam ao estado `ready` no Safari. Para alterações de imagens remotas, a conclusão só é fechada depois de:

1. probe de fonte em CI;
2. testes unitários/regressão;
3. deploy no SHA testado;
4. validação física no iPhone/Safari/PWA com contador e cartões reais.
