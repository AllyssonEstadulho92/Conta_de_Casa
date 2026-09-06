# TODO — Conta de Casa

## P0 — cartões vivos com fotografia oficial exclusiva v62

- [x] Rever o relato real após v61: fotografia apresentada não corresponde à imagem do site oficial.
- [x] Confirmar no código que `market-experience.js` ainda pode enriquecer resultados vivos com Open Food Facts por semelhança textual.
- [x] Confirmar que `market-image-audit.js` mantém fallbacks Open Food/Beauty/Products/Pet Facts.
- [x] Confirmar que `market-official-images.js` valida corretamente cadeia + `pid`, mas não tinha exclusividade sobre os pipelines anteriores.
- [x] Definir a regra: cartão vivo Pingo Doce/Continente só mostra imagem oficial do mesmo `pid`; caso contrário, placeholder.
- [x] Criar `market-retailer-image-policy.js` sem nova fonte de rede.
- [x] Excluir cartões vivos do fallback legado através de `data-market-image-audit="done"`.
- [x] Validar imagens já presentes apenas por `CDCOfficialMarketImages.safeOfficialImageUrl`.
- [x] Remover qualquer imagem não oficial/variante e restaurar placeholder.
- [x] Vigiar alterações posteriores de `src` para impedir reintrodução de fallback.
- [x] Manter **Ver no Pingo Doce / Ver no Continente** separado da proveniência da fotografia.
- [x] Após adicionar, limpar metadados visuais auxiliares quando não existir imagem oficial segura.
- [x] Preservar Open Facts para scanner/compatibilidade fora dos cartões vivos.
- [x] Atualizar BUILD para v62, cache, Service Worker, Pages e Centro de Atualização.
- [x] Incluir a nova política no syntax check da CI.
- [x] Alinhar testes de Mercado, imagens, auditoria, ícones, atualização e responsividade com v62.
- [x] Passar CI funcional completo da branch (`34008447948`) com `success`.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG para v62.
- [x] Integrar `fix/market-retailer-images-v62` em `main` através do PR #34 (`231e445839f07316344719b7423890c6e2e99c47`).
- [x] Confirmar CI de `main` verde após integração (`34008497654`).
- [x] Confirmar Deploy Pages v62 com sucesso (`34008513566`).
- [ ] No iPhone/Safari, confirmar **Definições → Atualização de Software → v62**.
- [ ] Repetir a pesquisa que mostrou imagem errada e abrir **Ver no Pingo Doce/Continente** para comparar o mesmo SKU.
- [ ] Confirmar que a miniatura corresponde à fotografia oficial do mesmo `pid`.
- [ ] Confirmar que um SKU sem imagem oficial validável mantém placeholder, sem imagem aproximada.
- [ ] Validar 320, 375, 390 e 430 px, retrato/paisagem.
- [ ] Testar rede lenta, falha temporária do reader/CDN e offline; falha de imagem não pode bloquear o produto.

## P0 — bridge oficial v61 concluído

- [x] Identificar seletores reais `.market-result-source` e `[data-market-add-product]`.
- [x] Criar `market-official-images.js` baseado no contrato real do DOM + `pid`.
- [x] Resolver página do SKU via `cesta.pt` e validar cadeia/`pid`.
- [x] Validar imagens oficiais Continente/Pingo Doce por host, catálogo e `pid` exato.
- [x] Testar carregamento real antes de remover placeholder.
- [x] Usar GET CORS simples no reader.
- [x] Integrar PR #33 em `main` (`7de15b501c0dadcf28f9e9c6c840075e53a3cc83`).
- [x] CI de `main` v61 (`34002863628`) e Deploy Pages (`34002880947`) concluídos com sucesso.

## P0 — regressões essenciais a manter

- [x] Cofre isolado por utilizador e credenciais fora do código público.
- [x] PBKDF2 + AES-GCM e IndexedDB preservados.
- [x] Faturas, datas civis, pagamentos e totais financeiros cobertos por CI.
- [x] Mercado mantém `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário continua coberta por invariantes.
- [x] QR de faturas permanece preenchimento assistido e local.
- [x] Scanner GTIN permanece identificação assistida, sem adicionar automaticamente o primeiro resultado.
- [x] Lucide permanece sistema de ícones local/offline.
- [x] Centro de Atualização continua same-origin através do Service Worker.
- [x] CSP/segurança, responsividade, viewport, navegação, acessibilidade e sincronização cobertos por CI.

## P0 — validação física acumulada

- [ ] Validar cofre em iPhone/Safari nas larguras 320, 375, 390 e 430 px.
- [ ] Validar página Faturas: lupa única, `+` único, setas de selects e ausência de cortes.
- [ ] Validar QR fiscal por câmara no iPhone e Android.
- [ ] Validar scanner EAN/UPC/GTIN em iPhone/Safari e Android/Chrome.
- [ ] Testar permitir/recusar/revogar câmara, autofocus, baixa luz e fecho das tracks.
- [ ] Validar visualizador de imagens, safe areas, tema claro/escuro e `prefers-reduced-motion` em hardware real.
- [ ] Validar tablet/desktop sem scroll horizontal e com navegação consistente.

## P1 — qualidade das fontes externas

- [ ] Monitorizar disponibilidade e contrato de `cesta.pt/mcp`.
- [ ] Monitorizar formato de `search_products` e presença de `pid`/URL oficial.
- [ ] Monitorizar CORS/formato de `r.jina.ai`.
- [ ] Monitorizar hosts e caminhos de CDN oficiais Continente/Pingo Doce.
- [ ] Manter Open Facts fora dos cartões vivos de retalhista; qualquer utilização futura nesse contexto exige decisão técnica explícita.
- [ ] Testar amostra periódica de SKUs portugueses conhecidos, desconhecidos e variantes muito semelhantes.
- [ ] Criar testes de browser real Safari/iOS quando existir infraestrutura adequada.

## P1 — UI e acessibilidade

- [ ] Confirmar leitores de ecrã no Mercado, scanner, visualizador e QR de faturas.
- [ ] Confirmar nomes acessíveis em botões icon-only e `aria-hidden` em ícones decorativos.
- [ ] Confirmar `prefers-reduced-motion` em dispositivos reais.
- [ ] Consolidar CSS mobile duplicado apenas depois da validação física.

## P2 — manutenção

- [ ] Depois de validar v62 em hardware real, consolidar `market-experience.js`, `market-image-audit.js`, `market-retailer-image-policy.js` e `market-official-images.js` para remover duplicação/compatibilidade legada sem regressão.
- [ ] Remover progressivamente glifos Unicode antigos depois da validação Lucide.
- [ ] Avaliar remoção gradual de CSS substituído pelo design system.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança.
- [ ] Avaliar fonte única de versão depois de validar transições públicas reais do Centro de Atualização.
