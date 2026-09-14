# TODO — Conta de Casa

Atualizado: 14 de setembro de 2026

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

## P0 — Marca e iconografia

### `76-brand-icons1` — publicado, PR #100

- [x] Simplificar `icon.svg` para casa + euro, teal sólido e branco.
- [x] Remover folha/gradientes da marca.
- [x] Reutilizar `icon.svg` em sidebar/drawer/cofre.
- [x] Manter Lucide como família funcional.
- [x] Remover duplicações/pseudo-ícones do Mercado.
- [x] Restaurar `Plus` no botão “Adicionar item”.
- [x] CI/TypeScript/Pages verdes.

### `76-icon-semantics2` — branch atual

- [x] Auditar screenshot físico do iPhone: dock excessivamente cinzento e `Planeame…` truncado.
- [x] Corrigir `plan` para Lucide `clipboard-list`.
- [x] Corrigir `settings` para engrenagem Lucide.
- [x] Adicionar `activity` para Diagnóstico.
- [x] Corrigir nomes não canónicos do menu Mais: `report`, `goal`, `shield`, `cloudCheck`, `activity`.
- [x] Encurtar label móvel `Planeamento` → `Plano`, preservando rota/título.
- [x] Criar tokens de cor semântica para light/dark.
- [x] Aplicar cor controlada ao dock, header, Mais e ações semânticas.
- [x] Manter `aria-current`, fundo/texto e forced-colors para não depender apenas da cor.
- [x] Invalidar cache PWA com `icon-semantics2`.
- [x] Atualizar regressões de iconografia e consistência.
- [ ] TypeScript Foundation verde no head final.
- [ ] CI integral verde no head final.
- [ ] Merge em `main`.
- [ ] CI/TypeScript pós-merge verdes.
- [ ] Pages publicada.
- [ ] Validar visualmente em Safari/iPhone e PWA instalada.
- [ ] Validar Android/Chrome e desktop.

### Limpeza posterior segura

- [ ] Remover glifos Unicode de fallback do HTML só depois de prova de que não são necessários.
- [ ] Deixar de hidratar `.brand-mark` como Lucide `home` no runtime.
- [ ] Remover regras pseudo-icon antigas do Mercado após confirmação de não utilização.
- [ ] Migrar `ui-icons.js` para TypeScript strict num bloco próprio.

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
- [x] Primeira correção física da cor/semântica do dock implementada em `76-icon-semantics2`.
- [ ] Remover criação DOM v74 substituída.
- [ ] Validar desktop + iPhone/PWA após publicação do bloco atual.

### Faturas

- [ ] Rever pesquisa, filtros, resumo e estados.
- [ ] Rever tabela desktop/lista mobile.
- [ ] Rever detalhe, editar, pagar, excluir e captura/QR.
- [ ] Uniformizar empty/loading/error/success.
- [ ] Confirmar foco/teclado/dialogs.

### Mercado

- [x] Primeira limpeza transversal de iconografia em PR #100.
- [ ] Rever pesquisa, filtros, catálogo/lista, quantidade e carrinho.
- [ ] Rever scanner, imagens e fallback.
- [ ] Manter estimativa ≠ valor real.
- [ ] Criar teste ponta a ponta para persistência `marketId|pid`.
- [ ] Auditar logos/imagens/licenças antes de ampliar catálogo visual.

### Planeamento + Calendário

- [x] Ícone de Planeamento passa a checklist/clipboard no bloco atual.
- [ ] Consolidar hierarquia com dados reais suportados.
- [ ] Preservar mesma informação essencial mobile/desktop.
- [ ] Rever datas, vencimentos e estados.

### Relatórios + Objetivos

- [ ] Rever visualizações, legendas, contraste e leitura sem depender apenas de cor.
- [ ] Rever empty states e densidade.

### Segurança + Diagnóstico + Definições

- [x] Ícones semânticos corrigidos no menu Mais (`shield`, `activity`, engrenagem).
- [ ] Rever forms, estados, feedback e linguagem.
- [ ] Garantir ações destrutivas claramente distintas.
- [ ] Rever dark mode e forced-colors em browser/dispositivo real.

## P0 — Fonte 100% TypeScript

### Concluído

- [x] Fundação strict — PR #72.
- [x] Veggie menu — PR #88.
- [x] Market branding — PR #89.
- [x] Sync conflict policy — PR #95.

### Próximos blocos

- [ ] Migrar módulos UI folha/baixo acoplamento restantes.
- [ ] Migrar iconografia para TypeScript após estabilização visual.
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
- [ ] Confirmar offline/update em PWA após `icon-semantics2`.
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
