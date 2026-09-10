# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Branch pública: `main`
SHA de `main` antes da auditoria de usabilidade: `f85deed6d2fab5e1b0658ad74c25d323f621a19f`
Branch de auditoria/correção atual: `fix/v75-usability-part1`
Distribuição: GitHub Pages / PWA
Revisão de usabilidade candidata: `75-usability1`

## Baseline preservada

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000` preservado;
- sincronização GitHub opcional limitada ao envelope cifrado;
- UI `74-ui1`, Mercado `74-shopping2`, menu `73-menu8`, experiência `74-experience2`;
- arquitetura `75-architecture2`, cabeçalho `75-header2`, estabilidade `75-stability1`, geometria `75-layout1`, drawer `75-drawer2`;
- startup `75-startup2`, catálogo de distribuição `75-catalog4`, loader `75-photo-loader3`.

## Estado confirmado antes da nova auditoria

A branch anterior `fix/v75-pin-images-stability` e `main` foram comparadas em 10/09/2026 e estavam **idênticas**, `ahead 0 / behind 0`, no SHA `f85deed6d2fab5e1b0658ad74c25d323f621a19f`. Assim, as correções de PIN/fotografias já fazem parte do código de `main`. A publicação GitHub Pages desse SHA continua a exigir confirmação independente pelo workflow/ambiente antes de ser declarada como verificada.

## Auditoria UX/UI transversal — constatações

Âmbito solicitado: ecrã de bloqueio, Início, Despesas, Mercado, Planeamento, Mais, ícones, navegação, responsividade e interação mobile.

### Confirmado

1. A aplicação já possui uma arquitetura visual v75 por camadas, mantendo `core.js`/`finance.js` separados da apresentação.
2. A navegação v75 usa cinco destinos principais em mobile: Início, Despesas, Mercado, Planeamento e Mais.
3. A linguagem oficial de ícones é Lucide local via `ui-icons.js`; ainda existem SVGs/glifos de fallback no HTML e em camadas antigas, mas a hidratação atual normaliza os principais controlos visíveis.
4. `v75-stability.css` já força `font-size:16px` nos campos mobile para evitar o auto-zoom de foco do Safari/iOS.
5. O `viewport` não usa `user-scalable=no` nem `maximum-scale=1`, preservando a ampliação manual por acessibilidade.
6. O ecrã de cofre dispõe de teclado PIN próprio em mobile, modo palavra-passe alternativo, recuperação/alteração de PIN e tratamento de VisualViewport.
7. A distribuição pública é preparada por `scripts/prepare-pages.cjs`; o `index.html` do repositório é um template base e não representa sozinho o bundle final v75.

### Riscos encontrados

- Não existia uma regra transversal explícita para impedir **duplo toque/zoom acidental** em controlos, apesar de o auto-zoom de inputs já estar mitigado.
- O cofre mobile dependia de várias regras históricas para altura/espaçamento; em ecrãs baixos/teclado aberto era útil reforçar `100dvh`, safe areas e scroll controlado.
- A aplicação ainda mantém várias camadas visuais históricas. A remoção/compactação só deve ser feita depois de prova de ausência de referências para não introduzir regressões.
- A fonte técnica base (`PAGE_META`/HTML) ainda contém nomenclaturas antigas como Faturas/Lista de compras, enquanto a arquitetura v75 apresenta Despesas/Mercado. Não é erro funcional atual, mas é dívida de consolidação.

## Parte 1 implementada na branch — `75-usability1`

Foi criada uma camada isolada `v75-usability.css` com alterações apenas de interação/apresentação:

- `touch-action: manipulation` em controlos interativos para reduzir zoom acidental por duplo toque;
- mantém pinch-to-zoom e não bloqueia a ampliação manual do browser;
- garante controlos de formulário mobile a 16 px;
- reforça alvos tácteis mínimos de 44 px e 48 px onde aplicável;
- reforça o cofre mobile com `100dvh`, safe areas, scroll controlado e cartão responsivo;
- mantém navegação inferior e barras de Despesas/Mercado com áreas de toque estáveis;
- respeita `prefers-reduced-motion`.

A camada foi adicionada ao gerador de GitHub Pages e ao allowlist/cache do Service Worker. O teste transversal `tests/v75-stability.test.cjs` foi ampliado para validar anti-zoom, acessibilidade, distribuição e isolamento da camada.

## Segurança

A Parte 1 não altera `core.js`, `finance.js`, PBKDF2, AES-GCM, PIN, IndexedDB, sincronização, faturas, pagamentos, preços, QR ou scanner. Não foram adicionados segredos, origens externas, bibliotecas runtime ou telemetria.

## Próximas partes

1. validar CI da branch `fix/v75-usability-part1`;
2. integrar em `main` apenas se CI ficar verde e confirmar Pages no mesmo SHA;
3. Parte 2: Início + Despesas + Planeamento — hierarquia, densidade, estados vazios, filtros e ações;
4. Parte 3: Mercado — pesquisa, filtros, cartões, imagens, estados de carregamento e fluxo de compra sem tocar na contabilidade;
5. Parte 4: Mais + cofre + consolidação final de ícones e acessibilidade;
6. revalidação física em iPhone/Safari/PWA e, se possível, Android/Chrome.
