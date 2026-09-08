# TODO — Conta de Casa

Atualizado: 8 de setembro de 2026

## P0 — Publicação v75 alinhada ao protótipo

- [x] Analisar o protótipo e separar referência visual de funcionalidades realmente suportadas.
- [x] Criar branch isolada `redesign/v75-prototipo-fiel`.
- [x] Manter `core.js`, `finance.js`, `STATE_VERSION = 5`, IndexedDB, pagamentos, cifragem e sincronização sem migração.
- [x] Reestruturar a identidade visual em `v75-architecture.css`.
- [x] Implementar topbar móvel verde-petróleo e safe areas.
- [x] Garantir **Início / Despesas / Mercado / Planeamento / Mais** visíveis na barra inferior.
- [x] Integrar saudação do Início no cabeçalho.
- [x] Reestruturar Despesas com filtros, pesquisa, movimentos e FAB.
- [x] Transformar nova despesa em fluxo mobile full-screen.
- [x] Adicionar modos **Manual / Ler fatura / QR Code** reutilizando componentes existentes.
- [x] Transformar scanner QR em composição full-screen sem alterar a extração fiscal.
- [x] Reestruturar Mercado em pesquisa, produtos e lojas compactas.
- [x] Limitar Mercado às lojas realmente suportadas: Continente e Pingo Doce.
- [x] Reestruturar Planeamento com mês, orçamento, gasto, disponível e categorias.
- [x] Reestruturar Relatórios, Mais e Sincronização com a mesma linguagem visual.
- [x] Alinhar onboarding/cofre com `icon.svg` local e teclado PIN de três colunas.
- [x] Preservar drawer à direita e hambúrguer ↔ X da v73.
- [x] Atualizar build para `v75` e arquitetura para `75-architecture2`.
- [x] Atualizar Service Worker/cache e asset versioning.
- [x] Atualizar `release-manifest.json`.
- [x] Atualizar testes de regressão sem remover invariantes funcionais.
- [x] Confirmar suite CI completa verde na branch: `34226581162` / `#1488`.
- [x] Abrir PR `#65` para `main`.
- [x] Integrar o head validado em `main`: `40fe62f8140f1f58af9e9ab8d8c8b642695b7cf3`.
- [x] Confirmar CI de `main`: `34226711267` / `#1490`.
- [x] Confirmar GitHub Pages: `34226749117` / `#1483`.
- [x] Confirmar que o artefacto Pages contém `v75-architecture.css/js` e 43 assets públicos.
- [x] Atualizar documentação técnica obrigatória para estado publicado.

## P1 — Validação física v75

- [ ] iPhone/Safari/PWA: confirmar que a instância recebe v75 após atualização do Service Worker.
- [ ] iPhone: onboarding, cofre, topbar e safe area.
- [ ] iPhone: barra inferior com os cinco destinos e Mercado visível.
- [ ] iPhone: hambúrguer → X → hambúrguer e swipe do drawer pela direita.
- [ ] iPhone: Adicionar despesa em Manual / Ler fatura / QR Code.
- [ ] iPhone: scanner QR, permissão de câmara, teclado e retorno ao ecrã anterior.
- [ ] iPhone: Mercado com fotografia verificada e textos longos.
- [ ] Android/tablet: largura, orientação, teclado, formulários e drawer.
- [ ] Desktop: sidebar direita, densidade, formulários e ausência de overflow horizontal.
- [ ] Tema escuro em mobile e desktop.

## P2 — Consolidação posterior

- [ ] Rever CSS histórico restante numa release própria, sem misturar com regras financeiras.
- [ ] Remover `#drawerCloseBtn` histórico apenas quando referências funcionais puderem desaparecer sem regressão.
- [ ] Rever pipeline externo do Mercado separadamente.
- [ ] Manter manifesto e os cinco documentos técnicos sincronizados em cada release.
