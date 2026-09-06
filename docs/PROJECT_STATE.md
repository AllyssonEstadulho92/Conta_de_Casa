# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público confirmado: v60
Build em validação: v61
Distribuição: GitHub Pages
Branch: `fix/market-official-images-v61`
Estado: correção funcional v61 implementada; CI da branch `34002655320` terminou com `success`; integração em `main`, Deploy Pages e validação física no iPhone ainda pendentes.

## Estado atual

A aplicação continua uma PWA estática/local-first. O cofre permanece no navegador, cifrado com o modelo existente; o estado financeiro continua no IndexedDB e a sincronização GitHub permanece opcional. O schema financeiro continua na versão 5. A revisão v61 não altera PIN/palavra-passe, PBKDF2, AES-GCM, faturas, preços, quantidades, totais, backups ou contratos de sincronização.

## Defeito confirmado após a publicação v60

A captura real em iPhone/Safari mostrou que os cartões do Mercado continuavam com placeholder apesar de a v60 localizar imagens oficiais no probe de CI.

A revisão do código confirmou que não era apenas falta de fotografia na fonte. Existiam pontos de integração incorretos entre módulos:

- `market-experience.js` renderiza o controlo da loja como `.market-result-source`, mas a camada v60 procurava `.market-product-source[href]`;
- o botão real de adicionar é `[data-market-add-product]`, enquanto a camada v60 tentava interceptar `[data-market-add]`;
- o catálogo `resultById` e funções relacionadas vivem dentro de um IIFE de `market-experience.js`; tentativas da v60 de reatribuir funções lexicais a partir de outro IIFE não alteravam o fluxo real do browser;
- o reader v60 usava cabeçalhos personalizados de imagem. Isto não foi provado como causa única do defeito, mas introduzia uma dependência adicional de preflight CORS no Safari.

Por isso os probes externos conseguiam provar que a imagem existia, mas o cartão apresentado no iPhone não recebia necessariamente essa imagem.

## Revisão v61 — bridge do contrato real do Mercado

Foi criado `market-official-images.js` como camada de integração explícita, sem reescrever a lógica financeira madura de `market-experience.js`.

O fluxo v61 usa apenas contratos que existem realmente no browser:

1. lê `data-market-product-card`, que contém cadeia e `pid`;
2. usa a pesquisa real do `cesta.pt` para recuperar a URL pública do SKU;
3. valida domínio, caminho e `pid` antes de qualquer leitura;
4. lê a página pública via `r.jina.ai` com GET CORS simples;
5. aceita apenas imagem do catálogo/CDN oficial que contenha o mesmo `pid`;
6. testa se a imagem é efetivamente carregável antes de substituir o placeholder;
7. aplica a fotografia ao cartão real e reutiliza o visualizador ampliado existente;
8. após a ação real `+`, associa a imagem resolvida ao item criado e persiste apenas URL, origem e data.

A concorrência permanece limitada a três resoluções e a auditoria é iniciada apenas para cartões visíveis/próximos do viewport.

## Sinalização e proveniência

A revisão separa conceitos que estavam visualmente demasiado próximos:

- **Consultado agora** continua a referir-se à atualidade da consulta/preço;
- o antigo texto **Produto oficial** passa, na camada v61, a **Ver no Pingo Doce** ou **Ver no Continente** — é uma ação para abrir a página do retalhista, não uma afirmação sobre a miniatura;
- a fotografia validada recebe proveniência própria, por exemplo **Pingo Doce · imagem oficial** ou **Continente · imagem oficial**, visível no contexto da imagem ampliada.

Se não for possível provar que a fotografia pertence ao `pid` exato, o placeholder continua a ser o comportamento seguro.

## Segurança e privacidade v61

- reader recebe apenas URL pública de produto previamente validada;
- imagens são aceites apenas dos hosts/caminhos oficiais autorizados ou dos fallbacks Open Facts já existentes;
- pedidos usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- o novo pedido ao reader usa apenas `Accept: application/json`, sem cabeçalhos personalizados de imagem;
- sem API keys, Authorization, passwords ou tokens no módulo;
- nenhum PIN, chave do cofre, fatura, saldo ou outro dado financeiro é enviado para resolver fotografias;
- binários continuam fora do cofre.

## Build e testes

Build: `v61`.
Cache: `conta-de-casa-public-v61-official-images-bridge`.
Novo asset público: `market-official-images.js`.

CI da branch `34002655320`: `success`.

Passaram: probe das fontes reais, sintaxe, finanças, auditoria, isolamento do cofre, faturas/QR, Mercado, imagens reais, auditoria/zoom, novo teste do bridge browser, scanner, contabilização, ícones, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização e manifest.

## Limitações conhecidas

A v61 corrige o defeito de integração confirmado, mas não pode garantir fotografia para todo o catálogo. Um SKU pode continuar sem imagem quando a própria página não expõe uma imagem identificável, o `pid` não coincide, o CDN/reader está indisponível ou a imagem falha ao carregar. Nesses casos a aplicação não deve inventar uma fotografia.

A validação automatizada não substitui o teste físico no Safari/iPhone.

## Próximo passo

1. integrar a branch v61 em `main` mantendo CI verde;
2. confirmar CI de `main` e Deploy Pages v61;
3. no iPhone, atualizar para v61 e repetir a pesquisa de ovos da captura;
4. confirmar que o texto da loja aparece como **Ver no Pingo Doce/Continente** e não como “Produto oficial” junto de um placeholder;
5. confirmar fotografia + ampliação para SKUs que tenham imagem oficial validável;
6. validar 320, 375, 390 e 430 px, rede móvel e comportamento offline/falha da origem.
