# Changelog Técnico — Conta de Casa

## 2026-09-07 — auditoria pós-publicação v64

### Estado confirmado

- PR #44 integrado em `main`;
- merge público da v64: `78612a9701d60938532d7be768ea35f84c36c7fc`;
- build público: `v64`;
- `release-manifest.json`: `latestVersion = v64`.

### Corrigido — gate de redeploy manual

A auditoria pós-publicação identificou que `.github/workflows/pages.yml` admite `workflow_dispatch`, mas o passo local **Verify tested revision** não repetia duas verificações específicas da v64 que já existiam na CI normal.

Foram adicionados:

- `node --check v64-runtime.js`;
- `node tests/v64-runtime.test.cjs`.

A alteração não toca em dados, cifragem, finanças, scanner ou UI; reforça apenas a segurança do caminho de publicação manual.

### Integração e validação

- correção integrada através do PR #46;
- commit: `72ee9117ba1383dbcde1ae18729309b07134c144`;
- CI de `main` run #1094: **sucesso**;
- Deploy GitHub Pages run #1087: **sucesso**;
- o runtime específico da v64 passa a ser verificado tanto na CI como no gate do próprio deploy.

### Documentação

PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG ficam sincronizados com o estado efetivo após integração. Permanece pendente a validação física final em iPhone/Safari, scanner real e ciclo recorrente mensal.

## 2026-09-07 — v64 publicada: auditoria móvel, scanner conservador e ciclo recorrente limpo

### Publicação

- branch de desenvolvimento: `feature/v64-scanner-billing-safearea`;
- PR #44 integrado;
- build: `v64`;
- revisão visual: `64-ui1`;
- runtime: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1`.

### Auditoria iPhone/Safari

As capturas reais expuseram dois problemas no topo móvel: corte durante scroll devido à combinação de `.main` como scroller interno com `.topbar` sticky, e cabeçalho de Compras diferente das restantes páginas por regras históricas `market-prototype-active`.

A v64:

- reforça `safe-area-inset-top` com folga tátil mínima;
- usa `position:fixed` no cabeçalho móvel;
- compensa o conteúdo com `padding-top` em `.main`;
- uniformiza título, menu, botão `+`, Sync e fundo do topbar entre páginas principais;
- desativa carrinho pseudo-elemento e chevron exclusivos de Compras;
- preserva scroller interno, bottom navigation, teclado e diálogos.

### Código de barras / Compras

- exige exatamente um supermercado selecionado para auto-adição precisa;
- compara GTIN identificado com resultados reais da loja por nome/marca e embalagem;
- auto-adição apenas com score mínimo `0.84` e margem mínima `0.10`;
- rejeita embalagem/multipack incompatível;
- ambiguidade exige confirmação manual;
- GTIN repetido pendente incrementa quantidade;
- preço encontrado atualiza `estimatedCents` e nunca `actualCents` automaticamente.

### Faturas recorrentes

- novas ocorrências automáticas passam a **Por preencher**;
- mantêm descrição, fornecedor, categoria, método, recorrência e vencimento previsto;
- não herdam valor, referência, observações nem data de emissão;
- drafts não entram em pendentes/atrasos;
- ao preencher e guardar regressam ao fluxo financeiro normal;
- migração preserva ocorrências com pagamentos, canceladas, arquivadas ou já editadas.

### Segurança e dados

- `STATE_VERSION = 5` preservado;
- PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM e IndexedDB inalterados;
- nenhuma credencial/token/chave adicionada pela release;
- atualização continua same-origin e controlada por **Atualizar agora**.

### Testes

- `tests/v64-runtime.test.cjs` cobre confiança/ambiguidade do scanner, GTIN repetido, separação estimado/real, drafts recorrentes e safe area;
- regressões de finanças, segurança, Mercado, atualização, responsividade, acessibilidade e sincronização permanecem na CI;
- validação física da v64 em hardware real continua pendente.

## 2026-09-06 — v63 publicada: consistência visual e atualização controlada (`63-ui2`)

- PR #42 integrado em `main`;
- merge: `1a034c84976c042e0433d016a5628feaa339a7a6`;
- CI e Deploy GitHub Pages: sucesso;
- criado `ui-consistency.css` como camada final de apresentação;
- Lucide permanece sistema vetorial oficial;
- navegação inferior mantém um único indicador ativo;
- cartões-resumo mantêm faixa sólida;
- criado `release-manifest.json` e Centro de Atualização controlado por Service Worker.

## 2026-09-06 — Lista de compras agrupada por categoria (`62-ui3`)

- PR #40 integrado com CI verde;
- criado `market-category-groups.js/.css`;
- mobile usa grupos por categoria; desktop mantém tabela e separadores;
- handlers e schema financeiro preservados.

## 2026-09-06 — Hotfix iPhone/Safari do Mercado e conflitos técnicos (`62-ui2`)

- PR #38 integrado com CI/Pages verdes;
- corrigida coluna fantasma no browser de produtos;
- preço reflui abaixo de 360 px;
- `sync-conflict-policy.js` separa metadados técnicos de conflitos financeiros.

## 2026-09-06 — Identidade visual do Mercado sem fotografias (`62-ui2`)

- Mercado passa a `text-first`;
- fotografias/placeholder deixam de ocupar espaço principal;
- câmara permanece para leitura GTIN/EAN/UPC;
- módulos históricos de imagem permanecem temporariamente por compatibilidade.

## 2026-09-06 — v62/v61/v60

- política histórica de imagens official-only por cadeia/SKU;
- bridge de imagens oficiais por identificador exato;
- catálogo ampliado com validação de URL/CDN.

## 2026-09-05 — v59/v58

- miniaturas ampliáveis e pesquisa auxiliar por Open Facts;
- criado Centro de Atualização inicial em Definições.

## Base funcional anterior

- cofre local cifrado com PBKDF2-SHA-256 + AES-GCM;
- IndexedDB para estado privado;
- Lucide como sistema de ícones local;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço via `cesta.pt`;
- `estimatedCents` e `actualCents` separados.