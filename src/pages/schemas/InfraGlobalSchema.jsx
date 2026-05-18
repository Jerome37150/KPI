import {
  Box, FileText, ShieldCheck, Globe2, ArrowRight,
  Code2, Layers, Server, Activity, Database,
  Ticket, LifeBuoy, BookText, Cpu, Bot,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../../styles/theme';

// ============================================
// InfraGlobalSchema — vue macro de l'architecture Inaxel
// Entrées (doc + normes + veille) → SOCLE → Code & Pré-prods & Suivi
// → Cockpit unifié Inaxel Pilot. 6 points d'automatisation IA.
// ============================================

export function InfraGlobalSchema() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ===== HAUT : ENTRÉES → SOCLE → CODE+PRÉ-PRODS ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 36px minmax(220px, 1.2fr) 36px 1.5fr',
        gap: 8,
        alignItems: 'stretch',
      }}>
        {/* ── Col 1 : Entrées ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <InputSection
            num="1" title="Documentation produit"
            items={[
              { name: 'NAX 7',         sub: 'Arborescence + cahier des charges' },
              { name: 'NAX 7 Light',   sub: 'Arborescence + cahier des charges' },
              { name: 'NAX 7 Manager', sub: 'Arborescence + cahier des charges' },
              { name: 'Naxi Gestion',  sub: 'Fonctions principales' },
              { name: 'C tout Vert',   sub: 'Calcul prix, paramétrages, hébergements & camping' },
            ]}
          />
          <InputSection
            num="2" title="Normes & règles métier"
            items={[
              { name: 'RGPD',                  sub: 'Règlement' },
              { name: 'NORME NF 525',          sub: 'Certif. caisse' },
              { name: 'Règle comptabilité',    sub: '' },
              { name: 'Fonctionnement',        sub: 'Espagnol' },
              { name: 'Mise à jour continue',  sub: 'Veille web automatisée', ai: true },
            ]}
          />
        </div>

        {/* ── Flèche → ── */}
        <FlowArrow />

        {/* ── Col 2 : SOCLE central ── */}
        <SocleCard />

        {/* ── Flèche → ── */}
        <FlowArrow withBadge />

        {/* ── Col 3 : Code GitHub + Pré-prods ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Section num="3" title="Code GitHub">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
            }}>
              <CodeChip label="Design" icon={Layers} />
              <CodeChip label="Front"  icon={Code2} />
              <CodeChip label="Back"   icon={Server} />
            </div>
          </Section>

          <Section num="4" title="Pré-prods & tests">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6,
              marginBottom: 6,
            }}>
              <PreprodChip name="NAX7" />
              <PreprodChip name="NAX7 light" />
              <PreprodChip name="NAX7 Manager" />
            </div>
            <div style={{
              background: '#FEF3C7',
              border: `1px solid #F59E0B`,
              borderRadius: RADIUS.sm,
              padding: '8px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 8,
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>
                  Tests automatisés
                </div>
                <div style={{ fontSize: 10.5, color: '#92400E', opacity: 0.8 }}>
                  Validation continue des 3 environnements
                </div>
              </div>
              <Activity size={16} color="#92400E" strokeWidth={2.2} />
            </div>
          </Section>
        </div>
      </div>

      {/* ===== BAS : SUIVI & DOC → CONSOLIDATION ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 36px 1fr',
        gap: 8,
        alignItems: 'stretch',
      }}>
        {/* ── Suivi & documentation ── */}
        <Section num="5" title="Suivi & documentation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <DocChip
              icon={Ticket}    label="US Jira"
              sub="Tickets auto-générés" ai
            />
            <DocChip
              icon={LifeBuoy} label="Fiches support"
              sub="Aide utilisateurs" ai
            />
            <DocChip
              icon={BookText} label="Fiches techniques"
              sub="Doc développeurs" ai
            />
          </div>
        </Section>

        {/* ── Flèche → ── */}
        <FlowArrow />

        {/* ── Consolidation Inaxel Pilot ── */}
        <div>
          <SectionHeader label="Consolidation" />
          <div style={{
            background: '#7F1D1D',
            color: '#fff',
            borderRadius: RADIUS.md,
            padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: 4,
            boxShadow: SHADOW.sm,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 17, fontWeight: 400 }}>inaxel</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.orange }}>Pilot</span>
            </div>
            <div style={{ fontSize: 11.5, opacity: 0.9 }}>
              Cockpit unifié — point d'entrée unique
            </div>
            <div style={{ fontSize: 10.5, opacity: 0.75, fontStyle: 'italic' }}>
              tickets · fiches · supervision
            </div>
          </div>

          {/* 3 outils opérationnels */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6, marginTop: 8,
          }}>
            <OpChip icon={Server}   name="Serveurs" sub="Infrastructure" />
            <OpChip icon={Activity} name="Grafana"  sub="Monitoring" />
            <OpChip icon={Database} name="Akuiteo"  sub="ERP" />
          </div>
        </div>
      </div>

      {/* ===== LÉGENDE 3 COLONNES ===== */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
        marginTop: 8,
      }}>
        <LegendCard
          accent={C.orange}
          title="Le socle alimente tout"
          text="Un seul socle prototypé sur Visual Studio Code, enrichi en continu par la doc produit, les normes (RGPD, NF 525, comptabilité, Espagne) et la veille web."
        />
        <LegendCard
          accent={C.violet}
          title="6 points d'automatisation IA"
          text="Chaque passage « socle → livrable » est accompagné d'un agent IA : code Design/Front/Back, US Jira, fiches support, fiches techniques."
        />
        <LegendCard
          accent="#7F1D1D"
          title="Inaxel Pilot = cockpit unifié"
          text="Consolidation finale : tickets, fiches, supervision (Serveurs, Grafana, Akuiteo) agrégés dans un point d'entrée unique pour toute l'équipe."
        />
      </div>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function SectionHeader({ num, label }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 800, letterSpacing: '0.08em',
      textTransform: 'uppercase', color: C.inkDim,
      marginBottom: 6, paddingLeft: 2,
    }}>
      {num != null && <span style={{ color: C.orange, marginRight: 6 }}>{num}.</span>}
      {label}
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <div>
      <SectionHeader num={num} label={title} />
      {children}
    </div>
  );
}

function InputSection({ num, title, items }) {
  return (
    <div>
      <SectionHeader num={num} label={title} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it) => (
          <div key={it.name} style={{
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: RADIUS.sm,
            padding: '7px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
            position: 'relative',
          }}>
            {it.ai && <AiBadge inline />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11.5, fontWeight: 700, color: C.ink,
                lineHeight: 1.2,
              }}>{it.name}</div>
              {it.sub && (
                <div style={{
                  fontSize: 10, color: C.inkDim,
                  lineHeight: 1.25, marginTop: 1,
                }}>{it.sub}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocleCard() {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.orange} 0%, ${C.orangeDark} 100%)`,
      color: '#fff',
      borderRadius: RADIUS.md,
      padding: '20px 18px',
      boxShadow: SHADOW.card,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', gap: 8,
      position: 'relative',
      minHeight: 240,
    }}>
      <Box size={36} color="#fff" strokeWidth={1.6}
        style={{ opacity: 0.95, marginBottom: 2 }} />
      <div style={{
        fontSize: 22, fontWeight: 800, letterSpacing: '0.04em',
        lineHeight: 1,
      }}>SOCLE</div>
      <div style={{
        fontSize: 12.5, fontWeight: 600, opacity: 0.95,
        marginTop: 2,
      }}>Prototypes sur Visual Studio Code</div>
      <div style={{
        width: 32, height: 1.5, background: 'rgba(255,255,255,0.4)',
        margin: '4px 0',
      }} />
      <div style={{
        fontSize: 10.5, lineHeight: 1.45, opacity: 0.9,
        fontStyle: 'italic', maxWidth: 200,
      }}>
        Base de code unique · architecture moderne<br/>
        un seul socle, plusieurs produits
      </div>
    </div>
  );
}

function FlowArrow({ withBadge }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 6,
    }}>
      {withBadge && <AiBadge />}
      <ArrowRight size={20} color={C.orange} strokeWidth={2.4} />
    </div>
  );
}

function AiBadge({ inline }) {
  return (
    <div style={{
      ...(inline ? {} : { marginBottom: 0 }),
      width: 22, height: 22, borderRadius: '50%',
      background: C.violet, color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 8.5, fontWeight: 800, letterSpacing: '0.04em',
      boxShadow: `0 0 0 2px ${C.violetBg}`,
      flexShrink: 0,
    }}>IA</div>
  );
}

function CodeChip({ label, icon: Icon }) {
  return (
    <div style={{
      background: '#EFF6FF',
      border: `1px solid #BFDBFE`,
      borderRadius: RADIUS.sm,
      padding: '8px 10px',
      display: 'flex', alignItems: 'center', gap: 6,
      position: 'relative',
    }}>
      <AiBadge inline />
      <Icon size={14} color="#1D4ED8" strokeWidth={2.2} />
      <div style={{ fontSize: 11, fontWeight: 700, color: '#1E3A8A' }}>
        GitHub — {label}
      </div>
    </div>
  );
}

function PreprodChip({ name }) {
  return (
    <div style={{
      background: '#D1FAE5',
      border: `1px solid #6EE7B7`,
      borderRadius: RADIUS.sm,
      padding: '8px 10px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 2, textAlign: 'center',
    }}>
      <div style={{
        fontSize: 12, fontWeight: 800, color: '#065F46',
        letterSpacing: '0.02em',
      }}>{name}</div>
      <div style={{ fontSize: 9.5, color: '#065F46', opacity: 0.85 }}>
        Pré-prod
      </div>
    </div>
  );
}

function DocChip({ icon: Icon, label, sub, ai }) {
  return (
    <div style={{
      background: '#ECFDF5',
      border: `1px solid #A7F3D0`,
      borderRadius: RADIUS.sm,
      padding: '9px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {ai && <AiBadge inline />}
      <Icon size={16} color="#047857" strokeWidth={2.2} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#064E3B' }}>{label}</div>
        <div style={{ fontSize: 10.5, color: '#047857', opacity: 0.9 }}>{sub}</div>
      </div>
    </div>
  );
}

function OpChip({ icon: Icon, name, sub }) {
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderRadius: RADIUS.sm,
      padding: '8px 10px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 2,
    }}>
      <Icon size={14} color={C.inkSoft} strokeWidth={2.2} />
      <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginTop: 2 }}>{name}</div>
      <div style={{ fontSize: 10, color: C.inkDim }}>{sub}</div>
    </div>
  );
}

function LegendCard({ accent, title, text }) {
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: RADIUS.sm,
      padding: '12px 14px',
      boxShadow: SHADOW.sm,
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.07em',
        textTransform: 'uppercase', color: accent,
        marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5,
      }}>{text}</div>
    </div>
  );
}
