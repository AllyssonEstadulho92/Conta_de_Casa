# TODO — Conta de Casa

Atualizado: 10 de setembro de 2026

## P0 — Invariantes

- [x] Manter `STATE_VERSION = 5`, IndexedDB financeiro e valores em cêntimos.
- [x] Preservar PBKDF2-SHA-256 + AES-GCM.
- [x] Manter `PBKDF2_ITERATIONS = 250000`.
- [x] Não alterar cálculos, faturas, pagamentos, QR, scanner ou sincronização cifrada por causa dos sintomas atuais.

## P0 — Lentidão após PIN

- [x] Inspecionar o fluxo real do desbloqueio.
- [x] Confirmar que `unlockVault()` é seguido por `enterApp()` e por `syncStartupGate()`.
- [x] Confirmar que o gate remoto pode prolongar a abertura de um dispositivo já emparelhado.
- [x] Criar `75-startup2` sem reduzir a força do PIN.
- [x] Abrir a cópia local confirmada sem esperar pela rede quando `pairedAt + lastRemoteSha` existem.
- [x] Continuar `syncNow('startup-background')` após abrir o shell.
- [x] Manter primeiro emparelhamento no gate original.
- [x] Adicionar regressão de segurança/arranque.

## P0 — Fotografias sem estabilização

- [x] Confirmar que `75-photo-loader2` não tinha estado terminal visual.
- [x] Criar `75-photo-loader3`.
- [x] Usar carregar → validar → estado final estável.
- [x] Terminar em **Sem fotografia** após 12 s sem resultado.
- [x] Aplicar cooldown antes de retry automático.
- [x] Permitir retry por atualização explícita/nova navegação.
- [x] Aumentar prioridade visível para 8 cartões com equilíbrio entre as duas lojas.
- [x] Manter SKU visível mesmo sem imagem.

## P0 — Pingo Doce em 0 fotografias

- [x] Verificar fonte real, CORS e imagem oficial conhecida.
- [x] Reproduzir no CI o validador do runtime.
- [x] Confirmar `pid 739490` com `runtime-safe=true`.
- [x] Concluir que não existe rejeição universal das URLs Pingo Doce.
- [x] Reconciliar imagem Pingo Doce do cache partilhado com `imageState='ready'` da DB dedicada.
- [x] Atualizar a métrica dedicada após reconciliação.
- [x] Repôr uma vez o orçamento de imagens ao entrar em `75-photo-loader3`.

## P0 — Resolver redundante

- [x] Identificar fallback do resolvedor direto para o bridge legado.
- [x] Criar distribuição `75-catalog4`.
- [x] Quando existe `sourceUrl` exata, terminar após uma tentativa direta limitada.
- [x] Preservar bridge legado para pesquisa livre sem `sourceUrl`.
- [x] Preservar validação host/path/PID.
- [x] Adicionar teste que impede regressão para dupla resolução.

## P0 — QA da branch

- [x] Sonda real das fontes.
- [x] Sintaxe.
- [x] Finanças e invariantes.
- [x] Isolamento/cofre.
- [x] Faturas/QR.
- [x] Mercado e imagens.
- [x] Catálogo visual.
- [x] Biblioteca Pingo Doce.
- [x] Loader.
- [x] Segurança.
- [x] Responsividade e viewport móvel.
- [x] Navegação e acessibilidade.
- [x] Sincronização e conflitos.
- [x] Manifest.
- [x] CI branch run `34445844039` verde.

## P0 — Documentação

- [x] Atualizar `PROJECT_STATE.md`.
- [x] Atualizar `ARCHITECTURE.md`.
- [x] Atualizar `DECISIONS.md`.
- [x] Atualizar `TODO.md`.
- [x] Atualizar `CHANGELOG.md`.

## P0 — Integração/publicação

- [ ] Reconfirmar CI depois do commit documental.
- [ ] Comparar `fix/v75-pin-images-stability` com `main` e exigir `behind 0`.
- [ ] Integrar por fast-forward sem force.
- [ ] Confirmar CI completo de `main`.
- [ ] Confirmar GitHub Pages no mesmo SHA testado.
- [ ] Atualizar documentação com SHA/runs de publicação.

## P1 — Revalidação física iPhone/Safari/PWA

- [ ] Medir tempo entre toque em desbloquear e shell visível.
- [ ] Confirmar que o PIN não espera vários segundos pela rede num dispositivo já emparelhado.
- [ ] Confirmar que sincronização continua a ocorrer depois de entrar.
- [ ] Abrir Mercado durante 30–60 s.
- [ ] Confirmar que cartão sem imagem termina em **Sem fotografia** e não fica eternamente a validar.
- [ ] Filtrar Pingo Doce e confirmar que fotografias válidas começam a incrementar a métrica dedicada.
- [ ] Confirmar ausência de PID trocado.
- [ ] Confirmar Continente sem regressão.
- [ ] Confirmar ausência de flicker do renderer `75-catalog3`.
- [ ] Confirmar valores financeiros idênticos antes/depois.

## P2 — Consolidação

- [ ] Depois da validação física, consolidar as camadas de imagem se profiling mostrar duplicação residual.
- [ ] Avaliar diagnóstico por loja: imagens partilhadas Continente/Pingo Doce separadamente.
- [ ] Remover código histórico apenas com prova de ausência de referências.
