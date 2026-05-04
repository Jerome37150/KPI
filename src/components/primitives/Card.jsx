import { C, RADIUS, SHADOW } from '../../styles/theme';

// ============================================
// Card — conteneur primaire (white sur page bg gris)
// ============================================
export function Card({ children, style = {}, accent = false, padding = 20, ...rest }) {
  return (
    <div
      {...rest}
      style={{
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: RADIUS.lg,
        boxShadow: SHADOW.sm,
        padding,
        ...(accent ? { borderColor: C.orange } : {}),
        ...style,
      }}
    >{children}</div>
  );
}
