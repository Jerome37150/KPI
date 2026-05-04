import { useState, useMemo } from 'react';
import {
  Sparkles, Layers, Inbox, Wrench, Bug, Package, Repeat, Plus, Hourglass,
} from 'lucide-react';
import { C } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { Pill } from '../components/primitives/Pill';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { BreakdownCard } from '../components/BreakdownCard';
import { VersionTicketsTable } from '../components/VersionTicketsTable';
import { SprintPicker } from '../components/SprintPicker';
import { CLASSIF_COLORS, paletteColor } from '../utils/colors';
import { NOW } from '../utils/dates';

const BUG_CLASSIFS = ["BUG D'USAGE", "BUG OPERATIONNEL", "BUG STRUCTURANT"];
const DEV_CLASSIFS = ["DEV avec CC", "DEV sans CC"];

const FULL_MONTHS_FR = {
  JANVIER:  0, FEVRIER:  1, MARS:    2, AVRIL:    3, MAI:      4, JUIN:      5,
  JUILLET:  6, AOUT:     7, SEPTEMBRE:8, OCTOBRE:  9, NOVEMBRE:10, DECEMBRE: 11,
};

// "MARS 26" → Date(2026, 2, 1) — null si non parsable
function parseSprint(label) {
  if (!label) return null;
  const m = String(label).trim().toUpperCase().match(/^([A-ZÉÈÀÂÊÎÔÛ]+)\s+(\d{2,4})$/);
  if (!m) return null;
  const monthIdx = FULL_MONTHS_FR[m[1]];
  if (monthIdx === undefined) return null;
  let year = parseInt(m[2], 10);
  if (year < 100) year += 2000;
  return new Date(year, monthIdx, 1);
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

// ============================================
// SprintPage — sprint en cours, filtre "Sprint initiale"
// ============================================
export function SprintPage({ data }) {
  const tickets = data.classique || [];

  // Liste des sprints : tous les tickets dont sprintIdeal contient une période
  const sprints = useMemo(() => {
    const map = new Map();
    tickets.forEach(t => {
      const periods = Array.isArray(t.sprintIdeal) ? t.sprintIdeal : [];
      periods.forEach(p => {
        if (!map.has(p)) map.set(p, { tickets: [], date: parseSprint(p) });
        map.get(p).tickets.push(t);
      });
    });

    const list = [...map.entries()]
      .map(([label, info]) => ({
        value: label,
        label,
        count: info.tickets.length,
        tickets: info.tickets,
        date: info.date,
      }))
      .filter(s => s.date)
      .sort((a, b) => a.date - b.date);

    // ACTUEL = sprint du mois courant
    list.forEach(s => {
      s.isCurrent =
        s.date.getMonth() === NOW.getMonth() &&
        s.date.getFullYear() === NOW.getFullYear();
    });

    return list;
  }, [tickets]);

  // ── Index du sprint courant ou défaut = dernier passé ou premier futur ──
  const defaultSprintValue = useMemo(() => {
    if (sprints.length === 0) return null;
    const cur = sprints.find(s => s.isCurrent);
    if (cur) return cur.value;
    const past = [...sprints].reverse().find(s => s.date <= NOW);
    return (past || sprints[0]).value;
  }, [sprints]);

  const [selected, setSelected] = useState(null);
  const effectiveSelected = useMemo(() => {
    if (sprints.length === 0) return null;
    if (selected && sprints.some(s => s.value === selected)) return selected;
    return defaultSprintValue;
  }, [selected, sprints, defaultSprintValue]);

  const current = sprints.find(s => s.value === effectiveSelected) || null;
  const previous = useMemo(() => {
    if (!current) return null;
    const idx = sprints.findIndex(s => s.value === current.value);
    return idx > 0 ? sprints[idx - 1] : null;
  }, [current, sprints]);

  // ── Tickets sprint (tout le périmètre de la période) ──
  const currentTickets = current?.tickets || [];
  const previousTickets = previous?.tickets || [];

  const bugCount = currentTickets.filter(t => BUG_CLASSIFS.includes(t.classification)).length;
  const devCount = currentTickets.filter(t => DEV_CLASSIFS.includes(t.classification)).length;

  // ── Distribution initialeAjout (initiale / débord / ajout) ──
  const breakdown = useMemo(() => {
    let initiale = 0, debord = 0, ajout = 0;
    currentTickets.forEach(t => {
      const ini = Array.isArray(t.initialeAjout) ? t.initialeAjout : [];
      if (ini.includes("Sprint initiale")) initiale++;
      // Notion a renommé "Débord sprint suivant" en "Débord sprint" — on accepte les deux
      if (ini.includes("Débord sprint") || ini.includes("Débord sprint suivant")) debord++;
      if (ini.includes("Ajout en cours")) ajout++;
    });
    return { initiale, debord, ajout };
  }, [currentTickets]);

  // ── Breakdowns ──
  const buildEntries = (currentMap, previousMap, fixedOrder = null) => {
    const labels = fixedOrder || [...new Set([...currentMap.keys(), ...previousMap.keys()])];
    return labels
      .map(label => ({
        label,
        current:  currentMap.get(label) || 0,
        previous: previousMap.get(label) || 0,
      }))
      .filter(e => e.current > 0 || e.previous > 0)
      .sort((a, b) => Math.max(b.current, b.previous) - Math.max(a.current, a.previous));
  };

  const classifEntries = buildEntries(
    countBy(currentTickets, "classification"),
    countBy(previousTickets, "classification"),
    Object.keys(CLASSIF_COLORS),
  );
  const produitEntries = buildEntries(
    countBy(currentTickets, "produits", { array: true }),
    countBy(previousTickets, "produits", { array: true }),
  ).slice(0, 8);
  const fonctionEntries = buildEntries(
    countBy(currentTickets, "fonctions"),
    countBy(previousTickets, "fonctions"),
  ).slice(0, 8);

  const currentLabel = current ? current.label : "";
  const previousLabel = previous ? previous.label : "—";

  // ── Empty state ──
  if (sprints.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionTitle
          overline="Sprint actuel"
          icon={Sparkles}
          sub="Périmètre du sprint en cours"
        >Sprint en cours</SectionTitle>
        <Card padding={32}>
          <div style={{ textAlign: "center", color: C.inkDim, fontSize: 13 }}>
            Aucun sprint trouvé (pas de ticket avec un sprint idéal renseigné).
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* En-tête + sélecteur */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        gap: 16, flexWrap: "wrap",
      }}>
        <SectionTitle
          overline="Sprint"
          icon={Sparkles}
          sub="Périmètre du sprint · tous les tickets planifiés"
        >Sprint en cours</SectionTitle>
        <SprintPicker
          sprints={sprints}
          selected={effectiveSelected}
          onChange={setSelected}
        />
      </div>

      {/* Hero card — résumé du sprint sélectionné */}
      {current && (
        <Card padding={0} style={{
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.paper} 0%, ${C.paper} 60%, ${C.orangeFaint} 100%)`,
          borderColor: current.isCurrent ? C.orange : C.line,
        }}>
          <div style={{
            padding: "28px 32px",
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) 1.5fr",
            gap: 32, alignItems: "center",
          }}>
            {/* Bloc gauche : nom du sprint + statut */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
                color: C.orange, fontWeight: 700, marginBottom: 8,
              }}>
                <Sparkles size={13} color={C.orange} strokeWidth={2.2} />
                Sprint
              </div>
              <div style={{
                fontSize: 40, fontWeight: 800, color: C.ink,
                letterSpacing: "-0.02em", lineHeight: 1,
              }}>
                {current.label}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {current.isCurrent && (
                  <Pill color={C.orange} soft={false} size="md">EN COURS</Pill>
                )}
                <Pill color={C.inkSoft} soft={true} size="md">
                  {current.count} ticket{current.count > 1 ? "s" : ""} planifié{current.count > 1 ? "s" : ""}
                </Pill>
              </div>
            </div>

            {/* Bloc droit : grille d'infos */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 24,
            }}>
              <HeroStat
                icon={Inbox}
                label="Tickets"
                value={current.count}
                accent
              />
              <HeroStat
                icon={Wrench}
                label="Devs"
                value={devCount}
                color={C.green}
              />
              <HeroStat
                icon={Bug}
                label="Bugs"
                value={bugCount}
                color={C.red}
              />
              <HeroStat
                icon={Sparkles}
                label="Initiale"
                value={breakdown.initiale}
              />
              <HeroStat
                icon={Plus}
                label="Ajout en cours"
                value={breakdown.ajout}
                color={C.blue}
              />
              <HeroStat
                icon={Repeat}
                label="Débord"
                value={breakdown.debord}
                color={C.amber}
              />
              {previous && (
                <HeroStat
                  icon={Hourglass}
                  label="Sprint préc."
                  value={previous.label}
                  detail={`${previous.count} tickets`}
                  isText
                />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Row breakdowns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <BreakdownCard
          title="Par classification"
          icon={Layers}
          entries={classifEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(label) => CLASSIF_COLORS[label] || C.inkSoft}
          invertTrend={false}
        />
        <BreakdownCard
          title="Par produit"
          icon={Package}
          entries={produitEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(_, i) => paletteColor(i)}
          invertTrend={false}
        />
        <BreakdownCard
          title="Par fonction"
          icon={Sparkles}
          entries={fonctionEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(_, i) => paletteColor(i + 3)}
          invertTrend={false}
        />
      </div>

      {/* Table : tickets du sprint sélectionné */}
      <VersionTicketsTable
        tickets={currentTickets}
        title={`Tickets sprint ${currentLabel}`}
        showStatus
        showProgress
      />
    </div>
  );
}

// ── HeroStat (interne) ──
function HeroStat({ icon: Icon, label, value, detail, accent = false, isText = false, color }) {
  const valueColor = color || (accent ? C.orange : C.ink);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase",
        color: C.gray400, fontWeight: 700,
      }}>
        {Icon && <Icon size={12} color={C.inkDim} strokeWidth={2.2} />}
        {label}
      </div>
      <div style={{
        fontSize: isText ? 18 : 26, fontWeight: 700,
        color: valueColor,
        lineHeight: 1.1, letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
      }}>{value}</div>
      {detail && (
        <div style={{
          fontSize: 11, color: C.inkDim,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }} title={detail}>{detail}</div>
      )}
    </div>
  );
}
