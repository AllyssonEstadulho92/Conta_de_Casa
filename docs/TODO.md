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
- [x] PR #152 / `76-auth-prototype-final1`: substituir as camadas visuais `76-vault-short-height1` + `76-auth-ios-spacing2` por uma única autoridade do cofre.
- [x] PR #152: keypad mobile 56 px com gaps 30/16 px conforme protótipo aprovado.
- [x] PR #152: fallback `<=359px` em 52 px / gaps 24/13 px.
- [x] PR #152: fallback de altura `<=720px` em 50 px / gaps 22/9 px.
- [x] PR #152: todos os targets essenciais permanecem >=44 px.
- [x] PR #152: transferência de cofre passa a superfície própria e CTA Entrar mantém hierarquia principal.
- [x] PR #152: regressões de acessibilidade/estabilidade atualizadas para a nova autoridade única.
- [x] PR #152: token técnico `auth-prototype-final1` invalida a apresentação anterior da PWA.
- [x] Captura física pós-PR #152 identificou sobreposição entre **Criar cofre local** e **Introduza o seu PIN**.
- [x] PR #154 / `76-auth-exclusive-state1`: `hidden` torna-se autoridade explícita também para `#vaultCreate` e `#vaultUnlock`.
- [x] PR #154: teste protege a seleção exclusiva do runtime via `idbGet('meta','vault')` e impede CSS de reexibir estado oculto.
- [x] PR #154: Service Worker recebe token técnico `auth-exclusive-state1`.
- [x] PR #154: TypeScript Foundation PR `35003057035` e CI PR `35003057086` verdes.
- [x] PR #154: merge `2594ba1c1a3f4f2cabbcf5c92e2cdd5a8f28734c`.
- [x] PR #154: TypeScript Foundation `main` `35003207253`, CI `main` `35003207139` e Pages `35003264802` verdes.
- [ ] Confirmar `76-auth-exclusive-state1` no mesmo iPhone/Safari web após atualização do cache: com cofre existente deve aparecer apenas **Introduza o seu PIN**.
- [ ] Confirmar o mesmo estado exclusivo na PWA instalada.
- [ ] Validar estado sem cofre num browser/perfil limpo: deve aparecer apenas **Criar cofre local**.
- [ ] Validar portrait/landscape e teclado virtual no cofre.
- [ ] Criar E2E WebKit/Chromium para criação/desbloqueio exclusivo → Dashboard → drawer → Despesas → Adicionar → Manual/Imagem/QR → fechar/guardar.

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
- [x] Testes multitimezone adicionados e gates do PR/main verdes.
- [x] Sem rede, IndexedDB, `appState`, `commit()` ou `saveState()`.
- [ ] Confirmar visualmente o dialog em iPhone/Safari/PWA e desktop.
- [ ] Validar copiar/partilhar/imprimir-PDF em dispositivo real.

## P0 — Mercado

- [x] Pesquisa live limitada a Pingo Doce/Continente.
- [x] Catálogo visual usa identidade `marketId|pid`.
- [x] Persistência e guard de identidade publicados nos PR #133/#134.
- [ ] Validar pesquisa → adicionar → reload → editar → sync em dispositivo real.
- [ ] Rever logos/imagens/licenças antes de ampliar catálogo visual.

## P0 — Segurança + Diagnóstico + Definições

- [x] `settings` usa engrenagem Lucide.
- [ ] Corrigir texto `Sem CDNs` enquanto ZXing usar `unpkg.com`.
- [ ] Empacotar ZXing localmente com licença preservada.
- [ ] Depois remover `https://unpkg.com` de `script-src`.
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
