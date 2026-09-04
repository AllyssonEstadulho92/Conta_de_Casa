# Arquitetura — Conta de Casa

## Visão geral

Aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A aplicação é local-first e utiliza JavaScript no cliente para regras de negócio, renderização, formulários, persistência cifrada e sincronização opcional.

## Camadas principais

### Interface

- `index.html`: estrutura semântica das páginas, navegação, diálogos e controlos.
- `styles.css`: estilos históricos/base e regras responsivas legadas.
- `design-system.css`: tokens, componentes e sistema visual principal.
- `mobile-layout.css`: camada de compatibilidade para estabilidade do viewport mobile e ajustes validados em iPhone.
- `market-experience.css`: camada final e estritamente contextual da página Mercado e do diálogo `market-browser`, responsável por reproduzir o protótipo aprovado sem alterar visualmente as restantes áreas.

Ordem CSS pública:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`
4. `market-experience.css`

### JavaScript

- `core.js`: estado base, utilitários, cifragem/persistência e definições globais.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas e componentes.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub privado.
- `events.js`: eventos, navegação, métricas de viewport e interação.
- `market-experience.js`: controlador isolado do protótipo de comparação de produtos/mercados. Interceta apenas a criação de novo item (`#newMarketBtn` e ação rápida Mercado); a edição de itens existentes permanece no fluxo de `forms.js`.

## Fluxo Mercado v51

1. A página `page-market` continua a ser renderizada por `renderMarket()` e continua a usar o mesmo estado persistido.
2. **Adicionar item** abre o `formDialog` com `data-mode="market-browser"`.
3. O comparador apresenta pesquisa, tabs, seleção de mercados e cartões de comparação.
4. Os preços existentes no comparador v51 são dados de demonstração e ficam apenas em memória/DOM.
5. Ao adicionar um produto, é criado um registo no array `appState.market` usando exclusivamente o schema já existente. `estimatedCents` é gravado como `0`, impedindo que um valor fictício entre nos cálculos.
6. A edição posterior do item usa o formulário existente e permite ao utilizador indicar o preço estimado real.

O schema de `normalizeMarketItem()` não foi alterado.

## Integração de preços reais

A build v51 **não implementa fetch a retalhistas nem a serviços externos**. A aplicação continua sem backend e a CSP mantém `connect-src 'self' https://api.github.com`.

Uma integração futura de preços reais deverá ser tratada como um subsistema separado, com pelo menos:

- fontes verificadas e documentadas por mercado;
- backend/proxy ou serviço próprio para resolver CORS e impedir scraping direto no browser;
- normalização por EAN/GTIN, quantidade, unidade e embalagem;
- identificação de mercado, loja/região, data/hora da recolha, preço normal e promoção;
- cache e controlo de caducidade;
- tolerância a falhas e indisponibilidade parcial por mercado;
- indicação explícita de origem e atualidade do preço;
- validação de termos de utilização, privacidade e segurança antes de ativação.

## Viewport e navegação mobile

O corpo da aplicação mantém um contentor de scroll próprio no mobile. O shell permanente usa unidades CSS dinâmicas (`dvh`/`svh`). `window.visualViewport` continua disponível em `events.js`, mas deve ser usado apenas para situações transitórias, nomeadamente teclado virtual e posicionamento de diálogos.

O diálogo do comparador ocupa o viewport móvel e considera `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`. Em desktop mantém largura máxima de 760 px e scroll interno.

A navegação inferior é fixa e contém quatro destinos principais. O menu completo é apresentado através de drawer.

## Dados e segurança

- Persistência principal: IndexedDB.
- Estado financeiro cifrado antes de armazenamento.
- Derivação de chave: PBKDF2-SHA-256.
- Cifragem: AES-GCM 256.
- PIN/palavra-passe não é armazenado.
- Backups são cifrados.
- Sincronização é opcional, desativada por defeito e usa repositório GitHub privado configurado pelo utilizador.
- CSP restringe origens e impede carregamento arbitrário de recursos externos.
- `market-experience.js` não introduz pedidos de rede externos.

## Distribuição

`scripts/prepare-pages.cjs` cria `dist/` exclusivamente a partir de uma allowlist de assets públicos. O workflow de Pages só publica uma revisão depois da conclusão bem-sucedida do CI.

O Service Worker (`sw.js`) mantém cache offline apenas dos assets públicos autorizados. Na build v51, `market-experience.css` e `market-experience.js` fazem parte da allowlist e do cache público.

## Regra de manutenção

Alterações de layout não devem modificar cálculos, schema, cifragem ou sincronização. Mudanças no conjunto de assets públicos devem ser refletidas simultaneamente em `index.html`, `scripts/prepare-pages.cjs`, `sw.js` e testes de regressão.

A camada `market-experience.*` deve continuar isolada até existir validação visual em browser real e uma decisão explícita sobre eventual consolidação no design system principal.
