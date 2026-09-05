# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build funcional: v53 com revisão visual Lucide v54 em validação
Distribuição: GitHub Pages
Estado da revisão: substituição global da linguagem de ícones por Lucide implementada em branch; sem alteração de estrutura, schema financeiro ou persistência

## Estado atual

A aplicação continua local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5. As áreas Faturas, Planeamento, Mercado, Relatórios, Segurança, Definições, leitura de códigos de barras e captura QR de faturas mantêm os fluxos existentes.

## Revisão visual Lucide

A captura real de iPhone/Safari na página **Faturas** confirmou três problemas de apresentação que a primeira normalização de SVG ainda não resolvia de forma suficiente:

1. a pesquisa podia apresentar uma lupa com aparência/dimensão nativa do Safari em vez da linguagem visual da aplicação;
2. os `select` continuavam a mostrar setas nativas diferentes consoante a plataforma;
3. o botão compacto **Nova fatura** podia apresentar dois símbolos, porque o CSS legado desenhava `+` em `::before` ao mesmo tempo que a camada JavaScript injetava um SVG.

A revisão atual escolhe **Lucide Icons** como biblioteca visual oficial. Não é carregada uma icon font nem um pacote remoto em runtime. Apenas os vetores necessários são incorporados localmente em `ui-icons.js`, preservando `currentColor`, funcionamento offline, CSP e o contrato `icon()` já usado pela aplicação.

Snapshot de referência Lucide: `94e4cb9d9db5907053ebf3636a97c45529cf776b`.

O aviso de licença ISC do Lucide e o aviso MIT aplicável aos ícones derivados de Feather são distribuídos em `LUCIDE_LICENSE.txt`.

## O que foi alterado visualmente

- navegação principal e móvel: Home, Faturas, Planeamento, Compras, Relatórios, Segurança e Definições usam a mesma família visual;
- pesquisa: a lupa nativa do Safari é suprimida e substituída por uma lupa Lucide com caixa fixa;
- filtros: os `select` deixam de depender das setas nativas iOS/Android e recebem um único `ChevronDown` Lucide;
- criação: Faturas, Rendimentos, Mercado e Objetivos usam um único `Plus`; o pseudo-elemento `+` legado é desativado quando o botão já foi iconizado;
- ações: editar, eliminar, duplicar, pagar, limpar filtros, exportar, importar, bloquear e sincronizar passam a usar símbolos semânticos coerentes;
- sincronização: o antigo ponto genérico é transformado num slot de estado com cloud/check, refresh, offline ou warning conforme o estado apresentado;
- privacidade, tema, notificações, diálogos, câmara, QR e lanterna mantêm ícones consistentes;
- gráficos, barras, estatísticas e informação financeira permanecem componentes de dados e não foram alterados.

## Segurança e compatibilidade

A revisão visual não altera `appState`, IndexedDB, schema, cálculos financeiros, PBKDF2, AES-GCM, PIN/palavra-passe, backups, sincronização, fontes de preços ou leitura QR.

O módulo de ícones não contém `fetch`, não contacta CDN de ícones e não requer novas origens na CSP. O subset Lucide é local e o Service Worker recebe um novo nome de cache para evitar que o iPhone mantenha a camada visual anterior.

Os ícones decorativos são gerados com `aria-hidden="true"`. Botões apenas com ícone continuam dependentes dos `aria-label` existentes. Movimento é limitado a estados com significado e `prefers-reduced-motion` desativa animações não essenciais.

## Captura QR de faturas

O fluxo implementado anteriormente permanece inalterado: em **Nova fatura** é possível ler o Código QR fiscal português pela câmara ou por imagem local. A pré-visualização é obrigatória antes do preenchimento. A imagem não é guardada nem enviada e `handleBillSubmit()` continua a ser a única via normal de gravação da fatura.

## Mercado e preços

Pingo Doce e Continente continuam a ser pesquisados através de `cesta.pt`. O leitor EAN/UPC/GTIN identifica produtos através do Open Food Facts e reutiliza a pesquisa existente; não adiciona produtos nem preços automaticamente. Quantidade × preço unitário continua a determinar os subtotais.

## Validação técnica

Foi ampliado `tests/ui-icons.test.cjs` para verificar:

- snapshot Lucide fixo e aviso de licença;
- ausência de dependência remota de ícones;
- espessura e caixa vetorial consistentes;
- decoração Lucide de pesquisas e `select`;
- supressão da lupa nativa do Safari;
- eliminação do `+` duplicado dos botões compactos;
- iconografia contextual da sincronização;
- cobertura de editar/eliminar/filtros e elementos dinâmicos;
- `prefers-reduced-motion`;
- atualização da allowlist de Pages e do cache do Service Worker.

A validação em hardware físico continua obrigatória para confirmar rendering final do Safari/iOS.

## Próximo passo

1. Concluir CI da revisão Lucide e só integrar se todas as suites existentes passarem.
2. Publicar via pipeline normal de GitHub Pages.
3. No iPhone/Safari, repetir exatamente a página **Faturas** da captura enviada e confirmar: uma lupa, um botão `+`, uma seta por seletor e nenhum ícone solto/cortado.
4. Validar 320, 375, 390 e 430 px, claro/escuro, retrato/paisagem.
5. Validar ações de editar/eliminar, sincronização, menu, Mercado, QR e câmara.
6. Depois da validação física, remover gradualmente os glifos Unicode que ainda existem apenas como fallback estático no HTML/JS, sem alterar comportamento.
