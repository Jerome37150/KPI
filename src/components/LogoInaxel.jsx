import { C } from '../styles/theme';

// ============================================
// Logo Inaxel — variantes "compact" et "full"
// Le viewBox s'adapte à la longueur du subtitle (KPI vs KPI & Projets, etc.)
// pour éviter que le sous-titre déborde ou soit tronqué.
// ============================================
export function LogoInaxel({ variant = "compact", subtitle = "KPI" }) {
  if (variant === "full") {
    // Sous-titre rendu plus petit s'il est long, pour rester sous l'illustration
    const subFontSize = subtitle.length > 5 ? 18 : 24;
    const subEstimatedWidth = subtitle.length * subFontSize * 0.6;
    const minVbWidth = 265;
    const vbWidth = Math.max(minVbWidth, 95 + subEstimatedWidth);
    const displayWidth = 220 * (vbWidth / minVbWidth);

    return (
      <svg
        viewBox={`0 0 ${vbWidth} 145`}
        width={displayWidth}
        height="120"
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
          fontWeight="700">
          <tspan fill={C.gray900} fontSize="24">Inaxel&#160;</tspan>
          <tspan fill={C.orange} fontSize={subFontSize}>{subtitle}</tspan>
        </text>
        <text x="2" y="126"
          fontFamily="Inter, -apple-system, sans-serif"
          fontSize="13" fill={C.orange}>
          pilotage produits &amp; qualité
        </text>
      </svg>
    );
  }

  // compact : "inaxel ✶ KPI [& Projets]" (header / sidebar)
  const subFontSize = subtitle.length > 5 ? 16 : 26;
  const subEstimatedWidth = subtitle.length * subFontSize * 0.6;
  const minVbWidth = 238;
  const vbWidth = Math.max(minVbWidth, 170 + subEstimatedWidth);
  const displayWidth = 148 * (vbWidth / minVbWidth);
  // Y baseline du subtitle remonté un peu si fontSize plus petite pour rester centré
  const subY = subFontSize >= 26 ? 38 : 32;

  return (
    <svg
      viewBox={`0 0 ${vbWidth} 52`}
      width={displayWidth}
      height="32"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`Inaxel ${subtitle}`}
      style={{ display: "block", flexShrink: 0, maxWidth: "100%", height: "auto" }}
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
      <text x="168" y={subY}
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="700" fontSize={subFontSize} fill={C.orange}>
        {subtitle}
      </text>
    </svg>
  );
}
