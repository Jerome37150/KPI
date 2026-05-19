import { useMemo } from 'react';
import { Calculator, Table as TableIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// CalculPrixPage — analyse pricing NAX7 full web
// Données alimentées par la DB Notion '💰 Éléments de prix' (sous la page
// Calcul Prix - analyse). L'intro et chaque ligne sont éditables dans Notion.
// La légende des canaux + le mapping des couleurs catégorie/canal restent
// gérés côté code (cohérence visuelle).
// ============================================

// ── Canaux clients : online / offline B2C / offline B2B / POS ───────────
const CHANNELS = {
  DIRECT:   { label: 'Direct site',    color: '#10b981', kind: 'online' },
  OTA:      { label: 'OTA',            color: '#3b82f6', kind: 'online' },
  WALKIN:   { label: 'Walk-in / Tél',  color: '#64748b', kind: 'offline-b2c' },
  TO:       { label: 'TO / Agence',    color: '#8b5cf6', kind: 'offline-b2b' },
  CE:       { label: 'CE / Collec.',   color: '#ec4899', kind: 'offline-b2b' },
  RESIDENT: { label: 'Résident',       color: '#f59e0b', kind: 'offline-b2b' },
  POS:      { label: 'POS sur place',  color: '#dc2626', kind: 'offline-pos' },
};

// ── Couleur d'une catégorie (fallback gris si nouvelle catégorie inconnue) ──
const CATEGORY_COLOR = {
  'Hébergement':     C.blue,
  'Suppléments':     C.amber,
  'POS (sur place)': '#dc2626',
  'Promotions':      C.purple,
  'Tarifs B2B':      '#0ea5e9',
  'Cautions':        '#84cc16',
  'Taxes':           C.red,
  'Encaissement':    C.orange,
  'Pénalités':       '#94a3b8',
  'Refacturation':   '#f59e0b',
};
const DEFAULT_CATEGORY_COLOR = '#94a3b8';

export function CalculPrixPage({ data }) {
  const elements = data?.calculPrix?.elements || [];
  const intro    = data?.calculPrix?.intro || '';

  // Ordre des catégories tel qu'il apparaît dans les données (déjà trié par Ordre côté script)
  const categoryOrder = useMemo(() => {
    const seen = new Set();
    const out = [];
    elements.forEach(e => {
      if (e.categorie && !seen.has(e.categorie)) {
        seen.add(e.categorie);
        out.push(e.categorie);
      }
    });
    return out;
  }, [elements]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web"
        icon={Calculator}
        sub="Variables et composants entrant dans le calcul du prix"
      >Calcul prix</SectionTitle>

      {/* Intro Markdown éditable depuis Notion (si présente) */}
      {intro && (
        <Card padding={20}>
          <div className="md-intro">
            <ReactMarkdown>{intro}</ReactMarkdown>
          </div>
        </Card>
      )}

      {/* Légende canaux */}
      <Card padding={20}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TableIcon size={15} color={C.orange} strokeWidth={2.2} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Canaux clients · légende</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11 }}>
          <ChannelLegendGroup label="En ligne (online)" channels={['DIRECT','OTA']} />
          <ChannelLegendGroup label="Hors ligne B2C"    channels={['WALKIN']} />
          <ChannelLegendGroup label="Hors ligne B2B"    channels={['TO','CE','RESIDENT']} />
          <ChannelLegendGroup label="Sur place (POS)"   channels={['POS']} />
        </div>
      </Card>

      {/* Tableau exhaustif : éléments du calcul prix */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TableIcon size={13} color={C.orange} strokeWidth={2.2} />
            <div>
              <div style={{
                fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: C.orange, fontWeight: 700,
              }}>Éléments du calcul prix · {elements.length} variables référencées</div>
              <div style={{ fontSize: 11, color: C.inkDim, marginTop: 2 }}>
                Tous les éléments facturables / paramètres entrant dans le calcul, par catégorie
              </div>
            </div>
          </div>
        </div>

        {elements.length === 0 ? (
          <div style={{
            padding: 32, textAlign: 'center', color: C.inkDim, fontSize: 13,
          }}>
            Aucun élément de prix synchronisé pour le moment. Vérifie que la DB
            <b> 💰 Éléments de prix </b> est partagée avec l'intégration <code style={{
              background: C.bgSoft, padding: '2px 6px', borderRadius: 4,
              color: C.ink, fontFamily: 'monospace',
            }}>INAXEL_KPI</code> et attends le prochain sync.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.gray50 }}>
                  <th style={th({ minWidth: 130 })}>Catégorie</th>
                  <th style={th({ minWidth: 200 })}>Élément</th>
                  <th style={th({ minWidth: 240 })}>Variables d'entrée</th>
                  <th style={th({ minWidth: 240 })}>Composants tarif / taxe</th>
                  <th style={th({ minWidth: 200 })}>Canaux applicables</th>
                  <th style={th({ minWidth: 90 })}>Module</th>
                </tr>
              </thead>
              <tbody>
                {categoryOrder.map(catg => {
                  const rows = elements.filter(e => e.categorie === catg);
                  const catgColor = CATEGORY_COLOR[catg] || DEFAULT_CATEGORY_COLOR;
                  return rows.map((e, idx) => {
                    const isFirstOfGroup = idx === 0;
                    const isLastOfGroup  = idx === rows.length - 1;
                    return (
                      <tr key={e.id || `${catg}-${idx}`} style={{
                        borderBottom: isLastOfGroup ? `2px solid ${C.line}` : `1px solid ${C.gray100}`,
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.012)',
                      }}>
                        <td style={{ ...td(), verticalAlign: 'top', paddingTop: 14 }}>
                          {isFirstOfGroup && (
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 10px', borderRadius: RADIUS.sm,
                              background: catgColor + '15', color: catgColor,
                              border: `1px solid ${catgColor}40`,
                              fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                            }}>{catg}</span>
                          )}
                        </td>
                        <td style={{ ...td(), verticalAlign: 'top', paddingTop: 14, whiteSpace: 'normal' }}>
                          <div style={{ fontWeight: 700, color: C.ink, fontSize: 12.5 }}>{e.item}</div>
                          <div style={{ fontSize: 11, color: C.inkDim, marginTop: 3, lineHeight: 1.4 }}>{e.description}</div>
                        </td>
                        <td style={{ ...td(), verticalAlign: 'top', paddingTop: 12, whiteSpace: 'normal' }}>
                          <ChipList items={e.vars} color={C.inkSoft} bg={C.gray50} border={C.gray200} />
                        </td>
                        <td style={{ ...td(), verticalAlign: 'top', paddingTop: 12, whiteSpace: 'normal' }}>
                          <ChipList items={e.prices} color={C.orange} bg={'#fff8f3'} border={'#fcd7bd'} />
                        </td>
                        <td style={{ ...td(), verticalAlign: 'top', paddingTop: 12, whiteSpace: 'normal' }}>
                          <ChannelChips channels={e.channels} />
                        </td>
                        <td style={{ ...td(), verticalAlign: 'top', paddingTop: 14, color: C.inkSoft, fontWeight: 600 }}>
                          {e.module}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function ChipList({ items, color, bg, border }) {
  if (!items || items.length === 0) {
    return <span style={{ color: C.inkMute, fontSize: 11 }}>—</span>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {items.map((v, i) => (
        <span key={i} style={{
          padding: '3px 8px', borderRadius: RADIUS.sm,
          background: bg, color, border: `1px solid ${border}`,
          fontSize: 10.5, fontWeight: 600, lineHeight: 1.4,
        }}>{v}</span>
      ))}
    </div>
  );
}

function ChannelChips({ channels }) {
  if (!channels || channels.length === 0) {
    return <span style={{ color: C.inkMute, fontSize: 11 }}>—</span>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {channels.map(c => {
        const def = CHANNELS[c];
        if (!def) return null;
        return (
          <span key={c} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 8px', borderRadius: RADIUS.sm,
            background: def.color + '15', color: def.color,
            border: `1px solid ${def.color}40`,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.01em',
          }} title={`${def.label} (${def.kind})`}>
            {def.label}
          </span>
        );
      })}
    </div>
  );
}

function ChannelLegendGroup({ label, channels }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.gray400,
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {channels.map(c => {
          const def = CHANNELS[c];
          return (
            <span key={c} style={{
              padding: '3px 8px', borderRadius: RADIUS.sm,
              background: def.color + '15', color: def.color,
              border: `1px solid ${def.color}40`,
              fontSize: 10.5, fontWeight: 700,
            }}>{def.label}</span>
          );
        })}
      </div>
    </div>
  );
}

function th(extra = {}) {
  return {
    textAlign: 'left', padding: '10px 12px',
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: C.gray400, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
    whiteSpace: 'nowrap', verticalAlign: 'middle',
    ...extra,
  };
}
function td(extra = {}) {
  return {
    padding: '10px 12px', fontSize: 12,
    whiteSpace: 'nowrap',
    ...extra,
  };
}
