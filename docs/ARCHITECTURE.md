# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Release candidata: `v74`
Branch: `redesign/v74-prototipo-conta-de-casa`

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
- nenhuma alteração v74 exige migração de dados.

## 3. Camadas de apresentação v74

### `design-system.css`

Sistema visual canónico da aplicação:

- claro: `#f4f8f8` / `#ffffff` / `#0c2830`;
- primário: `#075b63`;
- acento: `#17b890`;
- tema escuro preservado;
- tipografia: `Inter` com fallbacks nativos;
- métricas comuns para botões, formulários, cartões, estados, foco e ícones;
- safe areas, header móvel e navegação inferior consolidados.

### `v74-experience.css`

Camada de composição do protótipo, principalmente até `820px`:

- topbar verde-petróleo em largura total;
- shell móvel `#f2f5f6`;
- cartões compactos e hierarquia equivalente ao protótipo;
- cinco destinos na navegação inferior;
- composições específicas para Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- onboarding visual sem substituir a autenticação local real.

### `v74-experience.js`

Camada de orquestração visual. Reutiliza o DOM, estado e handlers existentes e não grava diretamente valores financeiros.

Responsabilidades:

- montar saudação e seletor mensal móvel;
- compor resumo mensal e categorias usando dados existentes;
- expor ações rápidas que chamam fluxos reais (`openBillForm`, captura de fatura, Mercado);
- compor feeds/listas móveis a partir do estado já renderizado;
- adaptar Planeamento, Relatórios e Mais ao modelo visual;
- manter a fonte funcional existente em vez de criar uma segunda aplicação.

## 4. Navegação

A fonte de navegação continua centralizada:

- `core.js`: `PAGE_META` e `NAV_GROUPS`;
- `render.js::renderNav()`: desktop, drawer e navegação móvel;
- `events.js`: navegação, backdrop, Escape e breakpoints;
- `mobile-menu-toggle.js`: animação, reparenting do mesmo botão e gestos;
- `mobile-menu-toggle.css`: apresentação final da sidebar/drawer à direita.

Na v74, a barra inferior móvel prioriza:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

O drawer mantém acesso à arquitetura completa de páginas.

## 5. Cabeçalho e viewport móvel

Até `820px`:

- topbar é `fixed`;
- `env(safe-area-inset-top)` é respeitado;
- `.main` recebe `padding-top` correspondente ao header;
- conteúdo recebe espaço inferior para a navegação e `safe-area-inset-bottom`;
- títulos continuam truncáveis sem provocar overflow;
- `VisualViewport` permanece reservado a gestão de teclado/diálogos em `events.js`;
- não se usa `zoom` CSS como correção de layout.

## 6. Hambúrguer / X e drawer

A v74 preserva o controlador validado da v73:

- sidebar desktop à direita;
- drawer móvel à direita;
- um único `#mobileMenuBtn` muda de hambúrguer para X;
- o botão acompanha o drawer sem duplicar controlos;
- abertura e fecho usam transform/opacidade;
- gesto abre da margem direita para a esquerda e fecha para a direita;
- `prefers-reduced-motion`, Escape, foco e ARIA continuam suportados.

## 7. Faturas e captura por QR

O redesign não altera a semântica financeira:

- criação/edição continua nos formulários existentes;
- QR é preenchimento assistido;
- informação extraída é revista antes de guardar;
- o sistema não inventa linhas de artigos não comprovadas pelo conteúdo da fatura/QR;
- pagamentos e estados continuam a usar os mesmos modelos e testes.

## 8. Mercado

A arquitetura do Mercado continua isolada do núcleo financeiro:

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica produto, não prova preço pago;
- imagens são opcionais e apenas mostradas quando passam validação das fontes autorizadas;
- Continente/Pingo Doce e Open Facts permanecem sujeitos às políticas de sanitização e correspondência existentes;
- scanner não grava vídeo nem cria credenciais.

## 9. Ícones e acessibilidade

- Lucide local continua o sistema vetorial oficial;
- métricas SVG normalizadas em `design-system.css`;
- foco visível preservado;
- contraste claro/escuro validado automaticamente;
- controlos principais mantêm alvos de 44 px ou superiores; controlos compactos permanecem acima do mínimo WCAG aplicável;
- pinch zoom não é bloqueado;
- `aria-current`, `aria-live`, labels e estados do drawer são preservados.

## 10. Distribuição pública

Build candidato:

- `BUILD = v74`;
- `UI_REV = 74-ui1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- cache: `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

`ui-consistency.css` e `v64-runtime.css` deixaram de ser copiados para `dist`; as regras visuais necessárias foram consolidadas. `v64-runtime.js` permanece porque contém comportamento funcional ainda em uso.

## 11. QA

CI candidata `34209567627` / `#1435`: sucesso integral em sintaxe, finanças, isolamento, QR, Mercado, imagens, scanner, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade e sincronização.

Validação física pós-publicação continua recomendada em iPhone, Android/tablet e desktop.
