# Migração TypeScript — Conta de Casa

Atualizado: 10 de setembro de 2026  
Programa técnico: `v76`  
Branch inicial: `feat/v76-typescript-foundation`  
Objetivo final: fonte funcional em TypeScript, preservando o comportamento validado da v75.

## 1. Objetivo

Migrar a Conta de Casa de JavaScript para TypeScript por blocos pequenos, verificáveis e reversíveis. A migração não é uma reescrita visual nem uma alteração simultânea de regras de negócio. Cada bloco deve preservar a aplicação publicada até que a equivalência funcional esteja provada por testes.

A meta `100% TypeScript` significa que, no final do programa, o código-fonte funcional mantido pela aplicação estará em `.ts`, com `strict` ativo, sem `any` não justificado e com build a gerar JavaScript para o browser. Não significa promessa de zero defeitos: TypeScript reduz erros estruturais, mas erros de fórmula, dados externos incorretos, preços desatualizados e comportamento específico de hardware continuam a exigir testes e validação.

## 2. Invariantes que não podem ser quebradas

- `STATE_VERSION = 5` enquanto não existir uma migração de schema aprovada e testada.
- Valores monetários persistidos em cêntimos inteiros.
- Estado financeiro cifrado em IndexedDB.
- Cofre com PBKDF2-SHA-256 + AES-GCM e `PBKDF2_ITERATIONS = 250000`.
- PIN/palavra-passe nunca persistido nem enviado.
- Sincronização remota apenas do envelope cifrado.
- `estimatedCents` e `actualCents` permanecem conceitos distintos.
- `marketId|pid` permanece identidade canónica de SKU/fotografia até decisão explícita documentada.
- QR, scanner, backup/restauro, PWA, Service Worker e funcionamento offline não podem regressar por causa da migração de linguagem.
- A aplicação publicada em `main` não passa a depender de TypeScript em runtime; o browser recebe JavaScript gerado no build.

## 3. Estratégia de migração por blocos

### Bloco 0 — baseline e especificação

Estado: em execução.

- confirmar HEAD, CI, Pages e revisões v75 integradas;
- registar riscos, critérios de aceitação e mapa de migração;
- não alterar runtime.

### Bloco 1 — fundação TypeScript

- adicionar `package.json` apenas para ferramentas de desenvolvimento;
- adicionar `tsconfig.json` com verificação estrita para novos módulos;
- criar tipos base de domínio sem substituir ainda módulos JavaScript;
- adicionar `npm run typecheck` à CI antes de qualquer ficheiro TS entrar no bundle;
- não alterar `index.html`, `dist/`, Service Worker, cálculos ou persistência.

### Bloco 2 — dinheiro, quantidades e datas

Migrar primeiro funções puras e determinísticas. Criar testes de paridade JS→TS com os mesmos vetores de entrada/saída antes de substituir o runtime.

Áreas:

- parsing e formatação monetária;
- cêntimos e limites seguros;
- quantidade de produtos;
- preço × quantidade;
- datas civis e horas.

Critério: nenhuma diferença nos resultados válidos atuais e rejeição explícita de inputs inválidos.

### Bloco 3 — domínio financeiro

Migrar `finance.js` por subdomínios: faturas, pagamentos, rendimentos, orçamento, categorias, objetivos, relatórios e IVA já suportado. Cada fórmula terá testes de valores mínimos, máximos, zero, negativos permitidos/proibidos, arredondamentos e datas limite.

### Bloco 4 — Mercado: modelo e motor de carrinho

Separar quatro conceitos que não podem ser confundidos:

1. produto/catálogo;
2. preço pesquisado ou observado;
3. preço efetivamente confirmado;
4. linha de compra e total contabilizado.

O motor de carrinho deve trabalhar apenas com inteiros/razões controladas e produzir reconciliação verificável por linha e por total.

### Bloco 5 — Mercado: experiência equivalente a caixa

A Conta de Casa não será tratada como POS proprietário de um retalhista e não executará pagamentos bancários. O objetivo é reproduzir, para planeamento e conferência da compra, as funções de cálculo observáveis numa passagem em caixa, quando existirem dados suficientes.

Capacidades previstas:

- leitura de GTIN/EAN por scanner;
- pesquisa e seleção manual quando não existe código;
- quantidade por unidade/embalagem;
- produtos a peso com quantidade/gramas ou quilogramas;
- preço unitário e preço por unidade de medida;
- promoções por artigo e por quantidade quando a regra estiver conhecida;
- descontos de cabaz/cupões/cartão apenas quando a regra e a elegibilidade estiverem conhecidas;
- IVA por linha e resumo por taxa quando suportado pelos dados;
- subtotal, descontos, total estimado, total confirmado e diferença;
- estado `por comprar`, `preço por confirmar` e `comprado`;
- reconciliação com fatura/talão importado ou lido por QR/documento;
- histórico do preço efetivamente pago separado do preço pesquisado;
- identificação da origem, data/hora de recolha e validade de cada preço externo.

### Limite de exatidão do Mercado

A aplicação só pode afirmar **valor exato** quando todos os elementos que determinam o preço estiverem confirmados: produto/SKU correto, quantidade/peso real, preço válido naquele mercado e momento, promoção aplicável, condições de cartão/cupão, IVA/regra aplicável e eventuais ajustes de caixa. Sem estes elementos, o resultado deve ser rotulado `Estimativa`, nunca `Exato`.

Preços públicos ou APIs externas não devem ser tratados como prova do preço final da caixa quando a fonte não garantir essa equivalência.

### Bloco 6 — imagens de produtos e marcas

- manter biblioteca por `marketId|pid`;
- preferir imagem oficial do produto ou fonte com utilização permitida;
- cache local, fallback e estado terminal sem imagem;
- nenhuma imagem pode alterar preço ou identidade do produto;
- documentar origem/licença de qualquer coleção incorporada;
- logos de mercados em SVG só entram como assets locais depois de origem e direito de utilização serem verificados; não copiar SVG de sites aleatórios nem introduzir hotlinking/CDN sem revisão de CSP, licença e privacidade.

### Bloco 7 — cofre, IndexedDB e segurança

Migrar `core.js` apenas depois de dinheiro, datas e domínio financeiro estarem estáveis. Criar tipos explícitos para schema persistido, envelope cifrado, metadados, versões e erros. Nenhuma alteração criptográfica é permitida apenas por causa de TypeScript.

### Bloco 8 — sincronização

Migrar sincronização e conflitos com tipos discriminados para estados locais/remotos, tombstones, versões e decisões do utilizador. Testar conflitos, offline, timeout, dados corrompidos e concorrência.

### Bloco 9 — UI, formulários e eventos

Migrar `render.js`, `forms.js`, `events.js`, navegação, ícones e componentes de Mercado. Usar tipos concretos de DOM e guards para elementos opcionais; evitar casts que escondam `null`.

### Bloco 10 — PWA, build e limpeza

- migrar Service Worker quando o pipeline estiver estável;
- publicar apenas JavaScript compilado/permitido pelo gerador Pages;
- remover JavaScript legado apenas quando não existirem referências e todos os testes de regressão estiverem verdes;
- ativar `strict` para toda a árvore TypeScript;
- rejeitar `any` não documentado.

## 4. Tipos de domínio obrigatórios

A fundação deverá criar, sem acoplamento à UI, contratos para pelo menos:

- `Cents`;
- `CivilDateKey`;
- `Bill`, `Payment`, `Income`, `Budget`, `Goal`;
- `MarketId`, `ProductId`, `Gtin`, `MarketProduct`;
- `ObservedPrice`, `ConfirmedPrice`, `CartLine`, `CartTotals`;
- `VatRate`/resumo fiscal quando existir evidência suficiente para o cálculo;
- `AppState` e schema persistido;
- `VaultEnvelope` e estado de sincronização.

IDs e tipos nominais devem impedir misturas acidentais entre cêntimos/euros, PID/GTIN, preço estimado/preço confirmado e IDs de domínios diferentes.

## 5. Critérios de aceitação por bloco

Cada bloco só pode avançar quando:

1. o código relacionado foi lido e mapeado antes da alteração;
2. testes existentes continuam verdes;
3. novos testes cobrem a regra migrada;
4. `typecheck` passa sem erro;
5. não existe regressão de segurança ou armazenamento;
6. comparação com a baseline mostra apenas os ficheiros esperados;
7. documentação permanente foi atualizada;
8. código antigo só é removido depois da equivalência estar provada.

Para blocos que alterem UI/PWA, acrescentar validação física em iPhone/Safari/PWA e breakpoints mobile/tablet/desktop.

## 6. Estratégia de precisão

- dinheiro: inteiros/BigInt onde a operação exigir evitar floating point;
- quantidades: representação inteira escalada ou razão explícita, nunca `float` solto para contabilidade;
- arredondamento: função única, documentada e testada por regra;
- preços externos: guardar origem, instante de observação e estado `estimado/confirmado`;
- promoções: regra explícita e testável, sem inferir condições desconhecidas;
- totais: soma das linhas já arredondadas conforme regra documentada, com reconciliação independente;
- importação de fatura: nunca substituir silenciosamente um valor existente sem revisão/critério definido.

## 7. Imagens e logos

A apresentação profissional deve ser conseguida sem degradar segurança ou fiabilidade. A biblioteca de imagens será progressiva e associada à identidade do produto. Logos SVG serão tratados como assets de marca, com fonte e licença/termos documentados. Enquanto isso não estiver verificado, a aplicação mantém branding textual/visual existente em vez de incorporar ficheiros de origem incerta.

## 8. Estado inicial confirmado

A baseline funcional imediatamente anterior ao programa v76 inclui `75-market1`, integrado em `main` no commit `c44348dbc5a942b601f360fa38793bd9d8b47a1a`. O PR #71 foi integrado com CI verde na branch. Permanecem necessárias validações físicas e atualização do estado documental pós-merge.

O primeiro bloco v76 não altera runtime. Serve para instalar a disciplina de tipos e impedir que a migração seja feita como uma conversão massiva e não auditável.
