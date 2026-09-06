# TODO — Conta de Casa

## P0 — hotfix iPhone/Safari: Mercado e sincronização

- [x] Reproduzir visualmente o cartão do browser com grande área vazia e texto comprimido à direita.
- [x] Identificar o risco de auto-placement do Grid com o nó histórico de fotografia oculto.
- [x] Fixar explicitamente `.market-product-copy` na coluna útil e `.market-add-product` na coluna da ação.
- [x] Reorganizar internamente nome, embalagem/loja, estado/origem e preço.
- [x] Adicionar reflow dedicado abaixo de 360 px.
- [x] Impedir quebra destrutiva de estado, preço e ligação da loja.
- [x] Reduzir o aviso do browser para uma cópia curta e coerente com a experiência text-first.
- [x] Identificar a causa lógica do estado `Conflito / 0 diferenças`: metadados auxiliares fora dos campos de negócio visíveis.
- [x] Criar `sync-conflict-policy.js` para tratar `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` como diferenças técnicas.
- [x] Garantir que preço, quantidade, estado de compra e restantes campos financeiros continuam a gerar conflitos reais.
- [x] Renovar o cache público para `conta-de-casa-public-v62-market-ui2` e usar revisão `62-ui2` nos assets alterados.
- [x] Adicionar testes de regressão do layout e da política de conflitos.
- [x] Executar CI completa da branch.
- [x] Rever diff final do PR.
- [x] Integrar PR #38 em `main` apenas com CI verde.
- [x] Confirmar CI de `main` após o merge.
- [x] Confirmar Deploy Pages com sucesso.
- [ ] Validar novamente em iPhone/Safari 320, 375, 390 e 430 px.
- [ ] Confirmar em hardware real que não existe coluna vazia nem compressão letra a letra nos resultados.
- [ ] Confirmar que um conflito técnico antigo desaparece após “Comparar novamente”/nova sincronização.

## P0 — identidade visual do Mercado sem fotografias

- [x] Confirmar a decisão de produto: o nome correspondente é suficiente; fotografias de produto deixam de ser requisito da interface.
- [x] Preservar preços, quantidades, estados, cálculos, cofre e sincronização.
- [x] Criar `market-brand.css` como camada visual isolada.
- [x] Remover visualmente fotografias e placeholders da lista e dos resultados.
- [x] Reconfigurar cards móveis para `checkbox + conteúdo + estado`.
- [x] Reconfigurar resultados para `conteúdo + ação +`, sem coluna reservada a imagem.
- [x] Aplicar identidade azul/ink com verde, âmbar e violeta nos estados financeiros.
- [x] Refinar bordas, raios, sombras, tipografia e navegação inferior.
- [x] Criar `market-branding.js` para tornar a informação de origem coerente com a experiência sem fotografias.
- [x] Garantir que a camada de branding não acede ao estado financeiro.
- [x] Incluir os novos assets no bundle GitHub Pages e no Service Worker.
- [x] Alargar `tests/market-experience.test.cjs` para cobrir a apresentação.
- [x] Executar CI e publicar a primeira revisão.
- [ ] Concluir validação física após o hotfix atual.

## P0 — regressões essenciais a manter

- [x] Cofre isolado por utilizador e credenciais fora do código público.
- [x] PBKDF2 + AES-GCM e IndexedDB preservados.
- [x] Faturas, datas civis, pagamentos e totais financeiros cobertos por CI.
- [x] Mercado mantém `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário continua coberta por invariantes.
- [x] QR de faturas permanece preenchimento assistido e local.
- [x] Scanner GTIN permanece identificação assistida e não define o preço.
- [x] Lucide permanece sistema de ícones local/offline.
- [x] Centro de Atualização continua same-origin através do Service Worker.
- [x] CSP/segurança, responsividade, viewport, navegação, acessibilidade e sincronização continuam cobertos por CI.

## P0 — validação física acumulada

- [ ] Validar cofre em iPhone/Safari nas larguras 320, 375, 390 e 430 px.
- [ ] Validar página Faturas: lupa única, `+` único, selects e ausência de cortes.
- [ ] Validar QR fiscal por câmara no iPhone e Android.
- [ ] Validar scanner EAN/UPC/GTIN em iPhone/Safari e Android/Chrome.
- [ ] Testar permitir/recusar/revogar câmara, autofocus, baixa luz e fecho das tracks.
- [ ] Validar tablet/desktop sem scroll horizontal e com navegação consistente.

## P1 — pipeline histórico de imagens

A validação visual de correspondência de fotografias da v62 deixa de ser requisito da UI atual, porque D-018 substitui a apresentação por uma experiência sem fotografias.

- [ ] Depois de validar a nova interface, confirmar se `market-retailer-image-policy.js`, `market-image-audit.js`, `market-official-images.js` e `market-image-audit.css` ainda são necessários no bundle público.
- [ ] Rever também o enriquecimento auxiliar de imagem em `market-experience.js`.
- [ ] Se não existirem dependências, remover o pipeline numa alteração separada com revisão de CSP, Service Worker e testes.
- [ ] Preservar compatibilidade com dados antigos que ainda contenham `imageUrl`, `imageSource` e `imageMatchedAt`.
- [ ] Manter Open Food Facts quando necessário para identificação por código de barras, independentemente da remoção da fotografia.

## P1 — UI e acessibilidade

- [ ] Confirmar leitores de ecrã no Mercado, scanner e QR de faturas.
- [ ] Confirmar nomes acessíveis em botões icon-only e `aria-hidden` em ícones decorativos.
- [ ] Confirmar `prefers-reduced-motion` em dispositivos reais.
- [ ] Rever contraste dos quatro estados cromáticos em tema claro e escuro.
- [ ] Consolidar CSS mobile duplicado apenas depois da validação física.

## P2 — manutenção

- [ ] Remover progressivamente glifos Unicode antigos depois da validação Lucide.
- [ ] Avaliar remoção gradual de CSS substituído pelo design system.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança.
- [ ] Avaliar fonte única de versão depois de validar transições públicas reais do Centro de Atualização.
