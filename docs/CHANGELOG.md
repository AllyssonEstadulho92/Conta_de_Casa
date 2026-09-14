# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-14 — `76-icon-semantics2` — cor e semântica de ícones — em validação

### Origem

Validação física no iPhone mostrou que a limpeza anterior deixou a navegação demasiado cinzenta, com pouco contraste entre destinos, e o label `Planeamento` aparecia truncado como `Planeame…`.

### Problemas confirmados no código

- `plan` no subset Lucide local não representava claramente planeamento/checklist;
- `settings` usava sliders em vez da engrenagem convencional;
- o menu `Mais` pedia nomes não canónicos (`income`, `security`, `sync`) que podiam cair no fallback genérico `more`;
- vários controlos globais tinham ficado visualmente neutros demais;
- o label móvel `Planeamento` não cabia no espaço disponível do dock.

### Correções executadas

- `plan` passa para a geometria oficial Lucide `clipboard-list` do snapshot fixado no projeto;
- `settings` passa para a engrenagem Lucide oficial;
- novo `activity` para Diagnóstico;
- menu `Mais`: Relatórios → `report`, Metas → `goal`, Segurança → `shield`, Sincronização → `cloudCheck`, Diagnóstico → `activity`;
- dock mostra `Plano` sem alterar a rota `planning` nem o título da página;
- criada paleta semântica controlada para light/dark;
- dock, header, menu Mais, editar/apagar/pagar/avisar/filtrar/sync recebem acentos funcionais;
- ativo continua protegido por `aria-current`, fundo e texto; cor não é o único sinal;
- `forced-colors` continua sob controlo do sistema operativo;
- cache Service Worker recebe `icon-semantics2`;
- testes `ui-icons` e `ui-consistency` atualizados.

### Preservado

Sem alterações a `STATE_VERSION`, cálculos, `finance.js`, IndexedDB, PBKDF2/AES-GCM, PIN, sync de dados, QR, scanner, preços, quantidades ou regras de Mercado.

### Estado

A branch ainda precisa de TypeScript Foundation + CI integral, merge e Pages. A validação física final permanece pendente; não declarar o bloco publicado antes desses gates.

---

## 2026-09-13 — PR #100 / `76-brand-icons1` — identidade e iconografia — publicado

### Problemas confirmados

- `icon.svg` combinava casa, euro, folha e dois gradientes, criando demasiada informação em tamanhos pequenos;
- a PWA usava `icon.svg`, enquanto `.brand-mark` era hidratado com Lucide `home`, produzindo duas identidades visuais;
- o Mercado acumulava pseudo-ícones próprios além do sistema Lucide;
- “Adicionar item” recebia `Plus`, mas CSS escondia esse ícone e mostrava `Scan`, contradizendo a ação;
- existiam ícones decorativos adicionais no título, sync e cartões de resumo.

### Correções publicadas

- `icon.svg` simplificado para casa + euro, teal sólido `#087B78` e branco;
- removidos folha e gradientes da marca;
- `.brand-mark` passa a reutilizar `icon.svg`;
- Lucide mantém-se como autoridade para navegação, ações e estados;
- pseudo-ícones decorativos/duplicados do Mercado neutralizados;
- “Adicionar item” volta a apresentar `Plus` semântico;
- stroke funcional normalizado em 2 px;
- cache Service Worker recebe `brand-icons1`.

### Evidência

- merge PR #100: `5b9689f04e844b9216626729b3b5aae5bf1acc09`;
- CI PR `34783486604`: sucesso integral;
- TypeScript Foundation main `34783537256`: sucesso;
- CI main `34783537266`: sucesso integral;
- Pages `34783564467`: sucesso.

---

## 2026-09-13 — PR #99 / `76-ui-audit1` — auditoria transversal UI/UX — publicado

- header móvel final neutro e acessível;
- drawer e dock consolidados;
- onboarding v74 neutralizado visualmente;
- safe areas, focus, reduced-motion e forced-colors protegidos;
- merge `add93b922fd8c91d6ec8ad7fffcc8bf5984d673c`;
- CI `34782068003` e Pages `34782098996`: sucesso.

---

## 2026-09-13 — PR #98 / `76-auth-hidden1` — Safari respeita `hidden` no cofre — publicado

- `#vaultScreen[hidden]` e `#app[hidden]` explícitos como `display:none!important`;
- proteção cofre visível → shell oculto preservada;
- cache `auth-hidden1`;
- CI/TypeScript/Pages verdes.

---

## 2026-09-13 — PR #96 / `76-auth-transition1` — PIN abre Dashboard — publicado

- entrada local-first depois de PIN válido;
- sync remoto continua em background;
- rollback seguro em falha de transição;
- shell não aparece sobre o cofre.

---

## 2026-09-13 — PR #95 — política de conflitos de sync em TypeScript — publicado

- `src/sync/sync-conflict-policy.ts` canónico;
- JS manual removido;
- runtime público gerado pelo build.

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
- cor semântica é permitida, mas nunca como único sinal de estado;
- navegação móvel precisa de uma única autoridade;
- blocos v74 substituídos devem deixar de ser criados;
- migração TypeScript continua por blocos com paridade e regressões.
