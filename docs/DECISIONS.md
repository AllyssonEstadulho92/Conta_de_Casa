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

## D-046 a D-055 — decisões preservadas

Mantêm-se aceites as decisões anteriores sobre: carrossel de destaques; biblioteca geral por retalhista+PID; catálogo progressivo sem persistir preços; biblioteca Pingo Doce isolada; publicação condicionada a CI/Pages; separação entre validade oficial e transporte; prevalência de evidência em hardware; renderer incremental sem destruir cartões estáveis; e propagação `cdc:market-photo-ready`.

## D-056 — O PIN não deve esperar pela rede num dispositivo já emparelhado

Data: 10 de setembro de 2026. Estado: aceite na branch de correção.

### Facto

O fluxo `unlockVault() → enterApp() → syncStartupGate()` fazia a aplicação esperar pela sincronização GitHub depois de o PIN já ter decifrado corretamente o cofre local. O gate remoto tinha timeout próprio, pelo que a demora percebida pelo utilizador podia ser atribuída ao PIN embora estivesse a ocorrer depois da operação criptográfica local.

### Decisão

1. Manter PBKDF2 em 250000 iterações e não enfraquecer a derivação da chave.
2. Se o dispositivo tem `pairedAt` + `lastRemoteSha`, sincronização ativa, token local e rede disponível, a última cópia local cifrada confirmada pode ser mostrada imediatamente após o PIN.
3. A verificação GitHub inicia logo a seguir com `syncNow('startup-background')`.
4. Primeiro emparelhamento e estados sem confirmação continuam a usar o gate original.
5. A política de conflitos e a cifragem remota não são alteradas.

### Fundamento

A rede não acrescenta autenticação ao PIN já validado localmente. Num dispositivo previamente emparelhado, bloquear toda a UI até uma chamada remota terminar degrada disponibilidade sem aumentar a força criptográfica. A sincronização continua obrigatória como mecanismo de consistência, mas passa a ser assíncrona no arranque recorrente.

### Critério de aceitação

PIN correto em dispositivo emparelhado apresenta o shell sem aguardar o timeout remoto; CI de segurança/sync permanece verde; conflitos continuam tratados pelo mecanismo existente.

## D-057 — Um carregamento de fotografia deve terminar num estado visual estável

Data: 10 de setembro de 2026. Estado: aceite na branch de correção.

### Facto

`75-photo-loader2` mudava de “A carregar fotografia…” para “Fotografia a validar…”, mas não definia um fim visual para a tentativa. Sem imagem disponível naquele ciclo, o cartão continuava com aparência de operação permanente.

### Decisão

1. `75-photo-loader3` mantém estado de carregamento até 7 s.
2. Entre 7 e 12 s apresenta validação.
3. Aos 12 s sem resultado termina em `Sem fotografia`.
4. O estado final usa cooldown de 5 min antes de novo retry automático.
5. Atualização explícita/nova navegação pode iniciar uma nova tentativa.
6. A inexistência temporária de fotografia não elimina o SKU.

### Fundamento

Um estado assíncrono sem terminalidade é uma falha de UX e gera tráfego repetido. O utilizador deve distinguir “a trabalhar” de “não foi possível nesta tentativa”.

## D-058 — Uma sourceUrl oficial exata não deve disparar uma segunda resolução redundante

Data: 10 de setembro de 2026. Estado: aceite na branch de correção.

### Facto

O resolvedor direto `75-catalog2` tinha limite de 8 s, mas, ao devolver `null`, o wrapper podia chamar o bridge legado. Esse bridge podia voltar a pesquisar Cesta, ler a mesma página e fazer preflight visual, prolongando a tentativa e competindo com outras filas.

### Decisão

- Distribuição `75-catalog4` termina a tentativa quando a resolução direta de uma `sourceUrl` exata não encontra imagem válida.
- Pesquisa livre sem `sourceUrl` continua a usar o bridge legado.
- Host, path e PID permanecem estritos.

### Fundamento

Quando a página oficial do SKU já é conhecida, repetir descoberta não melhora identidade e aumenta latência/concorrência. A tentativa exata deve ser limitada e determinística.

## D-059 — O contador Pingo Doce deve refletir uma imagem já comprovada pela biblioteca partilhada

Data: 10 de setembro de 2026. Estado: aceite na branch de correção.

### Facto

A biblioteca partilhada podia guardar uma imagem oficial Pingo Doce enquanto o registo correspondente na DB dedicada continuava `pending`/`missing`. Assim o catálogo geral podia aumentar o número de imagens, mas o painel Pingo Doce continuar em `0 fotografias oficiais`.

### Decisão

Quando `75-photo-loader3` encontra no cache ou resolve uma fotografia Pingo Doce válida, atualiza também o mesmo `marketId|pid` na DB dedicada para `imageState='ready'` e refresca a métrica.

### Segurança

A reconciliação toca apenas metadados de imagem da DB dedicada Pingo Doce. Não acede a faturas, pagamentos, preços, PIN, token ou estado financeiro.

## Evidência técnica

A sonda real reforçada confirmou em 10/09/2026 que Pingo Doce `pid 739490` devolve imagem exata e que essa URL é aceite pelo mesmo validador do runtime (`runtime-safe=true`). A branch com as decisões acima passou CI completo no run `34445844039`.
