# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico: `v76` — migração incremental TypeScript  
Distribuição: GitHub Pages / PWA

Revisões integradas em `main`: `75-startup2`, `75-photo-loader3`, `75-catalog4`, `75-usability1`, `75-pages1`, `75-assets1`, `75-market1`, `75-expenses1` e fundação TypeScript. Revisão em desenvolvimento: `76-veggie-menu1`.

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, recursos visuais e catálogos permanecem separados.

- `STATE_VERSION = 5` enquanto não existir migração própria aprovada;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhuma password, token ou chave no código público;
- preço pesquisado do Mercado é `estimatedCents`; preço confirmado permanece `actualCents`;
- `marketId|pid` continua a identidade canónica do pipeline especializado de SKU/fotografia;
- alterações visuais não podem modificar regras financeiras, segurança ou persistência.

## 2. Núcleo funcional atual

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- `mobile-menu-toggle.js`: controlador móvel v73 já validado para abertura/fecho, gesto horizontal e foco;
- `v75-architecture.js`: hierarquia e agrupamento da navegação;
- `src/`: fundação e módulos que estão a migrar progressivamente para TypeScript.

O browser continua a executar JavaScript; TypeScript é fonte verificada/compilada durante a transição.

## 3. Build e composição pública

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` a partir de allowlist explícita e injeta as revisões publicadas. O Service Worker mantém uma allowlist equivalente e uma revisão de cache invalidável.

Ordem visual relevante no mobile:

1. estilos base e responsive;
2. `mobile-menu-toggle.css` — geometria/controller visual legado validado;
3. arquitetura, cabeçalho, estabilidade, layout e drawer v75;
4. `v75-pages.css` e `v75-expenses-modern.css`;
5. `v76-veggie-menu.css` — override específico do Veggie Burger;
6. componentes do Mercado;
7. `v75-usability.css` como política final de interação.

Ordem de runtime relevante:

1. runtimes funcionais atuais;
2. `mobile-menu-toggle.js` — controlador v73;
3. `v76-veggie-menu.js` — enhancement derivado de TypeScript, carregado depois do controlador;
4. runtimes v74/v75 de apresentação.

A nova camada não substitui o controlador v73 antes de existir equivalência funcional comprovada.

## 4. Navegação e hierarquia

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer completo organiza as áreas por contexto, mantendo os destinos canónicos e sem duplicar rotas. Relatórios, metas, segurança, diagnóstico e preferências permanecem fluxos secundários. A hierarquia é produzida por `v75-architecture.js`; o Veggie Burger não altera os destinos.

## 5. Cabeçalho móvel

A `.topbar` é sticky no topo e a revisão `76-veggie-menu1` reforça no mobile:

- `position: sticky`;
- `top: 0`;
- z-index suficiente para permanecer acima do conteúdo normal;
- largura e safe areas preservadas.

O objetivo é que o cabeçalho não desapareça quando a página é percorrida. A validação final continua a exigir Safari/PWA real.

## 6. Veggie Burger TypeScript — `76-veggie-menu1`

### Estrutura

`src/ui/veggie-menu-toggle.ts` é a fonte TypeScript strict. O runtime browser publicado é `v76-veggie-menu.js`.

O controlo canónico continua a ser **um único** `#mobileMenuBtn`:

- fechado: duas barras horizontais (`Veggie Burger`);
- aberto: barra superior `+45°` e inferior `-45°`, formando o X;
- `aria-expanded`, `aria-label` e o estado de abrir/fechar continuam sincronizados pelo controlador existente;
- o `#drawerCloseBtn` histórico permanece oculto, impedindo um segundo X.

### Correção do desaparecimento durante swipe

Antes desta revisão, `mobile-menu-toggle.js` transferia `#mobileMenuBtn` para `.drawer-head`. Como `.drawer-head` está dentro de `.nav-drawer-shell`, o botão era transformado juntamente com o painel durante o swipe e podia sair parcialmente do viewport.

A nova camada TypeScript observa a abertura do dialog e move **o mesmo botão**, sem clonar, para filho direto de `#mobileDrawer`, imediatamente antes de `.nav-drawer-shell`:

`#mobileDrawer > #mobileMenuBtn + .nav-drawer-shell`

Assim:

- o drawer continua a mover-se sob o dedo;
- o botão fica no top-layer do dialog;
- `data-dragging` e `data-closing` não escondem o controlo;
- quando o dialog fecha, o controlador v73 devolve o mesmo botão ao cabeçalho original;
- `.drawer-head` reserva espaço à direita para evitar colisão entre marca e botão.

`MutationObserver` é usado apenas para sincronizar estado visual/posição do controlo; não toca em dados da aplicação.

## 7. Acessibilidade do menu

- alvo táctil: 44 × 44 px;
- foco visível por teclado;
- `prefers-reduced-motion` remove transições/animações;
- `forced-colors` mantém fronteira e contraste do controlo;
- SVG sentinel oculto mantém compatibilidade com `ui-icons.js` sem permitir que a hidratação substitua o glyph customizado;
- não existe bloqueio de pinch-to-zoom.

## 8. Despesas — `75-expenses1`

A página `#page-bills` mantém a arquitetura funcional existente:

`index.html` → controlos canónicos  
`events.js` → filtros e ações  
`renderBills()`/`filterBills()` → composição e filtragem  
`finance.js` → estados, pagos, pendentes e vencimentos  
`render.js` → tabela desktop e cartões mobile

IDs funcionais preservados: `billSearch`, `billStatusFilter`, `billCategoryFilter`, `billDateFrom`, `billDateTo`, `billSort`, `billClearFilters`, `billSummary`, `billsList` e `newBillBtn`.

`v75-expenses-modern.css` é apenas apresentação. Não existe segundo renderer nem segundo fluxo de persistência.

## 9. Mercado — dados e precisão

Cada item mantém campos distintos:

- `estimatedCents`: preço pesquisado/estimado por unidade;
- `actualCents`: preço real confirmado por unidade;
- `quantity`: quantidade;
- `purchased`: estado de compra.

Um produto vindo do browser continua a ser criado com `estimatedCents = product.priceCents`, `actualCents = 0` e `purchased = false`. Se um item comprado ainda não tiver preço real, a UI deve expor `Preço por confirmar`.

O futuro motor TypeScript do Mercado deve separar identidade, observação de preço, estimativa, confirmação, quantidade/peso, promoções/descontos conhecidos, linha de carrinho, total e reconciliação com talão/fatura. Só pode apresentar **Exato** quando todos os fatores determinantes estiverem confirmados.

## 10. Mercado — identidade, fotografias e logos

Identidade canónica do pipeline especializado: `marketId|pid`.

Componentes atuais incluem `market-image-library.js`, `market-visual-catalog.js`, `pingo-doce-photo-library.js`, `market-catalog-image-resolver.js` e `market-photo-loader.js`.

Regras:

- falha de fotografia nunca remove SKU;
- imagem é enriquecimento visual, não prova de preço;
- pesquisa por termo/Open Food Facts não equivale a identificação forte de SKU;
- a futura biblioteca deve preferir GTIN/PID e fonte verificada;
- logos SVG só entram como assets locais após verificação de origem/direito de utilização;
- CSP não é expandida apenas para branding.

Existe uma lacuna registada: `market-experience.js` extrai `pid` da resposta Cesta para compor o ID interno, mas ainda não o preserva como propriedade própria nem o persiste por `addProduct()`. Corrigir apenas com teste específico.

## 11. Scanner, QR e segurança

`76-veggie-menu1` não contém lógica de scanner, QR, finanças, IndexedDB, PIN, PBKDF2, AES-GCM ou sincronização. Não introduz endpoints, telemetria, token, origem CSP ou segredo.

`75-market1` e `75-expenses1` mantêm o mesmo princípio de isolamento de apresentação.

## 12. Migração TypeScript

Fundação integrada em `main` pelo PR #72:

- `package.json`: TypeScript apenas como `devDependency`;
- `tsconfig.json`: `strict`, `noEmit`, `strictNullChecks`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `isolatedModules`;
- `src/types/`: tipos nominais, estado persistido v5 e contratos de Mercado;
- `src/type-tests/contracts.ts`;
- `.github/workflows/typescript.yml`.

Arquitetura de destino:

- `src/core/`: estado, validação, datas, persistência;
- `src/finance/`: dinheiro, faturas, pagamentos, rendimentos, orçamento, IVA;
- `src/market/`: identidade, pesquisa, carrinho, promoções, imagens, reconciliação;
- `src/security/`: cofre/cifragem;
- `src/sync/`: sincronização/conflitos;
- `src/ui/`: render, formulários, eventos e navegação;
- `src/types/`: contratos partilhados.

Cada substituição de runtime exige paridade e regressão verde. `any` não justificado não é estratégia aceite.

## 13. QA e validação física

`tests/v76-veggie-menu.test.cjs` protege:

- fonte TypeScript com dois elementos visuais;
- runtime browser válido;
- mesmo botão fora da superfície transformada durante drawer aberto;
- transformação duas linhas → X;
- topbar sticky;
- reduced-motion/forced-colors;
- ausência de mutação financeira;
- composição no Pages e Service Worker.

No head funcional `95bdacab47b8b97d5f6cf61d52fc492b5a10ceca`, TypeScript run `34516585121` e CI run `34516585241` concluíram com sucesso.

A validação física continua obrigatória em iPhone/Safari/PWA, 320/375/390/430 px, tablet/desktop quando aplicável, orientação vertical/horizontal e tema claro/escuro.
