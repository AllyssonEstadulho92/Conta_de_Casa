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

- [x] PR #96: entrada local-first; sync não bloqueia Dashboard.
- [x] PR #98: `[hidden]` explícito evita cofre e shell simultâneos.
- [x] PR #99: auditoria UI/UX transversal integrada.
- [ ] Repetir validação física no mesmo iPhone/Safari após o bloco visual atual.
- [ ] Repetir validação em PWA instalada.

## P0 — Auditoria visual transversal

- [x] PR #100: marca `icon.svg` simplificada e Lucide como família funcional.
- [x] PR #102: contraste, overflow, diálogos, tabs, tabelas e responsive auditados.
- [x] PR #103: polish página a página das 10 rotas.
- [x] PR #104: dock móvel consolidado em `v75-stability.js`; DOM v74 substituído do Dashboard é removido.

## P0 — `76-icon-semantics3`

- [x] Auditar screenshot físico do iPhone e confirmar excesso de cinzento nos ícones.
- [x] Trocar `plan` por clipboard/checklist.
- [x] Trocar `settings` por engrenagem reconhecível.
- [x] Adicionar `activity` para Diagnóstico.
- [x] Alterar apenas o label do dock `Planeamento` → `Plano` sem alterar a rota.
- [x] Criar paleta semântica controlada para light/dark.
- [x] Preservar `aria-current`, fundo selecionado e foco para não depender apenas de cor.
- [x] Preservar `forced-colors`.
- [x] Reidratar slots do menu `Mais` com ícones semânticos reais.
- [x] Invalidar cache PWA com `icon-semantics3`.
- [x] Atualizar teste de estabilidade para a nova paleta/label.
- [ ] Abrir PR.
- [ ] TypeScript Foundation verde.
- [ ] CI integral verde.
- [ ] Merge em `main`.
- [ ] CI/TypeScript pós-merge verdes.
- [ ] GitHub Pages publicado.
- [ ] Validar visualmente no mesmo iPhone/Safari/PWA.

## P0 — Revisão página a página restante

### Dashboard

- [x] Resumo principal real e indicadores canónicos.
- [x] Nós v74 substituídos removidos em runtime pela autoridade PR #104.
- [x] Header/dock alinhados com v76.
- [ ] Revalidar iPhone/PWA após `icon-semantics3`.

### Faturas

- [ ] Rever pesquisa, filtros, resumo e estados reais.
- [ ] Rever tabela desktop/lista mobile.
- [ ] Rever detalhe, editar, pagar, excluir e captura/QR.
- [ ] Uniformizar empty/loading/error/success.
- [ ] Confirmar foco/teclado/dialogs.

### Mercado

- [x] Marca/iconografia transversal sem duplicações decorativas.
- [ ] Rever pesquisa, filtros, catálogo/lista, quantidade e carrinho.
- [ ] Rever scanner, imagens e fallback.
- [ ] Manter estimativa ≠ valor real.
- [ ] Criar teste ponta a ponta para persistência `marketId|pid`.
- [ ] Auditar logos/imagens/licenças antes de ampliar catálogo visual.

### Planeamento + Calendário

- [x] Label móvel compacto `Plano` preparado sem alterar rota/página.
- [ ] Consolidar hierarquia com dados reais suportados.
- [ ] Preservar mesma informação essencial mobile/desktop.
- [ ] Rever datas, vencimentos e estados.

### Relatórios + Objetivos

- [ ] Rever visualizações, legendas, contraste e leitura sem depender apenas de cor.
- [ ] Rever empty states e densidade.

### Segurança + Diagnóstico + Definições

- [x] Ícones funcionais próprios preparados: shield, activity e settings/gear.
- [ ] Rever forms, estados, feedback e linguagem.
- [ ] Garantir ações destrutivas claramente distintas.
- [ ] Rever dark mode e forced-colors em hardware/browser real.

## P0 — Fonte 100% TypeScript

### Concluído

- [x] Fundação strict — PR #72.
- [x] Veggie menu — PR #88.
- [x] Market branding — PR #89.
- [x] Sync conflict policy — PR #95.

### Próximos blocos

- [ ] Migrar módulos UI de baixo acoplamento restantes.
- [ ] Migrar configuração final de navegação para TypeScript depois da estabilização visual.
- [ ] Criar vetores de paridade para dinheiro/datas/quantidades.
- [ ] Migrar `render/forms/events` depois dos contratos visuais estabilizarem.
- [ ] Migrar core/persistência/cifra apenas com vetores próprios.
- [ ] Migrar Service Worker/tooling no bloco final.

## P0 — Segurança/PWA

- [x] PIN local não depende de rede.
- [x] `[hidden]` do auth protegido em Safari/WebKit.
- [x] Cache PWA versionada por mudança visual relevante.
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
