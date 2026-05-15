/**
 * Extraction du temps passé par personne / fenêtre / phase / semaine
 * pour un dossier Crédit d'Impôt Innovation (CII).
 *
 * Source : `public/data.json` → `suiviLundi[]`
 *   Chaque saisie (📅 Suivi lundi) est l'historique canonique :
 *     { personne, fenetreId, fenetre, fenetreGroupe, semaine (lundi),
 *       phase, tempsHeures, tempsJours, avancement, etat, remarques }
 *
 * Une ligne CII = une saisie. Pas de diff de commits, pas d'heuristique.
 *
 * Usage : npm run export-cii
 * Sortie : exports/cii-YYYY-MM-DD.csv (séparateur ;, BOM utf-8, virgule décimale FR)
 *          public/cii-data.json (consommé par la page Immobilisation)
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(REPO_ROOT, 'public', 'data.json');
const OUTPUT_DIR = path.join(REPO_ROOT, 'exports');
const PUBLIC_JSON = path.join(REPO_ROOT, 'public', 'cii-data.json');

const PHASE_LABELS = {
  MAQUETTE: 'Maquette / UX',
  BACK:     'Back',
  FRONT:    'Front',
  DESIGN:   'Design',
  TEST:     'Test',
};

// === Semaine ISO à partir d'une date lundi ===
function isoWeekParts(dateLundiISO) {
  if (!dateLundiISO) return null;
  const d = new Date(dateLundiISO);
  if (isNaN(d.getTime())) return null;
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7; // 0 = lundi
  const monday = new Date(tmp);
  monday.setUTCDate(tmp.getUTCDate() - dayNum);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  const thursday = new Date(tmp);
  thursday.setUTCDate(tmp.getUTCDate() - dayNum + 3);
  const isoYear = thursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const weekNum = 1 + Math.round((thursday - firstThursday) / (7 * 86400000));
  return {
    year: isoYear,
    week: weekNum,
    label: `${isoYear}-W${String(weekNum).padStart(2, '0')}`,
    mondayISO: monday.toISOString().slice(0, 10),
    sundayISO: sunday.toISOString().slice(0, 10),
  };
}

// === CSV ===
function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",;\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function fmtJoursFR(n) {
  if (!Number.isFinite(n)) return '0';
  return Number(n.toFixed(3)).toString().replace('.', ',');
}

// === Main ===
async function main() {
  console.log(`📥 Lecture de ${DATA_PATH}…`);
  let data;
  try {
    data = JSON.parse(await readFile(DATA_PATH, 'utf8'));
  } catch (err) {
    console.error(`❌ Impossible de lire ${DATA_PATH} : ${err.message}`);
    console.error('   Lance d\'abord `node scripts/fetch-notion.js` pour générer ce fichier.');
    process.exit(1);
  }

  const saisies = Array.isArray(data.suiviLundi) ? data.suiviLundi : [];
  if (saisies.length === 0) {
    console.warn('⚠️ Aucune saisie dans data.suiviLundi — fichier vide ou data.json obsolète.');
  }
  console.log(`   → ${saisies.length} saisies trouvées`);

  const rows = [];
  const warnings = [];

  for (const s of saisies) {
    const wk = isoWeekParts(s.semaine);
    if (!wk) {
      warnings.push(`Saisie ${s.id || '(sans id)'} : date 'semaine' invalide → ignorée`);
      continue;
    }
    if (!s.personne) {
      warnings.push(`${wk.label} · ${s.fenetre || '(sans fenêtre)'} : pas de personne → ignorée`);
      continue;
    }
    if (!s.phase) {
      warnings.push(`${wk.label} · ${s.personne} · ${s.fenetre || '(sans fenêtre)'} : pas de phase → ignorée`);
      continue;
    }
    const jours = Number(s.tempsJours) || 0;
    if (jours <= 0) continue; // pas de temps → pas de ligne CII

    rows.push({
      year: wk.year,
      weekNum: wk.week,
      week: wk.label,
      start: wk.mondayISO,
      end: wk.sundayISO,
      person: s.personne,
      fenetre: s.fenetre || '',
      groupe: s.fenetreGroupe || '',
      phase: PHASE_LABELS[s.phase] || s.phase,
      jours,
      avancement: s.avancement || 0,
      etat: s.etat || '',
      remarques: s.remarques || '',
    });
  }

  // Tri : semaine ASC, personne ASC, fenêtre ASC, phase ASC
  rows.sort((a, b) => {
    if (a.week !== b.week) return a.week.localeCompare(b.week);
    if (a.person !== b.person) return a.person.localeCompare(b.person, 'fr');
    if (a.fenetre !== b.fenetre) return a.fenetre.localeCompare(b.fenetre, 'fr');
    return a.phase.localeCompare(b.phase, 'fr');
  });

  // === Construction CSV ===
  const headers = [
    'Semaine ISO',
    'Date début (lundi)',
    'Date fin (dimanche)',
    'Personne',
    'Fenêtre',
    'Groupe',
    'Phase',
    'Jours',
    'Avancement',
    'État',
  ];
  const lines = [headers.map(csvEscape).join(';')];
  for (const r of rows) {
    lines.push([
      r.week,
      r.start,
      r.end,
      r.person,
      r.fenetre,
      r.groupe,
      r.phase,
      fmtJoursFR(r.jours),
      r.avancement ? `${Math.round(r.avancement * 100)}%` : '',
      r.etat,
    ].map(csvEscape).join(';'));
  }
  const csv = '﻿' + lines.join('\r\n');

  // Output
  if (!existsSync(OUTPUT_DIR)) {
    await mkdir(OUTPUT_DIR, { recursive: true });
  }
  const ts = new Date().toISOString().slice(0, 10);
  const outPath = path.join(OUTPUT_DIR, `cii-${ts}.csv`);
  await writeFile(outPath, csv, 'utf8');

  // JSON consommé par la page Immobilisation du dashboard
  const cleanRows = rows.map(r => ({
    week:    r.week,
    start:   r.start,
    end:     r.end,
    person:  r.person,
    fenetre: r.fenetre,
    groupe:  r.groupe,
    phase:   r.phase,
    jours:   Number(r.jours.toFixed(3)),
  }));
  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    source: 'suiviLundi',
    rows: cleanRows,
  };
  await writeFile(PUBLIC_JSON, JSON.stringify(jsonPayload, null, 2), 'utf8');

  // === Récap console ===
  const totalJours = rows.reduce((s, r) => s + r.jours, 0);
  const persons = new Set(rows.map(r => r.person));
  const fenetres = new Set(rows.map(r => r.fenetre));
  const weeks = new Set(rows.map(r => r.week));

  console.log('');
  console.log(`✅ CSV CII   : ${outPath}`);
  console.log(`✅ JSON dash : ${PUBLIC_JSON}`);
  console.log(`   ${rows.length} ligne(s) générée(s)`);
  console.log(`   ${persons.size} personne(s) · ${fenetres.size} fenêtre(s) · ${weeks.size} semaine(s)`);
  console.log(`   Total : ${fmtJoursFR(totalJours).replace(',', '.')} jours`);

  if (warnings.length > 0) {
    console.log('');
    console.log(`⚠️ ${warnings.length} saisie(s) ignorée(s) :`);
    warnings.slice(0, 10).forEach(w => console.log('   · ' + w));
    if (warnings.length > 10) console.log(`   … et ${warnings.length - 10} autre(s)`);
  }
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
