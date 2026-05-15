import { useMemo, useState } from 'react';
import {
  Calculator, Layers, Globe, Server, Search,
  Tag, Percent, Receipt, Banknote, Coins, ShieldCheck,
  ArrowDownRight, ArrowRight, ChevronRight,
} from 'lucide-react';
import { C, RADIUS, SHADOW } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// CalculPrixPage — analyse pricing NAX7 full web
// Synthèse de la chaîne de calcul prix dans le PMS Inaxel + CRS C tout Vert,
// fondée sur la cartographie Modules NAX 7 (160 fenêtres pricing/finance).
// ============================================

const PRICING_MODULES = ['M02','M03','M06','M07','M08','M10','M13','M14','M15','M16','M17','M18','M27'];

const SOL_PMS = 'Inaxel (PMS)';
const SOL_CRS = 'C tout Vert (CRS)';

// ── Pipeline de calcul prix : étapes ordonnées ───────────────────────────
const PIPELINE = [
  {
    step: 1, color: C.orange,
    title: "Tarif de base",
    formula: "Σ (nuits × tarif_jour × catégorie_hébergement)",
    source: "M27 · Tables de prix",
    detail: "Grille tarifaire par hébergement × période × jour. Modulée par les règles enfants/adultes, le minimum/maximum de séjour, le supplément personne au-delà de la capacité standard.",
  },
  {
    step: 2, color: C.blue,
    title: "Compléments tarifaires",
    formula: "+ Σ (suppléments × quantité × nuits)",
    source: "M27 · Suppléments tarifaires · M03 · Grille des suppléments",
    detail: "Réfrigérateur, draps, animal, véhicule supplémentaire, raccordement, etc. Catalogue maintenu en M12 (suppléments / matériel) + grille M03 spécifique au séjour.",
  },
  {
    step: 3, color: C.purple,
    title: "Pricing dynamique (yield)",
    formula: "× (1 + facteur_occupation + facteur_canal)",
    source: "M10 · CRS",
    detail: "Le CRS module le prix selon le taux d'occupation, le segment client (Direct / OTA / TO / CE) et la durée de séjour (early-booking / last-minute). Hors CRS, le tarif reste celui de la grille de base.",
  },
  {
    step: 4, color: C.amber,
    title: "Promotions & codes promo",
    formula: "− Σ (réductions %) ou − Σ (montants €)",
    source: "M10 · Promotions · Codes promo",
    detail: "Une promotion peut être saisonnière, basée sur un canal, conditionnée à un code, ou auto-déclenchée (last-minute, early-booking). Cumul ou exclusion selon le paramétrage.",
  },
  {
    step: 5, color: C.green,
    title: "Tarifs négociés B2B",
    formula: "OU remplace le tarif base si TO/CE/Résident",
    source: "M06 · Grilles tarifaires TO · M07 · Tarifs négociés CE · M08 · Contrat résident",
    detail: "Si le séjour est rattaché à un partenaire B2B, on applique la grille négociée du contrat. Plafonds et subventions CE sont gérés séparément (M07 · Plafonds & subventions CE).",
  },
  {
    step: 6, color: C.red,
    title: "Taxe de séjour",
    formula: "+ (adultes × nuits × tarif_commune)",
    source: "M17 · Taxe de séjour · Calcul automatique sur séjour",
    detail: "Calcul automatique selon la configuration communale, exemptions (enfants, étudiants, etc.). Déclaration EDIFICT vers la commune.",
  },
  {
    step: 7, color: C.inkSoft,
    title: "TVA",
    formula: "+ TVA (intégrée ou séparée)",
    source: "M27 · Multi-TVA · Taxes intégrées vs séparées",
    detail: "Multi-taux selon la nature de la ligne (hébergement, restauration, vente boutique, ménage, etc.). Affichage TTC ou HT+TVA selon le paramètre établissement.",
  },
  {
    step: 8, color: C.orange,
    title: "Arrondis & présentation",
    formula: "→ ROUND (selon règle M27)",
    source: "M27 · Arrondis",
    detail: "Arrondi à 0,01 € / 0,05 € / 0,10 € / 1 € selon le segment et la stratégie commerciale. Cohérent avec l'affichage public (CRS) et l'édition devis (PMS).",
  },
];

// ── Sections fonctionnelles (regroupement de modules) ────────────────────
const SECTIONS = [
  {
    key: 'parametres',
    title: 'Référentiels tarifaires',
    sub: 'Paramètres saisonniers — fondations du calcul',
    color: C.orange,
    icon: Layers,
    modules: ['M27'],
    notes: [
      "Tables de prix : grille par hébergement × période × type clientèle (base saison).",
      "Multi-TVA : taux différenciés hébergement / restauration / boutique / location.",
      "Suppléments tarifaires : catalogue tarif unitaire applicable au séjour.",
      "Règles enfants / adultes : âges, gratuité, demi-tarif, supplément.",
      "Tarifs par durée : barème dégressif (semaine, quinzaine, mois).",
      "Minimum/Maximum de séjour : contraintes par hébergement / période.",
      "Acompte demandé : pourcentage ou montant fixe par segment.",
      "Délai de paiement : J-X avant arrivée pour le solde.",
      "Arrondis : règle d'arrondi final (centime, 5 cts, euro).",
      "Taxes intégrées vs séparées : affichage prix TTC ou HT+TVA.",
    ],
  },
  {
    key: 'rm',
    title: 'Pricing dynamique & promotions',
    sub: 'Revenue management côté CRS en ligne',
    color: C.purple,
    icon: Percent,
    modules: ['M10'],
    notes: [
      "Vue d'ensemble tarifs actifs : visu calendaire des prix appliqués par hébergement.",
      "Simulateur de prix : calcule le prix d'un séjour fictif (pré-conversion).",
      "Yield management : moteur RM automatique (algorithme d'optimisation revenue).",
      "Prix dynamique par taux d'occupation : courbe de prix selon remplissage.",
      "Tarifs par segment : Direct / OTA / TO / CE / Résident — grilles distinctes.",
      "Tarifs par durée : barème dégressif (réplique côté CRS si différent du PMS).",
      "Création de promotion + Liste des promotions actives : campagnes datées.",
      "Codes promo : codes à usage unique ou multi-usage, plafond, conditions.",
      "Last-minute / Early-booking : déclencheurs temporels automatiques.",
      "Restrictions de séjour : min/max nuit, arrivée/départ interdits, gap-fill.",
      "Restrictions par canal : stop-sell ciblé OTA / canaux directs.",
      "Surclassement automatique : règle d'upgrade catégorie selon dispo.",
      "Comparatif vs N-1 : pilotage saison vs année précédente.",
    ],
  },
  {
    key: 'b2b',
    title: 'Tarification B2B',
    sub: 'Partenaires commerciaux : TO, CE, résidents',
    color: C.blue,
    icon: Tag,
    modules: ['M06', 'M07', 'M08'],
    notes: [
      "Grilles tarifaires TO : prix négociés par tour-opérateur (rétrocession, vouchers).",
      "Conditions commerciales TO : commission, délais d'annulation, allotements.",
      "Tarifs négociés CE : barème CE + plafonds & subventions partielles.",
      "Bons CE / chèques-vacances ANCV : moyens de paiement spécifiques B2B.",
      "Contrats résidents (longue durée) : bail, loyer, charges, refacturation conso.",
      "Échéancier de paiement résident : facturation mensuelle automatique.",
      "Rapport de production par TO / CE : volume négocié × tarif × commission.",
    ],
  },
  {
    key: 'devis',
    title: 'Devis & séjour : application du prix',
    sub: 'Du devis prévisionnel au prix final facturé',
    color: C.green,
    icon: Calculator,
    modules: ['M02', 'M03'],
    notes: [
      "Création devis → Détail des calculs devis : pipeline complet visible client.",
      "Édition PDF + envoi devis : document commercial avec ventilation lignes prix.",
      "Conversion devis → option / réservation ferme : option = bloque dispo avec deadline.",
      "Prolongation devis / option : reset deadline.",
      "Expiration automatique d'option : libération auto si pas converti à temps.",
      "Modification séjour : recalcul à chaud (ajout nuits, changement catégorie, etc.).",
      "Ajouter remise au séjour : remise commerciale post-devis (saisie manuelle).",
      "Ajouter supplément au séjour : facturation in-stay (ménage, animal supplémentaire).",
      "Annulation séjour avec paiement : application des conditions tarifaires d'annulation.",
      "Transfert de séjour : changement d'emplacement → recalcul si grille différente.",
      "No-show : facturation selon règle no-show paramétrée.",
    ],
  },
  {
    key: 'pos',
    title: 'Ventes réception (POS)',
    sub: 'Boutique, restauration, prestations annexes',
    color: C.amber,
    icon: Receipt,
    modules: ['M18'],
    notes: [
      "Ventes rapides : caisse type POS, articles fréquents en accès direct.",
      "Sélection articles + Panier : prix article × quantité, TVA par article.",
      "Encaissement : multi-règlement (espèces, CB, chèque, cashless, espace client).",
      "Affecter vente à un séjour : ajoute la ligne au compte séjour (facturation finale).",
      "Vente hors séjour : ticket autonome (passant, client occasionnel).",
      "Annulation / remboursement de vente : avoir si déjà facturé.",
    ],
  },
  {
    key: 'encaissement',
    title: 'Encaissement & cautions',
    sub: 'Flux de règlement (acompte, solde, partiel, en ligne)',
    color: C.orange,
    icon: Banknote,
    modules: ['M13', 'M14', 'M15'],
    notes: [
      "Saisie paiement / Paiements partiels : un séjour peut avoir N paiements.",
      "Échéancier de paiement : acompte à la résa + solde à J-X.",
      "Paiements en ligne (espace client + web booking) : interface PSP intégrée.",
      "Journal des encaissements : flux quotidien tous moyens confondus.",
      "Contrôle des règlements / Rapprochement bancaire : matching banque ↔ PMS.",
      "Relances impayés / Remboursements / Report de solde client.",
      "Caisse : ouverture / fermeture quotidienne, multi-caisses, transferts.",
      "Remises en banque : bordereau, contrôle de caisse.",
      "Cautions : empreinte CB, prise, restitution, partielle, litiges & retenues.",
    ],
  },
  {
    key: 'facturation',
    title: 'Facturation',
    sub: 'Documents légaux et numérotation',
    color: C.red,
    icon: Receipt,
    modules: ['M16'],
    notes: [
      "Facture d'acompte : émise dès le 1er encaissement.",
      "Facture finale : ventile l'intégralité du séjour à la sortie.",
      "Facture résident : facturation mensuelle automatique (M08).",
      "Facture groupes / TO / CE : facturation séparée selon contrat.",
      "Émission multi-séjour : regroupe plusieurs séjours sur 1 facture (TO, groupes).",
      "Avoirs & rectifications : annulation comptable, rectification a posteriori.",
      "Facturier : numérotation chronologique séquentielle (obligation légale).",
      "Réimpression / duplicata : copie conforme avec mention duplicata.",
    ],
  },
  {
    key: 'taxes',
    title: 'Taxes & fiscalité',
    sub: 'Taxe de séjour, TVA, exports comptables',
    color: C.inkSoft,
    icon: ShieldCheck,
    modules: ['M17'],
    notes: [
      "Configuration taxe de séjour : par commune, tarif par catégorie, exemptions.",
      "Calcul automatique sur séjour : (adultes éligibles × nuits × tarif).",
      "États de taxe de séjour + Déclaration EDIFICT : envoi mensuel commune.",
      "États TVA / Journal TVA détaillé : ventilation par taux pour comptable.",
      "Exports comptables : FEC, journal des ventes, journaux fiscaux.",
      "Archivage légal : conservation 10 ans (factures, tickets, journaux).",
    ],
  },
];

// ── Composant principal ──────────────────────────────────────────────────
export function CalculPrixPage({ data }) {
  const [filter, setFilter] = useState('');

  // Fenêtres pricing depuis cartoPmsWeb
  const pricingItems = useMemo(() => {
    const carto = data?.cartoPmsWeb || [];
    return carto.filter(c => PRICING_MODULES.includes(c.numModule));
  }, [data]);

  const stats = useMemo(() => {
    const total = pricingItems.length;
    const pms = pricingItems.filter(c => (c.solution || []).includes(SOL_PMS)).length;
    const crs = pricingItems.filter(c => (c.solution || []).includes(SOL_CRS)).length;
    const modules = new Set(pricingItems.map(c => c.numModule));
    return { total, pms, crs, modules: modules.size };
  }, [pricingItems]);

  const filteredItems = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return pricingItems;
    return pricingItems.filter(c => {
      const blob = [c.fenetre, c.module, c.section, c.groupe, (c.solution || []).join(' ')]
        .filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });
  }, [pricingItems, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web"
        icon={Calculator}
        sub="Synthèse de la chaîne de calcul prix — 160 fenêtres pricing/finance sur 13 modules"
      >Calcul prix</SectionTitle>

      {/* Bandeau stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16,
      }}>
        <StatCard icon={Layers} label="Fenêtres pricing"   value={stats.total}   accent={C.orange} />
        <StatCard icon={Server} label="PMS (off-line)"      value={stats.pms}     accent={C.blue} sub="Inaxel" />
        <StatCard icon={Globe}  label="CRS (en ligne)"      value={stats.crs}     accent={C.purple} sub="C tout Vert" />
        <StatCard icon={Coins}  label="Modules concernés"   value={stats.modules} accent={C.green} />
      </div>

      {/* Architecture 2 couches */}
      <ArchitectureSplit />

      {/* Pipeline de calcul */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <CardHeader icon={ArrowDownRight} title="Pipeline de calcul prix séjour" sub="Étape par étape, du tarif de base au net à payer" />
        <div style={{ padding: '20px 24px' }}>
          {PIPELINE.map((s, i) => (
            <PipelineStep key={s.step} step={s} last={i === PIPELINE.length - 1} />
          ))}
          <FormulaSummary />
        </div>
      </Card>

      {/* Sections fonctionnelles */}
      {SECTIONS.map(sec => (
        <SectionBlock key={sec.key} section={sec} items={pricingItems} />
      ))}

      {/* Workflow Devis → Séjour → Facturation */}
      <LifecycleFlow />

      {/* Tableau de référence : toutes les fenêtres pricing */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={13} color={C.orange} strokeWidth={2.2} />
            <div style={{
              fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: C.orange, fontWeight: 700,
            }}>Référentiel des fenêtres pricing · {filteredItems.length}/{pricingItems.length}</div>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: RADIUS.md,
            background: C.paper, border: `1px solid ${C.line}`,
          }}>
            <Search size={13} color={C.inkDim} strokeWidth={2.2} />
            <input
              type="text"
              placeholder="Filtrer (fenêtre, module, section, solution)"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'inherit', fontSize: 12, color: C.ink,
                width: 280,
              }}
            />
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.gray50 }}>
                <th style={th()}>Module</th>
                <th style={th()}>Section</th>
                <th style={th()}>Fenêtre</th>
                <th style={th({ textAlign: 'center' })}>Solution</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems
                .sort((a, b) => (a.numModule || '').localeCompare(b.numModule || '') || (a.ordre || 0) - (b.ordre || 0))
                .map((c, i) => (
                  <tr key={c.id || i} style={{ borderBottom: `1px solid ${C.gray100}` }}>
                    <td style={td()}>
                      <span style={{ fontWeight: 700, color: C.orange }}>{c.numModule}</span>
                      <span style={{ color: C.inkDim, marginLeft: 6 }}>{c.module}</span>
                    </td>
                    <td style={{ ...td(), color: C.inkDim }}>{c.section || '—'}</td>
                    <td style={{ ...td(), color: C.ink, fontWeight: 500 }}>{c.fenetre}</td>
                    <td style={{ ...td(), textAlign: 'center' }}>
                      <SolutionBadge solutions={c.solution} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <Card padding={18}>
      <div style={{
        width: 32, height: 32, borderRadius: RADIUS.md,
        background: C.bgSoft, border: `1px solid ${C.line}`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        {Icon && <Icon size={15} color={accent || C.inkSoft} strokeWidth={2} />}
      </div>
      <div style={{
        fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: C.gray400, fontWeight: 700, marginBottom: 4,
      }}>{label}</div>
      <div style={{
        fontSize: 26, fontWeight: 700, color: accent || C.ink,
        lineHeight: 1.1, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.inkDim, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function CardHeader({ icon: Icon, title, sub }) {
  return (
    <div style={{
      padding: '16px 20px', borderBottom: `1px solid ${C.line}`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon size={13} color={C.orange} strokeWidth={2.2} />}
        <div>
          <div style={{
            fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: C.orange, fontWeight: 700,
          }}>{title}</div>
          {sub && <div style={{ fontSize: 11, color: C.inkDim, marginTop: 2 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function ArchitectureSplit() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16,
    }}>
      <Card padding={20} style={{ borderTop: `3px solid ${C.blue}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Server size={15} color={C.blue} strokeWidth={2.2} />
          <div style={{
            fontSize: 13, fontWeight: 700, color: C.ink,
          }}>PMS off-line · Inaxel</div>
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55, marginBottom: 12 }}>
          Le logiciel local de l'établissement. Détient les <b>paramètres tarifaires</b>,
          gère les <b>transactions</b> du quotidien (check-in, encaissement, ventes
          réception) et émet les <b>documents légaux</b> (factures, déclarations fiscales).
        </div>
        <ModuleList modules={[
          { num: 'M02', label: 'Devis & options' },
          { num: 'M03', label: 'Séjour' },
          { num: 'M06', label: 'Tour-opérateurs / agences' },
          { num: 'M07', label: 'CE / collectivités' },
          { num: 'M08', label: 'Résidents / longue durée' },
          { num: 'M13', label: 'Encaissements' },
          { num: 'M14', label: 'Caisse' },
          { num: 'M15', label: 'Cautions' },
          { num: 'M16', label: 'Facturation' },
          { num: 'M17', label: 'Taxes & fiscalité' },
          { num: 'M18', label: 'Ventes réception' },
          { num: 'M27', label: 'Paramètres tarifs' },
        ]} accent={C.blue} />
      </Card>

      <Card padding={20} style={{ borderTop: `3px solid ${C.purple}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Globe size={15} color={C.purple} strokeWidth={2.2} />
          <div style={{
            fontSize: 13, fontWeight: 700, color: C.ink,
          }}>CRS en ligne · C tout Vert</div>
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55, marginBottom: 12 }}>
          Le central de réservation en ligne. <b>Pilote dynamiquement</b> les prix
          publiés (yield, segments, durée), gère les <b>promotions</b> et
          <b> restrictions</b>, et synchronise avec les <b>OTA</b> et le site web direct.
        </div>
        <ModuleList modules={[
          { num: 'M10', label: 'Tarifs & revenue management' },
        ]} accent={C.purple} />
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: C.bgSoft, borderRadius: RADIUS.sm,
          fontSize: 11, color: C.inkSoft, lineHeight: 1.5,
        }}>
          ⚡ Pilotage tarifaire, promotions, restrictions, yield, simulateur de prix,
          comparatifs N-1 — tout ce qui touche au <b>prix dynamique</b>.
        </div>
      </Card>
    </div>
  );
}

function ModuleList({ modules, accent }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {modules.map(m => (
        <span key={m.num} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: RADIUS.sm,
          background: C.bgSoft, border: `1px solid ${C.line}`,
          fontSize: 11, fontWeight: 600, color: C.inkSoft,
        }}>
          <span style={{ color: accent, fontWeight: 700 }}>{m.num}</span>
          {m.label}
        </span>
      ))}
    </div>
  );
}

function PipelineStep({ step, last }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12,
      paddingBottom: last ? 0 : 16,
      position: 'relative',
    }}>
      {/* Bullet step */}
      <div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: step.color, color: '#fff',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700,
          boxShadow: SHADOW.card,
        }}>{step.step}</div>
        {!last && (
          <div style={{
            width: 2, height: 'calc(100% - 16px)',
            background: C.gray200,
            marginLeft: 15, marginTop: 4,
          }} />
        )}
      </div>
      {/* Content */}
      <div style={{ paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{step.title}</div>
          <code style={{
            fontSize: 11, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            background: C.bgSoft, color: step.color,
            padding: '2px 8px', borderRadius: RADIUS.sm,
            border: `1px solid ${C.line}`,
          }}>{step.formula}</code>
        </div>
        <div style={{
          marginTop: 4, fontSize: 11, color: C.inkDim, fontWeight: 600,
        }}>{step.source}</div>
        <div style={{
          marginTop: 6, fontSize: 12, color: C.inkSoft, lineHeight: 1.5,
        }}>{step.detail}</div>
      </div>
    </div>
  );
}

function FormulaSummary() {
  return (
    <div style={{
      marginTop: 20,
      padding: '16px 20px',
      background: 'linear-gradient(135deg, #fff8f3 0%, #fff 100%)',
      border: `2px solid ${C.orange}`,
      borderRadius: RADIUS.md,
    }}>
      <div style={{
        fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase',
        color: C.orange, fontWeight: 700, marginBottom: 8,
      }}>Formule consolidée</div>
      <pre style={{
        margin: 0,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12, color: C.ink, lineHeight: 1.7,
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>{`PRIX_BASE      = Σ(nuits × tarif_jour × catégorie_hébergement)
COMPLÉMENTS    + Σ(suppléments × quantité × nuits)
                + (Nb_pers_supp × tarif_pers × nuits)
DYNAMIQUE      × (1 + facteur_RM_yield)              [CRS uniquement]
PROMOS         − Σ(remises % ou € · codes promo)
B2B            ↳ remplace base si TO/CE/Résident
TAXE_SÉJOUR    + (adultes_éligibles × nuits × tarif_commune)
TVA            + TVA (ventilation par ligne)
ARRONDIS       → ROUND(règle M27)
                ───────────────────────
NET_À_PAYER    = total final
ACOMPTE        − déjà encaissé
                ───────────────────────
SOLDE_DÛ       = à régler avant J-X`}</pre>
    </div>
  );
}

function SectionBlock({ section, items }) {
  const ms = useMemo(() => items.filter(c => section.modules.includes(c.numModule)), [items, section.modules]);
  const Icon = section.icon;

  return (
    <Card padding={0} style={{ overflow: 'hidden', borderTop: `3px solid ${section.color}` }}>
      <div style={{
        padding: '16px 20px', borderBottom: `1px solid ${C.line}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={15} color={section.color} strokeWidth={2.2} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{section.title}</div>
            <div style={{ fontSize: 11, color: C.inkDim, marginTop: 2 }}>{section.sub}</div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {section.modules.map(m => (
            <span key={m} style={{
              padding: '3px 8px', borderRadius: RADIUS.sm,
              background: C.bgSoft, border: `1px solid ${C.line}`,
              fontSize: 10, fontWeight: 700, color: section.color,
              letterSpacing: '0.04em',
            }}>{m}</span>
          ))}
          <span style={{
            padding: '3px 8px', borderRadius: RADIUS.sm,
            background: section.color, color: '#fff',
            fontSize: 10, fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
          }}>{ms.length} fenêtres</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <ul style={{
          margin: 0, paddingLeft: 18,
          fontSize: 12, color: C.inkSoft, lineHeight: 1.65,
        }}>
          {section.notes.map((n, i) => (
            <li key={i} style={{ marginBottom: 4 }}>{n}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function LifecycleFlow() {
  const stages = [
    { label: 'Devis', mod: 'M02', color: C.blue,   detail: 'Simulation prix, ventilation lignes, PDF client' },
    { label: 'Option', mod: 'M02', color: C.amber, detail: 'Bloque dispo avec deadline + expiration auto' },
    { label: 'Réservation', mod: 'M02→M03', color: C.purple, detail: 'Conversion + acompte → fiche séjour ouverte' },
    { label: 'Séjour', mod: 'M03', color: C.green, detail: 'Check-in, ajouts in-stay (suppléments, ventes POS)' },
    { label: 'Facturation', mod: 'M16', color: C.red,   detail: 'Facture acompte → finale, ventilation TVA' },
    { label: 'Encaissement', mod: 'M13', color: C.orange, detail: 'Solde, rapprochement, restitution caution' },
  ];
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <CardHeader icon={ArrowRight} title="Cycle de vie du prix" sub="Du devis à l'encaissement final" />
      <div style={{
        padding: '20px 24px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'stretch',
        gap: 8,
      }}>
        {stages.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', flex: '1 1 160px', minWidth: 160 }}>
            <div style={{
              flex: 1,
              padding: '12px 14px',
              background: C.bgSoft,
              border: `1px solid ${C.line}`,
              borderTop: `3px solid ${s.color}`,
              borderRadius: RADIUS.md,
            }}>
              <div style={{
                fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: s.color, fontWeight: 700,
              }}>{s.mod}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, margin: '4px 0' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: C.inkDim, lineHeight: 1.4 }}>{s.detail}</div>
            </div>
            {i < stages.length - 1 && (
              <ChevronRight size={16} color={C.gray300} strokeWidth={2} style={{ flexShrink: 0, margin: '0 -4px' }} />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function SolutionBadge({ solutions }) {
  if (!solutions || solutions.length === 0) {
    return <span style={{ color: C.inkMute, fontSize: 11 }}>—</span>;
  }
  return (
    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
      {solutions.map(s => {
        const isPms = s === SOL_PMS;
        const color = isPms ? C.blue : C.purple;
        const label = isPms ? 'PMS' : 'CRS';
        const Icon = isPms ? Server : Globe;
        return (
          <span key={s} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: RADIUS.sm,
            background: `${color}15`, color,
            border: `1px solid ${color}40`,
            fontSize: 10, fontWeight: 700,
          }} title={s}>
            <Icon size={10} strokeWidth={2.4} />
            {label}
          </span>
        );
      })}
    </div>
  );
}

function th(extra = {}) {
  return {
    textAlign: 'left', padding: '10px 12px',
    fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: C.gray400, fontWeight: 700,
    borderBottom: `1px solid ${C.gray200}`,
    whiteSpace: 'nowrap', verticalAlign: 'middle',
    ...extra,
  };
}
function td(extra = {}) {
  return {
    padding: '10px 12px', fontSize: 12,
    whiteSpace: 'nowrap',
    ...extra,
  };
}
