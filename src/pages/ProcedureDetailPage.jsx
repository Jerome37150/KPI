import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen, ExternalLink, ChevronLeft, ChevronRight,
  Megaphone, Network, Bug, Rocket, ShieldCheck,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { C, RADIUS, SHADOW } from '../styles/theme';

// ============================================
// ProcedureDetailPage — page dédiée à UNE procédure
// Hero header coloré par catégorie + sommaire sticky + Markdown stylé
// + navigation procédure précédente / suivante.
// ============================================

const CATEGORIE_META = {
  Communication: { color: C.blue,   icon: Megaphone     },
  Organisation:  { color: C.purple, icon: Network       },
  BUG:           { color: C.red,    icon: Bug           },
  Release:       { color: C.orange, icon: Rocket        },
  Qualité:       { color: C.green,  icon: ShieldCheck   },
};

const DEFAULT_META = { color: C.gray400, icon: BookOpen };

// Extrait les headings h1/h2 du Markdown pour construire le sommaire.
// On parse ligne par ligne, on ignore ce qui est à l'intérieur d'un bloc ``` (code).
function extractHeadings(markdown) {
  if (!markdown) return [];
  const lines = markdown.split('\n');
  const result = [];
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith('```')) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(##|###)\s+(.+)$/);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/\*\*/g, '').trim();
    const id = slugifyAnchor(text);
    result.push({ id, text, level });
  }
  return result;
}

function slugifyAnchor(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDateFr(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return null; }
}

export function ProcedureDetailPage({ data, slug, onNavigate }) {
  const procedures = data?.procedures || [];
  const idx = procedures.findIndex(p => p.slug === slug);
  const procedure = idx >= 0 ? procedures[idx] : null;
  const prev = idx > 0 ? procedures[idx - 1] : null;
  const next = idx >= 0 && idx < procedures.length - 1 ? procedures[idx + 1] : null;

  const headings = useMemo(() => extractHeadings(procedure?.contenu), [procedure?.contenu]);
  const [activeId, setActiveId] = useState(null);

  // Surligne le heading dans le sommaire selon le scroll de la page
  useEffect(() => {
    if (headings.length === 0) return;
    const handler = () => {
      const scrollY = window.scrollY + 120;
      let current = headings[0]?.id || null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.offsetTop <= scrollY) current = h.id;
      }
      setActiveId(current);
    };
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [headings]);

  if (!procedure) {
    return (
      <div style={{
        padding: 32, textAlign: 'center', color: C.inkDim, fontSize: 13,
      }}>
        Procédure introuvable. Le contenu est peut-être en cours de synchronisation —
        retente dans quelques minutes.
      </div>
    );
  }

  const meta = CATEGORIE_META[procedure.categorie] || DEFAULT_META;
  const CategoryIcon = meta.icon;
  const lastEditedFr = formatDateFr(procedure.lastEdited);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* HERO HEADER */}
      <div style={{
        background: `linear-gradient(135deg, ${meta.color}15 0%, ${meta.color}05 60%, transparent 100%)`,
        border: `1px solid ${meta.color}30`,
        borderLeft: `4px solid ${meta.color}`,
        borderRadius: RADIUS.md,
        padding: '24px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Icône en filigrane */}
        <CategoryIcon size={140} color={meta.color}
          strokeWidth={1.2}
          style={{
            position: 'absolute', right: -20, top: -20,
            opacity: 0.06, pointerEvents: 'none',
          }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge catégorie */}
          {procedure.categorie && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: RADIUS.sm,
              background: meta.color, color: '#fff',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              <CategoryIcon size={11} strokeWidth={2.4} />
              {procedure.categorie}
            </div>
          )}

          {/* Titre */}
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: C.ink,
            margin: '0 0 10px', lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}>
            {procedure.titre}
          </h1>

          {/* Résumé */}
          {procedure.resume && (
            <p style={{
              fontSize: 14, color: C.inkSoft,
              margin: '0 0 16px', lineHeight: 1.55,
              maxWidth: 760,
            }}>
              {procedure.resume}
            </p>
          )}

          {/* Métadonnées */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            fontSize: 11, color: C.inkDim,
          }}>
            {lastEditedFr && (
              <span>
                Mise à jour&nbsp;: <b style={{ color: C.inkSoft }}>{lastEditedFr}</b>
              </span>
            )}
            {procedure.url && (
              <a
                href={procedure.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: RADIUS.sm,
                  background: C.paper, color: C.inkSoft,
                  border: `1px solid ${C.line}`,
                  fontSize: 11, fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'color 0.12s, border-color 0.12s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = meta.color;
                  e.currentTarget.style.borderColor = meta.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = C.inkSoft;
                  e.currentTarget.style.borderColor = C.line;
                }}
                title="Éditer dans Notion"
              >
                <ExternalLink size={11} strokeWidth={2.2} />
                Éditer dans Notion
              </a>
            )}
          </div>
        </div>
      </div>

      {/* GRID : contenu + sommaire latéral */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: headings.length > 1 ? 'minmax(0, 1fr) 220px' : '1fr',
        gap: 24,
        alignItems: 'flex-start',
      }}>
        {/* CONTENU MARKDOWN */}
        <article style={{
          background: C.paper,
          border: `1px solid ${C.line}`,
          borderRadius: RADIUS.md,
          padding: '24px 32px',
          boxShadow: SHADOW.sm,
        }}>
          <ReactMarkdown components={makeMdComponents(meta.color)}>
            {procedure.contenu || '_Aucun contenu_'}
          </ReactMarkdown>
        </article>

        {/* TOC sticky */}
        {headings.length > 1 && (
          <nav style={{
            position: 'sticky',
            top: 80,
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: RADIUS.md,
            padding: '16px 14px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: C.inkDim, fontWeight: 700, marginBottom: 10,
              paddingLeft: 4,
            }}>Sommaire</div>
            {headings.map(h => {
              const isActive = activeId === h.id;
              return (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 80;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                  style={{
                    display: 'block',
                    padding: `4px 8px 4px ${4 + (h.level - 2) * 12}px`,
                    fontSize: 12,
                    color: isActive ? meta.color : C.inkDim,
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    borderLeft: `2px solid ${isActive ? meta.color : 'transparent'}`,
                    background: isActive ? meta.color + '0d' : 'transparent',
                    transition: 'color 0.12s, border-color 0.12s, background 0.12s',
                    borderRadius: '0 4px 4px 0',
                    lineHeight: 1.4,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = C.ink; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = C.inkDim; }}
                >
                  {h.text}
                </a>
              );
            })}
          </nav>
        )}
      </div>

      {/* NAVIGATION prev / next */}
      {(prev || next) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12, marginTop: 4,
        }}>
          <NavCard
            label="Procédure précédente"
            procedure={prev}
            onClick={() => prev && onNavigate?.(`procedure-${prev.slug}`)}
            direction="prev"
          />
          <NavCard
            label="Procédure suivante"
            procedure={next}
            onClick={() => next && onNavigate?.(`procedure-${next.slug}`)}
            direction="next"
          />
        </div>
      )}
    </div>
  );
}

// ── Carte de navigation prev/next ──
function NavCard({ label, procedure, onClick, direction }) {
  const enabled = !!procedure;
  const isPrev = direction === 'prev';
  const meta = procedure ? (CATEGORIE_META[procedure.categorie] || DEFAULT_META) : DEFAULT_META;
  return (
    <button
      type="button"
      onClick={enabled ? onClick : undefined}
      disabled={!enabled}
      style={{
        textAlign: isPrev ? 'left' : 'right',
        padding: '14px 16px',
        background: enabled ? C.paper : C.bgSoft,
        border: `1px solid ${enabled ? C.line : C.gray100}`,
        borderRadius: RADIUS.md,
        cursor: enabled ? 'pointer' : 'default',
        fontFamily: 'inherit',
        transition: 'border-color 0.12s, transform 0.12s, box-shadow 0.12s',
        opacity: enabled ? 1 : 0.55,
        display: 'flex', flexDirection: 'column', gap: 4,
        alignItems: isPrev ? 'flex-start' : 'flex-end',
      }}
      onMouseEnter={e => {
        if (!enabled) return;
        e.currentTarget.style.borderColor = meta.color;
        e.currentTarget.style.boxShadow = SHADOW.sm;
      }}
      onMouseLeave={e => {
        if (!enabled) return;
        e.currentTarget.style.borderColor = C.line;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: C.inkDim, fontWeight: 700,
      }}>
        {isPrev && <ChevronLeft size={11} strokeWidth={2.4} />}
        <span>{label}</span>
        {!isPrev && <ChevronRight size={11} strokeWidth={2.4} />}
      </div>
      <div style={{
        fontSize: 13, fontWeight: 600,
        color: enabled ? C.ink : C.inkMute,
        lineHeight: 1.3,
      }}>
        {procedure?.titre || '—'}
      </div>
    </button>
  );
}

// ── Mapping Markdown → composants stylés ──
// L'orange du titre h2 reprend la couleur de la catégorie (passée en arg).
function makeMdComponents(accent) {
  return {
    h2: ({ node, children, ...p }) => {
      const text = childrenToText(children);
      return (
        <h2
          id={slugifyAnchor(text)}
          style={{
            fontSize: 18, fontWeight: 700, color: accent,
            margin: '28px 0 10px',
            paddingBottom: 6,
            borderBottom: `1px solid ${accent}30`,
            scrollMarginTop: 80,
          }}
          {...p}
        >{children}</h2>
      );
    },
    h3: ({ node, children, ...p }) => {
      const text = childrenToText(children);
      return (
        <h3
          id={slugifyAnchor(text)}
          style={{
            fontSize: 15, fontWeight: 700, color: C.ink,
            margin: '20px 0 6px',
            scrollMarginTop: 80,
          }}
          {...p}
        >{children}</h3>
      );
    },
    h4: (p) => <h4 style={{
      fontSize: 13, fontWeight: 700, color: C.inkSoft,
      margin: '12px 0 4px',
    }} {...p} />,
    p: (p) => <p style={{
      fontSize: 14, color: C.inkSoft,
      lineHeight: 1.65, margin: '8px 0',
    }} {...p} />,
    ul: (p) => <ul style={{
      fontSize: 14, color: C.inkSoft,
      paddingLeft: 22, margin: '8px 0', lineHeight: 1.6,
    }} {...p} />,
    ol: (p) => <ol style={{
      fontSize: 14, color: C.inkSoft,
      paddingLeft: 24, margin: '8px 0', lineHeight: 1.6,
    }} {...p} />,
    li: (p) => <li style={{ margin: '4px 0' }} {...p} />,
    strong: (p) => <strong style={{ color: C.ink, fontWeight: 700 }} {...p} />,
    em: (p) => <em style={{ color: C.inkSoft }} {...p} />,
    code: (p) => <code style={{
      background: C.bgSoft,
      padding: '1px 6px', borderRadius: 4,
      fontSize: 12.5, fontFamily: 'monospace',
      color: C.ink,
    }} {...p} />,
    blockquote: (p) => <blockquote style={{
      borderLeft: `3px solid ${accent}`,
      margin: '14px 0', padding: '10px 16px',
      fontSize: 13.5, color: C.inkSoft,
      background: accent + '0d',
      borderRadius: '0 6px 6px 0',
    }} {...p} />,
    hr: () => <hr style={{
      border: 'none', borderTop: `1px solid ${C.gray200}`,
      margin: '24px 0',
    }} />,
    a: (p) => <a style={{
      color: accent, textDecoration: 'underline',
    }} target="_blank" rel="noopener noreferrer" {...p} />,
    table: (p) => <div style={{ overflowX: 'auto', margin: '14px 0' }}>
      <table style={{
        borderCollapse: 'collapse', fontSize: 13, width: '100%',
        background: C.paper,
        border: `1px solid ${C.line}`,
        borderRadius: RADIUS.sm,
        overflow: 'hidden',
      }} {...p} />
    </div>,
    thead: (p) => <thead style={{ background: accent + '12' }} {...p} />,
    th: (p) => <th style={{
      padding: '10px 14px', textAlign: 'left',
      fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
      color: accent, fontWeight: 700,
      borderBottom: `1px solid ${accent}30`,
    }} {...p} />,
    td: (p) => <td style={{
      padding: '10px 14px',
      fontSize: 13, color: C.inkSoft,
      borderBottom: `1px solid ${C.gray100}`,
      verticalAlign: 'top',
    }} {...p} />,
  };
}

// Helper : extrait le texte plein d'un set d'enfants React (pour anchor id)
function childrenToText(children) {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  if (children?.props?.children) return childrenToText(children.props.children);
  return '';
}
