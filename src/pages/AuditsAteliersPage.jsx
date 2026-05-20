import {
  ShieldCheck, Target, Layers, Users,
  Lock, BadgeCheck, Scale,
  Briefcase, Building2, Smile,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// AuditsAteliersPage — validation continue du projet NAX7 Full Web
// 3 audits externes (sécurité, norme, RGPD) + ateliers de réflexion par
// profil (direction, groupes, réception) menés tout au long du projet.
// ============================================

const AUDITS = [
  { color: C.red,    icon: Lock,
    title: 'Audit sécuritaire',
    pres: 'Prestataire externe',
    desc: "Tests d'intrusion, revue de l'architecture, des dépendances et des flux. Identification des failles potentielles avant la mise en production." },
  { color: C.blue,   icon: BadgeCheck,
    title: 'Audit Norme',
    pres: 'Prestataire externe',
    desc: "Conformité aux normes du marché (NF 525 pour les caisses, exigences fiscales et comptables). Délivrance des attestations nécessaires à la commercialisation." },
  { color: C.green,  icon: Scale,
    title: 'Audit RGPD',
    pres: 'Interne / prestataire',
    desc: "Revue de la collecte, du stockage et du traitement des données personnelles. Conformité aux droits des personnes et à la doctrine européenne." },
];

const ATELIERS = [
  { color: C.gray700, icon: Briefcase,
    title: 'Directeurs',
    desc: 'Vision stratégique, pilotage opérationnel, indicateurs et reporting. Validation des choix structurants et arbitrages produit.' },
  { color: C.purple, icon: Building2,
    title: 'Groupes',
    desc: "Pilotage multi-établissements, consolidation, paramétrage descendant. Vérification des besoins spécifiques aux chaînes et portefeuilles." },
  { color: C.amber,  icon: Smile,
    title: 'Réceptionnistes',
    desc: "Usages quotidiens du terrain : check-in / check-out, encaissements, gestion des imprévus. Recueil des frictions concrètes pour ajuster l'UX." },
];

export function AuditsAteliersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web"
        icon={ShieldCheck}
        sub="Audits externes et ateliers métier tout au long du projet"
      >Audits &amp; ateliers</SectionTitle>

      {/* ===== INTENTION ===== */}
      <Card padding={24} style={{
        background: `linear-gradient(135deg, ${C.paper} 0%, ${C.paper} 60%, ${C.orangeFaint} 100%)`,
        borderLeft: `3px solid ${C.orange}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Target size={15} color={C.orange} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.orange, fontWeight: 700,
          }}>Intention</div>
        </div>
        <div style={{ fontSize: 14, color: C.ink, lineHeight: 1.55, marginBottom: 12 }}>
          Tout au long du projet NAX7 Full Web, deux dispositifs de validation
          continue : des <b>audits externes</b> pour la conformité technique et
          réglementaire, et des <b>ateliers de réflexion métier</b> pour
          challenger les fonctions et les usages.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Les audits sécurisent la mise sur le marché ; les ateliers garantissent
          que le produit livré correspond aux réalités terrain de nos clients.
        </div>
      </Card>

      {/* ===== AUDITS EXTERNES ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={ShieldCheck} title="Audits externes" sub="Conformité technique et réglementaire" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12,
        }}>
          {AUDITS.map((a, i) => <AuditCard key={i} audit={a} />)}
        </div>
      </Card>

      {/* ===== ATELIERS PAR PROFIL ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader
          icon={Users}
          title="Ateliers de réflexion métier"
          sub="Module par module, recueil des remarques et avis"
        />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12,
        }}>
          {ATELIERS.map((a, i) => <AtelierCard key={i} atelier={a} />)}
        </div>
        <div style={{
          padding: '12px 20px 18px',
          fontSize: 11.5, color: C.inkDim, fontStyle: 'italic',
        }}>
          Les ateliers sont organisés <b>par module fonctionnel</b> (réservation,
          séjour, encaissement, planning…) avec chaque profil successivement,
          pour confronter les visions et identifier les écarts d'usage.
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

function AuditCard({ audit }) {
  const Icon = audit.icon;
  return (
    <div style={{
      padding: '16px 18px',
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${audit.color}`,
      borderRadius: RADIUS.md,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: RADIUS.sm,
          background: audit.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={audit.color} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{
            fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.15,
          }}>{audit.title}</div>
          <div style={{
            fontSize: 10.5, fontWeight: 600, color: audit.color,
            letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2,
          }}>{audit.pres}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.inkDim, lineHeight: 1.55 }}>
        {audit.desc}
      </div>
    </div>
  );
}

function AtelierCard({ atelier }) {
  const Icon = atelier.icon;
  return (
    <div style={{
      padding: '16px 18px',
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderTop: `3px solid ${atelier.color}`,
      borderRadius: RADIUS.md,
      boxShadow: SHADOW.sm,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: atelier.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={atelier.color} strokeWidth={2.2} />
        </div>
        <div style={{
          fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em',
        }}>{atelier.title}</div>
      </div>
      <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>
        {atelier.desc}
      </div>
    </div>
  );
}
