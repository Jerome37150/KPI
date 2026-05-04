import { useState, useMemo } from 'react';
import { Inbox, Layers, Package, Target, Sparkles } from 'lucide-react';
import { C } from '../styles/theme';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { MonthPicker } from '../components/MonthPicker';
import { KpiCard } from '../components/KpiCard';
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* En-tête + sélecteur */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <SectionTitle
          overline="Tickets"
          icon={Inbox}
          sub="Enregistrement Notion · vue mensuelle (les blocs Volume et Tableau sont indépendants du sélecteur)"
        >Enregistrement</SectionTitle>
        <MonthPicker selectedDate={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Row 1 : KPI + Classification */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 1fr) 2.2fr", gap: 16 }}>
        <KpiCard
          icon={Inbox}
          label="Enregistrés"
          sub="Date de création"
          value={currentTickets.length}
          previous={previousTickets.length}
          invertTrend={true}
        />
        <BreakdownCard
          title="Répartition par classification"
          icon={Layers}
          entries={classifEntries}
          currentLabel={currentLabel}
          previousLabel={previousLabel}
          getColor={(label) => CLASSIF_COLORS[label] || C.inkSoft}
        />
      </div>

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
