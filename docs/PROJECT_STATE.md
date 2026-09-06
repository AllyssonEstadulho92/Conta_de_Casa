# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público base: v62
Distribuição: GitHub Pages
Branch pública: `main`
Revisão em validação: `feat/market-brand-no-images`

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O cofre continua no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece na versão 5.

A revisão atual é exclusivamente de apresentação do módulo **Compras/Mercado**. Não altera PIN/palavra-passe, cifragem, faturas, preços, quantidades, totais, backups, sincronização ou regras de contabilização.

## Decisão de produto confirmada

As fotografias de produto deixaram de ser um requisito da interface. Para esta experiência, é suficiente identificar cada resultado e cada item pelo **nome**, complementado por embalagem/quantidade, loja, categoria e preço quando aplicável.

A fotografia não deve ocupar espaço, criar placeholders vazios nem condicionar a leitura da lista.

## Revisão visual em validação

Foram introduzidas duas camadas isoladas:

- `market-brand.css` — identidade visual do Mercado, com hierarquia mais limpa, azul de marca, cartões com contraste controlado, estados cromáticos, navegação móvel refinada e remoção visual das fotografias/placeholder;
- `market-branding.js` — ajuste semântico do aviso de origem para explicar que a interface apresenta nome, embalagem, loja e preço sem depender de fotografias.

A apresentação passa a privilegiar:

- nome do produto como elemento principal;
- preço e estado com maior legibilidade;
- cartões-resumo com diferenciação azul, verde, âmbar e violeta;
- `+` como ação primária clara;
- cartões de lista sem coluna/área reservada a fotografia;
- pesquisa móvel com maior consistência de espaçamento, raio, sombra e tipografia;
- navegação inferior coerente com a identidade do módulo.

## Compatibilidade e dados existentes

Esta revisão **não elimina metadados antigos de imagem do cofre**. Campos legados como `imageUrl`, `imageSource` e `imageMatchedAt` continuam tolerados pelo schema para não destruir dados já gravados, mas deixam de ser relevantes para a apresentação do Mercado.

Os resolvedores de imagem v59–v62 permanecem temporariamente no código e no bundle público por compatibilidade. A nova camada visual tem precedência e não mostra fotografias. A remoção técnica definitiva desses mecanismos fica separada para uma fase posterior, depois da validação física, evitando uma alteração visual e arquitetural ampla no mesmo passo.

A câmara do Mercado permanece porque serve **leitura de código de barras**, não captura de fotografia do produto. O código lido continua a ajudar a identificar nome/marca; o preço continua a ser obtido pelas fontes do Mercado.

## Segurança e privacidade

A revisão visual:

- não acede a `appState` nem grava estado financeiro;
- não acrescenta endpoints, credenciais ou segredos;
- não altera CSP, autenticação ou autorização;
- não altera `estimatedCents` nem `actualCents`;
- não altera o isolamento do cofre;
- não adiciona telemetria.

## Testes

`tests/market-experience.test.cjs` foi alargado para verificar:

- publicação/cache de `market-brand.css` e `market-branding.js`;
- ocultação explícita de `.market-product-photo`;
- reflow da lista móvel para checkbox + conteúdo + estado;
- cartões de pesquisa sem reserva visual para fotografia;
- manutenção do azul de marca e da hierarquia responsiva;
- ausência de acesso do branding ao estado financeiro.

As restantes suítes continuam responsáveis por finanças, cifragem, segurança, faturas, Mercado, responsividade, acessibilidade, scanner e sincronização.

## Próximo passo

1. executar a CI completa da branch;
2. rever o diff do PR;
3. integrar em `main` apenas com CI verde;
4. confirmar o Deploy Pages;
5. validar fisicamente no iPhone/Safari a lista, o browser de produtos e a navegação inferior nas larguras 320, 375, 390 e 430 px;
6. depois da validação, decidir se os módulos legados de imagem podem ser removidos definitivamente numa alteração separada.
