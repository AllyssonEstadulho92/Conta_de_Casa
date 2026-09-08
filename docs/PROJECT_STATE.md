# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v74`
Candidata em validação: `v75`
Branch de trabalho: `redesign/v75-prototipo-fiel`
Branch pública: `main`
Distribuição: GitHub Pages / PWA

## Estado atual

A **v74 continua publicada em `main`** enquanto a v75 é validada. A v75 é uma reestruturação total de apresentação e arquitetura de informação para aproximar a aplicação do protótipo aprovado sem migrar o núcleo financeiro.

A arquitetura continua PWA estática/local-first: estado financeiro em IndexedDB, valores em cêntimos, cofre PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre o envelope cifrado e `STATE_VERSION = 5`.

## Reestruturação v75

A camada final `v75-architecture.css/js` passa a aplicar uma linguagem única em mobile e desktop:

- cabeçalho verde-petróleo e superfícies claras/compactas;
- navegação móvel real com **Início / Despesas / Mercado / Planeamento / Mais**;
- Início com saudação integrada no cabeçalho, mês, resumo, orçamento, ações rápidas e categorias;
- Despesas com Todas/Entradas/Saídas, pesquisa, movimentos e FAB;
- Adicionar despesa em ecrã completo no móvel com **Manual / Ler fatura / QR Code**;
- scanner QR em ecrã completo, reutilizando `invoice-capture.js`;
- Mercado com pesquisa, cartões compactos e apenas lojas realmente suportadas: Continente e Pingo Doce;
- Planeamento com mês, anel de orçamento, gasto, disponível e distribuição real por categoria;
- Relatórios, Mais, Sincronização, drawer e cofre alinhados com a mesma identidade;
- `icon.svg` local reutilizado no onboarding/cofre e identidade da aplicação;
- teclado PIN móvel em três colunas, sem alterar autenticação.

## Integridade funcional

A v75 não altera diretamente:

- `core.js` / regras de persistência;
- `finance.js` / cálculos;
- `STATE_VERSION = 5`;
- pagamentos;
- formato do cofre;
- QR fiscal;
- scanner de código de barras;
- `estimatedCents` / `actualCents`;
- sincronização cifrada.

O protótipo é tratado como referência visual, não como fonte de dados. Assim, não são adicionadas lojas sem suporte, preços fictícios nem linhas de artigos que o QR fiscal não comprove.

## Versionamento candidato

- build: `v75`;
- UI base: `74-ui1`;
- Mercado: `74-shopping2`;
- menu: `73-menu8`;
- experiência base: `74-experience2`;
- arquitetura final: `75-architecture2`;
- cache: `conta-de-casa-public-v75-architecture2-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

## QA

Durante a implementação, testes antigos que estavam presos literalmente à identificação da v74/v75-architecture1 foram atualizados sem remover as verificações funcionais. Finanças, isolamento do cofre, datas civis, formulários, QR, Mercado, imagens oficiais, scanner e contabilização permanecem protegidos pelo CI.

A candidata só deve ser integrada em `main` após a suite completa ficar verde.

## Próximo passo

1. concluir CI da v75;
2. abrir PR para `main`;
3. confirmar CI do PR;
4. integrar apenas se verde;
5. confirmar CI de `main` e GitHub Pages;
6. fazer validação física em iPhone, Android/tablet e desktop.
