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

`75-photo-loader1` introduziu skeleton, spinner, texto **A carregar fotografia…**, consulta de cache e janela curta de polling. A validação física mostrou que feedback sem priorização real não era suficiente.

## D-051 — Publicação exige CI da branch, CI de main e Pages

Estado: aceite.

Fluxo obrigatório: CI verde da branch → fast-forward para `main` sem force → CI verde de `main` → GitHub Pages concluído no SHA integrado → validação física quando relevante.

## D-052 — Separar validade oficial de transporte e priorizar cartões visíveis

Data: 9 de setembro de 2026 · Estado: aceite e publicada.

1. `75-catalog2` mantém validação de página oficial + host/path de imagem + PID exato.
2. O segundo preflight visual bloqueante foi removido do resolvedor.
3. Disponibilidade real é tratada no `<img>` que apresenta a fotografia.
4. Erro de imagem remove a referência com `forget()` sem apagar o produto.
5. `75-photo-loader2` introduziu prioridade de cartões visíveis.
6. `CDCMarketVisualCatalog.listCategory()` é a API pública de leitura dos registos.
7. O loader permanece sem `fetch()` próprio e sem estado financeiro.

## D-053 — Evidência em hardware prevalece sobre teste sintético de loader

Data: 9 de setembro de 2026 · Estado: aceite.

Testes unitários não são prova suficiente de estabilidade ou carregamento real no Safari. Para alterações de imagens remotas, a conclusão exige probe de fonte, CI, deploy no SHA testado e validação física no iPhone/Safari/PWA.

## D-054 — Runtime2 publicado, eficácia depende de revalidação física

Data: 9 de setembro de 2026 · Estado: aceite.

`75-catalog2` + `75-photo-loader2` passou CI e Pages. A publicação técnica ficou concluída, mas a eficácia física permaneceu pendente.

## D-055 — Estabilidade do Safari tem prioridade sobre throughput de fotografias

Data: 9 de setembro de 2026 · Estado: aceite para validação.

### Factos

Após a publicação de `75-photo-loader2`, o iPhone/Safari apresentou a mensagem nativa **“Um problema ocorreu repetidamente”** ao abrir `#market`.

Não há crash log de WebKit disponível, portanto a exceção interna exata não pode ser afirmada.

A inspeção do runtime encontrou, contudo, estes riscos concretos:

1. `MutationObserver` em `document.body` com `subtree:true`;
2. scans não coalescidos por mutações de DOM;
3. hidratação e resolução assíncronas sem exclusão mútua;
4. até 18 hidratações por passagem e 6 resoluções prioritárias;
5. polling de 500 ms/24 ciclos;
6. sincronização Pingo Doce iniciada em paralelo no primeiro acesso.

### Decisão

Criar `75-photo-loader3` com os seguintes limites:

1. observar apenas `#page-market`;
2. ignorar mutações geradas pelo próprio loader na media/status;
3. coalescer scans com `scanQueued`, `scanRunning` e `scanPending`;
4. permitir uma única operação global de hidratação (`refreshPromise`) e uma de resolução (`warmPromise`);
5. limitar hidratação a 8 cartões;
6. limitar prioridade a 4 cartões processados sequencialmente;
7. reduzir polling para 1 s/12 ciclos;
8. adiar a sincronização Pingo Doce 5 s/idle e usar 1 seed;
9. deixar de chamar `warmPending()` na entrada do Mercado;
10. manter cooldown de 30 s e estado **Fotografia a validar…** aos 12 s;
11. manter validação estrita por retalhista/PID e isolamento financeiro.

### Consequências

- menor pressão de CPU, DOM, IndexedDB e rede no iPhone;
- menor probabilidade de tarefas assíncronas sobrepostas;
- potencialmente menos fotografias resolvidas por unidade de tempo, deliberadamente;
- estabilidade do ecrã Mercado torna-se critério P0 antes de aumentar novamente o throughput;
- qualquer aumento futuro de concorrência exige validação física no iPhone antes de publicação.
