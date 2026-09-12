# Estado do Projeto — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline publicada: `c59e0a45500fd7965039de27615f574129482b13` — PR #89  
Trabalho atual: bloco 2 TypeScript concluído/publicado; próximo bloco depende de auditoria real de dependências  
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

A ausência das mudanças visuais teve duas causas confirmadas: o redesign estava inicialmente fora de `main`, e uma remoção prematura de `v75-architecture.js` quebrou o CI e impediu o Pages de publicar. PR #87 recuperou o runtime e PR #86 publicou o Dashboard. CI `34695579311`, TypeScript Foundation `34695579282` e Pages `34695600399` ficaram verdes.

## 3. Migração TypeScript — bloco 1 publicado

PR #88, merge `5301bd0d66c5ec46ead7be079799ecb76c752237`:

- `src/ui/veggie-menu-toggle.ts` é a fonte canónica;
- `v76-veggie-menu.js` manual deixou de ser versionado;
- build gera `.generated/v76-veggie-menu.js`;
- Pages publica `dist/v76-veggie-menu.js`;
- TypeScript `34699066645`, CI `34699066749` e Pages `34699100855`: sucesso.

O modelo `TypeScript fonte → JavaScript gerado → dist → browser` está comprovado em produção.

## 4. Migração TypeScript — bloco 2 publicado

PR #89, merge `c59e0a45500fd7965039de27615f574129482b13`:

- `src/ui/market-branding.ts` passa a ser a fonte canónica;
- fonte manual `market-branding.js` removida;
- `scripts/build-typescript-runtime.cjs` suporta múltiplos runtimes TS;
- `scripts/prepare-pages.cjs` mantém o nome público `market-branding.js`, mas publica o artefacto gerado;
- cache PWA recebe revisão `ts-runtime2-market-branding1` sem alterar a lógica funcional do Service Worker;
- teste de build prova fonte TS → `.generated` → `dist`.

Gates pós-merge em `main`:

- TypeScript Foundation `34700016617`: sucesso;
- CI integral `34700016615`: sucesso;
- Deploy Pages `34700037019`: sucesso.

Uma deriva acidental do Service Worker durante o desenvolvimento foi detetada pelo gate Safari/PWA e revertida antes do merge; o diff final de `sw.js` alterou apenas a chave de cache.

Não foram alterados `core.js`, `finance.js`, IndexedDB, schema, cifragem, sync, QR/scanner, cálculos de Mercado, identidade de SKU ou preços.

## 5. UI/UX publicada

- `76-modern-ui2`: tokens/componentes e hierarquia de ações;
- `76-product-pages1`: composição real do Dashboard;
- `76-mobile-shell2`: geometria mobile, safe areas, scroll e dock.

O Dashboard continua a usar os dados reais já existentes e não introduz fórmulas financeiras novas.

## 6. JavaScript ainda existente

A aplicação ainda não é 100% TypeScript. Permanecem fontes JS manuais como `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `mobile-menu-toggle.js`, sync, vários módulos de Mercado, assets, atualização, runtimes históricos e Service Worker.

Sequência obrigatória por módulo:

`auditar dependências → criar TS strict → provar paridade → gerar artefacto → trocar build/runtime → regressão completa → remover JS fonte`.

Controladores complexos, finanças, persistência/cifra e sync só avançam quando existirem testes de paridade adequados.

## 7. Fallback

`backup/js-runtime-baseline-20260912` guarda a baseline JavaScript publicada anterior à migração. É referência de rollback; não é carregada em paralelo.

## 8. Riscos/lacunas abertas

- `main` ainda não tem branch protection obrigatória;
- vários módulos JS ainda são copiados diretamente pelo build;
- `market-experience.js` ainda necessita teste dedicado para persistência de `pid` em todo o fluxo;
- validação física Safari/iPhone/PWA continua necessária após mudanças visuais;
- CSS histórico v74/v75 mantém sobreposições a reduzir gradualmente;
- JavaScript gerado em `dist/` não deve ser confundido com fonte JavaScript manual.

## 9. Próximo passo

1. Auditar os módulos JS restantes e escolher o próximo bloco de menor acoplamento real.
2. Migrar apenas depois de mapear referências em HTML, SW, build, testes e módulos consumidores.
3. Repetir TypeScript strict + CI integral + Pages antes e depois de cada merge.
4. Preparar vetores de paridade antes de entrar em funções monetárias, `finance.js`, `core.js`, sync ou controladores complexos.
