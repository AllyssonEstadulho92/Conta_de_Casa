# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Distribuição: GitHub Pages / PWA

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, Mercado e catálogos são camadas separadas. Permanecem obrigatórios:

- `STATE_VERSION = 5`;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM para o cofre;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhuma password, token ou chave embutida no código público.

## 2. Núcleo

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos.

A revisão atual não altera `core.js`, `finance.js`, pagamentos, faturas, QR, scanner, quantidades ou valores financeiros.

## 3. Arranque e PIN

Fluxo base:

`PIN → unlockVault() → enterApp() → syncStartupGate() → shell`

Até `75-startup1`, `syncStartupGate()` podia bloquear a apresentação do shell enquanto verificava o GitHub, mesmo quando o dispositivo já tinha uma cópia local cifrada previamente confirmada.

`v75-startup-guard.js` passa a revisão `75-startup2` e instala uma otimização estritamente para dispositivos emparelhados:

1. confirma que sincronização está ativa;
2. confirma que existe `pairedAt` e `lastRemoteSha`;
3. confirma que a credencial local existe e que o dispositivo está online;
4. apresenta imediatamente a cópia local já decifrada pelo PIN;
5. inicia `syncNow('startup-background')` sem bloquear a UI.

Para primeiro emparelhamento, ausência de token ou estados não confirmados, o `syncStartupGate()` original continua a decidir. A política de conflitos não é alterada.

A mesma camada conserva a proteção visual contra o estado em que `#vaultScreen` e `#app` estariam simultaneamente ocultos.

## 4. Mercado — identidade

Produtos continuam identificados por `marketId|pid`. Fotografias oficiais não representam preço nem transação.

- `market-image-library.js`: cache partilhado de URL oficial validado;
- `market-visual-catalog.js`: índice progressivo + renderer incremental interno `75-catalog3`;
- `pingo-doce-photo-library.js`: inventário dedicado Pingo Doce `75-pd-photo1`;
- `market-catalog-image-resolver.js`: resolvedor exato distribuído como `75-catalog4`;
- `market-photo-loader.js`: hidratação prioritária `75-photo-loader3`.

## 5. Resolução oficial `75-catalog4`

Para um cartão do catálogo com `sourceUrl` oficial:

1. `safeProductUrl()` valida HTTPS, retalhista, path e PID;
2. `r.jina.ai` lê apenas a página oficial exata;
3. URLs candidatas são extraídas;
4. `safeOfficialImageUrl()` valida host/path/PID;
5. a melhor referência é devolvida para a biblioteca partilhada.

Limites: 8 s por leitura; máximo 2 operações simultâneas.

Mudança de `75-catalog4`: uma tentativa direta sem resultado termina nesse ponto. Não volta ao bridge legado para repetir pesquisa Cesta, leitura da mesma página e preflight. O bridge legado permanece disponível apenas para resultados sem `sourceUrl` exato, como pesquisa livre.

## 6. Loader `75-photo-loader3`

O loader trabalha apenas quando `#page-market.page.active`.

Estados visuais:

- 0–7 s: **A carregar fotografia…**;
- 7–12 s: **A validar fotografia…**;
- após 12 s sem fotografia: **Sem fotografia** estável.

Um estado terminal não é equivalente a “SKU sem imagem para sempre”; significa apenas que a tentativa atual terminou. O retry automático usa cooldown de 5 min, e atualização explícita/nova navegação pode antecipar nova tentativa.

Prioridade: até 8 cartões, procurando equilíbrio entre Pingo Doce e Continente antes de preencher vagas restantes.

Quando uma fotografia Pingo Doce existe no cache partilhado ou é resolvida com sucesso, o loader atualiza também o registo correspondente da base `conta-de-casa-pingo-doce-photo-library` para `imageState='ready'`. Isso alinha o contador dedicado com o estado técnico efetivamente comprovado.

## 7. Bases de imagens

### Partilhada

DB: `conta-de-casa-market-image-library`

Store: `images`

Chave: `marketId|pid`

Guarda apenas URL oficial validado, página oficial, nome/embalagem técnicos e timestamps. TTL positivo: 45 dias.

### Pingo Doce

DB: `conta-de-casa-pingo-doce-photo-library`

Store principal: `products`

Estados: `pending | ready | missing`.

O contador “fotografias oficiais” conta apenas `ready`, não o total de imagens existentes na biblioteca partilhada.

## 8. Fonte e validação

A sonda real de CI testa:

- disponibilidade de `cesta.pt` para Continente e Pingo Doce;
- resposta CORS do reader para o origin GitHub Pages;
- presença de imagem exata;
- compatibilidade da mesma URL com o validador usado pelo runtime.

No diagnóstico de 10/09/2026, o Pingo Doce conhecido `pid 739490` foi aceite com `runtime-safe=true`, excluindo uma rejeição universal do formato atual das URLs Pingo Doce como explicação para o contador zero.

## 9. Segurança

As camadas de imagem não podem manipular `appState`, `saveState()`, `commit()`, `estimatedCents`, `actualCents`, `amountCents`, PIN, passwords ou tokens.

A otimização do arranque pode consultar apenas metadados de sincronização e iniciar a mesma sincronização cifrada já existente; não reduz PBKDF2, não altera AES-GCM e não apresenta dados sem o PIN ter decifrado o cofre local.

## 10. Distribuição candidata

Cache candidato:

`conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2-stability1-layout1-drawer2-featured1-image-library1-catalog4-pd-photo1-photo-loader3-startup2`

Revisões novas:

- startup: `75-startup2`;
- catálogo/resolvedor de distribuição: `75-catalog4`;
- loader: `75-photo-loader3`.

Renderer incremental do catálogo continua internamente `75-catalog3`.

## 11. QA

Branch CI `34445844039`: sucesso completo. A validação em hardware continua necessária porque os sintomas reportados são dependentes de Safari/PWA, rede e IndexedDB local.
