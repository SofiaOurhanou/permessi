/** Inizio mese UTC (mezzanotte del primo giorno). */
export function monthStartUtc(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0, 0));
}

/** Fine mese UTC (ultimo istante del mese, 23:59:59.999). */
export function monthEndUtc(year: number, monthIndex0: number): Date {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0, 23, 59, 59, 999));
}

/** Normalizza a mezzanotte UTC del calendario. */
export function utcDateOnly(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Giorni inclusivi tra due date (solo componente data UTC). */
export function inclusiveUtcDaysBetween(a: Date, b: Date): number {
  const ta = utcDateOnly(a);
  const tb = utcDateOnly(b);
  if (tb < ta) return 0;
  const MS = 86400000;
  return Math.floor((tb - ta) / MS) + 1;
}

/** Giorni nella intersezione [rangeStart, rangeEnd] ∩ [winStart, winEnd] (inclusivo, date UTC). */
export function overlapInclusiveDays(
  rangeStart: Date,
  rangeEnd: Date,
  winStart: Date,
  winEnd: Date,
): number {
  const rs = utcDateOnly(rangeStart);
  const re = utcDateOnly(rangeEnd);
  const ws = utcDateOnly(winStart);
  const we = utcDateOnly(winEnd);
  const start = Math.max(rs, ws);
  const end = Math.min(re, we);
  if (end < start) return 0;
  return Math.floor((end - start) / 86400000) + 1;
}
