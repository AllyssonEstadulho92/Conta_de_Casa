# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build em validação: v59
Último build público confirmado: v58
Distribuição: GitHub Pages
Branch atual: `feature/product-image-audit-v59`
Estado da revisão: auditoria automática de imagens e ampliação tátil implementadas; CI da branch concluído com sucesso; integração/deploy e validação física ainda pendentes

## Estado atual

A aplicação permanece uma PWA estática/local-first: cofre cifrado no navegador, dados financeiros no IndexedDB, sincronização GitHub opcional e GitHub Pages como distribuição pública. O schema financeiro continua na versão 5. Faturas, Planeamento, Mercado, Relatórios, Segurança, Definições, scanner de códigos de barras, captura QR e Centro de Atualização mantêm os fluxos existentes.

A v59 responde a dois problemas observados no iPhone na pesquisa **Adicionar produto**:

1. várias linhas tinham placeholder porque a v57 fazia apenas uma pesquisa ampla de imagens por termo, sem auditar cada produto individualmente;
2. mesmo quando existia fotografia, a miniatura era estática e não podia ser ampliada.

## Revisão v59 — auditoria de imagens e ampliação

Foram adicionados `market-image-audit.js` e `market-image-audit.css` como camada progressiva, sem reescrever `market-experience.js`, `render.js` ou o modelo financeiro.

### Auditoria automática por produto

Cada cartão de resultado e cada item guardado sem fotografia passa por uma resolução própria. A estratégia é:

1. usar o `productCode`/GTIN já conhecido quando existe;
2. para resultados Continente com `pid`, tentar obter o EAN exato através de `cesta.pt/get_product`;
3. procurar esse código nas bases Open Facts;
4. sem código, pesquisar o nome + embalagem do produto;
5. calcular uma pontuação por nome, marca, tokens e quantidade;
6. aceitar apenas resultados com confiança mínima de 0,74;
7. manter o placeholder quando não há correspondência suficientemente segura.

As bases consultadas são escolhidas por tipo de produto:

- Open Food Facts — alimentação/bebidas e fallback geral;
- Open Beauty Facts — higiene pessoal/cosmética;
- Open Products Facts — limpeza, casa, parafarmácia e produtos gerais;
- Open Pet Food Facts — alimentação animal.

A auditoria limita-se a três resoluções concorrentes para evitar rajadas de pedidos quando uma pesquisa devolve muitos resultados.

### Imagem ampliável

Qualquer fotografia real apresentada no Mercado passa a ser um controlo focável/tátil. Ao tocar ou clicar na miniatura abre um `<dialog>` com:

- imagem ampliada e responsiva;
- nome do produto;
- origem da fotografia;
- botão Fechar;
- fecho por Esc ou toque no backdrop;
- safe areas em iPhone;
- dark mode, foco visível e `prefers-reduced-motion`.

### Persistência

Quando a auditoria resolve uma fotografia para um item já guardado, são persistidos apenas os metadados já previstos pelo schema:

- `productCode` quando comprovável e ainda ausente;
- `imageUrl`;
- `imageSource`;
- `imageMatchedAt`.

Nenhum ficheiro binário é guardado no cofre.

## Veracidade da imagem

A fotografia continua separada do preço e da ligação oficial da loja. `cesta.pt` permanece a origem do preço/URL de Pingo Doce e Continente; as bases Open Facts são usadas apenas para a referência visual.

A aplicação não afirma que uma fotografia Open Facts é “imagem oficial Continente/Pingo Doce”. Quando existe EAN exato a confiança de identidade é maior; quando só existe correspondência textual, aplica-se o limiar de confiança. Se não houver prova suficiente, fica o placeholder.

Isto é deliberado: a PWA estática não consegue auditar de forma fiável o HTML das páginas dos retalhistas a partir do browser devido a políticas cross-origin/CORS. Não foi adicionado um proxy genérico de scraping apenas para forçar cobertura visual.

## Segurança e privacidade v59

- sem alterações a PIN, PBKDF2, AES-GCM, IndexedDB, backups ou sincronização;
- sem alteração de `estimatedCents`, `actualCents`, quantidade ou cálculos financeiros;
- sem API keys, passwords, tokens ou cabeçalhos Authorization no novo módulo;
- pedidos de imagem usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- nenhum dado financeiro do cofre é enviado às bases de imagem;
- `cesta.pt` é reutilizado apenas para detalhe do produto Continente quando é útil obter EAN;
- não foi introduzido Microlink, Jina, AllOrigins, CORS proxy ou outro proxy genérico de páginas;
- a CSP pública v59 permite exclusivamente os hosts Open Facts necessários a API/imagens;
- o cache público avança para `conta-de-casa-public-v59-product-images`.

## Build e distribuição v59

`scripts/prepare-pages.cjs` passa a compor `v59` e inclui na allowlist pública:

- `market-image-audit.css`;
- `market-image-audit.js`.

O HTML público gerado recebe:

- `app-build=v59`;
- query strings `?v=59`;
- referências à nova camada;
- CSP ampliada apenas para Open Food/Beauty/Products/Pet Facts.

`app-update.js` contém uma nova entrada v59 em `APP_RELEASE_NOTES`, portanto **Definições → Atualização de Software → Mais detalhes** apresentará esta revisão após publicação.

## Validação automatizada

CI da branch `feature/product-image-audit-v59`: workflow `33995086764` — `success`.

A execução validou, entre outras suites:

- sintaxe de todos os módulos, incluindo `market-image-audit.js`;
- finanças, invariantes e auditoria financeira;
- isolamento do cofre e segurança;
- formulários e captura QR;
- pesquisa Mercado e imagens reais;
- novo teste de auditoria/zoom de imagens;
- scanner de códigos de barras;
- responsividade, navegação e acessibilidade;
- Centro de Atualização;
- sincronização;
- manifest.

O teste v59 confirma também a ausência de proxy genérico/credenciais, a allowlist de fontes, a composição real de `dist/`, safe areas e o comportamento de ampliação.

## Estado das revisões anteriores

### v58 — Centro de Atualização de Software

Integrado e publicado. O PR #29, CI principal `33993333620` e Deploy Pages `33993353252` terminaram com sucesso. Permanece pendente uma validação física completa do lifecycle numa transição real de versões.

### v57 — fotografias reais

Introduziu `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` e a primeira resolução via Open Food Facts. A v59 mantém este contrato e corrige a cobertura limitada/ausência de ampliação.

### v56 / v55

Cofre visual moderno, sistema Lucide e hierarquia mobile da Lista de compras permanecem integrados, sem alteração do modelo criptográfico ou financeiro.

## Limitações conhecidas

Não é possível garantir fotografia para 100% dos produtos. Uma cobertura total exigiria que cada SKU tivesse uma imagem pública identificável ou uma infraestrutura própria que recolhesse/normalizasse as imagens dos retalhistas. A v59 prefere ausência de fotografia a mostrar uma imagem errada.

A validação automatizada também não substitui o comportamento real de Safari/iPhone, sobretudo abertura do `<dialog>`, safe areas, qualidade das imagens e latência de auditoria numa ligação móvel.

## Próximo passo

1. integrar a branch apenas com CI verde;
2. publicar v59 pela pipeline normal de GitHub Pages;
3. no iPhone/Safari, pesquisar exemplos com e sem imagem e confirmar que as miniaturas deixam de ser estáticas;
4. validar toque → ampliação → fechar em 320, 375, 390 e 430 px;
5. pesquisar os exemplos indicados de Continente/Pingo Doce e confirmar que não é apresentada uma imagem de variante errada;
6. confirmar que produtos sem correspondência pública segura mantêm placeholder em vez de fotografia incorreta;
7. validar a transição real v58 → v59 através de **Atualização de Software**.
