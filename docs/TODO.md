# TODO — Conta de Casa

Atualizado: 7 de setembro de 2026

## P0 — Auditoria pós-publicação v64

### Release e pipeline

- [x] Confirmar PR #44 integrado em `main`.
- [x] Confirmar CI de `main` verde para o merge da v64.
- [x] Confirmar Deploy GitHub Pages v64 concluído com sucesso.
- [x] Confirmar `release-manifest.json` com `latestVersion = v64`.
- [x] Identificar diferença de cobertura entre CI normal e o caminho `workflow_dispatch` de Pages.
- [x] Acrescentar `node --check v64-runtime.js` ao passo de verificação do deploy.
- [x] Acrescentar `node tests/v64-runtime.test.cjs` ao passo de verificação do deploy.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG com o estado real pós-merge.
- [x] Obter CI verde para `fix/v64-release-audit`.
- [x] Rever o diff final da correção de pipeline.
- [x] Integrar a correção através do PR #46 com CI verde.
- [x] Confirmar novamente CI de `main` após integração: run #1094 concluída com sucesso.
- [x] Confirmar novamente GitHub Pages após integração: run #1087 concluída com sucesso.

### Validação física da v64

- [ ] iPhone/Safari: 320, 375, 390 e 430 px; portrait e landscape.
- [ ] Cabeçalho: Início, Faturas, Compras e Relatórios com mesma escala, alinhamento e controlos.
- [ ] Validar topo inicial, scroll longo, retorno ao topo e browser chrome expandido/recolhido.
- [ ] Faturas: pesquisa, filtros, calendário, nova fatura, edição, pagamento e recorrência **Por preencher**.
- [ ] Validar fisicamente a passagem setembro → outubro com uma recorrência real.
- [ ] Compras: pesquisa, categorias, scanner, quantidade, editar/eliminar e preço real confirmado.
- [ ] Scanner: produtos reais no Pingo Doce e Continente, EAN-8/EAN-13, baixa luz, código inválido, repetido e ambíguo.
- [ ] QR fiscal: permitir/recusar/revogar câmara e confirmar encerramento dos tracks.
- [ ] Tema claro/escuro.
- [ ] VoiceOver/TalkBack em navegação, Compras, scanner, Faturas e QR.
- [ ] Tablet/desktop: ausência de scroll horizontal, sidebar e tabelas.
- [ ] Num dispositivo ainda em v63, confirmar que **Definições → Atualização de Software** deteta v64 e que **Atualizar agora** instala corretamente.

## P0 — regressões essenciais que não podem quebrar

- [x] Cofre isolado e credenciais fora do código público.
- [x] PBKDF2-SHA-256 + AES-GCM e IndexedDB preservados.
- [x] Faturas, pagamentos, datas civis e totais financeiros cobertos por CI.
- [x] `estimatedCents` separado de `actualCents`.
- [x] Quantidade × preço unitário coberta por invariantes.
- [x] QR fiscal continua preenchimento assistido/local.
- [x] Lucide continua sistema de ícones local.
- [x] Um único indicador ativo na navegação inferior.
- [x] Faixas dos cartões-resumo continuam sólidas.
- [x] Topbar móvel usa a mesma estrutura em Início/Faturas/Compras/Relatórios.
- [x] Centro de Atualização continua same-origin e controlado pelo utilizador.
- [x] CSP/allowlist, responsividade, acessibilidade e sincronização permanecem na CI.
- [x] Runtime específico v64 e respetivos testes ficam cobertos também no passo de verificação do redeploy manual de Pages.

## P1 — segurança e simplificação técnica

- [ ] Rever a dependência runtime `@zxing/browser` carregada de `unpkg.com` e decidir entre auto-hospedagem local ou integridade verificável numa release dedicada.
- [ ] Depois da v64 validada fisicamente, avaliar remoção do pipeline histórico de imagens (`market-retailer-image-policy.js`, `market-image-audit.js`, `market-official-images.js`, CSS associado).
- [ ] Manter Open Food Facts quando necessário para identificação por GTIN mesmo que o pipeline de fotografias seja removido.
- [ ] Consolidar CSS antigo substituído por `ui-consistency.css`/`v64-runtime.css` apenas numa release separada.
- [ ] Avaliar incorporar o estado `draft` de recorrência diretamente no schema numa migração formal futura.
- [ ] Rever contraste dos estados em tema claro/escuro em hardware real.
- [ ] Confirmar nomes acessíveis de todos os botões icon-only.

## P2 — manutenção

- [ ] Remover glifos Unicode antigos depois da validação final Lucide.
- [ ] Avaliar fonte única de versão depois de validar transições reais pelo Centro de Atualização.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança e privacidade.