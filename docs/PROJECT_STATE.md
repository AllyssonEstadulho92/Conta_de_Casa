# Estado do Projeto — Conta de Casa

Atualizado: 9 de setembro de 2026
Build: `v75`
Branch de correção: `fix/v75-safari-market-crash`
Distribuição pública atual antes da integração: GitHub Pages / PWA

## Revisões vigentes

- UI base: `74-ui1`
- Mercado: `74-shopping2`
- menu funcional: `73-menu8`
- experiência: `74-experience2`
- arquitetura: `75-architecture2`
- cabeçalho: `75-header2`
- estabilidade: `75-stability1`
- geometria: `75-layout1`
- drawer: `75-drawer2`
- destaques Mercado: `75-featured1`
- biblioteca geral de imagens: `75-image-library1`
- catálogo visual base: `75-catalog1`
- resolvedor oficial/distribuição catálogo: `75-catalog2`
- biblioteca Pingo Doce: `75-pd-photo1`
- carregador visual proposto: `75-photo-loader3`

## Invariantes preservados

A aplicação continua PWA estática/local-first. O estado financeiro permanece em IndexedDB, valores monetários continuam em cêntimos, `STATE_VERSION = 5`, o cofre usa PBKDF2-SHA-256 + AES-GCM e a sincronização GitHub opcional continua limitada ao envelope cifrado.

A correção atual não altera `core.js`, `finance.js`, pagamentos, faturas, QR, scanner, PIN, cifragem, `estimatedCents`, `actualCents` ou sincronização.

## Problema físico confirmado

Depois da publicação de `75-photo-loader2`, a validação real no iPhone/Safari mostrou a página `/#market` a terminar com a mensagem do Safari **“Um problema ocorreu repetidamente”**. Isto é evidência de falha do processo da página no dispositivo; não é apenas um estado visual de carregamento.

Antes desse crash, a mesma validação já tinha mostrado `285 SKUs indexados · 0 fotografias oficiais` no Pingo Doce e cartões demorados em **A carregar fotografia…**.

## Factos encontrados no código de `75-photo-loader2`

- `refreshVisibleCards()` hidratava os primeiros 18 cartões do DOM, embora o nome indicasse “visíveis”;
- as imagens hidratadas eram marcadas `loading='eager'`;
- `warmVisibleCards()` podia priorizar até 6 cartões;
- o polling era de 500 ms por até 24 ciclos;
- a entrada no Mercado chamava adicionalmente `warmPending()` e `syncNow()` da biblioteca Pingo Doce;
- o `MutationObserver` observava toda a `document.body`;
- uma imagem remota quebrada podia voltar a ser consultada durante a janela de eliminação da IndexedDB.

Não foi obtido um perfil de memória do WebKit, portanto não é possível afirmar qual destes pontos isoladamente causou o crash. A causa provável é pressão excessiva combinada de DOM, imagens, polling, observers e resolução concorrente no iPhone.

## Correção `75-photo-loader3`

A estratégia passa de “processar muitos cartões rapidamente” para “processar apenas o que o utilizador realmente vê”:

- deteção real por `getBoundingClientRect()` com margem de 160 px;
- máximo de 2 cartões no viewport móvel e 4 no desktop;
- hidratação deixa de percorrer os primeiros 18 cartões;
- aquecimento dos cartões é sequencial dentro do pequeno conjunto prioritário;
- polling reduzido para 1200 ms, no máximo 10 ciclos;
- a entrada no Mercado deixa de disparar `warmPending()` e `syncNow()` em paralelo; a biblioteca Pingo Doce mantém o seu próprio scheduler limitado;
- `MutationObserver` passa a observar apenas `#page-market` e alterações relevantes do catálogo;
- scans são coalescidos por `requestAnimationFrame`;
- URL que falhe no `<img>` entra em quarentena local de 30 s, é removida da biblioteca e não é recriada imediatamente;
- o estado visual passa a **Fotografia temporariamente indisponível** durante a quarentena;
- `photoRuntimeRevision` passa a `75-photo-loader3` e o orçamento Pingo Doce é libertado uma única vez para esta revisão.

## Cache esperado após publicação

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog2-pd-photo1-photo-loader3`

## QA atual

A branch `fix/v75-safari-market-crash` passou o CI completo no SHA `f0540603b815d414e954db2103b0a4170032898d`. Passaram probe das fontes do Mercado, sintaxe, finanças, auditoria, QR, catálogo visual, biblioteca Pingo Doce, `market-photo-loader`, segurança, responsividade, navegação, acessibilidade e sincronização.

A validação física ainda é obrigatória porque o erro é específico do Safari/iPhone e não é reproduzido por testes Node.

## Próximo passo

1. fechar documentação da correção;
2. comparar a branch com `main` e integrar apenas por fast-forward sem force;
3. confirmar CI de `main` no SHA integrado;
4. confirmar GitHub Pages no mesmo SHA;
5. reabrir a aplicação no mesmo iPhone e verificar primeiro estabilidade de `/#market` e só depois a evolução das fotografias.
