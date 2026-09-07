# Decisões Técnicas — Conta de Casa

Atualizado: 7 de setembro de 2026

Este ficheiro mantém as decisões vigentes necessárias para continuidade. O histórico detalhado permanece no Git.

## D-001 — Altura estrutural separada do VisualViewport
Estado: aceite. `.app-shell` e `.main` usam unidades de viewport CSS; `VisualViewport` fica reservado a teclado e diálogos. A v64 não elimina o scroller interno de `.main`; apenas deixa de depender de `sticky` para o cabeçalho móvel.

## D-002 — Camada móvel dedicada
Estado: aceite. `mobile-layout.css` continua como compatibilidade para Safari, safe areas e viewport móvel. Correções de release podem ser aplicadas numa camada final explicitamente versionada.

## D-003 — Densidade móvel sem sacrificar alvos tácteis
Estado: aceite. A interface pode compactar cartões mantendo legibilidade, foco e alvos tácteis adequados.

## D-004 — Mercado como camada isolada
Estado: aceite. A experiência de Compras não reescreve cifragem, persistência ou o núcleo financeiro sem necessidade comprovada.

## D-005 — Nunca tratar demonstração como preço real
Estado: aceite. Valores fictícios não alimentam totais nem são apresentados como preços atuais.

## D-006 — Preço pesquisado é estimativa
Estado: aceite. O catálogo alimenta `estimatedCents`; `actualCents` representa o preço efetivamente pago/confirmado.

## D-007 — Código de barras identifica produto, não prova preço pago
Estado: aceite. GTIN/EAN/UPC identifica o artigo. O preço vem da fonte do Mercado e permanece estimado até existir confirmação da compra.

## D-008 — Lucide como sistema vetorial oficial
Estado: aceite. Os ícones são locais, auditáveis e não dependem de icon fonts/CDN em runtime.

## D-009 — QR fiscal como preenchimento assistido
Estado: aceite. O QR apenas preenche dados comprováveis e o utilizador revê antes de guardar.

## D-010 — Hierarquia móvel consistente
Estado: aceite. Compras mantém título contextual, ação `+`, scanner, cartões-resumo, ações compactas e navegação inferior consistente.

## D-011 — Cofre não simula funcionalidades inexistentes
Estado: aceite. A interface não apresenta autenticação/capacidades que não estejam realmente implementadas.

## D-012 — Fotografia é independente do preço
Estado: aceite como regra histórica. Uma fotografia nunca prova preço nem transação.

## D-013 — Atualização de software usa Service Worker same-origin
Estado: aceite. Atualizações públicas são distribuídas pela própria PWA.

## D-014 — Imagens por SKU com validação estrita
Estado: compatibilidade histórica. Enquanto os módulos antigos existirem, uma imagem só é considerada oficial quando cadeia e identificador correspondem.

## D-015 — Reader externo restrito a páginas públicas validadas
Estado: compatibilidade histórica enquanto o pipeline antigo de imagens estiver distribuído.

## D-016 — Integração de imagens usa o contrato real do DOM
Estado: histórico/compatibilidade. A integração depende de seletores e identificadores públicos, não de estado privado entre módulos.

## D-017 — Cartões vivos de retalhista eram `official-only`
Estado: substituída na apresentação por D-018; permanece apenas no pipeline histórico.

## D-018 — Mercado orientado a nomes, sem fotografias de produto
Data: 6 de setembro de 2026 · Estado: aceite.

A interface é `text-first`: nome, embalagem/quantidade, loja, categoria, estado e preço são a identidade principal. Fotografias/placeholder não ocupam espaço. A câmara permanece para código de barras. Metadados históricos de imagem são preservados por compatibilidade.

## D-019 — Browser do Mercado usa posições explícitas em mobile
Data: 6 de setembro de 2026 · Estado: aceite.

Conteúdo textual e botão `+` usam posições explícitas no Grid para impedir colunas fantasma. Abaixo de 360 px, o preço reflui em vez de comprimir palavras.

## D-020 — Metadados visuais do Mercado são conflitos técnicos
Data: 6 de setembro de 2026 · Estado: aceite.

`sync-conflict-policy.js` retira apenas `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt` da vista de equivalência de negócio. Nome, quantidade, `estimatedCents`, `actualCents`, estado e datas continuam protegidos como dados reais.

## D-021 — Lista de compras agrupada por categoria sem alterar o modelo
Data: 6 de setembro de 2026 · Estado: aceite.

O agrupamento reutiliza a categoria e os mesmos nós/handlers. Mobile usa `<details>/<summary>`; desktop mantém tabela e separadores de categoria.

## D-022 — Uma camada final resolve colisões visuais entre CSS legados
Data: 6 de setembro de 2026 · Estado: aceite e publicada na v63.

`ui-consistency.css` consolida regras visuais globais sem tocar no estado financeiro. Lucide mantém métrica comum, a navegação móvel usa um único indicador ativo e a faixa dos cartões-resumo permanece sólida.

## D-023 — Cada alteração pública relevante gera versão, manifesto e instalação confirmada
Data: 6 de setembro de 2026 · Estado: aceite.

Ciclo oficial: **alteração → nova versão → notas no `release-manifest.json` → CI → `main` → Pages → instalação pelo Centro de Atualização**.

`latestVersion` deve corresponder ao build; a atualização normal não ativa silenciosamente o novo worker; **Atualizar agora** envia `APPLY_UPDATE`; a allowlist do Service Worker permanece explícita; atualizar assets não apaga o cofre.

## D-024 — Auto-adição por código de barras exige correspondência conservadora
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

A auto-adição só ocorre quando existe exatamente um supermercado selecionado, o resultado pertence à mesma loja, nome/marca e embalagem são compatíveis, score >= `0.84` e a diferença para o segundo candidato >= `0.10`. Ambiguidade exige confirmação manual. GTIN repetido pendente incrementa quantidade. O preço encontrado atualiza apenas `estimatedCents`.

## D-025 — Próximas faturas recorrentes começam como `Por preencher`
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

Uma nova ocorrência automática mantém descrição, fornecedor, categoria, método, recorrência e vencimento; define `totalCents = 0`; limpa referência, observações e data de emissão; usa `draft: true` até preenchimento. Drafts não entram em pendentes/atrasos. Faturas com pagamentos, canceladas, arquivadas ou editadas são preservadas.

## D-026 — Cabeçalho móvel é fixo; o conteúdo continua no scroller interno
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

`.main` continua o scroller interno e a navegação inferior continua fixa. O cabeçalho móvel usa `fixed`, respeita `safe-area-inset-top` e `.main` recebe `padding-top` para impedir sobreposição.

## D-027 — O topbar móvel é global e não recebe decoração específica por página
Data: 7 de setembro de 2026 · Estado: aceite e publicada na v64.

Início, Faturas, Compras e Relatórios mantêm a mesma geometria de título, menu, botão `+`, Sync e fundo. A identidade de cada módulo permanece no conteúdo e não na estrutura global do cabeçalho.

## D-028 — O redeploy manual de Pages deve repetir as verificações específicas da release
Data: 7 de setembro de 2026 · Estado: aceite para integração após CI verde.

### Contexto

O deploy automático de Pages só ocorre após CI verde de `main`, mas `.github/workflows/pages.yml` também suporta `workflow_dispatch`. O passo de verificação do próprio deploy não incluía `v64-runtime.js` nem `tests/v64-runtime.test.cjs`, apesar de ambos serem componentes críticos da v64 e estarem na CI normal.

### Decisão

O caminho manual de Pages deve verificar, no mínimo, a sintaxe do runtime específico da versão e executar a respetiva regressão antes de preparar/publicar `dist`.

Para a v64, o workflow passa a executar explicitamente:

- `node --check v64-runtime.js`;
- `node tests/v64-runtime.test.cjs`.

### Motivo

Um redeploy manual não deve ter uma cobertura inferior à necessária para a camada que altera scanner, recorrências e safe area. A medida não altera dados nem lógica de negócio; reforça apenas o gate de publicação.