# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA
Runtime público: `75-catalog3`
Candidato: `75-startup1`

## 1. Princípios e invariantes

A aplicação é uma PWA estática/local-first. Apresentação, Mercado, catálogo, transporte de navegação e sincronização são camadas separadas do núcleo financeiro.

Invariantes:

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- sincronização opcional apenas do envelope cifrado;
- sem passwords, tokens ou chaves embutidos;
- uma correção visual/de disponibilidade não pode reescrever cálculos, persistência ou identidade do cofre.

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
- `market-catalog-image-resolver.js`: resolução direta da fotografia oficial (`75-catalog2`);
- `market-visual-catalog.js`: índice progressivo + renderer incremental (`75-catalog3`);
- `pingo-doce-photo-library.js`: expansão dedicada Pingo Doce (`75-pd-photo1`);
- `market-photo-loader.js`: prioridade e hidratação das fotografias visíveis (`75-photo-loader2`).

## 3. Persistência e identidade de imagens

A biblioteca geral usa IndexedDB `conta-de-casa-market-image-library` e chave canónica `marketId|pid`. Guarda apenas mercado, PID, metadados de diagnóstico, URL oficial validado, página oficial e timestamps/expiração. Não guarda binários, preços, faturas, dados pessoais ou credenciais.

O catálogo visual usa `conta-de-casa-market-visual-catalog`. O store `products` mantém `marketId|pid`, nome, embalagem, categorias, página oficial e timestamps; `meta` mantém cursor e orçamento de descoberta. O catálogo não persiste preço. **Ver preço atual** continua a usar a pesquisa viva.

## 4. Resolvedor oficial `75-catalog2`

`safeProductUrl()` valida HTTPS, retalhista, path e PID. A página oficial exata é lida, os candidatos de fotografia são filtrados por host/path/PID e apenas uma referência válida é entregue à biblioteca. A disponibilidade final é comprovada pelo `<img>`; uma referência quebrada é expurgada pelo loader. Timeout do reader: 8 s. Concorrência direta: 2.

## 5. Renderer incremental `75-catalog3`

O renderer reconcilia a grelha por `marketId|pid`: remove apenas chaves obsoletas, reutiliza os mesmos nós DOM para produtos existentes, atualiza texto/metadados sem substituir a área da fotografia e cria nós apenas para novas chaves. O aquecimento periódico de imagem não reconstrói a grelha; uma fotografia persistida em background emite `cdc:market-photo-ready` para hidratação do cartão existente.

## 6. Biblioteca Pingo Doce `75-pd-photo1`

Base `conta-de-casa-pingo-doce-photo-library`, estados `pending|ready|missing`, 15 grupos e mais de 200 termos de descoberta. Limites mantidos: 24 pesquisas/sessão, 72/dia, 30 tentativas de imagem/sessão, 120/dia, suspensão offline/oculta/Save-Data.

## 7. Carregador `75-photo-loader2`

Trabalha apenas com `#page-market.page.active`, consulta primeiro a biblioteca geral, prioriza até 6 cartões, resolve por SKU exato, aplica imagem válida com `loading='eager'`, reavalia a cada 500 ms por no máximo 24 ciclos e usa cooldown de 30 s. Não possui `fetch()` próprio nem escreve estado financeiro.

## 8. Arranque seguro `75-startup1`

### Problema arquitetural

Foram confirmados dois estados independentes capazes de produzir um ecrã branco no Safari/PWA:

1. a navegação controlada pelo Service Worker podia aguardar indefinidamente por `fetch(event.request)` antes de chegar ao fallback de cache;
2. durante o desbloqueio, o fluxo funcional pode manter simultaneamente `#vaultScreen` e `#app` ocultos enquanto a barreira inicial de sincronização ainda não terminou.

A captura física não prova qual ocorreu, por isso a correção cobre ambos sem alterar a política de segurança.

### Contrato de navegação

Para `event.request.mode === 'navigate'`, `sw.js` usa `navigationResponse()`:

1. lê antecipadamente `./index.html` do Cache Storage;
2. inicia rede com `cache:'no-store'` e `AbortController`;
3. aborta a tentativa após 4000 ms;
4. resposta de rede `ok` é devolvida e atualiza a cópia de `index.html` no cache;
5. erro/timeout usa o `index.html` instalado;
6. se não existir rede nem cache, devolve 503 textual, evitando espera indefinida.

Pedidos dos restantes assets mantêm network-first com `cache:'no-store'` e fallback para a chave pública correspondente.

### Contrato de visibilidade

`v75-startup-guard.js` é uma camada de apresentação. Observa apenas:

- classe `app-active` em `<html>`;
- atributo `hidden` de `#vaultScreen`;
- atributo `hidden` de `#app`.

Quando `app-active` está ativo e os dois contentores estão ocultos, o cofre é mostrado temporariamente com `aria-busy="true"` e mensagem de preparação. O shell financeiro continua oculto. Quando `#app` fica disponível, a guarda volta a ocultar o cofre e restaura a mensagem anterior.

A camada não lê `appState`, não usa IndexedDB, não chama `syncNow()`, não altera PIN/cifragem e não antecipa dados financeiros.

## 9. Segurança

As camadas de imagem e `75-startup1` não podem aceder a valores financeiros, credenciais ou chaves. A guarda de arranque melhora disponibilidade sem contornar a barreira de sincronização existente. Não é necessário nem recomendado limpar dados do Safari para aplicar a correção, porque isso poderia eliminar o cofre local em IndexedDB.

## 10. Responsividade e acessibilidade

- mobile principal <=820 px;
- refinamentos 540/430/350 px;
- safe areas iOS preservadas;
- inputs móveis com 16 px para evitar zoom de foco;
- `prefers-reduced-motion` respeitado;
- estado de preparação usa `aria-busy`;
- a navegação continua utilizável em desktop/tablet/mobile.

## 11. Ordem relevante de assets

1. núcleo funcional e `events.js`;
2. bibliotecas/políticas do Mercado;
3. `v64-runtime.js`, experiência e arquitetura;
4. `v75-stability.js?v=75-stability1`;
5. `v75-startup-guard.js?v=75-startup1`;
6. `v75-market-featured.js`.

A guarda é carregada depois da estabilidade base e antes de `DOMContentLoaded` terminar, ficando pronta antes de o utilizador poder iniciar o desbloqueio.

## 12. Cache e distribuição

Cache candidato:

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog3-pd-photo1-photo-loader2-startup1`

`v75-startup-guard.js` integra explicitamente a allowlist do bundle e do Service Worker.

## 13. QA

Commit funcional candidato: `cd229d83c3d47f54d7f8990a76f2f29acb372f47`.

CI da branch run `34440532734`: sucesso completo, incluindo o novo teste de regressão de arranque Safari/PWA. A publicação final e a validação física permanecem pendentes nesta etapa.
