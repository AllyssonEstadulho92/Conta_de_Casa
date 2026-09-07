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

### Facto observado

As capturas de 7 de setembro mostram dois estados reais da página **Lista de compras**:

- num estado, o cabeçalho aparece completo;
- depois de deslocar o conteúdo, a primeira linha do cabeçalho pode ficar parcialmente fora da área visível, cortando menu, ícone/título e botão `+`.

Os cartões-resumo, os ícones Lucide e o indicador único da navegação inferior aparecem coerentes nas capturas atuais; as regressões de dupla barra e faixa segmentada corrigidas na v63 não reaparecem.

### Causa provável sustentada pelo código

`mobile-layout.css` mantém `.main` como scroller interno (`overflow-y:auto`) e o cabeçalho usava `position:sticky` dentro desse scroller. A combinação é sensível às mudanças do viewport visual e do chrome dinâmico do Safari. A captura com o cabeçalho parcialmente deslocado é compatível com essa falha de `sticky` no scroller interno.

Não é possível afirmar que o motor do Safari é a única causa sem instrumentação física do aparelho, mas a dependência estrutural foi removida na candidata v64.

### Correção v64

`v64-runtime.css`, carregado como última camada, passa a:

- manter uma `safe-area` superior mínima e respeitar `env(safe-area-inset-top)`;
- fixar o cabeçalho móvel ao viewport em vez de depender de `sticky` dentro de `.main`;
- compensar a altura do cabeçalho através de `padding-top` em `.main`, evitando sobreposição de conteúdo;
- preservar o scroller interno, a navegação inferior fixa, o teclado e os diálogos existentes;
- manter alvos tácteis com `touch-action: manipulation`.

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

A branch v64 já obteve uma execução completa de CI verde antes do último reforço do cabeçalho móvel. Essa execução cobriu finanças, auditoria, contagens, isolamento do cofre, datas, faturas, QR, Mercado, scanner, imagens legadas, ícones, atualização, segurança, responsividade, navegação, acessibilidade e sincronização.

O reforço final do cabeçalho móvel tem teste dedicado que exige `position:fixed`, compensação de conteúdo e safe area. A CI final do novo HEAD deve ficar verde antes do merge.

## Próximo passo

1. concluir a CI final do PR #44;
2. rever o diff final contra `main`;
3. integrar a v64 apenas com testes verdes;
4. confirmar CI de `main` e Deploy GitHub Pages;
5. no iPhone, abrir **Definições → Atualização de Software**, verificar a v64 e carregar em **Atualizar agora**;
6. validar fisicamente o cabeçalho ao fazer scroll, a leitura de código de barras e uma ocorrência recorrente **Por preencher**.
