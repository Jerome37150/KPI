/**
 * Met à jour la colonne "Solution" (multi-select) des fenêtres PMS Web.
 * Lit scripts/solution-mapping.json et applique chaque {id, newSolution}.
 *
 * Règle métier (validée par PO) :
 * - C tout Vert (CRS) : M10 (Tarifs & revenue management),
 *                       M32 + M33 + M34 (BI / reporting / multi-sites),
 *                       M38 (Espace client), M39 (Espace résident),
 *                       M42 (CRM & relation client).
 * - Inaxel (PMS) : tout le reste.
 *
 * La valeur écrite est exclusive (1 seule solution par fenêtre).
 *
 * Usage : NOTION_TOKEN=ntn_xxx node scripts/set-solutions.cjs
 */

const fs = require('node:fs');
const path = require('node:path');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2022-06-28';
const NOTION_API = 'https://api.notion.com/v1';
const MAPPING_FILE = path.join(__dirname, 'solution-mapping.json');
const DELAY_MS = 350;

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_TOKEN manquant.');
  process.exit(1);
}
if (!fs.existsSync(MAPPING_FILE)) {
  console.error(`❌ Fichier mapping introuvable : ${MAPPING_FILE}`);
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

async function updateSolution(pageId, newValue) {
  const url = `${NOTION_API}/pages/${pageId}`;
  const body = {
    properties: {
      'Solution': {
        multi_select: [{ name: newValue }],
      },
    },
  };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt.slice(0, 200)}`);
  }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const start = Date.now();
  console.log(`🚀 Mise à jour Solution sur ${mapping.length} fenêtres PMS Web...`);
  const ctv = mapping.filter(m => m.newSolution === 'C tout Vert (CRS)').length;
  const inaxel = mapping.length - ctv;
  console.log(`   ${ctv} CTV · ${inaxel} Inaxel (PMS)`);

  let ok = 0, ko = 0;
  const errors = [];

  for (let i = 0; i < mapping.length; i++) {
    const { id, newSolution, fenetre } = mapping[i];
    try {
      await updateSolution(id, newSolution);
      ok++;
      if ((i + 1) % 25 === 0 || i === mapping.length - 1) {
        const pct = Math.round((i + 1) / mapping.length * 100);
        console.log(`  ${i + 1}/${mapping.length} (${pct}%) — ok ${ok} · ko ${ko}`);
      }
    } catch (err) {
      ko++;
      errors.push({ id, fenetre, error: err.message });
      console.warn(`  ⚠️ ${fenetre} → ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Terminé en ${duration}s — ${ok} succès · ${ko} échecs`);

  if (errors.length) {
    console.log('\n=== ERREURS ===');
    errors.slice(0, 10).forEach(e => console.log(`  ${e.id} | ${e.fenetre} → ${e.error}`));
    if (errors.length > 10) console.log(`  ... et ${errors.length - 10} autres`);
    // Pages archivées = pas un vrai échec — on sort 0 si tous les échecs sont "archived"
    const onlyArchived = errors.every(e => e.error.includes('archived'));
    if (!onlyArchived) process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
