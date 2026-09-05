from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return (ROOT / path).read_text(encoding='utf-8')


def write(path, content):
    (ROOT / path).write_text(content, encoding='utf-8')


def replace_once(path, old, new, *, required=True):
    text = read(path)
    if new in text:
        return
    if old not in text:
        if required:
            raise RuntimeError(f'Expected text not found in {path}: {old[:80]!r}')
        return
    write(path, text.replace(old, new, 1))


def append_once(path, marker, block):
    text = read(path)
    if marker in text:
        return
    if not text.endswith('\n'):
        text += '\n'
    write(path, text + '\n' + block.strip() + '\n')


def insert_before_once(path, marker, unique_marker, block):
    text = read(path)
    if unique_marker in text:
        return
    if marker not in text:
        raise RuntimeError(f'Marker not found in {path}: {marker}')
    write(path, text.replace(marker, block.strip() + '\n\n' + marker, 1))


# 1) Semantics/copy: preserve credential model and existing actions, improve clarity.
replace_once(
    'index.html',
    '<div class="brand brand-large"><span class="brand-mark">⌂</span><div><strong>Conta de Casa</strong><small>O seu controlo financeiro privado</small></div></div>',
    '<div class="brand brand-large vault-brand"><span class="brand-mark">⌂</span><div><strong>Conta de Casa</strong><small>Finanças pessoais · cofre privado</small></div></div>'
)
replace_once(
    'index.html',
    '<h1>Introduza o seu PIN</h1>\n          <p>Acesso protegido e cifrado neste dispositivo.</p>',
    '<p class="vault-eyebrow">Acesso seguro</p>\n          <h1>Introduza o seu PIN</h1>\n          <p id="vaultUnlockHint">Cofre local encriptado. A chave permanece apenas durante esta sessão.</p>'
)
replace_once(
    'index.html',
    '<input id="unlockPassphrase" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" placeholder="○ ○ ○ ○ ○ ○ ○ ○" />',
    '<input id="unlockPassphrase" type="password" autocomplete="current-password" autocapitalize="off" spellcheck="false" aria-describedby="vaultUnlockHint" placeholder="○ ○ ○ ○ ○ ○ ○ ○" />'
)

# 2) Visual layer. It is appended to the last common UI stylesheet so it overrides
# older v45/mobile compatibility rules without changing business code.
VAULT_CSS = r'''
/* v56 — modern secure vault: visual-only redesign based on the approved iPhone reference. */
.vault-screen{
  position:relative;
  isolation:isolate;
  min-height:100svh;
  min-height:100dvh;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow-y:auto;
  padding:max(26px,env(safe-area-inset-top)) max(20px,env(safe-area-inset-right)) max(26px,env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-left));
  background:
    radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--primary) 12%,transparent),transparent 34%),
    radial-gradient(circle at 88% 84%,color-mix(in srgb,var(--success) 10%,transparent),transparent 30%),
    linear-gradient(180deg,color-mix(in srgb,var(--bg) 94%,#fff),var(--bg));
}
.vault-screen::before{
  content:"";
  position:fixed;
  z-index:-1;
  inset:0;
  pointer-events:none;
  opacity:.36;
  background-image:radial-gradient(circle at center,color-mix(in srgb,var(--primary) 14%,transparent) 1px,transparent 1px);
  background-size:28px 28px;
  mask-image:linear-gradient(to bottom,rgba(0,0,0,.42),transparent 52%);
}
.vault-card{
  width:min(100%,500px)!important;
  max-width:500px!important;
  min-height:0!important;
  margin:auto!important;
  padding:clamp(26px,4vw,38px)!important;
  border:1px solid color-mix(in srgb,var(--border) 78%,transparent)!important;
  border-radius:32px!important;
  background:color-mix(in srgb,var(--surface) 94%,transparent)!important;
  box-shadow:0 32px 80px rgba(20,35,60,.13),0 3px 14px rgba(20,35,60,.05)!important;
  backdrop-filter:blur(22px) saturate(1.08);
  -webkit-backdrop-filter:blur(22px) saturate(1.08);
}
.vault-card::after{display:none!important}
.vault-card .vault-brand{
  display:flex!important;
  flex-direction:row!important;
  align-items:center!important;
  justify-content:center!important;
  gap:12px!important;
  margin:0 0 24px!important;
  text-align:left!important;
}
.vault-card .vault-brand>div{text-align:left!important}
.vault-card .vault-brand .brand-mark{
  width:58px!important;
  height:58px!important;
  flex:0 0 58px!important;
  border:1px solid color-mix(in srgb,var(--primary) 24%,var(--border))!important;
  border-radius:20px!important;
  background:linear-gradient(145deg,color-mix(in srgb,var(--primary-2) 76%,var(--surface)),color-mix(in srgb,var(--success-bg) 38%,var(--surface)))!important;
  color:var(--primary)!important;
  box-shadow:0 12px 28px color-mix(in srgb,var(--primary) 14%,transparent)!important;
}
.vault-card .vault-brand .brand-mark .ui-icon-svg{width:25px!important;height:25px!important}
.vault-card .vault-brand strong{display:block;font-size:1.08rem;line-height:1.25;font-weight:700;letter-spacing:-.02em}
.vault-card .vault-brand small{display:block;margin-top:3px;font-size:.72rem;line-height:1.35;letter-spacing:.015em}

#vaultUnlock{gap:11px!important}
.vault-unlock-intro{gap:5px!important;margin-bottom:2px}
.vault-lock-badge{
  width:62px!important;
  height:62px!important;
  margin-bottom:5px;
  border:1px solid color-mix(in srgb,var(--primary) 22%,var(--border))!important;
  border-radius:22px!important;
  background:linear-gradient(145deg,color-mix(in srgb,var(--primary-2) 92%,var(--surface)),color-mix(in srgb,var(--success-bg) 34%,var(--surface)))!important;
  color:var(--primary)!important;
  box-shadow:0 14px 34px color-mix(in srgb,var(--primary) 13%,transparent)!important;
}
.vault-lock-badge svg{width:25px!important;height:25px!important;stroke-width:2!important}
.vault-eyebrow{
  margin:3px 0 1px!important;
  color:var(--muted)!important;
  font-size:.68rem!important;
  line-height:1.3!important;
  font-weight:700!important;
  letter-spacing:.16em!important;
  text-transform:uppercase;
}
.vault-unlock-intro h1{
  margin:0!important;
  font-size:clamp(1.8rem,5vw,2.2rem)!important;
  line-height:1.08!important;
  font-weight:700!important;
  letter-spacing:-.045em!important;
}
.vault-unlock-intro #vaultUnlockHint{
  max-width:360px;
  margin:3px auto 0!important;
  color:var(--muted)!important;
  font-size:.78rem!important;
  line-height:1.45!important;
}

.pin-entry-mode .vault-unlock-input-label{margin:4px 0 0!important}
.pin-entry-mode #unlockPassphrase{
  width:min(100%,300px)!important;
  min-height:52px!important;
  margin:0 auto!important;
  padding:0 8px 0 calc(8px + .32em)!important;
  border:1px solid color-mix(in srgb,var(--border) 90%,transparent)!important;
  border-radius:18px!important;
  background:color-mix(in srgb,var(--surface-2) 62%,var(--surface))!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 8px 22px rgba(20,35,60,.035)!important;
  color:var(--text)!important;
  text-align:center!important;
  font-size:1.45rem!important;
  font-weight:600!important;
  letter-spacing:.32em!important;
}
.pin-entry-mode #unlockPassphrase::placeholder{color:color-mix(in srgb,var(--muted) 65%,transparent)!important;letter-spacing:.09em!important}
.pin-entry-mode #unlockPassphrase:focus{border-color:color-mix(in srgb,var(--primary) 34%,var(--border))!important;box-shadow:0 0 0 4px var(--focus-ring)!important}

.vault-pin-pad{margin-top:1px!important}
.vault-keypad{
  width:min(100%,326px);
  margin-inline:auto;
  grid-template-columns:repeat(3,1fr)!important;
  gap:13px 18px!important;
}
.vault-key,.vault-key-spacer{
  width:70px!important;
  min-width:70px!important;
  height:70px!important;
  min-height:70px!important;
  justify-self:center;
}
.vault-key{
  border:1px solid color-mix(in srgb,var(--border) 86%,transparent)!important;
  border-radius:50%!important;
  background:linear-gradient(180deg,var(--surface),color-mix(in srgb,var(--surface-2) 52%,var(--surface)))!important;
  box-shadow:0 10px 24px rgba(20,35,60,.07),inset 0 1px 0 rgba(255,255,255,.72)!important;
  transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease,background .12s ease!important;
}
.vault-key strong{font-size:1.35rem!important;font-weight:600!important;line-height:1!important;letter-spacing:-.025em}
.vault-key small{min-height:11px!important;margin-top:4px;font-size:.52rem!important;line-height:1!important;font-weight:700;letter-spacing:.16em!important;color:var(--muted)!important}
.vault-key-delete{color:color-mix(in srgb,var(--muted) 82%,var(--text))!important;background:color-mix(in srgb,var(--surface-2) 72%,var(--surface))!important}
.vault-key-delete svg{width:22px!important;height:22px!important;stroke-width:2!important}
.vault-key:active{transform:scale(.96)!important;background:var(--primary-2)!important;border-color:color-mix(in srgb,var(--primary) 28%,var(--border))!important;box-shadow:0 4px 12px rgba(20,35,60,.05)!important}

.vault-enter-btn{
  min-height:52px!important;
  margin-top:6px!important;
  border:0!important;
  border-radius:16px!important;
  background:linear-gradient(135deg,var(--primary),color-mix(in srgb,var(--primary) 76%,var(--success)))!important;
  color:#fff!important;
  box-shadow:0 14px 30px color-mix(in srgb,var(--primary) 24%,transparent)!important;
  font-weight:700!important;
}
.vault-keyboard-toggle{
  min-height:48px!important;
  margin-top:0!important;
  border:1px solid color-mix(in srgb,var(--primary) 18%,var(--border))!important;
  border-radius:16px!important;
  background:color-mix(in srgb,var(--surface) 86%,var(--primary-2))!important;
  color:var(--primary)!important;
  box-shadow:none!important;
}
.vault-transfer{margin-top:14px!important;padding-top:2px;border-top:1px solid color-mix(in srgb,var(--border) 65%,transparent)}
.vault-disclosure{
  margin-top:8px;
  padding:12px 13px!important;
  border:1px solid color-mix(in srgb,var(--border) 80%,transparent)!important;
  border-radius:15px!important;
  background:color-mix(in srgb,var(--surface-2) 44%,var(--surface))!important;
}
.vault-disclosure strong{font-size:.79rem!important}
.vault-disclosure small{font-size:.68rem!important}
.vault-card .privacy-note{
  display:block;
  max-width:360px;
  margin:13px auto 0!important;
  color:var(--muted)!important;
  text-align:center;
  font-size:.66rem!important;
  line-height:1.45!important;
}
.vault-card .form-message{text-align:center}

[data-theme="dark"] .vault-screen{
  background:
    radial-gradient(circle at 12% 8%,color-mix(in srgb,var(--primary) 12%,transparent),transparent 34%),
    radial-gradient(circle at 88% 84%,color-mix(in srgb,var(--success) 9%,transparent),transparent 30%),
    linear-gradient(180deg,#0b111b,var(--bg));
}
[data-theme="dark"] .vault-card{background:color-mix(in srgb,var(--surface) 92%,transparent)!important;box-shadow:0 32px 80px rgba(0,0,0,.36)!important}
[data-theme="dark"] .vault-key{box-shadow:0 10px 24px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.035)!important}

@media(hover:hover) and (pointer:fine){
  .vault-key:hover{transform:translateY(-2px);border-color:color-mix(in srgb,var(--primary) 26%,var(--border))!important;box-shadow:0 14px 28px rgba(20,35,60,.10)!important}
  .vault-enter-btn:hover{filter:brightness(1.03)}
}

@media(max-width:820px){
  .vault-screen{
    align-items:flex-start!important;
    padding:max(18px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(22px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))!important;
  }
  .vault-card{
    width:min(100%,410px)!important;
    max-width:410px!important;
    padding:22px 18px 24px!important;
    border-radius:28px!important;
  }
  .vault-card .vault-brand{gap:10px!important;margin-bottom:16px!important}
  .vault-card .vault-brand .brand-mark{width:50px!important;height:50px!important;flex-basis:50px!important;border-radius:17px!important}
  .vault-card .vault-brand .brand-mark .ui-icon-svg{width:23px!important;height:23px!important}
  .vault-lock-badge{width:52px!important;height:52px!important;border-radius:18px!important;margin-bottom:2px}
  .vault-lock-badge svg{width:22px!important;height:22px!important}
  .vault-unlock-intro h1{font-size:1.72rem!important}
  .vault-unlock-intro #vaultUnlockHint{font-size:.72rem!important;line-height:1.4!important}
  .pin-entry-mode #unlockPassphrase{min-height:48px!important;border-radius:16px!important;font-size:1.32rem!important}
  .vault-keypad{width:min(100%,288px);gap:10px 16px!important}
  .vault-key,.vault-key-spacer{width:58px!important;min-width:58px!important;height:58px!important;min-height:58px!important}
  .vault-key strong{font-size:1.2rem!important}
  .vault-key small{font-size:.48rem!important;margin-top:3px}
  .vault-enter-btn{min-height:50px!important;margin-top:3px!important}
  .vault-keyboard-toggle{min-height:46px!important}
  .vault-transfer{margin-top:11px!important}
}

@media(max-width:359px){
  .vault-screen{padding-inline:8px!important}
  .vault-card{padding:18px 13px 20px!important;border-radius:24px!important}
  .vault-card .vault-brand{margin-bottom:12px!important}
  .vault-keypad{width:min(100%,264px);gap:8px 13px!important}
  .vault-key,.vault-key-spacer{width:54px!important;min-width:54px!important;height:54px!important;min-height:54px!important}
  .vault-unlock-intro h1{font-size:1.55rem!important}
}

@media(prefers-reduced-motion:reduce){
  .vault-key,.vault-enter-btn{transition:none!important}
  .vault-key:hover,.vault-key:active{transform:none!important}
}
'''
append_once('ui-icons.css', 'v56 — modern secure vault', VAULT_CSS)
replace_once(
    'ui-icons.css',
    '/* Conta de Casa v55 — Lucide icon system, control normalization and prototype hierarchy. */',
    '/* Conta de Casa v56 — Lucide icon system, prototype hierarchy and modern secure vault. */'
)

# 3) Force a fresh public cache for Safari/iOS.
replace_once('sw.js', "const CACHE = 'conta-de-casa-public-v55-prototype';", "const CACHE = 'conta-de-casa-public-v56-vault-modern';")
for test_path in ['tests/ui-icons.test.cjs','tests/responsive.test.cjs','tests/market-experience.test.cjs']:
    replace_once(test_path, 'conta-de-casa-public-v55-prototype', 'conta-de-casa-public-v56-vault-modern')
replace_once('tests/ui-icons.test.cjs', "const css=fs.readFileSync('ui-icons.css','utf8');", "const css=fs.readFileSync('ui-icons.css','utf8');\nconst index=fs.readFileSync('index.html','utf8');")
replace_once('tests/ui-icons.test.cjs', "assert.match(css,/Conta de Casa v55/,'prototype hierarchy must be versioned in the icon layer');", "assert.match(css,/Conta de Casa v56/,'visual layer must be versioned after the secure-vault redesign');")
insert_before_once(
    'tests/ui-icons.test.cjs',
    "assert.match(license,/ISC License/);",
    'modern secure vault must retain the real PIN/password model',
    r'''assert.match(css,/v56 — modern secure vault/,'modern secure vault layer must be present');
assert.match(css,/\.vault-screen\{[\s\S]*safe-area-inset-top[\s\S]*safe-area-inset-bottom/,'vault must respect iPhone safe areas');
assert.match(css,/\.vault-card\{[\s\S]*border-radius:32px/,'vault card must use the new rounded visual hierarchy');
assert.match(css,/\.vault-key,.vault-key-spacer\{[\s\S]*width:70px/,'desktop keypad must use balanced circular controls');
assert.match(css,/\.vault-key\{[\s\S]*border-radius:50%/,'PIN keys must be circular');
assert.match(css,/@media\(max-width:820px\)[\s\S]*\.vault-key,.vault-key-spacer\{[\s\S]*width:58px/,'mobile keypad must remain compact enough for iPhone Safari');
assert.match(css,/\.vault-enter-btn\{[\s\S]*linear-gradient/,'primary unlock action must have a clear visual anchor');
assert.match(index,/class="brand brand-large vault-brand"/);
assert.match(index,/id="vaultUnlockHint"/);
assert.match(index,/aria-describedby="vaultUnlockHint"/);
assert.doesNotMatch(index,/passkey|biometria/i,'modern secure vault must retain the real PIN/password model instead of presenting unsupported biometric controls');'''
)

# 4) Continuity documentation.
replace_once(
    'docs/PROJECT_STATE.md',
    'Build funcional: v53 com revisão visual Lucide v54 integrada; hierarquia do protótipo v55 em validação',
    'Build funcional: v53 com revisão visual Lucide v54 integrada; hierarquia Compras v55 integrada; cofre visual v56 em validação'
)
replace_once(
    'docs/PROJECT_STATE.md',
    'Estado da revisão: protótipo aprovado da **Lista de compras** aplicado como camada visual contextual, sem alteração de schema, cálculos, persistência ou eventos de negócio',
    'Estado da revisão: ecrã de desbloqueio do cofre redesenhado visualmente para iPhone/Android/desktop, sem alterar PIN/palavra-passe, cifragem, persistência ou eventos de autenticação'
)
insert_before_once(
    'docs/PROJECT_STATE.md',
    '## Revisão v55 — hierarquia do protótipo aprovado',
    '## Revisão v56 — cofre de acesso moderno',
    '''## Revisão v56 — cofre de acesso moderno

A captura de referência enviada em iPhone mostrou uma direção visual mais premium para a entrada por PIN. A v56 aplica essa hierarquia ao **Conta de Casa** sem copiar funcionalidades inexistentes: mantém o PIN/palavra-passe atual, não introduz passkey/biometria falsa e não altera a derivação criptográfica.

Alterações principais:

- fundo com profundidade subtil e safe areas completas;
- cartão do cofre mais limpo, arredondado e centrado;
- marca **Conta de Casa** compacta e coerente com Lucide;
- badge de segurança, título e mensagem de sessão com hierarquia reforçada;
- campo de PIN em cápsula legível e focável;
- teclado circular com proporções equilibradas e estados tácteis;
- ação **Entrar** com maior destaque e alternativa **Usar palavra-passe** preservada;
- transferência de cofre e notas de privacidade mantidas, mas visualmente secundárias;
- tema escuro e `prefers-reduced-motion` preservados;
- cache público passa a `conta-de-casa-public-v56-vault-modern` para evitar CSS antigo no Safari/iOS.

Não foi adicionado botão de passkey/biometria porque o projeto não possui esse mecanismo implementado e testado.'''
)
project_state = read('docs/PROJECT_STATE.md')
if '## Próximo passo' in project_state:
    prefix = project_state.split('## Próximo passo',1)[0].rstrip()
    next_step = '''## Próximo passo

1. concluir CI da branch `ui/vault-modern-v56`;
2. integrar apenas se todas as suites passarem;
3. publicar pela pipeline normal de GitHub Pages;
4. validar no iPhone/Safari o cofre em 320, 375, 390 e 430 px, confirmando safe areas, ausência de corte, teclado circular, botão Entrar e acesso por palavra-passe;
5. validar tema claro/escuro e `prefers-reduced-motion`;
6. só avaliar passkey/biometria numa decisão separada, com suporte real WebAuthn/biométrico e modelo de recuperação definido.'''
    write('docs/PROJECT_STATE.md', prefix + '\n\n' + next_step + '\n')

insert_before_once(
    'docs/ARCHITECTURE.md',
    '## Sistema visual de ícones — Lucide',
    '## Cofre de acesso — apresentação v56',
    '''## Cofre de acesso — apresentação v56

O ecrã `#vaultScreen` continua a usar a estrutura existente em `index.html`, os eventos de `events.js` e o modelo criptográfico de `core.js`. A v56 é uma camada estritamente visual aplicada no final de `ui-icons.css`, para sobrepor as regras mobile v45 sem reestruturar autenticação.

Princípios:

- `100svh`/`100dvh` e `env(safe-area-inset-*)` para iPhone/Safari;
- cartão responsivo máximo de 500 px e teclado centrado;
- teclas circulares com 70 px no desktop e 58 px no mobile comum, preservando alvos tácteis adequados;
- campo `#unlockPassphrase` real permanece o único input de credencial;
- `wireVaultPinPad()` continua responsável por modo PIN versus palavra-passe;
- nenhum botão de passkey/biometria é apresentado enquanto não existir implementação WebAuthn/biométrica real;
- sem novas fontes, endpoints, armazenamento, scripts externos ou alterações à CSP;
- tema escuro e redução de movimento são tratados na mesma camada visual.'''
)
append_once(
    'docs/DECISIONS.md',
    '## D-011 — Modernizar o cofre sem simular biometria/passkey',
    '''## D-011 — Modernizar o cofre sem simular biometria/passkey

Data: 5 de setembro de 2026
Estado: aceite

### Contexto

Foi fornecida uma referência visual de iPhone com cartão branco, teclado PIN circular, grande hierarquia tipográfica e uma ação de passkey/biometria. O Conta de Casa já possui desbloqueio local por PIN/palavra-passe, mas não possui WebAuthn/passkeys/biometria implementados.

### Decisão

Adotar a linguagem visual da referência no ecrã do cofre — profundidade subtil, cartão arredondado, marca central, badge de segurança, campo de PIN e teclado circular — sem criar uma ação de passkey/biometria que não tenha backend/credencial e fluxo de recuperação reais.

A alteração permanece em `ui-icons.css` como camada final de apresentação e mantém `index.html`, `core.js` e `events.js` funcionalmente compatíveis. O cache do Service Worker avança para `conta-de-casa-public-v56-vault-modern`.

### Motivo

Melhora a perceção de qualidade e legibilidade no iPhone sem reduzir a segurança nem induzir o utilizador a acreditar que existe um método de autenticação ainda não implementado.

### Segurança

Não são alterados PBKDF2, AES-GCM, IndexedDB, duração da chave em memória, PIN/palavra-passe, recuperação, backups ou sincronização. A revisão não adiciona endpoints, bibliotecas, telemetry ou novos dados persistidos.'''
)
insert_before_once(
    'docs/TODO.md',
    '## P0 — validação Lucide e faturas',
    '## P0 — validação do cofre v56',
    '''## P0 — validação do cofre v56

- [x] Redesenhar visualmente o ecrã de desbloqueio com cartão moderno, teclado circular e hierarquia clara.
- [x] Preservar o PIN/palavra-passe e todos os eventos de desbloqueio existentes.
- [x] Não apresentar passkey/biometria enquanto não existir implementação real e auditada.
- [x] Preservar safe areas, tema escuro e `prefers-reduced-motion`.
- [x] Atualizar cache do Service Worker e testes de regressão visual/estrutural.
- [ ] Validar em iPhone/Safari físico nas larguras 320, 375, 390 e 430 px.
- [ ] Confirmar que teclado, Enter, apagar, palavra-passe e recuperação continuam acessíveis sem corte pelas barras do Safari.
- [ ] Validar Android/Chrome e desktop, incluindo tema escuro e orientação paisagem.'''
)
insert_before_once(
    'docs/CHANGELOG.md',
    '## 2026-09-05 — Lucide como sistema visual oficial de ícones',
    '## 2026-09-05 — Cofre de acesso v56 mais moderno e elegante',
    '''## 2026-09-05 — Cofre de acesso v56 mais moderno e elegante

### Objetivo

Aproximar o ecrã de PIN do nível visual da referência de iPhone enviada, mantendo a identidade **Conta de Casa** e sem alterar o modelo de segurança já implementado.

### Alterações

- fundo do cofre com profundidade subtil e gradientes derivados dos tokens existentes;
- cartão principal com maior raio, transparência controlada e sombra mais natural;
- marca Conta de Casa compacta, com ícone Lucide e subtítulo de cofre privado;
- badge de segurança e hierarquia tipográfica revistos;
- texto de sessão esclarece que o cofre é local e encriptado;
- campo de PIN transformado numa cápsula focável, mantendo o input real existente;
- teclado numérico passa a usar teclas circulares e proporções específicas para desktop, iPhone comum e ecrãs muito estreitos;
- botão Entrar recebe maior contraste e prioridade visual;
- alternativa por palavra-passe, transferência de cofre, recuperação e notas de privacidade continuam disponíveis;
- tema escuro, safe areas e `prefers-reduced-motion` preservados;
- não foi introduzido botão de passkey/biometria por não existir ainda uma implementação real e auditada;
- cache público atualizado para `conta-de-casa-public-v56-vault-modern`.

### Segurança e dados

Sem alterações a PBKDF2, AES-GCM, PIN/palavra-passe, IndexedDB, backups, sincronização, schema financeiro ou dados existentes. A revisão é visual e não adiciona endpoints nem dependências externas.'''
)

print('Applied Conta de Casa vault modern v56 visual revision.')
