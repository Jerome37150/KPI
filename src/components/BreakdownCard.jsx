import { C, RADIUS } from '../styles/theme';
import { Card } from './primitives/Card';
import { TrendBadge } from './primitives/TrendBadge';
import { paletteColor } from '../utils/colors';

// ============================================
// BreakdownCard — ligne par ligne avec barre + comparatif
// entries: [{ label, current, previous }]
// ============================================
export function BreakdownCard({ title, icon: Icon, entries, currentLabel, previousLabel, getColor, invertTrend = true }) {
  const max = Math.max(1, ...entries.map(e => Math.max(e.current, e.previous)));

  return (
    <Card padding={20}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 16, gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {Icon && <Icon size={13} color={C.orange} strokeWidth={2.2} />}
          <div style={{
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>{title}</div>
        </div>
        {currentLabel && previousLabel && (
          <div style={{ display: "inline-flex", gap: 12, fontSize: 10, fontWeight: 600 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.inkSoft }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: C.orange }} />
              {currentLabel}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.inkDim }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: C.gray400 }} />
              {previousLabel}
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {entries.length === 0 && (
          <div style={{ fontSize: 12, color: C.inkDim, padding: "12px 0" }}>Aucune donnée</div>
        )}
        {entries.map((e, i) => {
          const color = getColor ? getColor(e.label, i) : paletteColor(i);
          const currentPct = (e.current / max) * 100;
          const prevPct    = (e.previous / max) * 100;
          const delta = e.current - e.previous;
          const sameValue = delta === 0;

          return (
            <div key={e.label}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft }}>{e.label}</span>
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color, letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums" }}>{e.current}</span>
                  {!sameValue && <TrendBadge delta={delta} suffix="" invertColors={invertTrend} size="sm" />}
                </div>
              </div>
              {/* Bar */}
              <div style={{ position: "relative", height: 4, background: C.gray100, borderRadius: RADIUS.sm, overflow: "hidden" }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "100%",
                  width: `${prevPct}%`, background: C.gray300, borderRadius: RADIUS.sm,
                }} />
                <div style={{
                  position: "absolute", top: 0, left: 0, height: "100%",
                  width: `${currentPct}%`, background: color, borderRadius: RADIUS.sm,
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
