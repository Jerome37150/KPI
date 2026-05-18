import { useMemo, useState } from 'react';
import { Building2, Download } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// ImmobilisationPage — Recap CII : pivot phase × mois
// Vue multi-projets : sélecteurs projets + mois ↘ tableau + export.
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
    'Projet',
    'Personne',
    'Fenêtre',
    'Groupe',
    'Phase',
    'Jours',
    'Actions',
  ];
  const lines = [headers.map(csvEscape).join(';')];
  rows.forEach(r => {
    lines.push([
      r.week,
      r.start,
      r.end,
      r.projet || '',
      r.person,
      r.fenetre,
      r.groupe || '',
      r.phase,
      Number(r.jours.toFixed(3)).toString().replace('.', ','),
      r.actions || '',
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
  const allRows = data?.cii?.rows || [];

  // ── Inventaire des projets et mois disponibles dans les données ──
  const { allProjects, allMonths } = useMemo(() => {
    const projSet = new Set();
    const monthSet = new Set();
    allRows.forEach(r => {
      if (r.projet) projSet.add(r.projet);
      const ym = (r.start || '').slice(0, 7);
      if (ym) monthSet.add(ym);
    });
    return {
      allProjects: [...projSet].sort(),
      allMonths:   [...monthSet].sort(),
    };
  }, [allRows]);

  // Sélection : vide = "tous" (équivalent à filtre désactivé)
  const [selectedProjects, setSelectedProjects] = useState(() => new Set());
  const [selectedMonths,   setSelectedMonths]   = useState(() => new Set());

  const toggle = (setter) => (value) => setter(prev => {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value); else next.add(value);
    return next;
  });
  const toggleProject = toggle(setSelectedProjects);
  const toggleMonth   = toggle(setSelectedMonths);

  // Lignes filtrées par projet + mois sélectionnés
  const filteredRows = useMemo(() => {
    const noProjFilter  = selectedProjects.size === 0;
    const noMonthFilter = selectedMonths.size === 0;
    if (noProjFilter && noMonthFilter) return allRows;
    return allRows.filter(r => {
      if (!noProjFilter && !selectedProjects.has(r.projet || '')) return false;
      if (!noMonthFilter) {
        const ym = (r.start || '').slice(0, 7);
        if (!selectedMonths.has(ym)) return false;
      }
      return true;
    });
  }, [allRows, selectedProjects, selectedMonths]);

  // Pivot phase × mois sur les lignes filtrées
  const { months, matrix, totalsPerMonth, totalsPerPhase, grandTotal } = useMemo(() => {
    const monthSet = new Set();
    const m = new Map();
    filteredRows.forEach(r => {
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
  }, [filteredRows]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Projets · CII"
        icon={Building2}
        sub="Suivi temps par phase et par mois — données pour dossier CII"
      >Immobilisation</SectionTitle>

      {/* Filtres : projets + mois */}
      {allRows.length > 0 && (
        <Card padding={16}>
          <FilterRow
            label="Projets"
            options={allProjects}
            selected={selectedProjects}
            onToggle={toggleProject}
            onClear={() => setSelectedProjects(new Set())}
            emptyHint="Tous les projets"
          />
          <div style={{ height: 12 }} />
          <FilterRow
            label="Mois"
            options={allMonths}
            renderOption={monthLabel}
            selected={selectedMonths}
            onToggle={toggleMonth}
            onClear={() => setSelectedMonths(new Set())}
            emptyHint="Tous les mois"
          />
        </Card>
      )}

      {allRows.length === 0 ? (
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
              onClick={() => downloadCsv(filteredRows)}
              disabled={filteredRows.length === 0}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: RADIUS.md,
                background: filteredRows.length === 0 ? C.bgSoft : C.orange,
                color: filteredRows.length === 0 ? C.inkMute : '#fff',
                border: filteredRows.length === 0 ? `1px solid ${C.line}` : 'none',
                cursor: filteredRows.length === 0 ? 'not-allowed' : 'pointer',
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
          {months.length === 0 ? (
            <div style={{
              padding: 32, textAlign: 'center', color: C.inkDim, fontSize: 13,
            }}>
              Aucune donnée pour les filtres sélectionnés.
            </div>
          ) : (
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
          )}
        </Card>
      )}
    </div>
  );
}

// ── Ligne de filtres (pills cliquables) ──
function FilterRow({ label, options, renderOption, selected, onToggle, onClear, emptyHint }) {
  const isAllSelected = selected.size === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{
        fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: C.inkDim, fontWeight: 700, minWidth: 64,
      }}>{label}</span>
      <button
        type="button"
        onClick={onClear}
        style={{
          padding: '4px 10px', borderRadius: RADIUS.sm,
          background: isAllSelected ? C.orange : 'transparent',
          color: isAllSelected ? '#fff' : C.inkDim,
          border: `1px solid ${isAllSelected ? C.orange : C.line}`,
          cursor: 'pointer', fontSize: 11, fontWeight: 600,
          fontFamily: 'inherit', transition: 'background 0.12s, color 0.12s',
        }}
      >
        {emptyHint}
      </button>
      {options.map(opt => {
        const isOn = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            style={{
              padding: '4px 10px', borderRadius: RADIUS.sm,
              background: isOn ? C.orange : 'transparent',
              color: isOn ? '#fff' : C.inkSoft,
              border: `1px solid ${isOn ? C.orange : C.line}`,
              cursor: 'pointer', fontSize: 11, fontWeight: 600,
              fontFamily: 'inherit', transition: 'background 0.12s, color 0.12s',
            }}
          >
            {renderOption ? renderOption(opt) : opt}
          </button>
        );
      })}
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
