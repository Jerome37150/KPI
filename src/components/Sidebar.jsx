import { LayoutDashboard, FileText, Package, Sparkles, Building2, LineChart, LayoutGrid, Calendar } from 'lucide-react';
import { C, LAYOUT } from '../styles/theme';
import { LogoInaxel } from './LogoInaxel';

// ============================================
// NAV — structure du menu (cf. inaxel-pilot)
// ============================================
export const NAV_ITEMS = [
  { type: "window",   key: "dashboard",      label: "Dashboard",       icon: LayoutDashboard },
  { type: "category", label: "Tickets" },
  { type: "window",   key: "enregistrement", label: "Enregistrement",  icon: FileText },
  { type: "category", label: "Releases" },
  { type: "window",   key: "version",        label: "Version",         icon: Package },
  { type: "category", label: "Sprint" },
  { type: "window",   key: "sprint",         label: "Sprint en cours", icon: Sparkles },
  { type: "category", label: "Top Line" },
  { type: "window",   key: "suivi",          label: "Suivi",           icon: LineChart },
  { type: "window",   key: "immobilisation", label: "Immobilisation",  icon: Building2 },
  { type: "category", label: "Stratégie" },
  { type: "window",   key: "blueprint",      label: "Blue Print",      icon: LayoutGrid },
  { type: "window",   key: "gantt",          label: "Gantt",           icon: Calendar },
];

// ============================================
// Sidebar — drawer permanent à gauche, style inaxel-pilot
// ============================================
export function Sidebar({ tab, onSelect }) {
  return (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0,
      width: LAYOUT.sidebarWidth,
      background: C.paper,
      borderRight: `1px solid ${C.line}`,
      display: "flex", flexDirection: "column",
      zIndex: 50,
    }}>
      {/* Bandeau logo */}
      <div style={{
        height: LAYOUT.headerHeight,
        padding: "0 16px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", alignItems: "center",
      }}>
        <LogoInaxel variant="compact" subtitle="KPI" />
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1, overflowY: "auto",
        padding: "8px 0 16px",
        display: "flex", flexDirection: "column",
      }}>
        {NAV_ITEMS.map((entry, i) => {
          if (entry.type === "category") {
            return (
              <div key={`cat-${i}-${entry.label}`} style={{
                padding: "16px 14px 5px",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", color: C.orange,
                borderTop: `1px solid ${C.line}`,
                marginTop: 4,
              }}>{entry.label}</div>
            );
          }

          const active = tab === entry.key;
          const Icon = entry.icon;
          return (
            <button
              key={entry.key}
              onClick={() => onSelect(entry.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%",
                padding: "8px 14px 8px 18px",
                background: active ? C.orangeBg : "transparent",
                color: active ? C.orange : C.inkDim,
                border: "none",
                borderLeft: `2px solid ${active ? C.orange : "transparent"}`,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                textAlign: "left",
                transition: "background 0.12s, color 0.12s",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = C.gray50;
                  e.currentTarget.style.color = C.ink;
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = C.inkDim;
                }
              }}
            >
              {Icon && <Icon size={15} strokeWidth={1.8} />}
              {entry.label}
            </button>
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div style={{
        padding: "14px 18px",
        borderTop: `1px solid ${C.line}`,
        fontSize: 10, color: C.inkMute, fontWeight: 500, letterSpacing: "0.04em",
      }}>
        NAXI.G · Produits & qualité
      </div>
    </aside>
  );
}
