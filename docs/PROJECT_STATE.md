# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53
Distribuição: GitHub Pages
Estado da revisão: auditoria global de ícones e captura QR de faturas implementadas sobre a v53; suite automatizada da branch concluída com sucesso

## Estado atual

A aplicação mantém a arquitetura local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

A área **Lista de compras / Mercado** continua com pesquisa verificável em Pingo Doce e Continente e leitura de EAN/UPC/GTIN pela câmara. A nova revisão não altera este fluxo financeiro; normaliza apenas a sua apresentação de ícones e reaproveita a infraestrutura de leitura QR para faturas.

## Auditoria global de ícones

Foi identificada uma mistura histórica de três fontes visuais: o registo SVG `ICONS` de `core.js`, SVGs definidos localmente em módulos e glifos Unicode no HTML. A evidência visível mais clara era a lupa de **Pesquisar produto real**, parcialmente cortada em Safari/iPhone.

A revisão cria `ui-icons.js` e `ui-icons.css` como camada de compatibilidade sem mudar a estrutura da aplicação:

- ícones funcionais passam a usar uma linguagem SVG local única;
- dimensões de interface ficam explicitamente fixadas, sobrepondo a regra legada `svg { height:auto }` onde esta não é adequada;
- marca, navegação, privacidade, bloqueio, tema, notificações, atalhos, ações, Mercado e scanners são normalizados;
- não é carregada qualquer icon font/CDN adicional;
- gráficos, estatísticas e barras de progresso permanecem inalterados;
- sincronização ativa, alertas e scanners podem usar animação discreta;
- `prefers-reduced-motion` desativa animações não essenciais.

A auditoria detalhada está registada em `docs/UI_ICON_AUDIT.md`.

## Captura de faturas por Código QR

O formulário **Nova fatura** passa a receber, de forma progressiva, o bloco **Ler dados da fatura**. O utilizador pode:

1. abrir a câmara e apontar para o QR fiscal da fatura; ou
2. selecionar uma imagem da fatura no dispositivo.

A leitura usa `BrowserQRCodeReader` do `@zxing/browser@0.2.0`, já autorizado pela CSP. O parser interpreta o formato técnico do Código QR de faturação da Autoridade Tributária e recolhe apenas campos estruturados compatíveis: NIF do emitente/adquirente, tipo e estado do documento, data, identificação única, ATCUD, total de impostos, total do documento, hash e certificado quando disponíveis.

A leitura não grava imediatamente os dados. É apresentada uma pré-visualização e o utilizador tem de escolher **Preencher campos**. Só depois são preenchidos campos vazios compatíveis no formulário: total, identificação/referência e NIF do emitente. O nome comercial do fornecedor, categoria, vencimento e método continuam a exigir confirmação humana.

A imagem selecionada é temporária: não é persistida, não entra em `attachments`, não é sincronizada e não é enviada para um serviço externo. O `ObjectURL` é revogado após a leitura. PDFs/OCR geral não foram ativados nesta revisão para não introduzir extração probabilística de valores financeiros sem uma política de validação própria.

## Pesquisa e preços do Mercado v53

A pesquisa de preços continua a ser realizada através do endpoint MCP público de `cesta.pt`, que devolve produtos do Pingo Doce e Continente com preço, promoções, preço por unidade, identificador e, quando disponível, ligação para a página oficial da cadeia.

A aplicação não recebe nem guarda credenciais das lojas. O termo pesquisado é enviado a `cesta.pt` apenas durante a pesquisa do Mercado. Não existem preços fictícios de fallback.

## Leitura de código de barras de produtos

O fluxo existente permanece:

1. o utilizador abre **Adicionar produto** e toca no botão de câmara junto à pesquisa;
2. a aplicação pede autorização da câmara e dá preferência à câmara traseira;
3. o vídeo é processado localmente pelo ZXing Browser;
4. apenas GTIN-8, GTIN-12/UPC, GTIN-13/EAN ou GTIN-14 com checksum válido avançam;
5. o GTIN é consultado no Open Food Facts apenas para identificação básica;
6. nome/marca são passados à pesquisa `cesta.pt`;
7. o utilizador escolhe explicitamente o produto/preço antes da criação do item.

O scanner não escreve diretamente em `appState.market` e não transforma identificação em prova de preço.

## Quantidade e contabilização automática

`estimatedCents` e `actualCents` continuam inteiros em cêntimos e representam preço por unidade. O subtotal financeiro continua calculado por `quantidade × preço unitário`.

Não foram alterados o schema persistido, PBKDF2, AES-GCM, PIN/palavra-passe, IndexedDB, backups, sincronização GitHub, cálculos financeiros ou regras de quantidade.

## Segurança e privacidade

A CSP continua com allowlist explícita. Não foi criada nova origem de dados para a captura de faturas. O ZXing continua carregado da versão fixa já autorizada em `unpkg.com`; a imagem da fatura e o payload QR ficam no cliente.

`invoice-capture.js` não usa `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, IndexedDB, `appState`, `saveState()` ou `commit()`. A gravação continua exclusivamente através do formulário de fatura existente depois da confirmação do utilizador.

O sistema de ícones também não adiciona origem remota: todos os vetores são locais e usam `currentColor`.

## Validação técnica concluída na revisão

A CI da branch executou e concluiu com sucesso:

- verificação de sintaxe dos módulos existentes e de `ui-icons.js` / `invoice-capture.js`;
- testes financeiros e auditoria financeira;
- invariantes de contagem e isolamento;
- datas e regressão do formulário de faturas;
- parser e privacidade do QR de faturas;
- categorias, pesquisa, scanner e contabilização do Mercado;
- auditoria do sistema unificado de ícones;
- segurança;
- responsividade e viewport mobile;
- navegação e acessibilidade;
- sincronização e manifest.

Os novos assets também foram adicionados à allowlist de GitHub Pages e ao Service Worker.

## Limitações conhecidas

A correção da lupa e a consistência dos ícones estão cobertas por regras e testes automatizados, mas o rendering final deve ser confirmado num iPhone/Safari físico, sobretudo nas larguras 320, 375, 390 e 430 px.

A leitura QR de faturas depende da legibilidade do código, permissão de câmara e qualidade da fotografia. Não é OCR geral: uma fatura sem QR legível continua a exigir introdução manual dos dados.

O QR fiscal não contém informação suficiente para preencher com segurança todos os campos operacionais da aplicação, em particular o vencimento. Estes campos não são inventados.

As limitações anteriores das fontes externas de Mercado e da identificação GTIN permanecem.

## Próximo passo

1. Validar no iPhone/Safari físico a lupa do Mercado e os restantes ícones principais em claro/escuro.
2. Ler uma fatura portuguesa real com QR pela câmara e confirmar total, documento, ATCUD e NIF antes de preencher.
3. Testar a mesma fatura através de uma fotografia da galeria e confirmar que o ficheiro não fica persistido.
4. Repetir em Android/Chrome, incluindo permissão, autofocus, rotação e lanterna quando suportada.
5. Confirmar leitores de ecrã e `prefers-reduced-motion` nos novos controlos.
6. Só depois avaliar OCR/PDF, caso seja necessário, com validação explícita dos valores extraídos.
