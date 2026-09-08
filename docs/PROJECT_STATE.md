# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v75`
Branch pública: `main`
Distribuição: GitHub Pages / PWA
URL pública: `https://allyssonestadulho92.github.io/Conta_de_Casa/`

## Estado atual

A v75 está integrada em `main` e publicada no GitHub Pages. A aplicação mantém arquitetura PWA estática/local-first, com estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre envelope cifrado e `STATE_VERSION = 5`.

## Refinamento visual atual — cabeçalho móvel `75-header2`

O cabeçalho móvel foi simplificado e refinado sem alterar navegação ou dados:

- removido do topbar o bloco `Olá, Utilizador / Bem-vindo de volta!` e o avatar associado;
- hambúrguer + título da página ficam alinhados à esquerda;
- sino de notificações permanece como única ação à direita;
- altura útil compactada para 60 px mais safe area do dispositivo;
- gradiente verde-petróleo/teal mais subtil, com profundidade leve e sem ruído decorativo;
- título com hierarquia tipográfica mais firme e truncamento seguro em ecrãs estreitos;
- hambúrguer e sino têm alvos tácteis de 42 px, estados de toque/foco e `prefers-reduced-motion`;
- badge da notificação mantém comportamento funcional e ganha contraste consistente;
- não existe saudação duplicada em páginas como Mercado, Planeamento ou Mais.

A alteração é exclusivamente visual em `v75-header-refinement.css`; não altera handlers, notificações, estado, cálculos, cofre ou sincronização.

## Arquitetura v75 preservada

- navegação móvel: **Início / Despesas / Mercado / Planeamento / Mais**;
- Despesas: Todas/Entradas/Saídas, pesquisa, movimentos e FAB;
- nova despesa mobile full-screen com **Manual / Ler fatura / QR Code**;
- QR/câmara reutiliza `invoice-capture.js`;
- Mercado mantém apenas fontes realmente suportadas: Continente e Pingo Doce;
- Planeamento usa métricas reais de orçamento, gasto, disponível e categorias;
- drawer à direita e animação hambúrguer ↔ X preservados;
- PIN/cofre, IndexedDB e sincronização não foram migrados.

## Versionamento público

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura final: `75-architecture2`;
- cabeçalho: `75-header2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2-header2`.

O Service Worker elimina caches anteriores durante `activate`; `v75-header-refinement.css` é asset público e o build Pages injeta `?v=75-header2` para invalidar a versão anterior do cabeçalho. O sufixo `header2` mantém o identificador-base da v75 compatível com as verificações existentes e ainda força um cache novo.

## Integridade funcional

Continuam preservados:

- `core.js` / persistência;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- pagamentos e histórico;
- PIN e palavra-passe;
- PBKDF2-SHA-256 + AES-GCM;
- QR fiscal e scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada.

## Próximo passo

Validar visualmente o cabeçalho `75-header2` no iPhone/Safari/PWA e confirmar: safe area, alinhamento hambúrguer/título/sino, badge, títulos longos, tema escuro, rotação, ausência de overflow e atualização do Service Worker. Depois, continuar o refinamento do Mercado com fallback robusto de imagens sem misturar essa tarefa com o cabeçalho.
