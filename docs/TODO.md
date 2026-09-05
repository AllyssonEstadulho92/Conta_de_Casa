# TODO — Conta de Casa

## P0 — validação v53

- [ ] Validar **Adicionar produto** em iPhone/Safari nas larguras 320, 375, 390 e 430 px em hardware/browser real.
- [x] Testar pesquisas reais no Continente e Pingo Doce, incluindo resposta sem preço verificável.
- [ ] Confirmar em hardware real teclado, safe areas, scroll e rotação retrato/paisagem.
- [x] Validar timeout, cancelamento de pesquisa e tolerância a indisponibilidade parcial ao nível do runtime/testes automatizados.
- [x] Confirmar que adicionar um resultado preenche `estimatedCents` e mantém `actualCents: 0`.
- [x] Confirmar regressões de edição/eliminação de itens antigos através da suite de formulários e Mercado.
- [x] Confirmar que **Estimado total** e **Por comprar** incluem o preço selecionado e que **Gasto contabilizado** usa `actualCents` quando existe ou a estimativa pesquisada quando o item já foi marcado como comprado.
- [x] Validar CSP, allowlist de origens, escaping/normalização de conteúdo remoto e ausência de credenciais/API keys de retalhistas.
- [x] Adicionar cobertura automatizada para wiring, GTIN/checksum, lifecycle da câmara, privacidade e passagem do scanner para a pesquisa real.
- [ ] Validar o scanner em iPhone/Safari físico com EAN-13 e EAN-8 reais.
- [ ] Validar o scanner em Android/Chrome físico com EAN-13/UPC e câmara traseira.
- [ ] Testar permitir, recusar e revogar permissão da câmara; cancelar e reabrir o leitor; sair da app com a câmara ativa.
- [ ] Confirmar autofocus/exposição em embalagens brilhantes, códigos pequenos, pouca luz e distância curta/média.
- [ ] Confirmar botão de lanterna apenas em hardware que realmente exponha suporte.
- [ ] Confirmar que um código reconhecido nunca adiciona automaticamente o primeiro produto/preço sem confirmação do utilizador.

## P1 — qualidade das fontes

- [ ] Monitorizar disponibilidade e contrato CORS de `cesta.pt/mcp`.
- [ ] Monitorizar alterações de formato da ferramenta `search_products`.
- [ ] Monitorizar disponibilidade/contrato do endpoint de leitura do Open Food Facts usado para identificação GTIN.
- [ ] Testar uma amostra de GTIN portugueses conhecidos, desconhecidos e com dados incompletos no Open Food Facts.
- [ ] Confirmar em amostra real que a pesquisa derivada de marca + nome não seleciona silenciosamente uma variante diferente no retalhista.
- [ ] Monitorizar a versão fixa do `@zxing/browser` e rever segurança/compatibilidade antes de qualquer atualização.
- [ ] Reavaliar Mercadona apenas se surgir uma fonte oficial portuguesa de catálogo/preços.
- [ ] Criar testes de browser real para Safari/iOS quando existir infraestrutura adequada.

## P1 — UI e acessibilidade

- [ ] Validar tablet e desktop em browser real, incluindo ausência de scroll horizontal.
- [x] Confirmar por testes automatizados a fundação de foco, acessibilidade e navegação do fluxo sem regressões globais.
- [ ] Confirmar leitores de ecrã em browser/dispositivo real no fluxo de pesquisa e no estado do scanner.
- [ ] Confirmar `prefers-reduced-motion` em dispositivo/browser real.
- [ ] Consolidar regras mobile duplicadas de `styles.css` e `design-system.css` após validação física.
- [ ] Rever texto legado abaixo de 12 px sem alterar páginas não validadas.

## P2 — manutenção

- [ ] Avaliar remoção gradual de CSS antigo já substituído pelo design system.
- [ ] Avaliar se `market-experience.css` e `market-barcode.css` devem permanecer isolados ou ser consolidados no design system após validação física.
- [ ] Manter PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG atualizados após mudanças relevantes.
- [ ] Validar em dispositivo real o stepper −/+ e o subtotal automático para quantidades inteiras e decimais.
