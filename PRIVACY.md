# Privacidade - Conta de Casa

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
