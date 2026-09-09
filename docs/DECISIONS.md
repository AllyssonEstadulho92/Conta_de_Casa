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

### Problema

O Mercado precisava apresentar produtos por categorias antes de uma pesquisa manual e acumular fotografias reais, mas não existe no projeto uma fonte oficial exaustiva/autorizada que permita declarar uma cópia integral instantânea dos catálogos.

### Decisão

1. `75-catalog1` mantém um índice local separado de SKUs reais.
2. A identidade continua `marketId|pid`.
3. O catálogo guarda nome, embalagem, categoria, URL oficial e timestamps, mas não persiste preço.
4. **Ver preço atual** reutiliza a pesquisa viva existente.
5. A descoberta é limitada por sessão/dia e suspensa offline, em página oculta ou com `Save-Data`.
6. Fotografias são resolvidas pela página oficial exata quando possível e persistidas apenas depois da validação existente.
7. “Catálogo completo” é objetivo de cobertura progressiva, nunca afirmação automática de 100%.

## D-049 — Biblioteca Pingo Doce dedicada aumenta cobertura sem duplicar o estado financeiro

Data: 9 de setembro de 2026 · Estado: aceite.

### Problema

A biblioteca geral só cresce com os SKUs que o fluxo normal encontra. Para o Pingo Doce, o utilizador pediu uma cobertura muito maior de fotografias por produto.

### Decisão

1. Criar `pingo-doce-photo-library.js` com revisão `75-pd-photo1`.
2. Usar IndexedDB própria `conta-de-casa-pingo-doce-photo-library`.
3. Descobrir exclusivamente através de `search_products` com `stores:['pingodoce']`.
4. Só aceitar produto com PID e URL oficial `pingodoce.pt/home/produtos/...-<pid>.html` coerentes.
5. Manter estados `pending`, `ready` e `missing` no inventário dedicado.
6. Resolver fotografia através de `CDCOfficialMarketImages.resolve()` e persistir o resultado na biblioteca geral `75-image-library1`.
7. Não guardar binários, preços, quantidades, faturas ou dados do cofre na base Pingo Doce.
8. Usar mais de 200 termos distribuídos por 15 famílias de produto para aumentar recall sem depender de uma lista fixa de SKUs.
9. Limitar a rede: 24 pesquisas/sessão, 72/dia, 30 tentativas de fotografia/sessão e 120/dia.
10. Suspender trabalho automático offline, com `Save-Data` ou página oculta.
11. Não afirmar cobertura integral do Pingo Doce enquanto não existir fonte exaustiva que permita provar isso.

## D-050 — Carregamento de fotografia deve ter feedback imediato e janela curta

Data: 9 de setembro de 2026 · Estado: aceite.

### Problema

Quando uma fotografia ainda não está na biblioteca, o cartão podia parecer vazio/fallback durante vários segundos, dando a impressão de erro mesmo quando a fotografia estava a ser resolvida.

### Decisão

1. Criar `market-photo-loader.css/js` com revisão `75-photo-loader1`.
2. Mostrar imediatamente skeleton/shimmer, spinner e **A carregar fotografia…** em cartões ainda sem imagem.
3. Consultar primeiro a biblioteca persistente; imagens já em cache devem surgir sem espera desnecessária.
4. Nos cartões visíveis, usar `loading='eager'` para a imagem já resolvida.
5. Ao primeiro acesso ao Mercado, iniciar um aquecimento limitado de Pingo Doce para reduzir latência percebida.
6. Reavaliar cartões durante uma janela curta: 850 ms entre verificações, máximo 18 ciclos.
7. O loader não faz crawling nem chamadas externas próprias; apenas coordena a biblioteca e atualiza a apresentação.
8. `prefers-reduced-motion` remove animações.
9. A camada está proibida de aceder a `appState`, `saveState()`, `commit()` ou montantes.
10. O loader não pode alterar a geometria do cartão nem bloquear scroll/navegação.

## D-051 — Publicação exige CI da branch, CI de main e Pages

Estado: aceite.

Nenhuma revisão de Mercado é considerada publicada apenas porque existe numa branch. O fluxo é: CI verde da branch → fast-forward para `main` → CI verde de `main` → GitHub Pages concluído no SHA integrado → validação física quando relevante.