# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade técnica do programa atual.

## 2026-09-12 — `76-product-pages1` — Dashboard — em curso

### Objetivo

Traduzir a hierarquia visual dos protótipos para o Dashboard real sem criar métricas ou regras financeiras novas.

### Alterações

- criada `v76-product-pages.css` como camada de composição interna das páginas;
- carregamento definido depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`;
- `Saldo atual` existente passa a ser o resumo financeiro dominante;
- `Por pagar`, `Em atraso` e `Saldo projetado` passam para o segundo nível visual;
- `Pago no mês` e `Próximos 7 dias` tornam-se métricas secundárias compactas;
- desktop reorganiza detalhe em `Próximos vencimentos + Orçamento` e `Atividade recente + Despesas por categoria`;
- mobile usa fluxo vertical próprio, sem reduzir literalmente o desktop;
- `alertsPanel` vazio deixa de ocupar espaço;
- reduced-motion e forced-colors cobertos;
- `scripts/prepare-pages.cjs` inclui `76-product-pages1` no bundle;
- Service Worker inclui a nova folha e invalida cache com `product-pages1`;
- criado `tests/v76-product-pages.test.cjs` e adicionado ao CI.

### Domínio preservado

- `renderDashboard()` continua a chamar `dashboardNumbers()`;
- `n.current`, `n.pending`, `n.overdue`, `n.projected`, `paymentTotal` e `next7` permanecem as fontes canónicas;
- vencimentos, orçamento, categorias e atividade usam os renderizadores/dados existentes;
- nenhum cálculo, schema, IndexedDB, cifragem, sync, QR, scanner ou regra de Mercado foi alterado.

### Gates

No primeiro CI da branch, sintaxe, finanças, Mercado, UI, responsive, segurança, sync e o novo teste `v76-product-pages` passaram. Após as atualizações documentais finais, o head deverá ser reconfirmado antes de abrir/mergear o PR.

---

## 2026-09-12 — `76-modern-ui2` / `ui-components1` — PR #85 — integrado

Merge: `2a9cc3148e5750561b14f6a0505934d1a6d74d05`.

### Alterações

- `v76-modern-ui.css` revisto para `76-modern-ui2`;
- tokens para altura de controlos, raio, ícone, gap e opacidade disabled;
- hierarquia visual primary/secondary/danger/link/icon button;
- baseline 44 px;
- estados disabled/`aria-disabled`, `focus-visible` e hover de ponteiro fino;
- métricas coerentes de ícones;
- `min-width:0` em grids partilhados;
- fotografias do Mercado com `object-fit:contain`, centro e fallback;
- cache PWA `modern-ui2` + `ui-components1`;
- testes e documentação atualizados.

### Gates

- CI final do PR: sucesso;
- TypeScript Foundation final: sucesso;
- diff revisto sem alteração de domínio;
- workflow Pages disparado depois do merge terminou cancelado/skipped; por isso ainda não é tratado como confirmação positiva de deployment.

### Isolamento

Não foram alterados `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sync, QR/scanner, faturas ou regras de Mercado.

---

## 2026-09-12 — direção de produto a partir dos protótipos

- Dashboard: resumo financeiro real → KPIs reais → vencimentos/orçamento → categorias/atividade;
- Mercado: pesquisa/catálogo/carrinho/estimativa/fatura com identidade e preço separados;
- Planeamento: redesign apenas sobre saldo atual, saldo inicial, orçamento e rendimentos existentes até novas funções serem aprovadas;
- Calendário: foco nos vencimentos/pagamentos atualmente suportados;
- Faturas: pesquisa/filtros/resumo/tabela desktop/lista mobile com “Nova fatura” como ação principal;
- desktop e mobile usam a mesma linguagem visual, mas composição adaptativa;
- dados ou ações existentes apenas no mockup não entram em produção sem suporte real.

---

## 2026-09-12 — meta de fonte 100% TypeScript

Decisão: a fonte funcional mantida deverá ser TypeScript strict. O browser continuará a receber JavaScript **compilado**.

- nenhum `.js` runtime será apagado antes de existir substituto TypeScript equivalente;
- não será aceite conversão massiva com `@ts-nocheck` ou `any` em massa;
- primeiro é necessário separar typecheck de emissão e provar um módulo runtime gerado pelo build;
- depois: funções puras → domínio financeiro → Mercado → core/persistência/cifra → sync → UI → PWA/build → testes/tooling;
- JavaScript gerado deve tornar-se artefacto de build, não fonte manual.

---

## 2026-09-11 — PR #84 — consolidação UI/shell — publicado

Merge: `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`.

- removida de `v76-modern-ui.css` a geometria mobile duplicada de `.main`, `.topbar`, `.main>.page` e `.mobile-nav`;
- `v76-mobile-shell.css` permanece autoridade de viewport, safe areas, scroll e dock;
- gate arquitetural impede reintrodução da geometria concorrente.

---

## 2026-09-11 — PR #82 — baseline arquitetural v76 — publicado

Merge: `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`.

- propriedade única por preocupação;
- `mobile-layout.css` deixa de possuir viewport/topbar/nav persistente;
- criado `tests/ui-architecture-contract.test.cjs`;
- cache PWA `architecture-baseline1`.

---

## 2026-09-11 — PR #80 — `76-mobile-shell2` — publicado

Merge: `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`.

- scroll principal no documento em mobile;
- safe areas superiores/inferiores explícitas;
- topbar no fluxo normal;
- dock inferior com reserva de página;
- cobertura 320/375/390/430 e landscape;
- sem bloquear pinch-to-zoom.

---

## 2026-09-10 — PR #78 — `76-version-audit1` — publicado

- separação entre Application Version, Public Release e Build ID;
- `registration.update()` antes de declarar ausência de atualização;
- release pública permanece `v75`.

---

## 2026-09-10 — PR #76 — `76-veggie-menu2` + `76-modern-ui1` — publicado

Merge: `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

- Veggie Burger/X em TypeScript strict;
- topbar mobile no fluxo normal;
- primeiro design system transversal v76.

---

## 2026-09-10 — PR #73 — `75-expenses1`

- modernização de Faturas/Despesas;
- `renderBills()`/`filterBills()` e domínio financeiro preservados.

## 2026-09-10 — PR #72 — fundação TypeScript

- TypeScript 6 como ferramenta de desenvolvimento;
- `tsconfig.json` strict/noEmit;
- contratos de domínio e type-tests;
- workflow TypeScript dedicado.

## Histórico anterior

Mercado, catálogos, imagens, sincronização, segurança, formulários, QR/scanner, PWA e restantes revisões permanecem no histórico Git. Não remover comportamento histórico sem prova de ausência de referências e regressões verdes.
