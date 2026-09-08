# Decisões Técnicas — Conta de Casa

Atualizado: 8 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O detalhe histórico permanece no Git e em `release-manifest.json`.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam viewport CSS; `VisualViewport` fica reservado a teclado e diálogos.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` mantém compatibilidade estrutural Safari/safe areas; releases podem acrescentar uma camada final versionada.

## D-003 — Densidade móvel sem sacrificar acessibilidade
Estado: aceite. Compactação não pode remover foco, contraste, legibilidade ou alvos de toque adequados.

## D-004 — Mercado como camada isolada
Estado: aceite. Mercado não reescreve cifragem, persistência ou núcleo financeiro sem necessidade comprovada.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não entram nos totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. Catálogo alimenta `estimatedCents`; `actualCents` representa valor efetivamente confirmado/pago.

## D-007 — Código de barras identifica produto, não prova preço
Estado: aceite. GTIN/EAN/UPC identifica artigo; preço continua estimado até confirmação.

## D-008 — Lucide como sistema vetorial oficial
Estado: aceite. Ícones são locais, auditáveis e sem icon font/CDN em runtime.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Hierarquia móvel consistente
Estado: aceite. Informação secundária pode usar progressive disclosure para não bloquear a tarefa principal.

## D-011 — Cofre não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta autenticação/biometria que não exista no produto.

## D-012 — Fotografia é independente do preço
Estado: aceite. Imagem nunca prova preço nem transação.

## D-013 — Atualização usa Service Worker same-origin
Estado: aceite. Releases são distribuídas pela própria PWA e instaladas de forma controlada.

## D-014 — Imagens por SKU exigem validação estrita
Estado: aceite para compatibilidade. Imagem oficial exige cadeia e identificador correspondentes.

## D-015 — Reader externo restrito a páginas públicas validadas
Estado: aceite enquanto o pipeline de imagens estiver distribuído.

## D-016 — Integrações visuais usam o contrato público do DOM
Estado: aceite. Módulos não dependem de estado privado de outros módulos.

## D-017 — Cartões vivos de retalhista usam política `official-only`
Estado: aceite no pipeline de resultados vivos.

## D-018 — Mercado é `text-first`; fotografia é opcional
Data: 6 de setembro de 2026 · Estado: aceite e refinada pela D-039. Nome, embalagem, loja, categoria, estado e preço são suficientes para identificar o artigo; uma fotografia verificada pode ser apresentada como apoio visual, nunca como requisito nem prova de preço.

## D-019 — Browser do Mercado usa posições explícitas em mobile
Estado: aceite. Grid evita compressão de nome/preço e abaixo de 360 px permite reflow controlado.

## D-020 — Metadados visuais do Mercado são conflitos técnicos
Estado: aceite. `sync-conflict-policy.js` pode ignorar apenas metadados visuais definidos; dados de negócio continuam protegidos.

## D-021 — Lista de compras é agrupada sem alterar o modelo
Estado: aceite. Agrupamento e disclosures reutilizam os mesmos itens, IDs e handlers.

## D-022 — Colisões visuais devem ser consolidadas
Estado: aceite e refinada pela D-039. A antiga camada `ui-consistency.css` cumpriu este papel nas versões anteriores; na v74 as regras necessárias passam para `design-system.css` e deixam de ser distribuídas como override separado.

## D-023 — Cada alteração pública relevante gera versão e validação
Estado: aceite. Fluxo oficial: alteração → versão → `release-manifest.json` → CI → `main` → Pages → instalação/atualização.

## D-024 — Auto-adição por código de barras é conservadora
Estado: aceite. Exige loja compatível, score `>=0.84`, margem `>=0.10`; ambiguidade exige confirmação. Só estimativas podem ser atualizadas automaticamente.

## D-025 — Faturas recorrentes futuras começam como `Por preencher`
Estado: aceite. Ocorrências novas não inventam montantes variáveis e ficam fora de pendentes/atrasos até preenchimento.

## D-026 — Cabeçalho móvel é fixed; `.main` continua o scroller
Estado: aceite. Safe area e offset do conteúdo são obrigatórios.

## D-027 — Topbar móvel mantém geometria global
Estado: aceite e refinada pela D-039. O modelo v74 pode alterar a apresentação global do topbar, mas não criar implementações divergentes por página.

## D-028 — Redeploy repete verificações da release
Estado: aceite. Build público só deve ser preparado após testes de sintaxe e regressões críticas.

## D-029 — Lista móvel prioriza execução
Estado: aceite. Resumo, checkbox, nome, quantidade e preço têm prioridade; detalhe financeiro pode ficar em disclosure. A camada de apresentação não escreve em estado financeiro.

## D-030 — Versão pública e revisões internas são distintas
Estado: aceite. Uma release pode reutilizar módulos funcionais validados com revisões anteriores.

## D-031 — Shell móvel usa identidade canónica por release
Estado: aceite e substituída visualmente pela D-039 para a v74. A cor do shell deve ser definida numa única camada final, evitando overrides concorrentes.

## D-032 — O botão móvel é um único controlo
Estado: aceite. `#mobileMenuBtn` é o mesmo nó nos estados hambúrguer e X; não existe um segundo botão visual concorrente.

## D-033 — Refinar o drawer sem criar segunda navegação
Estado: aceite. `NAV_GROUPS`, drawer, eventos e renderização continuam únicos.

## D-034 — O controlador animado é proprietário do glifo do menu
Estado: aceite. `mobile-menu-toggle.js` controla o glifo animado e impede substituição destrutiva pelo hidratador de ícones.

## D-035 — Movimento do glifo usa animação explícita após reparenting
Estado: aceite. Web Animations complementa o estado CSS, respeitando `prefers-reduced-motion` e fallback sem `Element.animate`.

## D-036 — Drawer fecha apenas depois da transição off-canvas
Estado: aceite. O wrapper do `dialog.close()` espera pelo fim da transição ou fallback temporal para não cortar a animação.

## D-037 — Drawer acompanha o dedo e só captura intenção horizontal
Estado: aceite. Swipe é progressivo, preserva scroll vertical e usa thresholds/velocidade para snap.

## D-038 — Navegação lateral usa o lado direito como direção canónica
Data: 8 de setembro de 2026 · Estado: aceite e publicada na v73. Desktop reserva sidebar com `margin-right`; drawer abre da direita; swipe de abertura começa na margem direita e move-se para a esquerda.

## D-039 — v74 aplica o novo protótipo como camada de experiência sem migrar o núcleo
Data: 8 de setembro de 2026 · Estado: aceite como release candidata v74.

### Contexto

O novo modelo aprovado redefine a apresentação móvel de Conta de Casa: onboarding, Início, Despesas, adicionar despesa, leitura de fatura, Mercado, Planeamento, Relatórios, Mais e Sincronização. O requisito principal é aproximar a aplicação do protótipo sem perder dados, cálculos, segurança ou fluxos já validados.

### Decisão

1. **Preservar o núcleo funcional.** `core.js`, `finance.js`, IndexedDB, `STATE_VERSION = 5`, cofre, pagamentos e sincronização não são reescritos para produzir o redesign.
2. **Consolidar o sistema visual em `design-system.css`.** A identidade canónica passa a usar fundo claro `#f4f8f8`, texto `#0c2830`, primário `#075b63` e acento `#17b890`, mantendo tema escuro.
3. **Criar `v74-experience.css/js` como camada de composição.** Esta camada reutiliza IDs, dados e handlers existentes e não deve escrever diretamente valores financeiros.
4. **Priorizar cinco destinos no mobile:** Início, Despesas, Mercado, Planeamento e Mais. O drawer preserva a arquitetura completa.
5. **Reutilizar fluxos reais.** “Adicionar despesa” chama o formulário existente; “Ler fatura” usa a captura QR/fotografia existente; Mercado reutiliza pesquisa/scanner e preços existentes.
6. **Não inventar dados para imitar o protótipo.** Valores, faturas, lojas e produtos apresentados na aplicação devem vir do estado real ou de fontes validadas.
7. **Fotografias do Mercado são opcionais e verificadas.** D-018 continua válida como `text-first`, mas fotografias aprovadas podem voltar a ser visíveis.
8. **Remover overrides visuais redundantes do bundle.** `ui-consistency.css` e `v64-runtime.css` deixam de ser distribuídos; regras necessárias são consolidadas. `v64-runtime.js` permanece por conter comportamento funcional.
9. **Preservar a navegação v73.** Sidebar/drawer continuam à direita e o mesmo hambúrguer continua a transformar-se em X.
10. **Validar antes de publicar.** Finanças, isolamento, QR, Mercado, scanner, atualização, segurança, responsividade, acessibilidade e sincronização devem estar verdes no CI.

### Versionamento

- build: `v74`;
- UI: `74-ui1`;
- Mercado: `74-shopping2`;
- menu preservado: `73-menu8`;
- experiência: `74-experience2`;
- cache: `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

### Validação

CI da branch `34209567627` / `#1435`: sucesso integral. A validação física pós-publicação continua recomendada e não deve ser confundida com validação automática.
