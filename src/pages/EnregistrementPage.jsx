import { useState, useMemo } from 'react';
import { Inbox, Layers, Package, Target, Sparkles } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { TrendBadge } from '../components/primitives/TrendBadge';
import { MonthPicker } from '../components/MonthPicker';
import { BreakdownCard } from '../components/BreakdownCard';
import { TimelineChart } from '../components/TimelineChart';
import { TicketsTable } from '../components/TicketsTable';
import { NOW, shiftMonth, isInMonth, monthLabelShort } from '../utils/dates';
import { CLASSIF_COLORS, PRIO_COLORS, paletteColor } from '../utils/colors';

// ============================================
// EnregistrementPage — données d'enregistrement des tickets Notion
// ============================================
export function EnregistrementPage({ data }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date(NOW.getFullYear(), NOW.getMonth(), 1));
  const previousMonth = shiftMonth(selectedMonth, -1);

  const tickets = data.classique || [];

  const { currentTickets, previousTickets } = useMemo(() => ({
    currentTickets:  tickets.filter(t => isInMonth(t.dateCreation, selectedMonth)),
    previousTickets: tickets.filter(t => isInMonth(t.dateCreation, previousMonth)),
  }), [tickets, selectedMonth, previousMonth]);

  // Helper : compte par clé (string ou tableau)
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

  const classifEntries = buildEntries(
    countBy(currentTickets, "classification"),
    countBy(previousTickets, "classification"),
    Object.keys(CLASSIF_COLORS),
  );
  const produitEntries = buildEntries(
    countBy(currentTickets, "produits", { array: true }),
    countBy(previousTickets, "produits", { array: true }),
  ).slice(0, 8);
  const prioEntries = buildEntries(
    countBy(currentTickets, "priorisation"),
    countBy(previousTickets, "priorisation"),
    ["Haute", "Moyenne", "Pas urgente"],
  );
  const fonctionEntries = buildEntries(
    countBy(currentTickets, "fonctions"),
    countBy(previousTickets, "fonctions"),
  ).slice(0, 8);

  const currentLabel  = monthLabelShort(selectedMonth);
  const previousLabel = monthLabelShort(previousMonth);

  const currentCount  = currentTickets.length;
  const previousCount = previousTickets.length;
  const delta = previousCount === 0
    ? (currentCount > 0 ? 100 : 0)
    : Math.round(((currentCount - previousCount) / previousCount) * 100);
  const sameValue = currentCount === previousCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* En-tête + KPI compact + sélecteur */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <SectionTitle
          overline="Tickets"
          icon={Inbox}
          sub="Enregistrement Notion · vue mensuelle (les blocs Volume et Tableau sont indépendants du sélecteur)"
        >Enregistrement</SectionTitle>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* KPI compact */}
          <div
            title={`Date de création · préc. ${previousCount}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "8px 14px", borderRadius: RADIUS.md,
              background: C.paper, border: `1px solid ${C.line}`,
              fontFamily: "inherit",
            }}
          >
            <Inbox size={14} color={C.inkSoft} strokeWidth={2.2} />
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
              textTransform: "uppercase", color: C.gray400,
            }}>Enregistrés</span>
            <span style={{
              fontSize: 16, fontWeight: 700, color: C.ink,
              letterSpacing: "-0.01em", fontVariantNumeric: "tabular-nums",
            }}>{currentCount}</span>
            {!sameValue && (
              <TrendBadge delta={delta} suffix="%" invertColors={true} size="sm" />
            )}
          </div>
          <MonthPicker selectedDate={selectedMonth} onChange={setSelectedMonth} />
        </div>
      </div>

      {/* Row 1 : Classification (pleine largeur) */}
      <BreakdownCard
        title="Répartition par classification"
        icon={Layers}
        entries={classifEntries}
        currentLabel={currentLabel}
        previousLabel={previousLabel}
        getColor={(label) => CLASSIF_COLORS[label] || C.inkSoft}
      />

      {/* Row 2 : Produit / Priorisation / Fonction */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <BreakdownCard
          title="Par produit"
          icon={Package}
          entries={produitEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(_, i) => paletteColor(i)}
        />
        <BreakdownCard
          title="Par priorisation"
          icon={Target}
          entries={prioEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(label) => PRIO_COLORS[label] || C.inkSoft}
        />
        <BreakdownCard
          title="Par fonction"
          icon={Sparkles}
          entries={fonctionEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(_, i) => paletteColor(i + 3)}
        />
      </div>

      {/* Timeline (indépendant) */}
      <TimelineChart tickets={tickets} title="Volume d'enregistrement" />

      {/* Table (indépendante) */}
      <TicketsTable tickets={tickets} limit={20} />
    </div>
  );
}
