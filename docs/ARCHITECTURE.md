# Arquitetura — Conta de Casa

Atualizado: 10 de setembro de 2026  
Build publicado: `v75`  
Programa técnico: `v76` — migração incremental TypeScript  
Distribuição: GitHub Pages / PWA

Revisões integradas em `main`: `75-startup2`, `75-photo-loader3`, `75-catalog4`, `75-usability1`, `75-pages1`, `75-assets1`, `75-market1`, `75-expenses1`, fundação TypeScript e `76-veggie-menu1`.

## 1. Invariantes

A aplicação é PWA estática/local-first. Estado financeiro, apresentação, recursos visuais e catálogos permanecem separados.

- `STATE_VERSION = 5` enquanto não existir migração própria aprovada;
- dinheiro em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização opcional apenas do envelope cifrado;
- nenhuma password, token ou chave no código público;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` continua a identidade canónica do pipeline especializado de SKU/fotografia;
- alterações visuais não podem modificar regras financeiras, segurança ou persistência.

## 2. Núcleo funcional atual

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- `mobile-menu-toggle.js`: controlador móvel v73 para abertura/fecho, gesto horizontal e foco;
- `v75-architecture.js`: hierarquia e agrupamento da navegação;
- `src/`: módulos e contratos que estão a migrar progressivamente para TypeScript.

O browser continua a executar JavaScript. TypeScript é a fonte verificada/compilada durante a transição.

## 3. Build e composição pública

`index.html` é o template. `scripts/prepare-pages.cjs` cria `dist/` por allowlist explícita. `sw.js` mantém uma allowlist equivalente e revisão de cache invalidável.

Ordem relevante no mobile:

1. estilos base/responsive;
2. `mobile-menu-toggle.css`;
3. arquitetura/cabeçalho/estabilidade/layout/drawer v75;
4. `v75-pages.css` e `v75-expenses-modern.css`;
5. `v76-veggie-menu.css`;
6. componentes especializados do Mercado;
7. `v75-usability.css` como política final de interação.

Runtime relevante:

1. módulos funcionais atuais;
2. `mobile-menu-toggle.js` — controlador v73;
3. `v76-veggie-menu.js` — enhancement derivado de TypeScript, carregado depois do controlador;
4. runtimes v74/v75 de apresentação.

## 4. Navegação e hierarquia

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

O drawer completo organiza destinos por contexto. Relatórios, Metas, Segurança, Diagnóstico e preferências permanecem fluxos secundários. `v75-architecture.js` mantém a hierarquia; `76-veggie-menu1` não altera destinos, rotas nem permissões.

## 5. Cabeçalho móvel

A `.topbar` é sticky no topo. `76-veggie-menu1` reforça no mobile `position: sticky`, `top: 0` e z-index suficiente para permanecer acima do conteúdo normal, sem alterar safe areas ou navegação.

## 6. Veggie Burger TypeScript — `76-veggie-menu1`

`src/ui/veggie-menu-toggle.ts` é a fonte TypeScript strict. `v76-veggie-menu.js` é o runtime browser derivado.

O controlo canónico continua a ser um único `#mobileMenuBtn`:

- fechado: duas barras horizontais (`Veggie Burger`);
- aberto: barra superior `+45°` e inferior `-45°`, formando o X;
- `aria-expanded`, `aria-label` e abrir/fechar continuam sincronizados pelo controlador existente;
- `#drawerCloseBtn` histórico permanece oculto para impedir segundo X.

### Swipe

Antes desta revisão, o controlador v73 transferia `#mobileMenuBtn` para `.drawer-head`. Como `.drawer-head` pertence à `.nav-drawer-shell`, o botão era transformado juntamente com o painel durante o swipe e podia sair parcialmente do viewport.

Com `76-veggie-menu1`, quando o dialog está aberto, a camada TypeScript move **o mesmo botão**, sem clonar, para filho direto de `#mobileDrawer`, antes da `.nav-drawer-shell`:

`#mobileDrawer > #mobileMenuBtn + .nav-drawer-shell`

Consequências:

- o drawer continua a mover-se sob o dedo;
- o botão permanece no top-layer do dialog;
- `data-dragging` e `data-closing` não escondem o controlo;
- quando o dialog fecha, o controlador v73 devolve o mesmo botão ao cabeçalho;
- `.drawer-head` reserva espaço à direita para não colidir com marca/título.

`MutationObserver` sincroniza apenas estado visual/posição do controlo e não toca em dados financeiros.

## 7. Acessibilidade do menu

- alvo táctil 44 × 44 px;
- foco visível por teclado;
- `prefers-reduced-motion` remove transições/animações;
- `forced-colors` mantém contraste;
- SVG sentinel oculto preserva compatibilidade com `ui-icons.js` sem substituir o glyph customizado;
- pinch-to-zoom continua permitido.

## 8. Despesas — `75-expenses1`

`#page-bills` mantém a arquitetura funcional existente:

`index.html` → controlos  
`events.js` → filtros/ações  
`renderBills()`/`filterBills()` → composição/filtragem  
`finance.js` → estados e cálculos  
`render.js` → desktop/mobile

`v75-expenses-modern.css` é exclusivamente visual. Não existe segundo renderer nem segundo fluxo de persistência.

## 9. Mercado — dados e precisão

Cada item mantém `estimatedCents`, `actualCents`, `quantity` e `purchased` distintos. Produto pesquisado continua estimado até existir preço real confirmado.

O motor TypeScript futuro deve separar identidade, preço observado, estimativa, confirmação, quantidade/peso, promoções/descontos conhecidos, linha de carrinho, total e reconciliação com talão/fatura. Só pode apresentar **Exato** com todos os fatores determinantes confirmados.

## 10. Mercado — identidade, fotografias e logos

- identidade canónica especializada: `marketId|pid`;
- falha de fotografia nunca remove SKU;
- imagem é enriquecimento visual, não prova de preço;
- futura biblioteca deve preferir GTIN/PID e fonte verificada;
- logos SVG só entram como assets locais após verificação de origem/direito de utilização;
- CSP não é expandida apenas para branding.

Lacuna conhecida: `market-experience.js` extrai `pid` da resposta Cesta, mas ainda não o persiste como campo próprio por `addProduct()`. Corrigir apenas com teste específico.

## 11. Segurança

`76-veggie-menu1` não contém lógica de finanças, IndexedDB, PIN, PBKDF2, AES-GCM, sync, QR, scanner ou Mercado. Não introduz endpoint, telemetria, token, origem CSP ou segredo.

## 12. Migração TypeScript

Fundação integrada em `main` pelo PR #72. Arquitetura de destino:

- `src/core/`: estado, validação, datas, persistência;
- `src/finance/`: dinheiro, faturas, pagamentos, rendimentos, orçamento, IVA;
- `src/market/`: identidade, pesquisa, carrinho, promoções, imagens, reconciliação;
- `src/security/`: cofre/cifragem;
- `src/sync/`: sincronização/conflitos;
- `src/ui/`: render, formulários, eventos e navegação;
- `src/types/`: contratos partilhados.

Cada substituição de runtime exige paridade e regressão verde. `any` não justificado não é estratégia aceite.

## 13. QA

`tests/v76-veggie-menu.test.cjs` protege fonte TS, duas linhas, transformação para X, mesmo botão fora da shell transformada, topbar sticky, reduced-motion/forced-colors, isolamento financeiro e publicação.

PR #74 integrado em `main` como `f196545662b5d120a0dd21b2c498a209cfc144d3`.

Após integração:

- TypeScript `34517268279`: sucesso;
- CI `34517268450`: sucesso;
- Pages `34517324242`: sucesso.

Validação física continua obrigatória em iPhone/Safari/PWA, especialmente swipe, animação e geometrias 320/375/390/430 px.
