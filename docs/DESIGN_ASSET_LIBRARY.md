# Biblioteca de Design — Fontes, Ícones, Animações e Assets

Atualizado: 10 de setembro de 2026  
Revisão: `75-assets1`

## Objetivo

Criar um critério único e reutilizável para as aplicações do projeto Móvel e Computador. A lista abaixo funciona como **catálogo de fornecedores**, não como autorização automática para copiar ficheiros ou carregar CDNs. Cada asset escolhido deve passar por validação de licença, segurança, acessibilidade, desempenho e coerência visual antes de entrar numa aplicação.

A Conta de Casa mantém uma política **local-first/offline-first**. O simples facto de uma fonte, ícone ou animação estar disponível para download não significa que a licença permita redistribuição, incorporação em PWA/app, uso comercial ou self-hosting.

## Catálogo registado

| Recurso | Categoria | Endereço | Estado no projeto | Regra principal |
| --- | --- | --- | --- | --- |
| Lucide | Ícones | https://lucide.dev/ | **Primário** | Já é o sistema local da Conta de Casa. Não misturar outro estilo na navegação sem motivo validado. |
| Lottie / Airbnb | Animações e ícones animados | https://lottie.airbnb.tech/#/ | Condicional | `lottie-web` é MIT, mas cada animação precisa de licença própria. Preferir runtime + JSON locais e fallback estático. |
| Google Fonts | Fontes | https://fonts.google.com/ | Condicional | Verificar a licença da família. Na Conta de Casa não ativar CDN por defeito; preferir self-host quando a licença permitir. |
| Fontshare | Fontes | https://www.fontshare.com/ | Condicional | Famílias podem usar SIL OFL ou ITF Free Font License; guardar o aviso aplicável. |
| Font Squirrel | Fontes | https://www.fontsquirrel.com/ | Condicional | O próprio catálogo recomenda confirmar a licença de cada fonte e o tipo de embedding permitido. |
| DaFont | Fontes | https://www.dafont.com/ | Referência | As licenças variam muito: freeware, personal use, demo, shareware, etc. Nunca assumir uso comercial. |
| UNCUT.wtf | Fontes | https://uncut.wtf/ | Condicional | Catálogo orientado a fontes gratuitas para uso comercial, mas a licença do criador continua a ser a fonte jurídica. |
| Adobe Fonts | Fontes | https://fonts.adobe.com/ | Serviço condicional | O uso web normal depende do embed/hosting Adobe. A licença padrão não autoriza copiar os ficheiros para self-hosting e app embedding pode exigir licença própria. |
| MyFonts | Fontes | https://www.myfonts.com/ | Licença condicional/paga | A licença muda conforme web, app, desktop e foundry. Só integrar depois de adquirir e registar a licença correta. |
| Fontpair | Emparelhamento tipográfico | https://fontpair.co/ | Referência | Ferramenta de seleção/combinação; não é dependência runtime. As fontes vêm dos respetivos fornecedores. |
| Fontjoy | Emparelhamento tipográfico | https://fontjoy.com/ | Referência | Ferramenta de exploração; não deve ser carregada pela aplicação. |
| Font Awesome | Ícones | https://fontawesome.com/ | Condicional | Se necessário, preferir subset self-hosted e manter avisos de licença. Lucide continua a ser o padrão na Conta de Casa. |
| Material Symbols and Icons | Ícones | https://fonts.google.com/icons | Condicional | Material Symbols usa Apache 2.0. Preferir SVG local em vez de adicionar outra icon font global. |
| Type Icons Font | Ícones/font | https://www.dafont.com/type-icons.font | **Restrito** | A distribuição encontrada é shareware/demo; não integrar na aplicação pública sem licença comercial compatível. |
| Free Icon Font Proyectos | Ícones | — | **Não verificado** | O nome fornecido não identifica uma origem oficial única. É obrigatório obter URL e licença antes de qualquer integração. |

## Critério obrigatório para fontes

1. **Máximo de duas famílias por aplicação**, preferencialmente uma única família com pesos diferentes.
2. Confirmar licença para o canal real: Web/PWA, iOS/Android, desktop, PDF ou material gráfico não são necessariamente equivalentes.
3. Guardar no repositório a origem, versão/data, licença e ficheiros efetivamente utilizados quando houver redistribuição.
4. Preferir WOFF2 e apenas os pesos/subconjuntos necessários. Evitar descarregar uma família completa sem necessidade.
5. Usar `font-display: swap` ou estratégia equivalente quando houver webfont aprovada.
6. Definir sempre fallback seguro: `system-ui`, `-apple-system`, `Segoe UI`, sans-serif ou equivalente coerente.
7. Não alterar a tipografia global de uma aplicação apenas porque existe uma fonte nova; a mudança deve passar por teste de legibilidade, números, formulários, tabelas e mobile.
8. A Conta de Casa mantém `Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif` como stack atual até existir uma decisão técnica aprovada.

## Critério obrigatório para ícones

1. Uma aplicação deve ter **um sistema principal**. Na Conta de Casa é Lucide SVG local.
2. Ícones funcionais devem manter grelha, espessura, tamanho ótico e alinhamento consistentes.
3. Ícones decorativos: `aria-hidden="true"`.
4. Botões apenas com ícone precisam de nome acessível (`aria-label`, texto visível ou equivalente).
5. Tamanho visual normal: 18–24 px. Alvo tátil: mínimo 44 px, 48 px quando o contexto exigir maior tolerância.
6. Não usar emojis como substituto permanente de ícones funcionais.
7. Não misturar Lucide, Material, Font Awesome e outras famílias no mesmo fluxo sem uma regra explícita de migração.
8. Brand icons devem ser usados apenas para representar a marca respetiva e respeitar marcas comerciais.

## Critério obrigatório para animações / Lottie

1. A animação deve melhorar compreensão, feedback ou estado; não deve existir apenas como ruído visual.
2. Máximo recomendado de uma animação principal visível por área de interface.
3. O runtime Lottie não é carregado de CDN automaticamente. Se for adotado, deve ser versionado/local e incluído na allowlist do PWA.
4. JSONs de animação devem ser locais por defeito. URLs externas são bloqueadas pelo carregador `75-assets1`.
5. `prefers-reduced-motion` é obrigatório: pausar/substituir por fallback estático.
6. Uma animação de estado não pode esconder informação crítica; deve existir texto/estado semântico equivalente.
7. Verificar licença do JSON/arte separadamente da licença do runtime `lottie-web`.
8. Evitar animações pesadas no arranque, cofre/PIN ou fluxos financeiros críticos.

## Carregamento de fotografias, media e outros assets

A fundação `75-assets1` acrescenta `asset-loader.js` e `asset-loader.css`.

### Fotografias

Uso opt-in:

```html
<div data-cdc-asset-frame data-cdc-asset-error-label="Imagem indisponível">
  <img data-cdc-asset data-cdc-src="./assets/exemplo.webp" alt="Descrição" />
</div>
```

O loader aplica:

- `loading="lazy"` por defeito;
- `decoding="async"`;
- prioridade explícita por `data-cdc-priority="high|low|auto"`;
- `IntersectionObserver` com margem de pré-carregamento para `data-cdc-src`;
- estados `loading`, `ready` e `error`;
- shimmer/fallback visual;
- `referrerPolicy="no-referrer"` por defeito;
- URLs locais/data/blob por defeito; recursos externos exigem autorização explícita e continuam sujeitos à CSP.

O Mercado mantém `market-photo-loader.js` como loader especializado. A fundação transversal não substitui a lógica de PID, catálogo, IndexedDB ou fontes oficiais de imagem.

### Vídeo e áudio

Elementos `video[data-cdc-asset]` e `audio[data-cdc-asset]` recebem `preload="metadata"` por defeito e estados de carregamento/erro sem iniciar autoplay.

### Lottie

```html
<div
  data-cdc-asset-frame
  data-cdc-lottie-src="./assets/animations/sucesso.json"
  data-cdc-lottie-fallback="./assets/animations/sucesso.svg"
  data-cdc-alt="Operação concluída">
</div>
```

O loader só monta a animação se existir um runtime `window.lottie` local já aprovado. Não injeta scripts externos. Se o runtime não existir, sinaliza `runtime-missing`; se o utilizador preferir movimento reduzido, usa fallback estático quando fornecido.

## Segurança e privacidade

- A introdução do catálogo **não expande a CSP**.
- `font-src` da Conta de Casa continua `'self'`.
- Nenhum provider desta lista é carregado apenas por estar registado.
- Não são enviados dados financeiros, PIN, credenciais ou telemetria para fornecedores de design.
- Nenhuma chave de Font Awesome Kit, Adobe Web Project, token ou URL privada deve ser adicionada a código público.
- Recursos externos só podem ser ativados depois de avaliar privacidade, CSP, disponibilidade offline e licença.

## Processo de adoção de um novo asset

1. Identificar necessidade de UX e componente alvo.
2. Selecionar fornecedor no registo `CDCDesignAssetLibrary`.
3. Confirmar origem oficial e licença.
4. Verificar formato/tamanho e necessidade de self-hosting.
5. Testar contraste, foco, leitor de ecrã e `prefers-reduced-motion`.
6. Testar 320/375/390/430 px, tablet e desktop.
7. Testar offline/PWA e ausência de layout shift significativo.
8. Atualizar a allowlist do Pages/Service Worker apenas se houver novos ficheiros locais.
9. Adicionar/atualizar testes de regressão.
10. Registar a decisão em `DECISIONS.md` e a alteração em `CHANGELOG.md`.

## Fontes de verificação usadas nesta revisão

- Lottie Web: https://github.com/airbnb/lottie-web
- Google Fonts API: https://developers.google.com/fonts/docs/getting_started
- Material Symbols: https://developers.google.com/fonts/docs/material_symbols
- Fontshare licenses: https://fontshare.com/licenses/sil-ofl e https://www.fontshare.com/licenses/itf-ffl
- Font Squirrel FAQ: https://www.fontsquirrel.com/faq
- UNCUT.wtf legal/licensing: https://uncut.wtf/legal/
- Adobe Fonts licensing: https://helpx.adobe.com/fonts/web/font-licensing/webfont-licensing.html
- Font Awesome web/self-hosting docs: https://docs.fontawesome.com/web/ e https://docs.fontawesome.com/web/setup/host-yourself/webfonts
- MyFonts licensing: https://www.myfonts.com/pages/license-agreement
- Type Icons listing/licensing signal: https://www.dafont.com/type-icons.font
- Fontpair: https://fontpair.co/
- Fontjoy: https://fontjoy.com/
