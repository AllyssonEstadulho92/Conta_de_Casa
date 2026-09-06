# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público atual: v63
Revisão visual pública: `63-ui2`
Cache público: `conta-de-casa-public-v63-ui2`
Distribuição: GitHub Pages
Branch pública: `main`
Estado: publicado; validação física final em dispositivo pendente

## Estado atual

A aplicação continua uma PWA estática/local-first. O cofre permanece no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece `STATE_VERSION = 5`.

A **v63** foi integrada em `main` através do PR #42 e publicada no GitHub Pages. O merge funcional é `1a034c84976c042e0433d016a5628feaa339a7a6`. A CI de `main` (run #999 / `34065040862`) terminou com sucesso e o Deploy GitHub Pages (run #992 / `34065057875`) terminou com sucesso para o mesmo SHA.

## v63 — consistência visual global

- `ui-consistency.css` é a camada final de apresentação;
- `.ui-icon-svg` e `.svg-icon` usam a mesma métrica Lucide (`stroke-width: 2`, extremidades/junções arredondadas e tamanhos contextuais previsíveis);
- a navegação inferior usa apenas um indicador ativo, baseado no `::before` do design system;
- os `::after` redundantes das camadas anteriores são anulados;
- o cartão-resumo do Mercado deixa de usar o mesmo pseudo-elemento como faixa e ícone;
- a faixa cromática passa a ser um `inset` sólido e contínuo;
- `market-summary-item::before` fica reservado ao ícone semântico;
- `Mercearia / Despensa` usa um ícone local mais adequado do que o carrinho.

## Lista de compras

- agrupamento por categoria preservado;
- nome, quantidade, estado, valores e ações mantêm uma margem esquerda coerente em mobile;
- checkbox, editar, eliminar, preço real, filtros, pesquisa e ordenação continuam a reutilizar a lógica existente;
- nenhuma alteração ao modelo financeiro ou à persistência.

## Centro de Atualização

- build formal público: `v63`;
- `release-manifest.json` é o histórico público versionado da aplicação;
- o Centro de Atualização consulta apenas esse manifesto same-origin com `cache: no-store`;
- versões futuras superiores à instalada são apresentadas na área **Atualização de Software**;
- a instalação exige ação explícita em **Atualizar agora**;
- um Service Worker novo fica em `waiting` numa atualização normal e recebe `APPLY_UPDATE` após confirmação;
- `SKIP_WAITING` permanece apenas como compatibilidade com clientes v62;
- `v` e `ts` são os únicos parâmetros de cache-busting aceites, sempre como único parâmetro e sempre sujeitos à allowlist pública.

### Nota de transição v62 → v63

O mecanismo de manifesto/instalação confirmada faz parte da própria v63. Um dispositivo que ainda esteja a executar a v62 pode precisar de fechar/reabrir ou atualizar a página uma vez para receber a v63. Depois de estar na v63, as versões seguintes devem aparecer no Centro de Atualização e ser instaladas pelo botão de atualização.

## Causas confirmadas dos defeitos visuais

### Dupla barra no menu inferior

O design system já desenhava o estado ativo em `.mobile-nav .nav-btn::before`. `ui-icons.css` e `market-brand.css` acrescentavam também `::after`, criando duas barras no Safari/iPhone.

### Faixa segmentada nos cartões-resumo

`ui-icons.css` usava `#page-market .market-summary-item::before` como ícone semântico, enquanto `market-brand.css` reutilizava o mesmo pseudo-elemento como faixa superior. A v63 separa essas responsabilidades.

## Segurança e dados

A v63 publicada:

- não altera PIN/palavra-passe;
- não altera PBKDF2, AES-GCM, IndexedDB ou schema financeiro;
- não altera `estimatedCents`, `actualCents`, quantidade ou estado de compra;
- não adiciona credenciais, cookies, telemetria ou endpoints externos;
- mantém `release-manifest.json` e o mecanismo de atualização no mesmo origin;
- restringe cache do Service Worker à allowlist pública explícita;
- preserva os dados existentes durante a atualização da aplicação.

## Validação automática concluída

A CI de `main` validou com sucesso:

- sintaxe;
- finanças e invariantes de contagem;
- isolamento e criptografia do cofre;
- datas civis, faturas e QR;
- Mercado, categorias, scanner, imagens históricas e contabilização;
- sistema Lucide e `tests/ui-consistency.test.cjs`;
- Centro de Atualização e `release-manifest.json`;
- segurança e allowlist do Service Worker;
- responsividade, viewport móvel, navegação e acessibilidade;
- sincronização e política de conflitos técnicos;
- manifest e composição pública do GitHub Pages.

## Próximo passo

1. no iPhone, fechar completamente e voltar a abrir a aplicação/site para garantir a transição para v63;
2. confirmar a versão em **Definições → Atualização de Software**;
3. validar fisicamente que existe apenas uma barra ativa na navegação inferior;
4. validar que a faixa dos cartões-resumo é sólida e contínua;
5. validar a uniformidade dos ícones em Início, Faturas, Compras, Relatórios, Segurança e Definições;
6. testar categorias, tema claro/escuro e larguras 320, 375, 390 e 430 px.
