'use strict';

declare function parseCivilDateKey(value: string): { year: number; month: number; day: number } | null;
declare function cleanDateKey(value: string): string;
declare function civilDayNumber(dateKey: string): number;
declare function civilDayDiff(fromDateKey: string, toDateKey: string): number;
declare function addCivilDays(dateKey: string, days: number): string;
declare function addCivilMonthsClamped(dateKey: string, months: number): string;
declare function currentLocalDateKey(now?: Date): string;
declare function icon(name: string, size?: number): string;

type DateParts = { year: number; month: number; day: number };
type CalendarSpan = { years: number; months: number; days: number };
type DifferenceResult = {
  start: string;
  end: string;
  direction: -1 | 0 | 1;
  elapsedDays: number;
  inclusiveDays: number;
  selectedDays: number;
  weeks: number;
  remainingDays: number;
  span: CalendarSpan;
};
type BusinessResult = {
  start: string;
  end: string;
  selectedDays: number;
  businessDays: number;
  weekendDays: number;
};
type RootWithDateCalculator = typeof globalThis & {
  CDCIcons?: { markup?: (name: string, size?: number) => string };
  CDCDateCalculator?: Readonly<{
    revision: string;
    difference: (start: string, end: string, includeStart?: boolean, includeEnd?: boolean) => DifferenceResult | null;
    businessDays: (start: string, end: string, includeStart?: boolean, includeEnd?: boolean) => BusinessResult | null;
    addDays: (base: string, amount: number, mode?: 'calendar' | 'business') => string;
    calendarSpan: (start: string, end: string) => CalendarSpan | null;
    dayOfYear: (dateKey: string) => number;
    weekdayName: (dateKey: string) => string;
  }>;
};

type CalculatorMode = 'difference' | 'add' | 'business';

(function installDateCalculator(root: RootWithDateCalculator) {
  const REVISION = '76-date-calculator1';
  const MIN_YEAR = 1900;
  const MAX_YEAR = 9999;
  const MAX_ADD_DAYS = 100000;
  const WEEKDAY_NAMES = Object.freeze([
    'domingo',
    'segunda-feira',
    'terça-feira',
    'quarta-feira',
    'quinta-feira',
    'sexta-feira',
    'sábado'
  ]);

  const doc = typeof document === 'undefined' ? null : document;
  let lastResultText = '';
  let lastLauncher: HTMLElement | null = null;
  let activeMode: CalculatorMode = 'difference';
  let launcherObserver: MutationObserver | null = null;
  let appHiddenObserver: MutationObserver | null = null;

  function supportedDateKey(value: string): string {
    const key = cleanDateKey(value);
    if (!key) return '';
    const parts = parseCivilDateKey(key);
    if (!parts || parts.year < MIN_YEAR || parts.year > MAX_YEAR) return '';
    return key;
  }

  function compareDateKeys(a: string, b: string): number {
    return a === b ? 0 : a < b ? -1 : 1;
  }

  function dayNumber(dateKey: string): number {
    const key = supportedDateKey(dateKey);
    if (!key) return Number.NaN;
    return civilDayNumber(key);
  }

  function modulo(value: number, divisor: number): number {
    return ((value % divisor) + divisor) % divisor;
  }

  function weekdayIndex(dateKey: string): number {
    const day = dayNumber(dateKey);
    return Number.isFinite(day) ? modulo(day + 4, 7) : -1;
  }

  function weekdayName(dateKey: string): string {
    const index = weekdayIndex(dateKey);
    return index >= 0 ? (WEEKDAY_NAMES[index] ?? '') : '';
  }

  function isBusinessDayNumber(day: number): boolean {
    const index = modulo(day + 4, 7);
    return index >= 1 && index <= 5;
  }

  function isBusinessDay(dateKey: string): boolean {
    const day = dayNumber(dateKey);
    return Number.isFinite(day) && isBusinessDayNumber(day);
  }

  function dayOfYear(dateKey: string): number {
    const key = supportedDateKey(dateKey);
    const parts = key ? parseCivilDateKey(key) : null;
    if (!parts) return Number.NaN;
    const first = `${String(parts.year).padStart(4, '0')}-01-01`;
    const diff = civilDayDiff(first, key);
    return Number.isFinite(diff) ? diff + 1 : Number.NaN;
  }

  function isLeapYear(year: number): boolean {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function calendarSpan(startInput: string, endInput: string): CalendarSpan | null {
    const startKey = supportedDateKey(startInput);
    const endKey = supportedDateKey(endInput);
    if (!startKey || !endKey) return null;
    const from = compareDateKeys(startKey, endKey) <= 0 ? startKey : endKey;
    const to = compareDateKeys(startKey, endKey) <= 0 ? endKey : startKey;
    const fromParts = parseCivilDateKey(from);
    const toParts = parseCivilDateKey(to);
    if (!fromParts || !toParts) return null;

    let years = toParts.year - fromParts.year;
    let afterYears = addCivilMonthsClamped(from, years * 12);
    if (!supportedDateKey(afterYears)) return null;
    if (compareDateKeys(afterYears, to) > 0) {
      years -= 1;
      afterYears = addCivilMonthsClamped(from, years * 12);
    }

    const yearParts = parseCivilDateKey(afterYears);
    if (!yearParts) return null;
    let months = (toParts.year - yearParts.year) * 12 + (toParts.month - yearParts.month);
    let afterMonths = addCivilMonthsClamped(afterYears, months);
    if (!supportedDateKey(afterMonths)) return null;
    if (compareDateKeys(afterMonths, to) > 0) {
      months -= 1;
      afterMonths = addCivilMonthsClamped(afterYears, months);
    }
    const days = civilDayDiff(afterMonths, to);
    if (!Number.isInteger(days) || days < 0) return null;
    return { years, months, days };
  }

  function selectedRange(
    startInput: string,
    endInput: string,
    includeStart: boolean,
    includeEnd: boolean
  ): { first: number; last: number; count: number } | null {
    const start = dayNumber(startInput);
    const end = dayNumber(endInput);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;

    const forward = start <= end;
    const low = forward ? start : end;
    const high = forward ? end : start;
    const includeLow = forward ? includeStart : includeEnd;
    const includeHigh = forward ? includeEnd : includeStart;
    const first = low + (includeLow ? 0 : 1);
    const last = high - (includeHigh ? 0 : 1);
    return first > last ? { first, last, count: 0 } : { first, last, count: last - first + 1 };
  }

  function difference(
    startInput: string,
    endInput: string,
    includeStart = false,
    includeEnd = true
  ): DifferenceResult | null {
    const start = supportedDateKey(startInput);
    const end = supportedDateKey(endInput);
    if (!start || !end) return null;
    const signed = civilDayDiff(start, end);
    if (!Number.isInteger(signed)) return null;
    const elapsedDays = Math.abs(signed);
    const range = selectedRange(start, end, includeStart, includeEnd);
    const span = calendarSpan(start, end);
    if (!range || !span) return null;
    return {
      start,
      end,
      direction: signed === 0 ? 0 : signed > 0 ? 1 : -1,
      elapsedDays,
      inclusiveDays: elapsedDays + 1,
      selectedDays: range.count,
      weeks: Math.floor(elapsedDays / 7),
      remainingDays: elapsedDays % 7,
      span
    };
  }

  function countWeekdays(first: number, last: number): number {
    if (!Number.isInteger(first) || !Number.isInteger(last) || first > last) return 0;
    const total = last - first + 1;
    const completeWeeks = Math.floor(total / 7);
    let count = completeWeeks * 5;
    const remainder = total % 7;
    const remainderStart = first + completeWeeks * 7;
    for (let offset = 0; offset < remainder; offset += 1) {
      if (isBusinessDayNumber(remainderStart + offset)) count += 1;
    }
    return count;
  }

  function businessDays(
    startInput: string,
    endInput: string,
    includeStart = true,
    includeEnd = true
  ): BusinessResult | null {
    const start = supportedDateKey(startInput);
    const end = supportedDateKey(endInput);
    if (!start || !end) return null;
    const range = selectedRange(start, end, includeStart, includeEnd);
    if (!range) return null;
    const business = range.count ? countWeekdays(range.first, range.last) : 0;
    return {
      start,
      end,
      selectedDays: range.count,
      businessDays: business,
      weekendDays: range.count - business
    };
  }

  function addBusinessDays(base: string, amount: number): string {
    if (!supportedDateKey(base) || !Number.isInteger(amount) || Math.abs(amount) > MAX_ADD_DAYS) return '';
    if (amount === 0) return base;
    const step = amount > 0 ? 1 : -1;
    let remaining = Math.abs(amount);
    let cursor = base;
    while (remaining > 0) {
      cursor = addCivilDays(cursor, step);
      if (!supportedDateKey(cursor)) return '';
      if (isBusinessDay(cursor)) remaining -= 1;
    }
    return cursor;
  }

  function addDays(baseInput: string, amount: number, mode: 'calendar' | 'business' = 'calendar'): string {
    const base = supportedDateKey(baseInput);
    if (!base || !Number.isInteger(amount) || Math.abs(amount) > MAX_ADD_DAYS) return '';
    if (mode === 'business') return addBusinessDays(base, amount);
    const result = addCivilDays(base, amount);
    return supportedDateKey(result);
  }

  const API = Object.freeze({
    revision: REVISION,
    difference,
    businessDays,
    addDays,
    calendarSpan,
    dayOfYear,
    weekdayName
  });
  root.CDCDateCalculator = API;
  if (!doc) return;

  function byId<T extends HTMLElement = HTMLElement>(id: string): T | null {
    return doc.getElementById(id) as T | null;
  }

  function query<T extends Element = Element>(selector: string, scope: ParentNode = doc): T | null {
    return scope.querySelector(selector) as T | null;
  }

  function queryAll<T extends Element = Element>(selector: string, scope: ParentNode = doc): T[] {
    return Array.from(scope.querySelectorAll(selector)) as T[];
  }

  function escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[character] ?? character));
  }

  function iconMarkup(name: string, size = 20): string {
    try {
      const local = root.CDCIcons?.markup?.(name, size);
      if (local) return local;
      return icon(name, size);
    } catch (_error) {
      return '';
    }
  }

  function formatDateLong(dateKey: string): string {
    const key = supportedDateKey(dateKey);
    const parts = key ? parseCivilDateKey(key) : null;
    if (!parts) return '—';
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0, 0));
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC'
    }).format(date);
  }

  function formatDateWithWeekday(dateKey: string): string {
    const long = formatDateLong(dateKey);
    const weekday = weekdayName(dateKey);
    return weekday ? `${long} · ${weekday}` : long;
  }

  function plural(value: number, singular: string, pluralForm: string): string {
    return `${value} ${value === 1 ? singular : pluralForm}`;
  }

  function spanText(span: CalendarSpan): string {
    const parts: string[] = [];
    if (span.years) parts.push(plural(span.years, 'ano', 'anos'));
    if (span.months) parts.push(plural(span.months, 'mês', 'meses'));
    if (span.days || !parts.length) parts.push(plural(span.days, 'dia', 'dias'));
    return parts.join(', ');
  }

  function todayKey(): string {
    const key = currentLocalDateKey();
    return supportedDateKey(key) || '';
  }

  function launcherHtml(): string {
    return `<section class="v75-more-group cdc-datecalc-launcher-group" data-datecalc-launcher-group aria-label="Ferramentas"><h2>Ferramentas</h2><div><button type="button" class="v75-more-row" data-datecalc-open><span class="v75-more-icon">${iconMarkup('calendar', 19)}</span><span><strong>Calculadora de datas</strong><small>Diferenças, datas futuras e dias úteis</small></span><i aria-hidden="true">${iconMarkup('chevron', 17)}</i></button></div></section>`;
  }

  function ensureLauncher(): void {
    const menu = byId('cdcMoreMenu');
    if (!menu || query('[data-datecalc-launcher-group]', menu)) return;
    menu.insertAdjacentHTML('beforeend', launcherHtml());
  }

  function factsHtml(): string {
    const today = todayKey();
    const parts = today ? parseCivilDateKey(today) : null;
    if (!today || !parts) return '';
    return `<aside class="cdc-datecalc-facts" aria-labelledby="cdcDateFactsTitle"><div class="cdc-datecalc-card-head"><span class="cdc-datecalc-card-icon" aria-hidden="true">${iconMarkup('info', 19)}</span><div><h3 id="cdcDateFactsTitle">Factos rápidos</h3><p>Referência local do dispositivo</p></div></div><dl><div><dt>Hoje</dt><dd>${escapeHtml(formatDateLong(today))}</dd></div><div><dt>Dia do ano</dt><dd>${dayOfYear(today)}</dd></div><div><dt>Dia da semana</dt><dd>${escapeHtml(weekdayName(today))}</dd></div><div><dt>Ano</dt><dd>${isLeapYear(parts.year) ? 'Bissexto' : 'Comum'}</dd></div><div><dt>Calendário</dt><dd>Gregoriano civil</dd></div></dl><p class="cdc-datecalc-fact-note">As contas usam datas civis, não horas. Mudanças de fuso horário e horário de verão não alteram o total.</p></aside>`;
  }

  function todayControl(targetId: string): string {
    return `<button type="button" class="cdc-datecalc-inline-action" data-datecalc-today="${escapeHtml(targetId)}">Hoje</button>`;
  }

  function inclusionControls(prefix: string, startChecked: boolean, endChecked: boolean): string {
    return `<fieldset class="cdc-datecalc-options"><legend>Regra de contagem</legend><label><input id="${prefix}IncludeStart" type="checkbox"${startChecked ? ' checked' : ''}/><span>Incluir data inicial</span></label><label><input id="${prefix}IncludeEnd" type="checkbox"${endChecked ? ' checked' : ''}/><span>Incluir data final</span></label></fieldset>`;
  }

  function differencePanelHtml(today: string): string {
    return `<section class="cdc-datecalc-mode-panel" data-datecalc-panel="difference" role="tabpanel" aria-labelledby="cdcDateTabDifference"><div class="cdc-datecalc-card-head"><span class="cdc-datecalc-card-icon" aria-hidden="true">${iconMarkup('calendar', 20)}</span><div><h3>Datas de entrada</h3><p>Resultado civil exato entre duas datas.</p></div></div><div class="cdc-datecalc-date-grid"><label><span>Data inicial</span><div class="cdc-datecalc-input-action"><input id="cdcDateDiffStart" type="date" min="1900-01-01" max="9999-12-31" value="${today}"/>${todayControl('cdcDateDiffStart')}</div></label><button class="cdc-datecalc-swap" type="button" data-datecalc-swap="difference" aria-label="Trocar data inicial e data final">${iconMarkup('refresh', 20)}</button><label><span>Data final</span><div class="cdc-datecalc-input-action"><input id="cdcDateDiffEnd" type="date" min="1900-01-01" max="9999-12-31" value="${today}"/>${todayControl('cdcDateDiffEnd')}</div></label></div>${inclusionControls('cdcDateDiff', false, true)}<button class="btn primary cdc-datecalc-submit" type="button" data-datecalc-calculate="difference">${iconMarkup('arrowRight', 19)}<span>Calcular diferença</span></button></section>`;
  }

  function addPanelHtml(today: string): string {
    return `<section class="cdc-datecalc-mode-panel" data-datecalc-panel="add" role="tabpanel" aria-labelledby="cdcDateTabAdd" hidden><div class="cdc-datecalc-card-head"><span class="cdc-datecalc-card-icon" aria-hidden="true">${iconMarkup('plus', 20)}</span><div><h3>Adicionar ou subtrair</h3><p>Avance ou recue uma quantidade inteira de dias.</p></div></div><div class="cdc-datecalc-form-stack"><label><span>Data base</span><div class="cdc-datecalc-input-action"><input id="cdcDateAddBase" type="date" min="1900-01-01" max="9999-12-31" value="${today}"/>${todayControl('cdcDateAddBase')}</div></label><div class="cdc-datecalc-two-fields"><label><span>Operação</span><select id="cdcDateAddDirection"><option value="1">Adicionar</option><option value="-1">Subtrair</option></select></label><label><span>Quantidade</span><input id="cdcDateAddAmount" type="number" min="0" max="${MAX_ADD_DAYS}" step="1" inputmode="numeric" value="1"/></label></div><label><span>Tipo de dia</span><select id="cdcDateAddMode"><option value="calendar">Dias corridos</option><option value="business">Dias úteis · segunda a sexta</option></select></label></div><p class="cdc-datecalc-rule"><strong>Regra:</strong> a data base não é contada ao adicionar ou subtrair. Em “dias úteis”, sábados e domingos são ignorados.</p><button class="btn primary cdc-datecalc-submit" type="button" data-datecalc-calculate="add">${iconMarkup('arrowRight', 19)}<span>Calcular data</span></button></section>`;
  }

  function businessPanelHtml(today: string): string {
    return `<section class="cdc-datecalc-mode-panel" data-datecalc-panel="business" role="tabpanel" aria-labelledby="cdcDateTabBusiness" hidden><div class="cdc-datecalc-card-head"><span class="cdc-datecalc-card-icon" aria-hidden="true">${iconMarkup('calendar', 20)}</span><div><h3>Dias úteis</h3><p>Conte apenas segunda-feira a sexta-feira.</p></div></div><div class="cdc-datecalc-date-grid"><label><span>Data inicial</span><div class="cdc-datecalc-input-action"><input id="cdcDateBusinessStart" type="date" min="1900-01-01" max="9999-12-31" value="${today}"/>${todayControl('cdcDateBusinessStart')}</div></label><button class="cdc-datecalc-swap" type="button" data-datecalc-swap="business" aria-label="Trocar data inicial e data final">${iconMarkup('refresh', 20)}</button><label><span>Data final</span><div class="cdc-datecalc-input-action"><input id="cdcDateBusinessEnd" type="date" min="1900-01-01" max="9999-12-31" value="${today}"/>${todayControl('cdcDateBusinessEnd')}</div></label></div>${inclusionControls('cdcDateBusiness', true, true)}<p class="cdc-datecalc-rule"><strong>Definição exata deste modo:</strong> segunda a sexta-feira. Feriados não são descontados, porque a aplicação não presume país, região ou feriado municipal.</p><button class="btn primary cdc-datecalc-submit" type="button" data-datecalc-calculate="business">${iconMarkup('arrowRight', 19)}<span>Contar dias úteis</span></button></section>`;
  }

  function dialogHtml(): string {
    const today = todayKey();
    return `<dialog id="cdcDateCalculatorDialog" class="cdc-datecalc-dialog" aria-labelledby="cdcDateCalculatorTitle"><div class="cdc-datecalc-shell"><header class="cdc-datecalc-header"><div class="cdc-datecalc-title"><span class="cdc-datecalc-title-icon" aria-hidden="true">${iconMarkup('calendar', 24)}</span><div><p class="eyebrow">Ferramentas</p><h2 id="cdcDateCalculatorTitle">Calculadora de datas</h2><p>Contagem civil determinística, sem arredondamentos nem dependência de fuso horário.</p></div></div><button class="icon-btn cdc-datecalc-close" type="button" data-datecalc-close aria-label="Fechar calculadora">${iconMarkup('close', 20)}</button></header><nav class="cdc-datecalc-tabs" role="tablist" aria-label="Modos da calculadora"><button id="cdcDateTabDifference" type="button" role="tab" aria-selected="true" tabindex="0" data-datecalc-mode="difference">${iconMarkup('calendar', 18)}<span>Diferença</span></button><button id="cdcDateTabAdd" type="button" role="tab" aria-selected="false" tabindex="-1" data-datecalc-mode="add">${iconMarkup('plus', 18)}<span>Adicionar dias</span></button><button id="cdcDateTabBusiness" type="button" role="tab" aria-selected="false" tabindex="-1" data-datecalc-mode="business">${iconMarkup('briefcase', 18)}<span>Dias úteis</span></button></nav><div class="cdc-datecalc-layout"><main class="cdc-datecalc-workspace"><article class="cdc-datecalc-input-card">${differencePanelHtml(today)}${addPanelHtml(today)}${businessPanelHtml(today)}</article><section id="cdcDateCalcResult" class="cdc-datecalc-result" aria-live="polite"><div class="cdc-datecalc-empty">${iconMarkup('calendar', 30)}<strong>Pronto para calcular</strong><span>Introduza as datas e escolha a regra de contagem.</span></div></section><div id="cdcDateCalcActions" class="cdc-datecalc-result-actions" hidden><button class="btn secondary" type="button" data-datecalc-copy>${iconMarkup('copy', 18)}<span>Copiar resultado</span></button><button class="btn secondary" type="button" data-datecalc-share>${iconMarkup('share', 18)}<span>Partilhar</span></button><button class="btn secondary" type="button" data-datecalc-print>${iconMarkup('download', 18)}<span>Imprimir / PDF</span></button></div></main>${factsHtml()}</div><footer class="cdc-datecalc-footer"><span>${iconMarkup('shield', 17)} Cálculo local. Nenhuma data é enviada para a Internet.</span><span>Intervalo suportado: 01/01/1900–31/12/9999.</span></footer></div></dialog>`;
  }

  function ensureDialog(): HTMLDialogElement | null {
    let dialog = byId<HTMLDialogElement>('cdcDateCalculatorDialog');
    if (dialog) return dialog;
    doc.body.insertAdjacentHTML('beforeend', dialogHtml());
    dialog = byId<HTMLDialogElement>('cdcDateCalculatorDialog');
    return dialog;
  }

  function setMode(mode: CalculatorMode, focusTab = false): void {
    activeMode = mode;
    const dialog = ensureDialog();
    if (!dialog) return;
    queryAll<HTMLButtonElement>('[data-datecalc-mode]', dialog).forEach(button => {
      const selected = button.dataset.datecalcMode === mode;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.classList.toggle('active', selected);
      if (selected && focusTab) button.focus({ preventScroll: true });
    });
    queryAll<HTMLElement>('[data-datecalc-panel]', dialog).forEach(panel => {
      panel.hidden = panel.dataset.datecalcPanel !== mode;
    });
    const result = byId('cdcDateCalcResult');
    if (result) result.innerHTML = `<div class="cdc-datecalc-empty">${iconMarkup('calendar', 30)}<strong>Pronto para calcular</strong><span>Introduza as datas e escolha a regra de contagem.</span></div>`;
    const actions = byId('cdcDateCalcActions');
    if (actions) actions.hidden = true;
    lastResultText = '';
  }

  function openDialog(trigger: HTMLElement): void {
    lastLauncher = trigger;
    const dialog = ensureDialog();
    if (!dialog) return;
    setMode(activeMode);
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => query<HTMLButtonElement>('[data-datecalc-mode][aria-selected="true"]', dialog)?.focus({ preventScroll: true }));
  }

  function closeDialog(): void {
    const dialog = byId<HTMLDialogElement>('cdcDateCalculatorDialog');
    if (dialog?.open) dialog.close();
  }

  function formValue(id: string): string {
    const input = byId<HTMLInputElement | HTMLSelectElement>(id);
    return input?.value ?? '';
  }

  function checked(id: string): boolean {
    return Boolean(byId<HTMLInputElement>(id)?.checked);
  }

  function resultShell(primary: string, lead: string, details: Array<[string, string]>, note = ''): string {
    return `<div class="cdc-datecalc-result-hero"><small>${escapeHtml(lead)}</small><strong>${escapeHtml(primary)}</strong></div><dl class="cdc-datecalc-result-grid">${details.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>${note ? `<p class="cdc-datecalc-result-note">${escapeHtml(note)}</p>` : ''}`;
  }

  function publishResult(html: string, text: string): void {
    const target = byId('cdcDateCalcResult');
    if (!target) return;
    target.innerHTML = html;
    lastResultText = text;
    const actions = byId('cdcDateCalcActions');
    if (actions) actions.hidden = false;
    target.scrollIntoView({ block: 'nearest', behavior: root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth' });
  }

  function publishError(message: string): void {
    const target = byId('cdcDateCalcResult');
    if (!target) return;
    target.innerHTML = `<div class="cdc-datecalc-error" role="alert">${iconMarkup('alert', 22)}<div><strong>Não foi possível calcular</strong><span>${escapeHtml(message)}</span></div></div>`;
    lastResultText = '';
    const actions = byId('cdcDateCalcActions');
    if (actions) actions.hidden = true;
  }

  function calculateDifference(): void {
    const start = formValue('cdcDateDiffStart');
    const end = formValue('cdcDateDiffEnd');
    const result = difference(start, end, checked('cdcDateDiffIncludeStart'), checked('cdcDateDiffIncludeEnd'));
    if (!result) {
      publishError('Escolha duas datas válidas entre 01/01/1900 e 31/12/9999.');
      return;
    }
    const relation = result.direction === 0 ? 'As duas datas são iguais' : result.direction > 0 ? 'A data final ocorre depois da inicial' : 'A data final ocorre antes da inicial';
    const primary = plural(result.elapsedDays, 'dia', 'dias');
    const weekText = `${plural(result.weeks, 'semana', 'semanas')} + ${plural(result.remainingDays, 'dia', 'dias')}`;
    const details: Array<[string, string]> = [
      ['Dias decorridos', plural(result.elapsedDays, 'dia', 'dias')],
      ['Contando as duas datas', plural(result.inclusiveDays, 'dia', 'dias')],
      ['Contagem selecionada', plural(result.selectedDays, 'dia', 'dias')],
      ['Semanas completas', weekText],
      ['Período civil', spanText(result.span)],
      ['Data inicial', formatDateWithWeekday(result.start)],
      ['Data final', formatDateWithWeekday(result.end)]
    ];
    const note = '“Dias decorridos” é a diferença matemática entre as datas. A “contagem selecionada” respeita exatamente as opções Incluir data inicial/final.';
    publishResult(resultShell(primary, relation, details, note), `Diferença entre ${formatDateLong(result.start)} e ${formatDateLong(result.end)}: ${primary}. ${relation}. Contagem selecionada: ${result.selectedDays} dias. Período civil: ${spanText(result.span)}.`);
  }

  function calculateAdd(): void {
    const base = supportedDateKey(formValue('cdcDateAddBase'));
    const amountRaw = Number(formValue('cdcDateAddAmount'));
    const direction = Number(formValue('cdcDateAddDirection')) === -1 ? -1 : 1;
    const mode = formValue('cdcDateAddMode') === 'business' ? 'business' : 'calendar';
    if (!base || !Number.isInteger(amountRaw) || amountRaw < 0 || amountRaw > MAX_ADD_DAYS) {
      publishError(`Escolha uma data válida e uma quantidade inteira entre 0 e ${MAX_ADD_DAYS}.`);
      return;
    }
    const signedAmount = amountRaw * direction;
    const result = addDays(base, signedAmount, mode);
    if (!result) {
      publishError('O resultado ultrapassa o intervalo de datas suportado.');
      return;
    }
    const verb = direction > 0 ? 'adicionados' : 'subtraídos';
    const type = mode === 'business' ? 'dias úteis (segunda a sexta)' : 'dias corridos';
    const details: Array<[string, string]> = [
      ['Data base', formatDateWithWeekday(base)],
      ['Operação', `${plural(amountRaw, 'dia', 'dias')} ${verb}`],
      ['Tipo', type],
      ['Data resultante', formatDateWithWeekday(result)],
      ['Dia do ano', String(dayOfYear(result))]
    ];
    const note = mode === 'business' ? 'Sábados e domingos são ignorados. Feriados não são presumidos nem descontados.' : 'A soma é feita em dias civis inteiros; horas e fuso horário não participam.';
    publishResult(resultShell(formatDateLong(result), 'Data exata', details, note), `${formatDateLong(base)} ${direction > 0 ? '+' : '−'} ${amountRaw} ${type}: ${formatDateLong(result)} (${weekdayName(result)}).`);
  }

  function calculateBusiness(): void {
    const start = formValue('cdcDateBusinessStart');
    const end = formValue('cdcDateBusinessEnd');
    const result = businessDays(start, end, checked('cdcDateBusinessIncludeStart'), checked('cdcDateBusinessIncludeEnd'));
    if (!result) {
      publishError('Escolha duas datas válidas entre 01/01/1900 e 31/12/9999.');
      return;
    }
    const details: Array<[string, string]> = [
      ['Dias úteis', plural(result.businessDays, 'dia', 'dias')],
      ['Dias de fim de semana', plural(result.weekendDays, 'dia', 'dias')],
      ['Dias considerados', plural(result.selectedDays, 'dia', 'dias')],
      ['Data inicial', formatDateWithWeekday(result.start)],
      ['Data final', formatDateWithWeekday(result.end)]
    ];
    const note = 'Definição deste modo: segunda a sexta-feira. Feriados nacionais, regionais ou municipais não são descontados sem uma jurisdição explicitamente configurada.';
    publishResult(resultShell(plural(result.businessDays, 'dia útil', 'dias úteis'), 'Contagem exata segundo a regra definida', details, note), `Entre ${formatDateLong(result.start)} e ${formatDateLong(result.end)}: ${result.businessDays} dias úteis, considerando apenas segunda a sexta-feira e as opções de inclusão selecionadas.`);
  }

  function calculate(mode: CalculatorMode): void {
    if (mode === 'difference') calculateDifference();
    else if (mode === 'add') calculateAdd();
    else calculateBusiness();
  }

  function swap(prefix: 'difference' | 'business'): void {
    const startId = prefix === 'difference' ? 'cdcDateDiffStart' : 'cdcDateBusinessStart';
    const endId = prefix === 'difference' ? 'cdcDateDiffEnd' : 'cdcDateBusinessEnd';
    const start = byId<HTMLInputElement>(startId);
    const end = byId<HTMLInputElement>(endId);
    if (!start || !end) return;
    const temp = start.value;
    start.value = end.value;
    end.value = temp;
  }

  async function copyText(text: string): Promise<boolean> {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      const textarea = doc.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      doc.body.appendChild(textarea);
      textarea.select();
      let copied = false;
      try { copied = doc.execCommand('copy'); } catch (_copyError) { copied = false; }
      textarea.remove();
      return copied;
    }
  }

  async function copyResult(): Promise<void> {
    const ok = await copyText(lastResultText);
    const button = query<HTMLButtonElement>('[data-datecalc-copy]');
    if (!button) return;
    const label = query<HTMLElement>('span', button);
    if (label) label.textContent = ok ? 'Copiado' : 'Não foi possível copiar';
    setTimeout(() => { if (label) label.textContent = 'Copiar resultado'; }, 1600);
  }

  async function shareResult(): Promise<void> {
    if (!lastResultText) return;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Calculadora de datas · Conta de Casa', text: lastResultText });
        return;
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') return;
      }
    }
    await copyResult();
  }

  function printResult(): void {
    if (!lastResultText) return;
    doc.documentElement.classList.add('cdc-datecalc-print');
    const cleanup = () => doc.documentElement.classList.remove('cdc-datecalc-print');
    root.addEventListener('afterprint', cleanup, { once: true });
    root.print();
    setTimeout(cleanup, 1200);
  }

  function handleTabKeydown(event: KeyboardEvent): void {
    const target = (event.target as HTMLElement | null)?.closest?.<HTMLButtonElement>('[data-datecalc-mode]');
    if (!target) return;
    const tabs = queryAll<HTMLButtonElement>('[data-datecalc-mode]', target.closest('.cdc-datecalc-tabs') ?? doc);
    const index = tabs.indexOf(target);
    if (index < 0) return;
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    const mode = tabs[next]?.dataset.datecalcMode as CalculatorMode | undefined;
    if (mode) setMode(mode, true);
  }

  function installInteractions(): void {
    doc.addEventListener('click', event => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const opener = target.closest<HTMLElement>('[data-datecalc-open]');
      if (opener) { event.preventDefault(); openDialog(opener); return; }
      if (target.closest('[data-datecalc-close]')) { event.preventDefault(); closeDialog(); return; }
      const tab = target.closest<HTMLButtonElement>('[data-datecalc-mode]');
      if (tab) {
        event.preventDefault();
        const mode = tab.dataset.datecalcMode as CalculatorMode | undefined;
        if (mode) setMode(mode);
        return;
      }
      const todayButton = target.closest<HTMLButtonElement>('[data-datecalc-today]');
      if (todayButton) {
        event.preventDefault();
        const input = byId<HTMLInputElement>(todayButton.dataset.datecalcToday ?? '');
        if (input) { input.value = todayKey(); input.focus({ preventScroll: true }); }
        return;
      }
      const swapButton = target.closest<HTMLButtonElement>('[data-datecalc-swap]');
      if (swapButton) {
        event.preventDefault();
        const kind = swapButton.dataset.datecalcSwap;
        if (kind === 'difference' || kind === 'business') swap(kind);
        return;
      }
      const calculateButton = target.closest<HTMLButtonElement>('[data-datecalc-calculate]');
      if (calculateButton) {
        event.preventDefault();
        const mode = calculateButton.dataset.datecalcCalculate as CalculatorMode | undefined;
        if (mode) calculate(mode);
        return;
      }
      if (target.closest('[data-datecalc-copy]')) { event.preventDefault(); void copyResult(); return; }
      if (target.closest('[data-datecalc-share]')) { event.preventDefault(); void shareResult(); return; }
      if (target.closest('[data-datecalc-print]')) { event.preventDefault(); printResult(); }
    }, true);

    doc.addEventListener('keydown', event => {
      handleTabKeydown(event);
      if (event.key === 'Enter') {
        const panel = (event.target as HTMLElement | null)?.closest?.('[data-datecalc-panel]') as HTMLElement | null;
        if (panel && !((event.target as HTMLElement | null)?.matches('button,textarea'))) {
          const mode = panel.dataset.datecalcPanel as CalculatorMode | undefined;
          if (mode) { event.preventDefault(); calculate(mode); }
        }
      }
    }, true);

    const dialog = ensureDialog();
    dialog?.addEventListener('close', () => {
      if (lastLauncher?.isConnected) lastLauncher.focus({ preventScroll: true });
      lastLauncher = null;
    });
    dialog?.addEventListener('click', event => {
      if (event.target === dialog) closeDialog();
    });
  }

  function observeArchitecture(): void {
    const settingsPage = byId('page-settings');
    if (settingsPage) {
      launcherObserver = new MutationObserver(ensureLauncher);
      launcherObserver.observe(settingsPage, { childList: true, subtree: true });
    }
    const app = byId('app');
    if (app) {
      appHiddenObserver = new MutationObserver(() => {
        if (app.hidden) closeDialog();
      });
      appHiddenObserver.observe(app, { attributes: true, attributeFilter: ['hidden'] });
    }
  }

  function start(): void {
    doc.documentElement.dataset.dateCalculator = REVISION;
    ensureDialog();
    ensureLauncher();
    installInteractions();
    observeArchitecture();
    requestAnimationFrame(ensureLauncher);
    setTimeout(ensureLauncher, 120);
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})(globalThis as RootWithDateCalculator);
