# TODO — Conta de Casa

Atualizado: 7 de setembro de 2026

## P0 — v64: auditoria e correção integral do ciclo atual

### Cabeçalho e Safari/iPhone

- [x] Analisar as capturas reais da página Lista de compras.
- [x] Confirmar que ícones, indicador único da navegação e faixas sólidas dos cartões-resumo permanecem corretos na v63.
- [x] Identificar a fragilidade estrutural: `position:sticky` dentro do scroller móvel `.main`.
- [x] Reforçar a safe area superior.
- [x] Fixar o cabeçalho ao viewport em mobile para impedir corte da primeira linha durante scroll.
- [x] Compensar o conteúdo com `padding-top` igual à altura do cabeçalho.
- [x] Preservar bottom navigation, scroller interno, teclado e diálogos.
- [x] Comparar Início e Lista de compras e identificar as regras `market-prototype-active` que divergiam no topo.
- [x] Uniformizar título, menu, botão `+`, Sync e fundo do cabeçalho entre as páginas principais.
- [x] Desativar o carrinho pseudo-elemento no título de Compras.
- [x] Remover o chevron exclusivo do Sync na página Compras.
- [x] Adicionar regressão automatizada para `position:fixed`, gutters, compensação de conteúdo e igualdade do topbar.
- [ ] Validar fisicamente no iPhone/Safari após instalar a v64: Início, Faturas, Compras e Relatórios; topo inicial, scroll longo, retorno ao topo, rotação e browser chrome expandido/recolhido.

### Código de barras / Compras

- [x] Exigir exatamente um supermercado antes da leitura automática precisa.
- [x] Memorizar apenas a preferência local da loja, sem dados financeiros.
- [x] Validar loja, nome/marca e embalagem antes da auto-adição.
- [x] Exigir score mínimo `0.84` e margem mínima `0.10` para o segundo resultado.
- [x] Rejeitar automaticamente embalagens/multipacks incompatíveis.
- [x] Em ambiguidade, exigir confirmação manual.
- [x] Ao reler o mesmo GTIN pendente, incrementar quantidade em vez de duplicar o item.
- [x] Atualizar somente `estimatedCents` com o preço pesquisado.
- [x] Garantir por teste que o scanner não escreve `actualCents`.
- [ ] Testar fisicamente produtos reais no Pingo Doce e Continente, incluindo EAN-8/EAN-13, baixa luz e códigos semelhantes.

### Faturas recorrentes

- [x] Criar estado **Por preencher** para novas ocorrências recorrentes.
- [x] Preservar descrição, fornecedor, categoria, método, recorrência e vencimento previsto.
- [x] Limpar valor, referência, observações e data de emissão da nova ocorrência.
- [x] Excluir drafts dos totais de pendentes/em atraso.
- [x] Converter para fatura normal após preenchimento e gravação.
- [x] Migrar apenas ocorrências futuras geradas automaticamente e ainda não editadas.
- [x] Preservar ocorrências com pagamentos, canceladas, arquivadas ou alteradas.
- [ ] Validar fisicamente a passagem setembro → outubro com uma recorrência real.

### Versionamento e atualização

- [x] Subir build candidato para `v64`.
- [x] Atualizar `release-manifest.json` com as alterações da v64, incluindo o cabeçalho móvel uniforme.
- [x] Incluir `v64-runtime.css/.js` no bundle público e Service Worker.
- [x] Renovar cache para `conta-de-casa-public-v64-runtime1`.
- [x] Integrar testes v64 na CI.
- [x] Atualizar PROJECT_STATE, ARCHITECTURE, DECISIONS, TODO e CHANGELOG na branch de release.
- [ ] Atualizar o head do PR #44 com a auditoria visual final.
- [ ] Obter CI final verde no HEAD final.
- [ ] Rever diff final do PR #44.
- [ ] Integrar PR #44 em `main` somente com CI verde.
- [ ] Confirmar CI de `main` após merge.
- [ ] Confirmar Deploy GitHub Pages v64.
- [ ] Confirmar que a v64 aparece em **Definições → Atualização de Software** e instala através de **Atualizar agora**.

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

## P0 — validação física acumulada

- [ ] iPhone/Safari: 320, 375, 390 e 430 px; portrait e landscape.
- [ ] Cabeçalho: Início, Faturas, Compras e Relatórios com mesma escala, alinhamento e controlos.
- [ ] Faturas: pesquisa, filtros, calendário, nova fatura, edição, pagamento, recorrência **Por preencher**.
- [ ] Compras: pesquisa, categorias, scanner, quantidade, editar/eliminar, preço real confirmado.
- [ ] QR fiscal: permitir/recusar/revogar câmara e encerrar tracks.
- [ ] Scanner: autofocus, baixa luz, código inválido, código repetido e produto ambíguo.
- [ ] Tema claro/escuro.
- [ ] Tablet/desktop: ausência de scroll horizontal, sidebar e tabelas.
- [ ] Atualização v63 → v64 pelo Centro de Atualização.

## P1 — simplificação técnica

- [ ] Depois da v64 validada fisicamente, avaliar remoção do pipeline histórico de imagens (`market-retailer-image-policy.js`, `market-image-audit.js`, `market-official-images.js`, CSS associado).
- [ ] Manter Open Food Facts quando necessário para identificação por GTIN mesmo que o pipeline de fotografias seja removido.
- [ ] Consolidar CSS antigo substituído por `ui-consistency.css`/`v64-runtime.css` apenas numa release separada.
- [ ] Avaliar incorporar o estado `draft` de recorrência diretamente no schema numa migração formal futura, evitando manter a adaptação apenas na camada runtime.

## P1 — acessibilidade e segurança

- [ ] Testar VoiceOver/TalkBack em navegação, Compras, scanner, Faturas e QR.
- [ ] Rever contraste dos estados em tema claro/escuro em hardware real.
- [ ] Confirmar nomes acessíveis de todos os botões icon-only.
- [ ] Rever dependências externas do scanner e estratégia de integridade/auto-hospedagem numa release de segurança dedicada.

## P2 — manutenção

- [ ] Remover glifos Unicode antigos depois da validação final Lucide.
- [ ] Avaliar fonte única de versão depois de validar transições reais pelo Centro de Atualização.
- [ ] Avaliar OCR/PDF de faturas apenas com política explícita de confiança e privacidade.
