# Arquitetura — Conta de Casa

## Visão geral

Aplicação web estática/PWA distribuída por GitHub Pages, sem backend próprio. A aplicação é local-first e utiliza JavaScript no cliente para regras de negócio, renderização, formulários, persistência cifrada e sincronização opcional.

## Camadas principais

### Interface

- `index.html`: estrutura semântica das páginas, navegação, diálogos e controlos.
- `styles.css`: estilos históricos/base e regras responsivas legadas.
- `design-system.css`: tokens, componentes e sistema visual principal.
- `mobile-layout.css`: camada de compatibilidade carregada por último para estabilidade do viewport mobile e ajustes específicos validados em iPhone.

Ordem CSS pública:

1. `styles.css`
2. `design-system.css`
3. `mobile-layout.css`

### JavaScript

- `core.js`: estado base, utilitários, cifragem/persistência e definições globais.
- `finance.js`: cálculos e regras financeiras.
- `render.js`: renderização das páginas e componentes.
- `forms.js`: formulários e validações.
- `sync.js`: sincronização cifrada opcional via GitHub privado.
- `events.js`: eventos, navegação, métricas de viewport e interação.

## Viewport e navegação mobile

O corpo da aplicação mantém um contentor de scroll próprio no mobile. O shell permanente usa unidades CSS dinâmicas (`dvh`/`svh`). `window.visualViewport` continua disponível em `events.js`, mas deve ser usado apenas para situações transitórias, nomeadamente teclado virtual e posicionamento de diálogos.

A navegação inferior é fixa e contém quatro destinos principais. O menu completo é apresentado através de drawer.

## Dados e segurança

- Persistência principal: IndexedDB.
- Estado financeiro cifrado antes de armazenamento.
- Derivação de chave: PBKDF2-SHA-256.
- Cifragem: AES-GCM 256.
- PIN/palavra-passe não é armazenado.
- Backups são cifrados.
- Sincronização é opcional, desativada por defeito e usa repositório GitHub privado configurado pelo utilizador.
- CSP restringe origens e impede carregamento arbitrário de recursos externos.

## Distribuição

`scripts/prepare-pages.cjs` cria `dist/` exclusivamente a partir de uma allowlist de assets públicos. O workflow de Pages só publica uma revisão depois da conclusão bem-sucedida do CI.

O Service Worker (`sw.js`) mantém cache offline apenas dos assets públicos autorizados.

## Regra de manutenção

Alterações de layout não devem modificar cálculos, schema, cifragem ou sincronização. Mudanças no conjunto de assets públicos devem ser refletidas simultaneamente em `index.html`, `scripts/prepare-pages.cjs`, `sw.js` e testes de regressão.
