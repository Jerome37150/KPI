import {
  ClipboardList, Target, Users, Rocket,
  Smartphone, UserCheck, Sparkles, Wrench,
} from 'lucide-react';
import { openMobilePreview } from '../utils/openPreview';

const PROTOTYPE_URL = 'https://nax7-light.vercel.app/';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// CahierDesChargesNax7LightPage — vision NAX7 Light
// PMS mobile multi-poste · 4 profils utilisateurs · livraison fin 2028 FR+ES.
// ============================================

const PROFILS = [
  { key: 'DIRECTION', color: C.blue, icon: UserCheck,
    title: 'Direction en déplacement',
    desc: 'Validation des réservations à distance, supervision et arbitrages depuis le mobile, en dehors du bureau.' },
  { key: 'RECEPTION', color: C.green, icon: Smartphone,
    title: 'Réception mobile · fast check-in/out',
    desc: "Check-in et check-out express depuis un terminal mobile, hors comptoir : accueil sur le parking, en chambre, en file d'attente." },
  { key: 'MENAGE', color: C.purple, icon: Sparkles,
    title: 'Équipe ménage',
    desc: "Suivi en temps réel de l'avancement des ménages, mise à jour de l'état des hébergements et signalement des anomalies." },
  { key: 'TECHNIQUE', color: C.amber, icon: Wrench,
    title: 'Équipe technique',
    desc: 'Suivi et avancement des interventions techniques sur demande client, traçabilité des actions et clôture mobile.' },
];

const VAGUES = [
  {
    label: 'V1',
    period: 'Fin 2028',
    color: C.orange,
    scope: "Version complète mobile en français et en espagnol, couvrant les 4 profils utilisateurs (direction, réception, ménage, technique).",
  },
];

export function CahierDesChargesNax7LightPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Nax7 light"
        icon={ClipboardList}
        sub="Vision, profils utilisateurs et rétro-planning de livraison"
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
            onClick={() => openMobilePreview(PROTOTYPE_URL)}
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
            title="Ouvrir le prototype dans une fenêtre au format mobile (420×900)"
          >
            <Smartphone size={13} strokeWidth={2.4} />
            Voir le prototype
          </button>
        </div>
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, marginBottom: 12 }}>
          <b>NAX7 Light</b> — la <b>version mobile du PMS</b>, conçue pour les usages
          terrain et le multi-poste : utilisable partout dans l'établissement, en
          dehors du comptoir, et sur le terrain.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Pensé pour le terrain : fonctionne en <b>Wi-Fi</b> comme en <b>4G</b>,
          idéal pour les campings et établissements où certaines zones n'ont pas
          de couverture Wi-Fi stable.
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
        }}>
          <Pill label="PMS mobile" color={C.orange} />
          <Pill label="4 profils utilisateurs" color={C.blue} />
          <Pill label="Livraison fin 2028" color={C.green} sub="FR · ES" />
        </div>
      </Card>

      {/* ===== 4 PROFILS ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Users} title="Profils utilisateurs · 4 cas d'usage terrain" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {PROFILS.map(p => <ProfilCard key={p.key} profil={p} />)}
        </div>
      </Card>

      {/* ===== RÉTRO-PLANNING ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Rocket} title="Rétro-planning de livraison" sub="Version complète bilingue" />
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

function ProfilCard({ profil }) {
  const Icon = profil.icon;
  return (
    <div style={{
      padding: '14px 16px',
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${profil.color}`,
      borderRadius: RADIUS.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: RADIUS.sm,
          background: profil.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={14} color={profil.color} strokeWidth={2.4} />}
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: C.ink, letterSpacing: '0.01em',
        }}>{profil.title}</div>
      </div>
      <div style={{ fontSize: 11.5, color: C.inkDim, lineHeight: 1.5 }}>
        {profil.desc}
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
