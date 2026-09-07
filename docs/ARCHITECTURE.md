# Arquitetura — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v65`
Candidato em validação: `v66`

## Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. A arquitetura é local-first: estado financeiro, regras de negócio, formulários, cifragem e persistência executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

Não existe backend financeiro próprio. Integrações externas do Mercado servem apenas descoberta/identificação de catálogo e preço; não recebem o conteúdo financeiro do cofre.

## Persistência e segurança

- `core.js`: normalização, utilitários, IndexedDB e cifragem;
- cofre: PBKDF2-SHA-256 + AES-GCM;
- valores monetários: inteiros em cêntimos;
- schema base: `STATE_VERSION = 5`;
- sincronização: envelope cifrado opcional via GitHub;
- sem cookies/telemetria financeira;
- segredos e PIN não são incluídos no código público.

## JavaScript principal

- `core.js` — estado, normalização, IndexedDB, cifragem e utilitários;
- `finance.js` — cálculos e invariantes financeiros;
- `render.js` — renderização, navegação e aplicação de tema;
- `forms.js` — formulários, validação e mutações;
- `events.js` — eventos globais, viewport, cofre e Service Worker;
- `sync.js` — sincronização cifrada opcional;
- `sync-conflict-policy.js` — equivalência de negócio do Mercado sem ruído de metadados técnicos;
- `market-experience.js` — catálogo/preço Pingo Doce e Continente através de `cesta.pt`;
- `market-barcode.js` — leitura GTIN/EAN/UPC e identificação de produto;
- `market-category-groups.js` — agrupamento visual base da lista de compras;
- `market-shopping-focus.js` — camada v65 de apresentação móvel;
- `ui-icons.js` — subset Lucide local;
- `invoice-capture.js` — leitura local de QR fiscal;
- `app-update.js` — Centro de Atualização;
- `v64-runtime.js` — correspondência conservadora do scanner e ciclo de faturas recorrentes **Por preencher**.

A candidata v66 não modifica estes fluxos funcionais.

## Camadas CSS e responsabilidade visual

A ordem pública permanece:

1. `styles.css` — base histórica;
2. `design-system.css` — tokens/componentes/layout;
3. `mobile-layout.css` — compatibilidade móvel/Safari;
4. `market-experience.css` — estrutura do Mercado;
5. `market-brand.css` — identidade visual do Mercado;
6. `market-category-groups.css` — agrupamento por categoria;
7. `ui-icons.css` — sistema Lucide;
8. `ui-consistency.css` — consolidação visual global;
9. `v64-runtime.css` — cabeçalho/safe area e, na candidata v66, cor canónica do shell móvel;
10. `market-shopping-focus.css` — ajustes finais da Lista de compras no mobile.

`v64-runtime.css` mantém o nome histórico porque também contém a geometria v64 do cabeçalho e os estados visuais de faturas `draft`. A candidata v66 altera apenas a parte cromática dessa folha e publica-a com revisão independente `66-shell1`. O JavaScript `v64-runtime.js` continua em `64-runtime1`.

## Shell móvel v66

### Causa da diferença branco/azulado

`market-brand.css` contém uma identidade específica do Mercado em desktop e mobile:

```css
html.market-prototype-active .main {
  background: radial-gradient(... azul ...), var(--bg);
}
```

O topbar móvel é `fixed` e usa `left/right: var(--page-gutter)`. Como o fundo radial pertence a `.main`, esse fundo continuava visível nas margens laterais e por baixo do cabeçalho. O topbar, por sua vez, tinha fundo parcialmente composto e `backdrop-filter`, produzindo uma tonalidade diferente no Safari/iPhone.

### Regra v66

Até 820 px existe um único token de shell:

- claro: `--mobile-shell-bg: #f5f7fa`;
- escuro: `--mobile-shell-bg: #0f1722`.

O token é aplicado com precedência final a:

- `html.app-active`;
- `body`;
- `.app-shell`;
- `.main` global;
- `html.market-prototype-active .main`;
- `.topbar`.

O topbar móvel fica opaco e sem `backdrop-filter`. A identidade radial do Mercado não é eliminada do código e continua disponível acima de 820 px; só deixa de participar no shell móvel, em conformidade com a decisão de que o cabeçalho é global.

## Tema e PWA

`render.js::applyTheme()` já define dinamicamente:

- claro: `meta[name="theme-color"] = #f5f7fa`;
- escuro: `meta[name="theme-color"] = #0f1722`.

Na candidata v66:

- `manifest.webmanifest.background_color = #f5f7fa`;
- `manifest.webmanifest.theme_color = #f5f7fa`;
- `scripts/prepare-pages.cjs` força o HTML público a iniciar com `theme-color = #f5f7fa`.

Isto reduz divergências entre a área da PWA controlada pelo navegador e o shell da aplicação. O runtime continua a trocar o `theme-color` para `#0f1722` quando o tema escuro está ativo.

## Lista de compras v65 preservada

A v66 não altera `market-shopping-focus.js/.css`. No mobile continuam válidos:

- resumo compacto;
- `+` contextual;
- filtros compactos;
- categorias pendentes abertas;
- grupo **Comprados** recolhido;
- detalhes progressivos por item.

Desktop continua com tabela, separadores de categoria, pesquisa/filtros e resumos completos.

## Mercado, scanner e preço preservados

Fontes atuais:

- Pingo Doce e Continente via `https://cesta.pt/mcp`;
- Open Food Facts para identificação auxiliar por GTIN;
- `@zxing/browser` carregado em runtime de `unpkg.com`.

A auto-adição continua conservadora: exatamente um supermercado, score `>= 0.84`, margem `>= 0.10`, loja/nome/marca/embalagem compatíveis. GTIN repetido num item pendente incrementa quantidade. O catálogo continua a atualizar apenas `estimatedCents`; `actualCents` permanece reservado ao valor efetivamente confirmado.

A dependência ZXing externa continua dívida técnica de segurança e não faz parte da v66.

## Faturas recorrentes preservadas

As ocorrências futuras automáticas continuam a poder usar `draft: true`, com `totalCents = 0`, sem herdar referência, observações ou data de emissão. Drafts não entram nos totais pendentes/em atraso até preenchimento.

## Versionamento e distribuição candidata

- público atual: `v65`;
- candidato: `v66`;
- revisão visual histórica: `64-ui1`;
- runtime funcional: `64-runtime1`;
- Compras: `65-shopping1`;
- shell CSS candidato: `66-shell1`;
- cache candidato: `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1`.

`scripts/prepare-pages.cjs` mantém a separação entre versão pública e revisões internas. `v64-runtime.css` usa `?v=66-shell1`; `v64-runtime.js` continua `?v=64-runtime1`.

## Pipeline de qualidade

A CI continua a cobrir finanças, auditoria, invariantes, cofre, datas, formulários, QR, Mercado, scanner, contabilidade, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

A v66 acrescenta/regressa explicitamente:

- cor canónica do shell claro/escuro;
- fundo idêntico entre `.main` do Mercado e topbar móvel;
- ausência de `backdrop-filter` no topbar móvel;
- alinhamento do manifesto e `theme-color`;
- build/revisão/cache v66 sem mudar o runtime JS ou a camada v65 de Compras.

O gate manual de GitHub Pages executa a mesma matriz antes de preparar `dist`.

## Regressões obrigatórias

Antes de publicar v66 devem permanecer cobertos:

- finanças e invariantes de contagem;
- isolamento/cifragem do cofre;
- datas civis, faturas, pagamentos e QR;
- Mercado, scanner, quantidade × preço;
- Lista de compras v65;
- um único fundo de shell no mobile claro/escuro;
- safe area/cabeçalho sem alteração de geometria;
- manifesto, Centro de Atualização e Service Worker;
- segurança/CSP/allowlist;
- responsividade, navegação, acessibilidade e sincronização.

A CI não substitui a validação física final no mesmo iPhone/Safari onde a diferença de cor foi observada.
