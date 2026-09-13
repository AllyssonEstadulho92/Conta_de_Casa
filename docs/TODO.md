# TODO — Conta de Casa

Atualizado: 13 de setembro de 2026

## P0 — Invariantes

- [x] `STATE_VERSION = 5`.
- [x] Dinheiro em cêntimos inteiros.
- [x] PBKDF2-SHA-256 + AES-GCM, 250000 iterações.
- [x] IndexedDB financeiro preservado.
- [x] `estimatedCents` separado de `actualCents`.
- [x] `marketId|pid` preservado como identidade canónica.
- [x] Redesign/migração sem alterar silenciosamente cálculos, faturas, pagamentos, QR, scanner ou sync.

## P0 — Incidente PIN / Dashboard — `76-auth-transition1`

- [x] Reproduzir por evidência física: cofre visível + dock autenticado sobreposto em Safari/iPhone.
- [x] Identificar espera bloqueante de `syncStartupGate()` durante `enterApp()`.
- [x] Identificar startup guard a voltar a mostrar o cofre durante `app-active`.
- [x] Tornar a entrada local-first: PIN válido abre Dashboard imediatamente.
- [x] Manter sync opcional em background.
- [x] Tornar cofre e app estados visuais exclusivos.
- [x] Proibir `#app`/dock enquanto `#vaultScreen` estiver visível.
- [x] Implementar rollback seguro se `enterApp()` falhar.
- [x] Invalidar cache PWA com `auth-transition1`.
- [x] Atualizar regressão Safari/PWA.
- [x] Atualizar regressão do mobile shell.
- [x] PR #96 integrado, merge `d18d274141b1032ab0e909729739b3f86cabfb9e`.
- [x] TypeScript Foundation `34780407487` verde.
- [x] CI `34780407473` verde.
- [x] Pages `34780437328` verde.
- [ ] Repetir teste físico no mesmo iPhone/Safari após atualização do Service Worker.
- [ ] Repetir teste em PWA instalada, não apenas Safari.

## P0 — UI/UX e arquitetura

### Acesso

- [x] `76-auth1`: visual limpo, keypad circular, CTA principal único.
- [x] `76-auth-transition1`: shell não pode vazar para o ecrã bloqueado.
- [ ] Consolidar regras do cofre hoje em `v75-usability.css` para uma camada v76 dedicada quando a cascade estiver simplificada.

### Dashboard

- [x] Saldo atual como resumo principal real.
- [x] Por pagar / Em atraso / Saldo projetado como segundo nível.
- [x] Pago no mês / Próximos 7 dias compactos.
- [x] PR #94 suprime visualmente cinco blocos v74 duplicados.
- [ ] Parar de criar esses cinco blocos dentro de `v74-experience.js`, em vez de apenas escondê-los.
- [ ] Corrigir/consolidar contraste e autoridade do header móvel.
- [ ] Validar fisicamente desktop + iPhone/PWA.

### Navegação móvel

- [ ] Escolher uma única autoridade canónica para destinos e labels.
- [ ] Remover a reescrita concorrente de `v74-experience.js` depois de provar paridade.
- [ ] Garantir `aria-current`, drawer e `Mais` sem duplicações.
- [ ] Testar 320/360/375/390/430/768/820 px.

### Páginas seguintes

- [ ] Faturas: pesquisa, filtros, resumo, tabela desktop, lista mobile, editar/pagar/detalhes/excluir/captura.
- [ ] Mercado: pesquisa, filtros, catálogo/lista, quantidade, scanner, imagens, estimativa vs real.
- [ ] Mercado: criar teste ponta a ponta para persistência de `pid`.
- [ ] Planeamento: usar apenas saldo/orçamento/rendimentos realmente suportados.
- [ ] Calendário: vencimentos/pagamentos reais.
- [ ] Relatórios.
- [ ] Objetivos.
- [ ] Segurança.
- [ ] Diagnóstico.
- [ ] Definições.

## P0 — Fonte 100% TypeScript

### Concluído

- [x] Fundação TypeScript strict — PR #72.
- [x] Veggie menu TS — PR #88.
- [x] Market branding TS — PR #89.
- [x] Sync conflict policy TS — PR #95.

### Próximos blocos

- [ ] Auditar módulos folha restantes por dependências e efeitos laterais.
- [ ] Migrar próximo módulo de baixo acoplamento com paridade antes de remover JS.
- [ ] Criar vetores de paridade antes de módulos com dinheiro, datas ou quantidades.
- [ ] Migrar domínio financeiro por subdomínios.
- [ ] Migrar modelo/carrinho Mercado.
- [ ] Migrar core/persistência/cifra apenas depois do domínio estabilizado.
- [ ] Migrar sync principal.
- [ ] Migrar `render.js`, `forms.js`, `events.js` e controladores complexos.
- [ ] Migrar Service Worker/tooling no bloco final.
- [ ] Proibir os últimos JS manuais no build quando já não houver consumidores.

## P0 — Segurança/PWA

- [x] PIN local não depende de rede para entrar.
- [x] Estratégia SW não foi alterada no PR #96.
- [ ] Auditar ZXing remoto e considerar bundle local com licença preservada.
- [ ] Reduzir `style-src 'unsafe-inline'` quando tecnicamente possível.
- [ ] Rever origens CSP finais.
- [ ] Confirmar comportamento offline/atualização em PWA instalada após cada bloco de cache.
- [ ] Ativar required checks/branch protection quando a configuração permitir.

## P0 — QA final

- [ ] Safari/iPhone web.
- [ ] Safari/iPhone PWA instalada.
- [ ] Android/Chrome.
- [ ] tablet.
- [ ] desktop.
- [ ] portrait/landscape.
- [ ] teclado virtual/foco.
- [ ] Light/Dark/System.
- [ ] reduced-motion/forced-colors.
- [ ] comparação visual antes/depois antes de eliminar CSS histórico.

## Critério de conclusão

A aplicação só é considerada alinhada quando:

1. todas as páginas principais têm hierarquia UI/UX coerente em desktop/mobile;
2. navegação e autenticação têm uma única autoridade funcional;
3. CI/Pages ficam verdes após cada bloco;
4. não existem regressões conhecidas em dinheiro, cofre, sync, Mercado ou PWA;
5. fonte funcional manual JavaScript foi substituída por TypeScript conforme o plano;
6. validação física confirma o resultado em dispositivos reais.