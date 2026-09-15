# Estado do Projeto — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão técnica: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA  
Baseline publicada: `6cc4707197a50c022179d0af66895079ef1583bc` — PR #136  
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
- PR #134: expiração segura da identidade temporária se um clique live não chegar ao commit;
- PR #136: `76-drawer-hierarchy1`, substituição do drawer móvel denso por uma hierarquia vertical legível.

Evidência mais recente:

- merge PR #136: `6cc4707197a50c022179d0af66895079ef1583bc`;
- TypeScript Foundation main `34933261324`: sucesso;
- CI main `34933261352`: sucesso integral;
- Pages `34933296570`: sucesso.

A release pública, `package.json`, `release-manifest.json` e Centro de atualizações não foram alterados pelo PR #136.

## Navegação móvel — estado atual

`76-drawer-hierarchy1` está publicado:

- drawer continua a abrir pela direita para preservar o controlador/gesto móvel existente;
- largura útil foi aumentada para evitar labels comprimidos;
- navegação passou de cartões em duas colunas para uma lista vertical de uma coluna;
- Principal: Início, Despesas, Planeamento e Mercado;
- Análise: Relatórios;
- Sistema: Segurança e sincronização, Definições;
- Calendário permanece dentro de Despesas, Metas dentro de Planeamento e Diagnóstico dentro de Definições, evitando duplicação de rotas secundárias;
- Segurança tem seleção própria no menu completo, mas continua agrupada em Mais no dock compacto;
- botão de fecho é uma única superfície circular de 44 px;
- Ocultar valores e Bloquear são ações verticais de largura completa;
- foco, reduced-motion, forced-colors e safe areas foram preservados.

Validação física no mesmo iPhone/Safari/PWA ainda está pendente; CI verde não substitui observação real do layout.

## Mercado — estado de identidade

`76-market-identity1` + `76-market-identity-stale1` estão publicados:

- a pesquisa Cesta preserva `marketId` e `pid` ao adicionar um produto;
- normalização/reload/restauro/sync retêm a identidade;
- itens manuais/legados continuam compatíveis com campos vazios;
- a identidade temporária usada entre clique e commit expira no microtask seguinte quando não é consumida;
- preço, quantidade, `estimatedCents`, `actualCents`, scanner e persistência financeira permanecem inalterados.

## Auditoria atual — problemas abertos

### ALTO

- validar fisicamente o novo drawer no mesmo iPhone/Safari e PWA instalada;
- acrescentar E2E real com WebKit/Chromium para toque, teclado, scroll e transição PIN → aplicação;
- reduzir gradualmente a cascade CSS e dependência de `!important`;
- `main` continua sem branch protection/required checks obrigatórios.

### MÉDIO

- rever geometria global dos ícones em `ui-icons.js`: Planeamento e Definições ainda merecem uma passagem isolada para alinhar calendário/planeamento e engrenagem com a hierarquia aprovada;
- ZXing do scanner continua dependente de `unpkg.com`; a página Segurança não deve afirmar literalmente “Sem CDNs” enquanto isso existir;
- migrar ZXing para bundle local, preservando licença, antes de restringir `script-src` para `'self'`;
- reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir;
- continuar migração TypeScript por risco, sem começar por `finance.js`/cifra.

## Higiene de repositório

- PR #45/v65 encerrado como obsoleto em 15/09/2026; não deve ser reaberto ou integrado na v76.

## Próximo passo

1. validar visualmente `76-drawer-hierarchy1` no iPhone/PWA com nova captura;
2. rever `ui-icons.js`/`ui-icons.css` num bloco isolado para Planeamento, Definições e consistência do subset Lucide;
3. corrigir a descrição da página Segurança para refletir a dependência ZXing real, sem mudança de release;
4. preparar ZXing local e endurecimento CSP num bloco isolado;
5. criar primeiro fluxo E2E WebKit/Chromium;
6. consolidar CSS por propriedade, sem apagar regras sem prova de não utilização;
7. continuar TypeScript em módulos de baixo acoplamento.
