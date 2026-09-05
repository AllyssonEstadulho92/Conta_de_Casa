# Arquitetura — Conta de Casa

## Visão geral

Aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A aplicação é local-first: regras de negócio, renderização, formulários, persistência cifrada e sincronização opcional executam no cliente.

O ciclo de atualização da própria aplicação é também client-side e same-origin. Não existe servidor de atualização dedicado: GitHub Pages publica os assets e o Service Worker controla descoberta, instalação, cache e ativação da nova versão.

## Camadas principais

### Interface

- `index.html`: estrutura semântica, CSP, navegação, páginas e diálogos.
- `styles.css`: estilos base/legados.
- `design-system.css`: tokens e componentes visuais principais.
- `mobile-layout.css`: compatibilidade e estabilidade do viewport móvel.
- `market-experience.css`: página Mercado e diálogo `market-browser`.
- `market-barcode.css`: scanner EAN/UPC/GTIN.
- `ui-icons.css`: camada visual de ícones e normalização de controlos.
- `invoice-capture.css`: interface e overlay do leitor QR de faturas.
- `app-update.css`: ecrã de Atualização de Software, responsivo e compatível com tema claro/escuro.

Ordem CSS no bundle público v58:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`
4. `market-experience.css`
5. `market-barcode.css`
6. `ui-icons.css`
7. `invoice-capture.css`
8. `app-update.css`

### JavaScript

- `core.js`: estado, utilitários, cifragem, persistência e contrato histórico `ICONS`/`icon()`.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub.
- `ui-icons.js`: subset local Lucide, adaptação ao contrato existente e hidratação visual de controlos estáticos/dinâmicos.
- `events.js`: eventos, navegação, viewport, interação e registo base do Service Worker.
- `market-experience.js`: pesquisa de preços e criação de itens a partir de resultados confirmados.
- `market-barcode.js`: leitura GTIN, identificação de produto e handoff para a pesquisa do Mercado.
- `invoice-capture.js`: leitura local do QR de faturação e preenchimento assistido da nova fatura.
- `app-update.js`: launcher em Definições, UI de atualização, notas de versão e verificação manual do Service Worker.

## Centro de Atualização de Software — v58

### Objetivo

Concentrar num único campo visível ao utilizador o estado da versão e as alterações de cada release, usando uma composição semelhante à página de atualização do iPhone sem simular capacidades que a PWA não possui.

### Entrada e apresentação

`app-update.js` adiciona progressivamente uma linha **Atualização de Software** dentro de `#page-settings`. Não altera `PAGE_META`, rotas ou schema do estado. A interface abre um `<dialog>`:

- fullscreen em mobile (`100dvh`, safe areas);
- modal centrado em tablet/desktop;
- botão Voltar;
- **Atualizações Automáticas — Ativado**;
- **Atualizações Beta — Desativado**;
- estado da versão atual;
- **Mais detalhes**;
- **Verificar atualizações**.

A UI utiliza `CDCIcons.markup` quando disponível, mantendo Lucide como linguagem visual. Os fallbacks SVG do próprio módulo são apenas de contingência e não carregam bibliotecas externas.

### Canal estável e atualização automática

A aplicação já regista o Service Worker no arranque em `events.js` com `updateViaCache:'none'` e chama `registration.update()`. O Service Worker faz `skipWaiting()` após instalar e `clients.claim()` ao ativar. `events.js` escuta `controllerchange` e recarrega a página uma única vez.

Assim, o estado **Atualizações Automáticas — Ativado** corresponde a comportamento real: quando o browser abre a aplicação e encontra um Service Worker novo publicado, a nova versão é instalada e passa a controlar o cliente.

### Verificação manual

**Verificar atualizações** executa apenas APIs standard do Service Worker:

1. obtém o `ServiceWorkerRegistration` same-origin;
2. regista `./sw.js?v=58` se ainda não existir;
3. chama `registration.update()`;
4. observa `updatefound` / `installing` / `waiting`;
5. se existir worker em espera, envia `{type:'SKIP_WAITING'}`;
6. a ativação provoca `controllerchange`, e o listener existente em `events.js` faz reload.

Não é feita qualquer consulta a GitHub API, endpoint de versão ou backend de atualização.

### Canal beta

Não existe pipeline beta pública nem contrato de atualização beta. Por isso, a linha **Atualizações Beta** é apresentada como **Desativado** e apenas explica a limitação. Não existe toggle funcional até haver uma decisão separada de distribuição, versionamento, rollback e validação.

### Notas de versão

`APP_RELEASE_NOTES` em `app-update.js` é a fonte das alterações apresentadas ao utilizador em **Mais detalhes**. Cada release pública deve acrescentar uma entrada antes do deploy. Este conteúdo é informativo e não entra no cofre nem em `appState`.

## Composição do bundle público e versão v58

`scripts/prepare-pages.cjs` continua a gerar `dist/` por allowlist. Para v58, o script também funciona como etapa de composição do build público:

1. copia apenas os assets permitidos;
2. inclui `app-update.css` e `app-update.js`;
3. altera apenas o `dist/index.html`, carimbando `app-build` e query strings para `v58`;
4. injeta as referências `app-update.css?v=58` e `app-update.js?v=58` no HTML público;
5. altera apenas `dist/events.js`, carimbando o registo do SW como `./sw.js?v=58`;
6. mantém os templates fonte em v53 para evitar uma substituição massiva de ficheiros sem necessidade funcional.

Esta composição é validada por `tests/app-update.test.cjs`, que executa de facto `scripts/prepare-pages.cjs` e inspeciona `dist/`.

## Service Worker v58

Cache público: `conta-de-casa-public-v58-software-update`.

A allowlist offline inclui os assets já existentes e os novos:

- `./app-update.css`
- `./app-update.js`

Regras mantidas:

- só `GET`;
- só same-origin;
- apenas paths constantes da allowlist;
- query permitida apenas quando é o parâmetro de versão `v`;
- navegação usa network-first com fallback para `index.html` em cache;
- assets públicos usam network-first com atualização do cache e fallback offline;
- caches anteriores são eliminados na ativação.

Novo handler de mensagens: `SKIP_WAITING`, usado pela verificação manual. Não recebe conteúdo do cofre nem comandos genéricos.

## Hierarquia visual aprovada — Lista de compras v55

A captura física em iPhone e o protótipo aprovado definem a composição mobile da página **Lista de compras**:

1. cabeçalho — menu, carrinho + título, ação principal `+`, mês e Sync;
2. pesquisa — lupa Lucide e ação secundária visual de scanner;
3. filtros — controlos existentes com ação neutra de limpeza;
4. resumo financeiro — quatro cartões em grelha 2×2 no mobile;
5. lista do mês — estado, identidade, quantidade e valores;
6. ações — editar/eliminar em formato compacto;
7. navegação inferior — quatro destinos com métrica Lucide uniforme.

O controlo secundário continua a ser `#newMarketBtn` e mantém o fluxo existente. A linguagem visual de scanner não altera os eventos ou a persistência.

## Mercado — fotografias reais v57

A v57 passou a permitir fotografia real de referência. `normalizeMarketItem()` normaliza metadados opcionais `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` dentro do schema existente.

Preço e ligação oficial continuam provenientes do fluxo cesta.pt. A fotografia é pesquisada/identificada separadamente no Open Food Facts:

- pesquisa textual usa limiar de correspondência forte;
- scanner GTIN pode obter a fotografia frontal exata;
- apenas `https://images.openfoodfacts.org` é aceite por `safeProductImageUrl()`;
- a CSP limita `img-src` ao domínio autorizado;
- `credentials:'omit'` e `referrerPolicy:'no-referrer'` são usados no fluxo remoto;
- apenas URL/metadados são persistidos; binários da imagem não são guardados no cofre.

Sem correspondência forte, a interface mantém placeholder neutro.

## Cofre de acesso — apresentação v56

O ecrã `#vaultScreen` continua a usar a estrutura existente em `index.html`, eventos de `events.js` e modelo criptográfico de `core.js`. A v56 é visual e não altera autenticação.

Princípios:

- `100svh`/`100dvh` e `env(safe-area-inset-*)`;
- cartão responsivo e teclado centrado;
- teclas circulares com alvos tácteis adequados;
- `#unlockPassphrase` permanece o input real de credencial;
- `wireVaultPinPad()` continua responsável pelo modo PIN/palavra-passe;
- sem passkey/biometria até existir implementação real;
- sem novos endpoints, armazenamento ou alteração da CSP;
- dark mode e redução de movimento preservados.

## Sistema visual de ícones — Lucide

Lucide Icons é a linguagem visual oficial. O projeto não carrega icon font nem CDN de ícones. Mantém apenas o subset necessário em `ui-icons.js`.

Snapshot auditável: `94e4cb9d9db5907053ebf3636a97c45529cf776b`.

Licença distribuída em `LUCIDE_LICENSE.txt`:

- ISC — Lucide Icons and Contributors;
- MIT — aviso aplicável aos glifos derivados de Feather.

`core.js` mantém `ICONS` e `icon()`. `ui-icons.js` faz `Object.assign(ICONS, LUCIDE_ICONS)` e substitui o renderer preservando a API. `CDCIcons.markup` fica disponível para módulos contextuais como atualização, Mercado e captura.

Referência visual:

- `viewBox="0 0 24 24"`;
- `currentColor`;
- traço 2 px;
- terminais e junções arredondados;
- caixas CSS explícitas;
- ícones decorativos `aria-hidden` e nome acessível no controlo.

## Faturas — captura QR assistida

A captura QR é uma camada progressiva sobre **Nova fatura**. `invoice-capture.js` permite câmara ou imagem local, valida o QR fiscal da AT, mostra pré-visualização e só preenche campos após confirmação. A imagem não é persistida nem enviada. PDFs/OCR geral permanecem fora deste fluxo.

## Mercado e scanner GTIN

Responsabilidades:

1. `market-barcode.js` lê EAN/UPC/GTIN localmente;
2. Open Food Facts identifica nome/marca/imagem quando disponíveis;
3. `market-experience.js` consulta preços de Pingo Doce e Continente através de `cesta.pt`.

O scanner não escreve diretamente em `appState.market` e GTIN não é prova de preço. A criação exige confirmação de um resultado. `estimatedCents` e `actualCents` continuam inteiros em cêntimos; `marketLineCents()` calcula quantidade × preço unitário com arredondamento seguro.

## Segurança e privacidade

- dados financeiros permanecem cifrados/local-first;
- PBKDF2, AES-GCM, PIN, IndexedDB, backups e sincronização não são alterados pela v58;
- o centro de atualização não acrescenta origem à CSP nem endpoint externo;
- Lucide não acrescenta dependência externa em runtime;
- pesquisa de Mercado envia apenas termos necessários ao `cesta.pt` e dados de produto previstos para Open Food Facts;
- captura de faturas mantém vídeo/imagem/payload QR locais;
- conteúdo remoto é normalizado/escapado antes da apresentação;
- nenhuma chave, password ou token é codificado no módulo de atualização.

## Viewport e acessibilidade

O shell mobile usa `100dvh`/`100svh`; `VisualViewport` permanece reservado aos fluxos já existentes de teclado/diálogos. O centro de atualização usa safe areas no mobile, alvos >= 48 px, foco visível e `aria-live` no estado. `prefers-reduced-motion` remove efeitos não essenciais.

## Distribuição

`pages.yml` só publica após CI verde em `main`. Antes do upload:

- executa verificações de sintaxe;
- executa suites de finanças, segurança, UI, Mercado, sincronização e atualização;
- executa `scripts/prepare-pages.cjs`;
- envia exclusivamente `dist/` ao GitHub Pages.

Assim, o utilizador nunca recebe diretamente documentação, testes, scripts de build ou ficheiros fora da allowlist.

## Testes

- `tests/app-update.test.cjs`: comportamento do centro, ausência de endpoints externos, dark/mobile/safe-area, cache v58 e composição real de `dist/`;
- `tests/ui-icons.test.cjs`: Lucide, licença, controlos, Sync e hierarquia visual;
- `tests/invoice-capture.test.cjs`: parser QR, privacidade e lifecycle;
- `tests/market-barcode.test.cjs`: GTIN/checksum, câmara, privacidade e handoff;
- `tests/market-experience.test.cjs`: fontes verificadas, escaping e responsividade;
- `tests/market-product-images.test.cjs`: origem e restrições das fotografias;
- suites restantes continuam a validar finanças, isolamento, segurança, navegação, acessibilidade, sync e regressões.

## Regras de manutenção

- cada release pública deve atualizar `APP_RELEASE_NOTES` e o BUILD público de forma coerente;
- não marcar Beta como ativo enquanto não existir uma pipeline beta real;
- não criar endpoint de atualização se o Service Worker same-origin for suficiente;
- novos assets públicos devem entrar explicitamente em `scripts/prepare-pages.cjs` e `sw.js`;
- qualquer mudança de cache deve atualizar os testes que protegem freshness;
- novos ícones funcionais devem usar o subset Lucide ou decisão arquitetural justificada;
- não introduzir emojis, glifos Unicode ou icon fonts como solução principal;
- alterações a scanners, atualização e controlos nativos devem ser validadas em iPhone/Safari e Android/Chrome físicos;
- após a primeira transição real v58 → v59, reavaliar se a fonte de versão deve ser consolidada num único artefacto, sem comprometer a segurança do deploy.
