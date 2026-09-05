# Auditoria Visual de Ícones — Conta de Casa

Data: 5 de setembro de 2026
Âmbito: aplicação completa, sem alteração de estrutura, rotas, dados ou regras financeiras.

## Evidência

Duas capturas reais de Safari/iPhone expuseram problemas diferentes:

1. no diálogo **Adicionar produto**, a lupa apareceu parcialmente cortada;
2. na página **Faturas**, a pesquisa mostrou uma lupa com aparência nativa/desproporcional, os filtros mostraram setas nativas duplas e o botão compacto de nova fatura apresentou mais de um símbolo.

A segunda captura permitiu confirmar que o problema não era apenas a geometria do SVG: existia mistura entre ícones da aplicação, decoração nativa do browser e pseudo-elementos CSS legados.

## Constatações técnicas

Antes desta revisão coexistiam:

- `ICONS` / `icon()` em `core.js`;
- SVGs próprios em módulos contextuais;
- glifos Unicode no HTML/JS;
- decoração nativa de `input[type="search"]` no Safari;
- setas nativas dos `select`;
- `::before` com `content:"+"` nos botões mobile de Faturas/Mercado;
- a camada SVG anterior, que podia acrescentar outro símbolo ao mesmo botão.

O CSS base também contém `svg { height:auto }`, pelo que ícones de interface exigem caixas explícitas para não herdarem comportamento pensado para imagens/conteúdo responsivo.

## Biblioteca escolhida

Foi escolhida **Lucide Icons** como linguagem visual oficial.

Snapshot de referência:

`94e4cb9d9db5907053ebf3636a97c45529cf776b`

A aplicação não carrega Lucide por CDN, NPM ou Web Font em runtime. Apenas os vetores necessários são mantidos em `ui-icons.js`.

### Motivos

- linguagem linear e moderna adequada à interface atual;
- geometria 24×24 consistente;
- boa legibilidade em 16–24 px;
- fácil adaptação por `currentColor`;
- funcionamento offline;
- nenhuma nova origem CSP ou tracking;
- permite preservar a API `icon()` existente e evitar reestruturação das páginas.

Material Symbols, Font Awesome e Bootstrap Icons são tecnicamente adequados, mas não trazem vantagem suficiente para justificar nova dependência/font runtime. Flaticon e Iconfinder são catálogos de ativos úteis, mas misturar famílias/licenças reduziria a coerência e tornaria a manutenção mais difícil.

## Licença

O subset é associado ao commit Lucide fixo e o bundle público inclui `LUCIDE_LICENSE.txt` com:

- licença ISC do Lucide;
- aviso MIT aplicável aos ícones derivados de Feather.

## Sistema final

Os ícones funcionais usam:

- `viewBox 0 0 24 24`;
- `stroke-width: 2`;
- `stroke-linecap: round`;
- `stroke-linejoin: round`;
- `currentColor`;
- dimensões explícitas de 16/20/24/28 px;
- `vector-effect: non-scaling-stroke` onde necessário.

## Elementos normalizados

- marca e navegação desktop/mobile;
- menu hambúrguer;
- Home, Faturas, Planeamento, Mercado, Relatórios, Objetivos, Segurança e Definições;
- privacidade, bloqueio e tema;
- notificações e sincronização;
- adicionar, editar, eliminar, duplicar, pagar e filtros;
- fechar, voltar e expansão;
- teclado de PIN;
- pesquisa comum e pesquisa do Mercado;
- selects/filtros;
- leitores de código de barras e QR de faturas;
- câmara, imagem e lanterna;
- ações rápidas e botões dinâmicos.

## Correções específicas da captura de Faturas

### Pesquisa

A decoração `::-webkit-search-decoration` é removida e a lupa Lucide é posicionada pela aplicação. O input continua a ser um `input type="search"` real.

### Filtros

O `select` continua nativo e acessível, mas a seta visual do sistema operativo é removida com `appearance:none`. Um único `ChevronDown` Lucide é desenhado no wrapper.

### Botão Nova fatura

Quando a camada Lucide já inseriu `Plus`, os pseudo-elementos `::before` antigos são forçados a `content:none`. Em mobile o rótulo pode ficar visualmente escondido, mas deixa de existir o `+` duplicado/ícone solto observado na imagem.

### Sincronização

O ponto genérico passa a ser um slot contextual: cloud/check, refresh, cloud-off ou warning conforme o estado. A cor continua a reforçar o significado sem ser o único indicador.

## Movimento

Movimento é limitado a estados com significado:

- refresh durante sincronização;
- badge de alerta;
- expansão;
- scanners;
- microfeedback hover apenas com pointer fino.

`prefers-reduced-motion: reduce` desativa o movimento não essencial.

## O que não foi alterado

- gráficos, estatísticas e barras de progresso;
- schema e cálculos financeiros;
- IndexedDB e cofre cifrado;
- PBKDF2/AES-GCM/PIN;
- backups e sincronização de dados;
- rotas, hierarquia de páginas e fluxos funcionais.

## Validação necessária em hardware

Ainda é necessária confirmação física em Safari/iPhone e Android/Chrome. Na página **Faturas** deve ser verificado especificamente:

- exatamente uma lupa dentro da pesquisa;
- exatamente um símbolo `+` no botão compacto;
- exatamente um chevron por filtro;
- nenhum SVG cortado ou desalinhado;
- estados Sync/offline/erro legíveis;
- comportamento em 320, 375, 390 e 430 px, retrato/paisagem e tema claro/escuro.
