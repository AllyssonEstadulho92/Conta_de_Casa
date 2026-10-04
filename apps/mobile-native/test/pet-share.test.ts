import assert from 'node:assert/strict';
import test from 'node:test';
import {
  allocateProportionalShareByDays,
  calculateShareCents,
  daysInMonthFromKey,
  enumerateDateKeysInclusive,
  ownerShareCents,
  parseEuroToCents,
} from '../src/domain.ts';

test('outubro de 2026 usa 31 dias e mantém os cêntimos exatos', () => {
  const share = calculateShareCents({ baseCents: 12000, careDays: 8, daysInMonth: 31, mode: 'proportional' });
  assert.equal(share, 3097);
  assert.equal(ownerShareCents(12000, share), 8903);
  assert.equal(share + ownerShareCents(12000, share), 12000);
});

test('não assume 30 dias em outubro', () => {
  assert.equal(daysInMonthFromKey('2026-10'), 31);
  assert.equal(calculateShareCents({ baseCents: 12000, careDays: 8, daysInMonth: 30, mode: 'proportional' }), 3200);
});

test('valor diário fixo é independente do tamanho do mês', () => {
  assert.equal(calculateShareCents({ baseCents: 12000, careDays: 8, daysInMonth: 31, mode: 'daily-fixed', dailyRateCents: 400 }), 3200);
});

test('alocação por registos reconcilia exatamente com o total mensal', () => {
  const rows = allocateProportionalShareByDays(12000, [2, 2, 2, 2], 31);
  assert.equal(rows.reduce((sum, value) => sum + value, 0), 3097);
});

test('datas civis atravessam a mudança de mês sem depender do fuso horário', () => {
  assert.deepEqual(enumerateDateKeysInclusive('2026-10-31', '2026-11-02'), ['2026-10-31', '2026-11-01', '2026-11-02']);
  assert.equal(daysInMonthFromKey('2028-02'), 29);
});

test('parser monetário mantém valores em cêntimos inteiros', () => {
  assert.equal(parseEuroToCents('120,00'), 12000);
  assert.equal(parseEuroToCents('0,01 €'), 1);
  assert.throws(() => parseEuroToCents('12,345'));
});
