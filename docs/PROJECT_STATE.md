# Estado do Projeto — Conta de Casa

Atualizado: 7 de setembro de 2026
Build público atual: `v63`
Build candidato em validação: `v64`
Branch pública: `main`
Branch candidata: `feature/v64-scanner-billing-safearea`
PR: #44
Distribuição: GitHub Pages / PWA

## Estado atual

A aplicação continua uma PWA estática/local-first. O estado financeiro permanece no navegador/IndexedDB e o cofre continua cifrado com PBKDF2-SHA-256 + AES-GCM. A sincronização GitHub permanece opcional e transfere apenas o envelope cifrado. O schema financeiro base continua `STATE_VERSION = 5`.

A versão pública ainda é a **v63**. A **v64** está preparada no PR #44 e só deve ser integrada/publicada depois da CI final verde. O Centro de Atualização mantém o fluxo definido desde a v63: nova versão no `release-manifest.json`, Service Worker em espera e instalação apenas após ação explícita em **Atualizar agora**.

## Auditoria atual — iPhone/Safari

### Factos observados

As capturas reais de 7 de setembro confirmaram dois problemas distintos no cabeçalho móvel:

1. durante scroll, a primeira linha do cabeçalho podia ficar parcialmente fora da área visível;
2. mesmo sem scroll, **Lista de compras** apresentava um cabeçalho diferente de **Início**: carrinho adicional antes do título, título visivelmente maior, contentor do botão `+` ampliado, controlo Sync com chevron e tonalidade de fundo diferente.

A segunda diferença não era funcionalmente necessária: o cabeçalho é um componente global e não deve mudar de geometria por página.

Os cartões-resumo, os ícones Lucide e o indicador único da navegação inferior permanecem coerentes nas capturas atuais; as regressões de dupla barra e faixa segmentada corrigidas na v63 não reaparecem.

### Causas sustentadas pelo código

Para o corte durante scroll, `mobile-layout.css` mantém `.main` como scroller interno e o cabeçalho usava `position:sticky` dentro desse scroller. A combinação é sensível às mudanças do viewport visual e do chrome dinâmico do Safari.

Para a diferença entre **Início** e **Lista de compras**, existiam regras históricas condicionadas por `html.market-prototype-active` em camadas antigas do Mercado. Essas regras injetavam um carrinho em `h1::before`, aumentavam a tipografia, alteravam as dimensões do botão `+` e acrescentavam um `::after` ao Sync.

### Correção v64

`v64-runtime.css`, carregado como última camada candidata, passa a:

- manter uma `safe-area` superior mínima e respeitar `env(safe-area-inset-top)`;
- fixar o cabeçalho móvel ao viewport em vez de depender de `sticky` dentro de `.main`;
- compensar a altura do cabeçalho através de `padding-top` em `.main`, evitando sobreposição de conteúdo;
- aplicar a mesma métrica de cabeçalho em Início, Faturas, Lista de compras e Relatórios;
- usar título móvel de 24 px/600, com redução para 20 px apenas abaixo de 360 px;
- desativar o carrinho pseudo-elemento do título do Mercado;
- manter menu e botão `+` em caixas tácteis de 44×44 px, com o `+` visual em 36×36 px;
- remover o chevron exclusivo do Sync no Mercado e manter o mesmo controlo global;
- uniformizar o fundo do topbar para impedir que a identidade cromática da página altere a leitura do cabeçalho;
- preservar o scroller interno, a navegação inferior fixa, o teclado e os diálogos existentes.

## v64 — código de barras e preço

O fluxo candidato usa o scanner existente para identificar o GTIN/EAN/UPC e o catálogo real do Mercado para obter preço. A automatização só adiciona sem confirmação quando:

- existe exatamente um supermercado selecionado;
- loja, nome/marca e embalagem são compatíveis;
- a melhor correspondência atinge confiança mínima de `0.84`;
- existe margem mínima de `0.10` para a segunda correspondência.

Se o mesmo GTIN pendente for lido novamente, a quantidade é incrementada em vez de criar uma linha duplicada.

**Regra financeira preservada:** o preço obtido no supermercado atualiza `estimatedCents`. O scanner não escreve `actualCents`; o valor efetivamente pago continua a depender de confirmação de compra/talão.

## v64 — faturas recorrentes

Novas ocorrências recorrentes passam a ser criadas como **Por preencher**:

- mantêm descrição, fornecedor, categoria, método, recorrência e vencimento previsto;
- começam com `totalCents = 0`;
- não herdam referência, observações nem data de emissão;
- só entram como fatura financeira normal depois de o utilizador preencher e guardar o novo valor.

A migração v64 só converte ocorrências futuras geradas automaticamente e ainda não alteradas. Faturas com pagamentos, canceladas, arquivadas ou já editadas não são limpas.

## Segurança e privacidade

A candidata v64 não altera:

- PIN/palavra-passe;
- PBKDF2-SHA-256 ou AES-GCM;
- armazenamento IndexedDB do cofre;
- credenciais de sincronização;
- pagamentos/faturas já confirmados;
- separação entre `estimatedCents` e `actualCents`.

A preferência do supermercado do scanner é apenas uma preferência de UI local; não contém dados financeiros. Não foram adicionados cookies, telemetria, chaves ou tokens ao código público.

## Qualidade e testes

A branch v64 já obteve uma execução completa de CI verde antes dos últimos reforços visuais do cabeçalho. Essa execução cobriu finanças, auditoria, contagens, isolamento do cofre, datas, faturas, QR, Mercado, scanner, imagens legadas, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

`tests/v64-runtime.test.cjs` passa a exigir, além da safe area e do `position:fixed`, que o cabeçalho do Mercado use a mesma tipografia e dimensões do cabeçalho global, que o carrinho pseudo-elemento esteja desativado e que o Sync não receba chevron exclusivo.

A CI final do novo HEAD deve ficar verde antes do merge. A correção visual ainda não foi validada fisicamente no iPhone após instalação da v64.

## Próximo passo

1. atualizar o PR #44 com o HEAD final da auditoria visual;
2. concluir a CI final;
3. rever o diff final contra `main`;
4. integrar a v64 apenas com testes verdes;
5. confirmar CI de `main` e Deploy GitHub Pages;
6. no iPhone, abrir **Definições → Atualização de Software**, verificar a v64 e carregar em **Atualizar agora**;
7. validar fisicamente que Início, Faturas, Lista de compras e Relatórios usam o mesmo cabeçalho, além do scroll, scanner e recorrência **Por preencher**.
