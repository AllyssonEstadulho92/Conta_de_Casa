# Privacidade - Conta de Casa

A Conta de Casa é local-first: os dados financeiros ficam no navegador/dispositivo onde a aplicação é aberta ou instalada. Não existe conta online, backend próprio, publicidade, analytics, telemetria financeira ou sincronização em cloud nesta fase.

## Dados que não devem sair do dispositivo

Faturas, valores, fornecedores, referências, observações, pagamentos, rendimentos, objetivos, lista de mercado, backups, comprovativos, anexos, palavras-passe e chaves não devem ser enviados para terceiros, GitHub, logs, URLs ou ferramentas de telemetria.

## Onde ficam os dados

O estado financeiro fica no IndexedDB da origem da aplicação, cifrado em repouso com AES-GCM. `localStorage` e `sessionStorage` não são usados para dados financeiros e a aplicação bloqueia tentativas de escrita sensível nesses armazenamentos.

## GitHub

O repositório deve conter apenas código, documentação, workflows e assets públicos. Nunca guardar no GitHub:

- faturas reais;
- valores pessoais;
- backups exportados;
- anexos privados;
- tokens, palavras-passe, PINs ou chaves.

## Backup

O backup exportado é um envelope JSON cifrado. Ele contém metadados criptográficos, payload cifrado e checksum de integridade. Não exportar JSON financeiro em claro.

O restauro aceita apenas backups com versão, estrutura e integridade válidas. Depois do restauro, a palavra-passe do backup continua necessária para desbloquear o cofre.

## Limitações

- limpar dados do navegador pode apagar o cofre local;
- outro dispositivo não recebe automaticamente os dados;
- perder simultaneamente palavra-passe e backups pode tornar os dados irrecuperáveis;
- dados visíveis enquanto o cofre está desbloqueado dependem da segurança do navegador e do dispositivo;
- anexos reais ainda não são permitidos.

## Recomendação

Faça backups cifrados regularmente e guarde-os fora do GitHub. Use uma palavra-passe longa e bloqueie a aplicação quando sair do dispositivo.
