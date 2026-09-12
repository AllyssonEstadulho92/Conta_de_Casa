# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade técnica do programa atual.

## 2026-09-12 — auditoria de publicação / PR #87 — corrigido e publicado

### Facto

O commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` removeu `v75-architecture.js` diretamente de `main`, mas o ficheiro continuava referenciado pelo CI e pelo bundle público.

### Impacto

- CI `34693676180` falhou no `Syntax check` com `MODULE_NOT_FOUND` para `v75-architecture.js`;
- o workflow Pages `34693693840` foi ignorado porque só publica depois de CI verde em `main`;
- portanto, alterar `main` não produziu uma nova versão pública do site.

### Correção

- PR #87 restaurou exatamente o blob anterior de `v75-architecture.js`;
- TypeScript Foundation e CI do PR passaram;
- merge em `main`: `6401f1c5156382e9fe364da31afa3fcec4aed9bc`;
- CI do merge `34695315162`: sucesso;
- Deploy Pages `34695336131`: sucesso completo, incluindo validação, build, upload e deploy.

### Regra nova

Nenhum `.js` runtime pode ser apagado apenas porque existe intenção de migrar para TypeScript. Primeiro o `.ts` equivalente deve ser compilado, usado pelo build/Pages e coberto por testes; depois todas as referências ao JS fonte devem desaparecer; só então o JS fonte é removido.

---

## 2026-09-12 — `76-product-pages1` / PR #86 — Dashboard

### Objetivo

Traduzir a hierarquia visual dos protótipos para o Dashboard real sem criar métricas ou regras financeiras novas.

### Alterações

- criada `v76-product-pages.css` como camada de composição interna das páginas;
- carregamento depois de `v76-modern-ui.css` e antes de `v76-mobile-shell.css`;
- `Saldo atual` existente passa a resumo financeiro dominante;
- `Por pagar`, `Em atraso` e `Saldo projetado` ficam no segundo nível visual;
- `Pago no mês` e `Próximos 7 dias` tornam-se métricas compactas;
- desktop reorganiza `Próximos vencimentos + Orçamento` e `Atividade recente + Despesas por categoria`;
- mobile usa fluxo próprio, sem reduzir literalmente o desktop;
- `alertsPanel` vazio deixa de ocupar espaço;
- reduced-motion e forced-colors cobertos;
- build e Service Worker incluem `76-product-pages1`/`product-pages1`;
- `tests/v76-product-pages.test.cjs` foi criado e adicionado ao CI.

### Domínio preservado

- `renderDashboard()` continua a chamar `dashboardNumbers()`;
- `n.current`, `n.pending`, `n.overdue`, `n.projected`, `paymentTotal` e `next7` permanecem as fontes canónicas;
- vencimentos, orçamento, categorias e atividade reutilizam dados/renderizadores existentes;
- nenhum cálculo, schema, IndexedDB, cifragem, sync, QR, scanner ou regra de Mercado foi alterado.

### Gates

A branch foi sincronizada com o `main` restaurado no commit `5a75e26d72f73b3d4c96802ae4193e0a28b50835`. CI `34695383919` e TypeScript Foundation `34695383909` passaram integralmente antes desta atualização documental. Os gates serão reconfirmados no head documental final antes do merge.

### Por que ainda não aparecia no site

O redesign encontrava-se no PR #86 e não em `main`. GitHub Pages só publica o conteúdo testado de `main`; por isso os protótipos e a nova camada não podiam aparecer no site antes da integração desse PR.

---

## 2026-09-12 — meta de fonte 100% TypeScript

Decisão: a fonte funcional mantida deverá tornar-se TypeScript strict. O browser continuará a receber JavaScript compilado.

Estado:

- `src/types/` já contém contratos de domínio;
- `src/type-tests/` contém provas de tipos;
- `src/ui/veggie-menu-toggle.ts` é o primeiro controlo UI em TS;
- o runtime principal continua maioritariamente em JavaScript manual.

Estratégia:

- separar typecheck de emissão;
- fazer o pipeline gerar artefactos JS de TypeScript em `dist/`;
- manter temporariamente JS antigo como fallback quando necessário;
- migrar por blocos auditáveis;
- apagar cada `.js` fonte apenas depois de paridade, referências migradas e regressões verdes;
- não usar `@ts-nocheck` ou `any` em massa.

---

## 2026-09-12 — `76-modern-ui2` / `ui-components1` — PR #85 — integrado

- hierarquia primary/secondary/danger/link/icon;
- baseline 44 px;
- estados disabled/`aria-disabled`, foco e hover coerentes;
- métricas de ícones;
- `min-width:0` em grids;
- fotografias do Mercado com `contain`/centro/fallback;
- cache PWA `ui-components1`;
- domínio financeiro e segurança preservados.

---

## 2026-09-12 — direção de produto a partir dos protótipos

- Dashboard: resumo financeiro real → KPIs reais → vencimentos/orçamento → categorias/atividade;
- Mercado: pesquisa/catálogo/carrinho/estimativa/fatura com identidade e preço separados;
- Planeamento: apenas sobre saldo, orçamento e rendimentos existentes até novas funções serem implementadas;
- Calendário: foco nos vencimentos/pagamentos suportados;
- Faturas: pesquisa/filtros/resumo/tabela desktop/lista mobile com “Nova fatura” como ação principal;
- desktop e mobile partilham linguagem visual com composição adaptativa;
- dados ou ações existentes apenas no mockup não entram em produção sem suporte real.

---

## Histórico v76 recente

- PR #84 — consolidação UI/shell, merge `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`;
- PR #82 — baseline arquitetural, merge `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`;
- PR #80 — `76-mobile-shell2`, merge `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`;
- PR #78 — versão/auditoria;
- PR #76 — `76-veggie-menu2` + `76-modern-ui1`, merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`;
- PR #73 — modernização de Despesas/Faturas;
- PR #72 — fundação TypeScript strict.

## Histórico anterior

Mercado, catálogos, imagens, sincronização, segurança, formulários, QR/scanner, PWA e restantes revisões permanecem no histórico Git. Não remover comportamento histórico sem prova de ausência de referências e regressões verdes.
