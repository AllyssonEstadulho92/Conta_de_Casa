# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v65`
Branch pública: `main`
Release integrada: PR #48
Reforço de pipeline integrado: PR #46
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v65 está integrada e publicada**. O PR #48 foi fundido em `main` no commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`. A CI do PR terminou verde na run #1110; a CI de `main` terminou com sucesso na run #1111; o Deploy GitHub Pages terminou com sucesso na run #1104.

A publicação usa build `v65`, revisão `65-shopping1`, preservando `64-ui1` e `64-runtime1`. O cache do Service Worker é `conta-de-casa-public-v64-runtime1-v65-shopping1`.

## v65 — Lista de compras focada na execução

Objetivo: reduzir o tempo entre abrir a página e identificar/marcar o próximo produto no supermercado.

A camada `market-shopping-focus.js/.css` é exclusivamente de apresentação e reutiliza os nós e handlers já existentes. No mobile até 820 px:

- o topo da página mostra um resumo compacto: itens por comprar, itens comprados e total previsto;
- os quatro cartões financeiros completos ficam acessíveis em **Resumo financeiro**;
- o botão `+` do topbar, quando Compras está ativa, reutiliza `#newMarketBtn` e abre diretamente o fluxo existente de adicionar produto;
- o botão de adição duplicado da própria página fica oculto apenas no mobile;
- Estado, Categoria e Ordenar usam controlos compactos; **Limpar filtros** aparece apenas quando pesquisa/filtros/ordenação diferem do padrão;
- categorias com itens pendentes permanecem abertas;
- itens comprados são reunidos numa secção **Comprados** fechada por padrão;
- cada cartão prioriza checkbox, nome, quantidade e preço; informação financeira secundária e ações ficam em **Detalhes**.

Desktop mantém a tabela, separadores de categoria, pesquisa/filtros e resumo financeiro completo.

## Correção de CI durante a integração

A primeira validação da v65 expôs expectativas antigas de build `v64` em testes legados de imagens. Foram alinhados `tests/market-image-audit.test.cjs` e `tests/market-official-images.test.cjs` para o build `v65`, mantendo o runtime funcional `v64-runtime1` inalterado. Não houve alteração de código financeiro ou de produção para resolver essas falhas.

Depois da correção, toda a matriz de CI passou: finanças, auditoria, invariantes, cofre, datas, formulários, QR, Mercado, imagens legadas, scanner, contabilidade da lista, runtime v64, camada v65, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

## Segurança e compatibilidade

A v65 não altera PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM, armazenamento IndexedDB, credenciais de sincronização, pagamentos/faturas, `estimatedCents`, `actualCents`, scanner ou recorrências.

Não foram adicionados segredos, tokens ou chaves. Permanece dívida técnica a dependência runtime `@zxing/browser` carregada de `unpkg.com`; a decisão entre auto-hospedagem local ou integridade verificável deve ser tratada numa release de segurança dedicada.

## Validação física ainda pendente

- iPhone/Safari: 320, 375, 390 e 430 px; portrait/landscape; primeiro viewport, scroll longo, rotação e browser chrome;
- Lista de compras: resumo compacto, filtros, grupos pendentes, **Comprados**, **Detalhes** e `+` contextual;
- scanner real: EAN-8/EAN-13, baixa luz, código inválido, repetido e ambíguo;
- faturas: passagem real para o mês seguinte em estado **Por preencher**;
- QR fiscal: permissões e encerramento dos tracks de câmara;
- VoiceOver/TalkBack, tema claro/escuro e tablet/desktop;
- num dispositivo com v64, confirmar deteção/instalação da v65 pelo Centro de Atualização.

## Última alteração

Publicada a v65 com a Lista de compras móvel simplificada e com a cobertura de CI legada alinhada ao novo número de build. CI de `main` e GitHub Pages estão verdes para o commit de integração.

## Próximo passo

1. concluir validação física da v65 em iPhone/Safari e Android;
2. validar scanner e recorrências em hardware/uso real;
3. tratar a dependência ZXing externa numa release de segurança separada;
4. evitar novas alterações de arquitetura até a validação física confirmar ausência de regressões.
