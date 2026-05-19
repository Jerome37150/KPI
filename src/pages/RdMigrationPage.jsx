import {
  Database, Target, Layers, RefreshCw, HelpCircle, Archive,
  Settings, MapPin, BedDouble, ShoppingCart, FileSpreadsheet,
  CheckCircle, AlertCircle, XCircle, Lock, ArrowRight,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// RdMigrationPage — exploration R&D
// Migration Naxi Gestion (Office / Full SaaS) → NAX7 Full Web.
// Principe : vécu comme une simple mise à jour, transparent pour les clients.
// ============================================

// 5 jeux de données migrés automatiquement (avec confiance forte)
const AUTO_MIGRATED = [
  { color: C.blue,    icon: Settings,        title: 'Paramétrages',
    desc: 'Règles TVA, taxes de séjour, règles enfants/adultes, politiques d\'annulation, canaux, modes de paiement.' },
  { color: C.green,   icon: MapPin,          title: 'Emplacements & hébergements',
    desc: 'Catalogue complet : descriptifs, capacités, équipements, photos, tarifs grille, allotements actifs.' },
  { color: C.purple,  icon: BedDouble,       title: 'Réservations en cours',
    desc: 'Séjours futurs et présents : clients, dates, prix figés, acomptes encaissés, statut de paiement.' },
  { color: C.amber,   icon: ShoppingCart,    title: 'Ventes en cours',
    desc: 'Devis non transformés, options posées, paniers POS ouverts, contrats TO en cours de validité.' },
  { color: '#0ea5e9', icon: FileSpreadsheet, title: 'Plan comptable',
    desc: 'Mapping de l\'ancien plan comptable vers la structure NAX7 standard. Conservation des codes journal et des analytiques.' },
];

// Matrice des 3 catégories de données
const CATEGORIES = [
  {
    key: 'AUTO', color: C.green, icon: CheckCircle,
    title: 'Migré automatiquement',
    subtitle: 'Transparent pour le client',
    items: [
      'Paramétrages standards (TVA, taxes, règles métier)',
      'Catalogue emplacements & hébergements',
      'Réservations et séjours en cours',
      'Devis, options, ventes en cours',
      "Comptes clients et historique d'achats récents",
      'Plan comptable avec mapping NAX7',
    ],
  },
  {
    key: 'MANUAL', color: C.amber, icon: AlertCircle,
    title: 'Ressaisie nécessaire',
    subtitle: 'Configuration différente NAX7',
    items: [
      'Templates emails personnalisés (nouvelle syntaxe)',
      'Comptes utilisateurs & droits (mot de passe à régénérer)',
      'Connecteurs externes (PSP, channel manager, OTA, compta)',
      'Rapports / extractions sur-mesure',
      'Workflows custom non standard NAX7',
      "Paramètres très spécifiques à l'établissement",
    ],
  },
  {
    key: 'LOST', color: C.red, icon: XCircle,
    title: 'Non migré',
    subtitle: 'Conservé en consultation seule',
    items: [
      'Saisons passées clôturées (gardées sur Naxi office)',
      'Tickets POS et factures déjà émises (historique)',
      'Logs et audit trail antérieurs à la bascule',
      'Paramètres obsolètes (absents de NAX7)',
      'Statistiques agrégées custom (à régénérer)',
      'Données techniques internes (caches, sessions)',
    ],
  },
];

// Questions R&D à trancher
const OPEN_QUESTIONS = [
  { title: 'Transparence pour le client final',
    desc: 'Comment garantir que le saisonnier ne ressente pas la bascule (URL, login, ergonomie) ? Communication a minima ou silencieuse ?' },
  { title: 'Bascule big-bang vs progressive',
    desc: 'Migration en une nuit, ou cohabitation des deux systèmes pendant quelques jours avec sync bidirectionnelle ?' },
  { title: 'Politique de rollback',
    desc: 'Si la migration échoue ou pose problème, peut-on revenir à Naxi en gardant les saisies faites sur NAX7 entre temps ?' },
  { title: 'Migration des contrats TO long terme',
    desc: 'Les allotements signés pour 1-2 ans : on les migre tels quels, ou on les re-saisit dans la nouvelle structure NAX7 ?' },
  { title: 'Communication des partenaires externes',
    desc: 'Channel manager, OTAs, PSP : qui prévient ? Avec quel délai ? Risque de double-réservation pendant la bascule.' },
  { title: 'Durée de conservation Naxi historique',
    desc: 'Combien de temps maintient-on Naxi Gestion office actif en lecture seule ? 1 saison, 3 ans, indéfiniment ?' },
  { title: 'Outil de migration',
    desc: "Développement interne sur-mesure, ou framework ETL générique (avec règles paramétrables par typologie de client) ?" },
  { title: 'Tests de non-régression',
    desc: 'Comment certifier automatiquement que les calculs sont identiques avant/après bascule (prix, taxes, taux occupation) ?' },
];

export function RdMigrationPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web · R&D"
        icon={Database}
        sub="Bascule Naxi Gestion → NAX7 Full Web · vécue comme une mise à jour"
      >R&D migration</SectionTitle>

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
          La bascule de <b>Naxi Gestion</b> (Office local ou Full SaaS) vers
          <b> NAX7 Full Web</b> est un sujet sensible pour nos clients. Notre
          ambition : qu'ils le vivent comme une <b>simple mise à jour</b>.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Migration automatique des paramétrages, emplacements, réservations et
          ventes en cours, plan comptable. Cadrage précis de ce qui peut être
          migré, ressaisi ou conservé en consultation. <b>Historique des
          saisons passées</b> préservé sur un Naxi office local accessible
          à tout moment.
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
        }}>
          <Pill label="Vécu comme une mise à jour" color={C.orange} />
          <Pill label="Migration automatique" color={C.blue} />
          <Pill label="Historique préservé" color={C.green} />
          <Pill label="R&D" color={C.gray500} sub="exploratoire" />
        </div>
      </Card>

      {/* ===== ARCHITECTURE DE BASCULE ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Architecture de bascule" sub="Source → outil de migration → cible · historique préservé" />
        <div style={{ padding: '24px 20px' }}>
          <MigrationSchema />
        </div>
      </Card>

      {/* ===== 5 JEUX DE DONNÉES MIGRÉS AUTO ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={RefreshCw} title="Données migrées automatiquement" sub="5 jeux de données critiques" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {AUTO_MIGRATED.map((d, i) => <DataCard key={i} data={d} />)}
        </div>
      </Card>

      {/* ===== MATRICE 3 CATÉGORIES ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Que devient chaque type de donnée ?" sub="3 catégories de traitement" />
        <div style={{
          padding: 20,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {CATEGORIES.map(cat => <CategoryColumn key={cat.key} cat={cat} />)}
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
          Questions à trancher avant d'industrialiser le processus.
          Chaque réponse a un impact fort sur la perception client, la complexité
          technique et le coût d'accompagnement.
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

// Schéma : Naxi (source) → Pont migration → NAX7 (cible) + Naxi historique conservé
function MigrationSchema() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Ligne principale : Source → Pont → Cible */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 36px 1fr 36px 1fr',
        gap: 8, alignItems: 'stretch',
      }}>
        <SchemaNode
          color={C.gray500}
          icon={Database}
          title="Naxi Gestion"
          subtitle="Office local ou Full SaaS"
          bullets={[
            'État du système avant bascule',
            'Données opérationnelles complètes',
            'Snapshot à la date de bascule',
          ]}
        />
        <FlowArrow label="Migration" />
        <SchemaNode
          color={C.orange}
          icon={RefreshCw}
          title="Outil de migration"
          subtitle="Mapping & transformation"
          bullets={[
            'Règles de transformation par typologie',
            'Validation, contrôles de cohérence',
            'Dry-run avant bascule réelle',
            "Rapport d'écarts détaillé",
          ]}
          highlight
        />
        <FlowArrow label="Charge" />
        <SchemaNode
          color={C.blue}
          icon={Database}
          title="NAX7 Full Web"
          subtitle="Nouvelle cible cloud"
          bullets={[
            'Reçoit les données migrées',
            'Reconnexion des partenaires externes',
            'Vie normale dès J+0',
          ]}
        />
      </div>

      {/* Ligne secondaire : Naxi historique conservé */}
      <div style={{
        background: '#eff6ff',
        border: `1px dashed ${C.blue}`,
        borderRadius: RADIUS.md,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap',
      }}>
        <Archive size={18} color={C.blue} strokeWidth={2.2} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>
            En parallèle — Naxi Gestion office (lecture seule)
          </div>
          <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5, marginTop: 2 }}>
            Conserve l'historique des saisons passées, consultable à tout moment.
            Aucune écriture possible : pas de divergence avec NAX7.
          </div>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px', borderRadius: RADIUS.sm,
          background: C.paper, color: C.blue,
          border: `1px solid ${C.blue}40`,
          fontSize: 10.5, fontWeight: 700,
        }}>
          <Lock size={10} strokeWidth={2.4} />
          Read-only
        </span>
      </div>
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
      <ArrowRight size={18} color={C.orange} strokeWidth={2.2} />
      {label && (
        <span style={{
          fontSize: 9, fontWeight: 700, color: C.inkDim,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          textAlign: 'center',
        }}>{label}</span>
      )}
    </div>
  );
}

function DataCard({ data }) {
  const Icon = data.icon;
  return (
    <div style={{
      padding: '14px 16px',
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${data.color}`,
      borderRadius: RADIUS.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: RADIUS.sm,
          background: data.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={14} color={data.color} strokeWidth={2.4} />}
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: C.ink, letterSpacing: '0.01em',
        }}>{data.title}</div>
      </div>
      <div style={{ fontSize: 11.5, color: C.inkDim, lineHeight: 1.5 }}>
        {data.desc}
      </div>
    </div>
  );
}

function CategoryColumn({ cat }) {
  const Icon = cat.icon;
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderTop: `3px solid ${cat.color}`,
      borderRadius: RADIUS.md,
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: RADIUS.sm,
          background: cat.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={cat.color} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>
            {cat.title}
          </div>
          <div style={{ fontSize: 10.5, color: C.inkDim, marginTop: 2 }}>{cat.subtitle}</div>
        </div>
      </div>
      <ul style={{
        margin: 0, padding: 0, listStyle: 'none',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        {cat.items.map((it, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
            fontSize: 11.5, color: C.inkSoft, lineHeight: 1.45,
          }}>
            <span style={{
              width: 4, height: 4, borderRadius: 1,
              background: cat.color, marginTop: 6, flexShrink: 0,
            }} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
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
