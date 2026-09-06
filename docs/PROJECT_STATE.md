# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público: v62
Revisão pública de interface: `62-ui3` — lista de compras por categoria
Distribuição: GitHub Pages
Branch pública: `main`
Estado: publicado

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O cofre continua no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece na versão 5.

A organização da página **Lista de compras** por categoria foi integrada em `main` através do PR #40 e publicada no GitHub Pages. O hotfix anterior do browser de produtos e da política de conflitos técnicos permanece ativo.

## Lista de compras por categoria

A lista passa a usar a categoria já existente em cada item como estrutura visual:

- cada categoria forma um grupo independente;
- o cabeçalho apresenta categoria e número de itens;
- em mobile, os grupos ficam expandidos por defeito e podem ser recolhidos;
- a categoria deixa de ser repetida em cada produto;
- os itens tornam-se linhas mais compactas dentro do respetivo grupo;
- para itens pendentes, a apresentação reduz blocos financeiros redundantes sem alterar os valores guardados;
- itens comprados continuam a mostrar preço real e diferença;
- editar, eliminar, checkbox, filtros, pesquisa e ordenação reutilizam a lógica existente;
- em desktop, a tabela mantém as colunas e recebe separadores de categoria.

A ordem das categorias segue a taxonomia conhecida do Mercado. Categorias adicionais são colocadas depois das categorias conhecidas, por ordem alfabética. Dentro de cada categoria é preservada a ordenação calculada pelo fluxo existente.

## Implementação publicada

Foram adicionadas duas camadas isoladas:

- `market-category-groups.js` — agrupa os nós já renderizados pela categoria existente, sem gravar estado;
- `market-category-groups.css` — apresentação compacta dos grupos em mobile e separadores de categoria em desktop.

`render.js`, o schema financeiro e os handlers de negócio não foram alterados para implementar esta organização.

## Distribuição e cache

- build formal: v62;
- revisão do branding anterior: `62-ui2`;
- revisão dos novos assets de agrupamento: `62-ui3`;
- cache público: `conta-de-casa-public-v62-market-ui2-category-ui3`;
- merge funcional em `main`: `98662aa366ea65316ebd47cf56df8f2a3eeac974`;
- CI de `main`: sucesso;
- Deploy GitHub Pages da mesma revisão: sucesso.

## Segurança e dados

A revisão publicada:

- não altera PIN/palavra-passe;
- não altera PBKDF2, AES-GCM, IndexedDB ou sincronização;
- não altera `estimatedCents`, `actualCents`, quantidade ou estado de compra;
- não cria nem migra categorias;
- não acrescenta endpoints, credenciais, cookies ou telemetria;
- não usa armazenamento adicional para o estado expandido/recolhido;
- não remove dados existentes.

## Validação automática concluída

A CI validou, entre outros pontos:

- sintaxe do novo módulo;
- teste dedicado `tests/market-category-groups.test.cjs`;
- finanças e invariantes de contagem;
- isolamento do cofre;
- faturas e datas;
- Mercado, imagens históricas, código de barras e contabilização;
- segurança;
- responsividade e viewport móvel;
- navegação e acessibilidade;
- sincronização e política de conflitos técnicos;
- composição pública do GitHub Pages e manifest.

## Próximo passo

1. fechar completamente e voltar a abrir a aplicação/PWA no iPhone para carregar o novo cache `62-ui3`;
2. validar fisicamente grupos com uma e várias categorias;
3. testar expandir/recolher, pesquisa, filtros, checkbox, editar, eliminar e registo de preço real;
4. confirmar tema claro/escuro e larguras 320, 375, 390 e 430 px;
5. manter para alteração separada a eventual remoção definitiva do pipeline histórico de imagens.
