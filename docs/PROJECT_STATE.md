# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — migração incremental TypeScript + revisão UI/UX  
Branch pública: `main`  
HEAD funcional publicado: `a68de711df1c42ec33948d3fff2f4d5e337e2436`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` enquanto não existir migração de schema aprovada;
- valores monetários em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica no pipeline especializado de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e funcionamento offline não podem regredir por mudanças visuais;
- alterações UI/UX ou de versionamento não podem modificar cálculos, pagamentos, faturas, persistência ou segurança.

## 2. Estado integrado em `main`

- `75-market1` — Mercado;
- `75-expenses1` — Despesas/Faturas;
- fundação TypeScript — PR #72;
- `76-veggie-menu1` — PR #74;
- `76-veggie-menu2` + `76-modern-ui1` — PR #76, merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`;
- `76-version-audit1` — PR #78, merge `a68de711df1c42ec33948d3fff2f4d5e337e2436`.

## 3. UI/UX publicada

### `76-veggie-menu2`

- fonte `src/ui/veggie-menu-toggle.ts` em TypeScript strict;
- duas barras horizontais no estado fechado;
- animação explícita por Web Animations API;
- barra superior termina em `+45°` e inferior em `-45°`;
- ambas permanecem visíveis durante a transformação;
- continua a existir apenas um `#mobileMenuBtn`;
- com drawer aberto, o botão fica fora da `.nav-drawer-shell` transformada para não desaparecer no swipe;
- `prefers-reduced-motion` e `forced-colors` preservados.

### `76-modern-ui1`

Última camada visual transversal `v76-modern-ui.css`, cobrindo Início, Despesas, Mercado, Calendário, Planeamento, Relatórios, Objetivos, Segurança, Diagnóstico, Definições, dialogs, drawer, bottom navigation, tabs, formulários e estados vazios.

No mobile, a `.topbar` passou para fluxo normal (`position: relative`) e `.main` deixou de reservar espaço para um header fixo. A navegação inferior permanece persistente em formato dock.

## 4. Auditoria de versão/atualização — erro confirmado e corrigido

A comparação com o Foco Jornada confirmou um defeito no Centro de Atualização do Conta de Casa:

- `app-update.js` consultava `release-manifest.json`;
- quando `latestVersion` era igual ao `app-build` instalado (`v75`), concluía imediatamente que não existiam atualizações;
- essa conclusão ocorria **antes** de `registration.update()`;
- portanto, uma compilação nova publicada dentro da mesma release `v75` podia não ser detetada manualmente.

Isto explicava a inconsistência entre alterações v76 publicadas e a indicação visual de versão/atualização baseada apenas em `v75`.

## 5. Correção integrada — `76-version-audit1`

A correção mantém três identificadores separados:

- **versão da aplicação:** `package.json` → `0.76.0-dev.1`;
- **release pública:** `release-manifest.json`/`app-build` → `v75`;
- **build exato:** SHA Git curto de 7 caracteres + data ISO de compilação, injetados por `scripts/prepare-pages.cjs`.

O ecrã `Versão e Atualizações`, inspirado no padrão técnico do Foco Jornada, apresenta versão instalada, release, Build ID, data de compilação, PWA/Web, estado do Service Worker e estado de rede.

A ação `Verificar e atualizar agora` chama sempre `registration.update()` antes de declarar a compilação atualizada. Uma atualização dentro da mesma release deixa, assim, de ser ignorada apenas porque o número `v75` não mudou.

## 6. Isolamento e segurança

`76-version-audit1` não altera `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, schema, IndexedDB, PIN, PBKDF2, AES-GCM, backup, sincronização cifrada, QR, scanner, CSP ou regras financeiras.

A instalação continua dependente de ação explícita do utilizador. O sistema de atualização usa recursos da própria aplicação e não envia o cofre nem os dados financeiros.

## 7. QA e publicação

UI publicada pelo PR #76:

- TypeScript Foundation `34537430909`: sucesso;
- CI `34537430967`: sucesso;
- GitHub Pages `34537469989`: sucesso.

Auditoria de versão:

- commit funcional inicial `41cd36b662991fc2f29d5736c2b77621c4649e87`;
- primeira execução CI `34539687982` falhou apenas por uma asserção demasiado específica no novo teste de metadados; sintaxe, finanças, Mercado e UI tinham passado;
- teste corrigido no commit `9d6a923c6f10bda2e7128f48053ad278063634ca`;
- CI funcional `34539811658`: sucesso;
- PR #78: TypeScript Foundation `34540211764` e CI `34540211775` — sucesso;
- merge funcional em `main`: `a68de711df1c42ec33948d3fff2f4d5e337e2436`;
- `main`: TypeScript Foundation `34540271567` e CI `34540271547` — sucesso;
- GitHub Pages `34540307404` — sucesso.

## 8. Riscos/lacunas ainda abertas

- validação física do novo ecrã de versão e do fluxo de atualização em iPhone/Safari/PWA ainda é necessária;
- a branch `main` encontra-se sem proteção de branch no GitHub; é risco de governação e não foi alterado nesta correção;
- `market-experience.js` continua com a lacuna conhecida de persistência explícita de `pid` ao longo de todo o fluxo;
- a release pública continua `v75` por decisão de release; não promover para `v76` sem uma release formal.

## 9. Próximo passo

Validar no iPhone/Safari/PWA que `Versão e Atualizações` mostra `0.76.0-dev.1`, a release `v75`, o Build ID e a data de compilação, e que a verificação manual deteta um Service Worker novo mesmo dentro da mesma release. Depois, retomar `feat/v76-money-dates`.
