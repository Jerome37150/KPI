import { useMemo } from 'react';
import {
  Calculator, Layers, Globe, Server,
  Tag, Percent, Receipt, Banknote, Coins, ShieldCheck,
  ArrowDownRight, Table as TableIcon,
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

const ALL_CHANNELS    = Object.keys(CHANNELS);
const BOOKING_CHANNELS = ['DIRECT','OTA','WALKIN','TO','CE','RESIDENT']; // hors POS

// ── Pipeline de calcul prix : étapes ordonnées ───────────────────────────
const PIPELINE = [
  { step: 1, color: C.orange, title: "Tarif de base",
    formula: "Σ (nuits × tarif_jour × catégorie_hébergement)",
    source: "M27 · Tables de prix",
    detail: "Grille tarifaire par hébergement × période × jour. Modulée par les règles enfants/adultes, le minimum/maximum de séjour, le supplément personne au-delà de la capacité standard." },
  { step: 2, color: C.blue, title: "Compléments tarifaires",
    formula: "+ Σ (suppléments × quantité × nuits)",
    source: "M27 · Suppléments tarifaires · M03 · Grille des suppléments",
    detail: "Réfrigérateur, draps, animal, véhicule supplémentaire, raccordement, etc. Catalogue maintenu en M12 (suppléments / matériel) + grille M03 spécifique au séjour." },
  { step: 3, color: C.purple, title: "Pricing dynamique (yield)",
    formula: "× (1 + facteur_occupation + facteur_canal)",
    source: "M10 · CRS",
    detail: "Le CRS module le prix selon le taux d'occupation, le segment client (Direct / OTA / TO / CE) et la durée de séjour (early-booking / last-minute). Hors CRS, le tarif reste celui de la grille de base." },
  { step: 4, color: C.amber, title: "Promotions & codes promo",
    formula: "− Σ (réductions %) ou − Σ (montants €)",
    source: "M10 · Promotions · Codes promo",
    detail: "Une promotion peut être saisonnière, basée sur un canal, conditionnée à un code, ou auto-déclenchée (last-minute, early-booking). Cumul ou exclusion selon le paramétrage." },
  { step: 5, color: C.green, title: "Tarifs négociés B2B",
    formula: "OU remplace le tarif base si TO/CE/Résident",
    source: "M06 · Grilles tarifaires TO · M07 · Tarifs négociés CE · M08 · Contrat résident",
    detail: "Si le séjour est rattaché à un partenaire B2B, on applique la grille négociée du contrat. Plafonds et subventions CE sont gérés séparément (M07 · Plafonds & subventions CE)." },
  { step: 6, color: C.red, title: "Taxe de séjour",
    formula: "+ (adultes × nuits × tarif_commune)",
    source: "M17 · Taxe de séjour · Calcul automatique sur séjour",
    detail: "Calcul automatique selon la configuration communale, exemptions (enfants, étudiants, etc.). Déclaration EDIFICT vers la commune." },
  { step: 7, color: C.inkSoft, title: "TVA",
    formula: "+ TVA (intégrée ou séparée)",
    source: "M27 · Multi-TVA · Taxes intégrées vs séparées",
    detail: "Multi-taux selon la nature de la ligne (hébergement, restauration, vente boutique, ménage, etc.). Affichage TTC ou HT+TVA selon le paramètre établissement." },
  { step: 8, color: C.orange, title: "Arrondis & présentation",
    formula: "→ ROUND (selon règle M27)",
    source: "M27 · Arrondis",
    detail: "Arrondi à 0,01 € / 0,05 € / 0,10 € / 1 € selon le segment et la stratégie commerciale. Cohérent avec l'affichage public (CRS) et l'édition devis (PMS)." },
];

// ── Sections fonctionnelles ─────────────────────────────────────────────
const SECTIONS = [
  { key:'parametres', title:'Référentiels tarifaires', sub:'Paramètres saisonniers — fondations du calcul', color:C.orange, icon:Layers, modules:['M27'],
    notes:[
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
    ] },
  { key:'rm', title:'Pricing dynamique & promotions', sub:'Revenue management côté CRS en ligne', color:C.purple, icon:Percent, modules:['M10'],
    notes:[
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
    ] },
  { key:'b2b', title:'Tarification B2B', sub:'Partenaires commerciaux : TO, CE, résidents', color:C.blue, icon:Tag, modules:['M06','M07','M08'],
    notes:[
      "Grilles tarifaires TO : prix négociés par tour-opérateur (rétrocession, vouchers).",
      "Conditions commerciales TO : commission, délais d'annulation, allotements.",
      "Tarifs négociés CE : barème CE + plafonds & subventions partielles.",
      "Bons CE / chèques-vacances ANCV : moyens de paiement spécifiques B2B.",
      "Contrats résidents (longue durée) : bail, loyer, charges, refacturation conso.",
      "Échéancier de paiement résident : facturation mensuelle automatique.",
      "Rapport de production par TO / CE : volume négocié × tarif × commission.",
    ] },
  { key:'devis', title:'Devis & séjour : application du prix', sub:'Du devis prévisionnel au prix final facturé', color:C.green, icon:Calculator, modules:['M02','M03'],
    notes:[
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
    ] },
  { key:'pos', title:'Ventes réception (POS)', sub:'Boutique, restauration, prestations annexes', color:C.amber, icon:Receipt, modules:['M18'],
    notes:[
      "Ventes rapides : caisse type POS, articles fréquents en accès direct.",
      "Sélection articles + Panier : prix article × quantité, TVA par article.",
      "Encaissement : multi-règlement (espèces, CB, chèque, cashless, espace client).",
      "Affecter vente à un séjour : ajoute la ligne au compte séjour (facturation finale).",
      "Vente hors séjour : ticket autonome (passant, client occasionnel).",
      "Annulation / remboursement de vente : avoir si déjà facturé.",
    ] },
  { key:'encaissement', title:'Encaissement & cautions', sub:'Flux de règlement (acompte, solde, partiel, en ligne)', color:C.orange, icon:Banknote, modules:['M13','M14','M15'],
    notes:[
      "Saisie paiement / Paiements partiels : un séjour peut avoir N paiements.",
      "Échéancier de paiement : acompte à la résa + solde à J-X.",
      "Paiements en ligne (espace client + web booking) : interface PSP intégrée.",
      "Journal des encaissements : flux quotidien tous moyens confondus.",
      "Contrôle des règlements / Rapprochement bancaire : matching banque ↔ PMS.",
      "Relances impayés / Remboursements / Report de solde client.",
      "Caisse : ouverture / fermeture quotidienne, multi-caisses, transferts.",
      "Remises en banque : bordereau, contrôle de caisse.",
      "Cautions : empreinte CB, prise, restitution, partielle, litiges & retenues.",
    ] },
  { key:'facturation', title:'Facturation', sub:'Documents légaux et numérotation', color:C.red, icon:Receipt, modules:['M16'],
    notes:[
      "Facture d'acompte : émise dès le 1er encaissement.",
      "Facture finale : ventile l'intégralité du séjour à la sortie.",
      "Facture résident : facturation mensuelle automatique (M08).",
      "Facture groupes / TO / CE : facturation séparée selon contrat.",
      "Émission multi-séjour : regroupe plusieurs séjours sur 1 facture (TO, groupes).",
      "Avoirs & rectifications : annulation comptable, rectification a posteriori.",
      "Facturier : numérotation chronologique séquentielle (obligation légale).",
      "Réimpression / duplicata : copie conforme avec mention duplicata.",
    ] },
  { key:'taxes', title:'Taxes & fiscalité', sub:'Taxe de séjour, TVA, exports comptables', color:C.inkSoft, icon:ShieldCheck, modules:['M17'],
    notes:[
      "Configuration taxe de séjour : par commune, tarif par catégorie, exemptions.",
      "Calcul automatique sur séjour : (adultes éligibles × nuits × tarif).",
      "États de taxe de séjour + Déclaration EDIFICT : envoi mensuel commune.",
      "États TVA / Journal TVA détaillé : ventilation par taux pour comptable.",
      "Exports comptables : FEC, journal des ventes, journaux fiscaux.",
      "Archivage légal : conservation 10 ans (factures, tickets, journaux).",
    ] },
];

// ── Tableau exhaustif : éléments du calcul prix ─────────────────────────
// Chaque ligne = un élément facturable / variable de calcul.
// Colonnes : Catégorie · Élément · Variables d'entrée · Composants tarif/taxe · Canaux applicables · Module
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
export function CalculPrixPage({ data }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionTitle
        overline="NAX7 full web"
        icon={Calculator}
        sub="Synthèse de la chaîne de calcul prix — 160 fenêtres pricing/finance sur 13 modules"
      >Calcul prix</SectionTitle>

      {/* Bandeau stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <StatCard icon={Layers} label="Fenêtres pricing"   value={stats.total}   accent={C.orange} />
        <StatCard icon={Server} label="PMS (off-line)"      value={stats.pms}     accent={C.blue} sub="Inaxel" />
        <StatCard icon={Globe}  label="CRS (en ligne)"      value={stats.crs}     accent={C.purple} sub="C tout Vert" />
        <StatCard icon={Coins}  label="Modules concernés"   value={stats.modules} accent={C.green} />
      </div>

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
        <CardHeader
          icon={TableIcon}
          title={`Éléments du calcul prix · ${PRICING_ELEMENTS.length} variables référencées`}
          sub="Tous les éléments facturables / paramètres entrant dans le calcul, par catégorie"
        />
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
      <Card padding={20} style={{ borderTop: `3px solid ${C.blue}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Server size={15} color={C.blue} strokeWidth={2.2} />
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>PMS off-line · Inaxel</div>
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
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>CRS en ligne · C tout Vert</div>
        </div>
        <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55, marginBottom: 12 }}>
          Le central de réservation en ligne. <b>Pilote dynamiquement</b> les prix
          publiés (yield, segments, durée), gère les <b>promotions</b> et
          <b> restrictions</b>, et synchronise avec les <b>OTA</b> et le site web direct.
        </div>
        <ModuleList modules={[{ num: 'M10', label: 'Tarifs & revenue management' }]} accent={C.purple} />
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
    }}>
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
