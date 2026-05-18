import { useMemo, useState } from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// ProceduresPage — liste latérale + rendu Markdown du contenu Notion
// Source : data.procedures (DB Notion '📋 Procédures')
// ============================================

const CATEGORIE_COLORS = {
  Communication: C.blue,
  Organisation:  C.purple,
  BUG:           C.red,
  Release:       C.orange,
  Qualité:       C.green,
};

export function ProceduresPage({ data }) {
  const procedures = data?.procedures || [];

  const [selectedId, setSelectedId] = useState(() => procedures[0]?.id || null);
  const selected = useMemo(
    () => procedures.find(p => p.id === selectedId) || procedures[0] || null,
    [procedures, selectedId]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Procédures internes"
        icon={BookOpen}
        sub="Documentation des process de l'équipe Produit & Qualité"
      >Procédures</SectionTitle>

      {procedures.length === 0 ? (
        <Card padding={32}>
          <div style={{ textAlign: 'center', color: C.inkDim, fontSize: 13 }}>
            Aucune procédure synchronisée pour le moment.<br/>
            Vérifie que la base Notion <b>📋 Procédures</b> est partagée avec l'intégration
            <code style={{
              background: C.bgSoft, padding: '2px 6px', borderRadius: 4,
              color: C.ink, fontFamily: 'monospace', margin: '0 4px',
            }}>INAXEL_KPI</code>, puis attend le prochain sync.
          </div>
        </Card>
      ) : (
        <Card padding={0} style={{ overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '260px 1fr',
            minHeight: 500,
          }}>
            {/* Liste latérale */}
            <aside style={{
              borderRight: `1px solid ${C.line}`,
              background: C.bgSoft,
              padding: 8,
              display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              {procedures.map(p => {
                const isActive = selected?.id === p.id;
                const catColor = CATEGORIE_COLORS[p.categorie] || C.gray400;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                      padding: '10px 12px',
                      borderRadius: RADIUS.sm,
                      background: isActive ? C.paper : 'transparent',
                      border: 'none',
                      borderLeft: `3px solid ${isActive ? catColor : 'transparent'}`,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.gray50; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {p.categorie && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: catColor,
                          padding: '2px 6px', borderRadius: 3,
                          background: catColor + '15',
                          border: `1px solid ${catColor}40`,
                        }}>{p.categorie}</span>
                      )}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: isActive ? 600 : 500,
                      color: isActive ? C.ink : C.inkSoft,
                      lineHeight: 1.3,
                    }}>{p.titre}</div>
                  </button>
                );
              })}
            </aside>

            {/* Contenu Markdown */}
            <main style={{ padding: '20px 28px', overflowX: 'auto' }}>
              {selected && (
                <>
                  <header style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    gap: 12, marginBottom: 16, paddingBottom: 12,
                    borderBottom: `1px solid ${C.gray100}`,
                  }}>
                    <div>
                      <h1 style={{
                        fontSize: 22, fontWeight: 700, color: C.ink,
                        margin: 0, lineHeight: 1.25,
                      }}>{selected.titre}</h1>
                      {selected.resume && (
                        <p style={{
                          fontSize: 13, color: C.inkDim,
                          margin: '6px 0 0', lineHeight: 1.45,
                        }}>{selected.resume}</p>
                      )}
                    </div>
                    {selected.url && (
                      <a
                        href={selected.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '6px 10px', borderRadius: RADIUS.sm,
                          background: 'transparent', color: C.inkDim,
                          border: `1px solid ${C.line}`,
                          fontSize: 11, fontWeight: 600,
                          textDecoration: 'none', whiteSpace: 'nowrap',
                          transition: 'color 0.12s, background 0.12s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = C.gray50;
                          e.currentTarget.style.color = C.ink;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = C.inkDim;
                        }}
                        title="Éditer dans Notion"
                      >
                        <ExternalLink size={11} strokeWidth={2.2} />
                        Notion
                      </a>
                    )}
                  </header>

                  <article className="md-body">
                    <ReactMarkdown components={MD_COMPONENTS}>
                      {selected.contenu || '_Aucun contenu_'}
                    </ReactMarkdown>
                  </article>
                </>
              )}
            </main>
          </div>
        </Card>
      )}
    </div>
  );
}

// Map markdown elements → composants stylés cohérents avec le reste du dashboard
const MD_COMPONENTS = {
  h1: (p) => <h1 style={{
    fontSize: 18, fontWeight: 700, color: C.ink,
    marginTop: 24, marginBottom: 10,
  }} {...p} />,
  h2: (p) => <h2 style={{
    fontSize: 16, fontWeight: 700, color: C.orange,
    marginTop: 22, marginBottom: 8,
    letterSpacing: '0.01em',
  }} {...p} />,
  h3: (p) => <h3 style={{
    fontSize: 14, fontWeight: 700, color: C.ink,
    marginTop: 16, marginBottom: 6,
  }} {...p} />,
  h4: (p) => <h4 style={{
    fontSize: 13, fontWeight: 700, color: C.inkSoft,
    marginTop: 12, marginBottom: 4,
  }} {...p} />,
  p: (p) => <p style={{
    fontSize: 13, color: C.inkSoft,
    lineHeight: 1.6, margin: '8px 0',
  }} {...p} />,
  ul: (p) => <ul style={{
    fontSize: 13, color: C.inkSoft,
    paddingLeft: 20, margin: '8px 0', lineHeight: 1.55,
  }} {...p} />,
  ol: (p) => <ol style={{
    fontSize: 13, color: C.inkSoft,
    paddingLeft: 22, margin: '8px 0', lineHeight: 1.55,
  }} {...p} />,
  li: (p) => <li style={{ margin: '4px 0' }} {...p} />,
  strong: (p) => <strong style={{ color: C.ink, fontWeight: 700 }} {...p} />,
  em: (p) => <em style={{ color: C.inkSoft }} {...p} />,
  code: (p) => <code style={{
    background: C.bgSoft,
    padding: '1px 6px', borderRadius: 4,
    fontSize: 12, fontFamily: 'monospace',
    color: C.ink,
  }} {...p} />,
  blockquote: (p) => <blockquote style={{
    borderLeft: `3px solid ${C.orange}`,
    margin: '12px 0', padding: '6px 0 6px 14px',
    fontSize: 13, color: C.inkSoft,
    background: C.orangeFaint, borderRadius: '0 6px 6px 0',
  }} {...p} />,
  hr: () => <hr style={{
    border: 'none', borderTop: `1px solid ${C.gray200}`,
    margin: '20px 0',
  }} />,
  a: (p) => <a style={{
    color: C.orange, textDecoration: 'underline',
  }} target="_blank" rel="noopener noreferrer" {...p} />,
  table: (p) => <div style={{ overflowX: 'auto', margin: '12px 0' }}>
    <table style={{
      borderCollapse: 'collapse', fontSize: 12, width: '100%',
    }} {...p} />
  </div>,
  thead: (p) => <thead style={{ background: C.gray50 }} {...p} />,
  th: (p) => <th style={{
    padding: '8px 12px', textAlign: 'left',
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: C.gray400, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
  }} {...p} />,
  td: (p) => <td style={{
    padding: '8px 12px',
    fontSize: 12, color: C.inkSoft,
    borderBottom: `1px solid ${C.gray100}`,
    verticalAlign: 'top',
  }} {...p} />,
};
