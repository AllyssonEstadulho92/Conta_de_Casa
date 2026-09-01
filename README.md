# Conta de Casa

Aplicação local-first para controlo doméstico de faturas, pagamentos, rendimentos, mercado, objetivos e relatórios mensais.

## Estado

Projeto em fase inicial com hardening de segurança. Não é versão 1.0 e não deve ser tratado como garantia de segurança absoluta.

## Privacidade por desenho

- sem backend próprio;
- sem contas online;
- sem analytics, anúncios, trackers ou CDNs;
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
node --check events.js
node --check sw.js
node tests/finance.test.cjs
node tests/form-regression.test.cjs
node tests/security.test.cjs
```
