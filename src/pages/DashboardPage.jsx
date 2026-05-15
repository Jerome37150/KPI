import { useMemo } from 'react';
import {
  LayoutDashboard, Inbox, Bug, Wrench, Sparkles, Layers, Target, Package,
  ArrowUpRight,
} from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { KpiCard } from '../components/KpiCard';
import { BreakdownCard } from '../components/BreakdownCard';
import { TimelineChart } from '../components/TimelineChart';
import { TicketsTable } from '../components/TicketsTable';
import { CLASSIF_COLORS, PRIO_COLORS } from '../utils/colors';
import { NOW, shiftMonth, isInMonth, monthLabel, monthLabelShort } from '../utils/dates';

const BUG_CLASSIFS = ["BUG D'USAGE", "BUG OPERATIONNEL", "BUG STRUCTURANT"];
const DEV_CLASSIFS = ["DEV avec CC", "DEV sans CC"];
const STATUT_OPEN  = ["A planifier", "En cours", "Stand by", "A etudier", "Fait partiellement"];

// Sprint label : "MAI 26" → Date(2026, 4, 1)
const FULL_MONTHS_FR = {
  JANVIER: 0, FEVRIER: 1, MARS: 2, AVRIL: 3, MAI: 4, JUIN: 5,
  JUILLET: 6, AOUT: 7, SEPTEMBRE: 8, OCTOBRE: 9, NOVEMBRE: 10, DECEMBRE: 11,
};
function parseSprint(label) {
  if (!label) return null;
  const m = String(label).trim().toUpperCase().match(/^([A-ZÉÈÀÂÊÎÔÛ]+)\s+(\d{2,4})$/);
  if (!m) return null;
  const idx = FULL_MONTHS_FR[m[1]];
  if (idx === undefined) return null;
  let y = parseInt(m[2], 10);
  if (y < 100) y += 2000;
  return new Date(y, idx, 1);
}

function compareVersions(a, b) {
  const pa = String(a).split(".").map(n => parseInt(n, 10) || 0);
  const pb = String(b).split(".").map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const da = pa[i] || 0;
    const db = pb[i] || 0;
    if (da !== db) return da - db;
  }
  return 0;
}

function countBy(list, key, { array = false } = {}) {
  const map = new Map();
  list.forEach(t => {
    const v = t[key];
    if (array) {
      const arr = Array.isArray(v) ? v : (v ? [v] : []);
      arr.forEach(x => map.set(x, (map.get(x) || 0) + 1));
    } else {
      if (!v) return;
      map.set(v, (map.get(v) || 0) + 1);
    }
  });
  return map;
}

function buildEntries(currentMap, previousMap, fixedOrder = null) {
  const labels = fixedOrder || [...new Set([...currentMap.keys(), ...previousMap.keys()])];
  return labels
    .map(label => ({
      label,
      current:  currentMap.get(label) || 0,
      previous: previousMap.get(label) || 0,
    }))
    .filter(e => e.current > 0 || e.previous > 0)
    .sort((a, b) => Math.max(b.current, b.previous) - Math.max(a.current, a.previous));
}

// ============================================
// DashboardPage — vue macro NAXI.G
// ============================================
export function DashboardPage({ data, onNavigate }) {
  const tickets = data.classique || [];

  // ── Tickets : courant / précédent (mois) ──
  const currentMonth  = new Date(NOW.getFullYear(), NOW.getMonth(), 1);
  const previousMonth = shiftMonth(currentMonth, -1);

  const monthAgg = useMemo(() => {
    const cur = tickets.filter(t => isInMonth(t.dateCreation, currentMonth));
    const prev = tickets.filter(t => isInMonth(t.dateCreation, previousMonth));
    return { cur, prev };
  }, [tickets, currentMonth.getTime(), previousMonth.getTime()]);

  const bugsOpen = useMemo(() => tickets.filter(t =>
    BUG_CLASSIFS.includes(t.classification) && STATUT_OPEN.includes(t.statut),
  ).length, [tickets]);

  const devsOpen = useMemo(() => tickets.filter(t =>
    DEV_CLASSIFS.includes(t.classification) && STATUT_OPEN.includes(t.statut),
  ).length, [tickets]);

  // ── Sprint en cours ──
  const sprintInfo = useMemo(() => {
    const map = new Map();
    tickets.forEach(t => {
      (t.sprintIdeal || []).forEach(p => {
        if (!map.has(p)) map.set(p, { label: p, tickets: [], date: parseSprint(p) });
        map.get(p).tickets.push(t);
      });
    });
    const sprints = [...map.values()].filter(s => s.date).sort((a, b) => a.date - b.date);
    const cur = sprints.find(s =>
      s.date.getMonth() === NOW.getMonth() && s.date.getFullYear() === NOW.getFullYear()
    ) || sprints[sprints.length - 1] || null;
    if (!cur) return null;
    let initiale = 0, debord = 0, ajout = 0, done = 0;
    let avgSum = 0, avgN = 0;
    cur.tickets.forEach(t => {
      const ini = Array.isArray(t.initialeAjout) ? t.initialeAjout : [];
      if (ini.includes("Sprint initiale")) initiale++;
      if (ini.includes("Débord sprint") || ini.includes("Débord sprint suivant")) debord++;
      if (ini.includes("Ajout en cours")) ajout++;
      if (t.statut === "FAIT" || t.pointAvancement >= 1) done++;
      if (typeof t.pointAvancement === "number") {
        avgSum += t.pointAvancement;
        avgN++;
      }
    });
    return {
      label: cur.label,
      total: cur.tickets.length,
      initiale, debord, ajout, done,
      avgPct: avgN > 0 ? Math.round((avgSum / avgN) * 100) : 0,
    };
  }, [tickets]);

  // ── Latest stable version ──
  const versionInfo = useMemo(() => {
    const map = new Map();
    tickets.forEach(t => {
      if (!t.versionStable) return;
      if (!map.has(t.versionStable)) map.set(t.versionStable, []);
      map.get(t.versionStable).push(t);
    });
    const list = [...map.entries()]
      .map(([label, list]) => ({ label, tickets: list }))
      .sort((a, b) => compareVersions(a.label, b.label));
    if (list.length === 0) return null;
    const latest = list[list.length - 1];
    const previous = list[list.length - 2] || null;
    let bug = 0, dev = 0;
    latest.tickets.forEach(t => {
      if (BUG_CLASSIFS.includes(t.classification)) bug++;
      if (DEV_CLASSIFS.includes(t.classification)) dev++;
    });
    const dateStable = latest.tickets.find(t => t.dateSortieStable)?.dateSortieStable || null;
    return {
      label: latest.label,
      count: latest.tickets.length,
      previousLabel: previous?.label || null,
      previousCount: previous?.tickets.length || 0,
      dateStable,
      bug, dev,
    };
  }, [tickets]);

  // ── Breakdowns ──
  const classifEntries = buildEntries(
    countBy(monthAgg.cur, "classification"),
    countBy(monthAgg.prev, "classification"),
    Object.keys(CLASSIF_COLORS),
  );
  const prioEntries = buildEntries(
    countBy(monthAgg.cur, "priorisation"),
    countBy(monthAgg.prev, "priorisation"),
    ["Haute", "Moyenne", "Pas urgente"],
  );

  const curMonthLabel = monthLabelShort(currentMonth);
  const prevMonthLabel = monthLabelShort(previousMonth);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionTitle
        overline="Vue d'ensemble"
        icon={LayoutDashboard}
        sub={`Snapshot NAXI.G · ${monthLabel(currentMonth)}`}
      >Dashboard</SectionTitle>

      {/* Row 1 — 4 KPIs macro */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
      }}>
        <KpiCard
          icon={Inbox}
          label="Enregistrés"
          sub={`Mois en cours · ${curMonthLabel}`}
          value={monthAgg.cur.length}
          previous={monthAgg.prev.length}
          invertTrend={true}
        />
        <KpiCard
          icon={Bug}
          label="Bugs ouverts"
          sub="Toutes priorités · non clos"
          value={bugsOpen}
          previous={bugsOpen}
          invertTrend={true}
          color={C.red}
        />
        <KpiCard
          icon={Wrench}
          label="Devs ouverts"
          sub="DEV avec / sans CC"
          value={devsOpen}
          previous={devsOpen}
          invertTrend={false}
          color={C.green}
        />
        <KpiCard
          icon={Sparkles}
          label={sprintInfo ? `Sprint ${sprintInfo.label}` : "Sprint"}
          sub={sprintInfo ? `${sprintInfo.done} livré${sprintInfo.done > 1 ? "s" : ""} · ${sprintInfo.avgPct}%` : "—"}
          value={sprintInfo?.total ?? 0}
          previous={sprintInfo?.total ?? 0}
          invertTrend={false}
          color={C.orange}
        />
      </div>

      {/* Row 2 — Timeline volume */}
      <TimelineChart
        tickets={tickets}
        title="Volume d'enregistrement (toutes périodes)"
      />

      {/* Row 3 — Distributions du mois */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 16,
      }}>
        <BreakdownCard
          title={`Classification · ${curMonthLabel}`}
          icon={Layers}
          entries={classifEntries}
          currentLabel={curMonthLabel}
          previousLabel={prevMonthLabel}
          getColor={(label) => CLASSIF_COLORS[label] || C.inkSoft}
        />
        <BreakdownCard
          title={`Priorisation · ${curMonthLabel}`}
          icon={Target}
          entries={prioEntries}
          currentLabel={curMonthLabel}
          previousLabel={prevMonthLabel}
          getColor={(label) => PRIO_COLORS[label] || C.inkSoft}
        />
      </div>

      {/* Row 4 — Latest version + current sprint résumés */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: 16,
      }}>
        <SummaryCard
          icon={Package}
          overline="Dernière release stable"
          title={versionInfo ? `v${versionInfo.label}` : "—"}
          accent={C.orange}
          subTitle={versionInfo?.dateStable ? formatDate(versionInfo.dateStable) : "Date non renseignée"}
          stats={versionInfo ? [
            { label: "Tickets livrés", value: versionInfo.count, color: C.orange },
            { label: "Bugs",           value: versionInfo.bug,   color: C.red },
            { label: "Devs",           value: versionInfo.dev,   color: C.green },
            { label: "Préc.",          value: versionInfo.previousLabel ? `v${versionInfo.previousLabel}` : "—", isText: true, sub: versionInfo.previousLabel ? `${versionInfo.previousCount} tickets` : null },
          ] : []}
          onNavigate={onNavigate ? () => onNavigate("version") : null}
          navLabel="Voir Version"
        />
        <SummaryCard
          icon={Sparkles}
          overline="Sprint en cours"
          title={sprintInfo?.label || "—"}
          accent={C.orange}
          subTitle={sprintInfo ? `${sprintInfo.total} tickets planifiés · ${sprintInfo.avgPct}% avancement` : "Pas de sprint actif"}
          stats={sprintInfo ? [
            { label: "Initiale",       value: sprintInfo.initiale, color: C.ink },
            { label: "Ajout en cours", value: sprintInfo.ajout,    color: C.blue },
            { label: "Débord",         value: sprintInfo.debord,   color: C.amber },
            { label: "Livrés",         value: sprintInfo.done,     color: C.green },
          ] : []}
          onNavigate={onNavigate ? () => onNavigate("sprint") : null}
          navLabel="Voir Sprint"
        />
      </div>

      {/* Row 6 — Activité récente */}
      <TicketsTable tickets={tickets} limit={5} title="5 derniers tickets enregistrés" />
    </div>
  );
}

// ── Composants internes ──
function SummaryCard({ icon: Icon, overline, title, subTitle, stats, accent, onNavigate, navLabel }) {
  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{
        padding: "20px 24px",
        background: `linear-gradient(135deg, ${C.paper} 0%, ${C.paper} 65%, ${C.orangeFaint} 100%)`,
        borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 6,
          fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
          color: accent || C.orange, fontWeight: 700,
        }}>
          {Icon && <Icon size={12} color={accent || C.orange} strokeWidth={2.2} />}
          {overline}
        </div>
        <div style={{
          fontSize: 28, fontWeight: 800, color: C.ink,
          letterSpacing: "-0.02em", lineHeight: 1.1,
        }}>{title}</div>
        {subTitle && (
          <div style={{ fontSize: 12, color: C.inkDim, marginTop: 6 }}>
            {subTitle}
          </div>
        )}
      </div>

      <div style={{
        padding: 16,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
        gap: 16,
      }}>
        {stats.map(s => (
          <div key={s.label}>
            <div style={{
              fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
              color: C.gray400, fontWeight: 700, marginBottom: 4,
            }}>{s.label}</div>
            <div style={{
              fontSize: s.isText ? 16 : 22, fontWeight: 700,
              color: s.color || C.ink,
              fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em",
            }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 10, color: C.inkDim, marginTop: 2 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {onNavigate && (
        <div style={{
          padding: "10px 16px", borderTop: `1px solid ${C.gray100}`,
          display: "flex", justifyContent: "flex-end",
        }}>
          <NavLink onClick={onNavigate}>{navLabel || "Voir"}</NavLink>
        </div>
      )}
    </Card>
  );
}

function NavLink({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: RADIUS.md,
      background: "transparent", color: C.orange,
      border: "none", cursor: "pointer",
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      fontFamily: "inherit", textTransform: "uppercase",
      transition: "background 0.15s",
    }}
    onMouseEnter={e => { e.currentTarget.style.background = C.orangeBg; }}
    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
    >
      {children}
      <ArrowUpRight size={12} strokeWidth={2.4} />
    </button>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const months = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

