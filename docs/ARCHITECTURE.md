# Arquitetura — Conta de Casa

Atualizado: 15 de setembro de 2026  
Versão: `0.76.0`  
Release pública: `v76`  
Distribuição: GitHub Pages / PWA

## 1. Modelo geral

PWA estática/local-first. O browser recebe HTML/CSS/JavaScript; a fonte funcional está a migrar incrementalmente para TypeScript strict. Não existe framework UI. A interface é composta por HTML, CSS e runtime próprio.

Invariantes:

- `STATE_VERSION=5`;
- dinheiro em cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` canónico quando existe identidade de loja/SKU;
- fotografia não prova preço/transação.

## 2. Segurança, cofre e sessão

`core.js` continua a autoridade de estado, cifra, normalização base e sessão:

`PIN/palavra-passe → PBKDF2 → check cifrado → AES-GCM → AppStateV5 normalizado`.

Contratos publicados:

- PIN local válido abre a aplicação sem depender do sync remoto;
- cofre e shell autenticado são visualmente exclusivos;
- `[hidden]` é autoridade explícita no Safari/WebKit;
- sync, quando configurado, continua em background;
- anexos reais continuam bloqueados até existir cifragem dedicada.

## 3. Rotas e navegação

Rotas canónicas:

- dashboard;
- bills;
- calendar;
- planning;
- goals;
- market;
- reports;
- security;
- diagnostics;
- settings.

`renderPage()` continua a ser o dispatcher funcional.

A dívida histórica de duas autoridades móveis foi resolvida durante a consolidação v76:

- `v74-experience.js/.css` e Featured foram retirados do bundle e do repositório;
- `v75-architecture.js` é a autoridade de composição/navegação compatível com a shell atual;
- `mobile-menu-toggle.js` é a autoridade funcional do drawer/hambúrguer móvel;
- `v76-mobile-shell.css` é a autoridade geométrica final no mobile.

### 3.1 Hierarquia do menu completo — `76-drawer-hierarchy1`

O PR #136 simplificou o drawer sem alterar as rotas reais:

- **Principal:** Início (`dashboard`), Despesas (`bills`), Planeamento (`planning`), Mercado (`market`);
- **Análise:** Relatórios (`reports`);
- **Sistema:** Segurança e sincronização (`security`), Definições (`settings`).

Rotas secundárias continuam acessíveis dentro da respetiva página-pai e deixam de competir como destinos de primeiro nível:

- `calendar` → Despesas;
- `goals` → Planeamento;
- `diagnostics` → Definições.

`navParent(page, compact)` distingue os dois contextos:

- no menu completo, Segurança mantém seleção própria;
- no dock compacto de cinco destinos, Segurança continua agrupada em Mais/Definições;
- Calendário, Metas e Diagnóstico continuam a selecionar a página-pai correspondente.

O drawer permanece do lado direito porque `mobile-menu-toggle.js` e o gesto de abertura/fecho existentes estão orientados para esse lado; mudar o lado apenas por estética criaria risco desnecessário de regressão em swipe/hit-testing.

## 4. Arquitetura visual

Autoridades atuais:

- tokens/componentes: `v76-modern-ui.css` + `design-system.css`;
- composição de páginas: `v76-product-pages.css`, `v76-planning-more.css` e camadas v75 ainda ativas;
- geometria mobile/safe areas/dock: `v76-mobile-shell.css`;
- refinamentos móveis específicos de feature sem propriedade de viewport: `mobile-layout.css`;
- identidade gráfica: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer/hambúrguer: `mobile-menu-toggle.js/.css` para interação e `v75-drawer-theme.css` para apresentação;
- formulários de despesas/QR: `invoice-capture.js/.css` sobre os formulários canónicos.

### 4.1 Drawer móvel

`v75-drawer-theme.css` (`76-drawer-hierarchy1`) define a apresentação final do drawer em `<=820px`:

- largura útil até 360 px, mantendo margem de segurança no viewport;
- navegação vertical de uma coluna;
- linha de navegação com target mínimo de 52 px;
- ícones funcionais sem cartão interior decorativo;
- estado ativo em superfície teal suave, não apenas por cor do ícone;
- botão X com target 44×44 px, uma única superfície circular e foco visível;
- `Ocultar valores` e `Bloquear` em stack vertical;
- `prefers-reduced-motion`, `forced-colors`, safe areas e scroll do conteúdo preservados.

A cascade ainda contém muitas regras históricas v75 e `!important`. A redução deve ser feita por propriedade/componente, nunca por eliminação em massa.

### 4.2 Iconografia funcional — `76-icon-semantics1`

O PR #138 mantém a separação entre marca e ícones funcionais:

- `icon.svg` continua reservado à identidade gráfica da aplicação;
- `ui-icons.js` mantém um subset Lucide local, sem icon font nem CDN de iconografia;
- o snapshot de origem continua fixado em `94e4cb9d9db5907053ebf3636a97c45529cf776b` e `LUCIDE_LICENSE.txt` continua distribuído;
- `plan` passa a usar a geometria `CalendarCheck2` desse snapshot, substituindo a antiga geometria igual a `wallet`;
- `settings` passa a usar a geometria `Settings`/engrenagem desse snapshot, substituindo sliders;
- os nomes semânticos `plan` e `settings` não mudaram, logo `PAGE_META`, `DRAWER_GROUPS`, `MOBILE_NAV` e restantes callers não precisaram de novas rotas ou handlers;
- `ui-icons.css` continua a controlar tamanho, stroke, alinhamento, foco e comportamento visual partilhado;
- regressões em `tests/ui-icons.test.cjs` verificam que Planeamento não volta a wallet/tray e Definições não volta a sliders.

### 4.3 Despesas mobile — `76-bills-mobile-filters1`

O PR #140 reorganiza apenas a apresentação móvel do bloco de pesquisa/filtros de `#page-bills`.

Autoridade funcional preservada:

- `renderBills()` continua responsável pela filtragem/renderização;
- `events.js` continua responsável pelos listeners;
- os IDs `billSearch`, `newBillBtn`, `billStatusFilter`, `billCategoryFilter`, `billDateFrom`, `billDateTo`, `billSort` e `billClearFilters` não mudaram;
- não existe segunda fonte de estado nem transformação de valores em CSS.

Composição visual:

- `mobile-layout.css` contém o refinamento `76-bills-mobile-filters1` apenas em `<=820px`;
- `.bill-command-bar` agrupa pesquisa e ação principal sem alterar o formulário;
- a lupa CSS histórica de `v75-expenses-modern.css` é neutralizada quando o sistema Lucide local já fornece `.ui-search-icon`, evitando dupla iconografia;
- Estado/Categoria usam duas colunas em telefones com largura suficiente;
- De/Até preservam inputs `date` reais; Ordenar continua disponível e Limpar filtros mantém o mesmo handler;
- `<=360px` passa para uma coluna para evitar truncamento estrutural;
- targets essenciais permanecem >=44 px;
- `forced-colors` e `prefers-reduced-motion` têm fallback explícito;
- `mobile-layout.css` não pode definir `100dvh` nem recriar scroll/viewport global: essa propriedade continua exclusiva de `v76-mobile-shell.css`.

## 5. Design system

Direção vigente:

- superfícies neutras;
- teal como marca/ação/seleção, não como fundo dominante universal;
- sombras mínimas;
- hierarquia por tipografia, alinhamento e espaço antes de decoração;
- Lucide para ações/estados; `icon.svg` para a marca;
- ícones devem representar a responsabilidade real, sem reutilização visual por conveniência;
- targets essenciais >=44 px;
- WCAG 2.2 AA como referência mínima quando aplicável;
- light/dark, forced-colors e reduced-motion preservados.

## 6. Mercado

### Fontes e evidência

- pesquisa live atual: Pingo Doce e Continente através de cesta.pt;
- fotografia opcional: Open Food Facts apenas quando existe correspondência forte/validada;
- preço pesquisado entra como `estimatedCents`;
- valor pago só entra em `actualCents` após confirmação do utilizador;
- imagem/logótipo não constitui evidência de preço.

### Identidade canónica

O catálogo visual usa `marketId|pid` para identificar SKUs reais.

`76-market-identity1`, publicado pelo PR #133, estende este contrato à lista persistida sem alterar `STATE_VERSION`:

- a ação de adicionar produto transporta a identidade a partir de `data-market-add-product="cesta-<marketId>-<pid>"`;
- `v75-market-flow.js` aplica `marketId` e `pid` ao novo item imediatamente antes do commit;
- a mesma camada envolve `normalizeMarketItem()` para reter os campos em reload/restore/sync;
- itens manuais/legados usam `marketId:''` e `pid:''`;
- `src/types/persisted-state.ts` tipa os dois campos;
- `src/sync/sync-conflict-policy.ts` não os remove da business view, porque identidade de SKU não é mero metadado de apresentação.

`76-market-identity-stale1`, publicado pelo PR #134, acrescenta uma garantia temporal à ponte:

- a identidade capturada num clique live só permanece pendente durante o mesmo ciclo síncrono de evento;
- se o fluxo live chegar ao commit, `marketId/pid` são copiados para o item antes do primeiro `await`;
- se o fluxo não criar o item, a identidade pendente expira no microtask seguinte;
- isto impede que um clique live abortado contamine uma criação manual posterior.

A ponte continua transitória até o domínio Mercado ser migrado para uma fonte TypeScript canónica própria.

## 7. Faturas e captura

O fluxo Adicionar despesa usa o formulário financeiro existente e três modos de entrada:

- Manual;
- Ler fatura por imagem (procura QR da AT; não promete OCR integral);
- QR Code por câmara.

O PR #132 estabeleceu no mobile um único proprietário de scroll para evitar falhas de hit-testing no Safari/iOS. Scanner e formulário continuam separados da persistência financeira; o commit ocorre apenas após validação do formulário.

O PR #140 não altera captura nem domínio financeiro. A mudança atua somente sobre a apresentação da pesquisa e dos filtros móveis, mantendo os mesmos controlos HTML, IDs e listeners.

## 8. TypeScript

Fontes canónicas já existentes incluem:

- tipos em `src/types/*`;
- `src/ui/market-branding.ts`;
- `src/sync/sync-conflict-policy.ts`;
- fonte TS histórica do menu v76, embora o runtime público atual use a autoridade consolidada definida pela arquitetura móvel.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

JavaScript manual só deve ser removido depois de substituição comprovada e regressões verdes.

`ui-icons.js` continua JavaScript manual neste bloco: o PR #138 corrigiu apenas semântica visual e testes. A futura migração para TypeScript deve ser feita separadamente, com paridade do registry e do hydrator.

## 9. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → build Pages → deploy`.

Service Worker:

- navegação network-first com timeout de 4 s;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens de cache técnicos distribuem correções sem obrigar a alterar a release pública.

Os PR #133/#134/#136/#138/#140 não alteraram `package.json`, `release-manifest.json`, `app-update.js` nem a versão mostrada ao utilizador.

## 10. Segurança e dependências externas

- nenhum segredo deve existir no repositório público;
- CSP está ativa;
- armazenamento sensível em claro está bloqueado;
- zoom manual não é bloqueado;
- foco/safe areas/reduced-motion/forced-colors têm contratos de regressão;
- a iconografia Lucide continua local e licenciada; os PR #138/#140 não adicionaram qualquer CDN;
- ZXing ainda é carregado de `unpkg.com`, logo a afirmação “Sem CDNs” na página Segurança precisa de correção até a biblioteca ser empacotada localmente;
- `style-src 'unsafe-inline'` permanece dívida de hardening.

## 11. QA

A CI cobre sintaxe, finanças, isolamento, datas, QR, Mercado, imagens, scanner, UI, responsividade, acessibilidade, segurança e sync.

Limitação conhecida: vários testes “Safari/PWA” são contratos estáticos de código/CSS; ainda falta E2E real em WebKit/Chromium para toque, teclado, scroll e foco.

PR #140 passou:

- TypeScript Foundation PR `34942844618`;
- CI PR `34942844692`;
- CI push `34942841985`;
- o primeiro ciclo do PR detetou uma violação do contrato de arquitetura por `overflow:hidden` em CSS de feature; o código foi corrigido antes do merge e o gate voltou a verde;
- merge: `387a953e427331a5aa48d872cd7c54e1552d2c1c`;
- Pages `34942974208` iniciou após o merge e deve ser confirmado antes de encerrar a validação pública.

A aparência final dos filtros de Despesas, drawer e ícones corrigidos ainda deve ser validada fisicamente no iPhone/PWA; os gates automatizados não substituem esse teste visual.

## 12. Próxima consolidação

1. confirmar Pages do PR #140 e validar `76-bills-mobile-filters1` no iPhone/PWA;
2. validar `76-drawer-hierarchy1` + `76-icon-semantics1` no mesmo dispositivo;
3. corrigir a descrição de rede da página Segurança sem mudar a release;
4. preparar ZXing local e CSP mais restritiva num bloco isolado;
5. E2E WebKit/Chromium para PIN, navegação e formulário de despesas;
6. reduzir cascade CSS por componente com prova de não utilização;
7. continuar TypeScript em módulos de baixo acoplamento;
8. migrar `render/forms/events` apenas depois dos contratos visuais estabilizarem;
9. deixar finanças/core/cifra para blocos com vetores de paridade próprios.
