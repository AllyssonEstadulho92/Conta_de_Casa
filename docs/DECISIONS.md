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

## D-048 — Catálogo visual progressivo não guarda preços

Estado: aceite.

O índice local guarda SKUs reais, nome, embalagem, categoria, URL oficial e timestamps; **Ver preço atual** reutiliza a pesquisa viva. A cobertura é progressiva e não é declarada como 100% sem fonte exaustiva.

## D-049 — Biblioteca Pingo Doce dedicada sem duplicar estado financeiro

Estado: aceite.

`75-pd-photo1` usa IndexedDB própria, apenas produtos Pingo Doce com PID/URL oficial coerentes e estados `pending|ready|missing`. Não guarda preços, quantidades, faturas, cofre ou credenciais.

## D-050 — Feedback de carregamento de fotografia

Estado: substituída parcialmente por D-052.

O primeiro loader introduziu skeleton/spinner, mas a validação física mostrou que feedback visual sem priorização real não resolvia o pipeline.

## D-051 — Publicação exige CI da branch, CI de main e Pages

Estado: aceite.

Fluxo obrigatório: CI verde da branch → integração fast-forward em `main` sem force → CI verde de `main` → GitHub Pages concluído no SHA integrado → validação física quando relevante.

## D-052 — Separar validade oficial de transporte e priorizar cartões visíveis

Estado: aceite e publicada na baseline anterior.

`75-catalog2` elimina o segundo preflight visual bloqueante depois de a referência já ter sido validada por página oficial + host/path + PID. `75-photo-loader2` prioriza até 6 cartões, testa disponibilidade no `<img>`, expurga URL quebrado, limita polling/retry e preserva a separação do estado financeiro.

## D-053 — Evidência em hardware prevalece sobre teste sintético

Estado: aceite.

Para imagens remotas, testes unitários e CI são necessários mas não suficientes. O encerramento exige repetir no dispositivo/browser real o cenário que revelou o problema.

## D-054 — Runtime2 publicado, eficácia dependente de revalidação física

Estado: aceite.

`75-catalog2` + `75-photo-loader2` foi publicado e passou CI/Pages. A validação posterior revelou um defeito diferente: flicker causado pela estratégia de rerender do catálogo.

## D-055 — O catálogo não pode destruir cartões estáveis durante atualizações de fundo

Data: 9 de setembro de 2026 · Estado: aceite na branch de correção.

### Factos observados

A nova captura em hardware mostrou a zona da fotografia a piscar. A inspeção do código confirmou que não era apenas uma animação CSS:

1. `scheduleImageWarm()` chamava `renderProducts()` depois de resolver uma imagem;
2. `renderProducts()` começava por `grid.replaceChildren()`;
3. a grelha inteira era removida antes da reconstrução assíncrona dos cartões;
4. os `<img>` existentes eram destruídos e recriados, reiniciando apresentação/carregamento no browser.

### Decisão

1. Criar revisão de renderer/distribuição `75-catalog3`.
2. Manter o resolver oficial interno `75-catalog2`; o defeito não exige alterar validação de origem/PID.
3. Reconciliar os cartões pela identidade canónica `marketId|pid`.
4. Reutilizar o mesmo nó DOM quando a chave continua presente.
5. Atualizar texto e metadados sem substituir `.market-visual-product-media`.
6. Remover apenas cartões cuja chave deixou de fazer parte do resultado atual.
7. Criar novos cartões apenas para novas chaves.
8. Retirar `renderProducts()` da rotina periódica de aquecimento de imagem.
9. Depois de uma imagem válida ser persistida em background, emitir `cdc:market-photo-ready` e deixar `75-photo-loader2` hidratar o cartão existente.
10. Atualizar revisão de distribuição/cache para `catalog3` e introduzir teste que falha se o caminho periódico voltar a reconstruir a grelha.
11. Não tocar em `core.js`, `finance.js`, pagamentos, faturas, PIN, cifragem ou sincronização.

### Fundamento

A identidade do produto já é estável (`marketId|pid`). Destruir um componente visual que representa a mesma identidade é trabalho desnecessário, causa flicker e perde estado de apresentação. A reconciliação incremental mantém continuidade visual e reduz alterações do DOM sem mudar a lógica de negócio.

### Critérios de aceitação

- ausência de `grid.replaceChildren()` vazio no caminho normal de renderização com produtos;
- aquecimento periódico de fotografia não chama `renderProducts()`;
- fotografia pronta é propagada por evento para o loader;
- regressões financeiras, segurança, Mercado, responsividade, acessibilidade e sync permanecem verdes;
- confirmação final no iPhone/Safari/PWA sem flicker.

### Evidência de QA

A branch `fix/v75-market-photo-flicker` passou CI completo no SHA `501c21dca60cffc32489768238c5f308e1785e34`. Um CI anterior falhou apenas por expectativa de teste desatualizada do nome de cache (`catalog2`), corrigida para `catalog3` antes do CI verde.
