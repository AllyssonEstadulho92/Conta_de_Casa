# Decisões Técnicas — Conta de Casa

Atualizado: 10 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## Decisões estruturais vigentes

- Estado financeiro local-first separado das camadas visuais e de catálogo.
- Valores monetários em cêntimos e `STATE_VERSION = 5`.
- Cofre PBKDF2-SHA-256 + AES-GCM; `PBKDF2_ITERATIONS = 250000` não é reduzido para melhorar desempenho aparente.
- Fotografias não são prova de preço nem de transação.
- `marketId|pid` é a identidade canónica de fotografia/SKU.
- Preço pesquisado é estimativa; valor efetivamente confirmado continua separado.
- Drawer móvel e sidebar permanecem à direita; cabeçalho móvel minimalista.
- Falha de fotografia nunca remove o artigo.
- Releases públicas relevantes usam revisão/cache invalidável.
- A ampliação manual do browser permanece disponível; correções de zoom acidental não podem usar `user-scalable=no` ou `maximum-scale=1`.
- A UI móvel não deve esconder funcionalidades canónicas que existam e estejam operacionais no renderer principal sem uma substituição funcional equivalente.

## D-046 a D-055 — decisões preservadas

Mantêm-se aceites as decisões anteriores sobre: carrossel de destaques; biblioteca geral por retalhista+PID; catálogo progressivo sem persistir preços; biblioteca Pingo Doce isolada; publicação condicionada a CI/Pages; separação entre validade oficial e transporte; prevalência de evidência em hardware; renderer incremental sem destruir cartões estáveis; e propagação `cdc:market-photo-ready`.

## D-056 — O PIN não deve esperar pela rede num dispositivo já emparelhado

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Decisão

1. Manter PBKDF2 em 250000 iterações.
2. Se o dispositivo tem `pairedAt` + `lastRemoteSha`, sincronização ativa, token local e rede disponível, a última cópia local cifrada confirmada pode ser mostrada imediatamente após o PIN.
3. A verificação GitHub inicia depois com `syncNow('startup-background')`.
4. Primeiro emparelhamento e estados sem confirmação continuam a usar o gate original.
5. A política de conflitos e a cifragem remota não são alteradas.

## D-057 — Um carregamento de fotografia deve terminar num estado visual estável

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Decisão

1. `75-photo-loader3` mantém carregamento até 7 s.
2. Entre 7 e 12 s apresenta validação.
3. Aos 12 s sem resultado termina em `Sem fotografia`.
4. O estado final usa cooldown de 5 min antes de novo retry automático.
5. Atualização explícita/nova navegação pode iniciar nova tentativa.
6. A inexistência temporária de fotografia não elimina o SKU.

## D-058 — Uma sourceUrl oficial exata não deve disparar uma segunda resolução redundante

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Decisão

- Distribuição `75-catalog4` termina a tentativa quando a resolução direta de uma `sourceUrl` exata não encontra imagem válida.
- Pesquisa livre sem `sourceUrl` continua a usar o bridge legado.
- Host, path e PID permanecem estritos.

## D-059 — O contador Pingo Doce deve refletir uma imagem já comprovada pela biblioteca partilhada

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Decisão

Quando `75-photo-loader3` encontra no cache ou resolve uma fotografia Pingo Doce válida, atualiza também o mesmo `marketId|pid` na DB dedicada para `imageState='ready'` e refresca a métrica.

## D-060 — Impedir zoom acidental sem bloquear a acessibilidade

Data: 10 de setembro de 2026. Estado: integrado em `main` como `75-usability1`.

### Decisão

1. Aplicar `touch-action: manipulation` a controlos interativos para reduzir zoom acidental por duplo toque.
2. Reforçar 16 px em inputs/selects/textareas no breakpoint mobile.
3. Manter alvos tácteis com referência mínima de 44 px e 48 px em controlos densos quando aplicável.
4. Reforçar o cofre com `100dvh`, safe areas e scroll controlado.
5. Não adicionar `user-scalable=no` nem `maximum-scale=1`; pinch-to-zoom continua disponível.
6. Carregar `v75-usability.css` como camada final de interação.

## D-061 — Despesas no móvel deve usar a vista funcional canónica

Data: 10 de setembro de 2026. Estado: aceite na branch `fix/v75-pages-part2`.

### Factos

- `renderBills()` e `filterBills()` já fornecem pesquisa, estado, categoria, intervalo de datas, ordenação, resumo de resultados, cartões móveis, vencimentos, progresso e ações.
- A composição móvel v74 escondia `section-tabs`, `bill-filter-grid`, `billSummary` e `billsList` e apresentava `cdcExpenseFeed` simplificado.
- O feed simplificado não expunha no móvel a mesma capacidade funcional dos filtros e cartões canónicos.

### Decisão

1. Criar `v75-pages.css` revisão `75-pages1` como camada visual isolada para Início, Despesas e Planeamento.
2. Em Despesas mobile, voltar a apresentar Lista/Calendário, filtros, resumo e `billsList` canónico.
3. Ocultar `cdcExpenseFeed`/`cdcExpenseTabs` como vista principal mobile para evitar duas representações concorrentes do mesmo domínio.
4. Manter o FAB de nova despesa e os handlers existentes.
5. Não alterar `render.js`, `filterBills()`, cálculos, pagamentos ou estado.
6. Em Planeamento, empilhar os painéis funcionais em mobile e melhorar hierarquia sem recalcular valores.
7. Em Início, melhorar hierarquia e feedback sem reintroduzir as grelhas legadas duplicadas.
8. Carregar `v75-pages.css` antes de `v75-usability.css` para preservar a política final de interação/anti-zoom.

### Fundamento

Uma camada de apresentação não deve esconder capacidades funcionais já implementadas no renderer principal se não oferecer equivalência. Reexpor a vista canónica reduz divergência entre desktop e mobile, diminui duplicação de lógica e preserva filtros e ações já testados.

### Segurança

`75-pages1` é CSS puro. Não lê/escreve estado, não altera PIN/criptografia, não acede à rede e não introduz dependências externas.

## Evidência técnica

A Parte 2 parte de `main` no SHA `e16c35c3a4e52dead57deccdde9630a89a4af998`. A integração só deve ocorrer após CI verde, comparação sem divergência e validação posterior do GitHub Pages.
