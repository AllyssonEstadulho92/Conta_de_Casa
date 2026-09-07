# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v64`
Candidato em validação: `v65`
Branch pública: `main`
Release integrada: PR #44
Reforço de pipeline integrado: PR #46
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v64 continua a versão pública confirmada**. O PR #44 foi fundido no commit `78612a9701d60938532d7be768ea35f84c36c7fc`; o reforço de deploy manual do PR #46 está integrado no commit `72ee9117ba1383dbcde1ae18729309b07134c144`.

A alteração atual prepara a **v65**, limitada à experiência móvel da **Lista de compras**. Não altera cálculos, scanner, faturas, schema, cofre ou sincronização.

## v65 — Lista de compras focada na execução

Objetivo: reduzir o tempo entre abrir a página e identificar/marcar o próximo produto no supermercado.

A camada `market-shopping-focus.js/.css` é exclusivamente de apresentação e reutiliza os nós e handlers já existentes. No mobile até 820 px:

- o topo da página mostra um resumo compacto: itens por comprar, itens comprados e total previsto;
- os quatro cartões financeiros completos deixam o primeiro viewport e ficam acessíveis em **Resumo financeiro**;
- o botão `+` do topbar, quando Compras está ativa, reutiliza `#newMarketBtn` e abre diretamente o fluxo existente de adicionar produto;
- o botão `+ Adicionar item` da própria página fica oculto apenas no mobile, evitando duplicação;
- Estado, Categoria e Ordenar tornam-se controlos compactos; **Limpar filtros** aparece apenas quando pesquisa/filtros/ordenação diferem do padrão;
- categorias com itens pendentes permanecem abertas e mostram a contagem por comprar;
- itens comprados são reunidos numa secção **Comprados** fechada por padrão;
- cada cartão prioriza checkbox, nome, quantidade e preço; valores secundários, preço real, edição e eliminação ficam sob **Detalhes**.

Desktop mantém a tabela e o resumo financeiro completo existentes.

## Risco e compatibilidade da v65

Risco funcional esperado: baixo, porque a nova camada não escreve em `appState` nem chama `commit()`/`saveState()`. O risco principal é visual/DOM no mobile: ordem de MutationObservers, rotação de viewport, acessibilidade dos detalhes e coexistência com `market-category-groups.js`.

A publicação usa build `v65`, revisão `65-shopping1`, mantendo `64-ui1` e `64-runtime1` inalterados. O Service Worker recebe cache distinto para obrigar atualização segura dos novos assets.

## Pipeline de publicação

`.github/workflows/ci.yml` e `.github/workflows/pages.yml` passam a validar também:

- `node --check market-shopping-focus.js`;
- `node tests/market-shopping-focus.test.cjs`.

O teste cobre ação contextual do `+`, resumo compacto, filtros, secção Comprados recolhida, detalhes por item, ausência de mutação financeira, ordem dos assets e presença no bundle/Service Worker.

A CI e a publicação da v65 ainda precisam de ser confirmadas após criação do PR e integração.

## v64 — estado preservado

### Cabeçalho móvel

A v64 mantém o cabeçalho móvel fixo ao viewport, respeita `safe-area-inset-top`, compensa o conteúdo com `padding-top` e uniformiza título, menu, botão `+`, Sync e fundo entre Início, Faturas, Lista de compras e Relatórios.

### Código de barras e preço

O fluxo usa o scanner existente para identificar GTIN/EAN/UPC e o catálogo real do Mercado para obter preço. A automatização só adiciona sem confirmação quando existe exatamente um supermercado selecionado, loja/nome/marca/embalagem são compatíveis, a melhor correspondência atinge confiança mínima de `0.84` e existe margem mínima de `0.10` para a segunda correspondência.

Se o mesmo GTIN pendente for lido novamente, a quantidade é incrementada. O preço pesquisado atualiza apenas `estimatedCents`; `actualCents` continua reservado ao preço efetivamente confirmado.

### Faturas recorrentes

Novas ocorrências recorrentes são criadas como **Por preencher**: mantêm descrição, fornecedor, categoria, método, recorrência e vencimento previsto, começam com `totalCents = 0` e não herdam referência, observações nem data de emissão. Só entram como fatura financeira normal depois de o utilizador preencher e guardar o novo valor.

A migração preserva faturas com pagamentos, canceladas, arquivadas ou já editadas.

## Segurança e privacidade

A v65 não altera PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM, armazenamento IndexedDB do cofre, credenciais de sincronização, pagamentos/faturas confirmados nem a separação entre `estimatedCents` e `actualCents`.

Não foram identificados segredos incorporados no código nesta revisão. Permanece como dívida técnica de segurança a dependência runtime do scanner em `@zxing/browser` carregado de `unpkg.com`; deve ser avaliada numa release dedicada para auto-hospedagem e/ou integridade verificável.

## Validação física ainda pendente

- v65 / Lista de compras: 320, 375, 390 e 430 px; resumo compacto, filtros, grupos pendentes, Comprados recolhido, Detalhes e botão `+` contextual;
- iPhone/Safari: Início, Faturas, Compras e Relatórios; topo inicial, scroll longo, retorno ao topo, rotação e chrome do navegador expandido/recolhido;
- scanner com produtos reais, EAN-8/EAN-13, baixa luz, código repetido e produto ambíguo;
- passagem real de uma fatura recorrente para o mês seguinte em estado **Por preencher**;
- VoiceOver/TalkBack, tema claro/escuro e tablet/desktop;
- atualização v64 → v65 pelo Centro de Atualização após publicação.

## Última alteração

Preparada a v65 para tornar a Lista de compras móvel mais direta: resumo compacto, filtros menores, um único `+`, pendentes em primeiro plano, comprados recolhidos e detalhes financeiros progressivos, sem alteração do estado financeiro.

## Próximo passo

1. criar PR da v65 e obter CI verde;
2. rever o diff final e integrar apenas com CI verde;
3. confirmar CI de `main` e Deploy GitHub Pages;
4. sincronizar a documentação para marcar v65 como pública;
5. concluir validação física no iPhone/Android e manter ZXing para release de segurança separada.
