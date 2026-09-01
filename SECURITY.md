# Segurança — Conta de Casa

## Implementado
- AES-GCM 256 para cifragem do estado financeiro;
- PBKDF2-SHA-256 com 250 000 iterações;
- salt aleatório de 16 bytes;
- IV aleatório em cada gravação;
- palavra-passe verificada através de conteúdo cifrado;
- chave apenas em memória durante a sessão;
- bloqueio automático por inatividade;
- modo de privacidade;
- backup/restauro cifrado;
- sem segredos embutidos no código.

## Limites do modelo
A v0.1.0 protege principalmente dados em repouso contra leitura direta casual. Não substitui a segurança do sistema operativo. Malware, extensões maliciosas, um browser já desbloqueado ou execução de código arbitrário na origem podem contornar proteções locais.

## Desenvolvimento
Nunca colocar dados reais, tokens ou chaves no repositório. Rever qualquer nova dependência antes de a introduzir.
