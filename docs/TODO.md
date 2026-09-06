# TODO — Conta de Casa

## P0 — imagens oficiais e catálogo alargado v60

- [x] Confirmar a causa das miniaturas vazias: a v59 não lia a imagem do SKU oficial do retalhista.
- [x] Auditar os exemplos reais Continente `8167440` e Pingo Doce `739490`.
- [x] Confirmar que as páginas oficiais não fornecem CORS direto utilizável pela PWA.
- [x] Validar `r.jina.ai` como reader restrito e rejeitar Microlink como fonte por devolver conteúdo genérico em pelo menos um caso.
- [x] Implementar `safeRetailerProductUrl()` para aceitar apenas páginas oficiais com `pid` válido.
- [x] Implementar `safeRetailerImageUrl()` com validação estrita de host, catálogo, formato e `pid`.
- [x] Priorizar imagem oficial do SKU antes de GTIN/Open Facts/text matching.
- [x] Manter Open Facts como fallback e placeholder quando não existe correspondência segura.
- [x] Alargar a pesquisa para `limit:20` e até 40 resultados normalizados sem mudar os eventos existentes.
- [x] Introduzir `IntersectionObserver` e manter máximo de três resoluções concorrentes.
- [x] Fazer o botão `+` aguardar a tentativa de imagem oficial sem bloquear a adição se a imagem falhar.
- [x] Reavaliar itens guardados pelo nome apenas com correspondência forte e não ambígua.
- [x] Atualizar CSP pública apenas com `r.jina.ai`, `www.continente.pt` e `static.pingodoce.pt`, além dos hosts Open Facts já autorizados.
- [x] Atualizar BUILD para v60, Service Worker, cache e `APP_RELEASE_NOTES`.
- [x] Atualizar testes de Mercado, imagens, atualização, responsividade e ícones para v60.
- [x] Passar CI funcional completo da branch (`34001300466`) com probe real dos dois SKUs e todas as regressões verdes.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE e DECISIONS para v60.
- [x] Atualizar TODO e CHANGELOG para v60.
- [x] Integrar `fix/retailer-product-images-v60` em `main` através do PR #32.
- [x] Confirmar CI de `main` verde após integração (`34001564991`).
- [x] Confirmar Deploy Pages v60 com sucesso (`34001581207`).
- [ ] No iPhone/Safari, confirmar **Definições → Atualização de Software → v60**.
- [ ] Pesquisar o Continente `8167440` e confirmar miniatura oficial + ampliação.
- [ ] Pesquisar o Pingo Doce `739490` e confirmar miniatura oficial + ampliação.
- [ ] Testar pesquisas amplas — café, arroz, leite, detergente — e confirmar maior variedade de resultados.
- [ ] Validar carregamento progressivo e zoom em 320, 375, 390 e 430 px.
- [ ] Testar rede lenta/offline e confirmar que falha de imagem não bloqueia pesquisa/adicionar produto.

## P0 — auditoria e ampliação de imagens v59

- [x] Auditar cada resultado de produto individualmente quando a miniatura estiver em falta.
- [x] Priorizar GTIN/EAN exato quando já existe no item.
- [x] Para resultados Continente, tentar resolver EAN através do `pid`/`get_product` do mesmo fluxo cesta.pt.
- [x] Expandir a pesquisa de fotografia para Open Food Facts, Open Beauty Facts, Open Products Facts e Open Pet Food Facts.
- [x] Manter limiar mínimo de correspondência e placeholder quando não existir fotografia segura.
- [x] Limitar resoluções concorrentes para evitar rajadas de pedidos em pesquisas grandes.
- [x] Tornar miniaturas reais tácteis/clicáveis e abrir imagem ampliada em `<dialog>`.
- [x] Implementar fecho por botão, Esc e backdrop, com safe areas, dark mode e `prefers-reduced-motion`.
- [x] Persistir `imageUrl`, `imageSource`, `imageMatchedAt` e código comprovável para itens guardados, sem binários.
- [x] Não introduzir proxy genérico de scraping nem credenciais externas na v59.
- [x] Atualizar CSP pública, allowlist Pages, Service Worker, cache v59 e `APP_RELEASE_NOTES`.
- [x] Adicionar `tests/market-image-audit.test.cjs` e executar a suite CI completa com sucesso.
- [x] Integrar a branch v59 em `main` e confirmar CI principal verde (`33995349723`).
- [x] Confirmar Deploy Pages v59 com sucesso (`33995368314`).
- [ ] Validar toque na miniatura → imagem ampliada → fechar nas larguras 320, 375, 390 e 430 px.
- [ ] Confirmar tema claro/escuro e orientação retrato/paisagem no visualizador.
- [ ] Confirmar que produtos sem registo público seguro permanecem com placeholder em vez de receber fotografia aproximada.

## P0 — Centro de Atualização de Software v58

- [x] Criar uma entrada **Atualização de Software** em Definições sem alterar o schema do cofre.
- [x] Reproduzir a hierarquia funcional da referência iPhone: voltar, Atualizações Automáticas, Atualizações Beta, estado da versão e Mais detalhes.
- [x] Manter **Atualizações Automáticas — Ativado** ligado ao Service Worker real já usado pela aplicação.
- [x] Manter **Atualizações Beta — Desativado** enquanto não existir uma pipeline beta separada e auditada.
- [x] Implementar **Verificar atualizações** com `ServiceWorkerRegistration.update()` e `SKIP_WAITING` same-origin.
- [x] Centralizar as notas visíveis de cada versão em `APP_RELEASE_NOTES`.
- [x] Adicionar `app-update.js` e `app-update.css` à allowlist pública e ao cache offline.
- [x] Garantir que a verificação de atualização não envia dados do cofre.
- [x] Adicionar testes dedicados de atualização.
- [ ] Validar fisicamente em iPhone/Safari a entrada Definições → Atualização de Software em tema claro e escuro.
- [ ] Validar largura 320, 375, 390 e 430 px, incluindo safe areas e barras do Safari.
- [ ] Validar **Verificar atualizações** online/offline/background.
- [ ] Validar o fluxo numa PWA instalada e numa aba normal do Safari.

## P0 — protótipo aprovado / hierarquia mobile v55

- [x] Comparar a captura real de **Lista de compras** no iPhone com o protótipo aprovado.
- [x] Manter o `+` principal no topo como ação de criação rápida e retirar duplicação visual junto da pesquisa.
- [x] Transformar o controlo secundário junto da pesquisa numa ação visual de scanner.
- [x] Adicionar ícone de carrinho ao título de Compras.
- [x] Adicionar âncoras iconográficas aos quatro cartões financeiros sem alterar cálculos.
- [x] Refinar cartões mobile e normalizar navegação inferior.
- [ ] Validar fisicamente no iPhone/Safari em 320, 375, 390 e 430 px, retrato/paisagem.
- [ ] Confirmar tema escuro e `prefers-reduced-motion` em hardware real.

## P0 — validação do cofre v56

- [x] Redesenhar visualmente o ecrã de desbloqueio com cartão moderno e teclado circular.
- [x] Preservar PIN/palavra-passe e eventos de desbloqueio.
- [x] Não apresentar passkey/biometria sem implementação real.
- [x] Preservar safe areas, tema escuro e redução de movimento.
- [ ] Validar em iPhone/Safari nas larguras 320, 375, 390 e 430 px.
- [ ] Validar Android/Chrome e desktop.

## P0 — validação Lucide e faturas

- [x] Auditar as fontes de ícones e selecionar **Lucide Icons** como linguagem oficial.
- [x] Manter SVG local, sem icon font/CDN em runtime.
- [x] Corrigir lupa Safari, setas de `select`, `+` duplicado e sincronização.
- [x] Normalizar navegação, criação, edição, eliminação, filtros, scanners e diálogos.
- [x] Distribuir licença e adicionar testes.
- [ ] Confirmar fisicamente iPhone/Safari, Android/Chrome e desktop.
- [ ] Confirmar leitor QR de fatura em dispositivos reais.

## P0 — validação Mercado / scanner

- [x] Testar pesquisas reais Continente e Pingo Doce.
- [x] Confirmar separação `estimatedCents` / `actualCents` e quantidade × preço.
- [x] Validar CSP, normalização de conteúdo remoto e ausência de API keys dos retalhistas.
- [x] Cobrir GTIN/checksum, lifecycle da câmara e privacidade por testes.
- [ ] Validar scanner EAN/UPC em iPhone/Safari e Android/Chrome físicos.
- [ ] Testar permissões da câmara, autofocus, baixa luz e lanterna em hardware.
- [ ] Confirmar que código reconhecido nunca adiciona automaticamente um produto sem confirmação.

## P1 — qualidade das fontes

- [ ] Monitorizar disponibilidade/contrato de `cesta.pt/mcp`.
- [ ] Monitorizar alterações de formato de `search_products` e `get_product`.
- [ ] Monitorizar `r.jina.ai` e alterações de formato/CORS do reader.
- [ ] Monitorizar domínios/paths de imagem oficiais Continente/Pingo Doce e atualizar allowlist apenas após auditoria.
- [ ] Monitorizar endpoints Open Facts usados como fallback.
- [ ] Testar amostras periódicas de GTIN e SKUs portugueses conhecidos/desconhecidos.
- [ ] Reavaliar Mercadona apenas se surgir fonte oficial portuguesa suficientemente completa e verificável.
- [ ] Criar testes de browser real para Safari/iOS quando existir infraestrutura adequada.

## P1 — UI e acessibilidade

- [ ] Validar tablet/desktop em browser real e ausência de scroll horizontal.
- [x] Confirmar por testes automatizados foco, acessibilidade e navegação sem regressões globais.
- [ ] Confirmar leitores de ecrã no Mercado, scanner, visualizador e captura de faturas.
- [ ] Confirmar `aria-label` nos botões icon-only e `aria-hidden` em elementos decorativos.
- [ ] Confirmar `prefers-reduced-motion` em dispositivo real.
- [ ] Consolidar regras mobile duplicadas apenas depois da validação física.

## P2 — manutenção

- [ ] Remover progressivamente glifos Unicode de fallback após validação física Lucide.
- [ ] Migrar pequenos SVG contextuais para `CDCIcons.markup`.
- [ ] Avaliar remoção gradual de CSS substituído pelo design system.
- [ ] Avaliar consolidação das camadas contextuais após validação física.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança.
- [x] Manter PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG atualizados para v60.
- [ ] Validar em dispositivo real o stepper −/+ e subtotais automáticos.
- [ ] Avaliar fonte única de versão depois de validar transições públicas reais do Centro de Atualização.
