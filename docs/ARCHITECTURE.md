# Arquitetura — Conta de Casa

Atualizado: 13 de setembro de 2026  
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

### `76-auth-transition1`

- PIN local válido abre o Dashboard sem depender de sync remoto;
- sync real continua em background;
- falha de transição remove `app-active`, esconde app e restaura cofre.

### `76-auth-hidden1`

Contrato visual final:

- `#vaultScreen[hidden] { display:none!important; }`;
- `#app[hidden] { display:none!important; }`;
- `#vaultScreen:not([hidden]) + #app { display:none!important; }`.

Isto evita que Safari/WebKit mantenha o cofre renderizado quando uma regra histórica declara `display:grid!important`.

### `76-ui-audit1`

A camada final também neutraliza o onboarding `cdcWelcome` do v74 e mantém o formulário real `#vaultCreate` visível quando a classe histórica `cdc-vault-create-collapsed` é aplicada. É uma mitigação visual segura; a remoção definitiva da criação runtime fica para o bloco de limpeza v74.

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

`renderPage()` é o dispatcher funcional. O gate estrutural valida rota ↔ secção HTML ↔ renderer e audita o bundle do Pages.

Dívida confirmada: existem duas autoridades de navegação móvel.

- `core.js/render.js` definem `MOBILE_NAV_ITEMS` e geram `#mobileNav`;
- `v74-experience.js` executa `ensureMobileNav()` e pode reescrever o mesmo DOM com cinco destinos históricos.

Esta duplicação será eliminada num bloco próprio, preferencialmente com configuração canónica TypeScript, sem remover drawer, `aria-current` ou rotas antes da paridade.

## 4. Arquitetura visual

Autoridades pretendidas:

- tokens/componentes: `v76-modern-ui.css`;
- composição de página: `v76-product-pages.css`;
- geometria mobile/safe areas/dock: `v76-mobile-shell.css`;
- compatibilidade histórica: v74/v75, apenas enquanto existirem consumidores.

### Contratos de `76-ui-audit1`

- header móvel é superfície neutra, sem gradiente decorativo, sem texto branco forçado e com controlos 44×44 px;
- dock móvel usa uma superfície única, selected state discreto, foco visível, labels coerentes e safe areas;
- `forced-colors` e `prefers-reduced-motion` continuam suportados;
- visual não altera lógica financeira ou de segurança.

## 5. Design system

`v76-modern-ui.css` já contém tokens de cor, superfície, borda, radius, sombras, control-height, icon-control, focus ring e estados disabled/hover.

Direção de consolidação:

- brand teal usado com parcimónia em ação/seleção;
- superfícies neutras;
- sombra mínima;
- hierarquia por espaço/tipografia antes de cartões;
- ícones lineares coerentes;
- alvos essenciais >=44 px;
- WCAG 2.2 AA como referência mínima quando aplicável.

## 6. Páginas

Estado atual:

- Acesso: `76-auth1` + `76-auth-transition1` + `76-auth-hidden1`;
- Dashboard: `76-dashboard-clean1` já usa renderização canónica e suprime visualmente blocos v74 duplicados;
- Faturas e Planeamento: têm recuperação funcional mobile v75, mas precisam do acabamento final v76;
- Mercado: funcionalidade espalhada por múltiplas camadas e precisa auditoria de identidade/preço/fotografia;
- Calendário, Relatórios, Objetivos, Segurança, Diagnóstico e Definições: ainda sem consolidação visual final equivalente ao Dashboard.

## 7. Runtime e TypeScript

Runtimes TS canónicos já publicados:

- `src/ui/veggie-menu-toggle.ts`;
- `src/ui/market-branding.ts`;
- `src/sync/sync-conflict-policy.ts`.

Pipeline:

`src/**/*.ts → tsc strict/noEmit → build-typescript-runtime.cjs → .generated/*.js → prepare-pages.cjs → dist/*.js → Pages`.

JS manual restante só é removido depois de substituição comprovada.

## 8. Build/PWA

Fluxo:

`PR/push → TypeScript Foundation + CI → merge main → CI main verde → build runtimes → prepare-pages allowlist → artefacto Pages → deploy`.

Service Worker:

- navegação network-first com timeout 4 s;
- assets públicos network-first/no-store com fallback cache;
- allowlist explícita;
- revisões de cache para distribuir mudanças de UI/JS.

`76-ui-audit1` acrescenta apenas nova invalidação de cache; a estratégia não muda.

## 9. Segurança e acessibilidade

- nenhum segredo no repositório público;
- CSP ativa;
- armazenamento sensível em claro bloqueado;
- zoom manual não é bloqueado;
- focus visível e sem ser tapado pelo dock;
- safe areas cobertas;
- reduced-motion/forced-colors cobertos;
- UI não pode introduzir biometria fictícia;
- alterações visuais não podem alterar KDF/cifra/schema.

## 10. Próxima consolidação

1. uma autoridade de navegação móvel;
2. impedir que v74 crie componentes já substituídos;
3. terminar Faturas e Mercado;
4. Planeamento + Calendário;
5. Relatórios + Objetivos;
6. Segurança + Diagnóstico + Definições;
7. consolidar tipografia/iconografia;
8. remover CSS/runtime histórico apenas com prova de não utilização e regressões verdes;
9. continuar migração TypeScript por risco, deixando `core/finance/cifra` para fases com vetores de paridade próprios.