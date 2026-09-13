# Estado do Projeto — Conta de Casa

Atualizado: 13 de setembro de 2026  
Versão da aplicação: `0.76.0-dev.1`  
Release pública: `v75`  
Programa técnico: `v76` — redesign UI/UX + migração incremental para TypeScript  
Branch pública: `main`  
Baseline de `main`: `47439e4cb7bd85acc7bf0d98c033a81ea9ba99e3` — PR #90  
Trabalho atual: `feat/v76-auth-redesign1` — primeiro bloco visual explicitamente orientado a mudança perceptível  
Fallback técnico: `backup/js-runtime-baseline-20260912`  
Distribuição: GitHub Pages / PWA

## 1. Invariantes obrigatórias

- `STATE_VERSION = 5` até existir migração de schema aprovada e testada;
- dinheiro persistido em cêntimos inteiros;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000`;
- sincronização GitHub opcional limitada ao envelope cifrado;
- `estimatedCents` permanece distinto de `actualCents`;
- `marketId|pid` permanece identidade canónica de SKU/fotografia;
- QR, scanner, backup/restauro, PWA e offline não podem regredir;
- redesign ou migração de linguagem não podem alterar silenciosamente cálculos, pagamentos, faturas, persistência, autenticação ou segurança.

## 2. Diagnóstico da reclamação “a aplicação continua na mesma”

Facto confirmado: os PRs #88, #89 e #90 foram principalmente migração de fonte JavaScript para TypeScript, build, cache e documentação. Esses blocos não tinham como objetivo alterar materialmente a aparência do ecrã de acesso ao cofre.

O ecrã de autenticação continuava a usar a composição e as regras visuais históricas: cartão grande, fundo decorativo, teclado numérico com botões em formato de cartões, CTA em gradiente e várias ações secundárias a competir visualmente.

Conclusão: a ausência de diferença visual percebida não era apenas cache. Faltava uma alteração visual real no componente que o utilizador vê primeiro.

## 3. Bloco visual atual — `76-auth1`

Branch: `feat/v76-auth-redesign1`.

Implementado até ao momento:

- fundo do acesso passa a neutro e limpo, sem decoração radial dominante;
- no telemóvel, o contentor deixa de parecer um cartão grande sobre outro fundo e passa a uma composição quase full-bleed;
- branding reduzido e alinhado com o ícone real da aplicação;
- removido visualmente o rótulo redundante `Acesso seguro`;
- título, texto de apoio e campo PIN recebem hierarquia mais clara;
- teclado PIN passa de botões retangulares tipo cartão para teclas circulares simples;
- letras secundárias das teclas ficam ocultas para reduzir ruído;
- `Entrar` torna-se a única ação visual dominante, em cor sólida e sem gradiente;
- `Usar palavra-passe`, `Mostrar PIN`, `Alterar PIN` e recuperação permanecem funcionais, mas com hierarquia terciária;
- importação de cofre permanece acessível num disclosure discreto;
- modo palavra-passe deixa de mostrar simultaneamente o teclado PIN;
- dark mode, reduced-motion, forced-colors, safe areas e alvo tátil mínimo continuam considerados;
- não foram adicionados Face ID, Touch ID ou outros mecanismos inexistentes no produto.

Ficheiros alterados no bloco:

- `v75-usability.css` — regras de apresentação `v76-auth1`, mantendo compatibilidade com a cadeia CSS atual;
- `sw.js` — apenas revisão da chave de cache para forçar atualização PWA;
- `tests/v75-stability.test.cjs` — contrato específico para o novo visual e para a ausência de biometria inventada.

CI da branch `34729499227`: sucesso integral, incluindo finanças, cofre, Mercado, Safari/PWA, segurança, responsive, acessibilidade e sync.

## 4. Migração TypeScript publicada

### Bloco 1 — PR #88

Merge `5301bd0d66c5ec46ead7be079799ecb76c752237`:

- `src/ui/veggie-menu-toggle.ts` é fonte canónica;
- `v76-veggie-menu.js` manual foi removido;
- build gera `.generated/v76-veggie-menu.js` e Pages publica o runtime gerado;
- TypeScript `34699066645`, CI `34699066749` e Pages `34699100855`: sucesso.

### Bloco 2 — PR #89

Merge `c59e0a45500fd7965039de27615f574129482b13`:

- `src/ui/market-branding.ts` é fonte canónica;
- `market-branding.js` manual foi removido;
- build suporta múltiplos runtimes TS;
- TypeScript `34700016617`, CI `34700016615` e Pages `34700037019`: sucesso.

O modelo `TypeScript fonte → JavaScript gerado → dist → browser` está comprovado em produção.

## 5. UI/UX publicada antes deste bloco

- `76-modern-ui2`: tokens/componentes e hierarquia de ações;
- `76-product-pages1`: composição real do Dashboard;
- `76-mobile-shell2`: geometria mobile, safe areas, scroll e dock.

O Dashboard continua a usar os dados reais já existentes e não introduz fórmulas financeiras novas.

## 6. JavaScript ainda existente

A aplicação ainda não é 100% TypeScript. Permanecem fontes JS manuais como `core.js`, `finance.js`, `render.js`, `forms.js`, `events.js`, `mobile-menu-toggle.js`, sync, vários módulos de Mercado, assets, atualização, runtimes históricos e Service Worker.

Sequência obrigatória por módulo:

`auditar dependências → criar TS strict → provar paridade → gerar artefacto → trocar build/runtime → regressão completa → remover JS fonte`.

A migração TypeScript continua, mas não deve impedir a execução dos blocos visuais necessários para alinhar o produto com a direção UI/UX pedida.

## 7. Fallback

`backup/js-runtime-baseline-20260912` guarda a baseline JavaScript publicada anterior à migração. É referência de rollback; não é carregada em paralelo.

## 8. Riscos/lacunas abertas

- `main` ainda não tem branch protection obrigatória;
- `76-auth1` ainda precisa de validação física em iPhone/Safari/PWA após publicação;
- vários módulos JS ainda são copiados diretamente pelo build;
- `market-experience.js` ainda necessita teste dedicado para persistência de `pid` em todo o fluxo;
- CSS histórico v74/v75 mantém sobreposições a consolidar gradualmente;
- JavaScript gerado em `dist/` não deve ser confundido com fonte JavaScript manual.

## 9. Próximo passo

1. Rever o diff de `feat/v76-auth-redesign1` e integrar apenas com CI verde.
2. Confirmar CI + Deploy Pages pós-merge e validar que a mudança é efetivamente visível no site/PWA.
3. Fazer validação física do ecrã de acesso em iPhone/Safari e desktop.
4. Avançar para o próximo bloco visual perceptível — header/Dashboard e depois páginas funcionais — mantendo regressões financeiras e de segurança.
5. Continuar a migração TypeScript em paralelo, sempre por módulos auditáveis e sem atrasar correções visuais prioritárias.