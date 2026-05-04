// ============================================
// HELPERS DATES
// ============================================

export const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export const MOIS_FR_SHORT = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export const NOW = new Date();
export const PROJECT_START = new Date(2026, 2, 1); // 1er mars 2026

export function monthLabel(date) {
  return `${MOIS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

export function monthLabelShort(date) {
  return `${MOIS_FR_SHORT[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

export function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function isInMonth(isoDate, monthDate) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
}

export function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7; // dimanche = 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isoDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function isoWeekNumber(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const week1 = new Date(target.getFullYear(), 0, 4);
  return 1 + Math.round(((target - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
