# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build: `v75`  
Branch pública: `main`  
SHA funcional publicado: `a8e04d6811bd6eb08487de139fb19fb2f12128ec`  
Distribuição: GitHub Pages / PWA  
Revisão de usabilidade integrada: `75-usability1`  
Revisão de páginas integrada: `75-pages1`  
Revisão de biblioteca de design integrada: `75-assets1`

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
- páginas Início/Despesas/Planeamento `75-pages1`;
- biblioteca/loader transversal de assets `75-assets1`.

## Estado publicado de `75-assets1`

A fundação de fontes, ícones, animações e carregamento de assets foi integrada em `main` através do PR #69.

Evidência de integração/publicação:

- branch final antes do merge: `3706d2fc318a5ccae0a4ec808984c19dcfc3eb87`;
- CI de push da branch: run `34477808822` — sucesso;
- CI do PR #69: run `34477918443` — sucesso;
- comparação antes do merge: `behind 0` relativamente a `main`;
- merge squash em `main`: `a8e04d6811bd6eb08487de139fb19fb2f12128ec`;
- CI de `main`: run `34478047035` — sucesso;
- GitHub Pages no mesmo SHA: run `34478091014` — sucesso.

## Biblioteca e critérios vigentes

`design-asset-library.js` expõe `CDCDesignAssetLibrary` e regista os fornecedores indicados com categoria, origem conhecida, estado, modo de integração, nota de licença e regra operacional.

Critérios principais:

- **Lucide local** continua a ser o sistema principal de ícones da Conta de Casa;
- preferir uma família tipográfica e permitir no máximo duas por aplicação;
- fontes, ícones e runtimes externos não são carregados automaticamente;
- origem/licença devem ser verificadas antes de incorporar ficheiros;
- CSP e funcionamento offline/PWA devem ser preservados;
- animações devem respeitar `prefers-reduced-motion` e possuir fallback estático quando necessário;
- ícones funcionais precisam de nome acessível; decorativos usam `aria-hidden`;
- `Type Icons Font` permanece restrita até existir licença compatível;
- “Free Icon Font Proyectos” permanece não verificada até existir URL/origem oficial inequívoca.

## Carregamento transversal publicado

`asset-loader.js` + `asset-loader.css` fornecem uma fundação **opt-in** para recursos visuais:

- imagens: `loading="lazy"`, `decoding="async"`, prioridade explícita, `IntersectionObserver` para `data-cdc-src`, estados `loading/ready/error` e fallback visual;
- vídeo/áudio: `preload="metadata"` por defeito e sem autoplay introduzido pelo loader;
- Lottie: JSON local por defeito, runtime `window.lottie` previamente aprovado/local, `runtime-missing` se ausente e fallback para `prefers-reduced-motion`;
- URLs same-origin por defeito e nenhuma injeção automática de `<script>` remoto.

O loader transversal não seleciona fotografias de produtos, não altera PID e não substitui `market-photo-loader.js`/`75-photo-loader3`.

## Segurança

`75-assets1` não altera `core.js`, `finance.js`, IndexedDB financeiro, PIN, PBKDF2, AES-GCM, sincronização, pagamentos, QR ou scanner. A CSP não foi expandida; nenhum kit/token/segredo foi adicionado e nenhum fornecedor é contactado apenas por constar do catálogo.

## Validação ainda pendente

- validar em hardware um componente opt-in com imagem lazy/fallback em Safari/PWA e Android/Chrome;
- quando for escolhida uma animação Lottie real e o runtime local for incorporado sob licença aprovada, validar `prefers-reduced-motion` e fallback estático;
- selecionar fontes concretas apenas em alterações futuras, depois de validar a licença exata. Nenhum catálogo completo de fontes foi incorporado.

## Próximo passo funcional

Parte 3: auditoria de **Mercado**, com foco em pesquisa, filtros, catálogo, cartões, imagens, estados de carregamento e fluxo de compra. A nova fundação `75-assets1` pode ser usada para estados genéricos onde fizer sentido, mas deve preservar `75-photo-loader3`, identidade `marketId|pid`, fontes oficiais e separação entre preço estimado e valor confirmado.
