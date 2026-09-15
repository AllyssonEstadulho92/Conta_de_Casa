# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline `main` antes deste bloco: `863942d018887b35d3277cd2b36062f1509ad29a` — PR #132  
Branch ativa: `fix/v76-market-canonical-identity1`

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

## Estado real publicado antes deste bloco

A `main` está na release v76 e já ultrapassou a antiga baseline do PR #100.

Principais consolidações publicadas:

- PR #105–#116: retirada progressiva da dependência/runtime v74, uma única autoridade de composição/navegação e oficialização da v76;
- PR #117–#130: menu móvel, shell/safe areas, Planeamento/Mais, Dashboard, Mercado, drawer e pesquisa alinhados ao produto v76;
- PR #131: fluxo profissional de Adicionar despesa;
- PR #132: hotfix Safari/iPhone para touch/scroll do formulário de despesas.

Para o commit `863942d...`, TypeScript, CI `quality` e Deploy Pages terminaram com sucesso.

## Bloco atual — `76-market-identity1`

Problema confirmado na auditoria:

- o catálogo e a pesquisa live conhecem `marketId` e `pid`, mas o item adicionado à lista não preservava essa identidade de forma persistente;
- o tipo `MarketItem` também não declarava esses campos, apesar de `MarketCatalogIdentity` já existir no modelo TypeScript.

Correção em implementação nesta branch:

- `v75-market-flow.js` captura a identidade `cesta-<marketId>-<pid>` da ação de adicionar produto;
- antes do commit do novo item, preserva `marketId` e `pid` sem tocar em preço/quantidade;
- a normalização do item é envolvida para manter os dois campos depois de reload/restore/sync;
- `MarketItem` passa a tipar `marketId` e `pid` de forma retrocompatível (`''` para itens manuais/legados);
- diferenças de `marketId/pid` não são tratadas como metadados descartáveis pelo sync;
- Service Worker recebe apenas invalidação técnica `market-identity1`; não há alteração de versão/release nem do Centro de atualizações.

## Auditoria atual — problemas abertos

### ALTO

- executar CI/TypeScript/Pages do bloco `76-market-identity1` antes de integrar;
- acrescentar E2E real com WebKit/Chromium para toque, teclado, scroll e transição PIN → aplicação;
- reduzir gradualmente a cascade CSS e dependência de `!important`;
- `main` continua sem branch protection/required checks obrigatórios.

### MÉDIO

- ZXing do scanner continua dependente de `unpkg.com`; a página Segurança não deve afirmar literalmente “Sem CDNs” enquanto isso existir;
- migrar ZXing para bundle local, preservando licença, antes de restringir `script-src` para `'self'`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- continuar migração TypeScript por risco, sem começar por `finance.js`/cifra.

## Limpeza de repositório

- PR #45 (v65) foi encerrado como obsoleto em 15/09/2026; não deve ser reaberto ou integrado na v76.

## Próximo passo

1. fechar `76-market-identity1` com CI + TypeScript + Pages verdes;
2. validar pesquisa → adicionar → reload → edição → sync sem perder `marketId|pid`;
3. criar primeiro fluxo E2E WebKit/Chromium;
4. corrigir a descrição da página Segurança e preparar ZXing local;
5. consolidar CSS por propriedade, sem apagar regras sem prova de não utilização;
6. continuar TypeScript em módulos de baixo acoplamento.
