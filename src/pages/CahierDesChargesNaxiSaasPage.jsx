import {
  ClipboardList, Target, Layers, Rocket,
  Home, User, BedDouble, FileText, Mail, ShoppingCart, Calendar,
  ExternalLink,
} from 'lucide-react';
import { openDesktopPreview } from '../utils/openPreview';

const PROTOTYPE_URL = 'https://naxigestionfront-prepa.vercel.app/';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// CahierDesChargesNaxiSaasPage — synthèse du cahier des charges Naxi Saas
// Miroir de la page Notion : objectifs, 7 blocs, 3 vagues de livraison.
// ============================================

const BLOCS = [
  { key: 'HOME',                color: '#64748b', icon: Home,
    title: 'HOME',
    desc: 'Dashboard, menu burger, page de connexion, alertes, to-do' },
  { key: 'FICHE CLIENT',        color: '#3b82f6', icon: User,
    title: 'FICHE CLIENT',
    desc: 'Recherche client, fiche détaillée, fidélité (FID), CRM, participants' },
  { key: 'FICHE SEJOUR',        color: '#10b981', icon: BedDouble,
    title: 'FICHE SEJOUR',
    desc: "Réservation, check-in/out, paiements, cautions, suppléments, animaux/véhicules, cashless, scan PI, modif/annulation" },
  { key: 'PRE-RESERVATION',     color: '#ec4899', icon: FileText,
    title: 'PRE-RESERVATION (Devis)',
    desc: "Création / édition devis, calculs détaillés, prolongation, gestion, conversion en réservation" },
  { key: 'GESTION MAILS',       color: '#8b5cf6', icon: Mail,
    title: 'GESTION MAILS',
    desc: "Templates, envois automatiques, pièces jointes, traitement auto" },
  { key: 'VENTES HORS SEJOUR',  color: '#f59e0b', icon: ShoppingCart,
    title: 'VENTES HORS SEJOUR',
    desc: 'POS, ventes ponctuelles, ventes réception' },
  { key: 'PLANNING',            color: '#dc2626', icon: Calendar,
    title: 'PLANNING',
    desc: "Occupation, recherche disponibilités, indispo, planning supplémentaire numéroté" },
];

const VAGUES = [
  {
    label: 'V1',
    period: 'Octobre 2026',
    color: C.orange,
    blocs: ['HOME'],
    scope: 'Bloc HOME + fenêtres rattachées (Dashboard, login, menu burger, alertes, to-do)',
  },
  {
    label: 'V2',
    period: 'Janvier 2027',
    color: C.blue,
    blocs: ['FICHE CLIENT', 'FICHE SEJOUR'],
    scope: 'Bloc FICHE CLIENT + Bloc FICHE SEJOUR (réservation, check-in/out, paiements, cautions, suppléments)',
  },
  {
    label: 'V3',
    period: 'Mars 2027',
    color: C.purple,
    blocs: ['PRE-RESERVATION', 'VENTES HORS SEJOUR', 'GESTION MAILS'],
    scope: 'Bloc DEVIS + Bloc VENTES HORS SEJOUR + Bloc GESTION MAILS (cycle commercial + outils relationnels)',
  },
];

export function CahierDesChargesNaxiSaasPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Naxi.G Full Saas"
        icon={ClipboardList}
        sub="Objectifs, périmètre fonctionnel et rétro-planning de livraison"
      >Cahier des charges</SectionTitle>

      {/* Objectifs */}
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
            }}>Objectifs</div>
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
          <b>Refonte technique, UX et design</b> complète des fenêtres métiers de Naxi Gestion,
          pour offrir une expérience moderne, fluide et efficace aux équipes terrain.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Périmètre : <b>50 à 60 fenêtres</b> opérationnelles couvrant les usages quotidiens des saisonniers
          (réception, check-in/out, gestion séjour, paiements, devis, mails). Architecture revue,
          parcours utilisateur repensés et design system aligné sur les standards actuels.
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
        }}>
          <Pill label="57 fenêtres" color={C.orange} />
          <Pill label="7 blocs métier" color={C.blue} />
          <Pill label="3 vagues de livraison" color={C.green} />
        </div>
      </Card>

      {/* 7 blocs métier */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Périmètre fonctionnel · 7 blocs métier" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {BLOCS.map(b => <BlocCard key={b.key} bloc={b} />)}
        </div>
      </Card>

      {/* Rétro-planning de livraison */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Rocket} title="Rétro-planning de livraison" sub="Trois vagues itératives" />
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

function BlocCard({ bloc }) {
  const Icon = bloc.icon;
  return (
    <div style={{
      padding: '14px 16px',
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${bloc.color}`,
      borderRadius: RADIUS.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: RADIUS.sm,
          background: bloc.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={14} color={bloc.color} strokeWidth={2.4} />}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 700, color: C.ink, letterSpacing: '0.02em',
        }}>{bloc.title}</div>
      </div>
      <div style={{ fontSize: 11.5, color: C.inkDim, lineHeight: 1.5 }}>
        {bloc.desc}
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
          {vague.blocs.map(b => {
            const bloc = BLOCS.find(x => x.key === b);
            if (!bloc) return null;
            const Icon = bloc.icon;
            return (
              <span key={b} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: RADIUS.sm,
                background: bloc.color + '15', color: bloc.color,
                border: `1px solid ${bloc.color}40`,
                fontSize: 10.5, fontWeight: 700,
              }}>
                {Icon && <Icon size={10} strokeWidth={2.4} />}
                {bloc.title}
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
