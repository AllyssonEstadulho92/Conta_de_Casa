# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v51
Distribuição: GitHub Pages

## Estado atual

A aplicação continua local-first, com cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5.

A área **Lista de compras / Mercado** recebeu a implementação visual do protótipo aprovado: hierarquia, margens, cartões de resumo, filtros, botão de adicionar, estado vazio e um novo ecrã responsivo **Adicionar produto** com pesquisa, seleção de Pingo Doce/Continente/Mercadona, tabs, comparação visual e cartões de produto.

A nova experiência está isolada em `market-experience.css` e `market-experience.js`, sem substituir o formulário antigo de edição dos itens já guardados.

## Preços dos mercados — estado confirmado

Os valores apresentados no comparador desta revisão são **dados de demonstração do protótipo**, identificados como tal na própria interface. Não são apresentados como preços em tempo real e não são gravados nos dados financeiros da aplicação.

Não foi ativada uma integração automática de preços porque o projeto continua sem backend próprio e não existe, nesta revisão, uma fonte técnica verificada e estável para os três mercados que possa ser consumida diretamente pelo browser sem introduzir uma dependência insegura ou não confirmada. A CSP atual também não foi alargada para origens de terceiros.

Ao adicionar um produto a partir do comparador, o produto é criado através do modelo existente com `estimatedCents: 0`; os preços de demonstração ficam apenas na vista do protótipo.

## Alteração anterior preservada

Mantém-se a correção do defeito de layout reproduzido em iPhone/Safari: o shell mobile usa `100dvh`/`100svh`, mantendo `VisualViewport` apenas para métricas transitórias de teclado e diálogos. A lista de compras continua a ser gerada integralmente; o modelo de dados não foi alterado.

## Última alteração

- criado `market-experience.css`, carregado depois das restantes camadas visuais;
- criado `market-experience.js`, carregado depois de `events.js`;
- o botão **Adicionar item** e a ação rápida **Mercado** abrem o novo comparador visual;
- a edição de itens existentes continua a utilizar `openMarketForm()` sem alterações;
- nova composição responsiva específica para 320/359, 430, 820, 1180 px e desktop;
- safe areas superior e inferior contempladas no ecrã de pesquisa;
- alvos tácteis do novo fluxo mantidos em 44–52 px;
- texto da nova camada visual mantido em 12 px ou superior;
- build público atualizado para v51;
- Service Worker e allowlist do GitHub Pages incluem os dois novos assets;
- criado `tests/market-experience.test.cjs` e acrescentado ao CI.

## Impacto funcional

Nenhuma alteração foi feita a cálculos financeiros, PIN/palavra-passe, PBKDF2, AES-GCM, IndexedDB, backups, sincronização, estrutura persistida dos registos, rotas ou regras de negócio existentes.

A única nova ação funcional é a criação de um item da lista a partir do comparador; utiliza os mesmos campos persistentes já suportados pelo projeto e não grava os preços fictícios do protótipo.

## Próximo passo

1. Confirmar CI e publicação do GitHub Pages da build v51.
2. Validar fisicamente no iPhone/Safari o ecrã **Adicionar produto**, incluindo 320/375/390/430 px, scroll, teclado, safe areas e navegação de retorno.
3. Validar tablet e desktop em browser real, procurando scroll horizontal, cortes e sobreposições.
4. Definir uma arquitetura de preços reais apenas depois de identificar fontes verificadas para cada mercado e uma camada de backend/proxy adequada a CORS, disponibilidade, termos de utilização, cache e auditoria de origem/data do preço.
5. Consolidar progressivamente regras mobile duplicadas de `styles.css` e `design-system.css`, sem alterar comportamento.
