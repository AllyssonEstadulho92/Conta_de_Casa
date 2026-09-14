# Arquitetura — Conta de Casa

Atualizado: 14 de setembro de 2026  
Versão: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76`  
Distribuição: GitHub Pages / PWA

## 1. Modelo geral

PWA estática/local-first. O browser recebe HTML/CSS/JavaScript; a fonte funcional está a migrar incrementalmente para TypeScript strict. Não existe framework UI no `package.json`; a interface é composta por HTML, CSS e runtime próprio.

Invariantes:

- `STATE_VERSION=5`;
- dinheiro em cêntimos inteiros;
- IndexedDB cifrado;
- PBKDF2-SHA-256 + AES-GCM, 250000 iterações;
- sync GitHub opcional/cifrado;
- `estimatedCents` separado de `actualCents`;
- `marketId|pid` canónico;
- fotografia não prova preço/transação.

## 2. Autenticação e sessão

`core.js` mantém a autoridade criptográfica:

`PIN/palavra-passe → PBKDF2 → check cifrado → AES-GCM → appState normalizado`.

Contratos visuais publicados:

- `76-auth-transition1`: PIN local válido abre o Dashboard sem depender de sync remoto;
- `76-auth-hidden1`: `#vaultScreen[hidden]` e `#app[hidden]` são explicitamente `display:none!important` e cofre visível exclui shell autenticado;
- `76-ui-audit1`: onboarding v74 não pode mascarar o formulário real do cofre.

## 3. Rotas e navegação

Rotas canónicas:

- dashboard;
- bills;
- calendar;
- planning;
- goals;
- market;
- reports;
- security;
- diagnostics;
- settings.

`renderPage()` continua o dispatcher funcional. O gate estrutural valida rota ↔ secção HTML ↔ renderer e audita o bundle Pages.

### Autoridade móvel após PR #104

`v75-stability.js` é a autoridade final transitória para o dock móvel enquanto as camadas históricas coexistem. A assinatura canónica é:

`Início · Despesas · Mercado · Plano · Mais`

A rota continua `planning`; apenas o label compacto do dock passa a `Plano` para evitar truncagem em ecrãs pequenos. `calendar` herda seleção de `bills`; `goals` de `planning`; `diagnostics/security` de `settings`.

`v74-experience.js` permanece por compatibilidade, mas deixa de vencer a assinatura final quando encontra `data-v74-nav`/`data-v76-nav-authority` instalados por v75 stability.

## 4. Arquitetura visual

Autoridades pretendidas:

- tokens/componentes v76: `v76-modern-ui.css`;
- composição de página: `v76-product-pages.css`;
- geometria mobile/safe areas/dock: `v76-mobile-shell.css`;
- estabilidade/compatibilidade transversal: `v75-stability.css/js`;
- identidade da aplicação: `icon.svg`;
- iconografia funcional: subset Lucide local em `ui-icons.js` + métricas em `ui-icons.css`;
- compatibilidade histórica: v74/v75 apenas enquanto existirem consumidores reais.

PR #102 e #103 consolidaram contraste, reflow, dialogs, tabs, densidade, hierarquia e apresentação das 10 rotas. PR #104 reduziu a dupla autoridade do dock e remove em runtime nós v74 do Dashboard já substituídos.

## 5. Design system e iconografia

`v76-modern-ui.css` mantém tokens de cor, superfície, borda, radius, sombras, alturas de controlos, foco e estados.

`76-brand-icons1` definiu:

- `icon.svg` como única marca gráfica;
- Lucide local como família de ícones funcionais;
- `viewBox 24×24`, `currentColor`, stroke 2 px e licença local preservada;
- símbolos funcionais devem corresponder semanticamente à ação.

`76-icon-semantics3` acrescenta uma camada semântica controlada dentro da estabilidade transversal, sem criar uma nova biblioteca de ícones:

- Início: teal;
- Despesas: índigo;
- Mercado/Segurança: verde;
- Planeamento: âmbar;
- Mais/Definições: roxo;
- Relatórios: azul;
- Objetivos: rosa;
- Diagnóstico: azul-cinza;
- alertas: âmbar;
- destrutivo: danger existente.

A paleta possui equivalentes dark mode. Em `forced-colors`, o browser/OS recupera a autoridade de contraste. Cor nunca é o único indicador de seleção: `aria-current`, superfície selecionada, texto e foco continuam ativos.

Geometrias corrigidas:

- `plan`: clipboard/checklist;
- `settings`: engrenagem;
- `activity`: Diagnóstico.

O menu `Mais` recebe ícones por função através da camada de estabilidade, reutilizando `CDCIcons.markup` e sem alterar destinos ou handlers.

## 6. Responsividade e acessibilidade

- `v76-mobile-shell.css` continua a autoridade de viewport/safe areas/scroll/dock;
- alvos essenciais >=44 px;
- inputs móveis >=16 px para evitar focus zoom do Safari;
- zoom manual não é bloqueado;
- foco visível;
- reduced-motion e forced-colors preservados;
- tabelas usam scroll controlado no desktop e cartões móveis quando já existe representação equivalente;
- informação essencial não deve desaparecer apenas por falta de espaço.

## 7. Páginas

Estado atual:

- Acesso: consolidado por `76-auth1`, transition e hidden contracts;
- Dashboard: composição canónica v76; nós v74 substituídos são removidos pela estabilidade runtime;
- Faturas: funcional, com recuperação mobile v75 e polish global; revisão de estados ainda necessária;
- Mercado: múltiplas camadas funcionais preservadas; iconografia e fotografias têm contratos próprios; persistência `marketId|pid` ainda precisa E2E dedicado;
- Planeamento/Calendário/Relatórios/Objetivos/Segurança/Diagnóstico/Definições: passaram pelo polish global, mas continuam no ciclo de validação física e limpeza residual.

## 8. Runtime e TypeScript

Runtimes TS canónicos já publicados:

- `src/ui/veggie-menu-toggle.ts`;
- `src/ui/market-branding.ts`;
- `src/sync/sync-conflict-policy.ts`.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

JS manual restante só é removido depois de substituição comprovada. `finance.js`, `core.js` e cifra ficam para fases com vetores de paridade próprios.

## 9. Build/PWA

Fluxo:

`PR/push → TypeScript Foundation + CI → merge main → CI main → prepare-pages allowlist → artefacto Pages → deploy`.

Service Worker:

- navegação network-first com timeout 4 s;
- assets públicos network-first/no-store com fallback cache;
- allowlist explícita;
- cache versionada para distribuir alterações.

`76-icon-semantics3` apenas acrescenta a revisão de cache `icon-semantics3`; a estratégia de rede/cache não muda.

## 10. Segurança

- nenhum segredo no repositório público;
- CSP ativa;
- armazenamento sensível em claro bloqueado;
- alterações visuais não alteram KDF/cifra/schema;
- ícones não introduzem dependências remotas;
- ações destrutivas mantêm símbolo, texto/label e token danger, sem depender só de cor.

## 11. Próxima consolidação

1. concluir gates e publicação de `76-icon-semantics3`;
2. validar iPhone/Safari/PWA, Android/Chrome, tablet e desktop;
3. continuar Faturas → Mercado → Planeamento/Calendário → Relatórios/Objetivos → Segurança/Diagnóstico/Definições;
4. remover CSS/runtime histórico apenas com prova de não utilização;
5. continuar migração TypeScript por risco e paridade.
