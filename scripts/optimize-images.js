const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUTPUT_ROOT = path.join('assets', 'images', 'optimized');
const WIDTHS = [480, 768, 1024, 1440, 1920];

const images = [
  {
    key: 'oodi-library',
    src: path.join('assets', 'images', 'finland', 'architecture', 'oodi-library.jpg'),
  },
  {
    key: 'helsinki-cathedral',
    src: path.join('assets', 'images', 'finland', 'landmarks', 'helsinki-cathedral.jpg'),
  },
  {
    key: 'porvoo-old-town-riverside',
    src: path.join('assets', 'images', 'finland', 'landmarks', 'porvoo-old-town-riverside.jpg'),
  },
  {
    key: 'suomenlinna-fortress',
    src: path.join('assets', 'images', 'finland', 'landmarks', 'suomenlinna-fortress.jpg'),
  },
  {
    key: 'temppeliaukio-church',
    src: path.join('assets', 'images', 'finland', 'architecture', 'temppeliaukio-church.jpg'),
  },
  {
    key: 'koli-national-park',
    src: path.join('assets', 'images', 'finland', 'nature', 'koli-national-park.jpg'),
  },
  {
    key: 'lake-saimaa-frozen',
    src: path.join('assets', 'images', 'finland', 'climate', 'lake-saimaa-frozen.jpg'),
  },
  {
    key: 'northern-lights-lapland',
    src: path.join('assets', 'images', 'finland', 'climate', 'northern-lights-lapland.jpg'),
  },
  {
    key: 'turku-castle',
    src: path.join('assets', 'images', 'finland', 'landmarks', 'turku-castle.jpg'),
  },
  {
    key: 'founder-portrait-3',
    src: path.join('assets', 'images', 'founder-portrait-3.jpeg'),
  },
  {
    key: 'pattern-hero',
    src: path.join('assets', 'images', 'pattern-hero.jpeg'),
  },
];

async function optimizeImage({ key, src }) {
  if (!fs.existsSync(src)) {
    console.warn(`Skipping missing source: ${src}`);
    return;
  }

  const outputDir = path.join(OUTPUT_ROOT, key);
  fs.mkdirSync(outputDir, { recursive: true });

  const image = sharp(src, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const sourceWidth = metadata.width || Math.max(...WIDTHS);
  const targetWidths = WIDTHS.filter((width) => width <= sourceWidth);
  if (!targetWidths.includes(sourceWidth) && sourceWidth < Math.max(...WIDTHS)) {
    targetWidths.push(sourceWidth);
  }

  for (const width of targetWidths) {
    const base = sharp(src, { failOn: 'none' })
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await base
      .clone()
      .avif({ quality: 48, effort: 6 })
      .toFile(path.join(outputDir, `${key}-${width}.avif`));

    await base
      .clone()
      .webp({ quality: 72, effort: 5 })
      .toFile(path.join(outputDir, `${key}-${width}.webp`));
  }

  console.log(`Optimized ${key}: ${targetWidths.join(', ')}`);
}

(async () => {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  for (const item of images) {
    await optimizeImage(item);
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
