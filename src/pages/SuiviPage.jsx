import { useMemo, useState } from 'react';
import {
  LineChart, Layers, Building2, CalendarDays, Clock, CheckCircle2,
  PenTool, Server, MonitorSmartphone, Palette, FlaskConical, ExternalLink, Rocket,
} from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { Modal } from '../components/primitives/Modal';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { paletteColor } from '../utils/colors';

// ============================================
// SuiviPage — vue macro Top Line : indicateurs par groupe + matrice phases × mois
// ============================================

const PHASES = [
  { key: "maquette", label: "Maquette", icon: PenTool },
  { key: "back",     label: "Back",     icon: Server },
  { key: "front",    label: "Front",    icon: MonitorSmartphone },
  { key: "design",   label: "Design",   icon: Palette },
  { key: "test",     label: "Test",     icon: FlaskConical },
];

const FRENCH_MONTHS = {
  "janvier": 0, "février": 1, "fevrier": 1, "mars": 2, "avril": 3, "mai": 4,
  "juin": 5, "juillet": 6, "août": 7, "aout": 7, "septembre": 8,
  "octobre": 9, "novembre": 10, "décembre": 11, "decembre": 11,
};

function parseSprintMonth(s) {
  if (!s) return null;
  const m = String(s).trim().toLowerCase().match(/^([a-zàâäéèêëïîôöùûüç]+)\s+(\d{4})$/i);
  if (!m) return null;
  const month = FRENCH_MONTHS[m[1]];
  if (month == null) return null;
  return new Date(parseInt(m[2], 10), month, 1);
}

function shortMonthLabel(date) {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  return `${months[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function formatDays(n) {
  if (!n) return "0 j";
  if (Number.isInteger(n)) return `${n} j`;
  return `${Number(n.toFixed(1))} j`;
}

export function SuiviPage({ data }) {
  const items = data.topline || [];
  const [openBloc, setOpenBloc] = useState(null);

  // ── KPIs globaux ──
  const globals = useMemo(() => {
    let totalTime = 0, doneCount = 0, totalPhases = 0, sumAv = 0;
    items.forEach(t => {
      PHASES.forEach(p => {
        totalTime += t.temps?.[p.key] || 0;
        sumAv     += t.avancement?.[p.key] || 0;
        if (t.etat?.[p.key] === "FAIT") doneCount++;
        totalPhases++;
      });
    });
    const avgPct = totalPhases > 0 ? Math.round((sumAv / totalPhases) * 100) : 0;
    return {
      total: items.length,
      time:  totalTime,
      done:  doneCount,
      totalPhases,
      avgPct,
    };
  }, [items]);

  // ── Stats par groupe ──
  const blocs = useMemo(() => {
    const map = new Map();
    items.forEach(t => {
      if (!t.groupe) return; // exclut les fenêtres sans groupe
      if (!map.has(t.groupe)) {
        map.set(t.groupe, {
          name: t.groupe, count: 0, time: 0,
          avSum: 0, avTotal: 0,
          items: [],
          byPhase: PHASES.reduce((a, p) => ({ ...a, [p.key]: { sum: 0, count: 0, fait: 0, encours: 0 } }), {}),
        });
      }
      const e = map.get(t.groupe);
      e.count++;
      e.items.push(t);
      PHASES.forEach(p => {
        const val = t.avancement?.[p.key] || 0;
        e.time   += t.temps?.[p.key] || 0;
        e.avSum  += val;
        e.avTotal++;
        e.byPhase[p.key].sum += val;
        e.byPhase[p.key].count++;
        if (t.etat?.[p.key] === "FAIT")     e.byPhase[p.key].fait++;
        if (t.etat?.[p.key] === "En cours") e.byPhase[p.key].encours++;
      });
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [items]);

  const blocByName = useMemo(() => {
    const m = new Map();
    blocs.forEach((b, i) => m.set(b.name, { bloc: b, color: paletteColor(i) }));
    return m;
  }, [blocs]);

  const opened = openBloc ? blocByName.get(openBloc) : null;

  // ── Matrice phases × mois ──
  const matrix = useMemo(() => {
    const monthMap = new Map(); // key "YYYY-MM" → { date, label }
    const cells = {}; // phase|key → { total, fait, encours }

    items.forEach(t => {
      PHASES.forEach(p => {
        const sprint = t.sprint?.[p.key];
        const date = parseSprintMonth(sprint);
        if (!date) return;
        const k = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthMap.has(k)) monthMap.set(k, { key: k, date, label: shortMonthLabel(date) });
        const cellKey = `${p.key}|${k}`;
        if (!cells[cellKey]) cells[cellKey] = { total: 0, fait: 0, encours: 0 };
        cells[cellKey].total++;
        if (t.etat?.[p.key] === "FAIT") cells[cellKey].fait++;
        else if (t.etat?.[p.key] === "En cours") cells[cellKey].encours++;
      });
    });

    const months = [...monthMap.values()].sort((a, b) => a.date - b.date);
    const maxCount = Math.max(1, ...Object.values(cells).map(c => c.total));
    return { months, cells, maxCount };
  }, [items]);

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionTitle overline="Naxi.G Full Saas" icon={LineChart}>Suivi</SectionTitle>
        <Card padding={32}>
          <div style={{ textAlign: "center", color: C.inkDim, fontSize: 13 }}>
            Aucune fenêtre Top Line dans les données.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        gap: 16, flexWrap: "wrap",
      }}>
        <SectionTitle
          overline="Naxi.G Full Saas"
          icon={LineChart}
          sub="Suivi des fenêtres par groupe métier · phases sur le calendrier"
        >Suivi</SectionTitle>
        <a
          href="https://naxigestionfront-prepa.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: RADIUS.md,
            background: C.orange, color: "#fff",
            border: "none", boxShadow: "0 4px 14px rgba(229, 80, 16, 0.25)",
            cursor: "pointer", textDecoration: "none",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.04em",
            fontFamily: "inherit", textTransform: "uppercase",
            transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#f06a2a";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 6px 18px rgba(229, 80, 16, 0.35)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = C.orange;
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 14px rgba(229, 80, 16, 0.25)";
          }}
          title="Ouvre le prototype Naxi Gestion Prepa dans un nouvel onglet"
        >
          <Rocket size={14} strokeWidth={2.4} />
          Voir le prototype
          <ExternalLink size={12} strokeWidth={2.4} style={{ opacity: 0.85 }} />
        </a>
      </div>

      {/* KPI macro */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16,
      }}>
        <MacroKpi icon={Building2} label="Fenêtres totales" value={globals.total} />
        <MacroKpi
          icon={CheckCircle2}
          label="Phases livrées"
          value={`${globals.done} / ${globals.totalPhases}`}
          accent={C.green}
          detail={`${Math.round((globals.done / globals.totalPhases) * 100)}% des phases`}
        />
        <MacroKpi
          icon={Layers}
          label="Avancement moyen"
          value={`${globals.avgPct}%`}
          accent={C.orange}
          detail="moyenne pondérée"
        />
        <MacroKpi
          icon={Clock}
          label="Temps cumulé"
          value={formatDays(globals.time)}
          detail={globals.time > 0 ? `≈ ${(globals.time / 5).toFixed(1)} semaines (5j)` : null}
        />
      </div>

      {/* Cards par bloc */}
      <div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
          fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
          color: C.orange, fontWeight: 700,
        }}>
          <Building2 size={13} color={C.orange} strokeWidth={2.2} />
          Indicateurs par groupe métier
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {blocs.map((b, i) => (
            <BlocCard
              key={b.name}
              bloc={b}
              color={paletteColor(i)}
              onClick={() => setOpenBloc(b.name)}
            />
          ))}
        </div>
      </div>

      {/* Matrice phases × mois */}
      <PhaseMonthMatrix matrix={matrix} />

      {/* Modale détail bloc */}
      <Modal
        open={!!opened}
        onClose={() => setOpenBloc(null)}
        title={opened?.bloc.name || ""}
        overline={opened ? `${opened.bloc.count} fenêtre${opened.bloc.count > 1 ? "s" : ""} · ${formatDays(opened.bloc.time)}` : ""}
        icon={Building2}
        accent={opened?.color}
        width={920}
      >
        {opened && <BlocDetail bloc={opened.bloc} color={opened.color} />}
      </Modal>
    </div>
  );
}

// ── MacroKpi (interne) ──
function MacroKpi({ icon: Icon, label, value, detail, accent }) {
  return (
    <Card padding={18}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 32, height: 32, borderRadius: RADIUS.md,
          background: C.bgSoft, border: `1px solid ${C.line}`,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={15} color={accent || C.inkSoft} strokeWidth={2} />}
        </div>
      </div>
      <div style={{
        fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
        color: C.gray400, fontWeight: 700, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 700,
        color: accent || C.ink,
        lineHeight: 1.1, letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
        margin: "4px 0",
      }}>{value}</div>
      {detail && <div style={{ fontSize: 11, color: C.inkDim }}>{detail}</div>}
    </Card>
  );
}

// ── BlocCard (interne) ──
function BlocCard({ bloc, color, onClick }) {
  const avgPct = bloc.avTotal > 0 ? Math.round((bloc.avSum / bloc.avTotal) * 100) : 0;
  const totalDone = PHASES.reduce((s, p) => s + bloc.byPhase[p.key].fait, 0);
  const totalEnCours = PHASES.reduce((s, p) => s + bloc.byPhase[p.key].encours, 0);

  return (
    <Card
      padding={18}
      style={{
        borderTop: `3px solid ${color}`,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onClick={onClick}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)";
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      } : undefined}
    >
      {/* Titre + count */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        gap: 8, marginBottom: 4,
      }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: C.ink,
          letterSpacing: "-0.01em",
          maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} title={bloc.name}>{bloc.name}</span>
        <span style={{
          fontSize: 18, fontWeight: 700, color, fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.01em",
        }}>{bloc.count}</span>
      </div>
      <div style={{ fontSize: 11, color: C.inkDim, marginBottom: 12 }}>
        {bloc.count > 1 ? "fenêtres" : "fenêtre"} · {formatDays(bloc.time)}
      </div>

      {/* Avancement global */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 4, fontSize: 11,
        }}>
          <span style={{ color: C.inkDim, fontWeight: 600 }}>Avancement</span>
          <span style={{
            color: avgPct >= 100 ? C.green : color,
            fontWeight: 700, fontVariantNumeric: "tabular-nums",
          }}>{avgPct}%</span>
        </div>
        <div style={{
          height: 6, background: C.gray100, borderRadius: RADIUS.sm, overflow: "hidden",
        }}>
          <div style={{
            width: `${avgPct}%`, height: "100%",
            background: avgPct >= 100 ? C.green : color,
            borderRadius: RADIUS.sm, transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Phases en mini */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        paddingTop: 10, borderTop: `1px solid ${C.gray100}`,
      }}>
        {PHASES.map(p => {
          const { sum, count, fait, encours } = bloc.byPhase[p.key];
          const pct = count > 0 ? Math.round((sum / count) * 100) : 0;
          const Icon = p.icon;
          return (
            <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={11} color={C.inkDim} strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span style={{
                fontSize: 11, color: C.inkSoft, fontWeight: 500,
                width: 50, flexShrink: 0,
              }}>{p.label}</span>
              <div style={{
                flex: 1, height: 4, background: C.gray100,
                borderRadius: RADIUS.sm, overflow: "hidden",
              }}>
                <div style={{
                  width: `${pct}%`, height: "100%",
                  background: pct >= 100 ? C.green : pct > 0 ? color : C.gray300,
                  borderRadius: RADIUS.sm,
                }} />
              </div>
              <span style={{
                fontSize: 10, color: C.inkDim, fontVariantNumeric: "tabular-nums",
                width: 32, textAlign: "right", flexShrink: 0,
              }}>{pct}%</span>
            </div>
          );
        })}
      </div>

      {/* Pied de carte : phases livrées / en cours */}
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.gray100}`,
        display: "flex", gap: 10, fontSize: 10, color: C.inkDim,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
          {totalDone} livrée{totalDone > 1 ? "s" : ""}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.orange }} />
          {totalEnCours} en cours
        </span>
      </div>
    </Card>
  );
}

// ── BlocDetail (interne) — contenu de la modale ──
function BlocDetail({ bloc, color }) {
  const rows = useMemo(() => {
    return [...bloc.items]
      .map(t => {
        let sum = 0, n = 0;
        PHASES.forEach(p => {
          sum += t.avancement?.[p.key] || 0;
          n++;
        });
        const avg = n > 0 ? sum / n : 0;
        const time = PHASES.reduce((s, p) => s + (t.temps?.[p.key] || 0), 0);
        return { ticket: t, avg, time };
      })
      .sort((a, b) => b.avg - a.avg);
  }, [bloc]);

  const blocAvgPct = bloc.avTotal > 0 ? Math.round((bloc.avSum / bloc.avTotal) * 100) : 0;
  const totalDone = PHASES.reduce((s, p) => s + bloc.byPhase[p.key].fait, 0);
  const totalEnCours = PHASES.reduce((s, p) => s + bloc.byPhase[p.key].encours, 0);

  return (
    <div>
      {/* Bandeau résumé */}
      <div style={{
        padding: "16px 24px", borderBottom: `1px solid ${C.gray100}`,
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 18, background: C.bgSoft,
      }}>
        <SummaryStat label="Avancement groupe" value={`${blocAvgPct}%`} accent={color} />
        <SummaryStat label="Phases livrées" value={`${totalDone} / ${bloc.avTotal}`} accent={C.green} />
        <SummaryStat label="Phases en cours" value={totalEnCours} accent={C.orange} />
        <SummaryStat label="Temps cumulé" value={formatDays(bloc.time)} />
      </div>

      {/* Tableau fenêtres */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.gray50 }}>
              <th style={thBlocBase()}>Fenêtre</th>
              {PHASES.map(p => (
                <th key={p.key} style={thBlocBase({ textAlign: "center" })}>{p.label}</th>
              ))}
              <th style={thBlocBase({ textAlign: "right", borderLeft: `1px solid ${C.line}` })}>Moyenne</th>
              <th style={thBlocBase({ textAlign: "right" })}>Temps</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const t = r.ticket;
              const avgPct = Math.round(r.avg * 100);
              return (
                <tr key={t.id || i} style={{
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.gray100}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td style={{
                    padding: "10px 16px", color: C.ink, fontWeight: 600,
                    maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={t.fenetre}>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" style={{
                        color: C.ink, textDecoration: "none",
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.orange; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.ink; }}
                      >
                        {t.fenetre || "—"}
                        <ExternalLink size={10} color={C.inkMute} strokeWidth={2.2} />
                      </a>
                    ) : (t.fenetre || "—")}
                  </td>
                  {PHASES.map(p => {
                    const pct = Math.round((t.avancement?.[p.key] || 0) * 100);
                    const etat = t.etat?.[p.key];
                    const sprint = t.sprint?.[p.key];
                    return (
                      <td key={p.key} style={{
                        padding: "10px 8px", textAlign: "center",
                        minWidth: 70,
                      }} title={[
                        `${p.label} · ${pct}%`,
                        sprint ? `Sprint : ${sprint}` : null,
                        etat ? `État : ${etat}` : null,
                      ].filter(Boolean).join("\n")}>
                        <PhasePill pct={pct} etat={etat} />
                      </td>
                    );
                  })}
                  <td style={{
                    padding: "10px 16px", textAlign: "right",
                    borderLeft: `1px solid ${C.gray100}`,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: avgPct >= 100 ? C.green : avgPct > 0 ? color : C.inkMute,
                  }}>{avgPct}%</td>
                  <td style={{
                    padding: "10px 16px", textAlign: "right",
                    color: r.time > 0 ? C.inkSoft : C.inkMute,
                    fontVariantNumeric: "tabular-nums",
                  }}>{r.time > 0 ? formatDays(r.time) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent }) {
  return (
    <div>
      <div style={{
        fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
        color: C.gray400, fontWeight: 700, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: 20, fontWeight: 700,
        color: accent || C.ink,
        letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
    </div>
  );
}

function PhasePill({ pct, etat }) {
  // Couleur selon état + pourcentage
  let color = C.gray300;
  let bg = C.gray100;
  if (etat === "FAIT" || pct >= 100) { color = C.green; bg = C.greenSoft; }
  else if (etat === "En cours" || pct > 0) { color = C.orange; bg = C.orangeBg; }

  return (
    <div style={{
      display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4,
      width: "100%", maxWidth: 80,
    }}>
      <div style={{
        width: "100%", height: 4, background: C.gray100,
        borderRadius: RADIUS.sm, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: RADIUS.sm,
        }} />
      </div>
      <span style={{
        fontSize: 10, fontWeight: 700, color,
        background: bg, padding: "1px 6px", borderRadius: RADIUS.sm,
        fontVariantNumeric: "tabular-nums", minWidth: 32, textAlign: "center",
      }}>{pct}%</span>
    </div>
  );
}

function thBlocBase(extra = {}) {
  return {
    textAlign: "left", padding: "10px 16px",
    fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
    color: C.gray400, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
    whiteSpace: "nowrap",
    ...extra,
  };
}

// ── Matrice phases × mois (heatmap) ──
function PhaseMonthMatrix({ matrix }) {
  const { months, cells, maxCount } = matrix;

  if (months.length === 0) {
    return (
      <Card padding={20}>
        <div style={{ textAlign: "center", color: C.inkDim, fontSize: 13 }}>
          Aucun sprint planifié dans les données.
        </div>
      </Card>
    );
  }

  // Totaux
  const phaseTotals = {};
  const monthTotals = {};
  let grandTotal = 0;
  PHASES.forEach(p => {
    phaseTotals[p.key] = months.reduce((s, m) => s + (cells[`${p.key}|${m.key}`]?.total || 0), 0);
  });
  months.forEach(m => {
    monthTotals[m.key] = PHASES.reduce((s, p) => s + (cells[`${p.key}|${m.key}`]?.total || 0), 0);
    grandTotal += monthTotals[m.key];
  });

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarDays size={13} color={C.orange} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>Calendrier des sprints · phases × mois</div>
        </div>
        <div style={{ display: "inline-flex", gap: 12, fontSize: 10, color: C.inkSoft, fontWeight: 600 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} /> FAIT
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.orange }} /> En cours
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: C.gray300 }} /> À faire
          </span>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.gray50 }}>
              <th style={{
                textAlign: "left", padding: "12px 16px",
                fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
                color: C.gray400, fontWeight: 700,
                borderBottom: `1px solid ${C.gray200}`, whiteSpace: "nowrap",
              }}>Phase</th>
              {months.map(m => (
                <th key={m.key} style={{
                  textAlign: "center", padding: "10px 8px",
                  fontSize: 11, fontWeight: 700, color: C.inkSoft,
                  borderBottom: `1px solid ${C.gray200}`, whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                }}>{m.label}</th>
              ))}
              <th style={{
                textAlign: "right", padding: "12px 16px",
                fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
                color: C.gray400, fontWeight: 700,
                borderBottom: `1px solid ${C.gray200}`,
                borderLeft: `1px solid ${C.line}`, whiteSpace: "nowrap",
              }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {PHASES.map((p, i) => {
              const Icon = p.icon;
              return (
                <tr key={p.key} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                  <td style={{
                    padding: "10px 16px", color: C.ink, fontWeight: 600, whiteSpace: "nowrap",
                  }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <Icon size={13} color={C.inkSoft} strokeWidth={2.2} />
                      {p.label}
                    </span>
                  </td>
                  {months.map(m => {
                    const cell = cells[`${p.key}|${m.key}`];
                    return <MatrixCell key={m.key} cell={cell} maxCount={maxCount} phase={p.label} month={m.label} />;
                  })}
                  <td style={{
                    padding: "10px 16px", textAlign: "right",
                    color: C.ink, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                    borderLeft: `1px solid ${C.gray100}`,
                  }}>{phaseTotals[p.key]}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: C.gray50, borderTop: `2px solid ${C.line}` }}>
              <td style={{
                padding: "10px 16px", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.06em", textTransform: "uppercase", color: C.ink,
              }}>Total</td>
              {months.map(m => (
                <td key={m.key} style={{
                  textAlign: "center", padding: "10px 8px",
                  color: C.ink, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                }}>{monthTotals[m.key]}</td>
              ))}
              <td style={{
                padding: "10px 16px", textAlign: "right",
                color: C.orange, fontWeight: 800, fontVariantNumeric: "tabular-nums",
                borderLeft: `1px solid ${C.line}`, fontSize: 13,
              }}>{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}

// ── Cellule de la matrice ──
function MatrixCell({ cell, maxCount, phase, month }) {
  if (!cell || cell.total === 0) {
    return (
      <td style={{
        padding: "8px 6px", textAlign: "center",
        color: C.inkMute, fontSize: 11,
      }}>—</td>
    );
  }

  const intensity = Math.max(0.15, cell.total / maxCount);
  const todo = cell.total - cell.fait - cell.encours;
  const tooltip = `${phase} · ${month}\n${cell.total} fenêtre${cell.total > 1 ? "s" : ""}\nFAIT : ${cell.fait}\nEn cours : ${cell.encours}\nÀ faire : ${todo}`;

  return (
    <td style={{ padding: "6px", textAlign: "center" }} title={tooltip}>
      <div style={{
        position: "relative",
        display: "inline-flex", flexDirection: "column", alignItems: "stretch",
        minWidth: 56, maxWidth: 80,
        margin: "0 auto",
      }}>
        {/* Bandes de proportion */}
        <div style={{
          display: "flex", height: 6, borderRadius: RADIUS.sm,
          overflow: "hidden", marginBottom: 4,
          background: C.gray200,
        }}>
          {cell.fait > 0 && (
            <div style={{ flex: cell.fait, background: C.green }} />
          )}
          {cell.encours > 0 && (
            <div style={{ flex: cell.encours, background: C.orange }} />
          )}
          {todo > 0 && (
            <div style={{ flex: todo, background: C.gray300 }} />
          )}
        </div>
        {/* Pastille de count */}
        <div style={{
          padding: "4px 0",
          fontSize: 12, fontWeight: 700, color: C.ink,
          background: `rgba(229, 80, 16, ${intensity * 0.18})`,
          border: `1px solid rgba(229, 80, 16, ${intensity * 0.5})`,
          borderRadius: RADIUS.sm,
          fontVariantNumeric: "tabular-nums",
        }}>
          {cell.total}
        </div>
      </div>
    </td>
  );
}

