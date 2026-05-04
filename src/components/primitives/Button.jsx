import { C } from '../../styles/theme';

// ============================================
// Button — primary / outline / ghost
// ============================================
export function Button({ children, variant = "primary", onClick, icon: Icon, size = "md", disabled = false, type = "button" }) {
  const styles = {
    primary: { background: C.orange,      color: "#fff",    border: `1px solid ${C.orange}` },
    outline: { background: "transparent", color: C.orange,  border: `1.5px solid ${C.orange}` },
    ghost:   { background: "transparent", color: C.inkSoft, border: `1px solid ${C.line}` },
  };
  const padding  = size === "sm" ? "8px 14px" : "10px 20px";
  const fontSize = size === "sm" ? 12 : 13;

  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant], padding, borderRadius: 999, fontSize, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      display: "inline-flex", alignItems: "center", gap: 8,
      transition: "all 0.15s", fontFamily: "inherit",
      opacity: disabled ? 0.5 : 1,
    }}
      onMouseEnter={e => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = C.orangeHover;
        if (variant === "outline") { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = "#fff"; }
        if (variant === "ghost")   e.currentTarget.style.borderColor = C.gray400;
      }}
      onMouseLeave={e => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = C.orange;
        if (variant === "outline") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.orange; }
        if (variant === "ghost")   e.currentTarget.style.borderColor = C.line;
      }}
    >
      {Icon && <Icon size={size === "sm" ? 13 : 14} strokeWidth={2.2} />}
      {children}
    </button>
  );
}
