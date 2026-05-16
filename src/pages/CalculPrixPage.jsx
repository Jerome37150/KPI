import { Calculator, Table as TableIcon } from 'lucide-react';
import { C, RADIUS } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';

// ============================================
// CalculPrixPage — analyse pricing NAX7 full web
// Tableau exhaustif des variables et composants de prix + légende des canaux.
// ============================================

// ── Canaux clients : online / offline B2C / offline B2B / POS ───────────
const CHANNELS = {
  DIRECT:   { label: 'Direct site',    color: '#10b981', kind: 'online' },
  OTA:      { label: 'OTA',            color: '#3b82f6', kind: 'online' },
  WALKIN:   { label: 'Walk-in / Tél',  color: '#64748b', kind: 'offline-b2c' },
  TO:       { label: 'TO / Agence',    color: '#8b5cf6', kind: 'offline-b2b' },
  CE:       { label: 'CE / Collec.',   color: '#ec4899', kind: 'offline-b2b' },
  RESIDENT: { label: 'Résident',       color: '#f59e0b', kind: 'offline-b2b' },
  POS:      { label: 'POS sur place',  color: '#dc2626', kind: 'offline-pos' },
};

const BOOKING_CHANNELS = ['DIRECT','OTA','WALKIN','TO','CE','RESIDENT']; // hors POS

// ── Tableau exhaustif : éléments du calcul prix ─────────────────────────
const PRICING_ELEMENTS = [
  // === HÉBERGEMENT ===
  { catg:'Hébergement', catgColor:C.blue, item:'Locatif (nuit)',
    desc:'Tarif principal de l\'hébergement à la nuit',
    vars:['Dates arrivée/départ','Nb nuits','Hébergement','Catégorie','Adultes','Enfants','Capacité standard'],
    prices:['Tarif jour (grille)','Suppl. personne au-delà capacité','Règle enfants/adultes','TVA 10%'],
    channels:BOOKING_CHANNELS, module:'M27/M03' },
  { catg:'Hébergement', catgColor:C.blue, item:'Forfait long séjour',
    desc:'Tarif dégressif semaine / quinzaine / mois',
    vars:['Durée totale','Hébergement','Période','Type contrat'],
    prices:['Barème durée (M27)','Forfait mensuel','Charges incluses ou non','TVA 10%'],
    channels:['WALKIN','RESIDENT'], module:'M27/M08' },
  { catg:'Hébergement', catgColor:C.blue, item:'Allotement / contingent',
    desc:'Inventaire pré-réservé pour un TO ou CE',
    vars:['Partenaire (TO/CE)','Période','Nb unités allouées','Date de rétrocession'],
    prices:['Grille négociée du contrat','Commission TO (%)','TVA 10%'],
    channels:['TO','CE'], module:'M06/M07' },
  { catg:'Hébergement', catgColor:C.blue, item:'Loyer résidentiel mensuel',
    desc:'Facturation mensuelle d\'un résident long terme',
    vars:['Bail','Hébergement','Mois facturé','Index révision'],
    prices:['Loyer base','Provisions charges','Taxes locatives','TVA selon régime'],
    channels:['RESIDENT'], module:'M08' },

  // === COMPLÉMENTS TARIFAIRES ===
  { catg:'Suppléments', catgColor:C.amber, item:'Personne supplémentaire',
    desc:'Au-delà de la capacité standard de l\'hébergement',
    vars:['Nb pers. supp','Adulte ou enfant','Nuits'],
    prices:['Tarif/pers/nuit (M27)','Règle enfants (gratuité, demi-tarif)','TVA 10%'],
    channels:BOOKING_CHANNELS, module:'M27/M03' },
  { catg:'Suppléments', catgColor:C.amber, item:'Animal',
    desc:'Chien/chat — forfait séjour ou par nuit',
    vars:['Nb animaux','Espèce','Nuits'],
    prices:['Tarif forfait ou nuit','TVA 10%'],
    channels:BOOKING_CHANNELS, module:'M03' },
  { catg:'Suppléments', catgColor:C.amber, item:'Véhicule supplémentaire',
    desc:'2e voiture, camping-car, remorque',
    vars:['Type véhicule','Immatriculation','Nuits'],
    prices:['Tarif/véhicule/nuit','TVA 10%'],
    channels:BOOKING_CHANNELS, module:'M03' },
  { catg:'Suppléments', catgColor:C.amber, item:'Linge / kit ménage',
    desc:'Draps, serviettes, ménage de sortie',
    vars:['Nb kits','Type prestation','Personnes'],
    prices:['Tarif unitaire','TVA 20%'],
    channels:BOOKING_CHANNELS, module:'M03' },
  { catg:'Suppléments', catgColor:C.amber, item:'Électricité / fluides',
    desc:'Forfait ou consommation réelle au compteur',
    vars:['Type forfait / relevé compteur','Période','kWh / m³'],
    prices:['Forfait quotidien ou tarif unitaire','Abonnement','TVA 20%'],
    channels:['WALKIN','TO','CE','RESIDENT'], module:'M03/M08' },
  { catg:'Suppléments', catgColor:C.amber, item:'Climatisation / chauffage',
    desc:'Option payante selon saison',
    vars:['Nuits','Saison'],
    prices:['Tarif/nuit','TVA 20%'],
    channels:BOOKING_CHANNELS, module:'M27' },
  { catg:'Suppléments', catgColor:C.amber, item:'Cashless / bracelet',
    desc:'Bracelet RFID rechargeable du séjour',
    vars:['Nb bracelets','Type','Montant chargé'],
    prices:['Caution bracelet','Crédit initial','Recharges (POS)'],
    channels:BOOKING_CHANNELS, module:'M03' },

  // === PRESTATIONS POS / VENTES RÉCEPTION ===
  { catg:'POS (sur place)', catgColor:'#dc2626', item:'Vente boutique',
    desc:'Articles épicerie, souvenirs, équipement',
    vars:['Article','Quantité','Séjour rattaché ou ticket libre'],
    prices:['Prix unitaire catalogue','Remise éventuelle','TVA 20% / 5,5% (alim.)'],
    channels:['POS'], module:'M18' },
  { catg:'POS (sur place)', catgColor:'#dc2626', item:'Restauration / bar',
    desc:'Repas, boissons, snacks au restaurant ou bar',
    vars:['Carte','Quantité','Table/Séjour'],
    prices:['Prix carte','Happy hour','Menu fixe','TVA 10% (sur place) / 5,5% (à emporter)'],
    channels:['POS'], module:'M18' },
  { catg:'POS (sur place)', catgColor:'#dc2626', item:'Prestations annexes',
    desc:'Excursions, animations payantes, location matériel',
    vars:['Prestation','Nb pers','Date'],
    prices:['Tarif fixe','TVA 10% / 20%'],
    channels:['POS'], module:'M18' },
  { catg:'POS (sur place)', catgColor:'#dc2626', item:'Demi/pension complète',
    desc:'Forfait restauration adossé au séjour',
    vars:['Nuits','Nb adultes','Nb enfants','Formule'],
    prices:['Forfait/pers/jour','TVA 10%'],
    channels:BOOKING_CHANNELS, module:'M03/M18' },
  { catg:'POS (sur place)', catgColor:'#dc2626', item:'Pré-commande pain',
    desc:'Boulangerie quotidienne avec retrait sur place',
    vars:['Article','Date livraison','Quantité'],
    prices:['Prix unitaire','TVA 5,5%'],
    channels:['POS'], module:'M18' },

  // === PROMOTIONS / REMISES ===
  { catg:'Promotions', catgColor:C.purple, item:'Promotion saisonnière',
    desc:'Campagne datée appliquée à un canal/segment',
    vars:['Période','Hébergement éligible','Canal','Conditions cumul'],
    prices:['Remise % ou €','Plafond éventuel'],
    channels:['DIRECT','OTA','WALKIN'], module:'M10' },
  { catg:'Promotions', catgColor:C.purple, item:'Code promo',
    desc:'Saisi manuellement par le client en réservation',
    vars:['Code','Usage unique ou multi','Période validité','Conditions'],
    prices:['Remise % ou €','Plafond','Hébergements éligibles'],
    channels:['DIRECT','OTA','WALKIN'], module:'M10' },
  { catg:'Promotions', catgColor:C.purple, item:'Last-minute',
    desc:'Auto-déclenché si arrivée < N jours',
    vars:['Délai avant arrivée','Hébergement','Saison'],
    prices:['Remise % paramétrée','Plafond'],
    channels:['DIRECT','OTA'], module:'M10' },
  { catg:'Promotions', catgColor:C.purple, item:'Early-booking',
    desc:'Auto-déclenché si résa > N jours avant arrivée',
    vars:['Délai avant arrivée','Hébergement','Saison'],
    prices:['Remise % paramétrée','Plafond'],
    channels:['DIRECT','OTA'], module:'M10' },
  { catg:'Promotions', catgColor:C.purple, item:'Tarif par durée (dégressif)',
    desc:'Réduction à partir de N nuits',
    vars:['Durée séjour','Hébergement','Période'],
    prices:['Barème dégressif (M27)','% par palier'],
    channels:BOOKING_CHANNELS, module:'M27/M10' },
  { catg:'Promotions', catgColor:C.purple, item:'Surclassement (upgrade)',
    desc:'Catégorie supérieure offerte selon dispo',
    vars:['Hébergement réservé','Hébergement upgrade dispo'],
    prices:['Différentiel offert','Aucune ligne facturée'],
    channels:['DIRECT','OTA','WALKIN'], module:'M10' },
  { catg:'Promotions', catgColor:C.purple, item:'Remise commerciale manuelle',
    desc:'Saisie en direct par la réception',
    vars:['Motif','Montant ou %','Plafond utilisateur'],
    prices:['Remise % ou € libre'],
    channels:['WALKIN'], module:'M03' },

  // === TARIFS B2B NÉGOCIÉS ===
  { catg:'Tarifs B2B', catgColor:'#0ea5e9', item:'Grille TO',
    desc:'Tarif négocié par tour-opérateur',
    vars:['Partenaire TO','Hébergement','Période','Allotement'],
    prices:['Grille TO (remplace base)','Commission TO (%)','Net réceptif'],
    channels:['TO'], module:'M06' },
  { catg:'Tarifs B2B', catgColor:'#0ea5e9', item:'Tarif négocié CE',
    desc:'Barème spécifique pour comité d\'entreprise',
    vars:['CE','Hébergement','Période','Plafond / subvention'],
    prices:['Grille CE','Subvention CE (% pris en charge)','Reste à charge salarié'],
    channels:['CE'], module:'M07' },
  { catg:'Tarifs B2B', catgColor:'#0ea5e9', item:'Bon ANCV / chèque-vacances',
    desc:'Moyen de paiement subventionné',
    vars:['Type bon','Montant','Validité'],
    prices:['Valeur faciale','Commission émetteur (le cas échéant)'],
    channels:['CE','WALKIN'], module:'M07/M13' },
  { catg:'Tarifs B2B', catgColor:'#0ea5e9', item:'Voucher TO',
    desc:'Bon d\'échange émis par le tour-opérateur',
    vars:['Numéro voucher','TO','Séjour','Validité'],
    prices:['Pré-payé par TO','Facturation post-séjour vers TO'],
    channels:['TO'], module:'M06' },

  // === CAUTIONS / DÉPÔTS DE GARANTIE ===
  { catg:'Cautions', catgColor:'#84cc16', item:'Caution hébergement',
    desc:'Empreinte CB ou caution encaissée',
    vars:['Hébergement','Type caution','Montant'],
    prices:['Montant fixe paramétré','Pré-autorisation CB ou encaissement réel'],
    channels:BOOKING_CHANNELS, module:'M15' },
  { catg:'Cautions', catgColor:'#84cc16', item:'Caution bracelet/badge',
    desc:'Caution sur dispositif électronique remis au client',
    vars:['Type dispositif','Quantité'],
    prices:['Montant fixe','Restitué au retour'],
    channels:BOOKING_CHANNELS, module:'M15' },
  { catg:'Cautions', catgColor:'#84cc16', item:'Retenue sur caution',
    desc:'Litige, dégradation, ménage non rendu',
    vars:['Motif retenue','Montant','Justificatif'],
    prices:['Montant retenu','Avoir partiel','TVA selon nature'],
    channels:BOOKING_CHANNELS, module:'M15/M16' },

  // === TAXES ===
  { catg:'Taxes', catgColor:C.red, item:'Taxe de séjour',
    desc:'Reversement à la commune',
    vars:['Adultes éligibles','Nuits','Commune','Exemptions (enfants, étudiants...)'],
    prices:['Tarif communal/personne/nuit','Cumul plafonné (selon barème)'],
    channels:BOOKING_CHANNELS, module:'M17' },
  { catg:'Taxes', catgColor:C.red, item:'TVA hébergement',
    desc:'Taux réduit sur location de courte durée',
    vars:['Nature ligne'],
    prices:['TVA 10%'],
    channels:BOOKING_CHANNELS, module:'M17/M27' },
  { catg:'Taxes', catgColor:C.red, item:'TVA restauration',
    desc:'Sur place / à emporter / boissons alcoolisées',
    vars:['Type produit','Mode consommation'],
    prices:['TVA 10% (sur place repas)','TVA 5,5% (alim. à emporter)','TVA 20% (alcool)'],
    channels:['POS'], module:'M17' },
  { catg:'Taxes', catgColor:C.red, item:'TVA boutique / services',
    desc:'Taux normal sur la majorité des ventes annexes',
    vars:['Type produit'],
    prices:['TVA 20%','TVA 5,5% (livre, alim. de base)'],
    channels:['POS'], module:'M17' },

  // === ACOMPTE / FACTURATION ===
  { catg:'Encaissement', catgColor:C.orange, item:'Acompte initial',
    desc:'À la résa, montant ou % paramétré',
    vars:['Segment','Canal','Date résa vs date arrivée','Montant séjour'],
    prices:['% du total ou montant fixe (M27)','Délai de paiement'],
    channels:BOOKING_CHANNELS, module:'M13/M27' },
  { catg:'Encaissement', catgColor:C.orange, item:'Solde séjour',
    desc:'Avant arrivée (J-X) ou au check-out',
    vars:['Échéance contractuelle','Acompte déjà encaissé'],
    prices:['Total - acompte','Aucune TVA additionnelle (déjà ventilée)'],
    channels:BOOKING_CHANNELS, module:'M13' },
  { catg:'Encaissement', catgColor:C.orange, item:'Paiement partiel',
    desc:'Échéancier custom ou paiement en plusieurs fois',
    vars:['Nb échéances','Dates','Montants'],
    prices:['Sous-total par échéance','Pas de frais (sauf paramétrage CB X3)'],
    channels:BOOKING_CHANNELS, module:'M13' },
  { catg:'Encaissement', catgColor:C.orange, item:'Paiement en ligne',
    desc:'Via PSP intégré (CB, Apple Pay, etc.)',
    vars:['Moyen','Montant','Référence transaction'],
    prices:['Montant','Commission PSP (interne, non facturée client)'],
    channels:['DIRECT','OTA','RESIDENT'], module:'M13' },

  // === PÉNALITÉS / ANNULATION ===
  { catg:'Pénalités', catgColor:'#94a3b8', item:'Frais d\'annulation',
    desc:'Selon politique du contrat / canal',
    vars:['Délai avant arrivée','Politique','Segment'],
    prices:['% du séjour selon barème','Ou montant fixe'],
    channels:BOOKING_CHANNELS, module:'M03' },
  { catg:'Pénalités', catgColor:'#94a3b8', item:'No-show',
    desc:'Client absent à la date d\'arrivée',
    vars:['Heure de bascule','Acompte encaissé'],
    prices:['1ère nuit ou intégralité (selon politique)','TVA appliquée'],
    channels:BOOKING_CHANNELS, module:'M03' },

  // === REFACTURATION RÉSIDENTS ===
  { catg:'Refacturation', catgColor:'#f59e0b', item:'Charges résident',
    desc:'Mensualisation des consommations (eau, élec, ordures)',
    vars:['Période','Relevé compteur','Tarif unitaire'],
    prices:['Consommation × tarif','Régularisation annuelle','TVA 20%'],
    channels:['RESIDENT'], module:'M08' },
  { catg:'Refacturation', catgColor:'#f59e0b', item:'Sous-location',
    desc:'Quote-part propriétaire sur sous-location',
    vars:['Sous-locataire','Période','% reversement'],
    prices:['Reversement propriétaire','Commission gestion','TVA 20%'],
    channels:['RESIDENT'], module:'M08' },
];

const CATEGORY_ORDER = [...new Set(PRICING_ELEMENTS.map(e => e.catg))];

// ── Composant principal ──────────────────────────────────────────────────
export function CalculPrixPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web"
        icon={Calculator}
        sub="Variables et composants entrant dans le calcul du prix"
      >Calcul prix</SectionTitle>

      {/* Légende canaux */}
      <Card padding={20}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <TableIcon size={15} color={C.orange} strokeWidth={2.2} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>Canaux clients · légende</div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11 }}>
          <ChannelLegendGroup label="En ligne (online)" channels={['DIRECT','OTA']} />
          <ChannelLegendGroup label="Hors ligne B2C"    channels={['WALKIN']} />
          <ChannelLegendGroup label="Hors ligne B2B"    channels={['TO','CE','RESIDENT']} />
          <ChannelLegendGroup label="Sur place (POS)"   channels={['POS']} />
        </div>
      </Card>

      {/* Tableau exhaustif : éléments du calcul prix */}
      <Card padding={0} style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.line}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TableIcon size={13} color={C.orange} strokeWidth={2.2} />
            <div>
              <div style={{
                fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: C.orange, fontWeight: 700,
              }}>Éléments du calcul prix · {PRICING_ELEMENTS.length} variables référencées</div>
              <div style={{ fontSize: 11, color: C.inkDim, marginTop: 2 }}>
                Tous les éléments facturables / paramètres entrant dans le calcul, par catégorie
              </div>
            </div>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.gray50 }}>
                <th style={th({ minWidth: 130 })}>Catégorie</th>
                <th style={th({ minWidth: 200 })}>Élément</th>
                <th style={th({ minWidth: 240 })}>Variables d'entrée</th>
                <th style={th({ minWidth: 240 })}>Composants tarif / taxe</th>
                <th style={th({ minWidth: 200 })}>Canaux applicables</th>
                <th style={th({ minWidth: 90 })}>Module</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ORDER.map(catg => {
                const rows = PRICING_ELEMENTS.filter(e => e.catg === catg);
                return rows.map((e, idx) => {
                  const isFirstOfGroup = idx === 0;
                  const isLastOfGroup = idx === rows.length - 1;
                  return (
                    <tr key={catg + '-' + idx} style={{
                      borderBottom: isLastOfGroup ? `2px solid ${C.line}` : `1px solid ${C.gray100}`,
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.012)',
                    }}>
                      <td style={{ ...td(), verticalAlign: 'top', paddingTop: 14 }}>
                        {isFirstOfGroup && (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px', borderRadius: RADIUS.sm,
                            background: e.catgColor + '15', color: e.catgColor,
                            border: `1px solid ${e.catgColor}40`,
                            fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
                          }}>{e.catg}</span>
                        )}
                      </td>
                      <td style={{ ...td(), verticalAlign: 'top', paddingTop: 14, whiteSpace: 'normal' }}>
                        <div style={{ fontWeight: 700, color: C.ink, fontSize: 12.5 }}>{e.item}</div>
                        <div style={{ fontSize: 11, color: C.inkDim, marginTop: 3, lineHeight: 1.4 }}>{e.desc}</div>
                      </td>
                      <td style={{ ...td(), verticalAlign: 'top', paddingTop: 12, whiteSpace: 'normal' }}>
                        <ChipList items={e.vars} color={C.inkSoft} bg={C.gray50} border={C.gray200} />
                      </td>
                      <td style={{ ...td(), verticalAlign: 'top', paddingTop: 12, whiteSpace: 'normal' }}>
                        <ChipList items={e.prices} color={C.orange} bg={'#fff8f3'} border={'#fcd7bd'} />
                      </td>
                      <td style={{ ...td(), verticalAlign: 'top', paddingTop: 12, whiteSpace: 'normal' }}>
                        <ChannelChips channels={e.channels} />
                      </td>
                      <td style={{ ...td(), verticalAlign: 'top', paddingTop: 14, color: C.inkSoft, fontWeight: 600 }}>
                        {e.module}
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Sous-composants ──────────────────────────────────────────────────────

function ChipList({ items, color, bg, border }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {items.map((v, i) => (
        <span key={i} style={{
          padding: '3px 8px', borderRadius: RADIUS.sm,
          background: bg, color, border: `1px solid ${border}`,
          fontSize: 10.5, fontWeight: 600, lineHeight: 1.4,
        }}>{v}</span>
      ))}
    </div>
  );
}

function ChannelChips({ channels }) {
  if (!channels || channels.length === 0) {
    return <span style={{ color: C.inkMute, fontSize: 11 }}>—</span>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {channels.map(c => {
        const def = CHANNELS[c];
        if (!def) return null;
        return (
          <span key={c} style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 8px', borderRadius: RADIUS.sm,
            background: def.color + '15', color: def.color,
            border: `1px solid ${def.color}40`,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.01em',
          }} title={`${def.label} (${def.kind})`}>
            {def.label}
          </span>
        );
      })}
    </div>
  );
}

function ChannelLegendGroup({ label, channels }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, color: C.gray400,
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
      }}>{label}</div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {channels.map(c => {
          const def = CHANNELS[c];
          return (
            <span key={c} style={{
              padding: '3px 8px', borderRadius: RADIUS.sm,
              background: def.color + '15', color: def.color,
              border: `1px solid ${def.color}40`,
              fontSize: 10.5, fontWeight: 700,
            }}>{def.label}</span>
          );
        })}
      </div>
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
