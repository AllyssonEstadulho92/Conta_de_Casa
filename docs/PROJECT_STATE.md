# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53
Distribuição: GitHub Pages
Estado da revisão: v52 integrada em `main`, CI concluído e GitHub Pages publicado com sucesso
Revisão funcional promovida: `b7a1119e82c32f93e13f8272e43353c9a97de0c7`
Deployment confirmado: GitHub Actions `Deploy Pages` run `33933922714`

## Estado atual

A aplicação mantém a arquitetura local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

A área **Lista de compras / Mercado** deixou de usar o catálogo, imagens e preços fictícios do protótipo v51. O ecrã **Adicionar produto** pesquisa fontes externas verificáveis em tempo de utilização e o preço selecionado passa a integrar os totais da lista através do campo existente `estimatedCents`.

## Pesquisa e preços do Mercado v52

### Continente e Pingo Doce

A pesquisa é realizada através do endpoint MCP público de `cesta.pt`, que consulta produtos das duas cadeias e devolve preço atual, promoções, preço por unidade, identificador do produto e ligação para a página oficial da cadeia.

A aplicação não recebe nem guarda credenciais das lojas. O termo pesquisado é enviado a `cesta.pt` apenas quando a pesquisa envolve Continente e/ou Pingo Doce.


## Interface

- removidas as ilustrações/imagens de embalagem dos cartões de produto;
- cada resultado mantém título, subtítulo, preço, origem/estado de verificação e botão de adicionar;
- pesquisa inicia vazia e consulta produtos reais depois de pelo menos 2 caracteres;
- seleção Pingo Doce / Continente continua disponível;
- sugestões de produtos e categorias apenas preenchem a pesquisa; não contêm preços hardcoded;
- safe areas, scroll e breakpoints mobile/tablet/desktop foram preservados.

## Contabilização da lista

Ao adicionar um resultado, o preço consultado é gravado em `estimatedCents`; `actualCents` permanece `0` até o utilizador indicar o montante efetivamente pago.

Consequências verificadas por teste dinâmico:

- **Estimado total** inclui o preço pesquisado logo após a adição;
- **Por comprar** inclui a estimativa dos itens ainda pendentes;
- ao marcar um item como comprado, **Gasto contabilizado** usa `actualCents` quando este foi registado;
- enquanto não existir `actualCents`, um item já marcado como comprado é contabilizado pela estimativa pesquisada, sem apagar a distinção entre preço consultado e preço efetivamente pago.

Não foram alterados o schema persistido, PBKDF2, AES-GCM, PIN/palavra-passe, IndexedDB, backups ou sincronização GitHub.

## Segurança e privacidade

A CSP permite apenas `https://cesta.pt` para a pesquisa de preços, além da API GitHub já existente. Não existem API keys, tokens ou credenciais de terceiros no código.

Conteúdo remoto é tratado como não confiável: texto é limitado/normalizado e escapado; a ligação oficial de produto só é aberta depois de recuperar o URL validado da memória da pesquisa, verificar protocolo/host e existir clique explícito do utilizador.

Os dados do cofre, faturas, PIN e restante informação financeira não são enviados às fontes de preços.

## Validação técnica concluída

A revisão v52 passou no GitHub Actions a validação das fontes externas, sintaxe e a suite completa de regressão: finanças, auditoria, contagens, isolamento criptográfico, datas, formulários, categorias, pesquisa de Mercado, contabilização de preços, segurança, responsividade, viewport mobile, navegação, acessibilidade, sincronização e manifest.

O CI final da revisão promovida em `main` terminou com sucesso no run `33933902054`. O workflow de deployment voltou a executar os testes específicos de Mercado antes de preparar o bundle público e terminou com sucesso no run `33933922714`.

Foi confirmada pesquisa real de Continente/Pingo Doce através de `search_products` do cesta.pt.

## Limitações conhecidas

Não é tecnicamente correto prometer que uma fonte externa nunca ficará indisponível ou nunca alterará o seu contrato. A regra da aplicação é falhar de forma explícita: se não existir preço verificável, não inventar nem reutilizar silenciosamente um valor fictício.

A validação automatizada e a publicação estão concluídas. Continua pendente validação física/visual em iPhone/Safari e outros browsers/dispositivos reais.

## Próximo passo

1. Validar visualmente a v52 publicada em iPhone/Safari, Android, tablet e desktop com pesquisas reais variadas.
2. Confirmar em hardware real o comportamento com teclado, rotação e condições de rede adversas.
3. Monitorizar alterações de contrato/CORS das duas fontes externas.
4. Reavaliar a Mercadona apenas se vier a existir uma fonte oficial portuguesa com catálogo e preços verificáveis.
5. Continuar a consolidação gradual dos estilos mobile legados sem alterar comportamento.

## Quantidade automática v53

O preço estimado e o preço real do Mercado passam a representar valor por unidade. O subtotal de cada linha é calculado automaticamente por quantidade × preço unitário. O editor inclui controlos −/+ e pré-visualização do subtotal; os totais e relatórios usam o subtotal calculado.

A Mercadona foi retirada do seletor e da rede de produção por não existir uma fonte oficial portuguesa de catálogo/preços suficientemente completa para este fluxo. Permanecem apenas Pingo Doce e Continente.
