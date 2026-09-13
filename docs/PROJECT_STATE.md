# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — auditoria integral, redesign UI/UX e migração incremental TypeScript  
Branch pública: `main`  
Baseline publicada: `a557ba3d93fec89bd31468183de89008a9181eb2` — PR #95  
Fallback técnico: `backup/js-runtime-baseline-20260912`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM, `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica de SKU/fotografia;
- fotografia não prova preço nem transação;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- redesign ou migração de linguagem não podem alterar silenciosamente cálculos, pagamentos, faturas, persistência, autenticação ou segurança.

## 2. Estado auditado da aplicação

A aplicação publicada contém 10 rotas canónicas: `dashboard`, `bills`, `calendar`, `planning`, `market`, `reports`, `goals`, `security`, `diagnostics` e `settings`.

O PR #93 introduziu um gate permanente que compara `PAGE_META`, as secções `page-*`, os ramos de `renderPage()` e os alvos estáticos `data-page`/`data-go`. O mesmo gate prepara o `dist/` real e verifica IDs duplicados, assets referidos pelo HTML, allowlist do Service Worker, scripts `defer` e exclusão de conteúdo interno do bundle público.

Conclusão atual: não foram encontrados page IDs duplicados, rotas órfãs ou assets locais referidos pelo bundle sem ficheiro correspondente. Esse contrato passa agora a falhar o CI se a divergência reaparecer.

## 3. UI/UX publicada

### Acesso — `76-auth1`

PR #91. O acesso ao cofre usa composição limpa, PIN circular, uma ação dominante, opções de recuperação/importação terciárias e sem biometria fictícia. PIN/palavra-passe, KDF, cifra e IndexedDB permanecem inalterados.

### Dashboard — `76-dashboard-clean1`

PR #94, merge `fa09d934162a95a2ad5be78e22a6ed1d9b76ed58`.

A auditoria encontrou uma sobreposição real: `v74-experience.js` continuava a injetar um segundo resumo, mês, saudação/avatar, ações rápidas e categorias no Dashboard, enquanto o v76 já tinha a sua composição canónica. O v76 passa a suprimir apenas os cinco componentes redundantes (`cdcMobileGreeting`, `cdcMobileMonthWrap`, `cdcMonthHero`, `cdcQuickActions`, `cdcDashboardCategories`) e mantém os caminhos funcionais reais: `#monthPicker`, topbar/notificações, `#kpiGrid`, ação `Adicionar`, `#categoryBars` e `#budgetPanel`.

O saldo principal e os painéis ficam mais sóbrios, sem decoração/elevação desnecessária. `dashboardNumbers()` e fórmulas financeiras não foram alterados.

A revisão pública do CSS é agora `v76-product-pages.css?v=76-dashboard-clean1`.

## 4. Migração TypeScript publicada

O destino é fonte funcional TypeScript strict. O browser continua a receber JavaScript gerado.

Runtimes já migrados e sem fonte JS manual:

1. PR #88 — `src/ui/veggie-menu-toggle.ts` → `.generated/v76-veggie-menu.js`;
2. PR #89 — `src/ui/market-branding.ts` → `.generated/market-branding.js`;
3. PR #95 — `src/sync/sync-conflict-policy.ts` → `.generated/sync-conflict-policy.js`.

No terceiro bloco, a política de sync continua a remover apenas metadados técnicos do Mercado (`productCode`, `imageUrl`, `imageSource`, `imageMatchedAt`) da comparação de negócio; diferenças financeiras continuam a produzir conflito. A fonte manual `sync-conflict-policy.js` foi eliminada.

O build falha se qualquer fonte JS manual já migrada reaparecer.

## 5. Publicação comprovada da baseline atual

PR #95, merge `a557ba3d93fec89bd31468183de89008a9181eb2`:

- TypeScript Foundation `34768413602`: sucesso;
- CI integral `34768413588`: sucesso, incluindo finanças, cofre, faturas/QR, Mercado, UI, responsive, acessibilidade, segurança, sync e manifesto;
- Deploy Pages `34768438493`: sucesso, incluindo geração dos três runtimes TypeScript, validação do bundle, upload e deploy.

Esse deploy também contém o gate de páginas do PR #93 e o Dashboard limpo do PR #94.

## 6. JavaScript ainda existente

A aplicação ainda não é 100% TypeScript. Permanecem fontes JS manuais em domínio, persistência, UI e infraestrutura, incluindo `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `sync.js`, `mobile-menu-toggle.js`, vários módulos do Mercado, runtimes históricos e `sw.js`.

Regra de migração:

`auditar dependências → criar TS strict → provar paridade → gerar artefacto → trocar runtime/build → CI integral → remover JS fonte → publicar → documentar`.

Não será feita exclusão em massa.

## 7. Riscos e lacunas abertas

- `main` ainda não tem branch protection obrigatória;
- validação física visual em iPhone/Safari/PWA instalada e Android/desktop continua necessária; CI não substitui inspeção num dispositivo real;
- `market-experience.js` ainda necessita teste dedicado de persistência de `pid` em todo o fluxo;
- camadas históricas v74/v75 ainda têm CSS/JS redundante a retirar gradualmente depois de provar equivalência;
- o código-fonte funcional ainda é maioritariamente JavaScript;
- CSP/ZXing/origens remotas e cache por tipo de recurso continuam na auditoria de segurança.

## 8. Próximos blocos

1. Faturas: auditar todos os filtros, resumo, tabela/lista mobile, detalhes, editar, pagar, excluir e captura/QR; consolidar hierarquia visual sem tocar em `filterBills()` nem cálculos.
2. Mercado: auditar pesquisa, scanner, imagens, lista/carrinho, quantidade, preço estimado/real, identidade `marketId|pid` e fatura.
3. Planeamento e Calendário: validar orçamento, rendimentos, saldo, vencimentos e navegação.
4. Relatórios, Objetivos, Segurança, Diagnóstico e Definições: validar rotas, estados e acessibilidade.
5. TypeScript: continuar módulos pequenos/pureza comprovada antes de entrar em `finance.js`, `core.js`, `sync.js` e controladores complexos.

A programação não é considerada concluída enquanto estes blocos e a limpeza final de JavaScript fonte não estiverem fechados com testes e documentação.