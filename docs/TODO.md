# TODO — Conta de Casa

Atualizado: 13 de setembro de 2026

## P0 — Invariantes

- [x] `STATE_VERSION = 5`.
- [x] Dinheiro em cêntimos inteiros.
- [x] PBKDF2-SHA-256 + AES-GCM, 250000 iterações.
- [x] IndexedDB financeiro preservado.
- [x] `estimatedCents` separado de `actualCents`.
- [x] `marketId|pid` preservado.
- [x] Redesign/migração sem alteração silenciosa de domínio.

## P0 — Auth/Safari

- [x] PR #96: entrada local-first, sync não bloqueia Dashboard.
- [x] PR #98: `[hidden]` explícito evita cofre e shell simultâneos.
- [x] CI + TypeScript + Pages verdes após PR #98.
- [ ] Repetir validação física no mesmo iPhone/Safari.
- [ ] Repetir validação em PWA instalada.

## P0 — Auditoria UI/UX transversal `76-ui-audit1`

### Executado na branch atual

- [x] Auditar arquitetura visual v74/v75/v76 e contratos de auth/nav/header.
- [x] Consultar Apple HIG, Material/Android accessibility, WCAG 2.2 e web.dev.
- [x] Corrigir header móvel: superfície neutra, sem gradiente e sem branco forçado.
- [x] Garantir menu/notificações 44×44 px e foco visível.
- [x] Consolidar visual do dock móvel e selected state.
- [x] Neutralizar onboarding v74 que podia mascarar `76-auth1`.
- [x] Invalidar cache PWA para `ui-audit1`.
- [x] Atualizar testes de consistência e mobile shell.
- [x] Criar `docs/UI_UX_AUDIT.md`.
- [ ] Executar CI/TypeScript do PR do bloco e corrigir regressões.
- [ ] Publicar Pages e validar no dispositivo real.

### Dívida ALTA a resolver imediatamente depois

- [ ] Consolidar navegação móvel numa única autoridade.
- [ ] Remover/restringir `ensureMobileNav()` v74 após paridade.
- [ ] Parar criação runtime de `cdcMobileGreeting`, `cdcMobileMonthWrap`, `cdcMonthHero`, `cdcQuickActions`, `cdcDashboardCategories`.
- [ ] Parar criação de `cdcWelcome` depois de provar que o fluxo `vaultCreate` cobre primeiro acesso/importação.
- [ ] Reduzir dependência de `!important` entre v74/v75/v76.

## P0 — Revisão página a página

### Dashboard

- [x] Resumo principal real e indicadores canónicos.
- [x] Blocos v74 duplicados visualmente suprimidos.
- [x] Header e dock alinhados com direção v76 na branch atual.
- [ ] Remover criação DOM v74 substituída.
- [ ] Validar desktop + iPhone/PWA.

### Faturas

- [ ] Rever pesquisa, filtros, resumo e estados.
- [ ] Rever tabela desktop/lista mobile.
- [ ] Rever detalhe, editar, pagar, excluir e captura/QR.
- [ ] Uniformizar empty/loading/error/success.
- [ ] Confirmar foco/teclado/dialogs.

### Mercado

- [ ] Rever pesquisa, filtros, catálogo/lista, quantidade e carrinho.
- [ ] Rever scanner, imagens e fallback.
- [ ] Manter estimativa ≠ valor real.
- [ ] Criar teste ponta a ponta para persistência `marketId|pid`.
- [ ] Auditar logos/imagens/licenças antes de ampliar catálogo visual.

### Planeamento + Calendário

- [ ] Consolidar hierarquia com dados reais suportados.
- [ ] Preservar mesma informação essencial mobile/desktop.
- [ ] Rever datas, vencimentos e estados.

### Relatórios + Objetivos

- [ ] Rever visualizações, legendas, contraste e leitura sem depender apenas de cor.
- [ ] Rever empty states e densidade.

### Segurança + Diagnóstico + Definições

- [ ] Rever forms, estados, feedback e linguagem.
- [ ] Garantir ações destrutivas claramente distintas.
- [ ] Rever dark mode e forced-colors.

## P0 — Fonte 100% TypeScript

### Concluído

- [x] Fundação strict — PR #72.
- [x] Veggie menu — PR #88.
- [x] Market branding — PR #89.
- [x] Sync conflict policy — PR #95.

### Próximos blocos

- [ ] Migrar módulos UI folha/baixo acoplamento restantes.
- [ ] Criar configuração canónica de navegação em TypeScript antes de remover autoridade v74.
- [ ] Criar vetores de paridade para dinheiro/datas/quantidades.
- [ ] Migrar domínio por subdomínios.
- [ ] Migrar `render/forms/events` depois dos contratos visuais estabilizarem.
- [ ] Migrar core/persistência/cifra apenas com vetores próprios.
- [ ] Migrar Service Worker/tooling no bloco final.

## P0 — Segurança/PWA

- [x] PIN local não depende de rede.
- [x] `[hidden]` do auth protegido em Safari/WebKit.
- [ ] Auditar ZXing remoto e considerar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` quando possível.
- [ ] Rever origens CSP finais.
- [ ] Confirmar offline/update em PWA após cada invalidação de cache.
- [ ] Ativar required checks/branch protection quando disponível.

## P0 — QA final

- [ ] Safari/iPhone web.
- [ ] Safari/iPhone PWA.
- [ ] Android/Chrome.
- [ ] tablet.
- [ ] desktop.
- [ ] portrait/landscape.
- [ ] teclado virtual/foco.
- [ ] Light/Dark/System.
- [ ] reduced-motion/forced-colors.
- [ ] 320/360/375/390/430/768/820 px.
- [ ] comparação visual antes/depois antes de eliminar CSS histórico.

## Critério de conclusão

Só concluir quando todas as rotas partilharem sistema visual e comportamento coerentes, mobile/desktop preservarem informação essencial, não houver sobreposição/overflow conhecido, acessibilidade estiver coberta, CI/Pages estiverem verdes, validação física confirmar o produto e JS manual tiver sido substituído por TypeScript conforme o plano.