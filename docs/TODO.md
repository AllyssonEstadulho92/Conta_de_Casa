# TODO — Conta de Casa

Atualizado: 7 de setembro de 2026

## P0 — v65 Lista de compras móvel

### Implementação

- [x] Criar resumo compacto com contagem por comprar, comprados e total previsto.
- [x] Manter o resumo financeiro completo acessível em disclosure no mobile.
- [x] Fazer o `+` do topbar reutilizar a ação existente de adicionar produto quando Compras está ativa.
- [x] Ocultar o botão de adição duplicado da página apenas no mobile.
- [x] Compactar Estado, Categoria e Ordenar sem alterar valores/handlers.
- [x] Mostrar **Limpar filtros** apenas quando pesquisa/filtro/ordenação estiver ativo.
- [x] Manter categorias com pendentes abertas.
- [x] Reunir comprados numa secção **Comprados** recolhida por padrão.
- [x] Priorizar checkbox, nome, quantidade e preço em cada cartão; mover informação secundária para **Detalhes**.
- [x] Preservar desktop, schema, cálculos, scanner, cofre e sincronização.
- [x] Criar `tests/market-shopping-focus.test.cjs`.
- [x] Incluir sintaxe/teste v65 na CI e no gate de Pages manual.
- [x] Versionar build como v65, manifesto e cache do Service Worker.

### Integração e publicação

- [ ] Obter CI verde no PR da v65.
- [ ] Rever diff final e confirmar ausência de alterações financeiras.
- [ ] Integrar em `main` apenas com CI verde.
- [ ] Confirmar CI de `main` após integração.
- [ ] Confirmar Deploy GitHub Pages da v65.
- [ ] Sincronizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG com o estado pós-publicação.

### Validação física da v65

- [ ] iPhone/Safari: 320, 375, 390 e 430 px; portrait e landscape.
- [ ] Confirmar que o primeiro viewport mostra resumo compacto, pesquisa/filtros e início da lista sem os quatro cartões grandes.
- [ ] Confirmar `+` contextual e ausência do segundo botão de adição no mobile.
- [ ] Confirmar filtros, pesquisa e aparecimento/desaparecimento de **Limpar filtros**.
- [ ] Confirmar categorias pendentes abertas e **Comprados** fechado por padrão.
- [ ] Confirmar expansão de **Detalhes**, edição, eliminação e preço real sem perda de handlers.
- [ ] VoiceOver/TalkBack: labels dos filtros, summaries, checkbox e ações.
- [ ] Tema claro/escuro e redução de movimento.
- [ ] Tablet/desktop: tabela e resumos completos inalterados, sem scroll horizontal.
- [ ] Num dispositivo com v64, confirmar deteção/instalação da v65 pelo Centro de Atualização.

## P0 — regressões essenciais que não podem quebrar

- [x] Cofre isolado e credenciais fora do código público.
- [x] PBKDF2-SHA-256 + AES-GCM e IndexedDB preservados.
- [x] Faturas, pagamentos, datas civis e totais financeiros cobertos por CI.
- [x] `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário coberta por invariantes.
- [x] QR fiscal continua preenchimento assistido/local.
- [x] Lucide continua sistema de ícones local.
- [x] Um único indicador ativo na navegação inferior.
- [x] Topbar móvel usa a mesma estrutura em Início/Faturas/Compras/Relatórios.
- [x] Centro de Atualização continua same-origin e controlado pelo utilizador.
- [x] CSP/allowlist, responsividade, acessibilidade e sincronização permanecem na CI.
- [x] Runtime v64 e nova camada de apresentação v65 ficam cobertos também no redeploy manual de Pages.

## P0 — validação física v64 ainda pendente fora do escopo desta alteração

- [ ] Scanner: produtos reais no Pingo Doce e Continente, EAN-8/EAN-13, baixa luz, código inválido, repetido e ambíguo.
- [ ] Faturas: validar fisicamente passagem setembro → outubro com recorrência **Por preencher**.
- [ ] QR fiscal: permitir/recusar/revogar câmara e confirmar encerramento dos tracks.

## P1 — segurança e simplificação técnica

- [ ] Rever a dependência runtime `@zxing/browser` carregada de `unpkg.com` e decidir entre auto-hospedagem local ou integridade verificável numa release dedicada.
- [ ] Depois da v65 validada fisicamente, avaliar remoção do pipeline histórico de imagens (`market-retailer-image-policy.js`, `market-image-audit.js`, `market-official-images.js`, CSS associado).
- [ ] Manter Open Food Facts quando necessário para identificação por GTIN mesmo que o pipeline de fotografias seja removido.
- [ ] Consolidar CSS antigo substituído por `ui-consistency.css`/`v64-runtime.css`/`market-shopping-focus.css` apenas numa release separada, depois de hardware real verde.
- [ ] Avaliar incorporar o estado `draft` de recorrência diretamente no schema numa migração formal futura.
- [ ] Rever contraste dos estados em tema claro/escuro em hardware real.
- [ ] Confirmar nomes acessíveis de todos os botões icon-only.

## P2 — manutenção

- [ ] Remover glifos Unicode antigos depois da validação final Lucide.
- [ ] Avaliar fonte única de versão depois de validar transições reais pelo Centro de Atualização.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança e privacidade.
