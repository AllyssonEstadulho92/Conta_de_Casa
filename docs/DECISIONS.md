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

## D-046 a D-055 — decisões preservadas

Mantêm-se aceites as decisões anteriores sobre: carrossel de destaques; biblioteca geral por retalhista+PID; catálogo progressivo sem persistir preços; biblioteca Pingo Doce isolada; publicação condicionada a CI/Pages; separação entre validade oficial e transporte; prevalência de evidência em hardware; renderer incremental sem destruir cartões estáveis; e propagação `cdc:market-photo-ready`.

## D-056 — O PIN não deve esperar pela rede num dispositivo já emparelhado

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Facto

O fluxo `unlockVault() → enterApp() → syncStartupGate()` fazia a aplicação esperar pela sincronização GitHub depois de o PIN já ter decifrado corretamente o cofre local. O gate remoto tinha timeout próprio, pelo que a demora percebida pelo utilizador podia ser atribuída ao PIN embora estivesse a ocorrer depois da operação criptográfica local.

### Decisão

1. Manter PBKDF2 em 250000 iterações e não enfraquecer a derivação da chave.
2. Se o dispositivo tem `pairedAt` + `lastRemoteSha`, sincronização ativa, token local e rede disponível, a última cópia local cifrada confirmada pode ser mostrada imediatamente após o PIN.
3. A verificação GitHub inicia logo a seguir com `syncNow('startup-background')`.
4. Primeiro emparelhamento e estados sem confirmação continuam a usar o gate original.
5. A política de conflitos e a cifragem remota não são alteradas.

### Fundamento

A rede não acrescenta autenticação ao PIN já validado localmente. Num dispositivo previamente emparelhado, bloquear toda a UI até uma chamada remota terminar degrada disponibilidade sem aumentar a força criptográfica.

## D-057 — Um carregamento de fotografia deve terminar num estado visual estável

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Facto

`75-photo-loader2` mudava de “A carregar fotografia…” para “Fotografia a validar…”, mas não definia um fim visual para a tentativa.

### Decisão

1. `75-photo-loader3` mantém estado de carregamento até 7 s.
2. Entre 7 e 12 s apresenta validação.
3. Aos 12 s sem resultado termina em `Sem fotografia`.
4. O estado final usa cooldown de 5 min antes de novo retry automático.
5. Atualização explícita/nova navegação pode iniciar uma nova tentativa.
6. A inexistência temporária de fotografia não elimina o SKU.

## D-058 — Uma sourceUrl oficial exata não deve disparar uma segunda resolução redundante

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Decisão

- Distribuição `75-catalog4` termina a tentativa quando a resolução direta de uma `sourceUrl` exata não encontra imagem válida.
- Pesquisa livre sem `sourceUrl` continua a usar o bridge legado.
- Host, path e PID permanecem estritos.

### Fundamento

Quando a página oficial do SKU já é conhecida, repetir descoberta não melhora identidade e aumenta latência/concorrência.

## D-059 — O contador Pingo Doce deve refletir uma imagem já comprovada pela biblioteca partilhada

Data: 10 de setembro de 2026. Estado: integrado em `main`.

### Decisão

Quando `75-photo-loader3` encontra no cache ou resolve uma fotografia Pingo Doce válida, atualiza também o mesmo `marketId|pid` na DB dedicada para `imageState='ready'` e refresca a métrica.

### Segurança

A reconciliação toca apenas metadados de imagem da DB dedicada Pingo Doce. Não acede a faturas, pagamentos, preços, PIN, token ou estado financeiro.

## D-060 — Impedir zoom acidental sem bloquear a acessibilidade

Data: 10 de setembro de 2026. Estado: aceite na branch `fix/v75-usability-part1`.

### Factos

- A aplicação já usava `font-size:16px` nos campos mobile em `v75-stability.css`, mitigando o auto-zoom que o Safari/iOS pode aplicar ao focar campos com texto menor.
- O `viewport` atual não bloqueia zoom manual.
- Não existia uma política transversal explícita para o duplo toque em controlos interativos.

### Decisão

1. Criar `v75-usability.css` revisão `75-usability1` como camada puramente visual/interacional.
2. Aplicar `touch-action: manipulation` a controlos interativos para reduzir zoom acidental por duplo toque.
3. Reforçar 16 px em inputs/selects/textareas no breakpoint mobile.
4. Manter alvos tácteis com referência mínima de 44 px e 48 px em controlos densos quando aplicável.
5. Reforçar o ecrã do cofre com `100dvh`, safe areas e scroll controlado.
6. Não adicionar `user-scalable=no` nem `maximum-scale=1`; pinch-to-zoom deve continuar disponível.
7. Carregar a camada no bundle Pages e versioná-la no Service Worker.

### Fundamento

Bloquear todo o zoom resolveria um sintoma à custa de acessibilidade. A combinação `16px` nos campos + `touch-action: manipulation` nos controlos elimina as duas fontes principais de zoom involuntário sem impedir o utilizador de ampliar deliberadamente a interface.

### Limites

A decisão reduz zoom involuntário em controlos. Não pretende impedir gestos de ampliação voluntários no conteúdo e deve ser confirmada em hardware Safari/PWA.

### Segurança

`75-usability1` é CSS puro. Não lê nem escreve estado, não altera PIN/criptografia, não acede à rede e não introduz dependências externas.

## Evidência técnica

A comparação entre `fix/v75-pin-images-stability` e `main` confirmou estado idêntico em `f85deed6d2fab5e1b0658ad74c25d323f621a19f`. A nova Parte 1 acrescenta apenas a camada de usabilidade, distribuição/cache e testes/documentação associados. O resultado só deve ser integrado após CI verde.
