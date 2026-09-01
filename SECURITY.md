# Segurança - Conta de Casa

Esta aplicação está em fase de hardening. Ela reduz riscos para uso local, mas não declara segurança absoluta e ainda não deve ser tratada como cofre definitivo para faturas reais sem a validação final indicada abaixo.

## Regra obrigatória de confidencialidade

Nenhum dado financeiro, pessoal, fatura, referência, comprovativo, anexo, histórico, valor, fornecedor ou informação de autenticação deve ser transmitido, registado, sincronizado, incluído em URL, enviado para telemetria, guardado em GitHub ou exposto a terceiros sem autorização explícita do utilizador.

## Implementado

- arquitetura local-first, sem backend próprio;
- estado financeiro guardado no IndexedDB dentro de payload cifrado;
- AES-GCM 256 para dados em repouso;
- PBKDF2-SHA-256 com 250 000 iterações;
- salt aleatório de 16 bytes e IV aleatório por gravação;
- IDs gerados com `crypto.randomUUID()` ou `crypto.getRandomValues()`;
- sanitização/escaping antes de renderizar dados do utilizador;
- histórico de atividade sem nomes, valores, fornecedores ou referências;
- guardas contra escrita sensível em `localStorage` e `sessionStorage`;
- CSP por `meta` compatível com GitHub Pages, bloqueando scripts externos e ligações externas;
- service worker limitado a assets públicos conhecidos;
- bloqueio automático por inatividade e ao perder foco;
- destruição das referências da chave e do estado em memória ao bloquear;
- backup cifrado v2 com validação de versão, estrutura e integridade SHA-256 antes do restauro;
- exportação JSON financeira em claro bloqueada;
- estrutura reservada para anexos cifrados, com anexos reais bloqueados até a cifragem de ficheiros estar concluída;
- testes para senha errada, payload adulterado, backup inválido/corrompido, XSS, persistência cifrada e cálculos financeiros.

## Limites do modelo

A proteção cobre principalmente dados em repouso no navegador e redução de exposição acidental. Ela não substitui segurança do sistema operativo, gestão de dispositivos, backups protegidos, antivírus, extensões confiáveis e higiene de palavra-passe.

Riscos residuais:

- malware, extensões maliciosas ou um navegador comprometido podem ler dados enquanto o cofre está desbloqueado;
- a CSP via `meta` é mais limitada do que headers HTTP dedicados;
- a palavra-passe/PIN fraca continua a ser um risco, apesar do PBKDF2;
- backups cifrados dependem da proteção da palavra-passe;
- anexos reais continuam bloqueados porque a cifragem dedicada de ficheiros ainda não foi implementada;
- ainda falta uma auditoria manual num navegador real antes de recomendar dados financeiros reais.

## Antes de usar faturas reais

Recomenda-se só introduzir faturas reais quando estes pontos estiverem concluídos:

- revisão manual da app publicada em GitHub Pages;
- teste de restauro com backup cifrado v2;
- confirmação de que DevTools/console não recebem dados sensíveis;
- validação em mobile e desktop após bloqueio, reload e modo offline;
- cifragem individual de anexos caso PDFs/fotos/comprovativos venham a ser permitidos.

## Desenvolvimento

Nunca colocar dados reais, tokens, backups, anexos privados, palavras-passe ou chaves no repositório. Qualquer nova dependência deve ser justificada, auditada e preferencialmente evitada.
