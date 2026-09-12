# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade técnica do programa atual.

## 2026-09-12 — `76-modern-ui2` / `ui-components1` — PR #85

### Objetivo

Consolidar a linguagem visual partilhada antes do redesign página a página e antes de avançar com a remoção do JavaScript legado.

### Alterações

- `v76-modern-ui.css` revisto para `76-modern-ui2`;
- tokens novos para altura de controlos, raio, ícone, gap e opacidade disabled;
- hierarquia visual explícita de ações: primary, secondary, danger, link e icon button;
- controlos principais com baseline 44 px;
- estados disabled/`aria-disabled`, `focus-visible` e hover de ponteiro fino;
- métricas coerentes para ícones em botões;
- `min-width:0` em grids partilhados para reduzir overflow;
- apresentação de fotografias do Mercado com `object-fit:contain`, centro e fallback;
- cache PWA revisto para `modern-ui2` + `ui-components1`;
- testes de modern UI, shell, Veggie Burger e contrato arquitetural alinhados com a revisão;
- documentação permanente atualizada com a direção visual dos protótipos e a meta de fonte TypeScript.

### Isolamento

Não foram alterados `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, IndexedDB, PIN, PBKDF2/AES-GCM, backup, sync, QR/scanner, faturas ou regras de Mercado.

### Gates e estado

- PR #85 aberto a partir de `feat/v76-ui-components1`;
- CI do PR `34664678296`: sucesso;
- TypeScript Foundation `34664678384`: sucesso;
- diff final revisto contra `main`, sem ficheiros de domínio alterados;
- commit documental posterior aos gates exige nova confirmação automática antes do merge;
- integração em `main` e validação GitHub Pages permanecem pendentes.

---

## 2026-09-12 — direção de produto a partir dos protótipos

- Dashboard: header limpo → resumo financeiro real → KPIs reais → ações rápidas → vencimentos/orçamento → categorias/atividade;
- Mercado: pesquisa/catálogo/carrinho/estimativa/fatura com identidade e preço rigorosamente separados;
- Planeamento: redesign apenas sobre saldo atual, saldo inicial, orçamento e rendimentos existentes até novas funções serem aprovadas;
- Calendário: foco nos vencimentos/pagamentos atualmente suportados;
- Faturas: pesquisa/filtros/resumo/tabela desktop/lista mobile com “Nova fatura” como ação principal;
- desktop e mobile usam a mesma linguagem visual, mas composição adaptativa;
- dados ou ações existentes apenas no mockup não entram em produção sem suporte real.

---

## 2026-09-12 — meta de fonte 100% TypeScript

Decisão: a fonte funcional mantida deverá ser TypeScript strict. O browser continuará a receber JavaScript **compilado**, porque TypeScript não é executado diretamente pelo browser.

- nenhum `.js` runtime será apagado antes de existir substituto TypeScript equivalente;
- não será aceite conversão massiva com `@ts-nocheck` ou `any` em massa;
- ordem: funções puras → domínio financeiro → Mercado → core/persistência/cifra → sync → UI → PWA/build → testes/tooling;
- JavaScript gerado deve tornar-se artefacto de build, não fonte manual.

---

## 2026-09-11 — PR #84 — consolidação UI/shell — publicado

Merge: `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`.

- removida de `v76-modern-ui.css` a geometria mobile duplicada de `.main`, `.topbar`, `.main>.page` e `.mobile-nav`;
- `v76-mobile-shell.css` permanece autoridade de viewport, safe areas, scroll e dock;
- design system mantém apenas aparência/composição de shell e componentes;
- gate arquitetural impede reintrodução da geometria concorrente;
- domínio financeiro e segurança permaneceram isolados.

---

## 2026-09-11 — PR #82 — baseline arquitetural v76 — publicado

Merge: `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`.

- propriedade única por preocupação;
- `mobile-layout.css` deixa de possuir viewport/topbar/nav persistente;
- criado `tests/ui-architecture-contract.test.cjs`;
- cache PWA `architecture-baseline1`;
- CI, TypeScript Foundation e Pages concluídos com sucesso.

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
- release pública permanece `v75`;
- domínio financeiro e cofre isolados.

---

## 2026-09-10 — PR #76 — `76-veggie-menu2` + `76-modern-ui1` — publicado

Merge: `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`.

- Veggie Burger/X em TypeScript strict;
- topbar mobile no fluxo normal;
- primeiro design system transversal v76;
- suporte a dark mode, reduced-motion, forced-colors e toque.

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
