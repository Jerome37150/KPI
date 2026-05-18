import { LogOut, RefreshCw } from 'lucide-react';
import { C, LAYOUT } from '../styles/theme';
import { Sidebar } from './Sidebar';
import { Button } from './primitives/Button';
import { formatLastRefresh } from '../utils/format';

// ============================================
// AppLayout — sidebar gauche + header + main + footer
// Pattern inspiré de inaxel-pilot/views/_layout/InaxelAppLayout.vue
// ============================================
export function AppLayout({ children, tab, onTabChange, onLogout, currentLabel, lastRefresh, procedures }) {
  const lastRefreshFr = formatLastRefresh(lastRefresh);
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      {/* Sidebar */}
      <Sidebar tab={tab} onSelect={onTabChange} procedures={procedures} />

      {/* Zone principale (décalée du sidebar) */}
      <div style={{ marginLeft: LAYOUT.sidebarWidth, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 40,
          height: LAYOUT.headerHeight,
          background: C.paper,
          borderBottom: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", gap: 16,
        }}>
          <div>
            <div style={{
              fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: "-0.01em",
            }}>{currentLabel}</div>
            <div style={{
              fontSize: 11, color: C.inkDim, marginTop: 2,
              textTransform: "capitalize", fontVariantNumeric: "tabular-nums",
            }}>{today}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button variant="outline" icon={RefreshCw} size="sm">Refresh</Button>
            <button
              onClick={onLogout}
              title="Déconnexion"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "transparent",
                border: `1px solid ${C.line}`,
                color: C.inkSoft, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; }}
            >
              <LogOut size={14} strokeWidth={2.2} />
            </button>
          </div>
        </header>

        {/* Main */}
        <main style={{
          flex: 1,
          padding: "24px 24px 60px",
          maxWidth: LAYOUT.contentMaxWidth,
          margin: "0 auto",
          width: "100%",
        }}>
          {children}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: `1px solid ${C.line}`,
          padding: "14px 24px",
          background: C.paper,
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 11, color: C.inkDim, gap: 16, flexWrap: "wrap",
          }}>
            <span style={{ fontWeight: 600 }}>NAXI.G · KPI - Produits & qualité</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span>Auto-sync 15 min ·</span>
              <span style={{ color: C.inkSoft, fontWeight: 600 }}>
                {lastRefreshFr ? `Dernier refresh : ${lastRefreshFr}` : "Dernier refresh : —"}
              </span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
