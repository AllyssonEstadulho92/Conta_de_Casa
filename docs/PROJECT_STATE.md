# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Branch pública: `main`
SHA publicado após a Parte 1: `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`
Distribuição: GitHub Pages / PWA
Revisão de usabilidade integrada: `75-usability1`
PR de integração: `#66`
CI de `main`: run `34471773663` — sucesso
GitHub Pages: run `34471814790` — sucesso

## Baseline preservada

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000` preservado;
- sincronização GitHub opcional limitada ao envelope cifrado;
- UI `74-ui1`, Mercado `74-shopping2`, menu `73-menu8`, experiência `74-experience2`;
- arquitetura `75-architecture2`, cabeçalho `75-header2`, estabilidade `75-stability1`, geometria `75-layout1`, drawer `75-drawer2`;
- startup `75-startup2`, catálogo `75-catalog4`, loader `75-photo-loader3`;
- usabilidade transversal `75-usability1`.

## Estado confirmado

A branch anterior `fix/v75-pin-images-stability` já estava integralmente contida em `main` antes desta auditoria. A Parte 1 da nova auditoria foi desenvolvida em `fix/v75-usability-part1`, validada por CI e integrada por squash através do PR `#66`.

O commit público resultante é `c352c1883c16fd7df92aa0f26d23e3c5084b0fcf`. O CI de `main` terminou com sucesso no run `34471773663` e o workflow GitHub Pages do mesmo SHA terminou com sucesso no run `34471814790`.

## Auditoria UX/UI transversal — constatações

Âmbito solicitado: ecrã de bloqueio, Início, Despesas, Mercado, Planeamento, Mais, ícones, navegação, responsividade e interação mobile.

### Confirmado

1. A aplicação possui arquitetura visual v75 por camadas, mantendo `core.js`/`finance.js` separados da apresentação.
2. A navegação v75 usa cinco destinos principais em mobile: Início, Despesas, Mercado, Planeamento e Mais.
3. A linguagem oficial de ícones é Lucide local via `ui-icons.js`; ainda existem fallbacks históricos no HTML/base, mas a hidratação atual normaliza os principais controlos visíveis.
4. `v75-stability.css` já aplicava `font-size:16px` aos campos mobile para evitar o auto-zoom de foco do Safari/iOS.
5. O `viewport` não usa `user-scalable=no` nem `maximum-scale=1`, preservando a ampliação manual por acessibilidade.
6. O cofre dispõe de teclado PIN próprio em mobile, modo palavra-passe alternativo, recuperação/alteração de PIN e tratamento de VisualViewport.
7. A distribuição pública é preparada por `scripts/prepare-pages.cjs`; o `index.html` do repositório é um template base e não representa sozinho o bundle final v75.

### Riscos/dívida técnica ainda abertos

- A aplicação mantém várias camadas visuais históricas. Só devem ser fundidas/removidas depois de prova de ausência de referências e regressões.
- `PAGE_META`/template ainda contém nomenclaturas históricas como Faturas/Lista de compras, enquanto a arquitetura v75 apresenta Despesas/Mercado.
- A validação física específica de `75-usability1` em iPhone/Safari/PWA ainda deve confirmar que toques e foco não provocam zoom involuntário.
- As páginas necessitam agora da auditoria de detalhe por fluxo, densidade, estados e consistência visual; isso é tratado nas Partes 2 a 4.

## Parte 1 concluída e publicada — `75-usability1`

Foi criada e publicada `v75-usability.css`, uma camada isolada de interação/apresentação:

- `touch-action: manipulation` em controlos interativos para reduzir zoom acidental por duplo toque;
- pinch-to-zoom e ampliação manual continuam disponíveis;
- controlos de formulário mobile mantidos a 16 px;
- alvos tácteis mínimos de 44 px e 48 px onde aplicável;
- cofre mobile reforçado com `100dvh`, safe areas, scroll controlado e cartão responsivo;
- navegação inferior e barras de Despesas/Mercado com áreas de toque estáveis;
- respeito por `prefers-reduced-motion`.

A camada foi adicionada ao gerador de Pages, ao allowlist/cache do Service Worker e aos testes de regressão. Durante o QA foram detetadas duas incompatibilidades em testes que verificavam a ordem textual da assinatura do cache; foram corrigidas preservando todas as assinaturas legadas e acrescentando `usability1` no final. A execução seguinte ficou verde.

## Segurança

A Parte 1 não alterou `core.js`, `finance.js`, PBKDF2, AES-GCM, PIN, IndexedDB, sincronização, faturas, pagamentos, preços, QR ou scanner. Não foram adicionados segredos, origens externas, bibliotecas runtime ou telemetria.

## Próximo passo

Parte 2: auditoria e melhoria de **Início + Despesas + Planeamento**, com foco em hierarquia, densidade, estados vazios/erro/carregamento, pesquisa/filtros/ações, consistência de valores e responsividade. Só depois avançar para Mercado e Mais/ícones/acessibilidade final.
