# TODO — Conta de Casa

## P0 — Release v63: consistência visual global e atualização controlada

- [x] Confirmar em capturas reais a dupla barra azul no item ativo da navegação inferior.
- [x] Identificar a causa: `::before` do design system combinado com `::after` de camadas visuais posteriores.
- [x] Confirmar em captura real a faixa superior azul segmentada/pontilhada nos cartões-resumo.
- [x] Identificar a causa: `market-summary-item::before` usado simultaneamente como ícone semântico e faixa cromática.
- [x] Criar `ui-consistency.css` como última camada de apresentação, sem acesso a estado financeiro.
- [x] Uniformizar `.ui-icon-svg` e `.svg-icon` com métrica Lucide final (`stroke-width:2`, linecap/linejoin arredondados e tamanhos contextuais).
- [x] Manter apenas `::before` como indicador ativo da navegação mobile e desativar `::after` redundante.
- [x] Substituir a faixa de pseudo-elemento dos cartões-resumo por um `inset` sólido e contínuo.
- [x] Reservar `market-summary-item::before` exclusivamente ao ícone semântico.
- [x] Ajustar `Mercearia / Despensa` para um ícone local mais adequado do que o carrinho.
- [x] Preservar o agrupamento por categoria e o alinhamento à esquerda da Lista de compras.
- [x] Subir o build formal para `v63`.
- [x] Criar e distribuir `release-manifest.json` como histórico público de versões.
- [x] Fazer o build falhar se `latestVersion` do manifesto divergir do build público.
- [x] Fazer o Centro de Atualização consultar apenas o manifesto same-origin com `cache: no-store`.
- [x] Preparar o Service Worker para aguardar confirmação do utilizador antes de ativar uma atualização.
- [x] Preservar compatibilidade `SKIP_WAITING` com clientes v62 e usar `APPLY_UPDATE` no novo fluxo.
- [x] Restringir cache-busting a um único parâmetro `v` ou `ts` e sempre à allowlist pública explícita.
- [x] Renovar cache candidato para `conta-de-casa-public-v63-ui2`.
- [x] Criar `tests/ui-consistency.test.cjs` e integrar na CI.
- [x] Atualizar regressões antigas que estavam fixas na revisão/cache v62.
- [x] Obter CI completa verde na branch com finanças, segurança, responsividade, navegação, acessibilidade, Mercado, atualização e sincronização.
- [ ] Rever o diff final contra `main`.
- [ ] Abrir PR da v63 para `main`.
- [ ] Integrar a v63 apenas com CI do PR verde.
- [ ] Confirmar CI de `main` após merge.
- [ ] Confirmar Deploy GitHub Pages da v63.
- [ ] Validar no iPhone/Safari que existe apenas uma barra ativa na navegação inferior.
- [ ] Validar no iPhone/Safari que a faixa dos cartões-resumo é sólida e contínua.
- [ ] Validar visualmente a uniformidade dos ícones em Início, Faturas, Compras, Relatórios, Segurança e Definições.
- [ ] Testar **Definições → Atualização de Software** e confirmar instalação da v63 num dispositivo real.
- [ ] Validar tema claro/escuro e larguras 320, 375, 390 e 430 px.

## P0 — Lista de compras agrupada por categoria

- [x] Confirmar necessidade de reduzir a repetição visual da lista mobile.
- [x] Reutilizar a categoria já existente no modelo, sem alterar schema.
- [x] Criar `market-category-groups.js` como camada de apresentação isolada.
- [x] Criar `market-category-groups.css` com grupos compactos e recolhíveis em mobile.
- [x] Preservar a ordem dos itens já calculada por filtros/ordenação.
- [x] Definir ordem previsível para as categorias conhecidas do Mercado.
- [x] Preservar checkbox, editar, eliminar e preço real através dos mesmos nós/atributos existentes.
- [x] Adicionar separadores por categoria na tabela desktop.
- [x] Manter branding/sincronização em `62-ui2` e isolar os novos assets em `62-ui3`.
- [x] Renovar o cache público sem perder a identificação da revisão anterior.
- [x] Adicionar `tests/market-category-groups.test.cjs`.
- [x] Integrar o novo teste na CI e no Deploy Pages.
- [x] Executar CI completa da branch de agrupamento.
- [x] Rever diff final do PR #40.
- [x] Integrar PR #40 em `main` apenas com CI verde.
- [x] Confirmar CI de `main` com sucesso.
- [x] Confirmar Deploy GitHub Pages com sucesso.
- [ ] Validar no iPhone/Safari categorias com 1 e vários itens após instalar a v63.
- [ ] Validar expandir/recolher, pesquisa, filtros, checkbox, editar, eliminar e preço real.

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
- [ ] Confirmar em hardware real, após v63, que não existe coluna vazia nem compressão letra a letra nos resultados.
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
- [ ] Concluir validação física após instalar a v63.

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
- [ ] Consolidar CSS mobile substituído/duplicado além dos conflitos corrigidos na v63, apenas após validação física.

## P2 — manutenção

- [ ] Remover progressivamente glifos Unicode antigos depois da validação Lucide.
- [ ] Avaliar remoção gradual de CSS substituído pelo design system.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança.
- [ ] Avaliar fonte única de versão depois de validar transições públicas reais do Centro de Atualização.
