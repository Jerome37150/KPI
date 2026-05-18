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
// Catégories `collapsible:true` peuvent être pliées (chevron). Les items
// portant un `parent: "<key>"` ne sont rendus que si tous leurs ancêtres
// (jusqu'à la racine) sont dépliés.
// items `strategie:true` sont masqués tant que le code n'est pas saisi.
// `notionProject` sur une catégorie : option du select 🏗️ PROJETS dans Notion —
// les pages enfants filtrent automatiquement les données par cette valeur.
// ============================================
export const NAV_ITEMS = [
  { type: "window",   key: "dashboard",       label: "Dashboard",        icon: LayoutDashboard },

  // === SAV & DEV produits ===
  { type: "category", key: "sav-dev",         label: "SAV & DEV produits", collapsible: true },
  { type: "window",   key: "enregistrement",  label: "Enregistrement",   icon: FileText, parent: "sav-dev" },
  { type: "window",   key: "version",         label: "Version",          icon: Package,  parent: "sav-dev" },
  { type: "window",   key: "sprint",          label: "Sprint en cours",  icon: Sparkles, parent: "sav-dev" },

  // === Procédures (vide pour l'instant) ===
  { type: "category", key: "procedures",      label: "Procédures",       collapsible: true },

  // === Projets ===
  { type: "category", key: "projets",         label: "Projets",          collapsible: true },
  { type: "window",   key: "immobilisation",  label: "Immobilisation",   icon: Building2, parent: "projets" },

  // ─ Naxi.G Full Saas ─
  { type: "category", key: "naxi-saas",       label: "Naxi.G Full Saas", collapsible: true, parent: "projets", notionProject: "Naxi G Full Saas" },
  { type: "window",   key: "naxi-saas-cdc",   label: "Cahier des charges", icon: ClipboardList, parent: "naxi-saas" },
  { type: "window",   key: "suivi",           label: "Suivi",              icon: LineChart,     parent: "naxi-saas" },

  // ─ NAX7 full web (stratégique) ─
  { type: "category", key: "nax7-full-web",   label: "NAX7 full web",    collapsible: true, parent: "projets", strategie: true, notionProject: "Nax7 Full Web" },
  { type: "window",   key: "blueprint",       label: "Blue Print",       icon: LayoutGrid,    parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "gantt",           label: "Gantt",            icon: Calendar,      parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "cdc-nax7-full-web", label: "Cahier des charges", icon: ClipboardList, parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "calcul-prix",     label: "Calcul prix",      icon: Calculator,    parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "rd-mode-degrade", label: "R&D mode dégradé", icon: ShieldAlert,   parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "rd-migration",    label: "R&D migration",    icon: Database,      parent: "nax7-full-web", strategie: true },
  { type: "window",   key: "portail-clients-residents", label: "Portail clients et résidents", icon: ClipboardList, parent: "nax7-full-web", strategie: true },

  // ─ Nax7 light (stratégique) ─
  { type: "category", key: "nax7-light",      label: "Nax7 light",       collapsible: true, parent: "projets", strategie: true, notionProject: "Nax7 Light" },
  { type: "window",   key: "cdc-nax7-light",  label: "Cahier des charges", icon: ClipboardList, parent: "nax7-light", strategie: true },

  // ─ Nax7 Manager (stratégique) ─
  { type: "category", key: "nax7-manager",    label: "Nax7 Manager",     collapsible: true, parent: "projets", strategie: true, notionProject: "Nax7 Manager" },
  { type: "window",   key: "cdc-nax7-manager", label: "Cahier des charges", icon: ClipboardList, parent: "nax7-manager", strategie: true },

  // ─ Inaxel Pilot (stratégique) ─
  { type: "category", key: "inaxel-pilot",    label: "Inaxel Pilot",     collapsible: true, parent: "projets", strategie: true, notionProject: "Inaxel Pilot" },
  { type: "window",   key: "cdc-inaxel-pilot", label: "Cahier des charges", icon: ClipboardList, parent: "inaxel-pilot", strategie: true },
  { type: "window",   key: "espace-client-inaxel", label: "Espace client (site inaxel)", icon: ClipboardList, parent: "inaxel-pilot", strategie: true },
];

// Index pour lookups O(1) sur la chaîne de parent
const BY_KEY = new Map(NAV_ITEMS.filter(e => e.key).map(e => [e.key, e]));

// Profondeur d'imbrication (Dashboard = 0, sous-Projets = 1, sous-Naxi-Saas = 2)
function depthOf(entry) {
  let d = 0;
  let cur = entry;
  while (cur?.parent) { d++; cur = BY_KEY.get(cur.parent); }
  return d;
}

// True si au moins un ancêtre est replié → l'entrée doit être masquée
function isHiddenByCollapse(entry, collapsed) {
  let cur = BY_KEY.get(entry.parent);
  while (cur) {
    if (collapsed.has(cur.key)) return true;
    cur = BY_KEY.get(cur.parent);
  }
  return false;
}

// Résout le projet Notion d'un onglet via sa catégorie parente directe.
// Retourne null pour les vues globales (dashboard, sav-dev, immobilisation, etc.).
export function projectForTab(tab) {
  const win = BY_KEY.get(tab);
  if (!win?.parent) return null;
  const cat = BY_KEY.get(win.parent);
  return cat?.notionProject || null;
}

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
          // Masque les éléments dont un ancêtre est replié
          if (isHiddenByCollapse(entry, collapsed)) return null;

          const depth = depthOf(entry);

          if (entry.type === "category") {
            if (entry.collapsible && entry.key) {
              const isCollapsed = collapsed.has(entry.key);
              const Caret = isCollapsed ? ChevronRight : ChevronDown;
              const isTopLevel = depth === 0;
              return (
                <button
                  type="button"
                  key={`cat-${entry.key}`}
                  onClick={() => toggleCollapse(entry.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    width: "100%",
                    padding: isTopLevel
                      ? "16px 14px 5px"
                      : "10px 14px 5px 26px",
                    fontSize: isTopLevel ? 10 : 11,
                    fontWeight: 700,
                    letterSpacing: isTopLevel ? "0.07em" : "0.04em",
                    textTransform: "uppercase",
                    color: isTopLevel ? C.orange : C.inkDim,
                    borderTop: isTopLevel ? `1px solid ${C.line}` : "none",
                    marginTop: isTopLevel ? 4 : 0,
                    background: "transparent", border: "none",
                    textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                    transition: "background 0.12s, color 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  title={isCollapsed ? "Déplier" : "Replier"}
                >
                  <Caret size={isTopLevel ? 11 : 10} strokeWidth={2.4} />
                  {entry.label}
                </button>
              );
            }
            // Catégorie non-collapsible (header simple)
            return (
              <div key={`cat-${i}-${entry.label}`} style={{
                padding: depth === 0 ? "16px 14px 5px" : "10px 14px 5px 26px",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", color: C.orange,
                borderTop: depth === 0 ? `1px solid ${C.line}` : "none",
                marginTop: depth === 0 ? 4 : 0,
              }}>{entry.label}</div>
            );
          }

          // window — indentation selon profondeur
          // depth 0 : window racine (Dashboard) → 18px
          // depth 1 : window sous catégorie de niveau 1 → 32px
          // depth 2 : window sous sous-catégorie (sous Projets) → 44px
          const active = tab === entry.key;
          const Icon = entry.icon;
          const paddingLeft = depth === 0 ? 18 : depth === 1 ? 32 : 44;
          return (
            <button
              key={entry.key}
              onClick={() => onSelect(entry.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                width: "100%",
                padding: `8px 14px 8px ${paddingLeft}px`,
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
