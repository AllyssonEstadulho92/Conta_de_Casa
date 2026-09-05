# Arquitetura — Conta de Casa

## Visão geral

Aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A aplicação é local-first e executa no cliente as regras de negócio, renderização, formulários, persistência cifrada e sincronização opcional.

## Camadas principais

### Interface

- `index.html`: estrutura semântica, CSP, navegação, páginas e diálogos.
- `styles.css`: estilos base/legados.
- `design-system.css`: tokens e componentes visuais principais.
- `mobile-layout.css`: compatibilidade e estabilidade do viewport móvel.
- `market-experience.css`: camada contextual da página Mercado e do diálogo `market-browser`.

Ordem CSS pública:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`
4. `market-experience.css`

### JavaScript

- `core.js`: estado, utilitários, cifragem e persistência.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub.
- `events.js`: eventos, navegação, viewport e interação.
- `market-experience.js`: pesquisa de preços externos e criação de itens a partir dos resultados.

## Mercado v52 — fluxo de pesquisa

1. O utilizador abre **Adicionar produto**.
2. O campo inicia vazio; não existem resultados ou preços pré-carregados.
3. A partir de 2 caracteres, a pesquisa é debounced e cancela a pesquisa anterior quando o texto muda.
4. Só são consultadas as fontes correspondentes aos mercados selecionados.
5. Resultados remotos são normalizados para um modelo transitório de UI e não são armazenados automaticamente.
6. Ao pressionar `+`, é criado um item através do mesmo array `appState.market` já existente.
7. O preço consultado entra como `estimatedCents`; `actualCents` permanece `0` até confirmação do utilizador.
8. A edição posterior continua no formulário `openMarketForm()` existente.

O schema de `normalizeMarketItem()` não foi alterado.

## Fontes externas de preços

### Continente / Pingo Doce — cesta.pt

Endpoint utilizado: `https://cesta.pt/mcp`.

A integração usa MCP sobre HTTP/SSE:

- `initialize`;
- `notifications/initialized`;
- `tools/call` com a ferramenta `search_products`.

A resposta é textual e é convertida para campos internos: cadeia, nome, embalagem, preço, promoção, preço por unidade, pid e URL oficial. A URL só é exposta se o host pertencer à allowlist `continente.pt` ou `pingodoce.pt` e usar HTTPS.

A integração não utiliza criação de carrinhos, autenticação nem credenciais de retalhistas.

### Mercadona Portugal — Open Prices

Base utilizada: `https://prices.openfoodfacts.org/api/v1`.

Fluxo:

1. `/locations` localiza apenas Mercadona em Portugal com registos de preço;
2. `/products` procura produtos pelo nome;
3. `/prices` cruza IDs de produto e de localização;
4. resultados sem `proof_id`/comprovativo são rejeitados;
5. é apresentada a data da observação e a localidade da loja;
6. a idade do registo determina o estado visual: recente, datado ou antigo.

Esta fonte é baseada em observações públicas com comprovativos e não deve ser confundida com uma API oficial da Mercadona. Cobertura e atualidade podem ser incompletas.

## Política de veracidade dos preços

- nunca usar dados de demonstração como se fossem reais;
- nunca substituir Mercadona Portugal por preços da Mercadona Espanha;
- não apresentar um preço observado antigo como “atual”;
- ausência de fonte verificável resulta em estado “sem preço verificado”, não em fallback fictício;
- preço externo é sempre uma estimativa até o utilizador confirmar o valor efetivamente pago.

## Segurança de conteúdo remoto

- nenhuma API key ou segredo é necessário para as integrações atuais;
- CSP `connect-src` restringe chamadas a `self`, GitHub API, `cesta.pt` e `prices.openfoodfacts.org`;
- strings remotas são normalizadas, limitadas e escapadas antes de entrar no DOM;
- URLs remotas do cesta.pt passam por allowlist de domínio e protocolo;
- pedidos têm timeout e podem ser abortados quando a pesquisa muda;
- falha de uma fonte não deve destruir resultados válidos da outra fonte.

## Privacidade

Os dados financeiros e o cofre continuam locais/cifrados. A pesquisa de Mercado é uma exceção explícita: o termo pesquisado é enviado às fontes externas necessárias para obter preços. Não são enviados PIN, palavra-passe, conteúdo do cofre, faturas ou dados financeiros.

## Viewport e navegação mobile

O shell permanente usa `100dvh`/`100svh`. `VisualViewport` permanece limitado a comportamento transitório de teclado/diálogos. O diálogo do Mercado ocupa o viewport móvel, respeita `safe-area-inset-top` e `safe-area-inset-bottom` e usa scroll interno.

## Distribuição

`scripts/prepare-pages.cjs` gera `dist/` através de allowlist de assets públicos. O Service Worker mantém cache apenas desses assets. Chamadas de preços usam `cache: no-store` no runtime e não são incluídas no cache offline do Service Worker.

## Regra de manutenção

Qualquer alteração futura às fontes de preços deve ser auditada quanto a: origem, território, CORS, termos de utilização, privacidade, atualização, evidência/prova, erros parciais e possibilidade de alteração silenciosa do formato de resposta.
