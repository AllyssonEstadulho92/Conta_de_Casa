# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53 com revisão visual Lucide v54 integrada; hierarquia do protótipo v55 em validação
Distribuição: GitHub Pages
Estado da revisão: protótipo aprovado da **Lista de compras** aplicado como camada visual contextual, sem alteração de schema, cálculos, persistência ou eventos de negócio

## Estado atual

A aplicação continua local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5. Faturas, Planeamento, Mercado, Relatórios, Segurança, Definições, leitura de códigos de barras e captura QR de faturas mantêm os fluxos existentes.

A revisão Lucide anterior já está integrada na `main`. Uma nova captura real de iPhone/Safari da página **Lista de compras** mostrou que a família de ícones estava coerente, mas a composição ainda não reproduzia totalmente o protótipo aprovado.

## Revisão v55 — hierarquia do protótipo aprovado

A nova camada mantém o desenho e a arquitetura existentes, mas aproxima a página Compras do protótipo aprovado:

- título **Lista de compras** recebe um carrinho vetorial alinhado com o texto;
- o `+` azul principal permanece no cabeçalho como ação primária;
- o segundo botão junto da pesquisa deixa de parecer outro `+` e passa a comunicar **scanner/pesquisa de produto**;
- o chip Sync mantém estado semântico e ganha indicação de interatividade;
- pesquisa continua com lupa Lucide e caixa Safari-safe;
- os quatro cartões financeiros passam a ter âncoras iconográficas e cores de apoio sem alterar valores;
- a lista mobile recebe avatar vetorial neutro, estado, quantidade e valores com hierarquia mais próxima do protótipo;
- fotografias de produto não são inventadas porque `normalizeMarketItem()` não possui campo de imagem;
- em itens ainda por comprar, o campo de preço real deixa de ocupar espaço; quando o item é comprado, continua disponível;
- editar/eliminar permanecem funcionais e tornam-se ações iconográficas compactas no mobile;
- a navegação inferior usa métrica Lucide uniforme e sublinhado ativo consistente.

## Auditoria global de ícones

A auditoria confirma quatro origens históricas de iconografia:

1. `ICONS` / `icon()` no núcleo;
2. subset Lucide e hidratação em `ui-icons.js`;
3. pequenos SVG locais de módulos como Mercado, scanner e leitura de faturas;
4. glifos Unicode/fallbacks estáticos e decoração nativa de controlos.

**Decisão vigente:** Lucide continua a ser a linguagem visual oficial. A v55 força também os SVG contextuais antigos a usar a mesma métrica visual de traço 2 px, terminais arredondados e rendering consistente. A remoção física dos fallbacks e migração dos geradores locais para `CDCIcons.markup` fica separada da revisão v55 para não introduzir refatoração estrutural durante a validação visual.

## O que não foi alterado

- `appState` e schema financeiro;
- IndexedDB;
- PBKDF2 / AES-GCM / PIN;
- cálculos de faturas e Mercado;
- `estimatedCents`, `actualCents` e cálculo de quantidade;
- backups e sincronização;
- pesquisa de preços Pingo Doce/Continente;
- identificação GTIN pelo Open Food Facts;
- captura QR de faturas;
- CSP e origens externas.

## Segurança e privacidade

A revisão v55 é apenas visual. Não adiciona fontes, pacotes, CDNs, endpoints, telemetria nem imagens remotas. O Service Worker muda apenas o namespace de cache para `conta-de-casa-public-v55-prototype`, garantindo que o Safari/iOS não reutiliza a folha visual anterior.

## Validação automatizada

Foram atualizados testes para confirmar:

- snapshot e licença Lucide;
- scanner, pesquisa e selects;
- ausência de `+` duplicado;
- hierarquia do título Compras;
- ação secundária com linguagem de scanner;
- ícones dos cartões-resumo;
- avatar vetorial neutro dos cartões mobile;
- ocultação do preço real em itens pendentes;
- navegação inferior ativa;
- métrica visual aplicada também aos SVG contextuais;
- cache v55;
- regressões de Mercado e responsividade.

## Limitações conhecidas

A validação automatizada não substitui a confirmação física de rendering em Safari/iPhone. A fotografia do protótipo é apenas referência visual; a aplicação não tem dados de imagem de produto e, por isso, usa um avatar vetorial neutro em vez de fotografias falsas.

Os glifos Unicode que ainda existem como fallback estático no código não são a fonte visual final depois da hidratação Lucide. A sua remoção física será feita separadamente após validação v55.

## Próximo passo

1. concluir CI da branch `ui/prototype-hierarchy-v55`;
2. integrar apenas se todas as suites passarem;
3. publicar pela pipeline normal de GitHub Pages;
4. validar no iPhone/Safari a mesma página da captura: carrinho no título, um único `+` principal, scanner ao lado da pesquisa, quatro cartões com ícones e lista sem sobreposição;
5. repetir em 320, 375, 390 e 430 px, claro/escuro, retrato/paisagem;
6. depois da validação física, iniciar a remoção gradual de fallbacks Unicode e dos pequenos geradores SVG duplicados.
