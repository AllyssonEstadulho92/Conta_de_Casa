# Estado do Projeto — Conta de Casa

Atualizado: 6 de setembro de 2026
Build público atual: v62
Candidato seguinte: v63 (`63-ui2`)
Distribuição: GitHub Pages
Branch pública: `main`
Branch de preparação: `ui/market-left-alignment`
Estado: v63 validada em CI na branch; integração/publicação pendentes

## Estado atual

A aplicação continua uma PWA estática/local-first. O cofre permanece no navegador, cifrado com PBKDF2-SHA-256 + AES-GCM; os dados financeiros permanecem no IndexedDB e a sincronização GitHub continua opcional e cifrada. O schema financeiro permanece `STATE_VERSION = 5`.

A v62 publicada introduziu a experiência de Compras text-first, o hotfix do browser móvel e a Lista de compras organizada por categoria. A v63 candidata consolida essa interface, corrige conflitos visuais entre camadas CSS e introduz um fluxo de atualização versionado e confirmado pelo utilizador.

## v63 — alterações candidatas

### Consistência visual global

- criado `ui-consistency.css` como camada final de apresentação;
- `.ui-icon-svg` e `.svg-icon` passam a usar a mesma métrica Lucide (`stroke-width: 2`, extremidades/junções arredondadas e tamanhos contextuais previsíveis);
- a navegação inferior usa apenas um indicador ativo: o `::before` do design system;
- os `::after` redundantes de `ui-icons.css`/`market-brand.css` são anulados pela camada final;
- o cartão-resumo do Mercado deixa de usar o mesmo `::before` simultaneamente como faixa e ícone;
- a faixa cromática do cartão passa a ser um `inset` sólido e contínuo; o `::before` fica reservado ao ícone semântico;
- a categoria `Mercearia / Despensa` usa um ícone local mais adequado do que o carrinho.

### Lista de compras

- agrupamento por categoria preservado;
- nome, quantidade, estado, valores e ações mantêm uma margem esquerda coerente em mobile;
- checkbox, editar, eliminar, preço real, filtros, pesquisa e ordenação continuam a reutilizar a lógica existente;
- nenhuma alteração ao modelo financeiro ou à persistência.

### Atualização de Software

- build formal sobe para `v63`;
- `release-manifest.json` torna-se o histórico público versionado da aplicação;
- o Centro de Atualização consulta apenas esse manifesto same-origin com `cache: no-store`;
- a aplicação informa quando existe uma versão superior;
- a instalação exige ação explícita em **Atualizar agora**;
- o Service Worker fica em `waiting` numa atualização e só recebe `APPLY_UPDATE`/`SKIP_WAITING` após confirmação;
- o cache candidato é `conta-de-casa-public-v63-ui2`;
- o novo cache-busting `ts` é permitido apenas como único parâmetro e apenas para assets explicitamente incluídos na allowlist do Service Worker.

## Causa dos defeitos visuais corrigidos

### Dupla barra no menu inferior

O design system já desenhava o estado ativo em `.mobile-nav .nav-btn::before`. `ui-icons.css` e `market-brand.css` acrescentavam também `::after`. As duas camadas eram visíveis em simultâneo no Safari/iPhone.

### Faixa azul segmentada nos cartões-resumo

`ui-icons.css` usava `#page-market .market-summary-item::before` como ícone semântico, enquanto `market-brand.css` reutilizava o mesmo pseudo-elemento como faixa superior de 3 px. A combinação de propriedades de `background`, dimensões e especificidade produzia a aparência segmentada.

## Segurança e dados

A v63 candidata:

- não altera PIN/palavra-passe;
- não altera PBKDF2, AES-GCM, IndexedDB ou schema financeiro;
- não altera `estimatedCents`, `actualCents`, quantidade ou estado de compra;
- não adiciona credenciais, cookies, telemetria ou endpoints externos;
- mantém o `release-manifest.json` e o mecanismo de atualização no mesmo origin;
- restringe cache do Service Worker à allowlist pública explícita;
- preserva dados existentes durante atualização da aplicação.

## Validação automática

A CI da branch validou com sucesso até à revisão `205cf016ba005c585041f4b2ca9723d44a9caae8` e as correções posteriores mantêm a mesma estratégia de regressão. A cobertura inclui:

- sintaxe;
- finanças e invariantes de contagem;
- isolamento e criptografia do cofre;
- datas civis, faturas e QR;
- Mercado, categorias, scanner, imagens históricas e contabilização;
- sistema Lucide e novo teste `tests/ui-consistency.test.cjs`;
- Centro de Atualização e `release-manifest.json`;
- segurança e allowlist do Service Worker;
- responsividade, viewport móvel, navegação e acessibilidade;
- sincronização e política de conflitos técnicos.

## Próximo passo

1. obter CI verde no HEAD final após esta atualização documental;
2. rever o diff completo contra `main`;
3. abrir PR para `main` e integrar apenas com CI verde;
4. confirmar CI de `main` e Deploy GitHub Pages;
5. no iPhone, abrir **Definições → Atualização de Software** e instalar a v63;
6. validar fisicamente a barra única da navegação, a faixa sólida dos cartões, iconografia, categorias e tema claro/escuro em 320/375/390/430 px.
