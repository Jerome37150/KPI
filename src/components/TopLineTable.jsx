import { useMemo, useState } from 'react';
import { Building2, Download, Search } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from './primitives/Card';

// ============================================
// TopLineTable — fenêtres Top Line avec colonnes Pers / Temps
// Triables, filtrables par équipe/bloc, exportable CSV
// ============================================
const PHASES = [
  { key: "maquette", label: "Maq." },
  { key: "back",     label: "Back" },
  { key: "front",    label: "Front" },
  { key: "design",   label: "Design" },
  { key: "test",     label: "Test" },
];

function formatPers(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(" · ");
  return String(v);
}

function formatTemps(n) {
  if (n == null || n === 0) return "";
  if (Number.isInteger(n)) return `${n} j`;
  return `${Number(n.toFixed(2))} j`;
}

function formatLastEdited(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const day = 86400000;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / day);
  let rel;
  if (minutes < 60)      rel = minutes <= 1 ? "à l'instant" : `il y a ${minutes} min`;
  else if (hours < 24)   rel = `il y a ${hours} h`;
  else if (days < 7)     rel = `il y a ${days} j`;
  else                   rel = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
  const full = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
    timeZone: "Europe/Paris",
  }).format(d);
  return { rel, full, iso, date: d };
}

function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows) {
  const headers = [
    "Nom de la fonction", "Bloc",
    "Pers. Maquette/UX", "Pers. Back", "Pers. Front", "Pers. Design", "Pers. Test",
    "Temps Maquette/UX (j)", "Temps Back (j)", "Temps Front (j)", "Temps Design (j)", "Temps Test (j)",
    "Temps total (j)",
    "Dernière maj",
  ];
  const lines = [headers.map(csvEscape).join(";")];
  rows.forEach(t => {
    const total =
      (t.temps?.maquette || 0) + (t.temps?.back || 0) + (t.temps?.front || 0) +
      (t.temps?.design || 0)   + (t.temps?.test || 0);
    const maj = formatLastEdited(t.lastEdited);
    lines.push([
      t.nom || "",
      t.bloc || "",
      Array.isArray(t.pers?.maquette) ? t.pers.maquette.join(" · ") : (t.pers?.maquette || ""),
      t.pers?.back || "",
      t.pers?.front || "",
      t.pers?.design || "",
      Array.isArray(t.pers?.test) ? t.pers.test.join(" · ") : (t.pers?.test || ""),
      t.temps?.maquette ?? "",
      t.temps?.back     ?? "",
      t.temps?.front    ?? "",
      t.temps?.design   ?? "",
      t.temps?.test     ?? "",
      total || "",
      maj?.full || "",
    ].map(csvEscape).join(";"));
  });
  // BOM utf-8 pour Excel
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `topline-immobilisation-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function TopLineTable({ items }) {
  const [filter, setFilter] = useState("");

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    let list = items;
    if (q) {
      list = items.filter(t => {
        const blob = [
          t.nom, t.bloc,
          ...(Array.isArray(t.pers?.maquette) ? t.pers.maquette : [t.pers?.maquette]),
          t.pers?.back, t.pers?.front, t.pers?.design,
          ...(Array.isArray(t.pers?.test) ? t.pers.test : [t.pers?.test]),
        ].filter(Boolean).join(" ").toLowerCase();
        return blob.includes(q);
      });
    }
    // Lignes avec du temps renseigné en haut, lignes vides en bas
    const totalOf = t =>
      (t.temps?.maquette || 0) + (t.temps?.back || 0) + (t.temps?.front || 0) +
      (t.temps?.design || 0)   + (t.temps?.test || 0);
    return [...list].sort((a, b) => {
      const ta = totalOf(a);
      const tb = totalOf(b);
      const filledA = ta > 0;
      const filledB = tb > 0;
      if (filledA !== filledB) return filledA ? -1 : 1;
      if (filledA) return tb - ta; // les plus chargées d'abord
      return (a.nom || "").localeCompare(b.nom || "", "fr");
    });
  }, [items, filter]);

  const totals = useMemo(() => {
    const t = { maquette: 0, back: 0, front: 0, design: 0, test: 0, total: 0 };
    rows.forEach(r => {
      PHASES.forEach(p => { t[p.key] += r.temps?.[p.key] || 0; });
    });
    t.total = t.maquette + t.back + t.front + t.design + t.test;
    return t;
  }, [rows]);

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      {/* En-tête : titre + recherche + export */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Building2 size={13} color={C.orange} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>Immobilisation · {items.length} fenêtres</div>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          {/* Recherche */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: RADIUS.md,
            background: C.paper, border: `1px solid ${C.line}`,
          }}>
            <Search size={13} color={C.inkDim} strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Filtrer (nom, bloc, pers.)"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontFamily: "inherit", fontSize: 12, color: C.ink,
                width: 220,
              }}
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={() => downloadCsv(rows)}
            disabled={rows.length === 0}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: RADIUS.md,
              background: rows.length === 0 ? C.bgSoft : C.orange,
              color: rows.length === 0 ? C.inkMute : "#fff",
              border: rows.length === 0 ? `1px solid ${C.line}` : "none",
              cursor: rows.length === 0 ? "not-allowed" : "pointer",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
              fontFamily: "inherit", transition: "background 0.15s",
            }}
            title="Exporter au format CSV (compatible Excel)"
          >
            <Download size={13} strokeWidth={2.4} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            {/* Ligne de groupes */}
            <tr style={{ background: C.gray50 }}>
              <th rowSpan={2} style={thBase()}>Nom de la fonction</th>
              <th rowSpan={2} style={thBase({ textAlign: "left" })}>Bloc</th>
              <th colSpan={5} style={thGroup({ borderLeft: `1px solid ${C.line}` })}>Pers en charge</th>
              <th colSpan={5} style={thGroup({ borderLeft: `1px solid ${C.line}`, color: C.orange })}>Temps (j)</th>
              <th rowSpan={2} style={thBase({ textAlign: "right", borderLeft: `1px solid ${C.line}` })}>Total</th>
              <th rowSpan={2} style={thBase({ textAlign: "right", borderLeft: `1px solid ${C.line}` })}>Maj</th>
            </tr>
            {/* Ligne de phases */}
            <tr style={{ background: C.gray50 }}>
              {PHASES.map((p, i) => (
                <th key={`pers-${p.key}`} style={thBase({
                  borderLeft: i === 0 ? `1px solid ${C.line}` : "none",
                  fontWeight: 600, color: C.inkSoft,
                })}>{p.label}</th>
              ))}
              {PHASES.map((p, i) => (
                <th key={`temps-${p.key}`} style={thBase({
                  borderLeft: i === 0 ? `1px solid ${C.line}` : "none",
                  fontWeight: 600, color: C.inkSoft, textAlign: "right",
                })}>{p.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={14} style={{ padding: 32, textAlign: "center", color: C.inkDim }}>
                  Aucune fenêtre {filter ? "ne correspond au filtre" : ""}
                </td>
              </tr>
            )}
            {rows.map((t, i) => {
              const total = PHASES.reduce((s, p) => s + (t.temps?.[p.key] || 0), 0);
              return (
                <tr key={t.id || i} style={{
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.gray100}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{
                    padding: "10px 12px", color: C.ink, fontWeight: 600,
                    maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={t.nom}>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" style={{
                        color: C.ink, textDecoration: "none",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.orange; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.ink; }}
                      >{t.nom || "—"}</a>
                    ) : (t.nom || "—")}
                  </td>
                  <td style={tdMuted()}>{t.bloc || "—"}</td>
                  {PHASES.map((p, idx) => {
                    const v = formatPers(t.pers?.[p.key]);
                    return (
                      <td key={`pers-${p.key}`} style={{
                        ...tdMuted(),
                        borderLeft: idx === 0 ? `1px solid ${C.gray100}` : "none",
                        maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }} title={v}>
                        {v || <span style={{ color: C.inkMute }}>—</span>}
                      </td>
                    );
                  })}
                  {PHASES.map((p, idx) => {
                    const v = t.temps?.[p.key] || 0;
                    return (
                      <td key={`temps-${p.key}`} style={{
                        ...tdNum(),
                        borderLeft: idx === 0 ? `1px solid ${C.gray100}` : "none",
                        color: v > 0 ? C.inkSoft : C.inkMute,
                      }}>
                        {v > 0 ? formatTemps(v) : "—"}
                      </td>
                    );
                  })}
                  <td style={{
                    ...tdNum(),
                    borderLeft: `1px solid ${C.gray100}`,
                    color: total > 0 ? C.ink : C.inkMute,
                    fontWeight: 700,
                  }}>
                    {total > 0 ? formatTemps(total) : "—"}
                  </td>
                  {/* Dernière maj */}
                  {(() => {
                    const maj = formatLastEdited(t.lastEdited);
                    return (
                      <td style={{
                        ...tdNum(),
                        borderLeft: `1px solid ${C.gray100}`,
                        color: maj ? C.inkDim : C.inkMute,
                        fontVariantNumeric: "normal",
                      }}
                      title={maj?.full || ""}>
                        {maj?.rel || "—"}
                      </td>
                    );
                  })()}
                </tr>
              );
            })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr style={{ background: C.gray50, borderTop: `2px solid ${C.line}` }}>
                <td style={{
                  padding: "10px 12px", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase", color: C.ink,
                }} colSpan={2}>Total</td>
                {PHASES.map((p, idx) => (
                  <td key={`pad-${p.key}`} style={{
                    ...tdNum(),
                    borderLeft: idx === 0 ? `1px solid ${C.line}` : "none",
                    color: C.inkMute,
                  }}>—</td>
                ))}
                {PHASES.map((p, idx) => (
                  <td key={`tot-${p.key}`} style={{
                    ...tdNum(),
                    borderLeft: idx === 0 ? `1px solid ${C.line}` : "none",
                    fontWeight: 700, color: totals[p.key] > 0 ? C.ink : C.inkMute,
                  }}>
                    {totals[p.key] > 0 ? formatTemps(totals[p.key]) : "—"}
                  </td>
                ))}
                <td style={{
                  ...tdNum(),
                  borderLeft: `1px solid ${C.line}`,
                  fontWeight: 800, color: C.orange,
                }}>
                  {totals.total > 0 ? formatTemps(totals.total) : "—"}
                </td>
                <td style={{
                  ...tdNum(),
                  borderLeft: `1px solid ${C.line}`,
                  color: C.inkMute,
                }}>—</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </Card>
  );
}

// ── Style helpers (cellules) ──
function thBase(extra = {}) {
  return {
    textAlign: "left", padding: "10px 12px",
    fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
    color: C.gray400, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
    whiteSpace: "nowrap", verticalAlign: "middle",
    ...extra,
  };
}
function thGroup(extra = {}) {
  return {
    textAlign: "center", padding: "8px 12px",
    fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
    color: C.inkSoft, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
    whiteSpace: "nowrap",
    ...extra,
  };
}
function tdMuted() {
  return {
    padding: "10px 12px", color: C.inkSoft, fontSize: 12, whiteSpace: "nowrap",
  };
}
function tdNum() {
  return {
    padding: "10px 12px", textAlign: "right",
    fontVariantNumeric: "tabular-nums", fontSize: 12,
    whiteSpace: "nowrap",
  };
}
