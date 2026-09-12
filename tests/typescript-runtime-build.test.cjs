'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync('src/ui/veggie-menu-toggle.ts','utf8');
const generated=fs.readFileSync('dist/v76-veggie-menu.js','utf8');

assert.match(source,/Veggie Burger em TypeScript/);
assert.match(source,/type MenuVisualState = 'open' \| 'closed'/);
assert.match(generated,/installVeggieMenuToggle/);
assert.match(generated,/glyph\.append\(upperLine, lowerLine\)/);
assert.match(generated,/drawer\.insertBefore\(button, drawerShell\)/);
assert.match(generated,/upperLine\.animate/);
assert.match(generated,/lowerLine\.animate/);
assert.match(generated,/aria-expanded/);
assert.doesNotMatch(generated,/commit\(|saveState\(|appState|estimatedCents|actualCents/);
assert.doesNotThrow(()=>new vm.Script(generated),'generated TypeScript runtime must parse as a classic browser script');

console.log('TypeScript runtime build: Veggie Burger emitted from src/ui/veggie-menu-toggle.ts and parses cleanly.');
