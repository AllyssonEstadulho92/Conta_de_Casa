from pathlib import Path
import re
ROOT=Path('.')

def read(path): return (ROOT/path).read_text(encoding="utf-8")
def write(path,text): (ROOT/path).write_text(text,encoding="utf-8")
def replace(path,old,new):
    text=read(path)
    if old not in text: raise RuntimeError(f"marker not found in {path}: {old[:120]!r}")
    write(path,text.replace(old,new))
def replace_regex(path,pattern,repl,flags=0,required=True):
    text=read(path); new,n=re.subn(pattern,repl,text,flags=flags)
    if not n and required: raise RuntimeError(f"regex marker not found in {path}: {pattern}")
    if n: write(path,new)
    return n
def append_once(path,marker,block):
    text=read(path)
    if marker in text: return
    write(path,text.rstrip()+"\n\n"+block.strip()+"\n")

# 6. Documentation continuity required by the project.
replace('docs/PROJECT_STATE.md','Build funcional: v53 com revisão visual Lucide v54 em validação','Build funcional: v53 + revisão visual Lucide v54 + experiência móvel v55 em validação')
replace_regex('docs/PROJECT_STATE.md',r'Estado da revisão:.*',
              'Estado da revisão: protótipo aprovado aplicado como camada v55 em branch de validação; hierarquia de ações, imagens de referência, margens e swipe adicionados sem alterar cálculos financeiros',required=True)
append_once('docs/PROJECT_STATE.md','## Revisão v55 — protótipo aprovado',r'''## Revisão v55 — protótipo aprovado

A página **Lista de compras** passa a seguir a hierarquia visual do protótipo aprovado, mantendo a estrutura financeira e os dados já existentes:

- o `+` azul do topo continua a ser a ação global **Adicionar**;
- a ação ao lado da pesquisa deixa de repetir `+` e passa a ser **Scan**, uma ação contextual para descobrir/adicionar produto;
- o título de Compras recebe o ícone de carrinho Lucide;
- os quatro resumos mantêm exatamente os cálculos existentes e recebem badges semânticos azul, verde, âmbar e violeta;
- cartões mobile recebem miniatura de produto quando existe referência válida e menu de mais opções;
- gutters laterais, safe areas e margem inferior passam a ser definidos centralmente para impedir encosto/corte em iPhone;
- swipe horizontal navega apenas entre Início, Faturas, Compras e Relatórios e nunca substitui o scroll vertical, controlos, diálogos ou gestos de borda do Safari.

### Imagens de produto

A imagem é tratada como **referência visual**, não como prova de que é a fotografia oficial do retalhista. A ligação **Produto oficial** devolvida pela pesquisa de preços continua separada para verificação no Continente/Pingo Doce. A pesquisa textual de imagens no Open Food Facts é opcional, assíncrona, limitada a no máximo uma chamada a cada 6,5 segundos e falha para placeholder sem impedir preços ou criação do item. Um GTIN lido pela câmara tem prioridade na resolução da imagem.

O schema financeiro mantém a versão 5. Foram acrescentados apenas metadados opcionais e retrocompatíveis ao item de compras: `productCode`, `imageUrl` e `imageSource`. Não são persistidos bytes de imagem.
''')
replace_regex('docs/PROJECT_STATE.md',r'## Próximo passo[\s\S]*$',r'''## Próximo passo

1. Executar CI completa da branch v55 e integrar apenas se todas as suites passarem.
2. Validar no iPhone/Safari a página **Lista de compras** em 320, 375, 390 e 430 px: margens, botão global `+`, botão Scan, cards, thumbnails e menu de mais opções.
3. Confirmar swipe esquerda/direita entre as quatro páginas principais sem interferir com scroll vertical, pesquisa, formulários, cards ou gesto de voltar do Safari.
4. Pesquisar produtos reais e confirmar que ausência/falha da imagem nunca impede a consulta do preço nem apresenta uma fotografia como “oficial”.
5. Validar código de barras real, autofocus, permissões, QR de faturas e tema claro/escuro em hardware físico.
''',flags=re.M)

# Architecture: register v55 layers in the existing ordered lists.
replace('docs/ARCHITECTURE.md','- `ui-icons.css`: última camada visual de ícones e normalização de pesquisas/selects.\n- `invoice-capture.css`:',
'- `ui-icons.css`: última camada visual de ícones e normalização de pesquisas/selects.\n- `app-experience.css`: hierarquia v55 do protótipo, gutters/safe areas, miniaturas e transições de swipe.\n- `invoice-capture.css`:')
replace('docs/ARCHITECTURE.md','6. `ui-icons.css`\n7. `invoice-capture.css`','6. `ui-icons.css`\n7. `app-experience.css`\n8. `invoice-capture.css`')
replace('docs/ARCHITECTURE.md','- `ui-icons.js`: subset local Lucide, adaptação ao contrato existente e hidratação visual de controlos estáticos/dinâmicos.\n- `events.js`:',
'- `ui-icons.js`: subset local Lucide, adaptação ao contrato existente e hidratação visual de controlos estáticos/dinâmicos.\n- `events.js`:')
replace('docs/ARCHITECTURE.md','- `events.js`: eventos, navegação, viewport e interação.\n- `market-experience.js`:',
'- `events.js`: eventos, navegação, viewport e interação.\n- `app-experience.js`: navegação gestual mobile, decoração contextual do título e hidratação segura/lazy de miniaturas.\n- `market-experience.js`:')
append_once('docs/ARCHITECTURE.md','## Experiência móvel v55',r'''## Experiência móvel v55

### Hierarquia de ações

A ação global `#quickAddBtn` permanece no topo. Em **Lista de compras**, `#newMarketBtn` é uma ação contextual **Scan** junto à pesquisa, evitando dois símbolos `+` com significado concorrente. Ambos mantêm os handlers existentes; a camada Lucide altera apenas a semântica visual do controlo contextual.

### Pipeline de imagem do produto

A imagem nunca participa no cálculo financeiro e não é requisito para adicionar um item:

1. `cesta.pt` continua responsável por preço e ligação **Produto oficial** do retalhista;
2. um GTIN lido usa a consulta exata Open Food Facts e recolhe também a fotografia frontal quando existe;
3. pesquisas apenas por texto podem pedir uma imagem de referência ao Open Food Facts de forma assíncrona;
4. a fila textual tem intervalo mínimo de 6,5 s para respeitar o limite de pesquisa e não funciona como search-as-you-type;
5. apenas URLs HTTPS do host `images.openfoodfacts.org` são aceites;
6. a UI identifica explicitamente a fotografia como **Imagem de referência** e mantém a ligação oficial separada;
7. falha, ausência ou baixa correspondência resulta em placeholder local, nunca numa imagem inventada.

`normalizeMarketItem()` aceita `productCode`, `imageUrl` e `imageSource` como metadados opcionais. O `STATE_VERSION` permanece 5 por serem campos aditivos e retrocompatíveis. São guardadas apenas strings validadas; bytes de imagem não entram no cofre.

### Swipe entre páginas

`app-experience.js` permite swipe apenas entre os quatro destinos presentes na barra mobile: `dashboard`, `bills`, `market`, `reports`. O reconhecimento exige deslocamento horizontal claro, distância mínima, duração limitada e início fora da faixa reservada às bordas do browser. Gestos iniciados em controlos interativos, tabs, sliders ou dialogs são ignorados. O scroll continua `pan-y` e `prefers-reduced-motion` remove a animação de transição.
''')

append_once('docs/DECISIONS.md','## D-011 — Imagens de produto são referência visual',r'''## D-011 — Imagens de produto são referência visual, não fotografia oficial do retalhista

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

O protótipo aprovado mostra miniaturas na Lista de compras e foi pedido que a pesquisa ajude a reconhecer visualmente o artigo. A fonte de preço `cesta.pt` fornece ligação para o produto do retalhista, mas a resposta atualmente consumida pela aplicação não fornece uma imagem oficial estável. O Open Food Facts disponibiliza imagens de produtos, mas é uma base comunitária.

### Decisão

Usar Open Food Facts apenas como fonte de **imagem de referência**. A ligação `Produto oficial` de Continente/Pingo Doce continua a ser a superfície distinta para confirmação no retalhista. A consulta por GTIN tem prioridade; a consulta textual é assíncrona, rate-limited e nunca bloqueia preços.

Só são aceites URLs HTTPS de `images.openfoodfacts.org`. `productCode`, `imageUrl` e `imageSource` são metadados opcionais do item e não alteram `STATE_VERSION=5`. Não se guardam bytes de imagem.

### Motivo

Permite reconhecimento visual sem atribuir falsamente origem oficial à fotografia, sem introduzir scraping de imagens das lojas e sem tornar uma dependência comunitária requisito para a função financeira.

## D-012 — Swipe limitado à navegação mobile primária

Data: 5 de setembro de 2026
Estado: aceite

### Decisão

Permitir swipe horizontal apenas entre Início, Faturas, Compras e Relatórios, exatamente os quatro destinos da barra inferior. Excluir diálogos, inputs, botões, links, selects, tabs, sliders e as zonas de borda reservadas aos gestos do browser. O scroll vertical mantém prioridade.

### Motivo

A navegação gestual fica previsível e alinhada com a arquitetura de informação já visível, sem criar rotas escondidas nem interferir com formulários, scanners ou o gesto de voltar do Safari.
''')

# Changelog at top after heading.
replace('docs/CHANGELOG.md','# Changelog Técnico — Conta de Casa\n',r'''# Changelog Técnico — Conta de Casa

## 2026-09-05 — v55: protótipo de Compras, imagens de referência e swipe

- aplicada a hierarquia do protótipo aprovado à Lista de compras sem alterar cálculos, rotas ou persistência financeira;
- mantido um único `+` global no topo; o controlo contextual junto à pesquisa passa a `Scan` Lucide;
- adicionados ícones semânticos aos quatro resumos e menu Lucide de mais opções nos cartões mobile;
- removidos glifos visíveis legados dos templates/runtime auditados; `core.js` mantém apenas o contrato SVG histórico como fallback interno;
- adicionadas miniaturas de produto com origem explicitamente marcada como **Imagem de referência**;
- GTIN usa imagem frontal da consulta exata Open Food Facts quando disponível; pesquisa textual de referência é assíncrona e limitada a uma chamada a cada 6,5 s;
- apenas `images.openfoodfacts.org` é aceite como host de imagem; `Produto oficial` continua a apontar separadamente para a página verificável do retalhista;
- adicionados metadados opcionais `productCode`, `imageUrl`, `imageSource` sem alterar `STATE_VERSION=5`;
- normalizados gutters, safe areas e margens mobile;
- swipe esquerda/direita limitado aos quatro destinos da barra inferior, com proteção de controlos, dialogs, gesto de borda e movimento reduzido;
- adicionada suite `tests/app-experience.test.cjs` e ampliadas as auditorias de segurança, ícones, responsividade, Mercado e código de barras.
''')

replace('docs/TODO.md','# TODO — Conta de Casa\n',r'''# TODO — Conta de Casa

## P0 — validação física v55

- [x] Aplicar a hierarquia visual do protótipo aprovado à Lista de compras sem remover funcionalidade.
- [x] Manter um único `+` global e transformar o segundo controlo em Scan contextual.
- [x] Auditar ícones runtime e remover glifos visíveis legados nas superfícies auditadas.
- [x] Acrescentar ícones semânticos aos quatro resumos e menu de mais opções nos itens.
- [x] Acrescentar imagem de referência validada, com GTIN prioritário e fallback textual rate-limited.
- [x] Separar explicitamente `Imagem de referência` da ligação `Produto oficial` do retalhista.
- [x] Centralizar margens laterais/safe areas e preservar alvos tácteis.
- [x] Implementar swipe entre Início, Faturas, Compras e Relatórios com proteção de interação.
- [ ] Validar iPhone/Safari em 320, 375, 390 e 430 px, retrato/paisagem, claro/escuro.
- [ ] Validar imagens reais e placeholders com rede rápida, lenta e offline.
- [ ] Validar swipe físico sem conflito com scroll, browser-back, pesquisa, filtros, scanners e dialogs.
''')

append_once('docs/UI_ICON_AUDIT.md','## Auditoria v55 — hierarquia do protótipo e cobertura runtime',r'''## Auditoria v55 — hierarquia do protótipo e cobertura runtime

A captura real de **Lista de compras** mostrou que o problema do segundo `+` já não era apenas geometria: existiam duas ações visualmente idênticas com níveis hierárquicos diferentes. A revisão v55 mantém o `+` azul do topo como criação global e atribui `Scan` ao controlo contextual da pesquisa.

A auditoria runtime passou a abranger `index.html`, `render.js`, `forms.js`, `events.js`, `market-experience.js`, `market-barcode.js` e `invoice-capture.js`, impedindo os glifos visíveis históricos `⌂`, `◉`, `⌁`, `☼`, `☾`, `⌄` e `×`. Scanners e módulos contextuais passam a pedir SVG através de `CDCIcons` quando precisam de iconografia. `core.js` conserva `ICONS` apenas como contrato/fallback arquitetural; a família apresentada ao utilizador continua Lucide.

Foram adicionados também os símbolos do protótipo aos resumos de Compras e o menu `MoreHorizontal`/mais opções nos cartões mobile. Estatísticas e gráficos continuam dados, não são convertidos em decoração.
''')

print('v55 patch, tests and documentation applied')
