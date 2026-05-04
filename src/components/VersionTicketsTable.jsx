import { useMemo } from 'react';
import {
  Inbox, MessageCircle, Paperclip, ExternalLink,
  ChevronsUp, Minus, ChevronsDown,
} from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from './primitives/Card';
import { Pill } from './primitives/Pill';
import { CLASSIF_COLORS, PRIO_COLORS } from '../utils/colors';

const PRIO_ICONS = {
  "Haute":       ChevronsUp,
  "Moyenne":     Minus,
  "Pas urgente": ChevronsDown,
};

// ============================================
// VersionTicketsTable — tableau d'une version stable
// Colonnes : titre / classif / prio / initiale ajout / comm / pièce jointe
// ============================================
export function VersionTicketsTable({ tickets, title = "Tickets livrés" }) {
  const rows = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const ai = a.identifiant || "";
      const bi = b.identifiant || "";
      return ai.localeCompare(bi, "fr", { numeric: true });
    });
  }, [tickets]);

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
              {["Titre", "Classification", "Priorisation", "Initiale ajout", "Comm.", "P.J."].map(h => (
                <th key={h} style={{
                  textAlign: "left", padding: "10px 16px",
                  fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: C.gray400, fontWeight: 700,
                  borderBottom: `1px solid ${C.gray200}`,
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.inkDim }}>
                  Aucun ticket
                </td>
              </tr>
            )}
            {rows.map((t, i) => {
              const classifColor = CLASSIF_COLORS[t.classification] || C.inkSoft;
              const prioColor    = PRIO_COLORS[t.priorisation] || C.inkDim;
              const initiales    = Array.isArray(t.initialeAjout) ? t.initialeAjout : [];
              const comms        = Array.isArray(t.communication) ? t.communication : [];
              const hasComm      = comms.length > 0;
              const hasPiece     = !!t.pieceJointe;

              return (
                <tr key={t.id || i} style={{
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.gray100}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Titre — lien Notion si dispo */}
                  <td style={{
                    padding: "12px 16px", color: C.ink,
                    maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={t.titre}>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" style={{
                        color: C.ink, textDecoration: "none", fontWeight: 500,
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.orange; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.ink; }}
                      >
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: C.inkDim,
                          fontVariantNumeric: "tabular-nums",
                        }}>{t.identifiant || ""}</span>
                        <span>{t.titre || "—"}</span>
                        <ExternalLink size={11} color={C.inkMute} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: C.inkDim,
                          fontVariantNumeric: "tabular-nums", marginRight: 6,
                        }}>{t.identifiant || ""}</span>
                        {t.titre || "—"}
                      </span>
                    )}
                  </td>

                  {/* Classification */}
                  <td style={{ padding: "12px 16px" }}>
                    {t.classification
                      ? <Pill color={classifColor} size="sm">{t.classification}</Pill>
                      : <span style={{ color: C.inkMute }}>—</span>}
                  </td>

                  {/* Priorisation */}
                  <td style={{ padding: "12px 16px" }}>
                    {t.priorisation ? (() => {
                      const PrioIcon = PRIO_ICONS[t.priorisation] || Minus;
                      return (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontWeight: 500, color: C.ink,
                          whiteSpace: "nowrap",
                        }} title={t.priorisation}>
                          <PrioIcon size={14} strokeWidth={2.4} color={prioColor} />
                          {t.priorisation}
                        </span>
                      );
                    })() : <span style={{ color: C.inkMute }}>—</span>}
                  </td>

                  {/* Initiale ajout */}
                  <td style={{ padding: "12px 16px", color: C.ink, fontSize: 12, fontWeight: 500 }}>
                    {initiales.length === 0
                      ? <span style={{ color: C.inkMute }}>—</span>
                      : initiales.join(" · ")}
                  </td>

                  {/* Communication */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {hasComm ? (
                      <span title={comms.join(" · ")} style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 26, height: 26, borderRadius: RADIUS.full,
                        background: C.blueSoft, color: C.blue,
                      }}>
                        <MessageCircle size={13} strokeWidth={2.2} />
                      </span>
                    ) : (
                      <span style={{ color: C.gray300 }}>—</span>
                    )}
                  </td>

                  {/* Pièce jointe */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {hasPiece ? (
                      <a
                        href={t.pieceJointe.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={t.pieceJointe.name || "Pièce jointe"}
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 26, height: 26, borderRadius: RADIUS.full,
                          background: C.orangeBg, color: C.orange,
                          textDecoration: "none", transition: "transform 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        <Paperclip size={13} strokeWidth={2.2} />
                      </a>
                    ) : (
                      <span style={{ color: C.gray300 }}>—</span>
                    )}
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
