import { C, RADIUS, SHADOW } from '../styles/theme';
import { LogoInaxel } from '../components/LogoInaxel';

// ============================================
// LoginPage — accès direct (un seul bouton, pas de credentials)
// ============================================
export function LoginPage({ onLogin }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.ink,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: C.paper,
        borderRadius: RADIUS.xl,
        boxShadow: SHADOW.card,
        border: `1px solid ${C.line}`,
        padding: "40px 36px 32px",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <LogoInaxel variant="full" subtitle="KPI" />
        </div>

        <div style={{
          textAlign: "center", marginBottom: 24,
          fontSize: 13, color: C.inkSoft,
        }}>
          Connexion à l'espace de pilotage
        </div>

        <button
          onClick={onLogin}
          autoFocus
          style={{
            width: "100%",
            padding: "12px 16px",
            background: C.orange,
            color: "#fff",
            border: "none",
            borderRadius: RADIUS.md,
            fontSize: 13, fontWeight: 700,
            fontFamily: "inherit",
            letterSpacing: "0.02em",
            cursor: "pointer",
            transition: "all 0.15s",
            boxShadow: SHADOW.orange,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.orangeHover; }}
          onMouseLeave={e => { e.currentTarget.style.background = C.orange; }}
        >
          Se connecter
        </button>

        <div style={{
          marginTop: 24, paddingTop: 16,
          borderTop: `1px solid ${C.line}`,
          textAlign: "center",
          fontSize: 10, color: C.inkMute,
          letterSpacing: "0.04em",
        }}>
          NAXI.G · KPI - Produits & qualité
        </div>
      </div>
    </div>
  );
}
