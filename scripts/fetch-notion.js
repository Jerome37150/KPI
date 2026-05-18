/**
 * Script de récupération des données depuis Notion
 * Génère un fichier public/data.json consommé par le dashboard
 *
 * Usage : NOTION_TOKEN=ntn_xxx node scripts/fetch-notion.js
 *
 * Bases Notion :
 *  - Sprint Classique NAXI.G        : 3058db15-623a-80d3-9deb-fb95191faa96
 *  - 📋 Retro-planning Top Line     : 3108db15-623a-80ed-bf9a-000b2e7d0ead
 *  - 📅 Suivi Hebdo (saisies hebdo) : ce0ddde9-3441-44a7-9cb6-97ac7833266c
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
const DB_TOPLINE     = '3108db15-623a-8035-a2d5-c3f2e6a97361';
const DB_SUIVI_LUNDI = '2b9336d7-42d2-4678-a04d-99f57e481552';
const DB_EQUIPE      = '032f893d-d6ec-4f85-8e55-53a88236c0a0';

const DB_CARTO_PMS_WEB    = 'e712a61e-0880-4bb9-b198-3d1d0bcaedc1';
const DB_CARTO_PMS_MOBILE = 'd16c64be-2dc6-4f91-8724-5f1068004cc6';
const DB_CARTO_MANAGER    = 'd92b19c5-f3e3-42a5-bcfa-673f3d1d11f6';

const DB_PROCEDURES = '9e35709403f44c07bb4092121e87415e';

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

// Rollup sur une relation → liste de noms (résolus via equipeMap)
// Gère aussi le cas legacy où le rollup pointait encore sur l'ancien select Personne
function rollupRelationNames(props, name, equipeMap) {
  const arr = extractProp(props, name, 'rollup_array');
  const names = [];
  for (const o of arr) {
    // Nouvelle forme : rollup d'une relation → objet { type: 'relation', relation: [{id}] }
    if (o?.type === 'relation' && Array.isArray(o.relation)) {
      for (const r of o.relation) {
        const eq = equipeMap?.get(r.id);
        if (eq?.nom) names.push(eq.nom);
      }
    }
    // Forme legacy : rollup d'un select → objet { select: { name } }
    else if (o?.select?.name) {
      names.push(o.select.name);
    }
    // Forme "show_original" sur relation → objet page direct { id, properties }
    else if (o?.id) {
      const eq = equipeMap?.get(o.id);
      if (eq?.nom) names.push(eq.nom);
    }
  }
  return [...new Set(names)]; // dédoublonnage
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
  // Métiers peut être passé en select simple côté Notion (utilisateur) : on tolère les deux formes.
  const metiersMulti = extractProp(p, 'Métiers', 'multi_select');
  const metiersSelect = extractProp(p, 'Métiers', 'select');
  return {
    id: page.id,
    nom: extractProp(p, 'Nom', 'title') || '',
    metiers: metiersMulti?.length ? metiersMulti : (metiersSelect ? [metiersSelect] : []),
    // Multi_select éditable manuellement : projets sur lesquels le membre intervient
    projets: extractProp(p, '🏗️ PROJETS', 'multi_select') || [],
    url: page.url,
  };
}

// === Mapping Suivi Hebdo ===
function mapSuiviLundiPage(page, toplineMap, equipeMap) {
  const p = page.properties;
  const heures = extractProp(p, 'Temps semaine (h)', 'number') || 0;
  const topLineIds = extractProp(p, 'Top Line', 'relation');
  const fenetreId = topLineIds[0] || null;
  const fenetre = fenetreId ? toplineMap.get(fenetreId) : null;

  // Personne : tolère 3 états de migration
  //  - avant renommage : relation "👥 Équipe NAXI.G" + select "Personne"
  //  - pendant         : relation "Personne" + select "Personne (legacy)"
  //  - après nettoyage : relation "Personne" seule
  const persRelIds =
    extractProp(p, 'Personne', 'relation') ||
    extractProp(p, '👥 Équipe NAXI.G', 'relation') ||
    [];
  const personneFromRel = persRelIds[0] ? (equipeMap?.get(persRelIds[0])?.nom || null) : null;
  const personneFromSelect =
    extractProp(p, 'Personne (legacy)', 'select') ||
    extractProp(p, 'Personne', 'select');

  // Projet : rollup show_original via Top Line → select sur Retro-planning
  // Une saisie est liée à 1 fenêtre, donc 1 projet — on prend le premier non-null
  const projet = rollupSelectNames(p, '🏗️ PROJETS')[0] || null;

  return {
    id: page.id,
    saisie: extractProp(p, 'Saisie', 'title') || '',
    semaine: extractProp(p, 'Semaine', 'date'),
    personne: personneFromRel || personneFromSelect,
    phase: extractProp(p, 'Phase', 'select'),
    avancement: extractProp(p, 'Avancement', 'number') || 0,
    etat: extractProp(p, 'Etat', 'select'),
    tempsHeures: heures,
    tempsJours: heures / HOURS_PER_DAY,
    actions: extractProp(p, 'Actions', 'rich_text') || '',
    remarques: extractProp(p, 'Remarques', 'rich_text') || '',
    fenetreId,
    fenetre: fenetre?.fenetre || null,
    fenetreGroupe: fenetre?.groupe || null,
    fenetreNumGroupe: fenetre?.numGroupe || null,
    fenetreNumModule: fenetre?.numModule || null,
    projet,
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
    projet: extractProp(p, '🏗️ PROJETS', 'select'),

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

    // Avancement dérivé (rollup max sur snapshots Suivi Hebdo)
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

    // Contributeurs réels — qui a effectivement saisi
    // Tolère 2 formes : rollup sur relation Équipe (nouvelle) ou sur select Personne (legacy)
    contributeursReels: rollupRelationNames(p, 'Contributeurs réels', equipeMap),

    lienMaquette: extractProp(p, 'Lien maquette', 'url'),
    lienJira:     extractProp(p, 'Lien EPIC JIRA', 'url'),
    remarques:    extractProp(p, 'Remarques', 'rich_text') || '',
    lastEdited:   page.last_edited_time || null,
    url:          page.url,
  };
}

// === Mapping Procédures ===
// Convertit le contenu d'une page Notion en Markdown via l'API blocks/children.
// Couvre les blocks utilisés dans les procédures : headings, paragraphe, listes,
// quote, divider, code, callout, table. Ignore le reste silencieusement.
async function fetchBlockChildren(blockId) {
  const out = [];
  let cursor = undefined;
  do {
    const url = `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`;
    const data = await notionFetch(url);
    out.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return out;
}

function richTextToMd(arr) {
  if (!Array.isArray(arr)) return '';
  return arr.map(t => {
    let s = t.plain_text || '';
    const a = t.annotations || {};
    if (a.code)          s = '`' + s + '`';
    if (a.bold)          s = `**${s}**`;
    if (a.italic)        s = `*${s}*`;
    if (a.strikethrough) s = `~~${s}~~`;
    if (t.href)          s = `[${s}](${t.href})`;
    return s;
  }).join('');
}

async function blockToMarkdown(b) {
  const rt = (k) => richTextToMd(b[k]?.rich_text);
  switch (b.type) {
    case 'heading_1':           return '## ' + rt('heading_1');   // h1 réservé au titre page
    case 'heading_2':           return '### ' + rt('heading_2');
    case 'heading_3':           return '#### ' + rt('heading_3');
    case 'paragraph':           return rt('paragraph');
    case 'bulleted_list_item':  return '- ' + rt('bulleted_list_item');
    case 'numbered_list_item':  return '1. ' + rt('numbered_list_item');
    case 'quote':               return '> ' + rt('quote');
    case 'callout':             return '> 💡 ' + rt('callout');
    case 'divider':             return '---';
    case 'code': {
      const lang = b.code?.language || '';
      return '```' + lang + '\n' + rt('code') + '\n```';
    }
    case 'table': {
      const rows = await fetchBlockChildren(b.id);
      if (rows.length === 0) return '';
      const md = rows.map(r =>
        '| ' + (r.table_row?.cells || []).map(richTextToMd).join(' | ') + ' |'
      );
      if (b.table?.has_column_header && md.length > 0) {
        const cols = rows[0].table_row?.cells.length || 1;
        md.splice(1, 0, '|' + ' --- |'.repeat(cols));
      }
      return md.join('\n');
    }
    default:
      return '';
  }
}

async function blocksToMarkdown(blocks) {
  const parts = [];
  for (const b of blocks) {
    const md = await blockToMarkdown(b);
    if (md) parts.push(md);
  }
  return parts.join('\n\n');
}

// Kebab-case sans diacritiques pour générer des slugs URL-safe à partir du titre
function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function mapProcedurePage(page) {
  const p = page.properties;
  const titre = extractProp(p, 'Titre', 'title') || '';
  const blocks = await fetchBlockChildren(page.id);
  const contenu = await blocksToMarkdown(blocks);
  return {
    id: page.id,
    slug:      slugify(titre),
    titre,
    categorie: extractProp(p, 'Catégorie', 'select'),
    ordre:     extractProp(p, 'Ordre', 'number') || 0,
    resume:    extractProp(p, 'Résumé', 'rich_text') || '',
    contenu,
    lastEdited: page.last_edited_time || null,
    url:       page.url,
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

  // Équipe : best-effort (si l'intégration n'a pas accès, les membres seront vides)
  let equipe = [];
  let equipeMap = new Map();
  try {
    console.log('📥 Récupération de la base 👥 Équipe NAXI.G...');
    const equipePages = await queryAllPages(DB_EQUIPE);
    console.log(`   → ${equipePages.length} membres récupérés`);
    equipe = equipePages.map(mapEquipePage);
    equipeMap = new Map(equipe.map(m => [m.id, m]));
  } catch (err) {
    console.warn(`   ⚠️ Équipe non récupérée (membres prévus = vides) : ${err.message.split('\n')[0]}`);
  }

  console.log('📥 Récupération de la base 📋 Retro-planning Top Line...');
  const toplinePages = await queryAllPages(DB_TOPLINE);
  console.log(`   → ${toplinePages.length} fenêtres récupérées`);
  const topline = toplinePages.map(p => mapTopLinePage(p, equipeMap));
  const toplineMap = new Map(topline.map(t => [t.id, t]));

  // Suivi Hebdo : best-effort (si l'intégration n'a pas accès, l'historique sera vide)
  let suiviLundi = [];
  try {
    console.log('📥 Récupération de la base 📅 Suivi Hebdo...');
    const suiviPages = await queryAllPages(DB_SUIVI_LUNDI);
    console.log(`   → ${suiviPages.length} saisies récupérées`);
    suiviLundi = suiviPages.map(p => mapSuiviLundiPage(p, toplineMap, equipeMap));
  } catch (err) {
    console.warn(`   ⚠️ Suivi Hebdo non récupéré (CII vide) : ${err.message.split('\n')[0]}`);
  }

  // Cartographies stratégiques (best-effort)
  const cartoPmsWeb    = await fetchCartographie('PMS Web',    DB_CARTO_PMS_WEB);
  const cartoPmsMobile = await fetchCartographie('PMS Mobile', DB_CARTO_PMS_MOBILE);
  const cartoManager   = await fetchCartographie('Manager',    DB_CARTO_MANAGER);

  // Procédures : best-effort (si l'intégration n'a pas accès, liste vide)
  let procedures = [];
  try {
    console.log('📥 Récupération de la base 📋 Procédures...');
    const procPages = await queryAllPages(DB_PROCEDURES);
    console.log(`   → ${procPages.length} procédures récupérées`);
    procedures = await Promise.all(procPages.map(mapProcedurePage));
    procedures.sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
  } catch (err) {
    console.warn(`   ⚠️ Procédures non récupérées : ${err.message.split('\n')[0]}`);
  }

  const data = {
    generatedAt: new Date().toISOString(),
    classique,
    topline,
    suiviLundi,
    equipe,
    cartoPmsWeb,
    cartoPmsMobile,
    cartoManager,
    procedures,
    counts: {
      classique: classique.length,
      topline: topline.length,
      suiviLundi: suiviLundi.length,
      equipe: equipe.length,
      procedures: procedures.length,
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
  console.log(`   Procédures : ${procedures.length}`);
  console.log(`   Durée : ${duration}s`);
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
