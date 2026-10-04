export type CalculationMode = 'proportional' | 'daily-fixed';

export type ShareInput = {
  baseCents: number;
  careDays: number;
  daysInMonth: number;
  mode: CalculationMode;
  dailyRateCents?: number;
};

export function requireNonNegativeSafeCents(value: number, label = 'valor'): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} deve ser um inteiro de cêntimos não negativo.`);
  }
  return value;
}

export function daysInMonthFromKey(monthKey: string): number {
  const match = /^(\d{4})-(\d{2})$/.exec(monthKey);
  if (!match) throw new RangeError('Mês inválido.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) throw new RangeError('Mês inválido.');
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function calculateShareCents(input: ShareInput): number {
  const baseCents = requireNonNegativeSafeCents(input.baseCents, 'base mensal');
  const careDays = input.careDays;
  const daysInMonth = input.daysInMonth;
  if (!Number.isInteger(careDays) || careDays < 0) throw new RangeError('Dias com o cuidador inválidos.');
  if (!Number.isInteger(daysInMonth) || daysInMonth < 28 || daysInMonth > 31) throw new RangeError('Número de dias do mês inválido.');
  if (careDays > daysInMonth) throw new RangeError('Os dias com o cuidador não podem exceder os dias do mês.');

  if (input.mode === 'daily-fixed') {
    const dailyRate = requireNonNegativeSafeCents(input.dailyRateCents ?? 0, 'valor diário');
    const result = BigInt(dailyRate) * BigInt(careDays);
    if (result > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Valor calculado excede o limite seguro.');
    return Number(result);
  }

  const numerator = BigInt(baseCents) * BigInt(careDays);
  const denominator = BigInt(daysInMonth);
  const rounded = (numerator + denominator / 2n) / denominator;
  if (rounded > BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError('Valor calculado excede o limite seguro.');
  return Number(rounded);
}

export function ownerShareCents(baseCents: number, caregiverShareCents: number): number {
  requireNonNegativeSafeCents(baseCents, 'base mensal');
  requireNonNegativeSafeCents(caregiverShareCents, 'parte do cuidador');
  if (caregiverShareCents > baseCents) return 0;
  return baseCents - caregiverShareCents;
}

export function allocateProportionalShareByDays(
  baseCents: number,
  recordDayCounts: readonly number[],
  daysInMonth: number,
): number[] {
  requireNonNegativeSafeCents(baseCents, 'base mensal');
  if (!Number.isInteger(daysInMonth) || daysInMonth < 28 || daysInMonth > 31) throw new RangeError('Número de dias do mês inválido.');
  if (recordDayCounts.some(days => !Number.isInteger(days) || days < 0)) throw new RangeError('Dias do registo inválidos.');
  const totalDays = recordDayCounts.reduce((sum, days) => sum + days, 0);
  if (totalDays > daysInMonth) throw new RangeError('Total de dias excede os dias do mês.');
  const target = calculateShareCents({ baseCents, careDays: totalDays, daysInMonth, mode: 'proportional' });
  const denominator = BigInt(daysInMonth);
  const rows = recordDayCounts.map((days, index) => {
    const numerator = BigInt(baseCents) * BigInt(days);
    return {
      index,
      floor: Number(numerator / denominator),
      remainder: numerator % denominator,
    };
  });
  let assigned = rows.reduce((sum, row) => sum + row.floor, 0);
  const result = rows.map(row => row.floor);
  const ranked = [...rows].sort((a, b) => {
    if (a.remainder === b.remainder) return a.index - b.index;
    return a.remainder > b.remainder ? -1 : 1;
  });
  let cursor = 0;
  while (assigned < target && ranked.length) {
    const row = ranked[cursor % ranked.length];
    if (!row) break;
    result[row.index] = (result[row.index] ?? 0) + 1;
    assigned += 1;
    cursor += 1;
  }
  return result;
}

export function enumerateDateKeysInclusive(startKey: string, endKey: string): string[] {
  const start = parseDateKeyUtc(startKey);
  const end = parseDateKeyUtc(endKey);
  if (start > end) throw new RangeError('A data final não pode ser anterior à data inicial.');
  const result: string[] = [];
  for (let ms = start; ms <= end; ms += 86400000) {
    const d = new Date(ms);
    result.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`);
    if (result.length > 370) throw new RangeError('Período demasiado longo.');
  }
  return result;
}

export function monthKeyFromDateKey(dateKey: string): string {
  parseDateKeyUtc(dateKey);
  return dateKey.slice(0, 7);
}

function parseDateKeyUtc(dateKey: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new RangeError('Data inválida.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ms = Date.UTC(year, month - 1, day);
  const d = new Date(ms);
  if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) {
    throw new RangeError('Data inválida.');
  }
  return ms;
}

export function parseEuroToCents(input: string): number {
  const normalized = input.trim().replace(/\s/g, '').replace(/€/g, '');
  if (!normalized) return 0;
  if (!/^\d{1,12}(?:[.,]\d{0,2})?$/.test(normalized)) throw new RangeError('Introduza um valor válido, por exemplo 120,00.');
  const [whole, fraction = ''] = normalized.replace(',', '.').split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return requireNonNegativeSafeCents(cents);
}
