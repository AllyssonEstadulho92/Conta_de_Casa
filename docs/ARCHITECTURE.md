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

Existem dois repositórios com nomes semelhantes e não devem ser confundidos:

- `AllyssonEstadulho92/Conta_de_Casa`: aplicação pública, código-fonte, CI e GitHub Pages;
- `AllyssonEstadulho92/conta-de-casa-`: repositório privado de sincronização/armazenamento, não é o código do site.

Mudanças de template/UI devem ser feitas e publicadas a partir de `Conta_de_Casa`.

## 3. Núcleo funcional atual

Runtime manual ainda existente:

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- módulos de Mercado, QR, scanner, assets, atualização e navegação em JavaScript.

Fonte TypeScript atual:

- `src/types/`: contratos de domínio;
- `src/type-tests/`: provas de tipos;
- `src/ui/veggie-menu-toggle.ts`: controlo Veggie Burger/X.

O destino é substituir progressivamente o runtime manual por fonte TypeScript strict, sem alterar comportamento validado.

## 4. Modelo de build e objetivo TypeScript

Arquitetura de destino:

`src/**/*.ts` → typecheck strict → compilação → JavaScript gerado em `dist/` → GitHub Pages

Regras:

- TypeScript não é executado diretamente pelo browser;
- JavaScript gerado em `dist/` é artefacto de build, não fonte manual;
- nenhum módulo JS legado é removido antes de existir substituto TS equivalente;
- o substituto deve estar compilado, referenciado pelo build/Pages e coberto por testes;
- durante a migração, o JS antigo pode permanecer como fallback controlado até o novo runtime estar provado;
- `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` permanecem ativos;
- não usar `@ts-nocheck` nem `any` em massa;
- schema, cifragem, fórmulas e semântica de preço não mudam por causa da linguagem.

## 5. Pipeline de CI e publicação

Fluxo canónico:

`push/PR` → `CI` + `TypeScript Foundation` → merge em `main` → `Deploy Pages` via `workflow_run` → `scripts/prepare-pages.cjs` → `dist/` → GitHub Pages

Contrato de publicação:

- `Deploy Pages` só executa quando o CI de `main` termina com sucesso;
- `scripts/prepare-pages.cjs` usa uma allowlist explícita e falha quando um asset obrigatório não existe;
- o Service Worker/cache é versionado e deve incluir apenas assets públicos válidos;
- uma alteração em `main` não significa automaticamente que o site foi atualizado: o CI e o deployment têm de concluir com sucesso.

Incidente confirmado em 12/09/2026:

- `v75-architecture.js` foi apagado de `main` antes de ser substituído;
- CI falhou com `MODULE_NOT_FOUND`;
- o Pages foi corretamente ignorado;
- PR #87 restaurou exatamente o ficheiro exigido;
- CI e Pages voltaram a sucesso no merge `6401f1c5156382e9fe364da31afa3fcec4aed9bc`.

Este incidente passa a ser um teste arquitetural: **nenhum ficheiro runtime pode ser apagado enquanto houver referência em CI, build, HTML, Service Worker ou testes.**

## 6. Composição visual pública

Ordem relevante:

1. estilos base/responsive históricos;
2. `mobile-layout.css` — apenas refinamentos de features móveis;
3. camadas v75 de arquitetura/layout/pages/features;
4. `v76-veggie-menu.css` (`76-veggie-menu2`);
5. `v75-usability.css`;
6. `v76-modern-ui.css` (`76-modern-ui2`) — tokens e componentes;
7. `v76-product-pages.css` (`76-product-pages1`) — composição/hierarquia das páginas migradas;
8. `v76-mobile-shell.css` (`76-mobile-shell2`) — autoridade final da geometria mobile ≤820 px;
9. estilos específicos do Centro de Versão.

A ordem é deliberada: `tokens/componentes → composição da página → geometria do shell`.

## 7. Propriedade única por preocupação

- **tokens**: cor, tipografia, spacing, raio, sombra e foco;
- **shell**: viewport, scroll, safe areas, topbar, área principal e navegação persistente;
- **componentes**: botões, inputs, cards, tabs, dialogs, tabelas, toolbars e estados;
- **composição de página**: ordem, proporção e prioridade das secções;
- **features**: Dashboard, Despesas/Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições;
- **domínio**: regras financeiras, Mercado, persistência, sync e segurança fora das camadas visuais.

Não criar novos ficheiros “patch” para assumir uma propriedade já pertencente a outra camada.

## 8. Shell móvel — `76-mobile-shell2`

Em ≤820 px, `v76-mobile-shell.css` é a única autoridade da geometria global:

- scroll principal no documento;
- `.app-shell` com `min-height:100dvh`, sem clipping;
- `.main` sem scroll container paralelo;
- `.topbar` no fluxo normal e com `safe-area-inset-top`;
- páginas com reserva inferior para o dock;
- `.mobile-nav` persistente com `safe-area-inset-bottom`;
- safe areas laterais;
- contratos para 320/360/375/390/430/768/820 px e landscape;
- foco e conteúdo final não ficam escondidos.

## 9. Sistema visual — `76-modern-ui2`

Hierarquia canónica:

- `primary`: única ação dominante;
- `secondary`: ação importante não dominante;
- `danger`: destrutiva;
- `link`: contextual de baixo peso;
- `icon button`: comando compacto com nome acessível.

Contratos:

- baseline de 44 px para controlos principais;
- métricas coerentes de ícones;
- `focus-visible`;
- disabled/`aria-disabled` consistente;
- hover apenas para ponteiro fino;
- reduced-motion e forced-colors preservados;
- grids com `min-width:0` para evitar overflow.

Fotografias do Mercado usam `contain`/centro/fallback sem alterar SKU, preço ou total.

## 10. Composição de produto — `76-product-pages1`

`v76-product-pages.css` traduz a direção dos protótipos para o DOM real, sem inventar domínio.

Dashboard desktop:

1. `Saldo atual` como resumo principal;
2. `Por pagar`, `Em atraso`, `Saldo projetado`;
3. alertas condicionais;
4. `Pago no mês`, `Próximos 7 dias`;
5. vencimentos + orçamento;
6. atividade + categorias.

Dashboard mobile:

1. resumo principal;
2. KPIs compactos;
3. métricas secundárias;
4. vencimentos;
5. orçamento;
6. categorias;
7. atividade.

A camada pode definir `order`, grids internos, densidade e ênfase, mas não viewport, safe areas, scroll global, topbar estrutural, dock ou regras de negócio.

## 11. Direção das restantes páginas

- **Mercado:** pesquisa, filtros, catálogo/lista, carrinho, quantidade/preço/estado; total continua `Estimativa` até evidência completa; comparação de preços só com fonte válida.
- **Planeamento:** trabalhar apenas com saldo atual, saldo inicial, orçamento e rendimentos existentes até novas capacidades serem implementadas formalmente.
- **Calendário:** vencimentos/pagamentos atuais; não transformar automaticamente em agenda genérica.
- **Faturas:** pesquisa, filtros, estado, ordenação, tabela desktop/lista mobile; “Nova fatura” como ação principal; sem mudar pagamentos/vencimentos.

## 12. Responsive, acessibilidade e temas

- mobile-first;
- reflow funcional a 320 CSS px;
- sem scroll horizontal global;
- safe areas apenas no shell;
- pinch-to-zoom preservado;
- 44×44 CSS px como baseline de toque;
- foco não oculto por header/dock;
- inputs compatíveis com Safari/iPhone;
- portrait, landscape, teclado virtual, Light/Dark/System fazem parte do QA;
- contraste/estado não dependem apenas de cor.

## 13. Segurança

UI e migração TypeScript não podem enfraquecer:

- PIN/palavra-passe não persistidos;
- PBKDF2/AES-GCM;
- isolamento do cofre;
- sync cifrada;
- validação de QR/importações;
- CSP;
- ausência de segredos no repositório.

## 14. QA e gates

Toda mudança transversal deve manter verdes:

- finanças e invariantes de contagem;
- isolamento/cofre e datas civis;
- faturas/formulários/QR;
- Mercado/SKU/imagens/scanner;
- responsive/mobile;
- navegação/acessibilidade;
- sync/conflitos;
- PWA/manifesto/cache;
- TypeScript strict;
- `tests/ui-architecture-contract.test.cjs`;
- `tests/v76-product-pages.test.cjs` nas páginas migradas.

## 15. Estratégia de migração de código

Ordem vigente:

1. pipeline de compilação TS e prova de substituição;
2. funções puras de dinheiro/datas/quantidades;
3. domínio financeiro;
4. Mercado/modelo/carrinho;
5. core/persistência/cifra;
6. sync/conflitos;
7. render/forms/events e UI;
8. Service Worker/build;
9. testes/tooling;
10. remoção final de JavaScript fonte legado.

Cada exclusão de `.js` exige prova de ausência de referências, artefacto TS equivalente e regressões verdes.
