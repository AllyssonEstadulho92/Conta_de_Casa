# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade do programa v76.

## 2026-09-13 — PR #96 / `76-auth-transition1` — PIN abre Dashboard e dock deixa de sobrepor cofre — publicado

### Evidência

Captura física em Safari/iPhone mostrou `#vaultScreen` ainda visível depois da tentativa de entrada, enquanto o dock autenticado (`Início`, `Despesas`, `Mercado`, `Planeamento`, `Mais`) já aparecia por cima e cobria a zona inferior do formulário.

### Causa

- `enterApp()` adicionava `app-active` antes de a aplicação ficar visível;
- depois aguardava `syncStartupGate()`;
- `v75-startup-guard.js` via `app-active + vault hidden + app hidden` e voltava a apresentar o cofre como ecrã transitório;
- o dock móvel, fixo e dependente de `app-active`, podia renderizar acima do cofre;
- utilizadores locais sem sync configurado podiam ser enviados para Segurança em vez de abrir o Dashboard.

### Correção

- revisão `76-auth-transition1` em `v75-startup-guard.js`;
- PIN local válido passa a concluir a abertura da aplicação sem esperar pelo sync remoto;
- `showPage('dashboard')` torna a página principal o destino da transição;
- sync real é restaurado e executado em background;
- `syncAuthVisibility()` mantém cofre e app visualmente exclusivos;
- em falha de entrada, remove `app-active`, esconde app e volta ao cofre;
- `v76-mobile-shell.css` adiciona defesa `#vaultScreen:not([hidden]) + #app { display:none!important; }`;
- Service Worker recebe `auth-transition1` apenas para invalidar cache;
- `safari-startup.test.cjs` e `v76-mobile-shell.test.cjs` passam a cobrir a regressão real.

### Preservado

Sem alterações a `unlockVault()`, PBKDF2-SHA-256, AES-GCM, 250000 iterações, IndexedDB, `STATE_VERSION=5`, cálculos, pagamentos, faturas, Mercado, QR, scanner ou política de conflitos.

### QA/publicação

- CI do PR #96 `34780363548`: sucesso;
- TypeScript Foundation do PR `34780363549`: sucesso;
- merge `d18d274141b1032ab0e909729739b3f86cabfb9e`;
- CI pós-merge `34780407473`: sucesso integral;
- TypeScript Foundation pós-merge `34780407487`: sucesso;
- Deploy Pages `34780437328`: sucesso completo.

---

## 2026-09-13 — PR #95 — política de conflitos de sync migrada para TypeScript — publicado

- fonte canónica: `src/sync/sync-conflict-policy.ts`;
- removida fonte manual `sync-conflict-policy.js`;
- build gera `.generated/sync-conflict-policy.js` e publica o mesmo nome em `dist`;
- diferenças técnicas de imagem/identidade auxiliar do Mercado não abrem falsos conflitos;
- diferenças financeiras continuam a abrir revisão;
- TypeScript strict detetou uma possível função indefinida durante a migração; o narrowing foi corrigido antes do merge;
- merge `a557ba3d93fec89bd31468183de89008a9181eb2`;
- CI, TypeScript e Pages verdes.

---

## 2026-09-13 — PR #94 / `76-dashboard-clean1` — Dashboard sem composição visual duplicada

- suprime `cdcMobileGreeting`, `cdcMobileMonthWrap`, `cdcMonthHero`, `cdcQuickActions` e `cdcDashboardCategories` da apresentação final;
- mantém os dados/cálculos canónicos de `renderDashboard()`/`dashboardNumbers()`;
- saldo principal e topbar recebem acabamento mais sóbrio;
- não remove ainda a criação desses nós dentro do runtime v74; essa consolidação continua pendente.

---

## 2026-09-13 — PR #93 — gate de integridade de todas as páginas

Novo gate impede:

- rota sem secção `page-*`;
- página sem ramo de `renderPage()`;
- `data-page`/`data-go` para rota inexistente;
- IDs HTML duplicados;
- asset local referenciado mas ausente do `dist`;
- divergência allowlist/Service Worker;
- publicação acidental de docs/testes/scripts.

---

## 2026-09-13 — PR #91 / `76-auth1` — redesign visual do cofre

- visual mais limpo e quase full-bleed no mobile;
- keypad circular;
- `Entrar` como única ação dominante;
- palavra-passe/recuperação/importação mantidas com menor peso;
- nenhuma biometria fictícia;
- PBKDF2/AES-GCM e dados preservados.

---

## 2026-09-12 — PR #89 — `market-branding` em TypeScript

- `src/ui/market-branding.ts` canónico;
- JS manual removido;
- runtime público gerado pelo build;
- CI/TypeScript/Pages verdes.

---

## 2026-09-12 — PR #88 — primeiro JS manual substituído por TypeScript

- `src/ui/veggie-menu-toggle.ts` canónico;
- `v76-veggie-menu.js` manual removido;
- `.generated/` e `dist/` tratados como artefactos;
- baseline de rollback `backup/js-runtime-baseline-20260912` criada.

---

## 2026-09-12 — PR #86 — primeiro Dashboard v76 real

- `Saldo atual` dominante;
- `Por pagar`, `Em atraso`, `Saldo projetado` em segundo nível;
- métricas secundárias e painéis reorganizados;
- desktop/mobile com composição distinta;
- fórmulas preservadas.

---

## Decisões de continuidade

- regressão observada em dispositivo real tem prioridade sobre contrato visual legado;
- sync remoto não pode impedir abertura local após PIN válido;
- navegação móvel deve ser consolidada para uma única autoridade;
- blocos v74 já substituídos devem deixar de ser criados, não apenas escondidos;
- migração TypeScript continua módulo a módulo, sem eliminação massiva de JavaScript funcional.