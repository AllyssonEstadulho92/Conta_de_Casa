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

## 4. Arquitetura visual

Autoridades atuais:

- tokens/componentes: `v76-modern-ui.css` + `design-system.css`;
- composição de páginas: `v76-product-pages.css`, `v76-planning-more.css` e camadas v75 ainda ativas;
- geometria mobile/safe areas/dock: `v76-mobile-shell.css`;
- identidade gráfica: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + `ui-icons.css`;
- drawer/hambúrguer: `mobile-menu-toggle.js/.css` + shell v76;
- formulários de despesas/QR: `invoice-capture.js/.css` sobre os formulários canónicos.

A cascade ainda contém muitas regras históricas v75 e `!important`. A redução deve ser feita por propriedade/componente, nunca por eliminação em massa.

## 5. Design system

Direção vigente:

- superfícies neutras;
- teal como marca/ação/seleção, não como fundo dominante universal;
- sombras mínimas;
- hierarquia por tipografia, alinhamento e espaço antes de decoração;
- Lucide para ações/estados; `icon.svg` para a marca;
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

`76-market-identity-stale1` acrescenta uma garantia temporal à ponte:

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

## 8. TypeScript

Fontes canónicas já existentes incluem:

- tipos em `src/types/*`;
- `src/ui/market-branding.ts`;
- `src/sync/sync-conflict-policy.ts`;
- fonte TS histórica do menu v76, embora o runtime público atual use a autoridade consolidada definida pela arquitetura móvel.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

JavaScript manual só deve ser removido depois de substituição comprovada e regressões verdes.

## 9. Build/PWA

Fluxo:

`branch/PR → TypeScript Foundation + CI → merge main → build Pages → deploy`.

Service Worker:

- navegação network-first com timeout de 4 s;
- assets públicos network-first/no-store com fallback de cache;
- allowlist explícita;
- tokens de cache técnicos distribuem correções sem obrigar a alterar a release pública.

Os hotfixes `76-market-identity1`/`76-market-identity-stale1` não alteram `package.json`, `release-manifest.json`, `app-update.js` nem a versão mostrada ao utilizador.

## 10. Segurança e dependências externas

- nenhum segredo deve existir no repositório público;
- CSP está ativa;
- armazenamento sensível em claro está bloqueado;
- zoom manual não é bloqueado;
- foco/safe areas/reduced-motion/forced-colors têm contratos de regressão;
- ZXing ainda é carregado de `unpkg.com`, logo a afirmação “Sem CDNs” na página Segurança precisa de correção até a biblioteca ser empacotada localmente;
- `style-src 'unsafe-inline'` permanece dívida de hardening.

## 11. QA

A CI cobre sintaxe, finanças, isolamento, datas, QR, Mercado, imagens, scanner, UI, responsividade, acessibilidade, segurança e sync.

Limitação conhecida: vários testes “Safari/PWA” são contratos estáticos de código/CSS; ainda falta E2E real em WebKit/Chromium para toque, teclado, scroll e foco.

PR #133 passou TypeScript Foundation, CI integral e Pages. O guard temporal de identidade tem regressão própria antes de integração.

## 12. Próxima consolidação

1. integrar/publicar `76-market-identity-stale1` com gates verdes;
2. E2E WebKit/Chromium para PIN, navegação e formulário de despesas;
3. corrigir copy de Segurança + preparar ZXing local;
4. reduzir cascade CSS por componente com prova de não utilização;
5. continuar TypeScript em módulos de baixo acoplamento;
6. migrar `render/forms/events` apenas depois dos contratos visuais estabilizarem;
7. deixar finanças/core/cifra para blocos com vetores de paridade próprios.
