# Validação presencial — iPhone / Safari / Conta de Casa

Estado: **pendente de execução num iPhone físico do utilizador**. Os testes automáticos e a simulação em navegador não equivalem a esta validação.

## Preparação sem risco

1. Confirmar que existe um backup cifrado recente, recuperável, antes de experimentar novas funções.
2. Abrir a página pública por HTTPS no Safari, verificar a versão em **Mais → Sobre a aplicação** e confirmar que não aparece atualização pendente.
3. **Não limpar dados do Safari, não recriar PIN e não reinstalar a PWA** para tentar resolver um problema de interface sem preservar o cofre.
4. Para testes com faturas reais, ocultar NIF, morada e referências em capturas de ecrã partilhadas com terceiros.

## Cenários manuais (anotar data, modelo de iPhone, iOS e resultado)

| Cenário | Ação | Resultado esperado |
| --- | --- | --- |
| Abertura e PIN | Safari e PWA instaladas, desbloqueio com PIN válido | Cofre abre sem loop nem perda de dados. |
| Face ID | Testar apenas se configurado no dispositivo | Autenticação funciona ou apresenta alternativa PIN, sem inventar sucesso. |
| Menu e notificações | Início, Plano, Contas, Relatórios, Mais | Rodapé coerente, sem hambúrguer redundante e sem sinos duplicados. |
| Saudações | Alterar período do dia e regressar à página | Bom dia / Boa tarde / Boa noite conforme hora local. |
| Calendário | Avançar e recuar meses, abrir dias com faturas | Datas, contas e totais mantêm padrão visual, sem valores trocados. |
| QR na câmara | Registar fatura → QR Code; permitir a câmara | Câmara abre e liberta a utilização após fechar. QR AT válido preenche campos compatíveis. |
| QR por fotografia | Registar fatura → Ler fatura → fotografia com QR | QR é lido e valor, descrição e referência são sugeridos. |
| OCR de texto | Ler fatura → Ler texto da fotografia (OCR) | Motor é descarregado na primeira utilização, imagem é reconhecida localmente e os campos identificados são sugeridos. |
| Fotografia pouco legível | Imagem desfocada ou sem total | Mensagem honesta, sem números inventados; entrada manual continua disponível. |
| Revisão | Conferir valor, fornecedor, categoria, vencimento | Guardar só depois de revisão; dados de imagem não são guardados. |
| Pagamento e extrato | Registar pagamento e consultar Relatórios no mês | Pagamento aparece na lista e no CSV, com a soma correta em cêntimos. |
| Compras | Registar compra com quantidade e preço estimado | Extrato mostra custo total e identifica estimativa. |
| CSV no iOS | Relatórios → Exportar CSV → Ficheiros/Partilha | Ficheiro legível em Numbers/Excel, com vírgula decimal e acentos. |
| Segurança | Bloquear, voltar a abrir, reiniciar Safari | Dados continuam cifrados e só aparecem após desbloqueio. |
| Sem rede | Após abrir previamente a aplicação, desativar a rede | Navegação e dados já existentes utilizáveis; OCR pode necessitar de rede na primeira utilização. |

## Critério de aceitação

Marcar cada cenário como **Passou**, **Falhou** ou **Não testado**, anexar apenas dados não sensíveis e registar modelo de iPhone e versão de iOS. Falhas de QR, OCR, Face ID, armazenamento ou partilha devem manter o respetivo item **pendente** até confirmação no dispositivo.
