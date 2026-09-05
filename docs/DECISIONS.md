# Decisões Técnicas — Conta de Casa

## D-001 — Separar altura do shell e VisualViewport

Data: 4 de setembro de 2026
Estado: aceite

### Contexto

O shell mobile estava dimensionado diretamente com `--visual-vh`, valor calculado a partir de `window.visualViewport.height`. Em Safari/iPhone esta medida é transitória e pode mudar com teclado e barras do browser, provocando corte do contentor principal.

### Decisão

O shell permanente (`.app-shell` e `.main`) passa a usar `100dvh`, com `100svh` como mínimo. As métricas de `VisualViewport` permanecem no projeto apenas para comportamento transitório de teclado e diálogos.

### Motivo

O CSS dinâmico do viewport é a fonte adequada para a dimensão estrutural da aplicação. O Visual Viewport é útil para reposicionar interfaces durante o teclado, mas não deve definir a altura persistente de toda a aplicação.

### Risco controlado

Browsers sem suporte a `dvh` ignoram a nova declaração e mantêm as regras anteriores. Não foram alterados dados nem lógica de negócio.

## D-002 — Camada de compatibilidade móvel dedicada

Data: 4 de setembro de 2026
Estado: aceite

### Decisão

Criar `mobile-layout.css` e carregá-lo depois de `design-system.css`, em vez de reescrever imediatamente os dois ficheiros CSS existentes.

### Motivo

Existem várias gerações de regras responsivas em `styles.css` e `design-system.css`. Uma refatoração total durante a correção aumentaria o risco de regressão. A camada final torna o override explícito, pequeno, testável e reversível.

### Consequência

A consolidação dos estilos duplicados fica como trabalho posterior, depois de validação física em iPhone.

## D-003 — Reduzir densidade vertical dos cartões de Compras

Data: 4 de setembro de 2026
Estado: aceite

### Decisão

Entre 360 px e 560 px, o estado volta à linha do produto e os três indicadores financeiros são apresentados numa única grelha de três colunas. Dispositivos abaixo de 360 px mantêm o layout empilhado.

### Motivo

O layout anterior fazia cada item ocupar uma fração excessiva do ecrã em iPhones comuns. A alteração preserva legibilidade e os alvos tácteis de 44 px, mas melhora a quantidade de informação visível por ecrã.

## D-004 — Implementar o protótipo Mercado numa camada isolada

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O protótipo aprovado altera significativamente a apresentação da Lista de compras e introduz um ecrã de descoberta/comparação de produtos, mas o projeto já possui lógica madura de criação, edição, cálculo, cifragem e sincronização.

### Decisão

Criar `market-experience.css` e `market-experience.js` como camada final e contextual. A nova camada só modifica a apresentação de `page-market` e o modo `market-browser` do diálogo comum.

O botão de novo item e a ação rápida Mercado passam pelo novo comparador. A edição de registos existentes continua a usar o formulário anterior.

### Motivo

A abordagem reproduz o protótipo com risco reduzido, evita reescrever componentes financeiros e permite remoção/reversão direta se a validação física revelar regressões.

### Consequência

Os dois novos assets passam a integrar `index.html`, Service Worker, bundle de Pages e CI. A consolidação futura no design system principal só deve ocorrer depois da validação visual em dispositivos reais.

## D-005 — Não apresentar dados de demonstração como preços reais

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O protótipo visual contém comparações de Pingo Doce, Continente e Mercadona. O projeto atual é uma PWA estática sem backend e a CSP só permite ligações à própria origem e à API GitHub. Não foi confirmada uma fonte única, estável e verificável para preços em tempo real dos três mercados.

### Decisão

A build v51 mantém os preços do protótipo apenas como **dados de demonstração explicitamente identificados**. `market-experience.js` não faz pedidos externos e, ao adicionar um produto à lista, grava `estimatedCents: 0` em vez do valor de demonstração.

### Motivo

Gravar ou apresentar um valor fictício como preço real contaminaria cálculos financeiros e reduziria a fiabilidade da aplicação. Adicionar scraping direto a partir do browser também introduziria problemas de CORS, disponibilidade, segurança, termos de utilização e rastreabilidade da origem.

### Próxima decisão necessária

Antes de preços reais, definir um subsistema próprio de recolha/normalização com fontes verificadas por mercado, backend/proxy, EAN/GTIN, timestamp, região/loja, promoções, cache, caducidade e indicação de origem.

## D-006 — Preços reais pesquisados entram como estimativa auditável

Data: 5 de setembro de 2026
Estado: aceite; componente Mercadona posteriormente substituída pela decisão v53

### Contexto

O utilizador pediu que a Lista de compras use preços reais pesquisados e que o valor selecionado seja contabilizado na lista, sem manter dados fictícios. A aplicação continua estática/local-first e não deve tratar uma consulta de preço como prova do montante efetivamente pago.

### Decisão

A decisão original introduziu fontes externas verificáveis e separou `estimatedCents` de `actualCents`. Na revisão v53, a parte relativa à Mercadona/Open Prices foi retirada. A regra atualmente válida é: Continente e Pingo Doce são pesquisados através do endpoint público `cesta.pt/mcp`; o preço escolhido é guardado em `estimatedCents`; `actualCents` permanece reservado ao valor efetivamente pago. Ao marcar o item como comprado, o cálculo contabilizado usa `actualCents` quando existe e, caso contrário, usa a estimativa pesquisada.

### Motivo

Esta separação permite que o total da lista reflita imediatamente o preço real consultado sem afirmar que esse foi necessariamente o preço de compra. Também mantém rastreabilidade, evita preços inventados e preserva a lógica financeira existente.

### Limitação

A disponibilidade, cobertura e atualidade dependem da fonte externa. Quando não existe evidência adequada, a aplicação deve mostrar ausência de preço em vez de fabricar um valor.

## 2026-09-05 — Mercado v53: dois retalhistas e quantidade automática

### Decisão

Retirar Mercadona da pesquisa de produção enquanto não existir uma fonte oficial portuguesa suficientemente completa e verificável. Manter Pingo Doce e Continente através de `cesta.pt`. Interpretar `estimatedCents` e `actualCents` como preço por unidade e calcular automaticamente o subtotal pela quantidade.

### Motivo

Evita uma falsa sensação de cobertura na Mercadona e corrige a inconsistência em que alterar a quantidade não alterava os totais da lista.

## D-007 — Código de barras identifica o produto; preço continua separado

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

Foi pedido um leitor de código de barras no ecrã **Adicionar produto**, usando a câmara, que permita reconhecer o artigo e chegar ao nome e ao valor praticado no mercado.

Um EAN/UPC/GTIN identifica o produto, mas não transporta o preço atual de uma cadeia. Misturar as duas responsabilidades criaria a falsa impressão de que o preço vem do código de barras.

### Decisão

Implementar uma cadeia de três responsabilidades independentes:

1. **Leitura local:** usar a câmara com `getUserMedia` e `@zxing/browser@0.2.0`, carregado sob pedido, para descodificar o código.
2. **Identificação:** validar checksum GTIN e consultar Open Food Facts apenas para obter nome, marca e quantidade quando disponíveis.
3. **Preço:** reutilizar o campo e o evento de pesquisa de `market-experience.js`, que continua a consultar `cesta.pt` para Pingo Doce e Continente.

Apenas GTIN-8, GTIN-12/UPC, GTIN-13/EAN e GTIN-14 válidos avançam. O scanner não adiciona itens diretamente e não escreve no estado financeiro.

### Motivo

A separação mantém a arquitetura auditável: a câmara resolve o código, a base de produtos resolve a identidade e a fonte de mercado resolve o preço. Também preserva todo o fluxo já testado de criação, quantidade, estimativa e preço efetivamente pago.

### Segurança e privacidade

- o vídeo é processado no dispositivo e não é enviado nem guardado;
- o GTIN é o único dado enviado ao Open Food Facts;
- pedidos de identificação usam `credentials: 'omit'`, `referrerPolicy: 'no-referrer'`, timeout e cancelamento;
- a biblioteca ZXing usa URL com versão fixa, nunca `latest`;
- a câmara é parada ao concluir, cancelar, fechar, ocultar ou abandonar a página;
- a CSP é alargada apenas às origens necessárias para o fluxo.

### Limitação aceite

Open Food Facts é uma base comunitária e pode não reconhecer todos os códigos. `cesta.pt` pode encontrar uma variante diferente ou nenhum produto para o nome identificado. Por isso, a interface não adiciona automaticamente o primeiro resultado: o utilizador continua a confirmar explicitamente o produto e o preço.

## D-008 — Um único sistema vetorial local para os ícones funcionais

Data: 5 de setembro de 2026
Estado: aceite; especificado posteriormente por D-010

### Contexto

A aplicação acumulou SVGs do registo `ICONS`, SVGs locais de módulos e caracteres Unicode como `⌂`, `◉`, `⌁`, `☼`, `⌄` e `×`. Em Safari/iPhone foi observada uma lupa parcialmente cortada no campo de pesquisa do Mercado. O CSS base também contém uma regra global `svg { height:auto }`, adequada a conteúdo responsivo mas inadequada a ícones com caixa fixa.

### Decisão

Criar `ui-icons.js` e `ui-icons.css` como camada de compatibilidade visual, sem reestruturar as páginas. O módulo estende o `ICONS` existente, mantém o contrato `icon()`, converte os glifos estáticos em SVG local e normaliza ícones criados por componentes dinâmicos.

Não será introduzida uma icon font remota. Todos os ícones funcionais devem usar SVG local com geometria 24×24, `currentColor`, espessura coerente e dimensões CSS explícitas.

### Motivo

Esta solução evita fallback tipográfico e diferenças de emoji entre plataformas, funciona offline, não adiciona pedidos ou tracking de terceiros e ataca diretamente a causa dimensional observada sem alterar rotas, dados ou regras de negócio.

### Movimento

Animação fica reservada a estados com significado: sincronização ativa, alerta, expansão e linha de leitura. Hover só é aplicado com pointer fino. `prefers-reduced-motion` desativa movimento não essencial.

## D-009 — QR fiscal de fatura como preenchimento assistido, não OCR automático

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

Foi pedido um leitor mais adequado a faturas e a possibilidade de submeter a fatura correta. O projeto tem `attachments` desativados e não deve começar a persistir fotografias/PDFs sem uma decisão de armazenamento, cifragem, sincronização e limites.

As faturas portuguesas emitidas por software certificado incluem Código QR com campos definidos pela Autoridade Tributária, oferecendo uma fonte estruturada para NIF do emitente, data/identificação do documento, ATCUD, impostos e total.

### Decisão

Adicionar `invoice-capture.js`/`.css` como camada progressiva apenas no formulário **Nova fatura**:

1. permitir leitura do QR pela câmara;
2. permitir selecionar uma imagem local da fatura;
3. descodificar localmente o QR com o mesmo ZXing já usado na aplicação;
4. validar estrutura mínima e formatos;
5. mostrar pré-visualização;
6. transferir campos apenas após confirmação explícita do utilizador;
7. manter `handleBillSubmit()` como única via de gravação da fatura.

A imagem não é persistida nem enviada. PDFs e OCR textual geral ficam fora desta decisão.

### Motivo

O QR fiscal é determinístico e auditável para os campos que contém. OCR de uma fotografia/PDF introduziria probabilidade de erro em montantes, datas e referências e exigiria uma política adicional de confiança. A pré-visualização e o clique **Preencher campos** preservam a revisão humana antes de qualquer dado financeiro ser guardado.

### Limitação aceite

O QR não deve ser usado para inferir nome comercial do fornecedor, categoria ou data de vencimento. Estes campos continuam sob responsabilidade do utilizador. O NIF do emitente pode ser colocado como identificação provisória do fornecedor, claramente sujeito a confirmação.

## D-010 — Lucide como biblioteca visual oficial, vendorizada localmente

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

Depois da primeira normalização de SVG, uma captura real de iPhone/Safari na página **Faturas** mostrou que a interface ainda misturava três comportamentos visuais: lupa nativa do browser, setas nativas dos `select` e um botão de criação com dois símbolos, provocado pelo `+` em pseudo-elemento legado e pelo SVG injetado pela camada de ícones.

Foram consideradas as famílias sugeridas: Google Material Symbols, Font Awesome, Bootstrap Icons, Lucide/Feather, Flaticon e Iconfinder.

### Decisão

Adotar **Lucide Icons** como biblioteca visual oficial para os ícones funcionais. A aplicação não carrega o pacote Lucide, uma Web Font ou CDN em runtime. Apenas o subset necessário de SVG é incorporado em `ui-icons.js`, referenciado ao snapshot:

`94e4cb9d9db5907053ebf3636a97c45529cf776b`

A licença é preservada em `LUCIDE_LICENSE.txt` e distribuída com o bundle público.

A implementação deve também normalizar os controlos cuja iconografia é normalmente desenhada pelo browser:

- `input[type="search"]`: remover a decoração WebKit/Safari e apresentar `Search` Lucide;
- `select`: aplicar `appearance:none` e sobrepor `ChevronDown` Lucide sem substituir o elemento nativo;
- botões compactos de criação: desativar o `::before` legado quando o botão já contém `Plus` Lucide;
- sincronização: usar símbolos cloud/refresh/offline/warning em vez de depender apenas de um ponto colorido;
- ações recorrentes: mapear editar, apagar, duplicar, pagar, filtrar, importar/exportar e bloquear para símbolos semânticos da mesma família.

### Motivo

Lucide encaixa no design atual por usar desenho linear, geometria 24×24, caps/joins arredondados e boa leitura em tamanhos pequenos. A integração local preserva offline/PWA, não expande a CSP, evita tracking ou falhas de CDN e permite fixar exatamente a versão visual entregue ao utilizador.

Material Symbols e Font Awesome são tecnicamente válidos, mas uma integração por fonte/pacote runtime acrescentaria dependência e maior superfície de distribuição sem benefício funcional para esta PWA estática. Bootstrap Icons também seria válido, mas a linguagem visual Lucide é mais próxima do estilo minimalista já pretendido. Flaticon e Iconfinder são catálogos úteis, mas misturar conjuntos/licenças dificultaria a coerência e a auditoria.

### Riscos e controlo

- o subset local não recebe atualizações automáticas; qualquer atualização deve fixar novo commit de origem e passar por revisão/CI;
- controlos nativos mantêm a semântica e interação original; a camada Lucide muda apenas a apresentação do símbolo;
- glifos Unicode que ainda permanecem como fallback estático no HTML/JS só devem ser removidos depois da validação física, para evitar alterações estruturais simultâneas desnecessárias;
- a validação final exige iPhone/Safari e Android/Chrome reais, sobretudo pesquisa, selects, botões compactos, tema, sincronização e diálogos.
