# Decisões Técnicas — Conta de Casa

Atualizado: 10 de setembro de 2026

O histórico detalhado permanece no Git. Este ficheiro conserva as decisões necessárias para continuar o projeto sem reinterpretar regras críticas.

## Decisões estruturais vigentes

- estado financeiro local-first separado da apresentação e dos catálogos;
- dinheiro em cêntimos inteiros e `STATE_VERSION = 5`;
- cofre PBKDF2-SHA-256 + AES-GCM com `PBKDF2_ITERATIONS = 250000`;
- sincronização apenas do envelope cifrado;
- fotografias não são prova de preço/transação;
- `marketId|pid` é identidade canónica de SKU/fotografia no pipeline especializado;
- preço pesquisado é estimativa e preço efetivamente pago permanece separado;
- falha de fotografia nunca remove o artigo;
- revisão/cache pública deve ser invalidável;
- mobile não pode esconder funcionalidade canónica sem alternativa equivalente;
- correções de interação não podem bloquear pinch-to-zoom;
- assets externos exigem origem/licença/integração aprovadas.

## D-056 — PIN não espera pela rede em dispositivo já emparelhado

Estado: integrado.

Manter PBKDF2 em 250000 iterações. Um dispositivo com cópia local cifrada confirmada pode abrir sem bloquear na verificação remota; a verificação continua em background. Primeiro emparelhamento mantém o gate original.

## D-057 — fotografia termina num estado estável

Estado: integrado como `75-photo-loader3`.

Estados: carregar → validar → `Sem fotografia`, com cooldown antes de retry automático. Falha temporária nunca elimina SKU.

## D-058 — URL oficial exata não dispara resolução redundante

Estado: integrado como `75-catalog4`.

Host/path/PID continuam estritos. Uma tentativa direta sem resultado termina para cartões com `sourceUrl` oficial exata; pesquisa livre pode continuar a usar o bridge legado.

## D-060 — impedir zoom acidental sem bloquear acessibilidade

Estado: integrado como `75-usability1`.

Usar `touch-action: manipulation`, inputs mobile com tamanho seguro, alvos tácteis 44/48 px e safe areas, sem `user-scalable=no` ou `maximum-scale=1`.

## D-061 — Despesas mobile usa a vista funcional canónica

Estado: integrado como `75-pages1` pelo PR #68.

`renderBills()`/`filterBills()` continuam responsáveis por pesquisa, filtros, resumo, estado, vencimento e ações. A UI mobile não volta a usar um feed simplificado que esconda essas funções.

## D-062 — biblioteca de design local-first

Estado: integrado como `75-assets1`.

Lucide local permanece sistema principal de ícones. Catálogos externos não são dependências automáticas. CSP não é expandida apenas para experimentar fontes, ícones ou animações.

## D-063 — preço real pendente deve ficar visível no Mercado

Estado: integrado como `75-market1` pelo PR #71.

O fluxo reutiliza o mesmo controlo/handler existente; não cria uma segunda escrita financeira. Estimativa e preço confirmado permanecem distinguíveis.

## D-064 — migração TypeScript incremental

Estado: Bloco 1 integrado pelo PR #72.

1. destino: código-fonte funcional em TypeScript com `strict`;
2. browser continua a receber JavaScript compilado/compatível;
3. não introduzir outro framework durante a migração;
4. substituir módulo apenas depois de paridade JS→TS;
5. schema, cifragem e sync não mudam apenas por causa da linguagem;
6. `any` não justificado não é estratégia de migração;
7. TypeScript e runtime publicado permanecem desacoplados até cada bloco estar provado.

## D-065 — Mercado só usa o rótulo Exato com evidência completa

Estado: aceite para v76.

`Exato` exige SKU correto, quantidade/peso real, preço válido, promoções/condições aplicáveis e restantes fatores que mudem o total. Na ausência de algum fator, usar `Estimativa` ou `Preço por confirmar`.

## D-066 — imagens e logos não enfraquecem identidade/licença/CSP

Estado: aceite para v76.

Preferir GTIN/PID e fonte verificada. Logos SVG de supermercados só entram como assets locais depois de origem e direito de utilização validados. Não copiar SVGs de agregadores nem expandir CSP apenas para branding.

## D-067 — modernização de Despesas será CSS isolado, sem reescrever lógica

Data: 10 de setembro de 2026. Estado: aceite na branch `feat/v75-expenses-modern-ui` como `75-expenses1`.

### Factos

- `#page-bills` já contém Lista/Calendário, pesquisa, filtros, resumo, tabela desktop e cartões mobile;
- `renderBills()` e `filterBills()` já entregam o comportamento funcional necessário;
- `billActionsHtml()` preserva as ações conforme o estado da fatura;
- a necessidade atual é de hierarquia, densidade, alinhamento e acabamento visual, não de novo modelo financeiro.

### Decisão

1. criar `v75-expenses-modern.css` como camada exclusivamente visual;
2. limitar seletores a `html.cdc-v75 #page-bills`;
3. não alterar `render.js`, `finance.js`, `forms.js`, `events.js`, `core.js` ou os IDs canónicos;
4. modernizar tabs, pesquisa/criação, filtros, cartões de resumo, tabela e cartões mobile;
5. manter `Em falta` como informação financeira principal nos cartões mobile;
6. manter Total, Pago, Categoria, vencimento, progresso e ações visíveis;
7. usar breakpoints específicos sem criar uma UI funcional paralela;
8. respeitar `prefers-reduced-motion` e `forced-colors`;
9. carregar a camada depois de `v75-pages.css` e antes de `v75-usability.css`;
10. versionar cache/bundle como `75-expenses1` e adicionar teste dedicado.

### Fundamento

O código funcional de Despesas já está coberto por testes e não apresenta um defeito que justifique reescrita. Uma camada CSS isolada reduz a superfície de regressão e permite melhorar a experiência sem afetar valores, pagamentos ou persistência.

### Segurança

A revisão não introduz rede, CDN, script, endpoint, token ou segredo. Não altera PIN, PBKDF2, AES-GCM, IndexedDB ou sincronização.

## Estado de continuidade

- Bloco 1 TypeScript integrado no `main` no commit `2c1d78508507ab77d6df95850568d9fd7f6b9577`;
- revisão visual corrente: `75-expenses1`;
- branch TypeScript Bloco 2 permanece separada: `feat/v76-money-dates`;
- não misturar migração matemática com alterações visuais no mesmo PR.
