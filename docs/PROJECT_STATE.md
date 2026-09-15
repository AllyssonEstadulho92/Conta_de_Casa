# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline publicada: `69318d104cd8aa1a68be919ba6a9c805b20f9cf5` — PR #134  
Branch funcional: `main`

## Invariantes obrigatórias

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro cifrado em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` é a identidade canónica de produto quando existe origem live verificável;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- UI/UX e migração de linguagem não alteram silenciosamente domínio, persistência ou segurança.

## Estado publicado

A `main` está oficialmente em v76/`0.76.0`.

Consolidações relevantes:

- PR #105–#116: retirada progressiva do runtime v74, autoridade única de navegação/composição e oficialização da v76;
- PR #117–#130: menu móvel, shell/safe areas, Planeamento/Mais, Dashboard, Mercado, drawer e pesquisa alinhados ao produto v76;
- PR #131: fluxo profissional de Adicionar despesa;
- PR #132: hotfix Safari/iPhone para touch/scroll do formulário de despesas;
- PR #133: persistência retrocompatível de `marketId|pid` no Mercado;
- PR #134: expiração segura da identidade temporária se um clique live não chegar ao commit.

Evidência mais recente:

- merge PR #134: `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`;
- TypeScript Foundation main `34914028412`: sucesso;
- CI main `34914028440`: sucesso integral;
- Pages `34914061390`: sucesso.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados. Apenas a chave técnica de cache PWA foi renovada para distribuir o hotfix.

## Mercado — estado de identidade

`76-market-identity1` + `76-market-identity-stale1` estão publicados:

- a pesquisa Cesta preserva `marketId` e `pid` ao adicionar um produto;
- normalização/reload/restauro/sync retêm a identidade;
- itens manuais/legados continuam compatíveis com campos vazios;
- a identidade temporária usada entre clique e commit expira no microtask seguinte quando não é consumida;
- preço, quantidade, `estimatedCents`, `actualCents`, scanner e persistência financeira permanecem inalterados.

## Auditoria atual — problemas abertos

### ALTO

- acrescentar E2E real com WebKit/Chromium para toque, teclado, scroll e transição PIN → aplicação;
- reduzir gradualmente a cascade CSS e dependência de `!important`;
- `main` continua sem branch protection/required checks obrigatórios.

### MÉDIO

- ZXing do scanner continua dependente de `unpkg.com`; a página Segurança não deve afirmar literalmente “Sem CDNs” enquanto isso existir;
- migrar ZXing para bundle local, preservando licença, antes de restringir `script-src` para `'self'`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- continuar migração TypeScript por risco, sem começar por `finance.js`/cifra.

## Higiene de repositório

- PR #45/v65 encerrado como obsoleto em 15/09/2026; não deve ser reaberto ou integrado na v76.

## Próximo passo

1. corrigir a descrição da página Segurança para refletir a dependência ZXing real, sem mudança de release;
2. preparar ZXing local e endurecimento CSP num bloco isolado;
3. criar primeiro fluxo E2E WebKit/Chromium;
4. consolidar CSS por propriedade, sem apagar regras sem prova de não utilização;
5. continuar TypeScript em módulos de baixo acoplamento.
