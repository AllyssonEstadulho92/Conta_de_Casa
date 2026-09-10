# Estado do Projeto — Conta de Casa

Atualizado: 10 de setembro de 2026
Build: `v75`
Branch pública: `main`
Branch de correção em validação: `fix/v75-pin-images-stability`
Distribuição: GitHub Pages / PWA
Runtime público anterior: `75-startup1` sobre `main` SHA `3964f3a7bfde219cdb7f50cc45eef6cb1723d338`
Runtime candidato: `75-startup2` + distribuição `75-catalog4` + `75-photo-loader3`

## Baseline preservada

- `STATE_VERSION = 5`;
- valores monetários em cêntimos;
- estado financeiro em IndexedDB;
- cofre PBKDF2-SHA-256 + AES-GCM;
- `PBKDF2_ITERATIONS = 250000` preservado;
- sincronização GitHub opcional limitada ao envelope cifrado;
- UI `74-ui1`, Mercado `74-shopping2`, menu `73-menu8`, experiência `74-experience2`;
- arquitetura `75-architecture2`, cabeçalho `75-header2`, estabilidade `75-stability1`, geometria `75-layout1`, drawer `75-drawer2`;
- renderer incremental do catálogo permanece `75-catalog3` internamente.

## Evidência física atual

No iPhone/Safari foram observados três sintomas simultâneos:

1. demora perceptível depois de introduzir o PIN;
2. cartões de produto presos em **A carregar fotografia…** / **A validar fotografia…**;
3. catálogo com `1863 produtos indexados · 125 imagens validadas` e biblioteca Pingo Doce com `1229 SKUs indexados · 0 fotografias oficiais`.

Os dois contadores não representam a mesma coisa: o catálogo geral usa o total da biblioteca partilhada de imagens oficiais (Continente + Pingo Doce), enquanto o painel Pingo Doce conta apenas registos da base dedicada cujo `imageState` chegou a `ready`.

## Causa confirmada — demora após PIN

O PIN não estava apenas a decifrar o cofre local. Depois de `unlockVault()`, `enterApp()` aguardava `syncStartupGate()`. Num dispositivo já emparelhado e online, esta barreira podia esperar pela sincronização GitHub e pelo timeout de arranque antes de mostrar o shell.

A força criptográfica do PIN não foi reduzida. A correção candidata `75-startup2` mantém a derivação PBKDF2 atual e apenas deixa de bloquear a apresentação da cópia local cifrada já confirmada num dispositivo emparelhado. A verificação remota começa imediatamente em segundo plano e a política de conflitos permanece inalterada.

## Causa confirmada — imagens sem estado final

`75-photo-loader2` alterava o texto para **Fotografia a validar…** após a janela de carregamento, mas não tinha um estado terminal visual. Um SKU sem fotografia resolvida podia, por isso, continuar indefinidamente com aparência de trabalho em curso.

Além disso, um resultado Pingo Doce resolvido pelo carregador visível era guardado na biblioteca partilhada, mas não atualizava imediatamente o `imageState` do mesmo SKU na base dedicada Pingo Doce. O contador podia continuar em `0` mesmo quando a fotografia já tinha sido resolvida por outro caminho.

## Fonte Pingo Doce verificada

Foi reforçada a sonda real de CI para reproduzir também o validador do runtime. No run `34444945747`, a origem respondeu corretamente:

- `cesta.pt`: Continente e Pingo Doce disponíveis;
- reader Continente: imagem exata encontrada e aceite pelo validador;
- reader Pingo Doce: imagem exata encontrada e aceite pelo validador;
- exemplo Pingo Doce `pid 739490`: `runtime-safe=true`.

Conclusão: o `0 fotografias oficiais` não é explicado por uma rejeição universal do host/path/PID do Pingo Doce. O problema está no pipeline de execução/estado do browser e não na inexistência geral da fonte.

## Correção candidata

### `75-startup2`

- dispositivos já emparelhados deixam de aguardar a rede para abrir a cópia local cifrada confirmada;
- `syncNow('startup-background')` continua a verificação remota em segundo plano;
- dispositivos ainda não emparelhados mantêm a barreira original;
- a guarda contra ecrã branco permanece ativa.

### Distribuição `75-catalog4`

- o resolvedor direto continua limitado a 8 s e a duas operações simultâneas;
- quando existe `sourceUrl` oficial exato, uma falha direta já não aciona novamente o resolvedor legado, que repetia pesquisa/leitura/preflight;
- pesquisa livre sem `sourceUrl` continua a usar o bridge legado;
- validação exata por retalhista e PID permanece obrigatória.

### `75-photo-loader3`

- prioriza até 8 cartões, com equilíbrio entre Pingo Doce e Continente;
- após 7 s passa para **A validar fotografia…**;
- após 12 s sem resultado termina em estado estável **Sem fotografia**, em vez de spinner/validação infinita;
- um cartão estabilizado só volta a tentar automaticamente após 5 min, ou mediante atualização explícita/nova navegação;
- imagens Pingo Doce encontradas no cache ou resolvidas passam a marcar o SKU correspondente como `ready` na biblioteca dedicada;
- o contador Pingo Doce é atualizado após essa reconciliação;
- a revisão nova repõe uma vez o orçamento diário de imagens herdado do runtime anterior.

## QA

Branch CI run `34445844039`: sucesso completo. Passaram sonda real de fontes, sintaxe, finanças, auditoria, contagem, isolamento/cofre, datas, faturas/QR, Mercado, imagens, catálogo visual, Pingo Doce, loader, segurança, responsividade, viewport móvel, navegação, acessibilidade, sincronização e manifest.

## Estado atual

A correção está validada em CI na branch, mas ainda não está declarada publicada neste ficheiro. Antes da integração deve ser confirmado `behind 0`; depois é obrigatório fast-forward sem force, CI de `main`, GitHub Pages e revalidação física no mesmo iPhone.

## Próximo passo

1. comparar branch com `main` e confirmar `behind 0`;
2. integrar por fast-forward sem force;
3. confirmar CI de `main` e Pages;
4. no iPhone medir tempo PIN → shell;
5. no Mercado manter a página aberta por 30–60 s, verificar que nenhum cartão fica eternamente em validação e confirmar que o contador Pingo Doce começa a refletir fotografias realmente resolvidas.
