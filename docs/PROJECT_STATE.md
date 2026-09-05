# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53
Distribuição: GitHub Pages
Estado da revisão: v53 com pesquisa real de Mercado e leitura de código de barras pela câmara; alterações protegidas por CI e pipeline de Pages

## Estado atual

A aplicação mantém a arquitetura local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

A área **Lista de compras / Mercado** pesquisa preços verificáveis em tempo de utilização e mantém apenas dois retalhistas ativos: **Pingo Doce** e **Continente**. A Mercadona permanece fora da interface, runtime e pesquisa de preços porque não existe uma fonte oficial portuguesa de catálogo/preços suficientemente completa e fiável para este fluxo.

O diálogo **Adicionar produto** passou também a disponibilizar leitura de **EAN / UPC / GTIN pela câmara**. A leitura serve para identificar o artigo; o preço não é retirado do código de barras. Depois da identificação, a aplicação reutiliza a pesquisa real já existente para consultar Pingo Doce e Continente.

## Pesquisa e preços do Mercado v53

A pesquisa de preços continua a ser realizada através do endpoint MCP público de `cesta.pt`, que devolve produtos do Pingo Doce e Continente com preço, promoções, preço por unidade, identificador e, quando disponível, ligação para a página oficial da cadeia.

A aplicação não recebe nem guarda credenciais das lojas. O termo pesquisado é enviado a `cesta.pt` apenas durante a pesquisa do Mercado. Não existem preços fictícios de fallback.

## Leitura de código de barras

Fluxo implementado:

1. o utilizador abre **Adicionar produto** e toca no botão de câmara junto à pesquisa;
2. a aplicação pede autorização da câmara e dá preferência à câmara traseira;
3. o vídeo é processado localmente pelo leitor ZXing Browser `0.2.0` carregado apenas quando necessário;
4. apenas sequências GTIN de 8, 12, 13 ou 14 dígitos com checksum válido avançam;
5. o GTIN é consultado no Open Food Facts apenas para obter identificação básica do produto (nome, marca e quantidade quando disponíveis);
6. nome/marca são colocados no campo de pesquisa existente e disparam o fluxo normal de `cesta.pt`;
7. o utilizador continua a escolher explicitamente o resultado/preço e só depois o item é adicionado à lista.

O scanner não escreve diretamente em `appState.market`, não altera o schema e não transforma o valor consultado em preço efetivamente pago. Se o código for válido mas não existir na base de identificação, a aplicação mantém o fluxo manual disponível.

A interface do scanner inclui moldura de leitura, estado da câmara, cancelamento, lanterna quando a implementação da câmara a disponibiliza, safe areas e respeito por `prefers-reduced-motion`.

## Interface

- permanecem apenas Pingo Doce e Continente no seletor de mercados;
- cada mercado tem identificação visual própria na interface;
- não são apresentadas imagens de produto;
- cada resultado mantém título, subtítulo, preço, estado da consulta e botão de adicionar;
- pesquisa inicia vazia e consulta produtos reais depois de pelo menos 2 caracteres;
- o botão de câmara foi integrado na própria caixa de pesquisa de **Adicionar produto** sem remover a pesquisa manual;
- safe areas, scroll e breakpoints mobile/tablet/desktop foram preservados;
- a versão pequena da identificação dos mercados respeita o mínimo tipográfico de 12 px.

## Quantidade e contabilização automática

`estimatedCents` e `actualCents` continuam a ser guardados como inteiros em cêntimos, mas representam **preço por unidade**. O subtotal financeiro do item é calculado por `quantidade × preço unitário`.

O editor de um item do Mercado inclui controlos **− / +**, mantém edição manual da quantidade e apresenta a pré-visualização **Subtotal automático**. A quantidade aceita valores positivos com até três casas decimais, preservando compatibilidade com o campo `quantity` existente.

Consequências verificadas por teste:

- 4 unidades a 1,15 € resultam em subtotal de 4,60 €;
- 1,5 unidades a 2,50 € resultam em subtotal de 3,75 €;
- **Estimado total** soma os subtotais dos itens;
- **Por comprar** soma quantidade × preço estimado dos itens pendentes;
- **Gasto contabilizado** usa quantidade × preço real quando este existe;
- se um item comprado ainda não tiver preço real, usa quantidade × preço estimado sem substituir o campo de preço efetivamente pago;
- orçamento, categorias e relatórios usam o subtotal calculado.

Não foram alterados o schema persistido, PBKDF2, AES-GCM, PIN/palavra-passe, IndexedDB, backups ou sincronização GitHub.

## Segurança e privacidade

A política de conteúdo mantém uma allowlist explícita. Para o novo fluxo foram acrescentados apenas:

- `https://unpkg.com` em `script-src`, para a versão fixa do ZXing Browser carregada sob pedido;
- `https://world.openfoodfacts.org` em `connect-src`, para identificação pelo GTIN;
- `media-src 'self' blob:` para o contexto de vídeo local.

`https://cesta.pt` continua autorizado para pesquisa de preços, além da API GitHub já existente.

A câmara é usada localmente: o vídeo e os fotogramas não são enviados nem guardados. Apenas o número do código de barras é enviado ao Open Food Facts para identificação. Depois, o termo de pesquisa derivado do nome/marca é enviado a `cesta.pt` para obter os preços. PIN, palavra-passe, conteúdo do cofre, faturas e restantes dados financeiros não entram neste fluxo.

Conteúdo remoto continua tratado como não confiável: o texto obtido para nome/marca/quantidade é normalizado e limitado antes de ser reutilizado. Pedidos externos usam `credentials: 'omit'`, timeout/abort e não são persistidos pelo scanner.

## Validação técnica

A suite existente continua a cobrir finanças, auditoria, isolamento, formulários, Mercado, segurança, responsividade, navegação, acessibilidade e sincronização. Foi acrescentado `tests/market-barcode.test.cjs`, executado em CI e novamente antes da publicação de Pages, para verificar:

- wiring dos novos assets;
- CSP/allowlists;
- utilização preferencial da câmara traseira;
- versão fixa da dependência ZXing;
- origem de identificação Open Food Facts;
- validação de checksum GTIN;
- encerramento das tracks da câmara;
- ausência de persistência direta pelo scanner;
- passagem do produto identificado ao fluxo de pesquisa existente;
- safe areas, alvo tátil e redução de movimento.

## Limitações conhecidas

Uma fonte externa pode ficar indisponível ou alterar o seu contrato. Nessa situação, a aplicação deve mostrar a falha de consulta e não inventar produtos ou preços.

A identificação por código de barras depende da cobertura comunitária do Open Food Facts; um GTIN válido pode não ter nome/marca registados. O preço continua a depender da correspondência que `cesta.pt` encontrar nos catálogos públicos de Pingo Doce e Continente e deve ser confirmado no retalhista.

A leitura da câmara exige HTTPS, permissão do utilizador e suporte de `getUserMedia`. A validação automatizada não substitui teste físico da focagem, exposição, lanterna e permissões em iPhone/Safari e Android/Chrome.

## Próximo passo

1. Validar o scanner num iPhone/Safari físico com EAN-13 e EAN-8, incluindo permitir/recusar câmara, cancelar, reabrir e usar rotação.
2. Validar num Android/Chrome e confirmar a seleção da câmara traseira e, quando suportada, lanterna.
3. Confirmar códigos reais de produtos portugueses que existam e que não existam no Open Food Facts.
4. Confirmar que, após identificação, os resultados e preços do Pingo Doce/Continente correspondem ao artigo pretendido e não a uma variante diferente.
5. Continuar a validar controlos −/+, subtotal, teclado, safe areas, rede lenta e offline.
6. Monitorizar alterações de contrato/CORS de `cesta.pt`, Open Food Facts e da dependência ZXing.
