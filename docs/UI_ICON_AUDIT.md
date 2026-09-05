# Auditoria Visual de Ícones — Conta de Casa

Data: 5 de setembro de 2026
Âmbito: aplicação completa, sem alteração de estrutura, rotas, dados ou regras financeiras.

## Evidência que originou a revisão

Em Safari/iPhone, o ícone de pesquisa do diálogo **Adicionar produto** foi observado parcialmente cortado: apenas parte da circunferência e da haste da lupa ficavam visíveis.

## Constatações técnicas

A aplicação tinha três padrões visuais em simultâneo:

1. registo SVG principal em `core.js` através de `ICONS` / `icon()`;
2. glifos Unicode usados diretamente no HTML para casa, privacidade, bloqueio, tema, expansão e fecho;
3. pequenos registos SVG locais em módulos contextuais, nomeadamente Mercado e leitor de código de barras.

O CSS base contém uma regra global de conteúdo multimédia com `svg { height:auto }`. Embora útil para SVGs de conteúdo, essa regra não é adequada para ícones de interface com caixa fixa. Em combinação com grelhas compactas e rendering SVG do Safari/iOS, existia uma superfície real para dimensões inconsistentes. O novo sistema força largura e altura explícitas para todos os SVGs de interface e inclui uma regra específica para o ícone de pesquisa do Mercado.

## Decisão de design

Não foi adicionada uma fonte externa de ícones. A aplicação passa a usar um **registo SVG local e único**, carregado por `ui-icons.js`, porque:

- preserva funcionamento offline dos ícones;
- elimina diferenças de glifos/emoji entre iOS, Android, Windows e macOS;
- não adiciona pedidos a terceiros, cookies ou fontes remotas;
- mantém CSP e privacidade mais simples;
- reutiliza a infraestrutura `ICONS` já existente, evitando reestruturação.

Os ícones usam `viewBox 0 0 24 24`, `currentColor`, `stroke-width 1.8`, terminais arredondados e caixas de 16/20/24/28 px conforme o contexto.

## Elementos normalizados

- marca Casa;
- navegação desktop, drawer e barra móvel;
- menu hambúrguer;
- faturas, planeamento, mercado, relatórios, objetivos, segurança e definições;
- privacidade visível/oculta;
- bloqueio;
- tema claro/escuro;
- notificações;
- adicionar;
- fechar/voltar/expandir;
- teclado de PIN;
- pesquisa e limpar pesquisa;
- leitor de código de barras e lanterna;
- atalhos do diálogo Adicionar;
- novos controlos do leitor QR de faturas.

## Movimento

A animação foi limitada a estados que comunicam atividade:

- ponto de sincronização enquanto sincroniza;
- badge de alerta quando existe;
- linha de leitura nos scanners;
- rotação do indicador de expansão;
- microdeslocamento de ícones em hover apenas quando existe rato/pointer fino.

`prefers-reduced-motion: reduce` desativa as animações não essenciais.

## O que não foi alterado

- gráficos, barras de progresso e estatísticas permanecem componentes de dados, não foram convertidos em ícones;
- não foram alterados schema, IndexedDB, cifragem, PIN, backups ou sincronização;
- não foram alteradas rotas nem a hierarquia das páginas;
- os textos e ações continuam a ser a fonte semântica para leitores de ecrã; SVGs decorativos usam `aria-hidden`.

## Validação necessária em hardware

A correção dimensional é coberta por testes de fonte/CSS, mas deve ser confirmada fisicamente em Safari/iPhone, sobretudo no campo **Pesquisar produto real**, em 320, 375, 390 e 430 px.
