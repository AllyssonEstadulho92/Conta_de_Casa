# Changelog Técnico — Conta de Casa

## 2026-09-07 — v65 publicada: Lista de compras focada no supermercado

### Objetivo

Reduzir densidade e duplicação no mobile sem tocar no modelo financeiro. A tarefa primária passa a ser encontrar o próximo produto e marcá-lo rapidamente.

### Alterado — apresentação móvel

- criado `market-shopping-focus.js/.css` como camada de apresentação isolada;
- resumo inicial compacto: por comprar, comprados e total previsto;
- detalhes financeiros completos disponíveis em **Resumo financeiro**;
- `#marketSummary` grande fica oculto apenas no mobile;
- `+` do topbar reutiliza `#newMarketBtn` quando Compras está ativa;
- botão de adição duplicado da página fica oculto apenas no mobile;
- Estado, Categoria e Ordenar usam apresentação compacta;
- **Limpar filtros** só aparece quando pesquisa/filtros/ordenação estão ativos;
- categorias com itens pendentes permanecem abertas;
- itens comprados são movidos apenas no DOM para **Comprados**, fechado por padrão;
- cartões móveis mostram primeiro checkbox, nome, quantidade e preço;
- preço real, diferença, editar e eliminar permanecem disponíveis em **Detalhes**;
- desktop permanece com tabela, filtros e resumos completos.

### Segurança e dados

- `STATE_VERSION = 5` preservado;
- nenhuma escrita nova em `appState` pela camada v65;
- `estimatedCents`, `actualCents`, quantidade, scanner, faturas, PIN, PBKDF2-SHA-256, AES-GCM, IndexedDB e sincronização permanecem inalterados;
- os mesmos nós e handlers existentes são reutilizados para adicionar/editar/eliminar e introduzir preço real;
- nenhum segredo, token ou chave foi adicionado.

### Versionamento

- build público: `v65`;
- revisão de Compras: `65-shopping1`;
- runtime preservado: `64-runtime1`;
- revisão visual preservada: `64-ui1`;
- cache: `conta-de-casa-public-v64-runtime1-v65-shopping1`;
- `release-manifest.json`: `latestVersion = v65`.

### QA e correção de integração

A primeira validação revelou duas expectativas antigas de build `v64` em testes legados de imagens. Foram alinhados `tests/market-image-audit.test.cjs` e `tests/market-official-images.test.cjs` para a versão pública v65, mantendo `v64-runtime.js`/`64-runtime1` inalterados.

Depois da correção:

- CI do PR #48 run #1110: **sucesso**;
- PR #48 integrado em `main`;
- commit de integração: `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`;
- CI de `main` run #1111: **sucesso**;
- Deploy GitHub Pages run #1104: **sucesso**.

A matriz validou finanças, auditoria, invariantes, cofre, datas, formulários, QR, Mercado, imagens legadas, scanner, contabilidade, runtime v64, camada v65, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

### Estado

v65 integrada e publicada. Permanece pendente validação física em iPhone/Safari e Android, scanner real, recorrência mensal real, acessibilidade em hardware e atualização v64 → v65 no dispositivo.

## 2026-09-07 — auditoria pós-publicação v64

### Estado confirmado

- PR #44 integrado em `main`;
- merge público da v64: `78612a9701d60938532d7be768ea35f84c36c7fc`;
- build público anterior: `v64`;
- reforço de pipeline integrado pelo PR #46.

### Corrigido — gate de redeploy manual

A auditoria pós-publicação identificou que `.github/workflows/pages.yml` admite `workflow_dispatch`, mas o passo local **Verify tested revision** não repetia duas verificações específicas da v64 que já existiam na CI normal.

Foram adicionados:

- `node --check v64-runtime.js`;
- `node tests/v64-runtime.test.cjs`.

### Integração e validação

- PR #46 integrado;
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
