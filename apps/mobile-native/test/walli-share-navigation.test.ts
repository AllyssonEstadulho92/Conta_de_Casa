import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const screensSource = readFileSync(new URL('../src/screens.tsx', import.meta.url), 'utf8');

test('a partilha do Walli é uma secção móvel dedicada', () => {
  assert.match(appSource, /type ScreenName = 'animals' \| 'share'/);
  assert.match(appSource, /label="Partilha"/);
  assert.match(appSource, /<WalliShareScreen/);
  assert.match(screensSource, /export function WalliShareScreen/);
  assert.match(screensSource, /Partilha com o Nuno/);
  assert.match(screensSource, /Abrir partilha com o Nuno/);
});

test('os fluxos de calendário, registos e configuração saem da secção dedicada', () => {
  assert.match(screensSource, /navigate\('calendar'\)/);
  assert.match(screensSource, /navigate\('records'\)/);
  assert.match(screensSource, /navigate\('settings'\)/);
  assert.match(screensSource, /navigate\('handover'\)/);
});
