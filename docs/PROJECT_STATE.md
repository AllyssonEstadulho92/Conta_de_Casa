# Estado do Projeto — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada e novamente validada: `6401f1c5156382e9fe364da31afa3fcec4aed9bc` — PR #87  
Trabalho atual: `redesign/v76-product-hierarchy1` — PR #86 / Dashboard `76-product-pages1`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` até existir migração de schema aprovada e testada;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- redesign ou migração de linguagem não podem alterar silenciosamente cálculos, pagamentos, faturas, persistência, autenticação ou segurança.

## 2. Auditoria de publicação — causa confirmada

A ausência das mudanças visuais no site teve duas causas diferentes e confirmadas:

1. O redesign real do Dashboard encontra-se no PR #86 (`redesign/v76-product-hierarchy1`) e ainda não estava integrado em `main`; portanto o GitHub Pages não tinha código para publicar essa nova composição.
2. Depois disso, o commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` apagou `v75-architecture.js` diretamente de `main`, embora o ficheiro continuasse referenciado pelo CI, pelo `scripts/prepare-pages.cjs`, pelos testes e pelo bundle público. O CI `34693676180` falhou com `MODULE_NOT_FOUND` e o Deploy Pages `34693693840` foi corretamente ignorado.

Correção efetuada:

- PR #87 restaurou exatamente o blob publicado de `v75-architecture.js`;
- TypeScript Foundation do PR #87: sucesso;
- CI integral do PR #87: sucesso;
- merge em `main`: `6401f1c5156382e9fe364da31afa3fcec4aed9bc`;
- CI do `main` após o merge: sucesso (`34695315162`);
- GitHub Pages após o merge: sucesso (`34695336131`).

Conclusão: o pipeline de publicação está novamente funcional. O site só receberá o novo Dashboard quando o PR #86 for integrado e o novo `main` passar novamente por CI + Pages.

## 3. Estado publicado em `main`

Integrações relevantes:

- fundação TypeScript strict — PR #72;
- Despesas/Faturas `75-expenses1` — PR #73;
- Veggie Burger TypeScript + `76-modern-ui1` — PR #76;
- auditoria de versão `76-version-audit1` — PR #78;
- shell móvel `76-mobile-shell2` — PR #80;
- baseline arquitetural v76 — PR #82;
- propriedade UI/shell — PR #84;
- componentes partilhados `76-modern-ui2` / `ui-components1` — PR #85;
- recuperação do runtime necessário ao build/Pages — PR #87.

## 4. Trabalho atual — PR #86 / `76-product-pages1`

O redesign do Dashboard reutiliza os cálculos e renderizadores existentes.

Factos preservados:

- `renderDashboard()` continua a usar `dashboardNumbers()`;
- saldo atual continua a ser `n.current`;
- por pagar continua a ser `n.pending`;
- em atraso continua a ser `n.overdue`;
- saldo projetado continua a ser `n.projected`;
- “Pago no mês” e “Próximos 7 dias” continuam a usar os valores existentes;
- vencimentos, orçamento, categorias e atividade mantêm as mesmas fontes de dados.

Alteração visual:

- `Saldo atual` passa a resumo dominante;
- KPIs reais ficam em segundo nível;
- métricas secundárias tornam-se compactas;
- desktop organiza vencimentos/orçamento e atividade/categorias;
- mobile usa sequência própria e não uma redução literal do desktop;
- reduced-motion e forced-colors permanecem cobertos.

A branch foi sincronizada com o `main` restaurado no commit `5a75e26d72f73b3d4c96802ae4193e0a28b50835`. CI e TypeScript Foundation desse head passaram integralmente antes desta atualização documental.

## 5. Arquitetura visual

Responsabilidades vigentes:

- `v76-modern-ui.css` (`76-modern-ui2`): tokens e componentes visuais;
- `v76-product-pages.css` (`76-product-pages1`): ordem, proporção e hierarquia interna das páginas migradas;
- `v76-mobile-shell.css` (`76-mobile-shell2`): viewport, safe areas, scroll global, topbar estrutural e dock móvel.

Os protótipos são referência de hierarquia/composição, não fonte automática de dados ou funcionalidades inexistentes.

## 6. Migração TypeScript

Meta: **fonte funcional 100% TypeScript strict**. O browser continuará a executar JavaScript compilado em `dist/`.

Estado atual:

- `src/types/`: contratos de domínio;
- `src/type-tests/`: provas de tipos;
- `src/ui/veggie-menu-toggle.ts`: primeiro controlo UI em TS;
- runtime principal ainda é JavaScript manual (`core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, sync, Mercado e outros módulos).

Regra reforçada pela auditoria:

- não apagar um `.js` fonte enquanto o equivalente `.ts` não estiver compilado, usado pelo build/Pages e coberto por regressões;
- a exclusão direta de `v75-architecture.js` demonstrou o risco: quebrou o CI e bloqueou a publicação;
- JavaScript pode existir temporariamente como fallback até a substituição TypeScript ficar provada;
- no estado final, JavaScript será apenas artefacto gerado, não fonte mantida manualmente.

## 7. Riscos/lacunas abertas

- `main` continua sem branch protection obrigatória;
- o build público ainda copia vários `.js` diretamente da raiz;
- `scripts/prepare-pages.cjs` e os workflows ainda pressupõem runtime JS manual;
- validação física em Safari/iPhone/PWA continua necessária depois do redesign;
- CSS histórico v74/v75 ainda contém sobreposição e `!important` a reduzir gradualmente;
- `market-experience.js` continua a necessitar teste dedicado para persistência de `pid` em todo o fluxo;
- protótipos não podem introduzir silenciosamente tarefas, simulações, comparações ou métricas inexistentes.

## 8. Próximo passo

1. Reconfirmar os gates após esta atualização documental do PR #86.
2. Integrar o PR #86 apenas com CI + TypeScript Foundation verdes e rever o diff final.
3. Confirmar o Deploy Pages do novo `main`; só então considerar o novo Dashboard publicado.
4. A partir do `main` mais recente, criar/atualizar uma branch exclusivamente para a migração TypeScript.
5. Fazer o pipeline compilar TS → `dist/` e migrar módulos por blocos, mantendo o JS atual apenas como fallback temporário.
6. Remover cada `.js` fonte somente quando não existir referência de runtime/build/testes e toda a regressão estiver verde.
