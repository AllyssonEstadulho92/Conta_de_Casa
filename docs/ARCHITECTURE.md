# Arquitetura — Conta de Casa

Atualizado: 13 de setembro de 2026  
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

Atualmente publicados:

- `src/ui/veggie-menu-toggle.ts` → `.generated/v76-veggie-menu.js` → `dist/v76-veggie-menu.js` — PR #88;
- `src/ui/market-branding.ts` → `.generated/market-branding.js` → `dist/market-branding.js` — PR #89.

`tests/typescript-runtime-build.test.cjs` verifica fonte TS, ausência de fonte JS manual já migrada, artefacto gerado, sintaxe, comportamento esperado e igualdade com o ficheiro publicado em `dist/`.

## 5. Pipeline CI e publicação

`push/PR` → instalar TypeScript → gerar runtimes → CI completo → merge `main` → Pages via `workflow_run` → gerar runtimes novamente → preparar allowlist → validar bundle → deploy

Contrato:

- Pages só executa quando o CI de `main` termina com sucesso;
- o build público usa allowlist explícita;
- runtimes TS são gerados antes da cópia para `dist`;
- alteração em `main` só é considerada publicada depois de o Deploy Pages concluir com sucesso.

Evidência publicada:

- PR #88 merge `5301bd0d66c5ec46ead7be079799ecb76c752237`: TypeScript `34699066645`, CI `34699066749`, Pages `34699100855` — sucesso;
- PR #89 merge `c59e0a45500fd7965039de27615f574129482b13`: TypeScript `34700016617`, CI `34700016615`, Pages `34700037019` — sucesso.

## 6. Incidente e regra de exclusão

Em 12/09/2026, `v75-architecture.js` foi removido prematuramente. CI falhou com `MODULE_NOT_FOUND` e Pages não publicou. PR #87 restaurou o ficheiro.

Consequência: nenhuma fonte JS é eliminada apenas por existir um TS com nome semelhante. Primeiro o TS é tipado, compilado, mapeado para o bundle e testado; só depois a fonte manual é removida.

O mesmo princípio aplica-se ao Service Worker: invalidação de cache não autoriza alterar estratégia de fetch. O `sw.js` só deve mudar funcionalmente em bloco próprio.

## 7. Fallback

`backup/js-runtime-baseline-20260912` aponta para a baseline pública anterior à migração. É um rollback técnico, não um segundo runtime carregado em paralelo.

## 8. Composição visual e cascade

Ordem principal da aplicação publicada:

1. estilos base/responsive históricos;
2. `mobile-layout.css`;
3. camadas v75;
4. `v76-veggie-menu.css`;
5. `v75-usability.css`;
6. `v76-modern-ui.css` (`76-modern-ui2`) — tokens/componentes transversais;
7. `v76-product-pages.css` (`76-product-pages1`) — composição interna das páginas;
8. `v76-mobile-shell.css` (`76-mobile-shell2`) — geometria mobile final.

### 8.1 Bloco `76-auth1`

O ecrã `#vaultScreen` é anterior ao shell autenticado e não deve herdar a densidade visual das páginas internas.

Responsabilidades:

- `index.html`: estrutura e IDs canónicos do cofre;
- `events.js`: alternância PIN/palavra-passe, teclado PIN, recuperação e alteração do PIN;
- `core.js`: cifragem, desbloqueio, persistência e segurança;
- `v75-usability.css`: contém atualmente a camada de compatibilidade visual `v76-auth1`, porque já é a camada tardia de usabilidade que trata viewport/safe-area do cofre;
- `sw.js`: apenas invalida a cache `auth1` para instalações PWA existentes receberem o novo CSS.

A colocação de `76-auth1` em `v75-usability.css` é uma ponte de compatibilidade com a cascade histórica, não autorização para voltar a misturar lógica ou geometria global. Numa consolidação futura, as regras visuais podem migrar para uma folha v76 dedicada sem alterar comportamento.

Contrato visual do cofre:

- sem fundo decorativo dominante;
- mobile quase full-bleed, sem cartão pesado;
- branding compacto;
- uma única ação dominante (`Entrar`);
- teclado PIN circular e limpo;
- ações de recuperação/importação continuam acessíveis, porém terciárias;
- modo palavra-passe não apresenta simultaneamente o teclado PIN;
- nenhuma biometria é apresentada sem implementação funcional real;
- dark mode, foco, forced-colors, reduced-motion e safe areas permanecem suportados.

## 9. Propriedade única por preocupação

- **tokens:** cor, tipografia, spacing, raio, sombra, foco;
- **shell:** viewport autenticado, scroll, safe areas, topbar, conteúdo e navegação persistente;
- **componentes:** botões, inputs, cards, tabs, dialogs, tabelas e estados;
- **autenticação visual:** composição do `#vaultScreen`, sem tocar em KDF/cifra/persistência;
- **composição:** ordem, proporção e prioridade das secções;
- **features:** Dashboard, Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico, Definições;
- **domínio:** finanças, Mercado, persistência, sync e segurança;
- **build:** geração/cópia de artefactos, sem lógica de domínio.

## 10. UI/UX e responsive

`v76-mobile-shell.css` é autoridade da geometria global do shell autenticado ≤820 px. O `#vaultScreen` tem regras próprias por existir antes desse shell, mantendo `100dvh`, safe areas e scroll seguro.

Requisitos transversais: reflow a 320 CSS px, sem scroll horizontal global, pinch-to-zoom preservado, foco visível, Safari/iPhone, teclado virtual, portrait/landscape, Light/Dark/System, reduced-motion e forced-colors.

## 11. Mercado

- pesquisa, imagens, barcode, carrinho e experiência permanecem separados;
- preço pesquisado continua estimativa até evidência completa;
- fotografia é apoio visual, nunca prova de preço/compra;
- `marketId|pid` permanece identidade canónica;
- `market-branding.ts` altera apenas copy/atributos de apresentação no DOM.

## 12. Segurança

Redesign e migração TypeScript não podem enfraquecer PIN/palavra-passe, PBKDF2/AES-GCM, isolamento do cofre, sync cifrada, validação de QR/importações, CSP ou política de segredos.

No bloco `76-auth1` não são alterados `unlockPassphrase`, `unlockVaultBtn`, KDF, envelope cifrado, IndexedDB, handlers de recuperação nem a política de alteração do PIN. A mudança é visual.

## 13. QA e gates

Toda alteração mantém verdes finanças, isolamento/cofre, datas civis, faturas/QR, Mercado/SKU/imagens/scanner, responsive, navegação/acessibilidade, sync, PWA/cache e TypeScript strict quando aplicável.

`tests/v75-stability.test.cjs` inclui agora contrato de `76-auth1`: teclado circular, CTA sólido dominante, modo texto sem keypad, ações secundárias preservadas e proibição de biometria apenas decorativa.

CI da branch `feat/v76-auth-redesign1`: `34729499227`, sucesso integral.

## 14. Ordem de evolução

1. concluir/publicar `76-auth1` e validar fisicamente;
2. continuar blocos visuais perceptíveis por página, sem alterar domínio;
3. manter migração TypeScript por módulos de baixo acoplamento;
4. preparar vetores de paridade antes de dinheiro/datas/quantidades;
5. migrar domínio financeiro;
6. migrar Mercado/modelo/carrinho;
7. migrar core/persistência/cifra;
8. migrar sync/conflitos;
9. migrar render/forms/events e controladores complexos;
10. consolidar Service Worker/build e remover JavaScript fonte legado.

A ordem pode ser refinada conforme dependências reais, mas nunca encurtando os gates de segurança e regressão.