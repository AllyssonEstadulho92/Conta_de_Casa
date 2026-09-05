# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53
Distribuição: GitHub Pages
Estado da revisão: v53 integrada em `main`, CI concluído e GitHub Pages publicado com sucesso
Revisão funcional promovida: `8856d4fa3bf7e5fd382a12536a4d67da022607c6`
CI de produção confirmado: GitHub Actions run `33935500203`
Deployment confirmado: GitHub Actions `Deploy Pages` run `33935513150`

## Estado atual

A aplicação mantém a arquitetura local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

A área **Lista de compras / Mercado** pesquisa preços verificáveis em tempo de utilização e mantém apenas dois retalhistas ativos: **Pingo Doce** e **Continente**. A Mercadona foi retirada da interface, runtime, CSP e pipeline de validação porque não foi encontrada uma fonte oficial portuguesa de catálogo/preços suficientemente completa e fiável para este fluxo.

## Pesquisa e preços do Mercado v53

A pesquisa é realizada através do endpoint MCP público de `cesta.pt`, que devolve produtos do Pingo Doce e Continente com preço, promoções, preço por unidade, identificador e, quando disponível, ligação para a página oficial da cadeia.

A aplicação não recebe nem guarda credenciais das lojas. O termo pesquisado é enviado a `cesta.pt` apenas durante a pesquisa do Mercado. Não existem preços fictícios de fallback.

## Interface

- permanecem apenas Pingo Doce e Continente no seletor de mercados;
- cada mercado tem identificação visual própria na interface;
- não são apresentadas imagens de produto;
- cada resultado mantém título, subtítulo, preço, estado da consulta e botão de adicionar;
- pesquisa inicia vazia e consulta produtos reais depois de pelo menos 2 caracteres;
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

A CSP permite `https://cesta.pt` para a pesquisa de preços, além da API GitHub já existente. A origem `prices.openfoodfacts.org` foi removida. O probe Open Prices e a integração Mercadona também foram removidos.

Conteúdo remoto é tratado como não confiável: texto é limitado/normalizado e escapado; uma ligação oficial de produto só é aberta depois de validação do protocolo e host e de clique explícito do utilizador.

Os dados do cofre, faturas, PIN e restante informação financeira não são enviados à fonte de preços.

## Validação técnica concluída

A revisão v53 passou na branch e novamente em `main`:

- verificação da fonte de preços do Mercado;
- sintaxe JavaScript;
- finanças e auditoria;
- invariantes de contagem;
- isolamento criptográfico;
- datas e formulários;
- categorias do Mercado;
- pesquisa de preços;
- quantidade e contabilização automática;
- segurança;
- responsividade e viewport mobile;
- navegação e acessibilidade;
- sincronização;
- validação do manifest.

O CI de `main` terminou com sucesso no run `33935500203`. O workflow `Deploy Pages` voltou a verificar a revisão testada, preparou a allowlist pública e publicou com sucesso no run `33935513150`.

## Limitações conhecidas

Uma fonte externa pode ficar indisponível ou alterar o seu contrato. Nessa situação, a aplicação deve mostrar a falha de consulta e não inventar preços.

A validação automatizada e a publicação estão concluídas. Continua pendente a validação física/visual em iPhone/Safari, Android, tablet e desktop reais.

## Próximo passo

1. Validar visualmente a v53 publicada no iPhone/Safari, incluindo os controlos −/+ e o subtotal automático.
2. Testar pesquisas reais variadas no Pingo Doce e Continente em dispositivo físico.
3. Confirmar comportamento com teclado, rotação, rede lenta e offline.
4. Monitorizar alterações de contrato/CORS do `cesta.pt`.
5. Reavaliar a Mercadona apenas se vier a existir uma fonte oficial portuguesa de catálogo/preços suficientemente completa e verificável.
