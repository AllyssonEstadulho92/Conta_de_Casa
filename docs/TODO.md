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

- [x] Confirmar lacuna: pesquisa/catálogo conheciam `marketId|pid`, item persistido não preservava.
- [x] Capturar identidade a partir do resultado Cesta ao adicionar produto.
- [x] Aplicar `marketId/pid` antes do commit do novo item.
- [x] Preservar os campos durante `normalizeMarketItem()`.
- [x] Tipar `marketId/pid` em `MarketItem` de forma retrocompatível.
- [x] Manter `marketId/pid` fora da lista de metadados técnicos descartados pelo sync.
- [x] Não alterar `estimatedCents`, `actualCents`, quantidade ou estado de compra.
- [x] TypeScript Foundation/CI/Pages verdes.

### `76-market-identity-stale1` — publicado no PR #134

- [x] Identificar risco raro de identidade pendente após clique live sem commit.
- [x] Expirar identidade no microtask seguinte quando não consumida.
- [x] Preservar aplicação normal antes do primeiro `await` do commit.
- [x] Adicionar regressão específica.
- [x] Invalidar apenas cache técnico PWA, sem mudar release/centro de atualizações.
- [x] Merge PR #134: `69318d104cd8aa1a68be919ba6a9c805b20f9cf5`.
- [x] TypeScript Foundation main `34914028412` verde.
- [x] CI main `34914028440` verde.
- [x] Pages `34914061390` publicada.
- [ ] Validar fisicamente pesquisa → adicionar → reload → editar → sync.

## P0 — Navegação e shell

- [x] Retirar runtime/CSS v74 e Featured do bundle e do repositório.
- [x] Consolidar uma única autoridade de composição/navegação móvel.
- [x] Manter `mobile-menu-toggle.js` como autoridade do drawer/hambúrguer.
- [x] Manter `v76-mobile-shell.css` como autoridade geométrica mobile.
- [x] Corrigir safe areas, dock e labels em ecrãs estreitos.
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

- [x] Planeamento v76 e estado “Por definir” para orçamento ausente.
- [ ] Rever calendário/vencimentos em E2E e densidade final tablet/desktop.

### Relatórios + Objetivos

- [ ] Rever visualizações/legendas sem depender só de cor.
- [ ] Rever empty states e densidade final.

### Segurança + Diagnóstico + Definições

- [ ] Corrigir texto “Sem CDNs” enquanto ZXing usar `unpkg.com`.
- [ ] Rever feedback/destructive actions/dark mode/forced-colors fisicamente.

## P0 — TypeScript

### Concluído

- [x] Fundação strict.
- [x] Tipos de estado/mercado em `src/types`.
- [x] Market branding TS.
- [x] Sync conflict policy TS.

### Próximos blocos

- [ ] Migrar módulos UI/baixo acoplamento restantes.
- [ ] Criar vetores de paridade para dinheiro/datas/quantidades.
- [ ] Migrar domínio Mercado para TS e retirar a ponte transitória de identidade quando houver autoridade única.
- [ ] Migrar `render/forms/events` depois dos contratos visuais estabilizarem.
- [ ] Migrar core/persistência/cifra apenas com vetores próprios.
- [ ] Migrar Service Worker/tooling no bloco final.

## P0 — Segurança/PWA

- [x] PIN local não depende de rede.
- [x] `[hidden]` do auth protegido em Safari/WebKit.
- [ ] Empacotar ZXing localmente com licença preservada.
- [ ] Depois, remover `https://unpkg.com` de `script-src`.
- [ ] Reduzir `style-src 'unsafe-inline'` quando possível.
- [ ] Confirmar offline/update da PWA após cada invalidação de cache.
- [ ] Ativar required checks/branch protection em `main` quando a permissão administrativa estiver disponível.

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
