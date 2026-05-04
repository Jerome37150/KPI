import { useState, useEffect } from 'react';

// ============================================
// FETCH des données Notion (data.json généré par scripts/fetch-notion.js)
// ============================================
export function useNotionData() {
  const [data, setData] = useState({ classique: [], topline: [], generatedAt: null });
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const dataUrl = `${baseUrl.replace(/\/$/, '')}/data.json`;

    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        setData({
          classique:   Array.isArray(json?.classique) ? json.classique : [],
          topline:     Array.isArray(json?.topline)   ? json.topline   : [],
          generatedAt: json?.generatedAt || null,
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
