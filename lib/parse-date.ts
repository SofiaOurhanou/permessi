/** Accetta `YYYY-MM-DD` (interpretato come mezzanotte UTC) o ISO completo. */
export function parseFlexibleDateInput(s: string): Date {
  const t = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return new Date(`${t}T12:00:00.000Z`);
  }
  return new Date(t);
}
