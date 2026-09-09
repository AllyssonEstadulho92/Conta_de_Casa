# Changelog Técnico — Conta de Casa

## 2026-09-09 — v75 `75-photo-loader3` + `75-pd-view1`: estabilidade Safari e biblioteca abrível

### Evidência

No iPhone/Safari, a rota `/#market` apresentou **“Um problema ocorreu repetidamente”** depois das alterações de carregamento de fotografias. A auditoria ao runtime mostrou carga demasiado agressiva no `75-photo-loader2`: hidratação dos primeiros 18 cartões do DOM, até 6 resoluções prioritárias, polling de 500 ms por 24 ciclos, observer global e sincronização Pingo Doce adicional na entrada do Mercado.

Foi também confirmado que o componente visual **Biblioteca Pingo Doce** não possuía qualquer ação de abertura. O único botão, **Atualizar biblioteca**, executava sincronização externa; por isso o comportamento “carrega e não abre” correspondia ao código real.

### `75-photo-loader3`

- seleção real dos cartões por viewport com `getBoundingClientRect()`;
- limite de 2 cartões prioritários no mobile e 4 no desktop;
- removida hidratação eager dos primeiros 18 cartões;
- processamento sequencial do pequeno conjunto prioritário;
- polling reduzido para 1200 ms e 10 ciclos;
- `MutationObserver` limitado a `#page-market` e alterações relevantes;
- scans coalescidos por `requestAnimationFrame`;
- removido `warmPending()+syncNow()` automático da entrada do Mercado;
- imagem quebrada entra em quarentena local de 30 s, é expurgada de `75-image-library1` e não é recriada imediatamente;
- fallback **Fotografia temporariamente indisponível** durante a quarentena;
- sem alterações a `core.js`, `finance.js`, preços, faturas, PIN, cofre ou sincronização.

### `75-pd-view1`

- criada uma vista real para abrir a Biblioteca Pingo Doce;
- novo botão **Abrir biblioteca**, separado de **Atualizar**;
- abertura lê exclusivamente a IndexedDB local e não faz `fetch()`;
- painel acessível com `role=dialog`, `aria-modal`, fecho por X, backdrop e Escape;
- mobile usa ecrã completo com safe area; desktop usa painel/modal central;
- paginação de 12 produtos por lote;
- pesquisa local por nome, embalagem, categoria ou PID;
- filtros Todos / Com fotografia / Pendentes / Sem fotografia;
- fotografias apenas quando já existem em `75-image-library1`, com `loading='lazy'`;
- link oficial do produto só é apresentado depois de validação pela API existente da biblioteca;
- nenhuma resolução de imagem ou sincronização de rede é iniciada apenas por abrir a vista.

### Distribuição e testes

- novos assets `pingo-doce-library-view.js/css` adicionados ao bundle público;
- Service Worker passa para cache `...catalog2-pd-photo1-pd-view1-photo-loader3`;
- novo teste `tests/pingo-doce-library-view.test.cjs`;
- CI passa a verificar sintaxe e comportamento de distribuição desta vista;
- validação física no mesmo iPhone continua obrigatória antes de considerar o incidente encerrado.

---

## 2026-09-09 — v75 `75-catalog2` + `75-photo-loader2`: correção do pipeline real de fotografias

A revisão separou validação oficial de transporte, priorizou cartões visíveis e introduziu recuperação de referências quebradas. A validação física posterior revelou, porém, pressão excessiva no Safari móvel, levando a `75-photo-loader3`.

## 2026-09-09 — v75 `75-pd-photo1` + `75-photo-loader1`: biblioteca Pingo Doce e primeiro carregador visual

- criada `pingo-doce-photo-library.js` com IndexedDB isolada e chave `pingo-doce|pid`;
- descoberta restrita a resultados Pingo Doce;
- 15 famílias e mais de 200 termos;
- estados `pending|ready|missing`;
- limites de rede por sessão/dia;
- primeiro skeleton/spinner **A carregar fotografia…**.

## 2026-09-09 — v75 `75-catalog1`: catálogo visual progressivo por categorias

- catálogo local separado, indexado por `marketId|pid`;
- categorias de supermercado disponíveis antes da pesquisa manual;
- descoberta limitada de SKUs reais de Continente/Pingo Doce;
- preços não persistidos;
- **Ver preço atual** reutiliza pesquisa viva.

## 2026-09-09 — v75 `75-image-library1`: biblioteca persistente de fotografias oficiais

- IndexedDB própria `conta-de-casa-market-image-library`;
- identidade estrita `marketId|pid`;
- metadados e URL oficial validado;
- TTL de 45 dias;
- nenhuma alteração ao estado financeiro.

## 2026-09-09 — v75 `75-featured1`: destaques do Mercado

- cartões mobile em carrossel horizontal largo;
- área de fotografia estável;
- nome em duas linhas;
- preço isolado;
- fallback vetorial quando imagem não existe.

## 2026-09-09 — v75 `75-drawer2`: drawer alinhado com a identidade

- drawer no lado direito;
- gradiente petróleo/teal;
- menta como acento;
- hambúrguer/X, swipe, Escape, foco e ARIA preservados.

## 2026-09-09 — v75 `75-layout1`: geometria transversal

- largura, margens, grelhas e ritmo vertical uniformizados;
- desktop compacto e largo tratados separadamente;
- sem alteração ao núcleo financeiro.

## 2026-09-08 — v75 `75-stability1` e `75-header2`

- tipografia, safe areas, overflow, formulários, navegação, diálogos e estados de imagem estabilizados;
- cabeçalho móvel simplificado;
- Mercado permanece terceiro destino da navegação inferior.

## Histórico anterior

As revisões anteriores permanecem preservadas no histórico Git e em `release-manifest.json`.
