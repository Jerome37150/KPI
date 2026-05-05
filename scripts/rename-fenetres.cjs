/**
 * Renomme en masse les fenêtres de la cartographie PMS Web (Notion).
 * Lit scripts/rename-mapping.json et applique chaque {id, newName}.
 *
 * Usage : NOTION_TOKEN=ntn_xxx node scripts/rename-fenetres.cjs
 *
 * - Délai 350ms entre requêtes pour respecter la limite Notion (~3 req/s)
 * - En cas d'erreur, on log et on continue (best-effort)
 * - Idempotent : ré-écrire le même titre n'a pas d'effet secondaire
 */

const fs = require('node:fs');
const path = require('node:path');

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2022-06-28';
const NOTION_API = 'https://api.notion.com/v1';
const MAPPING_FILE = path.join(__dirname, 'rename-mapping.json');
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

async function updateTitle(pageId, newTitle) {
  const url = `${NOTION_API}/pages/${pageId}`;
  const body = {
    properties: {
      'Fenêtre': {
        title: [
          { type: 'text', text: { content: newTitle } },
        ],
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
  console.log(`🚀 Renommage de ${mapping.length} fenêtres PMS Web...`);

  let ok = 0;
  let ko = 0;
  const errors = [];

  for (let i = 0; i < mapping.length; i++) {
    const { id, newName, oldName } = mapping[i];
    try {
      await updateTitle(id, newName);
      ok++;
      if ((i + 1) % 25 === 0 || i === mapping.length - 1) {
        const pct = Math.round((i + 1) / mapping.length * 100);
        console.log(`  ${i + 1}/${mapping.length} (${pct}%) — ok ${ok} · ko ${ko}`);
      }
    } catch (err) {
      ko++;
      errors.push({ id, oldName, newName, error: err.message });
      console.warn(`  ⚠️ ${oldName} → ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Terminé en ${duration}s — ${ok} succès · ${ko} échecs`);

  if (errors.length) {
    console.log('\n=== ERREURS ===');
    errors.slice(0, 10).forEach(e => console.log(`  ${e.id} | ${e.oldName} → ${e.error}`));
    if (errors.length > 10) console.log(`  ... et ${errors.length - 10} autres`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
