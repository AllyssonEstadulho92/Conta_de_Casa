# Decisões Técnicas — Conta de Casa

Atualizado: 15 de setembro de 2026

## D-064 — migração TypeScript incremental

- destino: fonte funcional TypeScript com `strict`;
- browser pode continuar a executar JavaScript gerado;
- sem framework novo apenas para mudar linguagem;
- cada runtime substitui JS manual apenas depois de paridade e regressões;
- schema, cifragem e fórmulas não mudam por causa da linguagem.

## D-065 — total de Mercado exige evidência completa

Um total só é exato quando SKU, quantidade/peso, preço aplicável, promoções/condições e ajustes relevantes estiverem confirmados. Caso contrário é estimativa.

## D-066 — imagem não é prova de preço

Fotografias/logos são apresentação e identidade; não definem `actualCents` nem provam uma transação.

## D-072 — shell móvel com uma única autoridade geométrica

`v76-mobile-shell.css` é a autoridade final de viewport autenticado, safe areas, scroll, reserva e posição do dock.

## D-073 — propriedade por preocupação

- tokens/componentes: design system;
- composição: product pages/camadas de página v76;
- geometria mobile: mobile shell;
- domínio: finanças/Mercado;
- persistência/cifra: core;
- sync: camada própria;
- build/PWA: tooling + Service Worker.

## D-075 — hierarquia visual canónica

O sistema visual v76 define primary, secondary, danger, link, icon-button, baseline tátil 44 px, foco e estados disabled/hover.

## D-076 — “100% TypeScript” significa fonte TypeScript

`.js` público gerado pode continuar a existir. O que deve desaparecer é JavaScript manual mantido como fonte funcional.

## D-077 — protótipo não autoriza funções inventadas

Protótipos são referência de hierarquia. Métricas, biometria, comparação de preços, tarefas ou outras funções só entram se existirem no domínio real e forem implementadas/testadas.

## D-078 — composição não altera domínio

CSS pode ordenar/priorizar, mas não calcular dinheiro, escrever IndexedDB ou alterar segurança.

## D-079 — exclusão de JS exige substituição comprovada

Um JS manual só sai depois de TS equivalente, build gerado, consumidores migrados e gates verdes.

## D-080 — JS gerado é artefacto

`.generated/*.js` e `dist/*.js` produzidos a partir de TypeScript não são fonte manual.

## D-081 — migração por blocos auditáveis

Baixo acoplamento primeiro; finanças, core/cifra e controladores complexos apenas com contratos e vetores de paridade suficientes.

## D-082 — mudança visual tem de ser perceptível

Não comunicar build/cache/TypeScript como redesign se a composição visível não mudou.

## D-083 — PIN local válido não depende de sync remoto

Depois de `unlockVault()` validar o cofre local, a aplicação abre sem depender de rede; sync continua em background.

## D-084 — regressão física tem prioridade sobre contrato legado

Se dispositivo real contradiz teste verde, o teste deve ser revisto para o comportamento final desejado.

## D-085 — `hidden` é autoridade explícita no auth

`#vaultScreen[hidden]` e `#app[hidden]` têm de ser efetivamente invisíveis mesmo perante CSS histórico com `!important`.

## D-086 — auditoria UI usa referências externas, não cópia de design

Apple HIG, Material/Android accessibility, WCAG 2.2/W3C e web.dev são referências; a implementação é adaptada à PWA real.

## D-087 — header móvel final é neutro

Superfície do design system, texto/ícones com contraste, borda subtil, controlos de 44 px e foco visível. Cor de marca fica reservada para ação/seleção/status.

## D-089 — dock móvel: consistência antes de decoração

Superfície neutra, cinco destinos primários, selected state discreto, ícones lineares, labels legíveis e safe areas.

## D-090 — navegação móvel tem uma única autoridade

A duplicação histórica com v74 foi retirada. `v75-architecture.js` mantém a composição atual e `mobile-menu-toggle.js` controla o drawer/hambúrguer.

## D-091 — marca e iconografia têm autoridades distintas

- `icon.svg` é a marca gráfica canónica;
- Lucide é a família de ícones funcionais;
- um ícone deve representar a ação real;
- decoração não deve duplicar significado.

## D-092 — `marketId|pid` acompanha o artigo pesquisado

A identidade de um SKU pesquisado não pode desaparecer quando o produto entra na lista.

Regras:

- `marketId` só aceita retalhistas live suportados (`pingo-doce`, `continente`) ou vazio;
- `pid` é normalizado para dígitos, máximo 32 caracteres;
- itens manuais/legados continuam válidos com ambos vazios;
- a identidade é preservada antes do commit e durante a normalização;
- `marketId/pid` não são removidos pela política de conflitos técnicos de sync;
- esta alteração é aditiva e não exige `STATE_VERSION` novo;
- `estimatedCents`, `actualCents`, quantidade e estado de compra permanecem intocados.

## D-093 — correção técnica não obriga alteração da release

Hotfixes e correções internas podem ser publicados mantendo `v76`/`0.76.0` quando não existe mudança de release. Cache interno do Service Worker pode mudar para distribuir o código, mas não se altera `release-manifest.json`, `app-update.js` ou a versão mostrada ao utilizador apenas para forçar refresh.

## D-094 — testes estáticos não equivalem a WebKit real

Contratos por regex/sintaxe continuam úteis, mas não contam como validação física de hit-testing, teclado virtual, scroll, foco ou top-layer. Fluxos críticos móveis devem ganhar E2E WebKit/Chromium.

## D-095 — dependência CDN deve ser descrita com precisão

Enquanto ZXing for carregado de `unpkg.com`, a página Segurança não pode afirmar literalmente “Sem CDNs”. A direção preferida é bundle local + licença preservada + CSP mais restritiva.

## Invariantes vigentes

- `STATE_VERSION=5`;
- cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- `estimatedCents` ≠ `actualCents`;
- `marketId|pid` canónico;
- QR/scanner/backup/PWA/offline sem regressões;
- nenhum segredo no repositório público.
