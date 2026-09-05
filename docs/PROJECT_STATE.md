# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v52
Distribuição: GitHub Pages

## Estado atual

A aplicação mantém a arquitetura local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

A área **Lista de compras / Mercado** deixou de usar o catálogo e os preços fictícios do protótipo v51. O ecrã **Adicionar produto** pesquisa agora fontes externas verificáveis em tempo de utilização e não apresenta imagens de produto.

## Pesquisa e preços do Mercado v52

### Continente e Pingo Doce

A pesquisa é realizada através do endpoint MCP público de `cesta.pt`, que consulta produtos das duas cadeias e devolve preço atual, promoções, preço por unidade, identificador do produto e ligação para a página oficial da cadeia.

A aplicação não recebe nem guarda credenciais das lojas. O termo pesquisado é enviado a `cesta.pt` apenas quando a pesquisa envolve Continente e/ou Pingo Doce.

### Mercadona Portugal

Não foi encontrada uma fonte oficial pública da Mercadona Portugal que disponibilize um catálogo de preços atuais para consumo direto pela PWA. Para não usar preços espanhóis, inventados ou não auditáveis, a aplicação consulta **Open Prices** e restringe os resultados a lojas Mercadona localizadas em Portugal.

Só são aceites registos com comprovativo associado. Cada resultado apresenta a data da observação. Registos antigos são marcados explicitamente como podendo já ter mudado e nunca são descritos como preço atual.

A cobertura da Mercadona depende das contribuições existentes no Open Prices e pode ser incompleta. Quando não existe um preço verificável para a pesquisa, a aplicação apresenta essa ausência em vez de fabricar um valor.

## Interface

- removidas as ilustrações/imagens de embalagem dos cartões de produto;
- cada resultado mantém título, subtítulo, preço, origem/estado de verificação e botão de adicionar;
- pesquisa inicia vazia e consulta produtos reais depois de pelo menos 2 caracteres;
- seleção Pingo Doce / Continente / Mercadona continua disponível;
- sugestões de produtos e categorias apenas preenchem a pesquisa; não contêm preços hardcoded;
- safe areas, scroll e breakpoints mobile/tablet/desktop foram preservados.

## Dados financeiros

Ao adicionar um resultado, o preço consultado é gravado no campo existente `estimatedCents`, nunca em `actualCents`. O preço real pago continua a ser confirmado pelo utilizador após a compra, como já acontecia no modelo anterior.

Não foram alterados o schema persistido, PBKDF2, AES-GCM, PIN/palavra-passe, IndexedDB, backups ou sincronização GitHub.

## Segurança e privacidade

A CSP permite apenas as duas novas origens necessárias para pesquisa de preços: `https://cesta.pt` e `https://prices.openfoodfacts.org`, além das origens já existentes. Não existem API keys, tokens ou credenciais de terceiros no código.

Conteúdo remoto é tratado como não confiável: texto é limitado/normalizado antes de apresentação, HTML é escapado e ligações de produto são aceites apenas para hosts oficiais do Continente e Pingo Doce.

## Validação técnica

A conectividade e CORS das fontes foram auditados antes da implementação. Foi confirmada pesquisa real de Continente/Pingo Doce através de `search_products` do cesta.pt e leitura CORS de observações Mercadona Portugal no Open Prices com loja, data, preço e comprovativo.

## Próximo passo

1. Validar visualmente a v52 em iPhone/Safari, Android, tablet e desktop com pesquisas reais variadas.
2. Confirmar comportamento com rede lenta/offline e indisponibilidade parcial de uma fonte.
3. Monitorizar alterações de contrato/CORS das duas fontes externas.
4. Substituir a fonte comunitária da Mercadona se a Mercadona Portugal vier a disponibilizar uma API/catálogo oficial de preços.
5. Continuar a consolidação gradual dos estilos mobile legados sem alterar comportamento.
