# Decisões Técnicas — Conta de Casa

Atualizado: 13 de setembro de 2026

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

Publicado pelo PR #98.

- `#vaultScreen[hidden]` e `#app[hidden]` devem ser `display:none!important` na camada final;
- cofre visível exclui shell autenticado;
- nenhuma regra `display:* !important` pode neutralizar o estado `hidden` do runtime;
- a correção não altera criptografia, persistência ou finanças.

## D-086 — auditoria UI usa referências externas, não cópia de design

A partir de `76-ui-audit1`, decisões importantes de UI/UX são confrontadas com Apple HIG, Material Design 3/Android accessibility, WCAG 2.2/W3C e web.dev. A solução é adaptada à PWA real e aos seus contratos; não se copia interface proprietária.

## D-087 — header móvel final é neutro

O antigo gradiente teal do v75 não é mais a direção final. O header móvel deve usar superfície do design system, texto/ícones com contraste, borda subtil, sem sombra pesada, controlos de 44 px e foco visível. A cor de marca fica reservada para seleção/ação/status.

Motivo: havia conflito real entre `v75-header-refinement.css` (fundo escuro + branco forçado) e `v76-product-pages.css` (superfície clara).

## D-088 — onboarding v74 não mascara `76-auth1`

Enquanto `v74-experience.js` permanecer por compatibilidade, `cdcWelcome` não pode substituir visualmente o formulário real do cofre. A camada final oculta o onboarding v74 e força o `vaultCreate` real a permanecer visível. A criação runtime histórica será removida apenas no bloco de limpeza v74 com regressões verdes.

## D-089 — dock móvel: consistência antes de decoração

O dock final usa superfície neutra, 3–5 destinos primários, selected state discreto, ícones lineares e labels coerentes; respeita safe areas, reduced-motion, forced-colors e foco visível. Sombras/blur devem ser mínimos e nunca comprometer legibilidade.

## D-090 — navegação móvel precisa de uma única autoridade funcional

A duplicação atual entre `core/render` e `v74-experience` é dívida ALTA. A remoção será feita num bloco dedicado, preferencialmente com configuração TypeScript canónica, depois de paridade de destinos, `aria-current`, drawer e labels.

## D-091 — marca e iconografia têm autoridades distintas

A partir de `76-brand-icons1`:

- `icon.svg` é a marca gráfica canónica da Conta de Casa e deve ser reutilizado em PWA, sidebar, drawer e cofre;
- a marca usa casa + euro, teal sólido e branco; gradientes, folha e símbolos decorativos não pertencem à identidade final;
- Lucide continua a ser a família canónica de ícones funcionais para navegação, ações e estados;
- um ícone funcional deve representar a ação real; não substituir `Plus` por `Scan` num botão “Adicionar item”;
- títulos, cartões e estados não recebem pseudo-ícones apenas para ornamentação quando já existe texto/hierarquia suficiente;
- não se usa o ícone Lucide `home` como substituto do logótipo.

Motivo: o código apresentava duas identidades visuais simultâneas e vários pseudo-ícones do Mercado que duplicavam ou contradiziam o significado dos controlos.

## Invariantes vigentes

- `STATE_VERSION=5`;
- cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- `estimatedCents` ≠ `actualCents`;
- `marketId|pid` canónico;
- QR/scanner/backup/PWA/offline sem regressões;
- nenhum segredo no repositório público.
