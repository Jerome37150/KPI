import { C } from '../styles/theme';

// ============================================
// Logo Inaxel — variantes "compact" et "full"
// Inspiré de inaxel-pilot/_components/InaxelLogo.vue
// ============================================
export function LogoInaxel({ variant = "compact", subtitle = "KPI" }) {
  if (variant === "full") {
    return (
      <svg
        viewBox="0 0 265 145"
        width="220" height="120"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Inaxel ${subtitle}`}
        style={{ display: "block", maxWidth: "100%", height: "auto" }}
      >
        <text x="2" y="70"
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="800" fontSize="44" fill={C.gray900} letterSpacing="-0.5">
          inaxel
        </text>
        {/* Soleil 9 rayons, centre (180, 50), rayon 40 */}
        <g stroke={C.orange} strokeWidth="3.5" strokeLinecap="round">
          <line x1="180" y1="50" x2="187" y2="11"/>
          <line x1="180" y1="50" x2="197" y2="14"/>
          <line x1="180" y1="50" x2="206" y2="19"/>
          <line x1="180" y1="50" x2="213" y2="27"/>
          <line x1="180" y1="50" x2="218" y2="36"/>
          <line x1="180" y1="50" x2="220" y2="47"/>
          <line x1="180" y1="50" x2="219" y2="57"/>
          <line x1="180" y1="50" x2="216" y2="67"/>
          <line x1="180" y1="50" x2="211" y2="76"/>
        </g>
        <text x="2" y="103"
          fontFamily="Inter, -apple-system, sans-serif"
          fontWeight="700" fontSize="24">
          <tspan fill={C.gray900}>Inaxel&#160;</tspan>
          <tspan fill={C.orange}>{subtitle}</tspan>
        </text>
        <text x="2" y="126"
          fontFamily="Inter, -apple-system, sans-serif"
          fontSize="13" fill={C.orange}>
          pilotage produits &amp; qualité
        </text>
      </svg>
    );
  }

  // compact : "inaxel ✶ KPI" (header / sidebar)
  return (
    <svg
      viewBox="0 0 238 52"
      width="148" height="32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Inaxel ${subtitle}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      <text x="2" y="38"
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="800" fontSize="34" fill={C.gray900} letterSpacing="-0.5">
        inaxel
      </text>
      <g stroke={C.orange} strokeWidth="2.6" strokeLinecap="round">
        <line x1="138" y1="26" x2="142" y2="4"/>
        <line x1="138" y1="26" x2="147" y2="6"/>
        <line x1="138" y1="26" x2="152" y2="9"/>
        <line x1="138" y1="26" x2="156" y2="13"/>
        <line x1="138" y1="26" x2="159" y2="19"/>
        <line x1="138" y1="26" x2="160" y2="24"/>
        <line x1="138" y1="26" x2="160" y2="30"/>
        <line x1="138" y1="26" x2="158" y2="35"/>
        <line x1="138" y1="26" x2="155" y2="40"/>
      </g>
      <text x="168" y="38"
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="700" fontSize="26" fill={C.orange}>
        {subtitle}
      </text>
    </svg>
  );
}
