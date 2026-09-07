# Changelog Técnico — Conta de Casa

## 2026-09-07 — candidata v65: Lista de compras focada no supermercado

### Objetivo

Reduzir densidade e duplicação no mobile sem tocar no modelo financeiro. A tarefa primária passa a ser encontrar o próximo produto e marcá-lo rapidamente.

### Alterado — apresentação móvel

- criado `market-shopping-focus.js/.css` como camada de apresentação isolada;
- resumo inicial compacto: por comprar, comprados e total previsto;
- detalhes financeiros completos disponíveis em **Resumo financeiro**;
- `#marketSummary` grande fica oculto apenas no mobile;
- `+` do topbar passa a reutilizar `#newMarketBtn` quando Compras está ativa;
- botão `+ Adicionar item` da página fica oculto apenas no mobile;
- Estado, Categoria e Ordenar usam apresentação compacta;
- **Limpar filtros** só aparece quando pesquisa/filtros/ordenação estão ativos;
- categorias com itens pendentes permanecem abertas;
- itens comprados são movidos apenas no DOM para **Comprados**, fechado por padrão;
- cartões móveis mostram primeiro checkbox, nome, quantidade e preço;
- preço real, diferença, editar e eliminar permanecem disponíveis em **Detalhes**.

### Segurança e dados

- nenhuma alteração de `STATE_VERSION`;
- nenhuma escrita nova em `appState` pela camada v65;
- `estimatedCents`, `actualCents`, quantidade, scanner, faturas, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB e sincronização permanecem inalterados;
- os mesmos nós e handlers existentes são reutilizados para adicionar/editar/eliminar e introduzir preço real.

### Versionamento e QA

- build candidato: `v65`;
- revisão: `65-shopping1`;
- runtime existente preservado: `64-runtime1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1`;
- `release-manifest.json` passa a anunciar v65 na branch candidata;
- criado `tests/market-shopping-focus.test.cjs`;
- CI e Pages verificam sintaxe e regressão da nova camada.

### Estado

Implementação preparada; CI, integração em `main`, publicação Pages e validação física ainda pendentes.

## 2026-09-07 — auditoria pós-publicação v64

### Estado confirmado

- PR #44 integrado em `main`;
- merge público da v64: `78612a9701d60938532d7be768ea35f84c36c7fc`;
- build público: `v64`;
- `release-manifest.json`: `latestVersion = v64` no estado público anterior à candidata v65.

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
- Deploy GitHub Pages run #1087: **sucesso**.

## 2026-09-07 — v64 publicada: auditoria móvel, scanner conservador e ciclo recorrente limpo

- PR #44 integrado;
- build `v64`, revisão visual `64-ui1`, runtime `64-runtime1`;
- safe area/cabeçalho móvel uniformizados;
- scanner exige correspondência conservadora e mantém preço pesquisado em `estimatedCents`;
- GTIN repetido pendente incrementa quantidade;
- novas ocorrências recorrentes começam **Por preencher** sem herdar valores variáveis;
- cofre, PIN e dados financeiros cifrados preservados.

## 2026-09-06 — v63 publicada: consistência visual e atualização controlada (`63-ui2`)

- PR #42 integrado em `main`;
- merge: `1a034c84976c042e0433d016a5628feaa339a7a6`;
- CI e Deploy GitHub Pages: sucesso;
- criado `ui-consistency.css` como camada final de apresentação;
- Lucide permanece sistema vetorial oficial;
- navegação inferior mantém um único indicador ativo;
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
