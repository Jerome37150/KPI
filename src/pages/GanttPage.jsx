import { useState } from 'react';
import { Printer, Calendar, LayoutGrid, ZoomIn } from 'lucide-react';
import { C } from '../styles/theme';

// ============================================
// GanttPage — Stratégie 2 (A3 paysage 420×297 mm)
// Reproduction du Gantt "Stratégie 2" — roadmap NAX 7
// Planification projets · Ressources · Recrutement · Coût FY
// ============================================

const ZOOM_LEVELS = [0.6, 0.75, 1.0, 1.25, 1.5];
const MW = 8;        // largeur d'un mois en mm
const SIDEBAR = 30;  // largeur sidebar en mm
const NOW_MONTH = 2; // mai 2026 (mars=0)

// ── RELEASES (jalons sorties produits) ──
const RELEASES = [
  { month: 7,  label: 'Sortie Full SaaS' },                // oct. 2026
  { month: 19, label: 'Sortie Full Web — version simple' },// oct. 2027
  { month: 31, label: 'Sortie Full Web — version finale' },// oct. 2028
];

const YEARS = [
  { year: 2026, count: 10 }, { year: 2027, count: 12 },
  { year: 2028, count: 12 }, { year: 2029, count: 12 },
];
const MONTH_LBL = ['jan','fev','mars','avr','mai','juin','juil','aout','sept','oct','nov','déc'];

const MONTHS = [];
YEARS.forEach(y => {
  const start = y.year === 2026 ? 2 : 0;
  for (let i = 0; i < y.count; i++) {
    MONTHS.push({ year: y.year, monthIdx: start + i, label: MONTH_LBL[start + i], isYearStart: i === 0 });
  }
});
const TOTAL_MONTHS = MONTHS.length;

// ── PROJECTS ──────────────────────────────────
const PROJECTS = [
  {
    title: 'Naxi Full SaaS', sub: 'Maintien & migration', color: '#2275d6', secu: true, height: 22, rows: 1,
    bars: [
      { from: 0, len: 7, color: '#2275d6', row: 0, label: 'P1 — Clients comptoir & web', period: 'mars → sept. 2026', tags: ['4F','3B','1 PO'] },
      { from: 7, len: 4, color: '#dc2626', secu: true, row: 0, label: 'Sécurité — RGPD', tags: ['1F','1 PO'] },
      { from: 11, len: 5, color: '#dc2626', secu: true, row: 0, label: 'APIs & auth', tags: ['1F','1 PO'] },
      { from: 16, len: 5, color: '#dc2626', secu: true, row: 0, label: 'Consolidation RGPD', tags: ['1F','1 PO'] },
    ],
  },
  {
    title: 'NAX 7', sub: 'PMS hôtellerie de plein air', color: '#e8521a', height: 40, rows: 2,
    bars: [
      { from: 2, len: 5, color: '#0f766e', row: 0, label: 'R&D — Préparation', period: 'mai → sept. 2026' },
      { from: 7, len: 4, color: '#e8521a', row: 0, label: 'Prep. 1 — BDD & prix', period: 'oct. 26 → janv. 27', tags: ['2B'] },
      { from: 7, len: 8, color: '#e8521a', row: 1, label: 'Prep. 2 — Prototype RGPD', period: 'oct. 26 → mai 27', tags: ['1 PO','1B','1F'] },
      { from: 11, len: 4, color: '#e8521a', row: 0, label: 'Prep. 3 — Mapping BDD', period: 'fev → mai 27', tags: ['1F','2B','1 PO'] },
      { from: 15, len: 3, color: '#2275d6', row: 0, label: 'P2 — Residents / TO-CE', period: 'mai → aout 27', tags: ['4F','3B','2 PO'] },
      { from: 18, len: 3, color: '#2275d6', row: 0, label: 'P3 — Export compta', period: 'aout → nov. 27', tags: ['4F','3B','2 PO'] },
      { from: 21, len: 3, color: '#2275d6', row: 0, label: 'P4 — Integration CTV', period: 'nov. 27 → fev. 28', tags: ['4F','3B','2 PO'] },
      { from: 24, len: 3, color: '#2275d6', row: 0, label: 'P5 — API Store & divers', period: 'fev → juin 28', tags: ['4F','3B','2 PO'] },
      { from: 27, len: 3, color: '#e8521a', row: 1, label: 'Espace client & résident', period: 'juin → aout 28', tags: ['2F','2B','1 PO'] },
      { from: 27, len: 3, color: '#e8521a', row: 0, label: 'Beta test & corrections', period: 'juin → sept. 28', tags: ['1F','1B','1 PO'] },
      { from: 30, len: 6, color: '#d97706', row: 0, label: 'Adaptation ES', period: 'sept. 28 → fev. 29', tags: ['2F','1B','1 PO'] },
    ],
  },
  {
    title: 'NAX 7 Light', sub: 'Version 4G mobile & terrain', color: '#f59e0b', height: 22, rows: 1,
    bars: [{ from: 21, len: 6, color: '#f59e0b', row: 0, label: 'NAX 7 Light', period: 'déc. 27 → mai 28', tags: ['1F','1B','1 PO'] }],
  },
  {
    title: 'NAX 7 Manager', sub: 'Module gestion groupe', color: '#7c3aed', height: 22, rows: 1,
    bars: [{ from: 27, len: 4, color: '#7c3aed', row: 0, label: 'NAX 7 Manager', period: 'juin → sept. 28', tags: ['2F','1B','1 PO'] }],
  },
  {
    title: 'Inaxel Pilot', sub: 'Back-office intelligence', color: '#059669', height: 22, rows: 1,
    bars: [{ from: 31, len: 4, color: '#059669', row: 0, label: 'Inaxel Pilot', period: 'oct. 28 → janv. 29', tags: ['2F','1B','1 PO'] }],
  },
  {
    title: 'SAV Produits', sub: 'Support & maintenance', color: '#6b7280', height: 22, rows: 1,
    bars: [
      { from: 0, len: 7, color: '#6b7280', row: 0, label: 'SAV produits actifs', period: 'mars → sept. 26', tags: ['1F','2B','2 PO'] },
      { from: 7, len: 37, color: '#6b7280', row: 0, label: 'SAV produits actifs', period: 'oct. 26 → oct. 29', tags: ['1F','1B','1 PO'] },
    ],
  },
];

// ── RESOURCES (44 mois actifs : mars 26 → oct 29, puis vide) ──
const FRONT_VAL = [5,5,5,5,5,5,5,3,3,3,3,4,4,4,4,6,6,6,6,6,6,6,6,6,6,6,6,5,5,5,5,5,3,1,1,1,1,1,1,1,1,1,1,1];
const BACK_VAL  = [5,5,5,5,5,5,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,3,3,3,3,3,2,1,1,1,1,1,1,1,1];
const PO_VAL    = [3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,3,3,3,3,2,1,1,1,1,1,1,1,1];

// ── RECRUITMENT deltas ──
const RECRUITMENT = [];
for (let i = 0; i < 7; i++)   RECRUITMENT.push({ m: i, v: 2, bg: '#dcfce7', tx: '#166534' });
for (let i = 11; i < 15; i++) RECRUITMENT.push({ m: i, v: 1, bg: '#fff7ed', tx: '#ea580c' });
for (let i = 15; i < 30; i++) RECRUITMENT.push({ m: i, v: 3, bg: '#fff7ed', tx: '#ea580c' });
for (let i = 30; i < 35; i++) RECRUITMENT.push({ m: i, v: 2, bg: '#fff7ed', tx: '#ea580c' });

// ── FY costs ──
const FY_COSTS = [
  { from: 0,  len: 11, label: 'FY26', val: '0 k€',     bg: '#fee2e2', col: '#991b1b' },
  { from: 11, len: 12, label: 'FY27', val: '~40 k€',   bg: '#dbeafe', col: '#1e40af' },
  { from: 23, len: 12, label: 'FY28', val: '~210 k€',  bg: '#dcfce7', col: '#166534' },
  { from: 35, len: 11, label: 'FY29', val: '~95 k€',   bg: '#fef9c3', col: '#854d0e' },
];

// ── COMPONENT ─────────────────────────────────
export function GanttPage({ data }) {
  const [zoom, setZoom] = useState(1.0);

  return (
    <>
      <PrintStyle />

      <div className="gp-toolbar">
        <div className="gp-zoom">
          <ZoomIn size={13} color={C.inkSoft} strokeWidth={2.2} />
          <span className="gp-zoom__label">Zoom</span>
          {ZOOM_LEVELS.map(lvl => (
            <button key={lvl} onClick={() => setZoom(lvl)}
              className={`gp-zoom__btn ${zoom === lvl ? 'gp-zoom__btn--active' : ''}`}>
              {Math.round(lvl * 100)}%
            </button>
          ))}
        </div>
        <button onClick={() => window.print()} className="gp-print-btn">
          <Printer size={14} strokeWidth={2.4} /> Imprimer A3
        </button>
      </div>

      <div className="gp-viewport">
        <div className="gp-zoom-wrap" style={{ '--zoom': zoom }}>
          <div className="gp-sheet">

            {/* HEADER */}
            <header className="gp-header">
              <div className="gp-header__brand">
                <div className="gp-overline">
                  <LayoutGrid size={9} color={C.orange} strokeWidth={2.4} />
                  Stratégie produits Inaxel
                </div>
                <h1 className="gp-h1">Gantt</h1>
              </div>

              <div className="gp-header__logo">
                <NaxiLogo />
              </div>

              <div className="gp-header__stats">
                <Stat label="Durée"   value="31 mois" />
                <Stat label="Projets" value={PROJECTS.length} />
                <Stat label="Coût"    value="345 k€" />
              </div>
            </header>

            {/* GANTT */}
            <div className="gp-gantt">

              {/* Release row */}
              <div className="gp-row gp-relrow">
                <div className="gp-sidebar gp-sidebar--rel">Sorties</div>
                <div className="gp-bars" style={{ position: 'relative' }}>
                  {RELEASES.map((r, i) => (
                    <div key={i} className="gp-relpill"
                      style={{ left: `${r.month * MW + MW / 2}mm` }}>
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Year row */}
              <div className="gp-row gp-yearrow">
                <div className="gp-sidebar gp-sidebar--header">Projet</div>
                <div className="gp-bars" style={{ display: 'flex' }}>
                  {YEARS.map((y, i) => (
                    <div key={y.year} className={`gp-yearcell ${i % 2 ? 'gp-yearcell--alt' : ''}`}
                      style={{ width: `${y.count * MW}mm` }}>
                      {y.year}
                    </div>
                  ))}
                </div>
              </div>

              {/* Month row */}
              <div className="gp-row gp-monthrow">
                <div className="gp-sidebar gp-sidebar--month"></div>
                <div className="gp-bars" style={{ display: 'flex' }}>
                  {MONTHS.map((m, i) => (
                    <div key={i} className={`gp-monthcell ${m.isYearStart ? 'gp-monthcell--ys' : ''}`}>
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: planification */}
              <div className="gp-section gp-section--plan">Planification projets</div>
              {PROJECTS.map((p, i) => <ProjectRow key={i} project={p} />)}

              {/* Section: ressources */}
              <div className="gp-section gp-section--res">Ressources & recrutement</div>
              <ResourceRow label="Front-end" color="#2563eb" values={FRONT_VAL} />
              <ResourceRow label="Back-end"  color="#16a34a" values={BACK_VAL} />
              <ResourceRow label="PO / Test" color="#db2777" values={PO_VAL} />
              <RecruitmentRow />

              {/* Section: coût FY */}
              <div className="gp-section gp-section--cost">Coût recrutement</div>
              <FYCostRow />

              {/* NOW line global */}
              <div className="gp-nowline" style={{ left: `calc(${SIDEBAR}mm + ${NOW_MONTH * MW + MW / 2}mm)` }} />

              {/* Release vertical lines */}
              {RELEASES.map((r, i) => (
                <div key={i} className="gp-relline"
                  style={{ left: `calc(${SIDEBAR}mm + ${r.month * MW + MW / 2}mm)` }} />
              ))}
            </div>

            {/* FOOTER */}
            <footer className="gp-footer">
              <div>
                {data?.generatedAt ? new Date(data.generatedAt).toLocaleString('fr-FR') : '—'}
              </div>
              <div className="gp-legend">
                <Dot c="#2275d6" />Plan · <Dot c="#dc2626" />Sécu · <Dot c="#0f766e" />R&D ·
                <Dot c="#e8521a" />Prep · <Dot c="#f59e0b" />Light · <Dot c="#7c3aed" />Manager ·
                <Dot c="#059669" />Pilot · <Dot c="#d97706" />ES · <Dot c="#6b7280" />SAV
              </div>
            </footer>

          </div>
        </div>
      </div>
    </>
  );
}

// ── ROW COMPONENTS ────────────────────────────
function ProjectRow({ project: p }) {
  const totalH = p.height;
  const isMulti = p.rows > 1;
  const barH = isMulti ? (totalH / 2 - 3) : (totalH - 4);
  const rowOffset = isMulti ? (totalH / 2) : 0;

  return (
    <div className="gp-row gp-projrow" style={{ height: `${totalH}mm` }}>
      <div className="gp-sidebar" style={{ borderRight: `0.8mm solid ${p.color}` }}>
        <div className="gp-sidebar__title">{p.title}</div>
        <div className="gp-sidebar__sub">{p.sub}</div>
        {p.secu && <div className="gp-sidebar__secu">■ SECU</div>}
      </div>
      <div className="gp-bars">
        {/* Vertical month grid */}
        {MONTHS.map((m, i) => (
          <div key={i}
            className={`gp-vgrid ${i % 2 ? 'gp-vgrid--alt' : ''} ${m.isYearStart ? 'gp-vgrid--ys' : ''}`}
            style={{ left: `${i * MW}mm`, width: `${MW}mm` }} />
        ))}
        {/* Bars */}
        {p.bars.map((b, i) => (
          <div key={i} className={`gp-bar ${b.secu ? 'gp-bar--secu' : ''}`}
            style={{
              left: `${b.from * MW + 0.3}mm`,
              width: `${b.len * MW - 0.6}mm`,
              top: `${1.5 + (b.row || 0) * rowOffset}mm`,
              height: `${barH}mm`,
              background: b.color,
            }}>
            <div className="gp-bar__title">{b.label}</div>
            {b.period && <div className="gp-bar__period">{b.period}</div>}
            {b.tags && (
              <div className="gp-bar__tags">
                {b.tags.map((t, j) => <span key={j} className="gp-bar__tag">{t}</span>)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceRow({ label, color, values }) {
  return (
    <div className="gp-row gp-resrow">
      <div className="gp-sidebar gp-sidebar--res" style={{ borderRight: `0.7mm solid ${color}` }}>
        <span className="gp-rdot" style={{ background: color }}></span>
        <span className="gp-rlabel">{label}</span>
      </div>
      <div className="gp-bars" style={{ display: 'flex' }}>
        {Array.from({ length: TOTAL_MONTHS }).map((_, i) => {
          const v = values[i];
          return (
            <div key={i} className={`gp-rescell ${i % 2 ? 'gp-rescell--alt' : ''}`}>
              {v != null ? v : <span className="gp-resdot">·</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecruitmentRow() {
  const recMap = {};
  RECRUITMENT.forEach(r => { recMap[r.m] = r; });
  return (
    <div className="gp-row gp-recrow">
      <div className="gp-sidebar gp-sidebar--rec">
        <span className="gp-rdot" style={{ background: '#ef4444', borderRadius: '50%' }}></span>
        <span className="gp-rlabel" style={{ color: '#dc2626' }}>Recrutement</span>
      </div>
      <div className="gp-bars" style={{ display: 'flex' }}>
        {Array.from({ length: TOTAL_MONTHS }).map((_, i) => {
          const r = recMap[i];
          return (
            <div key={i} className="gp-reccell"
              style={{ background: r ? r.bg : '#fffbf0', color: r ? r.tx : 'transparent' }}>
              {r ? r.v : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FYCostRow() {
  return (
    <div className="gp-row gp-fyrow">
      <div className="gp-sidebar gp-sidebar--fy">
        <span className="gp-rlabel" style={{ color: '#6b7280' }}>Année fiscale</span>
      </div>
      <div className="gp-bars">
        {FY_COSTS.map((fy, i) => (
          <div key={i} className="gp-fybar" style={{
            left: `${fy.from * MW + 0.3}mm`,
            width: `${fy.len * MW - 0.6}mm`,
            background: fy.bg, borderColor: fy.col,
          }}>
            <span style={{ color: fy.col, fontSize: '5.5pt', fontWeight: 700 }}>{fy.label}</span>
            <span style={{ color: fy.col, fontSize: '7pt', fontWeight: 800 }}>{fy.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HELPERS ───────────────────────────────────
function Stat({ label, value, accent }) {
  return (
    <div className="gp-stat">
      <div className="gp-stat__label">{label}</div>
      <div className="gp-stat__value" style={{ color: accent || C.ink }}>{value}</div>
    </div>
  );
}

// Logo Inaxel — "inaxel" + soleil + "Naxi PMS Platform"
function NaxiLogo() {
  return (
    <svg
      viewBox="0 0 280 90"
      width="220" height="70"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Inaxel — Naxi PMS Platform"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      <text x="2" y="55"
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="800" fontSize="48" fill={C.gray900} letterSpacing="-1">
        inaxel
      </text>
      <g stroke={C.orange} strokeWidth="3.6" strokeLinecap="round">
        <line x1="215" y1="38" x2="222" y2="-2"/>
        <line x1="215" y1="38" x2="232" y2="2"/>
        <line x1="215" y1="38" x2="241" y2="7"/>
        <line x1="215" y1="38" x2="248" y2="15"/>
        <line x1="215" y1="38" x2="253" y2="24"/>
        <line x1="215" y1="38" x2="255" y2="35"/>
        <line x1="215" y1="38" x2="254" y2="45"/>
        <line x1="215" y1="38" x2="251" y2="55"/>
        <line x1="215" y1="38" x2="246" y2="64"/>
      </g>
      <text x="2" y="80"
        fontFamily="Inter, -apple-system, sans-serif"
        fontWeight="700" fontSize="18" fill={C.orange}>
        Naxi PMS Platform
      </text>
    </svg>
  );
}

function Dot({ c }) {
  return <span style={{
    display: 'inline-block', width: '1.6mm', height: '1.6mm', borderRadius: '50%',
    background: c, marginRight: '0.6mm', marginLeft: '1mm', verticalAlign: 'middle',
  }} />;
}

// ── STYLES ────────────────────────────────────
function PrintStyle() {
  return (
    <style>{`
      @page { size: 420mm 297mm; margin: 0; }
      @media print {
        body * { visibility: hidden; }
        .gp-sheet, .gp-sheet * { visibility: visible; }
        .gp-viewport { overflow: visible !important; max-height: none !important; padding: 0 !important; border: none !important; background: transparent !important; }
        .gp-zoom-wrap { zoom: 1 !important; transform: none !important; }
        .gp-sheet { position: absolute; left: 0; top: 0; box-shadow: none !important; margin: 0 !important; }
        .gp-toolbar, .gp-print-btn { display: none !important; }
      }

      /* Toolbar */
      .gp-toolbar {
        position: sticky; top: 0; z-index: 50;
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 16px;
        background: ${C.paper};
        border-bottom: 1px solid ${C.line};
        margin: -24px -24px 16px;
      }
      .gp-zoom {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px 10px; border-radius: 8px;
        background: ${C.bgSoft}; border: 1px solid ${C.line};
      }
      .gp-zoom__label {
        font-size: 10px; font-weight: 700; color: ${C.gray400};
        letter-spacing: 0.07em; text-transform: uppercase;
      }
      .gp-zoom__btn {
        padding: 4px 9px; border-radius: 6px;
        background: transparent; color: ${C.inkSoft};
        border: none; cursor: pointer;
        font-size: 11px; font-weight: 700;
        font-family: inherit; font-variant-numeric: tabular-nums;
      }
      .gp-zoom__btn:hover { background: ${C.gray100}; color: ${C.ink}; }
      .gp-zoom__btn--active { background: ${C.orange}; color: #fff; }
      .gp-print-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 14px; border-radius: 8px;
        background: ${C.orange}; color: #fff; border: none; cursor: pointer;
        font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
        font-family: inherit; text-transform: uppercase;
        box-shadow: 0 4px 14px rgba(229,80,16,0.30);
      }
      .gp-print-btn:hover { background: ${C.orangeHover}; }

      /* Viewport */
      .gp-viewport {
        width: 100%; overflow: auto;
        background: ${C.bg};
        border: 1px solid ${C.line};
        border-radius: 12px;
        padding: 20px;
        max-height: calc(100vh - 200px);
      }
      .gp-zoom-wrap { zoom: var(--zoom, 1.0); display: inline-block; }

      /* Sheet A3 paysage */
      .gp-sheet {
        width: 420mm; height: 297mm;
        background: ${C.paper};
        padding: 6mm 8mm;
        font-family: var(--font-base);
        color: ${C.ink};
        box-shadow: 0 6px 28px rgba(0,0,0,0.10);
        display: flex; flex-direction: column; gap: 3mm;
        box-sizing: border-box;
        overflow: hidden;
        position: relative;
      }

      /* Header (style BluePrint — fond clair) */
      .gp-header {
        display: grid;
        grid-template-columns: 1.2fr auto 1.2fr;
        align-items: center;
        gap: 8mm;
        padding: 4mm 6mm;
        background: ${C.paper};
        border: 1px solid ${C.line};
        border-radius: 3mm;
        flex-shrink: 0;
      }
      .gp-header__brand { display: flex; flex-direction: column; gap: 0.5mm; }
      .gp-header__logo  { display: flex; justify-content: center; }
      .gp-header__stats { display: flex; justify-content: flex-end; gap: 6mm; }
      .gp-overline {
        display: inline-flex; align-items: center; gap: 1.2mm;
        font-size: 7pt; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: ${C.orange};
      }
      .gp-h1 {
        font-size: 22pt; font-weight: 800; letter-spacing: -0.025em;
        line-height: 1; margin: 0; color: ${C.ink};
      }
      .gp-stat { text-align: right; min-width: 14mm; }
      .gp-stat__label {
        font-size: 6pt; font-weight: 700;
        letter-spacing: 0.07em; text-transform: uppercase;
        color: ${C.gray400}; margin-bottom: 0.5mm;
      }
      .gp-stat__value {
        font-size: 14pt; font-weight: 800;
        letter-spacing: -0.02em; line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      /* Gantt container */
      .gp-gantt {
        flex: 1; position: relative; overflow: hidden;
        background: ${C.paper};
        border: 0.3mm solid ${C.line};
        border-radius: 1.5mm;
      }

      /* Generic row */
      .gp-row {
        display: flex; align-items: stretch;
        border-bottom: 0.2mm solid ${C.gray100};
        position: relative;
      }
      .gp-sidebar {
        width: ${SIDEBAR}mm; flex-shrink: 0;
        padding: 1mm 2mm;
        background: ${C.paper};
        position: relative; z-index: 5;
        display: flex; flex-direction: column; justify-content: center;
        box-shadow: 0.5mm 0 1.5mm rgba(0,0,0,0.06);
      }
      .gp-sidebar--header {
        background: #111827;
        color: rgba(255,255,255,0.4);
        font-size: 6pt; font-weight: 700; letter-spacing: 0.08em;
        text-transform: uppercase;
        justify-content: flex-end;
        padding-bottom: 1.5mm;
      }
      .gp-bars { flex: 1; position: relative; }

      /* Year row */
      .gp-yearrow { height: 7mm; }
      .gp-yearcell {
        height: 7mm; background: #1a1e28; color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-size: 11pt; font-weight: 800;
        border-left: 0.1mm solid rgba(255,255,255,0.06);
      }
      .gp-yearcell--alt { background: #243040; }

      /* Month row */
      .gp-monthrow { height: 5mm; background: #1a1e28; }
      .gp-sidebar--month { background: #111827; }
      .gp-monthcell {
        width: ${MW}mm; height: 5mm;
        background: #1e2a3a; color: #94a3b8;
        display: flex; align-items: center; justify-content: center;
        font-size: 6pt; font-weight: 400;
        border-left: 0.1mm solid #243040;
      }
      .gp-monthcell--ys {
        border-left: 0.4mm solid #4a6080;
        color: #fff; font-weight: 700;
      }

      /* Section titles */
      .gp-section {
        height: 5mm; padding: 0 2.5mm;
        display: flex; align-items: center;
        font-size: 7pt; font-weight: 800;
        letter-spacing: 0.08em; text-transform: uppercase;
        border-top: 0.8mm solid;
      }
      .gp-section--plan { color: #1e40af; border-top-color: #2275d6; background: #eff6ff; }
      .gp-section--res  { color: #065f46; border-top-color: #059669; background: #f0fdf4; }
      .gp-section--cost { color: #9a3412; border-top-color: #f97316; background: #fff7ed; }

      /* Project rows */
      .gp-projrow { background: #f4f6f9; }
      .gp-sidebar__title { font-size: 9pt; font-weight: 700; color: #1a1e28; line-height: 1.1; }
      .gp-sidebar__sub { font-size: 6.5pt; color: #9ca3af; margin-top: 0.6mm; line-height: 1.1; }
      .gp-sidebar__secu { font-size: 6pt; color: #dc2626; font-weight: 700; margin-top: 0.8mm; }

      /* Vertical grid */
      .gp-vgrid {
        position: absolute; top: 0; bottom: 0;
        background: #f9fafb;
        border-left: 0.1mm solid #dde3ea;
      }
      .gp-vgrid--alt { background: #f1f5f9; }
      .gp-vgrid--ys { border-left: 0.3mm solid #b0bec5; }

      /* Bars */
      .gp-bar {
        position: absolute;
        border-radius: 1mm;
        z-index: 2;
        overflow: hidden;
        padding: 0.5mm 1.2mm;
        display: flex; flex-direction: column; gap: 0.2mm;
        color: #fff;
        box-shadow: 0 0.3mm 0.6mm rgba(0,0,0,0.1);
      }
      .gp-bar--secu {
        background-image: repeating-linear-gradient(
          45deg, transparent, transparent 0.7mm,
          rgba(255,255,255,0.12) 0.7mm, rgba(255,255,255,0.12) 1.4mm);
        opacity: 0.92;
      }
      .gp-bar__title {
        font-size: 7pt; font-weight: 700;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        line-height: 1.1;
      }
      .gp-bar__period { font-size: 6pt; opacity: 0.85; line-height: 1; }
      .gp-bar__tags {
        display: flex; gap: 0.6mm; flex-wrap: nowrap; overflow: hidden;
        margin-top: 0.4mm;
      }
      .gp-bar__tag {
        font-size: 5pt; font-weight: 700;
        background: rgba(255,255,255,0.28);
        border-radius: 0.5mm;
        padding: 0.3mm 1mm;
        white-space: nowrap;
      }

      /* Resource cells */
      .gp-resrow { height: 8mm; }
      .gp-sidebar--res {
        flex-direction: row; align-items: center; gap: 1.5mm;
        padding: 0 2mm;
      }
      .gp-rdot {
        display: inline-block;
        width: 2mm; height: 2mm;
        border-radius: 0.5mm;
        flex-shrink: 0;
      }
      .gp-rlabel {
        font-size: 7.5pt; font-weight: 700; color: #1a1e28;
      }
      .gp-rescell {
        width: ${MW}mm; height: 8mm;
        background: #f9fafb;
        display: flex; align-items: center; justify-content: center;
        font-size: 8pt; font-weight: 700; color: #1a1e28;
        font-variant-numeric: tabular-nums;
      }
      .gp-rescell--alt { background: #f1f5f9; }
      .gp-resdot { color: #d1d5db; font-weight: 400; }

      /* Recruitment row */
      .gp-recrow { height: 9mm; border-top: 0.4mm dashed #fca5a5; }
      .gp-sidebar--rec {
        flex-direction: row; align-items: center; gap: 1.5mm;
        padding: 0 2mm;
        background: #fff7ed;
        border-right: 0.8mm solid #ef4444;
      }
      .gp-reccell {
        width: ${MW}mm; height: 9mm;
        display: flex; align-items: center; justify-content: center;
        font-size: 8pt; font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      /* FY cost row */
      .gp-fyrow { height: 14mm; background: #fff7ed; }
      .gp-sidebar--fy {
        flex-direction: row; align-items: center;
        padding: 0 2mm;
        border-right: 0.6mm solid #6b7280;
      }
      .gp-fybar {
        position: absolute; top: 2mm; height: 10mm;
        border: 0.4mm solid; border-radius: 1.2mm;
        display: flex; align-items: center; justify-content: space-between;
        padding: 0 2.5mm; z-index: 2;
      }
      .gp-fybar > span:first-child { font-size: 8pt !important; }
      .gp-fybar > span:last-child  { font-size: 11pt !important; }

      /* NOW line */
      .gp-nowline {
        position: absolute; top: 0; bottom: 0;
        width: 0.4mm; background: #ef4444;
        opacity: 0.7; z-index: 4;
        pointer-events: none;
      }

      /* Release row (sorties) */
      .gp-relrow {
        height: 8mm;
        background: ${C.orangeFaint || '#fff7ed'};
        border-bottom: 0.4mm solid ${C.orange};
      }
      .gp-sidebar--rel {
        background: ${C.orangeFaint || '#fff7ed'};
        color: ${C.orange};
        font-size: 6.5pt; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        justify-content: center;
        border-right: 0.6mm solid ${C.orange};
      }
      .gp-relpill {
        position: absolute;
        top: 50%; transform: translate(-50%, -50%);
        background: ${C.orange}; color: #fff;
        font-size: 6.5pt; font-weight: 700;
        padding: 1mm 2.5mm;
        border-radius: 1mm;
        white-space: nowrap;
        letter-spacing: 0.02em;
        box-shadow: 0 0.4mm 1.2mm rgba(229,80,16,0.35);
        z-index: 3;
      }
      .gp-relline {
        position: absolute;
        top: 8mm; bottom: 0;
        width: 0.6mm;
        background: ${C.orange};
        opacity: 0.85;
        z-index: 4; pointer-events: none;
        box-shadow: 0 0 0 0.2mm rgba(229,80,16,0.15);
      }

      /* Footer */
      .gp-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1mm 2mm;
        font-size: 5.5pt; color: ${C.inkDim};
        flex-shrink: 0;
      }
      .gp-legend {
        display: flex; align-items: center; gap: 0.5mm;
        font-size: 5pt; color: ${C.inkDim};
        flex-wrap: wrap;
      }
    `}</style>
  );
}
