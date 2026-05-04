// ============================================
// PALETTES MÉTIER (mapping label → couleur)
// ============================================
import { C } from '../styles/theme';

export const CLASSIF_COLORS = {
  "BUG D'USAGE":      C.amber,
  "BUG OPERATIONNEL": "#EA580C",
  "BUG STRUCTURANT":  C.red,
  "DEV avec CC":      C.green,
  "DEV sans CC":      C.blue,
  "STACK TECH":       C.gray600,
  "DATA HUB - CTV":   "#7C2D12",
};

export const PRIO_COLORS = {
  "Haute":       C.red,
  "Moyenne":     C.amber,
  "Pas urgente": C.green,
};

const FALLBACK_PALETTE = [
  "#3B82F6", "#10B981", "#EAB308", "#A855F7", "#EC4899",
  "#06B6D4", "#F97316", "#84CC16", "#6366F1", "#0EA5E9",
];

export function paletteColor(i) {
  return FALLBACK_PALETTE[i % FALLBACK_PALETTE.length];
}
