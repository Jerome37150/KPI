import { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { LogoInaxel } from '../components/LogoInaxel';

const VALID_ID  = "inaxel";
const VALID_PWD = "inaxelkpi";

// ============================================
// LoginPage — formulaire ID / mot de passe (insensible à la casse)
// ============================================
export function LoginPage({ onLogin }) {
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const idMatch  = id.trim().toLowerCase()  === VALID_ID;
    const pwdMatch = pwd.trim().toLowerCase() === VALID_PWD;
    if (idMatch && pwdMatch) {
      setError(null);
      onLogin?.();
    } else {
      setError("Identifiant ou mot de passe incorrect.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.ink,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%", maxWidth: 420,
          background: C.paper,
          borderRadius: RADIUS.xl,
          boxShadow: SHADOW.card,
          border: `1px solid ${C.line}`,
          padding: "40px 36px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <LogoInaxel variant="full" subtitle="Produits & Qualité" />
        </div>

        <div style={{
          textAlign: "center", marginBottom: 24,
          fontSize: 13, color: C.inkSoft,
        }}>
          Connexion à l'espace de pilotage
        </div>

        {/* Identifiant */}
        <Field
          icon={User}
          type="text"
          label="Identifiant"
          value={id}
          onChange={setId}
          autoFocus
          autoComplete="username"
        />

        {/* Mot de passe */}
        <Field
          icon={Lock}
          type="password"
          label="Mot de passe"
          value={pwd}
          onChange={setPwd}
          autoComplete="current-password"
          style={{ marginTop: 14 }}
        />

        {/* Erreur */}
        {error && (
          <div style={{
            marginTop: 14, padding: "10px 12px",
            background: C.redSoft, color: C.red,
            borderRadius: RADIUS.md, fontSize: 12, fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 8,
            width: "100%", boxSizing: "border-box",
          }}>
            <AlertCircle size={14} strokeWidth={2.4} />
            {error}
          </div>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: 20,
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
          NAXI.G · Produits & Qualité
        </div>
      </form>
    </div>
  );
}

// ── Champ formulaire (interne) ──
function Field({ icon: Icon, type, label, value, onChange, autoFocus, autoComplete, style }) {
  const [focused, setFocused] = useState(false);
  return (
    <label style={{ display: "block", ...style }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: C.gray400,
        marginBottom: 6,
      }}>{label}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "10px 12px",
        background: C.paper,
        border: `1px solid ${focused ? C.orange : C.line}`,
        borderRadius: RADIUS.md,
        transition: "border-color 0.15s",
      }}>
        {Icon && <Icon size={14} color={focused ? C.orange : C.inkDim} strokeWidth={2.2} />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "inherit", fontSize: 13, color: C.ink,
            padding: 0,
          }}
        />
      </div>
    </label>
  );
}
