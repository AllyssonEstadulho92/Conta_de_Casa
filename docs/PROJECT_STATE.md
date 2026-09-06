# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público: v62
Distribuição: GitHub Pages
Branch pública: `main`
Estado da revisão: publicada

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O cofre continua no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece na versão 5.

A revisão de apresentação do módulo **Compras/Mercado** foi integrada em `main` e publicada no GitHub Pages. Não alterou PIN/palavra-passe, cifragem, faturas, preços, quantidades, totais, backups, sincronização ou regras de contabilização.

## Decisão de produto confirmada

As fotografias de produto deixaram de ser um requisito da interface. Para esta experiência, é suficiente identificar cada resultado e cada item pelo **nome**, complementado por embalagem/quantidade, loja, categoria e preço quando aplicável.

A fotografia não ocupa espaço nem cria placeholders vazios na lista ou nos resultados. A câmara do Mercado permanece porque serve **leitura de código de barras**, não captura de fotografia do produto.

## Implementação publicada

Foram integradas duas camadas isoladas:

- `market-brand.css` — identidade visual do Mercado, com hierarquia mais limpa, azul de marca, cartões com contraste controlado, estados cromáticos, navegação móvel refinada e remoção visual das fotografias/placeholders;
- `market-branding.js` — ajuste semântico do aviso de origem para explicar que a interface apresenta nome, embalagem, loja e preço sem depender de fotografias.

A apresentação privilegia:

- nome do produto como elemento principal;
- preço e estado com maior legibilidade;
- cartões-resumo com diferenciação azul, verde, âmbar e violeta;
- `+` como ação primária clara;
- cartões de lista sem coluna/área reservada a fotografia;
- pesquisa móvel com maior consistência de espaçamento, raio, sombra e tipografia;
- navegação inferior coerente com a identidade do módulo.

## Compatibilidade e dados existentes

A revisão **não elimina metadados antigos de imagem do cofre**. Campos legados como `imageUrl`, `imageSource` e `imageMatchedAt` continuam tolerados pelo schema para não destruir dados já gravados, mas deixam de ser relevantes para a apresentação do Mercado.

Os resolvedores de imagem v59–v62 permanecem temporariamente no código e no bundle público por compatibilidade. A camada visual final tem precedência e não mostra fotografias. A remoção técnica definitiva desses mecanismos fica separada para uma fase posterior, depois da validação física.

## Segurança e privacidade

A revisão visual:

- não acede a `appState` nem grava estado financeiro;
- não acrescenta endpoints, credenciais ou segredos;
- não altera autenticação, autorização ou isolamento do cofre;
- não altera `estimatedCents` nem `actualCents`;
- não adiciona telemetria.

## Validação concluída

- PR #35 — `UI: identidade visual do Mercado sem fotografias` — integrado em `main`;
- merge funcional: `2411a2e5ca30597d7fc5c04a50833fe63aff1042`;
- CI do PR #35: sucesso;
- CI de `main` após o merge funcional: sucesso;
- Deploy Pages do merge funcional: sucesso;
- PR #36 — reforço da CI para validar explicitamente `market-branding.js` — integrado em `main`;
- merge de qualidade: `03cf7f7a07cb28554ddf3ed37dd08c00257acf2e`;
- CI de `main` após PR #36: sucesso, incluindo probe das fontes do Mercado, sintaxe, finanças, segurança, responsividade, acessibilidade e sincronização;
- Deploy Pages após PR #36: sucesso.

## Próximo passo

1. validar fisicamente no iPhone/Safari a lista, o browser de produtos e a navegação inferior nas larguras 320, 375, 390 e 430 px;
2. confirmar tema claro/escuro, retrato/paisagem e ausência de qualquer espaço residual de fotografia;
3. depois da validação física, decidir se os módulos legados de imagem podem ser removidos definitivamente numa alteração arquitetural separada.
