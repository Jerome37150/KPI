import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { C, RADIUS, SHADOW } from '../../styles/theme';

// ============================================
// Modal — overlay + carte centrée, fermeture clavier (ESC) + clic dehors
// ============================================
export function Modal({
  open, onClose, title, overline, icon: Icon, accent = C.orange,
  width = 880, children, footer,
}) {
  const cardRef = useRef(null);

  // ESC pour fermer
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    document.addEventListener("keydown", onKey);
    // Verrouille le scroll de la page
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={() => onClose?.()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(9, 9, 11, 0.55)",
        backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "modalFadeIn 0.18s ease",
      }}
    >
      {/* Animation locale */}
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideIn { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>

      <div
        ref={cardRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: C.paper, borderRadius: RADIUS.lg,
          boxShadow: SHADOW.card, border: `1px solid ${C.line}`,
          width: "100%", maxWidth: width, maxHeight: "92vh",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "modalSlideIn 0.22s ease",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {overline && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 4,
                fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
                color: accent, fontWeight: 700,
              }}>
                {Icon && <Icon size={12} color={accent} strokeWidth={2.2} />}
                {overline}
              </div>
            )}
            <h3 style={{
              fontSize: 18, fontWeight: 700, color: C.ink,
              letterSpacing: "-0.01em", margin: 0, lineHeight: 1.2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{title}</h3>
          </div>
          <button
            onClick={() => onClose?.()}
            aria-label="Fermer"
            style={{
              width: 32, height: 32, borderRadius: RADIUS.md,
              background: C.bgSoft, border: `1px solid ${C.line}`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: C.inkSoft,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.gray100; e.currentTarget.style.color = C.ink; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.bgSoft; e.currentTarget.style.color = C.inkSoft; }}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Body scrollable */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: "12px 24px", borderTop: `1px solid ${C.line}`,
            background: C.bgSoft, flexShrink: 0,
          }}>{footer}</div>
        )}
      </div>
    </div>
  );
}
