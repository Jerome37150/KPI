import { C, RADIUS } from '../styles/theme';
import { Card } from './primitives/Card';
import { TrendBadge } from './primitives/TrendBadge';

// ============================================
// KpiCard — chiffre macro avec icône + delta vs précédent
// invertTrend=true : baisse = vert (cas bugs)
// ============================================
export function KpiCard({ icon: Icon, label, sub, value, previous, invertTrend = true, color = C.ink }) {
  const delta = previous === 0
    ? (value > 0 ? 100 : 0)
    : Math.round(((value - previous) / previous) * 100);

  return (
    <Card padding={18}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: RADIUS.md,
          background: C.bgSoft, border: `1px solid ${C.line}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={15} color={C.inkSoft} strokeWidth={2} />}
        </div>
        {(value !== previous) && (
          <TrendBadge delta={delta} suffix="%" invertColors={invertTrend} size="sm" />
        )}
      </div>

      <div>
        <div style={{
          fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
          color: C.gray400, fontWeight: 700, marginBottom: 4,
        }}>{label}</div>
        <div style={{
          fontSize: 28, fontWeight: 700, color, lineHeight: 1.1,
          letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
          margin: "4px 0 4px",
        }}>{value}</div>
        <div style={{ fontSize: 11, color: C.inkDim }}>
          {sub && <span>{sub} · </span>}
          <span>préc. {previous}</span>
        </div>
      </div>
    </Card>
  );
}
