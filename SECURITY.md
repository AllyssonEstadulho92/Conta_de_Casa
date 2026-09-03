# Segurança - Conta de Casa

Esta aplicação está em fase de hardening. Ela reduz riscos para uso local, mas não declara segurança absoluta e ainda não deve ser tratada como cofre definitivo para faturas reais sem a validação final indicada abaixo.

## Regra obrigatória de confidencialidade

Nenhum dado financeiro, pessoal, fatura, referência, comprovativo, anexo, histórico, valor, fornecedor ou informação de autenticação pode ser transmitido em claro, incluído em URL, enviado para telemetria ou exposto a terceiros. A única exceção de rede autorizada é a sincronização opcional para o repositório GitHub privado configurado, contendo apenas o envelope cifrado.

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
- CSP por `meta` compatível com GitHub Pages, bloqueando scripts externos e permitindo apenas `self` e `https://api.github.com` para a sincronização cifrada;
- service worker limitado a assets públicos conhecidos;
- bloqueio automático por inatividade e ao perder foco;
- destruição das referências da chave e do estado em memória ao bloquear;
- backup cifrado v2 com validação de versão, estrutura e integridade SHA-256 antes do restauro;
- exportação JSON financeira em claro bloqueada;
- estrutura reservada para anexos cifrados, com anexos reais bloqueados até a cifragem de ficheiros estar concluída;
- testes para senha errada, payload adulterado, backup inválido/corrompido, XSS, persistência cifrada e cálculos financeiros.

## Isolamento entre utilizadores

Um novo navegador/origem sem cofre existente inicia com estado financeiro vazio. Não existe perfil, fatura, pagamento, saldo, compra ou histórico pré-carregado.

O PIN/palavra-passe não é armazenado. A aplicação gera um salt aleatório de 16 bytes para cada cofre e deriva uma chave AES-GCM 256 através de PBKDF2-SHA-256 com 250 000 iterações. A chave derivada é não exportável. Cada gravação cifrada usa um IV aleatório de 12 bytes.

O IndexedDB pertence à origem e ao perfil do navegador. Utilizadores em dispositivos ou perfis de navegador diferentes não partilham automaticamente dados. Num mesmo perfil de navegador e na mesma origem existe um único cofre local; para separar pessoas no mesmo dispositivo, use perfis de navegador diferentes.

A sincronização começa desativada e sem destino pré-configurado. Só depois de o utilizador indicar explicitamente o seu próprio repositório privado e credencial é permitido enviar um envelope cifrado.

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


## Sincronização automática cifrada

Quando ativada, a aplicação usa apenas `https://api.github.com` para ler/escrever `sync/vault.json` no repositório privado configurado.

O ficheiro remoto contém:
- metadados técnicos de revisão;
- envelope de backup cifrado validado;
- nenhum PIN, palavra-passe ou token.

O token GitHub é protegido localmente com uma chave AES-GCM não exportável guardada no IndexedDB do dispositivo. Deve ser um fine-grained token limitado ao repositório privado, com `Contents: Read and write`.

Riscos residuais adicionais:
- um token comprometido pode permitir substituir ou apagar o ficheiro cifrado remoto;
- conflitos simultâneos podem exigir intervenção manual;
- a segurança continua dependente da conta GitHub, do dispositivo e do navegador.
