# Changelog Técnico — Conta de Casa

## 2026-09-10 — v75 `75-startup1`: proteção contra ecrã branco no Safari/PWA

### Evidência

Uma validação física no iPhone/Safari mostrou uma página completamente branca enquanto a barra de progresso do browser permanecia ativa. A captura não permite identificar por si só uma única causa.

A auditoria confirmou dois caminhos independentes capazes de gerar um estado branco: a navegação do Service Worker aguardava `fetch(event.request)` sem timeout antes de recorrer ao cache; e o fluxo de entrada podia manter simultaneamente `#vaultScreen` e `#app` ocultos enquanto aguardava a barreira inicial de sincronização.

### Correção

- criado `v75-startup-guard.js` com revisão `75-startup1`;
- a guarda observa apenas `app-active` e os atributos `hidden` do cofre/shell;
- quando ambos ficariam ocultos durante arranque ativo, o ecrã seguro do cofre volta a ser apresentado com `aria-busy="true"`;
- é mostrada a mensagem **A preparar a aplicação com segurança…**;
- o shell financeiro permanece oculto até o fluxo funcional existente o libertar;
- assim que `#app` fica visível, a guarda oculta novamente o cofre e restaura a mensagem anterior;
- a camada não lê `appState`, IndexedDB, montantes ou sincronização.

### Navegação/Service Worker

- criada `navigationResponse()` para documentos de navegação;
- tentativa de rede usa `cache:'no-store'` e `AbortController`;
- timeout de navegação: 4000 ms;
- timeout/erro usa `./index.html` instalado em Cache Storage;
- resposta de rede válida atualiza o `index.html` em cache;
- ausência simultânea de rede e cache devolve 503 textual em vez de espera indefinida;
- cache passa a terminar em `photo-loader2-startup1`.

### Distribuição e testes

- `STARTUP_REV = '75-startup1'` adicionado a `scripts/prepare-pages.cjs`;
- `v75-startup-guard.js` integrado na allowlist pública e carregado depois de `v75-stability.js`;
- o ficheiro integra também a allowlist do Service Worker;
- criado `tests/safari-startup.test.cjs`;
- CI passa a verificar sintaxe da nova camada e regressão dedicada.

### Segurança e dados

- `core.js`, `finance.js`, PIN, PBKDF2-SHA-256, AES-GCM, pagamentos, faturas, QR, scanner e política de sincronização permanecem inalterados;
- a correção não antecipa dados financeiros durante o arranque;
- não é necessário limpar dados do Safari para aplicar a revisão; fazê-lo poderia eliminar o cofre local em IndexedDB.

### QA atual

- commit funcional: `cd229d83c3d47f54d7f8990a76f2f29acb372f47`;
- CI da branch `fix/v75-safari-blank-screen`, run `34440532734`: sucesso completo;
- integração/publicação em `main` ainda pendentes nesta etapa;
- validação física no mesmo iPhone/Safari continua obrigatória.

---

## 2026-09-09 — v75 `75-catalog3`: renderer incremental para eliminar flicker de fotografias

### Evidência

Uma validação física no iPhone mostrou a área de fotografia do catálogo a piscar durante atualizações automáticas. A análise confirmou que `scheduleImageWarm()` chamava `renderProducts()` depois de resolver uma fotografia e `renderProducts()` começava por `grid.replaceChildren()`, destruindo cartões e `<img>` antes da reconstrução assíncrona.

### Correção

- `market-visual-catalog.js` passa para revisão `75-catalog3`;
- cartões são reconciliados pela chave `marketId|pid`;
- o mesmo nó DOM é preservado enquanto o SKU continuar presente;
- apenas cartões obsoletos são removidos;
- novos nós são criados apenas para novos SKUs;
- loja, nome, embalagem e `aria-label` são atualizados sem substituir a área de fotografia;
- `scheduleImageWarm()` deixa de chamar `renderProducts()` após cada fotografia;
- uma fotografia persistida em background emite `cdc:market-photo-ready` para o loader.

### Distribuição e segurança

- `CATALOG_REV` passa para `75-catalog3`;
- cache passa para `...-image-library1-catalog3-pd-photo1-photo-loader2`;
- o resolvedor mantém lógica segura `75-catalog2` e valida host/path/PID;
- núcleo financeiro, PIN, cifragem e sincronização não foram alterados.

### QA/publicação

- CI da branch: sucesso;
- integração em `main`: fast-forward sem force para `6dd4eafa947bf83e847f657ab9e155717d3971bc`;
- CI de `main` run `34414686159`: sucesso;
- GitHub Pages run `34414730220`: sucesso;
- teste físico final do flicker continua pendente.

---

## 2026-09-09 — v75 `75-catalog2` + `75-photo-loader2`

- timeout do reader reduzido para 8 s;
- validação estrita de página oficial, retalhista, path e PID preservada;
- removido preflight visual duplicado;
- cartões visíveis priorizados até 6 por ciclo;
- resultado válido persistido e aplicado com `loading='eager'`;
- polling limitado a 500 ms/24 ciclos e retry de 30 s;
- imagem quebrada é expurgada;
- estado financeiro permanece isolado.

## 2026-09-09 — v75 `75-pd-photo1` + `75-photo-loader1`

- criada biblioteca Pingo Doce isolada por `pingo-doce|pid`;
- 15 famílias e mais de 200 termos;
- estados `pending|ready|missing`;
- limites de rede por sessão/dia;
- loader inicial com skeleton/spinner.

## 2026-09-09 — v75 `75-catalog1`

- criado catálogo visual progressivo;
- índice separado por `marketId|pid`;
- descoberta limitada de SKUs reais Continente/Pingo Doce;
- preços não persistidos;
- **Ver preço atual** reutiliza pesquisa viva.

## 2026-09-09 — v75 `75-image-library1`

- biblioteca persistente de fotografias oficiais em IndexedDB própria;
- identidade estrita `marketId|pid`;
- apenas metadados e URL oficial validado;
- TTL de 45 dias;
- nenhuma alteração ao estado financeiro.

## 2026-09-09 — v75 `75-featured1`

- cartões mobile em carrossel horizontal largo;
- área de fotografia estável;
- nome em duas linhas;
- preço isolado;
- fallback vetorial quando não existe fotografia.

## 2026-09-09 — v75 `75-drawer2`

- drawer mantém lado direito;
- gradiente petróleo/teal alinhado com o cabeçalho;
- hambúrguer/X, swipe, Escape, foco e ARIA preservados.

## 2026-09-09 — v75 `75-layout1`

- largura, margens, grelhas e ritmo vertical uniformizados;
- formulários/cartões reduzem colunas antes de comprimir conteúdo;
- sem alteração ao núcleo financeiro.

## 2026-09-08 — v75 `75-stability1` e `75-header2`

- tipografia, safe areas, overflow, formulários, navegação, diálogos e estados de imagem estabilizados;
- cabeçalho móvel simplificado para hambúrguer+título e notificações;
- Mercado permanece terceiro destino da navegação inferior.

## Histórico anterior

As revisões anteriores permanecem preservadas no histórico Git e em `release-manifest.json`.
