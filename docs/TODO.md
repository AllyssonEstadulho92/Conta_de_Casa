# TODO — Conta de Casa

## P0 — imagens oficiais no browser real v61

- [x] Rever a captura real do iPhone com placeholders após v60.
- [x] Confirmar que o defeito não era apenas ausência de fotografia na fonte.
- [x] Identificar os seletores reais dos cartões: `.market-result-source` e `[data-market-add-product]`.
- [x] Confirmar que `resultById`/funções de catálogo de `market-experience.js` permanecem privadas dentro do IIFE.
- [x] Remover da nova integração a dependência de reatribuição de funções privadas entre IIFEs.
- [x] Criar `market-official-images.js` baseado no contrato real do DOM + `pid`.
- [x] Resolver a página do SKU através do `cesta.pt` e validar cadeia/`pid`.
- [x] Validar imagens oficiais Continente por host, catálogo e `pid` exato.
- [x] Validar imagens oficiais Pingo Doce por host, pasta e `pid` exato.
- [x] Testar carregamento real da fotografia antes de remover o placeholder.
- [x] Manter máximo de três resoluções concorrentes e resolução progressiva por viewport.
- [x] Persistir URL/origem/data da fotografia depois do fluxo real de adicionar produto.
- [x] Não alterar `estimatedCents`, `actualCents`, quantidade ou qualquer cálculo financeiro.
- [x] Usar GET CORS simples no reader, sem cabeçalhos personalizados de imagem no novo bridge.
- [x] Alterar a sinalização da página do retalhista para **Ver no Pingo Doce / Ver no Continente**.
- [x] Manter a proveniência da fotografia separada: **Pingo Doce · imagem oficial / Continente · imagem oficial**.
- [x] Atualizar BUILD para v61, Service Worker, cache, Pages allowlist e Centro de Atualização.
- [x] Adicionar `tests/market-official-images.test.cjs`.
- [x] Alinhar testes de Mercado, imagens, atualização, ícones e responsividade com v61.
- [x] Passar CI funcional completo da branch (`34002655320`) com `success`.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG para v61.
- [x] Integrar `fix/market-official-images-v61` em `main` através do PR #33 (`7de15b501c0dadcf28f9e9c6c840075e53a3cc83`).
- [x] Confirmar CI de `main` verde após integração (`34002863628`).
- [x] Confirmar Deploy Pages v61 com sucesso (`34002880947`).
- [ ] No iPhone/Safari, confirmar **Definições → Atualização de Software → v61**.
- [ ] Repetir a pesquisa de ovos da captura e confirmar que o texto da loja é **Ver no Pingo Doce**.
- [ ] Confirmar que SKUs com fotografia oficial identificável deixam o placeholder e permitem ampliação.
- [ ] Confirmar que um SKU sem imagem oficial segura mantém placeholder sem mensagem enganadora.
- [ ] Validar 320, 375, 390 e 430 px, retrato/paisagem.
- [ ] Testar rede lenta, falha temporária do reader/CDN e offline; a falha de imagem não pode bloquear o produto.

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
- [ ] Monitorizar Open Facts como fallback, sem baixar o limiar de confiança apenas para preencher cartões.
- [ ] Testar amostra periódica de SKUs portugueses conhecidos, desconhecidos e variantes muito semelhantes.
- [ ] Criar testes de browser real Safari/iOS quando existir infraestrutura adequada.

## P1 — UI e acessibilidade

- [ ] Confirmar leitores de ecrã no Mercado, scanner, visualizador e QR de faturas.
- [ ] Confirmar nomes acessíveis em botões icon-only e `aria-hidden` em ícones decorativos.
- [ ] Confirmar `prefers-reduced-motion` em dispositivos reais.
- [ ] Consolidar CSS mobile duplicado apenas depois da validação física.

## P2 — manutenção

- [ ] Depois de validar v61 em hardware real, avaliar consolidação de `market-image-audit.js` e `market-official-images.js` para remover compatibilidade legada v60 sem risco.
- [ ] Remover progressivamente glifos Unicode antigos depois da validação Lucide.
- [ ] Avaliar remoção gradual de CSS substituído pelo design system.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança.
- [ ] Avaliar fonte única de versão depois de validar transições públicas reais do Centro de Atualização.
