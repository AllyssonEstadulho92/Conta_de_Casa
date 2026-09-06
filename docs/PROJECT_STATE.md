# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público base: v62
Distribuição: GitHub Pages
Branch pública: `main`
Revisão em validação: `fix/mobile-market-sync-hotfix`

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O cofre continua no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece na versão 5.

A validação física em iPhone/Safari revelou duas regressões reais depois da revisão text-first do Mercado:

1. no browser de produtos, os cartões podiam manter uma grande área vazia à esquerda e comprimir nome, estado, ligação e preço numa coluna estreita à direita;
2. a sincronização podia apresentar `Conflito` com `0 diferenças` quando a divergência era apenas em metadados auxiliares de imagem/código de barras do Mercado.

Não existe evidência de erro nos cálculos financeiros, no cofre, na cifragem ou nos preços por causa destas duas regressões.

## Correção preparada

### Browser do Mercado

`market-brand.css` passa a definir explicitamente as posições do conteúdo e do botão `+` no Grid dos resultados. O nó histórico de fotografia continua oculto, mas deixa de poder influenciar o auto-placement.

A hierarquia do cartão passa a ser:

- nome do produto;
- embalagem/quantidade e loja;
- estado e ligação da loja;
- preço e preço unitário;
- ação `+` isolada e tátil.

Em larguras abaixo de 360 px, o preço reflui para uma linha própria para preservar palavras inteiras e impedir compressão letra a letra.

`market-branding.js` reduz o aviso para: “Mostramos produtos que correspondem pelo nome, embalagem, loja e preço. A fotografia é opcional.”

### Sincronização

Foi criado `sync-conflict-policy.js`. A política classifica apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` como metadados técnicos do Mercado para efeitos de equivalência de sincronização.

Esses campos deixam de abrir uma revisão manual quando todos os dados de negócio são iguais. O motor existente continua a preservar o registo compatível mais completo.

Continuam a ser diferenças reais: nome, categoria, quantidade, unidade, `estimatedCents`, `actualCents`, `purchased` e `purchasedAt`.

## Distribuição e cache

O build formal permanece v62. Para garantir que o Safari não reutiliza os assets anteriores:

- `market-brand.css` e `market-branding.js` usam revisão pública `62-ui2`;
- `sync-conflict-policy.js` usa a mesma revisão;
- o Service Worker passa para o cache `conta-de-casa-public-v62-market-ui2`.

## Segurança e privacidade

A correção:

- não altera PIN/palavra-passe;
- não altera PBKDF2, AES-GCM ou IndexedDB;
- não altera `estimatedCents` nem `actualCents`;
- não acrescenta endpoints, credenciais ou telemetria;
- não apaga metadados antigos de imagem;
- não escolhe valores financeiros automaticamente;
- apenas evita que metadados técnicos invisíveis sejam tratados como conflitos financeiros.

## Testes acrescentados/alterados

- `tests/market-experience.test.cjs` valida posições explícitas no Grid, nova cópia e revisão de cache;
- `tests/sync-conflict-policy.test.cjs` confirma que diferenças apenas em imagem/código de barras são automáticas e diferenças reais de preço continuam a exigir revisão;
- `tests/app-update.test.cjs` valida a composição pública `62-ui2`;
- CI e Deploy Pages passam a verificar `sync-conflict-policy.js` e o novo teste.

## Próximo passo

1. executar a CI completa da branch;
2. rever o diff do PR;
3. integrar em `main` apenas com CI verde;
4. confirmar Deploy Pages;
5. repetir a validação física no iPhone/Safari, sobretudo o browser de produtos nas larguras 320, 375, 390 e 430 px;
6. confirmar que um conflito técnico antigo desaparece após “Comparar novamente” ou nova sincronização;
7. manter para alteração separada a eventual remoção definitiva do pipeline histórico de imagens.
