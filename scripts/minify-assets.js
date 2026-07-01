#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { minify: minifyHTML } = require('html-minifier-terser');
const CleanCSS = require('clean-css');
const { minify: minifyJS } = require('terser');

const SITE_DIR = path.join(__dirname, '..', '_site');

const cleanCSS = new CleanCSS({
  level: 2,
  sourceMap: false,
});

const TERSER_OPTS = {
  compress: { passes: 2, drop_console: false },
  mangle: true,
  format: { comments: false },
};

const HTML_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  collapseBooleanAttributes: true,
  sortAttributes: true,
  sortClassName: true,
};

function walk(dir, ext) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      results.push(...walk(full, ext));
    } else if (full.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

async function run() {
  let cssCount = 0, jsCount = 0, htmlCount = 0;
  let cssSaved = 0, jsSaved = 0, htmlSaved = 0;

  // Minify CSS
  for (const file of walk(path.join(SITE_DIR, 'css'), '.css')) {
    const src = fs.readFileSync(file, 'utf8');
    const out = cleanCSS.minify(src);
    if (out.styles && out.styles.length < src.length) {
      cssSaved += src.length - out.styles.length;
      fs.writeFileSync(file, out.styles);
      cssCount++;
    }
  }

  // Minify JS (skip node_modules, vendor, .min.js)
  for (const file of walk(path.join(SITE_DIR, 'js'), '.js')) {
    if (file.includes('node_modules') || file.endsWith('.min.js')) continue;
    const src = fs.readFileSync(file, 'utf8');
    try {
      const out = await minifyJS(src, TERSER_OPTS);
      if (out.code && out.code.length < src.length) {
        jsSaved += src.length - out.code.length;
        fs.writeFileSync(file, out.code);
        jsCount++;
      }
    } catch (e) {
      console.warn(`  skip JS ${path.relative(SITE_DIR, file)}: ${e.message}`);
    }
  }

  // Minify HTML
  for (const file of walk(SITE_DIR, '.html')) {
    if (file.includes('/amp/')) continue;
    const src = fs.readFileSync(file, 'utf8');
    try {
      const out = await minifyHTML(src, HTML_OPTS);
      if (out.length < src.length) {
        htmlSaved += src.length - out.length;
        fs.writeFileSync(file, out);
        htmlCount++;
      }
    } catch (e) {
      console.warn(`  skip HTML ${path.relative(SITE_DIR, file)}: ${e.message}`);
    }
  }

  const totalKB = ((cssSaved + jsSaved + htmlSaved) / 1024).toFixed(1);
  console.log(`Minified ${cssCount} CSS (-${(cssSaved/1024).toFixed(1)}KB), ${jsCount} JS (-${(jsSaved/1024).toFixed(1)}KB), ${htmlCount} HTML (-${(htmlSaved/1024).toFixed(1)}KB) = ${totalKB}KB saved`);
}

run().catch(e => { console.error(e); process.exit(1); });
