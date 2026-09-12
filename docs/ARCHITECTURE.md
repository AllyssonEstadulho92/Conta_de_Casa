# Arquitetura — Conta de Casa

Atualizado: 12 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — UI/UX + migração incremental TypeScript  
Distribuição: GitHub Pages / PWA

## 1. Princípios e invariantes

A aplicação é uma PWA estática/local-first. Estado financeiro, apresentação, catálogos, imagens e metadados de build são responsabilidades separadas.

- `STATE_VERSION = 5`;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização remota opcional apenas do envelope cifrado;
- nenhum segredo no repositório público;
- `estimatedCents` distinto de `actualCents`;
- `marketId|pid` é a identidade canónica do pipeline especializado de SKU/fotografia;
- imagem/fotografia não é prova de preço nem de transação.

## 2. Núcleo funcional atual

Runtime legado ainda existente:

- `core.js`: estado, normalização, IndexedDB, cifragem e backup;
- `finance.js`: cálculos financeiros;
- `render.js`, `forms.js`, `events.js`: UI funcional e mutações autorizadas;
- `sync.js` + `sync-conflict-policy.js`: sincronização cifrada e conflitos;
- módulos de Mercado, QR, scanner, assets, atualização e navegação em JavaScript.

Fonte TypeScript atual:

- `src/types/`: contratos de domínio;
- `src/type-tests/`: provas de tipos;
- `src/ui/veggie-menu-toggle.ts`: controlo Veggie Burger/X.

O destino é substituir progressivamente o runtime legado por fonte TypeScript strict, sem alterar o comportamento validado.

## 3. Modelo de build e objetivo TypeScript

Hoje `scripts/prepare-pages.cjs` cria `dist/` por allowlist e o browser recebe JavaScript.

Arquitetura de destino:

`src/**/*.ts` → typecheck strict → compilação/build → JavaScript gerado em `dist/` → GitHub Pages

Regras:

- o browser nunca depende de TypeScript em runtime;
- JavaScript gerado é artefacto de build, não fonte manual;
- nenhum módulo JS legado é removido antes de existir substituto TS equivalente e regressões verdes;
- `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` permanecem ativos;
- a migração não autoriza alteração de schema, cifragem, fórmula ou semântica de preço.

## 4. Composição visual pública

Ordem relevante:

1. estilos base/responsive históricos;
2. `mobile-layout.css` — apenas refinamentos de features móveis;
3. camadas v75 de arquitetura/layout/pages/features;
4. `v76-veggie-menu.css` (`76-veggie-menu2`);
5. `v75-usability.css`;
6. `v76-modern-ui.css` (`76-modern-ui2`) — tokens e componentes visuais partilhados;
7. `v76-mobile-shell.css` (`76-mobile-shell2`) — autoridade final de geometria mobile ≤820 px;
8. estilos específicos do Centro de Versão.

O shell móvel carrega depois do design system de propósito: aparência e geometria são responsabilidades diferentes.

## 5. Propriedade única por preocupação

A arquitetura visual v76 separa:

- **tokens**: cor, tipografia, espaçamento, raio, sombra, foco;
- **shell**: viewport, scroll, safe areas, topbar, área principal e navegação persistente;
- **componentes**: botões, inputs, cards, tabs, dialogs, tabelas, toolbars e estados;
- **features**: Dashboard, Despesas/Faturas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico e Definições;
- **estados**: active, focus, disabled, loading, empty, error, offline, success;
- **domínio**: regras financeiras, Mercado, persistência, sync e segurança fora das camadas visuais.

Uma propriedade estrutural só pode ter uma autoridade. Não criar novos ficheiros “patch” para substituir seletor já pertencente a outra camada.

## 6. Shell móvel — `76-mobile-shell2`

Em ≤820 px, `v76-mobile-shell.css` é a única autoridade da geometria global:

- scroll vertical principal no documento;
- `.app-shell` com `min-height:100dvh`, sem clipping;
- `.main` sem scroll container paralelo;
- `.topbar` no fluxo normal e compensada por `safe-area-inset-top`;
- páginas com reserva inferior para o dock;
- `.mobile-nav` persistente e compensada por `safe-area-inset-bottom`;
- safe areas laterais;
- contratos para 320/360/375/390/430/768/820 px e landscape de baixa altura;
- foco e último conteúdo não ficam escondidos por navegação persistente.

`v76-modern-ui.css` pode estilizar topbar/dock, mas não pode reassumir `position`, offsets, safe area, altura estrutural, overflow global ou reserva de página.

## 7. Sistema visual — `76-modern-ui2`

`v76-modern-ui.css` é a autoridade visual transversal para tokens e componentes.

### Hierarquia de ações

- `primary`: única ação dominante do contexto;
- `secondary`: ação importante mas não dominante;
- `danger`: ação destrutiva;
- `link`: ação contextual de baixo peso;
- `icon button`: comando compacto com rótulo acessível.

Contratos:

- controlos principais com baseline de 44 px;
- ícones de botão com métricas consistentes;
- `focus-visible` claro;
- estados disabled/`aria-disabled` consistentes;
- hover apenas quando existe ponteiro fino;
- reduced-motion e forced-colors preservados.

### Grids e composição

- componentes partilhados usam `min-width:0` para evitar overflow;
- gaps usam tokens comuns;
- topologia de colunas continua pertencente à feature enquanto cada página não for consolidada;
- não transformar toda a informação em cards; espaço em branco e separadores também são ferramentas de hierarquia.

### Fotografias do Mercado

- `object-fit:contain` e `object-position:center` para não cortar produto;
- fallback visual consistente;
- origem/identidade/licença continuam independentes da apresentação;
- fotografia nunca altera preço, SKU ou total contabilizado.

## 8. Navegação e hierarquia do produto

Mobile principal:

`Início → Despesas → Mercado → Planeamento → Mais`

Desktop:

- sidebar persistente em largura adequada;
- destinos operacionais primeiro;
- áreas menos frequentes agrupadas visualmente;
- mesma arquitetura funcional do mobile, com maior densidade quando existe espaço.

Princípios:

- bottom navigation contém destinos, não comandos da vista;
- toolbar contém título, contexto e ações prioritárias;
- ações secundárias ficam no corpo/menu contextual/“Mais”;
- reduzir menus gigantes sem remover funcionalidades;
- o utilizador deve perceber onde está, o estado atual e a próxima ação em poucos segundos.

## 9. Direção das páginas

Os protótipos aprovados são referência de composição. Só entram dados/funções existentes no domínio real.

### Dashboard

Ordem alvo:

1. header limpo;
2. resumo financeiro principal real;
3. KPIs reais e limitados;
4. ações rápidas;
5. próximos vencimentos + orçamento;
6. categorias + atividade recente.

### Mercado

- pesquisa e ação adicionar/ler fatura bem separadas;
- catálogo/lista e carrinho sem duplicar informação;
- quantidade/preço/estado visíveis;
- total `Estimativa` até existir evidência completa;
- comparação de preços só quando houver fonte identificada e válida;
- logos/imagens só com origem/direito de utilização adequados.

### Planeamento

O domínio atual inclui saldo atual, saldo inicial, orçamento mensal e rendimentos. Qualquer calendário/tarefa/simulação do protótipo só entra depois de confirmar suporte funcional ou criar decisão de produto própria.

### Calendário

O calendário atual representa vencimentos/pagamentos. Não transformar automaticamente em agenda genérica de tarefas sem alteração de produto aprovada.

### Faturas

- pesquisa/filtros/estado/ordenação preservados;
- resumo por estado;
- tabela no desktop e lista legível no mobile;
- ação “Nova fatura” dominante;
- nenhuma alteração visual muda cálculo de saldo, pagamento ou vencimento.

## 10. Responsive e acessibilidade

Critério mínimo:

- mobile-first;
- reflow funcional a 320 CSS px;
- sem scroll horizontal global;
- safe areas com `env(safe-area-inset-*)`;
- não bloquear pinch-to-zoom;
- 44×44 CSS px como baseline interna de toque;
- foco não oculto por header/dock;
- tipografia de inputs compatível com Safari/iPhone;
- teclado virtual, landscape e dark mode fazem parte do QA;
- contraste e estados não dependem apenas de cor.

## 11. Dark mode

Light, Dark e System devem partilhar tokens sem “inverter branco para preto”. Superfícies, bordas, sombras, texto e cores semânticas precisam de valores próprios por tema.

## 12. Segurança

UI e migração TypeScript não podem enfraquecer:

- PIN/palavra-passe não persistidos;
- PBKDF2/AES-GCM;
- isolamento do cofre;
- sync cifrada;
- validação de QR/importações;
- CSP;
- ausência de segredos no repositório.

Dados remotos são validados sintática e semanticamente antes de entrarem no domínio.

## 13. QA e gates

Toda refatoração transversal deve manter verdes:

- invariantes financeiros;
- isolamento/cofre;
- datas civis;
- faturas/formulários/QR;
- Mercado/SKU/imagens/scanner;
- responsive/mobile;
- navegação/acessibilidade;
- sync/conflitos;
- PWA/manifesto/cache;
- TypeScript strict;
- `tests/ui-architecture-contract.test.cjs` enquanto os testes ainda não forem migrados para TypeScript.

## 14. Estratégia de migração de código

Ordem recomendada e vigente:

1. tipos e funções puras de dinheiro/datas;
2. domínio financeiro;
3. Mercado/modelo e carrinho;
4. core/persistência/cifra;
5. sync/conflitos;
6. render/forms/events e restante UI;
7. Service Worker/build;
8. migração dos próprios testes/tooling para TypeScript;
9. remoção final de JavaScript fonte legado.

Uma conversão massiva por renomear `.js` para `.ts` sem tipos reais não é aceite.
