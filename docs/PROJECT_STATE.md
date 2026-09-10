# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build: `v75`  
Branch pública: `main`  
SHA público de partida: `c8ec45893c8936093ecd7c7da9ee08c9a268109c`  
Branch de trabalho atual: `feat/v75-design-asset-library`  
Distribuição: GitHub Pages / PWA  
Revisão de usabilidade integrada: `75-usability1`  
Revisão de páginas integrada: `75-pages1`  
Revisão de biblioteca de design candidata: `75-assets1`

## Baseline preservada

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- UI `74-ui1`, Mercado `74-shopping2`, menu `73-menu8`, experiência `74-experience2`;
- arquitetura `75-architecture2`, cabeçalho `75-header2`, estabilidade `75-stability1`, geometria `75-layout1`, drawer `75-drawer2`;
- startup `75-startup2`, catálogo `75-catalog4`, loader especializado de Mercado `75-photo-loader3`;
- usabilidade transversal `75-usability1`;
- páginas Início/Despesas/Planeamento `75-pages1`.

## Estado confirmado antes de `75-assets1`

A Parte 2 foi integrada em `main` através do PR #68, com commit de merge `c8ec45893c8936093ecd7c7da9ee08c9a268109c`. A revisão `75-pages1` está portanto na baseline desta fase. A documentação da Parte 2 ainda continha frases de estado de branch/candidata; esta revisão corrige essa divergência documental.

## Objetivo atual

Criar uma fundação reutilizável para **fontes, ícones, animações e carregamento de assets** que possa orientar a Conta de Casa e as outras aplicações do projeto Móvel e Computador sem introduzir dependências externas indiscriminadas.

## Factos encontrados

1. A Conta de Casa já possui um sistema principal de ícones: **Lucide SVG local**, via `ui-icons.js`/`ui-icons.css`, com licença distribuída em `LUCIDE_LICENSE.txt`.
2. A tipografia atual está centralizada em `--cdc-font-family: Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif`.
3. A CSP atual mantém `font-src 'self'`; ativar Google Fonts, Adobe Fonts, kits Font Awesome ou outras CDNs exigiria expandir política de rede e prejudicaria o modelo offline-first.
4. Lottie, Google Fonts, Fontshare, Font Squirrel, DaFont, UNCUT.wtf, Adobe Fonts, MyFonts, Fontpair, Fontjoy, Font Awesome e Material Symbols não têm o mesmo modelo de licença/integração. Estar num catálogo não equivale a autorização para copiar ou incorporar ficheiros.
5. **Type Icons Font** foi classificada como restrita até existir licença compatível; **Free Icon Font Proyectos** permanece não verificada porque o nome fornecido não identifica uma origem oficial inequívoca.
6. O Mercado já tem um loader especializado (`75-photo-loader3`) associado a PID, fontes oficiais, cache de imagens e IndexedDB. Um loader genérico não pode substituir essa lógica.

## `75-assets1` implementada na branch

### Catálogo e política

Foi adicionado `design-asset-library.js`, que expõe `CDCDesignAssetLibrary` e regista os fornecedores indicados com estado, categoria, origem, integração e regra de licença.

Critérios principais:

- Lucide local continua a ser o sistema principal de ícones da Conta de Casa;
- preferir uma família tipográfica; máximo de duas por aplicação;
- fontes e runtimes externos não são carregados automaticamente;
- origem e licença devem ser verificadas antes de incorporar ficheiros;
- preservar CSP e funcionamento offline/PWA;
- animações devem respeitar `prefers-reduced-motion` e possuir fallback;
- ícones funcionais necessitam nome acessível; decorativos usam `aria-hidden`.

### Carregamento transversal

Foram adicionados `asset-loader.js` e `asset-loader.css`.

O loader é **opt-in** e suporta:

- imagens com `loading="lazy"`, `decoding="async"`, prioridade explícita e pré-carregamento por `IntersectionObserver`;
- estados `loading`, `ready`, `error` e fallback visual;
- vídeo/áudio com `preload="metadata"` por defeito e sem autoplay automático;
- Lottie apenas com JSON local e runtime `window.lottie` previamente aprovado/local;
- fallback estático quando `prefers-reduced-motion` está ativo;
- URLs same-origin por defeito, sem injeção de `<script>` remoto.

O loader transversal não seleciona fotos de produtos, não altera PID e não interfere com `market-photo-loader.js`.

### Distribuição e QA

- `scripts/prepare-pages.cjs` inclui `asset-loader.css`, `design-asset-library.js` e `asset-loader.js`, revisionados como `75-assets1`;
- `sw.js` inclui os três ativos e usa sufixo de cache `assets1`;
- `tests/design-asset-library.test.cjs` valida catálogo, gate de licenças, CSP, URL policy, loader, build `dist/` e isolamento financeiro/criptográfico;
- CI e Pages passam a executar/verificar estes ficheiros e o novo teste.

## Segurança

`75-assets1` não altera `core.js`, `finance.js`, IndexedDB financeiro, PIN, PBKDF2, AES-GCM, sincronização, pagamentos, QR ou scanner. Não expande CSP, não adiciona tokens/kits e não faz pedidos a fornecedores apenas porque estes constam do catálogo.

## Estado da integração

A implementação está na branch `feat/v75-design-asset-library`. Só deve ser integrada em `main` depois de CI completo verde, comparação sem commits em falta relativamente a `main`, revisão do PR e confirmação posterior do CI/Pages no SHA publicado.

## Próximo passo funcional

Depois da integração de `75-assets1`, retomar a Parte 3: auditoria de **Mercado**, usando a nova fundação apenas para estados genéricos onde for apropriado e preservando `75-photo-loader3`, identidade `marketId|pid`, fontes oficiais e separação entre estimativa e valor confirmado.
