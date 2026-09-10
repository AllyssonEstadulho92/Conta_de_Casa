# Changelog Técnico — Conta de Casa

O histórico integral de commits e versões permanece no Git. Este ficheiro mantém as alterações relevantes para continuidade técnica.

## 2026-09-10 — v76 `76-veggie-menu1` — Veggie Burger/X em TypeScript

### Objetivo

Substituir o ícone móvel de três linhas por um **Veggie Burger de duas linhas** que se transforma no mesmo X, manter o controlo visível durante swipe e reforçar a topbar sticky, sem alterar o domínio financeiro.

### Diagnóstico

- `mobile-menu-toggle.js` v73 já controlava abertura/fecho, swipe, foco e ARIA;
- `#drawerCloseBtn` legado já era ocultado para evitar X duplicado;
- o controlador movia `#mobileMenuBtn` para `.drawer-head`;
- `.drawer-head` fica dentro da `.nav-drawer-shell`, superfície transformada durante o gesto horizontal;
- assim, o próprio controlo podia acompanhar a shell e sair parcialmente da área visível durante swipe.

### Alterações

- criado `src/ui/veggie-menu-toggle.ts` como fonte TypeScript strict;
- criado `v76-veggie-menu.js` como runtime browser derivado;
- criado `v76-veggie-menu.css`, revisão `76-veggie-menu1`;
- fechado: exatamente duas barras horizontais;
- aberto: linha superior `+45°` e linha inferior `-45°`, formando X;
- continua a existir apenas um `#mobileMenuBtn`;
- `aria-expanded` e `aria-label` continuam associados ao mesmo controlo;
- quando o dialog está aberto, o mesmo botão passa a filho direto de `#mobileDrawer`, fora da shell transformada;
- o botão mantém-se visível durante `data-dragging` e `data-closing`;
- `.drawer-head` reserva espaço para não colidir com marca/título;
- topbar reforçada como sticky no mobile;
- `prefers-reduced-motion` e `forced-colors` suportados.

### Isolamento e segurança

Não altera `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB, schema, PIN, PBKDF2, AES-GCM, backup, sync, QR, scanner ou Mercado. Não introduz endpoint, CDN, telemetria, token, chave ou origem CSP.

### Distribuição e QA

- `scripts/prepare-pages.cjs` publica `v76-veggie-menu.css/js?v=76-veggie-menu1`;
- runtime novo carrega depois de `mobile-menu-toggle.js`;
- `sw.js` inclui assets e cache `veggie-menu1`;
- criado `tests/v76-veggie-menu.test.cjs` e integrado em CI/Pages;
- PR #74 integrado em `main` como `f196545662b5d120a0dd21b2c498a209cfc144d3`;
- TypeScript final de `main` `34517268279`: **sucesso**;
- CI final de `main` `34517268450`: **sucesso**;
- GitHub Pages `34517324242`: **sucesso**.

### Pendente

Validação física em iPhone/Safari/PWA: transformação duas linhas ↔ X, swipe de abertura/fecho sem desaparecimento, posição do X, topbar sticky, ausência de segundo X e geometrias 320/375/390/430 px.

---

## 2026-09-10 — v75 `75-expenses1` — layout moderno de Despesas

- criado `v75-expenses-modern.css`, limitado a `#page-bills`;
- Lista/Calendário, pesquisa, Nova fatura, filtros, resumo, tabela desktop e cartões mobile modernizados;
- `Em falta`, vencimento, estado, Total, Pago, Categoria, progresso e ações preservados;
- domínio financeiro, IndexedDB, segurança, Mercado, QR, scanner e sync inalterados;
- PR #73 integrado como `176450fcb236a2272afb9d6a6983b42681aa705d`;
- CI `34496500755`, TypeScript `34496500641` e Pages `34496540096`: sucesso.

---

## 2026-09-10 — v76 Bloco 1 — fundação TypeScript

- `docs/TYPESCRIPT_MIGRATION.md` criado;
- TypeScript apenas como `devDependency`;
- `tsconfig.json` strict/noEmit;
- contratos em `src/types/` e testes em `src/type-tests/`;
- workflow TypeScript dedicado;
- PR #72 integrado como `2c1d78508507ab77d6df95850568d9fd7f6b9577`;
- TypeScript `34485922921`, CI `34485922896` e Pages `34485986996`: sucesso.

---

## 2026-09-10 — v75 `75-market1`

- pesquisa live e pesquisa da lista separadas na comunicação;
- filtros mobile visíveis;
- estados `Por comprar`, `Preço por confirmar`, `Comprado`;
- confirmação de preço real exposta quando necessária;
- pipeline `marketId|pid` preservado;
- PR #71 integrado como `c44348dbc5a942b601f360fa38793bd9d8b47a1a`;
- Pages `34482133540`: sucesso.

---

## 2026-09-10 — v75 `75-assets1`

- biblioteca local-first para fontes, ícones e media;
- Lucide SVG local permanece principal;
- loader opt-in com lazy/fallback/reduced-motion;
- CSP não expandida;
- PR #69 integrado como `a8e04d6811bd6eb08487de139fb19fb2f12128ec`;
- CI `34478047035` e Pages `34478091014`: sucesso.

---

## 2026-09-10 — v75 `75-pages1`

- Início, Despesas e Planeamento reorganizados visualmente sem alterar cálculos;
- PR #68 integrado como `c8ec45893c8936093ecd7c7da9ee08c9a268109c`;
- CI `34474037338` e Pages `34474069564`: sucesso.

---

## 2026-09-10 — v75 `75-usability1`

- `touch-action: manipulation`;
- inputs mobile com 16 px;
- alvos tácteis 44/48 px;
- pinch-to-zoom preservado;
- PR #66 integrado como `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`;
- CI `34471773663` e Pages `34471814790`: sucesso.

---

## 2026-09-10 — `75-startup2` + `75-catalog4` + `75-photo-loader3`

- abertura pós-PIN em dispositivo emparelhado deixa de esperar pela verificação remota;
- PBKDF2/AES-GCM inalterados;
- fotografias terminam em estado estável com cooldown;
- `sourceUrl` oficial exata não dispara resolução redundante;
- host/path/PID permanecem estritos.

## Histórico anterior

Revisões anteriores de faturas, pagamentos, navegação, segurança, sincronização, Mercado, catálogo e responsividade permanecem no histórico Git e em `release-manifest.json`. Não remover comportamento histórico sem prova de ausência de referências e regressões.
