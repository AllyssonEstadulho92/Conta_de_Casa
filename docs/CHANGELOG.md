# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-10 — v76 `76-veggie-menu1` — Veggie Burger/X em TypeScript

### Objetivo

Substituir o ícone móvel de três linhas por um **Veggie Burger de duas linhas** que se transforma no mesmo botão X, impedir que o controlo desapareça durante o swipe e reforçar a permanência do cabeçalho no topo, sem alterar o domínio financeiro ou reescrever o controlador de navegação validado.

### Diagnóstico

- `mobile-menu-toggle.js` v73 já controlava abertura/fecho, swipe, foco e estados ARIA;
- `#drawerCloseBtn` legado já era ocultado para evitar um X duplicado;
- o controlador movia `#mobileMenuBtn` para `.drawer-head` quando o drawer abria;
- `.drawer-head` está dentro da `.nav-drawer-shell`, superfície que recebe `transform` durante o gesto horizontal;
- consequentemente, o próprio controlo podia acompanhar a shell e sair parcialmente da área visível durante o swipe;
- a `.topbar` já usava `position: sticky` na base, mas a nova camada reforça explicitamente esta invariável no mobile.

### Alterações

- criado `src/ui/veggie-menu-toggle.ts` como fonte TypeScript strict;
- criado `v76-veggie-menu.js` como runtime browser derivado da fonte TS;
- criado `v76-veggie-menu.css` revisão `76-veggie-menu1`;
- fechado: exatamente duas barras horizontais;
- aberto: linha superior roda `+45°` e linha inferior `-45°`, formando o X;
- continua a existir apenas um `#mobileMenuBtn` para abrir e fechar;
- `aria-expanded` e `aria-label` continuam associados ao mesmo controlo;
- quando o dialog está aberto, a camada TS move o mesmo botão para filho direto de `#mobileDrawer`, fora da shell transformada;
- o botão mantém-se visível durante `data-dragging` e `data-closing`;
- `.drawer-head` reserva espaço no lado direito para a marca/título não colidirem com o controlo;
- topbar reforçada como sticky no mobile;
- suporte a `prefers-reduced-motion` e `forced-colors`.

### Isolamento e segurança

- não altera `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB ou schema persistido;
- não altera PIN, PBKDF2, AES-GCM, backup ou sincronização;
- não altera QR, scanner ou Mercado;
- não introduz endpoint, CDN, telemetria, token, chave ou origem CSP;
- o teste específico impede chamadas a `commit()`/`saveState()` ou dependência de estado financeiro nesta camada.

### Distribuição e QA

- `scripts/prepare-pages.cjs` publica `v76-veggie-menu.css/js?v=76-veggie-menu1`;
- o runtime novo é carregado depois de `mobile-menu-toggle.js`, mantendo o controlador v73 por baixo;
- `sw.js` inclui ambos os assets e invalida cache com `veggie-menu1`;
- criado `tests/v76-veggie-menu.test.cjs` e integrado em CI/Pages;
- TypeScript Foundation run `34516585121` no head funcional `95bdacab47b8b97d5f6cf61d52fc492b5a10ceca`: **sucesso**;
- CI run `34516585241` no mesmo head: **sucesso**, incluindo o novo teste e toda a regressão financeira, Mercado, segurança, responsividade, acessibilidade, sincronização e manifest;
- validação física em iPhone/Safari/PWA permanece pendente após publicação.

---

## 2026-09-10 — v75 `75-expenses1` — layout moderno de Despesas

### Objetivo

Modernizar Despesas/Faturas sem alterar cálculos, filtros, dados, pagamentos, segurança ou sincronização.

### Alterações

- criado `v75-expenses-modern.css`, limitado a `html.cdc-v75 #page-bills`;
- Lista/Calendário refinados;
- pesquisa e `Nova fatura` reorganizadas;
- filtros, cartões de resumo, tabela desktop e cartões mobile modernizados;
- `Em falta`, vencimento, estado, Total, Pago, Categoria, progresso e ações preservados;
- breakpoints mobile/tablet/desktop;
- `prefers-reduced-motion` e `forced-colors` tratados.

### Isolamento e QA

Não foram alterados `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js` ou `index.html` fonte. Não existem mudanças em IndexedDB, PIN, PBKDF2, AES-GCM, Mercado, QR, scanner ou sync.

- PR #73 integrado em `main` como `176450fcb236a2272afb9d6a6983b42681aa705d`;
- CI de `main` `34496500755`: sucesso;
- TypeScript Foundation `34496500641`: sucesso;
- Pages `34496540096`: sucesso.

---

## 2026-09-10 — v76 Bloco 1 — fundação TypeScript

- criado `docs/TYPESCRIPT_MIGRATION.md` com estratégia por blocos;
- TypeScript adicionado apenas como `devDependency`;
- `tsconfig.json` em modo strict/noEmit;
- criados tipos nominais e contratos em `src/types/`;
- criado `src/type-tests/contracts.ts`;
- workflow `.github/workflows/typescript.yml` adicionado;
- nenhum runtime, cálculo, armazenamento, segurança ou UI foi alterado no Bloco 1;
- PR #72 integrado como `2c1d78508507ab77d6df95850568d9fd7f6b9577`;
- TypeScript `34485922921`, CI `34485922896` e Pages `34485986996`: sucesso.

Durante o mapeamento foi registada a lacuna do Mercado: o parser Cesta extrai `pid`, mas o objeto de resultado/addProduct ainda não o preserva como campo próprio. Não corrigir sem teste específico.

---

## 2026-09-10 — v75 `75-market1`

- pesquisa live e pesquisa da lista passaram a comunicar contextos distintos;
- rótulos Estado/Categoria/Ordenar tornaram-se visíveis no mobile;
- estados `Por comprar`, `Preço por confirmar`, `Comprado`;
- item comprado sem `actualCents` expõe confirmação de preço real imediatamente;
- browser live refinado sem alterar o pipeline `marketId|pid`;
- PR #71 integrado como `c44348dbc5a942b601f360fa38793bd9d8b47a1a`;
- Pages `34482133540`: sucesso.

---

## 2026-09-10 — v75 `75-assets1`

- biblioteca/critério local-first para fontes, ícones e media;
- Lucide SVG local permanece sistema principal de ícones;
- `asset-loader.js/css` opt-in com lazy loading, fallback e reduced-motion;
- CSP não expandida;
- PR #69 integrado como `a8e04d6811bd6eb08487de139fb19fb2f12128ec`;
- CI `34478047035` e Pages `34478091014`: sucesso.

---

## 2026-09-10 — v75 `75-pages1`

- Início: hierarquia e densidade revistas sem alterar métricas;
- Despesas mobile voltou à vista canónica com Lista/Calendário, filtros, resumo e cartões;
- Planeamento reorganizado responsivamente;
- PR #68 integrado como `c8ec45893c8936093ecd7c7da9ee08c9a268109c`;
- CI `34474037338` e Pages `34474069564`: sucesso.

---

## 2026-09-10 — v75 `75-usability1`

- `touch-action: manipulation` em controlos;
- formulários mobile com 16 px para reduzir auto-zoom Safari;
- alvos tácteis 44/48 px;
- pinch-to-zoom preservado;
- PR #66 integrado como `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`;
- CI `34471773663` e Pages `34471814790`: sucesso.

---

## 2026-09-10 — `75-startup2` + `75-catalog4` + `75-photo-loader3`

- abertura pós-PIN em dispositivo emparelhado deixa de esperar pela verificação remota;
- PBKDF2/AES-GCM permanecem inalterados;
- fotografias terminam em estado estável carregar → validar → `Sem fotografia` com cooldown;
- `sourceUrl` oficial exata não dispara resolução redundante;
- host/path/PID permanecem estritos.

## Histórico anterior

Revisões anteriores de faturas, pagamentos, navegação, segurança, sincronização, Mercado, catálogo e responsividade permanecem no histórico Git e em `release-manifest.json`. Não remover comportamento histórico sem prova de ausência de referências e regressões.
