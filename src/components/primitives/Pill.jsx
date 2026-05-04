// ============================================
// Pill — badge tonal (background coloré faible + texte coloré)
// ============================================
export function Pill({ children, color, soft = true, size = "md" }) {
  const padding  = size === "sm" ? "3px 8px" : "5px 12px";
  const fontSize = size === "sm" ? 10 : 11;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding, borderRadius: 999, fontSize, fontWeight: 600,
      letterSpacing: "0.02em", whiteSpace: "nowrap",
      background: soft ? `${color}1A` : color,
      color: soft ? color : "#fff",
    }}>{children}</span>
  );
}
