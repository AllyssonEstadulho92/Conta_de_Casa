# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build: `v75`  
Distribuição: GitHub Pages / PWA  
Usabilidade integrada: `75-usability1`  
Páginas integradas: `75-pages1`  
Biblioteca de design integrada: `75-assets1`

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, recursos visuais, Mercado e catálogos permanecem separados. São obrigatórios:

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhuma password, token, chave, kit ID ou segredo embutido no código público.

## 2. Núcleo funcional

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos.

Revisões visuais não podem alterar cálculos, pagamentos, faturas, QR, scanner, quantidades, preços confirmados, PIN ou derivação de chave.

## 3. Composição da interface e distribuição

O `index.html` é o template funcional. `scripts/prepare-pages.cjs` produz `dist/` através de uma allowlist explícita, ajusta o build e injeta apenas as camadas publicadas.

Ordem conceptual:

1. base: `styles.css`, `design-system.css`, `mobile-layout.css`;
2. experiência v74 e componentes específicos;
3. arquitetura v75: `v75-architecture.css/js`;
4. cabeçalho, estabilidade, geometria e drawer;
5. `v75-pages.css` — Início, Despesas e Planeamento;
6. `asset-loader.css` — estados genéricos de recursos visuais, antes de loaders especializados;
7. componentes específicos do Mercado, incluindo `market-photo-loader.css/js`;
8. `v75-usability.css` — camada final transversal de interação/anti-zoom;
9. `design-asset-library.js` e `asset-loader.js` — registo/política e carregador opt-in, sem substituir o núcleo funcional.

A existência de nomenclaturas e fallbacks históricos continua tolerada até uma consolidação com prova de ausência de regressões.

## 4. Arquitetura de informação v75

Navegação mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer/desktop acrescenta Relatórios, Metas, Segurança e Diagnóstico. `v75-architecture.js` mantém a correspondência entre páginas internas e pais de navegação.

## 5. Início

A composição usa as métricas existentes de `dashboardNumbers()` e componentes v74/v75:

- mês em análise;
- resumo do total gasto;
- orçamento e percentagem utilizada;
- ações rápidas;
- despesas por categoria;
- alertas existentes.

`75-pages1` altera apenas hierarquia, densidade, feedback e legibilidade.

## 6. Despesas

O fluxo funcional continua em `renderBills()`/`filterBills()` de `render.js`. A vista canónica contém Lista/Calendário, pesquisa, estado, categoria, datas, ordenação, resumo, cartões mobile/tabela desktop e ações existentes.

`75-pages1` reexpõe esses mesmos elementos no móvel e deixa de usar `cdcExpenseFeed` simplificado como vista principal. Não duplica filtros nem cálculos.

## 7. Planeamento

`v75-architecture.js` gera o resumo do orçamento/categorias; `renderPlanning()` mantém saldo atual, saldo inicial, orçamento, conciliação e rendimentos. `75-pages1` apenas reorganiza densidade e empilhamento.

## 8. Tipografia

Stack atual:

`Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif`

A política `75-assets1` estabelece:

- preferir uma família por aplicação e máximo de duas;
- verificar licença por família, canal e formato;
- self-host apenas quando juridicamente permitido;
- preferir WOFF2/subsets/pesos estritamente necessários;
- usar fallback de sistema e estratégia equivalente a `font-display: swap` quando houver webfont aprovada;
- não expandir `font-src 'self'` apenas para experimentar uma fonte externa.

## 9. Ícones

O sistema principal da Conta de Casa permanece **Lucide SVG local**, através de `ui-icons.js`/`ui-icons.css`.

- sem CDN/icon font como dependência base;
- `viewBox 24×24`, `currentColor`, dimensões explícitas;
- decorativos usam `aria-hidden`;
- botões apenas com ícone precisam de nome acessível;
- dimensão visual típica 18–24 px; alvo tátil mínimo 44 px;
- Material Symbols, Font Awesome e outros podem ser catalogados como fontes secundárias, mas não devem ser misturados sem decisão visual explícita;
- SVGs/glifos históricos funcionam apenas como fallback até consolidação segura.

## 10. Biblioteca transversal de design — `75-assets1`

`design-asset-library.js` expõe `CDCDesignAssetLibrary`.

O registo inclui fornecedores de fontes, ícones, animações e ferramentas de pairing. Cada entrada possui:

- `id` e nome;
- categoria;
- URL oficial conhecida;
- estado no projeto (`primary`, `conditional`, `reference-only`, `restricted`, `unverified`, etc.);
- estratégia de integração;
- nota de licença;
- regra operacional.

O catálogo **não é um package manager** e não inicia rede. A presença de um fornecedor no registo não autoriza incorporar qualquer ficheiro. `docs/DESIGN_ASSET_LIBRARY.md` documenta os critérios e fontes de verificação.

## 11. Loader genérico de assets — `75-assets1`

`asset-loader.js` expõe `CDCAssetLoader` e é opt-in. Só trabalha sobre elementos declarados com `data-cdc-*` ou pedidos explicitamente pela API.

### Imagens

- `loading="lazy"` por defeito;
- `decoding="async"`;
- `fetchPriority` quando suportado;
- prioridade alta pode usar `eager`;
- `data-cdc-src` permite diferir a atribuição do `src`;
- `IntersectionObserver` inicia recursos diferidos perto do viewport;
- estados `loading`, `ready` e `error`;
- `referrerPolicy="no-referrer"` por defeito;
- URL same-origin por defeito; data/blob são aceites apenas no contexto explicitamente permitido pelo loader.

### Vídeo/áudio

- `preload="metadata"` por defeito;
- sem autoplay introduzido pelo loader;
- estados de carregamento/erro normalizados.

### Lottie

- só aceita JSON local por defeito;
- não cria `<script>` nem injeta CDN;
- exige runtime `window.lottie` previamente aprovado e carregado localmente;
- `prefers-reduced-motion` impede a animação e permite fallback estático;
- falha de runtime resulta em estado `runtime-missing`, não em pedido remoto automático.

`asset-loader.css` fornece shimmer/fallback genérico, desativa movimento em `prefers-reduced-motion` e inclui suporte de `forced-colors`.

## 12. Interação mobile e anti-zoom — `75-usability1`

- controlos de formulário mantêm pelo menos 16 px no breakpoint mobile para evitar auto-zoom de foco Safari/iOS;
- `touch-action: manipulation` reduz zoom acidental por duplo toque em elementos interativos;
- não se usa `user-scalable=no` nem `maximum-scale=1`;
- pinch-to-zoom continua disponível;
- alvos tácteis usam mínimo de 44 px e 48 px quando aplicável.

`v75-usability.css` permanece depois das camadas de página/assets que possam afetar geometria de controlos.

## 13. Cofre e PIN

Fluxo:

`PIN → unlockVault() → enterApp() → sincronização conforme estado → shell`

`75-startup2` permite que um dispositivo emparelhado apresente a cópia local decifrada sem esperar pela rede e inicia `syncNow('startup-background')` em segundo plano. Primeiro emparelhamento e estados não confirmados mantêm o gate original.

A biblioteca/loader `75-assets1` não participa do cofre nem do processo de derivação da chave.

## 14. Mercado — identidade, fotografias e loader especializado

Produtos continuam identificados por `marketId|pid`. Fotografias oficiais não representam preço nem transação.

- `market-image-library.js`: cache partilhado de URL oficial validado;
- `market-visual-catalog.js`: índice progressivo + renderer incremental;
- `pingo-doce-photo-library.js`: inventário dedicado Pingo Doce;
- `market-catalog-image-resolver.js`: resolvedor exato `75-catalog4`;
- `market-photo-loader.js`: hidratação prioritária `75-photo-loader3`.

O loader genérico `75-assets1` **não substitui** esta cadeia. Os cartões do Mercado continuam sob as regras de PID, origem oficial, cache e retry já existentes.

## 15. Bases de imagens

Biblioteca partilhada:

- DB: `conta-de-casa-market-image-library`;
- store: `images`;
- chave: `marketId|pid`.

Pingo Doce:

- DB: `conta-de-casa-pingo-doce-photo-library`;
- store principal: `products`;
- estados: `pending | ready | missing`.

## 16. Segurança, CSP e privacidade

A revisão `75-assets1` não expande CSP. Em particular:

- `font-src` permanece `'self'`;
- nenhum Google Fonts, Adobe Fonts, Font Awesome Kit ou outro provider é contactado automaticamente;
- URLs Lottie externas são bloqueadas pelo loader genérico;
- nenhuma credencial, dado financeiro, PIN ou telemetria é enviado a fornecedores de design;
- nenhuma chave de kit/serviço deve existir no código público;
- um recurso externo futuro exige revisão explícita de licença, CSP, privacidade, disponibilidade offline e risco de supply chain.

`75-pages1`/`75-usability1` permanecem isolados do estado financeiro; `75-assets1` também não referencia `appState`, valores monetários, PBKDF2, AES-GCM ou funções de persistência.

## 17. Distribuição, cache e QA

O gerador Pages inclui, com `75-assets1`:

- `asset-loader.css` antes do loader visual especializado do Mercado;
- `design-asset-library.js`;
- `asset-loader.js`;
- `v75-usability.css` continua a última camada transversal de interação.

O Service Worker inclui os três ativos e acrescenta `assets1` no fim da revisão de cache para invalidar a distribuição anterior sem quebrar assinaturas históricas de testes.

`tests/design-asset-library.test.cjs` valida:

- fornecedores e gates de integração;
- política local-first e máximo de duas famílias;
- CSP sem novas origens de fontes/kits;
- URL policy same-origin;
- ausência de injeção de runtime remoto;
- lazy loading/async decode/prioridade de imagens;
- media com preload leve;
- fallback/reduced motion/forced colors;
- isolamento financeiro/criptográfico;
- presença e ordem dos ativos em `dist/` e Service Worker.

Publicação funcional confirmada no SHA `a8e04d6811bd6eb08487de139fb19fb2f12128ec`: CI de `main` run `34478047035` e GitHub Pages run `34478091014`, ambos com sucesso. Validação física continua necessária para componentes opt-in em Safari/PWA, Android/Chrome e desktop.
