import {
  Sparkles, Target, Layers, HelpCircle,
  TrendingUp, Mail, ListTodo,
  CheckCircle, Database, ArrowRight,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// RdIaPage — exploration R&D
// Intégrer l'IA dans NAX7 Full Web : aide à la décision + automatisation
// opérationnelle. Trois projets pilotes pour ouvrir le terrain.
// ============================================

const PROJECTS = [
  {
    num: '1',
    color: C.blue,
    icon: TrendingUp,
    title: 'Optimisation du planning',
    pitch: "Une IA propose des déplacements de réservations pour maximiser le revenu et l'expérience client.",
    inputs: [
      "Périodes (saisons, jours fériés, pics d'activité)",
      "REVPAR du locatif (revenu moyen par hébergement)",
      "Vétusté de l'hébergement (notation maintenance)",
      "Avis clients par hébergement",
      "Préférences clients déjà connues",
    ],
    output: "Une modale propose : « Déplacer la réservation X de l'emplacement A vers B » avec justification (gain REVPAR, meilleur fit client).",
    decision: 'Le camping valide, refuse ou ajuste chaque proposition. Pas d\'exécution automatique sans confirmation.',
  },
  {
    num: '2',
    color: C.green,
    icon: Mail,
    title: 'Mails transactionnels',
    pitch: "Rédaction, traduction et personnalisation automatique des emails envoyés aux clients tout au long du séjour.",
    inputs: [
      "Type d'email (confirmation, rappel d'arrivée, relance solde, sortie)",
      "Données client (nom, langue, historique séjour)",
      "Spécificités séjour (hébergement, dates, participants)",
      "Tone of voice et charte établissement",
    ],
    output: "Email rédigé dans la langue du client, personnalisé sur le séjour et adapté à la tonalité de l'établissement. Brouillon prêt à valider.",
    decision: "L'opérateur relit, ajuste si besoin, puis envoie. Possible mode 100 % automatique pour les emails routiniers déjà éprouvés.",
  },
  {
    num: '3',
    color: C.amber,
    icon: ListTodo,
    title: 'To-do intelligente',
    pitch: "À l'ouverture de la fenêtre To-do, l'IA propose un plan d'action priorisé et automatise ce qui peut l'être.",
    inputs: [
      "Tâches en attente (relances, suivis, contrôles)",
      "Réservations à risque (impayés, fenêtre d'annulation)",
      "Indicateurs de la journée (arrivées, départs, alertes)",
      "Habitudes passées de l'utilisateur",
    ],
    output: "Liste de tâches priorisée + propositions d'actions automatiques (relance email, alerte ménage, message client) à valider en un clic.",
    decision: 'Rapport en fin de session : actions exécutées, actions reportées, suggestions non retenues. Boucle de feedback pour améliorer le modèle.',
  },
];

const OPEN_QUESTIONS = [
  { title: 'Choix du moteur IA',
    desc: 'Modèle propriétaire fine-tuné sur les données métier, ou API externe (OpenAI, Anthropic, Mistral) ? Coût vs maîtrise.' },
  { title: 'Confidentialité des données',
    desc: 'Quelles données peuvent quitter le SI Inaxel ? Anonymisation, déploiement on-premise pour les modules sensibles ?' },
  { title: 'Mesure du gain métier',
    desc: 'Comment quantifier proprement le gain (€ revenu, temps gagné, satisfaction client) pour chaque projet pilote ?' },
  { title: 'Onboarding et confiance utilisateur',
    desc: "Comment introduire l'IA sans braquer les saisonniers ? Mode opt-in progressif ? Démos avant activation ?" },
  { title: 'Boucle de feedback',
    desc: "Quels signaux utilisateur (accepté, refusé, modifié) pour faire progresser le modèle au fil du temps ?" },
  { title: 'Coût marginal par établissement',
    desc: "Quel est le coût par appel IA (tokens, GPU) ? Comment éviter la dérive de coûts sur les gros camping ?" },
];

export function RdIaPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web · R&D"
        icon={Sparkles}
        sub="Intégrer l'IA dans le PMS : aide à la décision et automatisation"
      >R&D intégration IA</SectionTitle>

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
          Intégrer l'<b>intelligence artificielle</b> dans NAX7 Full Web pour
          deux usages complémentaires : <b>aider à la décision</b> sur des
          choix complexes, et <b>automatiser</b> les tâches répétitives.
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>
          Trois projets pilotes pour ouvrir le terrain et mesurer la valeur :
          optimisation du planning, rédaction des mails transactionnels,
          intelligence du to-do quotidien. L'IA suggère, l'opérateur décide.
        </div>
      </Card>

      {/* ===== 3 PROJETS ===== */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={Layers} title="Trois projets pilotes" sub="Aide à la décision · Automatisation · Productivité quotidienne" />
        <div style={{
          padding: 20,
          display: 'grid', gridTemplateColumns: '1fr', gap: 16,
        }}>
          {PROJECTS.map(p => <ProjectCard key={p.num} project={p} />)}
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
          Questions transverses à trancher avant industrialisation des trois
          projets. Réponses qui structurent le choix techno et la roadmap.
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

function ProjectCard({ project }) {
  const Icon = project.icon;
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderLeft: `4px solid ${project.color}`,
      borderRadius: RADIUS.md,
      padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      {/* Header projet */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 14, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: project.color, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800,
          boxShadow: SHADOW.sm,
        }}>{project.num}</div>
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
          }}>
            <Icon size={16} color={project.color} strokeWidth={2.2} />
            <div style={{
              fontSize: 15, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em',
            }}>Projet {project.num} — {project.title}</div>
          </div>
          <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
            {project.pitch}
          </div>
        </div>
      </div>

      {/* Détails : Inputs → Output → Décision */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto 1fr',
        gap: 8,
        alignItems: 'stretch',
        marginLeft: 4,
      }}>
        <DetailBlock
          color={project.color}
          icon={Database}
          label="Données d'entrée"
          content={
            <ul style={{
              margin: 0, padding: 0, listStyle: 'none',
              display: 'flex', flexDirection: 'column', gap: 3,
            }}>
              {project.inputs.map((it, i) => (
                <li key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 5,
                  fontSize: 11.5, color: C.inkSoft, lineHeight: 1.4,
                }}>
                  <span style={{
                    width: 4, height: 4, borderRadius: 1,
                    background: project.color, marginTop: 6, flexShrink: 0,
                  }} />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          }
        />
        <FlowArrow color={project.color} />
        <DetailBlock
          color={project.color}
          icon={Sparkles}
          label="Sortie IA"
          content={
            <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
              {project.output}
            </div>
          }
        />
        <FlowArrow color={project.color} />
        <DetailBlock
          color={project.color}
          icon={CheckCircle}
          label="Décision humaine"
          content={
            <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
              {project.decision}
            </div>
          }
        />
      </div>
    </div>
  );
}

function DetailBlock({ color, icon: Icon, label, content }) {
  return (
    <div style={{
      background: C.bgSoft,
      border: `1px solid ${C.line}`,
      borderRadius: RADIUS.sm,
      padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon size={12} color={color} strokeWidth={2.4} />
        <div style={{
          fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase',
          color, fontWeight: 700,
        }}>{label}</div>
      </div>
      {content}
    </div>
  );
}

function FlowArrow({ color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 2px',
    }}>
      <ArrowRight size={16} color={color} strokeWidth={2.4} />
    </div>
  );
}

