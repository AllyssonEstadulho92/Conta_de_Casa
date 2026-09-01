# Privacidade — Conta de Casa

A versão atual é **local-first**. Não possui backend próprio, conta na cloud, publicidade nem telemetria financeira.

## Onde ficam os dados
Os dados introduzidos ficam no armazenamento do navegador associado à origem onde a aplicação é aberta/instalada. O estado financeiro é guardado em IndexedDB dentro de um payload cifrado.

## GitHub
O repositório contém código e documentação. Não deve receber faturas reais, valores pessoais, backups, anexos privados, tokens, palavras-passe ou chaves.

## Backup
O backup exportado contém dados cifrados e metadados necessários para os restaurar. Continua a depender da palavra-passe/PIN do cofre.

## Limitações
- limpar os dados do navegador pode apagar o cofre local;
- outro dispositivo não recebe automaticamente os dados;
- perder simultaneamente palavra-passe e backups pode tornar os dados irrecuperáveis;
- não existe sincronização bancária nesta versão.

## Recomendação
Faça backups cifrados regularmente e guarde-os fora do repositório GitHub.
