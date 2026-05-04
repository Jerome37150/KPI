import { useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { C } from '../styles/theme';
import { Card } from './primitives/Card';
import { Pill } from './primitives/Pill';
import { CLASSIF_COLORS, PRIO_COLORS } from '../utils/colors';
import { formatDateShort } from '../utils/format';

// ============================================
// TicketsTable — N derniers tickets enregistrés
// ============================================
export function TicketsTable({ tickets, limit = 20, title = "20 derniers tickets enregistrés" }) {
  const rows = useMemo(() => {
    return [...tickets]
      .filter(t => t.dateCreation)
      .sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation))
      .slice(0, limit);
  }, [tickets, limit]);

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Inbox size={13} color={C.orange} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>{title}</div>
        </div>
        <span style={{ fontSize: 11, color: C.inkDim }}>
          Total : <span style={{ color: C.inkSoft, fontWeight: 700 }}>{tickets.length}</span>
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.gray50 }}>
              {["Date", "ID", "Titre", "Classification", "Priorisation", "Produits", "Fonctions"].map(h => (
                <th key={h} style={{
                  textAlign: "left", padding: "10px 16px",
                  fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: C.gray400, fontWeight: 700,
                  borderBottom: `1px solid ${C.gray200}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: 32, textAlign: "center", color: C.inkDim }}>
                  Aucun ticket
                </td>
              </tr>
            )}
            {rows.map((t, i) => {
              const classifColor = CLASSIF_COLORS[t.classification] || C.inkSoft;
              const prioColor    = PRIO_COLORS[t.priorisation] || C.inkDim;
              const produits     = Array.isArray(t.produits) ? t.produits : [];
              return (
                <tr key={t.id || i} style={{
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.gray100}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{ padding: "12px 16px", color: C.inkSoft, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {formatDateShort(t.dateCreation)}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: C.inkSoft, whiteSpace: "nowrap" }}>
                    {t.identifiant || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.ink, maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={t.titre}>
                    {t.titre || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {t.classification
                      ? <Pill color={classifColor} size="sm">{t.classification}</Pill>
                      : <span style={{ color: C.inkMute }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {t.priorisation
                      ? <Pill color={prioColor} size="sm">{t.priorisation}</Pill>
                      : <span style={{ color: C.inkMute }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.inkSoft, fontSize: 12 }}>
                    {produits.length === 0
                      ? <span style={{ color: C.inkMute }}>—</span>
                      : <span title={produits.join(", ")} style={{
                          display: "inline-block", maxWidth: 200,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          verticalAlign: "middle",
                        }}>{produits.join(", ")}</span>}
                  </td>
                  <td style={{ padding: "12px 16px", color: C.inkSoft, fontSize: 12, whiteSpace: "nowrap" }}>
                    {t.fonctions || <span style={{ color: C.inkMute }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
