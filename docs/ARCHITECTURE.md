# Arquitetura — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v74`
Candidata: `v75`
Branch de trabalho: `redesign/v75-prototipo-fiel`

## 1. Visão geral

**Conta de Casa** é uma PWA estática distribuída por GitHub Pages. O modelo continua local-first: regras de negócio, persistência, formulários, cifragem e estado financeiro executam no cliente. A sincronização GitHub é opcional e transfere apenas o envelope cifrado.

A v75 não substitui o núcleo. Acrescenta uma camada final de arquitetura de informação e composição visual sobre a base v74 para alinhar a aplicação com o protótipo aprovado.

## 2. Núcleo preservado

- `core.js`: estado, normalização, IndexedDB, sanitização e cifragem;
- `finance.js`: cálculos e regras financeiras;
- `STATE_VERSION = 5`;
- valores monetários em inteiros de cêntimos;
- cofre PBKDF2-SHA-256 + AES-GCM;
- pagamentos e histórico existentes;
- sincronização opcional sobre envelope cifrado;
- sem credenciais, tokens ou segredos embutidos.

## 3. Camadas de apresentação

### Base v74

- `design-system.css`: tokens e normalização visual;
- `v74-experience.css/js`: composição funcional do Início, Despesas, Mercado, Planeamento, Relatórios e Mais;
- `mobile-menu-toggle.css/js`: controlador v73 do drawer à direita e hambúrguer ↔ X;
- `v64-runtime.js`: comportamento funcional ainda necessário.

### Final v75

`v75-architecture.css` é a camada visual final e deve ser carregada depois da v74. Define:

- identidade teal/verde-petróleo consistente;
- superfícies, bordas, raios, sombras e tipografia comuns;
- topbar móvel fixed e safe areas;
- cinco destinos móveis sempre visíveis;
- formulários mobile full-screen;
- scanner QR full-screen;
- composição compacta de Mercado, Planeamento, Relatórios, Mais e Sincronização;
- cofre/onboarding alinhados com `icon.svg` local;
- tema escuro equivalente.

`v75-architecture.js` é uma camada de orquestração visual. Responsabilidades:

- ajustar nomes e contexto de páginas;
- simplificar drawer e navegação secundária;
- integrar saudação no cabeçalho do Início;
- reorganizar Planeamento com métricas reais;
- criar a hierarquia de Mais;
- adicionar os modos Manual/Ler fatura/QR ao formulário real de nova despesa;
- apresentar o estado de sincronização antes da configuração técnica;
- reutilizar handlers e componentes existentes.

A camada não chama `saveState()` nem altera diretamente valores financeiros.

## 4. Navegação

Navegação primária móvel:

1. Início;
2. Despesas;
3. Mercado;
4. Planeamento;
5. Mais.

A v75 anula explicitamente uma regra histórica em `styles.css` que ocultava o terceiro item. O Mercado permanece visível.

O drawer é reduzido para:

- Principal: Início, Despesas, Mercado, Planeamento;
- Análise: Relatórios, Metas;
- Conta e sistema: Segurança, Diagnóstico, Mais.

`mobile-menu-toggle.js` continua responsável pelo mesmo `#mobileMenuBtn`, animação hambúrguer/X, Escape, foco e swipe da direita.

## 5. Adicionar despesa e faturas

O formulário de faturas/despesas continua a ser criado por `forms.js` e mantém os mesmos campos, IDs e handlers.

Na v75, apenas para nova despesa, a camada visual adiciona três modos:

- Manual;
- Ler fatura;
- QR Code.

A fotografia e o QR continuam a usar `invoice-capture.js`. O QR fiscal é preenchimento assistido; os dados são revistos antes de guardar. Não são inventadas linhas de produtos que o QR não forneça.

## 6. Mercado

- preço pesquisado → `estimatedCents`;
- preço confirmado/pago → `actualCents`;
- GTIN identifica artigo, não prova preço;
- fotografia validada é apoio visual;
- lojas suportadas na experiência v75: Continente e Pingo Doce;
- o protótipo pode mostrar outras cadeias, mas não são apresentadas sem suporte real.

## 7. Planeamento, Relatórios e Mais

Planeamento prioriza a leitura antes da edição: mês, orçamento, gasto, disponível e categorias. O formulário detalhado permanece abaixo.

Relatórios reutiliza os cálculos existentes e apenas reorganiza cartões/gráficos.

Mais é navegação secundária agrupada e não duplica Mercado nem Planeamento.

## 8. Sincronização

O painel técnico real continua em `#syncPanel`. A v75 adiciona uma introdução visual baseada exclusivamente no estado já renderizado pelo sistema. A sincronização continua opcional e cifrada.

## 9. Responsividade e acessibilidade

- breakpoint principal: `820px`;
- safe areas iOS em topbar, drawer, scanner, formulários e navegação inferior;
- alvos principais próximos ou superiores a 44 px;
- `prefers-reduced-motion` respeitado;
- foco e ARIA existentes preservados;
- sem bloqueio de pinch zoom;
- sem `zoom:` CSS como remendo.

## 10. Distribuição candidata v75

- `BUILD = v75`;
- `UI_REV = 74-ui1`;
- `SHOPPING_REV = 74-shopping2`;
- `MENU_REV = 73-menu8`;
- `EXPERIENCE_REV = 74-experience2`;
- `ARCHITECTURE_REV = 75-architecture2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

`ui-consistency.css` e `v64-runtime.css` continuam fora de `dist`.

## 11. Publicação

A v75 permanece candidata até CI completo. A versão pública continua v74 até PR, validação, merge em `main` e confirmação de GitHub Pages.
