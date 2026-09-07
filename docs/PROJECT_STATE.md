# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v64`
Branch pública: `main`
Release integrada: PR #44
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v64 está integrada em `main` e publicada**. O PR #44 foi fundido no commit `78612a9701d60938532d7be768ea35f84c36c7fc`. A CI do `main` para esse commit terminou com sucesso e o GitHub Pages publicou a mesma revisão com sucesso. `release-manifest.json` anuncia `latestVersion = v64`.

## Auditoria atual — pipeline de publicação

Foi identificado um desfasamento no workflow `.github/workflows/pages.yml`: o caminho automático de publicação depende de CI verde, mas o workflow também admite `workflow_dispatch`. A validação repetida pelo próprio deploy não incluía a verificação de sintaxe de `v64-runtime.js` nem `tests/v64-runtime.test.cjs`, apesar de ambos fazerem parte da CI normal.

Na branch `fix/v64-release-audit`, o passo **Verify tested revision** do Pages passa a executar também:

- `node --check v64-runtime.js`;
- `node tests/v64-runtime.test.cjs`.

Isto reduz a diferença entre o caminho automático e um redeploy manual e impede que uma publicação manual ignore precisamente as regressões específicas introduzidas pela v64.

## v64 — cabeçalho móvel

As capturas reais de 7 de setembro tinham confirmado dois problemas: corte parcial da primeira linha durante scroll em Safari/iPhone e uma geometria diferente do cabeçalho em **Lista de compras**. A v64 publicada mantém o cabeçalho móvel fixo ao viewport, respeita `safe-area-inset-top`, compensa o conteúdo com `padding-top` e uniformiza título, menu, botão `+`, Sync e fundo entre Início, Faturas, Lista de compras e Relatórios.

A validação física final no iPhone após instalação da v64 continua pendente; CI não substitui teste tátil/visual real.

## v64 — código de barras e preço

O fluxo usa o scanner existente para identificar GTIN/EAN/UPC e o catálogo real do Mercado para obter preço. A automatização só adiciona sem confirmação quando existe exatamente um supermercado selecionado, loja/nome/marca/embalagem são compatíveis, a melhor correspondência atinge confiança mínima de `0.84` e existe margem mínima de `0.10` para a segunda correspondência.

Se o mesmo GTIN pendente for lido novamente, a quantidade é incrementada. O preço pesquisado atualiza apenas `estimatedCents`; `actualCents` continua reservado ao preço efetivamente confirmado.

## v64 — faturas recorrentes

Novas ocorrências recorrentes são criadas como **Por preencher**: mantêm descrição, fornecedor, categoria, método, recorrência e vencimento previsto, começam com `totalCents = 0` e não herdam referência, observações nem data de emissão. Só entram como fatura financeira normal depois de o utilizador preencher e guardar o novo valor.

A migração preserva faturas com pagamentos, canceladas, arquivadas ou já editadas.

## Segurança e privacidade

A v64 não altera PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM, armazenamento IndexedDB do cofre, credenciais de sincronização, pagamentos/faturas confirmados nem a separação entre `estimatedCents` e `actualCents`.

Não foram identificados segredos incorporados no código nesta revisão. Permanece como dívida técnica de segurança a dependência runtime do scanner em `@zxing/browser` carregado de `unpkg.com`; deve ser avaliada numa release dedicada para auto-hospedagem e/ou integridade verificável, sem alterar a funcionalidade atual sem teste.

## Qualidade e testes

Confirmado para a v64 publicada:

- PR #44 integrado em `main`;
- CI do `main` concluída com sucesso;
- Deploy GitHub Pages concluído com sucesso;
- testes de finanças, auditoria, contagens, isolamento do cofre, datas, faturas, QR, Mercado, scanner, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização executados pela CI;
- `tests/v64-runtime.test.cjs` cobre scanner, recorrência e safe area no pipeline normal.

A correção atual do pipeline de Pages ainda necessita de CI verde na respetiva branch antes de integração.

## Validação física ainda pendente

- iPhone/Safari: Início, Faturas, Compras e Relatórios; topo inicial, scroll longo, retorno ao topo, rotação e chrome do navegador expandido/recolhido;
- scanner com produtos reais, EAN-8/EAN-13, baixa luz, código repetido e produto ambíguo;
- passagem real de uma fatura recorrente para o mês seguinte em estado **Por preencher**;
- VoiceOver/TalkBack, tema claro/escuro e tablet/desktop;
- atualização v63 → v64 pelo Centro de Atualização num dispositivo que ainda tenha a v63.

## Última alteração

Auditoria pós-publicação da v64: estado documental sincronizado com o GitHub real e reforço do caminho de deploy manual para executar também as verificações específicas de `v64-runtime.js`.

## Próximo passo

1. obter CI verde para `fix/v64-release-audit`;
2. integrar a correção do workflow apenas com testes verdes;
3. confirmar novamente CI/Pages após integração;
4. concluir a validação física da v64 em iPhone e scanner real;
5. tratar a dependência externa ZXing numa release de segurança separada.