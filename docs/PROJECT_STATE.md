# Estado do Projeto — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `5301bd0d66c5ec46ead7be079799ecb76c752237` — PR #88  
Trabalho atual: `feat/v76-typescript-market-branding1` — segunda substituição segura de JavaScript fonte por TypeScript  
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

## 2. Auditoria do site — resolvida

A ausência das mudanças visuais foi explicada por dois factos:

1. o redesign real do Dashboard estava no PR #86 e ainda não estava em `main`;
2. o commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` removeu `v75-architecture.js` antes de existir substituto, embora CI/build/testes ainda dependessem do ficheiro. O CI `34693676180` falhou e o Pages `34693693840` foi corretamente ignorado.

Recuperação e publicação:

- PR #87 restaurou o runtime necessário;
- PR #86 publicou o Dashboard — merge `42557d59f464a2fc7fc22a31eb24564e7dbabad9`;
- CI `34695579311`, TypeScript Foundation `34695579282` e Pages `34695600399`: sucesso.

## 3. Migração TypeScript publicada — PR #88

O primeiro JavaScript-fonte foi removido com substituição comprovada:

- fonte canónica: `src/ui/veggie-menu-toggle.ts`;
- `v76-veggie-menu.js` manual deixou de ser versionado;
- `scripts/build-typescript-runtime.cjs` gera `.generated/v76-veggie-menu.js`;
- `scripts/prepare-pages.cjs` publica o artefacto como `dist/v76-veggie-menu.js`;
- `.generated/` e `dist/` não são fonte e permanecem ignorados pelo Git.

Integração:

- PR #88 mergeado em `main`: `5301bd0d66c5ec46ead7be079799ecb76c752237`;
- TypeScript Foundation pós-merge `34699066645`: sucesso;
- CI pós-merge `34699066749`: sucesso integral;
- Deploy Pages `34699100855`: sucesso, incluindo geração TS, validação, bundle, upload e deploy.

Conclusão: o modelo `TypeScript fonte → JavaScript gerado → dist → browser` está comprovado em produção.

## 4. Trabalho atual — `feat/v76-typescript-market-branding1`

Segundo módulo escolhido: `market-branding.js`, por ser uma folha de apresentação de baixo risco que não lê nem altera cofre, finanças, preços ou estado persistido.

Alterações em curso:

- nova fonte `src/ui/market-branding.ts` com DOM tipado e `MutationObserver` tipado;
- removida a fonte manual `market-branding.js` da branch;
- build TypeScript generalizado para gerar dois runtimes em `.generated/`;
- `scripts/prepare-pages.cjs` mantém o nome público `market-branding.js`, mas copia o artefacto gerado;
- CI, TypeScript Foundation e Pages passam a validar o artefacto gerado;
- `tests/typescript-runtime-build.test.cjs` valida os dois módulos e prova igualdade entre artefacto gerado e bundle publicado.

Não foram alterados `core.js`, `finance.js`, IndexedDB, schema, cifragem, sync, QR/scanner, cálculos de Mercado, identidade de SKU ou preços.

## 5. UI/UX publicada

- `76-modern-ui2`: tokens/componentes e hierarquia de ações;
- `76-product-pages1`: composição real do Dashboard;
- `76-mobile-shell2`: geometria mobile, safe areas, scroll e dock.

O Dashboard continua a usar as fontes reais `n.current`, `n.pending`, `n.overdue`, `n.projected`, pagamentos, vencimentos, orçamento, categorias e atividade existentes.

## 6. JavaScript ainda existente

A aplicação ainda não é 100% TypeScript. Permanecem fontes JavaScript manuais como `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `mobile-menu-toggle.js`, sync, vários módulos de Mercado, assets, atualização, runtimes históricos e Service Worker.

Cada módulo segue:

`auditar dependências → criar TS strict → provar paridade → gerar artefacto → trocar build/runtime → regressão completa → remover JS fonte`.

Módulos complexos, especialmente `finance.js`, `core.js` e o controlador móvel com gestos, não serão convertidos antes dos módulos folha e funções puras estarem estabilizados.

## 7. Fallback

`backup/js-runtime-baseline-20260912` guarda a baseline JavaScript publicada anterior à migração. É apenas referência de rollback e não é carregada em paralelo.

## 8. Riscos/lacunas abertas

- `main` ainda não tem branch protection obrigatória;
- vários módulos JS ainda são copiados diretamente pelo build;
- `market-experience.js` ainda precisa de teste dedicado para persistência de `pid` em todo o fluxo;
- validação física Safari/iPhone/PWA continua necessária após mudanças visuais;
- CSS histórico v74/v75 mantém sobreposições a reduzir gradualmente;
- JavaScript gerado em `dist/` não deve ser confundido com JavaScript fonte manual.

## 9. Próximo passo

1. Concluir gates da branch `feat/v76-typescript-market-branding1`.
2. Rever o diff e integrar apenas com CI + TypeScript Foundation verdes.
3. Confirmar CI + Pages pós-merge.
4. Continuar por módulos folha de baixo risco e funções puras.
5. Migrar finanças, persistência/cifra e sync apenas com vetores de paridade e regressão dedicada.
