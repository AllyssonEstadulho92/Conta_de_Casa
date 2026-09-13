# Changelog Técnico — Conta de Casa

O histórico integral permanece no Git e no `CHANGELOG.md` da raiz. Este ficheiro mantém as alterações relevantes para continuidade técnica do programa atual.

## 2026-09-13 — `76-auth1` — redesign visível do acesso ao cofre — em validação

### Motivo

Foi confirmado que os blocos recentes de TypeScript/build não alteravam materialmente o primeiro ecrã visto pelo utilizador. O acesso ao cofre continuava com o mesmo cartão grande, fundo decorativo, keypad em cartões retangulares, CTA em gradiente e várias ações secundárias com peso visual semelhante.

### Alterações

- branch `feat/v76-auth-redesign1` criada a partir de `main` `47439e4cb7bd85acc7bf0d98c033a81ea9ba99e3`;
- nova revisão visual `v76-auth1` adicionada ao `v75-usability.css` como ponte de compatibilidade com a cascade existente do cofre;
- fundo de autenticação passa a neutro e sem radial decorativo dominante;
- em mobile, `.vault-card` deixa de funcionar visualmente como cartão pesado e passa a composição quase full-bleed;
- branding é reduzido e usa `icon.svg` real;
- `Acesso seguro` deixa de competir com o título;
- título, ajuda e campo PIN recebem hierarquia mais simples;
- keypad passa para teclas circulares e as letras secundárias ficam ocultas;
- `Entrar` passa a CTA sólido único, sem gradiente ou sombra pesada;
- `Usar palavra-passe` passa a ação terciária;
- ações de mostrar/alterar PIN, ajuda/recuperação e importação de cofre permanecem acessíveis, mas visualmente secundárias;
- modo palavra-passe esconde o keypad PIN;
- nenhuma biometria inexistente foi adicionada;
- dark mode, safe areas, reduced-motion e forced-colors permanecem cobertos;
- `sw.js` recebe apenas revisão de cache `auth1` para atualizar PWA instalada;
- `tests/v75-stability.test.cjs` passa a verificar o contrato visual e a proibir biometria apenas decorativa.

### Domínio e segurança

Não foram alterados `index.html`, `events.js`, `core.js`, `finance.js`, IndexedDB, `STATE_VERSION`, PIN/palavra-passe, PBKDF2, AES-GCM, recuperação, sync, QR/scanner, faturas, Mercado ou cálculos.

### QA

CI da branch `34729499227`: sucesso integral. Passaram finanças, auditoria financeira, isolamento/cofre, datas, faturas/QR, Mercado, Safari/PWA, UI, responsive, acessibilidade, segurança, sync e manifesto.

Publicação ainda pendente de PR/merge/Pages e validação física em iPhone/Safari/PWA.

---

## 2026-09-12 — PR #89 — `market-branding` migrado para TypeScript — publicado

### Objetivo

Continuar a retirada de JavaScript manual por blocos pequenos, escolhendo primeiro módulos folha de baixo risco.

### Alterações

- `src/ui/market-branding.ts` é a fonte canónica do branding semântico do Mercado;
- removida a fonte manual `market-branding.js`;
- `scripts/build-typescript-runtime.cjs` passou de um runtime isolado para um registo explícito de múltiplos runtimes TypeScript;
- o build gera `.generated/v76-veggie-menu.js` e `.generated/market-branding.js`;
- `scripts/prepare-pages.cjs` mapeia ambos os nomes públicos para artefactos gerados e copia-os para `dist`;
- `tests/typescript-runtime-build.test.cjs` valida fonte TS, ausência de JS manual, sintaxe, marcadores de comportamento e igualdade com o bundle público;
- CI, TypeScript Foundation e Pages validam diretamente o segundo runtime gerado;
- a chave do cache PWA foi invalidada para `ts-runtime2-market-branding1`.

### QA e incidente controlado

Durante o desenvolvimento, uma alteração demasiado ampla de `sw.js` introduziu deriva na estratégia de fetch. O teste Safari/PWA falhou e bloqueou o avanço. A lógica publicada foi restaurada e o diff final do Service Worker ficou limitado à chave de cache.

### Publicação

- merge em `main`: `c59e0a45500fd7965039de27615f574129482b13`;
- TypeScript Foundation pós-merge `34700016617`: sucesso;
- CI pós-merge `34700016615`: sucesso integral;
- Deploy Pages `34700037019`: sucesso.

### Domínio e segurança

`market-branding.ts` apenas altera copy/atributos DOM de apresentação. Não toca em `core.js`, `finance.js`, IndexedDB, schema v5, PBKDF2/AES-GCM, sync, QR/scanner, cálculos de Mercado, SKU/PID, preços ou faturas.

---

## 2026-09-12 — PR #88 — primeira fonte JS substituída por TypeScript — publicado

- merge em `main`: `5301bd0d66c5ec46ead7be079799ecb76c752237`;
- TypeScript Foundation pós-merge `34699066645`: sucesso;
- CI pós-merge `34699066749`: sucesso integral;
- Deploy Pages `34699100855`: sucesso;
- `src/ui/veggie-menu-toggle.ts` é a fonte canónica;
- `v76-veggie-menu.js` manual deixou de ser versionado;
- browser/Service Worker continuam a receber `v76-veggie-menu.js`, mas gerado no build e publicado via `dist`;
- branch `backup/js-runtime-baseline-20260912` mantém a baseline anterior para rollback.

---

## 2026-09-12 — `76-product-pages1` / PR #86 — publicado

- merge em `main`: `42557d59f464a2fc7fc22a31eb24564e7dbabad9`;
- CI `34695579311`: sucesso;
- TypeScript Foundation `34695579282`: sucesso;
- Deploy Pages `34695600399`: sucesso;
- o primeiro redesign real do Dashboard passou a fazer parte do site publicado.

Alterações principais:

- `Saldo atual` existente como resumo financeiro dominante;
- `Por pagar`, `Em atraso` e `Saldo projetado` em segundo nível;
- `Pago no mês` e `Próximos 7 dias` compactos;
- desktop reorganiza vencimentos/orçamento e atividade/categorias;
- mobile usa composição própria;
- `renderDashboard()`/`dashboardNumbers()` e fórmulas permanecem inalterados.

---

## 2026-09-12 — auditoria de publicação / PR #87 — corrigido e publicado

### Facto

O commit `5d1b1d8f9506ab4309bd2f2d941c13c77dabbd67` removeu `v75-architecture.js` diretamente de `main`, embora CI e bundle público ainda dependessem do ficheiro.

### Impacto

- CI `34693676180` falhou com `MODULE_NOT_FOUND`;
- Pages `34693693840` foi ignorado;
- a alteração em `main` não produziu nova versão pública.

### Correção

- PR #87 restaurou exatamente o blob anterior;
- merge `6401f1c5156382e9fe364da31afa3fcec4aed9bc`;
- CI `34695315162`: sucesso;
- Pages `34695336131`: sucesso.

### Regra

Um `.js` fonte só é eliminado depois de existir `.ts` equivalente, build gerado, referências migradas e regressões verdes.

---

## 2026-09-12 — `76-modern-ui2` / `ui-components1` — PR #85 — integrado

- hierarquia primary/secondary/danger/link/icon;
- baseline 44 px;
- estados disabled/`aria-disabled`, foco e hover coerentes;
- métricas de ícones;
- `min-width:0` em grids;
- fotografias do Mercado com `contain`/centro/fallback;
- domínio financeiro e segurança preservados.

---

## 2026-09-12 — direção de produto a partir dos protótipos

- Dashboard: resumo financeiro real → KPIs reais → vencimentos/orçamento → categorias/atividade;
- Mercado: pesquisa/catálogo/carrinho/estimativa/fatura com identidade e preço separados;
- Planeamento: apenas sobre saldo, orçamento e rendimentos existentes até novas funções serem implementadas;
- Calendário: foco nos vencimentos/pagamentos suportados;
- Faturas: pesquisa/filtros/resumo/tabela desktop/lista mobile com “Nova fatura” como ação principal;
- desktop e mobile partilham linguagem visual com composição adaptativa;
- dados ou ações existentes apenas no mockup não entram em produção sem suporte real.

---

## Histórico v76 recente

- `76-auth1` — primeiro bloco explicitamente orientado a mudança visual perceptível no cofre;
- PR #90 — documentação pós-bloco 2 TypeScript;
- PR #89 — segunda remoção segura de JS fonte (`market-branding`), merge `c59e0a45500fd7965039de27615f574129482b13`;
- PR #88 — primeira remoção segura de JS fonte e runtime TS gerado;
- PR #84 — consolidação UI/shell, merge `bf55c7cfd9bebe28c1ee57047f066d96e80b9835`;
- PR #82 — baseline arquitetural, merge `bb0cd65830c617506fdc9e94e8b9abdac6a2d86b`;
- PR #80 — `76-mobile-shell2`, merge `4c4ed74bdf3afb752147233f34b2bb84a0bd8876`;
- PR #78 — versão/auditoria;
- PR #76 — `76-veggie-menu2` + `76-modern-ui1`, merge `6323b0a9ceae0bf234dafd259fad4aa0f7e8721a`;
- PR #73 — modernização de Despesas/Faturas;
- PR #72 — fundação TypeScript strict.

## Histórico anterior

Mercado, catálogos, imagens, sincronização, segurança, formulários, QR/scanner, PWA e restantes revisões permanecem no histórico Git. Não remover comportamento histórico sem prova de ausência de referências e regressões verdes.