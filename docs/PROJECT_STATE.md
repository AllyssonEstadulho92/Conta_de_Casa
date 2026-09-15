# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline publicada: `62359b4997075c4bd476f43f69ab18e41327f1bd` — PR #133  
Branch ativa: `fix/v76-market-identity-stale-guard1`

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

Consolidações relevantes já publicadas:

- PR #105–#116: retirada progressiva do runtime v74, autoridade única de navegação/composição e oficialização da v76;
- PR #117–#130: menu móvel, shell/safe areas, Planeamento/Mais, Dashboard, Mercado, drawer e pesquisa alinhados ao produto v76;
- PR #131: fluxo profissional de Adicionar despesa;
- PR #132: hotfix Safari/iPhone para touch/scroll do formulário de despesas;
- PR #133: persistência retrocompatível de `marketId|pid` no Mercado.

Evidência PR #133:

- merge `62359b4997075c4bd476f43f69ab18e41327f1bd`;
- TypeScript Foundation PR `34913445635`: sucesso;
- CI PR `34913445733`: sucesso integral;
- TypeScript Foundation main `34913506775`: sucesso;
- CI main `34913506766`: sucesso integral;
- Pages `34913539151`: sucesso.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados para este hotfix. Só a chave técnica de cache PWA mudou.

## Bloco atual — `76-market-identity-stale1`

Revisão pós-publicação do PR #133 identificou um edge case raro: se o utilizador tocar em “Adicionar” num resultado live mas o handler não chegar ao commit, a identidade pendente podia permanecer em memória e teoricamente ser aplicada a uma criação manual posterior.

Hardening em curso:

- a identidade pendente expira no microtask seguinte se não for consumida pelo commit live;
- a aplicação normal do resultado mantém o comportamento: a identidade é copiada para o item antes do primeiro `await` do commit;
- preço, quantidade, `estimatedCents`, `actualCents`, scanner e persistência financeira não são alterados;
- regressão específica e novo token técnico de cache `market-identity-stale1` foram adicionados.

## Auditoria atual — problemas abertos

### ALTO

- fechar o guard de identidade pendente com CI/TypeScript/Pages verdes;
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

1. publicar `76-market-identity-stale1` se todos os gates permanecerem verdes;
2. validar pesquisa → adicionar → reload → edição → sync sem perder `marketId|pid`;
3. criar primeiro fluxo E2E WebKit/Chromium;
4. corrigir a descrição da página Segurança e preparar ZXing local;
5. consolidar CSS por propriedade, sem apagar regras sem prova de não utilização;
6. continuar TypeScript em módulos de baixo acoplamento.
