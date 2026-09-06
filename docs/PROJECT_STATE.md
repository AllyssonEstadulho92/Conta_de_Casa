# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público: v62
Revisão pública de interface: `62-ui2`
Distribuição: GitHub Pages
Branch pública: `main`
Estado do hotfix: publicado

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O cofre continua no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece na versão 5.

O hotfix para as duas regressões observadas em iPhone/Safari foi integrado em `main` através do PR #38 e publicado no GitHub Pages.

As regressões tratadas foram:

1. browser de produtos com grande área vazia à esquerda e nome, estado, ligação e preço comprimidos numa coluna estreita à direita;
2. sincronização a apresentar `Conflito` com `0 diferenças` quando a divergência era apenas em metadados auxiliares de imagem/código de barras do Mercado.

Não foi identificada alteração aos cálculos financeiros, ao cofre, à cifragem ou à origem dos preços.

## Correção publicada

### Browser do Mercado

`market-brand.css` fixa explicitamente as posições do conteúdo e do botão `+` no Grid dos resultados. O nó histórico de fotografia permanece oculto, mas deixa de poder influenciar o auto-placement.

A hierarquia do cartão é:

- nome do produto;
- embalagem/quantidade e loja;
- estado e ligação da loja;
- preço e preço unitário;
- ação `+` isolada e tátil.

Em larguras abaixo de 360 px, o preço reflui para uma linha própria para preservar palavras inteiras e impedir compressão letra a letra.

`market-branding.js` apresenta o aviso curto: “Mostramos produtos que correspondem pelo nome, embalagem, loja e preço. A fotografia é opcional.”

### Sincronização

`sync-conflict-policy.js` classifica apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` como metadados técnicos do Mercado para efeitos de equivalência de sincronização.

Esses campos deixam de abrir uma revisão manual quando todos os dados de negócio são iguais. O motor existente continua a preservar o registo compatível mais completo.

Continuam a ser diferenças reais: nome, categoria, quantidade, unidade, `estimatedCents`, `actualCents`, `purchased` e `purchasedAt`.

## Publicação confirmada

- PR #38 — `Fix: cartões do Mercado no iPhone e conflitos técnicos de sincronização` — integrado em `main`;
- merge em `main`: `f1557594aee99b69d10aca852a711b453502a698`;
- CI do PR #38: sucesso;
- CI de `main` após o merge: sucesso;
- Deploy Pages da revisão `f1557594aee99b69d10aca852a711b453502a698`: sucesso;
- build formal: v62;
- revisão de assets: `62-ui2`;
- cache público: `conta-de-casa-public-v62-market-ui2`.

A CI validou fontes do Mercado, sintaxe, finanças, isolamento do cofre, datas, faturas, Mercado, código de barras, contabilização, ícones, atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização, política de conflitos técnicos e manifest.

## Segurança e privacidade

A correção publicada:

- não altera PIN/palavra-passe;
- não altera PBKDF2, AES-GCM ou IndexedDB;
- não altera `estimatedCents` nem `actualCents`;
- não acrescenta endpoints, credenciais ou telemetria;
- não apaga metadados antigos de imagem;
- não escolhe valores financeiros automaticamente;
- apenas evita que metadados técnicos invisíveis sejam tratados como conflitos financeiros.

## Próximo passo

1. fechar e voltar a abrir a aplicação/PWA no iPhone para garantir ativação do novo Service Worker e dos assets `62-ui2`;
2. repetir a validação física do browser de produtos nas larguras 320, 375, 390 e 430 px;
3. confirmar em hardware real que não existe área vazia de fotografia nem compressão letra a letra;
4. em Segurança e sincronização, usar “Comparar novamente” ou fazer nova sincronização e confirmar que um conflito apenas técnico deixa de aparecer;
5. manter para alteração separada a eventual remoção definitiva do pipeline histórico de imagens.
