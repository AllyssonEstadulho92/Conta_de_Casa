# Conta de Casa v76 — auditoria de estabilidade

## Objetivo

Consolidar a aplicação numa arquitetura previsível, com uma autoridade por responsabilidade, preservando integralmente o domínio financeiro, os valores em cêntimos, IndexedDB, cofre/PIN, sincronização, Mercado, QR e scanner.

## Problemas confirmados

1. **Menu móvel com duas autoridades de runtime**
   - `mobile-menu-toggle.js` controla abertura/fecho, foco, swipe e posição do botão.
   - `src/ui/veggie-menu-toggle.ts` observa o mesmo controlo, substitui o glyph e move novamente o botão.
   - Resultado possível: posição divergente, estado visual fora de sincronia com `aria-expanded` e comportamento diferente entre Safari/PWA e browser.

2. **Fluxo de despesas com duas camadas de composição**
   - `v75-architecture.js` cria os modos Manual / Ler fatura / QR Code.
   - `invoice-capture.js` injeta uma superfície estática de leitura QR.
   - O texto da superfície não muda de acordo com o modo selecionado; por isso “Ler fatura” pode apresentar linguagem de “QR Code”, criando duplicação conceptual.

3. **Excesso de folhas de estilo sobrepostas**
   - O bundle público carrega base CSS, camadas v75 e camadas v76 em cascata.
   - Algumas páginas ainda dependem de `!important` e ocultação de elementos base para criar uma segunda composição.
   - A consolidação deve ser incremental para não quebrar funcionalidades.

4. **Navegação e páginas precisam de uma hierarquia estável**
   - A navegação principal mobile deve continuar rasa: Início, Despesas, Mercado, Planeamento e Mais.
   - O drawer deve conter destinos secundários sem duplicar controladores.
   - Mercado deve manter um caminho visível para adicionar produtos.
   - Despesas deve manter faturas/listas e criação acessíveis.

## Ordem de correção

1. Retirar a segunda autoridade do menu móvel.
2. Tornar Manual / Ler fatura / QR Code estados funcionais coerentes e acessíveis, sem ações automáticas inesperadas ao trocar de modo.
3. Consolidar a visibilidade das páginas Despesas e Mercado sobre os contentores funcionais canónicos.
4. Reduzir CSS duplicado e `!important` apenas depois de existir cobertura de regressão para cada página.
5. Rever as 10 rotas em mobile/desktop e manter CI, TypeScript e Pages obrigatoriamente verdes após cada bloco.

## Limites de integridade

Não alterar:
- `finance.js` e aritmética em cêntimos;
- estado/persistência/IndexedDB;
- cofre/PIN/Web Crypto;
- sincronização e resolução de conflitos;
- regras contabilísticas do Mercado;
- parsing QR da AT;
- scanner e política de imagens oficiais.
