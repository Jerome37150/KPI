import { useState } from 'react';
import {
  LayoutDashboard, FileText, Package, Sparkles, Building2, LineChart,
  LayoutGrid, Calendar, ClipboardList, Calculator, ShieldAlert, Database,
  ChevronRight, ChevronDown, Lock, Unlock,
} from 'lucide-react';
import { C, LAYOUT } from '../styles/theme';
import { LogoInaxel } from './LogoInaxel';

// ============================================
// NAV — structure du menu
// Catégories `collapsible:true` peuvent être pliées (chevron). Windows portant
// un `parent: "<category-key>"` ne sont rendues que si le parent est ouvert.
// items `strategie:true` sont masqués tant que le code n'est pas saisi.
// ============================================
export const NAV_ITEMS = [
  { type: "window",   key: "dashboard",      label: "Dashboard",       icon: LayoutDashboard },

  { type: "category", label: "Tickets" },
  { type: "window",   key: "enregistrement", label: "Enregistrement",  icon: FileText },

  { type: "category", label: "Releases" },
  { type: "window",   key: "version",        label: "Version",         icon: Package },

  { type: "category", label: "Sprint" },
  { type: "window",   key: "sprint",         label: "Sprint en cours", icon: Sparkles },

  { type: "category", label: "Naxi.G Full Saas" },
  { type: "window",   key: "naxi-saas-cdc",  label: "Cahier des charges",              icon: ClipboardList },
  { type: "window",   key: "suivi",          label: "Suivi",           icon: LineChart },
  { type: "window",   key: "immobilisation", label: "Immobilisation",  icon: Building2 },

  // ── Projets stratégiques (verrouillés derrière un code, repliés par défaut) ──
  { type: "category", key: "nax7-full-web",      label: "NAX7 full web",            collapsible: true, strategie: true },
  { type: "window",   key: "blueprint",          label: "Blue Print",               icon: LayoutGrid,    parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "gantt",              label: "Gantt",                    icon: Calendar,      parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "cdc-nax7-full-web",  label: "Cahier des charges",       icon: ClipboardList, parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "calcul-prix",        label: "Calcul prix",              icon: Calculator,    parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "rd-mode-degrade",    label: "R&D mode dégradé",         icon: ShieldAlert,   parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "rd-migration",       label: "R&D migration",            icon: Database,      parent: "nax7-full-web", strategie: true },

  { type: "category", key: "nax7-light",         label: "Nax7 light",               collapsible: true, strategie: true },
  { type: "window",   key: "cdc-nax7-light",     label: "Cahier des charges",       icon: ClipboardList, parent: "nax7-light", strategie: true },

  { type: "category", key: "nax7-manager",       label: "Nax7 Manager",             collapsible: true, strategie: true },
  { type: "window",   key: "cdc-nax7-manager",   label: "Cahier des charges",       icon: ClipboardList, parent: "nax7-manager", strategie: true },

  { type: "category", key: "inaxel-pilot",       label: "Inaxel Pilot",             collapsible: true, strategie: true },
  { type: "window",   key: "cdc-inaxel-pilot",   label: "Cahier des charges",       icon: ClipboardList, parent: "inaxel-pilot", strategie: true },

  { type: "category", key: "espace-client-resident", label: "Espace client & Résident", collapsible: true, strategie: true },
  { type: "window",   key: "cdc-espace-client-resident", label: "Cahier des charges", icon: ClipboardList, parent: "espace-client-resident", strategie: true },

  { type: "category", key: "espace-client-inaxel", label: "Espace client (site inaxel)", collapsible: true, strategie: true },
  { type: "window",   key: "cdc-espace-client-inaxel", label: "Cahier des charges", icon: ClipboardList, parent: "espace-client-inaxel", strategie: true },
];

// Verrou visuel sur la section Stratégie
const STRAT_KEY = "inaxel_kpi_strat";
const STRAT_PWD = "123";
const STRATEGIE_KEYS = NAV_ITEMS.filter(e => e.type === "window" && e.strategie).map(e => e.key);

// Catégories repliables : repliées par défaut
const COLLAPSIBLE_KEYS = NAV_ITEMS
  .filter(e => e.type === "category" && e.collapsible && e.key)
  .map(e => e.key);

// ============================================
// Sidebar — drawer permanent à gauche, style inaxel-pilot
// ============================================
export function Sidebar({ tab, onSelect }) {
  const [stratUnlocked, setStratUnlocked] = useState(() => {
    try { return sessionStorage.getItem(STRAT_KEY) === "ok"; }
    catch { return false; }
  });

  // Set des catégories actuellement repliées (par défaut : toutes les collapsibles)
  const [collapsed, setCollapsed] = useState(() => new Set(COLLAPSIBLE_KEYS));

  const visibleItems = stratUnlocked
    ? NAV_ITEMS
    : NAV_ITEMS.filter(e => !e.strategie);

  const toggleCollapse = (catKey) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(catKey)) next.delete(catKey);
      else                  next.add(catKey);
      return next;
    });
  };

  const toggleStrat = () => {
    if (stratUnlocked) {
      try { sessionStorage.removeItem(STRAT_KEY); } catch { /* ignore */ }
      setStratUnlocked(false);
      if (STRATEGIE_KEYS.includes(tab)) onSelect("dashboard");
      return;
    }
    const pwd = window.prompt("Code d'accès — projets stratégiques");
    if (pwd === null) return;
    if (pwd === STRAT_PWD) {
      try { sessionStorage.setItem(STRAT_KEY, "ok"); } catch { /* ignore */ }
      setStratUnlocked(true);
    } else {
      window.alert("Code incorrect");
    }
  };

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
        <LogoInaxel variant="compact" subtitle="KPI & Projets" />
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1, overflowY: "auto",
        padding: "8px 0 16px",
        display: "flex", flexDirection: "column",
      }}>
        {visibleItems.map((entry, i) => {
          if (entry.type === "category") {
            if (entry.collapsible && entry.key) {
              const isCollapsed = collapsed.has(entry.key);
              const Caret = isCollapsed ? ChevronRight : ChevronDown;
              return (
                <button
                  type="button"
                  key={`cat-${entry.key}`}
                  onClick={() => toggleCollapse(entry.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    width: "100%",
                    padding: "16px 14px 5px",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                    textTransform: "uppercase", color: C.orange,
                    borderTop: `1px solid ${C.line}`,
                    marginTop: 4,
                    background: "transparent", border: "none",
                    textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  title={isCollapsed ? "Déplier" : "Replier"}
                >
                  <Caret size={11} strokeWidth={2.4} />
                  {entry.label}
                </button>
              );
            }
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

          // window
          if (entry.parent && collapsed.has(entry.parent)) return null;

          const active = tab === entry.key;
          const Icon = entry.icon;
          const nested = !!entry.parent;
          return (
            <button
              key={entry.key}
              onClick={() => onSelect(entry.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%",
                padding: nested ? "8px 14px 8px 32px" : "8px 14px 8px 18px",
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

      {/* Footer sidebar — clic pour (dé)verrouiller la section Stratégie */}
      <button
        type="button"
        onClick={toggleStrat}
        title={stratUnlocked ? "Verrouiller les projets stratégiques" : "Saisir le code d'accès"}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
          width: "100%",
          padding: "14px 18px",
          borderTop: `1px solid ${C.line}`,
          fontSize: 10, color: stratUnlocked ? C.orange : C.inkMute,
          fontWeight: 500, letterSpacing: "0.04em",
          background: "transparent", border: "none",
          textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          transition: "color 0.12s, background 0.12s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
      >
        <span>NAXI.G · Produits & qualité</span>
        {stratUnlocked
          ? <Unlock size={11} strokeWidth={2.2} color={C.orange} />
          : <Lock   size={11} strokeWidth={2.2} color={C.inkMute} />}
      </button>
    </aside>
  );
}
