# Auditoria Visual de Marca e Ícones — Conta de Casa

Atualizado: 13 de setembro de 2026  
Âmbito: aplicação completa, identidade da PWA e iconografia funcional, sem alteração de estrutura, rotas, dados ou regras financeiras.

## 1. Evidência anterior

Capturas reais de Safari/iPhone já tinham exposto problemas de iconografia:

1. no diálogo **Adicionar produto**, a lupa apareceu parcialmente cortada;
2. em **Faturas**, a pesquisa mostrou decoração nativa/desproporcional, filtros mostraram setas duplicadas e o botão compacto apresentou símbolos sobrepostos.

Esses problemas levaram à criação de uma camada Lucide local e à remoção de decorações nativas/duplicadas em pesquisa, selects e ações.

## 2. Factos confirmados na revisão `76-brand-icons1`

A nova auditoria encontrou um problema mais amplo de identidade:

- `icon.svg` era a marca usada pela PWA e combinava casa, euro, folha e dois gradientes;
- `.brand-mark` no HTML continha `⌂`, mas `ui-icons.js` hidratava esse slot como Lucide `home`;
- portanto, o ícone instalado e a marca interna da aplicação não eram a mesma identidade;
- o HTML ainda contém glifos Unicode históricos de fallback (`⌂`, `◉`, `⌁`, `☼`, `⌄`), embora a camada Lucide substitua a maioria no runtime;
- o Mercado ainda possuía uma segunda camada de pseudo-ícones CSS, além do Lucide oficial;
- o título do Mercado recebia um carrinho decorativo via `::before`;
- o estado de sync recebia um chevron decorativo extra via `::after`;
- `#newMarketBtn` recebia `Plus` via JavaScript, mas o CSS escondia-o e apresentava um ícone de scanner, apesar da ação ser “Adicionar item”;
- cartões de resumo do Mercado recebiam ícones grandes e cores próprias por pseudo-elementos.

Conclusão: o problema não era falta de biblioteca de ícones. Era **falta de uma autoridade final clara entre marca, ícones funcionais e decoração histórica**.

## 3. Autoridades finais

### Marca

`icon.svg` é a marca gráfica canónica da Conta de Casa.

Direção final:

- casa = contexto doméstico;
- euro = finanças domésticas;
- teal `#087B78` = cor de marca;
- branco = contraste principal;
- sem folha;
- sem gradientes;
- sem detalhes pequenos que percam legibilidade em favicon/PWA/sidebar.

A mesma marca deve aparecer em:

- PWA/manifest;
- favicon;
- cofre;
- sidebar desktop;
- drawer móvel.

### Iconografia funcional

Foi mantido **Lucide Icons** como sistema oficial de ícones funcionais.

Snapshot de referência:

`94e4cb9d9db5907053ebf3636a97c45529cf776b`

A aplicação não carrega icon fonts nem biblioteca de ícones por CDN em runtime. Apenas o subset necessário é mantido localmente em `ui-icons.js`, com licença distribuída em `LUCIDE_LICENSE.txt`.

Métrica final:

- `viewBox 0 0 24 24`;
- `stroke-width: 2`;
- `stroke-linecap: round`;
- `stroke-linejoin: round`;
- `currentColor`;
- caixas explícitas de 16/20/24/28 px;
- controlos clicáveis com área definida pelo componente, não pelo SVG.

## 4. Correções `76-brand-icons1`

### Logótipo

`icon.svg` foi simplificado para uma composição de casa + euro em teal sólido e branco. Foram removidos folha, gradientes e decoração secundária.

### Marca interna

A autoridade CSS final faz `.brand-mark` reutilizar `icon.svg`. O `home` Lucide que ainda é inserido pelo hidratador fica oculto dentro da marca para evitar duas identidades sobrepostas.

A remoção dessa hidratação redundante do runtime fica para uma limpeza posterior, depois de provar que nenhum consumidor depende dela.

### Mercado

Foram neutralizados pela camada final:

- carrinho decorativo antes do título;
- chevron extra do sync;
- scanner pseudo-icon do botão “Adicionar item”;
- ícones decorativos grandes dos cartões de resumo.

O botão “Adicionar item” volta a apresentar o `Plus` Lucide que corresponde à ação real.

### Glifos Unicode

Os glifos históricos permanecem temporariamente no markup por compatibilidade, mas não são a autoridade visual final. Slots hidratados usam SVG Lucide e os fallbacks visuais são neutralizados onde necessário.

Não serão apagados do HTML até existir prova de não utilização em startup/fallback.

## 5. Critério semântico

Ícones funcionais passam a obedecer a esta regra:

- ação de adicionar → `Plus`;
- pesquisar → `Search`;
- filtrar → `Filter`;
- digitalizar → `Scan`/`Camera` apenas quando realmente abre scanner/câmara;
- editar → `Edit`;
- eliminar → `Trash`;
- bloquear → `Lock`;
- privacidade → `Eye/EyeOff`;
- sincronização → `Cloud/CloudCheck/CloudOff/Refresh/Warning` conforme estado.

Não usar um símbolo apenas porque “fica bonito” se a semântica for diferente.

## 6. Acessibilidade

A iconografia não substitui labels acessíveis. Mantêm-se:

- `aria-label` nos icon buttons;
- texto visível nas ações principais quando o espaço permite;
- estado não comunicado apenas por cor;
- `currentColor` para herdar contraste do componente;
- foco visível no controlo;
- `prefers-reduced-motion` para animação não essencial;
- `forced-colors` nas camadas finais relevantes.

Referência mínima: WCAG 2.2 AA quando tecnicamente aplicável. Alvos de interação importantes continuam >=44 px no design system, acima do mínimo WCAG de 24×24 CSS px.

## 7. O que não foi alterado

- cálculos e estatísticas;
- schema financeiro;
- IndexedDB e cofre cifrado;
- PBKDF2/AES-GCM/PIN;
- backups e sincronização de dados;
- rotas e renderers;
- scanner/QR;
- `estimatedCents` e `actualCents`;
- `marketId|pid`.

## 8. Validação ainda necessária

Antes de considerar o bloco concluído:

- TypeScript Foundation verde;
- CI integral verde;
- Pages publicada sem regressões;
- Safari/iPhone web;
- PWA instalada no iPhone;
- Android/Chrome;
- desktop;
- light/dark;
- 320/360/375/390/430/768/820 px;
- verificar que existe exatamente uma marca visual por localização;
- verificar que “Adicionar item” mostra `Plus` e scanner/câmara aparecem apenas no fluxo de leitura;
- confirmar que nenhum ícone é cortado/desalinhado;
- confirmar contraste não textual em light/dark;
- confirmar atualização do ícone PWA, sabendo que o sistema operativo pode manter cache do ícone instalado e exigir refresh/reinstalação.

## 9. Limpeza futura

Depois da validação física:

1. retirar a hidratação Lucide `home` de `.brand-mark`;
2. remover glifos Unicode históricos comprovadamente dispensáveis;
3. eliminar as regras pseudo-icon antigas que já estão neutralizadas pela autoridade final;
4. continuar a revisão página a página para garantir que novos componentes usam apenas a marca canónica ou o subset Lucide conforme o respetivo papel.
