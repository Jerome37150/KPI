import { useState, useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from './primitives/Card';
import { NOW, PROJECT_START, startOfWeek, startOfMonth, isoDateKey, isoWeekNumber, monthLabelShort, shiftMonth } from '../utils/dates';

// ============================================
// TimelineChart — volume par semaine ou mois depuis PROJECT_START
// ============================================
export function TimelineChart({ tickets, dateField = "dateCreation", title = "Volume d'enregistrement" }) {
  const [mode, setMode] = useState("week"); // "week" | "month"

  const buckets = useMemo(() => {
    const result = [];
    if (mode === "week") {
      let cursor = startOfWeek(PROJECT_START);
      const end = startOfWeek(NOW);
      while (cursor <= end) {
        result.push({ key: isoDateKey(cursor), start: new Date(cursor), count: 0 });
        cursor = new Date(cursor);
        cursor.setDate(cursor.getDate() + 7);
      }
    } else {
      let cursor = startOfMonth(PROJECT_START);
      const end = startOfMonth(NOW);
      while (cursor <= end) {
        result.push({ key: isoDateKey(cursor), start: new Date(cursor), count: 0 });
        cursor = shiftMonth(cursor, 1);
      }
    }

    const idx = new Map(result.map((b, i) => [b.key, i]));
    tickets.forEach(t => {
      if (!t[dateField]) return;
      const d = new Date(t[dateField]);
      if (isNaN(d.getTime()) || d < PROJECT_START) return;
      const bucketStart = mode === "week" ? startOfWeek(d) : startOfMonth(d);
      const k = isoDateKey(bucketStart);
      const i = idx.get(k);
      if (i !== undefined) result[i].count++;
    });

    return result;
  }, [tickets, mode, dateField]);

  const maxCount = Math.max(1, ...buckets.map(b => b.count));
  const total    = buckets.reduce((s, b) => s + b.count, 0);

  return (
    <Card padding={20}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 18, gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <BarChart3 size={13} color={C.orange} strokeWidth={2.2} />
            <div style={{
              fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
              color: C.orange, fontWeight: 700,
            }}>{title}</div>
          </div>
          <div style={{ fontSize: 12, color: C.inkDim }}>
            Depuis mars 2026 · <span style={{ color: C.inkSoft, fontWeight: 600 }}>{total} tickets</span>
          </div>
        </div>

        <div style={{
          display: "inline-flex", background: C.bgSoft, borderRadius: 999,
          padding: 3, border: `1px solid ${C.line}`,
        }}>
          {[
            { key: "week",  label: "Semaine" },
            { key: "month", label: "Mois"    },
          ].map(opt => {
            const active = mode === opt.key;
            return (
              <button key={opt.key} onClick={() => setMode(opt.key)} style={{
                padding: "6px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                background: active ? C.paper : "transparent",
                color: active ? C.ink : C.inkSoft,
                border: "none", borderRadius: 999, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
                boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}>{opt.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "flex-end",
        gap: mode === "week" ? 4 : 10,
        height: 160, paddingBottom: 28, position: "relative",
        overflowX: "auto",
      }}>
        {buckets.map(b => {
          const h = (b.count / maxCount) * 130;
          const isCurrent = mode === "week"
            ? isoDateKey(startOfWeek(NOW)) === b.key
            : isoDateKey(startOfMonth(NOW)) === b.key;

          let primary, secondary;
          if (mode === "week") {
            primary = `S${isoWeekNumber(b.start)}`;
            secondary = `${String(b.start.getDate()).padStart(2, "0")}/${String(b.start.getMonth() + 1).padStart(2, "0")}`;
          } else {
            primary = monthLabelShort(b.start);
            secondary = "";
          }

          return (
            <div key={b.key} style={{
              flex: mode === "week" ? "1 1 18px" : "1 1 60px",
              minWidth: mode === "week" ? 18 : 40,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              position: "relative",
            }} title={`${b.count} ticket(s)`}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: b.count > 0 ? C.inkSoft : C.inkMute,
                marginBottom: 2, height: 14,
              }}>{b.count > 0 ? b.count : ""}</div>
              <div style={{
                width: "100%", maxWidth: mode === "week" ? 16 : 40,
                height: Math.max(2, h),
                background: isCurrent ? C.orange : (b.count > 0 ? C.orangeHover : C.gray200),
                borderRadius: RADIUS.sm, transition: "height 0.4s ease",
              }} />
              <div style={{
                position: "absolute", bottom: -22, left: 0, right: 0,
                fontSize: 9, fontWeight: 600, color: C.inkDim, textAlign: "center",
                lineHeight: 1.2,
              }}>
                <div>{primary}</div>
                {secondary && <div style={{ color: C.inkMute, fontSize: 8 }}>{secondary}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
