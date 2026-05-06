import { useMemo, useState } from 'react';
import {
  Printer, LayoutGrid, AlertTriangle, Smartphone, Monitor,
  Package, FileText, ZoomIn,
} from 'lucide-react';
import { C, RADIUS } from '../styles/theme';

// ============================================
// BluePrintPage — vue stratégique A3 paysage (420×297 mm)
// Constellation PMS · modules sans détail des fenêtres · solutions colorées
// Données live via data.cartoPmsWeb / cartoPmsMobile / cartoManager
// ============================================

const GROUP_COLORS = ['#e55010', '#16a34a', '#7c4a1f', '#1890ff', '#d97706', '#71717a', '#885cf6'];
const PHASE_COLORS = { P1: C.red, P2: C.orange, P3: C.amber, P4: C.blue };
const PHASES = ['P1', 'P2', 'P3', 'P4'];

const SOL_COLORS = {
  'Inaxel (PMS)':       { bg: C.orangeBg, fg: C.orange, dot: C.orange,  label: 'Inaxel' },
  'C tout Vert (CRS)':  { bg: '#16a34a1A', fg: '#16a34a', dot: '#16a34a', label: 'CTV' },
};

const ZOOM_LEVELS = [0.6, 0.75, 1.0, 1.25, 1.5];

// ── Agrège fenêtres → groupes → modules ─────────────────────
function aggregate(items) {
  const groupMap = new Map();
  (items || []).forEach(t => {
    const gKey = t.numGroupe || '?';
    if (!groupMap.has(gKey)) {
      groupMap.set(gKey, {
        numGroupe: gKey,
        groupe: t.groupe || '',
        modules: new Map(),
        fenetres: 0,
        byPhase: { P1: 0, P2: 0, P3: 0, P4: 0, '—': 0 },
      });
    }
    const g = groupMap.get(gKey);
    g.fenetres++;
    const phaseKey = t.phase && PHASES.includes(t.phase) ? t.phase : '—';
    g.byPhase[phaseKey]++;

    const mKey = t.numModule || '?';
    if (!g.modules.has(mKey)) {
      g.modules.set(mKey, {
        numModule: mKey,
        module: t.module || '',
        fenetres: 0,
        byPhase: { P1: 0, P2: 0, P3: 0, P4: 0, '—': 0 },
        solutions: new Set(),
      });
    }
    const m = g.modules.get(mKey);
    m.fenetres++;
    m.byPhase[phaseKey]++;
    (t.solution || []).forEach(s => m.solutions.add(s));
  });

  return [...groupMap.values()]
    .map(g => ({
      ...g,
      modules: [...g.modules.values()]
        .map(m => ({ ...m, solutions: [...m.solutions] }))
        .sort((a, b) => (a.numModule || '').localeCompare(b.numModule || '')),
    }))
    .sort((a, b) => (a.numGroupe || '').localeCompare(b.numGroupe || ''));
}

export function BluePrintPage({ data }) {
  const cartoPmsWeb    = data?.cartoPmsWeb    || [];
  const cartoPmsMobile = data?.cartoPmsMobile || [];
  const cartoManager   = data?.cartoManager   || [];

  const pmsGroups     = useMemo(() => aggregate(cartoPmsWeb),    [cartoPmsWeb]);
  const mobileGroups  = useMemo(() => aggregate(cartoPmsMobile), [cartoPmsMobile]);
  const managerGroups = useMemo(() => aggregate(cartoManager),   [cartoManager]);

  const [zoom, setZoom] = useState(1.0);

  const isEmpty = pmsGroups.length === 0;
  const totalModules  = pmsGroups.reduce((s, g) => s + g.modules.length, 0);
  const totalFenetres = cartoPmsWeb.length;

  return (
    <>
      <PrintStyle />

      {/* Toolbar */}
      <div className="bp-toolbar">
        <div className="bp-zoom">
          <ZoomIn size={13} color={C.inkSoft} strokeWidth={2.2} />
          <span className="bp-zoom__label">Zoom</span>
          {ZOOM_LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => setZoom(lvl)}
              className={`bp-zoom__btn ${zoom === lvl ? 'bp-zoom__btn--active' : ''}`}
            >{Math.round(lvl * 100)}%</button>
          ))}
        </div>
        <button onClick={() => window.print()} className="bp-print-btn">
          <Printer size={14} strokeWidth={2.4} />
          Imprimer A3
        </button>
      </div>

      {isEmpty && (
        <div className="bp-print-btn" style={{
          maxWidth: 1100, margin: '0 auto 16px', padding: '12px 16px',
          background: C.amberSoft, color: C.amber, borderRadius: RADIUS.md,
          border: `1px solid ${C.amber}`, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <AlertTriangle size={16} strokeWidth={2.2} />
          <span>Cartographies vides — déclenche un sync GitHub Actions.</span>
        </div>
      )}

      {/* Viewport scrollable */}
      <div className="bp-viewport">
        <div className="bp-zoom-wrap" style={{ '--zoom': zoom }}>
          <div className="bp-sheet">

            {/* HEADER */}
            <header className="bp-header">
              <div className="bp-header__brand">
                <div className="bp-overline">
                  <LayoutGrid size={9} color={C.orange} strokeWidth={2.4} />
                  Stratégie produits Inaxel
                </div>
                <h1 className="bp-h1">Blue Print</h1>
              </div>

              <div className="bp-header__logo">
                <BluePrintLogo />
              </div>

              <div className="bp-header__stats">
                <Stat label="Groupes" value={pmsGroups.length} />
                <Stat label="Modules" value={totalModules} />
                <Stat label="Fenêtres" value={totalFenetres} />
              </div>
            </header>

            {/* CONSTELLATION PMS */}
            <PmsConstellation groups={pmsGroups} />

            {/* BANDEAUX MOBILE + MANAGER */}
            <div className="bp-sides">
              <SideBlock
                icon={Smartphone}
                title="Version Mobile"
                groups={mobileGroups}
                fenetres={cartoPmsMobile.length}
                color="#1890ff"
              />
              <SideBlock
                icon={Monitor}
                title="Module Manager"
                groups={managerGroups}
                fenetres={cartoManager.length}
                color="#885cf6"
              />
            </div>

            {/* FOOTER */}
            <footer className="bp-footer">
              <div>
                {data?.generatedAt
                  ? new Date(data.generatedAt).toLocaleString('fr-FR')
                  : '—'}
              </div>
            </footer>

          </div>
        </div>
      </div>
    </>
  );
}

// ── Constellation PMS : 7 groupes autour du hub central ─────
function PmsConstellation({ groups }) {
  const left   = [groups[0], groups[2], groups[4]].filter(Boolean);
  const right  = [groups[1], groups[3], groups[5]].filter(Boolean);
  const center = groups[6];
  const colorOf = (g) => GROUP_COLORS[groups.findIndex(x => x.numGroupe === g.numGroupe) % GROUP_COLORS.length];

  return (
    <div className="bp-constellation">
      {/* Lignes SVG hub → cards */}
      <svg className="bp-arrows" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {[
          { x: 17, y: 14 }, { x: 17, y: 50 }, { x: 17, y: 86 },
          { x: 83, y: 14 }, { x: 83, y: 50 }, { x: 83, y: 86 },
          { x: 50, y: 75 },
        ].map((p, i) => (
          <line key={i} x1="50" y1="22" x2={p.x} y2={p.y}
            stroke={C.gray300} strokeWidth="0.18" strokeDasharray="0.6,0.4" />
        ))}
      </svg>

      <div className="bp-col">
        {left.map(g => <GroupCard key={g.numGroupe} group={g} color={colorOf(g)} />)}
      </div>

      <div className="bp-col bp-col--center">
        <div className="bp-hub">
          <div className="bp-hub__brand">PMS</div>
        </div>
        {center && <GroupCard group={center} color={colorOf(center)} />}
      </div>

      <div className="bp-col">
        {right.map(g => <GroupCard key={g.numGroupe} group={g} color={colorOf(g)} />)}
      </div>
    </div>
  );
}

// ── Card de groupe (modules sans détail des fenêtres) ───────
function GroupCard({ group, color }) {
  return (
    <div className="bp-group" style={{ '--gc': color }}>
      <div className="bp-group__head">
        <span className="bp-group__id" style={{ color }}>{group.numGroupe}</span>
        <span className="bp-group__name">{group.groupe || '—'}</span>
      </div>

      <div className="bp-group__meta">
        <span><strong>{group.modules.length}</strong> mod</span>
        <span><strong>{group.fenetres}</strong> fen</span>
      </div>

      <ul className="bp-modlist">
        {group.modules.map(m => {
          const isCtv = m.solutions.includes('C tout Vert (CRS)');
          const ctvCfg = SOL_COLORS['C tout Vert (CRS)'];
          return (
            <li key={m.numModule} className="bp-modline">
              <span className="bp-modline__id" style={{ color }}>{m.numModule}</span>
              <span className="bp-modline__name" title={m.module}>{m.module || '—'}</span>
              <span className="bp-modline__count">{m.fenetres}</span>
              {isCtv ? (
                <span className="bp-modline__sol" style={{
                  background: ctvCfg.bg, color: ctvCfg.fg,
                }}>{ctvCfg.label}</span>
              ) : (
                <span className="bp-modline__sol" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Bandeau latéral compact (Mobile / Manager) ──────────────
function SideBlock({ icon: Icon, title, groups, fenetres, color }) {
  return (
    <div className="bp-sideblock" style={{ '--gc': color }}>
      <div className="bp-sideblock__head">
        {Icon && <Icon size={11} color={color} strokeWidth={2.4} />}
        <span className="bp-sideblock__title">{title}</span>
        <span className="bp-sideblock__count">{groups.length} grp · {fenetres} fen</span>
      </div>
      <div className="bp-sideblock__groups">
        {groups.length === 0 && <span className="bp-sideblock__empty">— vide —</span>}
        {groups.map(g => (
          <div key={g.numGroupe} className="bp-sidegrp">
            <span className="bp-sidegrp__id">{g.numGroupe}</span>
            <span className="bp-sidegrp__name">{g.groupe}</span>
            <span className="bp-sidegrp__count">{g.fenetres}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Logo Blue Print : "inaxel" + soleil + "Naxi PMS Platform" ─
function BluePrintLogo() {
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
      {/* Soleil 9 rayons à droite, centre (215, 38), rayon 42 */}
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

function Stat({ label, value, accent }) {
  return (
    <div className="bp-stat">
      <div className="bp-stat__label">{label}</div>
      <div className="bp-stat__value" style={{ color: accent || C.ink }}>{value}</div>
    </div>
  );
}

// ── Print + layout styles ────────────────────────────────────
function PrintStyle() {
  return (
    <style>{`
      @page { size: 420mm 297mm; margin: 0; }
      @media print {
        body * { visibility: hidden; }
        .bp-sheet, .bp-sheet * { visibility: visible; }
        .bp-viewport { overflow: visible !important; max-height: none !important; padding: 0 !important; border: none !important; background: transparent !important; }
        .bp-zoom-wrap { zoom: 1 !important; transform: none !important; }
        .bp-sheet { position: absolute; left: 0; top: 0; box-shadow: none !important; margin: 0 !important; }
        .bp-toolbar, .bp-print-btn { display: none !important; }
      }

      /* Toolbar */
      .bp-toolbar {
        position: sticky; top: 0; z-index: 50;
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 16px;
        background: ${C.paper};
        border-bottom: 1px solid ${C.line};
        margin: -24px -24px 16px;
      }
      .bp-zoom {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 4px 10px; border-radius: 8px;
        background: ${C.bgSoft}; border: 1px solid ${C.line};
      }
      .bp-zoom__label {
        font-size: 10px; font-weight: 700; color: ${C.gray400};
        letter-spacing: 0.07em; text-transform: uppercase;
      }
      .bp-zoom__btn {
        padding: 4px 9px; border-radius: 6px;
        background: transparent; color: ${C.inkSoft};
        border: none; cursor: pointer;
        font-size: 11px; font-weight: 700; letter-spacing: 0.02em;
        font-family: inherit; font-variant-numeric: tabular-nums;
        transition: background 0.12s;
      }
      .bp-zoom__btn:hover { background: ${C.gray100}; color: ${C.ink}; }
      .bp-zoom__btn--active { background: ${C.orange}; color: #fff; }

      .bp-print-btn {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 14px; border-radius: 8px;
        background: ${C.orange}; color: #fff; border: none; cursor: pointer;
        font-size: 12px; font-weight: 700; letter-spacing: 0.04em;
        font-family: inherit; text-transform: uppercase;
        box-shadow: 0 4px 14px rgba(229,80,16,0.30);
      }
      .bp-print-btn:hover { background: ${C.orangeHover}; }

      /* Viewport */
      .bp-viewport {
        width: 100%;
        overflow: auto;
        background: ${C.bg};
        border: 1px solid ${C.line};
        border-radius: 12px;
        padding: 20px;
        max-height: calc(100vh - 200px);
      }
      .bp-zoom-wrap {
        zoom: var(--zoom, 1.0);
        display: inline-block;
      }

      /* ===== FEUILLE A3 ===== */
      .bp-sheet {
        width: 420mm; height: 297mm;
        background: linear-gradient(180deg, ${C.paper} 0%, ${C.bgSoft} 100%);
        padding: 9mm 11mm 8mm;
        font-family: var(--font-base);
        color: ${C.ink};
        box-shadow: 0 6px 28px rgba(0,0,0,0.10);
        display: grid;
        grid-template-rows: auto 1fr auto auto;
        gap: 5mm;
        box-sizing: border-box;
        overflow: hidden;
      }

      /* HEADER */
      .bp-header {
        display: grid;
        grid-template-columns: 1.2fr auto 1.2fr;
        align-items: center;
        gap: 8mm;
        padding: 4mm 6mm;
        background: ${C.paper};
        border: 1px solid ${C.line};
        border-radius: 3mm;
      }
      .bp-header__brand { display: flex; flex-direction: column; gap: 0.5mm; }
      .bp-header__logo { display: flex; justify-content: center; }
      .bp-header__stats {
        display: flex; justify-content: flex-end; gap: 6mm;
      }
      .bp-overline {
        display: inline-flex; align-items: center; gap: 1.2mm;
        font-size: 7pt; font-weight: 700;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: ${C.orange};
      }
      .bp-h1 {
        font-size: 22pt; font-weight: 800; letter-spacing: -0.025em;
        line-height: 1; margin: 0; color: ${C.ink};
      }
      .bp-sub {
        font-size: 7.5pt; color: ${C.inkDim};
      }
      .bp-stat { text-align: right; min-width: 14mm; }
      .bp-stat__label {
        font-size: 6pt; font-weight: 700;
        letter-spacing: 0.07em; text-transform: uppercase;
        color: ${C.gray400}; margin-bottom: 0.5mm;
      }
      .bp-stat__value {
        font-size: 14pt; font-weight: 800;
        letter-spacing: -0.02em; line-height: 1;
        font-variant-numeric: tabular-nums;
      }

      /* CONSTELLATION */
      .bp-constellation {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 5mm;
        align-items: start;
      }
      .bp-col { display: flex; flex-direction: column; gap: 4mm; }
      .bp-col--center { gap: 4mm; }
      .bp-arrows {
        position: absolute; inset: 0;
        width: 100%; height: 100%;
        pointer-events: none; z-index: 0;
      }

      /* HUB */
      .bp-hub {
        background: linear-gradient(135deg, #fff 0%, ${C.orangeFaint} 100%);
        border: 1.5px solid ${C.orange};
        border-radius: 4mm;
        padding: 5mm 4mm;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center; gap: 1mm;
        text-align: center;
        box-shadow: 0 3mm 8mm rgba(229, 80, 16, 0.14);
        position: relative; z-index: 2;
      }
      .bp-hub__brand {
        font-size: 22pt; font-weight: 900;
        letter-spacing: -0.02em; color: ${C.orange};
        line-height: 1;
      }
      .bp-hub__sub {
        font-size: 6pt; font-weight: 600;
        letter-spacing: 0.08em; text-transform: uppercase;
        color: ${C.inkSoft};
      }

      /* GROUP CARD */
      .bp-group {
        background: ${C.paper};
        border: 1px solid ${C.line};
        border-top: 2.5mm solid var(--gc);
        border-radius: 2.5mm;
        padding: 3mm 3.5mm;
        box-shadow: 0 0.5mm 1.5mm rgba(0,0,0,0.05);
        display: flex; flex-direction: column; gap: 2mm;
        position: relative; z-index: 2;
      }
      .bp-group__head {
        display: flex; align-items: baseline; gap: 2mm;
      }
      .bp-group__id {
        font-size: 8pt; font-weight: 800;
        letter-spacing: 0.06em;
        font-variant-numeric: tabular-nums;
      }
      .bp-group__name {
        font-size: 9.5pt; font-weight: 700;
        color: ${C.ink}; letter-spacing: -0.01em;
        line-height: 1.05; flex: 1;
      }
      .bp-group__meta {
        display: flex; gap: 3mm; flex-wrap: wrap;
        font-size: 6.5pt; color: ${C.inkDim};
      }
      .bp-group__meta strong {
        color: ${C.ink}; font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      .bp-modlist {
        list-style: none; margin: 0; padding: 0;
        display: flex; flex-direction: column; gap: 0.6mm;
        margin-top: 0.5mm;
        border-top: 1px solid ${C.gray100};
        padding-top: 1.5mm;
      }
      .bp-modline {
        display: grid;
        grid-template-columns: 9mm 1fr 6mm 11mm;
        gap: 1.5mm;
        align-items: center;
        padding: 0.5mm 0;
        font-size: 6.5pt;
      }
      .bp-modline__id {
        font-weight: 700;
        letter-spacing: 0.04em;
        font-variant-numeric: tabular-nums;
      }
      .bp-modline__name {
        color: ${C.inkSoft}; font-weight: 500;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        line-height: 1.2;
      }
      .bp-modline__count {
        font-weight: 700; color: ${C.ink};
        font-variant-numeric: tabular-nums;
        text-align: right;
        font-size: 6pt;
      }
      .bp-modline__sol {
        font-size: 5.5pt; font-weight: 700;
        letter-spacing: 0.04em; text-transform: uppercase;
        padding: 0.4mm 1.2mm; border-radius: 1mm;
        text-align: center;
      }

      /* SIDES (Mobile + Manager) */
      .bp-sides {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4mm;
      }
      .bp-sideblock {
        background: ${C.paper};
        border: 1px solid ${C.line};
        border-left: 2mm solid var(--gc);
        border-radius: 2mm;
        padding: 2.5mm 3mm;
      }
      .bp-sideblock__head {
        display: flex; align-items: center; gap: 1.5mm;
        padding-bottom: 1.5mm;
        border-bottom: 1px solid ${C.gray100};
        margin-bottom: 1.5mm;
      }
      .bp-sideblock__title {
        font-size: 9pt; font-weight: 700; color: ${C.ink};
        letter-spacing: -0.01em; flex: 1;
      }
      .bp-sideblock__count {
        font-size: 6pt; color: ${C.inkDim};
        font-variant-numeric: tabular-nums;
      }
      .bp-sideblock__groups {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 1.5mm;
      }
      .bp-sidegrp {
        display: flex; align-items: baseline; gap: 1mm;
        font-size: 6.5pt;
        background: ${C.bgSoft};
        border-radius: 1mm;
        padding: 0.8mm 1.5mm;
      }
      .bp-sidegrp__id {
        font-weight: 700; color: var(--gc);
        font-variant-numeric: tabular-nums;
      }
      .bp-sidegrp__name {
        color: ${C.inkSoft};
        flex: 1;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .bp-sidegrp__count {
        font-weight: 700; color: ${C.ink};
        font-variant-numeric: tabular-nums;
        font-size: 6pt;
      }
      .bp-sideblock__empty {
        font-size: 7pt; color: ${C.inkMute};
        font-style: italic;
      }

      /* FOOTER */
      .bp-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1.5mm 2mm;
        font-size: 6.5pt; color: ${C.inkDim};
        border-top: 1px solid ${C.gray100};
      }
      .bp-footer__legend {
        display: flex; gap: 4mm;
      }
      .bp-footer__legend strong { font-weight: 700; }
      .bp-dot {
        display: inline-block;
        width: 1.8mm; height: 1.8mm; border-radius: 50%;
        margin-right: 1mm; vertical-align: middle;
      }
    `}</style>
  );
}
