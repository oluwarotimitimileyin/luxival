#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const I18N_FILE = path.join(__dirname, '..', 'js', 'i18n.js');
const OUT_DIR = path.join(__dirname, '..', 'i18n');

const src = fs.readFileSync(I18N_FILE, 'utf8');

const LANGS = ['fi','sv','de','fr','it','ru','no','da','ja','zh'];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const lang of LANGS) {
  const re = new RegExp(`    ${lang}: \\{([\\s\\S]*?)\\n    \\}`, 'm');
  const match = src.match(re);
  if (!match) { console.warn(`No block for ${lang}`); continue; }

  const body = match[1];
  const obj = {};
  const lineRe = /^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/gm;
  let m;
  while ((m = lineRe.exec(body)) !== null) {
    obj[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\'/g, "'");
  }

  fs.writeFileSync(path.join(OUT_DIR, `${lang}.json`), JSON.stringify(obj));
  console.log(`  ${lang}.json — ${Object.keys(obj).length} keys`);
}

console.log('Done. JSON files in /i18n/');
