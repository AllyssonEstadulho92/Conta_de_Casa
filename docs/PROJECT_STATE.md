# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build candidato: `v74`
Branch de integração: `redesign/v74-prototipo-conta-de-casa`
Branch pública atual: `main` (`v73` até ao merge/publicação da v74)
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação mantém a arquitetura PWA estática/local-first. O estado financeiro continua no navegador/IndexedDB; o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM; a sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A **v74 está implementada e validada na branch de integração** com base no novo protótipo móvel aprovado. O redesign altera composição, hierarquia e apresentação, mas não reescreve cálculos, pagamentos, persistência, cifragem ou sincronização.

## Modelo visual v74

- identidade clara: fundo `#f4f8f8`, texto `#0c2830`, verde-petróleo `#075b63` e acento `#17b890`;
- cabeçalho móvel compacto em verde-petróleo, com safe area e posição fixed;
- navegação móvel com cinco destinos: **Início / Despesas / Mercado / Planeamento / Mais**;
- Início com saudação, seletor mensal, resumo do mês, orçamento, ações rápidas e categorias;
- Despesas com composição orientada a movimentos e acesso ao formulário existente;
- ação **Ler fatura** ligada ao fluxo real existente de QR/fotografia e revisão antes de guardar;
- Mercado preserva pesquisa, preços estimados/reais, scanner e fotografias apenas quando verificadas;
- Planeamento, Relatórios e Mais recebem apresentação alinhada com o mesmo sistema visual;
- onboarding visual inspirado no protótipo sem substituir o cofre real;
- sidebar/drawer continuam à direita e o mesmo hambúrguer continua a transformar-se em X.

## Arquitetura da mudança

- `design-system.css`: sistema visual consolidado v74;
- `v74-experience.css`: composição responsiva específica do novo modelo;
- `v74-experience.js`: camada de apresentação que reutiliza dados, IDs e handlers existentes;
- `v64-runtime.js`: permanece por conter lógica funcional validada;
- `ui-consistency.css` e `v64-runtime.css`: retirados do bundle público por terem sido consolidados no sistema visual v74;
- `scripts/prepare-pages.cjs`: build `v74`, revisão `74-experience2`;
- Service Worker: cache `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

## Validação automática

CI da branch, run `34209567627` / `#1435`: **sucesso integral**.

Foram validados, entre outros:

- sintaxe dos módulos públicos;
- cálculos e invariantes financeiras em cêntimos;
- auditoria financeira;
- isolamento do cofre e cifragem;
- datas civis/timezone;
- formulários e pagamentos;
- captura de fatura por QR;
- Mercado, preços, imagens verificadas, scanner e quantidades;
- navegação e hambúrguer/X;
- atualização PWA/Service Worker;
- segurança;
- responsividade e regressões de viewport móvel;
- acessibilidade, contraste, foco, semântica e safe areas;
- sincronização e política de conflitos;
- manifesto público.

## Segurança e dados

A v74 não introduz credenciais, tokens ou segredos no código. Não migra nem altera o modelo de dados financeiros. Valores reais continuam a ser derivados do estado existente; dados fictícios do protótipo não entram na aplicação.

A leitura fiscal continua assistida: um QR não é tratado como prova da lista completa de artigos quando essa informação não está efetivamente disponível no conteúdo lido.

## Estado de publicação

- `main` permanece em v73 enquanto a v74 não for integrada;
- branch v74 está `ahead` de `main` e `behind_by: 0` na última comparação antes da integração;
- CI da candidata está verde;
- próximo passo: abrir PR, validar CI do PR, integrar em `main` e confirmar GitHub Pages.

## Validação ainda recomendada

Depois da publicação, fazer validação física em iPhone, Android/tablet e desktop para confirmar percepção visual, densidade, teclado, orientação e animações. Os testes automáticos cobrem estrutura e regressões, mas não substituem inspeção visual num dispositivo real.
