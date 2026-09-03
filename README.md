# Conta de Casa

Aplicação local-first para controlo doméstico de faturas, pagamentos, rendimentos, mercado, objetivos e relatórios mensais.

Versão preparada: v50. O schema de dados permanece na versão 5; esta fase mantém a aplicação em GitHub Pages e uniformiza os controlos de ação no mobile, com botões de adicionar compactos e estado de sincronização em formato pill, sem alterar dados, cálculos ou persistência.

## Estado

Projeto em fase inicial com hardening de segurança. Não é versão 1.0 e não deve ser tratado como garantia de segurança absoluta.

## Privacidade por desenho

- sem backend próprio;
- sem conta própria da aplicação;
- sem analytics, anúncios, trackers ou CDNs;
- sincronização opcional apenas por envelope cifrado num repositório GitHub privado;
- dados financeiros cifrados em repouso no IndexedDB;
- `localStorage` e `sessionStorage` bloqueados para dados sensíveis;
- backups sempre cifrados e validados;
- anexos reais bloqueados até existir cifragem individual de ficheiros.

## Segurança

Leia `SECURITY.md` antes de usar dados reais. A recomendação atual é validar a app publicada, testar backup/restauro e concluir a cifragem de anexos antes de introduzir faturas reais ou comprovativos.

## Desenvolvimento

Validação local:

```bash
node --check core.js
node --check finance.js
node --check render.js
node --check forms.js
node --check sync.js
node --check events.js
node --check sw.js
node tests/finance.test.cjs
node tests/audit.test.cjs
node tests/counting-invariants.test.cjs
node tests/isolation.test.cjs
node tests/form-regression.test.cjs
node tests/security.test.cjs
node tests/sync.test.cjs
node tests/sync-runtime.test.cjs
```


## Sincronização entre dispositivos

A sincronização automática é opcional, começa desativada em cofres novos e, quando utilizada, exige que cada utilizador indique o seu próprio repositório GitHub privado.

- o conteúdo financeiro é cifrado antes do envio;
- o PIN/palavra-passe nunca é enviado;
- o token GitHub fica cifrado localmente em cada dispositivo;
- a aplicação recusa repositório de sincronização público;
- a sincronização ocorre ao desbloquear, após alterações, ao regressar online/visível e periodicamente;
- conflitos reais são comparados campo a campo e exigem escolha explícita entre a versão deste dispositivo e a versão sincronizada;
- o resultado escolhido só é enviado depois de todas as decisões, com proteção contra gravações concorrentes;
- eliminações são propagadas através de tombstones cifrados.


## Isolamento por utilizador

- um cofre novo começa sem faturas, pagamentos, rendimentos, compras, objetivos, histórico ou saldo;
- o PIN/palavra-passe não é guardado no repositório nem no IndexedDB;
- cada cofre recebe um salt aleatório próprio e deriva uma chave AES-GCM não exportável através de PBKDF2-SHA-256;
- o estado financeiro completo é cifrado antes de ser escrito no IndexedDB;
- a sincronização começa desligada e não contém proprietário/repositório pré-definido;
- abrir a mesma GitHub Page noutro navegador/dispositivo cria outro armazenamento local independente até existir importação ou sincronização explícita.
