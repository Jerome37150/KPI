import { useMemo, useState, useRef, useEffect } from 'react';
import {
  Inbox, MessageCircle, Paperclip, ExternalLink,
  ChevronsUp, Minus, ChevronsDown, Search, X, Check,
  ChevronUp, ChevronDown, ChevronsUpDown,
} from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from './primitives/Card';
import { Pill } from './primitives/Pill';
import { CLASSIF_COLORS, PRIO_COLORS } from '../utils/colors';

const PRIO_ICONS = {
  "Haute":       ChevronsUp,
  "Moyenne":     Minus,
  "Pas urgente": ChevronsDown,
};

const PRIO_RANK = {
  "Haute":       1,
  "Moyenne":     2,
  "Pas urgente": 3,
};

const STATUT_COLORS = {
  "FAIT":                 C.green,
  "Fait partiellement":   C.green,
  "En cours":             C.orange,
  "A planifier":          C.inkDim,
  "Stand by":             C.amber,
  "A etudier":            C.blue,
  "A réfléchir autrement":C.purple,
  "A prevoir TOP LINE":   C.purple,
  "Abandon":              C.red,
  "Archivé":              C.gray400,
};

function isAwsUrlExpired(url) {
  try {
    const u = new URL(url);
    const date = u.searchParams.get('X-Amz-Date');
    const expires = parseInt(u.searchParams.get('X-Amz-Expires') || '0', 10);
    if (!date || !expires) return false;
    const iso = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6,8)}T${date.slice(9,11)}:${date.slice(11,13)}:${date.slice(13,15)}Z`;
    const signedAt = new Date(iso).getTime();
    if (isNaN(signedAt)) return false;
    return (Date.now() - signedAt) > expires * 1000;
  } catch {
    return false;
  }
}

function resolveAttachmentUrl(t) {
  if (!t?.pieceJointe?.url) return null;
  if (isAwsUrlExpired(t.pieceJointe.url)) return t.url || t.pieceJointe.url;
  return t.pieceJointe.url;
}

// ── Header cellule avec filtre + tri ──
function FilterableHeader({
  label,
  type,             // 'text' | 'select'
  value,
  onChange,
  options,          // pour 'select' : [{ value, label, color?, swatch? }]
  placeholder,
  minChars = 0,
  isOpen,
  onToggle,
  onClose,
  align = "left",
  sortDir,          // null | 'asc' | 'desc'
  onSortToggle,
  sortable = true,
}) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const hasValue = type === 'text' ? Boolean(value) : (value !== null && value !== undefined && value !== "");

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && type === 'text' && inputRef.current) inputRef.current.focus();
  }, [isOpen, type]);

  // Mode TEXTE ouvert : l'input remplace le label
  if (type === 'text' && isOpen) {
    return (
      <th style={{
        padding: "6px 12px",
        borderBottom: `1px solid ${C.gray200}`,
        background: C.gray50,
      }}>
        <div ref={ref} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "0 8px",
          background: C.paper,
          border: `1px solid ${hasValue ? C.orange : C.line}`,
          borderRadius: 8,
          height: 28,
        }}>
          <input
            ref={inputRef}
            type="text"
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
            placeholder={placeholder || `Filtrer${minChars > 1 ? ` (min. ${minChars} lettres)` : ""}…`}
            style={{
              flex: 1, minWidth: 0, height: 26,
              background: "transparent", border: "none", outline: "none",
              fontSize: 12, color: C.ink, fontFamily: "inherit",
            }}
          />
          <button
            onClick={() => { onChange(""); onClose(); }}
            aria-label="Fermer le filtre"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: 4,
              background: "transparent", border: "none", cursor: "pointer",
              color: C.orange, padding: 0,
            }}
          >
            <X size={14} strokeWidth={2.6} />
          </button>
        </div>
      </th>
    );
  }

  // Mode normal : label + loupe (+ popover pour select)
  return (
    <th style={{
      textAlign: align, padding: "10px 16px",
      fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
      color: C.gray400, fontWeight: 700,
      borderBottom: `1px solid ${C.gray200}`,
      whiteSpace: "nowrap",
      position: "relative",
    }}>
      <div ref={ref} style={{ display: "inline-flex", alignItems: "center", gap: 6, justifyContent: align === "center" ? "center" : "flex-start" }}>
        <span>{label}</span>
        {type !== 'none' && (
          <button
            onClick={onToggle}
            aria-label={`Filtrer ${label}`}
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: 4,
              background: hasValue ? C.orangeBg : "transparent",
              border: "none", cursor: "pointer",
              color: C.orange, padding: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (!hasValue) e.currentTarget.style.background = C.orangeBg; }}
            onMouseLeave={e => { if (!hasValue) e.currentTarget.style.background = "transparent"; }}
          >
            <Search size={12} strokeWidth={2.6} />
          </button>
        )}
        {sortable && (
          <button
            onClick={onSortToggle}
            aria-label={`Trier ${label}`}
            title={
              sortDir === 'asc'  ? "Tri croissant — clic pour décroissant"
              : sortDir === 'desc' ? "Tri décroissant — clic pour annuler"
              : "Trier croissant"
            }
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 18, height: 18, borderRadius: 4,
              background: sortDir ? C.orangeBg : "transparent",
              border: "none", cursor: "pointer",
              color: sortDir ? C.orange : C.gray400, padding: 0,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { if (!sortDir) { e.currentTarget.style.background = C.orangeBg; e.currentTarget.style.color = C.orange; } }}
            onMouseLeave={e => { if (!sortDir) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.gray400; } }}
          >
            {sortDir === 'asc'  ? <ChevronUp     size={12} strokeWidth={2.8} />
            : sortDir === 'desc' ? <ChevronDown   size={12} strokeWidth={2.8} />
            : <ChevronsUpDown size={11} strokeWidth={2.4} />}
          </button>
        )}
        {hasValue && (
          <button
            onClick={() => { onChange(type === 'text' ? "" : null); onClose(); }}
            aria-label="Effacer le filtre"
            style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 16, height: 16, borderRadius: 4,
              background: "transparent", border: "none", cursor: "pointer",
              color: C.orange, padding: 0,
            }}
          >
            <X size={11} strokeWidth={2.6} />
          </button>
        )}

        {type === 'select' && isOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 12, marginTop: 4,
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            minWidth: 160, maxHeight: 280, overflowY: "auto",
            zIndex: 50,
            padding: 4,
          }}>
            <FilterOption
              label="Tous"
              isSelected={!hasValue}
              onClick={() => { onChange(null); onClose(); }}
            />
            {(options || []).map(opt => (
              <FilterOption
                key={String(opt.value)}
                label={opt.label}
                color={opt.color}
                swatch={opt.swatch}
                isSelected={value === opt.value}
                onClick={() => { onChange(opt.value); onClose(); }}
              />
            ))}
          </div>
        )}
      </div>
    </th>
  );
}

function FilterOption({ label, color, swatch, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        width: "100%", padding: "6px 10px",
        background: isSelected ? C.gray50 : "transparent",
        border: "none", borderRadius: 6, cursor: "pointer",
        fontSize: 12, color: C.ink, fontFamily: "inherit",
        textAlign: "left",
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.gray50; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
    >
      {swatch && (
        <span style={{
          width: 8, height: 8, borderRadius: RADIUS.full,
          background: swatch, flexShrink: 0,
        }} />
      )}
      <span style={{ flex: 1, color: color || C.ink, fontWeight: isSelected ? 600 : 400 }}>{label}</span>
      {isSelected && <Check size={12} color={C.orange} strokeWidth={2.6} />}
    </button>
  );
}

// ============================================
// VersionTicketsTable
// ============================================
export function VersionTicketsTable({ tickets, title = "Tickets livrés", showStatus = false, showProgress = false, showVersion = false }) {
  const [filters, setFilters] = useState({
    titre: "",
    version: "",
    classification: null,
    priorisation: null,
    statut: null,
    avancement: null,
    initialeAjout: "",
    comm: null,
    piece: null,
  });
  const [openFilter, setOpenFilter] = useState(null);
  const [sort, setSort] = useState({ key: null, dir: null });

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const toggle = (key) => setOpenFilter(prev => prev === key ? null : key);
  const closeAll = () => setOpenFilter(null);
  const toggleSort = (key) => setSort(prev => {
    if (prev.key !== key) return { key, dir: 'asc' };
    if (prev.dir === 'asc')  return { key, dir: 'desc' };
    return { key: null, dir: null };
  });
  const sortDirFor = (key) => sort.key === key ? sort.dir : null;

  // Options dynamiques
  const classifOptions = useMemo(() => {
    const set = new Set();
    tickets.forEach(t => { if (t.classification) set.add(t.classification); });
    return Array.from(set).sort().map(v => ({
      value: v, label: v, color: CLASSIF_COLORS[v] || C.inkSoft,
    }));
  }, [tickets]);

  const statutOptions = useMemo(() => {
    const set = new Set();
    tickets.forEach(t => { if (t.statut) set.add(t.statut); });
    return Array.from(set).sort().map(v => ({
      value: v, label: v, swatch: STATUT_COLORS[v] || C.inkDim,
    }));
  }, [tickets]);

  const prioOptions = [
    { value: "Haute",       label: "Haute",       color: PRIO_COLORS["Haute"]       || C.inkSoft },
    { value: "Moyenne",     label: "Moyenne",     color: PRIO_COLORS["Moyenne"]     || C.inkSoft },
    { value: "Pas urgente", label: "Pas urgente", color: PRIO_COLORS["Pas urgente"] || C.inkSoft },
  ];

  const avancementOptions = [
    { value: "none",     label: "Non démarré (0%)" },
    { value: "partial",  label: "En cours (1-99%)" },
    { value: "done",     label: "Terminé (100%)" },
  ];

  const boolOptions = [
    { value: "yes", label: "Avec" },
    { value: "no",  label: "Sans" },
  ];

  // Filtrage + tri
  const rows = useMemo(() => {
    const t1 = filters.titre.trim().toLowerCase();
    const titreNeedle = t1.length >= 2 ? t1 : "";
    const v1 = filters.version.trim().toLowerCase();
    const i1 = filters.initialeAjout.trim().toLowerCase();

    const filtered = tickets.filter(t => {
      if (titreNeedle) {
        const hay = `${t.identifiant || ""} ${t.titre || ""}`.toLowerCase();
        if (!hay.includes(titreNeedle)) return false;
      }
      if (v1) {
        if (!String(t.versionStable || "").toLowerCase().includes(v1)) return false;
      }
      if (filters.classification && t.classification !== filters.classification) return false;
      if (filters.priorisation   && t.priorisation   !== filters.priorisation)   return false;
      if (filters.statut         && t.statut         !== filters.statut)         return false;
      if (filters.avancement) {
        const v = typeof t.pointAvancement === "number" ? t.pointAvancement : 0;
        const pct = Math.round(Math.max(0, Math.min(1, v)) * 100);
        if (filters.avancement === "none"    && pct !== 0)               return false;
        if (filters.avancement === "partial" && (pct === 0 || pct >= 100)) return false;
        if (filters.avancement === "done"    && pct < 100)               return false;
      }
      if (i1) {
        const initiales = Array.isArray(t.initialeAjout) ? t.initialeAjout : [];
        if (!initiales.some(x => String(x).toLowerCase().includes(i1))) return false;
      }
      if (filters.comm) {
        const hasComm = Array.isArray(t.communication) && t.communication.length > 0;
        if (filters.comm === "yes" && !hasComm) return false;
        if (filters.comm === "no"  &&  hasComm) return false;
      }
      if (filters.piece) {
        const hasPiece = !!t.pieceJointe;
        if (filters.piece === "yes" && !hasPiece) return false;
        if (filters.piece === "no"  &&  hasPiece) return false;
      }
      return true;
    });

    const defaultSort = (a, b) => {
      const ra = PRIO_RANK[a.priorisation] || 99;
      const rb = PRIO_RANK[b.priorisation] || 99;
      if (ra !== rb) return ra - rb;
      const ai = a.identifiant || "";
      const bi = b.identifiant || "";
      return ai.localeCompare(bi, "fr", { numeric: true });
    };

    if (!sort.key || !sort.dir) {
      return filtered.sort(defaultSort);
    }

    const factor = sort.dir === 'asc' ? 1 : -1;
    const cmp = (a, b) => {
      switch (sort.key) {
        case 'titre': {
          const av = (a.titre || "").toLowerCase();
          const bv = (b.titre || "").toLowerCase();
          return av.localeCompare(bv, "fr", { numeric: true });
        }
        case 'version': {
          const av = String(a.versionStable || "");
          const bv = String(b.versionStable || "");
          return av.localeCompare(bv, "fr", { numeric: true });
        }
        case 'classification': {
          return (a.classification || "").localeCompare(b.classification || "", "fr");
        }
        case 'priorisation': {
          const ra = PRIO_RANK[a.priorisation] || 99;
          const rb = PRIO_RANK[b.priorisation] || 99;
          return ra - rb;
        }
        case 'statut': {
          return (a.statut || "").localeCompare(b.statut || "", "fr");
        }
        case 'avancement': {
          const av = typeof a.pointAvancement === "number" ? a.pointAvancement : 0;
          const bv = typeof b.pointAvancement === "number" ? b.pointAvancement : 0;
          return av - bv;
        }
        case 'initialeAjout': {
          const av = (Array.isArray(a.initialeAjout) && a.initialeAjout[0]) || "";
          const bv = (Array.isArray(b.initialeAjout) && b.initialeAjout[0]) || "";
          return av.localeCompare(bv, "fr");
        }
        case 'comm': {
          const av = Array.isArray(a.communication) && a.communication.length > 0 ? 1 : 0;
          const bv = Array.isArray(b.communication) && b.communication.length > 0 ? 1 : 0;
          return av - bv;
        }
        case 'piece': {
          const av = a.pieceJointe ? 1 : 0;
          const bv = b.pieceJointe ? 1 : 0;
          return av - bv;
        }
        default:
          return 0;
      }
    };

    return filtered.sort((a, b) => {
      const r = cmp(a, b);
      if (r !== 0) return r * factor;
      return defaultSort(a, b);
    });
  }, [tickets, filters, sort]);

  const anyFilterActive =
    (filters.titre.trim().length >= 2) ||
    filters.version.trim().length > 0 ||
    filters.initialeAjout.trim().length > 0 ||
    Boolean(filters.classification) ||
    Boolean(filters.priorisation) ||
    Boolean(filters.statut) ||
    Boolean(filters.avancement) ||
    Boolean(filters.comm) ||
    Boolean(filters.piece);

  const totalCols = 6 + (showStatus ? 1 : 0) + (showProgress ? 1 : 0) + (showVersion ? 1 : 0);

  return (
    <Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${C.line}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Inbox size={13} color={C.orange} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>{title}</div>
        </div>
        <span style={{ fontSize: 11, color: C.inkDim }}>
          {anyFilterActive
            ? <>Filtrés : <span style={{ color: C.inkSoft, fontWeight: 700 }}>{rows.length}</span> / {tickets.length}</>
            : <>Total : <span style={{ color: C.inkSoft, fontWeight: 700 }}>{tickets.length}</span></>}
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.gray50 }}>
              <FilterableHeader
                label="Titre"
                type="text"
                value={filters.titre}
                onChange={v => setFilter('titre', v)}
                minChars={2}
                placeholder="Filtrer (min. 2 lettres)…"
                isOpen={openFilter === 'titre'}
                onToggle={() => toggle('titre')}
                onClose={closeAll}
                sortDir={sortDirFor('titre')}
                onSortToggle={() => toggleSort('titre')}
              />
              {showVersion && (
                <FilterableHeader
                  label="Version"
                  type="text"
                  value={filters.version}
                  onChange={v => setFilter('version', v)}
                  placeholder="Filtrer…"
                  isOpen={openFilter === 'version'}
                  onToggle={() => toggle('version')}
                  onClose={closeAll}
                  sortDir={sortDirFor('version')}
                  onSortToggle={() => toggleSort('version')}
                />
              )}
              <FilterableHeader
                label="Classification"
                type="select"
                value={filters.classification}
                onChange={v => setFilter('classification', v)}
                options={classifOptions}
                isOpen={openFilter === 'classification'}
                onToggle={() => toggle('classification')}
                onClose={closeAll}
                sortDir={sortDirFor('classification')}
                onSortToggle={() => toggleSort('classification')}
              />
              <FilterableHeader
                label="Priorisation"
                type="select"
                value={filters.priorisation}
                onChange={v => setFilter('priorisation', v)}
                options={prioOptions}
                isOpen={openFilter === 'priorisation'}
                onToggle={() => toggle('priorisation')}
                onClose={closeAll}
                sortDir={sortDirFor('priorisation')}
                onSortToggle={() => toggleSort('priorisation')}
              />
              {showStatus && (
                <FilterableHeader
                  label="Statut"
                  type="select"
                  value={filters.statut}
                  onChange={v => setFilter('statut', v)}
                  options={statutOptions}
                  isOpen={openFilter === 'statut'}
                  onToggle={() => toggle('statut')}
                  onClose={closeAll}
                  sortDir={sortDirFor('statut')}
                  onSortToggle={() => toggleSort('statut')}
                />
              )}
              {showProgress && (
                <FilterableHeader
                  label="Avancement"
                  type="select"
                  value={filters.avancement}
                  onChange={v => setFilter('avancement', v)}
                  options={avancementOptions}
                  isOpen={openFilter === 'avancement'}
                  onToggle={() => toggle('avancement')}
                  onClose={closeAll}
                  sortDir={sortDirFor('avancement')}
                  onSortToggle={() => toggleSort('avancement')}
                />
              )}
              <FilterableHeader
                label="Initiale ajout"
                type="text"
                value={filters.initialeAjout}
                onChange={v => setFilter('initialeAjout', v)}
                placeholder="Filtrer…"
                isOpen={openFilter === 'initialeAjout'}
                onToggle={() => toggle('initialeAjout')}
                onClose={closeAll}
                sortDir={sortDirFor('initialeAjout')}
                onSortToggle={() => toggleSort('initialeAjout')}
              />
              <FilterableHeader
                label="Comm."
                type="select"
                value={filters.comm}
                onChange={v => setFilter('comm', v)}
                options={boolOptions}
                align="center"
                isOpen={openFilter === 'comm'}
                onToggle={() => toggle('comm')}
                onClose={closeAll}
                sortDir={sortDirFor('comm')}
                onSortToggle={() => toggleSort('comm')}
              />
              <FilterableHeader
                label="P.J."
                type="select"
                value={filters.piece}
                onChange={v => setFilter('piece', v)}
                options={boolOptions}
                align="center"
                isOpen={openFilter === 'piece'}
                onToggle={() => toggle('piece')}
                onClose={closeAll}
                sortDir={sortDirFor('piece')}
                onSortToggle={() => toggleSort('piece')}
              />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={totalCols} style={{ padding: 32, textAlign: "center", color: C.inkDim }}>
                  {anyFilterActive ? "Aucun ticket ne correspond aux filtres" : "Aucun ticket"}
                </td>
              </tr>
            )}
            {rows.map((t, i) => {
              const classifColor = CLASSIF_COLORS[t.classification] || C.inkSoft;
              const prioColor    = PRIO_COLORS[t.priorisation] || C.inkDim;
              const initiales    = Array.isArray(t.initialeAjout) ? t.initialeAjout : [];
              const comms        = Array.isArray(t.communication) ? t.communication : [];
              const hasComm      = comms.length > 0;
              const hasPiece     = !!t.pieceJointe;

              return (
                <tr key={t.id || i} style={{
                  borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.gray100}`,
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = C.gray50; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Titre */}
                  <td style={{
                    padding: "12px 16px", color: C.ink,
                    maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={t.titre}>
                    {t.url ? (
                      <a href={t.url} target="_blank" rel="noopener noreferrer" style={{
                        color: C.ink, textDecoration: "none", fontWeight: 500,
                        display: "inline-flex", alignItems: "center", gap: 6,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = C.orange; }}
                      onMouseLeave={e => { e.currentTarget.style.color = C.ink; }}
                      >
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: C.inkDim,
                          fontVariantNumeric: "tabular-nums",
                        }}>{t.identifiant || ""}</span>
                        <span>{t.titre || "—"}</span>
                        <ExternalLink size={11} color={C.inkMute} strokeWidth={2.2} style={{ flexShrink: 0 }} />
                      </a>
                    ) : (
                      <span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: C.inkDim,
                          fontVariantNumeric: "tabular-nums", marginRight: 6,
                        }}>{t.identifiant || ""}</span>
                        {t.titre || "—"}
                      </span>
                    )}
                  </td>

                  {/* Version */}
                  {showVersion && (
                    <td style={{ padding: "12px 16px" }}>
                      {t.versionStable ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11, fontWeight: 700, color: C.orange,
                          background: C.orangeBg, padding: "2px 8px",
                          borderRadius: RADIUS.sm,
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}>
                          <span style={{ fontSize: 9, color: C.orange, opacity: 0.7 }}>v</span>
                          {t.versionStable}
                        </span>
                      ) : <span style={{ color: C.inkMute }}>—</span>}
                    </td>
                  )}

                  {/* Classification */}
                  <td style={{ padding: "12px 16px" }}>
                    {t.classification
                      ? <Pill color={classifColor} size="sm">{t.classification}</Pill>
                      : <span style={{ color: C.inkMute }}>—</span>}
                  </td>

                  {/* Priorisation */}
                  <td style={{ padding: "12px 16px" }}>
                    {t.priorisation ? (() => {
                      const PrioIcon = PRIO_ICONS[t.priorisation] || Minus;
                      return (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontWeight: 500, color: C.ink,
                          whiteSpace: "nowrap",
                        }} title={t.priorisation}>
                          <PrioIcon size={14} strokeWidth={2.4} color={prioColor} />
                          {t.priorisation}
                        </span>
                      );
                    })() : <span style={{ color: C.inkMute }}>—</span>}
                  </td>

                  {/* Statut */}
                  {showStatus && (
                    <td style={{ padding: "12px 16px" }}>
                      {t.statut ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 12, fontWeight: 500, color: C.ink,
                          whiteSpace: "nowrap",
                        }} title={t.statut}>
                          <span style={{
                            width: 8, height: 8, borderRadius: RADIUS.full,
                            background: STATUT_COLORS[t.statut] || C.inkDim,
                            flexShrink: 0,
                          }} />
                          {t.statut}
                        </span>
                      ) : <span style={{ color: C.inkMute }}>—</span>}
                    </td>
                  )}

                  {/* Avancement */}
                  {showProgress && (
                    <td style={{ padding: "12px 16px", minWidth: 130 }}>
                      {(() => {
                        const v = typeof t.pointAvancement === "number" ? t.pointAvancement : 0;
                        const pct = Math.round(Math.max(0, Math.min(1, v)) * 100);
                        const barColor = pct >= 100 ? C.green : pct > 0 ? C.orange : C.gray300;
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }} title={`${pct}%`}>
                            <div style={{
                              flex: "0 0 70px", height: 6, background: C.gray100,
                              borderRadius: RADIUS.sm, overflow: "hidden",
                            }}>
                              <div style={{
                                width: `${pct}%`, height: "100%",
                                background: barColor, borderRadius: RADIUS.sm,
                                transition: "width 0.3s ease",
                              }} />
                            </div>
                            <span style={{
                              fontSize: 11, fontWeight: 700, color: pct >= 100 ? C.green : C.inkSoft,
                              fontVariantNumeric: "tabular-nums", minWidth: 32,
                            }}>{pct}%</span>
                          </div>
                        );
                      })()}
                    </td>
                  )}

                  {/* Initiale ajout */}
                  <td style={{ padding: "12px 16px", color: C.ink, fontSize: 12, fontWeight: 500 }}>
                    {initiales.length === 0
                      ? <span style={{ color: C.inkMute }}>—</span>
                      : initiales.join(" · ")}
                  </td>

                  {/* Communication */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {hasComm ? (
                      <span title={comms.join(" · ")} style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 26, height: 26, borderRadius: RADIUS.full,
                        background: C.blueSoft, color: C.blue,
                      }}>
                        <MessageCircle size={13} strokeWidth={2.2} />
                      </span>
                    ) : (
                      <span style={{ color: C.gray300 }}>—</span>
                    )}
                  </td>

                  {/* Pièce jointe */}
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {hasPiece ? (() => {
                      const pjUrl = resolveAttachmentUrl(t);
                      const expired = isAwsUrlExpired(t.pieceJointe.url);
                      return (
                        <a
                          href={pjUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          title={
                            expired
                              ? `${t.pieceJointe.name || "Pièce jointe"} — lien direct expiré, ouvre le ticket Notion`
                              : (t.pieceJointe.name || "Pièce jointe")
                          }
                          style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 26, height: 26, borderRadius: RADIUS.full,
                            background: C.orangeBg, color: C.orange,
                            textDecoration: "none", transition: "transform 0.15s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                        >
                          <Paperclip size={13} strokeWidth={2.2} />
                        </a>
                      );
                    })() : (
                      <span style={{ color: C.gray300 }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
