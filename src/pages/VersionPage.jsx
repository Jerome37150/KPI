import { useState, useMemo } from 'react';
import {
  Package, Layers, Inbox, Wrench, Bug, Calendar,
  Sparkles,
} from 'lucide-react';
import { C } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { Pill } from '../components/primitives/Pill';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { BreakdownCard } from '../components/BreakdownCard';
import { VersionTicketsTable } from '../components/VersionTicketsTable';
import { VersionPicker } from '../components/VersionPicker';
import { CLASSIF_COLORS, paletteColor } from '../utils/colors';
import { MOIS_FR } from '../utils/dates';

const BUG_CLASSIFS = ["BUG D'USAGE", "BUG OPERATIONNEL", "BUG STRUCTURANT"];
const DEV_CLASSIFS = ["DEV avec CC", "DEV sans CC"];

// Ordre semver-like : 18.10 < 18.11 < 18.15
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

function formatDateLong(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${d.getDate()} ${MOIS_FR[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}

function formatDateShortDM(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
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
// VersionPage — données de sortie (versions stables)
// ============================================
export function VersionPage({ data }) {
  const tickets = data.classique || [];

  // Liste des versions stables triée (récent en dernier pour graphique chrono)
  const versions = useMemo(() => {
    const map = new Map();
    tickets.forEach(t => {
      if (!t.versionStable) return;
      if (!map.has(t.versionStable)) {
        map.set(t.versionStable, { tickets: [], dates: new Set() });
      }
      const e = map.get(t.versionStable);
      e.tickets.push(t);
      if (t.dateSortieStable) e.dates.add(t.dateSortieStable);
    });

    const list = [...map.entries()]
      .map(([label, info]) => {
        const byClassif = {};
        info.tickets.forEach(t => {
          if (!t.classification) return;
          byClassif[t.classification] = (byClassif[t.classification] || 0) + 1;
        });
        const sortedDates = [...info.dates].sort();
        return {
          value: label,
          label,
          count: info.tickets.length,
          tickets: info.tickets,
          date: sortedDates[0] ? formatDateShortDM(sortedDates[0]) : null,
          dateIso: sortedDates[0] || null,
          byClassif,
        };
      })
      .sort((a, b) => compareVersions(a.value, b.value));

    if (list.length > 0) list[list.length - 1].isLatest = true;
    return list;
  }, [tickets]);

  // Sélection par défaut : dernière version
  const [selected, setSelected] = useState(() => {
    if (versions.length === 0) return null;
    return versions[versions.length - 1].value;
  });

  // Si data charge après mount, ré-aligner
  const effectiveSelected = useMemo(() => {
    if (versions.length === 0) return null;
    if (selected && versions.some(v => v.value === selected)) return selected;
    return versions[versions.length - 1].value;
  }, [selected, versions]);

  const current = versions.find(v => v.value === effectiveSelected) || null;
  const previous = useMemo(() => {
    if (!current) return null;
    const idx = versions.findIndex(v => v.value === current.value);
    return idx > 0 ? versions[idx - 1] : null;
  }, [current, versions]);

  // ── Agrégats sur la version courante ──
  const currentTickets = current?.tickets || [];
  const previousTickets = previous?.tickets || [];

  const bugCount = currentTickets.filter(t => BUG_CLASSIFS.includes(t.classification)).length;
  const devCount = currentTickets.filter(t => DEV_CLASSIFS.includes(t.classification)).length;

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

  const currentLabel = current ? `v${current.label}` : "";
  const previousLabel = previous ? `v${previous.label}` : "—";

  // ── Empty state si pas de versions ──
  if (versions.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionTitle
          overline="Releases"
          icon={Package}
          sub="Données de sortie · versions stables"
        >Version</SectionTitle>
        <Card padding={32}>
          <div style={{ textAlign: "center", color: C.inkDim, fontSize: 13 }}>
            Aucune version stable enregistrée pour le moment.
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
          overline="Releases"
          icon={Package}
          sub="Données de sortie · versions stables NAXI.G"
        >Version</SectionTitle>
        <VersionPicker
          versions={versions}
          selected={effectiveSelected}
          onChange={setSelected}
        />
      </div>

      {/* Hero card — résumé de la version sélectionnée */}
      {current && (
        <Card padding={0} style={{
          overflow: "hidden",
          background: `linear-gradient(135deg, ${C.paper} 0%, ${C.paper} 60%, ${C.orangeFaint} 100%)`,
          borderColor: current.isLatest ? C.orange : C.line,
        }}>
          <div style={{
            padding: "28px 32px",
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) 1.5fr",
            gap: 32, alignItems: "center",
          }}>
            {/* Bloc gauche : numéro de version + status */}
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
                color: C.orange, fontWeight: 700, marginBottom: 8,
              }}>
                <Package size={13} color={C.orange} strokeWidth={2.2} />
                Version stable
              </div>
              <div style={{
                fontSize: 44, fontWeight: 800, color: C.ink,
                letterSpacing: "-0.02em", lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                display: "inline-flex", alignItems: "baseline", gap: 12,
              }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: C.inkDim }}>v</span>
                <span>{current.label}</span>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {current.isLatest && (
                  <Pill color={C.orange} soft={false} size="md">LATEST</Pill>
                )}
                {current.dateIso && (
                  <Pill color={C.inkSoft} soft={true} size="md">
                    Sortie · {formatDateLong(current.dateIso)}
                  </Pill>
                )}
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
                label="Tickets livrés"
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
                icon={Calendar}
                label="Date de sortie"
                value={current.date || "—"}
                detail={current.dateIso ? formatDateLong(current.dateIso) : null}
                isText
              />
              {previous && (
                <HeroStat
                  icon={Sparkles}
                  label="Version préc."
                  value={`v${previous.label}`}
                  detail={previous.date ? `${previous.date} · ${previous.count} tickets` : `${previous.count} tickets`}
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

      {/* Table : tickets de la version sélectionnée */}
      <VersionTicketsTable
        tickets={currentTickets}
        title={`Tickets livrés en ${currentLabel}`}
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
