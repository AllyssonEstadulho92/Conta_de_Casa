# Estado do Projeto — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `42557d59f464a2fc7fc22a31eb24564e7dbabad9` — PR #86  
Trabalho atual: `feat/v76-typescript-runtime2` — primeira substituição segura de JavaScript fonte por TypeScript  
Fallback técnico: `backup/js-runtime-baseline-20260912`  
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

## 2. Auditoria do site — causa e correção confirmadas

A falta da mudança visual no site teve duas causas verificadas:

1. o redesign real do Dashboard estava no PR #86 e ainda não se encontrava em `main`;
2. o commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` removeu `v75-architecture.js` de `main` antes de existir substituto, embora CI/build/testes ainda dependessem do ficheiro. O CI `34693676180` falhou com `MODULE_NOT_FOUND` e o Pages `34693693840` foi corretamente ignorado.

Recuperação:

- PR #87 restaurou exatamente o runtime necessário;
- merge de recuperação: `6401f1c5156382e9fe364da31afa3fcec4aed9bc`;
- CI e Pages voltaram a verde;
- PR #86 foi depois sincronizado, revisto e integrado em `main`;
- merge do Dashboard: `42557d59f464a2fc7fc22a31eb24564e7dbabad9`;
- CI pós-merge `34695579311`: sucesso;
- TypeScript Foundation `34695579282`: sucesso;
- Deploy Pages `34695600399`: sucesso.

Conclusão: o primeiro redesign real do Dashboard está agora no bundle publicado do GitHub Pages.

## 3. Repositórios

- `AllyssonEstadulho92/Conta_de_Casa`: aplicação pública, CI, código e GitHub Pages;
- `AllyssonEstadulho92/conta-de-casa-`: repositório privado de sincronização/armazenamento, não é o código do site.

## 4. UI/UX publicada

A composição pública contém:

- `76-modern-ui2`: tokens/componentes e hierarquia de ações;
- `76-product-pages1`: composição real do Dashboard;
- `76-mobile-shell2`: geometria mobile, safe areas, scroll e dock.

O Dashboard publicado usa apenas dados reais do domínio: `n.current`, `n.pending`, `n.overdue`, `n.projected`, pagamentos, vencimentos, orçamento, categorias e atividade existentes.

## 5. Migração TypeScript — estado atual

Meta: **fonte funcional 100% TypeScript strict**, mantendo JavaScript apenas como artefacto de build para o browser.

Primeiro módulo em migração no branch `feat/v76-typescript-runtime2`:

- fonte canónica: `src/ui/veggie-menu-toggle.ts`;
- fonte manual `v76-veggie-menu.js`: removida da branch;
- build: `scripts/build-typescript-runtime.cjs` gera `.generated/v76-veggie-menu.js`;
- `.generated/` e `dist/` são ignorados no Git;
- `scripts/prepare-pages.cjs` gera automaticamente o runtime TS e copia o artefacto público para `dist/v76-veggie-menu.js`;
- CI instala TypeScript, gera o runtime e executa toda a regressão;
- o browser continua a receber `v76-veggie-menu.js`, mas esse ficheiro é compilado e não fonte manual.

Gates do head funcional antes desta atualização documental:

- TypeScript Foundation `34695947847`: sucesso;
- CI integral `34695947843`: sucesso, incluindo build TS e todos os testes financeiros, Mercado, UI, PWA, segurança, responsive e sync.

## 6. Fallback

Foi criada a branch `backup/js-runtime-baseline-20260912` no commit publicado `42557d59f464a2fc7fc22a31eb24564e7dbabad9`.

Se uma substituição TypeScript causar regressão, esta branch fornece a base JavaScript validada. O fallback não será carregado em paralelo no runtime normal; é referência de rollback.

## 7. JavaScript ainda existente

A aplicação **ainda não é 100% TypeScript**. Permanecem módulos JavaScript manuais como `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, sync, Mercado, captura, assets, atualização, runtimes v64/v74/v75 e Service Worker.

Não serão apagados em massa. Cada módulo segue a sequência:

`auditar dependências → criar TS strict → provar paridade → compilar → trocar build/runtime → regressão completa → remover JS fonte`.

## 8. Riscos/lacunas abertas

- `main` ainda não tem branch protection obrigatória;
- vários módulos JS continuam diretamente copiados pelo build público;
- `market-experience.js` continua a necessitar teste dedicado para persistência de `pid` em todo o fluxo;
- validação física Safari/iPhone/PWA continua necessária após mudanças visuais;
- CSS histórico v74/v75 ainda tem sobreposições a reduzir gradualmente;
- não confundir JavaScript gerado em `dist/` com JavaScript fonte manual.

## 9. Próximo passo

1. Reconfirmar CI + TypeScript Foundation após a atualização documental desta branch.
2. Rever o diff e abrir PR para a primeira remoção segura de JavaScript fonte.
3. Integrar apenas com gates verdes; validar CI e Pages do novo `main`.
4. Migrar o próximo módulo de baixo risco antes de tocar em `finance.js`/`core.js`.
5. Continuar até que todo o runtime mantido manualmente esteja em TypeScript e o JavaScript exista apenas nos artefactos gerados.
