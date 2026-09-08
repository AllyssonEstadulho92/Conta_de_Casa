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

## D-018 — Mercado é `text-first`; fotografia é opcional
Estado: aceite. Nome, embalagem, loja, categoria, estado e preço identificam o artigo; fotografia verificada é apoio visual.

## D-021 — Lista de compras é agrupada sem alterar o modelo
Estado: aceite. Agrupamento e disclosures reutilizam os mesmos itens, IDs e handlers.

## D-022 — Colisões visuais devem ser consolidadas
Estado: aceite. `design-system.css` é a base consolidada; `ui-consistency.css` deixou de ser distribuído.

## D-023 — Cada alteração pública relevante gera revisão validável
Estado: aceite. Alterações visuais podem usar revisão interna dentro do mesmo build quando não existe mudança funcional; cache e asset versioning têm de permitir atualização real.

## D-024 — Auto-adição por código de barras é conservadora
Estado: aceite. Exige correspondência forte; ambiguidade exige confirmação. Só estimativas podem ser atualizadas automaticamente.

## D-025 — Faturas recorrentes futuras começam como `Por preencher`
Estado: aceite. Ocorrências novas não inventam montantes variáveis.

## D-026 — Cabeçalho móvel é fixed; `.main` continua o scroller
Estado: aceite. Safe area e offset do conteúdo são obrigatórios.

## D-030 — Versão pública e revisões internas são distintas
Estado: aceite. Uma release pode reutilizar módulos funcionais validados com revisões visuais posteriores.

## D-032 — O botão móvel é um único controlo
Estado: aceite. `#mobileMenuBtn` é o mesmo nó nos estados hambúrguer e X.

## D-033 — Refinar o drawer sem criar segunda navegação
Estado: aceite. Drawer, eventos e renderização continuam únicos.

## D-038 — Navegação lateral usa o lado direito como direção canónica
Estado: aceite. Desktop e drawer móvel permanecem alinhados com a decisão da v73.

## D-040 — v75 usa o protótipo como referência visual sem transformar demonstração em funcionalidade
Estado: aceite e publicada. A fidelidade visual não autoriza preços, lojas, artigos ou capacidades fictícias.

## D-041 — Cabeçalho móvel minimalista e orientado à tarefa
Data: 8 de setembro de 2026 · Estado: aceite.

### Decisão

1. O cabeçalho móvel deve mostrar apenas navegação, contexto atual e notificações.
2. O bloco `Olá, Utilizador / Bem-vindo de volta!` e o avatar não pertencem ao topbar global e ficam ocultos.
3. Hambúrguer + título ficam à esquerda; `#notificationsBtn` fica como única ação à direita.
4. O sino mantém handler, badge, ARIA e semântica existentes; a alteração é visual.
5. A linha visual do header usa 60 px mais safe area superior.
6. Gradiente, sombra e efeitos devem ser discretos; evitar cartões ou ornamentos dentro da topbar.
7. O título deve truncar com ellipsis em ecrãs estreitos, sem empurrar notificações para fora do viewport.
8. Hambúrguer e sino mantêm área de toque >= 42 px, foco visível e `prefers-reduced-motion`.
9. `v75-header-refinement.css` é carregado depois de `v75-architecture.css` e não pode alterar estado da aplicação.
10. A revisão pública do cabeçalho é `75-header2`; o Service Worker usa cache distinto para invalidar a revisão anterior.
