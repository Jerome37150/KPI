/**
 * Script de récupération des données depuis Notion
 * Génère un fichier public/data.json consommé par le dashboard
 *
 * Usage : NOTION_TOKEN=ntn_xxx node scripts/fetch-notion.js
 *
 * Configuré pour les 2 bases Notion :
 *  - Sprint Classique NAXI.G : 3058db15-623a-80d3-9deb-fb95191faa96
 *  - Sprint Top Line NAXI.G  : 3108db15-623a-8035-a2d5-c3f2e6a97361
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

const DB_CLASSIQUE = '3058db15-623a-80d3-9deb-fb95191faa96';
const DB_TOPLINE = '3108db15-623a-8035-a2d5-c3f2e6a97361';

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
      // Notion auto_increment_id : la valeur est dans p.unique_id.number
      return p.unique_id?.number ?? null;
    case 'created_time':
      return p.created_time;
    default:
      return null;
  }
}

// === Mapping Sprint Classique ===
function mapClassiquePage(page) {
  const p = page.properties;
  const dateCreation = extractProp(p, 'Date de création', 'created_time') || page.created_time;

  // Identifiant : auto_increment_id Notion (entier). Format dashboard : "INA-123"
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

// === Mapping Sprint Top Line ===
function mapTopLinePage(page) {
  const p = page.properties;
  return {
    id: extractProp(p, 'ID Top Line', 'unique_id') || page.id,
    nom: extractProp(p, 'Nom de la fonction', 'title'),
    bloc: extractProp(p, 'Bloc', 'select'),
    equipe: extractProp(p, 'Equipe', 'select'),
    nbreUS: extractProp(p, 'Nbre US', 'number') || 0,
    sprint: {
      maquette: extractProp(p, 'Sprint MAQUETTE', 'select'),
      back: extractProp(p, 'Sprint BACK', 'select'),
      front: extractProp(p, 'Sprint FRONT', 'select'),
      design: extractProp(p, 'Sprint DESIGN', 'select'),
      test: extractProp(p, 'Sprint TEST', 'select'),
    },
    avancement: {
      maquette: extractProp(p, 'Avancement Maquettage', 'number') || 0,
      back: extractProp(p, 'Avancement Back', 'number') || 0,
      front: extractProp(p, 'Avancement Front', 'number') || 0,
      design: extractProp(p, 'Avancement Design', 'number') || 0,
      test: extractProp(p, 'Avancement TEST', 'number') || 0,
    },
    etat: {
      maquette: extractProp(p, 'Etat MAQUETTE', 'select'),
      back: extractProp(p, 'Etat BACK', 'select'),
      front: extractProp(p, 'Etat FRONT', 'select'),
      design: extractProp(p, 'Etat DESIGN', 'select'),
      test: extractProp(p, 'Etat TEST', 'select'),
    },
    pers: {
      maquette: extractProp(p, 'Pers. MAQUETTES / UX', 'multi_select') || [],
      back: extractProp(p, 'Pers. BACK', 'select'),
      front: extractProp(p, 'Pers. FRONT', 'select'),
      design: extractProp(p, 'Pers. DESIGN', 'select'),
      test: extractProp(p, 'Pers. TEST', 'multi_select') || [],
    },
    temps: {
      maquette: extractProp(p, 'Temps MAQUETTE / UX', 'number') || 0,
      back: extractProp(p, 'Temps BACK', 'number') || 0,
      front: extractProp(p, 'Temps FRONT', 'number') || 0,
      design: extractProp(p, 'Temps DESIGN', 'number') || 0,
      test: extractProp(p, 'Temps TEST', 'number') || 0,
    },
    lienMaquette: extractProp(p, 'Lien maquette', 'url'),
    lienJira: extractProp(p, 'Lien EPIC JIRA', 'url'),
    remarques: extractProp(p, 'Remarques', 'rich_text') || '',
    url: page.url,
  };
}

// === Main ===
async function main() {
  const startTime = Date.now();
  console.log('🚀 Démarrage du fetch Notion...');

  console.log('📥 Récupération de la base Sprint Classique...');
  const classiquePages = await queryAllPages(DB_CLASSIQUE);
  console.log(`   → ${classiquePages.length} tickets récupérés`);

  console.log('📥 Récupération de la base Sprint Top Line...');
  const toplinePages = await queryAllPages(DB_TOPLINE);
  console.log(`   → ${toplinePages.length} fenêtres récupérées`);

  const classique = classiquePages.map(mapClassiquePage);
  const topline = toplinePages.map(mapTopLinePage);

  const data = {
    generatedAt: new Date().toISOString(),
    classique,
    topline,
    counts: {
      classique: classique.length,
      topline: topline.length,
    },
  };

  // Crée le dossier public/ si besoin
  const outDir = path.dirname(OUTPUT_PATH);
  if (!existsSync(outDir)) {
    await mkdir(outDir, { recursive: true });
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`✅ Fichier généré : ${OUTPUT_PATH}`);
  console.log(`   ${classique.length} tickets Classique + ${topline.length} fenêtres Top Line`);
  console.log(`   Durée : ${duration}s`);
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
