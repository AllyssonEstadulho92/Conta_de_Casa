# Changelog Técnico — Conta de Casa

## 2026-09-06 — Fotografias official-only nos cartões vivos v62

### Problema confirmado

Depois da publicação v61, a validação física mostrou um novo defeito: alguns cartões apresentavam uma fotografia, mas essa fotografia podia vir de uma fonte auxiliar e não corresponder à imagem do mesmo produto na página oficial do Pingo Doce/Continente.

A auditoria confirmou três pipelines em simultâneo:

- `market-experience.js` fazia enriquecimento inicial por Open Food Facts com matching textual;
- `market-image-audit.js` mantinha fallbacks Open Food/Beauty/Products/Pet Facts;
- `market-official-images.js` validava corretamente a imagem oficial por cadeia + `pid`, mas não impedia os dois mecanismos anteriores de preencher o cartão.

Logo, a v61 resolveu a integração oficial, mas não resolveu a **exclusividade da origem visual**.

### Alterações v62

- criado `market-retailer-image-policy.js`;
- resultados vivos `cesta-(continente|pingo-doce)-<pid>` passam a ter política `official-only`;
- cada cartão é marcado `data-market-image-audit="done"`, impedindo o fallback legado nesse contexto;
- qualquer imagem existente é validada exclusivamente por `CDCOfficialMarketImages.safeOfficialImageUrl(url, marketId, pid)`;
- imagem que não corresponda ao host/catálogo oficial e ao `pid` exato é retirada e substituída por placeholder;
- `MutationObserver` vigia novos cartões e mudanças posteriores de `src`, impedindo que uma imagem auxiliar volte a ocupar a miniatura;
- o bridge oficial v61 continua responsável por resolver a fotografia exata e é preservado quando a validação passa;
- depois do clique real no `+`, uma imagem/metadados auxiliares são limpos quando não existe fotografia oficial segura;
- `productCode` proveniente do mesmo matching visual auxiliar também é limpo nesse caso;
- Open Facts não é removido globalmente: continua disponível para scanner/identificação e compatibilidade de outros contextos.

### Sinalização

Mantém-se a separação semântica:

- **Consultado agora** — estado temporal do catálogo/preço;
- **Ver no Pingo Doce / Ver no Continente** — ação para abrir a página da loja;
- **Pingo Doce · imagem oficial / Continente · imagem oficial** — proveniência apenas da fotografia validada.

Se a imagem oficial não puder ser comprovada, fica placeholder. A aplicação deixa deliberadamente de usar uma imagem aproximada de outra fonte para “preencher” o cartão vivo.

### Segurança e privacidade

- a nova política não faz `fetch` e não acrescenta endpoints;
- nenhuma API key, Authorization ou segredo;
- bridge oficial mantém `credentials:'omit'` e `referrerPolicy:'no-referrer'`;
- nenhum PIN, chave, token GitHub, fatura, saldo ou valor financeiro é enviado;
- a correção não altera `estimatedCents`, `actualCents`, quantidade nem totais;
- Open Facts permanece permitido na CSP para fluxos explicitamente existentes, mas a política v62 impede a sua utilização visual nos cartões vivos de retalhista.

### Build e distribuição

- build passa a `v62`;
- cache passa a `conta-de-casa-public-v62-retailer-official-only`;
- `market-retailer-image-policy.js` entra na allowlist de Pages e Service Worker;
- a composição pública carrega a política antes de `market-image-audit.js`;
- Centro de Atualização recebe **v62 — Fotografia do retalhista sem misturas**;
- CI passa também a executar `node --check market-retailer-image-policy.js`.

### Testes e publicação

A cobertura exige explicitamente `official-only` nos cartões vivos, exclusão do fallback legado, remoção de imagem não oficial, validação pelo mesmo `pid`, limpeza de metadados visuais auxiliares, ordem correta dos scripts e cache/build v62.

Validação concluída:

- CI funcional da branch `34008447948` — `success`;
- CI do PR #34 `34008477059` — `success`;
- PR #34 integrado em `main` no merge `231e445839f07316344719b7423890c6e2e99c47`;
- CI de `main` `34008497654` — `success`;
- Deploy Pages v62 `34008513566` — `success`.

O probe do pipeline continuou a confirmar `exact-image=true` para os exemplos Continente `8167440` e Pingo Doce `739490`. A validação final permanece física: comparar no iPhone a miniatura apresentada com a página aberta por **Ver no Pingo Doce/Continente**.

## 2026-09-06 — Bridge de imagens oficiais v61

Depois da v60, a captura real em iPhone/Safari continuou com placeholders. A revisão confirmou seletores incorretos e tentativas de alterar funções privadas dentro de outro IIFE. A v61 criou `market-official-images.js`, baseado nos seletores reais, `pid` exato, reader CORS simples e validação do CDN oficial. PR #33 foi integrado em `main`; CI e Deploy Pages terminaram com sucesso. A validação física posterior revelou a concorrência com imagens auxiliares, tratada na v62.

## 2026-09-06 — Imagens oficiais e catálogo alargado v60

A v60 introduziu prioridade por SKU oficial, validação de URL/imagem, `r.jina.ai` como reader restrito e catálogo alargado. Os probes externos passaram, mas a validação física revelou que a integração com os cartões reais não estava corretamente ligada.

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
