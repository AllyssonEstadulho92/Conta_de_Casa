# Decisões Técnicas — Conta de Casa

Atualizado: 8 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam unidades de viewport CSS; `VisualViewport` fica reservado a teclado e diálogos. O scroller interno de `.main` é preservado.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` mantém compatibilidade Safari/safe areas/viewport. Correções de release podem usar uma camada final explicitamente versionada.

## D-003 — Densidade móvel sem sacrificar alvos tácteis
Estado: aceite. A interface pode ser compacta desde que preserve legibilidade, foco e áreas de toque adequadas.

## D-004 — Mercado como camada isolada
Estado: aceite. Compras não reescreve cifragem, persistência ou núcleo financeiro sem necessidade comprovada.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não alimentam totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. Catálogo alimenta `estimatedCents`; `actualCents` representa valor efetivamente pago/confirmado.

## D-007 — Código de barras identifica produto, não prova preço pago
Estado: aceite. GTIN/EAN/UPC identifica artigo; preço pesquisado continua estimado até confirmação.

## D-008 — Lucide como sistema vetorial oficial
Estado: aceite. Ícones são locais, auditáveis, consistentes e sem icon font/CDN em runtime.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Hierarquia móvel consistente
Estado: aceite e refinada por D-029. Informação secundária pode usar progressive disclosure para não bloquear a tarefa principal.

## D-011 — Cofre não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta autenticação ou capacidades não implementadas.

## D-012 — Fotografia é independente do preço
Estado: aceite como regra histórica. Imagem nunca prova preço nem transação.

## D-013 — Atualização de software usa Service Worker same-origin
Estado: aceite. Releases públicas são distribuídas pela própria PWA.

## D-014 — Imagens por SKU com validação estrita
Estado: compatibilidade histórica. Enquanto módulos antigos existirem, imagem oficial exige cadeia e identificador correspondentes.

## D-015 — Reader externo restrito a páginas públicas validadas
Estado: compatibilidade histórica enquanto o pipeline antigo de imagens estiver distribuído.

## D-016 — Integração de imagens usa o contrato real do DOM
Estado: histórico/compatibilidade. Integrações dependem de seletores/IDs públicos, não de estado privado entre módulos.

## D-017 — Cartões vivos de retalhista eram `official-only`
Estado: substituída na apresentação por D-018; preservada apenas no pipeline histórico.

## D-018 — Mercado orientado a nomes, sem fotografias de produto
Data: 6 de setembro de 2026 · Estado: aceite. A experiência principal é `text-first`: nome, embalagem/quantidade, loja, categoria, estado e preço. Câmara continua disponível para código de barras; metadados históricos ficam por compatibilidade.

## D-019 — Browser do Mercado usa posições explícitas em mobile
Data: 6 de setembro de 2026 · Estado: aceite. Conteúdo textual e botão `+` usam posições explícitas no Grid; abaixo de 360 px o preço reflui em vez de comprimir palavras.

## D-020 — Metadados visuais do Mercado são conflitos técnicos
Data: 6 de setembro de 2026 · Estado: aceite. `sync-conflict-policy.js` ignora apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` para equivalência de negócio. Nome, quantidade, valores, estado e datas continuam protegidos.

## D-021 — Lista de compras agrupada por categoria sem alterar o modelo
Data: 6 de setembro de 2026 · Estado: aceite. Agrupamento reutiliza categoria e os mesmos nós/handlers. Mobile usa disclosures; desktop mantém tabela e separadores.

## D-022 — Uma camada final resolve colisões visuais entre CSS legados
Data: 6 de setembro de 2026 · Estado: aceite e publicada na v63. `ui-consistency.css` consolida regras visuais sem tocar em estado financeiro.

## D-023 — Cada alteração pública relevante gera versão, manifesto e instalação confirmada
Data: 6 de setembro de 2026 · Estado: aceite. Ciclo oficial: **alteração → versão → `release-manifest.json` → CI → `main` → Pages → instalação pelo Centro de Atualização**. `latestVersion` deve corresponder ao build e a allowlist do SW permanece explícita.

## D-024 — Auto-adição por código de barras exige correspondência conservadora
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64. Exige exatamente um supermercado, loja/nome/marca/embalagem compatíveis, score `>=0.84` e margem `>=0.10`. Ambiguidade exige confirmação manual. GTIN repetido pendente incrementa quantidade. Só `estimatedCents` é atualizado.

## D-025 — Próximas faturas recorrentes começam como `Por preencher`
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64. Nova ocorrência mantém campos estruturais, usa `totalCents=0`, limpa campos variáveis e fica `draft:true` até preenchimento. Drafts não entram em pendentes/atrasos.

## D-026 — Cabeçalho móvel é fixo; conteúdo continua no scroller interno
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64. `.main` continua o scroller; topbar usa `fixed`, respeita safe area e o conteúdo recebe offset adequado.

## D-027 — O topbar móvel é global e não recebe decoração específica por página
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64. Início, Faturas, Compras e Relatórios partilham geometria de título, menu, `+`, Sync e fundo.

## D-028 — Redeploy manual de Pages repete verificações específicas da release
Data: 7 de setembro de 2026 · Estado: aceite e publicada. O caminho manual verifica sintaxe e regressões das camadas críticas antes de gerar `dist`.

## D-029 — Lista de compras móvel prioriza execução e usa progressive disclosure
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v65.

Decisão: no mobile, resumo compacto surge primeiro; detalhe financeiro completo fica em disclosure; `+` do topbar reutiliza a ação existente; filtros são compactos; categorias pendentes ficam abertas; Comprados fica recolhido; cartões priorizam checkbox, nome, quantidade e preço. A camada não escreve em `appState`, `estimatedCents`, `actualCents` ou quantidade e não substitui handlers financeiros.

Validação histórica: PR #48, commit `2d39f6f4daa8dccabb51bf906ef22d4a5d9075e4`, CI e Pages verdes.

## D-030 — Versão pública e revisões internas são conceitos distintos
Data: 7 de setembro de 2026 · Estado: aceite. Testes de distribuição validam o build público atual; componentes preservados podem manter revisões internas como `64-runtime1`, `65-shopping1` e `66-shell1`.

## D-031 — O shell móvel usa uma única cor canónica
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v66. Até 820 px, shell estrutural usa claro `#f5f7fa` e escuro `#0f1722`; topbar é opaco e desktop mantém identidade do Mercado.

## D-032 — O botão móvel é um único controlo que acompanha o drawer modal
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v67. `#mobileMenuBtn` é o mesmo nó DOM nos dois estados; `#drawerCloseBtn` fica oculto por compatibilidade; ARIA acompanha o estado.

## D-033 — Refinar o drawer existente sem criar uma segunda navegação
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v68 através do PR #54. A v68 manteve drawer, botão, `events.js`, `render.js` e `NAV_GROUPS`, refinando apenas apresentação e responsividade.

## D-034 — O controlador animado é proprietário do glifo visível do menu
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v69 através do PR #56. A v69 resolveu a substituição dos spans pelo hidratador Lucide usando `data-ui-icon-slot="menu"` e sentinela SVG oculta.

## D-035 — Movimento explícito do glifo depois do reparenting
Data: 8 de setembro de 2026 · Estado: aceite e publicada na v70 através do PR #58.

### Contexto

A validação física da v69 confirmou os estados finais corretos — hambúrguer fechado e X aberto — mas mostrou que o movimento entre eles podia parecer instantâneo. O mesmo nó é reparented entre topbar e `.drawer-head`; no Safari, a CSS transition pode ser consumida quando o elemento reaparece já no estado final.

### Decisão

Manter CSS como estado/fallback e acrescentar Web Animations explícitas no controlador:

- após `syncButton(true)` e o reparenting para o drawer, executar `animateMenuGlyph(true)` no frame seguinte;
- após `syncButton(false)` e o regresso ao topbar, executar `animateMenuGlyph(false)` no frame seguinte;
- animar as três linhas com keyframes completos de `top`, `width`, `transform` e `opacity`;
- acrescentar micro movimento de escala/inclinação do glifo sem deslocar layout;
- duração `240 ms`;
- não executar keyframes adicionais quando `prefers-reduced-motion` estiver ativo;
- manter funcionamento sem `Element.animate`, usando o estado CSS como fallback.

### Publicação

- release: `v70`;
- revisão do menu: `70-menu4`;
- merge: `f4144bff69a3b46e0f6ec78a00af50d29b704578`;
- CI final do PR #1279 (`34170191884`): sucesso;
- CI de `main` #1280 (`34170229908`): sucesso;
- Deploy Pages #1273 (`34170256426`): sucesso.

## D-036 — Drawer móvel usa off-canvas completo e só fecha depois da transição
Data: 8 de setembro de 2026 · Estado: aceite como candidata v71.

### Contexto

A validação física da v70 mostrou o drawer correto em conteúdo, estado e hierarquia, mas a entrada permanecia visualmente seca. Um fecho nativo imediato de `<dialog>` também inviabilizava uma saída lateral completa.

### Decisão

Manter o mesmo `<dialog>`, a mesma navegação e os mesmos métodos públicos, mas coordenar a apresentação dentro do controlador já existente:

- estado fechado da superfície: `translate3d(calc(-100% - 8px),0,0)`;
- estado aberto: `translate3d(0,0,0)`;
- abertura: `280 ms` com `cubic-bezier(.32,.72,0,1)`;
- fecho: `240 ms`, ligeiramente mais rápido;
- backdrop: transparente → `rgba(10,18,30,.34)` com blur máximo de `1px`;
- não animar largura, `left`, margens ou outros valores que causem reflow;
- preservar uma referência ao `drawer.close` nativo e substituir apenas o método da instância por um wrapper coordenador;
- o wrapper remove `.open`, espera `transitionend` do `transform` e só então executa o close nativo;
- usar fallback temporal de `360 ms` para impedir estado preso se `transitionend` não ocorrer;
- deixar o mesmo botão dentro de `.drawer-head` até ao evento `close` real, regressando ao topbar apenas depois;
- em `prefers-reduced-motion` ou fora do breakpoint mobile, não esperar pela animação;
- todos os fluxos existentes (`X`, backdrop, Escape, seleção de página e breakpoint) continuam a usar `drawer.close()` sem duplicação.

### Motivo

A solução produz um movimento off-canvas claro e composto principalmente por `transform`, evita alterações de layout, mantém um único drawer e evita tocar em `events.js` e `render.js`.

## D-037 — O drawer móvel acompanha o dedo e só captura intenção horizontal
Data: 8 de setembro de 2026 · Estado: aceite como refinamento da candidata v71.

### Contexto

A animação automática resolve a transição entre estados, mas não reproduz a interação direta observada no ChatGPT: durante um swipe o painel deve mover-se na mesma proporção do dedo, sem parecer travado até ao `touchend`.

### Decisão

Adicionar um controlador de gesto exclusivamente em `mobile-menu-toggle.js`, preservando o drawer e a navegação existentes:

- quando fechado, aceitar candidato apenas nos primeiros `30 px` da margem esquerda;
- quando aberto, aceitar candidato em qualquer ponto dentro de `.nav-drawer-shell`;
- exigir pelo menos `8 px` de deslocamento e predominância horizontal antes de capturar o gesto;
- preservar scroll vertical através de `touch-action:pan-y` e abandonar o candidato quando o eixo vertical domina;
- durante o arrasto, definir `data-dragging="true"` e desligar temporariamente as transitions do shell/backdrop;
- derivar `--drawer-drag-x` diretamente de `deltaX`, limitado entre totalmente fechado e aberto;
- derivar opacidade e blur do backdrop do mesmo progresso do gesto;
- ao soltar, confirmar abertura a partir de `34%` de progresso ou velocidade `>= 0.45 px/ms` para a direita;
- num drawer aberto, confirmar fecho quando o progresso cai para `66%` ou menos, ou quando a velocidade é `<= -0.45 px/ms`;
- fixar o transform atual durante um frame e depois devolver o controlo ao CSS para animar apenas a distância restante;
- bloquear o clique sintetizado por `320 ms` depois de um swipe completo;
- se ocorrer `touchcancel`, regressar ao estado estável anterior;
- em `prefers-reduced-motion`, não capturar o gesto adicional.

### Motivo

O utilizador recebe feedback cinestésico imediato e previsível sem reflow, sem uma segunda navegação e sem interferir no scroll vertical. O gesto atua apenas sobre apresentação e não altera qualquer dado da aplicação.

### Versionamento

Permanece `v71` / `71-menu5`; o refinamento foi incorporado no mesmo PR candidato antes da publicação.

## D-038 — A navegação lateral usa o lado direito como direção canónica
Data: 8 de setembro de 2026 · Estado: aceite como candidata v73.

### Contexto

A aplicação tinha sidebar desktop e drawer móvel ancorados à esquerda. A direção pretendida passa a usar o lado direito, mantendo o hambúrguer no cabeçalho móvel, o mesmo conjunto `NAV_GROUPS` e a mesma arquitetura funcional.

### Decisão

- no desktop, fixar `.sidebar` à direita e reservar espaço com `margin-right: var(--sidebar-current)`;
- espelhar borda, sombra, gradiente e indicador ativo para a margem direita da navegação;
- no mobile, ancorar `#mobileDrawer` com `inset:0 0 0 auto`;
- usar estado fechado positivo `translate3d(calc(100% + 8px),0,0)` e estado aberto `translate3d(0,0,0)`;
- manter a entrada composta apenas por `transform`/opacidade, com cerca de `300 ms`, e o fecho ligeiramente mais rápido;
- inverter o gesto: abertura a partir dos últimos `30 px` da margem direita com movimento para a esquerda; fecho com movimento para a direita;
- manter thresholds, scroll vertical, `prefers-reduced-motion`, ARIA, o mesmo botão e o mesmo `<dialog>`;
- preservar o header móvel fixed e as safe areas definidas em D-026.

### Motivo

A alteração muda a direção visual sem duplicar navegação, sem alterar dados e sem introduzir um novo componente. O mesmo sistema funciona em mobile e desktop com menos divergência estrutural.

### Versionamento

Candidata `v73` / `73-menu8`; cache `conta-de-casa-public-v64-runtime1-v65-shopping1-v66-shell1-v73-menu8`.
