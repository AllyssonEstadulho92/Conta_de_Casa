# Changelog

## 0.1.1-hardening — em proposta

### Segurança
- regra explícita de confidencialidade para dados financeiros e pessoais;
- CSP compatível com GitHub Pages;
- eliminação de CDNs, trackers e chamadas externas na auditoria de assets;
- IDs com aleatoriedade criptográfica;
- sanitização/escaping centralizado antes de renderizar dados do utilizador;
- histórico de atividade sem nomes, valores, fornecedores ou referências;
- guardas contra dados sensíveis em localStorage/sessionStorage;
- bloqueio automático reforçado por inatividade e perda de foco;
- limpeza de chave, estado e UI sensível ao bloquear;
- backup cifrado v2 com validação de versão, estrutura e integridade;
- restauro bloqueia backups inválidos, corrompidos ou adulterados;
- service worker restrito a cache de assets públicos;
- anexos reais bloqueados até cifragem individual de ficheiros.

### Testes
- senha errada;
- payload adulterado;
- backup inválido/corrompido;
- XSS/escaping;
- persistência cifrada após reload;
- auditoria de assets externos e cache;
- cálculos financeiros existentes.

## 0.1.0 — 2026-09-01

Primeira versão utilizável da Conta de Casa.

### Incluído
- interface responsiva clara;
- PWA e funcionamento offline;
- cofre local cifrado;
- dashboard mensal;
- faturas e pagamentos parciais;
- estados e urgência automáticos;
- recorrências;
- calendário;
- planeamento e rendimentos;
- mercado;
- relatórios;
- objetivos;
- histórico de atividade;
- modo privacidade;
- backup/restauro cifrado;
- testes financeiros;
- CI e workflow de GitHub Pages.
