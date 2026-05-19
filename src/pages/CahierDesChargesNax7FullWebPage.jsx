import {
  ClipboardList, Target, Layers, Rocket,
  Zap, RefreshCw, ShieldAlert, Sparkles, Puzzle, Users, Plug,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// CahierDesChargesNax7FullWebPage — vision NAX7 Full Web
// Objectifs · 7 innovations clés · rétro-planning de livraison (V1 fin 2027,
// V2 fin 2028 français + espagnol).
// ============================================

const FEATURES = [
  { key: 'FULL-WEB',  color: '#e55010', icon: Zap,
    title: 'PMS nouvelle génération',
    desc: 'Application 100 % web, plus rapide et plus fluide, accessible depuis tout poste sans installation locale.' },
  { key: 'CRS-SYNC',  color: '#3b82f6', icon: RefreshCw,
    title: 'Connexion native CRS',
    desc: 'Synchronisation parfaite avec le CRS : fini la double saisie, calculs de prix strictement identiques entre les deux outils.' },
  { key: 'DEGRADED',  color: '#10b981', icon: ShieldAlert,
    title: 'Mode dégradé intégré',
    desc: "Coupure réseau : export immédiat de la situation et accès aux fonctions primaires pour continuer à servir les clients sans interruption." },
  { key: 'AI',        color: '#8b5cf6', icon: Sparkles,
    title: 'IA intégrée',
    desc: 'Optimisation automatique des plannings (occupation, attributions, scénarios) grâce à un moteur IA embarqué.' },
  { key: 'MODULAR',   color: '#ec4899', icon: Puzzle,
    title: 'Logiciel modulable',
    desc: 'Activation à la carte des modules : chaque établissement compose son outil selon ses besoins et son équipement.' },
  { key: 'PORTAIL',   color: '#f59e0b', icon: Users,
    title: 'Portail client & résident',
    desc: 'Espace intégré pour les clients et résidents : réservations, séjour, paiements, communications, documents.' },
  { key: 'API-STORE', color: '#dc2626', icon: Plug,
    title: 'API Store',
    desc: 'Catalogue intégré pour connecter facilement les partenaires (channel managers, OTA, services tiers) sans dev custom.' },
];

const VAGUES = [
  {
    label: 'V1',
    period: 'Fin 2027',
    color: C.orange,
    scope: 'Version réduite — périmètre core du PMS sur les fonctions opérationnelles essentielles (réservations, séjour, encaissements, plannings).',
    features: ['FULL-WEB', 'CRS-SYNC', 'DEGRADED', 'MODULAR'],
  },
  {
    label: 'V2',
    period: 'Fin 2028',
    color: C.blue,
    scope: "Version complète couvrant l'ensemble du périmètre fonctionnel, disponible en français et en espagnol.",
    features: ['AI', 'PORTAIL', 'API-STORE'],
  },
];

export function CahierDesChargesNax7FullWebPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 Full Web"
        icon={ClipboardList}
        sub="Vision, innovations clés et rétro-planning de livraison"
      >Cahier des charges</SectionTitle>

      {/* ===== OBJECTIFS / VISION ===== */}
      <Card padding={24} style={{
        background: `linear-gradient(135deg, ${C.paper} 0%, ${C.paper} 60%, ${C.orangeFaint} 100%)`,
        borderLeft: `3px solid ${C.orange}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Target size={15} color={C.orange} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.orange, fontWeight: 700,
          }}>Vision produit</div>
        </div>
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, marginBottom: 12 }}>
          <b>NAX7 Full Web</b> — un PMS de nouvelle génération conçu nativement pour le web :
          performance, fluidité, intégration parfaite avec le CRS, intelligence embarquée
          et ouverture sur l'écosystème partenaire.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Une refonte complète qui mise sur la <b>modularité</b>, la <b>résilience</b> (mode dégradé),
          l'<b>automatisation</b> (IA) et l'<b>ouverture</b> (API Store) pour répondre aux usages
          actuels et futurs des établissements.
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
        }}>
          <Pill label="PMS 100 % web"        color={C.orange} />
          <Pill label="7 innovations clés"   color={C.blue} />
          <Pill label="2 vagues de livraison" color={C.green} sub="2027 · 2028" />
        </div>
      </Card>

      {/* ===== 7 INNOVATIONS ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Innovations clés · 7 leviers de différenciation" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {FEATURES.map(f => <FeatureCard key={f.key} feature={f} />)}
        </div>
      </Card>

      {/* ===== RÉTRO-PLANNING ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Rocket} title="Rétro-planning de livraison" sub="Deux vagues itératives" />
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
      {/* Pastille + ligne */}
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
      {/* Contenu */}
      <div style={{ paddingTop: 4 }}>
        <div style={{
          display: 'inline-block',
          padding: '4px 12px', borderRadius: RADIUS.sm,
          background: vague.color + '15', color: vague.color,
          border: `1px solid ${vague.color}40`,
          fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
          marginBottom: 8,
        }}>{vague.period}</div>
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.55, marginBottom: 8 }}>
          {vague.scope}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {vague.features.map(fk => {
            const f = FEATURES.find(x => x.key === fk);
            if (!f) return null;
            const Icon = f.icon;
            return (
              <span key={fk} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: RADIUS.sm,
                background: f.color + '15', color: f.color,
                border: `1px solid ${f.color}40`,
                fontSize: 10.5, fontWeight: 700,
              }}>
                {Icon && <Icon size={10} strokeWidth={2.4} />}
                {f.title}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Pill({ label, color, sub }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: RADIUS.md,
      background: color + '15', color,
      border: `1px solid ${color}40`,
      fontSize: 11.5, fontWeight: 700,
    }}>
      {label}
      {sub && <span style={{ color: C.inkDim, fontWeight: 500, fontSize: 10.5 }}>· {sub}</span>}
    </span>
  );
}
