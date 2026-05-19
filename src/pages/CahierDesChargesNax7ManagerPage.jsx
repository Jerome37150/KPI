import {
  ClipboardList, Target, Layers, Rocket,
  FileSpreadsheet, SlidersHorizontal, Bell, TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { openDesktopPreview } from '../utils/openPreview';

// ============================================
// CahierDesChargesNax7ManagerPage — vision NAX7 Manager
// Module groupe · 4 fonctionnalités · livraison début 2029.
// ============================================

const PROTOTYPE_URL = 'https://nax7-manager.vercel.app/';

const FEATURES = [
  { key: 'COMPTA',  color: C.blue,    icon: FileSpreadsheet,
    title: 'Extractions comptables consolidées',
    desc: 'Export multi-établissements regroupé en un seul jeu de données, prêt pour la consolidation comptable du groupe.' },
  { key: 'PARAM',   color: C.purple,  icon: SlidersHorizontal,
    title: 'Paramétrages groupes',
    desc: 'Pilotage centralisé des paramètres communs (catalogues, taxes, règles tarifaires) avec propagation aux établissements rattachés.' },
  { key: 'ALERTES', color: C.amber,   icon: Bell,
    title: 'Suivi des alertes',
    desc: "Tableau de bord d'alertes opérationnelles et financières remontées en temps réel depuis chaque établissement du groupe." },
  { key: 'YIELD',   color: C.green,   icon: TrendingUp,
    title: 'Offres & yield groupes',
    desc: 'Conception et pilotage des offres commerciales et stratégies de yield management à l\'échelle du groupe.' },
];

const VAGUES = [
  {
    label: 'V1',
    period: 'Début 2029',
    color: C.orange,
    scope: "Première version du module Manager, couvrant les 4 piliers fonctionnels : compta consolidée, paramétrage groupe, alertes et yield.",
  },
];

export function CahierDesChargesNax7ManagerPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Nax7 Manager"
        icon={ClipboardList}
        sub="Vision, fonctionnalités groupes et rétro-planning de livraison"
      >Cahier des charges</SectionTitle>

      {/* ===== VISION ===== */}
      <Card padding={24} style={{
        background: `linear-gradient(135deg, ${C.paper} 0%, ${C.paper} 60%, ${C.orangeFaint} 100%)`,
        borderLeft: `3px solid ${C.orange}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 14, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={15} color={C.orange} strokeWidth={2.2} />
            <div style={{
              fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: C.orange, fontWeight: 700,
            }}>Vision produit</div>
          </div>
          <button
            type="button"
            onClick={() => openDesktopPreview(PROTOTYPE_URL)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: RADIUS.md,
              background: C.orange, color: '#fff',
              border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
              fontFamily: 'inherit',
              boxShadow: SHADOW.orange,
              transition: 'background 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.orangeHover; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.orange; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            title="Ouvrir le prototype dans une fenêtre en surimpression"
          >
            <ExternalLink size={13} strokeWidth={2.4} />
            Voir le prototype
          </button>
        </div>
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, marginBottom: 12 }}>
          <b>NAX7 Manager</b> — un module pensé et conçu pour les <b>groupes</b> :
          consolidation, pilotage et orchestration de plusieurs établissements
          depuis un seul outil.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Adressé aux directions de groupes hôteliers, chaînes et portefeuilles
          d'établissements qui ont besoin d'une vue consolidée et d'un pilotage
          centralisé.
        </div>
      </Card>

      {/* ===== 4 FONCTIONNALITÉS ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Fonctionnalités clés · 4 piliers groupe" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {FEATURES.map(f => <FeatureCard key={f.key} feature={f} />)}
        </div>
      </Card>

      {/* ===== RÉTRO-PLANNING ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Rocket} title="Rétro-planning de livraison" />
        <div style={{ padding: '20px 24px' }}>
          {VAGUES.map((v, i) => (
            <VagueStep key={v.label} vague={v} last={i === VAGUES.length - 1} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function CardHeader({ icon: Icon, title, sub }) {
  return (
    <div style={{
      padding: '16px 20px', borderBottom: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {Icon && <Icon size={13} color={C.orange} strokeWidth={2.2} />}
      <div>
        <div style={{
          fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: C.orange, fontWeight: 700,
        }}>{title}</div>
        {sub && <div style={{ fontSize: 11, color: C.inkDim, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <div style={{
      padding: '14px 16px',
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${feature.color}`,
      borderRadius: RADIUS.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: RADIUS.sm,
          background: feature.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={14} color={feature.color} strokeWidth={2.4} />}
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: C.ink, letterSpacing: '0.01em',
        }}>{feature.title}</div>
      </div>
      <div style={{ fontSize: 11.5, color: C.inkDim, lineHeight: 1.5 }}>
        {feature.desc}
      </div>
    </div>
  );
}

function VagueStep({ vague, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '60px 1fr', gap: 14,
      paddingBottom: last ? 0 : 18,
    }}>
      <div>
        <div style={{
          width: 50, height: 50, borderRadius: '50%',
          background: vague.color, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700,
          boxShadow: SHADOW.card,
        }}>{vague.label}</div>
        {!last && (
          <div style={{
            width: 2, height: 'calc(100% - 22px)',
            background: C.gray200,
            marginLeft: 24, marginTop: 4,
          }} />
        )}
      </div>
      <div style={{ paddingTop: 4 }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px', borderRadius: RADIUS.sm,
          background: vague.color + '15', color: vague.color,
          border: `1px solid ${vague.color}40`,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
          marginBottom: 8,
        }}>{vague.period}</div>
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
          {vague.scope}
        </div>
      </div>
    </div>
  );
}

