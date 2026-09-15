# TODO — Conta de Casa

Atualizado: 15 de setembro de 2026

## P0 — Invariantes

- [x] `STATE_VERSION = 5`.
- [x] Dinheiro em cêntimos inteiros.
- [x] PBKDF2-SHA-256 + AES-GCM, 250000 iterações.
- [x] IndexedDB financeiro preservado.
- [x] `estimatedCents` separado de `actualCents`.
- [x] `marketId|pid` definido como identidade canónica.
- [x] Redesign/migração sem alteração silenciosa de domínio.

## P0 — Auth/Safari

- [x] PIN local abre aplicação sem depender de sync.
- [x] `[hidden]` impede cofre e shell simultâneos.
- [x] Formulário de despesa mobile usa um único scroll owner após PR #132.
- [ ] Criar E2E WebKit/Chromium para PIN → Dashboard → drawer → Despesas → Adicionar → Manual/Imagem/QR → fechar/guardar.
- [ ] Repetir validação física em Safari/iPhone web e PWA instalada.

## P0 — Mercado / identidade canónica

### `76-market-identity1` — publicado no PR #133

- [x] Preservar `marketId|pid` ao adicionar resultado live.
- [x] Preservar identidade durante `normalizeMarketItem()`/reload/restauro/sync.
- [x] Tipar identidade de forma retrocompatível.
- [x] Não alterar `estimatedCents`, `actualCents`, quantidade ou estado de compra.
- [x] TypeScript Foundation/CI/Pages verdes.

### `76-market-identity-stale1` — publicado no PR #134

- [x] Expirar identidade pendente quando clique live não chega ao commit.
- [x] Preservar fluxo normal antes do primeiro `await`.
- [x] Regressão específica e cache técnico PWA.
- [x] Merge `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`; gates/Pages verdes.
- [ ] Validar fisicamente pesquisa → adicionar → reload → editar → sync.

## P0 — Navegação e shell

- [x] Retirar runtime/CSS v74 e Featured do bundle/repositório.
- [x] Consolidar uma única autoridade móvel.
- [x] `mobile-menu-toggle.js` como autoridade do drawer/hambúrguer.
- [x] `v76-mobile-shell.css` como autoridade geométrica mobile.
- [x] Safe areas, dock e labels em ecrãs estreitos.
- [x] PR #136: drawer em uma coluna, hierarquia simples, Segurança própria no menu completo e targets adequados.
- [ ] Validar fisicamente o drawer no mesmo iPhone/Safari e PWA instalada.
- [ ] E2E real para abertura/fecho do drawer, foco, Escape e swipe.

## P0 — UI/UX página a página

### Dashboard

- [x] Hero de saldo e indicadores canónicos v76.
- [x] Remover dependência runtime v74.
- [ ] Validação física final desktop + iPhone/PWA.

### Despesas/Faturas

- [x] Pesquisa, filtros, resumo e lista canónicos restaurados.
- [x] Fluxo Adicionar despesa profissionalizado.
- [x] Modos Manual / Ler fatura / QR estabilizados.
- [x] Hotfix touch/scroll Safari PR #132.
- [x] PR #140 / `76-bills-mobile-filters1`: pesquisa + ação + filtros mobile sem alterar IDs/handlers.
- [x] PR #140: lupa CSS duplicada neutralizada; Lucide local mantém iconografia funcional.
- [x] PR #142 / `76-bills-mobile-spacing1`: espaçamento, ritmo vertical e limpeza do cartão de filtros.
- [x] PR #142: TypeScript/CI/Pages verdes; Pages `34945033256` concluída.
- [ ] Validar fisicamente pesquisa/filtros/espaçamento no mesmo iPhone/Safari web e PWA instalada.
- [ ] E2E de criar/editar/pagar/eliminar/cancelar.
- [ ] Uniformizar estados loading/error/success onde ainda existam diferenças.

### Mercado

- [x] Pesquisa live limitada a Pingo Doce/Continente.
- [x] Catálogo visual usa identidade `marketId|pid`.
- [x] Pesquisa/lista/filtros alinhados visualmente.
- [x] Persistência e guard de identidade publicados nos PR #133/#134.
- [ ] Validar ciclo completo da identidade em dispositivo real.
- [ ] Rever logos/imagens/licenças antes de ampliar catálogo visual.

### Planeamento + Calendário

- [x] Planeamento v76 e estado `Por definir` para orçamento ausente.
- [x] PR #138: `plan` usa `CalendarCheck2` do snapshot Lucide fixado.
- [x] PR #143 / `76-planning-budget-card2`: seletor mensal com intervalo real e ícones locais.
- [x] PR #143: cartão único de Orçamento mensal com gasto, orçamento, disponível, orientação e CTA.
- [x] PR #143: Definir/Editar apenas foca `#monthlyBudget`; `#monthPlanForm`/`events.js` continuam a única gravação.
- [x] PR #143: eliminar compressão das três métricas em colunas no iPhone estreito.
- [x] PR #143: TypeScript Foundation PR `34946433827` e CI PR `34946433799` verdes.
- [x] PR #143: merge `386d75b35060eb011c2a2d68ec6b965c87c5080c`; main TypeScript `34946493929`, CI `34946493911` e Pages `34946542013` verdes.
- [ ] Validar fisicamente estado sem orçamento e com orçamento definido no iPhone/Safari/PWA.
- [ ] Rever calendário/vencimentos em E2E e densidade final tablet/desktop.

### Relatórios + Objetivos

- [ ] Rever visualizações/legendas sem depender só de cor.
- [ ] Rever empty states e densidade final.

### Segurança + Diagnóstico + Definições

- [x] PR #138: `settings` usa engrenagem `Settings` Lucide.
- [ ] Corrigir texto `Sem CDNs` enquanto ZXing usar `unpkg.com`.
- [ ] Rever feedback/destructive actions/dark mode/forced-colors fisicamente.

### Iconografia transversal

- [x] `icon.svg` como marca e Lucide como iconografia funcional.
- [x] Snapshot Lucide auditável `94e4cb9d9db5907053ebf3636a97c45529cf776b` + licença local.
- [ ] Validar visualmente Planeamento/Definições no iPhone/PWA e desktop.

## P0 — TypeScript

### Concluído

- [x] Fundação strict.
- [x] Tipos de estado/mercado em `src/types`.
- [x] Market branding TS.
- [x] Sync conflict policy TS.

### Próximos blocos

- [ ] Migrar módulos UI/baixo acoplamento restantes.
- [ ] Criar vetores de paridade para dinheiro/datas/quantidades.
- [ ] Migrar domínio Mercado para TS e retirar ponte transitória quando houver autoridade única.
- [ ] Migrar `ui-icons.js` para TypeScript preservando registry/hydrator.
- [ ] Migrar `render/forms/events` depois dos contratos visuais estabilizarem.
- [ ] Migrar core/persistência/cifra apenas com vetores próprios.
- [ ] Migrar Service Worker/tooling no bloco final.

## P0 — Segurança/PWA

- [x] PIN local não depende de rede.
- [x] `[hidden]` do auth protegido em Safari/WebKit.
- [ ] Corrigir descrição `Sem CDNs` enquanto ZXing continuar remoto.
- [ ] Empacotar ZXing localmente com licença preservada.
- [ ] Depois remover `https://unpkg.com` de `script-src`.
- [ ] Reduzir `style-src 'unsafe-inline'` quando possível.
- [ ] Confirmar offline/update da PWA após cada invalidação de cache.
- [ ] Ativar required checks/branch protection em `main` quando houver permissão administrativa.

## P1 — Higiene do repositório

- [x] Encerrar PR #45/v65 como obsoleto em 15/09/2026.
- [ ] Rever branches antigas `feat/v76-icon-semantics2` e `feat/v76-icon-semantics3`; apagar apenas se não contiverem trabalho exclusivo necessário.

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

Só concluir quando todas as rotas partilharem sistema visual e comportamento coerentes, mobile/desktop preservarem informação essencial, não houver sobreposição/overflow conhecido, acessibilidade estiver coberta, CI/Pages estiverem verdes, validação física/E2E confirmar o produto e a migração TypeScript seguir o plano sem regressão de domínio.
