import { useMemo } from 'react';
import { Building2, Download } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// ImmobilisationPage — Recap CII : pivot phase × mois
// Données : public/cii-data.json (généré par `npm run export-cii`)
// ============================================
const PHASES_ORDER = ['Maquette / UX', 'Back', 'Front', 'Design', 'Test'];

const MOIS_FR = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août',  'sept.', 'oct.', 'nov.', 'déc.',
];

function monthLabel(yyyymm) {
  const [y, m] = yyyymm.split('-');
  return `${MOIS_FR[parseInt(m, 10) - 1]} ${y.slice(2)}`;
}

function fmtJoursFR(n) {
  if (!Number.isFinite(n) || n === 0) return null;
  return Number(n.toFixed(2)).toString().replace('.', ',');
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(rows) {
  const headers = [
    'Semaine ISO',
    'Date début (lundi)',
    'Date fin (dimanche)',
    'Personne',
    'Fenêtre',
    'Groupe',
    'Phase',
    'Jours',
  ];
  const lines = [headers.map(csvEscape).join(';')];
  rows.forEach(r => {
    lines.push([
      r.week,
      r.start,
      r.end,
      r.person,
      r.fenetre,
      r.groupe || '',
      r.phase,
      Number(r.jours.toFixed(3)).toString().replace('.', ','),
    ].map(csvEscape).join(';'));
  });
  const csv = '﻿' + lines.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `cii-immobilisation-${ts}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ImmobilisationPage({ data }) {
  const ciiRows = data?.cii?.rows || [];

  // Pivot phase × mois — chaque semaine est attribuée au mois du lundi (start)
  const { months, matrix, totalsPerMonth, totalsPerPhase, grandTotal } = useMemo(() => {
    const monthSet = new Set();
    const m = new Map(); // phase → mois → jours
    ciiRows.forEach(r => {
      const ym = (r.start || '').slice(0, 7);
      if (!ym) return;
      monthSet.add(ym);
      if (!m.has(r.phase)) m.set(r.phase, new Map());
      const mm = m.get(r.phase);
      mm.set(ym, (mm.get(ym) || 0) + r.jours);
    });
    const ms = [...monthSet].sort();
    const totalsM = ms.map(ym => {
      let t = 0;
      PHASES_ORDER.forEach(p => { t += m.get(p)?.get(ym) || 0; });
      return t;
    });
    const totalsP = PHASES_ORDER.map(p => {
      let t = 0;
      ms.forEach(ym => { t += m.get(p)?.get(ym) || 0; });
      return t;
    });
    const grand = totalsM.reduce((s, v) => s + v, 0);
    return {
      months: ms,
      matrix: m,
      totalsPerMonth: totalsM,
      totalsPerPhase: totalsP,
      grandTotal: grand,
    };
  }, [ciiRows]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Top Line"
        icon={Building2}
        sub="Suivi temps par phase et par mois — données pour dossier CII"
      >Immobilisation</SectionTitle>

      {ciiRows.length === 0 ? (
        <Card padding={32}>
          <div style={{ textAlign: 'center', color: C.inkDim, fontSize: 13 }}>
            Aucune donnée CII disponible.<br/>
            Lance <code style={{
              background: C.bgSoft, padding: '2px 6px', borderRadius: 4,
              color: C.ink, fontFamily: 'monospace',
            }}>npm run export-cii</code> pour générer <code style={{
              background: C.bgSoft, padding: '2px 6px', borderRadius: 4,
              color: C.ink, fontFamily: 'monospace',
            }}>public/cii-data.json</code>.
          </div>
        </Card>
      ) : (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          {/* En-tête */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${C.line}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={13} color={C.orange} strokeWidth={2.2} />
              <div style={{
                fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: C.orange, fontWeight: 700,
              }}>
                CII · {months.length} mois · {Number(grandTotal.toFixed(2))}j cumulés
              </div>
            </div>

            <button
              onClick={() => downloadCsv(ciiRows)}
              disabled={ciiRows.length === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: RADIUS.md,
                background: ciiRows.length === 0 ? C.bgSoft : C.orange,
                color: ciiRows.length === 0 ? C.inkMute : '#fff',
                border: ciiRows.length === 0 ? `1px solid ${C.line}` : 'none',
                cursor: ciiRows.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
                fontFamily: 'inherit', transition: 'background 0.15s',
              }}
              title="Exporter le détail (semaine × personne × fenêtre × phase) au format CSV"
            >
              <Download size={13} strokeWidth={2.4} />
              Exporter CSV
            </button>
          </div>

          {/* Tableau pivot — phase × mois */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.gray50 }}>
                  <th style={thBase({
                    position: 'sticky', left: 0, background: C.gray50, zIndex: 2, minWidth: 160,
                  })}>Phase</th>
                  {months.map((ym, i) => (
                    <th key={ym} style={thBase({
                      textAlign: 'right',
                      borderLeft: i === 0 ? `1px solid ${C.line}` : 'none',
                    })} title={ym}>{monthLabel(ym)}</th>
                  ))}
                  <th style={thBase({
                    textAlign: 'right',
                    borderLeft: `1px solid ${C.line}`,
                    color: C.orange,
                  })}>Total</th>
                </tr>
              </thead>
              <tbody>
                {PHASES_ORDER.map((phase, i) => {
                  const total = totalsPerPhase[i];
                  return (
                    <tr key={phase} style={{
                      borderBottom: i === PHASES_ORDER.length - 1 ? 'none' : `1px solid ${C.gray100}`,
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td style={{
                        padding: '10px 12px', color: C.ink, fontWeight: 600,
                        position: 'sticky', left: 0, background: 'inherit', zIndex: 1,
                      }}>{phase}</td>
                      {months.map((ym, idx) => {
                        const v = matrix.get(phase)?.get(ym) || 0;
                        const txt = fmtJoursFR(v);
                        return (
                          <td key={ym} style={{
                            ...tdNum(),
                            borderLeft: idx === 0 ? `1px solid ${C.gray100}` : 'none',
                            color: txt ? C.inkSoft : C.inkMute,
                          }}>
                            {txt || '—'}
                          </td>
                        );
                      })}
                      <td style={{
                        ...tdNum(),
                        borderLeft: `1px solid ${C.gray100}`,
                        color: total > 0 ? C.ink : C.inkMute,
                        fontWeight: 700,
                      }}>
                        {fmtJoursFR(total) || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: C.gray50, borderTop: `2px solid ${C.line}` }}>
                  <td style={{
                    padding: '10px 12px', fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase', color: C.ink,
                    position: 'sticky', left: 0, background: C.gray50, zIndex: 1,
                  }}>Total</td>
                  {totalsPerMonth.map((t, i) => (
                    <td key={months[i]} style={{
                      ...tdNum(),
                      borderLeft: i === 0 ? `1px solid ${C.line}` : 'none',
                      fontWeight: 700, color: t > 0 ? C.ink : C.inkMute,
                    }}>
                      {fmtJoursFR(t) || '—'}
                    </td>
                  ))}
                  <td style={{
                    ...tdNum(),
                    borderLeft: `1px solid ${C.line}`,
                    fontWeight: 800, color: C.orange,
                  }}>
                    {fmtJoursFR(grandTotal) || '—'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Style helpers (cellules) ──
function thBase(extra = {}) {
  return {
    textAlign: 'left', padding: '10px 12px',
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: C.gray400, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
    whiteSpace: 'nowrap', verticalAlign: 'middle',
    ...extra,
  };
}
function tdNum() {
  return {
    padding: '10px 12px', textAlign: 'right',
    fontVariantNumeric: 'tabular-nums', fontSize: 12,
    whiteSpace: 'nowrap',
  };
}
