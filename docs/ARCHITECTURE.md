# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v74`
Branch pública: `main`

## 1. Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura continua local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v74 introduz uma nova camada de experiência e consolida o sistema visual sem substituir o núcleo funcional existente.

## 2. Persistência, dinheiro e segurança

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- schema financeiro: `STATE_VERSION = 5`;
- valores monetários: inteiros em cêntimos;
- `finance.js`: regras e cálculos financeiros;
- sincronização: envelope cifrado opcional via GitHub;
- sem PIN, palavra-passe, token ou chave embutidos no repositório público;
- v74 não exige migração de dados.

## 3. Camadas de apresentação v74

### `design-system.css`

Sistema visual canónico:

- claro: `#f4f8f8` / `#ffffff` / `#0c2830`;
- primário: `#075b63`;
- acento: `#17b890`;
- tema escuro preservado;
- tipografia `Inter` com fallbacks nativos;
- métricas comuns para botões, formulários, cartões, foco e ícones;
- safe areas, header móvel e navegação inferior consolidados.

### `v74-experience.css`

Camada de composição do protótipo, sobretudo até `820px`:

- topbar verde-petróleo em largura total;
- shell móvel `#f2f5f6`;
- cartões compactos e hierarquia equivalente ao protótipo;
- cinco destinos na navegação inferior;
- composições para Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- onboarding visual sem substituir a autenticação local real.

### `v74-experience.js`

Camada de orquestração visual. Reutiliza DOM, estado e handlers existentes e não grava diretamente valores financeiros.

Responsabilidades:

- saudação e seletor mensal móvel;
- resumo mensal e categorias a partir de dados existentes;
- ações rápidas que chamam fluxos reais (`openBillForm`, captura de fatura, Mercado);
- feeds/listas móveis a partir do estado já renderizado;
- adaptação de Planeamento, Relatórios e Mais;
- manutenção de uma única aplicação funcional.

## 4. Navegação

A fonte continua centralizada:

- `core.js`: `PAGE_META` e `NAV_GROUPS`;
- `render.js::renderNav()`: desktop, drawer e navegação móvel;
- `events.js`: navegação, backdrop, Escape e breakpoints;
- `mobile-menu-toggle.js`: animação, reparenting do mesmo botão e gestos;
- `mobile-menu-toggle.css`: sidebar/drawer à direita.

A barra inferior móvel prioriza:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

O drawer mantém acesso à arquitetura completa.

## 5. Cabeçalho e viewport móvel

Até `820px`:

- topbar `fixed`;
- `env(safe-area-inset-top)` respeitado;
- `.main` compensado com `padding-top`;
- espaço inferior para navegação e `safe-area-inset-bottom`;
- títulos truncáveis sem overflow;
- `VisualViewport` reservado a teclado/diálogos em `events.js`;
- sem uso de `zoom` CSS como correção de layout.

## 6. Hambúrguer / X e drawer

O controlador validado da v73 permanece:

- sidebar desktop à direita;
- drawer móvel à direita;
- um único `#mobileMenuBtn` muda de hambúrguer para X;
- abertura/fecho usam transform/opacidade;
- swipe abre da margem direita para a esquerda e fecha para a direita;
- `prefers-reduced-motion`, Escape, foco e ARIA preservados.

## 7. Faturas e QR

- criação/edição continua nos formulários existentes;
- QR é preenchimento assistido;
- informação extraída é revista antes de guardar;
- não são inventadas linhas de artigos não comprovadas;
- pagamentos e estados mantêm os mesmos modelos.

## 8. Mercado

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica produto, não prova preço;
- imagens são opcionais e mostradas apenas após validação;
- scanner não grava vídeo nem cria credenciais.

## 9. Ícones e acessibilidade

- Lucide local continua o sistema vetorial oficial;
- métricas SVG normalizadas em `design-system.css`;
- foco visível e contraste claro/escuro validados;
- controlos principais mantêm alvos adequados;
- pinch zoom não é bloqueado;
- `aria-current`, `aria-live`, labels e estados do drawer preservados.

## 10. Distribuição pública v74

- `BUILD = v74`;
- `UI_REV = 74-ui1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- cache: `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

`ui-consistency.css` e `v64-runtime.css` deixaram de ser copiados para `dist`; `v64-runtime.js` permanece por conter comportamento funcional.

## 11. QA e publicação

- PR `#64`;
- CI PR `34210060213` / `#1441`: sucesso;
- merge `a1974860755d70e7abf30ed93cee7220f5e65409`;
- CI `main` `34210146307` / `#1442`: sucesso;
- Pages `34210213884` / `#1435`: sucesso.

Validação física pós-publicação continua recomendada em iPhone, Android/tablet e desktop.
