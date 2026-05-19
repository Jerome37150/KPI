// ============================================
// Helpers pour ouvrir un prototype externe en popup centrée.
// - openMobilePreview : viewport étroit (420×900) → force le rendu mobile
//   du site cible via ses media queries.
// - openDesktopPreview : viewport desktop centré, légèrement plus petit
//   que l'écran utilisateur (max 1280×820, clamp à 90 % de l'écran).
//
// Fallback systématique : si la popup est bloquée par le navigateur,
// ouverture standard en nouvel onglet.
// ============================================

function openPreviewWindow(url, name, width, height) {
  const left = Math.max(0, Math.round((window.screen.width  - width)  / 2));
  const top  = Math.max(0, Math.round((window.screen.height - height) / 2));
  const features = [
    `width=${width}`, `height=${height}`,
    `left=${left}`, `top=${top}`,
    'scrollbars=yes', 'resizable=yes',
    'toolbar=no', 'location=no', 'menubar=no', 'status=no',
  ].join(',');
  const win = window.open(url, name, features);
  if (!win) window.open(url, '_blank', 'noopener,noreferrer');
}

export function openMobilePreview(url) {
  openPreviewWindow(url, 'inaxel-mobile-preview', 420, 900);
}

export function openDesktopPreview(url) {
  // Clamp à 90 % de l'écran pour rester confortable sur petits écrans
  const w = Math.min(1280, Math.round(window.screen.width  * 0.9));
  const h = Math.min(820,  Math.round(window.screen.height * 0.88));
  openPreviewWindow(url, 'inaxel-desktop-preview', w, h);
}
