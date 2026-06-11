#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();
const OUTPUT_PATH = path.join(ROOT_DIR, 'assets', 'data', 'site-search-index.json');
const ELEVENTY_IGNORE_PATH = path.join(ROOT_DIR, '.eleventyignore');
const EXCLUDED_DIRS = new Set([
  '.git',
  '.github',
  '.vscode',
  '.idea',
  '_site',
  'node_modules',
  'test-results',
  'coverage',
  'backend',
  'apps',
  'luxival-autopost',
  'luxival-dashboard',
  'supabase'
]);

const SECTION_RULES = [
  { match: /^\/tourism|^\/transfers|^\/booking/, section: 'Tourism & Transport' },
  { match: /^\/services|^\/digital|^\/qa|^\/audit/, section: 'Digital Services' },
  { match: /^\/portfolio|^\/platform|^\/vortex-ai-platform|^\/vault-ledger/, section: 'Portfolio' },
  { match: /^\/blog/, section: 'Blog' },
  { match: /^\/about|^\/contact|^\/privacy|^\/terms/, section: 'Company' }
];

function loadIgnoredPaths() {
  if (!fs.existsSync(ELEVENTY_IGNORE_PATH)) return [];
  return fs.readFileSync(ELEVENTY_IGNORE_PATH, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((pattern) => pattern.replace(/\\/g, '/'));
}

const IGNORE_PATTERNS = loadIgnoredPaths();

function isIgnored(filePath) {
  const rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  return IGNORE_PATTERNS.some((pattern) => {
    if (pattern.endsWith('/**')) {
      return rel.startsWith(pattern.slice(0, -3) + '/');
    }
    return rel === pattern || rel.startsWith(pattern.replace(/\/$/, '') + '/');
  });
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripTags(text) {
  return decodeEntities(text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function extractTagContent(html, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = html.match(regex);
  return match ? stripTags(match[1]) : '';
}

function extractMetaContent(html, nameOrProperty) {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${nameOrProperty}["'][^>]+content=(["'])([\\s\\S]*?)\\1[^>]*>`,
    'i'
  );
  const match = html.match(regex);
  return match ? decodeEntities(match[2].trim()) : '';
}

function extractHeadings(html) {
  const matches = html.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi) || [];
  return matches.map(stripTags).filter(Boolean).slice(0, 12);
}

function cleanHtmlForText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
}

function extractBodyText(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const source = bodyMatch ? bodyMatch[1] : html;
  const cleaned = cleanHtmlForText(source);
  const text = stripTags(cleaned);
  return text.slice(0, 1800);
}

function walk(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let files = [];

  entries.forEach((entry) => {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) return;
      files = files.concat(walk(fullPath));
      return;
    }

    if (!entry.isFile()) return;
    if (!entry.name.endsWith('.html')) return;
    if (isIgnored(fullPath)) return;
    files.push(fullPath);
  });

  return files;
}

function toCleanPath(filePath) {
  const rel = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) {
    return `/${rel.slice(0, -'index.html'.length)}`;
  }
  return `/${rel.replace(/\.html$/, '')}`;
}

function inferSection(routePath) {
  for (const rule of SECTION_RULES) {
    if (rule.match.test(routePath)) return rule.section;
  }
  return 'Website';
}

function deriveKeywords(routePath, title, headings, description, bodyText) {
  const pathTokens = routePath
    .split('/')
    .filter(Boolean)
    .map((part) => part.replace(/[-_]/g, ' '));

  const textTokens = `${title} ${description} ${headings.join(' ')}`
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2)
    .slice(0, 40);

  const domainTerms = [
    'luxival',
    'helsinki',
    'transfer',
    'tourism',
    'digital',
    'seo',
    'qa',
    'audit',
    'web design',
    'chauffeur',
    'booking',
    'portfolio'
  ].filter((term) => bodyText.toLowerCase().includes(term) || title.toLowerCase().includes(term));

  return Array.from(new Set(pathTokens.concat(textTokens).concat(domainTerms))).slice(0, 36);
}

function buildDocument(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const routePath = toCleanPath(filePath);
  const title = extractTagContent(raw, 'title') || routePath;
  const description =
    extractMetaContent(raw, 'description') ||
    extractMetaContent(raw, 'og:description') ||
    '';
  const headings = extractHeadings(raw);
  const bodyText = extractBodyText(raw);

  return {
    path: routePath,
    title,
    description,
    section: inferSection(routePath),
    headings,
    keywords: deriveKeywords(routePath, title, headings, description, bodyText),
    body: bodyText
  };
}

function main() {
  const htmlFiles = walk(ROOT_DIR);
  const documents = htmlFiles
    .map(buildDocument)
    .filter((doc) => !doc.path.startsWith('/_site'))
    .sort((a, b) => a.path.localeCompare(b.path));

  const payload = {
    generatedAt: new Date().toISOString(),
    total: documents.length,
    documents
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`Generated search index with ${documents.length} pages at ${OUTPUT_PATH}`);
}

main();
