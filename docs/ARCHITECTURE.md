# Arquitetura — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — UI/UX + migração incremental TypeScript  
Distribuição: GitHub Pages / PWA

## 1. Princípios e invariantes

A aplicação é uma PWA estática/local-first. Estado financeiro, apresentação, catálogos, imagens, build e deploy são responsabilidades separadas.

- `STATE_VERSION = 5`;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização remota opcional apenas do envelope cifrado;
- nenhum segredo no repositório público;
- `estimatedCents` distinto de `actualCents`;
- `marketId|pid` é a identidade canónica do pipeline especializado de SKU/fotografia;
- fotografia não é prova de preço nem de transação.

## 2. Repositórios

- `AllyssonEstadulho92/Conta_de_Casa`: aplicação pública, código, CI e GitHub Pages;
- `AllyssonEstadulho92/conta-de-casa-`: repositório privado de sincronização/armazenamento; não é o código do site.

## 3. Núcleo funcional atual

Runtime manual ainda existente:

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- `mobile-menu-toggle.js`: controlador móvel de drawer/gestos;
- vários módulos de Mercado, QR, scanner, assets, atualização, runtimes históricos e Service Worker.

Fonte TypeScript:

- `src/types/`: contratos de domínio;
- `src/type-tests/`: provas de tipos;
- `src/ui/veggie-menu-toggle.ts`: controlo Veggie Burger/X;
- `src/ui/market-branding.ts`: apresentação semântica do Mercado.

## 4. Build TypeScript

Fluxo canónico:

`src/**/*.ts` → `tsc --noEmit` strict → `scripts/build-typescript-runtime.cjs` → `.generated/*.js` → `scripts/prepare-pages.cjs` → `dist/*.js` → GitHub Pages

Regras:

- TypeScript não é executado diretamente pelo browser;
- `.generated/` e `dist/` são artefactos e não são versionados;
- o nome público pode continuar `.js` para compatibilidade de HTML/Service Worker;
- o ficheiro `.js` publicado não conta como fonte manual quando é produzido pelo build;
- o build falha se reaparecer uma fonte JS manual já migrada;
- cada substituto TS tem de passar `strict` e regressões antes de eliminar a fonte JS;
- não usar `@ts-nocheck` nem `any` em massa;
- schema, cifragem, fórmulas e semântica de preço não mudam por causa da linguagem.

### 4.1 Registo de runtimes gerados

O build mantém um registo explícito em `scripts/build-typescript-runtime.cjs` e um mapa público em `scripts/prepare-pages.cjs`.

Atualmente publicados:

- `src/ui/veggie-menu-toggle.ts` → `.generated/v76-veggie-menu.js` → `dist/v76-veggie-menu.js` — PR #88;
- `src/ui/market-branding.ts` → `.generated/market-branding.js` → `dist/market-branding.js` — PR #89.

`tests/typescript-runtime-build.test.cjs` verifica para cada runtime:

- fonte TS presente;
- fonte JS manual ausente;
- artefacto `.generated` criado;
- sintaxe de browser válida;
- marcadores de comportamento esperados;
- ausência de acesso ao estado financeiro nos módulos de apresentação;
- igualdade exata entre artefacto gerado e ficheiro colocado no `dist/`.

## 5. Pipeline CI e publicação

`push/PR` → instalar TypeScript → typecheck → gerar runtimes → CI completo → merge `main` → Pages via `workflow_run` → gerar runtimes novamente → preparar allowlist → validar bundle → deploy

Contrato:

- Pages só executa quando o CI de `main` termina com sucesso;
- o build público usa allowlist explícita;
- runtimes TS são gerados antes da cópia para `dist`;
- CI/Pages verificam diretamente `.generated/*.js` para fontes já migradas;
- alteração em `main` só é considerada publicada depois de o Deploy Pages concluir com sucesso.

Evidência publicada:

- PR #88 merge `5301bd0d66c5ec46ead7be079799ecb76c752237`: TypeScript `34699066645`, CI `34699066749`, Pages `34699100855` — sucesso;
- PR #89 merge `c59e0a45500fd7965039de27615f574129482b13`: TypeScript `34700016617`, CI `34700016615`, Pages `34700037019` — sucesso.

## 6. Incidente e regra de exclusão

Em 12/09/2026, `v75-architecture.js` foi removido prematuramente. CI falhou com `MODULE_NOT_FOUND` e Pages não publicou. PR #87 restaurou o ficheiro.

Consequência arquitetural: **nenhuma fonte JS é eliminada apenas por existir um TS com nome semelhante**. Primeiro o TS é tipado, compilado, mapeado para o bundle e testado; só depois a fonte manual é removida.

O mesmo princípio aplica-se ao Service Worker: invalidação de cache não autoriza alterar estratégia de fetch. No PR #89, o gate Safari/PWA detetou uma deriva durante desenvolvimento e o `sw.js` final ficou funcionalmente idêntico à baseline, exceto pela chave de cache.

## 7. Fallback

`backup/js-runtime-baseline-20260912` aponta para a baseline pública anterior à migração. É um rollback técnico, não um segundo runtime carregado em paralelo.

## 8. Composição visual pública

Ordem principal:

1. estilos base/responsive históricos;
2. `mobile-layout.css`;
3. camadas v75;
4. `v76-veggie-menu.css`;
5. `v75-usability.css`;
6. `v76-modern-ui.css` (`76-modern-ui2`) — tokens/componentes;
7. `v76-product-pages.css` (`76-product-pages1`) — composição interna;
8. `v76-mobile-shell.css` (`76-mobile-shell2`) — geometria mobile final.

A ordem é `tokens/componentes → composição da página → geometria do shell`.

## 9. Propriedade única por preocupação

- **tokens:** cor, tipografia, spacing, raio, sombra, foco;
- **shell:** viewport, scroll, safe areas, topbar, conteúdo e navegação persistente;
- **componentes:** botões, inputs, cards, tabs, dialogs, tabelas e estados;
- **composição:** ordem, proporção e prioridade das secções;
- **features:** Dashboard, Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico, Definições;
- **domínio:** finanças, Mercado, persistência, sync e segurança;
- **build:** geração/cópia de artefactos, sem lógica de domínio.

## 10. UI/UX e responsive

`v76-mobile-shell.css` é a autoridade da geometria global ≤820 px. `v76-modern-ui.css` define hierarquia `primary`, `secondary`, `danger`, `link`, `icon button`, baseline 44 px e estados acessíveis. `v76-product-pages.css` define composição interna do Dashboard sem alterar fórmulas.

Requisitos: reflow a 320 CSS px, sem scroll horizontal global, safe areas no shell, pinch-to-zoom preservado, foco visível, Safari/iPhone, teclado virtual, portrait/landscape, Light/Dark/System, reduced-motion e forced-colors.

## 11. Mercado

- pesquisa, imagens, barcode, carrinho e experiência permanecem separados;
- preço pesquisado continua estimativa até evidência completa;
- fotografia é apoio visual, nunca prova de preço/compra;
- `marketId|pid` permanece identidade canónica;
- `market-branding.ts` altera apenas copy/atributos de apresentação no DOM.

## 12. Segurança

Migração TypeScript não pode enfraquecer PIN/palavra-passe, PBKDF2/AES-GCM, isolamento do cofre, sync cifrada, validação de QR/importações, CSP ou política de segredos.

## 13. QA e gates

Toda migração mantém verdes finanças, isolamento/cofre, datas civis, faturas/QR, Mercado/SKU/imagens/scanner, responsive, navegação/acessibilidade, sync, PWA/cache e TypeScript strict.

Gates específicos de fonte TS:

- `tests/typescript-runtime-build.test.cjs`;
- ausência das fontes JS manuais já migradas;
- artefactos `.generated` válidos;
- bundle `dist` contém exatamente os artefactos esperados;
- CI integral + TypeScript Foundation verdes.

## 14. Ordem de migração

1. módulos folha/UI sem estado e pipeline;
2. funções puras de dinheiro/datas/quantidades;
3. domínio financeiro;
4. Mercado/modelo/carrinho;
5. core/persistência/cifra;
6. sync/conflitos;
7. render/forms/events e controladores complexos;
8. Service Worker/build;
9. testes/tooling;
10. remoção final de JavaScript fonte legado.

A ordem pode ser refinada conforme dependências reais, mas nunca encurtando os gates.
