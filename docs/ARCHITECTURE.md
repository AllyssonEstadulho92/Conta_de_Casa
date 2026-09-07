# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v64`

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
- `v64-runtime.js` — correspondência conservadora do scanner e ciclo de faturas recorrentes **Por preencher**.

Os módulos históricos `market-retailer-image-policy.js`, `market-image-audit.js` e `market-official-images.js` continuam distribuídos por compatibilidade, embora a UI principal seja `text-first`.

## Ordem das camadas CSS

A ordem pública é intencional:

1. `styles.css` — base histórica;
2. `design-system.css` — tokens/componentes/layout;
3. `mobile-layout.css` — compatibilidade móvel/Safari;
4. `market-experience.css` — estrutura do Mercado;
5. `market-brand.css` — identidade text-first;
6. `market-category-groups.css` — agrupamento por categoria;
7. `ui-icons.css` — sistema Lucide e componentes visuais;
8. `ui-consistency.css` — consolidação visual global;
9. `v64-runtime.css` — última camada, responsável pelo cabeçalho móvel/safe area e estado visual das faturas por preencher.

A última camada não altera cifragem nem persistência financeira.

## Navegação e viewport móvel

Em mobile, `.main` continua a ser o scroller interno e a navegação inferior permanece fixa. Na v64, `.topbar` usa `position:fixed` até 820 px; `--mobile-top-safe` respeita `env(safe-area-inset-top)`; `.main` recebe `padding-top: var(--header-height)` e `scroll-padding-top` acompanha a altura do topo.

O topbar é global. Início, Faturas, Lista de compras e Relatórios usam a mesma geometria: título, menu, botão `+`, Sync e fundo. Regras históricas específicas de Compras que acrescentavam carrinho, aumentavam tipografia e adicionavam chevron ao Sync são neutralizadas na camada final.

## Sistema de ícones

Lucide permanece o sistema vetorial oficial. `ui-consistency.css` mantém métrica previsível, stroke consistente, um único indicador ativo na navegação móvel e supressão de pseudo-elementos redundantes.

## Mercado e código de barras

### Fontes

- Pingo Doce e Continente: pesquisa de produto/preço via `https://cesta.pt/mcp`;
- Open Food Facts: identificação auxiliar por código de barras;
- `@zxing/browser`: biblioteca de leitura carregada em runtime a partir de `unpkg.com`.

A última dependência é funcional mas constitui superfície externa adicional. A estratégia de auto-hospedagem/integridade deve ser revista numa release de segurança dedicada.

### Fluxo v64

1. o utilizador escolhe exatamente um supermercado;
2. o scanner valida checksum GTIN/EAN/UPC e identifica o produto;
3. o Mercado consulta resultados dessa loja;
4. `v64-runtime.js` compara loja, nome/marca e embalagem;
5. auto-adição só ocorre com score `>= 0.84` e diferença `>= 0.10` face ao segundo candidato;
6. ambiguidade exige confirmação manual;
7. GTIN repetido num item pendente incrementa a quantidade.

O preço encontrado atualiza `estimatedCents`; o scanner não escreve `actualCents`.

## Faturas recorrentes v64

As ocorrências futuras automáticas podem ter `draft: true`:

- preservados: descrição, fornecedor, categoria, método, recorrência e vencimento;
- limpos: valor total, referência, observações e data de emissão;
- `totalCents = 0` enquanto estiver **Por preencher**;
- drafts não entram nos totais pendentes/em atraso;
- ao preencher e guardar, `draft` passa a `false`.

A migração só atua sobre ocorrências geradas automaticamente e ainda não alteradas.

## Centro de Atualização

`release-manifest.json` é a fonte pública de versões e notas. `scripts/prepare-pages.cjs` exige que `latestVersion` corresponda ao build. A atualização pública substitui assets da aplicação; não recria nem apaga o cofre.

## Pipeline de qualidade e distribuição

### CI

`.github/workflows/ci.yml` valida sintaxe, finanças, auditoria, invariantes, isolamento do cofre, datas, formulários, QR, Mercado, scanner, `v64-runtime`, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

### GitHub Pages

`.github/workflows/pages.yml` publica automaticamente apenas quando a CI de `main` terminou com sucesso. O workflow também suporta `workflow_dispatch` para redeploy manual.

Por essa razão, o passo **Verify tested revision** deve manter uma verificação autónoma coerente com os componentes críticos da release. Após a auditoria de 7 de setembro, inclui explicitamente:

- `node --check v64-runtime.js`;
- `node tests/v64-runtime.test.cjs`.

Isto impede que o caminho manual de Pages deixe de verificar a camada específica da v64.

## Distribuição v64

- build: `v64`;
- revisão visual: `64-ui1`;
- runtime: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1`;
- PR #44 integrado;
- commit público: `78612a9701d60938532d7be768ea35f84c36c7fc`;
- CI de `main`: sucesso;
- GitHub Pages: sucesso.

## Regressões obrigatórias

Antes de qualquer nova publicação devem permanecer cobertos:

- sintaxe e runtime específico da versão;
- finanças e invariantes de contagem;
- isolamento/cifragem do cofre;
- datas civis, faturas, pagamentos e QR;
- Mercado, scanner, quantidade × preço;
- ícones e consistência visual;
- cabeçalho móvel entre páginas principais;
- atualização e manifesto;
- segurança/CSP/allowlist;
- responsividade, viewport móvel, navegação e acessibilidade;
- sincronização e conflitos técnicos.

A CI automatizada não substitui a validação física final em Safari/iPhone.