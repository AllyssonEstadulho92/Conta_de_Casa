# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v63`
Build candidato: `v64`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. Integrações externas do Mercado servem apenas descoberta/identificação de catálogo e preço; não recebem o conteúdo financeiro do cofre.

## Persistência e segurança

- `core.js`: normalização, utilitários, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema base: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem cookies/telemetria financeira;
- segredos e PIN não são incluídos no código público.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários;
- `finance.js` — cálculos e invariantes financeiros;
- `render.js` — renderização e navegação de páginas;
- `forms.js` — formulários, validação e mutações;
- `events.js` — eventos globais, viewport, cofre e Service Worker;
- `sync.js` — sincronização cifrada opcional;
- `sync-conflict-policy.js` — equivalência de negócio do Mercado sem ruído de metadados técnicos;
- `market-experience.js` — catálogo/preço Pingo Doce e Continente através de `cesta.pt`;
- `market-barcode.js` — leitura GTIN/EAN/UPC e identificação de produto;
- `market-category-groups.js` — agrupamento visual da lista de compras;
- `ui-icons.js` — subset Lucide local;
- `invoice-capture.js` — leitura local de QR fiscal;
- `app-update.js` — Centro de Atualização;
- `v64-runtime.js` — camada candidata v64 para correspondência conservadora do scanner e ciclo de faturas recorrentes **Por preencher**.

Os módulos históricos `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` continuam distribuídos por compatibilidade, embora a UI principal seja `text-first` e não dependa de fotografias.

## Ordem das camadas CSS

A ordem pública é intencional:

1. `styles.css` — base histórica;
2. `design-system.css` — tokens/componentes/layout;
3. `mobile-layout.css` — compatibilidade móvel/Safari;
4. `market-experience.css` — estrutura do Mercado;
5. `market-brand.css` — identidade text-first;
6. `market-category-groups.css` — agrupamento por categoria;
7. `ui-icons.css` — sistema Lucide e componentes visuais;
8. `ui-consistency.css` — consolidação v63: ícones, indicador único, cartões-resumo;
9. `v64-runtime.css` — **última camada candidata**, responsável pelo cabeçalho móvel estável/safe area e estado visual das faturas por preencher.

A última camada não altera cálculos ou cifragem.

## Navegação e viewport móvel

### Estrutura mantida

Em mobile, `.main` continua a ser o scroller interno da aplicação e a navegação inferior continua fixa. Esta opção preserva o tratamento existente de teclado, diálogos e bottom navigation.

### Correção v64 do cabeçalho

O cabeçalho deixou de depender de `position:sticky` dentro do scroller interno. Em Safari/iPhone, as capturas mostraram que a primeira linha podia deslocar-se parcialmente para fora da área visível após scroll.

Na v64:

- `.topbar` usa `position:fixed` até 820 px;
- `top`, `left` e `right` são definidos explicitamente com o gutter da página;
- `--mobile-top-safe` respeita `env(safe-area-inset-top)` e mantém uma folga tátil mínima quando o navegador devolve zero;
- `.main` recebe `padding-top: var(--header-height)` para que o conteúdo nunca fique atrás do cabeçalho;
- `scroll-padding-top` continua alinhado com a altura real do topo.

Esta correção isola o problema do Safari sem substituir o modelo de viewport/teclado da aplicação inteira.

## Sistema de ícones

Lucide permanece o único sistema vetorial oficial da aplicação. `ui-consistency.css` impõe:

- `stroke-width: 2`;
- linecap/linejoin arredondados;
- `vector-effect: non-scaling-stroke`;
- tamanhos contextuais previsíveis;
- um único indicador ativo na navegação móvel (`::before`);
- supressão dos `::after` redundantes.

Os cartões-resumo do Mercado usam um `inset` sólido para a faixa cromática; o pseudo-elemento `::before` fica reservado ao ícone semântico.

## Mercado e código de barras

### Fontes

- Pingo Doce e Continente: pesquisa de produto/preço via `https://cesta.pt/mcp`;
- Open Food Facts: identificação auxiliar do produto a partir do código de barras;
- o preço não é inventado nem derivado da fotografia.

### Fluxo v64

1. o utilizador escolhe exatamente um supermercado para leitura precisa;
2. o scanner valida checksum GTIN/EAN/UPC e identifica o produto;
3. o Mercado consulta os resultados reais dessa loja;
4. `v64-runtime.js` compara loja, nome/marca e embalagem;
5. auto-adição só ocorre com score `>= 0.84` e diferença `>= 0.10` face ao segundo candidato;
6. uma correspondência ambígua exige confirmação manual;
7. GTIN repetido num item ainda pendente incrementa a quantidade em vez de duplicar a linha.

### Regra financeira

O preço encontrado pelo catálogo atualiza `estimatedCents`. O scanner não escreve `actualCents`. O preço efetivamente pago só deve ser registado quando existe confirmação de compra/talão.

## Faturas recorrentes v64

As ocorrências futuras automáticas passam a poder ter `draft: true` na camada v64.

Para uma nova ocorrência recorrente:

- preservados: descrição, fornecedor, categoria, método, regra de recorrência, vencimento;
- limpos: valor total, referência, observações e data de emissão;
- `totalCents = 0` enquanto estiver **Por preencher**;
- o estado draft não entra nos totais pendentes/em atraso;
- ao preencher e guardar, `draft` passa a `false` e a fatura regressa ao fluxo financeiro normal.

A migração só atua sobre ocorrências geradas automaticamente e ainda não alteradas. Faturas com pagamentos ou intervenções do utilizador são preservadas.

## Centro de Atualização

`release-manifest.json` é a fonte pública de versões e notas. `scripts/prepare-pages.cjs` exige que `latestVersion` corresponda ao build.

Fluxo:

1. Pages publica os novos assets e o novo Service Worker;
2. o Centro consulta o manifesto same-origin com `cache: no-store`;
3. o novo worker pode ficar `waiting`;
4. **Atualizar agora** envia `APPLY_UPDATE`;
5. o worker ativa, remove caches antigos, reclama clientes e reinicia/navega a aplicação.

A atualização substitui assets da aplicação; não apaga nem recria o cofre financeiro.

## Distribuição v64 candidata

- build: `v64`;
- revisão visual: `64-ui1`;
- runtime: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1`;
- PR: #44;
- publicação em `main` ainda pendente até CI final verde e revisão do diff.

## Regressões obrigatórias

Antes de publicar, a CI deve validar:

- sintaxe;
- finanças e invariantes de contagem;
- isolamento/cifragem do cofre;
- datas civis, faturas, pagamentos e QR;
- Mercado, scanner, quantidade × preço e compatibilidade histórica de imagens;
- ícones e consistência visual;
- atualização e manifesto;
- segurança/CSP/allowlist;
- responsividade, viewport móvel, navegação e acessibilidade;
- sincronização e conflitos técnicos.

A CI automatizada não substitui a validação física final em Safari/iPhone.
