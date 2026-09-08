# Estado do Projeto — Conta de Casa

Atualizado: 8 de setembro de 2026
Build público atual: `v74`
Branch pública: `main`
Distribuição: GitHub Pages / PWA

## Estado atual

A **v74 está integrada e publicada**. A aplicação mantém a arquitetura PWA estática/local-first: estado financeiro no navegador/IndexedDB, cofre cifrado com PBKDF2-SHA-256 + AES-GCM, sincronização GitHub opcional apenas sobre o envelope cifrado e schema financeiro `STATE_VERSION = 5`.

O novo modelo visual aprovado foi aplicado sem migrar nem reescrever o núcleo financeiro.

## Modelo visual v74

- identidade clara: fundo `#f4f8f8`, texto `#0c2830`, verde-petróleo `#075b63` e acento `#17b890`;
- cabeçalho móvel compacto, fixed e compatível com safe areas;
- navegação móvel: **Início / Despesas / Mercado / Planeamento / Mais**;
- Início com saudação, seletor mensal, resumo, orçamento, ações rápidas e categorias;
- Despesas em composição orientada a movimentos;
- **Adicionar despesa** reutiliza o formulário real existente;
- **Ler fatura** reutiliza QR/fotografia e revisão antes de guardar;
- Mercado preserva pesquisa, scanner, preços estimados/reais e fotografias apenas quando verificadas;
- Planeamento, Relatórios e Mais usam a mesma identidade;
- onboarding visual aproxima-se do protótipo sem substituir o cofre real;
- sidebar/drawer permanecem à direita e o mesmo hambúrguer continua a transformar-se em X.

## Arquitetura da mudança

- `design-system.css`: sistema visual consolidado v74;
- `v74-experience.css`: composição responsiva do novo modelo;
- `v74-experience.js`: camada de apresentação que reutiliza dados, IDs e handlers existentes;
- `v64-runtime.js`: preservado por conter lógica funcional;
- `ui-consistency.css` e `v64-runtime.css`: retirados do bundle público após consolidação;
- build `v74`, revisão `74-experience2`;
- cache `conta-de-casa-public-v74-ui1-v74-shopping2-v73-menu8-v74-experience2`.

## Segurança e dados

A v74 não introduz credenciais, tokens ou segredos. Não altera o modelo de pagamentos, o schema financeiro ou o formato do cofre. Dados fictícios do protótipo não alimentam a aplicação. QR fiscal continua a ser preenchimento assistido e não é usado para inventar artigos não comprovados.

## Publicação confirmada

- PR: `#64` — **v74: aplicar novo modelo visual Conta de Casa**;
- CI do PR: `34210060213` / `#1441` — sucesso;
- merge em `main`: `a1974860755d70e7abf30ed93cee7220f5e65409`;
- CI de `main`: `34210146307` / `#1442` — sucesso;
- Deploy Pages: `34210213884` / `#1435` — sucesso;
- build público: `v74`.

## Próximo passo

Fazer validação física pós-publicação em iPhone, Android/tablet e desktop: densidade, teclado, safe areas, orientação, hambúrguer/X, swipe, QR/câmara e ausência de overflow. Os testes automáticos estão verdes, mas não substituem inspeção visual num dispositivo real.
