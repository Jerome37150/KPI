import { C } from '../../styles/theme';

// ============================================
// SectionTitle — overline orange + titre + sous-titre + icône optionnelle
// Convention inaxel-pilot : overline 11px / 700 / 0.06em / uppercase / orange
// ============================================
export function SectionTitle({ overline, children, sub, icon: Icon }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {overline && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          {Icon && <Icon size={13} color={C.orange} strokeWidth={2.2} />}
          <div style={{
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>{overline}</div>
        </div>
      )}
      <h2 style={{
        fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em",
        margin: 0, color: C.ink, lineHeight: 1.2,
      }}>{children}</h2>
      {sub && <div style={{ fontSize: 12, color: C.inkDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
