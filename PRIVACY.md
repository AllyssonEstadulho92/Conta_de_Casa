# Privacidade - Conta de Casa


A documentação oficial do GitHub confirma que o **GitHub Pages é publicamente acessível mesmo quando o repositório de origem é privado** (salvo controlo de acesso específico disponível em certos ambientes Enterprise). A privacidade do repositório e a privacidade do site são duas decisões distintas. Fonte: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## Proteção reforçada para utilização pessoal (proposta de 30/10/2026)

O repositório de código é **público**. Isso permite ver o código-fonte e eventuais nomes ou exemplos que estejam escritos nele, mas não dá acesso automático ao IndexedDB cifrado de outro perfil de navegador. A GitHub Page também é acessível publicamente: **não existe autenticação do servidor**. A confidencialidade dos dados reais depende da cifra do cofre, da palavra-passe e da segurança do dispositivo.

A proposta `hardening/personal-privacy-20261030` acrescenta um ecrã de proteção visual quando o browser passa a segundo plano e uma barreira de desenvolvimento contra o envio acidental de backups e credenciais. A proteção visual não garante que o sistema operativo não faça uma captura antes do evento de ocultação. Nenhum software web consegue impedir todas as fotografias, capturas de ecrã, extensões maliciosas ou acesso por outra pessoa a um dispositivo já desbloqueado.

O Mercado pode consultar os serviços externos `cesta.pt` e Open Food Facts e carregar imagens do catálogo. Esses pedidos técnicos podem revelar o endereço IP e os termos/produtos consultados aos respetivos serviços, mesmo sem transmitir os dados financeiros cifrados. Para evitar esses pedidos, não utilizar pesquisa/atualização online de produtos. A sincronização privada com GitHub permanece opcional e desativada por defeito.

**Não adicionar** faturas, extratos, comprovativos, valores reais, PIN ou backups ao código GitHub nem a testes. O comando `npm run privacy:check` verifica nomes de ficheiros e alguns padrões de credenciais rastreados pelo Git, mas não deteta todos os dados pessoais nem elimina conteúdo já publicado no histórico.

Antes de considerar a aplicação estritamente privada, avaliar com o proprietário a migração do código para um repositório privado e um alojamento com controlo de acesso. **Não alterar a visibilidade do repositório sem confirmar o impacto no GitHub Pages e preservar uma cópia de segurança**.


A Conta de Casa é local-first: os dados financeiros ficam no navegador/dispositivo onde a aplicação é aberta ou instalada. Não existe conta online, backend próprio, publicidade, analytics ou telemetria financeira. A sincronização opcional usa apenas um envelope cifrado no repositório privado configurado.

## Dados que não devem sair do dispositivo

Faturas, valores, fornecedores, referências, observações, pagamentos, rendimentos, objetivos, lista de mercado, backups, comprovativos, anexos, palavras-passe e chaves não devem ser enviados para terceiros, GitHub, logs, URLs ou ferramentas de telemetria.

## Onde ficam os dados

O estado financeiro fica no IndexedDB da origem da aplicação, cifrado em repouso com AES-GCM. `localStorage` e `sessionStorage` não são usados para dados financeiros e a aplicação bloqueia tentativas de escrita sensível nesses armazenamentos.

## GitHub

O repositório público `Conta_de_Casa` deve conter apenas código, documentação, workflows e assets públicos. Nunca guardar nele:

- faturas reais;
- valores pessoais;
- backups exportados em claro ou backups pessoais manuais;
- anexos privados;
- tokens, palavras-passe, PINs ou chaves.

## Backup

O backup exportado é um envelope JSON cifrado. Ele contém metadados criptográficos, payload cifrado e checksum de integridade. Não exportar JSON financeiro em claro.

O restauro aceita apenas backups com versão, estrutura e integridade válidas. Depois do restauro, a palavra-passe do backup continua necessária para desbloquear o cofre.

## Limitações

- limpar dados do navegador pode apagar o cofre local;
- outro dispositivo só recebe dados automaticamente depois de configurar explicitamente a sincronização cifrada nesse dispositivo;
- perder simultaneamente palavra-passe e backups pode tornar os dados irrecuperáveis;
- dados visíveis enquanto o cofre está desbloqueado dependem da segurança do navegador e do dispositivo;
- anexos reais ainda não são permitidos.

## Recomendação

Faça backups cifrados regularmente e guarde-os fora do GitHub. Use uma palavra-passe longa e bloqueie a aplicação quando sair do dispositivo.


## Repositório privado de sincronização

A sincronização automática é opcional, começa desativada e só usa o repositório privado que o próprio utilizador configurar.

O repositório configurado pode conter somente o envelope cifrado da aplicação no caminho escolhido pelo utilizador. Não deve conter dados financeiros em texto legível, PIN, palavra-passe, token GitHub ou chave de cifragem.

O token de acesso não é enviado para o repositório; fica cifrado localmente em cada dispositivo. A aplicação valida que o repositório é privado antes de ativar a sincronização.


## Separação entre utilizadores

Uma instalação nova da GitHub Page não contém dados financeiros pessoais do autor do projeto. O estado inicial é vazio.

Os dados são guardados no IndexedDB da origem, dentro do perfil do navegador que abriu a aplicação. Outro dispositivo ou outro perfil de navegador recebe um armazenamento independente. O PIN/palavra-passe não é guardado; apenas metadados criptográficos e o payload cifrado permanecem localmente.

Se várias pessoas utilizarem exatamente o mesmo perfil de navegador e a mesma origem, irão apontar para o mesmo cofre local. Para contas separadas no mesmo dispositivo, utilize perfis de navegador distintos.
