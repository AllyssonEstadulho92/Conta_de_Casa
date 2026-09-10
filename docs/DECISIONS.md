# Decisões Técnicas — Conta de Casa

Atualizado: 10 de setembro de 2026

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
- Disponibilidade nunca pode ser obtida à custa de expor dados financeiros antes da barreira de segurança.

## D-046 — Destaques do Mercado em carrossel largo

Estado: aceite. `75-featured1` usa carrossel horizontal mobile, área estável de fotografia e fallback local.

## D-047 — Biblioteca geral por retalhista + PID

Estado: aceite. `75-image-library1` usa IndexedDB separada e chave `marketId|pid`; guarda metadados e URL oficial validado, nunca binários ou preços.

## D-048 — Catálogo visual progressivo não guarda preços

Estado: aceite. O índice local guarda SKUs reais e metadados; **Ver preço atual** reutiliza a pesquisa viva.

## D-049 — Biblioteca Pingo Doce dedicada sem duplicar estado financeiro

Estado: aceite. `75-pd-photo1` mantém apenas produtos Pingo Doce, PID/URL oficial e estados `pending|ready|missing`.

## D-050 — Feedback de carregamento de fotografia

Estado: substituída parcialmente por D-052. Skeleton/spinner isolado não resolvia a priorização real do pipeline.

## D-051 — Publicação exige CI da branch, CI de main e Pages

Estado: aceite. Fluxo obrigatório: CI verde da branch → integração fast-forward sem force → CI verde de `main` → GitHub Pages no SHA integrado → validação física quando relevante.

## D-052 — Separar validade oficial de transporte e priorizar cartões visíveis

Estado: aceite e publicada. `75-catalog2` elimina preflight visual duplicado e `75-photo-loader2` prioriza cartões visíveis sem tocar no estado financeiro.

## D-053 — Evidência em hardware prevalece sobre teste sintético

Estado: aceite. Defeitos Safari/PWA e de imagens só são encerrados depois de repetir no dispositivo real o cenário que os revelou.

## D-054 — Runtime2 publicado, eficácia dependente de revalidação física

Estado: aceite. A validação posterior revelou flicker distinto, tratado por D-055.

## D-055 — O catálogo não pode destruir cartões estáveis durante atualizações de fundo

Data: 9 de setembro de 2026 · Estado: aceite e publicada.

`75-catalog3` reconcilia cartões por `marketId|pid`, preserva o mesmo nó DOM/media, remove apenas chaves obsoletas e usa `cdc:market-photo-ready` para hidratação sem reconstruir a grelha. Não altera `core.js`, `finance.js`, PIN, cifragem ou sincronização.

## D-056 — O arranque nunca pode ficar visualmente sem estado seguro

Data: 10 de setembro de 2026 · Estado: aceite; implementação candidata validada em CI.

### Factos observáveis

A captura física no iPhone/Safari mostrou uma página totalmente branca com a barra de progresso do browser ainda ativa. A captura não contém informação suficiente para atribuir o episódio a uma única função.

### Riscos confirmados no código

1. O Service Worker tratava navegações com `fetch(event.request).catch(...)` sem timeout. Se a promessa ficasse pendente, o fallback de cache não era atingido.
2. O fluxo de entrada pode ocultar simultaneamente `#vaultScreen` e `#app` enquanto aguarda a barreira inicial de sincronização. Isto preserva a confidencialidade, mas cria uma superfície branca durante a espera.

### Decisão

1. Criar a revisão `75-startup1`.
2. Manter a barreira inicial de sincronização e a regra de não mostrar dados financeiros antes da sua resolução.
3. Adicionar `v75-startup-guard.js` como camada exclusivamente visual.
4. Quando `html.app-active` estiver ativo e cofre+shell estiverem ocultos, mostrar temporariamente o cofre com `aria-busy="true"` e mensagem de preparação.
5. Ocultar novamente o cofre assim que o shell da aplicação ficar disponível.
6. Limitar a navegação de rede do Service Worker a 4 segundos com `AbortController`.
7. Em timeout/erro de navegação, usar o `index.html` já instalado em Cache Storage.
8. Atualizar a cópia de `index.html` em cache quando a rede responde com sucesso.
9. Se não existir rede nem cache, devolver 503 legível em vez de espera indefinida.
10. Alterar o identificador do cache para terminar em `startup1`.
11. Adicionar teste de regressão específico e incluí-lo no CI.
12. Não pedir ao utilizador para limpar dados do Safari como passo de recuperação, porque isso pode apagar IndexedDB/cofre local.

### Fundamento

A disponibilidade do shell e a confidencialidade do cofre são requisitos simultâneos. Um estado de espera deve ser visível e acessível sem antecipar dados financeiros. O fallback de navegação deve ser temporalmente limitado porque um `fetch()` pendente não é equivalente a uma falha e, por isso, não ativa `.catch()`.

### Critérios de aceitação

- nenhuma navegação controlada pelo Service Worker aguarda rede indefinidamente;
- cache de `index.html` é usado depois do timeout/erro;
- durante a barreira de arranque existe sempre uma superfície segura visível;
- `v75-startup-guard.js` não acede a `appState`, IndexedDB, montantes ou sincronização;
- regressões financeiras, segurança, Mercado, responsividade, acessibilidade e sync permanecem verdes;
- confirmação final no mesmo iPhone/Safari/PWA.

### Evidência atual

Commit funcional: `cd229d83c3d47f54d7f8990a76f2f29acb372f47`.
CI da branch run `34440532734`: sucesso completo. Integração e Pages ainda pendentes nesta etapa.
