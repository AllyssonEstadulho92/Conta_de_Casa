# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade técnica do programa atual.

## 2026-09-12 — `feat/v76-typescript-runtime2` — primeira fonte JS substituída por TypeScript

### Objetivo

Começar a retirada real de JavaScript manual sem repetir o incidente que bloqueou o GitHub Pages.

### Alterações

- criada branch de fallback `backup/js-runtime-baseline-20260912` na baseline pública `42557d59f464a2fc7fc22a31eb24564e7dbabad9`;
- criada `feat/v76-typescript-runtime2` a partir da mesma baseline publicada;
- `src/ui/veggie-menu-toggle.ts` passa a ser a única fonte versionada do runtime Veggie Burger;
- removido da branch o ficheiro manual `v76-veggie-menu.js`;
- criada `.generated/` como área ignorada de artefactos;
- `scripts/build-typescript-runtime.cjs` gera `.generated/v76-veggie-menu.js` com TypeScript 6;
- o build rejeita a presença de um `v76-veggie-menu.js` manual na raiz;
- `scripts/prepare-pages.cjs` gera o runtime automaticamente e publica-o como `dist/v76-veggie-menu.js`;
- `package.json` separa `typecheck`, `build:runtime` e `build:pages`;
- CI instala a toolchain TS, gera artefactos e executa regressão completa;
- TypeScript Foundation valida fonte TS, artefacto gerado e ausência do JS manual;
- Pages gera novamente o runtime antes da validação e do deploy;
- criado `tests/typescript-runtime-build.test.cjs`;
- `tests/v76-veggie-menu.test.cjs` passa a testar o artefacto gerado.

### Evidência funcional

Antes da atualização documental final:

- TypeScript Foundation `34695947847`: sucesso;
- CI integral `34695947843`: sucesso;
- todos os gates financeiros, cofre, datas, faturas, Mercado, scanner, UI, responsive, acessibilidade, sync, PWA e manifesto continuaram verdes.

### Segurança e domínio

Nenhum cálculo, IndexedDB, schema, PBKDF2/AES-GCM, sync, QR/scanner, fatura ou regra de Mercado foi alterado. Este bloco substitui apenas a origem do runtime Veggie Burger.

---

## 2026-09-12 — `76-product-pages1` / PR #86 — publicado

- merge em `main`: `42557d59f464a2fc7fc22a31eb24564e7dbabad9`;
- CI `34695579311`: sucesso;
- TypeScript Foundation `34695579282`: sucesso;
- Deploy Pages `34695600399`: sucesso;
- o primeiro redesign real do Dashboard passou a fazer parte do site publicado.

Alterações principais:

- `Saldo atual` existente como resumo financeiro dominante;
- `Por pagar`, `Em atraso` e `Saldo projetado` em segundo nível;
- `Pago no mês` e `Próximos 7 dias` compactos;
- desktop reorganiza vencimentos/orçamento e atividade/categorias;
- mobile usa composição própria;
- `renderDashboard()`/`dashboardNumbers()` e fórmulas permanecem inalterados.

---

## 2026-09-12 — auditoria de publicação / PR #87 — corrigido e publicado

### Facto

O commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` removeu `v75-architecture.js` diretamente de `main`, embora CI e bundle público ainda dependessem do ficheiro.

### Impacto

- CI `34693676180` falhou com `MODULE_NOT_FOUND`;
- Pages `34693693840` foi ignorado porque o CI não ficou verde;
- a alteração em `main` não produziu nova versão pública.

### Correção

- PR #87 restaurou exatamente o blob anterior;
- merge `6401f1c5156382e9fe364da31afa3fcec4aed9bc`;
- CI `34695315162`: sucesso;
- Pages `34695336131`: sucesso.

### Regra

Um `.js` fonte só é eliminado depois de existir `.ts` equivalente, build gerado, referências migradas e regressões verdes.

---

## 2026-09-12 — `76-modern-ui2` / `ui-components1` — PR #85 — integrado

- hierarquia primary/secondary/danger/link/icon;
- baseline 44 px;
- estados disabled/`aria-disabled`, foco e hover coerentes;
- métricas de ícones;
- `min-width:0` em grids;
- fotografias do Mercado com `contain`/centro/fallback;
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
