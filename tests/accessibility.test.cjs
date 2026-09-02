const assert = require('node:assert/strict');
const fs = require('node:fs');

const css = fs.readFileSync('design-system.css','utf8');
const render = fs.readFileSync('render.js','utf8');
const index = fs.readFileSync('index.html','utf8');

function tokens(block) {
  return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+):#([0-9a-f]{6})/gi)].map(match=>[match[1],match[2]]));
}
function luminance(hex) {
  const values=hex.match(/../g).map(part=>parseInt(part,16)/255).map(value=>value<=.03928?value/12.92:((value+.055)/1.055)**2.4);
  return .2126*values[0]+.7152*values[1]+.0722*values[2];
}
function contrast(a,b) {
  const one=luminance(a),two=luminance(b);
  return (Math.max(one,two)+.05)/(Math.min(one,two)+.05);
}

const light=tokens(css.match(/:root\{([\s\S]*?)\}/)[1]);
const dark=tokens(css.match(/\[data-theme="dark"\]\{([\s\S]*?)\}/)[1]);
for (const palette of [light,dark]) {
  for (const [foreground,background] of [['primary','primary-2'],['success','success-bg'],['warning','warning-bg'],['danger','danger-bg']]) {
    assert.ok(contrast(palette[foreground],palette[background])>=4.5,`${foreground} text must meet WCAG AA contrast`);
  }
  assert.ok(contrast(palette.muted,palette.surface)>=4.5,'secondary text must meet WCAG AA contrast');
}

assert.match(css, /\.btn\{min-height:44px/);
assert.match(css, /\.icon-btn\{width:44px;height:44px/);
assert.match(css, /\.status-chip\{font-size:\.75rem/);
assert.match(css, /\.sr-only\{position:absolute!important/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.match(render, /setAttribute\('aria-current','page'\)/);
assert.match(index, /aria-labelledby="drawerTitle"/);
assert.match(index, /aria-expanded="false"/);

console.log('Accessibility foundation tests: OK');
