# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA
Revisão UX candidata: `75-usability1`

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, Mercado e catálogos são camadas separadas. Permanecem obrigatórios:

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhuma password, token ou chave embutida no código público.

## 2. Núcleo

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos.

As revisões visuais não alteram `core.js`, `finance.js`, pagamentos, faturas, QR, scanner, quantidades ou valores financeiros.

## 3. Composição da interface

O HTML de raiz funciona como template funcional. A distribuição pública é preparada por `scripts/prepare-pages.cjs`, que copia apenas os ativos permitidos para `dist/`, ajusta o build e injeta as camadas visuais/runtime da versão publicada.

Ordem conceptual das camadas atuais:

1. base: `styles.css`, `design-system.css`, `mobile-layout.css`;
2. experiência v74 e componentes específicos;
3. arquitetura v75: `v75-architecture.css/js`;
4. refinamentos de cabeçalho, estabilidade, proporção e drawer;
5. `v75-usability.css` como última camada transversal de interação;
6. componentes específicos do Mercado e runtimes que não modificam o núcleo financeiro.

A existência de nomenclaturas/estilos de fallback na base é deliberadamente tolerada enquanto a camada v75 estiver ativa. Consolidação física só deve remover código depois de confirmar ausência de referências e regressões.

## 4. Arquitetura de informação v75

Navegação mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer/desktop acrescenta Relatórios, Metas, Segurança e Diagnóstico. `v75-architecture.js` mantém a correspondência entre páginas internas e os respetivos pais de navegação, incluindo Calendário em Despesas, Metas em Planeamento e Segurança/Diagnóstico em Mais.

A página **Mais** funciona como hub de organização, conta/dados e aplicação, sem duplicar estado financeiro.

## 5. Ícones

A linguagem visual oficial é Lucide local através de `ui-icons.js` e `ui-icons.css`.

- sem CDN ou web font;
- `viewBox 24×24`, `currentColor`, dimensões explícitas;
- SVGs e glifos existentes no HTML/base funcionam como fallback antes da hidratação;
- a hidratação normaliza marca, navegação, pesquisa, selects, bloqueio, privacidade, tema, alertas, ações e diálogos.

A dívida técnica restante é reduzir fallbacks duplicados numa fase de consolidação, não substituí-los de forma agressiva durante a auditoria funcional.

## 6. Interação mobile e anti-zoom — `75-usability1`

A política adotada distingue dois comportamentos:

- **auto-zoom de foco do Safari/iOS**: evitado com controlos de formulário a pelo menos `16px` em mobile;
- **zoom acidental por duplo toque em controlos**: reduzido com `touch-action: manipulation` nos elementos interativos.

Não é usado `user-scalable=no` nem `maximum-scale=1`. O pinch-to-zoom permanece disponível para acessibilidade.

Alvos tácteis usam referência mínima de 44 px e, nos controlos densos de Despesas/Mercado, 48 px quando aplicável.

## 7. Cofre e PIN

Fluxo funcional:

`PIN → unlockVault() → enterApp() → sincronização conforme estado → shell`

`75-startup2` permite que um dispositivo previamente emparelhado apresente a cópia local já decifrada sem aguardar a rede e inicia `syncNow('startup-background')` em segundo plano. Primeiro emparelhamento e estados não confirmados conservam o gate original.

A camada `75-usability1` não toca em derivação de chave nem validação do PIN. Em mobile reforça apenas:

- viewport dinâmico `100dvh`;
- safe areas;
- scroll controlado quando o teclado reduz a área útil;
- cartão de cofre responsivo;
- alvos tácteis do teclado/ações.

## 8. Mercado — identidade e imagens

Produtos continuam identificados por `marketId|pid`. Fotografias oficiais não representam preço nem transação.

- `market-image-library.js`: cache partilhado de URL oficial validado;
- `market-visual-catalog.js`: índice progressivo + renderer incremental;
- `pingo-doce-photo-library.js`: inventário dedicado Pingo Doce;
- `market-catalog-image-resolver.js`: resolvedor exato `75-catalog4`;
- `market-photo-loader.js`: hidratação prioritária `75-photo-loader3`.

Para um cartão com `sourceUrl` oficial exata, a tentativa direta é limitada e não repete o bridge legado. O loader usa estados carregar → validar → **Sem fotografia** e mantém o SKU mesmo sem imagem.

## 9. Bases de imagens

### Partilhada

DB: `conta-de-casa-market-image-library`

Store: `images`

Chave: `marketId|pid`

Guarda apenas URL oficial validado, página oficial, nome/embalagem técnicos e timestamps.

### Pingo Doce

DB: `conta-de-casa-pingo-doce-photo-library`

Store principal: `products`

Estados: `pending | ready | missing`.

## 10. Segurança

As camadas visuais/imagens não podem manipular `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, passwords ou tokens salvo nos módulos funcionais já responsáveis por esses dados.

`75-usability1` é CSS puro e não introduz scripts, rede, armazenamento, segredos ou origens CSP.

## 11. Distribuição e cache

O gerador Pages inclui `v75-usability.css?v=75-usability1` no final das camadas visuais transversais. O Service Worker inclui o mesmo ativo na allowlist e usa cache revisionado com `usability1`, garantindo invalidação do cache anterior após publicação.

## 12. QA

O teste `tests/v75-stability.test.cjs` valida também:

- `touch-action: manipulation`;
- `16px` nos controlos mobile;
- ausência de `maximum-scale`/`user-scalable=no` no viewport;
- safe areas/`100dvh` do cofre;
- inclusão no bundle de Pages e no Service Worker;
- isolamento da camada de usabilidade relativamente a estado financeiro/criptografia.

A validação em hardware continua necessária para Safari/PWA e Android/Chrome.
