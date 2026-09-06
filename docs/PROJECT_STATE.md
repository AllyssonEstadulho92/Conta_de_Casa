# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público: v62
Revisão pública de interface: `62-ui2`
Revisão em validação: `62-ui3` — lista de compras por categoria
Distribuição: GitHub Pages
Branch pública: `main`
Branch de trabalho: `ui/market-category-groups`

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O cofre continua no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece na versão 5.

O hotfix anterior de iPhone/Safari permanece publicado e estável: corrigiu o browser de produtos com coluna vazia/compressão e o conflito técnico `0 diferenças`. Não existe evidência de regressão financeira associada a essa revisão.

## Alteração em validação — Lista de compras por categoria

A validação física da página **Lista de compras** mostrou que a sequência de cartões individuais, embora funcional, cria demasiada repetição visual e dificulta localizar rapidamente produtos semelhantes.

A revisão `62-ui3` reorganiza a lista sem alterar o modelo de dados:

- os itens passam a ser agrupados pela categoria já existente no próprio registo;
- cada grupo apresenta categoria, número de itens e controlo nativo expandir/recolher;
- os grupos usam uma ordem previsível baseada na taxonomia existente do Mercado;
- dentro de cada categoria é preservada a ordem já calculada pelos filtros/ordenação atuais;
- em mobile, os cartões passam a linhas mais compactas dentro do grupo;
- a categoria deixa de ser repetida em cada linha, ficando no cabeçalho do grupo;
- para itens pendentes, blocos financeiros redundantes visualmente iguais são ocultados na apresentação, mantendo o valor estimado visível;
- itens comprados continuam a expor preço real, diferença e ações existentes;
- editar, eliminar e marcar como comprado reutilizam os mesmos atributos/eventos já implementados.

No desktop, a tabela mantém a estrutura existente e recebe separadores por categoria.

## Implementação

Foram adicionadas duas camadas isoladas:

- `market-category-groups.js` — reorganiza o DOM renderizado pelo Mercado em grupos por categoria após cada `renderMarket`, sem gravar estado;
- `market-category-groups.css` — define a apresentação compacta dos grupos em mobile e os cabeçalhos de categoria da tabela em desktop.

A integração não modifica `render.js`, o schema, os cálculos ou os handlers existentes. O módulo identifica cada item através do `data-market-toggle` já presente nos cartões e consulta apenas a categoria/quantidade para apresentação.

## Distribuição e cache

O build formal permanece v62.

- branding anterior mantém `62-ui2`;
- os novos assets de agrupamento usam `62-ui3`;
- o Service Worker passa a usar `conta-de-casa-public-v62-market-ui2-category-ui3`, preservando o identificador da revisão anterior e forçando atualização do cache;
- `scripts/prepare-pages.cjs` inclui os dois novos assets no allowlist público.

## Segurança e dados

A revisão de categorias:

- não altera PIN/palavra-passe;
- não altera PBKDF2, AES-GCM, IndexedDB ou sincronização;
- não altera `estimatedCents`, `actualCents`, quantidade ou estado de compra;
- não cria nem altera categorias: usa apenas a categoria já guardada;
- não acrescenta endpoints, credenciais, cookies ou telemetria;
- não usa armazenamento adicional para o estado expandido/recolhido;
- não remove dados existentes.

## Testes preparados

- `tests/market-category-groups.test.cjs` valida sintaxe, agrupamento, responsividade, ausência de mutação financeira e composição do Pages;
- CI e Deploy Pages passam a validar `market-category-groups.js` e o novo teste;
- a revisão de assets confirma que branding/sincronização continuam em `62-ui2` e apenas o agrupamento usa `62-ui3`.

## Próximo passo

1. executar a CI completa da branch `ui/market-category-groups`;
2. rever o diff final;
3. integrar em `main` apenas com CI verde;
4. confirmar CI de `main` e Deploy GitHub Pages;
5. validar fisicamente no iPhone/Safari a lista com várias categorias, incluindo grupos com 1 item, vários itens, itens comprados e pendentes;
6. confirmar que filtros, pesquisa, editar, eliminar, checkbox e preço real continuam funcionais.
