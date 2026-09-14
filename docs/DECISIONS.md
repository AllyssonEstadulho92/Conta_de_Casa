# Decisões Técnicas — Conta de Casa

Atualizado: 14 de setembro de 2026

## D-064 — migração TypeScript incremental

- destino: fonte funcional TypeScript com `strict`;
- browser continua a executar JavaScript compilado;
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
- composição: product pages;
- geometria mobile: mobile shell;
- domínio: finanças/Mercado;
- persistência/cifra: core;
- sync: camada própria;
- build/PWA: tooling + Service Worker.

## D-075 — hierarquia visual canónica

`76-modern-ui2` define primary, secondary, danger, link, icon-button, baseline tátil 44 px, foco e estados disabled/hover.

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

Runtimes migrados: Veggie menu (#88), Market branding (#89), Sync conflict policy (#95).

## D-082 — mudança visual tem de ser perceptível

Não comunicar build/cache/TypeScript como redesign se a composição visível não mudou.

## D-083 — PIN local válido não depende de sync remoto

Publicado pelo PR #96. Depois de `unlockVault()` validar o cofre local, o Dashboard abre imediatamente; sync continua em background. Cofre e shell são estados exclusivos e a falha de transição faz rollback visual seguro.

## D-084 — regressão física tem prioridade sobre contrato legado

Se dispositivo real contradiz teste verde, o teste deve ser revisto para o comportamento final desejado.

## D-085 — `hidden` é autoridade explícita no auth

Publicado pelo PR #98. `#vaultScreen[hidden]` e `#app[hidden]` devem ser `display:none!important`; cofre visível exclui shell autenticado.

## D-086 — auditoria UI usa referências externas, não cópia de design

Decisões importantes de UI/UX são confrontadas com Apple HIG, Material Design 3/Android accessibility, WCAG 2.2/W3C e web.dev. A solução é adaptada à PWA real; não se copia interface proprietária.

## D-087 — header móvel final é neutro

Superfície do design system, texto/ícones com contraste, borda subtil, sem gradiente pesado, controlos de 44 px e foco visível. A cor de marca fica reservada a ação, seleção e estado.

## D-088 — onboarding v74 não mascara `76-auth1`

Enquanto `v74-experience.js` permanecer por compatibilidade, `cdcWelcome` não pode substituir visualmente o formulário real do cofre.

## D-089 — dock móvel: consistência antes de decoração

O dock usa superfície neutra, cinco destinos primários, selected state discreto, ícones lineares e labels coerentes; respeita safe areas, reduced-motion, forced-colors e foco visível.

## D-090 — navegação móvel tem autoridade final transitória em v75 stability

Após PR #104, `v75-stability.js` instala e mantém a assinatura canónica do dock, marca a autoridade v76 e impede que a camada v74 volte a reescrever a mesma estrutura. Isto é uma consolidação transitória até a configuração final migrar para TypeScript.

## D-091 — marca e iconografia têm autoridades distintas

- `icon.svg` é a marca gráfica canónica da Conta de Casa;
- Lucide local é a família canónica de ícones funcionais;
- um ícone funcional deve representar a ação real;
- títulos/cartões não recebem ícones decorativos redundantes;
- não se usa Lucide `home` como substituto do logótipo.

## D-092 — cor dos ícones é semântica, não decorativa

`76-icon-semantics3` restaura cor nos ícones porque a validação física mostrou uma interface excessivamente cinzenta e sem hierarquia. A paleta é pequena e estável por função: teal, índigo, verde, âmbar, roxo, azul, rosa e danger já existente.

A cor nunca é o único sinal: navegação mantém label, `aria-current`, fundo selecionado, foco e estrutura. Dark mode tem tokens próprios; `forced-colors` devolve autoridade ao sistema operativo/browser.

## D-093 — label compacto do dock não altera a rota

A página continua `planning` e o título continua Planeamento. Apenas o label da navegação inferior muda de `Planeamento` para `Plano`, evitando truncagem (`Planeame…`) em iPhone e outros ecrãs compactos.

## D-094 — semântica de ícones tem prioridade sobre compatibilidade nominal

Quando uma camada antiga pede um nome genérico/inexistente (`income`, `security`, `sync`) e o sistema Lucide cairia em `more`, a camada de estabilidade pode reidratar apenas o slot visual com o símbolo semântico correto (`goal`, `shield`, `cloudCheck`, `activity`) sem alterar rotas, handlers ou dados.

## Invariantes vigentes

- `STATE_VERSION=5`;
- cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- `estimatedCents` ≠ `actualCents`;
- `marketId|pid` canónico;
- QR/scanner/backup/PWA/offline sem regressões;
- nenhum segredo no repositório público.
