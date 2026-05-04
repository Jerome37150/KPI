// ============================================
// HELPERS FORMAT
// ============================================

export function formatDateShort(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "2-digit",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Europe/Paris",
    }).format(d);
  } catch (e) {
    return "—";
  }
}

export function formatLastRefresh(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Europe/Paris",
    }).format(d);
  } catch (e) {
    return null;
  }
}
