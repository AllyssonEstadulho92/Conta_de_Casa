# Decisões Técnicas — Conta de Casa

## D-001 — Separar altura do shell e VisualViewport

Data: 4 de setembro de 2026
Estado: aceite

### Contexto

O shell mobile estava dimensionado diretamente com `--visual-vh`, valor calculado a partir de `window.visualViewport.height`. Em Safari/iPhone esta medida é transitória e pode mudar com teclado e barras do browser, provocando corte do contentor principal.

### Decisão

O shell permanente (`.app-shell` e `.main`) passa a usar `100dvh`, com `100svh` como mínimo. As métricas de `VisualViewport` permanecem no projeto apenas para comportamento transitório de teclado e diálogos.

### Motivo

O CSS dinâmico do viewport é a fonte adequada para a dimensão estrutural da aplicação. O Visual Viewport é útil para reposicionar interfaces durante o teclado, mas não deve definir a altura persistente de toda a aplicação.

### Risco controlado

Browsers sem suporte a `dvh` ignoram a nova declaração e mantêm as regras anteriores. Não foram alterados dados nem lógica de negócio.

## D-002 — Camada de compatibilidade móvel dedicada

Data: 4 de setembro de 2026
Estado: aceite

### Decisão

Criar `mobile-layout.css` e carregá-lo depois de `design-system.css`, em vez de reescrever imediatamente os dois ficheiros CSS existentes.

### Motivo

Existem várias gerações de regras responsivas em `styles.css` e `design-system.css`. Uma refatoração total durante a correção aumentaria o risco de regressão. A camada final torna o override explícito, pequeno, testável e reversível.

### Consequência

A consolidação dos estilos duplicados fica como trabalho posterior, depois de validação física em iPhone.

## D-003 — Reduzir densidade vertical dos cartões de Compras

Data: 4 de setembro de 2026
Estado: aceite

### Decisão

Entre 360 px e 560 px, o estado volta à linha do produto e os três indicadores financeiros são apresentados numa única grelha de três colunas. Dispositivos abaixo de 360 px mantêm o layout empilhado.

### Motivo

O layout anterior fazia cada item ocupar uma fração excessiva do ecrã em iPhones comuns. A alteração preserva legibilidade e os alvos tácteis de 44 px, mas melhora a quantidade de informação visível por ecrã.
