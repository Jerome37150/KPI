import {
  ClipboardList, Target, Layers,
  Users, Bell, ClipboardCheck, AlertTriangle, Server, BookOpen, Bot,
  ExternalLink, Wrench,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { openDesktopPreview } from '../utils/openPreview';

// ============================================
// CahierDesChargesInaxelPilotPage — vision Inaxel Pilot
// Outil interne services Produit & Support · 7 modules.
// ============================================

const PROTOTYPE_URL = 'https://inaxel-pilot.vercel.app/';

const MODULES = [
  { key: 'CLIENTS',     color: C.blue,    icon: Users,
    title: 'État des clients',
    desc: "Vue d'ensemble en temps réel de chaque client : santé, activité, incidents récents, jalons de la relation." },
  { key: 'ALERTES',     color: C.amber,   icon: Bell,
    title: 'Alertes',
    desc: 'Système de notification opérationnelle : remontée des incidents, escalades, suivi des résolutions.' },
  { key: 'TESTS',       color: C.green,   icon: ClipboardCheck,
    title: 'Rapports des tests automatiques',
    desc: 'Synthèse des suites de tests exécutées sur les pré-prods : statut, tendances, régressions détectées.' },
  { key: 'DASH_ALERT',  color: C.red,     icon: AlertTriangle,
    title: 'Dashboard des alertes',
    desc: "Vue agrégée des alertes actives par client, par criticité et par typologie — identification des patterns récurrents." },
  { key: 'DASH_SERVER', color: C.purple,  icon: Server,
    title: 'Dashboard des serveurs',
    desc: 'Supervision de l\'infrastructure : santé des serveurs, capacité, incidents techniques en cours.' },
  { key: 'WIKI',        color: '#0ea5e9', icon: BookOpen,
    title: 'Wiki automatique',
    desc: 'Base de connaissance produit, simple et générée automatiquement à partir des sources internes — toujours à jour.' },
  { key: 'CHATBOT',     color: '#ec4899', icon: Bot,
    title: "Chatbot d'aide produits",
    desc: 'Assistant conversationnel pour les équipes produit et support, accès rapide aux infos clients, doc et procédures.' },
];

export function CahierDesChargesInaxelPilotPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="Inaxel Pilot"
        icon={ClipboardList}
        sub="Vision et modules de l'outil interne Produit & Support"
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
          <b>Inaxel Pilot</b> — l'outil interne des services <b>Produit</b> et
          <b> Support</b>. Cockpit unifié pour piloter les clients, monitorer
          l'infrastructure et donner aux équipes l'accès rapide à la connaissance
          produit.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Sept modules complémentaires couvrent toute la chaîne : du suivi
          opérationnel des clients aux dashboards techniques, en passant par
          la documentation auto-générée et l'assistant conversationnel.
        </div>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
        }}>
          <Pill label="Outil interne" color={C.orange} />
          <Pill label="7 modules" color={C.blue} />
          <Pill label="Itératif" color={C.green} sub="construction continue" />
        </div>
      </Card>

      {/* ===== 7 MODULES ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Modules · 7 briques fonctionnelles" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12,
        }}>
          {MODULES.map(m => <ModuleCard key={m.key} module={m} />)}
        </div>
      </Card>

      {/* ===== NOTE LIVRAISON ITÉRATIVE ===== */}
      <Card padding={20} style={{
        background: C.bgSoft,
        borderLeft: `3px solid ${C.gray400}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Wrench size={13} color={C.gray500} strokeWidth={2.2} />
          <div style={{
            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.gray500, fontWeight: 700,
          }}>Mode de livraison</div>
        </div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>
          Outil interne en <b>construction itérative</b> : pas de rétro-planning
          fixe. Les modules sont livrés progressivement selon les besoins
          identifiés par les équipes Produit & Support.
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

function ModuleCard({ module }) {
  const Icon = module.icon;
  return (
    <div style={{
      padding: '14px 16px',
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderLeft: `3px solid ${module.color}`,
      borderRadius: RADIUS.md,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: RADIUS.sm,
          background: module.color + '15',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {Icon && <Icon size={14} color={module.color} strokeWidth={2.4} />}
        </div>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: C.ink, letterSpacing: '0.01em',
        }}>{module.title}</div>
      </div>
      <div style={{ fontSize: 11.5, color: C.inkDim, lineHeight: 1.5 }}>
        {module.desc}
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
