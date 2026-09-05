# Changelog Técnico — Conta de Casa

## 2026-09-05 — Auditoria e ampliação de imagens de produto v59

### Problema observado

Na pesquisa **Adicionar produto** em iPhone, vários resultados de Pingo Doce/Continente apareciam com o placeholder diagonal apesar de existirem fotografias públicas do artigo. As miniaturas que existiam também eram estáticas: tocar nelas não abria uma imagem maior.

A causa principal era a estratégia v57: uma única pesquisa ampla no Open Food Facts para todo o termo, com poucos candidatos, seguida de matching para vários resultados. Em pesquisas genéricas como “café”, isso não cobria todos os SKUs devolvidos pelo retalhista.

### Alterações

- criado `market-image-audit.js` para auditar cada resultado sem imagem individualmente;
- criado `market-image-audit.css` para miniaturas tácteis e visualizador fullscreen/responsivo;
- resultados existentes com fotografia passam a poder ser tocados/clicados para ampliar;
- novo `<dialog id="marketProductImageViewer">` mostra imagem ampliada, nome e origem;
- fecho por botão, Esc e backdrop;
- safe areas, dark mode, foco visível e `prefers-reduced-motion` suportados;
- resolução de imagem passa a preferir GTIN/EAN exato quando disponível;
- para resultados Continente, o `pid` já devolvido pelo fluxo `cesta.pt` é usado para tentar obter EAN via `get_product`;
- sem código exato, cada artigo é pesquisado por nome + embalagem;
- matching textual considera cobertura de tokens, precisão, nome, marca e quantidade;
- resultados abaixo de `0.74` são rejeitados;
- auditoria limitada a três produtos simultâneos para evitar rajadas de rede;
- uma imagem resolvida durante a pesquisa é reutilizável pelo mesmo nome quando o produto é adicionado;
- itens já guardados sem imagem também são auditados progressivamente;
- imagens resolvidas para itens guardados persistem `imageUrl`, `imageSource`, `imageMatchedAt` e `productCode` quando comprovável;
- binários da fotografia continuam fora do cofre.

### Fontes de imagem

A cobertura deixa de depender exclusivamente do Open Food Facts e passa a usar, conforme o tipo de artigo:

- Open Food Facts;
- Open Beauty Facts;
- Open Products Facts;
- Open Pet Food Facts.

O preço e a ligação oficial continuam exclusivamente no fluxo existente de Pingo Doce/Continente via `cesta.pt`. A fotografia é uma referência visual independente.

### Segurança e privacidade

- nenhum proxy genérico de scraping foi introduzido;
- nenhum Microlink/Jina/AllOrigins/CORS proxy em runtime;
- sem API key, Authorization ou credenciais externas;
- pedidos usam `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- nenhuma fatura, montante, PIN, chave do cofre ou token GitHub é enviado para resolver fotografias;
- a CSP pública é alargada apenas às famílias Open Facts necessárias;
- `cesta.pt` é reutilizado somente para detalhe de produto já dentro da arquitetura do Mercado.

### Build e atualização

- build público passa a `v59`;
- cache do Service Worker passa a `conta-de-casa-public-v59-product-images`;
- `market-image-audit.css` e `market-image-audit.js` entram na allowlist do Service Worker e de `prepare-pages.cjs`;
- `APP_RELEASE_NOTES` recebe a entrada **v59 — Imagens de produto e ampliação**;
- a composição `dist/` injeta os novos assets e a CSP v59;
- `dist/events.js` é carimbado para `./sw.js?v=59`.

### Testes

- criado `tests/market-image-audit.test.cjs`;
- CI passa a verificar sintaxe do novo módulo e o novo teste;
- workflow Pages repete a mesma validação antes do deploy;
- testes existentes de Mercado, imagens, ícones, responsividade e update center foram alinhados com o cache/build v59;
- workflow de branch `33995086764` terminou com `success` antes da atualização documental.

### Limitação aceite

Não se promete 100% de cobertura visual. Quando um SKU não tem fotografia pública identificável ou a correspondência é insuficiente, mantém-se o placeholder. Esta decisão evita apresentar imagens de variantes erradas só para preencher a interface.

## 2026-09-05 — Centro de Atualização de Software v58

- criado `app-update.js`/`.css`;
- adicionada **Definições → Atualização de Software**;
- estado de atualizações automáticas ligado ao Service Worker real;
- Beta mantido desativado sem pipeline própria;
- verificação manual usa `ServiceWorkerRegistration.update()` e `SKIP_WAITING`;
- `APP_RELEASE_NOTES` passa a concentrar novidades de cada versão;
- bundle Pages passou a ser carimbado como v58;
- cache `conta-de-casa-public-v58-software-update`;
- PR #29, CI de `main` e Deploy Pages concluídos com sucesso.

## 2026-09-05 — Fotografias reais v57

- removido o avatar que simulava fotografia;
- introduzidos `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt`;
- primeira pesquisa de fotografia real via Open Food Facts;
- apenas correspondências fortes eram apresentadas;
- imagem permanecia separada do preço e da ligação oficial;
- apenas URL/metadados eram persistidos, sem binários.

## 2026-09-05 — Cofre moderno v56

- ecrã de PIN redesenhado com cartão moderno, teclado circular e safe areas;
- PIN/palavra-passe, PBKDF2, AES-GCM e IndexedDB preservados;
- não foi apresentada biometria/passkey inexistente;
- dark mode e redução de movimento mantidos.

## 2026-09-05 — Hierarquia mobile e Lucide v55/v54

- Lucide adotado como sistema visual oficial local;
- pesquisa Safari e setas de `select` normalizadas;
- removido `+` visual duplicado em botões compactos;
- página Lista de compras aproximada do protótipo aprovado;
- título com carrinho, scanner como ação secundária, cartões-resumo e navegação inferior normalizados;
- sem alterações aos cálculos financeiros.

## 2026-09-05 — QR de faturas e scanner de produtos

- leitura QR de faturação portuguesa por câmara/imagem, com pré-visualização antes de preencher;
- imagens de faturas não persistidas;
- scanner EAN/UPC/GTIN com ZXing fixo;
- GTIN identifica o artigo e não é tratado como preço;
- câmara processada localmente e encerrada em todos os fluxos relevantes.

## 2026-09-05 — Mercado v53/v52

- Pingo Doce e Continente passam a fornecer preços atuais através de `cesta.pt/mcp`;
- Mercadona removida por ausência de fonte portuguesa suficientemente verificável;
- `estimatedCents` passa a representar preço pesquisado por unidade;
- `actualCents` continua separado para preço efetivamente pago;
- quantidade multiplica automaticamente o preço por unidade nos totais;
- criação, edição, filtros e cálculos financeiros mantêm invariantes testadas.

## Histórico anterior

As revisões anteriores a v52 permanecem preservadas no histórico Git do repositório. Este changelog foi consolidado na v59 para manter as decisões e alterações que continuam materialmente relevantes para a arquitetura atual.
