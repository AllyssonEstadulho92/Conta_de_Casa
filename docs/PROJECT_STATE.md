# Estado do Projeto — Conta de Casa

Atualizado: 5 de setembro de 2026
Build público: v58
Distribuição: GitHub Pages
Estado da revisão: centro de atualização de software estilo iPhone integrado em `main`, CI principal concluído com sucesso e GitHub Pages v58 publicado; falta validação física no iPhone/Safari e uma transição real v58 → v59

## Estado atual

A aplicação continua local-first: cofre cifrado no navegador, dados financeiros no IndexedDB e sincronização GitHub opcional. O schema financeiro permanece na versão 5. Faturas, Planeamento, Mercado, Relatórios, Segurança, Definições, leitura de códigos de barras e captura QR de faturas mantêm os fluxos existentes.

A revisão v58 não altera dados financeiros, PIN, cifragem, IndexedDB, sincronização nem contratos de Mercado. Acrescenta uma camada isolada de atualização da própria aplicação e usa o Service Worker same-origin que já fazia verificação automática no arranque.

A implementação foi integrada através do PR #29. A revisão testada corresponde ao commit `8d4580957fc64bd8551a34d9fa6e4df3f444b2f6`. O CI de `main` (`33993333620`) terminou com sucesso e o workflow **Deploy Pages** (`33993353252`) publicou a mesma revisão com conclusão `success`.

## Revisão v58 — Centro de Atualização de Software

Foi criado um fluxo inspirado na hierarquia visual do iPhone, acessível a partir de **Definições → Atualização de Software**.

Elementos principais:

- botão/linha **Atualização de Software** nas Definições;
- ecrã dedicado em modal fullscreen no telemóvel e diálogo centrado em desktop;
- linha **Atualizações Automáticas — Ativado**;
- linha **Atualizações Beta — Desativado**;
- estado central **O Conta de Casa está atualizado** com a versão pública;
- ação **Mais detalhes** com notas da versão;
- ação **Verificar atualizações** que chama `ServiceWorkerRegistration.update()`;
- atualização encontrada usa o ciclo normal `install → skipWaiting → activate → controllerchange → reload`;
- tema claro/escuro, safe areas, foco visível e `prefers-reduced-motion` contemplados.

A linha Beta não simula uma funcionalidade inexistente. Permanece desativada até existir uma pipeline beta separada, auditada e com política de distribuição própria.

### Centralização das futuras alterações

`app-update.js` contém `APP_RELEASE_NOTES`. A partir da v58, cada versão pública deve acrescentar aí as alterações relevantes para que o utilizador as consulte em **Mais detalhes**.

O build público é composto em `scripts/prepare-pages.cjs`, que:

1. gera `dist/` pela allowlist existente;
2. inclui `app-update.css` e `app-update.js`;
3. carimba o `dist/index.html` com `v58` e query strings `?v=58`;
4. carimba a referência ao Service Worker em `dist/events.js` com `?v=58`;
5. mantém os ficheiros de desenvolvimento originais sem uma refatoração global desnecessária.

## Segurança e privacidade v58

- não foi criado backend de atualização;
- não foram adicionados tokens, chaves ou segredos;
- o centro de atualização não consulta endpoints externos;
- a verificação usa apenas o Service Worker same-origin distribuído pelo GitHub Pages;
- nenhum dado do cofre, fatura, compra, sincronização ou perfil é enviado durante a verificação;
- o cache público passa a `conta-de-casa-public-v58-software-update`;
- a allowlist pública inclui apenas os novos assets estáticos `app-update.css` e `app-update.js`.

## Validação automatizada v58

Foram concluídas com sucesso três validações relevantes da mesma revisão funcional:

- CI da branch de implementação: `33993279652` — `success`;
- CI do pull request #29: `33993314380` — todas as etapas `success`;
- CI de `main`: `33993333620` — `success`.

O deploy GitHub Pages `33993353252` concluiu também com `success` sobre o commit v58 integrado.

Foi validado:

- sintaxe de `app-update.js`;
- ausência de endpoint externo no módulo de atualização;
- interface responsiva, dark mode, safe areas e redução de movimento;
- `registration.update()` e handoff `SKIP_WAITING`;
- cache v58 e inclusão dos novos assets no Service Worker;
- geração real de `dist/` com versão `v58`;
- ausência de referências `?v=53` no HTML público gerado;
- referência `./sw.js?v=58` no `events.js` público gerado;
- regressões de finanças, auditoria, isolamento, formulários, Mercado, imagens, código de barras, ícones, segurança, navegação, acessibilidade e sincronização.

## Revisão v57 — fotografias reais de referência

A Lista de compras apresenta fotografia real quando existe correspondência suficientemente forte no Open Food Facts. A imagem não substitui a origem do preço: nome, preço e ligação oficial continuam provenientes do fluxo cesta.pt. Apenas URLs HTTPS de `images.openfoodfacts.org` são aceites; sem correspondência forte é mantido um placeholder neutro.

## Revisão v56 — cofre de acesso moderno

O ecrã de desbloqueio foi redesenhado para iPhone/Android/desktop sem alterar PIN/palavra-passe, derivação criptográfica ou persistência. Mantém safe areas, teclado circular, alternativa por palavra-passe, tema escuro e `prefers-reduced-motion`. Não apresenta passkey/biometria enquanto não existir implementação real.

## Revisão v55 — hierarquia do protótipo aprovado

A página Compras foi aproximada do protótipo aprovado: título com carrinho, `+` principal preservado, ação secundária com linguagem de scanner, cartões financeiros com âncoras iconográficas, lista mobile compacta e navegação inferior normalizada. Os cálculos e eventos de negócio permaneceram inalterados.

## Sistema visual de ícones

Lucide continua a ser a linguagem visual oficial. O subset é mantido localmente em `ui-icons.js`, sem icon font/CDN de ícones em runtime. O snapshot auditável permanece `94e4cb9d9db5907053ebf3636a97c45529cf776b` e o aviso de licença é distribuído em `LUCIDE_LICENSE.txt`.

## O que não foi alterado pela v58

- `appState` e schema financeiro;
- IndexedDB;
- PBKDF2 / AES-GCM / PIN;
- cálculos de faturas e Mercado;
- `estimatedCents`, `actualCents` e cálculo de quantidade;
- backups e sincronização;
- pesquisa de preços Pingo Doce/Continente;
- identificação GTIN pelo Open Food Facts;
- captura QR de faturas;
- origens externas da CSP.

## Limitações conhecidas

A validação automatizada e o deploy concluído não substituem a confirmação física em Safari/iPhone, particularmente quando a aplicação está instalada no ecrã principal como PWA. O mecanismo precisa ainda de ser observado numa transição real entre duas versões públicas — v58 → v59 — para confirmar em hardware a deteção, instalação, `controllerchange`, reload e apresentação da nova versão.

## Próximo passo

1. abrir **Definições → Atualização de Software** no iPhone/Safari e validar a composição em tema claro/escuro;
2. testar **Verificar atualizações** online e offline;
3. validar a PWA instalada no ecrã principal e a versão aberta diretamente no Safari;
4. repetir a validação mobile em 320, 375, 390 e 430 px, incluindo safe areas;
5. na próxima release, adicionar as alterações a `APP_RELEASE_NOTES` antes do deploy;
6. validar uma transição real v58 → v59 e só depois considerar o lifecycle de atualização totalmente confirmado em hardware.
