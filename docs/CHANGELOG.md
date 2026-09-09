# Changelog Técnico — Conta de Casa

## 2026-09-09 — v75 `75-pd-photo1` + `75-photo-loader1`: biblioteca Pingo Doce e carregamento rápido

### Objetivo

Aumentar de forma significativa a cobertura de fotografias reais do Pingo Doce no Mercado e evitar a sensação de cartão vazio enquanto a fotografia ainda está a ser resolvida.

### Biblioteca Pingo Doce

- criado `pingo-doce-photo-library.js` com revisão `75-pd-photo1`;
- criada IndexedDB isolada `conta-de-casa-pingo-doce-photo-library`;
- cada SKU usa a chave `pingo-doce|pid`;
- descoberta restrita a `search_products` com `stores:['pingodoce']`;
- só entram produtos com PID e página oficial Pingo Doce coerentes;
- adicionadas 15 famílias de produto e mais de 200 termos de descoberta;
- o inventário guarda nome, embalagem, categoria, página oficial e estado `pending|ready|missing`;
- a fotografia é procurada apenas para o SKU exato e persistida pela biblioteca geral `75-image-library1` depois da validação oficial;
- não são copiados ficheiros binários para o GitHub;
- não são guardados preços, quantidades, faturas, PIN, credenciais ou dados do cofre;
- limites: 24 pesquisas por sessão, 72/dia, 30 tentativas de fotografia por sessão e 120/dia;
- trabalho automático suspenso offline, com página oculta ou `Save-Data` ativo;
- adicionada área **Biblioteca Pingo Doce** com contagem de SKUs/fotografias e botão **Atualizar biblioteca**.

### Carregador de fotografias

- criado `market-photo-loader.js` com revisão `75-photo-loader1`;
- criado `market-photo-loader.css`;
- cartão sem fotografia passa imediatamente para skeleton/shimmer;
- adicionado spinner e texto **A carregar fotografia…**;
- fotografias já presentes na IndexedDB são aplicadas primeiro;
- imagens resolvidas para cartões visíveis usam `loading='eager'` para reduzir atraso percebido;
- ao primeiro acesso ao Mercado é feito aquecimento limitado da biblioteca Pingo Doce;
- cartões visíveis são reavaliados a cada 850 ms durante no máximo 18 ciclos;
- `prefers-reduced-motion` remove animações e o tema escuro tem apresentação própria;
- o loader não faz pedidos externos diretamente nem acede ao estado financeiro.

### Distribuição

- adicionados `pingo-doce-photo-library.css/js` à allowlist de Pages;
- adicionados `market-photo-loader.css/js` à allowlist de Pages;
- CSS carregado depois do catálogo visual e antes do drawer;
- JS carregado depois de `market-visual-catalog.js`, com biblioteca Pingo Doce antes do loader;
- Service Worker atualizado para cache `...-catalog1-pd-photo1-photo-loader1`;
- CI e Pages passam a verificar sintaxe e os dois novos testes.

### QA e publicação

Novos testes:

- `tests/pingo-doce-photo-library.test.cjs`;
- `tests/market-photo-loader.test.cjs`.

Publicação funcional confirmada no SHA `7a59ae017a4640cfa3ad5ec357cd99425ca9ee71`:

- CI final da branch: sucesso;
- branch comparada com `main`: `ahead`, `behind 0`;
- integração por fast-forward sem force;
- CI de `main`: sucesso;
- GitHub Pages: deploy concluído com sucesso;
- regressões de finanças, Mercado, segurança, responsividade, navegação, acessibilidade e sincronização passaram.

Os commits documentais posteriores apenas fecham o estado do projeto e não alteram a implementação funcional.

### Limitação explícita

A solução foi desenhada para acumular progressivamente todos os SKUs Pingo Doce que as fontes disponíveis consigam descobrir e validar. Não se afirma uma cópia instantânea de 100% do catálogo dinâmico porque o projeto não dispõe de uma API oficial exaustiva/autorizada que permita provar essa cobertura.

---

## 2026-09-09 — v75 `75-catalog1`: catálogo visual progressivo por categorias

- criado `market-visual-catalog.js/css`;
- criado `market-catalog-image-resolver.js`;
- catálogo local separado, indexado por `marketId|pid`;
- categorias de supermercado disponíveis antes de pesquisa manual;
- descoberta limitada de SKUs reais de Continente/Pingo Doce;
- preços não são persistidos no catálogo;
- **Ver preço atual** reutiliza a pesquisa viva existente;
- fotografias oficiais são resolvidas e entregues a `75-image-library1`;
- CI específico em `tests/market-visual-catalog.test.cjs`.

## 2026-09-09 — v75 `75-image-library1`: biblioteca persistente de fotografias oficiais

- criada `market-image-library.js`;
- IndexedDB própria `conta-de-casa-market-image-library`;
- identidade estrita `marketId|pid`;
- guarda apenas metadados e URL oficial validado;
- TTL de 45 dias;
- Continente e Pingo Doce validados por host/path/PID;
- nenhuma alteração ao estado financeiro.

## 2026-09-09 — v75 `75-featured1`: destaques do Mercado

- cartões mobile passam para carrossel horizontal largo;
- área de fotografia estável;
- nome em duas linhas;
- preço isolado;
- fallback vetorial quando imagem não existe;
- controlos anterior/seguinte e indicadores.

## 2026-09-09 — v75 `75-drawer2`: drawer alinhado com a identidade

- drawer mantém lado direito;
- gradiente petróleo/teal alinhado com o cabeçalho;
- menta usada apenas como acento;
- hambúrguer/X, swipe, Escape, foco e ARIA preservados.

## 2026-09-09 — v75 `75-layout1`: geometria transversal

- largura, margens, grelhas e ritmo vertical uniformizados;
- desktop compacto e largo tratados separadamente;
- formulários/cartões reduzem colunas antes de comprimir conteúdo;
- sem alteração ao núcleo financeiro.

## 2026-09-08 — v75 `75-stability1` e `75-header2`

- tipografia, safe areas, overflow, formulários, navegação, diálogos e estados de imagem estabilizados;
- cabeçalho móvel simplificado para hambúrguer+título e notificações;
- Mercado permanece terceiro destino da navegação inferior.

## Histórico anterior

As revisões anteriores permanecem preservadas no histórico Git e em `release-manifest.json`.