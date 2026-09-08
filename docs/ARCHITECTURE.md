# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v75`
Branch pública: `main`
Distribuição: GitHub Pages / PWA

## 1. Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 acrescenta uma camada final de arquitetura de informação e composição visual sobre a base funcional v74, sem substituir o núcleo financeiro.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

## 3. Camadas de apresentação

### Base funcional

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional de Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- `mobile-menu-toggle.css/js`: controlador v73 do drawer à direita e hambúrguer ↔ X;
- `v64-runtime.js`: comportamento funcional ainda necessário.

### Camada final v75

`v75-architecture.css` é carregado depois da base e define:

- identidade teal/verde-petróleo consistente;
- superfícies, bordas, raios, sombras e tipografia comuns;
- topbar móvel fixed e safe areas;
- cinco destinos móveis sempre visíveis;
- formulários mobile full-screen;
- scanner QR full-screen;
- composição compacta de Mercado, Planeamento, Relatórios, Mais e Sincronização;
- cofre/onboarding alinhados com `icon.svg` local;
- tema escuro equivalente.

`v75-architecture.js` é uma camada de orquestração visual que:

- ajusta nomes e contexto de páginas;
- simplifica drawer e navegação secundária;
- integra a saudação no cabeçalho do Início;
- reorganiza Planeamento com métricas reais;
- cria a hierarquia de Mais;
- acrescenta **Manual / Ler fatura / QR Code** ao formulário real de nova despesa;
- apresenta o estado de sincronização antes da configuração técnica;
- reutiliza handlers e componentes existentes.

A camada não chama `saveState()` nem altera diretamente valores financeiros.

## 4. Navegação

Navegação primária móvel:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

A v75 anula explicitamente a regra histórica de `styles.css` que ocultava o terceiro item da barra inferior. O Mercado fica sempre visível.

O drawer fica reduzido a grupos coerentes de Principal, Análise e Conta/sistema. `mobile-menu-toggle.js` continua responsável pelo mesmo `#mobileMenuBtn`, animação hambúrguer/X, Escape, foco e swipe da direita.

## 5. Despesas, faturas e QR

O formulário continua a ser criado por `forms.js` e preserva os IDs, campos e handlers existentes. Na criação de nova despesa, a camada v75 apresenta três modos: Manual, Ler fatura e QR Code.

Fotografia e QR continuam a usar `invoice-capture.js`. O QR fiscal é preenchimento assistido e os dados são revistos antes de guardar. Não são inventadas linhas de produtos que o QR não forneça.

## 6. Mercado

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- fotografia validada é apoio visual;
- lojas suportadas na experiência atual: Continente e Pingo Doce;
- outras cadeias do protótipo não são apresentadas sem suporte real.

## 7. Planeamento, Relatórios e Mais

Planeamento prioriza mês, orçamento, gasto, disponível e categorias antes da edição detalhada. Relatórios reutiliza os cálculos existentes. Mais concentra navegação secundária e evita duplicar Mercado e Planeamento.

## 8. Sincronização

O painel técnico real continua em `#syncPanel`. A v75 apenas acrescenta uma introdução visual baseada no estado já renderizado. A sincronização continua opcional e cifrada.

## 9. Responsividade e acessibilidade

- breakpoint principal: `820px`;
- safe areas iOS em topbar, drawer, scanner, formulários e navegação inferior;
- alvos principais próximos ou superiores a 44 px;
- `prefers-reduced-motion` respeitado;
- foco e ARIA preservados;
- pinch zoom não é bloqueado;
- sem `zoom:` CSS como remendo de layout.

## 10. Distribuição pública v75

- `BUILD = v75`;
- `UI_REV = 74-ui1`;
- `CATEGORY_REV = 64-ui1`;
- `RUNTIME_REV = 64-runtime1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- `ARCHITECTURE_REV = 75-architecture2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

`ui-consistency.css` e `v64-runtime.css` continuam fora de `dist`. O bundle Pages publicado contém 43 assets, incluindo `v75-architecture.css` e `v75-architecture.js`.

## 11. Atualização e cache

`sw.js` utiliza um nome de cache versionado. Na ativação elimina caches diferentes do atual. `events.js` regista `./sw.js?v=75` com `updateViaCache:'none'`. O centro de atualização usa `registration.update()`, `APPLY_UPDATE`, `controllerchange` e reload controlado para promover a nova versão.

## 12. Publicação

- CI final da branch: `34226581162` / `#1488` — sucesso;
- PR `#65`;
- merge: `40fe62f8140f1f58af9e9ab8d8c8b642695b7cf3`;
- CI de `main`: `34226711267` / `#1490` — sucesso;
- GitHub Pages: `34226749117` / `#1483` — sucesso;
- URL: `https://allyssonestadulho92.github.io/Conta_de_Casa/`.

A única validação ainda manual é a inspeção física em dispositivos reais para confirmar composição visual, teclado, câmara e comportamento do browser/PWA.
