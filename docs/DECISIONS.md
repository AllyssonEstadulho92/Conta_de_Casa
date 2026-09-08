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
Data: 6 de setembro de 2026 · Estado: aceite e refinada pela D-039. Nome, embalagem, loja, categoria, estado e preço são suficientes para identificar o artigo; fotografia verificada pode ser apoio visual, nunca requisito nem prova de preço.

## D-019 — Browser do Mercado usa posições explícitas em mobile
Estado: aceite. Grid evita compressão de nome/preço e abaixo de 360 px permite reflow controlado.

## D-020 — Metadados visuais do Mercado são conflitos técnicos
Estado: aceite. `sync-conflict-policy.js` pode ignorar apenas metadados visuais definidos; dados de negócio continuam protegidos.

## D-021 — Lista de compras é agrupada sem alterar o modelo
Estado: aceite. Agrupamento e disclosures reutilizam os mesmos itens, IDs e handlers.

## D-022 — Colisões visuais devem ser consolidadas
Estado: aceite e refinada pela D-039. Na v74, as regras necessárias foram consolidadas em `design-system.css`; `ui-consistency.css` deixou de ser distribuído.

## D-023 — Cada alteração pública relevante gera versão e validação
Estado: aceite. Fluxo oficial: alteração → versão → `release-manifest.json` → CI → `main` → Pages → instalação/atualização.

## D-024 — Auto-adição por código de barras é conservadora
Estado: aceite. Exige loja compatível, score `>=0.84`, margem `>=0.10`; ambiguidade exige confirmação. Só estimativas podem ser atualizadas automaticamente.

## D-025 — Faturas recorrentes futuras começam como `Por preencher`
Estado: aceite. Ocorrências novas não inventam montantes variáveis e ficam fora de pendentes/atrasos até preenchimento.

## D-026 — Cabeçalho móvel é fixed; `.main` continua o scroller
Estado: aceite. Safe area e offset do conteúdo são obrigatórios.

## D-027 — Topbar móvel mantém geometria global
Estado: aceite e refinada pela D-039. O modelo v74 altera a apresentação global do topbar, sem criar implementações divergentes por página.

## D-028 — Redeploy repete verificações da release
Estado: aceite. Build público só deve ser preparado após testes de sintaxe e regressões críticas.

## D-029 — Lista móvel prioriza execução
Estado: aceite. Resumo, checkbox, nome, quantidade e preço têm prioridade; detalhe financeiro pode ficar em disclosure. A camada de apresentação não escreve em estado financeiro.

## D-030 — Versão pública e revisões internas são distintas
Estado: aceite. Uma release pode reutilizar módulos funcionais validados com revisões anteriores.

## D-031 — Shell móvel usa identidade canónica por release
Estado: aceite e substituída visualmente pela D-039 para a v74. A cor do shell deve existir numa única camada final, evitando overrides concorrentes.

## D-032 — O botão móvel é um único controlo
Estado: aceite. `#mobileMenuBtn` é o mesmo nó nos estados hambúrguer e X.

## D-033 — Refinar o drawer sem criar segunda navegação
Estado: aceite. `NAV_GROUPS`, drawer, eventos e renderização continuam únicos.

## D-034 — O controlador animado é proprietário do glifo do menu
Estado: aceite. `mobile-menu-toggle.js` controla o glifo animado e impede substituição destrutiva pelo hidratador de ícones.

## D-035 — Movimento do glifo usa animação explícita após reparenting
Estado: aceite. Web Animations complementa o estado CSS, respeitando `prefers-reduced-motion` e fallback.

## D-036 — Drawer fecha apenas depois da transição off-canvas
Estado: aceite. O wrapper do `dialog.close()` espera pelo fim da transição ou fallback temporal.

## D-037 — Drawer acompanha o dedo e só captura intenção horizontal
Estado: aceite. Swipe é progressivo, preserva scroll vertical e usa thresholds/velocidade para snap.

## D-038 — Navegação lateral usa o lado direito como direção canónica
Data: 8 de setembro de 2026 · Estado: aceite e publicada na v73. Desktop reserva sidebar com `margin-right`; drawer abre da direita; swipe de abertura começa na margem direita e move-se para a esquerda.

## D-039 — v74 aplica o novo protótipo como camada de experiência sem migrar o núcleo
Data: 8 de setembro de 2026 · Estado: aceite e publicada.

### Decisão

1. Preservar `core.js`, `finance.js`, IndexedDB, `STATE_VERSION = 5`, cofre, pagamentos e sincronização.
2. Consolidar o sistema visual em `design-system.css`.
3. Usar `v74-experience.css/js` como camada de composição que reutiliza IDs, dados e handlers existentes.
4. Priorizar no mobile Início, Despesas, Mercado, Planeamento e Mais.
5. Não inventar dados para imitar o protótipo.
6. Fotografias do Mercado são opcionais e verificadas.
7. Preservar a navegação v73 à direita e o mesmo hambúrguer/X.
8. Publicar apenas com regressões críticas verdes.

## D-040 — v75 torna o protótipo a referência visual final sem transformar demonstração em funcionalidade
Data: 8 de setembro de 2026 · Estado: aceite como candidata.

### Contexto

A primeira implementação v74 preservou a funcionalidade, mas a composição final ainda divergia significativamente do protótipo em densidade, navegação, formulários, scanner, Planeamento, Mais, Sincronização e cofre. Existia ainda uma regra histórica que podia ocultar o terceiro destino da navegação móvel.

### Decisão

1. Carregar `v75-architecture.css/js` depois da experiência v74 como camada final versionada.
2. Usar a identidade do protótipo — verde-petróleo, teal, superfícies claras, cartões compactos e hierarquia móvel — de forma uniforme também no desktop.
3. Garantir explicitamente cinco destinos móveis visíveis: **Início, Despesas, Mercado, Planeamento e Mais**.
4. Reutilizar o formulário real de despesas e acrescentar apenas apresentação para **Manual / Ler fatura / QR Code**.
5. Reutilizar `invoice-capture.js` para fotografia e QR e tornar apenas a composição do scanner full-screen.
6. Não inventar linhas de artigos a partir do QR fiscal, porque o QR não fornece catálogo detalhado de produtos.
7. Não adicionar lojas que o pipeline atual não suporta; a experiência permanece limitada a Continente e Pingo Doce.
8. Reorganizar Planeamento, Relatórios, Mais e Sincronização sem alterar os cálculos nem o estado persistido.
9. Reutilizar `icon.svg` local no onboarding/cofre; não introduzir dependência visual externa.
10. Manter PIN/palavra-passe, PBKDF2-SHA-256, AES-GCM, `STATE_VERSION = 5`, pagamentos, IndexedDB e sincronização intactos.
11. A camada v75 não pode chamar `saveState()` nem escrever diretamente `estimatedCents` ou `actualCents`.
12. Publicar apenas depois de CI completo, PR, CI do PR, merge e confirmação de Pages.

### Versionamento candidato

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu: `73-menu8`;
- experiência: `74-experience2`;
- arquitetura: `75-architecture2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.
