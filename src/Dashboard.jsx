import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowUp, ArrowDown, Minus, Calendar, CheckCircle2, Clock,
  RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Sparkles, ArrowRight,
  Inbox, TrendingUp, Target, Eye, X, AlertCircle,
  LogOut, Lock, User as UserIcon, EyeOff,
} from "lucide-react";

// ============================================
// PALETTE INAXEL
// ============================================
const C = {
  bg: "#FFFFFF",
  bgSoft: "#F8F8F6",
  paper: "#FFFFFF",
  ink: "#1A1A1A",
  inkSoft: "#4A4A4A",
  inkDim: "#7A7A7A",
  inkMute: "#B8B8B8",
  line: "#E8E8E6",
  lineDark: "#D4D4D0",
  orange: "#E85D1F",
  orangeDark: "#C84A12",
  orangeSoft: "#FFF1E9",
  green: "#15803D",
  greenSoft: "#F0FDF4",
  blue: "#1E40AF",
  blueSoft: "#EFF6FF",
  amber: "#B45309",
  amberSoft: "#FFFBEB",
  red: "#B91C1C",
  redSoft: "#FEF2F2",
  purple: "#6D28D9",
  purpleSoft: "#F5F3FF",
  // Couleurs claires dédiées aux équipes/estimations
  teamBack: "#4ADE80",   // vert clair
  teamFront: "#60A5FA",  // bleu clair
  teamPoTest: "#F472B6", // rose clair
};

const CLASSIF_COLORS = {
  "BUG D'USAGE": C.amber,
  "BUG OPERATIONNEL": "#EA580C",
  "BUG STRUCTURANT": C.red,
  "DEV avec CC": C.green,
  "DEV sans CC": C.blue,
  "STACK TECH": "#525252",
  "DATA HUB - CTV": "#7C2D12",
};

const STATUT_COLORS = {
  "FAIT": C.green,
  "Fait partiellement": "#65A30D",
  "En cours": C.blue,
  "A planifier": C.purple,
  "A etudier": C.amber,
  "Stand by": "#737373",
  "Abandon": "#525252",
  "A prevoir TOP LINE": C.orange,
};

// ============================================
// HELPERS DATES
// ============================================
const MOIS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MOIS_FR_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const SPRINT_LABEL_MAP = ["JANVIER", "FEVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DECEMBRE"];

const NOW = new Date();

function shiftMonth(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
  return `${MOIS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

function monthLabelShort(date) {
  return `${MOIS_FR_SHORT[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function sprintLabel(date) {
  return `${SPRINT_LABEL_MAP[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
}

function isInMonth(isoDate, monthDate) {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  return d.getFullYear() === monthDate.getFullYear() && d.getMonth() === monthDate.getMonth();
}

// ============================================
// DONNÉES MOCKÉES
// ============================================
let _seed = 42;
function srand() { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; }
function srandInt(min, max) { return Math.floor(srand() * (max - min + 1)) + min; }
function srandPick(arr) { return arr[srandInt(0, arr.length - 1)]; }

const CLASSIFICATIONS = ["BUG D'USAGE", "BUG OPERATIONNEL", "BUG STRUCTURANT", "DEV avec CC", "DEV sans CC", "STACK TECH", "DATA HUB - CTV"];
const STATUTS = ["A planifier", "En cours", "FAIT", "Stand by", "A etudier", "Fait partiellement"];
const PERS = ["Caroline", "Ines", "Sylvain", "Albert", "Loic", "Cédric.F", "Denis", "Rachid"];
const VERSIONS_INTER = ["18.10", "18.11", "18.12", "18.13", null];
const VERSIONS_STABLE = ["18.10", "18.11", "19.00", null];
const BLOCS = ["HOME", "FICHE CLIENT", "FICHE SEJOUR", "PRE-RESERVATION (Devis)", "GESTION MAILS", "VENTES HORS SEJOUR", "PLANNING"];

// Valeurs réelles depuis Notion
const FONCTIONS_LIST = ["Séjour", "Fiche client", "Devis", "Compta & finances", "Paramétrages", "CRM", "Facturation", "Synchro", "Statistiques", "Extractions", "Paiements", "Mise à jour", "Résa web", "Paiements sécurisés", "Emails & documents"];
const PRODUITS_LIST = ["NAXI GESTION SQL", "NAXI CODES", "NAXI COMMERCE", "NAXI CASHLESS", "NAXI ESPACE CLIENT", "CRM", "DATA HUB", "NAXI CAM", "NAXI RESERVATION"];

// Personnes par équipe (depuis Notion)
const PERS_FRONT = ["Inès", "Sylvain", "Christophe", "Louis Charles", "Cédric.V"];
const PERS_BACK = ["Loic", "Rachid", "Cédric.F", "Denis", "Christophe"];
const PERS_POTEST = ["Agathe", "Marjorie", "Aurore", "Nina"];

const POINTS_BLOCAGE_SAMPLES = [
  "En attente retour client", "Spec en cours de validation", "Bloqué côté API partenaire",
  "Question en cours avec PO", "Dépend de la migration SQL", "Tests à finaliser avec Sylvain",
];

const TICKETS_TITLES = [
  "Erreur affichage facture proforma", "Lenteur enregistrement paiement multi-prestations",
  "Bug redescente events NAXICAM", "Module ménage : date prochaine arrivée erronée",
  "Conflit envoi planning et EURODECISION", "Échange solde Naxi/SH incorrect",
  "Lenteur affichage envoi email factures", "Logo manquant factures par exercice",
  "Osmokey bloque envoi emails", "MNGMODE5 plante NAXI Export",
  "Naxi Code lenteur transmission", "Multiple bugs échange solde web",
  "Statistiques par type clientèle", "Refonte module CRM",
  "Intégration Pennylane facturation", "Migration SQL Server 2022",
  "Optimisation requêtes lourdes", "Dashboard reporting consolidé",
  "API publique partenaires", "Module fidélité clients",
  "Export comptable amélioré", "Synchronisation tarifs Inaxel",
  "Correction calcul TVA séjour", "Refonte espace client web",
];

const FONCTIONS_NAMES = [
  "Dashboard accueil", "Menu burger", "Recherche disponibilités", "Plan camping",
  "Création fiche client", "Modification client", "Historique séjours",
  "Liste séjours", "Calendrier réservations", "Affectation hébergement", "Check-in scan",
  "Pré-réservation web", "Génération devis", "Acompte en ligne", "Conditions vente",
  "Mailing automatique", "Templates email", "Suivi ouverture mails",
  "Vente boutique", "Encaissement caisse", "Réimpression ticket",
  "Planning ménages", "Planning maintenance", "Affectation équipes",
  "Synchro NAXI Code", "Module facturation", "Avoir client", "Export comptable",
];

// ============================================
// VRAIS TICKETS AVRIL 2026 (depuis Notion)
// ============================================
const REAL_TICKETS_AVRIL = [
  // Tickets fetchés directement depuis Notion - CRÉÉS EN AVRIL 2026 (pour la section "Enregistrements")
  { titre: "Lenteurs de transmissions des codes NAXI Cod", classification: "BUG OPERATIONNEL", statut: "Abandon", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI CODES"], client: "Violettes 31", dateCreation: "2026-04-02T14:58:15.688Z", identifiant: "INA-220" },
  { titre: "MNGMODE5 bloque la fenêtre de NAXI Export", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Moyenne", sprintIdeal: ["AVRIL 26"], fonctions: "Extractions", produits: ["NAXI GESTION SQL"], client: "Multi", dateCreation: "2026-04-08T09:23:00.000Z", identifiant: "INA-225" },
  { titre: "[WEB] Echange de solde : non mise à jour du solde sur SH lorsque la modification du solde n'est pas liée à un paiement", classification: "BUG STRUCTURANT", statut: "FAIT", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI ESPACE CLIENT"], dateCreation: "2026-04-13T13:05:00.000Z", identifiant: "INA-228" },
  { titre: "Arrêt de l'appel à l'ancienne synchro quand toutes les ressources sont en V2 pour la remontée des données venant du web", classification: "STACK TECH", statut: "FAIT", priorisation: "Moyenne", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-17T10:35:00.000Z", identifiant: "INA-235" },
  { titre: "Non affichage du logo sur les factures & proforma si les courriers & emails sont différents par exercice", classification: "BUG OPERATIONNEL", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Groupe IKL", dateCreation: "2026-04-16T11:43:35.168Z", identifiant: "INA-243" },
  { titre: "Impossible de facturer un séjour de client TO si présence d'une promo de type Abattement taxe de séjour", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Facturation", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-20T13:18:00.000Z", identifiant: "INA-237" },
  { titre: "Purge automatique des logs SDK / NAXICOD", classification: "DEV sans CC", statut: "A planifier", priorisation: "Pas urgente", sprintIdeal: ["JUIN 26"], fonctions: "Mise à jour", produits: ["NAXI CODES"], dateCreation: "2026-04-20T13:21:00.000Z", identifiant: "INA-239" },
  { titre: "Impossible d'ouvrir un compteur sans date de fin", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Moyenne", sprintIdeal: ["AVRIL 26"], fonctions: "Paramétrages", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-20T13:27:00.000Z", identifiant: "INA-241" },
  { titre: "Surbook SH généré par l'absence de retenue sur nos serveurs", classification: "BUG STRUCTURANT", statut: "FAIT", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Résa web", produits: ["CTV"], client: "Campasun", dateCreation: "2026-04-20T15:22:17.806Z", identifiant: "INA-249" },
  { titre: "Envoi auto des etats comptables : Liste des ventes NaxiCommerce non envoyées", classification: "BUG OPERATIONNEL", statut: "En cours", priorisation: "Moyenne", sprintIdeal: ["AVRIL 26"], fonctions: "Compta & finances", produits: ["NAXI COMMERCE"], dateCreation: "2026-04-21T12:21:00.000Z", identifiant: "INA-251" },
  { titre: "Facturation : montant à régler erroné si paiement saisi via la fenêtre de paiement avant facturation", classification: "BUG OPERATIONNEL", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Vaugrais", dateCreation: "2026-04-21T12:30:33.609Z", identifiant: "INA-253" },
  { titre: "Lenteurs sur affichage de la fenêtre d'envoi d'email de factures si plusieurs séjours", classification: "BUG OPERATIONNEL", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Sardane", dateCreation: "2026-04-22T15:13:24.100Z", identifiant: "INA-259" },
  { titre: "Grafana - Modif lien dashboard NNP Assistance", classification: "STACK TECH", statut: "FAIT", priorisation: "Pas urgente", sprintIdeal: ["AVRIL 26"], fonctions: "Mise à jour", produits: ["GRAFANA"], dateCreation: "2026-04-24T08:28:00.000Z", identifiant: "INA-263" },
  { titre: "Erreur redescente des events NAXICAM", classification: "BUG OPERATIONNEL", statut: "En cours", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI CAM"], dateCreation: "2026-04-27T14:11:00.000Z", identifiant: "INA-269" },
  { titre: "Date prochaine arrivée erronée dans le module ménage", classification: "BUG D'USAGE", statut: "A etudier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Séjour", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T14:08:00.000Z", identifiant: "INA-272" },
  { titre: "NNP : Message d'erreur côté web lorsque l'on passe un séjour en Parti", classification: "BUG OPERATIONNEL", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Synchro", produits: ["NAXI NOMAD PREMIUM"], dateCreation: "2026-04-27T14:08:00.000Z", identifiant: "INA-273" },
  { titre: "Impossible d'envoyer des emails si présence d'un code Osmokey", classification: "BUG OPERATIONNEL", statut: "Stand by", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Emails & documents", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T14:10:00.000Z", identifiant: "INA-275" },
  { titre: "Pouvoir envoyer des templates sur les séjours 'groupe'", classification: "DEV avec CC", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["JUIN 26"], fonctions: "Emails & documents", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T14:15:00.000Z", identifiant: "INA-279" },
  { titre: "Extraction client/séjour : Ajout d'une nouvelle donnée N°Allocataire Vacaf", classification: "DEV avec CC", statut: "A planifier", priorisation: "Pas urgente", sprintIdeal: ["MAI 26"], fonctions: "Extractions", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T14:19:00.000Z", identifiant: "INA-281" },
  { titre: "Incompatibilité SIGPAD avec l'offre Saas", classification: "STACK TECH", statut: "A etudier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Paramétrages", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T14:19:00.000Z", identifiant: "INA-282" },
  { titre: "Séjours et clients non envoyés sur le web", classification: "BUG STRUCTURANT", statut: "En cours", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T14:44:00.000Z", identifiant: "INA-285" },
  { titre: "Lenteurs sur l'enregistrement d'un paiement pour plusieurs prestations", classification: "BUG OPERATIONNEL", statut: "A planifier", priorisation: "Haute", sprintIdeal: ["MAI 26"], fonctions: "Paiements", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T15:07:00.000Z", identifiant: "INA-289" },
  { titre: "Erreur remontée historique NAXICOD", classification: "BUG OPERATIONNEL", statut: "A etudier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Synchro", produits: ["NAXI CODES"], dateCreation: "2026-04-27T15:09:00.000Z", identifiant: "INA-290" },
  { titre: "Ajout d'un mode de calcul sur les supplément : % sur tarif de base", classification: "DEV avec CC", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["JUIN 26"], fonctions: "Devis", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T07:06:00.000Z", identifiant: "INA-292" },
  { titre: "CTV - Disparité tarifaire OTA (produits et périodes)", classification: "DATA HUB - CTV", statut: "A planifier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Statistiques", produits: ["CTV", "DATA HUB"], dateCreation: "2026-04-27T07:10:00.000Z", identifiant: "INA-293" },
  { titre: "Cautions Swikly non envoyées sur le Web", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Moyenne", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T07:19:00.000Z", identifiant: "INA-296" },
  { titre: "Erreur synchro Distrib_Credentials en 18.11", classification: "BUG STRUCTURANT", statut: "FAIT", priorisation: "Haute", sprintIdeal: ["AVRIL 26"], fonctions: "Synchro", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-27T08:05:00.000Z", identifiant: "INA-298" },
  { titre: "Dev spécifique Flower / Extraction liste automatisée Liste des suppléments", classification: "DEV avec CC", statut: "En cours", priorisation: "Moyenne", sprintIdeal: ["AVRIL 26"], fonctions: "Extractions", produits: ["NAXI GESTION SQL"], client: "Flower", dateCreation: "2026-04-27T08:13:00.000Z", identifiant: "INA-302" },
  { titre: "Régression sur saisie date de naissance du client entre séjour et fiche client", classification: "BUG D'USAGE", statut: "A etudier", priorisation: "Moyenne", sprintIdeal: ["MAI 26"], fonctions: "Fiche client", produits: ["NAXI GESTION SQL"], dateCreation: "2026-04-28T06:57:00.000Z", identifiant: "INA-308" },
];

// SPRINT AVRIL 26 : 20 vrais tickets complets (avec toutes les vraies données Notion)
// 15 tickets initiaux + 5 débordés depuis MARS
const REAL_SPRINT_AVRIL = [
  // === Sprint initial AVRIL 26 (15 tickets) ===
  { id: "INA-196", titre: "Echec des envois COOLNCAMP via NAXIEXPORT", classification: "BUG STRUCTURANT", statut: "FAIT", priorisation: "Haute", fonctions: "Extractions", produits: ["NAXI GESTION SQL"], client: "RESASOL", dateCreation: "2026-03-20T09:49:23.303Z", estimBack: 10.5, estimFront: 0, estimPoTest: 7, persBack: ["Rachid"], persFront: [], persPoTest: ["Angélique"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.15", versionStable: "18.15", dateSortieInter: "2026-05-04", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: null, explication: "RESASOL me signale que l'envoi vers COOLNCAMP ne se fait plus depuis le 13.03.2026. En me connectant sur leur serveur, je constate que le traitement semble s'être fait puisque la date du prochain traitement s'est mise à jour. En revanche, après échange avec COOLNCAMP, ils n'ont reçu aucun fichier sur leur serveur." },
  { id: "INA-203", titre: "Erreur d'envoi des CHANNELS", classification: "BUG STRUCTURANT", statut: "FAIT", priorisation: "Haute", fonctions: "Synchro", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "SaintMartin40 / Clé des champs", dateCreation: "2026-03-23T10:32:38.597Z", estimBack: 7, estimFront: 0, estimPoTest: 3.5, persBack: ["Denis"], persFront: [], persPoTest: ["Aurore"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: { name: "INA-203.docx", url: "#" }, explication: "Les envois des CHANNELS sont en erreur lorsque le libellé du canal est vide, ce qui sature ensuite la fenêtre de synchro. Découvert chez SaintMartin40 qui n'avait plus que 100 séjours sur le web au lieu de 4408." },
  { id: "INA-195", titre: "Facturation : factures et proforma d'échéances : multiples problèmes", classification: "STACK TECH", statut: "FAIT", priorisation: "Haute", fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Plusieurs campings (Hameau du Saut Loup, Arnel, Grands Espaces...)", dateCreation: "2026-03-19T20:04:57.939Z", estimBack: 21, estimFront: 0, estimPoTest: 7, persBack: ["Loic"], persFront: [], persPoTest: ["Marjorie"], pointAvancement: 1, pointsBlocage: "conserve bug 1007", communication: ["fiche explicative"], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: { name: "INA-195.docx", url: "#" }, explication: "Depuis la version 18, les factures et proforma d'échéances sont incorrectes : les proforma ne font plus apparaitre le bloc des paiements, les factures d'échéance affichent des montants erronés." },
  { id: "INA-92", titre: "[LOGICIEL] Erreur sur la visualisation de proforma groupe", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Haute", fonctions: null, produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Flower Exploitation, Roussillonais, Omaha Beach...", dateCreation: "2026-02-24T19:05:13.465Z", estimBack: 7, estimFront: 0, estimPoTest: 7, persBack: ["Rachid"], persFront: [], persPoTest: ["Nina"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: null, explication: "L'envoi de la proforma groupe génère une erreur. Il est nécessaire de faire l'envoi en deux étapes pour que le mail parte." },
  { id: "INA-146", titre: "Incohérences dans le fichier sousloc du CRM / Eurodecision", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Moyenne", fonctions: "Extractions", produits: ["CRM"], client: "Flower Exploitation", dateCreation: "2026-03-02T14:48:46.439Z", estimBack: 14, estimFront: 0, estimPoTest: 14, persBack: ["Loic"], persFront: [], persPoTest: ["Marjorie"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: { name: "INA-146.docx", url: "#" }, explication: "Le fichier sousloc généré pour les clients CRM/EURODECISION est faux : doublons + présence des séjours de sous-locataires." },
  { id: "INA-68", titre: "Facturation: Gestion locative", classification: "DEV avec CC", statut: "FAIT", priorisation: "Moyenne", fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "", dateCreation: "2026-02-24T19:05:13.436Z", estimBack: 35, estimFront: 0, estimPoTest: 21, persBack: ["Cédric.F"], persFront: [], persPoTest: ["Aurore"], pointAvancement: 1, pointsBlocage: "", communication: ["fiche explicative"], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: null, explication: "Module Gestion locative pour la facturation." },
  { id: "INA-18", titre: "Apple Pay & Google Pay (CTV)", classification: "DEV sans CC", statut: "FAIT", priorisation: "Moyenne", fonctions: "Séjour", produits: ["NAXI GESTION SQL", "NAXI GESTION HF", "CTV"], client: "Sunelia et Ushuaia", dateCreation: "2026-02-18T18:44:27.009Z", estimBack: 7, estimFront: 7, estimPoTest: 21, persBack: ["Denis"], persFront: ["Christophe"], persPoTest: ["Marjorie"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "Web", versionStable: "18.15", dateSortieInter: "2026-04-13", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: null, explication: "Problématique identifiée uniquement pour les groupes Sunélia et Ushuaia. Étude en cours pour un déploiement en dur." },
  { id: "INA-29", titre: "NORME V19", classification: "STACK TECH", statut: "Fait partiellement", priorisation: "Haute", fonctions: "Autres", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "TOUS", dateCreation: "2026-02-24T08:29:02.077Z", estimBack: 35, estimFront: 0, estimPoTest: 14, persBack: ["Denis"], persFront: [], persPoTest: ["Nina"], pointAvancement: 0.75, pointsBlocage: "En attente retour test", communication: ["fiche explicative"], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26", "MAI 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "Mise au norme NF525 et 203" },
  { id: "INA-6", titre: "Facturation dématérialisé - Norme Européen 26 / 27 (Pennylane)", classification: "DEV avec CC", statut: "En cours", priorisation: "Haute", fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "TOUS", dateCreation: "2026-02-17T10:27:47.158Z", estimBack: 14, estimFront: 0, estimPoTest: 7, persBack: ["Rachid"], persFront: [], persPoTest: ["Nina", "Marjorie"], pointAvancement: 0.1, pointsBlocage: "", communication: [], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26", "MAI 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "Proposer solution pour la norme Européen avec une solution de PA" },
  { id: "INA-192", titre: "Envoi des Schedules pour les campings n'ayant pas de système de réservation en ligne", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Moyenne", fonctions: "Synchro", produits: ["NAXI GESTION HF", "NAXI GESTION SQL"], client: "Thermes31, Bergons, 5étoiles...", dateCreation: "2026-03-17T08:37:02.954Z", estimBack: 7, estimFront: 0, estimPoTest: 3.5, persBack: ["Rachid"], persFront: [], persPoTest: ["Aurore"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: { name: "INA-192.docx", url: "#" }, explication: "Plus de 1000 erreurs en moins de 6h sur la synchronisation des SCHEDULE. Les SCHEDULES sont envoyés dans la table synchro même pour les campings qui n'ont pas de système de réservation en ligne." },
  { id: "INA-45", titre: "Impossible de refacturer un acompte sans paiement si la première facture a été annulée par un avoir", classification: "BUG OPERATIONNEL", statut: "FAIT", priorisation: "Moyenne", fonctions: "Facturation", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "", dateCreation: "2026-02-24T10:28:31.463Z", estimBack: 14, estimFront: 0, estimPoTest: 3.5, persBack: ["Rachid"], persFront: [], persPoTest: ["Nina"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: null, explication: "" },
  { id: "INA-37", titre: "Fenêtre Export comptable : Manque icône pour exporter sous excel si pas assez de ligne", classification: "BUG D'USAGE", statut: "FAIT", priorisation: "Pas urgente", fonctions: "Compta & finances", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "", dateCreation: "2026-02-24T10:09:20.480Z", estimBack: 3.5, estimFront: 0, estimPoTest: 3.5, persBack: ["Rachid"], persFront: [], persPoTest: ["Aurore"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.13", versionStable: "18.15", dateSortieInter: "2026-04-20", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: null, explication: "Manque icône pour exporter sous excel si pas assez de ligne dans la fenêtre Export comptable." },
  { id: "INA-177", titre: "Meilleure affichage du bandeau d'autorisation des cookies sur l'espace client", classification: "DEV sans CC", statut: "FAIT", priorisation: "Moyenne", fonctions: null, produits: ["NAXI ESPACE CLIENT"], client: "Flots", dateCreation: "2026-03-11T14:38:04.072Z", estimBack: 0, estimFront: 7, estimPoTest: 3.5, persBack: [], persFront: ["Louis Charles"], persPoTest: ["Marjorie"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "Web", versionStable: "18.15", dateSortieInter: "2026-04-27", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale"], pieceJointe: { name: "flots.png", url: "#" }, explication: "Le camping les FLOTS souhaiterait que le bandeau des cookies soit plus visible car cela génère beaucoup d'appels de clients qui ne peuvent pas valider l'acceptation." },
  { id: "INA-49", titre: "GRAFANA : fenêtre Naxi V2 : activation en masse des fenetres", classification: "STACK TECH", statut: "Fait partiellement", priorisation: "Moyenne", fonctions: null, produits: ["GRAFANA"], client: "", dateCreation: "2026-02-24T19:05:13.411Z", estimBack: 0, estimFront: 14, estimPoTest: 7, persBack: [], persFront: ["Louis Charles"], persPoTest: ["Marjorie"], pointAvancement: 0.75, pointsBlocage: "Test", communication: ["fiche explicative"], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26", "MAI 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "" },
  { id: "INA-211", titre: "GRAFANA : fenêtre Naxi V2 : désactivation en masse des fenetres", classification: "STACK TECH", statut: "Fait partiellement", priorisation: "Moyenne", fonctions: null, produits: ["GRAFANA"], client: "", dateCreation: "2026-03-31T08:08:08.906Z", estimBack: 0, estimFront: 35, estimPoTest: 7, persBack: [], persFront: ["Louis Charles"], persPoTest: ["Marjorie"], pointAvancement: 0.75, pointsBlocage: "Test", communication: ["fiche explicative"], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26", "MAI 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "" },
  // === Débords du sprint MARS 26 (5 tickets ajoutés à AVRIL) ===
  { id: "INA-26", titre: "Paiement Sécurisé - Caution Payline: Contrat PLBS", classification: "STACK TECH", statut: "FAIT", priorisation: "Haute", fonctions: "Séjour", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Client utilisant caution PAYLINE", dateCreation: "2026-02-24T08:06:40.784Z", estimBack: 35, estimFront: 28, estimPoTest: 14, persBack: ["Rachid"], persFront: ["Louis Charles"], persPoTest: ["Aurore"], pointAvancement: 1, pointsBlocage: "", communication: [], versionInter: "18.14", versionStable: "18.15", dateSortieInter: "2026-04-27", dateSortieStable: "2026-05-04", sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "Modification des règles sur les cautions Payline, impossible de conserver la caution + de 7 jours. Dev à faire + client doit changer de contrat." },
  { id: "INA-77", titre: "Check-In Scan partie 1 : Mapping + envoi Naxi.G vers CiS", classification: "DEV sans CC", statut: "Fait partiellement", priorisation: null, fonctions: "Séjour", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "", dateCreation: "2026-02-24T19:05:13.447Z", estimBack: 35, estimFront: 35, estimPoTest: 49, persBack: ["Denis"], persFront: ["Louis Charles", "Inès"], persPoTest: ["Nina"], pointAvancement: 0.75, pointsBlocage: "sortie 23/04 > retour clients pas bon, correctif en cours (27/04)", communication: [], versionInter: "En attente", versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "" },
  { id: "INA-27", titre: "Caution SWIKLY : Nouvelle API", classification: "STACK TECH", statut: "Fait partiellement", priorisation: "Moyenne", fonctions: "Séjour", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "Clients utilisant la solution SWIKLY", dateCreation: "2026-02-24T08:10:31.144Z", estimBack: 21, estimFront: 70, estimPoTest: 7, persBack: ["Denis"], persFront: [], persPoTest: ["Nina"], pointAvancement: 0.95, pointsBlocage: "attente Swikly pour deploiement", communication: [], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26", "MAI 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "Modification de la solution SWIKLY - MaJ nécessaire via API." },
  { id: "INA-142", titre: "[WEB] SynchroV2 - Activation globale de ressource(s) en V2 pour l'ensemble de nos clients", classification: "STACK TECH", statut: "Fait partiellement", priorisation: "Moyenne", fonctions: "Synchro", produits: ["NAXI GESTION SQL", "NAXI GESTION HF"], client: "", dateCreation: "2026-02-27T13:56:43.454Z", estimBack: 0, estimFront: 7, estimPoTest: 14, persBack: [], persFront: ["Louis Charles"], persPoTest: ["Aurore", "Nina"], pointAvancement: 0.9, pointsBlocage: "finalisation test", communication: ["fiche explicative"], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "" },
  { id: "INA-143", titre: "[GRAFANA WEB] Synchro_recupV2 : Ressources en erreur", classification: "STACK TECH", statut: "Fait partiellement", priorisation: "Moyenne", fonctions: null, produits: [], client: "", dateCreation: "2026-02-27T13:58:06.090Z", estimBack: 0, estimFront: 7, estimPoTest: 3.5, persBack: [], persFront: ["Louis Charles"], persPoTest: ["Aurore", "Nina"], pointAvancement: 0.75, pointsBlocage: "retour de test", communication: [], versionInter: null, versionStable: null, dateSortieInter: null, dateSortieStable: null, sprintIdeal: ["AVRIL 26"], initialeAjout: ["Sprint initiale", "Débord sprint suivant"], pieceJointe: null, explication: "" },
];

// Explications réelles (depuis Notion) pour quelques tickets
const REAL_EXPLICATIONS = {
  "INA-220": "Le camping Violettes 31 nous a contacté ce jour suite à l'installation de la version 18.10 (NxGestion) et 06.03 (NxCod).\n\nSuite à cela, il constate que lorsqu'il crée un code dans NAXI Gestion depuis la fiche séjour, cela met plus de 6/8 minutes à remonter dans la fenêtre de contrôle en local. Ce n'était pas du tout le cas avant la pose de l'exe.\n\nDans la capture d'écran en commentaire ci-dessous, on voit que le code 1133 a été créé mais qu'il ne remonte pas dans la fenêtre de contrôle de NAXICOD. Il est remonté près de 10 minutes plus tard.\n\nJe n'ai pas eu le temps de faire + de recherches donc peut-être voir avec un tech si besoin.\n\nLe client est en SAAS (RDP01) si besoin, voir avec Steven pour s'y connecter.",
  "INA-243": "Le logo ne s'affiche pas sur les pdf des factures et proforma si dans les paramètres exercices, les courriers et emails sont configurés en différents par exercice.\n\nNaxi stocke alors l'image dans un mauvais répertoire.\n\n*Pour débloquer la situation chez le client, j'ai déplacé le fichier manuellement, ce qui a permis de ré-afficher le logo sur les factures.*",
  "INA-249": "Plusieurs campings nous ont signalé avoir des surbooks ces derniers jours.\n\nAprès recherche le souci vient du fait que malgré que la case 'Blocage des plannings en ligne' soit cochée, nous ne créons plus de retenue sur nos serveurs.\n\nDonc tant que la résa n'est pas traitée côté NAXI, il n'y a aucun blocage planning et donc le risque de surbook est important.",
  "INA-253": "Depuis la BUG-1036, la fenêtre de saisie paiement avant facturation apparait bien de nouveau.\n\nToutefois, si l'on saisit un paiement via cette fenêtre, le montant restant à régler sur la facture est erroné et ne tient pas compte du paiement saisi.",
  "INA-259": "Le camping la Sardane nous a signalé d'importantes lenteurs sur la génération de factures lorsqu'il y a plusieurs prestations.\n\n→ Après tests sur ma démo, les lenteurs sont confirmées ce qui permet d'écarter la piste de l'infra puisque je teste sur mon PC en local.\n\nLes lenteurs sont en revanche pas sur la facturation mais sur l'ouverture de la fenêtre d'envoi du mail.",
};

// Fallback : génère une explication plausible à partir du titre + classification
function generateExplication(titre, classification, client) {
  const intros = [
    client ? `Signalé par ${client}.` : "Bug signalé par un client.",
    "Reproduit en interne sur démo.",
    "Constaté lors d'un test de régression.",
  ];
  const middles = {
    "BUG OPERATIONNEL": "Le comportement observé empêche l'utilisateur d'effectuer son action correctement.",
    "BUG STRUCTURANT": "Ce bug bloque le bon fonctionnement d'un processus métier important. À traiter en priorité.",
    "BUG D'USAGE": "Le comportement actuel n'est pas intuitif pour l'utilisateur, à revoir UX.",
    "DEV avec CC": "Demande spécifique d'un client pour adapter le module à son besoin.",
    "DEV sans CC": "Évolution interne pour améliorer l'outil.",
    "STACK TECH": "Refacto technique nécessaire pour stabiliser le composant.",
    "DATA HUB - CTV": "Synchronisation à corriger entre Data Hub et la plateforme CTV.",
  };
  const ends = [
    "À investiguer pour identifier la cause racine.",
    "Tests effectués, scénario reproductible.",
    "Solution à valider avant mise en production.",
    "Lien JAM disponible pour reproduire facilement.",
  ];
  return `${srandPick(intros)} ${middles[classification] || ""} ${srandPick(ends)}`;
}

function buildClassiqueMock() {
  _seed = 99;
  const tickets = [];
  let id = 200;

  // ===== SPRINT AVRIL 26 : 20 VRAIS TICKETS COMPLETS (vraies valeurs Notion) =====
  REAL_SPRINT_AVRIL.forEach(t => {
    tickets.push({
      id: id++,
      identifiant: t.id,
      titre: t.titre,
      client: t.client || null,
      classification: t.classification,
      statut: t.statut,
      priorisation: t.priorisation,
      sprintIdeal: t.sprintIdeal,
      fonctions: t.fonctions,
      produits: t.produits || [],
      persFront: t.persFront || [],
      persBack: t.persBack || [],
      persPoTest: t.persPoTest || [],
      pointAvancement: t.pointAvancement,
      pointsBlocage: t.pointsBlocage || "",
      explication: t.explication || "",
      estimFront: t.estimFront || 0,
      estimBack: t.estimBack || 0,
      estimPoTest: t.estimPoTest || 0,
      communication: t.communication || [],
      pieceJointe: t.pieceJointe || null,
      initialeAjout: t.initialeAjout || [],
      versionInter: t.versionInter,
      versionStable: t.versionStable,
      dateCreation: t.dateCreation,
      dateSortieInter: t.dateSortieInter,
      dateSortieStable: t.dateSortieStable,
    });
  });

  // IDs des tickets sprint AVRIL déjà ajoutés (pour ne pas les dupliquer)
  const sprintAvrilIds = new Set(REAL_SPRINT_AVRIL.map(t => t.id));

  // ===== TICKETS CRÉÉS EN AVRIL (hors sprint AVRIL déjà traité) =====
  REAL_TICKETS_AVRIL.forEach(t => {
    if (sprintAvrilIds.has(t.identifiant)) return; // Évite les doublons

    const isFinished = t.statut === "FAIT";
    const isInProgress = t.statut === "En cours";

    // Versions intermédiaire et stable
    const versionInter = isFinished ? srandPick(["18.10", "18.11", "18.12"]) : (isInProgress && srand() < 0.4 ? "18.13" : null);
    const versionStable = isFinished && srand() < 0.7 ? srandPick(["18.10", "18.11"]) : null;
    const dateInter = versionInter ? new Date(2026, 3, srandInt(15, 28)).toISOString() : null;
    const dateStable = versionStable ? new Date(2026, 4, srandInt(1, 20)).toISOString() : null;

    // Personnes assignées par équipe (simulé pour ces tickets dont on n'a pas la vraie info)
    const persFront = srand() < 0.6 ? [srandPick(PERS_FRONT)] : [];
    const persBack = srand() < 0.7 ? [srandPick(PERS_BACK)] : [];
    const persPoTest = srand() < 0.5 ? [srandPick(PERS_POTEST)] : [];

    tickets.push({
      id: id++,
      titre: t.titre,
      identifiant: t.identifiant,
      client: t.client || null,
      classification: t.classification,
      statut: t.statut,
      priorisation: t.priorisation,
      sprintIdeal: t.sprintIdeal,
      fonctions: t.fonctions,
      produits: t.produits,
      persFront, persBack, persPoTest,
      pointAvancement: isFinished ? 1 : isInProgress ? +(srand() * 0.5 + 0.3).toFixed(1) : +(srand() * 0.2).toFixed(1),
      pointsBlocage: srand() < 0.2 ? srandPick(POINTS_BLOCAGE_SAMPLES) : "",
      explication: REAL_EXPLICATIONS[t.identifiant] || generateExplication(t.titre, t.classification, t.client),
      estimFront: srand() < 0.5 ? srandInt(0, 12) : 0,
      estimBack: srand() < 0.6 ? srandInt(0, 20) : 0,
      estimPoTest: srand() < 0.5 ? srandInt(0, 6) : 0,
      communication: srand() < 0.15 ? [srandPick(["fiche explicative", "webinar"])] : [],
      pieceJointe: srand() < 0.25 ? { name: `${t.identifiant}.docx`, url: "#" } : null,
      initialeAjout: srand() < 0.7 ? ["Sprint initiale"] : ["Ajout en cours"],
      versionInter, versionStable,
      dateCreation: t.dateCreation,
      dateSortieInter: dateInter,
      dateSortieStable: dateStable,
    });
  });

  // ===== AUTRES MOIS : DONNÉES GÉNÉRÉES (pour avoir l'historique) =====
  const otherMonthsOffsets = [
    { offset: -4, count: 22 },
    { offset: -3, count: 28 },
    { offset: -2, count: 32 },
    { offset: -1, count: 36 }, // Mars 2026 (référence)
    // offset 0 (Avril) = REAL_TICKETS_AVRIL
    { offset: 1,  count: 14 }, // Mai 2026 (déjà planifié)
  ];

  otherMonthsOffsets.forEach(({ offset, count }) => {
    const monthDate = shiftMonth(new Date(NOW.getFullYear(), NOW.getMonth(), 1), offset);
    for (let i = 0; i < count; i++) {
      const classification = srandPick(CLASSIFICATIONS);
      const statut = srandPick(STATUTS);
      const isFinished = statut === "FAIT";
      const isInProgress = statut === "En cours";
      const sprintOffset = srand() < 0.7 ? offset : offset + srandInt(0, 2);
      const sprintDate = shiftMonth(new Date(NOW.getFullYear(), NOW.getMonth(), 1), sprintOffset);

      const versionInter = isFinished ? srandPick(VERSIONS_INTER.filter(v => v)) : srandPick(VERSIONS_INTER);
      const versionStable = isFinished && srand() < 0.6 ? srandPick(VERSIONS_STABLE.filter(v => v)) : null;
      const dateInter = versionInter ? new Date(monthDate.getFullYear(), monthDate.getMonth() + srandInt(0, 1), srandInt(1, 28)).toISOString() : null;
      const dateStable = versionStable ? new Date(monthDate.getFullYear(), monthDate.getMonth() + srandInt(1, 2), srandInt(1, 28)).toISOString() : null;

      tickets.push({
        id: id++,
        titre: srandPick(TICKETS_TITLES) + (srand() > 0.85 ? ` v${srandInt(2, 4)}` : ""),
        identifiant: `INA-${100 + id}`,
        client: null,
        classification,
        statut,
        priorisation: srandPick(["Haute", "Moyenne", "Pas urgente"]),
        sprintIdeal: [sprintLabel(sprintDate)],
        fonctions: srandPick(FONCTIONS_LIST),
        produits: [srandPick(PRODUITS_LIST), ...(srand() < 0.2 ? [srandPick(PRODUITS_LIST)] : [])],
        persFront: srand() < 0.6 ? [srandPick(PERS_FRONT)] : [],
        persBack: srand() < 0.7 ? [srandPick(PERS_BACK)] : [],
        persPoTest: srand() < 0.5 ? [srandPick(PERS_POTEST)] : [],
        pointAvancement: isFinished ? 1 : isInProgress ? +(srand() * 0.6 + 0.3).toFixed(1) : +(srand() * 0.3).toFixed(1),
        pointsBlocage: srand() < 0.2 ? srandPick(POINTS_BLOCAGE_SAMPLES) : "",
        explication: srand() < 0.7 ? generateExplication("", classification, null) : "",
        estimFront: srand() < 0.5 ? srandInt(0, 12) : 0,
        estimBack: srand() < 0.6 ? srandInt(0, 20) : 0,
        estimPoTest: srand() < 0.5 ? srandInt(0, 6) : 0,
        communication: srand() < 0.15 ? [srandPick(["fiche explicative", "webinar"])] : [],
        pieceJointe: srand() < 0.2 ? { name: `INA-${100 + id}.docx`, url: "#" } : null,
        initialeAjout: srand() < 0.7 ? ["Sprint initiale"] : ["Ajout en cours"],
        versionInter, versionStable,
        dateCreation: new Date(monthDate.getFullYear(), monthDate.getMonth(), srandInt(1, 28)).toISOString(),
        dateSortieInter: dateInter,
        dateSortieStable: dateStable,
      });
    }
  });

  return tickets;
}

// Données réelles depuis la base Notion Sprint Top Line NAXI.G
// Récupérées le 28/04/2026
const REAL_TOP_LINE = [
  // ===== HOME =====
  { id: "TP-3", nom: "HOME - Dasboard - Finalisation", bloc: "HOME", equipe: "Equipe PREPA", sprint: { maquette: "Mai 2026", back: "Juin 2026", front: "Juin 2026", design: "Juillet 2026", test: "Juillet 2026" }, avancement: { maquette: 0.3, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: "En cours", back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-2", nom: "HOME - Menu Burger - Finalisation", bloc: "HOME", equipe: "Equipe PREPA", sprint: { maquette: "Avril 2026", back: "Juin 2026", front: "Juin 2026", design: "Juillet 2026", test: "Juillet 2026" }, avancement: { maquette: 0.5, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: "En cours", back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-17", nom: "Recherche client", bloc: "HOME", equipe: "Equipe PROD", sprint: { maquette: "Mars 2026", back: "Mars 2026", front: "Mars 2026", design: "Avril 2026", test: "Juin 2026" }, avancement: { maquette: 1, back: 1, front: 1, design: 0, test: 0 }, etat: { maquette: "FAIT", back: "FAIT", front: "FAIT", design: null, test: null }, pers: { maquette: ["Albert", "Agathe", "Jérôme"], back: "Cédric.F", front: "Sylvain", design: "Cédric.V", test: [] }, temps: { maquette: 0, back: 7, front: 15, design: 0, test: 0 } },
  { id: "TP-7", nom: "Réservation Web", bloc: "HOME", equipe: "Equipe PROD", sprint: { maquette: "Mai 2026", back: "Juin 2026", front: "Juillet 2026", design: "Aout 2026", test: "Aout 2026" }, avancement: { maquette: 0.1, back: 0.3, front: 0, design: 0, test: 0 }, etat: { maquette: "En cours", back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-6", nom: "Listing réservation", bloc: "HOME", equipe: "Equipe PROD", sprint: { maquette: "Mars 2026", back: "Mars 2026", front: "Mars 2026", design: "Avril 2026", test: "Juin 2026" }, avancement: { maquette: 1, back: 0.99, front: 0.999, design: 1, test: 0 }, etat: { maquette: "FAIT", back: "FAIT", front: "FAIT", design: "FAIT", test: null }, pers: { maquette: ["Albert", "Agathe", "Jérôme"], back: "Loic", front: "Albert", design: "Cédric.V", test: [] }, temps: { maquette: 0, back: 4, front: 6, design: 2, test: 0 } },
  { id: "TP-T1", nom: "Traitement auto", bloc: "HOME", equipe: "Equipe PROD", sprint: { maquette: "Avril 2026", back: "Mai 2026", front: "Mai 2026", design: "Juin 2026", test: "Juillet 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-A1", nom: "Alertes (to do list)", bloc: "HOME", equipe: "Equipe PREPA", sprint: { maquette: "Mai 2026", back: "Juin 2026", front: "Juin 2026", design: "Juillet 2026", test: "Juillet 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-CA", nom: "Controle d'accès", bloc: "HOME", equipe: "Equipe PROD", sprint: { maquette: "Avril 2026", back: "Mai 2026", front: "Mai 2026", design: "Juin 2026", test: "Juin 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },

  // ===== FICHE CLIENT =====
  { id: "TP-22", nom: "FICHE CLIENT - Finalisation", bloc: "FICHE CLIENT", equipe: "Equipe PREPA", sprint: { maquette: "Juillet 2026", back: "Aout 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },

  // ===== FICHE SEJOUR =====
  { id: "TP-77", nom: "Fiche séjour - finalisation", bloc: "FICHE SEJOUR", equipe: "Equipe PREPA", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Septembre 2026", design: "Octobre 2026", test: "Octobre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-61", nom: "FS - Paiement", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Mai 2026", back: "Juin 2026", front: "Juillet 2026", design: "Aout 2026", test: "Aout 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-AS", nom: "Annuler séjour (si paiement)", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-MS", nom: "Modif séjour (justificatif)", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-AR", nom: "FS - Ajouter Remise", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-AS2", nom: "FS - Ajouter Supplément", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-AP", nom: "Afficher tous les participants", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-IM", nom: "Ajouter / modifier Immat voiture", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-AN", nom: "Ajouter / modifier Animaux", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-CA2", nom: "Contrôle d'accès (ajouter/modifier)", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-AV", nom: "Créer un avoir", bloc: "FICHE SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },

  // ===== PRE-RESERVATION (Devis) =====
  { id: "TP-38", nom: "DEVIS - finalisation", bloc: "PRE-RESERVATION (Devis)", equipe: "Equipe PREPA", sprint: { maquette: "Juillet 2026", back: "Septembre 2026", front: "Octobre 2026", design: "Novembre 2026", test: "Novembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-GD", nom: "Gestion des devis", bloc: "PRE-RESERVATION (Devis)", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-PD", nom: "Prolonger devis", bloc: "PRE-RESERVATION (Devis)", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-DC", nom: "Devis - détails des calculs", bloc: "PRE-RESERVATION (Devis)", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },

  // ===== GESTION MAILS =====
  { id: "TP-29", nom: "Envoi mails + template auto + gestion pièces jointes", bloc: "GESTION MAILS", equipe: "Equipe PROD", sprint: { maquette: "Juillet 2026", back: "Septembre 2026", front: "Octobre 2026", design: "Novembre 2026", test: "Novembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },

  // ===== VENTES HORS SEJOUR =====
  { id: "TP-VHS", nom: "VENTES HORS SEJOUR - Finalisation", bloc: "VENTES HORS SEJOUR", equipe: "Equipe PREPA", sprint: { maquette: "Aout 2026", back: "Septembre 2026", front: "Octobre 2026", design: "Novembre 2026", test: "Novembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-RB", nom: "Remise en banque", bloc: "VENTES HORS SEJOUR", equipe: "Equipe PROD", sprint: { maquette: "Juin 2026", back: "Juillet 2026", front: "Aout 2026", design: "Septembre 2026", test: "Septembre 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },

  // ===== PLANNING =====
  { id: "TP-49", nom: "PLANNING - finalisation", bloc: "PLANNING", equipe: "Equipe PREPA", sprint: { maquette: "Mai 2026", back: "Mai 2026", front: "Juin 2026", design: "Juillet 2026", test: "Juillet 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-31", nom: "Planning - rech dispo", bloc: "PLANNING", equipe: "Equipe PROD", sprint: { maquette: "Mai 2026", back: "Mai 2026", front: "Mai 2026", design: "Juin 2026", test: "Juillet 2026" }, avancement: { maquette: 0.5, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: "Blocage", back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-PSN", nom: "Planning sup. numéroté", bloc: "PLANNING", equipe: "Equipe PROD", sprint: { maquette: "Mai 2026", back: "Juin 2026", front: "Juin 2026", design: "Juillet 2026", test: "Juillet 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
  { id: "TP-RDC", nom: "Rech dispo plan camping", bloc: "PLANNING", equipe: "Equipe PROD", sprint: { maquette: "Mai 2026", back: "Mai 2026", front: "Juin 2026", design: "Juillet 2026", test: "Juillet 2026" }, avancement: { maquette: 0, back: 0, front: 0, design: 0, test: 0 }, etat: { maquette: null, back: null, front: null, design: null, test: null }, pers: { maquette: [], back: null, front: null, design: null, test: [] }, temps: { maquette: 0, back: 0, front: 0, design: 0, test: 0 } },
];

function buildTopLineMock() {
  // Conversion pour ajouter Nbre US et garder format existant
  return REAL_TOP_LINE.map((t, idx) => ({
    id: t.id,
    nom: t.nom,
    bloc: t.bloc,
    equipe: t.equipe,
    nbreUS: 1, // par défaut
    avancement: t.avancement,
    etat: t.etat,
    sprint: t.sprint,
    temps: t.temps,
    pers: t.pers,
  }));
}

// Liste de tous les sprints utilisés en Top Line (ordre chronologique)
const TOP_LINE_SPRINTS = ["Mars 2026", "Avril 2026", "Mai 2026", "Juin 2026", "Juillet 2026", "Aout 2026", "Septembre 2026", "Octobre 2026", "Novembre 2026", "Décembre 2026"];

// === Sprint courant calculé automatiquement à partir de la date du jour ===
// Mars 2026 = idx 0, Avril 2026 = idx 1, etc.
// Si on est avant Mars 2026 → 0. Si après Décembre 2026 → 9.
const TOP_LINE_CURRENT_SPRINT_IDX = (() => {
  const now = new Date();
  const yearDelta = now.getFullYear() - 2026;
  const monthDelta = now.getMonth() - 2; // Mars = mois 2 (0-indexed)
  const idx = yearDelta * 12 + monthDelta;
  return Math.max(0, Math.min(TOP_LINE_SPRINTS.length - 1, idx));
})();
const TOP_LINE_CURRENT_SPRINT = TOP_LINE_SPRINTS[TOP_LINE_CURRENT_SPRINT_IDX];

// Une phase est "en retard" si :
// - Sprint STRICTEMENT passé (pas le mois courant) ET avancement < 100% ET état != FAIT
// - OU bien état = "Blocage" (peu importe le sprint)
function isPhaseLate(fenetre, phaseKey) {
  const sprintLabel = fenetre.sprint[phaseKey];
  const etat = fenetre.etat[phaseKey];
  const av = fenetre.avancement[phaseKey] || 0;

  if (etat === "Blocage") return true;
  if (!sprintLabel) return false;

  const sprintIdx = TOP_LINE_SPRINTS.indexOf(sprintLabel);
  if (sprintIdx < 0) return false;

  // Sprint STRICTEMENT passé (pas le mois courant), et phase pas finie
  if (sprintIdx < TOP_LINE_CURRENT_SPRINT_IDX && av < 1 && etat !== "FAIT") {
    return true;
  }
  return false;
}

// Compteur de phases en retard sur une fenêtre
function countLatePhases(fenetre) {
  return PHASES.filter(p => isPhaseLate(fenetre, p.key)).length;
}

// Données : tentative de chargement depuis /data.json (Notion synchronisé via GitHub Actions)
// Fallback sur les mocks si le fichier est absent ou vide
let CLASSIQUE = buildClassiqueMock();
let TOP_LINE = buildTopLineMock();
let DATA_GENERATED_AT = null;

// Phases dans l'ordre du workflow projet : Maquette → Back → Front → Design → Test
const PHASES = [
  { key: "maquette", label: "Maquette", color: "#A78BFA", icon: "✏️" },
  { key: "back", label: "Back", color: C.teamBack, icon: "⚙️" },
  { key: "front", label: "Front", color: C.teamFront, icon: "🖥️" },
  { key: "design", label: "Design", color: "#FB923C", icon: "🎨" },
  { key: "test", label: "Test", color: C.teamPoTest, icon: "✓" },
];

// Couleurs par état (utilisées dans le Gantt)
const ETAT_COLORS_TL = {
  "FAIT": "#16A34A",
  "En cours": "#2563EB",
  "Blocage": "#DC2626",
  "En test": "#9333EA",
  "En design": "#EA580C",
  "En maquette": "#DB2777",
  "En étude": "#0891B2",
};

// Couleurs par bloc
const BLOC_COLORS_TL = {
  "HOME": "#92400E",
  "PLANNING": "#7C3AED",
  "FICHE CLIENT": "#6B7280",
  "FICHE SEJOUR": "#15803D",
  "PRE-RESERVATION (Devis)": "#DB2777",
  "VENTES HORS SEJOUR": "#CA8A04",
  "GESTION MAILS": "#1D4ED8",
};

// ============================================
// COMPOSANTS UI
// ============================================
function LogoInaxel({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <g stroke={C.orange} strokeWidth="6" strokeLinecap="round" fill="none">
        <line x1="50" y1="50" x2="20" y2="20" />
        <line x1="50" y1="50" x2="50" y2="14" />
        <line x1="50" y1="50" x2="80" y2="20" />
        <line x1="50" y1="50" x2="86" y2="50" />
        <line x1="50" y1="50" x2="80" y2="80" />
        <line x1="50" y1="50" x2="50" y2="86" />
        <line x1="50" y1="50" x2="20" y2="80" />
        <line x1="50" y1="50" x2="14" y2="50" />
      </g>
    </svg>
  );
}

function Pill({ children, color, soft = true, size = "md" }) {
  const padding = size === "sm" ? "3px 8px" : "5px 12px";
  const fontSize = size === "sm" ? 10 : 11;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding, borderRadius: 999, fontSize, fontWeight: 600,
      letterSpacing: "0.02em", whiteSpace: "nowrap",
      background: soft ? `${color}15` : color,
      color: soft ? color : "#fff",
    }}>{children}</span>
  );
}

function Button({ children, variant = "primary", onClick, icon: Icon, size = "md" }) {
  const styles = {
    primary: { background: C.orange, color: "#fff", border: `1px solid ${C.orange}` },
    outline: { background: "transparent", color: C.orange, border: `1.5px solid ${C.orange}` },
    ghost: { background: "transparent", color: C.inkSoft, border: `1px solid ${C.line}` },
  };
  const padding = size === "sm" ? "8px 14px" : "10px 20px";
  const fontSize = size === "sm" ? 12 : 13;
  return (
    <button onClick={onClick} style={{
      ...styles[variant], padding, borderRadius: 999, fontSize, fontWeight: 600,
      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
      transition: "all 0.15s", fontFamily: "inherit",
    }}
      onMouseEnter={e => {
        if (variant === "primary") e.currentTarget.style.background = C.orangeDark;
        if (variant === "outline") { e.currentTarget.style.background = C.orange; e.currentTarget.style.color = "#fff"; }
        if (variant === "ghost") e.currentTarget.style.borderColor = C.inkDim;
      }}
      onMouseLeave={e => {
        if (variant === "primary") e.currentTarget.style.background = C.orange;
        if (variant === "outline") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.orange; }
        if (variant === "ghost") e.currentTarget.style.borderColor = C.line;
      }}
    >
      {Icon && <Icon size={size === "sm" ? 13 : 14} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

function Card({ children, style = {}, accent = false }) {
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
      padding: 28,
      ...(accent ? { borderColor: C.orange } : {}),
      ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ overline, children, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {overline && (
        <div style={{
          fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
          color: C.orange, fontWeight: 700, marginBottom: 8,
        }}>{overline}</div>
      )}
      <h2 style={{
        fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em",
        margin: 0, color: C.ink, lineHeight: 1.15,
      }}>{children}</h2>
      {sub && <div style={{ fontSize: 13, color: C.inkDim, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function TrendBadge({ delta, suffix = "%", invertColors = false, size = "md" }) {
  const isUp = delta > 0;
  const isDown = delta < 0;
  const upColor = invertColors ? C.red : C.green;
  const downColor = invertColors ? C.green : C.red;
  const color = isUp ? upColor : isDown ? downColor : C.inkDim;
  const bg = isUp ? (invertColors ? C.redSoft : C.greenSoft) : isDown ? (invertColors ? C.greenSoft : C.redSoft) : C.bgSoft;
  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
  const padding = size === "sm" ? "3px 8px" : "4px 10px";
  const fontSize = size === "sm" ? 11 : 12;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding, borderRadius: 999, background: bg,
      color, fontSize, fontWeight: 700,
    }}>
      <Icon size={size === "sm" ? 11 : 12} strokeWidth={2.5} />
      {Math.abs(delta)}{suffix}
    </div>
  );
}

// ============================================
// SÉLECTEUR DE MOIS
// ============================================
function MonthPicker({ selectedDate, onChange }) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isCurrentMonth = selectedDate.getMonth() === NOW.getMonth() && selectedDate.getFullYear() === NOW.getFullYear();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "inline-flex", alignItems: "center", gap: 10,
        padding: "10px 16px", borderRadius: 12,
        background: open ? C.orangeSoft : C.paper,
        border: `1px solid ${open ? C.orange : C.line}`,
        cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.ink,
        fontFamily: "inherit", transition: "all 0.15s",
      }}>
        <Calendar size={15} color={C.orange} strokeWidth={2.2} />
        <span>{monthLabel(selectedDate)}</span>
        {isCurrentMonth && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
            padding: "2px 6px", borderRadius: 4,
            background: C.orange, color: "#fff",
          }}>EN COURS</span>
        )}
        <ChevronDown size={14} color={C.inkDim} style={{
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform 0.15s",
        }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
          background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16,
          boxShadow: "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)",
          padding: 20, minWidth: 320,
        }}>
          {/* Raccourcis */}
          <div style={{
            fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
            color: C.inkDim, fontWeight: 700, marginBottom: 8,
          }}>Raccourcis</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Mois en cours", offset: 0 },
              { label: "Mois passé", offset: -1 },
              { label: "Il y a 2 mois", offset: -2 },
              { label: "Il y a 3 mois", offset: -3 },
            ].map(s => {
              const PROJECT_START_MIN = new Date(2026, 2, 1);
              const targetDate = shiftMonth(new Date(NOW.getFullYear(), NOW.getMonth(), 1), s.offset);
              const disabled = targetDate < PROJECT_START_MIN;
              return (
                <button key={s.label} onClick={() => {
                  if (disabled) return;
                  onChange(targetDate);
                  setPickerYear(targetDate.getFullYear());
                  setOpen(false);
                }}
                disabled={disabled}
                style={{
                  padding: "6px 12px", borderRadius: 999,
                  fontSize: 11, fontWeight: 600, color: disabled ? C.inkMute : C.inkSoft,
                  background: C.bgSoft, border: `1px solid ${C.line}`,
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  opacity: disabled ? 0.4 : 1,
                }}
                onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = C.orangeSoft; e.currentTarget.style.color = C.orange; } }}
                onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = C.bgSoft; e.currentTarget.style.color = C.inkSoft; } }}
                >{s.label}</button>
              );
            })}
          </div>

          {/* Year navigator */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${C.line}`,
          }}>
            <button onClick={() => setPickerYear(pickerYear - 1)} style={{
              width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`,
              background: C.paper, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}><ChevronLeft size={14} color={C.inkSoft} /></button>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: "0.02em" }}>
              {pickerYear}
            </span>
            <button onClick={() => setPickerYear(pickerYear + 1)} style={{
              width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`,
              background: C.paper, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}><ChevronRight size={14} color={C.inkSoft} /></button>
          </div>

          {/* Grille mois */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {MOIS_FR_SHORT.map((mois, idx) => {
              const monthDate = new Date(pickerYear, idx, 1);
              const isSelected = selectedDate.getFullYear() === pickerYear && selectedDate.getMonth() === idx;
              const isCurrent = NOW.getFullYear() === pickerYear && NOW.getMonth() === idx;
              const isFuture = monthDate > NOW;
              // Mois antérieur au début du projet (mars 26) → désactivé
              const PROJECT_START_MIN = new Date(2026, 2, 1);
              const isBeforeStart = monthDate < PROJECT_START_MIN;
              const isDisabled = isFuture || isBeforeStart;
              return (
                <button key={idx} onClick={() => {
                  if (!isDisabled) { onChange(monthDate); setOpen(false); }
                }}
                  disabled={isDisabled}
                  style={{
                    padding: "10px 8px", borderRadius: 8,
                    fontSize: 12, fontWeight: isCurrent || isSelected ? 700 : 500,
                    background: isSelected ? C.orange : isCurrent ? C.orangeSoft : "transparent",
                    color: isSelected ? "#fff" : isCurrent ? C.orange : isDisabled ? C.inkMute : C.inkSoft,
                    border: `1px solid ${isSelected ? C.orange : "transparent"}`,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                    opacity: isDisabled ? 0.4 : 1,
                  }}
                  onMouseEnter={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = C.bgSoft; }}
                  onMouseLeave={e => { if (!isDisabled && !isSelected) e.currentTarget.style.background = isCurrent ? C.orangeSoft : "transparent"; }}
                >{mois}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// ONGLET CLASSIQUE
// ============================================

// Helper : calcule l'avancement d'un ticket
// - Priorité 1 : pointAvancement (valeur entre 0 et 1 dans Notion)
// - Priorité 2 : si pas renseigné, on déduit du statut :
//     - FAIT = 100%
//     - Fait partiellement = 50%
//     - En cours = 25%
//     - Tout le reste = 0%
function getAvancement(ticket) {
  // Si pointAvancement est renseigné (et > 0), on le prend en priorité
  const pa = ticket.pointAvancement;
  if (pa != null && pa > 0) return pa;
  // Sinon fallback sur statut
  switch (ticket.statut) {
    case "FAIT": return 1;
    case "Fait partiellement": return 0.5;
    case "En cours": return 0.25;
    default: return 0;
  }
}

function ClassiqueTab({ selectedMonth }) {
  const previousMonth = shiftMonth(selectedMonth, -1);
  const sprintCurrent = sprintLabel(selectedMonth);
  const sprintPrevious = sprintLabel(previousMonth);

  // === KPIs MACRO ===
  const macros = useMemo(() => {
    // Tickets enregistrés sur la période = filtre date de création
    const enregistresCur = CLASSIQUE.filter(t => isInMonth(t.dateCreation, selectedMonth));
    const enregistresPrev = CLASSIQUE.filter(t => isInMonth(t.dateCreation, previousMonth));

    // Tickets dont sprint idéal = mois sélectionné
    const sprintTickets = CLASSIQUE.filter(t => (t.sprintIdeal || []).includes(sprintCurrent));
    const sprintTicketsPrev = CLASSIQUE.filter(t => (t.sprintIdeal || []).includes(sprintPrevious));

    const enCoursCur = sprintTickets.filter(t => t.statut === "En cours").length;
    const enCoursPrev = sprintTicketsPrev.filter(t => t.statut === "En cours").length;

    const faitsCur = sprintTickets.filter(t => t.statut === "FAIT").length;
    const faitsPrev = sprintTicketsPrev.filter(t => t.statut === "FAIT").length;

    const faitPartCur = sprintTickets.filter(t => t.statut === "Fait partiellement").length;
    const faitPartPrev = sprintTicketsPrev.filter(t => t.statut === "Fait partiellement").length;

    // Taux d'avancement = moyenne des avancements de tous les tickets du sprint
    // (utilise getAvancement qui priorise pointAvancement, sinon dérive du statut)
    const avgAvancement = (arr) => {
      if (arr.length === 0) return 0;
      const sum = arr.reduce((acc, t) => acc + getAvancement(t), 0);
      return Math.round((sum / arr.length) * 100);
    };
    const tauxCur = avgAvancement(sprintTickets);
    const tauxPrev = avgAvancement(sprintTicketsPrev);

    function pct(cur, prev) {
      if (prev === 0) return 0;
      return Math.round(((cur - prev) / prev) * 100);
    }

    return {
      enregistres: { value: enregistresCur.length, prev: enregistresPrev.length, delta: pct(enregistresCur.length, enregistresPrev.length) },
      enCours: { value: enCoursCur, prev: enCoursPrev, delta: pct(enCoursCur, enCoursPrev) },
      faits: { value: faitsCur, prev: faitsPrev, delta: pct(faitsCur, faitsPrev) },
      faitPartiellement: { value: faitPartCur, prev: faitPartPrev, delta: pct(faitPartCur, faitPartPrev) },
      taux: { value: tauxCur, prev: tauxPrev, delta: tauxCur - tauxPrev },
      sprintTotal: sprintTickets.length,
    };
  }, [selectedMonth]);

  // === Section 01 : Enregistrements (date de création) ===
  const byMonth = useMemo(() => {
    const m = {};
    CLASSIQUE.forEach(t => {
      const key = monthKey(new Date(t.dateCreation));
      if (!m[key]) m[key] = { total: 0, parClassif: {}, classifDetails: {} };
      m[key].total++;
      m[key].parClassif[t.classification] = (m[key].parClassif[t.classification] || 0) + 1;

      // Détails par classification : produits / fonctions / priorisation
      if (!m[key].classifDetails[t.classification]) {
        m[key].classifDetails[t.classification] = { produits: {}, fonctions: {}, priorisation: {} };
      }
      const det = m[key].classifDetails[t.classification];
      (t.produits || []).forEach(p => { det.produits[p] = (det.produits[p] || 0) + 1; });
      if (t.fonctions) det.fonctions[t.fonctions] = (det.fonctions[t.fonctions] || 0) + 1;
      if (t.priorisation) det.priorisation[t.priorisation] = (det.priorisation[t.priorisation] || 0) + 1;
    });
    return m;
  }, []);

  const enregCur = byMonth[monthKey(selectedMonth)] || { total: 0, parClassif: {}, classifDetails: {} };
  const enregPrev = byMonth[monthKey(previousMonth)] || { total: 0, parClassif: {}, classifDetails: {} };

  // 5 derniers mois autour de selectedMonth (M-4 → M), bornés à Mars 26 minimum
  const PROJECT_START = new Date(2026, 2, 1); // Mars 26 = mois 2 (0-indexed)
  const last5Months = [4, 3, 2, 1, 0]
    .map(d => shiftMonth(selectedMonth, -d))
    .filter(d => d >= PROJECT_START);
  const maxMonth = Math.max(...last5Months.map(d => byMonth[monthKey(d)]?.total || 0), 1);

  return (
    <div>
      {/* === KPIs MACRO STICKY === */}
      <div style={{
        position: "sticky",
        top: 73, // hauteur du header
        zIndex: 50,
        background: C.bg,
        paddingTop: 12,
        paddingBottom: 16,
        marginBottom: 32,
        marginLeft: -32,
        marginRight: -32,
        paddingLeft: 32,
        paddingRight: 32,
        borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{
          fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
          color: C.orange, fontWeight: 700, marginBottom: 8,
        }}>◆ Indicateurs · {monthLabel(selectedMonth)}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          <MacroKpi
            icon={Inbox}
            label="Enregistrés"
            sublabel="Date de création"
            value={macros.enregistres.value}
            delta={macros.enregistres.delta}
            invertTrend={true}
            color={C.ink}
            previous={macros.enregistres.prev}
          />
          <MacroKpi
            icon={Clock}
            label="En cours"
            sublabel={`Sprint ${sprintCurrent}`}
            value={macros.enCours.value}
            delta={macros.enCours.delta}
            color={C.blue}
            previous={macros.enCours.prev}
          />
          <MacroKpi
            icon={CheckCircle2}
            label="Fait partiellement"
            sublabel={`Sprint ${sprintCurrent}`}
            value={macros.faitPartiellement.value}
            delta={macros.faitPartiellement.delta}
            color="#3B82F6"
            previous={macros.faitPartiellement.prev}
          />
          <MacroKpi
            icon={CheckCircle2}
            label="Faits"
            sublabel={`Sprint ${sprintCurrent}`}
            value={macros.faits.value}
            delta={macros.faits.delta}
            color={C.green}
            previous={macros.faits.prev}
          />
          <MacroKpi
            icon={Target}
            label="Taux d'avancement"
            sublabel={`Moyenne sur ${macros.sprintTotal} ticket${macros.sprintTotal > 1 ? "s" : ""}`}
            value={macros.taux.value}
            suffix="%"
            delta={macros.taux.delta}
            deltaSuffix=" pts"
            color={C.orange}
            previous={macros.taux.prev}
            previousSuffix="%"
          />
        </div>
      </div>

      {/* === SECTION 01 : ENREGISTREMENTS === */}
      <section style={{ marginBottom: 48 }}>
        <SectionTitle
          overline="◆ 01 / Analyse des enregistrements"
          sub={`Tickets nouvellement créés · ${monthLabel(selectedMonth)} vs ${monthLabel(previousMonth)}`}
        >
          Tickets <span style={{ color: C.orange }}>créés</span> sur la période
        </SectionTitle>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, alignItems: "stretch" }}>
          <Card style={{ display: "flex", flexDirection: "column" }}>
            <div style={{
              fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 600, marginBottom: 24,
            }}>Évolution · 5 derniers mois</div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flex: 1, minHeight: 200 }}>
              {last5Months.map((d, idx) => {
                const total = byMonth[monthKey(d)]?.total || 0;
                const isCurrent = idx === 4;
                const isPrevious = idx === 3;
                const heightPct = (total / maxMonth) * 78; // % de la hauteur dispo
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
                    <span style={{
                      fontSize: isCurrent ? 22 : 14, fontWeight: 700,
                      color: isCurrent ? C.orange : C.inkSoft,
                    }}>{total}</span>
                    <div style={{
                      width: "100%", height: `${heightPct}%`, minHeight: 4,
                      background: isCurrent ? C.orange : isPrevious ? C.inkSoft : C.inkMute,
                      borderRadius: "8px 8px 0 0",
                      transition: "height 0.8s ease-out",
                      opacity: isCurrent || isPrevious ? 1 : 0.5,
                    }} />
                    <span style={{
                      fontSize: 10, letterSpacing: "0.05em",
                      color: isCurrent ? C.orange : C.inkDim,
                      fontWeight: isCurrent ? 700 : 500,
                      textTransform: "uppercase",
                    }}>{monthLabelShort(d)}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
              <span style={{
                fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
                color: C.inkDim, fontWeight: 600,
              }}>Répartition par classification</span>
              <div style={{ display: "flex", gap: 14, fontSize: 10, color: C.inkDim }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: C.orange }} />
                  {monthLabelShort(selectedMonth)}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: C.inkMute }} />
                  {monthLabelShort(previousMonth)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {CLASSIFICATIONS.map(cl => {
                const cur = enregCur.parClassif[cl] || 0;
                const prev = enregPrev.parClassif[cl] || 0;
                const diff = cur - prev;
                const max = Math.max(...CLASSIFICATIONS.map(c => Math.max(enregCur.parClassif[c] || 0, enregPrev.parClassif[c] || 0)), 1);
                return (
                  <div key={cl}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: C.ink, fontWeight: 600 }}>{cl}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ClassifCountWithTooltip
                          value={cur}
                          color={CLASSIF_COLORS[cl]}
                          classification={cl}
                          details={enregCur.classifDetails[cl]}
                          monthLabel={monthLabelShort(selectedMonth)}
                        />
                        <span style={{ fontSize: 11, color: C.inkDim }}>vs {prev}</span>
                        {diff !== 0 && (
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: diff > 0 ? C.red : C.green,
                            minWidth: 28, textAlign: "right",
                          }}>{diff > 0 ? "↑" : "↓"} {Math.abs(diff)}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ position: "relative", height: 8 }}>
                      <div style={{
                        position: "absolute", top: 2, left: 0, height: 4,
                        width: `${(prev / max) * 100}%`,
                        background: C.inkMute, borderRadius: 2, opacity: 0.4,
                      }} />
                      <div style={{
                        position: "absolute", top: 0, left: 0, height: 8,
                        width: `${(cur / max) * 100}%`,
                        background: CLASSIF_COLORS[cl], borderRadius: 4,
                        transition: "width 0.8s",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </section>

      {/* === SECTION 02 : SPRINT === */}
      <SprintSection sprintCurrent={sprintCurrent} sprintPrevious={sprintPrevious} selectedMonth={selectedMonth} previousMonth={previousMonth} />
    </div>
  );
}

// Chiffre de quantité avec tooltip détaillée au survol (délai 3s)
function ClassifCountWithTooltip({ value, color, classification, details, monthLabel }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Annule tous les timers en attente
  const clearTimers = () => {
    if (openTimerRef.current) { clearTimeout(openTimerRef.current); openTimerRef.current = null; }
    if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
  };

  // Souris entre sur le déclencheur OU sur la tooltip → on ouvre/maintient
  const handleEnter = () => {
    clearTimers();
    if (!showTooltip) {
      openTimerRef.current = setTimeout(() => {
        setShowTooltip(true);
        setSlideIdx(0);
      }, 600);
    }
  };

  // Souris sort → on planifie une fermeture (mais elle peut être annulée si la souris revient)
  const handleLeave = () => {
    clearTimers();
    closeTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 250);
  };

  useEffect(() => {
    return clearTimers;
  }, []);

  const safeDetails = details || { produits: {}, fonctions: {}, priorisation: {} };
  const sortEntries = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

  // Configuration des 3 slides
  const slides = [
    { key: "produits", title: "Produits", icon: "📦", entries: sortEntries(safeDetails.produits) },
    { key: "fonctions", title: "Fonctions", icon: "🧩", entries: sortEntries(safeDetails.fonctions) },
    { key: "priorisation", title: "Priorisation", icon: "🎯", entries: sortEntries(safeDetails.priorisation) },
  ];
  const currentSlide = slides[slideIdx];
  const totalCount = currentSlide.entries.reduce((s, [, c]) => s + c, 0);

  const goPrev = (e) => { e.stopPropagation(); setSlideIdx((slideIdx - 1 + slides.length) % slides.length); };
  const goNext = (e) => { e.stopPropagation(); setSlideIdx((slideIdx + 1) % slides.length); };

  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: "relative",
        fontSize: 18, fontWeight: 700, color,
        cursor: value > 0 ? "help" : "default",
      }}
    >
      {value}
      {showTooltip && value > 0 && (
        <div
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            background: C.paper,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.05)",
            width: 320,
            fontSize: 11, color: C.ink, fontWeight: 400,
            textAlign: "left",
            letterSpacing: "normal",
            textTransform: "none",
            overflow: "hidden",
        }}>
          {/* Zone tampon invisible entre déclencheur et tooltip pour éviter la fermeture */}
          <div style={{
            position: "absolute",
            top: "100%", right: 0, height: 12, width: "100%",
          }} />
          {/* Flèche */}
          <div style={{
            position: "absolute",
            top: "100%", right: 16,
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `6px solid ${C.line}`,
          }} />
          <div style={{
            position: "absolute",
            top: "100%", right: 17,
            marginTop: -1,
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: `5px solid ${C.paper}`,
          }} />

          {/* Header avec couleur classification */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 14px",
            borderBottom: `1px solid ${C.line}`,
            background: `${color}08`,
          }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: color, flexShrink: 0 }} />
            <span style={{
              fontSize: 10, color, fontWeight: 800,
              letterSpacing: "0.06em", textTransform: "uppercase",
              flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{classification}</span>
            <span style={{
              fontSize: 9, color: C.inkDim, fontWeight: 700,
              padding: "2px 7px", borderRadius: 4,
              background: C.paper, border: `1px solid ${C.line}`,
              flexShrink: 0,
            }}>
              {value} · {monthLabel}
            </span>
          </div>

          {/* Slide actuelle */}
          <div style={{ padding: "14px 14px 10px" }}>
            {/* Titre du slide */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
            }}>
              <span style={{ fontSize: 14 }}>{currentSlide.icon}</span>
              <span style={{
                fontSize: 11, color: C.ink, fontWeight: 800,
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>{currentSlide.title}</span>
              {totalCount > 0 && (
                <span style={{
                  marginLeft: "auto",
                  fontSize: 9, color: C.inkDim, fontWeight: 600,
                }}>{currentSlide.entries.length} catégorie{currentSlide.entries.length > 1 ? "s" : ""}</span>
              )}
            </div>

            {/* Liste */}
            {currentSlide.entries.length === 0 ? (
              <div style={{
                fontSize: 11, color: C.inkMute, fontStyle: "italic",
                textAlign: "center", padding: "16px 0",
              }}>Aucune donnée</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 220, overflowY: "auto" }}>
                {currentSlide.entries.map(([label, count]) => {
                  const pct = totalCount > 0 ? (count / totalCount) * 100 : 0;
                  return (
                    <div key={label} style={{
                      position: "relative",
                      padding: "6px 10px",
                      background: C.paper,
                      border: `1px solid ${C.line}`,
                      borderRadius: 6,
                      overflow: "hidden",
                    }}>
                      {/* Barre de fond */}
                      <div style={{
                        position: "absolute", top: 0, left: 0, bottom: 0,
                        width: `${pct}%`,
                        background: `${color}14`,
                        transition: "width 0.3s",
                      }} />
                      <div style={{
                        position: "relative",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        gap: 8,
                      }}>
                        <span style={{
                          fontSize: 11, color: C.ink, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          flex: 1,
                        }}>{label}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 800, color,
                          flexShrink: 0,
                        }}>{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer : navigation slides */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px",
            borderTop: `1px solid ${C.line}`,
            background: C.bg,
          }}>
            <button
              onClick={goPrev}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: `1px solid ${C.line}`,
                background: C.paper,
                color: C.inkSoft, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; }}
            ><ChevronLeft size={14} /></button>

            {/* Indicateurs */}
            <div style={{ display: "flex", gap: 5, flex: 1, justifyContent: "center" }}>
              {slides.map((s, i) => (
                <button
                  key={s.key}
                  onClick={(e) => { e.stopPropagation(); setSlideIdx(i); }}
                  style={{
                    width: i === slideIdx ? 18 : 6, height: 6,
                    borderRadius: 3,
                    background: i === slideIdx ? color : C.lineDark,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    padding: 0,
                  }}
                  title={s.title}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              style={{
                width: 24, height: 24, borderRadius: 6,
                border: `1px solid ${C.line}`,
                background: C.paper,
                color: C.inkSoft, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; }}
            ><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </span>
  );
}

// Section de la tooltip : titre + liste de "Label · count" (gardée pour compatibilité, plus utilisée)
function TooltipSection({ title, entries, color, isLast }) {
  if (entries.length === 0) {
    return (
      <div style={{ marginBottom: isLast ? 0 : 10 }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
          color: C.inkDim, fontWeight: 700, marginBottom: 4,
        }}>{title}</div>
        <div style={{ fontSize: 11, color: C.inkMute, fontStyle: "italic" }}>—</div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: isLast ? 0 : 10 }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
        color: C.inkDim, fontWeight: 700, marginBottom: 4,
      }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {entries.map(([label, count]) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 11, gap: 8,
          }}>
            <span style={{ color: C.inkSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color,
              background: `${color}12`, padding: "1px 6px", borderRadius: 4,
              minWidth: 20, textAlign: "center", flexShrink: 0,
            }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MacroKpi({ icon: Icon, label, sublabel, value, suffix = "", delta, deltaSuffix = "%", invertTrend = false, color, previous, previousSuffix = "" }) {
  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderRadius: 10,
      boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      minHeight: 0,
    }}>
      {/* Top compact : icône à gauche + tendance à droite */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        width: "100%", marginBottom: 4,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: `${color}12`, display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={12} color={color} strokeWidth={2.2} />
        </div>
        {delta !== undefined && delta !== null && <TrendBadge delta={delta} suffix={deltaSuffix} invertColors={invertTrend} size="sm" />}
      </div>
      {/* Label */}
      <div style={{
        fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
        color: C.inkDim, fontWeight: 700, marginBottom: 2,
      }}>{label}</div>
      {/* Valeur centrée */}
      <div style={{
        fontSize: 26, fontWeight: 800, lineHeight: 1,
        color: C.ink, letterSpacing: "-0.03em", marginBottom: 3,
      }}>
        {value}<span style={{ color, fontSize: 16 }}>{suffix}</span>
      </div>
      {/* Sublabel inline avec précédent */}
      <div style={{ fontSize: 9, color: C.inkDim, lineHeight: 1.3 }}>
        {sublabel}
        {previous !== undefined && (
          <span style={{ color: C.inkMute }}> · préc. {previous}{previousSuffix}</span>
        )}
      </div>
    </div>
  );
}

function SprintSection({ sprintCurrent, sprintPrevious, selectedMonth, previousMonth }) {
  const [openTicketId, setOpenTicketId] = useState(null);

  const bySprint = useMemo(() => {
    const m = {};
    CLASSIQUE.forEach(t => {
      (t.sprintIdeal || []).forEach(s => {
        if (!m[s]) m[s] = [];
        m[s].push(t);
      });
    });
    return m;
  }, []);

  const tickets = bySprint[sprintCurrent] || [];
  const total = tickets.length;

  // Stats macro
  const parClassif = tickets.reduce((acc, t) => {
    if (!t.classification) return acc;
    acc[t.classification] = (acc[t.classification] || 0) + 1;
    return acc;
  }, {});
  const parFonction = tickets.reduce((acc, t) => {
    if (!t.fonctions) return acc;
    acc[t.fonctions] = (acc[t.fonctions] || 0) + 1;
    return acc;
  }, {});
  const parProduit = tickets.reduce((acc, t) => {
    (t.produits || []).forEach(p => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {});

  // Stats Initiale / Ajout
  const initStats = tickets.reduce((acc, t) => {
    const tags = t.initialeAjout || [];
    if (tags.includes("Sprint initiale")) acc.initiale++;
    if (tags.includes("Ajout en cours")) acc.ajout++;
    if (tags.includes("Débord sprint suivant")) acc.debord++;
    if (tags.length === 0) acc.nonRenseigne++;
    return acc;
  }, { initiale: 0, ajout: 0, debord: 0, nonRenseigne: 0 });

  // Heures totales du sprint (par équipe)
  const heuresStats = tickets.reduce((acc, t) => {
    acc.front += t.estimFront || 0;
    acc.back += t.estimBack || 0;
    acc.poTest += t.estimPoTest || 0;
    return acc;
  }, { front: 0, back: 0, poTest: 0 });
  const heuresTotales = heuresStats.front + heuresStats.back + heuresStats.poTest;

  return (
    <section style={{ position: "relative" }}>
      <SectionTitle
        overline="◆ 02 / Analyse du sprint"
        sub={`Tickets du sprint en cours · ${sprintCurrent}`}
      >
        Sprint <span style={{ color: C.orange }}>{sprintCurrent}</span>
      </SectionTitle>

      {/* === 3 CARDS MACRO : Classification / Fonction / Produit === */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <DistribCard title="Classification" data={parClassif} colorMap={CLASSIF_COLORS} total={total} />
        <DistribCard title="Fonction" data={parFonction} colorMap={null} total={total} />
        <DistribCard title="Produit" data={parProduit} colorMap={null} total={total} />
      </div>

      {/* === ANALYSE INITIALE / AJOUT === */}
      <InitAjoutAnalysis stats={initStats} total={total} sprintLabel={sprintCurrent} />

      {/* === TABLEAU TICKETS === */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: C.inkDim, fontWeight: 700 }}>
            Tickets · {total}
          </div>
        </div>

        <div style={{ overflowX: "auto", maxHeight: 520, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: C.paper, zIndex: 1 }}>
              <tr style={{ borderBottom: `1px solid ${C.line}` }}>
                {[
                  { label: "TITRE", align: "left" },
                  { label: "CLASSIF.", align: "left" },
                  { label: "STATUT", align: "left" },
                  { label: "AVANCEMENT", align: "left" },
                  { label: "COMPOSITION", align: "center", title: "Sprint initiale / Ajout en cours / Débord sprint suivant" },
                  { label: "COMM", align: "center", title: "Communication prévue" },
                  { label: "", align: "left" },
                ].map((h, idx) => (
                  <th key={idx} title={h.title} style={{
                    textAlign: h.align, padding: "12px 8px",
                    fontSize: 10, letterSpacing: "0.1em", color: C.inkDim,
                    fontWeight: 700, textTransform: "uppercase",
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 32, textAlign: "center", color: C.inkDim, fontSize: 13 }}>
                    Aucun ticket pour ce sprint
                  </td>
                </tr>
              ) : tickets.sort((a, b) => {
                const order = { "FAIT": 0, "Fait partiellement": 1, "En cours": 2, "A planifier": 3, "A etudier": 4, "Stand by": 5 };
                return (order[a.statut] ?? 9) - (order[b.statut] ?? 9);
              }).map((t) => (
                <tr key={t.id} style={{
                  borderBottom: `1px solid ${C.line}`,
                  background: openTicketId === t.id ? C.bgSoft : "transparent",
                  transition: "background 0.15s",
                }}>
                  <td style={{ padding: "12px 8px", color: C.ink, fontWeight: 500, maxWidth: 320 }}>
                    {t.identifiant && (
                      <span style={{
                        display: "inline-block",
                        fontSize: 9, color: C.inkDim, fontWeight: 700,
                        letterSpacing: "0.05em",
                        background: C.bgSoft, padding: "2px 5px", borderRadius: 3,
                        marginRight: 8, verticalAlign: "middle",
                      }}>{t.identifiant}</span>
                    )}
                    <span style={{ verticalAlign: "middle" }}>{t.titre || "(Sans titre)"}</span>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <Pill color={CLASSIF_COLORS[t.classification] || C.inkMute} size="sm">{t.classification}</Pill>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <Pill color={STATUT_COLORS[t.statut] || C.inkMute} size="sm">{t.statut}</Pill>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    {(() => {
                      const av = getAvancement(t);
                      return (
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 120 }}>
                          <div style={{ flex: 1, height: 5, background: C.bgSoft, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              height: "100%",
                              width: `${av * 100}%`,
                              background: av >= 1 ? C.green : C.orange,
                              transition: "width 0.6s",
                            }} />
                          </div>
                          <span style={{
                            fontSize: 11,
                            color: av >= 1 ? C.green : C.orange,
                            fontWeight: 700, minWidth: 30, textAlign: "right",
                          }}>{Math.round(av * 100)}%</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "12px 4px", textAlign: "center" }}>
                    <InitAjoutBadge initialeAjout={t.initialeAjout} />
                  </td>
                  <td style={{ padding: "12px 4px", textAlign: "center" }}>
                    <CommBadge communication={t.communication} />
                  </td>
                  <td style={{ padding: "12px 8px", width: 50, position: "relative" }}>
                    <button
                      onClick={() => setOpenTicketId(openTicketId === t.id ? null : t.id)}
                      style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: openTicketId === t.id ? C.orange : C.bgSoft,
                        border: `1px solid ${openTicketId === t.id ? C.orange : C.line}`,
                        color: openTicketId === t.id ? "#fff" : C.inkSoft,
                        cursor: "pointer",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { if (openTicketId !== t.id) { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; } }}
                      onMouseLeave={e => { if (openTicketId !== t.id) { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; } }}
                    >
                      <Eye size={14} strokeWidth={2.2} />
                    </button>
                    {openTicketId === t.id && (
                      <TicketDetailPopover ticket={t} onClose={() => setOpenTicketId(null)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}

// Badge Initiale / Ajout pour le tableau (3 états possibles)
function InitAjoutBadge({ initialeAjout = [] }) {
  const isInit = initialeAjout.includes("Sprint initiale");
  const isAjout = initialeAjout.includes("Ajout en cours");
  const isDebord = initialeAjout.includes("Débord sprint suivant");

  if (initialeAjout.length === 0) {
    return <span style={{ fontSize: 11, color: C.inkMute }}>—</span>;
  }
  return (
    <div style={{ display: "inline-flex", gap: 4, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
      {isInit && (
        <span title="Sprint initiale" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 9px", borderRadius: 6,
          background: `${C.green}15`, color: C.green,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}><span style={{ fontSize: 8 }}>●</span> Sprint initial</span>
      )}
      {isAjout && (
        <span title="Ajout en cours de sprint" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 9px", borderRadius: 6,
          background: `${C.amber}15`, color: C.amber,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}><span style={{ fontSize: 11, fontWeight: 800 }}>+</span> Ajout en cours</span>
      )}
      {isDebord && (
        <span title="Débord sprint suivant" style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 9px", borderRadius: 6,
          background: `${C.orange}15`, color: C.orange,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
          whiteSpace: "nowrap",
        }}><span style={{ fontSize: 11 }}>↳</span> Débord</span>
      )}
    </div>
  );
}

// Estimation compacte pour le tableau (juste le nombre)
function EstimMini({ value, color }) {
  const v = value || 0;
  if (v === 0) {
    return <span style={{ fontSize: 11, color: C.inkMute }}>—</span>;
  }
  return (
    <span style={{
      display: "inline-block",
      minWidth: 28,
      padding: "3px 6px",
      borderRadius: 5,
      background: `${color}12`,
      color: color,
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
    }}>{v}<span style={{ fontSize: 9, opacity: 0.7 }}>h</span></span>
  );
}

// Badge communication (picto si valeur présente)
function CommBadge({ communication = [] }) {
  const hasFiche = communication.includes("fiche explicative");
  const hasWebinar = communication.includes("webinar");
  if (!hasFiche && !hasWebinar) {
    return <span style={{ fontSize: 11, color: C.inkMute }}>—</span>;
  }
  return (
    <div style={{ display: "inline-flex", gap: 3, alignItems: "center", justifyContent: "center" }}>
      {hasFiche && (
        <span title="Fiche explicative" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 5,
          background: `${C.purple}15`, color: C.purple,
          fontSize: 12, fontWeight: 700,
        }}>📄</span>
      )}
      {hasWebinar && (
        <span title="Webinar" style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, borderRadius: 5,
          background: `${C.amber}15`, color: C.amber,
          fontSize: 12, fontWeight: 700,
        }}>🎥</span>
      )}
    </div>
  );
}

// Affichage compact des équipes assignées dans le tableau
function TeamCell({ persFront = [], persBack = [], persPoTest = [] }) {
  const teams = [
    { label: "F", pers: persFront, color: C.teamFront, title: "Front" },
    { label: "B", pers: persBack, color: C.teamBack, title: "Back" },
    { label: "T", pers: persPoTest, color: C.teamPoTest, title: "PO/Test" },
  ];
  const hasAny = teams.some(t => t.pers.length > 0);
  if (!hasAny) {
    return <span style={{ fontSize: 11, color: C.inkMute }}>—</span>;
  }
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {teams.map(t => (
        t.pers.length > 0 ? (
          <div key={t.label} title={`${t.title} : ${t.pers.join(", ")}`} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "3px 7px", borderRadius: 6,
            background: `${t.color}12`, fontSize: 10,
          }}>
            <span style={{ color: t.color, fontWeight: 800, fontSize: 9 }}>{t.label}</span>
            <span style={{ color: C.inkSoft, fontWeight: 600 }}>
              {t.pers.length === 1 ? t.pers[0] : `${t.pers[0]} +${t.pers.length - 1}`}
            </span>
          </div>
        ) : null
      ))}
    </div>
  );
}

// Bloc d'analyse Initiale / Ajout / Débord pour le sprint
function InitAjoutAnalysis({ stats, total, sprintLabel }) {
  const { initiale, ajout, debord, nonRenseigne } = stats;
  const safeTotal = Math.max(total, 1);
  const pctInitiale = Math.round((initiale / safeTotal) * 100);
  const pctAjout = Math.round((ajout / safeTotal) * 100);
  const pctDebord = Math.round((debord / safeTotal) * 100);

  return (
    <div style={{
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderRadius: 12,
      padding: "18px 20px",
      marginBottom: 16,
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
          color: C.inkDim, fontWeight: 700,
        }}>Composition du sprint</div>
      </div>

      {/* Barre de répartition stackée */}
      <div style={{
        display: "flex", height: 32, borderRadius: 8, overflow: "hidden",
        marginBottom: 14, border: `1px solid ${C.line}`,
      }}>
        {initiale > 0 && (
          <div title={`${initiale} ticket${initiale > 1 ? "s" : ""} planifié${initiale > 1 ? "s" : ""} dès le départ`} style={{
            flex: initiale,
            background: `linear-gradient(180deg, ${C.green}20, ${C.green}10)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: C.green, fontWeight: 700,
            borderRight: `1px solid ${C.green}30`,
          }}>{pctInitiale >= 8 ? `${pctInitiale}%` : ""}</div>
        )}
        {ajout > 0 && (
          <div title={`${ajout} ticket${ajout > 1 ? "s" : ""} ajouté${ajout > 1 ? "s" : ""} en cours de sprint`} style={{
            flex: ajout,
            background: `linear-gradient(180deg, ${C.amber}25, ${C.amber}12)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: C.amber, fontWeight: 700,
            borderRight: `1px solid ${C.amber}30`,
          }}>{pctAjout >= 8 ? `${pctAjout}%` : ""}</div>
        )}
        {debord > 0 && (
          <div title={`${debord} ticket${debord > 1 ? "s" : ""} repoussé${debord > 1 ? "s" : ""} au sprint suivant`} style={{
            flex: debord,
            background: `linear-gradient(180deg, ${C.orange}30, ${C.orange}15)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: C.orange, fontWeight: 700,
          }}>{pctDebord >= 8 ? `${pctDebord}%` : ""}</div>
        )}
        {(initiale + ajout + debord === 0) && (
          <div style={{
            flex: 1, background: C.bgSoft,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: C.inkMute, fontStyle: "italic",
          }}>Aucune donnée</div>
        )}
      </div>

      {/* Légende avec stats détaillées */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        <InitStatBox
          color={C.green}
          icon="●"
          label="Sprint initial"
          value={initiale}
          pct={pctInitiale}
          subtitle="Planifié dès le départ"
        />
        <InitStatBox
          color={C.amber}
          icon="+"
          label="Ajout en cours"
          value={ajout}
          pct={pctAjout}
          subtitle="Arrivé pendant le sprint"
        />
        <InitStatBox
          color={C.orange}
          icon="↳"
          label="Débord"
          value={debord}
          pct={pctDebord}
          subtitle="Repoussé du sprint précédent"
        />
      </div>

      {nonRenseigne > 0 && (
        <div style={{
          marginTop: 10, padding: "8px 12px",
          background: C.bgSoft, borderRadius: 6,
          fontSize: 11, color: C.inkDim,
        }}>
          ⚠ {nonRenseigne} ticket{nonRenseigne > 1 ? "s" : ""} sans champ Initiale/Ajout renseigné
        </div>
      )}
    </div>
  );
}

// Mini-card stat dans la légende Init/Ajout
function InitStatBox({ color, icon, label, value, pct, subtitle }) {
  return (
    <div style={{
      padding: "10px 12px",
      background: `${color}08`,
      border: `1px solid ${color}25`,
      borderRadius: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: 4,
          background: `${color}20`, color: color,
          fontSize: 11, fontWeight: 800,
        }}>{icon}</span>
        <span style={{
          fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
          color: color, fontWeight: 700,
        }}>{label}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{
          fontSize: 22, fontWeight: 800, color: C.ink,
          letterSpacing: "-0.02em", lineHeight: 1,
        }}>{value}</span>
        <span style={{ fontSize: 12, color: C.inkSoft, fontWeight: 600 }}>
          ({pct}%)
        </span>
      </div>
      <div style={{ fontSize: 10, color: C.inkDim, marginTop: 4, fontStyle: "italic" }}>
        {subtitle}
      </div>
    </div>
  );
}

// Card de répartition (classification / fonction / produit)
function DistribCard({ title, data, colorMap, total }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const sumValues = entries.reduce((s, [_, v]) => s + v, 0);

  // SVG donut params
  const size = 130;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 50;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  // Construire les segments du donut
  let cumulOffset = 0;
  const segments = entries.map(([k, v], i) => {
    const fraction = v / sumValues;
    const length = circumference * fraction;
    const offset = cumulOffset;
    cumulOffset += length;
    return {
      key: k,
      value: v,
      color: colorMap?.[k] || palette(i),
      length,
      offset,
      gap: circumference - length,
    };
  });

  return (
    <Card style={{ padding: 20 }}>
      <div style={{
        fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
        color: C.inkDim, fontWeight: 700, marginBottom: 16,
      }}>Par {title}</div>

      {/* Donut + chiffre central */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
          <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            {/* Cercle de fond */}
            <circle cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={C.bgSoft}
              strokeWidth={strokeWidth}
            />
            {/* Segments */}
            {sumValues > 0 && segments.map((s, i) => (
              <circle key={i}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${s.length} ${s.gap}`}
                strokeDashoffset={-s.offset}
                style={{ transition: "stroke-dasharray 0.6s ease-out" }}
              >
                <title>{`${s.key}: ${s.value}`}</title>
              </circle>
            ))}
          </svg>
          {/* Texte au centre */}
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              fontSize: 26, fontWeight: 800, color: C.ink,
              lineHeight: 1, letterSpacing: "-0.02em",
            }}>{entries.length}</div>
            <div style={{
              fontSize: 9, color: C.inkDim, fontWeight: 600,
              letterSpacing: "0.05em", marginTop: 2,
            }}>{title.toLowerCase()}{entries.length > 1 ? "s" : ""}</div>
          </div>
        </div>

        {/* Top 3 légende compacte à droite du donut */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.slice(0, 3).map(([k, v], i) => {
            const pct = Math.round((v / sumValues) * 100);
            return (
              <div key={k} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 11,
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: 3, flexShrink: 0,
                  background: colorMap?.[k] || palette(i),
                }} />
                <span style={{
                  color: C.inkSoft, fontWeight: 500, flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{k}</span>
                <span style={{ color: C.ink, fontWeight: 700, fontSize: 12 }}>{v}</span>
                <span style={{ color: C.inkDim, fontSize: 10, minWidth: 28, textAlign: "right" }}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reste des entries (4+) en liste compacte */}
      {entries.length > 3 && (
        <div style={{
          paddingTop: 12, borderTop: `1px solid ${C.line}`,
          display: "flex", flexDirection: "column", gap: 5,
        }}>
          {entries.slice(3, 7).map(([k, v], i) => {
            const realIdx = i + 3;
            return (
              <div key={k} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 10,
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: 2, flexShrink: 0,
                  background: colorMap?.[k] || palette(realIdx),
                }} />
                <span style={{
                  color: C.inkDim, fontWeight: 500, flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{k}</span>
                <span style={{ color: C.inkSoft, fontWeight: 600 }}>{v}</span>
              </div>
            );
          })}
          {entries.length > 7 && (
            <div style={{ fontSize: 10, color: C.inkMute, marginTop: 2, fontStyle: "italic" }}>
              + {entries.length - 7} autres
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Palette de fallback pour les data sans colorMap
const FALLBACK_COLORS = ["#3B82F6", "#10B981", "#EAB308", "#A855F7", "#EC4899", "#06B6D4", "#F97316", "#84CC16", "#6366F1"];
function palette(i) { return FALLBACK_COLORS[i % FALLBACK_COLORS.length]; }

// Popover détail ticket (au clic sur l'œil)
function TicketDetailPopover({ ticket, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const totalEstim = (ticket.estimFront || 0) + (ticket.estimBack || 0) + (ticket.estimPoTest || 0);

  return (
    <div ref={ref} style={{
      position: "absolute",
      top: "calc(100% + 6px)",
      right: 0,
      zIndex: 50,
      width: 360,
      background: C.paper,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.04)",
      padding: 18,
    }}>
      {/* Header popover */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.line}` }}>
        <div>
          <div style={{
            fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700, marginBottom: 3,
          }}>
            Ticket {ticket.identifiant || `#${ticket.id}`}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.3 }}>
            {ticket.titre || "(Sans titre)"}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 24, height: 24, borderRadius: 6,
          background: "transparent", border: "none",
          color: C.inkDim, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <X size={14} />
        </button>
      </div>

      {/* Fonction */}
      <DetailRow label="Fonction" value={ticket.fonctions || "—"} />

      {/* Explication / commentaire — scrollable, hauteur fixe */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
          color: C.inkDim, fontWeight: 700, marginBottom: 4,
        }}>Explication</div>
        {ticket.explication ? (
          <div style={{
            padding: "10px 12px",
            background: C.bgSoft,
            border: `1px solid ${C.line}`,
            borderRadius: 8,
            fontSize: 12, color: C.ink, lineHeight: 1.5,
            maxHeight: 110,
            overflowY: "auto",
            whiteSpace: "pre-wrap",
          }}>
            {ticket.explication}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.inkMute, fontStyle: "italic" }}>
            Aucune explication renseignée
          </div>
        )}
      </div>

      {/* Points de blocage */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
          color: C.inkDim, fontWeight: 700, marginBottom: 4,
        }}>Points de blocage</div>
        {ticket.pointsBlocage ? (
          <div style={{
            padding: "8px 10px",
            background: C.redSoft,
            border: `1px solid ${C.red}30`,
            borderRadius: 8,
            fontSize: 12, color: C.ink, lineHeight: 1.4,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <AlertCircle size={13} color={C.red} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{ticket.pointsBlocage}</span>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: C.inkMute, fontStyle: "italic" }}>Aucun</div>
        )}
      </div>

      {/* Équipes & Estimations (fusionné) */}
      <div>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
          marginBottom: 8,
        }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.inkDim, fontWeight: 700,
          }}>Équipes & estimations</div>
          <div style={{ fontSize: 11, color: C.inkSoft }}>
            Total : <strong style={{ color: C.orange, fontSize: 14 }}>{totalEstim}h</strong>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          <TeamEstimBox label="Front" pers={ticket.persFront} value={ticket.estimFront} color={C.teamFront} />
          <TeamEstimBox label="Back" pers={ticket.persBack} value={ticket.estimBack} color={C.teamBack} />
          <TeamEstimBox label="PO/Test" pers={ticket.persPoTest} value={ticket.estimPoTest} color={C.teamPoTest} />
        </div>
      </div>

      {/* Sorties (versions intermédiaire et stable) */}
      {(ticket.versionInter || ticket.versionStable || ticket.dateSortieInter || ticket.dateSortieStable) && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.inkDim, fontWeight: 700, marginBottom: 8,
          }}>Sorties</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <ReleaseBox
              label="Version intermédiaire"
              version={ticket.versionInter}
              date={ticket.dateSortieInter}
              color={C.amber}
            />
            <ReleaseBox
              label="Version stable"
              version={ticket.versionStable}
              date={ticket.dateSortieStable}
              color={C.green}
            />
          </div>
        </div>
      )}

      {/* Communication (avec pièce jointe si présente) */}
      {(ticket.communication?.length > 0 || ticket.pieceJointe) && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
          <div style={{
            fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
            color: C.inkDim, fontWeight: 700, marginBottom: 8,
          }}>Communication</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {/* Type(s) de communication */}
            {ticket.communication?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {ticket.communication.map((c) => {
                  const isWebinar = c === "webinar";
                  const color = isWebinar ? C.amber : C.purple;
                  const icon = isWebinar ? "🎥" : "📄";
                  return (
                    <div key={c} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 10px", borderRadius: 6,
                      background: `${color}10`,
                      border: `1px solid ${color}30`,
                    }}>
                      <span style={{ fontSize: 13 }}>{icon}</span>
                      <span style={{
                        fontSize: 11, color: color,
                        fontWeight: 600, textTransform: "capitalize",
                      }}>{c}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Pièce jointe */}
            {ticket.pieceJointe && (
              <a
                href={ticket.pieceJointe.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "8px 10px", borderRadius: 6,
                  background: C.bgSoft,
                  border: `1px solid ${C.line}`,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.background = `${C.orange}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.background = C.bgSoft; }}
              >
                <span style={{ fontSize: 14 }}>📎</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
                    color: C.inkDim, fontWeight: 700,
                  }}>Pièce jointe</div>
                  <div style={{
                    fontSize: 11, color: C.ink, fontWeight: 600,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>{ticket.pieceJointe.name || "Document.pdf"}</div>
                </div>
                <span style={{ fontSize: 11, color: C.orange, fontWeight: 700 }}>↗</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
      <span style={{
        fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
        color: C.inkDim, fontWeight: 700, flexShrink: 0,
      }}>{label}</span>
      <span style={{ fontSize: 12, color: C.ink, fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// Box combinée Équipe + Estimation pour le popover
// Affichage vertical : LABEL en haut / Personne(s) au milieu / Heures en bas
function TeamEstimBox({ label, pers = [], value, color }) {
  const hasPers = pers.length > 0;
  const v = value || 0;
  const hasContent = hasPers || v > 0;
  return (
    <div style={{
      padding: "8px 6px",
      background: hasContent ? `${color}10` : C.bgSoft,
      border: `1px solid ${hasContent ? `${color}40` : C.line}`,
      borderRadius: 8,
      textAlign: "center",
      display: "flex", flexDirection: "column",
      minHeight: 78,
    }}>
      {/* Label en haut */}
      <div style={{
        fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
        color: hasContent ? color : C.inkDim, fontWeight: 700, marginBottom: 6,
      }}>{label}</div>

      {/* Personne(s) */}
      <div style={{
        fontSize: 11, color: hasPers ? C.ink : C.inkMute,
        fontWeight: 600, lineHeight: 1.2,
        fontStyle: hasPers ? "normal" : "italic",
        overflow: "hidden", textOverflow: "ellipsis",
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {hasPers ? (pers.length === 1 ? pers[0] : pers.join(", ")) : "—"}
      </div>

      {/* Estimation en heures */}
      <div style={{
        marginTop: 6, paddingTop: 6,
        borderTop: `1px solid ${hasContent ? `${color}25` : C.line}`,
        fontSize: 16, fontWeight: 800,
        color: v > 0 ? C.ink : C.inkMute,
        letterSpacing: "-0.02em", lineHeight: 1,
      }}>
        {v}<span style={{ fontSize: 10, color: C.inkDim, fontWeight: 600 }}>h</span>
      </div>
    </div>
  );
}

// Bloc d'une version (intermédiaire ou stable) avec date
function ReleaseBox({ label, version, date, color }) {
  const isOut = !!(version || date);
  const formattedDate = date ? new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "2-digit",
  }) : null;

  return (
    <div style={{
      padding: "8px 12px",
      background: isOut ? `${color}10` : C.bgSoft,
      border: `1px solid ${isOut ? `${color}30` : C.line}`,
      borderRadius: 8,
      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
          color: isOut ? color : C.inkDim, fontWeight: 700, marginBottom: 3,
        }}>{label}</div>
        <div style={{
          fontSize: 12, color: isOut ? C.ink : C.inkMute,
          fontWeight: 600, fontStyle: isOut ? "normal" : "italic",
        }}>
          {version ? `v${version}` : "Non sortie"}
        </div>
      </div>
      {formattedDate && (
        <div style={{
          fontSize: 11, color: C.inkSoft, fontWeight: 600, whiteSpace: "nowrap",
        }}>
          {formattedDate}
        </div>
      )}
    </div>
  );
}

function KpiBox({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{ padding: 14, borderRadius: 12, background: bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <Icon size={12} color={color} strokeWidth={2.2} />
        <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color, fontWeight: 700 }}>{label}</span>
      </div>
      <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, lineHeight: 1, letterSpacing: "-0.02em" }}>{value}</span>
    </div>
  );
}

// ============================================
// ONGLET TOP LINE (placeholder)
// ============================================
function TopLineTab() {
  const items = TOP_LINE;
  const [selectedBloc, setSelectedBloc] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  // URL de la maquette interactive (s'ouvre dans un nouvel onglet)
  const VERCEL_PREVIEW_URL = "https://naxigestionfront-prepa.vercel.app/";
  const openFenetrePreview = (fenetre) => {
    window.open(VERCEL_PREVIEW_URL, "_blank", "noopener,noreferrer");
  };

  // === Stats par bloc : score = moyenne simple des 5 avancements de toutes les fenêtres du bloc ===
  const blocs = Object.keys(BLOC_COLORS_TL);
  const blocStats = blocs.map(bloc => {
    const fenetres = items.filter(t => t.bloc === bloc);
    if (fenetres.length === 0) {
      return { bloc, count: 0, score: 0, faits: 0, blocages: 0, retards: 0, fenetresEnRetard: 0, fenetres: [] };
    }
    let sumProgress = 0;
    let totalPhases = 0;
    let blocages = 0;
    let retards = 0;
    let fenetresEnRetard = 0;
    let faits = 0;
    fenetres.forEach(f => {
      let fenLate = false;
      PHASES.forEach(p => {
        sumProgress += (f.avancement[p.key] || 0);
        totalPhases++;
        if (f.etat[p.key] === "Blocage") blocages++;
        if (isPhaseLate(f, p.key)) {
          retards++;
          fenLate = true;
        }
      });
      if (fenLate) fenetresEnRetard++;
      const allDone = PHASES.every(p => f.etat[p.key] === "FAIT");
      if (allDone) faits++;
    });
    return {
      bloc,
      count: fenetres.length,
      score: totalPhases > 0 ? sumProgress / totalPhases : 0,
      faits,
      blocages,
      retards,
      fenetresEnRetard,
      fenetres,
    };
  });

  const totalFenetres = items.length;
  const globalScore = blocStats.reduce((s, b) => s + b.score * b.count, 0) / Math.max(totalFenetres, 1);
  const totalRetards = blocStats.reduce((s, b) => s + b.retards, 0);

  return (
    <div>
      <SectionTitle>
        <span style={{ color: C.orange }}>Top Line</span> · Avancement projet
      </SectionTitle>

      {/* === BLOC 1 : KPIs par bloc fonctionnel === */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14,
        }}>
          <div style={{
            fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
            color: C.inkDim, fontWeight: 700,
          }}>Avancement par bloc</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            {totalRetards > 0 && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "4px 9px", borderRadius: 6,
                background: "#DC262612",
                border: "1px solid #DC262630",
                fontSize: 10, color: "#DC2626", fontWeight: 800,
                letterSpacing: "0.04em", textTransform: "uppercase",
              }}>⚠ {totalRetards} en retard</span>
            )}
            <span style={{ fontSize: 11, color: C.inkDim }}>Avancement global projet :</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.orange, letterSpacing: "-0.02em" }}>
              {Math.round(globalScore * 100)}<span style={{ fontSize: 13 }}>%</span>
            </span>
            <span style={{ fontSize: 11, color: C.inkSoft }}>· {totalFenetres} fenêtres</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {blocStats.map(s => (
            <BlocCard key={s.bloc} stats={s} onClick={() => setSelectedBloc(s)} />
          ))}
        </div>
      </div>

      {/* === BLOC 2 : Gantt === */}
      <Card style={{ padding: 0 }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${C.line}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <div style={{
              fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 700,
            }}>Planning des fenêtres</div>
            <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>
              Phases successives : Maquette → Back → Front → Design → Test
            </div>
          </div>
          {/* Légende des phases */}
          <div style={{ display: "flex", gap: 14, fontSize: 10, color: C.inkSoft, flexWrap: "wrap" }}>
            {PHASES.map(p => (
              <span key={p.key} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontWeight: 600 }}>{p.label}</span>
              </span>
            ))}
          </div>
        </div>

        <GanttChart items={items} onSelectFenetre={openFenetrePreview} onSelectMonth={setSelectedMonth} />
      </Card>

      {/* Modale détails bloc */}
      {selectedBloc && (
        <BlocModal
          stats={selectedBloc}
          onClose={() => setSelectedBloc(null)}
          onSelectFenetre={openFenetrePreview}
        />
      )}

      {/* Modale détails mois */}
      {selectedMonth && (
        <MonthDetailModal
          sprintLabel={selectedMonth}
          items={items}
          onClose={() => setSelectedMonth(null)}
        />
      )}
    </div>
  );
}


// === Card par bloc fonctionnel (cliquable pour ouvrir la modale détails) ===
function BlocCard({ stats, onClick }) {
  const { bloc, count, score, faits, blocages, retards, fenetresEnRetard } = stats;
  const color = BLOC_COLORS_TL[bloc] || C.ink;
  const pct = Math.round(score * 100);
  const [hover, setHover] = useState(false);
  const hasRetard = retards > 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: C.paper,
        border: `1px solid ${hover ? color : C.line}`,
        borderRadius: 10,
        padding: "12px 12px 14px",
        borderTop: `3px solid ${color}`,
        minHeight: 130,
        display: "flex", flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.15s",
        boxShadow: hover ? `0 4px 12px ${color}25` : "none",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        position: "relative",
      }}
    >
      {/* Picto retard en absolute, top-right */}
      {hasRetard && (
        <span title={`${retards} phase${retards > 1 ? "s" : ""} en retard`} style={{
          position: "absolute",
          top: 8, right: 8,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          minWidth: 18, height: 18,
          padding: "0 5px",
          borderRadius: 9,
          background: "#DC2626",
          color: "#fff",
          fontSize: 9, fontWeight: 800,
          letterSpacing: "0.04em",
          boxShadow: "0 1px 3px rgba(220,38,38,0.4)",
        }}>⚠ {retards}</span>
      )}

      <div style={{
        fontSize: 9, letterSpacing: "0.05em", textTransform: "uppercase",
        color: color, fontWeight: 700, marginBottom: 6,
        lineHeight: 1.2,
        paddingRight: hasRetard ? 28 : 0,
      }}>{bloc}</div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <span style={{
          fontSize: 28, fontWeight: 800, color: C.ink,
          letterSpacing: "-0.03em", lineHeight: 1,
        }}>{pct}</span>
        <span style={{ fontSize: 12, color: C.inkDim, fontWeight: 700 }}>%</span>
      </div>

      <div style={{ height: 4, background: C.bgSoft, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color, transition: "width 0.8s",
        }} />
      </div>

      <div style={{
        marginTop: "auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 10, color: C.inkSoft,
      }}>
        <span>{count} fenêtre{count > 1 ? "s" : ""}</span>
        {faits > 0 ? (
          <span style={{ color: "#16A34A", fontWeight: 700 }}>✓ {faits}</span>
        ) : (
          <span style={{ color: hover ? color : C.inkMute, fontWeight: 700, fontSize: 11 }}>↗</span>
        )}
      </div>
    </div>
  );
}

// === Modale détails d'un bloc fonctionnel ===
function BlocModal({ stats, onClose, onSelectFenetre }) {
  const { bloc, count, score, fenetres, retards } = stats;
  const color = BLOC_COLORS_TL[bloc] || C.ink;
  const pct = Math.round(score * 100);

  // Fermer avec ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Tri : fenêtres en retard d'abord, puis par % décroissant
  const sortedFenetres = useMemo(() => {
    return [...fenetres].sort((a, b) => {
      const aLate = countLatePhases(a) > 0 ? 1 : 0;
      const bLate = countLatePhases(b) > 0 ? 1 : 0;
      if (aLate !== bLate) return bLate - aLate;
      const aScore = PHASES.reduce((s, p) => s + (a.avancement[p.key] || 0), 0) / PHASES.length;
      const bScore = PHASES.reduce((s, p) => s + (b.avancement[p.key] || 0), 0) / PHASES.length;
      return bScore - aScore;
    });
  }, [fenetres]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 900, maxHeight: "85vh",
          background: C.paper,
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px",
          borderTop: `4px solid ${color}`,
          borderBottom: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", gap: 16,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 700, marginBottom: 4,
            }}>Vue d'ensemble du bloc</div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: color,
              letterSpacing: "-0.02em",
            }}>{bloc}</div>
          </div>

          {/* Score */}
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 700, marginBottom: 2,
            }}>Avancement</div>
            <div style={{
              fontSize: 28, fontWeight: 800, color,
              letterSpacing: "-0.02em", lineHeight: 1,
            }}>{pct}<span style={{ fontSize: 14 }}>%</span></div>
          </div>

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "transparent",
              border: `1px solid ${C.line}`,
              color: C.inkSoft, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700,
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bgSoft; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            title="Fermer (Échap)"
          >✕</button>
        </div>

        {/* Stats summary */}
        <div style={{
          padding: "14px 24px",
          background: C.bg,
          borderBottom: `1px solid ${C.line}`,
          display: "flex", gap: 24, flexShrink: 0,
        }}>
          <BlocSummaryStat label="Fenêtres" value={count} color={C.ink} />
          <BlocSummaryStat label="Terminées" value={stats.faits} color="#16A34A" />
          <BlocSummaryStat label="En retard" value={retards} color={retards > 0 ? "#DC2626" : C.inkMute} highlight={retards > 0} />
          <BlocSummaryStat label="Blocages" value={stats.blocages} color={stats.blocages > 0 ? "#DC2626" : C.inkMute} />
        </div>

        {/* Liste des fenêtres */}
        <div style={{
          flex: 1, overflowY: "auto",
          padding: "8px 12px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sortedFenetres.map(fen => (
              <BlocFenetreRow
                key={fen.id}
                fenetre={fen}
                onClick={() => onSelectFenetre(fen)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat dans le summary du header
function BlocSummaryStat({ label, value, color, highlight }) {
  return (
    <div style={{
      padding: highlight ? "6px 10px" : 0,
      background: highlight ? `${color}10` : "transparent",
      borderRadius: 6,
      border: highlight ? `1px solid ${color}30` : "none",
    }}>
      <div style={{
        fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
        color: C.inkDim, fontWeight: 700, marginBottom: 2,
      }}>{label}</div>
      <div style={{
        fontSize: 18, fontWeight: 800, color,
        letterSpacing: "-0.02em", lineHeight: 1,
      }}>{value}</div>
    </div>
  );
}

// Ligne d'une fenêtre dans la modale bloc
function BlocFenetreRow({ fenetre, onClick }) {
  const lateCount = countLatePhases(fenetre);
  const isLate = lateCount > 0;
  const score = PHASES.reduce((s, p) => s + (fenetre.avancement[p.key] || 0), 0) / PHASES.length;
  const pct = Math.round(score * 100);
  const maquetteDone = (fenetre.avancement.maquette || 0) >= 1;
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={maquetteDone ? onClick : undefined}
      onMouseEnter={() => maquetteDone && setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        background: hover ? C.bgSoft : (isLate ? "#DC262608" : C.paper),
        border: `1px solid ${isLate ? "#DC262625" : C.line}`,
        borderLeft: isLate ? "3px solid #DC2626" : `1px solid ${C.line}`,
        borderRadius: 6,
        cursor: maquetteDone ? "pointer" : "default",
        transition: "all 0.15s",
      }}
    >
      {/* ID */}
      <span style={{
        fontSize: 9, color: C.inkDim, fontWeight: 700,
        letterSpacing: "0.05em",
        background: C.bgSoft, padding: "2px 5px", borderRadius: 3,
        flexShrink: 0,
      }}>{fenetre.id}</span>

      {/* Nom */}
      <span style={{
        flex: 1, fontSize: 12, color: C.ink, fontWeight: 600,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{fenetre.nom}</span>

      {/* Phases (5 mini pictos avec état) */}
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {PHASES.map(phase => {
          const av = fenetre.avancement[phase.key] || 0;
          const etat = fenetre.etat[phase.key];
          const isPhaseLateHere = isPhaseLate(fenetre, phase.key);
          let bg, fg;
          if (isPhaseLateHere) {
            bg = "#DC2626"; fg = "#fff";
          } else if (etat === "FAIT") {
            bg = "#16A34A"; fg = "#fff";
          } else if (av > 0 || etat) {
            bg = ETAT_COLORS_TL[etat] || C.inkSoft; fg = "#fff";
          } else {
            bg = C.bgSoft; fg = C.inkMute;
          }
          return (
            <span
              key={phase.key}
              title={`${phase.label}${etat ? ` · ${etat}` : ""}${av > 0 ? ` · ${Math.round(av*100)}%` : ""}${isPhaseLateHere ? " · ⚠ EN RETARD" : ""}`}
              style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: 5,
                background: bg, color: fg,
                fontSize: 11,
                fontWeight: 700,
              }}
            >{phase.icon}</span>
          );
        })}
      </div>

      {/* Avancement % */}
      <span style={{
        fontSize: 12, fontWeight: 800, color: C.ink,
        minWidth: 36, textAlign: "right",
        flexShrink: 0,
      }}>{pct}<span style={{ fontSize: 9, color: C.inkDim }}>%</span></span>

      {/* Badge retard */}
      {isLate && (
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          padding: "2px 6px", borderRadius: 4,
          background: "#DC262615",
          color: "#DC2626",
          fontSize: 10, fontWeight: 800,
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}>⚠ {lateCount}</span>
      )}

      {/* Flèche cliquable */}
      {maquetteDone ? (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 20, height: 20, borderRadius: 5,
          background: hover ? C.orange : `${C.orange}12`,
          color: hover ? "#fff" : C.orange,
          fontSize: 11, fontWeight: 800,
          flexShrink: 0,
          transition: "all 0.15s",
        }}>↗</span>
      ) : (
        <span style={{ width: 20, flexShrink: 0 }} />
      )}
    </div>
  );
}

// === Gantt Chart : 1 ligne par fenêtre, groupé par bloc, picto + couleur état par phase ===
function GanttChart({ items, onSelectFenetre, onSelectMonth }) {
  const sprints = TOP_LINE_SPRINTS;
  const sprintCount = sprints.length;
  const colWidth = 95; // largeur d'une colonne sprint (px)
  const labelColWidth = 260; // largeur de la colonne nom de fenêtre
  const rowHeight = 40;
  const blocSepHeight = 30;

  // Index du sprint dans le tableau (0 à sprintCount-1)
  const sprintIdx = (sprintLabel) => sprints.indexOf(sprintLabel);

  // Groupement par bloc en gardant l'ordre des blocs
  const blocs = Object.keys(BLOC_COLORS_TL);
  const grouped = blocs.map(bloc => ({
    bloc,
    fenetres: items.filter(t => t.bloc === bloc),
  })).filter(g => g.fenetres.length > 0);

  return (
    <div style={{ overflow: "auto", maxHeight: 700 }}>
      <div style={{ minWidth: labelColWidth + sprintCount * colWidth, position: "relative" }}>
        {/* === HEADER : mois === */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          display: "flex", background: C.paper,
          borderBottom: `2px solid ${C.line}`,
        }}>
          <div style={{
            width: labelColWidth, flexShrink: 0,
            padding: "12px 14px",
            fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
            color: C.inkDim, fontWeight: 700,
            borderRight: `1px solid ${C.line}`,
            background: C.paper,
            position: "sticky", left: 0, zIndex: 11,
          }}>Fenêtre</div>
          {sprints.map((s, idx) => (
            <MonthHeader
              key={s}
              sprintLabel={s}
              items={items}
              colWidth={colWidth}
              isLast={idx === sprintCount - 1}
              onSelect={onSelectMonth}
            />
          ))}
        </div>

        {/* === LIGNES groupées par BLOC === */}
        {grouped.map((group, groupIdx) => {
          const blocColor = BLOC_COLORS_TL[group.bloc];
          return (
            <div key={group.bloc}>
              {/* Séparateur de bloc */}
              <div style={{
                display: "flex", alignItems: "center",
                height: blocSepHeight,
                background: `${blocColor}10`,
                borderBottom: `1px solid ${blocColor}30`,
                borderTop: groupIdx > 0 ? `1px solid ${C.line}` : "none",
                position: "relative",
              }}>
                <div style={{
                  position: "sticky", left: 0, zIndex: 5,
                  width: labelColWidth, flexShrink: 0,
                  padding: "0 14px",
                  background: `${blocColor}10`,
                  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: blocColor, fontWeight: 800,
                  display: "flex", alignItems: "center", gap: 6,
                  borderRight: `1px solid ${C.line}`,
                  height: "100%",
                }}>
                  <span style={{ width: 4, height: 14, borderRadius: 2, background: blocColor }} />
                  {group.bloc}
                  <span style={{
                    fontSize: 9, color: C.inkDim, fontWeight: 600, marginLeft: "auto",
                    letterSpacing: "0.04em",
                  }}>{group.fenetres.length}</span>
                </div>
                <div style={{ flex: 1 }} />
              </div>

              {/* Lignes des fenêtres */}
              {group.fenetres.map((fen, idx) => (
                <GanttRow
                  key={fen.id}
                  fenetre={fen}
                  sprints={sprints}
                  sprintIdx={sprintIdx}
                  colWidth={colWidth}
                  labelColWidth={labelColWidth}
                  rowHeight={rowHeight}
                  isLast={idx === group.fenetres.length - 1}
                  onSelect={onSelectFenetre}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// === Ligne du Gantt : 1 fenêtre + ses 5 phases positionnées ===
function GanttRow({ fenetre, sprints, sprintIdx, colWidth, labelColWidth, rowHeight, isLast, onSelect }) {
  const sprintCount = sprints.length;
  const totalCellsWidth = sprintCount * colWidth;
  const [hover, setHover] = useState(false);

  // La fenêtre est cliquable seulement si la maquette est à 100%
  const maquetteDone = (fenetre.avancement.maquette || 0) >= 1;
  const isClickable = !!onSelect && maquetteDone;

  // Calcul du nombre max de phases empilées sur le même sprint (pour ajuster hauteur)
  const maxStack = useMemo(() => {
    const counts = {};
    PHASES.forEach(phase => {
      const sprintLabel = fenetre.sprint[phase.key];
      if (!sprintLabel) return;
      counts[sprintLabel] = (counts[sprintLabel] || 0) + 1;
    });
    return Math.max(1, ...Object.values(counts));
  }, [fenetre]);

  // Hauteur ligne adaptée : 40 px pour 1 pilule, +28 px par pilule supplémentaire
  const adaptedHeight = rowHeight + (maxStack - 1) * 28;

  return (
    <div style={{
      display: "flex",
      height: adaptedHeight,
      borderBottom: isLast ? "none" : `1px solid ${C.line}`,
      position: "relative",
    }}>
      {/* Nom fenêtre (sticky left, cliquable si maquette à 100%) */}
      <div
        onClick={() => isClickable && onSelect(fenetre)}
        onMouseEnter={() => isClickable && setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={isClickable ? "Cliquer pour voir la maquette" : "Maquette en cours — aperçu disponible une fois la maquette terminée"}
        style={{
          position: "sticky", left: 0, zIndex: 4,
          width: labelColWidth, flexShrink: 0,
          padding: "0 14px",
          background: hover && isClickable ? C.bgSoft : C.paper,
          fontSize: 12, color: C.ink, fontWeight: 500,
          display: "flex", alignItems: "center", gap: 8,
          borderRight: `1px solid ${C.line}`,
          height: "100%",
          cursor: isClickable ? "pointer" : "default",
          transition: "background 0.15s",
          opacity: isClickable ? 1 : 0.92,
        }}
      >
        <span style={{
          fontSize: 9, color: C.inkDim, fontWeight: 700,
          letterSpacing: "0.05em",
          background: C.bgSoft, padding: "2px 5px", borderRadius: 3,
          flexShrink: 0,
        }}>{fenetre.id}</span>
        <span style={{
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          flex: 1,
          color: isClickable ? C.ink : C.inkSoft,
        }}>{fenetre.nom}</span>
        {/* Flèche visible uniquement si cliquable, sinon rien */}
        {isClickable && (
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 5,
            background: hover ? C.orange : `${C.orange}12`,
            color: hover ? "#fff" : C.orange,
            fontSize: 12, fontWeight: 800,
            flexShrink: 0,
            transition: "all 0.15s",
          }}>↗</span>
        )}
      </div>

      {/* Grille des sprints (background avec lignes verticales) */}
      <div style={{
        position: "relative",
        width: totalCellsWidth,
        flexShrink: 0,
      }}>
        {/* Lignes verticales (séparateurs de mois) */}
        {sprints.map((s, idx) => (
          <div key={`sep-${s}`} style={{
            position: "absolute",
            top: 0, bottom: 0, left: idx * colWidth,
            borderLeft: idx > 0 ? `1px solid ${C.line}` : "none",
            opacity: 0.4,
          }} />
        ))}

        {/* Phases de cette fenêtre - empilées si plusieurs sur le même sprint */}
        {(() => {
          // Groupement par sprintIdx pour gérer les empilements
          const phasesByIdx = {};
          PHASES.forEach(phase => {
            const sprintLabel = fenetre.sprint[phase.key];
            if (!sprintLabel) return;
            const idx = sprintIdx(sprintLabel);
            if (idx < 0) return;
            if (!phasesByIdx[idx]) phasesByIdx[idx] = [];
            phasesByIdx[idx].push({ phase, sprintLabel });
          });

          // Rendu : chaque phase positionnée selon son rang dans le mois
          const pills = [];
          Object.entries(phasesByIdx).forEach(([idxStr, phasesInSprint]) => {
            const idx = parseInt(idxStr, 10);
            phasesInSprint.forEach(({ phase, sprintLabel }, stackIdx) => {
              const etat = fenetre.etat[phase.key];
              const avancement = fenetre.avancement[phase.key] || 0;
              const isStarted = avancement > 0 || etat;
              const etatColor = etat ? (ETAT_COLORS_TL[etat] || C.inkMute) : null;
              const isLate = isPhaseLate(fenetre, phase.key);

              pills.push(
                <PhasePill
                  key={phase.key}
                  phase={phase}
                  etat={etat}
                  avancement={avancement}
                  isStarted={isStarted}
                  etatColor={etatColor}
                  left={idx * colWidth + 4}
                  width={colWidth - 8}
                  rowHeight={adaptedHeight}
                  stackIndex={stackIdx}
                  stackTotal={phasesInSprint.length}
                  fenetre={fenetre}
                  sprintLabel={sprintLabel}
                  isLate={isLate}
                />
              );
            });
          });
          return pills;
        })()}
      </div>
    </div>
  );
}

// === Pilule d'une phase sur le Gantt ===

// === En-tête mois (cliquable pour ouvrir une modale détaillée) ===
function MonthHeader({ sprintLabel, items, colWidth, isLast, onSelect }) {
  const [hover, setHover] = useState(false);

  // Compteur rapide de phases planifiées sur ce sprint
  const phaseCount = useMemo(() => {
    let count = 0;
    items.forEach(fen => {
      PHASES.forEach(phase => {
        if (fen.sprint[phase.key] === sprintLabel) count++;
      });
    });
    return count;
  }, [sprintLabel, items]);

  const isClickable = phaseCount > 0 && !!onSelect;

  return (
    <div
      onClick={() => isClickable && onSelect(sprintLabel)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={isClickable ? `Cliquer pour voir le détail de ${sprintLabel}` : undefined}
      style={{
        width: colWidth, flexShrink: 0,
        padding: "12px 6px", textAlign: "center",
        fontSize: 10, letterSpacing: "0.05em",
        color: C.inkDim, fontWeight: 700, textTransform: "uppercase",
        borderRight: !isLast ? `1px solid ${C.line}` : "none",
        cursor: isClickable ? "pointer" : "default",
        background: isClickable && hover ? C.bgSoft : "transparent",
        transition: "background 0.15s",
      }}
    >
      {sprintLabel.replace(" 2026", " 26")}
      {phaseCount > 0 && (
        <div style={{
          fontSize: 9, color: C.orange, fontWeight: 700, marginTop: 2,
          letterSpacing: "0.05em",
        }}>{phaseCount} phase{phaseCount > 1 ? "s" : ""}</div>
      )}
    </div>
  );
}

// === Modale détail mois : 1 slide par phase (Maquette / Back / Front / Design / Test) ===
function MonthDetailModal({ sprintLabel, items, onClose }) {
  const [slideIdx, setSlideIdx] = useState(0);

  // Fermeture via Échap
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Calcul : pour chaque phase, liste des fenêtres planifiées sur ce sprint
  const recap = useMemo(() => {
    const parPhase = {};
    PHASES.forEach(p => { parPhase[p.key] = []; });

    items.forEach(fen => {
      PHASES.forEach(phase => {
        if (fen.sprint[phase.key] === sprintLabel) {
          const etat = fen.etat[phase.key];
          const av = fen.avancement[phase.key] || 0;
          parPhase[phase.key].push({
            fenetre: fen.nom,
            id: fen.id,
            bloc: fen.bloc,
            etat,
            av,
            isFait: etat === "FAIT",
            isBlocage: etat === "Blocage",
          });
        }
      });
    });

    let total = 0;
    PHASES.forEach(p => { total += parPhase[p.key].length; });
    return { parPhase, total };
  }, [sprintLabel, items]);

  // Slides = uniquement phases avec entrées
  const slidesPhases = PHASES.filter(p => recap.parPhase[p.key].length > 0);
  const currentPhase = slidesPhases[slideIdx] || PHASES[0];
  const currentEntries = recap.parPhase[currentPhase.key] || [];

  // Tri : FAIT puis par % décroissant
  const sortedEntries = useMemo(() => {
    return [...currentEntries].sort((a, b) => {
      const aFait = a.isFait ? 1 : 0;
      const bFait = b.isFait ? 1 : 0;
      if (aFait !== bFait) return bFait - aFait;
      return (b.av || 0) - (a.av || 0);
    });
  }, [currentEntries]);

  // Stats du slide
  const slideStats = useMemo(() => {
    const fait = currentEntries.filter(e => e.isFait).length;
    const blocage = currentEntries.filter(e => e.isBlocage).length;
    const enCours = currentEntries.filter(e => !e.isFait && !e.isBlocage && (e.av > 0 || e.etat)).length;
    const aVenir = currentEntries.filter(e => !e.isFait && !e.isBlocage && e.av === 0 && !e.etat).length;
    return { fait, blocage, enCours, aVenir };
  }, [currentEntries]);

  const goPrev = () => setSlideIdx((slideIdx - 1 + slidesPhases.length) % slidesPhases.length);
  const goNext = () => setSlideIdx((slideIdx + 1) % slidesPhases.length);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 720, maxHeight: "85vh",
          background: C.paper,
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 24px",
          borderBottom: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", gap: 14,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 700, marginBottom: 4,
            }}>Détail du sprint</div>
            <div style={{
              fontSize: 22, fontWeight: 800, color: C.orange,
              letterSpacing: "-0.02em",
            }}>{sprintLabel}</div>
          </div>
          <span style={{
            fontSize: 11, color: C.inkSoft, fontWeight: 600,
            padding: "4px 10px", borderRadius: 6,
            background: C.bgSoft, border: `1px solid ${C.line}`,
          }}>
            {recap.total} phase{recap.total > 1 ? "s" : ""} planifiée{recap.total > 1 ? "s" : ""}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "transparent",
              border: `1px solid ${C.line}`,
              color: C.inkSoft, cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700,
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = C.bgSoft; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            title="Fermer (Échap)"
          >✕</button>
        </div>

        {/* Si aucune phase planifiée */}
        {recap.total === 0 ? (
          <div style={{
            padding: 40, textAlign: "center",
            fontSize: 13, color: C.inkMute, fontStyle: "italic",
          }}>Aucune phase planifiée sur ce sprint</div>
        ) : (
          <>
            {/* Slide actuelle */}
            <div style={{ padding: "20px 24px 8px", flexShrink: 0 }}>
              {/* Titre de la phase */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
              }}>
                <span style={{ fontSize: 22 }}>{currentPhase.icon}</span>
                <span style={{
                  fontSize: 13, color: currentPhase.color, fontWeight: 800,
                  letterSpacing: "0.05em", textTransform: "uppercase",
                }}>{currentPhase.label}</span>
                <span style={{
                  marginLeft: "auto",
                  fontSize: 11, color: C.inkSoft, fontWeight: 600,
                }}>{currentEntries.length} fenêtre{currentEntries.length > 1 ? "s" : ""}</span>
              </div>

              {/* Mini stats */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6,
              }}>
                <RecapStat label="FAIT" count={slideStats.fait} color="#16A34A" />
                <RecapStat label="En cours" count={slideStats.enCours} color="#2563EB" />
                <RecapStat label="À venir" count={slideStats.aVenir} color={C.inkDim} />
                <RecapStat label="Blocage" count={slideStats.blocage} color="#DC2626" />
              </div>
            </div>

            {/* Liste des fenêtres */}
            <div style={{
              flex: 1, padding: "8px 24px 20px",
              overflowY: "auto",
            }}>
              {sortedEntries.length === 0 ? (
                <div style={{
                  fontSize: 12, color: C.inkMute, fontStyle: "italic",
                  textAlign: "center", padding: "20px 0",
                }}>Aucune fenêtre</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {sortedEntries.map((entry, i) => {
                    const etatColor = entry.etat ? (ETAT_COLORS_TL[entry.etat] || C.inkMute) : C.inkMute;
                    const blocColor = BLOC_COLORS_TL[entry.bloc] || C.inkMute;
                    const pct = entry.isFait ? 100 : Math.round((entry.av || 0) * 100);
                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px",
                        background: C.paper,
                        border: `1px solid ${C.line}`,
                        borderLeft: `4px solid ${blocColor}`,
                        borderRadius: 6,
                      }}>
                        <span style={{
                          fontSize: 9, color: C.inkDim, fontWeight: 700,
                          letterSpacing: "0.04em", flexShrink: 0,
                          background: C.bgSoft, padding: "2px 5px", borderRadius: 3,
                        }}>{entry.id}</span>
                        <span style={{
                          flex: 1, fontSize: 12, color: C.ink, fontWeight: 600,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{entry.fenetre}</span>
                        <span style={{
                          fontSize: 9, color: blocColor, fontWeight: 700,
                          letterSpacing: "0.04em", textTransform: "uppercase",
                          padding: "2px 6px", borderRadius: 4,
                          background: `${blocColor}10`,
                          flexShrink: 0,
                        }}>{entry.bloc}</span>
                        <span style={{
                          fontSize: 13, fontWeight: 800,
                          color: entry.isFait ? "#16A34A" : (entry.isBlocage ? "#DC2626" : etatColor),
                          flexShrink: 0,
                          minWidth: 45, textAlign: "right",
                        }}>{entry.isBlocage ? "⚠" : `${pct}%`}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer : navigation slides */}
            {slidesPhases.length > 1 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "14px 24px",
                borderTop: `1px solid ${C.line}`,
                background: C.bg,
                flexShrink: 0,
              }}>
                <button
                  onClick={goPrev}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: `1px solid ${C.line}`,
                    background: C.paper,
                    color: C.inkSoft, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = currentPhase.color; e.currentTarget.style.color = currentPhase.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; }}
                ><ChevronLeft size={16} /></button>

                {/* Indicateurs phases */}
                <div style={{ display: "flex", gap: 6, flex: 1, justifyContent: "center" }}>
                  {slidesPhases.map((p, i) => (
                    <button
                      key={p.key}
                      onClick={() => setSlideIdx(i)}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4,
                        height: 30, padding: i === slideIdx ? "0 12px" : "0 8px",
                        borderRadius: 7,
                        background: i === slideIdx ? p.color : "transparent",
                        border: `1px solid ${i === slideIdx ? p.color : C.line}`,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        fontSize: 12,
                        color: i === slideIdx ? "#fff" : C.inkSoft,
                        fontWeight: i === slideIdx ? 700 : 500,
                      }}
                      title={p.label}
                    >
                      <span style={{ fontSize: 14 }}>{p.icon}</span>
                      {i === slideIdx && (
                        <span style={{ fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                          {p.label}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={goNext}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: `1px solid ${C.line}`,
                    background: C.paper,
                    color: C.inkSoft, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = currentPhase.color; e.currentTarget.style.color = currentPhase.color; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; }}
                ><ChevronRight size={16} /></button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Mini-card stat dans la tooltip mois
function RecapStat({ label, count, color }) {
  if (count === 0) {
    return (
      <div style={{
        padding: "5px 6px",
        background: C.bgSoft, border: `1px solid ${C.line}`,
        borderRadius: 6, textAlign: "center",
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.inkMute, lineHeight: 1 }}>0</div>
        <div style={{ fontSize: 8, color: C.inkMute, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>
          {label}
        </div>
      </div>
    );
  }
  return (
    <div style={{
      padding: "5px 6px",
      background: `${color}12`, border: `1px solid ${color}30`,
      borderRadius: 6, textAlign: "center",
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 8, color, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginTop: 2 }}>
        {label}
      </div>
    </div>
  );
}

function PhasePill({ phase, etat, avancement, isStarted, etatColor, left, width, rowHeight, fenetre, sprintLabel, stackIndex = 0, stackTotal = 1, isLate = false }) {
  const pillHeight = 24;
  const stackGap = 4; // espace entre 2 pilules empilées
  const stackUnit = pillHeight + stackGap;

  // Position verticale : si plusieurs phases sur le même mois, on les empile
  // Le bloc empilé total est centré verticalement dans la ligne
  const stackedHeight = stackTotal * pillHeight + (stackTotal - 1) * stackGap;
  const stackTop = (rowHeight - stackedHeight) / 2;
  const top = stackTop + stackIndex * stackUnit;

  const isFait = etat === "FAIT";
  const pct = Math.max(0, Math.min(1, avancement || 0));

  // Couleur de référence :
  // - Rouge si en retard
  // - Couleur état si défini (et pas en retard)
  // - Gris sinon
  const RED = "#DC2626";
  const refColor = isLate ? RED : (isStarted ? etatColor : C.lineDark);
  const fillPct = isFait ? 100 : Math.round(pct * 100);
  const showAsLate = isLate; // pour bordure pleine et fond clair même si pas commencé

  return (
    <div
      title={`${phase.label} · ${sprintLabel}${etat ? ` · ${etat}` : ""}${avancement > 0 ? ` · ${Math.round(avancement * 100)}%` : ""}${isLate ? " · ⚠ EN RETARD" : ""}`}
      style={{
        position: "absolute",
        top, left, width, height: pillHeight,
        background: showAsLate ? `${RED}10` : (isStarted ? `${refColor}15` : C.bgSoft),
        border: `1px solid ${refColor}`,
        borderStyle: showAsLate || isStarted ? "solid" : "dashed",
        borderWidth: showAsLate ? 1.5 : 1,
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: showAsLate ? `0 0 0 2px ${RED}20` : (isStarted ? `0 1px 2px ${refColor}30` : "none"),
      }}
    >
      {/* Remplissage proportionnel à l'avancement (couleur état ou rouge si retard) */}
      {(isStarted || showAsLate) && fillPct > 0 && (
        <div style={{
          position: "absolute",
          top: 0, left: 0, bottom: 0,
          width: `${fillPct}%`,
          background: refColor,
          opacity: 0.45,
          transition: "width 0.6s ease-out",
        }} />
      )}

      {/* Contenu (icône + % uniquement) — au-dessus du remplissage */}
      <div style={{
        position: "relative", zIndex: 1,
        height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        padding: "0 6px",
        fontSize: 11, fontWeight: 700,
        // Texte toujours en noir foncé pour lisibilité (sur fond clair grâce à fillPct < 100)
        color: C.ink,
      }}>
        <span style={{ fontSize: 13, lineHeight: 1 }}>{phase.icon}</span>
        {isFait ? (
          <span style={{ fontSize: 11, fontWeight: 800 }}>100%</span>
        ) : avancement > 0 ? (
          <span style={{ fontSize: 11, fontWeight: 700 }}>{Math.round(avancement * 100)}%</span>
        ) : null}
      </div>
    </div>
  );
}

// ============================================
// LOGIN PAGE
// ============================================
function LoginPage({ onLogin }) {
  const [identifiant, setIdentifiant] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Identifiants attendus (encodés en base64 pour qu'ils ne soient pas en clair dans le code)
  // ID = "Inaxel" → "SW5heGVs"
  // MDP = "InaxelKPI" → "SW5heGVsS1BJ"
  const EXPECTED_ID = atob("SW5heGVs");
  const EXPECTED_PWD = atob("SW5heGVsS1BJ");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (identifiant.trim() === EXPECTED_ID && password === EXPECTED_PWD) {
      setError("");
      onLogin();
    } else {
      setError("Identifiant ou mot de passe incorrect");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit(e);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.ink,
      fontFamily: "'Mulish', -apple-system, system-ui, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body, html, #root { font-family: 'Mulish', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>

      <div className={shake ? "shake" : ""} style={{
        width: "100%", maxWidth: 420,
        background: C.paper,
        borderRadius: 14,
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        border: `1px solid ${C.line}`,
        padding: "40px 36px 32px",
      }}>
        {/* Logo + identité */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <LogoInaxel size={42} />
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: C.ink,
            letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 4,
          }}>inaxel</div>
          <div style={{
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: C.orange, fontWeight: 700,
          }}>KPI · Produits & qualité</div>
        </div>

        {/* Sous-titre */}
        <div style={{
          textAlign: "center", marginBottom: 28,
          fontSize: 13, color: C.inkSoft,
        }}>
          Connexion à l'espace de pilotage
        </div>

        {/* Formulaire */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Champ Identifiant */}
          <div>
            <label style={{
              display: "block",
              fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 700, marginBottom: 6,
            }}>Identifiant</label>
            <div style={{ position: "relative" }}>
              <UserIcon size={14} style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: C.inkMute, pointerEvents: "none",
              }} />
              <input
                type="text"
                value={identifiant}
                onChange={(e) => { setIdentifiant(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder="Votre identifiant"
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  border: `1px solid ${error ? "#DC2626" : C.line}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: C.ink,
                  background: C.paper,
                  outline: "none",
                  transition: "border 0.15s",
                }}
                onFocus={e => { if (!error) e.currentTarget.style.borderColor = C.orange; }}
                onBlur={e => { if (!error) e.currentTarget.style.borderColor = C.line; }}
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label style={{
              display: "block",
              fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
              color: C.inkDim, fontWeight: 700, marginBottom: 6,
            }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <Lock size={14} style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: C.inkMute, pointerEvents: "none",
              }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={handleKeyDown}
                placeholder="Votre mot de passe"
                style={{
                  width: "100%",
                  padding: "10px 40px 10px 36px",
                  border: `1px solid ${error ? "#DC2626" : C.line}`,
                  borderRadius: 8,
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: C.ink,
                  background: C.paper,
                  outline: "none",
                  transition: "border 0.15s",
                }}
                onFocus={e => { if (!error) e.currentTarget.style.borderColor = C.orange; }}
                onBlur={e => { if (!error) e.currentTarget.style.borderColor = C.line; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                style={{
                  position: "absolute", right: 8, top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent", border: "none",
                  color: C.inkMute, cursor: "pointer",
                  padding: 6,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.orange; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.inkMute; }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 10px",
              background: "#DC262610",
              border: "1px solid #DC262630",
              borderRadius: 6,
              fontSize: 11, color: "#DC2626", fontWeight: 600,
            }}>
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          {/* Bouton de connexion */}
          <button
            onClick={handleSubmit}
            disabled={!identifiant || !password}
            style={{
              marginTop: 8,
              padding: "12px 16px",
              background: (!identifiant || !password) ? C.inkMute : C.orange,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13, fontWeight: 700,
              fontFamily: "inherit",
              letterSpacing: "0.02em",
              cursor: (!identifiant || !password) ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              boxShadow: (!identifiant || !password) ? "none" : `0 1px 3px ${C.orange}50`,
            }}
            onMouseEnter={e => { if (identifiant && password) { e.currentTarget.style.background = C.orangeDark; } }}
            onMouseLeave={e => { if (identifiant && password) { e.currentTarget.style.background = C.orange; } }}
          >
            Se connecter
          </button>
        </div>

        {/* Footer discret */}
        <div style={{
          marginTop: 28, paddingTop: 20,
          borderTop: `1px solid ${C.line}`,
          textAlign: "center",
          fontSize: 10, color: C.inkMute,
          letterSpacing: "0.04em",
        }}>
          NAXI.G · KPI - Produits & qualité
        </div>
      </div>
    </div>
  );
}

// ============================================
// APP
// ============================================
export default function Dashboard() {
  const [tab, setTab] = useState("classique");
  const [selectedMonth, setSelectedMonth] = useState(new Date(NOW.getFullYear(), NOW.getMonth(), 1));

  // === Authentification ===
  // Persistance dans sessionStorage : reste connecté pendant la session du navigateur
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem("inaxel_kpi_auth") === "ok";
    } catch (e) {
      return false;
    }
  });

  const handleLogin = () => {
    try { sessionStorage.setItem("inaxel_kpi_auth", "ok"); } catch (e) {}
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try { sessionStorage.removeItem("inaxel_kpi_auth"); } catch (e) {}
    setIsAuthenticated(false);
  };

  // === Chargement des données réelles depuis data.json (généré par GitHub Actions) ===
  const [dataLoaded, setDataLoaded] = useState(false);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    // Construit le chemin vers data.json en respectant le base URL (GitHub Pages)
    const baseUrl = import.meta.env.BASE_URL || '/';
    const dataUrl = `${baseUrl.replace(/\/$/, '')}/data.json`;

    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Si les données sont présentes (non vides), on remplace les mocks
        if (data && Array.isArray(data.classique) && data.classique.length > 0) {
          CLASSIQUE = data.classique;
        }
        if (data && Array.isArray(data.topline) && data.topline.length > 0) {
          TOP_LINE = data.topline;
        }
        DATA_GENERATED_AT = data?.generatedAt || null;
        setDataLoaded(true);
      })
      .catch(err => {
        console.warn('Pas de data.json disponible, fallback sur les mocks :', err.message);
        setDataError(err.message);
        setDataLoaded(true); // On affiche quand même le dashboard avec les mocks
      });
  }, []);

  // Si pas connecté → page de connexion
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.ink,
      fontFamily: "'Mulish', -apple-system, system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body, html, #root { font-family: 'Mulish', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in > * { animation: fadeUp 0.4s ease-out backwards; }
        .fade-in > *:nth-child(1) { animation-delay: 0.05s; }
        .fade-in > *:nth-child(2) { animation-delay: 0.12s; }
        .fade-in > *:nth-child(3) { animation-delay: 0.18s; }
        button { font-family: inherit; }
      `}</style>

      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: `${C.bg}f5`, backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${C.line}`,
      }}>
        <div style={{
          maxWidth: 1300, margin: "0 auto",
          padding: "16px 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <LogoInaxel size={36} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: C.ink }}>
                inaxel
              </div>
              <div style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.orange, marginTop: 2, fontWeight: 700 }}>
                KPI · Produits & qualité
              </div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: 4, background: C.bgSoft, padding: 4, borderRadius: 999 }}>
            {[
              { key: "classique", label: "Classique" },
              { key: "topline", label: "Top Line" },
            ].map(item => (
              <button key={item.key} onClick={() => setTab(item.key)} style={{
                padding: "8px 20px", fontSize: 13, fontWeight: 700,
                background: tab === item.key ? C.paper : "transparent",
                color: tab === item.key ? C.ink : C.inkSoft,
                border: "none", borderRadius: 999, cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: tab === item.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>{item.label}</button>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {tab === "classique" && <MonthPicker selectedDate={selectedMonth} onChange={setSelectedMonth} />}
            <Button variant="outline" icon={RefreshCw} size="sm">Refresh</Button>
            <button
              onClick={handleLogout}
              title="Déconnexion"
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "transparent",
                border: `1px solid ${C.line}`,
                color: C.inkSoft, cursor: "pointer",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.line; e.currentTarget.style.color = C.inkSoft; }}
            >
              <LogOut size={14} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1300, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div className="fade-in" key={`${tab}-${monthKey(selectedMonth)}`}>
          {tab === "classique" && <ClassiqueTab selectedMonth={selectedMonth} />}
          {tab === "topline" && <TopLineTab />}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${C.line}`, padding: "20px 32px" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: C.inkDim }}>
          <span style={{ fontWeight: 600 }}>NAXI.G · KPI - Produits & qualité</span>
          <span>Powered by Notion + GitHub · Auto-sync 15 min</span>
        </div>
      </footer>
    </div>
  );
}
