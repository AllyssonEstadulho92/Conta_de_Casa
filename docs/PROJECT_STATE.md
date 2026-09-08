# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v71`
Build candidato: `v72`
Branch pública: `main`
Branch candidata: `ui/v72-swipe-page-close`
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub é opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v71 está publicada**. O PR #60 foi integrado em `main` no commit `39a842ee6138277d50decdb38bb87e8ad5a0f110`; a CI de `main` run #1332 (`34172134225`) terminou com sucesso e o Deploy Pages run #1325 (`34172194595`) terminou com sucesso.

A v71 já permite:

- abrir o drawer pelo hambúrguer ou por swipe iniciado junto da margem esquerda;
- fechar por X, Escape, backdrop, seleção de página ou swipe para a esquerda iniciado sobre a própria superfície do drawer;
- fazer o painel e o backdrop acompanharem o dedo durante o arrasto;
- preservar scroll vertical, ARIA, foco, safe areas, tema claro/escuro e `prefers-reduced-motion`.

## Pedido atual e problema identificado

### Facto observado

O comportamento pretendido é semelhante ao padrão mostrado no ChatGPT: com o menu aberto, o utilizador deve poder simplesmente passar o dedo horizontalmente sobre a parte visível da página e regressar ao conteúdo, sem precisar iniciar o gesto em cima do drawer ou tocar no X.

### Causa técnica

Na v71, `mobile-menu-toggle.js::onTouchStart()` cria um gesto de fecho apenas quando `event.target` pertence a `.nav-drawer-shell`. Um toque na área de página/backdrop visível à direita é rejeitado antes de a lógica de intenção horizontal começar. Portanto o painel já sabe seguir o dedo, mas a área de início do gesto é demasiado restrita.

## v72 — correção candidata

A v72 reutiliza integralmente o controlador e o mesmo `<dialog>`:

- quando o drawer está aberto, `onTouchStart()` aceita tanto origem `drawer` como origem `page`;
- a área de página/backdrop deixa de ser rejeitada;
- um swipe predominantemente horizontal para a esquerda iniciado nessa área usa exatamente o mesmo `beginTouchDrag()`, `setDragVisual()` e `settleTouchDrag()` da v71;
- o drawer acompanha o dedo no mesmo frame e o backdrop perde intensidade proporcionalmente;
- ao soltar, a mesma decisão por progresso/velocidade determina se fecha ou regressa ao estado aberto;
- `data-drag-source` identifica apenas para diagnóstico se o gesto começou em `drawer`, `page` ou `edge` e é removido no fim;
- o gesto vertical continua não capturado;
- nenhum segundo menu, rota ou fluxo de navegação foi criado.

## Versionamento candidato

- build: `v72`;
- revisão do menu: `72-menu6`;
- shell preservado: `66-shell1`;
- Compras preservada: `65-shopping1`;
- runtime funcional preservado: `64-runtime1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v72-menu6`.

## Segurança e escopo

A v72 não altera `appState`, `STATE_VERSION`, faturas, pagamentos, `estimatedCents`, `actualCents`, scanner, recorrências, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB, autenticação, APIs ou sincronização.

Não foram adicionados segredos, tokens, chaves, endpoints ou armazenamento. `events.js`, `render.js`, `NAV_GROUPS` e a estrutura do drawer permanecem preservados.

## QA necessário antes de publicar

1. CI do PR totalmente verde;
2. validar sintaxe e regressão específica do swipe iniciado na página/backdrop;
3. validar que swipe vertical na página não fecha o drawer;
4. validar swipe curto que regressa ao estado aberto;
5. validar swipe longo/rápido que fecha;
6. validar X, Escape, backdrop e seleção de página;
7. validar build/manifest/cache `v72` / `72-menu6`;
8. integrar em `main` apenas com CI verde;
9. confirmar CI de `main` e Deploy GitHub Pages;
10. repetir no iPhone/Safari.

## Última alteração

O controlador candidato v72 passou a aceitar o mesmo gesto de fecho também quando o toque começa na página/backdrop visível, mantendo uma única implementação de swipe.

## Próximo passo

Executar CI completa da v72, publicar apenas se verde e confirmar no iPhone que é possível fechar o menu apenas passando o dedo para a esquerda sobre a página visível.
