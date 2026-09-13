# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-13 — `76-brand-icons1` — identidade e iconografia — em validação

### Problemas confirmados

- `icon.svg` combinava casa, euro, folha e dois gradientes, criando demasiada informação em tamanhos pequenos;
- a PWA usava `icon.svg`, enquanto `.brand-mark` era hidratado com Lucide `home`, produzindo duas identidades visuais;
- o Mercado acumulava pseudo-ícones próprios além do sistema Lucide;
- o botão “Adicionar item” recebia `Plus`, mas CSS escondia esse ícone e mostrava `Scan`, contradizendo a ação;
- existiam ícones decorativos adicionais no título, sync e cartões de resumo.

### Correções executadas

- `icon.svg` simplificado para casa + euro, teal sólido `#087B78` e branco;
- removidos folha e gradientes da marca;
- `.brand-mark` passa a reutilizar `icon.svg` em vez de exibir genericamente Lucide `home`;
- Lucide mantém-se como autoridade para navegação, ações e estados;
- pseudo-ícones decorativos/duplicados do Mercado são neutralizados pela autoridade CSS final;
- “Adicionar item” volta a apresentar `Plus` semântico;
- stroke funcional normalizado em 2 px;
- `tests/ui-icons.test.cjs` passa a proteger identidade, semântica e ausência de duplicação;
- cache Service Worker recebe `brand-icons1` para distribuir a alteração.

### Preservado

Sem alterações a `STATE_VERSION`, cálculos, `finance.js`, IndexedDB, PBKDF2/AES-GCM, PIN, sync, QR, scanner, preços, quantidades ou regras de Mercado.

### Pendente antes de publicar

- TypeScript Foundation + CI integral;
- Pages verde;
- validação física em Safari/iPhone/PWA e verificação do ícone instalado, que pode depender de refresh/reinstalação do sistema operativo.

---

## 2026-09-13 — PR #99 / `76-ui-audit1` — auditoria transversal UI/UX — publicado

### Âmbito

Auditoria de header, auth, dock móvel, design system, cascade v74/v75/v76, responsividade, acessibilidade e autoridade de navegação. Referências usadas: Apple HIG, Material/Android accessibility, WCAG 2.2/W3C e web.dev, adaptadas à PWA real.

### Problemas confirmados

- header móvel v75 ainda impunha gradiente escuro e texto/ícones brancos, enquanto v76 já usava superfície clara;
- onboarding `cdcWelcome` do v74 continuava a poder mascarar o fluxo visual `76-auth1` no primeiro acesso;
- navegação móvel continua com duas autoridades (`core/render` e `v74-experience`);
- v74 ainda cria blocos de Dashboard que `76-dashboard-clean1` apenas esconde;
- cascade histórica continua dependente de múltiplos `!important`.

### Correções publicadas

- `v75-header-refinement.css` refeito como camada de compatibilidade neutra: superfície do design system, sem gradiente, sem branco forçado, sem sombra pesada;
- controlos de menu/notificação 44×44 px, foco claro, hover/active discretos e forced-colors;
- `v76-mobile-shell.css` mantém contratos de `76-auth-hidden1`, neutraliza `cdcWelcome` e mantém `vaultCreate` real visível;
- dock móvel passa a superfície única, selected state subtil, ícones/labels coerentes e foco visível;
- cache Service Worker recebe `ui-audit1`;
- auditoria detalhada em `docs/UI_UX_AUDIT.md`.

### Evidência

- merge `add93b922fd8c91d6ec8ad7fffcc8bf5984d673c`;
- CI pós-merge `34782068003`: sucesso integral;
- Pages `34782098996`: sucesso.

---

## 2026-09-13 — PR #98 / `76-auth-hidden1` — Safari respeita `hidden` no cofre — publicado

Segunda validação física mostrou que, apesar do PR #96, o cofre podia continuar visualmente no fluxo enquanto a página `Mais` aparecia por baixo. A causa foi a regra `display:grid!important` do auth competir com o comportamento nativo de `[hidden]` em Safari/WebKit.

Correção:

- `#vaultScreen[hidden]` e `#app[hidden]` explícitos como `display:none!important`;
- proteção anterior de cofre visível → shell oculto preservada;
- cache `auth-hidden1`;
- regressão adicionada ao mobile shell.

Evidência:

- merge `56f909846c5f02c466f047792c99a61f7fbac1c7`;
- TypeScript Foundation `34781128824`: sucesso;
- CI `34781128879`: sucesso;
- Pages `34781156741`: sucesso.

---

## 2026-09-13 — PR #96 / `76-auth-transition1` — PIN abre Dashboard e dock deixa de sobrepor cofre — publicado

- entrada local-first depois de PIN válido;
- sync remoto continua em background;
- rollback seguro em falha de transição;
- shell não pode aparecer enquanto cofre está visível;
- Safari/PWA startup e mobile shell protegidos por testes.

Merge `d18d274141b1032ab0e909729739b3f86cabfb9e`; CI/TypeScript/Pages verdes.

---

## 2026-09-13 — PR #95 — política de conflitos de sync em TypeScript — publicado

- `src/sync/sync-conflict-policy.ts` canónico;
- JS manual removido;
- runtime público gerado pelo build;
- diferenças técnicas não criam falsos conflitos; diferenças financeiras continuam a exigir revisão.

---

## 2026-09-13 — PR #94 / `76-dashboard-clean1`

- suprime visualmente cinco blocos v74 duplicados no Dashboard;
- mantém `renderDashboard()`/`dashboardNumbers()` canónicos;
- criação runtime desses nós ainda é dívida aberta.

---

## 2026-09-13 — PR #93 — gate de integridade de páginas

Valida rota ↔ secção ↔ renderer, IDs duplicados, assets do `dist`, allowlist Service Worker e evita publicação de conteúdo interno.

---

## 2026-09-13 — PR #91 / `76-auth1`

- acesso mais limpo;
- keypad circular;
- `Entrar` dominante;
- recuperação/importação preservadas;
- sem biometria fictícia.

---

## 2026-09-12 — migração TypeScript inicial

- PR #88: Veggie menu TS;
- PR #89: Market branding TS;
- baseline rollback `backup/js-runtime-baseline-20260912`.

---

## Decisões de continuidade

- regressão real em dispositivo tem prioridade sobre teste legado;
- UI final usa conteúdo/hierarquia antes de decoração;
- `icon.svg` é a marca canónica e Lucide é a iconografia funcional;
- navegação móvel precisa de uma única autoridade;
- blocos v74 substituídos devem deixar de ser criados;
- migração TypeScript continua por blocos com paridade e regressões.
