# TODO — Conta de Casa

## P0 — validação v52

- [ ] Validar **Adicionar produto** em iPhone/Safari nas larguras 320, 375, 390 e 430 px.
- [ ] Testar pesquisas reais no Continente, Pingo Doce e Mercadona, incluindo resultados inexistentes.
- [ ] Confirmar teclado, safe areas, scroll e rotação retrato/paisagem.
- [ ] Testar rede lenta, offline, timeout e falha apenas de uma das fontes.
- [ ] Confirmar que adicionar um resultado preenche apenas `estimatedCents` e não altera `actualCents`.
- [ ] Confirmar que editar/eliminar itens antigos continua sem regressões.

## P1 — qualidade das fontes

- [ ] Monitorizar disponibilidade e contrato CORS de `cesta.pt/mcp`.
- [ ] Monitorizar alterações de formato da ferramenta `search_products`.
- [ ] Monitorizar cobertura e idade das observações Mercadona Portugal no Open Prices.
- [ ] Investigar uma fonte oficial Mercadona Portugal se vier a existir; preferi-la à fonte comunitária depois de auditoria.
- [ ] Criar testes de browser real para Safari/iOS quando existir infraestrutura adequada.

## P1 — UI e acessibilidade

- [ ] Validar tablet e desktop, incluindo ausência de scroll horizontal.
- [ ] Confirmar foco, navegação por teclado e leitores de ecrã no fluxo de pesquisa.
- [ ] Consolidar regras mobile duplicadas de `styles.css` e `design-system.css` após validação física.
- [ ] Rever texto legado abaixo de 12 px sem alterar páginas não validadas.

## P2 — manutenção

- [ ] Avaliar remoção gradual de CSS antigo já substituído pelo design system.
- [ ] Avaliar se `market-experience.css` deve permanecer isolado ou ser consolidado no design system.
- [ ] Manter PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG atualizados após mudanças relevantes.
