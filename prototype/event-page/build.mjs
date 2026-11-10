/*
 * PROTOTYPE build step. Reads the mirrored event pages, injects the variant
 * stylesheet and the switcher, and writes the copies BESIDE the originals in
 * the snapshot, so every relative asset URL on the page keeps resolving.
 *
 * Writes into html/ (gitignored on purpose — that tree is a snapshot, not
 * source). Re-run after `pnpm run sync events`.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HERE = import.meta.dirname;
const ROOT = path.resolve(HERE, '../..');
const SNAPSHOT = path.join(ROOT, 'html/www.bikeworcester.org.uk');

const PAGES = ['events/cycling-uk-advocacy-network.html', 'events/critical-and-kidical-x-mass-1.html'];

const css = fs.readFileSync(path.join(HERE, 'variants.css'), 'utf8');
const js = fs.readFileSync(path.join(HERE, 'switcher.js'), 'utf8');

const inject = [
  '<!-- PROTOTYPE: individual event page variants — throwaway, see prototype/event-page/README.md -->',
  '<style id="prototype-event-variants">',
  css,
  '</style>',
  '<script id="prototype-switcher">',
  js,
  '</script>',
  '',
].join('\n');

const lan = Object.values(os.networkInterfaces())
  .flat()
  .find((i) => i && i.family === 'IPv4' && !i.internal)?.address;

const urls = [];

for (const rel of PAGES) {
  const src = path.join(SNAPSHOT, rel);
  if (!fs.existsSync(src)) {
    console.warn(`! missing ${rel} — run \`pnpm run sync events\` first`);
    continue;
  }
  const html = fs.readFileSync(src, 'utf8');
  if (!html.includes('</head>')) {
    console.warn(`! ${rel} has no </head> — skipped`);
    continue;
  }
  const out = src.replace(/\.html$/, '-prototype.html');
  fs.writeFileSync(out, html.replace('</head>', `${inject}</head>`));
  urls.push(rel.replace(/\.html$/, '-prototype.html'));
}

if (!urls.length) {
  console.error('Nothing built. Is the mirror synced?');
  process.exit(1);
}

console.log('\nPROTOTYPE — individual event page variants (?variant=A|B|C|D|E)\n');
for (const u of urls) {
  console.log(`  http://localhost:4747/${u}`);
  if (lan) console.log(`  http://${lan}:4747/${u}`);
}
console.log('\n  A is today, for reference. B Poster, C Dossier, D Timeline, E Hero band.\n');
