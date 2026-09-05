# TODO — Conta de Casa

Atualizado: 5 de setembro de 2026

## P0 — imagens oficiais Continente/Pingo Doce v60

- [x] Confirmar que o problema v59 não era CSS: a aplicação não recebia a fotografia oficial do retalhista.
- [x] Auditar as fontes públicas de Continente e Pingo Doce sem introduzir um proxy genérico.
- [x] Confirmar sitemap oficial de imagens do Continente.
- [x] Confirmar sitemap oficial de produtos/imagens do Pingo Doce.
- [x] Criar `scripts/refresh-retailer-image-index.cjs`.
- [x] Extrair PID/SKU + URL `image:loc` oficial.
- [x] Rejeitar hosts/caminhos de imagem fora dos catálogos oficiais.
- [x] Gerar shards por prefixo de PID para não descarregar o catálogo completo no iPhone.
- [x] Gerar shards por nome apenas para nomes exatos e únicos, destinados a itens antigos sem PID.
- [x] Exigir no mínimo 5 000 produtos por retalhista para impedir publicação silenciosa de um índice incompleto.
- [x] Tornar o SKU Continente `8167440` um controlo obrigatório do build.
- [x] Tornar o SKU Pingo Doce `739490` um controlo obrigatório do build.
- [x] Criar `market-official-images.js` com prioridade por `retalhista + pid`.
- [x] Manter Open Facts como fallback, sem rotular fallback como imagem oficial.
- [x] Impedir atribuição oficial por nome aproximado/fuzzy.
- [x] Permitir reparação de itens antigos apenas por nome oficial exato, único e não ambíguo.
- [x] Tornar a imagem oficial ampliável ao toque, reutilizando o visualizador existente.
- [x] Associar a fotografia oficial ao item quando um novo resultado de pesquisa é adicionado.
- [x] Persistir apenas `imageUrl`, `imageSource` e `imageMatchedAt`; não guardar binários.
- [x] Restringir `img-src` a `www.continente.pt` e `static.pingodoce.pt` para imagens oficiais.
- [x] Não adicionar Continente/Pingo Doce a `connect-src`.
- [x] Adicionar cache lazy dos shards no Service Worker v60.
- [x] Integrar geração do índice no CI e no workflow de Pages.
- [x] Adicionar `tests/market-official-images.test.cjs`.
- [x] Confirmar geração CI: Continente 100 474, Pingo Doce 16 018, nomes únicos 101 558.
- [x] Passar suite CI completa da branch (`33996921108`).
- [ ] Integrar a branch v60 em `main`.
- [ ] Confirmar CI de `main` com `success`.
- [ ] Confirmar Deploy Pages v60 com `success`.
- [ ] No iPhone/Safari, confirmar **Definições → Atualização de Software → v60**.
- [ ] Pesquisar Compressas Gaze Continente SKU 8167440 e confirmar fotografia oficial.
- [ ] Pesquisar Arroz Carolino Cigala Pingo Doce SKU 739490 e confirmar fotografia oficial.
- [ ] Confirmar toque na miniatura → imagem ampliada → fechar.
- [ ] Confirmar que um produto sem imagem oficial usa fallback/placeholder sem apresentar SKU diferente.
- [ ] Confirmar que novos produtos guardados mantêm a fotografia depois de fechar/reabrir a aplicação.
- [ ] Testar itens antigos com nome exato e itens ambíguos.

## P0 — validação física mobile

- [ ] Validar Mercado em 320, 375, 390 e 430 px no Safari/iPhone.
- [ ] Validar retrato e paisagem.
- [ ] Confirmar safe areas, barra inferior, pesquisa, filtros, cartões e diálogos sem scroll horizontal.
- [ ] Confirmar que as imagens oficiais usam `object-fit: contain` sem corte/deformação.
- [ ] Confirmar modo escuro e `prefers-reduced-motion`.
- [ ] Confirmar comportamento numa aba Safari e na PWA instalada no ecrã principal.

## P0 — Centro de Atualização

- [x] Atualizações automáticas ligadas ao Service Worker real.
- [x] Verificação manual com `registration.update()` e `SKIP_WAITING`.
- [x] Atualizações Beta mantidas desativadas sem pipeline própria.
- [x] Registar v60 em `APP_RELEASE_NOTES`.
- [ ] Validar fisicamente a transição v59 → v60 no iPhone/PWA.
- [ ] Testar verificação online, offline e após background.

## P0 — scanner e faturas

- [ ] Validar scanner EAN-13/EAN-8 em iPhone/Safari físico.
- [ ] Validar UPC/EAN em Android/Chrome físico.
- [ ] Testar permissões da câmara: permitir, recusar, revogar, cancelar e reabrir.
- [ ] Confirmar autofocus/exposição em embalagens brilhantes, pouca luz e códigos pequenos.
- [ ] Validar QR fiscal de uma fatura portuguesa real no iPhone.
- [ ] Validar captura QR por imagem da galeria em Android/Chrome.

## P0 — UI/ícones/cofre

- [x] Lucide definido como linguagem oficial de ícones.
- [x] Removida duplicação de `+`, lupa WebKit e setas duplicadas dos selects nas camadas auditadas.
- [x] Cofre visual modernizado sem simular passkey/biometria inexistente.
- [ ] Fazer revisão física final de ícones em iPhone/Android/desktop.
- [ ] Confirmar cofre, teclado PIN e alternativas de acesso em 320–430 px.

## P1 — qualidade das fontes externas

- [ ] Monitorizar disponibilidade e contrato do `cesta.pt/mcp`.
- [ ] Monitorizar formato de `search_products` e presença de `pid`.
- [ ] Monitorizar alterações dos índices/sitemaps Continente e Pingo Doce.
- [ ] Se um sitemap mudar, falhar fechado no build até nova auditoria — não relaxar validação automaticamente.
- [ ] Reavaliar Mercadona apenas quando existir fonte portuguesa verificável e estável.
- [ ] Monitorizar contratos Open Facts usados como fallback.

## P1 — acessibilidade e browser real

- [ ] Confirmar VoiceOver/leitor de ecrã nos botões icon-only e visualizador de imagem.
- [ ] Confirmar foco visível e fecho de `<dialog>` por teclado em desktop.
- [ ] Confirmar `prefers-reduced-motion` em browser/dispositivo real.
- [ ] Criar testes de browser real Safari/iOS quando houver infraestrutura adequada.

## P2 — manutenção

- [ ] Consolidar CSS legado depois de validação física das camadas finais.
- [ ] Remover progressivamente fallbacks Unicode restantes depois da validação Lucide.
- [ ] Avaliar consolidação de `market-experience`, scanners, imagens, ícones e update center no design system sem misturar com correções funcionais.
- [ ] Manter `PROJECT_STATE`, `ARCHITECTURE`, `DECISIONS`, `TODO` e `CHANGELOG` atualizados em cada release relevante.
