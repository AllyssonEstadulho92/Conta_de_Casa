# TODO — Conta de Casa

## P0 — validação imediata

- [x] Confirmar CI da build v51 com `market-experience.css` e `market-experience.js`.
- [x] Confirmar publicação do GitHub Pages após CI.
- [ ] Validar no iPhone/Safari que Compras percorre todos os cartões sem corte ou grande área vazia.
- [ ] Validar o novo ecrã **Adicionar produto** em 320, 375, 390 e 430 px: header, pesquisa, tabs, mercados, cartões, comparação, botões e scroll.
- [ ] Confirmar que notch/Dynamic Island e home indicator não tapam o ecrã `market-browser`.
- [ ] Abrir e fechar o teclado na pesquisa e confirmar que o diálogo recupera a altura corretamente.
- [ ] Validar Faturas, Início, Relatórios e definições para confirmar ausência de regressões visuais fora de Mercado.
- [ ] Testar rotação retrato/paisagem e regresso a retrato.

## P1 — robustez de UI

- [ ] Validar o protótipo em tablet e desktop, incluindo redimensionamento e ausência de scroll horizontal.
- [ ] Criar testes de browser real para Safari/iOS quando existir infraestrutura adequada.
- [ ] Consolidar regras mobile duplicadas existentes em `styles.css` e `design-system.css` depois da validação física.
- [ ] Rever a aplicação inteira para localizar texto legado abaixo de 12 px sem alterar páginas de forma não validada.
- [ ] Confirmar contraste, foco, navegação por teclado e alvos tácteis em todos os controlos após consolidação CSS.

## P1 — preços reais de mercados

- [ ] Confirmar fontes verificadas para Pingo Doce, Continente e Mercadona; não ativar valores automáticos enquanto uma cadeia não tiver origem fiável.
- [ ] Definir backend/proxy de preços separado da PWA estática.
- [ ] Definir modelo de produto por EAN/GTIN, embalagem, unidade, quantidade e equivalências.
- [ ] Guardar origem, mercado, região/loja, data/hora do preço, preço normal, promoção e validade/cache.
- [ ] Definir comportamento quando um ou mais mercados estiverem indisponíveis.
- [ ] Rever CORS, CSP, segurança, privacidade e termos de utilização antes de permitir chamadas externas.
- [ ] Só depois substituir os dados de demonstração do `market-browser` por dados reais auditáveis.

## P2 — manutenção

- [ ] Avaliar remoção gradual de blocos CSS antigos que já estejam totalmente substituídos pelo design system.
- [ ] Depois da validação do protótipo, decidir se `market-experience.css` deve continuar isolado ou ser consolidado no design system.
- [ ] Manter documentação de arquitetura, decisões e estado atualizada a cada alteração importante.
