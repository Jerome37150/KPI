/**
 * Script de récupération des données depuis Notion
 * Génère un fichier public/data.json consommé par le dashboard
 *
 * Usage : NOTION_TOKEN=ntn_xxx node scripts/fetch-notion.js
 *
 * Bases Notion :
 *  - Sprint Classique NAXI.G        : 3058db15-623a-80d3-9deb-fb95191faa96
 *  - 📋 Retro-planning Top Line     : 3108db15-623a-80ed-bf9a-000b2e7d0ead
 *  - 📅 Suivi lundi (saisies hebdo) : ce0ddde9-3441-44a7-9cb6-97ac7833266c
 *  - 👥 Équipe NAXI.G               : 4ad9fff6-2853-4c1a-b9a4-0a63c0e40f80
 *
 * Cartographies stratégiques (PMS Web / PMS Mobile / Manager) : best-effort.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data.json');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2022-06-28';
const NOTION_API = 'https://api.notion.com/v1';

const DB_CLASSIQUE   = '3058db15-623a-80d3-9deb-fb95191faa96';
const DB_TOPLINE     = '3108db15-623a-80ed-bf9a-000b2e7d0ead';
const DB_SUIVI_LUNDI = 'ce0ddde9-3441-44a7-9cb6-97ac7833266c';
const DB_EQUIPE      = '4ad9fff6-2853-4c1a-b9a4-0a63c0e40f80';

const DB_CARTO_PMS_WEB    = 'e712a61e-0880-4bb9-b198-3d1d0bcaedc1';
const DB_CARTO_PMS_MOBILE = 'd16c64be-2dc6-4f91-8724-5f1068004cc6';
const DB_CARTO_MANAGER    = 'd92b19c5-f3e3-42a5-bcfa-673f3d1d11f6';

const HOURS_PER_DAY = 7; // conversion heures → jours (journée FR)

const PHASES = ['MAQUETTE', 'BACK', 'FRONT', 'DESIGN', 'TEST'];
const PHASE_KEYS = { MAQUETTE: 'maquette', BACK: 'back', FRONT: 'front', DESIGN: 'design', TEST: 'test' };

if (!NOTION_TOKEN) {
  console.error('❌ Erreur : la variable NOTION_TOKEN est requise.');
  console.error('   Usage : NOTION_TOKEN=ntn_xxx node scripts/fetch-notion.js');
  process.exit(1);
}

// === Helpers Notion API ===
async function notionFetch(endpoint, body) {
  const res = await fetch(`${NOTION_API}${endpoint}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Notion API ${res.status}: ${txt}`);
  }
  return res.json();
}

async function queryAllPages(databaseId) {
  const pages = [];
  let cursor = undefined;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const data = await notionFetch(`/databases/${databaseId}/query`, body);
    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return pages;
}

// === Helpers d'extraction des propriétés Notion ===
function extractProp(props, name, type) {
  const p = props[name];
  if (!p) return null;
  switch (type) {
    case 'title':
      return p.title?.map(t => t.plain_text).join('') || '';
    case 'select':
      return p.select?.name || null;
    case 'multi_select':
      return p.multi_select?.map(o => o.name) || [];
    case 'number':
      return p.number;
    case 'status':
      return p.status?.name || null;
    case 'rich_text':
      return p.rich_text?.map(t => t.plain_text).join('') || '';
    case 'date':
      return p.date?.start || null;
    case 'people':
      return p.people?.map(u => u.name) || [];
    case 'url':
      return p.url || null;
    case 'files':
      return p.files?.map(f => ({
        name: f.name,
        url: f.type === 'external' ? f.external.url : f.file.url,
      })) || [];
    case 'unique_id':
      return p.unique_id ? `${p.unique_id.prefix || ''}-${p.unique_id.number}` : null;
    case 'auto_increment_id':
      return p.unique_id?.number ?? null;
    case 'created_time':
      return p.created_time;
    case 'relation':
      return p.relation?.map(r => r.id) || [];
    case 'formula': {
      const f = p.formula;
      if (!f) return null;
      switch (f.type) {
        case 'string':  return f.string;
        case 'number':  return f.number;
        case 'boolean': return f.boolean;
        case 'date':    return f.date?.start || null;
        default:        return null;
      }
    }
    case 'rollup_number':
      return p.rollup?.number ?? 0;
    case 'rollup_array':
      return p.rollup?.array || [];
    default:
      return null;
  }
}

// Rollup show_unique sur un select → liste de noms
function rollupSelectNames(props, name) {
  const arr = extractProp(props, name, 'rollup_array');
  return arr.map(o => o?.select?.name).filter(Boolean);
}

// === Mapping Sprint Classique (inchangé) ===
function mapClassiquePage(page) {
  const p = page.properties;
  const dateCreation = extractProp(p, 'Date de création', 'created_time') || page.created_time;

  const idNum = extractProp(p, 'Identifiant', 'auto_increment_id');
  const identifiant = idNum != null ? `INA-${idNum}` : null;

  return {
    id: page.id,
    identifiant,
    titre: extractProp(p, 'TITRE', 'title') || '',
    classification: extractProp(p, 'Classification', 'select'),
    statut: extractProp(p, 'Statut', 'select'),
    priorisation: extractProp(p, 'Priorisation', 'select'),
    sprintIdeal: extractProp(p, 'Sprint idéal', 'multi_select') || [],
    fonctions: extractProp(p, 'Fonctions', 'select'),
    produits: extractProp(p, 'Produits', 'multi_select') || [],
    client: extractProp(p, 'Client ?', 'rich_text') || '',
    dateCreation,
    estimBack: extractProp(p, 'Estimation BACK', 'number') || 0,
    estimFront: extractProp(p, 'Estimation FRONT', 'number') || 0,
    estimPoTest: extractProp(p, 'Estimation PO - TEST', 'number') || 0,
    persBack: extractProp(p, 'Pers. en charge BACK', 'multi_select') || [],
    persFront: extractProp(p, 'Pers. en charge FRONT', 'multi_select') || [],
    persPoTest: extractProp(p, 'Pers. en charge PO-TEST', 'multi_select') || [],
    pointAvancement: extractProp(p, 'Point avancement', 'number') || 0,
    pointsBlocage: extractProp(p, 'Points de blocage / avancement', 'rich_text') || '',
    explication: extractProp(p, 'Explication / commentaire', 'rich_text') || '',
    communication: extractProp(p, 'Communication', 'multi_select') || [],
    initialeAjout: extractProp(p, 'Initiale / Ajout', 'multi_select') || [],
    versionInter: extractProp(p, 'Version intermédiaire', 'rich_text') || '',
    versionStable: extractProp(p, 'Version stable', 'rich_text') || '',
    dateSortieInter: extractProp(p, 'Date sortie / version intermédiaire', 'date'),
    dateSortieStable: extractProp(p, 'Date sortie / version stable', 'date'),
    pieceJointe: (extractProp(p, 'Pièce jointe', 'files') || [])[0] || null,
    url: page.url,
  };
}

// === Mapping Équipe NAXI.G ===
function mapEquipePage(page) {
  const p = page.properties;
  return {
    id: page.id,
    nom: extractProp(p, 'Nom', 'title') || '',
    metiers: extractProp(p, 'Métiers', 'multi_select') || [],
    url: page.url,
  };
}

// === Mapping Suivi lundi ===
function mapSuiviLundiPage(page, toplineMap) {
  const p = page.properties;
  const heures = extractProp(p, 'Temps semaine (h)', 'number') || 0;
  const topLineIds = extractProp(p, 'Top Line', 'relation');
  const fenetreId = topLineIds[0] || null;
  const fenetre = fenetreId ? toplineMap.get(fenetreId) : null;

  return {
    id: page.id,
    saisie: extractProp(p, 'Saisie', 'title') || '',
    semaine: extractProp(p, 'Semaine', 'date'),
    personne: extractProp(p, 'Personne', 'select'),
    phase: extractProp(p, 'Phase', 'select'),
    avancement: extractProp(p, 'Avancement', 'number') || 0,
    etat: extractProp(p, 'Etat', 'select'),
    tempsHeures: heures,
    tempsJours: heures / HOURS_PER_DAY,
    remarques: extractProp(p, 'Remarques', 'rich_text') || '',
    fenetreId,
    fenetre: fenetre?.fenetre || null,
    fenetreGroupe: fenetre?.groupe || null,
    fenetreNumGroupe: fenetre?.numGroupe || null,
    fenetreNumModule: fenetre?.numModule || null,
    url: page.url,
  };
}

// === Mapping Top Line (nouvelle structure) ===
function mapTopLinePage(page, equipeMap) {
  const p = page.properties;

  // Résout une relation Membre <PHASE> → noms via Équipe
  const memberNames = (propName) => {
    const ids = extractProp(p, propName, 'relation');
    return ids.map(id => equipeMap.get(id)?.nom).filter(Boolean);
  };

  // Convertit un rollup heures (Temps cumulé X) en jours
  const tempsJ = (propName) => {
    const h = extractProp(p, propName, 'rollup_number') || 0;
    return h / HOURS_PER_DAY;
  };

  // Rollup max sur Av X (formula percent 0-1)
  const avancement = (propName) => extractProp(p, propName, 'rollup_number') || 0;

  // Formula "Dernier état X" (string)
  const etatFormula = (propName) => extractProp(p, propName, 'formula') || null;

  return {
    id: page.id,
    idTopLine: extractProp(p, 'ID Top Line', 'auto_increment_id'),
    fenetre: extractProp(p, 'Fenêtre', 'title') || '',

    // Structure type PMS
    groupe:    extractProp(p, 'Groupe', 'select'),
    numGroupe: extractProp(p, 'N° Groupe', 'select'),
    module:    extractProp(p, 'Module', 'rich_text') || '',
    numModule: extractProp(p, 'N° Module', 'select'),
    section:   extractProp(p, 'Section', 'rich_text') || '',
    phase:     extractProp(p, 'Phase', 'select'),
    ordre:     extractProp(p, 'Ordre dans module', 'number'),

    nbreUS: extractProp(p, 'Nbre US', 'number') || 0,

    sprint: {
      maquette: extractProp(p, 'Sprint MAQUETTE', 'select'),
      back:     extractProp(p, 'Sprint BACK', 'select'),
      front:    extractProp(p, 'Sprint FRONT', 'select'),
      design:   extractProp(p, 'Sprint DESIGN', 'select'),
      test:     extractProp(p, 'Sprint TEST', 'select'),
    },

    // Membres assignés (prévu, depuis Équipe via relation)
    membres: {
      maquette: memberNames('Membre MAQUETTE'),
      back:     memberNames('Membre BACK'),
      front:    memberNames('Membre FRONT'),
      design:   memberNames('Membre DESIGN'),
      test:     memberNames('Membre TEST'),
    },

    // Avancement dérivé (rollup max sur snapshots Suivi lundi)
    avancement: {
      maquette: avancement('Dernier avancement MAQUETTE'),
      back:     avancement('Dernier avancement BACK'),
      front:    avancement('Dernier avancement FRONT'),
      design:   avancement('Dernier avancement DESIGN'),
      test:     avancement('Dernier avancement TEST'),
    },

    // État courant (formula sur Score état max)
    etat: {
      maquette: etatFormula('Dernier état MAQUETTE'),
      back:     etatFormula('Dernier état BACK'),
      front:    etatFormula('Dernier état FRONT'),
      design:   etatFormula('Dernier état DESIGN'),
      test:     etatFormula('Dernier état TEST'),
    },

    // Temps cumulé en jours (converti depuis heures côté Notion)
    temps: {
      maquette: tempsJ('Temps cumulé MAQUETTE'),
      back:     tempsJ('Temps cumulé BACK'),
      front:    tempsJ('Temps cumulé FRONT'),
      design:   tempsJ('Temps cumulé DESIGN'),
      test:     tempsJ('Temps cumulé TEST'),
    },

    // Contributeurs réels (rollup show_unique sur Personne) — qui a effectivement saisi
    contributeursReels: rollupSelectNames(p, 'Contributeurs réels'),

    lienMaquette: extractProp(p, 'Lien maquette', 'url'),
    lienJira:     extractProp(p, 'Lien EPIC JIRA', 'url'),
    remarques:    extractProp(p, 'Remarques', 'rich_text') || '',
    lastEdited:   page.last_edited_time || null,
    url:          page.url,
  };
}

// === Mapping Cartographie ===
function mapCartographiePage(page) {
  const p = page.properties;
  return {
    id: page.id,
    fenetre: extractProp(p, 'Fenêtre', 'title') || '',
    groupe: extractProp(p, 'Groupe', 'select'),
    idFenetre: extractProp(p, 'ID Fenêtre', 'rich_text') || '',
    module: extractProp(p, 'Module', 'rich_text') || '',
    numGroupe: extractProp(p, 'N° Groupe', 'select'),
    numModule: extractProp(p, 'N° Module', 'select'),
    ordre: extractProp(p, 'Ordre dans module', 'number'),
    phase: extractProp(p, 'Phase', 'select'),
    section: extractProp(p, 'Section', 'rich_text') || '',
    solution: extractProp(p, 'Solution', 'multi_select') || [],
    typeClientele: extractProp(p, 'Type de clientèle', 'multi_select') || [],
  };
}

async function fetchCartographie(label, dbId) {
  try {
    console.log(`📥 Récupération de la cartographie ${label}...`);
    const pages = await queryAllPages(dbId);
    console.log(`   → ${pages.length} fenêtres récupérées`);
    return pages.map(mapCartographiePage);
  } catch (err) {
    console.warn(`   ⚠️ Cartographie ${label} non récupérée : ${err.message}`);
    return [];
  }
}

// === Main ===
async function main() {
  const startTime = Date.now();
  console.log('🚀 Démarrage du fetch Notion...');

  console.log('📥 Récupération de la base Sprint Classique...');
  const classiquePages = await queryAllPages(DB_CLASSIQUE);
  console.log(`   → ${classiquePages.length} tickets récupérés`);
  const classique = classiquePages.map(mapClassiquePage);

  console.log('📥 Récupération de la base 👥 Équipe NAXI.G...');
  const equipePages = await queryAllPages(DB_EQUIPE);
  console.log(`   → ${equipePages.length} membres récupérés`);
  const equipe = equipePages.map(mapEquipePage);
  const equipeMap = new Map(equipe.map(m => [m.id, m]));

  console.log('📥 Récupération de la base 📋 Retro-planning Top Line...');
  const toplinePages = await queryAllPages(DB_TOPLINE);
  console.log(`   → ${toplinePages.length} fenêtres récupérées`);
  const topline = toplinePages.map(p => mapTopLinePage(p, equipeMap));
  const toplineMap = new Map(topline.map(t => [t.id, t]));

  console.log('📥 Récupération de la base 📅 Suivi lundi...');
  const suiviPages = await queryAllPages(DB_SUIVI_LUNDI);
  console.log(`   → ${suiviPages.length} saisies récupérées`);
  const suiviLundi = suiviPages.map(p => mapSuiviLundiPage(p, toplineMap));

  // Cartographies stratégiques (best-effort)
  const cartoPmsWeb    = await fetchCartographie('PMS Web',    DB_CARTO_PMS_WEB);
  const cartoPmsMobile = await fetchCartographie('PMS Mobile', DB_CARTO_PMS_MOBILE);
  const cartoManager   = await fetchCartographie('Manager',    DB_CARTO_MANAGER);

  const data = {
    generatedAt: new Date().toISOString(),
    classique,
    topline,
    suiviLundi,
    equipe,
    cartoPmsWeb,
    cartoPmsMobile,
    cartoManager,
    counts: {
      classique: classique.length,
      topline: topline.length,
      suiviLundi: suiviLundi.length,
      equipe: equipe.length,
      cartoPmsWeb: cartoPmsWeb.length,
      cartoPmsMobile: cartoPmsMobile.length,
      cartoManager: cartoManager.length,
    },
  };

  const outDir = path.dirname(OUTPUT_PATH);
  if (!existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Fichier généré : ${OUTPUT_PATH}`);
  console.log(`   ${classique.length} tickets Classique · ${topline.length} fenêtres Top Line · ${suiviLundi.length} saisies · ${equipe.length} membres`);
  console.log(`   Cartographies : ${cartoPmsWeb.length} PMS Web · ${cartoPmsMobile.length} Mobile · ${cartoManager.length} Manager`);
  console.log(`   Durée : ${duration}s`);
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
