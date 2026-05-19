import {
  ShieldAlert, Target, Layers, RefreshCw, HelpCircle,
  Cloud, Box, Server, WifiOff,
  ClipboardList, BedDouble, Unlock, Wallet, ShieldCheck,
  ArrowLeftRight,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// RdModeDegradePage — exploration R&D
// Comment garder les fonctions vitales du PMS opérationnelles quand la
// connexion internet tombe (samedi de pic en camping). Boîtier local +
// stratégie de synchronisation au retour du réseau.
// ============================================

const FEATURES_OFFLINE = [
  { color: C.blue,    icon: ClipboardList, title: 'Arrivées / Départs du jour',
    desc: "Liste consultable et exportable (PDF, impression), même sans connexion. Pré-chargée chaque matin." },
  { color: C.green,   icon: BedDouble,     title: "Plan d'occupation du jour",
    desc: "Visualisation en temps réel de l'occupation : hébergements pris, libres, à nettoyer." },
  { color: C.purple,  icon: Unlock,        title: 'Ouverture portail & portillon',
    desc: "Commande directe du matériel local via le boîtier : aucun aller-retour vers le cloud nécessaire." },
  { color: C.amber,   icon: Wallet,        title: "Encaissement local (file d'attente)",
    desc: "Saisie d'un encaissement, mise en file d'attente locale et envoi au cloud dès retour de la connexion." },
  { color: '#0ea5e9', icon: BedDouble,     title: 'Check-in / Check-out express',
    desc: "Validation d'arrivée et départ avec stockage local de l'événement, sync différée." },
  { color: '#ec4899', icon: ShieldCheck,   title: "Codes d'accès clients",
    desc: "Pré-chargement des codes du jour (digicode, Wi-Fi, badge cashless) pour assistance client immédiate." },
];

const SYNC_STEPS = [
  { num: '1', title: 'Détection du retour réseau',
    desc: 'Le boîtier détecte que la connexion internet est de nouveau stable (ping périodique vers le cloud).' },
  { num: '2', title: 'Lecture du journal local',
    desc: 'Toutes les actions effectuées en mode dégradé ont été enregistrées dans un journal local horodaté (append-only).' },
  { num: '3', title: 'Push vers le cloud',
    desc: 'Le journal est envoyé au cloud NAX7 par ordre chronologique. Chaque événement a un identifiant unique pour éviter les doublons.' },
  { num: '4', title: 'Validation et résolution de conflits',
    desc: "Le cloud applique les événements. En cas de conflit (la même réservation modifiée des deux côtés), une règle de priorité s'applique (dernier écrit gagne, ou alerte opérateur)." },
  { num: '5', title: 'Confirmation et purge',
    desc: "Une fois confirmé par le cloud, le journal local est marqué comme synchronisé. Les données 'fraîches' du cloud redescendent ensuite sur le boîtier." },
];

const OPEN_QUESTIONS = [
  { title: 'Matériel du boîtier',
    desc: 'Mini-PC industriel, Raspberry Pi 5, NUC ? Critères : fiabilité 24/7, mises à jour à distance, coût maîtrisé.' },
  { title: 'Périmètre offline strict vs étendu',
    desc: "Doit-on aussi permettre la création d'une nouvelle réservation hors-ligne ? Quel risque de surbooking ?" },
  { title: 'Durée maximale acceptable en mode dégradé',
    desc: 'Quelques heures ? Une journée entière ? Au-delà, faut-il prévenir le client ou refuser certaines opérations ?' },
  { title: 'Stratégie de résolution des conflits',
    desc: 'Dernier-écrit-gagne simple, ou processus de validation humain pour les conflits sensibles (paiements, statuts) ?' },
  { title: 'Sécurité des commandes physiques',
    desc: "Les commandes portail/portillon depuis le boîtier doivent rester signées et anti-rejeu, même hors-ligne." },
  { title: 'Provisioning et mises à jour à distance',
    desc: 'Comment installer un nouveau boîtier chez un client et appliquer les mises à jour sans intervention sur place ?' },
];

export function RdModeDegradePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web · R&D"
        icon={ShieldAlert}
        sub="Garder le PMS opérationnel quand le wifi tombe"
      >R&D mode dégradé</SectionTitle>

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
          NAX7 Full Web est un PMS <b>SaaS cloud</b> : il a besoin d'internet pour
          fonctionner. Or les <b>samedis d'arrivées en camping</b> (pic d'activité)
          sont souvent les jours où la connexion tombe.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Objectif : un <b>boîtier local</b> qui prend le relais des fonctions
          vitales tant que la connexion est coupée, et qui se <b>synchronise
          automatiquement</b> au retour du réseau. Zéro saisie perdue, continuité
          de service.
        </div>
      </Card>

      {/* ===== ARCHITECTURE ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Architecture proposée" sub="Cloud ↔ Boîtier local ↔ Postes terrain" />
        <div style={{ padding: '24px 20px' }}>
          <ArchitectureSchema />
        </div>
      </Card>

      {/* ===== FONCTIONS OFFLINE ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={WifiOff} title="Fonctions disponibles en mode dégradé" sub="Sans connexion internet" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {FEATURES_OFFLINE.map((f, i) => <FeatureCard key={i} feature={f} />)}
        </div>
      </Card>

      {/* ===== SYNC ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={RefreshCw} title="Synchronisation au retour du réseau" sub="Étape par étape" />
        <div style={{ padding: '20px 24px' }}>
          {SYNC_STEPS.map((s, i) => (
            <SyncStep key={s.num} step={s} last={i === SYNC_STEPS.length - 1} />
          ))}
        </div>
      </Card>

      {/* ===== R&D OUVERT ===== */}
      <Card padding={20} style={{
        borderLeft: `3px solid ${C.gray400}`,
        background: C.bgSoft,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <HelpCircle size={15} color={C.gray500} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.gray500, fontWeight: 700,
          }}>Points ouverts R&D</div>
        </div>
        <div style={{ fontSize: 12, color: C.inkDim, marginBottom: 14, lineHeight: 1.5 }}>
          Questions à trancher avant industrialisation. Chaque réponse a un impact
          fort sur le coût, la complexité technique et l'expérience utilisateur.
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 10,
        }}>
          {OPEN_QUESTIONS.map((q, i) => (
            <div key={i} style={{
              padding: '10px 12px',
              background: C.paper,
              border: `1px solid ${C.line}`,
              borderRadius: RADIUS.sm,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
                {q.title}
              </div>
              <div style={{ fontSize: 11.5, color: C.inkDim, lineHeight: 1.5 }}>
                {q.desc}
              </div>
            </div>
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

// Schéma simple en 3 colonnes : Cloud ↔ Boîtier ↔ Postes
function ArchitectureSchema() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 36px 1fr 36px 1fr',
      gap: 8, alignItems: 'stretch',
    }}>
      <SchemaNode
        color={C.blue}
        icon={Cloud}
        title="NAX7 Cloud"
        subtitle="Source de vérité"
        bullets={[
          'Réservations, clients, finances',
          'Catalogues et règles tarifaires',
          'Reporting consolidé',
        ]}
      />
      <FlowArrow label="Sync" />
      <SchemaNode
        color={C.orange}
        icon={Box}
        title="Boîtier local"
        subtitle="Dans l'établissement"
        bullets={[
          'Cache des données du jour',
          'Journal des actions hors-ligne',
          'API locale pour les postes',
          'Commande directe portail / portillon',
        ]}
        highlight
      />
      <FlowArrow label="LAN" />
      <SchemaNode
        color={C.purple}
        icon={Server}
        title="Postes terrain"
        subtitle="Réception, mobile, tablettes"
        bullets={[
          'Connectés en LAN / Wi-Fi interne',
          'Utilisent le boîtier en transparence',
          "Indicateur visuel 'mode dégradé'",
        ]}
      />
    </div>
  );
}

function SchemaNode({ color, icon: Icon, title, subtitle, bullets, highlight }) {
  return (
    <div style={{
      background: highlight ? color + '08' : C.paper,
      border: `1px solid ${highlight ? color : C.line}`,
      borderTop: `3px solid ${color}`,
      borderRadius: RADIUS.md,
      padding: '14px 14px 12px',
      boxShadow: highlight ? SHADOW.sm : 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: RADIUS.sm,
          background: color + '18',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 10.5, color: C.inkDim, marginTop: 2 }}>{subtitle}</div>
        </div>
      </div>
      <ul style={{
        margin: 0, padding: 0, listStyle: 'none',
        display: 'flex', flexDirection: 'column', gap: 3,
      }}>
        {bullets.map((b, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
            fontSize: 11.5, color: C.inkSoft, lineHeight: 1.4,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: 1,
              background: color, marginTop: 6, flexShrink: 0,
            }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlowArrow({ label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 4,
    }}>
      <ArrowLeftRight size={18} color={C.orange} strokeWidth={2.2} />
      {label && (
        <span style={{
          fontSize: 9, fontWeight: 700, color: C.inkDim,
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>{label}</span>
      )}
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

function SyncStep({ step, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1fr', gap: 14,
      paddingBottom: last ? 0 : 16,
    }}>
      <div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: C.orange, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
          boxShadow: SHADOW.sm,
        }}>{step.num}</div>
        {!last && (
          <div style={{
            width: 2, height: 'calc(100% - 14px)',
            background: C.gray200,
            marginLeft: 15, marginTop: 2,
          }} />
        )}
      </div>
      <div style={{ paddingTop: 4 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 3,
        }}>{step.title}</div>
        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>
          {step.desc}
        </div>
      </div>
    </div>
  );
}

