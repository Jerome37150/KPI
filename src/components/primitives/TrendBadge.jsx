import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { C } from '../../styles/theme';

// ============================================
// TrendBadge — flèche + delta avec couleur sémantique
// invertColors=true : diminution = vert (cas bugs / enregistrements)
// ============================================
export function TrendBadge({ delta, suffix = "%", invertColors = false, size = "md" }) {
  const isUp   = delta > 0;
  const isDown = delta < 0;
  const upColor   = invertColors ? C.red   : C.green;
  const downColor = invertColors ? C.green : C.red;
  const color = isUp ? upColor : isDown ? downColor : C.inkDim;
  const bg = isUp   ? (invertColors ? C.redSoft : C.greenSoft)
          : isDown ? (invertColors ? C.greenSoft : C.redSoft)
          : C.bgSoft;
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  const padding  = size === "sm" ? "3px 8px" : "4px 10px";
  const fontSize = size === "sm" ? 11 : 12;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding, borderRadius: 999, background: bg,
      color, fontSize, fontWeight: 700,
    }}>
      <Icon size={size === "sm" ? 11 : 12} strokeWidth={2.5} />
      {Math.abs(delta)}{suffix}
    </div>
  );
}
