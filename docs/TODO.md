# TODO — Conta de Casa

Atualizado: 15 de setembro de 2026

## P0 — Invariantes

- [x] `STATE_VERSION = 5`.
- [x] Dinheiro em cêntimos inteiros.
- [x] PBKDF2-SHA-256 + AES-GCM, 250000 iterações.
- [x] IndexedDB financeiro preservado.
- [x] `estimatedCents` separado de `actualCents`.
- [x] `marketId|pid` definido como identidade canónica.
- [x] UI/UX e migração sem alteração silenciosa de domínio.

## P0 — Auth / Safari / iOS

- [x] PIN local abre aplicação sem depender de sync.
- [x] `[hidden]` impede cofre e shell simultâneos.
- [x] Formulário de despesa mobile usa um único scroll owner após PR #132.
- [x] PR #150 introduziu `100svh`, safe areas e topo seguro para Safari/iOS.
- [x] PR #152 / `76-auth-prototype-final1`: autoridade visual única do cofre.
- [x] PR #152: keypad mobile 56 px com gaps 30/16 px; fallbacks estreitos/baixos preservados.
- [x] PR #154 / `76-auth-exclusive-state1`: `hidden` é autoridade também entre criação e desbloqueio.
- [x] PR #154: testes protegem exclusividade do estado e decisão do runtime.
- [x] PR #158 / `76-auth-spacing3`: ritmo vertical compactado sem alterar a geometria aprovada do keypad.
- [x] PR #158: `#vaultMessage:empty` deixa de reservar altura; cache PWA invalidado com `auth-spacing3`.
- [x] PR #158: TypeScript, CI e Pages verdes.
- [ ] Confirmar `76-auth-spacing3` no mesmo iPhone/Safari web e PWA instalada.
- [ ] Validar estado sem cofre num browser/perfil limpo.
- [ ] Validar portrait/landscape e teclado virtual.
- [ ] Criar E2E WebKit/Chromium para criação/desbloqueio → Dashboard → drawer → Despesas → Adicionar.

## P0 — Despesas/Faturas

- [x] Pesquisa, filtros, resumo e lista canónicos restaurados.
- [x] Fluxo Adicionar despesa profissionalizado.
- [x] Modos Manual / Ler fatura / QR estabilizados.
- [x] Hotfix touch/scroll Safari PR #132.
- [x] PR #140 / `76-bills-mobile-filters1`: pesquisa + ação + filtros mobile sem alterar IDs/handlers.
- [x] PR #142 / `76-bills-mobile-spacing1`: ritmo e espaçamento do cartão de filtros.
- [x] PR #147 / `76-bills-mobile-alignment2`: grelha móvel contida, sem faixa horizontal como apresentação final.
- [x] Estado/Categoria e De/Até organizados em pares; Ordenar/Limpar em linhas completas.
- [x] `<=360px` empilha antes de cortar conteúdo.
- [ ] Validar fisicamente pesquisa/filtros em 360/390/430 px equivalentes e portrait/landscape.
- [ ] E2E de criar/editar/pagar/eliminar/cancelar.
- [ ] Uniformizar estados loading/error/success onde ainda existam diferenças.

## P0 — Planeamento + Calendário

- [x] Planeamento v76 e estado `Por definir` para orçamento ausente.
- [x] `plan` usa `CalendarCheck2` do snapshot Lucide fixado.
- [x] `76-planning-budget-card2`: seletor mensal, resumo e CTA sem duplicar gravação.
- [x] `76-planning-ring-shape1`: neutralizar altura legada e garantir proporção 1:1.
- [x] Anel móvel usa 136/128/116 px conforme breakpoint.
- [ ] Confirmar fisicamente o anel no mesmo iPhone/Safari/PWA.
- [ ] Validar estado sem orçamento e com orçamento definido.
- [ ] Rever calendário/vencimentos em E2E e densidade tablet/desktop.

## P0 — Calculadora de datas

- [x] PR #149 / `76-date-calculator1` integrado em `main` (`8e58777f601d164bd4589f7d0e0e8f96e02686f0`).
- [x] Fonte funcional TypeScript strict em `src/ui/date-calculator.ts`.
- [x] Diferença civil determinística com regra explícita de inclusão dos extremos.
- [x] Soma/subtração de dias corridos e dias úteis.
- [x] Dias úteis definidos como segunda a sexta; feriados não presumidos sem jurisdição.
- [x] Testes multitimezone adicionados.
- [x] Sem rede, IndexedDB, `appState`, `commit()` ou `saveState()`.
- [x] PR #156 / `76-date-calculator-layout2`: `date-calculator.css` passa a única autoridade visual da ferramenta.
- [x] PR #156: escala de espaçamento 4/8/12/16/20/24/32 px.
- [x] PR #156: desktop usa área principal + coluna lateral de informação rápida.
- [x] PR #156: mobile usa `Calculadora → Informação rápida → Resultado → Ações`.
- [x] PR #156: `100svh` substitui `100dvh` na autoridade móvel final.
- [x] PR #156: inputs principais 52 px; targets menores >=44 px.
- [x] PR #156: breakpoints 820/560/430/360 e ausência de scroll horizontal como requisito.
- [x] PR #156: forced-colors, reduced-motion e impressão/PDF preservados.
- [x] PR #161 / `76-date-calculator-mobile-spacing3`: Data inicial → Trocar → Data final compactados no mobile sem alterar markup ou lógica.
- [x] PR #161: `<=560px` usa flex vertical, gap de 8 px, labels sem margem/altura herdada e Trocar 44×44 px centrado.
- [x] PR #163 / `76-date-calculator-prototype-inputs4`: primeira aproximação da apresentação ao protótipo.
- [x] Captura física posterior ao PR #163 confirmou overflow/clipping lateral no Safari/iOS causado pela técnica de reposicionamento do indicador nativo.
- [x] PR #165 / `76-date-calculator-prototype-inputs5`: remove o reposicionamento absoluto do indicador WebKit e contém o campo numa grelha interna própria.
- [x] PR #165: calendário visual/divisor à esquerda, input nativo na coluna central e Hoje à direita em fluxo normal.
- [x] PR #165: `min-width:0`, `max-width:100%` e moldura contida impedem a largura intrínseca do `input[type="date"]` de deslocar o cartão.
- [x] PR #165: foco visível por `:focus-within`; targets e `forced-colors` preservados.
- [x] PR #165: Regra de contagem mantém duas colunas em telemóveis comuns e só empilha em `<=340px`.
- [x] PR #165: não altera token do Service Worker; o CSS público network-first/no-store pode atualizar num reload normal, sem ecrã de atualização.
- [x] PR #165: TypeScript PR `35025919784` e CI PR `35025919606` verdes.
- [x] PR #165: merge `a80c0f9bfdbd9135dea69368ca2bde56196fab5d`.
- [x] PR #165: TypeScript `main` `35025991379`, CI `main` `35025991388` e Pages `35026044123` verdes.
- [ ] Confirmar fisicamente `76-date-calculator-prototype-inputs5` no mesmo iPhone/Safari/PWA.
- [ ] Confirmar que Data inicial/Data final permanecem totalmente dentro do cartão sem clipping ou deslocamento lateral.
- [ ] Confirmar visualmente o dialog em tablet e desktop.
- [ ] Validar top-layer/scroll do `<dialog>` em WebKit real.
- [ ] Validar copiar/partilhar/imprimir-PDF em dispositivo real.
- [ ] Avaliar futura integração de feriados portugueses apenas com jurisdição/fonte oficial explícita.

## P0 — Mercado

- [x] Pesquisa live limitada a Pingo Doce/Continente.
- [x] Catálogo visual usa identidade `marketId|pid`.
- [x] Persistência e guard de identidade publicados nos PR #133/#134.
- [ ] Validar pesquisa → adicionar → reload → editar → sync em dispositivo real.
- [ ] Rever logos/imagens/licenças antes de ampliar catálogo visual.

## P0 — Segurança + Diagnóstico + Definições

- [x] `settings` usa engrenagem Lucide.
- [ ] Corrigir texto `Sem CDNs` enquanto ZXing usar origem remota.
- [ ] Empacotar ZXing localmente com licença preservada.
- [ ] Depois remover a origem remota de `script-src`.
- [ ] Reduzir `style-src 'unsafe-inline'` quando a arquitetura permitir.
- [ ] Rever feedback/destructive actions/dark mode/forced-colors fisicamente.
- [ ] Confirmar offline/update da PWA após cada invalidação relevante de cache.

## P0 — Navegação e shell

- [x] Runtime/CSS v74 e Featured retirados do bundle/repositório.
- [x] `mobile-menu-toggle.js` é autoridade do drawer/hambúrguer.
- [x] `v76-mobile-shell.css` é autoridade geométrica do shell autenticado.
- [x] Safe areas, dock e labels em ecrãs estreitos.
- [x] Drawer numa coluna, hierarquia simples e targets adequados.
- [ ] Validar fisicamente drawer no iPhone/Safari e PWA.
- [ ] E2E de abertura/fecho, foco, Escape e swipe.

## P0 — Iconografia transversal

- [x] `icon.svg` reservado à marca e Lucide à iconografia funcional.
- [x] Snapshot Lucide `94e4cb9d9db5907053ebf3636a97c45529cf776b` + licença local.
- [x] Planeamento usa `CalendarCheck2`; Definições usa `Settings`.
- [ ] Validar visualmente Planeamento/Definições no iPhone/PWA e desktop.

## P0 — TypeScript

### Concluído

- [x] Fundação strict.
- [x] Tipos de estado/mercado em `src/types`.
- [x] Market branding TS.
- [x] Sync conflict policy TS.
- [x] Calculadora de datas TS com runtime gerado.

### Próximos blocos

- [ ] Migrar módulos UI/baixo acoplamento restantes.
- [ ] Criar mais vetores de paridade para dinheiro/datas/quantidades.
- [ ] Migrar domínio Mercado para TS e retirar ponte transitória quando houver autoridade única.
- [ ] Migrar `ui-icons.js` para TypeScript preservando registry/hydrator.
- [ ] Migrar `render/forms/events` depois dos contratos visuais estabilizarem.
- [ ] Migrar core/persistência/cifra apenas com vetores próprios.
- [ ] Migrar Service Worker/tooling no bloco final.

## P1 — Relatórios + Objetivos

- [ ] Rever visualizações/legendas sem depender só de cor.
- [ ] Rever empty states e densidade final.

## P1 — Higiene do repositório

- [x] PR #45/v65 encerrado como obsoleto em 15/09/2026.
- [ ] Rever branches antigas e apagar apenas quando não contiverem trabalho exclusivo necessário.
- [ ] Ativar required checks/branch protection em `main` quando houver permissão administrativa.

## P0 — QA final

- [ ] Safari/iPhone web.
- [ ] Safari/iPhone PWA.
- [ ] WebKit E2E.
- [ ] Chromium E2E.
- [ ] Android/Chrome.
- [ ] tablet.
- [ ] desktop.
- [ ] portrait/landscape.
- [ ] teclado virtual/foco.
- [ ] Light/Dark/System.
- [ ] reduced-motion/forced-colors.
- [ ] 320/360/375/390/430/768/820 px.

## Critério de conclusão

Só concluir quando as rotas partilharem sistema visual e comportamento coerentes, mobile/desktop preservarem informação essencial, não houver sobreposição/overflow conhecido, acessibilidade estiver coberta, CI/Pages estiverem verdes, validação física/E2E confirmar o produto e a migração TypeScript seguir o plano sem regressão de domínio.


## Concluído em 24/09/2026

- [x] `76-expense-mode-action1`: tornar **Manual**, **Ler fatura** e **QR Code** ações funcionais imediatas.
- [x] abrir o seletor de imagem diretamente a partir de **Ler fatura**.
- [x] iniciar a câmara diretamente a partir de **QR Code**.
- [x] devolver foco ao preenchimento ao selecionar **Manual**.
- [x] adicionar testes de regressão para o contrato de interação e invalidar cache PWA.
- [ ] validar fisicamente o fluxo no mesmo iPhone/Safari/PWA, incluindo permissões e cancelamento.


## Performance do registo de faturas

- [x] `76-invoice-capture-warmup1`: preparar o leitor QR em background quando o formulário de nova fatura abre.
- [ ] medir no iPhone/Safari/PWA a diferença entre primeiro uso e usos seguintes.
- [ ] empacotar ZXing localmente para eliminar a latência e dependência da origem remota.


## Regressão física dos modos de fatura

- [x] `76-expense-ios-tab-touch2`: adicionar caminho `touchend` explícito aos tabs de registo.
- [x] deduplicar o click sintetizado após toque.
- [x] alterar revisões de cache dos runtimes envolvidos e do Service Worker.
- [x] proteger o contrato com testes estáticos/Pages.
- [ ] validar no mesmo iPhone que **Ler fatura** abre o seletor no primeiro toque.
- [ ] validar no mesmo iPhone que **QR Code** solicita/abre a câmara no primeiro toque.


## Entrega automática e registo de faturas

- [x] `76-expense-ios-tab-direct3`: ligar os três modos diretamente aos respetivos botões.
- [x] preservar o gesto `touchend` sem `preventDefault()` no iOS.
- [x] deduplicar o click sintetizado depois do toque.
- [x] `auto-refresh2`: ativar automaticamente o novo Service Worker depois de concluir o cache.
- [x] recarregar automaticamente a página em `controllerchange`.
- [x] verificar novas compilações a cada 30 segundos quando a aplicação está visível e online.
- [ ] validar fisicamente **Ler fatura** no mesmo iPhone após o novo deploy.
- [ ] validar fisicamente **QR Code** e pedido de câmara no mesmo iPhone.


## Captura nativa e atualização segura

- [x] `76-expense-native-input4`: substituir abertura programática pelo input nativo em **Ler fatura**.
- [x] usar `capture=environment` no **QR Code** móvel.
- [x] impedir abertura duplicada do picker no caminho nativo.
- [x] tentar `BarcodeDetector` antes de ZXing quando disponível.
- [x] `safe-refresh3`: adiar reload automático enquanto houver edição/modal ativo.
- [x] versionar separadamente arquitetura, invoice JS/CSS e Service Worker no Pages build.
- [ ] validar fisicamente **Ler fatura** no mesmo iPhone.
- [ ] validar fisicamente **QR Code** e retorno da câmara no mesmo iPhone.
- [ ] confirmar que um deploy novo recarrega automaticamente depois de fechar o formulário, sem interromper edição.


## Modos de registo de despesa

- [x] `76-expense-action-map5`: atribuir ID estável a Manual, Ler fatura e QR Code.
- [x] adicionar `data-v75-bill-action` explícito a cada controlo.
- [x] centralizar a resolução em `BILL_MODE_ACTIONS`.
- [x] expor no diálogo a ação atualmente selecionada.
- [x] proteger o contrato com testes.
- [ ] validar fisicamente no iPhone os três caminhos após publicação.


## Desbloqueio do picker iOS

- [x] `76-expense-picker-unblock6`: retirar lógica de click dos inputs nativos de fatura.
- [x] confirmar modo apenas no `change` depois de Fotos/Câmara devolver imagem.
- [x] remover `for` redundante dos labels que contêm os inputs.
- [x] excluir inputs nativos de `focusin`/gestão de visual viewport.
- [x] impedir pré-aquecimento do ZXing em iOS/touch.
- [x] manter scanner ao vivo no desktop sem afetar mobile.
- [ ] validar **Ler fatura** no mesmo iPhone.
- [ ] validar **QR Code** no mesmo iPhone.
- [ ] confirmar que regressar de Fotos/Câmara não deixa o formulário bloqueado.


## Preenchimento automático de faturas

- [x] `76-invoice-autofill7`: preencher automaticamente dados seguros depois de QR AT válido.
- [x] preencher Descrição, Valor total, NIF do fornecedor e Referência apenas se estiverem vazios.
- [x] verificar os quatro campos obrigatórios após o autofill.
- [x] manter Categoria, Vencimento, Método e fornecedor comercial como campos de revisão.
- [x] não usar data do documento como vencimento.
- [x] manter submit/persistência exclusivamente em `forms.js`.
- [ ] validar fisicamente no iPhone que os campos aparecem preenchidos logo após a leitura.
