# Changelog Técnico — Conta de Casa

## 2026-09-06 — Bridge de imagens oficiais v61

### Problema confirmado

Depois da publicação v60, a validação física em iPhone/Safari continuou a mostrar placeholders no ecrã **Adicionar produto**, mesmo em resultados com ligação do retalhista e apesar de o probe de CI conseguir localizar imagens oficiais.

A revisão do código encontrou uma falha real de integração entre módulos:

- `market-experience.js` renderiza `.market-result-source`, mas a camada v60 procurava `.market-product-source[href]`;
- o botão real usa `[data-market-add-product]`, mas a camada v60 tentava interceptar `[data-market-add]`;
- `resultById` e funções de catálogo estão dentro de um IIFE e não podiam ser substituídos externamente como a camada v60 pressupunha.

Isto explicava a diferença entre “a fonte tem a imagem” e “o cartão real recebeu a imagem”.

### Alterações

- criado `market-official-images.js` como bridge progressivo baseado nos seletores reais do Mercado;
- cadeia e `pid` são obtidos de `data-market-product-card`;
- `cesta.pt` continua a resolver a URL pública do SKU;
- a página do produto é validada por cadeia e `pid` antes de qualquer leitura;
- o reader `r.jina.ai` passa a ser chamado pelo novo bridge com GET CORS simples e apenas `Accept: application/json`;
- a fotografia só é aceite quando pertence ao host/catálogo oficial e contém o `pid` exato;
- antes de retirar o placeholder, o browser testa se a imagem efetivamente carrega;
- resolução continua limitada a três tarefas simultâneas e é iniciada de forma progressiva com `IntersectionObserver`;
- depois do clique real no `+`, a imagem resolvida é associada ao item criado e são persistidos `imageUrl`, `imageSource` e `imageMatchedAt`;
- preços, quantidades e cálculos não foram alterados.

### Sinalização corrigida

O antigo texto genérico **Produto oficial** podia criar conflito visual quando aparecia ao lado de uma miniatura vazia.

Na v61 a camada de integração separa a semântica:

- **Consultado agora** — atualidade da consulta/preço;
- **Ver no Pingo Doce** / **Ver no Continente** — ligação para a página do retalhista;
- **Pingo Doce · imagem oficial** / **Continente · imagem oficial** — proveniência da fotografia validada no contexto da imagem.

Se não houver fotografia comprovável para o SKU, o placeholder permanece, mas sem a sinalização ambígua.

### Segurança e privacidade

- sem API keys ou Authorization;
- `credentials:'omit'` e `referrerPolicy:'no-referrer'` mantidos;
- reader recebe apenas uma URL pública previamente validada;
- nenhum PIN, chave do cofre, token GitHub, fatura, saldo ou preço é enviado para obter a fotografia;
- binários continuam fora do cofre;
- falha da imagem não altera valores nem bloqueia a adição do produto.

### Build e distribuição

- build passa a `v61`;
- cache passa a `conta-de-casa-public-v61-official-images-bridge`;
- `market-official-images.js` entra na allowlist de `scripts/prepare-pages.cjs` e do Service Worker;
- `app-update.js` recebe **v61 — Imagens oficiais no browser real**;
- CSP pública mantém apenas as origens necessárias já auditadas.

### Testes

Novo teste: `tests/market-official-images.test.cjs`.

Também foram alinhados testes de Mercado, imagens, Centro de Atualização, ícones e responsividade para v61.

CI funcional da branch: `34002655320` — `success`.

O probe executado no mesmo pipeline confirmou disponibilidade de `cesta.pt` e imagens exatas para os exemplos Continente `8167440` e Pingo Doce `739490`. Esta evidência confirma a fonte, mas a validação final do comportamento visual continua a exigir Safari/iPhone real.

## 2026-09-06 — Imagens oficiais e catálogo alargado v60

A v60 introduziu prioridade por SKU oficial, validação de URL/imagem, `r.jina.ai` como reader restrito, catálogo alargado e build/cache próprios. Os probes externos passaram, mas a validação física posterior revelou que a integração com os cartões reais não estava corretamente ligada. A v61 mantém as regras de segurança da v60 e corrige essa fronteira de execução.

## 2026-09-05 — Auditoria e ampliação v59

- auditoria individual de imagens por produto;
- Open Food/Beauty/Products/Pet Facts como fontes de fallback;
- miniaturas tácteis/clicáveis com visualizador ampliado;
- persistência apenas de URL/metadados;
- placeholder preservado quando a correspondência não é segura.

## 2026-09-05 — Centro de Atualização v58

- criado `app-update.js/.css`;
- adicionada **Definições → Atualização de Software**;
- verificação manual via Service Worker same-origin;
- canal beta mantido desativado sem pipeline própria.

## 2026-09-05 — Fotografias reais v57

- introduzidos `productCode`, `imageUrl`, `imageSource` e `imageMatchedAt`;
- primeira pesquisa de fotografia via Open Food Facts;
- imagem mantida separada do preço.

## 2026-09-05 — Cofre, UI e Mercado anteriores

- cofre visual moderno com PIN/palavra-passe e criptografia preservados;
- Lucide adotado como sistema vetorial local;
- hierarquia mobile de Compras refinada;
- QR fiscal e scanner GTIN integrados;
- Pingo Doce/Continente usados como fontes de catálogo/preço através de `cesta.pt`;
- `estimatedCents` e `actualCents` permanecem separados.
