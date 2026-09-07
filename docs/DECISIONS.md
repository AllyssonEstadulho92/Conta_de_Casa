# Decisões Técnicas — Conta de Casa

Atualizado: 7 de setembro de 2026

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
Data: 7 de setembro de 2026 · Estado: aceite. Testes de distribuição validam o build público atual; componentes preservados podem manter revisões internas como `64-runtime1`, `65-shopping1` e `66-shell1`. Isto evita alterar artificialmente código funcional apenas por mudança de release.

## D-031 — O shell móvel usa uma única cor canónica
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v66.

Até 820 px, shell estrutural usa:

- claro: `--mobile-shell-bg:#f5f7fa`;
- escuro: `--mobile-shell-bg:#0f1722`.

Documento, `body`, `.app-shell`, `.main`, Mercado e `.topbar` usam o mesmo fundo. Topbar é opaco e sem `backdrop-filter`. Desktop mantém identidade do Mercado. Release: v66 / `66-shell1`. PR #50 e respetivas CI/Pages terminaram com sucesso.

## D-032 — O botão móvel é um único controlo que acompanha o drawer modal
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v67.

### Contexto

O drawer tinha um hambúrguer exterior e um `X` separado. Além da duplicação, um botão exterior ficaria inerte quando `showModal()` ativasse o `<dialog>`.

### Decisão

`#mobileMenuBtn` é o mesmo nó DOM nos dois estados:

- fechado: permanece no topbar e mostra três traços;
- aberto: é movido para `.drawer-head` e `aria-expanded="true"` transforma os próprios traços em `X`;
- novo toque fecha o menu;
- ao fechar por qualquer via, regressa ao ponto original e repõe o hambúrguer.

`#drawerCloseBtn` fica oculto e fora da tabulação por compatibilidade com wiring histórico. Alvo do botão: 44×44 px; `aria-label` alterna Abrir/Fechar; movimento reduzido é respeitado. PR #52 foi publicado na v67.

## D-033 — Refinar o drawer existente sem criar uma segunda navegação
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v68 através do PR #54.

### Contexto

A auditoria confirmou que desktop e drawer já partilham `NAV_GROUPS`, que o ciclo hambúrguer/X da v67 estava tecnicamente correto e que não existia defeito global de viewport que justificasse redimensionar a aplicação. O problema residual era de apresentação do painel: várias camadas históricas deixavam sombra mais pesada, hierarquia genérica e estados de interação pouco específicos.

### Decisão

A v68 mantém o mesmo `#mobileDrawer`, `#mobileMenuBtn`, `events.js`, `render.js` e fonte de navegação. A melhoria fica na camada final `mobile-menu-toggle.css/.js`:

- largura normal do drawer: `min(364px, calc(100vw - 24px))`;
- abaixo de 360 px: `width: calc(100vw - 20px)`, sem limite artificial de 300 px;
- `100dvh`, safe areas e scroll vertical próprio;
- `overflow-x:hidden` para eliminar scroll lateral;
- botão continua 44×44 px;
- itens e ações do painel mantêm alvos mínimos de 48 px em todos os smartphones;
- hover só com pointer fino; `active`, `focus-visible` e `aria-current` têm estados discretos;
- sombra/backdrop reduzidos;
- tipografia e ícones continuam os sistemas existentes;
- `data-menu-state` é apenas estado observável, sincronizado com ARIA.

### Restrição sobre o X legado

`#drawerCloseBtn` **não é removido nesta release** porque `events.js` e `ui-icons.js` ainda o referenciam. Mantê-lo oculto evita código órfão e não cria duplicação visual. A remoção só deve ocorrer num refactor dedicado que elimine também essas referências e respetivos testes.

### Motivo

A solução melhora clareza, densidade, responsividade e interação sem duplicar componentes, sem alterar rotas ou tamanho global da aplicação e sem aumentar o escopo para dados, finanças ou segurança.

### Versionamento e validação

- release: `v68`;
- revisão do componente: `68-menu2`;
- revisões preservadas: `64-runtime1`, `65-shopping1`, `66-shell1`;
- merge: `9c8a2b3042c322849e3eb5ea3462f494897b4ab3`;
- CI do PR #1217: sucesso;
- CI de `main` #1218: sucesso;
- Deploy Pages #1211: sucesso.
