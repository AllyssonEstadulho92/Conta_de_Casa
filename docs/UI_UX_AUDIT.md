# Auditoria UI/UX transversal — Conta de Casa

Data: 13 de setembro de 2026  
Baseline auditada: `main` após PR #98 (`56f909846c5f02c466f047792c99a61f7fbac1c7`)  
Versão: `0.76.0-dev.1`  
Tecnologia: PWA estática/local-first, HTML/CSS/JavaScript com migração incremental para TypeScript strict; sem framework UI.

## 1. Fontes técnicas usadas

As decisões desta auditoria usam como referência, sem copiar componentes proprietários:

- Apple Human Interface Guidelines — Branding, Inclusion e safe areas: conteúdo acima da marca, padrões familiares, simplicidade/perceção, suporte a acessibilidade e áreas não obstruídas;
- Material Design 3 / Android accessibility — navegação inferior para 3–5 destinos primários e alvos tácteis recomendados de 48 dp;
- WCAG 2.2 / W3C — nível AA como alvo, Target Size (Minimum) 24×24 CSS px, focus not obscured, contraste e navegação por teclado;
- web.dev — layouts responsivos/adaptativos e prevenção de deslocações visuais/performance;
- documentação interna do projeto — `PROJECT_STATE`, `ARCHITECTURE`, `DECISIONS`, `TODO`, `DESIGN_ASSET_LIBRARY`, `UI_ICON_AUDIT` e testes CI.

## 2. Factos encontrados no código

- existem 10 rotas canónicas em `PAGE_META`: dashboard, bills, calendar, planning, goals, market, reports, security, diagnostics e settings;
- o bundle é composto por várias gerações simultâneas de CSS/runtime (`v74`, `v75`, `v76`), muitas com `!important`;
- `v76-modern-ui.css` já define tokens, superfícies, estados de botão, campos, grids e foco;
- `v76-mobile-shell.css` é a autoridade final de geometria mobile;
- `v76-product-pages.css` reorganiza o Dashboard, mas as restantes páginas ainda dependem maioritariamente de camadas v74/v75;
- `v74-experience.js` continua a criar navegação móvel e componentes visuais históricos;
- `core.js/render.js` também possuem navegação móvel canónica própria, portanto existem duas autoridades funcionais concorrentes;
- `v74-experience.js` ainda injeta onboarding antigo e cinco blocos de Dashboard que já foram visualmente substituídos;
- `v75-header-refinement.css` mantinha um header verde/gradiente com texto e ícones brancos, enquanto a camada v76 posterior passou o header para superfície clara;
- o acesso `76-auth1` definia `display:grid!important` no cofre; o PR #98 já tornou `[hidden]` explicitamente autoritativo no shell final;
- CI possui gates para rotas, IDs duplicados, assets do Pages, Safari/PWA, responsive, viewport móvel, acessibilidade, segurança, finanças, Mercado e sync.

## 3. Problemas confirmados

### CRÍTICO — autenticação/shell simultâneos no Safari

Estado: corrigido/publicado nos PR #96 e #98.

Causa: primeiro uma corrida de startup/sync; depois uma colisão CSS entre `display:grid!important` e o atributo `hidden`.

Impacto observado: cofre/PIN e página autenticada/dock visíveis ao mesmo tempo.

### ALTO — header móvel com duas direções visuais incompatíveis

Estado: correção em `feat/v76-ui-audit-system1`.

Causa: `v75-header-refinement.css` impunha gradiente escuro e `color:#fff!important`; `v76-product-pages.css` transformou o header final numa superfície clara.

Impacto: risco de título/ícones brancos sobre fundo claro, visual inconsistente e dependência excessiva da ordem da cascade.

Correção: header neutro, superfície do design system, texto escuro, borda subtil, sem gradiente/sombra pesada, controlos de 44 px, foco visível e forced-colors.

### ALTO — onboarding v74 ainda pode mascarar o fluxo de criação do cofre

Estado: correção em `feat/v76-ui-audit-system1`.

Causa: `renderWelcome()` adiciona `cdcWelcome` e aplica `cdc-vault-create-collapsed`, embora `76-auth1` já seja o fluxo visual pretendido.

Correção segura nesta fase: a autoridade CSS final oculta `#cdcWelcome` e mantém o formulário real `#vaultCreate` visível. A remoção definitiva da criação runtime fica para o bloco de limpeza v74 após regressões.

### ALTO — navegação móvel possui duas autoridades

Estado: aberto.

`core.js/render.js` definem uma lista; `v74-experience.js` reescreve `#mobileNav` com outra lista de cinco destinos. O comportamento final atual é previsível, mas a arquitetura não é sustentável.

Correção planeada: migrar a configuração final para uma única fonte TypeScript e remover a reescrita v74 apenas depois de paridade de drawer, `aria-current`, labels e rotas.

### ALTO — runtime v74 continua a criar Dashboard já substituído

Estado: aberto, visualmente mitigado por `76-dashboard-clean1`.

Os nós `cdcMobileGreeting`, `cdcMobileMonthWrap`, `cdcMonthHero`, `cdcQuickActions` e `cdcDashboardCategories` continuam a ser criados e depois escondidos. Isto aumenta trabalho de DOM, MutationObserver e risco de regressão.

### MÉDIO — cascade histórica excessiva

Estado: aberto.

Há múltiplas folhas a definir a mesma geometria/componente e a recuperar estados com `!important`. A ordem de carregamento está testada, mas o custo de manutenção é elevado.

Plano: retirar regras antigas apenas depois de cada página ter um contrato v76 equivalente e regressões verdes.

### MÉDIO — páginas ainda não têm o mesmo nível de consolidação v76

Dashboard e acesso estão mais avançados. Faturas/Planeamento têm correções v75 robustas; Mercado possui várias camadas próprias; Calendário, Relatórios, Objetivos, Segurança, Diagnóstico e Definições precisam de revisão visual final página a página.

### MÉDIO — fonte visual ainda usa várias famílias de regras históricas

A stack tipográfica final é local/system (`Inter` como preferência, seguido de fontes de sistema), sem download remoto. É necessário consolidar escalas/tokens e remover tamanhos arbitrários herdados após a revisão de todas as páginas.

## 4. Correções executadas no bloco `76-ui-audit1`

- cabeçalho móvel passou a superfície neutra clara/escura via tokens;
- removidos gradientes e texto branco forçado do header;
- menu e notificações passaram a 44×44 px;
- foco do header reforçado;
- dock inferior recebeu uma linguagem única: superfície neutra, selected state discreto, ícones 22 px, labels consistentes, foco visível, reduced-motion e forced-colors;
- onboarding visual v74 deixa de mascarar o formulário real do cofre;
- contrato `[hidden]` dos PR #98 é preservado;
- cache PWA invalidada para distribuir a mudança visual;
- testes de consistência e mobile shell atualizados para proteger estes contratos.

## 5. Decisões de design

- um único teal de marca para seleção/ação primária, não como fundo dominante;
- superfícies claras/escuras neutras, com bordas discretas e sombras mínimas;
- controlos essenciais >=44 px; quando houver refatoração Android-like específica, avaliar 48 px sem aumentar densidade desnecessariamente;
- hierarquia por tipografia, espaço e alinhamento antes de cartões/sombras;
- ícones lineares coerentes; não misturar emoji/caracteres decorativos com a biblioteca principal nas superfícies finais;
- mobile e desktop preservam a mesma informação essencial; muda a disposição, não o significado;
- nenhuma mudança visual pode alterar `STATE_VERSION`, cêntimos, IndexedDB, cofre, sync, QR/scanner ou regras de Mercado.

## 6. Ordem da continuação

1. consolidar navegação móvel numa única autoridade;
2. parar criação dos blocos v74 já substituídos;
3. Faturas — hierarquia, filtros, estados, tabela/lista, diálogos e captura;
4. Mercado — catálogo/lista, quantidade, scanner, fotos, estimativa vs real e `marketId|pid`;
5. Planeamento e Calendário;
6. Relatórios e Objetivos;
7. Segurança, Diagnóstico e Definições;
8. tipografia/iconografia final transversal;
9. dark mode, responsive e acessibilidade final;
10. eliminação comprovada de CSS/runtime residual e migração TypeScript por blocos.

## 7. Critério de conclusão

A auditoria não termina com um mockup aprovado. Só fecha quando cada rota real tem hierarquia consistente, os contratos de interação e acessibilidade estão testados, mobile/desktop preservam informação essencial, o runtime não cria componentes substituídos, CI/Pages estão verdes e a validação física confirma Safari/PWA sem sobreposição, overflow ou regressões.