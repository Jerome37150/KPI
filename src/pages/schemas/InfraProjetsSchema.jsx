import {
  Lightbulb, Cog, CheckCircle, ArrowRight, ArrowDown,
  Code, Github, Triangle, Palette, Diamond, BookOpen,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../../styles/theme';

// ============================================
// InfraProjetsSchema — process de A à Z (3 phases + 4 destinations)
// Reprend le diagramme A4 paysage : phases en haut, bandeau merge,
// 4 déploiements en bas (Vercel / Chromatic / Jira / Inaxel Pilot).
// ============================================

const BRAND = {
  vercel:    '#1A1A1A',
  chromatic: '#FF4785',
  jira:      '#0052CC',
  pilot:     C.orange,
};

export function InfraProjetsSchema() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ===== RANGÉE 1 — 3 PHASES ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1.2fr auto 1.5fr',
        alignItems: 'stretch',
        gap: 6,
      }}>
        <PhaseCard
          num="01" icon={Lightbulb}
          title="Idéation & cadrage"
          bullets={[
            'Transverse multi-services',
            'Cadrage besoin & scope',
            'Go / no-go formalisé',
          ]}
        />
        <ArrowBetween />
        <PhaseCard
          num="02" icon={Cog}
          title="Production"
          badges={[
            { icon: Code,   label: 'Claude Code',   color: C.orange,    bg: C.orangeBg },
            { icon: Github, label: 'GitHub privé',  color: C.ink,        bg: C.gray100 },
          ]}
          footnote="Code · stories · US · doc générés ensemble"
        />
        <ArrowBetween />
        <PhaseCard
          num="03" icon={CheckCircle}
          title="Validation interne"
          bullets={[
            'Pull Request GitHub avec revue transverse',
            'Previews Vercel + Chromatic automatiques par branche',
            'Validation services via CODEOWNERS',
          ]}
          highlightedLast="Merge sur main déclenche les déploiements"
        />
      </div>

      {/* ===== BANDEAU MERGE ===== */}
      <div style={{
        position: 'relative',
        background: `linear-gradient(90deg, ${C.gray900} 0%, ${C.gray900} 60%, ${C.orangeDark} 100%)`,
        borderLeft: `4px solid ${C.orange}`,
        borderRadius: RADIUS.md,
        padding: '14px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        boxShadow: SHADOW.sm,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Github size={20} color="#fff" strokeWidth={2.2} />
          <span style={{
            fontSize: 16, fontWeight: 700, color: '#fff',
          }}>Merge sur main</span>
        </div>
        <span style={{
          fontSize: 12, color: C.orangeLight, fontStyle: 'italic',
          fontWeight: 500,
        }}>→ 4 déploiements automatiques en parallèle</span>
      </div>

      {/* ===== 4 FLÈCHES DESCENDANTES ===== */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        justifyItems: 'center',
        marginTop: -6, marginBottom: -6,
      }}>
        <ArrowDown size={20} color={C.orange} strokeWidth={2.4} />
        <ArrowDown size={20} color={C.orange} strokeWidth={2.4} />
        <ArrowDown size={20} color={C.orange} strokeWidth={2.4} />
        <ArrowDown size={20} color={C.orange} strokeWidth={2.4} />
      </div>

      {/* ===== RANGÉE 2 — 4 DESTINATIONS ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        <DestCard
          color={BRAND.vercel} icon={Triangle}
          title="Vercel"
          subtitle="Application interactive"
          subtitle2="Démo live avec APIs réelles"
          bullets={['Direction & PM', 'Clients & prospects', 'Démos commerciales']}
        />
        <DestCard
          color={BRAND.chromatic} icon={Palette}
          title="Chromatic"
          subtitle="Catalogue de composants"
          subtitle2="Storybook versionné & sécurisé"
          bullets={['Équipe front (code copiable)', 'Équipe design (visual review)', 'Intégration en pre-prod']}
        />
        <DestCard
          color={BRAND.jira} icon={Diamond}
          title="Jira"
          subtitle="Suivi technique"
          subtitle2="Atlassian — sprint planning"
          bullets={['User Stories prêtes pour dev', 'Backlog & roadmap', 'Équipe dev & tech leads']}
        />
        <DestCard
          color={BRAND.pilot} icon={BookOpen}
          title="Inaxel Pilot"
          subtitle="Connaissance opérationnelle"
          subtitle2="Fiches produit · support · wiki"
          bullets={['Support client & commerciaux', 'Onboarding équipes', 'Doc à jour automatiquement']}
        />
      </div>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function PhaseCard({ num, icon: Icon, title, bullets, badges, footnote, highlightedLast }) {
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderTop: `3px solid ${C.orange}`,
      borderRadius: RADIUS.md,
      padding: '14px 16px',
      boxShadow: SHADOW.sm,
      display: 'flex', flexDirection: 'column', gap: 8,
      minHeight: 180,
    }}>
      {/* Header : numéro + icône */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 28, fontWeight: 800, color: C.orange,
          lineHeight: 1, letterSpacing: '-0.02em',
        }}>{num}</span>
        <Icon size={22} color={C.orange} strokeWidth={2} />
      </div>

      {/* Titre */}
      <div style={{
        fontSize: 14, fontWeight: 700, color: C.ink,
        marginTop: 2,
      }}>{title}</div>

      {/* Badges (phase 2) ou bullets */}
      {badges ? (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {badges.map(b => {
              const BIcon = b.icon;
              return (
                <span key={b.label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px',
                  background: b.bg,
                  border: `1px solid ${b.color}`,
                  borderRadius: RADIUS.sm,
                  fontSize: 11.5, fontWeight: 600, color: b.color,
                }}>
                  <BIcon size={12} strokeWidth={2.2} />
                  {b.label}
                </span>
              );
            })}
          </div>
          {footnote && (
            <div style={{
              fontSize: 11, color: C.inkDim, fontStyle: 'italic',
              marginTop: 'auto', paddingTop: 6,
            }}>{footnote}</div>
          )}
        </>
      ) : (
        <ul style={{
          margin: 0, padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {bullets?.map((b, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              fontSize: 12, color: C.inkSoft, lineHeight: 1.45,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: 1,
                background: C.gray400, marginTop: 6, flexShrink: 0,
              }} />
              <span>{b}</span>
            </li>
          ))}
          {highlightedLast && (
            <li style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              fontSize: 12, color: C.orangeDark, fontWeight: 700, lineHeight: 1.45,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: 1,
                background: C.orange, marginTop: 6, flexShrink: 0,
              }} />
              <span>{highlightedLast}</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function ArrowBetween() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 4px',
    }}>
      <ArrowRight size={18} color={C.orange} strokeWidth={2.4} />
    </div>
  );
}

function DestCard({ color, icon: Icon, title, subtitle, subtitle2, bullets }) {
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderRadius: RADIUS.md,
      overflow: 'hidden',
      boxShadow: SHADOW.sm,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header coloré */}
      <div style={{
        background: color,
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Icon size={18} color="#fff" strokeWidth={2.2} fill={color === '#1A1A1A' ? '#fff' : 'none'} />
        <span style={{
          fontSize: 14, fontWeight: 700, color: '#fff',
        }}>{title}</span>
      </div>
      {/* Corps */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{subtitle}</div>
          <div style={{ fontSize: 11, color: C.inkDim, fontStyle: 'italic', marginTop: 2 }}>
            {subtitle2}
          </div>
        </div>
        <ul style={{
          margin: 0, padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {bullets.map((b, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45,
            }}>
              <span style={{
                width: 4, height: 4, borderRadius: 1,
                background: C.gray400, marginTop: 6, flexShrink: 0,
              }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
