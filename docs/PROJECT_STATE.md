# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público confirmado: v62
Distribuição: GitHub Pages
Branch pública: `main`
Estado: **v62 integrada, testada e publicada**. PR #34 fundido em `main`; merge `231e445839f07316344719b7423890c6e2e99c47`; CI de `main` `34008497654` terminou com `success`; Deploy Pages `34008513566` terminou com `success`. Falta apenas validação física no iPhone/Safari da correspondência visual dos SKUs reportados.

## Estado atual

A aplicação continua uma PWA estática/local-first. O cofre permanece no navegador, cifrado com o modelo existente; o estado financeiro continua no IndexedDB e a sincronização GitHub permanece opcional. O schema financeiro continua na versão 5. A v62 não altera PIN/palavra-passe, PBKDF2, AES-GCM, faturas, preços, quantidades, totais, backups nem contratos de sincronização.

## Defeito confirmado após a v61

A validação real mostrou uma segunda falha distinta: alguns cartões passaram a apresentar fotografias, mas essas fotografias não correspondiam necessariamente à imagem exibida na página oficial do Pingo Doce/Continente.

A revisão do código confirmou a causa:

- `market-experience.js` ainda fazia uma pesquisa auxiliar no Open Food Facts durante a pesquisa viva e podia enriquecer o cartão por semelhança textual;
- `market-image-audit.js` mantinha fallbacks Open Food/Beauty/Products/Pet Facts quando a fotografia oficial não era resolvida;
- `market-official-images.js` v61 validava corretamente a fotografia oficial por `pid`, mas não estabelecia exclusividade sobre os outros resolvedores;
- portanto, uma fotografia aproximada de outra origem podia aparecer antes ou depois do bridge oficial.

Conclusão: o problema não estava na disponibilidade do CDN oficial — os probes continuam a encontrar imagens exatas — mas na existência de pipelines visuais concorrentes.

## Revisão v62 — cartões vivos official-only

Foi criado `market-retailer-image-policy.js` como política explícita para resultados vivos do Pingo Doce e Continente.

Regra de produto: **um cartão vivo de retalhista só pode mostrar a fotografia oficial do mesmo SKU/pid. Se essa fotografia não puder ser provada, mostra placeholder. Nunca é usada uma fotografia aproximada de outra fonte nesse cartão.**

O fluxo v62:

1. identifica o cartão `cesta-(continente|pingo-doce)-<pid>`;
2. marca-o como `official-only` e exclui-o da auditoria/fallback legado;
3. valida qualquer imagem presente exclusivamente através de `CDCOfficialMarketImages.safeOfficialImageUrl(..., marketId, pid)`;
4. remove imediatamente qualquer imagem que não corresponda ao host/catálogo oficial e ao `pid` exato;
5. mantém o placeholder enquanto o bridge oficial resolve a fotografia;
6. preserva a imagem quando o bridge v61 comprova a mesma cadeia e o mesmo `pid`;
7. observa alterações posteriores de `src` para impedir que um fallback legado volte a substituir a fotografia;
8. após o clique real em `+`, remove metadados visuais auxiliares se o item tiver recebido uma imagem não oficial e não existir resolução oficial segura.

A política não cria uma nova fonte de rede e não faz `fetch`; reutiliza o bridge oficial já auditado.

## Sinalização e proveniência

Mantém-se a separação:

- **Consultado agora** — atualidade da consulta/preço;
- **Ver no Pingo Doce / Ver no Continente** — ligação para a página do retalhista;
- **Pingo Doce · imagem oficial / Continente · imagem oficial** — proveniência apenas quando a fotografia é validada.

O aviso do browser explica que, nos resultados vivos, uma fotografia aproximada de outra origem não será usada para preencher o cartão.

## Segurança e privacidade v62

- nenhuma nova origem externa ou credencial;
- política v62 não faz pedidos de rede;
- resolução oficial continua a usar apenas URL pública de produto previamente validada;
- `credentials:'omit'` e `referrerPolicy:'no-referrer'` permanecem no bridge;
- nenhum PIN, chave, token GitHub, fatura, saldo ou conteúdo financeiro é enviado para resolver fotografias;
- falha da imagem não altera preço, quantidade ou possibilidade de adicionar o produto;
- Open Facts permanece disponível para contextos auxiliares já existentes, como identificação por código de barras e compatibilidade de itens anteriores, mas fica impedido de preencher os cartões vivos Pingo Doce/Continente.

## Build, testes e publicação

Build: `v62`.
Cache: `conta-de-casa-public-v62-retailer-official-only`.
Novo asset público: `market-retailer-image-policy.js`.

Validação concluída:

- CI funcional da branch: `34008447948` — `success`;
- CI do PR #34: `34008477059` — `success`;
- merge em `main`: `231e445839f07316344719b7423890c6e2e99c47`;
- CI de `main`: `34008497654` — `success`;
- Deploy Pages v62: `34008513566` — `success`.

Passaram: probe das fontes reais, sintaxe incluindo a nova política, finanças, auditoria, isolamento do cofre, faturas/QR, Mercado, imagens, auditoria/zoom, bridge oficial, scanner, contabilização, ícones, Centro de Atualização, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização e manifest.

O probe continua a confirmar `exact-image=true` nos exemplos Continente `8167440` e Pingo Doce `739490` com o mesmo pedido simples usado pelo bridge.

## Limitações conhecidas

A v62 não garante fotografia para todos os produtos. Se a página oficial não expuser uma imagem identificável, o `pid` não coincidir, o reader/CDN estiver indisponível ou a imagem não carregar, o comportamento deliberado é manter o placeholder.

A validação automatizada e o deploy não substituem o teste físico no Safari/iPhone.

## Próximo passo

1. no iPhone, abrir **Definições → Atualização de Software** e confirmar `v62`;
2. fechar completamente e reabrir a aplicação/PWA após a atualização;
3. repetir a pesquisa que mostrou a imagem errada;
4. abrir **Ver no Pingo Doce/Continente** e comparar a miniatura com o mesmo SKU da página oficial;
5. confirmar que um SKU sem imagem oficial validável mantém placeholder, sem imagem aproximada;
6. validar 320, 375, 390 e 430 px, rede lenta e indisponibilidade temporária do reader/CDN.
