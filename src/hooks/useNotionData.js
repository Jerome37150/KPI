import { useState, useEffect } from 'react';

// ============================================
// FETCH des données Notion (data.json généré par scripts/fetch-notion.js)
// ============================================
export function useNotionData() {
  const [data, setData] = useState({
    classique: [], topline: [], suiviLundi: [], equipe: [],
    cartoPmsWeb: [], cartoPmsMobile: [], cartoManager: [],
    cii: { rows: [], generatedAt: null },
    generatedAt: null,
  });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const root = baseUrl.replace(/\/$/, '');
    const dataUrl = `${root}/data.json`;
    const ciiUrl  = `${root}/cii-data.json`;

    Promise.all([
      fetch(dataUrl).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      fetch(ciiUrl).then(res => res.ok ? res.json() : null).catch(() => null),
    ])
      .then(([json, cii]) => {
        setData({
          classique:      Array.isArray(json?.classique)      ? json.classique      : [],
          topline:        Array.isArray(json?.topline)        ? json.topline        : [],
          suiviLundi:     Array.isArray(json?.suiviLundi)     ? json.suiviLundi     : [],
          equipe:         Array.isArray(json?.equipe)         ? json.equipe         : [],
          cartoPmsWeb:    Array.isArray(json?.cartoPmsWeb)    ? json.cartoPmsWeb    : [],
          cartoPmsMobile: Array.isArray(json?.cartoPmsMobile) ? json.cartoPmsMobile : [],
          cartoManager:   Array.isArray(json?.cartoManager)   ? json.cartoManager   : [],
          cii: {
            rows:        Array.isArray(cii?.rows) ? cii.rows : [],
            generatedAt: cii?.generatedAt || null,
          },
          generatedAt:    json?.generatedAt || null,
        });
        setLoaded(true);
      })
      .catch(err => {
        console.warn('Pas de data.json disponible :', err.message);
        setError(err.message);
        setLoaded(true);
      });
  }, []);

  return { data, loaded, error };
}
