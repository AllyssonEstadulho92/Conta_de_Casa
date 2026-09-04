const assert = require('node:assert/strict');
const fs = require('node:fs');

const forms = fs.readFileSync('forms.js','utf8');

assert.match(forms, /const MARKET_CATEGORIES = Object\.freeze/);
assert.match(forms, /Frutas e legumes/);
assert.match(forms, /Carne e peixe/);
assert.match(forms, /Lacticínios e ovos/);
assert.match(forms, /Mercearia \/ Despensa/);
assert.match(forms, /Higiene pessoal/);
assert.match(forms, /Limpeza/);
assert.match(forms, /Casa e cozinha/);
assert.match(forms, /Saúde \/ Farmácia/);
assert.match(forms, /function marketCategoryOptions\(selected=''\)/);
assert.match(forms, /appState\?\.market/);
assert.match(forms, /<select name="category" required>/);
assert.match(forms, /Selecionar categoria/);
assert.match(forms, /Escolha uma categoria para organizar a lista e os relatórios/);
assert.match(forms, /if\(!category\)\{toast\('Selecione uma categoria\.'/);
assert.doesNotMatch(forms, /placeholder="Frutas, limpeza\.\.\."/);

console.log('Structured market category tests: OK');
