# Estado do Projeto — Conta de Casa

Atualizado: 11 de setembro de 2026  
Versão candidata: `0.76.0`  
Release candidata: `v76`  
Release pública anterior: `v75`  
Programa técnico: `v76` — arquitetura, TypeScript incremental, UI/UX e validação de release  
Branch pública: `main`  
Branch em validação: `release/v76-ready`  
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
- QR, scanner, backup/restauro, PWA e funcionamento offline não podem regredir por mudanças de release;
- promoção de versão não pode alterar cálculos, pagamentos, faturas, persistência, cifragem ou regras de Mercado.

## 2. Baseline integrada antes da release

A baseline arquitetural transversal v76 foi integrada pelo PR #82 e publicada com CI, TypeScript Foundation e GitHub Pages verdes. O PR #83 sincronizou a documentação permanente. O `v76-mobile-shell.css` é a autoridade da geometria mobile ≤820 px e `mobile-layout.css` fica limitado a refinamentos de feature.

O `main` anterior à preparação da release estava em `cb88e105428a2a54eeebddeb810d9f123e4ac3c2`.

## 3. Release candidate `0.76.0 / v76`

Branch: `release/v76-ready`.

Alterações efetuadas para transformar o programa v76 numa release verificável:

- `package.json.version` promovido de `0.76.0-dev.1` para `0.76.0`;
- `release-manifest.json` promovido de `v75` para `v76`, mantendo o histórico anterior;
- `scripts/prepare-pages.cjs` passa a compilar/publicar `BUILD = 'v76'`;
- Service Worker recebe cache `v76-release1`, forçando invalidação do app shell antigo sem apagar IndexedDB;
- novo `tests/release-readiness.test.cjs` valida versão, manifesto, bundle `dist/`, referências locais, allowlist pública e cache PWA;
- novo `playwright.config.cjs` e `tests/e2e/release-smoke.spec.cjs` executam smoke tests em Chromium e WebKit, desktop e viewports móveis;
- TypeScript strict deixa de ser apenas workflow paralelo e passa também a fazer parte do job principal do CI;
- o CI só termina verde depois de `quality` + `browser-smoke`;
- Pages faz checkout do SHA exato aprovado pelo CI, confirma a identidade da revisão, repete TypeScript + release-readiness, gera `dist/` e valida metadados `0.76.0 / v76 / Build ID` antes do deploy.

## 4. Critério de “pronta para publicar”

A v76 só pode ser integrada em `main` quando todos estes gates estiverem verdes:

1. sintaxe JavaScript e scripts de build;
2. TypeScript `strict`;
3. invariantes financeiras e contagem exata;
4. isolamento/cofre/datas civis;
5. formulários, faturas e QR;
6. Mercado, imagens, catálogo, scanner e contabilização;
7. UI, responsive, navegação, acessibilidade e arquitetura do shell;
8. segurança;
9. sync e política de conflitos;
10. release-readiness do bundle público;
11. smoke browser em Chromium e WebKit;
12. validação do manifesto PWA.

Depois do merge, o Pages só publica o mesmo SHA aprovado por esse CI.

## 5. O que a validação automatizada comprova

Com gates verdes, fica comprovado que o código testado compila, passa as regressões existentes, gera um bundle público coerente, carrega nos motores Chromium/WebKit configurados e mantém os contratos estruturais automatizados.

Isto **não equivale** a teste físico num iPhone real. WebKit automatizado reduz o risco específico do motor Safari, mas Safari/PWA instalada, safe areas reais, Dynamic Island/status bar, teclado virtual e gestos em hardware Apple continuam a exigir confirmação física. Essa distinção não pode ser apagada da documentação.

## 6. Segurança e dados

A promoção v76 não altera:

- `core.js`/schema persistido;
- `STATE_VERSION`;
- PBKDF2-SHA-256/AES-GCM;
- `PBKDF2_ITERATIONS`;
- IndexedDB financeiro;
- valores monetários em cêntimos;
- backup/restauro cifrado;
- sincronização cifrada;
- QR/scanner por efeito da mudança de versão.

O CI continua a executar os testes de segurança e isolamento antes da publicação.

## 7. Riscos/lacunas ainda abertas

- validação física da v76 publicada em iPhone/Safari/PWA permanece obrigatória antes de declarar certificação física Apple;
- `main` permanece sem branch protection ao nível do repositório; o fluxo atual usa PR + CI como controlo operacional, mas proteção administrativa continua recomendada;
- `v76-modern-ui.css` e camadas v74/v75 ainda têm sobreposição/`!important` a consolidar progressivamente;
- `market-experience.js` mantém a lacuna conhecida de persistência explícita de `pid` em todo o fluxo;
- a migração do núcleo funcional para TypeScript continua incremental; v76 não é uma reescrita total.

## 8. Próximo passo

Concluir CI da branch `release/v76-ready`. Se `quality` e `browser-smoke` estiverem verdes, rever o diff, integrar por PR em `main`, confirmar CI do merge e GitHub Pages do SHA integrado. Depois sincronizar estes documentos com SHA/Build ID/run IDs efetivamente publicados e executar a validação física no iPhone/Safari/PWA.
