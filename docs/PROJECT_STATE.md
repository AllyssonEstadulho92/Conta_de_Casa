# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53 com revisão visual Lucide v54 integrada; hierarquia Compras v55 integrada; cofre visual v56 em validação
Distribuição: GitHub Pages
Estado da revisão: ecrã de desbloqueio do cofre redesenhado visualmente para iPhone/Android/desktop, sem alterar PIN/palavra-passe, cifragem, persistência ou eventos de autenticação

## Estado atual

A aplicação continua local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5. Faturas, Planeamento, Mercado, Relatórios, Segurança, Definições, leitura de códigos de barras e captura QR de faturas mantêm os fluxos existentes.

A revisão Lucide anterior já está integrada na `main`. Uma nova captura real de iPhone/Safari da página **Lista de compras** mostrou que a família de ícones estava coerente, mas a composição ainda não reproduzia totalmente o protótipo aprovado.

## Revisão v56 — cofre de acesso moderno

A captura de referência enviada em iPhone mostrou uma direção visual mais premium para a entrada por PIN. A v56 aplica essa hierarquia ao **Conta de Casa** sem copiar funcionalidades inexistentes: mantém o PIN/palavra-passe atual, não introduz passkey/biometria falsa e não altera a derivação criptográfica.

Alterações principais:

- fundo com profundidade subtil e safe areas completas;
- cartão do cofre mais limpo, arredondado e centrado;
- marca **Conta de Casa** compacta e coerente com Lucide;
- badge de segurança, título e mensagem de sessão com hierarquia reforçada;
- campo de PIN em cápsula legível e focável;
- teclado circular com proporções equilibradas e estados tácteis;
- ação **Entrar** com maior destaque e alternativa **Usar palavra-passe** preservada;
- transferência de cofre e notas de privacidade mantidas, mas visualmente secundárias;
- tema escuro e `prefers-reduced-motion` preservados;
- cache público passa a `conta-de-casa-public-v56-vault-modern` para evitar CSS antigo no Safari/iOS.

Não foi adicionado botão de passkey/biometria porque o projeto não possui esse mecanismo implementado e testado.

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

1. concluir CI da branch `ui/vault-modern-v56`;
2. integrar apenas se todas as suites passarem;
3. publicar pela pipeline normal de GitHub Pages;
4. validar no iPhone/Safari o cofre em 320, 375, 390 e 430 px, confirmando safe areas, ausência de corte, teclado circular, botão Entrar e acesso por palavra-passe;
5. validar tema claro/escuro e `prefers-reduced-motion`;
6. só avaliar passkey/biometria numa decisão separada, com suporte real WebAuthn/biométrico e modelo de recuperação definido.

## 2026-09-05 — Mercado v57: fotografias reais de referência

A Lista de compras passa a apresentar fotografia real quando existe correspondência suficientemente forte no Open Food Facts. A imagem deixa de ser simulada por um avatar vetorial. O nome, preço e ligação oficial do retalhista continuam separados da fotografia: preço e página oficial permanecem provenientes do fluxo cesta.pt; a fotografia é apenas referência visual e a origem fica registada no item.

Apenas URLs HTTPS de images.openfoodfacts.org são aceites. Itens sem correspondência forte mantêm um placeholder neutro; a aplicação não inventa nem força uma fotografia aproximada. Os metadados opcionais productCode, imageUrl, imageSource e imageMatchedAt são normalizados dentro do schema existente, sem migração do IndexedDB.
