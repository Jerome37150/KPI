/**
 * Extraction du temps passé par personne / fenêtre / semaine
 * pour un dossier Crédit d'Impôt Innovation (CII).
 *
 * Méthode :
 *  - Walk de tous les commits qui ont touché public/data.json
 *  - Pour chaque transition commit(n-1) → commit(n), diff sur topline[].temps.{phase}
 *  - Tout delta strictement positif est attribué à la (les) personne(s) listée(s)
 *    dans pers.{phase} au commit le plus récent, en split équitable (option A).
 *  - Les deltas négatifs (corrections rétroactives) sont ignorés.
 *  - La date du commit donne la semaine ISO de la contribution.
 *
 * Usage : npm run export-cii
 * Sortie : exports/cii-YYYY-MM-DD.csv (séparateur ;, BOM utf-8, virgule décimale FR)
 */

import { execSync } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.join(__dirname, '..');
const DATA_FILE = 'public/data.json';
const OUTPUT_DIR = path.join(REPO_ROOT, 'exports');
const PUBLIC_DIR = path.join(REPO_ROOT, 'public');
const PUBLIC_JSON = path.join(PUBLIC_DIR, 'cii-data.json');

const PHASES = ['maquette', 'back', 'front', 'design', 'test'];
const PHASE_LABELS = {
  maquette: 'Maquette / UX',
  back:     'Back',
  front:    'Front',
  design:   'Design',
  test:     'Test',
};

// === Helpers Git ===
function git(args) {
  return execSync(`git ${args}`, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 200 * 1024 * 1024,
  });
}

function getCommitsTouchingData() {
  // Format : <sha>|<iso-date>|<sujet>
  const out = git(`log --reverse --pretty=format:"%H|%cI|%s" -- ${DATA_FILE}`);
  return out
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [sha, date, ...rest] = line.split('|');
      return { sha, date, subject: rest.join('|') };
    });
}

function readDataAtCommit(sha) {
  try {
    const json = git(`show ${sha}:${DATA_FILE}`);
    return JSON.parse(json);
  } catch (err) {
    console.warn(`⚠️ Lecture impossible du commit ${sha.slice(0, 7)} : ${err.message.split('\n')[0]}`);
    return null;
  }
}

// === Helpers data ===
function buildToplineMap(data) {
  const map = new Map();
  if (!data?.topline) return map;
  for (const item of data.topline) {
    if (item?.id) map.set(item.id, item);
  }
  return map;
}

function normalizePers(persValue) {
  if (Array.isArray(persValue)) return persValue.map(s => String(s).trim()).filter(Boolean);
  if (typeof persValue === 'string' && persValue.trim()) return [persValue.trim()];
  return [];
}

// === Helpers semaine ISO ===
function isoWeekParts(isoDateString) {
  // Renvoie { year, week, mondayISO, sundayISO }
  const d = new Date(isoDateString);
  // Calcul ISO 8601 : la semaine contient le jeudi
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (tmp.getUTCDay() + 6) % 7; // 0 = lundi
  // Lundi de la semaine du commit
  const monday = new Date(tmp);
  monday.setUTCDate(tmp.getUTCDate() - dayNum);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  // Numéro de semaine : on déplace au jeudi
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
  console.log(`📥 Lecture des commits qui ont modifié ${DATA_FILE}…`);
  const commits = getCommitsTouchingData();
  if (commits.length === 0) {
    console.error(`❌ Aucun commit n'a modifié ${DATA_FILE}.`);
    process.exit(1);
  }
  console.log(`   → ${commits.length} commits trouvés`);
  console.log(`   → 1er : ${commits[0].sha.slice(0, 7)} (${commits[0].date.slice(0, 10)})`);
  console.log(`   → Dernier : ${commits[commits.length - 1].sha.slice(0, 7)} (${commits[commits.length - 1].date.slice(0, 10)})`);

  const rows = [];
  const warnings = [];
  let prevMap = new Map(); // vide pour le 1er commit → tout est traité comme un delta initial

  let firstCommit = true;
  for (const commit of commits) {
    const data = readDataAtCommit(commit.sha);
    if (!data) continue;

    const currentMap = buildToplineMap(data);
    const wk = isoWeekParts(commit.date);

    for (const [id, item] of currentMap.entries()) {
      const prev = prevMap.get(id);

      for (const phase of PHASES) {
        const currTime = item.temps?.[phase] || 0;
        const prevTime = prev?.temps?.[phase] || 0;
        const delta = currTime - prevTime;
        if (delta <= 0) continue; // option 4 : on ignore les <= 0

        const persons = normalizePers(item.pers?.[phase]);
        if (persons.length === 0) {
          warnings.push(`${wk.label} · ${item.nom || '(?)'} · ${PHASE_LABELS[phase]} : +${delta}j sans personne assignée`);
          continue;
        }

        const splitJours = delta / persons.length;
        for (const person of persons) {
          rows.push({
            year: wk.year,
            weekNum: wk.weekNum,
            week: wk.label,
            start: wk.mondayISO,
            end: wk.sundayISO,
            person,
            fenetre: item.nom || '',
            bloc: item.bloc || '',
            phase: PHASE_LABELS[phase],
            jours: splitJours,
            remarques: item.remarques || '',
            commit: commit.sha.slice(0, 7),
            firstCommit, // marqueur : delta initial vs delta hebdo
          });
        }
      }
    }

    prevMap = currentMap;
    firstCommit = false;
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
    'Bloc',
    'Phase',
    'Jours',
  ];
  const lines = [headers.map(csvEscape).join(';')];

  for (const r of rows) {
    lines.push([
      r.week,
      r.start,
      r.end,
      r.person,
      r.fenetre,
      r.bloc,
      r.phase,
      fmtJoursFR(r.jours),
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
    bloc:    r.bloc,
    phase:   r.phase,
    jours:   Number(r.jours.toFixed(3)),
  }));
  const jsonPayload = {
    generatedAt: new Date().toISOString(),
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
    console.log(`⚠️ ${warnings.length} contribution(s) sans personne assignée (ignorée(s)) :`);
    warnings.slice(0, 10).forEach(w => console.log('   · ' + w));
    if (warnings.length > 10) console.log(`   … et ${warnings.length - 10} autre(s)`);
  }
}

main().catch(err => {
  console.error('❌ Erreur fatale :', err.message);
  process.exit(1);
});
