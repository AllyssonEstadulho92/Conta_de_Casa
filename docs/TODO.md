# TODO — Conta de Casa

## P0 — Centro de Atualização de Software v58

- [x] Criar uma entrada **Atualização de Software** em Definições sem alterar o schema do cofre.
- [x] Reproduzir a hierarquia funcional da referência iPhone: voltar, Atualizações Automáticas, Atualizações Beta, estado da versão e Mais detalhes.
- [x] Manter **Atualizações Automáticas — Ativado** ligado ao Service Worker real já usado pela aplicação.
- [x] Manter **Atualizações Beta — Desativado** enquanto não existir uma pipeline beta separada e auditada.
- [x] Implementar **Verificar atualizações** com `ServiceWorkerRegistration.update()` e `SKIP_WAITING` same-origin.
- [x] Centralizar as notas visíveis de cada versão em `APP_RELEASE_NOTES`.
- [x] Adicionar `app-update.js` e `app-update.css` à allowlist pública e ao cache offline.
- [x] Carimbar o bundle público `dist/` com versão v58 sem fazer uma substituição estrutural desnecessária do HTML fonte.
- [x] Garantir que a verificação de atualização não envia dados do cofre e não introduz endpoint externo.
- [x] Adicionar testes dedicados de atualização e alinhar os testes antigos com o cache v58.
- [x] Passar a suite CI completa na branch de implementação.
- [ ] Validar fisicamente em iPhone/Safari a entrada Definições → Atualização de Software em tema claro e escuro.
- [ ] Validar largura 320, 375, 390 e 430 px, incluindo safe areas e barras do Safari.
- [ ] Validar **Verificar atualizações** com rede disponível, offline e após regressar de background.
- [ ] Validar o fluxo numa PWA instalada no ecrã principal e numa aba normal do Safari.
- [ ] Confirmar uma transição pública real v58 → v59: deteção, instalação, `controllerchange`, reload e versão apresentada.
- [ ] A partir da próxima release, acrescentar sempre as mudanças relevantes a `APP_RELEASE_NOTES` antes do deploy.

## P0 — protótipo aprovado / hierarquia mobile v55

- [x] Comparar a captura real de **Lista de compras** no iPhone com o protótipo aprovado.
- [x] Manter o `+` principal no topo como ação de criação rápida e retirar a duplicação visual junto da pesquisa.
- [x] Transformar o controlo secundário junto da pesquisa numa ação visual de scanner, sem alterar o fluxo existente de adicionar/pesquisar produto.
- [x] Adicionar ícone de carrinho à hierarquia do título da página Compras.
- [x] Adicionar âncoras iconográficas aos quatro cartões financeiros sem alterar os valores/cálculos.
- [x] Refinar cartões mobile da lista com avatar vetorial neutro, estado, informação financeira e ações compactas.
- [x] Não inventar fotografias de produtos na revisão v55; a v57 passou depois a admitir fotografia real validada.
- [x] Ocultar o campo de preço real enquanto o item ainda está por comprar; manter o campo quando comprado.
- [x] Normalizar a navegação inferior e o indicador ativo.
- [x] Renovar o cache do Service Worker para obrigar Safari/iOS a receber a revisão visual.
- [x] Adicionar testes automatizados para a hierarquia aprovada e a métrica dos ícones contextuais.
- [ ] Validar fisicamente no iPhone/Safari a revisão v55 depois do deploy: título com carrinho, `+` principal, scanner junto da pesquisa, cartões com ícones e lista sem sobreposições.
- [ ] Repetir a validação em 320, 375, 390 e 430 px, retrato e paisagem.
- [ ] Confirmar tema escuro e `prefers-reduced-motion` em hardware/browser real.

## P0 — validação do cofre v56

- [x] Redesenhar visualmente o ecrã de desbloqueio com cartão moderno, teclado circular e hierarquia clara.
- [x] Preservar o PIN/palavra-passe e todos os eventos de desbloqueio existentes.
- [x] Não apresentar passkey/biometria enquanto não existir implementação real e auditada.
- [x] Preservar safe areas, tema escuro e `prefers-reduced-motion`.
- [x] Atualizar cache do Service Worker e testes de regressão visual/estrutural.
- [ ] Validar em iPhone/Safari físico nas larguras 320, 375, 390 e 430 px.
- [ ] Confirmar que teclado, Enter, apagar, palavra-passe e recuperação continuam acessíveis sem corte pelas barras do Safari.
- [ ] Validar Android/Chrome e desktop, incluindo tema escuro e orientação paisagem.

## P0 — validação Lucide e faturas

- [x] Auditar as fontes de ícones usadas pela aplicação e identificar mistura de SVG, glifos Unicode, controlos nativos e módulos contextuais.
- [x] Selecionar **Lucide Icons** como linguagem visual oficial da aplicação e fixar um snapshot de origem auditável.
- [x] Manter os SVG necessários localmente, sem icon font ou CDN de ícones em runtime.
- [x] Substituir a lupa nativa do Safari pela lupa Lucide com caixa fixa.
- [x] Substituir as setas nativas dos `select` por um único `ChevronDown` Lucide em iOS, Android e desktop.
- [x] Eliminar o `+` duplicado nos botões compactos de Faturas e Mercado causado por CSS legado + SVG.
- [x] Normalizar navegação, criação, edição, eliminação, privacidade, bloqueio, tema, sincronização, filtros, diálogos e scanners com ícones semânticos coerentes.
- [x] Distribuir o aviso de licença Lucide/Feather com a aplicação.
- [x] Adicionar cobertura automatizada para snapshot, licença, pesquisa, selects, botão `+`, sincronização e ausência de dependência remota de ícones.
- [ ] Confirmar fisicamente no iPhone/Safari a página **Faturas** da captura de referência: uma única lupa, um único botão `+`, uma única seta por seletor e ausência de ícones soltos/cortados.
- [ ] Confirmar a mesma página nas larguras 320, 375, 390 e 430 px, em retrato e paisagem.
- [ ] Confirmar visualmente tema claro/escuro, privacidade, bloqueio, atalhos, navegação, ações financeiras e diálogos em iPhone/Android/desktop.
- [ ] Confirmar que `prefers-reduced-motion` elimina rotação/pulsação não essencial em hardware/browser real.
- [ ] Confirmar em iPhone/Safari a leitura de QR de uma fatura portuguesa real, incluindo permissão da câmara, autofocus e fecho das tracks.
- [ ] Confirmar em Android/Chrome a leitura de QR por câmara e por imagem da galeria.

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

## P0 — validação v57 imagens reais

- [x] Remover o avatar vetorial que simulava fotografia na Lista de compras.
- [x] Mostrar fotografia real nos resultados e nos itens guardados quando há correspondência forte.
- [x] Restringir imagens a `images.openfoodfacts.org` e manter `credentials: omit` / `referrerPolicy: no-referrer`.
- [x] Persistir apenas URL/metadados; não guardar binários da fotografia no cofre.
- [ ] Validar em iPhone/Safari uma amostra de produtos embalados com fotografia e produtos sem correspondência.
- [ ] Confirmar visualmente 320, 375, 390 e 430 px sem deformação/corte da fotografia.

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
- [ ] Confirmar leitores de ecrã no bloco **Ler dados da fatura**, incluindo estado, pré-visualização e botões.
- [ ] Confirmar que ícones decorativos permanecem `aria-hidden` e que botões icon-only mantêm `aria-label` inteligível.
- [ ] Confirmar `prefers-reduced-motion` em dispositivo/browser real.
- [ ] Consolidar regras mobile duplicadas de `styles.css` e `design-system.css` após validação física.
- [ ] Rever texto legado abaixo de 12 px sem alterar páginas não validadas.

## P2 — manutenção

- [ ] Remover progressivamente os glifos Unicode de fallback que ainda permanecem no HTML/JS estático depois de a revisão Lucide estar validada fisicamente, sem alterar o contrato dos controlos.
- [ ] Migrar gradualmente os pequenos SVG locais de módulos contextuais para `CDCIcons.markup`, reduzindo duplicação de paths sem misturar esta refatoração com a validação v55.
- [ ] Avaliar remoção gradual de CSS antigo já substituído pelo design system.
- [ ] Avaliar se `market-experience.css`, `market-barcode.css`, `ui-icons.css`, `invoice-capture.css` e `app-update.css` devem permanecer isolados ou ser consolidados no design system após validação física.
- [ ] Avaliar OCR/PDF de faturas apenas com uma estratégia de validação explícita que não grave valores financeiros probabilísticos sem confirmação.
- [ ] Manter PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG atualizados após mudanças relevantes.
- [ ] Validar em dispositivo real o stepper −/+ e o subtotal automático para quantidades inteiras e decimais.
- [ ] Avaliar, depois da primeira transição real v58 → v59, se a carimbagem de versão deve passar de `prepare-pages.cjs` para uma fonte única de versão sem aumentar o risco de regressão.
