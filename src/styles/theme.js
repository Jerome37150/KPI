// ============================================
// THEME - Tokens de design Inaxel
// ============================================
// Source de vérité : aligné sur le design system inaxel-pilot
// (cf. inaxel-pilot/src/_assets/styles/_tokens.css).
// Usage : import { C, RADIUS, SHADOW, FONT, LAYOUT } from '../styles/theme';
// ============================================

export const C = {
  // ── Brand ────────────────────────────────────────
  orange:      "#e55010",
  orangeHover: "#f06a2a",
  orangeLight: "#f8a07a",
  orangeBg:    "rgba(229, 80, 16, 0.10)",
  orangeFaint: "rgba(229, 80, 16, 0.05)",
  orangeDark:  "#b8400d",
  orangeSoft:  "rgba(229, 80, 16, 0.10)", // alias compat

  violet:    "#885cf6",
  violetBg:  "rgba(139, 92, 246, 0.10)",

  // ── Neutrals (Figma scale) ───────────────────────
  gray900: "#09090b",
  gray800: "#18181b",
  gray700: "#3f3f46",
  gray600: "#52525b",
  gray500: "#71717a",
  gray400: "#a1a1aa",
  gray300: "#d4d4d8",
  gray200: "#e4e4e7",
  gray100: "#f4f4f5",
  gray50:  "#fafafa",

  // ── Aliases sémantiques ─────────────────────────
  bg:       "#f4f4f5", // page-bg
  bgSoft:   "#fafafa", // surface secondaire
  paper:    "#ffffff",
  ink:      "#09090b", // text-primary
  inkSoft:  "#3f3f46", // gray-700
  inkDim:   "#71717a", // text-muted
  inkMute:  "#a1a1aa", // text-faint
  line:     "#d4d4d8", // border
  lineDark: "#a1a1aa",

  // ── Sémantique ──────────────────────────────────
  green:     "#16a34a",
  greenSoft: "rgba(22, 163, 74, 0.10)",
  red:       "#ef4444",
  redSoft:   "rgba(239, 68, 68, 0.10)",
  amber:     "#d97706",
  amberSoft: "rgba(217, 119, 6, 0.10)",
  blue:      "#1890ff",
  blueSoft:  "rgba(24, 144, 255, 0.10)",
  purple:    "#885cf6",
  purpleSoft:"rgba(139, 92, 246, 0.10)",
};

export const RADIUS = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  full: 9999,
};

export const SHADOW = {
  sm:     "0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
  card:   "0 8px 20px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.08)",
  md:     "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
  lg:     "0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.04)",
  orange: "0 4px 14px rgba(229, 80, 16, 0.35)",
};

export const FONT = {
  base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

export const LAYOUT = {
  headerHeight:    64,
  sidebarWidth:    220,
  contentMaxWidth: 1300,
};
