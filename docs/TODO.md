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
- [x] PR #99: auditoria UI/UX transversal integrada e Pages publicada.
- [ ] Repetir validação física no mesmo iPhone/Safari.
- [ ] Repetir validação em PWA instalada.

## P0 — Marca e iconografia `76-brand-icons1`

### Executado na branch atual

- [x] Auditar `icon.svg`, `.brand-mark`, subset Lucide e pseudo-ícones históricos.
- [x] Confirmar que existiam duas identidades: `icon.svg` e Lucide `home` na marca interna.
- [x] Simplificar `icon.svg` para casa + euro, teal sólido e branco.
- [x] Remover folha e gradientes decorativos da marca.
- [x] Fazer sidebar/drawer/cofre reutilizarem a mesma marca `icon.svg`.
- [x] Manter Lucide como única família de ícones funcionais.
- [x] Neutralizar ícone decorativo do título do Mercado.
- [x] Neutralizar chevron extra do estado de sync no Mercado.
- [x] Restaurar `Plus` semântico no botão “Adicionar item” em vez de scanner pseudo-icon.
- [x] Neutralizar pseudo-ícones coloridos dos cartões de resumo do Mercado.
- [x] Proteger a nova autoridade em `tests/ui-icons.test.cjs`.
- [x] Invalidar cache PWA com `brand-icons1`.
- [ ] Executar TypeScript Foundation + CI integral do PR.
- [ ] Publicar Pages apenas com gates verdes.
- [ ] Validar nova marca e ícones em Safari/iPhone, PWA instalada, Android/Chrome e desktop.

### Limpeza posterior segura

- [ ] Remover glifos Unicode de fallback do HTML apenas depois de prova de que não são necessários.
- [ ] Deixar de hidratar `.brand-mark` como Lucide `home` no runtime e remover esse trabalho redundante.
- [ ] Remover regras pseudo-icon antigas do Mercado apenas depois de confirmar que a autoridade final as tornou inutilizadas em todos os estados.
- [ ] Rever contraste não textual dos ícones em light/dark e forced-colors no dispositivo/browser real.

## P0 — Dívida estrutural UI/UX

- [ ] Consolidar navegação móvel numa única autoridade.
- [ ] Remover/restringir `ensureMobileNav()` v74 após paridade.
- [ ] Parar criação runtime de `cdcMobileGreeting`, `cdcMobileMonthWrap`, `cdcMonthHero`, `cdcQuickActions`, `cdcDashboardCategories`.
- [ ] Parar criação de `cdcWelcome` depois de provar que o fluxo `vaultCreate` cobre primeiro acesso/importação.
- [ ] Reduzir dependência de `!important` entre v74/v75/v76.

## P0 — Revisão página a página

### Dashboard

- [x] Resumo principal real e indicadores canónicos.
- [x] Blocos v74 duplicados visualmente suprimidos.
- [x] Header e dock alinhados com direção v76 pelo PR #99.
- [ ] Remover criação DOM v74 substituída.
- [ ] Validar desktop + iPhone/PWA.

### Faturas

- [ ] Rever pesquisa, filtros, resumo e estados.
- [ ] Rever tabela desktop/lista mobile.
- [ ] Rever detalhe, editar, pagar, excluir e captura/QR.
- [ ] Uniformizar empty/loading/error/success.
- [ ] Confirmar foco/teclado/dialogs.

### Mercado

- [x] Primeira limpeza transversal de iconografia em `76-brand-icons1`.
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
