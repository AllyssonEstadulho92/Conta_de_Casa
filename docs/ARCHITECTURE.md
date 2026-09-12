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

## 2. Repositórios e responsabilidades

- `AllyssonEstadulho92/Conta_de_Casa`: aplicação pública, código-fonte, CI e GitHub Pages;
- `AllyssonEstadulho92/conta-de-casa-`: repositório privado de sincronização/armazenamento, não é o código do site.

Mudanças de template/UI são desenvolvidas e publicadas a partir de `Conta_de_Casa`.

## 3. Núcleo funcional atual

Runtime manual ainda existente:

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- módulos de Mercado, QR, scanner, assets, atualização, navegação e Service Worker em JavaScript.

Fonte TypeScript atual:

- `src/types/`: contratos de domínio;
- `src/type-tests/`: provas de tipos;
- `src/ui/veggie-menu-toggle.ts`: controlo Veggie Burger/X e primeiro runtime cuja fonte manual JS foi substituída.

## 4. Modelo de build TypeScript

Arquitetura de destino:

`src/**/*.ts` → typecheck strict → compilação → `.generated/*.js` → `scripts/prepare-pages.cjs` → `dist/*.js` → GitHub Pages

Regras:

- TypeScript não é executado diretamente pelo browser;
- `.generated/` e `dist/` são artefactos ignorados pelo Git;
- JavaScript público em `dist/` pode manter extensão `.js`, mas não é fonte manual;
- nenhum módulo JS legado é removido antes de existir substituto TS equivalente;
- o substituto deve estar compilado, referenciado pelo build/Pages e coberto por testes;
- `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` permanecem ativos;
- não usar `@ts-nocheck` nem `any` em massa;
- schema, cifragem, fórmulas e semântica de preço não mudam por causa da linguagem.

### 4.1 Primeiro runtime efetivamente migrado

`src/ui/veggie-menu-toggle.ts` é a fonte canónica.

- `scripts/build-typescript-runtime.cjs` usa TypeScript 6 para gerar `.generated/v76-veggie-menu.js`;
- o build rejeita a presença de `v76-veggie-menu.js` manual na raiz;
- `scripts/prepare-pages.cjs` chama o build TypeScript e mapeia o nome público `v76-veggie-menu.js` para o artefacto em `.generated/`;
- `tests/typescript-runtime-build.test.cjs` prova TS → JS gerado → bundle Pages;
- `tests/v76-veggie-menu.test.cjs` valida o artefacto gerado, não um JS manual;
- o Service Worker continua a referenciar `./v76-veggie-menu.js` porque esse é o ficheiro que o browser recebe.

## 5. Pipeline de CI e publicação

Fluxo canónico:

`push/PR` → instalar toolchain TS → `typecheck` → gerar artefactos TS → `CI` completo → merge em `main` → `Deploy Pages` via `workflow_run` → gerar novamente artefactos → `prepare-pages` → `dist/` → GitHub Pages

Contrato:

- Pages só executa quando o CI de `main` termina com sucesso;
- `scripts/prepare-pages.cjs` usa allowlist explícita e falha se faltar asset;
- runtimes migrados são gerados antes da cópia pública;
- o Service Worker/cache é versionado;
- alteração em `main` só é considerada publicada depois do deployment concluir.

Incidente de 12/09/2026:

- `v75-architecture.js` foi apagado de `main` antes de ser substituído;
- CI falhou com `MODULE_NOT_FOUND`;
- Pages foi corretamente ignorado;
- PR #87 restaurou o ficheiro e o pipeline voltou a verde;
- PR #86 publicou depois o primeiro redesign real do Dashboard, merge `42557d59f464a2fc7fc22a31eb24564e7dbabad9`, Pages `34695600399` com sucesso.

Regra arquitetural: nenhum runtime fonte é apagado enquanto houver referência manual sem substituto gerado.

## 6. Estratégia de fallback

A branch `backup/js-runtime-baseline-20260912` aponta para a baseline pública `42557d59f464a2fc7fc22a31eb24564e7dbabad9` e mantém a versão JavaScript validada anterior à migração.

Fallback significa rollback de versão/branch em caso de regressão. Não significa carregar simultaneamente o JS antigo e o novo artefacto TS no runtime normal.

## 7. Composição visual pública

Ordem relevante:

1. estilos base/responsive históricos;
2. `mobile-layout.css`;
3. camadas v75;
4. `v76-veggie-menu.css` (`76-veggie-menu2`);
5. `v75-usability.css`;
6. `v76-modern-ui.css` (`76-modern-ui2`) — tokens/componentes;
7. `v76-product-pages.css` (`76-product-pages1`) — composição das páginas;
8. `v76-mobile-shell.css` (`76-mobile-shell2`) — geometria mobile final;
9. estilos específicos do Centro de Versão.

A ordem é deliberada: `tokens/componentes → composição da página → geometria do shell`.

## 8. Propriedade única por preocupação

- **tokens**: cor, tipografia, spacing, raio, sombra e foco;
- **shell**: viewport, scroll, safe areas, topbar, área principal e navegação persistente;
- **componentes**: botões, inputs, cards, tabs, dialogs, tabelas, toolbars e estados;
- **composição de página**: ordem, proporção e prioridade das secções;
- **features**: Dashboard, Despesas/Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições;
- **domínio**: finanças, Mercado, persistência, sync e segurança fora da camada visual;
- **build**: compilação e criação de artefactos, sem lógica de domínio.

## 9. Shell móvel — `76-mobile-shell2`

Em ≤820 px, `v76-mobile-shell.css` é a autoridade da geometria global: scroll, safe areas, topbar estrutural, reserva de página e dock persistente. Não bloquear pinch-to-zoom e não ocultar foco/conteúdo.

## 10. Sistema visual — `76-modern-ui2`

Hierarquia canónica: `primary`, `secondary`, `danger`, `link`, `icon button`; baseline 44 px, métricas coerentes de ícones, `focus-visible`, disabled/`aria-disabled`, hover para ponteiro fino, reduced-motion, forced-colors e grids com `min-width:0`.

Fotografias do Mercado usam `contain`/centro/fallback sem alterar SKU, preço ou total.

## 11. Composição de produto — `76-product-pages1`

Dashboard publicado:

1. `Saldo atual` como resumo principal;
2. `Por pagar`, `Em atraso`, `Saldo projetado`;
3. alertas condicionais;
4. `Pago no mês`, `Próximos 7 dias`;
5. vencimentos + orçamento;
6. atividade + categorias.

Mobile reorganiza as mesmas fontes de dados numa sequência vertical própria. A camada não altera fórmulas nem estado.

## 12. Direção das restantes páginas

- **Mercado:** pesquisa, filtros, catálogo/lista, carrinho, quantidade/preço/estado; `Estimativa` até evidência completa;
- **Planeamento:** saldo, orçamento e rendimentos reais antes de novas capacidades;
- **Calendário:** vencimentos/pagamentos existentes;
- **Faturas:** pesquisa, filtros, estado, ordenação, tabela desktop/lista mobile; sem mudar pagamentos/vencimentos.

## 13. Responsive, acessibilidade e temas

- reflow a 320 CSS px;
- sem scroll horizontal global;
- safe areas no shell;
- 44×44 CSS px como baseline de toque;
- foco não oculto;
- Safari/iPhone, teclado virtual, portrait/landscape e Light/Dark/System no QA;
- contraste/estado não dependem apenas de cor.

## 14. Segurança

UI e TypeScript não podem enfraquecer PIN/palavra-passe, PBKDF2/AES-GCM, isolamento do cofre, sync cifrada, validação de QR/importações, CSP ou política de segredos.

## 15. QA e gates

Mudanças transversais exigem regressões verdes para finanças, isolamento/cofre, datas civis, faturas/QR, Mercado/SKU/imagens/scanner, responsive, navegação/acessibilidade, sync, PWA/cache e TypeScript strict.

Gates específicos da migração:

- `tests/typescript-runtime-build.test.cjs`;
- ausência da fonte manual migrada;
- artefacto `.generated` válido;
- bundle `dist` contém o runtime público gerado;
- CI integral e TypeScript Foundation verdes.

## 16. Ordem da migração de código

1. pipeline TS e primeiro runtime de UI;
2. funções puras de dinheiro/datas/quantidades;
3. domínio financeiro;
4. Mercado/modelo/carrinho;
5. core/persistência/cifra;
6. sync/conflitos;
7. render/forms/events e UI restante;
8. Service Worker/build;
9. testes/tooling;
10. remoção final de JavaScript fonte legado.

Cada exclusão de `.js` exige prova de ausência de referências manuais, artefacto TS equivalente e regressões verdes.
