# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA
Runtime publicado: `75-startup1`

## 1. Princípios e invariantes

A aplicação é uma PWA estática/local-first. Apresentação, Mercado, catálogo, transporte de navegação e sincronização são camadas separadas do núcleo financeiro.

Invariantes: `STATE_VERSION = 5`; valores monetários em cêntimos; estado financeiro em IndexedDB; PBKDF2-SHA-256 + AES-GCM para o cofre; sincronização opcional apenas do envelope cifrado; sem passwords, tokens ou chaves embutidos. Correções visuais/de disponibilidade não podem reescrever cálculos, persistência ou identidade do cofre.

## 2. Camadas principais

### Núcleo financeiro

- `core.js`: estado, normalização, persistência, sanitização e cifragem;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada.

### Interface v75

- `design-system.css`;
- `v74-experience.css/js`;
- `v75-architecture.css/js`;
- `v75-header-refinement.css`;
- `v75-stability.css/js`;
- `v75-startup-guard.js` (`75-startup1`);
- `v75-layout-polish.css`;
- `v75-market-featured.css/js`;
- `v75-drawer-theme.css`;
- `mobile-menu-toggle.css/js`.

### Mercado e imagens

- `market-experience.js`: pesquisa viva de produtos/preços;
- `market-category-groups.js`: categorias/lista;
- `market-barcode.js`: código de barras;
- `market-image-audit.js`: estados/validação de imagens;
- `market-retailer-image-policy.js`: política contra correspondência aproximada;
- `market-official-images.js`: bridge e validadores oficiais;
- `market-image-library.js`: cache persistente por `marketId|pid`;
- `market-catalog-image-resolver.js`: fotografia oficial (`75-catalog2`);
- `market-visual-catalog.js`: índice progressivo + renderer incremental (`75-catalog3`);
- `pingo-doce-photo-library.js`: expansão Pingo Doce (`75-pd-photo1`);
- `market-photo-loader.js`: prioridade/hidratação (`75-photo-loader2`).

## 3. Persistência e identidade de imagens

A biblioteca geral usa IndexedDB `conta-de-casa-market-image-library` e chave `marketId|pid`. Guarda apenas mercado, PID, metadados de diagnóstico, URL oficial validado, página oficial e timestamps/expiração. O catálogo visual usa `conta-de-casa-market-visual-catalog`, não persiste preço e **Ver preço atual** continua a usar a pesquisa viva.

## 4. Resolvedor oficial `75-catalog2`

`safeProductUrl()` valida HTTPS, retalhista, path e PID. A página oficial exata é lida, candidatos são filtrados por host/path/PID e a disponibilidade final é comprovada pelo `<img>`. Timeout do reader: 8 s. Concorrência direta: 2.

## 5. Renderer incremental `75-catalog3`

A grelha é reconciliada por `marketId|pid`: remove apenas chaves obsoletas, reutiliza nós DOM existentes, atualiza metadados sem substituir a área da fotografia e cria nós apenas para novas chaves. O aquecimento periódico não reconstrói a grelha; uma fotografia persistida em background emite `cdc:market-photo-ready`.

## 6. Biblioteca Pingo Doce e loader

`75-pd-photo1` mantém estados `pending|ready|missing`, limites por sessão/dia e suspensão offline/oculta/Save-Data. `75-photo-loader2` trabalha apenas no Mercado ativo, consulta cache primeiro, prioriza até 6 cartões, usa PID exato, polling limitado e cooldown de retry, sem escrever estado financeiro.

## 7. Arranque seguro `75-startup1`

### Riscos confirmados

Foram confirmados dois caminhos independentes capazes de produzir ecrã branco no Safari/PWA: navegação do Service Worker sem timeout e período em que `#vaultScreen` e `#app` podem ficar simultaneamente ocultos durante a barreira inicial de sincronização. A captura física não permite determinar qual ocorreu, por isso ambos foram corrigidos.

### Navegação

Para `event.request.mode === 'navigate'`, `sw.js` usa `navigationResponse()`:

1. obtém `./index.html` do Cache Storage;
2. tenta rede com `cache:'no-store'` e `AbortController`;
3. aborta após 4000 ms;
4. resposta `ok` é devolvida e atualiza o `index.html` em cache;
5. erro/timeout usa o `index.html` instalado;
6. se não existir rede nem cache, devolve 503 textual.

Os restantes assets mantêm network-first com `cache:'no-store'` e fallback para cache.

### Visibilidade segura

`v75-startup-guard.js` observa apenas classe `app-active` e `hidden` de `#vaultScreen`/`#app`. Se `app-active` estiver ativo e ambos estiverem ocultos, reapresenta temporariamente o cofre com `aria-busy="true"` e mensagem de preparação. Quando `#app` fica disponível, oculta novamente o cofre e restaura a mensagem anterior.

A camada não lê `appState`, não usa IndexedDB, não chama `syncNow()`, não altera PIN/cifragem e não antecipa dados financeiros.

## 8. Segurança

As camadas visuais e de imagens não podem aceder a valores financeiros, credenciais ou chaves. `75-startup1` melhora disponibilidade sem contornar a barreira de sincronização. Não se deve limpar dados do Safari para aplicar a correção, pois isso pode apagar IndexedDB/cofre local.

## 9. Responsividade e acessibilidade

Mobile principal <=820 px; refinamentos 540/430/350 px; safe areas iOS preservadas; inputs móveis com 16 px; `prefers-reduced-motion` respeitado; o estado de preparação usa `aria-busy`.

## 10. Ordem relevante de assets

Após o núcleo funcional: bibliotecas do Mercado → `v64-runtime.js`/experiência/arquitetura → `v75-stability.js?v=75-stability1` → `v75-startup-guard.js?v=75-startup1` → `v75-market-featured.js`.

## 11. Cache e distribuição

Cache publicado:

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog3-pd-photo1-photo-loader2-startup1`

`v75-startup-guard.js` integra a allowlist do bundle e do Service Worker.

## 12. QA e publicação

- commit funcional: `cd229d83c3d47f54d7f8990a76f2f29acb372f47`;
- commit integrado: `188c0820adff62540987fb6f8ef65c76ab9bf596`;
- CI branch funcional `34440532734`: sucesso;
- CI branch após docs `34440742219`: sucesso;
- integração em `main`: fast-forward, `behind 0`;
- CI main `34440788510`: sucesso;
- Pages `34440824303`: sucesso.

A validação física no mesmo iPhone/Safari continua necessária para encerrar o defeito.
